import UniswapV3Factory from '../../artifacts/UniswapV3Factory.json'
import { Contract } from '@ethersproject/contracts'
import { MigrationStep } from '../migrations'
import { sign } from 'crypto'

const ONE_BP_FEE = 100
const ONE_BP_TICK_SPACING = 1

export const ADD_1BP_FEE_TIER: MigrationStep = async (state, { signer, gasPrice }) => {
  if (state.v3CoreFactoryAddress === undefined) {
    throw new Error('Missing UniswapV3Factory')
  }
  
  const zeroAddr = '0x0000000000000000000000000000000000000000'
  const v3CoreFactory = new Contract(state.v3CoreFactoryAddress, UniswapV3Factory.abi, signer)
  const oldOwner = await v3CoreFactory.owner();
  if (oldOwner != zeroAddr) {
    return [{
      message: `new fee tier already added to UniswapV3Factory`
    }]
  } 
  const tx1 = await v3CoreFactory.initializePool(state.proxyAdminAddress, state.v3PoolImplementationAddress);
  const owner = await v3CoreFactory.owner()
  if (owner != zeroAddr && owner !== (await signer.getAddress())) {
    throw new Error('UniswapV3Factory.owner is not signer')
  }
  const tx = await v3CoreFactory.enableFeeAmount(ONE_BP_FEE, ONE_BP_TICK_SPACING, { gasPrice })

  return [
    {
      message: `UniswapV3Factory added a new fee tier ${ONE_BP_FEE / 100} bps with tick spacing ${ONE_BP_TICK_SPACING}`,
      hash: tx.hash,
    },
  ]
}
