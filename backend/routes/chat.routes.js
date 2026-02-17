import express from "express";
import { getChatHistory, togglePinMessage, getPinnedMessages, updateMessage, deleteMessage, getUnseenCount, markMessagesAsRead, getMessageViewers, searchMessages, getLinkPreview, getOnlineUsers, getChatMetadata, muteChat, unmuteChat, getGroupMembers, toggleBlockUser, getConversationDetails } from "../controllers/chat.controller.js";

const router = express.Router();

// Get online users - MUST be before /:subjectId
router.get("/online/all", getOnlineUsers);

// Get chat metadata (last message, unread count)
router.post("/meta", getChatMetadata);

// Get chat history for a subject
router.get("/:subjectId", getChatHistory);

// Get conversation details
router.get("/conversation/:conversationId", getConversationDetails);

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

// Get group members
router.get("/members/:subjectId", getGroupMembers);

// Search messages
router.get("/search/:subjectId", searchMessages);

// Mute chat
router.post("/mute", muteChat);

// Unmute chat
router.post("/unmute", unmuteChat);

// Block user
router.post("/block", toggleBlockUser);

// Get link preview
router.get("/link-preview/metadata", getLinkPreview);



export default router;
