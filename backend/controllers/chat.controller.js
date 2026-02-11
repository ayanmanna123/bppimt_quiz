import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";

// Get chat history for a specific subject
export const getChatHistory = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await Chat.find({ subjectId })
            .sort({ timestamp: -1 }) // Get latest first
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("sender", "fullname picture email role")
            .lean();

        // Reverse to show oldest first in UI (if needed, or handle in frontend)
        // Usually chat UIs want [oldest ... newest] at the bottom.
        // We fetched request latest first for pagination efficiency.
        // Let's reverse them seamlessly for the client.
        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
};

// Helper function to save message (intended for Socket use)
export const saveMessage = async (subjectId, senderId, messageContent) => {
    try {
        const newMessage = new Chat({
            subjectId,
            sender: senderId,
            message: messageContent,
        });

        await newMessage.save();

        // Populate sender details for immediate return to clients
        return await newMessage.populate("sender", "fullname picture email role");
    } catch (error) {
        console.error("Error saving message:", error);
        return null;
    }
};
