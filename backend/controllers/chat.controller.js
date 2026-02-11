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
            .lean();

        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
};

// Helper function to save message (intended for Socket use)
export const saveMessage = async (subjectId, senderId, messageContent, mentions = []) => {
    try {
        let newMessage;

        if (subjectId === "global") {
            newMessage = new Chat({
                isGlobal: true,
                sender: senderId,
                message: messageContent,
                mentions
            });
        } else {
            newMessage = new Chat({
                subjectId,
                sender: senderId,
                message: messageContent,
                mentions
            });
        }

        await newMessage.save();

        // Populate sender details for immediate return to clients
        return await newMessage.populate([{ path: "sender", select: "fullname picture email role" }, { path: "mentions", select: "fullname _id" }]);
    } catch (error) {
        console.error("Error saving message:", error);
        return null;
    }
};
