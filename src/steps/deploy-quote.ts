import Quoter from '../../artifacts/lens/Quoter.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_QUOTER = createDeployUpgradeableContractStep({
  key: 'quoterAddress',
  artifact: Quoter,
  computeArguments(state, config) {
    if (state.coreFactoryAddress === undefined) {
      throw new Error('Missing Core Factory')
    }
    return [state.coreFactoryAddress, config.weth9Address]
  },
})
