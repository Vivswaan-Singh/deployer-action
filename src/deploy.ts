import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { migrate } from './migrate'
import { MigrationState, MigrationStep, StepOutput } from './migrations'
import { ADD_1BP_FEE_TIER } from './steps/add-1bp-fee-tier'
import { DEPLOY_MULTICALL2 } from './steps/deploy-multicall2'
import { DEPLOY_NFT_DESCRIPTOR_LIBRARY_V1_3_0 } from './steps/deploy-nft-descriptor-library-v1_3_0'
import { DEPLOY_NFT_POSITION_DESCRIPTOR_V1_3_0 } from './steps/deploy-nft-position-descriptor-v1_3_0'
import { DEPLOY_NONFUNGIBLE_POSITION_MANAGER } from './steps/deploy-nonfungible-position-manager'
import { DEPLOY_PROXY_ADMIN } from './steps/deploy-proxy-admin'
import { DEPLOY_TICK_LENS } from './steps/deploy-tick-lens'
import { DEPLOY_CORE_FACTORY } from './steps/deploy-core-factory'
import { DEPLOY_SWAP_ROUTER_02 } from './steps/deploy-swap-router-02'
import { TRANSFER_PROXY_ADMIN } from './steps/transfer-proxy-admin'
import { TRANSFER_CORE_FACTORY_OWNER } from './steps/transfer-core-factory-owner'
import { DEPLOY_POOL_IMPLEMENTATION } from './steps/deploy-pool-implementation'
import { DEPLOY_QUOTER } from './steps/deploy-quote'

import { UPGRADE_MULTICALL2 } from './steps/upgrade/upgrade-multicall2'
import { UPGRADE_NFT_POSITION_DESCRIPTOR_V1_3_0 } from './steps/upgrade/upgrade-nft-position-descriptor-v1_3_0'
import { UPGRADE_NONFUNGIBLE_POSITION_MANAGER } from './steps/upgrade/upgrade-nonfungible-position-manager'
import { UPGRADE_TICK_LENS } from './steps/upgrade/upgrade-tick-lens'
import { UPGRADE_CORE_FACTORY } from './steps/upgrade/upgrade-core-factory'
import { UPGRADE_SWAP_ROUTER_02 } from './steps/upgrade/upgrade-swap-router'
import { UPGRADE_QUOTER } from './steps/upgrade/upgrade-quote'

const MIGRATION_STEPS: MigrationStep[] = [
  // must come first, for address calculations
  DEPLOY_PROXY_ADMIN,
  // DEPLOY_POOL_IMPLEMENTATION,
  // DEPLOY_CORE_FACTORY,
  // ADD_1BP_FEE_TIER,
  DEPLOY_MULTICALL2,
  // DEPLOY_TICK_LENS,
  // DEPLOY_NFT_DESCRIPTOR_LIBRARY_V1_3_0,
  // DEPLOY_NFT_POSITION_DESCRIPTOR_V1_3_0,
  // DEPLOY_NONFUNGIBLE_POSITION_MANAGER,
  // TRANSFER_CORE_FACTORY_OWNER,
  // DEPLOY_QUOTER,
  // DEPLOY_SWAP_ROUTER_02,
  // TRANSFER_PROXY_ADMIN,
]

const MIGRATION_UPGRADE_STEPS: MigrationStep[] = [
  // must come first, for address calculations
  UPGRADE_MULTICALL2,
  // UPGRADE_NFT_POSITION_DESCRIPTOR_V1_3_0,
  // UPGRADE_NONFUNGIBLE_POSITION_MANAGER,
  // UPGRADE_TICK_LENS,
  // UPGRADE_CORE_FACTORY,
  // UPGRADE_SWAP_ROUTER_02,
  // UPGRADE_QUOTER,
]

export default function deploy({
  signer,
  gasPrice: numberGasPrice,
  upgradeParam,
  initialState,
  onStateChange,
  weth9Address,
  nativeCurrencyLabelBytes,
  ownerAddress,
}: {
  signer: Signer
  gasPrice: number | undefined
  weth9Address: string
  nativeCurrencyLabelBytes: string
  ownerAddress: string
  upgradeParam: boolean
  initialState: MigrationState
  onStateChange: (newState: MigrationState) => Promise<void>
}): AsyncGenerator<StepOutput[], void, void> {
  const gasPrice =
    typeof numberGasPrice === 'number' ? BigNumber.from(numberGasPrice).mul(BigNumber.from(10).pow(9)) : undefined // convert to wei

  return migrate({
    steps: upgradeParam ? MIGRATION_UPGRADE_STEPS : MIGRATION_STEPS,
    config: { gasPrice, signer, weth9Address, nativeCurrencyLabelBytes, ownerAddress },
    initialState,
    onStateChange,
  })
}
