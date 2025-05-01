import UniswapInterfaceMulticall from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import  createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_MULTICALL2 = createDeployUpgradeableContractStep({
  key: 'multicall2Address',
  artifact: UniswapInterfaceMulticall,
})
