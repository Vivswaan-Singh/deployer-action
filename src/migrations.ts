import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { GenericMigrationStep } from './migrate'

export type ContractType = { deployer: string, address: string; implementation?: string, lastTxHash: string };

export interface MigrationState {
  readonly coreFactoryAddress?: ContractType
  readonly poolImplementationAddress?: ContractType
  readonly swapRouter02?: ContractType
  readonly nftDescriptorLibraryAddressV1_3_0?: ContractType
  readonly nonfungibleTokenPositionDescriptorAddressV1_3_0?: ContractType
  readonly descriptorProxyAddress?: ContractType
  readonly multicall2Address?: ContractType
  readonly proxyAdminAddress?: ContractType
  readonly quoterV2Address?: ContractType
  readonly quoterAddress?: ContractType
  readonly tickLensAddress?: ContractType
  readonly stakerAddress?: ContractType
  readonly nonfungibleTokenPositionManagerAddress?: ContractType
}

export type StepOutput = { message: string; hash?: string; deployedAddress?: string}

export type MigrationConfig = {
  signer: Signer
  gasPrice: BigNumber | undefined
  weth9Address: string
  nativeCurrencyLabelBytes: string
  ownerAddress: string
}

export type MigrationStep = GenericMigrationStep<MigrationState, MigrationConfig, StepOutput[]>
