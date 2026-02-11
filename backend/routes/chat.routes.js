import express from "express";
import { getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();

// Get chat history for a subject
router.get("/:subjectId", getChatHistory);

export default router;
