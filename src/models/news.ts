import mongoose, { Document } from "mongoose";
import { NewsCategory } from "@customTypes/index";

export interface NewsDocument extends Document {
  // _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  categories: NewsCategory[];
  categorised: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NewsSchema = new mongoose.Schema<NewsDocument>(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    categories: { type: [String], required: true, default: [NewsCategory.General] },
    categorised: { type: Boolean, required: false, default: false },
    // createdAt: { type: Date, required: true, default: () => dayjs().toDate() },
    // updatedAt: { type: Date, required: true, default: () => dayjs().toDate() },
  },
  {
    timestamps: true,
  },
);

export const NewsModel = mongoose.model("News", NewsSchema);
