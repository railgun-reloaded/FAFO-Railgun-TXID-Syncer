import 'dotenv'
import { Contract, JsonRpcProvider } from 'ethers'

import ABILive from './abi_live.json'
import { fetchEvents } from './events'

/**
 * Run FAFO test
 */
async function fafo () {
  // Ensure env variables are set
  if (!process.env['PROVIDER']) throw new Error('PROVIDER not set')
  if (!process.env['PROXY_ADDRESS']) throw new Error('PROXY_ADDRESS not set')

  // Create provider and contract interfaces
  const provider = new JsonRpcProvider(process.env['PROVIDER'])
  const contract = new Contract(process.env['PROXY_ADDRESS'], ABILive, provider)
}

fafo()
