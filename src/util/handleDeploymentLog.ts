import { program } from 'commander'
import fs from 'fs'
import {logger} from '../../index'

export async function updateContractsFile(newState: any) {
  let contractsJson: Record<string, any> = {}

  const filePath = `./config/${program.env}.json`

  // Read the current contracts JSON if it exists
  if (fs.existsSync(filePath)) {
    contractsJson = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
  }

  if(!contractsJson["chains"]){
    contractsJson["chains"]={
      
    }
  }

  // Create the network entry if it doesn't exist
  if (!contractsJson["chains"][program.chainName]) {
    contractsJson["chains"][program.chainName] = {
      name: program.chainName,
      chainId: program.chainId,
      rpc: program.jsonRpc,
      tokenSymbol: program.nativeCurrencyLabel,
      explorer: program.explorerUrl,
      wss: program.wssUrl,
      contracts: {},
    }
  }

  contractsJson["chains"][program.chainName].contracts = newState
  // Save the updated contracts back to file
  try {
    fs.writeFileSync(filePath, JSON.stringify(contractsJson, null, 2))
  } catch (error) {
    logger.error('Error writing to file:', error)
  }
}
