import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";

// Get chat history for a specific subject or global chat
export const getChatHistory = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        let query = {};
        if (subjectId === "global") {
            query = { isGlobal: true };
        } else {
            query = { subjectId };
        }

        const messages = await Chat.find(query)
            .sort({ timestamp: -1 }) // Get latest first
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("sender", "fullname picture email role")
            .populate("mentions", "fullname _id")
            .populate({
                path: "replyTo",
                select: "sender message attachments",
                populate: { path: "sender", select: "fullname" }
            })
            .populate("reactions.user", "fullname picture")
            .lean();

        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
};

// Helper function to save message (intended for Socket use)
export const saveMessage = async (subjectId, senderId, messageContent, mentions = [], replyTo = null, attachments = []) => {
    try {
        let newMessage;
        const chatData = {
            sender: senderId,
            message: messageContent,
            mentions,
            replyTo,
            attachments
        };

        if (subjectId === "global") {
            chatData.isGlobal = true;
        } else {
            chatData.subjectId = subjectId;
        }

        newMessage = new Chat(chatData);
        await newMessage.save();

        // Populate details for immediate return to clients
        return await newMessage.populate([
            { path: "sender", select: "fullname picture email role" },
            { path: "mentions", select: "fullname _id" },
            {
                path: "replyTo",
                select: "sender message attachments",
                populate: { path: "sender", select: "fullname" }
            }
        ]);
    } catch (error) {
        console.error("Error saving message:", error);
        return null;
    }
};

export const addReaction = async (messageId, userId, emoji) => {
    try {
        const chat = await Chat.findById(messageId);
        if (!chat) return null;

        // Check if user already reacted with this emoji
        const existingReaction = chat.reactions.find(r => r.user.toString() === userId && r.emoji === emoji);
        if (existingReaction) return chat;

        // Remove any other reaction by this user if you want single reaction restriction, 
        // OR let them have multiple. Let's filter out previous reaction by same user to limit to 1 per user for now, or just push.
        // Let's allow one reaction per user for simplicity (like Slack main reaction, or replace it)
        // Actually, usually users can react with multiple DIFFERENT emojis.
        // But if they react with SAME emoji, it's a toggle.

        // Remove existing reaction if it matches (toggle behavior handled in frontend usually, but here we just add)
        // If we want to replace the user's reaction completely (single reaction per user):
        // chat.reactions = chat.reactions.filter(r => r.user.toString() !== userId);

        // If we want to allow multiple emojis but not duplicates:
        if (!chat.reactions.some(r => r.user.toString() === userId && r.emoji === emoji)) {
            chat.reactions.push({ user: userId, emoji });
        }

        await chat.save();
        return await chat.populate("reactions.user", "fullname picture");
    } catch (error) {
        console.error("Error adding reaction:", error);
        return null;
    }
};

export const removeReaction = async (messageId, userId, emoji) => {
    try {
        const chat = await Chat.findByIdAndUpdate(
            messageId,
            { $pull: { reactions: { user: userId, emoji: emoji } } },
            { new: true }
        ).populate("reactions.user", "fullname picture");
        return chat;
    } catch (error) {
        console.error("Error removing reaction:", error);
        return null;
    }
};
