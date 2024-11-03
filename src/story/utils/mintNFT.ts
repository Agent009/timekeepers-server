import { http, createWalletClient, createPublicClient, Address, formatEther } from "viem";
import { odyssey } from "@story-protocol/core-sdk";
import { NFTContractAddress, RPCProviderUrl, account } from "@story/utils";
import { defaultNftContractAbi } from "@story/utils/defaultNftContractAbi";

const baseConfig = {
  chain: odyssey,
  transport: http(RPCProviderUrl),
} as const;
export const publicClient = createPublicClient(baseConfig);
export const walletClient = createWalletClient({
  ...baseConfig,
  account,
});

export async function mintNFT(to: Address, uri: string): Promise<number | undefined> {
  console.log("Minting a new NFT...");

  const { request } = await publicClient.simulateContract({
    address: NFTContractAddress,
    functionName: "mintNFT",
    args: [to, uri],
    abi: defaultNftContractAbi,
  });
  const hash = await walletClient.writeContract(request);
  const { effectiveGasPrice, status, gasUsed, logs } = await publicClient.waitForTransactionReceipt({
    hash,
  });
  const gasPrice = effectiveGasPrice ? formatEther(effectiveGasPrice) : "N/A";
  const gasUsedStr = gasUsed ? gasUsed.toString() : "N/A";
  const totalCost = effectiveGasPrice ? formatEther(effectiveGasPrice * gasUsed) : "N/A";
  console.log("mintNFT -> mintNFT -> status", status, "hash", hash, "logs", logs);
  console.log("mintNFT -> mintNFT -> gas -> price", gasPrice, "used", gasUsedStr, "totalCost", totalCost);

  if (logs && logs[0] !== undefined && logs[0].topics[3]) {
    return parseInt(logs[0].topics[3], 16);
  }

  return 0;
}
