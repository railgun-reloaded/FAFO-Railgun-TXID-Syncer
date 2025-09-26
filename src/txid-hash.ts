import { poseidon13, poseidon3 } from 'poseidon-lite'

const MERKLE_ZERO_VALUE =
  BigInt('0x0488f89b25bc7011eaf6a5edce71aeafb9fe706faa3c0a5cd9cbe868ae3b9ffc')

/**
 * Pads array to specified length
 * @param initialArray - inital values of array
 * @param length - length to pad to
 * @param fillValue - value to pad with
 * @returns padded array
 */
function padArrayToLength<ArrayValueType> (
  initialArray: ArrayValueType[],
  length: number,
  fillValue: ArrayValueType
): ArrayValueType[] {
  // Concatonate initial array with array of length needed to pad and return
  return initialArray.concat(
    Array(length - initialArray.length).fill(fillValue)
  )
}

/**
 * Calculate TXID hash
 * @param nullifiers - nullifiers of transaction
 * @param commitments - commitments of transaction
 * @param boundParamsHash - hash of bound params of transaction
 * @returns txid hash
 */
function txidHash (
  nullifiers: bigint[],
  commitments: bigint[],
  boundParamsHash: bigint
): bigint {
  // Size of nullifier/commitment hash max
  const TXID_PAD_SIZE = 13

  // Calculate nullifier and commitment hashes padded to max length
  const nullifiersHash = poseidon13(
    padArrayToLength(nullifiers, TXID_PAD_SIZE, MERKLE_ZERO_VALUE)
  )
  const commitmentsHash = poseidon13(
    padArrayToLength(commitments, TXID_PAD_SIZE, MERKLE_ZERO_VALUE)
  )

  return poseidon3([nullifiersHash, commitmentsHash, boundParamsHash])
}

export { txidHash }
