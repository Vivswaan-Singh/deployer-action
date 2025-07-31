import { ContractFactory, ContractInterface, Contract } from '@ethersproject/contracts'
import { MigrationConfig, MigrationState, MigrationStep } from '../../migrations'
import linkLibraries from '../../util/linkLibraries'

export default function createUpgradeContractStep({
  key,
  artifact: { contractName, abi, bytecode, linkReferences },
  computeLibraries,
}: {
  key: keyof MigrationState // where to find the proxy address in state
  artifact: {
    contractName: string
    abi: ContractInterface
    bytecode: string
    linkReferences?: { [fileName: string]: { [contractName: string]: { length: number; start: number }[] } }
  }
  computeLibraries?: (state: Readonly<MigrationState>, config: MigrationConfig) => { [libraryName: string]: string }
}): MigrationStep {
  return async (state, config) => {
    if (state.proxyAdminAddress?.address === undefined) {
      throw new Error('proxyAdminAddress must be set in state before upgrading contracts')
    }

    const contractState = state[key]
    if (contractState?.address === undefined) {
      return[{message: `Proxy address for upgrade not found in state at key: ${String(key)}`}];
    }

    // Deploy new implementation
    const logicFactory = new ContractFactory(
      abi,
      linkReferences && computeLibraries
        ? linkLibraries({ bytecode, linkReferences }, computeLibraries(state, config))
        : bytecode,
      config.signer
    )

    // Upgrade proxy to new implementation
    const proxyAdminArtifact = await import('@openzeppelin/contracts/build/contracts/ProxyAdmin.json')
    const proxyAdmin = new Contract(state.proxyAdminAddress.address, proxyAdminArtifact.abi, config.signer)

    const newImpl = await logicFactory.deploy({ gasPrice: config.gasPrice })
    await newImpl.deployed()

    // Call upgrade(proxy, newImpl)
    const tx = await proxyAdmin.upgrade(contractState.address, newImpl.address, { gasPrice: config.gasPrice })
    await tx.wait()

    contractState.implementation = newImpl.address
    contractState.lastTxHash = tx.hash
    state[key] = contractState

    return [
      {
        message: `Upgraded proxy for ${contractName}`,
        proxy: contractState.address,
        newImplementation: newImpl.address,
        hash: tx.hash,
      },
    ]
  }
}
