import type { EventLog } from 'ethers'

// Type aliases for readabiltiy
type EVMBlockNumber = number
type EVMTransactionIndex = number

type SortedLogs = Record<
  EVMBlockNumber,
  Record<EVMTransactionIndex, EventLog[]>>

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
      sorted[Number(block)]![Number(evmTransaction)]!.sort(
        (a, b) => a.index - b.index
      )
    }
  }

  return sorted
}

/**
 * Parses logs in EVM transaction for TXID data
 * @param logs - logs for evm transaction
 */
function interpretEVMTransaction (logs: EventLog[]) {

}

export {
  groupEvents,
  interpretEVMTransaction
}

export type {
  SortedLogs
}
