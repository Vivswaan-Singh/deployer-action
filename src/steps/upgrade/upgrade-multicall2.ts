import InterfaceMulticall from '../../../artifacts/lens/InterfaceMulticall.json'
import  createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_MULTICALL2 = createUpgradeContractStep({
  key: 'multicall2Address',
  artifact: InterfaceMulticall,
})
