import mongoose, { Document } from "mongoose";

export interface TaskType extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  updatedAt: number;
}

export const taskSchema = new mongoose.Schema<TaskType>({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  updatedAt: { type: Number, required: true, default: Date.now },
});

export const TaskModel = mongoose.model("Task", taskSchema);
