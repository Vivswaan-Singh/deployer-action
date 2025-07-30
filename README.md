# Deploy Surge Script

This package includes a CLI script for deploying the latest Surge smart contracts to any EVM (Ethereum Virtual Machine) compatible network.

## Usage

This package vends a CLI for executing a deployment script that results in a full deployment of Surge Protocol.

The arguments are:

```text

Options:
  -pk, --private-key <string>               Private key used to deploy all contracts
  -e, --env <string>                        Environment (Network type, mainnet, testnet, etc...)
  -j, --json-rpc <url>                      JSON RPC URL where the program should be deployed
  -w9, --weth9-address <address>            Address of the WETH9 contract on this chain
  -ncl, --native-currency-label <string>    Native currency label, e.g. ETH
  -o, --owner-address <address>             Contract address that will own the deployed artifacts after the script runs
  -g, --gas-price <number>                  The gas price to pay in GWEI for each transaction (optional)
  -c, --confirmations <number>              How many confirmations to wait for after each transaction (optional) (default: "2")
  -h, --help                                display help for command
  --chainId <string>'                       Chain id
  --chainName <string>'                     Chain name
  --explorerUrl <string>'                   Chain explorer url
```

The script runs a set of migrations, each migration deploying a contract or executing a transaction. Migration state is
saved in a JSON file at the supplied path (`./config/${env}.json`).

To use the script, you must fund an address, and pass the private key of that address to the script so that it can construct
and broadcast the deployment transactions.

The block explorer verification process (e.g. Etherscan) is specific to the network. For the existing deployments,
we have used the `@nomiclabs/hardhat-etherscan` hardhat plugin in the individual repositories to verify the deployment addresses.

Note that in between deployment steps, the script waits for confirmations. By default, this is set to `2`. If the network
only mines blocks when the transactions is queued (e.g. a local testnet), you must set confirmations to `0`.

### Using Environment Variables

You can provide required options via environment variables instead of command-line arguments. This is useful for CI/CD or local development. The script will automatically use these environment variables if the corresponding CLI option is not provided.

Supported environment variables:

- `PRIVATE_KEY` – Private key used to deploy all contracts
- `JSON_RPC` – JSON RPC URL where the program should be deployed
- `WETH9_ADDRESS` – Address of the WETH9 contract on this chain
- `NATIVE_CURRENCY_LABEL` – Native currency label, e.g. ETH
- `OWNER_ADDRESS` – Contract address that will own the deployed artifacts after the script runs
- `GAS_PRICE` – The gas price to pay in GWEI for each transaction (optional)
- `CONFIRMATIONS` – How many confirmations to wait for after each transaction (optional)
- `ENV` – Network type (mainnet, testnet, devnet)
- `CHAIN_ID` – Chain id
- `CHAIN_NAME` – Chain name
- `EXPLORER_URL` – Chain explorer url

You can set these in a `.env` file (for local development) or in your CI/CD environment configuration. Example `.env` file:

```env
PRIVATE_KEY=your_private_key_here
JSON_RPC=https://your.rpc.url
WETH9_ADDRESS=0x...
NATIVE_CURRENCY_LABEL=ETH
OWNER_ADDRESS=0x...
GAS_PRICE=20
CONFIRMATIONS=2
```

The script will prioritize CLI arguments over environment variables if both are provided.

## Development

To run unit tests, run `yarn test`.

For testing the script, run `yarn start`.

To publish the script, first create a version: `npm version <version identifier>`, then publish via `npm publish`.
Don't forget to push your tagged commit!

## FAQs

### How much gas should I expect to use for full completion?

We estimate 30M - 40M gas needed to run the full deploy script.

### Where can I see all the addresses where each contract is deployed?

Check out `config/${env}.json`. It'll show you the final deployed addresses.

### How long will the script take?

Depends on the confirmation times and gas parameter. The deploy script sends up to a total of 14 transactions.

### Where should I ask questions or report issues?

You can file them in `issues` on this repo and we'll try our best to respond.
