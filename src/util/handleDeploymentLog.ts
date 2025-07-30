import { program } from 'commander'
import fs from 'fs'

export async function updateContractsFile(newState: any) {
  let contractsJson: Record<string, any> = {}

  const filePath = `./config/${program.env}.json`

  // Read the current contracts JSON if it exists
  if (fs.existsSync(filePath)) {
    contractsJson = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
  }

  // Create the network entry if it doesn't exist
  if (!contractsJson[program.chainName]) {
    contractsJson[program.chainName] = {
      name: program.chainName,
      chainId: program.chainId,
      rpc: program.jsonRpc,
      tokenSymbol: program.nativeCurrencyLabel,
      explorers: program.explorerUrl,
      contracts: {},
    }
  }

  contractsJson[program.chainName].contracts = newState
  // Save the updated contracts back to file
  try {
    fs.writeFileSync(filePath, JSON.stringify(contractsJson, null, 2))
  } catch (error) {
    console.error('Error writing to file:', error)
  }
}
