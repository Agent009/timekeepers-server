import { StoryClient } from "@story-protocol/core-sdk";
import { zeroAddress } from "viem";
import { config } from "@story-scripts/utils";

const main = async function () {
  // 1. Set up your Story Config
  //
  // Docs: https://docs.story.foundation/docs/typescript-sdk-setup
  const client = StoryClient.newClient(config);

  // 2. Create a new SPG NFT collection
  //
  // NOTE: Use this code to create a new SPG NFT collection. You can then use the
  // `newCollection.nftContract` address as the `nftContract` argument in
  // functions like `mintAndRegisterIpAssetWithPilTerms` in the `metadataExample.ts` file.
  //
  // You will mostly only have to do this once. Once you get your nft contract address,
  // you can use it in SPG functions.
  //
  const newCollection = await client.nftClient.createNFTCollection({
    name: "Timekeepers Epochs - World News",
    symbol: "TKE-WN",
    isPublicMinting: false,
    mintOpen: true,
    mintFeeRecipient: zeroAddress,
    contractURI: "",
    txOptions: { waitForTransaction: true },
  });

  console.log(
    `New SPG NFT collection created at transaction hash ${newCollection.txHash}`,
    `NFT contract address: ${newCollection.spgNftContract}`,
  );
  console.log("createSpgNftCollection -> newCollection", newCollection);
};

main();
