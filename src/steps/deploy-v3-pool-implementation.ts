import UniswapV3Pool from '../../artifacts/UniswapV3Pool.json'
import createDeployContractStep from './meta/createDeployContractStep'

export const DEPLOY_V3_POOL_IMPLEMENTATION = createDeployContractStep({
  key: 'v3PoolImplementationAddress',
  artifact: UniswapV3Pool,
})
