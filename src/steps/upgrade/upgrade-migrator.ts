import Migrator from '../../../artifacts/Migrator.json'
import createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_MIGRATOR = createUpgradeContractStep({
  key: 'migratorAddress',
  artifact: Migrator,
})
