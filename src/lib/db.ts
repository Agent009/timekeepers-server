import mongoose from "mongoose";
import { constants } from "@lib/constants";

/**
 * Connect to MongoDB
 * @returns {*} The DB connection
 */
export const connectDB = () => {
  const url = constants.db.mongodbUri || "";

  try {
    mongoose.connect(url);
  } catch (err) {
    // @ts-expect-error ignore
    console.error(`Error connecting to DB: ${err?.message}`);
    process.exit(1);
  }

  const dbConnection = mongoose.connection;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dbConnection.once("open", (_) => {
    console.log(`DB connected: ${url}`);
  });

  dbConnection.on("error", (err) => {
    console.error(`DB connection error: ${err}`);
  });

  dbConnection.on("message", (err) => {
    console.error(`DB connection message: ${err}`);
  });

  return dbConnection;
};
