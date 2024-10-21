import mongoose from "mongoose";
import { constants } from "@lib/constants";

if (!constants.db.mongodbUri) {
  throw new Error("Add MONGODB_URI to .env / .env.local");
}

const options = { appName: constants.app.name };
// Track the connection state to avoid unnecessary reconnects
const isDevelopment = constants.env.devOrLocal;
// @ts-expect-error ignore
let isConnected = (isDevelopment && global._mongooseConnection) || false;
console.log("mongodb -> isDevelopment", isDevelopment, "isConnected", isConnected);

export const connectDB = async () => {
  // If already connected, resolve immediately
  if (isConnected) {
    return Promise.resolve(true);
  }

  try {
    const { connection } = await mongoose.connect(constants.db.mongodbUri as string, options);

    if (connection.readyState === 1) {
      isConnected = true;

      // Cache the connection globally in development
      if (isDevelopment) {
        // @ts-expect-error ignore
        global._mongooseConnection = isConnected;
      }

      console.log("mongodb -> connected!");
      return Promise.resolve(true);
    }

    console.log("mongodb -> connection state:", connection.readyState);
    return Promise.reject("Error connecting to MongoDB");
  } catch (error) {
    console.error("mongodb -> connection error:", error);
    return Promise.reject(error);
  }
};
