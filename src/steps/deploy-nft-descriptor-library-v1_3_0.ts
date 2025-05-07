import NFTDescriptor from '../../artifacts/libraries/NFTDescriptor.json'
import createDeployLibraryStep from './meta/createDeployLibraryStep'

export const DEPLOY_NFT_DESCRIPTOR_LIBRARY_V1_3_0 = createDeployLibraryStep({
  key: 'nftDescriptorLibraryAddressV1_3_0',
  artifact: NFTDescriptor,
})
