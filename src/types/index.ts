export enum EpochType {
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Month = "month",
  Year = "year",
}

export enum NewsCategory {
  General = "general",
  Sports = "sports",
  Science = "science",
  Technology = "technology",
  Entertainment = "entertainment",
}

export interface NewsArticle {
  title: string;
  description: string;
}

// Define a custom error type for validation errors
export interface ValidationError {
  errors: Record<string, { message: string }>;
}

// Define a custom error type for database errors
export interface DatabaseError {
  code: number;
  message: string;
}

// Define a union type for all possible error types
export type CreateError = ValidationError | DatabaseError | Error;

export interface QueryParams {
  limit?: number;
  sort?: Record<string, 1 | -1>;
  skip?: number;
}

export interface UpdateOptions {
  new?: boolean; // Return the modified document rather than the original
  upsert?: boolean; // Create the document if it doesn't exist
  runValidators?: boolean; // Run validators on update
  context?: string; // Query context
}

export type PerformResponse = {
  success: boolean;
  data?: string | null;
  message?: string | null;
};
