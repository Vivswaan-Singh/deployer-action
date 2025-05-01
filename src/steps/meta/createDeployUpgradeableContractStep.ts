import { Contract, ContractFactory, ContractInterface } from '@ethersproject/contracts'
import { MigrationConfig, MigrationState, MigrationStep } from '../../migrations'
import linkLibraries from '../../util/linkLibraries'

type ConstructorArgs = (string | number | string[] | number[])[]

export default function createDeployUpgradeableContractStep({
  key,
  artifact: { contractName, abi, bytecode, linkReferences },
  computeLibraries,
  computeArguments,
  initializer = 'initialize',
}: {
  key: keyof MigrationState
  artifact: {
    contractName: string
    abi: ContractInterface
    bytecode: string
    linkReferences?: { [fileName: string]: { [contractName: string]: { length: number; start: number }[] } }
  }
  computeLibraries?: (state: Readonly<MigrationState>, config: MigrationConfig) => { [libraryName: string]: string }
  computeArguments?: (state: Readonly<MigrationState>, config: MigrationConfig) => ConstructorArgs
  initializer?: string // default is 'initialize'
}): MigrationStep {
  return async (state, config) => {
    if (state[key] === undefined) {
      if (!state.proxyAdminAddress) {
        throw new Error('proxyAdminAddress must be set in state before deploying upgradeable contracts')
      }

      const constructorArgs: ConstructorArgs = computeArguments ? computeArguments(state, config) : []

      const logicFactory = new ContractFactory(
        abi,
        linkReferences && computeLibraries
          ? linkLibraries({ bytecode, linkReferences }, computeLibraries(state, config))
          : bytecode,
        config.signer
      )

      // Deploy implementation contract
      const logic = await logicFactory.deploy({ gasPrice: config.gasPrice })
      await logic.deployed()

      // Load TransparentUpgradeableProxy artifact
      const proxyArtifact = await import('@openzeppelin/contracts/build/contracts/TransparentUpgradeableProxy.json')
      const proxyFactory = new ContractFactory(proxyArtifact.abi, proxyArtifact.bytecode, config.signer)

      // Encode initializer call
      let initData = "0x";
      if (constructorArgs.length != 0) {
        initData = logicFactory.interface.encodeFunctionData(initializer, constructorArgs)
      }

      // Deploy proxy
      const proxy = await proxyFactory.deploy(logic.address, state.proxyAdminAddress, initData, {
        gasPrice: config.gasPrice,
      })
      await proxy.deployed()

      state[key] = proxy.address

      return [
        {
          message: `Upgradeable proxy for ${contractName} deployed`,
          address: proxy.address,
          proxtImplementationAddr: logic.address,
          hash: proxy.deployTransaction.hash,
        },
      ]
    } else {
      return [{ message: `Contract ${contractName} was already deployed`, address: state[key] }]
    }
  }
}
