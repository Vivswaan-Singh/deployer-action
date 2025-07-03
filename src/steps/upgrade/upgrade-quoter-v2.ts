import QuoterV2 from '../../../artifacts/lens/QuoterV2.json'
import createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_QUOTER_V2 = createUpgradeContractStep({
  key: 'quoterV2Address',
  artifact: QuoterV2,
})
