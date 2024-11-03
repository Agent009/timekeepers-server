import { listAllOrNullOnError } from "@middleware/repository";
import { EpochDocument, EpochModel } from "@models/epoch";
import { mintAndRegisterSpg } from "@story/utils";
import { GenerateIpMetadataParam } from "@story-protocol/core-sdk/dist/declarations/src/types/resources/ipAsset";
import { EpochRarity, EpochState, EpochType } from "@customTypes/index";

/**
 * Mint NFTs for epochs that have been generated.
 */
export const mintNFTs = async () => {
  let message;
  let timer = new Date().getTime();
  console.log("tasks -> nftTasks -> mintNFTs -> starting...");
  const epochs = await listAllOrNullOnError<EpochDocument>(EpochModel, {
    state: { $eq: EpochState.Past },
    image: { $ne: null },
    nft: { $eq: null },
  });

  if (!epochs || !epochs.length) {
    message = "No epochs require minting.";
    console.log("tasks -> nftTasks -> mintNFTs ->", message);
    return message;
  }

  const total = epochs.length;
  console.log(`tasks -> nftTasks -> mintNFTs -> found ${total} epochs to mint.`);
  let minted = 0;

  for (const epoch of epochs) {
    const ipMetadata: GenerateIpMetadataParam = {
      title: `${epoch.type} ${epoch.value} (${epoch.rarity}) - ${epoch.ymdhmDate} - Timekeepers Epoch IP Asset`,
      description: `This is a timekeepers epoch IP asset which represents a ${epoch.type} epoch with a value of ${epoch.value} for the date: ${epoch.ymdhmDate}.`,
      ipType: `${epoch.type} epoch`,
      attributes: [
        {
          key: "layer",
          value: "World Events",
        },
        {
          key: "type",
          value: epoch.type || EpochType.Minute,
        },
        {
          key: "value",
          value: epoch.value || 0,
        },
        {
          key: "seed",
          value: epoch.seed || 0,
        },
        {
          key: "prompt",
          value: epoch.prompt || "",
        },
        {
          key: "rarity",
          value: epoch.rarity || EpochRarity.Common,
        },
        {
          key: "isoDate",
          value: epoch.isoDate || "",
        },
      ],
    };
    const nftMetadata = {
      name: `Epoch ${epoch.type}_${epoch.ymdhmDate} NFT - World News - Timekeepers`,
      description: "An epoch NFT minted for the World News layer of Timekeepers",
      type: epoch.type,
      value: epoch.value,
      rarity: epoch.rarity,
      isoDate: epoch.isoDate,
      ymdhmDate: epoch.ymdhmDate,
      prompt: epoch.prompt,
    };
    const mintResponse = await mintAndRegisterSpg(
      "TK_Minute_2024-10-27_23_38_0 - NFT IP Metadata",
      ipMetadata,
      nftMetadata,
    );

    if (mintResponse && mintResponse.ipId) {
      epoch.updateOne({ nft: `https://odyssey.explorer.story.foundation/ipa/${mintResponse.ipId}` });
    }

    minted++;
  }

  timer = new Date().getTime() - timer;
  message = `NFT minting completed (${timer} ms). Minted ${minted} epochs.`;
  console.log("tasks -> nftTasks -> mintNFTs ->", message);
  return message;
};
