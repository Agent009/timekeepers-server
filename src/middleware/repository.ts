import { Document, Model } from "mongoose";

/**
 * Creates a new document for the given model.
 *
 * @param {Model<unknown>} model - The Mongoose model to use.
 * @param {object} data - The data to create a document with.
 * @returns {Promise<unknown>}
 */
export function create<T extends Document>(model: Model<T>, data: Partial<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const instance = new model(data); // Create an instance of the model with the data

    // @ts-expect-error ignore
    instance.save((err, savedDocument) => {
      // Save the instance
      if (err) {
        reject(err);
      } else {
        resolve(savedDocument);
      }
    });
  });
}
