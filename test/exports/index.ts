import type { InterpretedEvents } from '../../src/assembler'
import { bigintToHexString } from '../../src/converter'
import { txidHash } from '../../src/txid-hash'

// Exported data from subsquid blocks blocks 23430000 to 23440000
import subsquidExportUntyped from './ethereum.json'

// Type aliases for readabiltiy
type EVMBlockNumber = string
type EVMTransactionHash = string

type SubsquidExport = Record<
  EVMBlockNumber,
  {
    blockNumber: string,
    blockTimestamp: string,
    evmTransactions: Record<
      EVMTransactionHash,
      {
        id: string
        transactionHash: string
        railgunTXIDs: {
          nullifiers: string[]
          commitments: string[]
          boundParamsHash: string
          hasUnshield: boolean
          merkleRoot: string
          unshieldToAddress: string
          unshieldToken: {
            tokenAddress: string
            tokenSubID: string
            tokenType: string
          }
          unshieldValue: string
          utxoBatchStartPositionOut: string
          utxoTreeIn: string
          utxoTreeOut: string
          verificationHash: string
        }[]
      }
    >
  }
>

/**
 * Convert number string to hex
 * @param input - number string input
 * @param length - byte length
 * @returns hex string
 */
function numberStringToHexString (input: string, length: number) {
  return bigintToHexString(BigInt(input), length)
}

// Type JSON
const subsquidExportTyped: SubsquidExport = subsquidExportUntyped

// Create formatted object
const subsquidExport: InterpretedEvents = {}

// Loop through each block
Object.keys(subsquidExportTyped).forEach((block) => {
  // Create empty block entry
  subsquidExport[block] = {}

  // Loop through evm transactions
  Object.keys(subsquidExportTyped[block]!.evmTransactions).forEach((evmTransaction) => {
    // Create empty evm transaction entry
    subsquidExport[block]![evmTransaction] = {}

    // Loop through each Railgun transaction
    subsquidExportTyped[block]!.evmTransactions[evmTransaction]!.railgunTXIDs.forEach((railgunTransaction) => {
      const railgunTXID = txidHash(
        railgunTransaction.nullifiers.map((nullifier) => numberStringToHexString(nullifier, 32)),
        railgunTransaction.commitments.map((commitment) => numberStringToHexString(commitment, 32)),
        numberStringToHexString(railgunTransaction.boundParamsHash, 32)
      )

      // Set railgun transaction record on interpreted events
      subsquidExport[block]![evmTransaction]![railgunTXID] = {
        nullifiers: railgunTransaction.nullifiers.map((nullifier) => numberStringToHexString(nullifier, 32)),
        commitments: railgunTransaction.commitments.map((commitment) => numberStringToHexString(commitment, 32)),
        boundParamsHash: numberStringToHexString(railgunTransaction.boundParamsHash, 32)
      }
    })
  })
})

export {
  subsquidExport
}
