import mongoose, { Document } from "mongoose";
import { LayerCategory } from "@customTypes/index";

export interface LayerDocument extends Document {
  // _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  categories: LayerCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export const LayerSchema = new mongoose.Schema<LayerDocument>(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    categories: { type: [String], required: true, default: [LayerCategory.General] },
    // createdAt: { type: Date, required: true, default: () => dayjs().toDate() },
    // updatedAt: { type: Date, required: true, default: () => dayjs().toDate() },
  },
  {
    timestamps: true,
  },
);

export const LayerModel = mongoose.model("Layer", LayerSchema);

// Function to bootstrap initial layer records
export const bootstrapInitialLayers = async () => {
  const initialLayers = [
    {
      name: "World Events",
      description: "Epoches relating to global news and world events",
      categories: [LayerCategory.General],
    },
  ];

  for (const layer of initialLayers) {
    try {
      await LayerModel.create(layer);
    } catch (error) {
      console.error(`Error creating layer ${layer.name}:`, error);
    }
  }
};
