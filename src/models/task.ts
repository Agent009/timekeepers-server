import mongoose, { Document } from "mongoose";

export interface TaskDocument extends Document {
  // _id: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TaskSchema = new mongoose.Schema<TaskDocument>(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    // updatedAt: { type: Number, required: true, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const TaskModel = mongoose.model("Task", TaskSchema);
