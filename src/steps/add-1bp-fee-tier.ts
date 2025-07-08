import Factory from '../../artifacts/Factory.json'
import { Contract } from '@ethersproject/contracts'
import { MigrationStep } from '../migrations'
import { sign } from 'crypto'

const ONE_BP_FEE = 100
const ONE_BP_TICK_SPACING = 1

export const ADD_1BP_FEE_TIER: MigrationStep = async (state, { signer, gasPrice }) => {
  if (state.coreFactoryAddress === undefined) {
    throw new Error('Missing Factory')
  }
  
  const zeroAddr = '0x0000000000000000000000000000000000000000'
  const coreFactory = new Contract(state.coreFactoryAddress, Factory.abi, signer)
  const oldOwner = await coreFactory.owner();
  if (oldOwner != zeroAddr) {
    return [{
      message: `new fee tier already added to Factory`
    }]
  } 
  const tx1 = await coreFactory.initialize(state.poolImplementationAddress, state.proxyAdminAddress);
  const owner = await coreFactory.owner()
  if (owner != zeroAddr && owner !== (await signer.getAddress())) {
    throw new Error('Factory.owner is not signer')
  }
  const tx = await coreFactory.enableFeeAmount(ONE_BP_FEE, ONE_BP_TICK_SPACING)

  return [
    {
      message: `Factory added a new fee tier ${ONE_BP_FEE / 100} bps with tick spacing ${ONE_BP_TICK_SPACING}`,
      hash: tx.hash,
    },
  ]
}
