import SwapRouter02 from '../../../artifacts/SwapRouter.json'
import createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_SWAP_ROUTER_02 = createUpgradeContractStep({
  key: 'swapRouter',
  artifact: SwapRouter02,
})
