import { RegisterIpAndMakeDerivativeResponse, RegisterIpResponse, StoryClient } from "@story-protocol/core-sdk";
import { Address, toHex } from "viem";
import { account, config, NFTContractAddress, NonCommercialSocialRemixingTermsId } from "@story/utils";
import { mintNFT } from "@story/utils/mintNFT";

// BEFORE YOU RUN THIS FUNCTION: Make sure to read the README which contains instructions
// for running this "Register Derivative Non-Commercial" example.

const main = async function () {
  // 1. Set up your Story Config
  //
  // Docs: https://docs.story.foundation/docs/typescript-sdk-setup
  const client = StoryClient.newClient(config);

  // 2. Register an IP Asset
  //
  // Docs: https://docs.story.foundation/docs/register-an-nft-as-an-ip-asset
  const tokenId = await mintNFT(account.address, "timekeepers-uri");
  const registeredIpResponse: RegisterIpResponse = await client.ipAsset.register({
    nftContract: NFTContractAddress,
    tokenId: tokenId!,
    // NOTE: The below metadata is not configured properly. It is just to make things simple.
    // See `simpleMintAndRegister.ts` for a proper example.
    ipMetadata: {
      ipMetadataURI: "timekeepers-uri",
      ipMetadataHash: toHex("timekeepers-metadata-hash", { size: 32 }),
      nftMetadataHash: toHex("timekeepers-nft-metadata-hash", { size: 32 }),
      nftMetadataURI: "timekeepers-nft-uri",
    },
    txOptions: { waitForTransaction: true },
  });
  console.log(
    `Root IPA created at transaction hash ${registeredIpResponse.txHash}, IPA ID: ${registeredIpResponse.ipId}`,
  );
  console.log("registerDerivativeNonCommercial -> registeredIpResponse", registeredIpResponse);

  // 3. Register a Derivative IP Asset
  //
  // Docs: https://docs.story.foundation/docs/register-a-derivative#existing-nft-register-ip-and-link-to-existing-parent-ip
  const derivativeTokenId = await mintNFT(account.address, "timekeepers-uri");
  const registeredIpDerivativeResponse: RegisterIpAndMakeDerivativeResponse = await client.ipAsset.registerDerivativeIp(
    {
      nftContract: NFTContractAddress,
      tokenId: derivativeTokenId!,
      derivData: {
        parentIpIds: [registeredIpResponse.ipId as Address],
        licenseTermsIds: [NonCommercialSocialRemixingTermsId],
      },
      // NOTE: The below metadata is not configured properly. It is just to make things simple.
      // See `simpleMintAndRegister.ts` for a proper example.
      ipMetadata: {
        ipMetadataURI: "timekeepers-uri",
        ipMetadataHash: toHex("timekeepers-metadata-hash", { size: 32 }),
        nftMetadataHash: toHex("timekeepers-nft-metadata-hash", { size: 32 }),
        nftMetadataURI: "timekeepers-nft-uri",
      },
      txOptions: { waitForTransaction: true },
    },
  );
  console.log(
    `Derivative IPA created at transaction hash ${registeredIpDerivativeResponse.txHash}, IPA ID: ${registeredIpDerivativeResponse.ipId}`,
  );
  console.log("registerDerivativeNonCommercial -> registeredIpDerivativeResponse", registeredIpDerivativeResponse);
};

main();
