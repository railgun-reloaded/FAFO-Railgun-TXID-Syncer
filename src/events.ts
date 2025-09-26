import type { BaseContract, EventFragment, Provider, } from 'ethers'

/**
 * Fetches all events for a contract between blocks
 * @param provider - ethers provider
 * @param contract - ethers contract to scan events for
 * @param fromBlock - first block to check events for
 * @param toBlock - last block to check events for
 * @returns event logs
 */
async function fetchEvents (provider: Provider, contract: BaseContract, fromBlock: number, toBlock: number) {
  // Filter interface fragments for events only, and fetch topic hash
  const topics = (contract.interface.fragments.filter(
    (fragment) => fragment.type === 'event'
  ) as EventFragment[]).map(
    (fragment) => fragment.topicHash
  )

  // Query provider for all logs in block range
  // Filter by topics since target is a proxy, and we don't want proxy events in our logs
  const logs = await provider.getLogs({
    fromBlock,
    toBlock,
    address: contract.getAddress(),
    topics
  })

  // Parse all logs
  const events = logs.map((log) => contract.interface.parseLog(log))

  return events
}

export {
  fetchEvents
}
