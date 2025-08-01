import Factory from '../../artifacts/Factory.json'
import { Contract } from '@ethersproject/contracts'
import { MigrationStep } from '../migrations'

export const TRANSFER_CORE_FACTORY_OWNER: MigrationStep = async (state, { signer, gasPrice, ownerAddress }) => {
  if (state.coreFactoryAddress?.address === undefined) {
    throw new Error('Missing UniswapV3Factory')
  }

  const coreFactory = new Contract(state.coreFactoryAddress.address, Factory.abi, signer)

  const owner = await coreFactory.owner()
  if (owner === ownerAddress)
    return [
      {
        message: `UniswapV3Factory owned by ${ownerAddress} already`,
      },
    ]

  if (owner !== (await signer.getAddress())) {
    throw new Error('UniswapV3Factory.owner is not signer')
  }

  const tx = await coreFactory.setOwner(ownerAddress, { gasPrice })

  return [
    {
      message: `UniswapV3Factory ownership set to ${ownerAddress}`,
      hash: tx.hash,
    },
  ]
}
