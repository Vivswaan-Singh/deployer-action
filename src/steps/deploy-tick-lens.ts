import TickLens from '@uniswap/v3-periphery/artifacts/contracts/lens/TickLens.sol/TickLens.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_TICK_LENS = createDeployUpgradeableContractStep({
  key: 'tickLensAddress',
  artifact: TickLens,
})
