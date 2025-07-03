import NonfungibleTokenPositionDescriptor from '../../../artifacts/NonfungibleTokenPositionDescriptor.json'
import createUpgradeContractStep from '../meta/createUpgradeContractStep'

export const UPGRADE_NFT_POSITION_DESCRIPTOR_V1_3_0 = createUpgradeContractStep({
  key: 'nonfungibleTokenPositionDescriptorAddressV1_3_0',
  artifact: NonfungibleTokenPositionDescriptor,
  computeLibraries(state) {
    if (state.nftDescriptorLibraryAddressV1_3_0 === undefined) {
      throw new Error('NFTDescriptor library missing')
    }
    return {
      NFTDescriptor: state.nftDescriptorLibraryAddressV1_3_0,
    }
  },
})
