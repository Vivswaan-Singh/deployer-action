import { program } from 'commander'
import fs from 'fs'

export async function updateContractsFile(newState: any) {
  let contractsJson: Record<string, any> = {}

  const filePath = `./config/${program.env}.json`
  const chainName = program.chainName.toLowerCase().replace(/\s+/g,'-')

  // Read the current contracts JSON if it exists
  if (fs.existsSync(filePath)) {
    contractsJson = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
  }

  // Create the network entry if it doesn't exist
  if (!contractsJson[chainName]) {
    contractsJson[chainName] = {
      name: chainName,
      chainId: program.chainId,
      rpc: program.jsonRpc,
      tokenSymbol: program.nativeCurrencyLabel,
      explorers: program.explorerUrl,
      contracts: {},
    }
  }

  contractsJson[chainName].contracts = newState
  // Save the updated contracts back to file
  try {
    fs.writeFileSync(filePath, JSON.stringify(contractsJson, null, 2))
  } catch (error) {
    console.error('Error writing to file:', error)
  }
}
