import { createOpenAI } from "@ai-sdk/openai";
import mongoose from "mongoose";
import { constants } from "@lib/constants";

/**
 * Get the server URL, either the base URL or with the provided location appended at the end.
 * @param {string} location The location to append at the end of the base URL.
 * @param {boolean} slashSuffix TRUE if we want to suffix the "/" to the end of the URL.
 * @returns {string}
 */
export const getServerUrl = (location: string, slashSuffix: boolean = true): string =>
  location?.length
    ? constants.tks.url + "/" + location + (slashSuffix ? "/" : "")
    : constants.tks.url + (slashSuffix ? "/" : "");

/**
 * TRUE if the provided parameter is a non-null object
 * @param {any} object The object to check.
 * @returns {boolean}
 */
export const isObject = (object: unknown): boolean => typeof object === "object" && object !== null;

/**
 * TRUE if the provided parameter is a Mongoose Document.
 * @param {any} object The object to check. * @returns {boolean}
 */
export const isMongooseDocument = (object: unknown): boolean => object instanceof mongoose.Document;

export const initializeOpenAI = () => {
  return createOpenAI({
    baseURL: constants.integrations.openAI.useLocal ? constants.integrations.openAI.localBaseURL : undefined,
    apiKey: constants.integrations.openAI.apiKey,
    compatibility: "strict", // strict mode, enable when using the OpenAI API
  });
};
