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
 * Convert bigint to hex
 * @param input - bigint input
 * @param length - byte length
 * @returns hex string
 */
function bigintToHexString (input: bigint, length: number) {
  return `0x${input.toString(16).padStart(length * 2, '0')}`
}

export {
  padArrayToLength,
  bigintToHexString
}
