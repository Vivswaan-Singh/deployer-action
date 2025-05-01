import SwapRouter02 from '../../artifacts/SwapRouter.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_V3_SWAP_ROUTER_02 = createDeployUpgradeableContractStep({
  key: 'swapRouter02',
  artifact: SwapRouter02,
  computeArguments(state, config) {
    if (state.v3CoreFactoryAddress === undefined) {
      throw new Error('Missing V3 Core Factory')
    }

    return [
      // config.v2CoreFactoryAddress,
      state.v3CoreFactoryAddress,
      // state.nonfungibleTokenPositionManagerAddress,
      config.weth9Address,
    ]
  },
})
