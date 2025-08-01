import Pool from '../../artifacts/Pool.json'
import createDeployContractStep from './meta/createDeployContractStep'

export const DEPLOY_POOL_IMPLEMENTATION = createDeployContractStep({
  key: 'poolImplementationAddress',
  artifact: Pool,
})
