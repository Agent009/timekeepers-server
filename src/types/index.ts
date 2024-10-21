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
