import type { Addressable, ContractRunner } from 'ethers'
import { BaseContract } from 'ethers'

import ABI from './abi.json'
import type { RailgunSmartWallet as RailgunSmartWalletType } from './generated-types/railgunsmartwallet'

type TypedContractConstructor<TypedContractClass extends BaseContract> = typeof BaseContract & {
  // Constructor
  new (target: string | Addressable, runner?: null | ContractRunner): TypedContractClass;

  // Get events
  fetchEvents(startBlock: number, endBlock: number): unknown
}

/**
 * Typed Contract for RailgunSmartWallet
 */
class RailgunSmartWalletBase extends BaseContract {
  /**
   * Create RailgunSmartWallet ethers contract class
   * @param target - contract address
   * @param runner - ethers runner (provider, signer, etc.)
   */
  constructor (target: string | Addressable, runner?: null | ContractRunner) {
    super(target, ABI, runner)
  }
}

const RailgunSmartWallet = RailgunSmartWalletBase as TypedContractConstructor<RailgunSmartWalletType>

export {
  RailgunSmartWallet
}
