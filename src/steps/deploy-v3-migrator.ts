import V3Migrator from '../../artifacts/V3Migrator.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_V3_MIGRATOR = createDeployUpgradeableContractStep({
  key: 'v3MigratorAddress',
  artifact: V3Migrator,
  computeArguments(state, config) {
    if (state.v3CoreFactoryAddress === undefined) {
      throw new Error('Missing V3 Core Factory')
    }
    if (state.nonfungibleTokenPositionManagerAddress === undefined) {
      throw new Error('Missing NonfungiblePositionManager')
    }
    return [state.v3CoreFactoryAddress, config.weth9Address, state.nonfungibleTokenPositionManagerAddress]
  },
})
