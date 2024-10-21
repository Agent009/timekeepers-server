import mongoose from "mongoose";

export interface Task {
  _id: mongoose.Types.ObjectId;
  name: string;
  updatedAt: number;
}

export const taskSchema = new mongoose.Schema<Task>({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  updatedAt: { type: Number, required: true, default: Date.now },
});

export const Task = mongoose.model("Task", taskSchema);
