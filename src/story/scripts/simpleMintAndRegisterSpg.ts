import { CreateIpAssetWithPilTermsResponse, IpMetadata, PIL_TYPE, StoryClient } from "@story-protocol/core-sdk";
import { createHash } from "crypto";
import { config, sampleIpMetadata, sampleNftMetadata, SPGNFTContractAddress } from "@story-scripts/utils";
import { uploadJSONToIPFS } from "@story-scripts/utils/uploadToIpfs";

// BEFORE YOU RUN THIS FUNCTION: Make sure to read the README
// which contains instructions for running this "Simple Mint and Register SPG" example.

const main = async function () {
  // 1. Set up your Story Config
  //
  // Docs: https://docs.story.foundation/docs/typescript-sdk-setup
  const client = StoryClient.newClient(config);

  // 2. Set up your IP Metadata
  //
  // Docs: https://docs.story.foundation/docs/ipa-metadata-standard
  const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata(sampleIpMetadata);

  // 3. Set up your NFT Metadata
  //
  // Docs: https://eips.ethereum.org/EIPS/eip-721
  const nftMetadata = sampleNftMetadata;

  // 4. Upload your IP and NFT Metadata to IPFS
  const ipIpfsHash = await uploadJSONToIPFS("TK_Minute_2024-10-27_23_38_0 - NFT IP Metadata", ipMetadata);
  const ipHash = createHash("sha256").update(JSON.stringify(ipMetadata)).digest("hex");
  const nftIpfsHash = await uploadJSONToIPFS("TK_Minute_2024-10-27_23_38_0 - NFT Metadata", nftMetadata);
  const nftHash = createHash("sha256").update(JSON.stringify(nftMetadata)).digest("hex");

  // 5. Register the NFT as an IP Asset
  //
  // Docs: https://docs.story.foundation/docs/attach-terms-to-an-ip-asset#mint-nft-register-as-ip-asset-and-attach-terms
  const response: CreateIpAssetWithPilTermsResponse = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
    spgNftContract: SPGNFTContractAddress,
    pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
    commercialRevShare: 50, // 50%
    ipMetadata: {
      ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
      ipMetadataHash: `0x${ipHash}`,
      nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
      nftMetadataHash: `0x${nftHash}`,
    },
    txOptions: { waitForTransaction: true },
  });
  console.log(`Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`);
  console.log(`View on the explorer: https://odyssey.explorer.story.foundation/ipa/${response.ipId}`);
  console.log("simpleMintAndRegisterSpg -> response", response);
};

main();
