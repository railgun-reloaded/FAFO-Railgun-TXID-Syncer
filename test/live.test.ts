import 'dotenv/config'
import { test } from 'brittle'
import { Contract, JsonRpcProvider } from 'ethers'

import ABILive from '../src/abi_live.json'
import { groupEvents } from '../src/assembler'
import { fetchEvents } from '../src/events'

import { ETHEREUM_PROVIDER, ETHEREUM_RAILGUN_DEPLOYMENT_PROXY } from './constants'
// Exported data from subsquid blocks blocks 23430000 to 23440000
import subsquidEthExport from './exports/ethereum.json'

// Test using a known block range
const fromBlock = 23430000
const toBlock = 23440000

test('Should get events in block range', async (assert) => {
  // Create provider and contract interfaces
  const provider = new JsonRpcProvider(ETHEREUM_PROVIDER)
  const contract = new Contract(ETHEREUM_RAILGUN_DEPLOYMENT_PROXY, ABILive, provider)

  // Fetch events
  const events = await fetchEvents(provider, contract, fromBlock, toBlock)

  // Make sure the right number of events get returned
  assert.is(
    events.length,
    594, // Precalculated known count
    'All events should be returned'
  )
})

test('Should fetch group and parse logs', async (assert) => {
  // Create provider and contract interfaces
  const provider = new JsonRpcProvider(ETHEREUM_PROVIDER)
  const contract = new Contract(ETHEREUM_RAILGUN_DEPLOYMENT_PROXY, ABILive, provider)

  // Fetch events
  const events = await fetchEvents(provider, contract, fromBlock, toBlock)

  // Group events
  const groupedEvents = groupEvents(events)

  // Make sure the right number of blocks have events
  assert.is(
    Object.keys(groupedEvents).length,
    Object.keys(subsquidEthExport).length, // 206
    'Should match the block count in subsquid export'
  )
})
