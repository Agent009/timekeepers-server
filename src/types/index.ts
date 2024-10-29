export enum EpochType {
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Month = "month",
  Year = "year",
}

export enum EpochState {
  Past = "past",
  Present = "present",
  Future = "future",
}

export enum EpochStatus {
  Active = "active",
  Queued = "queued",
  Generating = "generating",
  Generated = "generated",
}

export enum EpochRarity {
  Common = "common",
  Rare = "rare",
  Epic = "epic",
  Legendary = "legendary",
}

export interface EpochData {
  type: EpochType;
  value: number;
  isoDate: string; // string in ISO 8601 format
  ymdDate: string; // string in YYYY-MM-DD format
  ymdhmDate: string; // string in YYYY-MM-DD HH:mm format
  state: EpochState;
  status: EpochStatus;
  seed?: number | null;
  prompt?: string | null;
  image?: string | null;
  nft?: string | null;
  rarity?: EpochRarity;
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

export enum LayerCategory {
  General = "general",
  Sports = "sports",
  Science = "science",
  Technology = "technology",
  Entertainment = "entertainment",
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
