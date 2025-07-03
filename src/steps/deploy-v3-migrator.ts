import Migrator from '../../artifacts/Migrator.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_V3_MIGRATOR = createDeployUpgradeableContractStep({
  key: 'migratorAddress',
  artifact: Migrator,
  computeArguments(state, config) {
    if (state.coreFactoryAddress === undefined) {
      throw new Error('Missing Core Factory')
    }
    if (state.nonfungibleTokenPositionManagerAddress === undefined) {
      throw new Error('Missing NonfungiblePositionManager')
    }
    return [state.coreFactoryAddress, config.weth9Address, state.nonfungibleTokenPositionManagerAddress]
  },
})
