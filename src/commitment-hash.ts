import { poseidon13, poseidon3 } from 'poseidon-lite'

import { bigintToHexString, padArrayToLength } from './converter'

/**
 * Calculate TXID hash
 * @param nullifiers - nullifiers of transaction
 * @param commitments - commitments of transaction
 * @param boundParamsHash - hash of bound params of transaction
 * @returns txid hash
 */
function commitmentsHash (
  stuff
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

export { commitmentsHash }
