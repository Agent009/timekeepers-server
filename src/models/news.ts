import dayjs from "dayjs";
import mongoose, { Document } from "mongoose";
import { NewsCategory } from "@customTypes/index";

export interface NewsDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  categories: NewsCategory[];
  categorised: boolean;
  // Convert timestamps to ISO 8601 strings for consistency with other data formats.
  createdAt: string;
  updatedAt: string;
}

export const NewsSchema = new mongoose.Schema<NewsDocument>({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  categories: { type: [String], required: true, default: [NewsCategory.General] },
  categorised: { type: Boolean, required: false, default: false },
  // Convert timestamps to ISO 8601 strings for consistency with other data formats.
  createdAt: { type: String, required: true, default: () => dayjs().toISOString() },
  updatedAt: { type: String, required: true, default: () => dayjs().toISOString() },
});

export const NewsModel = mongoose.model("News", NewsSchema);
