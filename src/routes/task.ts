import express from "express";
import { getRecords, createRecord, deleteRecord } from "@controllers/taskController";

const router = express.Router();
router.post("/", createRecord);
router.get("/", getRecords);
router.delete("/:recordId", deleteRecord);

export default router;
