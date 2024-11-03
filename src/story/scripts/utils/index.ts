import { http } from "viem";
import { Account, Address, privateKeyToAccount } from "viem/accounts";
import { StoryConfig } from "@story-protocol/core-sdk";
import { constants } from "@lib/constants";
import { GenerateIpMetadataParam } from "@story-protocol/core-sdk/dist/declarations/src/types/resources/ipAsset";

// Add your private key to your .env file.
const privateKey: Address = `0x${constants.account.walletPrivateKey}`;
export const account: Account = privateKeyToAccount(privateKey);

// This is a pre-configured PIL Flavor: https://docs.story.foundation/docs/pil-flavors
export const NonCommercialSocialRemixingTermsId = "1";

// A NFT contract address that will be used to represent your IP Assets
export const NFTContractAddress: Address = constants.integrations.story.nftContractAddress as Address;
export const SPGNFTContractAddress: Address = constants.integrations.story.spgNftContractAddress as Address;

// Add your rpc provider url to your .env file
// You can select from one of these: https://docs.story.foundation/docs/story-network#-rpcs
export const RPCProviderUrl = constants.integrations.story.rpcProviderUrl;

// The currency used for paying License Tokens or tipping
// This address must be whitelisted by the protocol. You can see the
// currently whitelisted addresses here: https://docs.story.foundation/docs/royalty-module#whitelisted-revenue-tokens
export const CurrencyAddress: Address = constants.integrations.story.currencyAddress as Address;

// Docs: https://docs.story.foundation/docs/deployed-smart-contracts
export const RoyaltyPolicyLAP: Address = "0x28b4F70ffE5ba7A26aEF979226f77Eb57fb9Fdb6";

// Docs: https://docs.story.foundation/docs/typescript-sdk-setup
export const config: StoryConfig = {
  account: account,
  transport: http(RPCProviderUrl),
  chainId: "odyssey",
};

export const sampleIpMetadata: GenerateIpMetadataParam = {
  title: "Timekeepers Epoch IP Asset",
  description: "This is a timekeepers epoch IP asset which represents",
  ipType: "minute epoch",
  attributes: [
    {
      key: "layer",
      value: "World Events",
    },
    {
      key: "seed",
      value: "936",
    },
    {
      key: "prompt",
      value:
        "A collage depicting a false video of an election worker tearing up ballots with a backdrop of Russian flags, a stock market graph showing an upward trend with the Nasdaq logo, astronauts in space suits being assisted at a medical facility, Elon Musk in discussions with world leaders in a formal setting, and a visual representation of the changing relationships between stocks, bonds, gold, and the U.S. dollar, all blended together to illustrate the intersection of technology, finance, and global politics.",
    },
    {
      key: "rarity",
      value: "legendary",
    },
  ],
};

export const sampleNftMetadata = {
  name: "Timekeepers NFT minted for Epoch minute_2024-10-27_23_38_0",
  description:
    "A collage depicting a false video of an election worker tearing up ballots with a backdrop of Russian flags, a stock market graph showing an upward trend with the Nasdaq logo, astronauts in space suits being assisted at a medical facility, Elon Musk in discussions with world leaders in a formal setting, and a visual representation of the changing relationships between stocks, bonds, gold, and the U.S. dollar, all blended together to illustrate the intersection of technology, finance, and global politics.",
  image: "https://ipfs.io/ipfs/QmUYY6w5UiEEhpwWPZ6ca8udrR6gFUQnR5rvWzZQJZxrXm",
};
