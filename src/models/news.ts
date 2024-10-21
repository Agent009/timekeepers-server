import dayjs from "dayjs";
import mongoose, { Document } from "mongoose";
import { NewsCategory } from "@customTypes/index";

export interface NewsType extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  categories: NewsCategory[];
  createdAt: string;
  updatedAt: string;
}

export const newsSchema = new mongoose.Schema<NewsType>({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: { type: [String], required: true, default: [NewsCategory.General] },
  // Convert timestamps to ISO 8601 strings for consistency with other data formats.
  createdAt: { type: String, required: true, default: () => dayjs().toISOString() },
  updatedAt: { type: String, required: true, default: () => dayjs().toISOString() },
});

export const NewsModel = mongoose.model("News", newsSchema);
