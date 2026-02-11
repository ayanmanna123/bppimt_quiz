import express from "express";
import { getChatHistory, togglePinMessage, getPinnedMessages, updateMessage, deleteMessage, getUnseenCount, markMessagesAsRead } from "../controllers/chat.controller.js";

const router = express.Router();

// Get chat history for a subject
router.get("/:subjectId", getChatHistory);

// Toggle Pin
router.put("/pin/:messageId", togglePinMessage);

// Get Pinned Messages
router.get("/pinned/:subjectId", getPinnedMessages);

// Update Message
router.put("/:messageId", updateMessage);

// Delete Message
router.delete("/:messageId", deleteMessage);

// Get unseen count
router.get("/unseen/:userId", getUnseenCount);

// Mark messages as read
router.put("/read/:subjectId", markMessagesAsRead);

export default router;
