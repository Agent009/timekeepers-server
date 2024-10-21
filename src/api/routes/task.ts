import express from "express";
import { get_tasks, create_task, delete_task } from "@api/controllers/taskController";

const router = express.Router();
router.get("/", get_tasks);
router.post("/", create_task);
router.delete("/:taskId", delete_task);

export default router;
