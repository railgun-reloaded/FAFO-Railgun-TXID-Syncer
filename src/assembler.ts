import type { EventLog } from 'ethers'

import { commitmentHash } from './commitment-hash'
import { txidHash } from './txid-hash'

// Type aliases for readabiltiy
type EVMBlockNumber = string
type EVMTransactionHash = string
type RailgunTXID = string

type SortedLogs = Record<
  EVMBlockNumber,
  Record<EVMTransactionHash, EventLog[]>>

type InterpretedAction = Record<RailgunTXID, {
  nullifiers: string[],
  commitments: string[],
  boundParamsHash: string,
}>

type InterpretedEVMTransaction = InterpretedAction[] // Action number is index

type InterpretedEvents = Record<
  EVMBlockNumber,
  Record<
    EVMTransactionHash,
    InterpretedEVMTransaction
  >
>

/**
 * Sorts array of logs by block and evm transaction
 * @param logs - logs to group
 * @returns sorted logs
 */
function groupEvents (logs: EventLog[]) {
  // Create sorted event structure
  const sorted: SortedLogs = {}

  // Sort logs into evm block number and evm transaction buckets
  logs.forEach((log) => {
    // Create sorted evm block number entry if not exist
    if (!sorted[log.blockNumber]) sorted[log.blockNumber] = {}

    // Create sorted evm transaction index entry if not exist
    if (
      !sorted[log.blockNumber]![log.transactionHash]
    ) sorted[log.blockNumber]![log.transactionHash] = []

    // Push log to bucket
    if (
      !sorted[log.blockNumber]![log.transactionHash]![log.index]
    ) sorted[log.blockNumber]![log.transactionHash]!.push(log)
  })

  // Loop through every bucket
  for (const block in sorted) {
    for (const evmTransaction in sorted[block]) {
      // Sort logs in bucket
      sorted[block]![evmTransaction]!.sort(
        (a, b) => a.index - b.index
      )
    }
  }

  return sorted
}

/**
 * Parses logs in EVM transaction for TXID data
 * @param logs - logs for evm transaction
 * @returns interpreted evm transaction
 */
function interpretEVMTransaction (logs: EventLog[]): InterpretedEVMTransaction {
  // Clone logs to events array to avoid mutations
  const events = [...logs]

  // Keep track of the decoder state for every transaction that hasn't been fully decoded
  let sequence = 0
  const decoders: {
    sequence: number // Keep track of order we encounter action event in, this will be the inverse of the final order
    nullifiersPending: number // Number of nullifiers yet to be parsed
    nullifierEvents: EventLog[]
    unshieldEvents: EventLog[]
    transactEvent?: EventLog
    actionEvent: EventLog
  }[] = []

  // Order decoded actions
  const decoded: {
    sequence: number // Keep track of order we encounter action event in, this will be the inverse of the final order
    nullifiersPending: number // Number of nullifiers yet to be parsed
    nullifierEvents: EventLog[]
    unshieldEvents: EventLog[]
    transactEvent?: EventLog
    actionEvent: EventLog
  }[] = []

  while (events.length > 0) {
    const nextEvent = events.pop()!

    if (nextEvent.eventName === 'Nullified') {
      // If we hit a nullifier, it should be added to the current decoder

      // If no decoder, throw
      if (decoders.length === 0) throw new Error('Found nullifier event with no corresponding action')

      // Unshift event to decoder nullifiers (unshift instead of push since we're processing in reverse order)
      decoders[decoders.length - 1]!.nullifierEvents.unshift(nextEvent)

      // Decrement nullifiers pending on decoder
      decoders[decoders.length - 1]!.nullifiersPending -= 1

      // If no more nullifiers need to be fetched, this decoder is complete
      if (decoders[decoders.length - 1]!.nullifiersPending === 0) decoded.push(decoders.pop()!)
    } else if (nextEvent.eventName === 'Action') {
      // Push new decoder from action event
      decoders.push({
        sequence,
        nullifiersPending: nextEvent.args[0].length,
        nullifierEvents: [],
        unshieldEvents: [],
        actionEvent: nextEvent
      })

      // Increment sequence
      sequence += 1
    } else if (nextEvent.eventName === 'Transact') {
      // Set transact event on decoder
      decoders[decoders.length - 1]!.transactEvent = nextEvent
    } else if (nextEvent.eventName === 'Unshield') {
      // Unshift event to decoder unshields (unshift instead of push since we're processing in reverse order)
      decoders[decoders.length - 1]!.unshieldEvents.unshift(nextEvent)
    } else {
      // We FA too much, now FO
      throw new Error('How did we get here?')
    }
  }

  // If we still have incomplete decoders after consuming all events, throw
  if (decoders.length !== 0) throw new Error('Not all transactions were decoded')

  // Sort by reverse sequence number (since we parsed backwards) and map to interpreted events
  return decoded
    .sort((a, b) => b.sequence - a.sequence)
    .map((decodedAction) => {
      // Clone to avoid mutations
      const actionCommitments: string[] = [
        ...(decodedAction.transactEvent?.args[2] || []), // Pull commitment hashes out of transact events if present
        ...decodedAction.unshieldEvents.map((event) => commitmentHash(
          event.args[0],
          {
            type: Number(event.args[1][0]),
            address: event.args[1][1],
            subID: event.args[1][2],
          },
          event.args[2] + event.args[3])
        ) // Hash commitments from unshield events if present
      ]

      const railgunTXIDs: InterpretedAction = {}

      decodedAction.actionEvent.args[0].forEach((railgunTransaction: [bigint, bigint, string], i: number) => {
        // Railgun transaction: [nullifiers, commitments, boundParamsHash]
        const nullifiers: string[] = decodedAction.nullifierEvents[i]!.args[1] // Get from matching nullifier event
        const commitments: string[] = actionCommitments.splice(0, Number(railgunTransaction[1]) + 1) // Splice out of start of commitments array
        const boundParamsHash: string = railgunTransaction[2] // Get from event value

        const railgunTXID = txidHash(nullifiers, commitments, boundParamsHash)

        railgunTXIDs[railgunTXID] = {
          nullifiers,
          commitments,
          boundParamsHash
        }
      })

      return railgunTXIDs
    })
}

/**
 * Interpret grouped event series
 * @param groupedEvents - grouped events
 * @returns interpreted events
 */
function interpretEventSeries (groupedEvents: SortedLogs): InterpretedEvents {
  // Interpret event structure
  const interpretedEvents: InterpretedEvents = {}

  // Loop through each block
  Object.keys(groupedEvents).forEach((block) => {
    // Create entry for block in interpretedEvents
    interpretedEvents[block] = {}

    // Loop through each evm transaction in block
    Object.keys(groupedEvents[block]!).forEach((evmTransaction) => {
      // Call interpret EVM transaction on each transaction
      interpretedEvents[block]![evmTransaction] = interpretEVMTransaction(
        groupedEvents[block]![evmTransaction]!
      )
    })
  })

  return interpretedEvents
}

export {
  groupEvents,
  interpretEVMTransaction,
  interpretEventSeries
}

export type {
  SortedLogs,
  InterpretedEvents
}
