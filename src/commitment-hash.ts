import { keccak256 } from 'ethers'
import { poseidon3 } from 'poseidon-lite'

import { SNARK_SCALAR_FIELD } from './constants'
import { bigintToHexString } from './converter'

enum TokenType {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
}

type TokenData = {
  type: TokenType,
  address: string,
  subID: bigint
}

/**
 * Gets token ID from token data
 * @param token - token data
 * @returns token ID
 */
function getTokenID (token: TokenData) {
  // ERC20 tokenID is just the address
  if (token.type === TokenType.ERC20) return token.address

  // This is a bad way to do it, but lets this function remain faily self-contianed
  // and explainable for FAFO reasons. Do not use this method in prod

  // Else calculate preimage and hash
  const preimage = [
    '0x', // Leading 0x
    bigintToHexString(BigInt(token.type), 32).slice(2), // type enum as hex string with leading 0x sliced out
    token.address.slice(2).padStart(64, '0'), // address with leading 0x stripped and padded to 64 chars (32 bytes)
    bigintToHexString(token.subID, 32).slice(2) // sub ID as 32 byte hex string with leading 0x sliced out
  ].join('') // joined into single hex string with empty delimiter

  // Keccak hash, constrain to snart scalar field, return as hex string
  return bigintToHexString(
    BigInt(
      keccak256(preimage)
    ) % SNARK_SCALAR_FIELD,
    32
  )
}

/**
 * Calculate commitment hash
 * @param npk - note public key
 * @param token - token data
 * @param value - commitment value
 * @returns commitment hash
 */
function commitmentHash (
  npk: string,
  token: TokenData,
  value: bigint
): string {
  // Hash and return as hex string
  return bigintToHexString(
    poseidon3([
      BigInt(npk),
      BigInt(
        getTokenID(token)
      ),
      value
    ]),
    32
  )
}

export { TokenType, getTokenID, commitmentHash }
export type { TokenData }
