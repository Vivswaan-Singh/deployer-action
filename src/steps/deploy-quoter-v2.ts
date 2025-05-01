import QuoterV2 from '../../artifacts/QuoterV2.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_QUOTER_V2 = createDeployUpgradeableContractStep({
  key: 'quoterV2Address',
  artifact: QuoterV2,
  computeArguments(state, config) {
    if (state.v3CoreFactoryAddress === undefined) {
      throw new Error('Missing V3 Core Factory')
    }
    return [state.v3CoreFactoryAddress, config.weth9Address]
  },
})
