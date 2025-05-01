import UniswapV3Factory from '../../artifacts/UniswapV3Factory.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_V3_CORE_FACTORY = createDeployUpgradeableContractStep({
  key: 'v3CoreFactoryAddress',
  artifact: UniswapV3Factory,
})
