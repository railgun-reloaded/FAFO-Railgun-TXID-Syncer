import { poseidon13, poseidon3 } from 'poseidon-lite'

import { bigintToHexString, padArrayToLength } from './converter'

const MERKLE_ZERO_VALUE = '0x0488f89b25bc7011eaf6a5edce71aeafb9fe706faa3c0a5cd9cbe868ae3b9ffc'

/**
 * Calculate TXID hash
 * @param nullifiers - nullifiers of transaction
 * @param commitments - commitments of transaction
 * @param boundParamsHash - hash of bound params of transaction
 * @returns txid hash
 */
function txidHash (
  nullifiers: string[],
  commitments: string[],
  boundParamsHash: string
): string {
  // Size of nullifier/commitment hash max
  const TXID_PAD_SIZE = 13

  // Calculate nullifier and commitment hashes padded to max length and convert to bigint
  const nullifiersHash = poseidon13(
    padArrayToLength(nullifiers, TXID_PAD_SIZE, MERKLE_ZERO_VALUE).map(BigInt)
  )
  const commitmentsHash = poseidon13(
    padArrayToLength(commitments, TXID_PAD_SIZE, MERKLE_ZERO_VALUE).map(BigInt)
  )

  // Convert to hex and return
  return bigintToHexString(poseidon3([nullifiersHash, commitmentsHash, boundParamsHash]), 32)
}

export { txidHash }
