import { ContractFactory, ContractInterface, Contract } from '@ethersproject/contracts'
import { MigrationConfig, MigrationState, MigrationStep } from '../../migrations'
import linkLibraries from '../../util/linkLibraries'

export default function createUpgradeContractStep({
  key,
  artifact: { contractName, abi, bytecode, linkReferences },
  computeLibraries,
  computeArguments,
}: {
  key: keyof MigrationState // where to find the proxy address in state
  artifact: {
    contractName: string
    abi: ContractInterface
    bytecode: string
    linkReferences?: { [fileName: string]: { [contractName: string]: { length: number; start: number }[] } }
  }
  computeLibraries?: (state: Readonly<MigrationState>, config: MigrationConfig) => { [libraryName: string]: string }
  computeArguments?: (
    state: Readonly<MigrationState>,
    config: MigrationConfig
  ) => (string | number | string[] | number[])[]
}): MigrationStep {
  return async (state, config) => {
    if (!state.proxyAdminAddress) {
      throw new Error('proxyAdminAddress must be set in state before upgrading contracts')
    }
    if (!state[key]) {
      throw new Error(`Proxy address for upgrade not found in state at key: ${String(key)}`)
    }

    // Deploy new implementation
    const constructorArgs = computeArguments ? computeArguments(state, config) : []
    const logicFactory = new ContractFactory(
      abi,
      linkReferences && computeLibraries
        ? linkLibraries({ bytecode, linkReferences }, computeLibraries(state, config))
        : bytecode,
      config.signer
    )

    // Upgrade proxy to new implementation
    const proxyAdminArtifact = await import('@openzeppelin/contracts/build/contracts/ProxyAdmin.json')
    const proxyAdmin = new Contract(state.proxyAdminAddress, proxyAdminArtifact.abi, config.signer)

    const newImpl = await logicFactory.deploy({ gasPrice: config.gasPrice })
    await newImpl.deployed()

    // Call upgrade(proxy, newImpl)
    const tx = await proxyAdmin.upgrade(state[key], newImpl.address, { gasPrice: config.gasPrice })
    await tx.wait()

    return [
      {
        message: `Upgraded proxy for ${contractName}`,
        proxy: state[key],
        newImplementation: newImpl.address,
        hash: tx.hash,
      },
    ]
  }
}
