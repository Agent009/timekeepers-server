import fs from "fs";
import path from "path";
import pinataSDK from "@pinata/sdk";
import { constants } from "@lib/constants";

const pinata = new pinataSDK({ pinataJWTKey: constants.integrations.pinata.jwt });

export async function uploadJSONToIPFS(name: string, jsonMetadata: unknown): Promise<string> {
  const { IpfsHash } = await pinata.pinJSONToIPFS(jsonMetadata, { pinataMetadata: { name } });
  console.log("uploadToIpfs -> uploadJSONToIPFS -> IpfsHash", IpfsHash);
  return IpfsHash;
}

export async function uploadFileToIPFS(name: string, filePath: string): Promise<string> {
  // Create a readable stream for the file
  const readableStreamForFile = fs.createReadStream(path.join(__dirname, filePath));
  const options = {
    pinataMetadata: {
      name: name,
    },
  };

  // Upload the file to Pinata
  const { IpfsHash } = await pinata.pinFileToIPFS(readableStreamForFile, options);
  console.log("uploadToIpfs -> uploadFileToIPFS -> IpfsHash", IpfsHash);

  return IpfsHash;
}
