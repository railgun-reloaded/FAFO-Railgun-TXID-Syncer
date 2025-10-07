import type { Provider } from 'ethers'
import { EventLog, Interface, Log } from 'ethers'

import abiDev from '../../src/abi_dev.json'
import type { InterpretedEvents } from '../../src/assembler'
import { bigintToHexString } from '../../src/converter'
import { txidHash } from '../../src/txid-hash'

import chainDataUntyped from './chainData.json' // Exported chain data to avoid needing to request from RPC every run
import subsquidExportUntyped from './ethereum.json' // Exported data from subsquid blocks blocks 23430000 to 23440000

type ChainData = {
  blocks: Record<string, string> // Blockumber to block hash
  transactions: Record<string, number> // Transaction hash to transaction index
}

const chainData: ChainData = chainDataUntyped

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
        actionSyntheticIndex: number
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

/**
 * Get exported subsquid data and synthetic events
 * @param provider - ethers provider
 * @param contractAddress - contract address
 * @returns exported data
 */
async function getExport (provider: Provider, contractAddress: string) {
  // Create new interface object for encoding synthetic events
  const contractInterface = new Interface(abiDev)

  // Type JSON
  const subsquidExportTyped: SubsquidExport = subsquidExportUntyped

  // Create formatted object
  const subsquidExport: InterpretedEvents = {}

  // Create synthetic transaction events from subsquid data
  const syntheticEvents: EventLog[] = []

  // Loop through each block
  for (const blockNumber of Object.keys(subsquidExportTyped)) {
  // Create empty block entry
    subsquidExport[blockNumber] = {}

    // Loop through evm transactions
    for (const evmTransactionHash of Object.keys(subsquidExportTyped[blockNumber]!.evmTransactions)) {
      // Create empty evm transaction entry, with single action 0 (assume we don't have any multi-action evm transactions in the block range)
      subsquidExport[blockNumber]![evmTransactionHash] = []
      subsquidExport[blockNumber][evmTransactionHash][0] = {}

      // Create action array
      const action = []

      // Loop through each Railgun transaction
      for (
        const railgunTransaction of subsquidExportTyped[blockNumber]!.evmTransactions[evmTransactionHash]!.railgunTXIDs
      ) {
        // Hash txid
        const railgunTXID = txidHash(
          railgunTransaction.nullifiers.map((nullifier) => numberStringToHexString(nullifier, 32)),
          railgunTransaction.commitments.map((commitment) => numberStringToHexString(commitment, 32)),
          numberStringToHexString(railgunTransaction.boundParamsHash, 32)
        )

        // Set railgun transaction record on interpreted events
        subsquidExport[blockNumber]![evmTransactionHash]![0][railgunTXID] = {
          nullifiers: railgunTransaction.nullifiers.map((nullifier) => numberStringToHexString(nullifier, 32)),
          commitments: railgunTransaction.commitments.map((commitment) => numberStringToHexString(commitment, 32)),
          boundParamsHash: numberStringToHexString(railgunTransaction.boundParamsHash, 32)
        }

        // Push to actions array
        action.push({
          nullifiersCount: railgunTransaction.nullifiers.length,
          commitmentsCount: railgunTransaction.commitments.length,
          hasUnshield: railgunTransaction.hasUnshield,
          boundParamsHash: numberStringToHexString(railgunTransaction.boundParamsHash, 32)
        })
      }

      // Encode event data
      const encodedEvent = contractInterface.encodeEventLog(
        'Action',
        [action]
      )

      // Construct synthetic log data
      const log = new Log(
        {
          transactionHash: evmTransactionHash,
          blockHash: chainData.blocks[blockNumber]!,
          blockNumber: Number(subsquidExportTyped[blockNumber]!.blockNumber),
          removed: false,
          address: contractAddress,
          data: encodedEvent.data,
          topics: encodedEvent.topics,
          index: subsquidExportTyped[blockNumber]!.evmTransactions[evmTransactionHash]!.actionSyntheticIndex,
          transactionIndex: chainData.transactions[evmTransactionHash]!
        },
        provider
      )

      // Construct synthetic EventLog object
      const event = new EventLog(
        log,
        contractInterface,
        contractInterface.getEvent('Action')!
      )

      // Push to synthetic events
      syntheticEvents.push(event)
    }
  }

  return {
    subsquidExport,
    syntheticEvents
  }
}

export {
  getExport
}
