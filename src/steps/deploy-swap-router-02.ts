import SwapRouter02 from '../../artifacts/SwapRouter.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_SWAP_ROUTER_02 = createDeployUpgradeableContractStep({
  key: 'swapRouter02',
  artifact: SwapRouter02,
  computeArguments(state, config) {
    if (state.coreFactoryAddress?.address === undefined) {
      throw new Error('Missing Core Factory')
    }

    return [
      state.coreFactoryAddress.address,
      config.weth9Address,
    ]
  },
})
