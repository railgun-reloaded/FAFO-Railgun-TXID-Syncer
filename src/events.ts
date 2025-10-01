import type { BaseContract, EventFragment, Provider } from 'ethers'
import { EventLog } from 'ethers'

/**
 * Fetches all events for a contract between blocks
 * @param provider - ethers provider
 * @param contract - ethers contract to scan events for
 * @param fromBlock - first block to check events for
 * @param toBlock - last block to check events for
 * @returns event logs
 */
async function fetchEvents (provider: Provider, contract: BaseContract, fromBlock: number, toBlock: number) {
  // List of event names we're interested in
  const eventNames = [
    'Nullified',
    'Transact',
    'Unshield',
    'Action'
  ]

  // Filter interface fragments for events we're interested in only
  const topics = (contract.interface.fragments.filter(
    (fragment) => fragment.type === 'event'
  ) as EventFragment[]).filter(
    (eventFragment) => eventNames.includes(eventFragment.name)
  ).map(
    (fragment) => fragment.topicHash
  )

  // Query provider for all logs in block range
  // Don't pass filters here since some RPCs will error with 'too many topics'
  const logs = await provider.getLogs({
    fromBlock,
    toBlock,
    address: contract.getAddress(),
  })

  // Filter logs ourselves to remove any we aren't interested in / have an empty topic string
  const logsFiltered = logs.filter((log) => topics.includes(log.topics[0] || ''))

  // Parse all logs
  const events: EventLog[] = logsFiltered.map(
    (log) => new EventLog(
      log,
      contract.interface,
      // Already filtered so the topic string will be set to a known event hash):
      contract.interface.getEvent(log.topics[0] as string) as EventFragment
    )
  )

  // Return parsed events
  return events
}

export {
  fetchEvents
}
