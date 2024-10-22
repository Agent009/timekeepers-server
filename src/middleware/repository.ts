import { Document, Model, FilterQuery, UpdateQuery } from "mongoose";
import { DatabaseError, UpdateOptions, ValidationError, QueryParams } from "@customTypes/index";
import { isObject } from "@lib/util";

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
      console.error("repository -> create -> unexpected result from save operation ->", savedDocument);
      return null;
    }
  } catch (error: unknown) {
    if (isValidationError(error)) {
      console.error("repository -> create -> validation error ->", error.errors);
      Object.keys(error.errors).forEach((field) => {
        console.error(`${field}: ${error?.errors[field]?.message}`);
      });
    } else if (isDatabaseError(error)) {
      console.error("repository -> create -> database error ->", error.code, error.message);
    } else if (error instanceof Error) {
      console.error("repository -> create -> unexpected error ->", error.message);
    } else {
      console.error("repository -> create -> unknown error ->", error);
    }

    // throw new Error('Failed to create document');
    return null;
  }
};

/**
 * Updates an existing document for the given model.
 *
 * @template T - The type of the document
 * @param {Model<T>} model - The Mongoose model to use
 * @param {FilterQuery<T>} filter - The filter to find the document to update
 * @param {UpdateQuery<T>} updateData - The data to update the document with
 * @param {UpdateOptions} options - Additional options for the update operation
 * @returns {Promise<T | null>} - Returns the updated document or null if not found
 */
export const update = async <T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  updateData: UpdateQuery<T>,
  options: UpdateOptions = {
    new: true,
    runValidators: true,
  },
): Promise<T | null> => {
  try {
    const updatedDocument = await model.findOneAndUpdate(filter, updateData, options);

    if (!updatedDocument && !options.upsert) {
      console.warn("repository -> update -> document not found for filter ->", filter);
    }

    return updatedDocument;
  } catch (error: unknown) {
    if (isValidationError(error)) {
      console.error("repository -> update -> validation error ->", error.errors);
      Object.keys(error.errors).forEach((field) => {
        console.error(`${field}: ${error?.errors[field]?.message}`);
      });
    } else if (isDatabaseError(error)) {
      switch (error.code) {
        case 11000:
          console.error("repository -> update -> database error -> duplicate key error ->", error);
          break;
        default:
          console.error("repository -> update -> database error ->", error.code, error.message);
      }
    } else if (error instanceof Error) {
      console.error("repository -> create -> unexpected error ->", error.message);
    } else {
      console.error("repository -> create -> unknown error ->", error);
    }
    // throw error; // Rethrow to allow handling at a higher level
  }

  return null;
};

/**
 * List all documents for the given model with error handling.
 *
 * @template T - The type of the document
 * @param {Model<T>} model - The Mongoose model to use
 * @param {FilterQuery<T>} filter - The filter to find the documents to fetch
 * @returns {Promise<T[] | null>} - Returns the fetched documents or null if error occurs
 */
export const listAllOrNullOnError = async <T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
): Promise<T[] | null> => {
  try {
    return await find(model, filter);
  } catch (error: unknown) {
    if (isValidationError(error)) {
      console.error("repository -> listAllOrNullOnError -> validation error ->", error.errors);
      Object.keys(error.errors).forEach((field) => {
        console.error(`${field}: ${error?.errors[field]?.message}`);
      });
    } else if (isDatabaseError(error)) {
      console.error("repository -> listAllOrNullOnError -> database error ->", error.code, error.message);
    } else if (error instanceof Error) {
      console.error("repository -> listAllOrNullOnError -> unexpected error ->", error.message);
    } else {
      console.error("repository -> listAllOrNullOnError -> unknown error ->", error);
    }

    return null;
  }
};

/**
 * Find documents for the given model with specified filters and options.
 *
 * @template T - The type of the document
 * @param {Model<T>} model - The Mongoose model to use
 * @param {FilterQuery<T>} filter - The filter to find the documents to fetch
 * @param {ProjectionType<T>} selectFields - The fields to return
 * @param {QueryParams} queryParams - Extra query parameters (limit, sort, skip)
 * @returns {Promise<T[]>} - Returns the fetched documents
 * @throws {Error} - Throws error if the query fails
 */
export const find = async <T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
  selectFields?: string | string[] | null | undefined,
  queryParams: QueryParams = {},
): Promise<T[]> => {
  try {
    // Validate filter is an object
    const safeFilter = isObject(filter) ? filter : {};
    // Build the query
    const query = model.find(safeFilter);

    // Apply select fields if provided
    if (selectFields) {
      query.select<T>(selectFields);
    }

    // Apply query parameters
    if (queryParams.limit && queryParams.limit > 0) {
      query.limit(queryParams.limit);
    }

    if (queryParams.skip && queryParams.skip > 0) {
      query.skip(queryParams.skip);
    }

    if (queryParams.sort) {
      query.sort(queryParams.sort);
    }

    // Execute query
    const results = await query.exec();

    if (!results) {
      console.warn("repository -> find -> no documents found for filter ->", filter);
      return [];
    }

    return results;
  } catch (error: unknown) {
    if (isValidationError(error)) {
      console.error("repository -> find -> validation error:", error.errors);
      Object.keys(error?.errors)?.forEach((field) => {
        console.error(`${field}: ${error?.errors[field]?.message}`);
      });
    } else if (isDatabaseError(error)) {
      console.error("repository -> find -> database error ->", error.code, error.message);
    } else if (error instanceof Error) {
      console.error("repository -> find -> unexpected error ->", error.message);
    } else {
      console.error("repository -> find -> unknown error ->", error);
    }

    throw error; // Rethrow to allow handling at a higher level
  }
};
