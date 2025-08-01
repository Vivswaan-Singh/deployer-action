import InterfaceMulticall from '../../artifacts/lens/InterfaceMulticall.json'
import  createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_MULTICALL2 = createDeployUpgradeableContractStep({
  key: 'multicall2Address',
  artifact: InterfaceMulticall,
})
