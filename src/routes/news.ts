import express from "express";
import {
  fetchAndSaveTopHeadlines,
  createRecord,
  getRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} from "@controllers/newsController";

const router = express.Router();
router.get("/fetch-save/top-headlines", fetchAndSaveTopHeadlines);
router.post("/", createRecord);
router.get("/:recordId", getRecord);
router.get("/", getRecords);
router.put("/:recordId", updateRecord);
router.delete("/:recordId", deleteRecord);

export default router;
