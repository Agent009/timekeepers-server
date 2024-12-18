import {
  PayRoyaltyOnBehalfResponse,
  PIL_TYPE,
  RegisterDerivativeResponse,
  RegisterIpAndAttachPilTermsResponse,
  RegisterIpResponse,
  StoryClient,
  TransferToVaultAndSnapshotAndClaimByTokenBatchResponse,
} from "@story-protocol/core-sdk";
import { Address, toHex, zeroAddress } from "viem";
import { account, config, CurrencyAddress, NFTContractAddress, RoyaltyPolicyLAP } from "@story/utils";
import { mintNFT } from "@story/utils/mintNFT";

// BEFORE YOU RUN THIS FUNCTION: Make sure to read the README which contains
// instructions for running this "Register Derivative Commercial" example.

const main = async function () {
  // 1. Set up your Story Config
  //
  // Docs: https://docs.story.foundation/docs/typescript-sdk-setup
  const client = StoryClient.newClient(config);

  // 2. Register an IP Asset
  //
  // Docs: https://docs.story.foundation/docs/register-an-nft-as-an-ip-asset
  const parentTokenId = await mintNFT(account.address, "timekeepers-uri");
  const parentIp: RegisterIpAndAttachPilTermsResponse = await client.ipAsset.registerIpAndAttachPilTerms({
    nftContract: NFTContractAddress,
    tokenId: parentTokenId!,
    pilType: PIL_TYPE.COMMERCIAL_REMIX,
    commercialRevShare: 50, // 50%
    mintingFee: 0,
    currency: CurrencyAddress,
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
    `Root IPA created at transaction hash ${parentIp.txHash}, IPA ID: ${parentIp.ipId}, License Terms ID: ${parentIp.licenseTermsId}`,
  );
  console.log("registerDerivativeCommercial -> parentIp", parentIp);

  // 3. Register another (child) IP Asset
  //
  // Docs: https://docs.story.foundation/docs/register-an-nft-as-an-ip-asset
  const childTokenId = await mintNFT(account.address, "timekeepers-uri");
  const childIp: RegisterIpResponse = await client.ipAsset.register({
    nftContract: NFTContractAddress,
    tokenId: childTokenId!,
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
  console.log(`Derivative IPA created at transaction hash ${childIp.txHash}, IPA ID: ${childIp.ipId}`);
  console.log("registerDerivativeCommercial -> childIp", childIp);

  // 4. Make the Child IP Asset a Derivative of the Parent IP Asset
  //
  // Docs: https://docs.story.foundation/docs/register-a-derivative#existing-child-ip--parent-ip
  const linkDerivativeResponse: RegisterDerivativeResponse = await client.ipAsset.registerDerivative({
    childIpId: childIp.ipId as Address,
    parentIpIds: [parentIp.ipId as Address],
    licenseTermsIds: [parentIp.licenseTermsId as bigint],
    txOptions: { waitForTransaction: true },
  });
  console.log(`Derivative linked at transaction hash ${linkDerivativeResponse.txHash}`);
  console.log("registerDerivativeCommercial -> linkDerivativeResponse", linkDerivativeResponse);

  // 5. Pay Royalty
  // NOTE: You have to approve the RoyaltyModule to spend 2 SUSD on your behalf first. See README for instructions.
  //
  // Docs: https://docs.story.foundation/docs/pay-ipa
  const payRoyalty: PayRoyaltyOnBehalfResponse = await client.royalty.payRoyaltyOnBehalf({
    receiverIpId: childIp.ipId as Address,
    payerIpId: zeroAddress,
    token: CurrencyAddress,
    amount: 2,
    txOptions: { waitForTransaction: true },
  });
  console.log(`Paid royalty at transaction hash ${payRoyalty.txHash}`);
  console.log("registerDerivativeCommercial -> payRoyalty", payRoyalty);

  // 6. Claim Revenue
  //
  // Docs: https://docs.story.foundation/docs/claim-revenue
  const claimRevenue: TransferToVaultAndSnapshotAndClaimByTokenBatchResponse =
    await client.royalty.transferToVaultAndSnapshotAndClaimByTokenBatch({
      ancestorIpId: parentIp.ipId as Address,
      claimer: parentIp.ipId as Address,
      royaltyClaimDetails: [
        {
          childIpId: childIp.ipId as Address,
          royaltyPolicy: RoyaltyPolicyLAP,
          currencyToken: CurrencyAddress,
          amount: 1,
        },
      ],
      txOptions: { waitForTransaction: true },
    });
  console.log(`Claimed revenue: ${claimRevenue.amountsClaimed} at snapshotId ${claimRevenue.snapshotId}`);
  console.log("registerDerivativeCommercial -> claimRevenue", claimRevenue);
};

main();
