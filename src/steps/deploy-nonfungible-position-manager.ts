import NonfungiblePositionManager from '../../artifacts/NonfungiblePositionManager.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_NONFUNGIBLE_POSITION_MANAGER = createDeployUpgradeableContractStep({
  key: 'nonfungibleTokenPositionManagerAddress',
  artifact: NonfungiblePositionManager,
  computeArguments(state, config) {
    if (state.coreFactoryAddress === undefined) {
      throw new Error('Missing Core Factory')
    }
    if (state.nonfungibleTokenPositionDescriptorAddressV1_3_0 === undefined) {
      throw new Error('Missing NonfungibleTokenDescriptorProxyAddress')
    }

    return [state.coreFactoryAddress, config.weth9Address, state.nonfungibleTokenPositionDescriptorAddressV1_3_0]
  },
})
