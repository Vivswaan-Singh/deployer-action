import Factory from '../../artifacts/Factory.json'
import { Contract } from '@ethersproject/contracts'
import { MigrationStep } from '../migrations'

const ONE_BP_FEE = 100
const ONE_BP_TICK_SPACING = 1
const TEN_BP_FEE = 1000
const TEN_BP_TICK_SPACING = 20

export const ADD_1BP_FEE_TIER: MigrationStep = async (state, { signer, gasPrice }) => {
  if (state.coreFactoryAddress?.address === undefined) {
    throw new Error('Missing Factory')
  }

  if (state.poolImplementationAddress?.address === undefined) {
    throw new Error('Missing Pool implementation')
  }

  if (state.proxyAdminAddress?.address === undefined) {
    throw new Error('Missing Proxy admin address')
  }
  
  const zeroAddr = '0x0000000000000000000000000000000000000000'
  const coreFactory = new Contract(state.coreFactoryAddress.address, Factory.abi, signer)
  const oldOwner = await coreFactory.owner();
  if (oldOwner != zeroAddr) {
    return [{
      message: `new fee tier already added to Factory`
    }]
  } 
  const tx1 = await coreFactory.initialize(state.poolImplementationAddress.address, state.proxyAdminAddress.address);
  const owner = await coreFactory.owner()
  if (owner != zeroAddr && owner !== (await signer.getAddress())) {
    throw new Error('Factory.owner is not signer')
  }
  try{
    const tx = await coreFactory.enableFeeAmount(ONE_BP_FEE, ONE_BP_TICK_SPACING, { gasPrice })
    const tx2 = await coreFactory.enableFeeAmount(TEN_BP_FEE, TEN_BP_TICK_SPACING, { gasPrice })
  } catch(err) {
    console.log("error while executing enableFeeAmount",err)
    return[{
      message:`error while executing enableFeeAmount ${err}` 
    }]
  }

  return [
    {
      message: `Factory added a new fee tier ${ONE_BP_FEE / 100} bps with tick spacing ${ONE_BP_TICK_SPACING}`,
    },
  ]
}
