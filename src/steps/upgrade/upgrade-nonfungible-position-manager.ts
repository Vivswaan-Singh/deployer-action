import NonfungiblePositionManager from '../../../artifacts/NonfungiblePositionManager.json'
import createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_NONFUNGIBLE_POSITION_MANAGER = createUpgradeContractStep({
  key: 'nonfungibleTokenPositionManagerAddress',
  artifact: NonfungiblePositionManager,
})
