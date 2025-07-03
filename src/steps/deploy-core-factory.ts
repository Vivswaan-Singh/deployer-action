import Factory from '../../artifacts/Factory.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_CORE_FACTORY = createDeployUpgradeableContractStep({
  key: 'coreFactoryAddress',
  artifact: Factory,
})
