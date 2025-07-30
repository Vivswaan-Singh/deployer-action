import { program } from 'commander'
import fs from 'fs'
import { JsonRpcProvider } from '@ethersproject/providers'
import fetch from 'node-fetch'

export async function updateContractsFile(newState: any) {
  const network = await getNetworkInfo(program.jsonRpc)
  const networkName = network.name.toLowerCase().replace(/\s+/g, '-')
  const chainName = network.chain.toLowerCase().replace(/\s+/g, '-')

  let contractsJson: Record<string, any> = {}

  const filePath = `./config/${program.env}.json`

  // Read the current contracts JSON if it exists
  if (fs.existsSync(filePath)) {
    contractsJson = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
  }

  // Create the network entry if it doesn't exist
  if (!contractsJson[networkName]) {
    contractsJson[networkName] = {
      name: networkName,
      chain: chainName,
      chainId: network.chainId,
      rpc: network.rpc,
      tokenSymbol: network.nativeCurrency.symbol,
      explorers: network.explorers[0],
      contracts: {},
    }
  }

  contractsJson[networkName].contracts = newState
  // Save the updated contracts back to file
  try {
    fs.writeFileSync(filePath, JSON.stringify(contractsJson, null, 2))
  } catch (error) {
    console.error('Error writing to file:', error)
  }
}

export async function getNetworkInfo(rpcUrl: string) {
  const provider = new JsonRpcProvider(rpcUrl)
  const network = await provider.getNetwork()

  const networkInfo = await fetchNetworkFromChainId(network.chainId)
  if (networkInfo) {
    return networkInfo 
  }

  return null
}

async function fetchNetworkFromChainId(chainId: number): Promise<any | null> {
  try {
    const response = await fetch('https://chainid.network/chains.json')
    if (!response.ok) {
      throw new Error(`Failed to fetch chains data: ${response.status}`)
    }

    const chains: any[] = (await response.json()) as any[]
    const chain = chains.find((c) => c.chainId === chainId)

    if (chain) {
      return chain
    }

    return null
  } catch (error) {
    console.warn('Failed to fetch network info from chainid.network:', error)
    return null
  }
}
