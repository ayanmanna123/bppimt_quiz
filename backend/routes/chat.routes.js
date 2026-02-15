import express from "express";
import { getChatHistory, togglePinMessage, getPinnedMessages, updateMessage, deleteMessage, getUnseenCount, markMessagesAsRead, getMessageViewers, searchMessages, getLinkPreview, getOnlineUsers, getChatMetadata } from "../controllers/chat.controller.js";

const router = express.Router();

// Get online users - MUST be before /:subjectId
router.get("/online/all", getOnlineUsers);

// Get chat metadata (last message, unread count)
router.post("/meta", getChatMetadata);

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

// Get message viewers
router.get("/viewers/:messageId", getMessageViewers);

// Search messages
router.get("/search/:subjectId", searchMessages);

// Get link preview
router.get("/link-preview/metadata", getLinkPreview);



export default router;
