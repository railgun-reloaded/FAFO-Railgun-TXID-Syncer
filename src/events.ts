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
  // Don't pass filters here since some RPCs will error with 'too many topics'
  const logs = await provider.getLogs({
    fromBlock,
    toBlock,
    address: contract.getAddress(),
  })

  // Filter logs ourselves to remove any we aren't interested in
  const logsFiltered = logs.filter((log) => topics.includes(log.topics[0] || ''))

  // Parse all logs
  const events = logsFiltered.map((log) => contract.interface.parseLog(log))

  // Return parsed events
  return events
}

export {
  fetchEvents
}
