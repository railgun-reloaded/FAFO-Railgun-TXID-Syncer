import { JsonRpcProvider } from 'ethers'

import { ETHEREUM_PROVIDER, ETHEREUM_RAILGUN_DEPLOYMENT_PROXY } from '../constants'

import { getExport } from '.'

// Create provider and contract interfaces
const provider = new JsonRpcProvider(ETHEREUM_PROVIDER)

getExport(provider, ETHEREUM_RAILGUN_DEPLOYMENT_PROXY)
