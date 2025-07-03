import Factory from '../../../artifacts/Factory.json'
import createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_CORE_FACTORY = createUpgradeContractStep({
  key: 'coreFactoryAddress',
  artifact: Factory,
})
