import { program } from 'commander'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider, TransactionReceipt } from '@ethersproject/providers'
import { getAddress } from '@ethersproject/address'
import fs from 'fs'
import deploy from './src/deploy'
import { MigrationState } from './src/migrations'
import { asciiStringToBytes32 } from './src/util/asciiStringToBytes32'
import { version } from './package.json'
import { Logger } from "tslog"
import 'dotenv/config'
import { hasMinimumEthBalance, toChecksumAddress } from './src/util/tools'

program
  .option('-pk, --private-key <string>', 'Private key used to deploy all contracts')
  .option('-e, --env <env>', 'Environment')
  .option('-j, --json-rpc <url>', 'JSON RPC URL where the program should be deployed')
  .option('-w9, --weth9-address <address>', 'Address of the WETH9 contract on this chain')
  .option('-ncl, --native-currency-label <string>', 'Native currency label, e.g. ETH')
  .option(
    '-o, --owner-address <address>',
    'Contract address that will own the deployed artifacts after the script runs'
  )
  .option('-g, --gas-price <number>', 'The gas price to pay in GWEI for each transaction (optional)')
  .option('-c, --confirmations <number>', 'How many confirmations to wait for after each transaction (optional)')
  .option('-u, --upgrade', 'To upgrade proxy implementation')
  .option('--chain-id <string>', 'Chain id')
  .option('--chain-name <string>', 'Chain name') 
  .option('--explorer-url <string>', 'Chain explorer url')
  .option('--wss-url <string>', 'Chain web socket url') 

program.name('npx @uniswap/deploy-v3').version(version).parse(process.argv)

program.privateKey = program.privateKey ?? process.env.PRIVATE_KEY
program.env = program.env ?? process.env.ENV
program.chainId = program.chainId ?? process.env.CHAIN_ID
program.chainName = program.chainName ?? process.env.CHAIN_NAME
program.ownerAddress = program.ownerAddress ?? process.env.OWNER_ADDRESS
program.gasPrice = program.gasPrice ?? process.env.GAS_PRICE
program.confirmations = (program.confirmations ?? process.env.CONFIRMATIONS) ?? "2"

program.jsonRpc = program.jsonRpc ?? process.env.JSON_RPC
program.weth9Address = program.weth9Address ?? process.env.WETH9_ADDRESS
program.nativeCurrencyLabel = program.nativeCurrencyLabel ?? process.env.NATIVE_CURRENCY_LABEL
program.explorerUrl = program.explorerUrl ?? process.env.EXPLORER_URL
program.wssUrl = program.wssUrl ?? process.env.WSS_URL

let url: URL
let gasPrice: number | undefined
let confirmations: number
let nativeCurrencyLabelBytes: string
let weth9Address: string
let ownerAddress: string


export const logger = new Logger({ name: "" })

let upgradeParam: boolean = program.upgrade

if (!/^0x[a-zA-Z0-9]{64}$/.test(program.privateKey)) {
  logger.error('Invalid private key!')
  process.exit(1)
}

const chainName = program.chainName.toLowerCase().replace(/\s+/g,'-')
program.chainName = chainName

let state: MigrationState
if (fs.existsSync(`./config/${program.env}.json`)) {
  try {
    const configState = JSON.parse(fs.readFileSync(`./config/${program.env}.json`, { encoding: 'utf8' }))
    if(upgradeParam && !program.rpc){
      program.jsonRpc = configState.chains[program.chainName].rpc
    }
    state = configState["chains"]?.[program.chainName]?.contracts ?? {}
  } catch (error) {
    logger.error('Failed to load and parse migration state file', (error as Error).message)
    process.exit(1)
  }
} else {
  state = {}
}
const requiredFields = [
  { key: 'privateKey', label: 'Private key' },
  { key: 'env', label: 'Environment' },
  { key: 'chainName', label: 'Chain name' },
]

checkRequirements(requiredFields)

if(!upgradeParam){
  const requiredFields = [
    { key: 'jsonRpc', label: 'Json RPC' },
    { key: 'weth9Address', label: 'WETH9' },
    { key: 'nativeCurrencyLabel', label: 'Native currency label' },
    { key: 'chainId', label: 'Chain Id' },
  ]

  checkRequirements(requiredFields)

  try {
    nativeCurrencyLabelBytes = (asciiStringToBytes32(program.nativeCurrencyLabel)).toUpperCase()
  } catch (error) {
    logger.error('Invalid native currency label', (error as Error).message)
    process.exit(1)
  }

  try {
    weth9Address = getAddress(toChecksumAddress(program.weth9Address))
  } catch (error) {
    logger.error('Invalid WETH9 address', (error as Error).message)
    process.exit(1)
  }

  try {
    ownerAddress = getAddress(toChecksumAddress(program.ownerAddress))
  } catch (error) {
    logger.error('Invalid owner address', (error as Error).message)
    process.exit(1)
  }
}



try {
    url = new URL(program.jsonRpc)
  } catch (error) {
    logger.error('Invalid JSON RPC URL', (error as Error).message)
    process.exit(1)
  }

try {
  gasPrice = program.gasPrice ? parseInt(program.gasPrice) : undefined
} catch (error) {
  logger.error('Failed to parse gas price', (error as Error).message)
  process.exit(1)
}

try {
  confirmations = parseInt(program.confirmations)
} catch (error) {
  logger.error('Failed to parse confirmations', (error as Error).message)
  process.exit(1)
}



// Validate and normalize environment
const allowedEnvironments = [
  'local',
  'devnet',
  'devnet-amplifier',
  'devnet-verifiers',
  'stagenet',
  'testnet',
  'mainnet',
]

const environment = program.env?.toLowerCase()

if (environment && !allowedEnvironments.includes(environment)) {
  logger.error(`Invalid environment: ${environment}. Allowed values: ${allowedEnvironments.join(', ')}`)
  process.exit(1)
}

const wallet = new Wallet(program.privateKey, new JsonRpcProvider({ url: url.href }))


let finalState: MigrationState
const onStateChange = async (newState: MigrationState): Promise<void> => {
  finalState = newState
}

async function checkRequirements(fields: { key: string; label: string }[]) {
  for (const field of fields) {
    if (!program[field.key]) {
      logger.error(`${field.label} is required`)
      process.exit(1)
    }
  } 
}

async function run() {
  let addr: string = await wallet.getAddress();
  await hasMinimumEthBalance(addr,url.toString());

  let step = 1
    const results = []
    const generator = deploy({
      signer: wallet,
      gasPrice,
      nativeCurrencyLabelBytes,
      ownerAddress,
      weth9Address,
      upgradeParam,
      initialState: state,
      onStateChange,
    })

    for await (const result of generator) {
      logger.info(`Step ${step++} complete`, result)
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
    logger.info('Deployment succeeded')
    logger.info(JSON.stringify(results))
    logger.info('Final state')
    logger.info(JSON.stringify(finalState))
    process.exit(0)
  })
  .catch((error) => {
    logger.error('Deployment failed', error)
    logger.info('Final state')
    logger.info(JSON.stringify(finalState))
    process.exit(1)
  })