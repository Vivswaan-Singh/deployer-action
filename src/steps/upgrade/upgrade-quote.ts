import Quoter from '../../../artifacts/lens/Quoter.json'
import createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_QUOTER = createUpgradeContractStep({
  key: 'quoterAddress',
  artifact: Quoter,
})
