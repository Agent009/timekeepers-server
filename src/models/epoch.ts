import mongoose, { Document, Schema, model } from "mongoose";
import { EpochData } from "@customTypes/index";

export interface EpochDocument extends Document, EpochData {
  // _id: string; // Include _id for Mongoose document
  layerId: mongoose.Types.ObjectId;
}

const EpochSchema = new Schema<EpochDocument>(
  {
    layerId: { type: mongoose.Schema.Types.ObjectId, ref: "Layer", required: true, index: true },
    type: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    isoDate: {
      type: String,
      required: true,
    },
    ymdDate: {
      type: String,
      required: true,
    },
    ymdhmDate: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    seed: {
      type: Number,
      default: 0,
    },
    prompt: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    nft: {
      type: String,
      default: null,
    },
    rarity: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const EpochModel = mongoose.models?.Epoch || model<EpochDocument>("Epoch", EpochSchema);

export async function updateEpochesWithDefaultLayer(defaultLayerId: mongoose.Types.ObjectId) {
  await EpochModel.updateMany({}, { $set: { layerId: defaultLayerId } });
}

export default EpochModel;
