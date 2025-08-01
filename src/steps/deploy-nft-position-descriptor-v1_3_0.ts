import NonfungibleTokenPositionDescriptor from '../../artifacts/NonfungibleTokenPositionDescriptor.json'
import createDeployUpgradeableContractStep from './meta/createDeployUpgradeableContractStep'

export const DEPLOY_NFT_POSITION_DESCRIPTOR_V1_3_0 = createDeployUpgradeableContractStep({
  key: 'nonfungibleTokenPositionDescriptorAddressV1_3_0',
  artifact: NonfungibleTokenPositionDescriptor,
  computeLibraries(state) {
    if (state.nftDescriptorLibraryAddressV1_3_0?.address === undefined) {
      throw new Error('NFTDescriptor library missing')
    }
    return {
      NFTDescriptor: state.nftDescriptorLibraryAddressV1_3_0.address,
    }
  },
  computeArguments(_, { weth9Address, nativeCurrencyLabelBytes }) {
    return [weth9Address, nativeCurrencyLabelBytes]
  },
})
