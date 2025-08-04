import { program } from 'commander';
import fs from 'fs';
import path from 'path';

export async function updateContractsFile(newState: any) {
  let contractsJson: Record<string, any> = {};

  // Define the path to the configuration file
  const configDir = './config';
  const filePath = path.join(configDir, `${program.env}.json`);

  // Ensure the config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Read the current contracts JSON if it exists
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
      // Avoid parsing an empty file
      if (fileContent) {
        contractsJson = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error(`Error parsing JSON from ${filePath}. Starting fresh.`, error);
      contractsJson = {};
    }
  }

  // Create the network entry if it doesn't exist
  if (!contractsJson[program.chainName]) {
    contractsJson[program.chainName] = {
      name: program.chainName,
      chainId: program.chainId,
      rpc: program.jsonRpc,
      tokenSymbol: program.nativeCurrencyLabel,
      explorers: program.explorerUrl,
      contracts: {}, // Initialize with an empty contracts object
    };
  }


  contractsJson[program.chainName].contracts = {
    ...contractsJson[program.chainName].contracts,
    ...newState,
  };

  // Save the updated contracts back to the file
  try {
    fs.writeFileSync(filePath, JSON.stringify(contractsJson, null, 2));
  } catch (error) {
    console.error('Error writing updated configuration to file:', error);
  }
}
