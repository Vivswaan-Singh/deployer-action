import Quoter from '../../artifacts/lens/Quoter.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_QUOTER = createDeployUpgradeableContractStep({
  key: 'quoterAddress',
  artifact: Quoter,
  computeArguments(state, config) {
    if (state.v3CoreFactoryAddress === undefined) {
      throw new Error('Missing V3 Core Factory')
    }
    return [state.v3CoreFactoryAddress, config.weth9Address]
  },
})
