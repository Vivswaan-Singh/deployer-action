import TickLens from '../../../artifacts/lens/TickLens.json'
import createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_TICK_LENS = createUpgradeContractStep({
  key: 'tickLensAddress',
  artifact: TickLens,
})
