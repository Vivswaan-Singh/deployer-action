import { program } from 'commander'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider, TransactionReceipt } from '@ethersproject/providers'
import { getAddress } from '@ethersproject/address'
import deploy from './src/deploy'
import { MigrationState } from './src/migrations'
import { asciiStringToBytes32 } from './src/util/asciiStringToBytes32'
import { version } from './package.json'
import 'dotenv/config';

program
  .option('-pk, --private-key <string>', 'Private key used to deploy all contracts')
  .option('-j, --json-rpc <url>', 'JSON RPC URL where the program should be deployed')
  .option('-w9, --weth9-address <address>', 'Address of the WETH9 contract on this chain')
  .option('-ncl, --native-currency-label <string>', 'Native currency label, e.g. ETH')
  .option(
    '-o, --owner-address <address>',
    'Contract address that will own the deployed artifacts after the script runs'
  )
  .option('-s, --state <path>', 'Path to the JSON file containing the migrations state (optional)', './config/config.json')
  .option('-g, --gas-price <number>', 'The gas price to pay in GWEI for each transaction (optional)')
  .option('-c, --confirmations <number>', 'How many confirmations to wait for after each transaction (optional)', '2')
  .option('-u, --upgrade', 'To upgrade proxy implementation')

program.name('npx @uniswap/deploy-v3').version(version).parse(process.argv)

program.privateKey = program.privateKey ?? process.env.PRIVATE_KEY
program.jsonRpc = program.jsonRpc ?? process.env.JSON_RPC
program.weth9Address = program.weth9Address ?? process.env.WETH9_ADDRESS
program.nativeCurrencyLabel = program.nativeCurrencyLabel ?? process.env.NATIVE_CURRENCY_LABEL
program.ownerAddress = program.ownerAddress ?? process.env.OWNER_ADDRESS
program.state = program.state ?? process.env.STATE
program.gasPrice = program.gasPrice ?? process.env.GAS_PRICE
program.confirmations = program.confirmations ?? process.env.CONFIRMATIONS

const requiredFields = [
  { key: 'privateKey', label: 'Private key' },
  { key: 'jsonRpc', label: 'Json RPC' },
  { key: 'weth9Address', label: 'WETH9' },
  { key: 'nativeCurrencyLabel', label: 'Native currency label' },
  { key: 'ownerAddress', label: 'Owner address' },
];

for (const field of requiredFields) {
  if (!program[field.key]) {
    console.error(`${field.label} is required`);
    process.exit(1);
  }
}

if (!/^0x[a-zA-Z0-9]{64}$/.test(program.privateKey)) {
  console.error('Invalid private key!')
  process.exit(1)
}

let upgradeParam: boolean = program.upgrade

let url: URL
try {
  url = new URL(program.jsonRpc)
} catch (error) {
  console.error('Invalid JSON RPC URL', (error as Error).message)
  process.exit(1)
}

let gasPrice: number | undefined
try {
  gasPrice = program.gasPrice ? parseInt(program.gasPrice) : undefined
} catch (error) {
  console.error('Failed to parse gas price', (error as Error).message)
  process.exit(1)
}

let confirmations: number
try {
  confirmations = parseInt(program.confirmations)
} catch (error) {
  console.error('Failed to parse confirmations', (error as Error).message)
  process.exit(1)
}

let nativeCurrencyLabelBytes: string
try {
  nativeCurrencyLabelBytes = asciiStringToBytes32(program.nativeCurrencyLabel)
} catch (error) {
  console.error('Invalid native currency label', (error as Error).message)
  process.exit(1)
}

let weth9Address: string
try {
  weth9Address = getAddress(program.weth9Address)
} catch (error) {
  console.error('Invalid WETH9 address', (error as Error).message)
  process.exit(1)
}

let ownerAddress: string
try {
  ownerAddress = getAddress(program.ownerAddress)
} catch (error) {
  console.error('Invalid owner address', (error as Error).message)
  process.exit(1)
}

const wallet = new Wallet(program.privateKey, new JsonRpcProvider({ url: url.href }))

let finalState: MigrationState
const onStateChange = async (newState: MigrationState): Promise<void> => {
  finalState = newState
}


async function run() {
  let step = 1
  const results = []
  const generator = deploy({
    signer: wallet,
    gasPrice,
    nativeCurrencyLabelBytes,
    jsonRpc: url.toString(),
    ownerAddress,
    weth9Address,
    upgradeParam,
    initialState: {},
    onStateChange,
  })

  for await (const result of generator) {
    console.log(`Step ${step++} complete`, result)
    results.push(result)

    // wait 15 minutes for any transactions sent in the step
    await Promise.all(
      result.map(
        (stepResult): Promise<TransactionReceipt | true> => {
          if (stepResult.hash) {
            return wallet.provider.waitForTransaction(stepResult.hash, confirmations, /* 15 minutes */ 1000 * 60 * 15)
          } else {
            return Promise.resolve(true)
          }
        }
      )
    )
  }

  return results
}

run()
  .then((results) => {
    console.log('Deployment succeeded')
    console.log(JSON.stringify(results))
    console.log('Final state')
    console.log(JSON.stringify(finalState))
    process.exit(0)
  })
  .catch((error) => {
    console.error('Deployment failed', error)
    console.log('Final state')
    console.log(JSON.stringify(finalState))
    process.exit(1)
  })
