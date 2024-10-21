import { Document, Model } from "mongoose";
import { DatabaseError, ValidationError } from "@customTypes/index";

// Helper function to check if an error is a ValidationError
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidationError = (error: any): error is ValidationError => {
  return error && typeof error === "object" && "errors" in error;
};

// Helper function to check if an error is a DatabaseError
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isDatabaseError = (error: any): error is DatabaseError => {
  return error && typeof error === "object" && "code" in error && "message" in error;
};

/**
 * Creates a new document for the given model.
 * @param model
 * @param data
 */
export const create = async <T extends Document>(model: Model<T>, data: Partial<T>): Promise<T | null> => {
  try {
    const instance = new model(data);
    const savedDocument = await instance.save();

    if (savedDocument && "_id" in savedDocument) {
      return savedDocument;
    } else {
      console.error("repository -> create -> Unexpected result from save operation:", savedDocument);
      return null;
    }
  } catch (error: unknown) {
    if (isValidationError(error)) {
      console.error("repository -> create -> Validation error:", error.errors);
      Object.keys(error.errors).forEach((field) => {
        console.error(`${field}: ${error?.errors[field]?.message}`);
      });
    } else if (isDatabaseError(error)) {
      console.error("repository -> create -> Database error:", error.code, error.message);
    } else if (error instanceof Error) {
      console.error("repository -> create -> Unexpected error:", error.message);
    } else {
      console.error("repository -> create -> Unknown error:", error);
    }

    // throw new Error('Failed to create document');
    return null;
  }
};
