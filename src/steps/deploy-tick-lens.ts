import TickLens from '../../artifacts/lens/TickLens.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_TICK_LENS = createDeployUpgradeableContractStep({
  key: 'tickLensAddress',
  artifact: TickLens,
})
