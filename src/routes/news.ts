import express from "express";
import { createRecord, getRecord, getRecords, updateRecord, deleteRecord } from "@controllers/newsController";

const router = express.Router();
router.post("/", createRecord);
router.get("/:recordId", getRecord);
router.get("/", getRecords);
router.put("/:recordId", updateRecord);
router.delete("/:recordId", deleteRecord);

export default router;
