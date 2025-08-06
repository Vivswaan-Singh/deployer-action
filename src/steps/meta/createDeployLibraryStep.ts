import { ContractInterface, ContractFactory } from '@ethersproject/contracts'
import { MigrationState, MigrationStep } from '../../migrations'

export default function createDeployLibraryStep({
  key,
  artifact: { contractName, abi, bytecode },
}: {
  key: keyof MigrationState
  artifact: { contractName: string; abi: ContractInterface; bytecode: string }
}): MigrationStep {
  return async (state, { signer, gasPrice }) => {
    const contractState = state[key]
    if (contractState?.address != undefined) {
      return [{ message: `Library ${contractName} was already deployed`, address: contractState.address }]
    }
    const factory = new ContractFactory(abi, bytecode, signer)

    const library = await factory.deploy({ gasPrice })

    const signrAddress = await signer.getAddress()
    state[key] = {
      address: library.address,
      deployer: signrAddress,
    }

    return [
      {
        message: `Library ${contractName} deployed`,
        address: library.address,
        hash: library.deployTransaction.hash,
      },
    ]
  }
}
