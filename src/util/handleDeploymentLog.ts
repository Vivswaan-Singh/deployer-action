import { program } from 'commander'
import fs from 'fs'
import { JsonRpcProvider } from '@ethersproject/providers'
import fetch from 'node-fetch'

export async function updateContractsFile(rpcUrl: string, newState: any) {
  const network = await getNetworkName(rpcUrl)

  let contractsJson: Record<string, any> = {}

  // Read the current contracts JSON if it exists
  if (fs.existsSync(program.state)) {
    contractsJson = JSON.parse(fs.readFileSync(program.state, { encoding: 'utf8' }))
  }

  if (!contractsJson.chains) {
    contractsJson.chains = {}
  }

  // Create the network entry if it doesn't exist
  if (!contractsJson.chains[network.name]) {
    contractsJson.chains[network.name] = {
      chainId: network.chainId,
      contracts: {},
    }
  }

  contractsJson.chains[network.name].contracts = newState
  // Save the updated contracts back to file
  try {
    fs.writeFileSync(program.state, JSON.stringify(contractsJson, null, 2))
  } catch (error) {
    console.error('Error writing to file:', error)
  }
}

export async function getNetworkName(rpcUrl: string) {
  const provider = new JsonRpcProvider(rpcUrl)
  const network = await provider.getNetwork()

  if (network.name === 'unknown') {
    const networkName = await fetchNetworkFromChainId(network.chainId)
    if (networkName) {
      network.name = networkName
    }
  }

  return network
}

async function fetchNetworkFromChainId(chainId: number): Promise<string | null> {
  try {
    const response = await fetch('https://chainid.network/chains.json')
    if (!response.ok) {
      throw new Error(`Failed to fetch chains data: ${response.status}`)
    }

    const chains: any[] = (await response.json()) as any[]
    const chain = chains.find((c) => c.chainId === chainId)

    if (chain) {
      return chain.name.toLowerCase().replace(/\s+/g, '-')
    }

    return null
  } catch (error) {
    console.warn('Failed to fetch network info from chainid.network:', error)
    return null
  }
}
