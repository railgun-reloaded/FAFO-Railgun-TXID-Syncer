import 'dotenv/config'
import { test } from 'brittle'
import { Contract, EventLog, JsonRpcProvider, Log } from 'ethers'

import ABILive from '../src/abi_live.json'
import type { InterpretedEvents } from '../src/assembler'
import { groupEvents, interpretEventSeries } from '../src/assembler'
import { fetchEvents } from '../src/events'

import { ETHEREUM_PROVIDER, ETHEREUM_RAILGUN_DEPLOYMENT_PROXY } from './constants'
import { getExport } from './exports/index'

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

test('Should fetch group and parse logs into txids', async (assert) => {
  // Create provider and contract interfaces
  const provider = new JsonRpcProvider(ETHEREUM_PROVIDER)
  const contract = new Contract(ETHEREUM_RAILGUN_DEPLOYMENT_PROXY, ABILive, provider)

  // Get subsquid export
  const { subsquidExport, syntheticEvents } = await getExport(provider, await contract.getAddress())

  // Fetch chain events
  const chainEvents = await fetchEvents(provider, contract, fromBlock, toBlock)

  // Merge chain and synthetic events
  const events = [...chainEvents, ...syntheticEvents]

  // Group events
  const groupedEvents = groupEvents(events)

  // Make sure the right number of blocks have events
  assert.is(
    Object.keys(groupedEvents).length,
    Object.keys(subsquidExport).length, // 206
    'Should match the block count in subsquid export'
  )

  // Interpret events
  const interpretedEvents = interpretEventSeries(groupedEvents)

  assert.alike(interpretedEvents, subsquidExport, 'Should parse actions and RailgunTXIDs identically to subsquid export')
})

test('Should parse logs into TXIDs for synthetic super transaction', async (assert) => {
  // Create provider and contract interfaces
  const provider = new JsonRpcProvider(ETHEREUM_PROVIDER)
  const contract = new Contract(ETHEREUM_RAILGUN_DEPLOYMENT_PROXY, ABILive, provider)

  // Get subsquid export
  const { subsquidExport, syntheticEvents } = await getExport(provider, await contract.getAddress())

  // Squash subsquid export into a single synthetic transaction
  const allActions = Object
    .values(subsquidExport)
    .map(Object.values)
    .flat()

  const syntheticMegaTXExport: InterpretedEvents = {
    0: {
      '0xfakeevmtransaction': allActions
    }
  }

  // Fetch chain events
  const chainEvents = await fetchEvents(provider, contract, fromBlock, toBlock)

  // Merge chain and synthetic events, map into single mega evm transactions
  const events = [...chainEvents, ...syntheticEvents].map((event) => {
    return new EventLog(
      new Log(
        {
          transactionHash: '0xfakeevmtransaction',
          blockHash: '0xfakeblockhash',
          blockNumber: 0,
          removed: event.removed,
          address: event.address,
          data: event.data,
          topics: event.topics,
          index: event.blockNumber << 16 + event.transactionIndex << 16 + event.index,
          transactionIndex: 0
        },
        event.provider
      ),
      event.interface,
      event.fragment
    )
  })

  // Group events
  const groupedEvents = groupEvents(events)

  // Interpret events
  const interpretedEvents = interpretEventSeries(groupedEvents)

  assert.alike(interpretedEvents, syntheticMegaTXExport, 'Should parse actions and RailgunTXIDs identically to subsquid mega tx')
})
