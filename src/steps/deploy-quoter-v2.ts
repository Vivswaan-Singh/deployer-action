import QuoterV2 from '../../artifacts/lens/QuoterV2.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_QUOTER_V2 = createDeployUpgradeableContractStep({
  key: 'quoterV2Address',
  artifact: QuoterV2,
  computeArguments(state, config) {
    if (state.coreFactoryAddress?.address === undefined) {
      throw new Error('Missing Core Factory')
    }
    return [state.coreFactoryAddress.address, config.weth9Address]
  },
})
