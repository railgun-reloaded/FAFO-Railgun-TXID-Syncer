import type { EventLog } from 'ethers'

// Type aliases for readabiltiy
type EVMBlockNumber = string
type EVMTransactionHash = string
type RailgunTXID = string

type SortedLogs = Record<
  EVMBlockNumber,
  Record<EVMTransactionHash, EventLog[]>>

type InterpretedEVMTransaction = Record<RailgunTXID, {
  nullifiers: string[],
  commitments: string[],
  boundParamsHash: string,
}>

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
      !sorted[log.blockNumber]![log.transactionIndex]
    ) sorted[log.blockNumber]![log.transactionIndex] = []

    // Push log to bucket
    if (
      !sorted[log.blockNumber]![log.transactionIndex]![log.index]
    ) sorted[log.blockNumber]![log.transactionIndex]!.push(log)
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
  // console.log(logs)

  return {}
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
