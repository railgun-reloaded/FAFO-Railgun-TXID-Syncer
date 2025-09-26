import 'dotenv/config'
import { test } from 'brittle'
import { Contract, JsonRpcProvider } from 'ethers'

import ABILive from '../src/abi_live.json'
import { fetchEvents } from '../src/events'

import { ETHEREUM_PROVIDER, ETHEREUM_RAILGUN_DEPLOYMENT_PROXY } from './constants'

// Test using a known block range
const fromBlock = 23430000
const toBlock = 23440000

test('Should get events in block range', async (assert) => {
  // Create provider and contract interfaces
  const provider = new JsonRpcProvider(ETHEREUM_PROVIDER)
  const contract = new Contract(ETHEREUM_RAILGUN_DEPLOYMENT_PROXY, ABILive, provider)

  // Fetch events
  const events = await fetchEvents(provider, contract, fromBlock, toBlock)

  // Make sure
  assert.is(
    events.length,
    711, // Precalculated known count
    'All events should be returned'
  )
})
