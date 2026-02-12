import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";
import NotificationSubscription from "../models/NotificationSubscription.model.js";
import axios from "axios";
import webpush from "web-push";

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
export const saveMessage = async (subjectId, senderId, messageContent, mentions = [], replyTo = null, attachments = [], io = null) => {
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
        const populatedMessage = await newMessage.populate([
            { path: "sender", select: "fullname picture email role" },
            { path: "mentions", select: "fullname _id" },
            {
                path: "replyTo",
                select: "sender message attachments",
                populate: { path: "sender", select: "fullname" }
            }
        ]);

        // --- NOTIFICATION LOGIC ---
        try {
            if (!chatData.isGlobal && io) {
                // Fetch Subject to find recipients
                const Subject = (await import("../models/Subject.model.js")).default;
                const subject = await Subject.findById(subjectId);

                if (subject) {
                    let recipientIds = [];

                    // 1. Add Creator
                    if (subject.createdBy.toString() !== senderId.toString()) {
                        recipientIds.push(subject.createdBy);
                    }

                    // 2. Add Other Teachers
                    if (subject.otherTeachers) {
                        subject.otherTeachers.forEach(t => {
                            if (t.teacher.toString() !== senderId.toString()) {
                                recipientIds.push(t.teacher);
                            }
                        });
                    }

                    // 3. Add Students
                    // Find students in that dept/sem
                    // (Optimization: In a huge system, we wouldn't fetch all, but relying on dept/sem is the current design)
                    const students = await User.find({
                        role: "student",
                        department: subject.department,
                        semester: subject.semester,
                        _id: { $ne: senderId }
                    }).select("_id");

                    students.forEach(s => recipientIds.push(s._id));

                    // Deduplicate
                    recipientIds = [...new Set(recipientIds.map(id => id.toString()))];

                    if (recipientIds.length > 0) {
                        const { sendProjectNotification } = await import("../utils/notification.util.js");

                        await sendProjectNotification({
                            recipientIds,
                            senderId,
                            message: `New Message from ${populatedMessage.sender.fullname}`,
                            type: "chat",
                            relatedId: newMessage._id,
                            onModel: "Chat",
                            url: `/dashboard/subject/${subjectId}`,
                            io
                        });
                    }
                }
            } else if (chatData.isGlobal && io) {
                // For Global Chat, maybe only notify mentions? 
                // Notifying ALL users for every global msg is bad practice.
                // Let's stick to mentions for global, or just skip persistent for now.
                if (mentions && mentions.length > 0) {
                    const { sendProjectNotification } = await import("../utils/notification.util.js");
                    await sendProjectNotification({
                        recipientIds: mentions,
                        senderId,
                        message: `You were mentioned by ${populatedMessage.sender.fullname}`,
                        type: "chat",
                        relatedId: newMessage._id,
                        onModel: "Chat",
                        url: '/community-chat',
                        io
                    });
                }
            }
        } catch (notifyError) {
            console.error("Error sending chat notifications:", notifyError);
        }
        // -------------------------------

        return populatedMessage;
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

// Remove a reaction
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

// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.body;

        const chat = await Chat.findById(messageId);
        if (!chat) return res.status(404).json({ message: "Message not found" });

        const user = await User.findById(userId);

        if (chat.sender.toString() !== userId && user?.role !== 'teacher') {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        await Chat.findByIdAndDelete(messageId);

        res.status(200).json({ messageId, message: "Message deleted successfully" });

    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: "Failed to delete message" });
    }
};

// Update a message
export const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId, message } = req.body;

        const chat = await Chat.findById(messageId);
        if (!chat) return res.status(404).json({ message: "Message not found" });

        if (chat.sender.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to edit this message" });
        }

        chat.message = message;
        await chat.save();

        const populatedChat = await chat.populate([
            { path: "sender", select: "fullname picture role" },
            { path: "mentions", select: "fullname _id" },
            {
                path: "replyTo",
                select: "sender message attachments",
                populate: { path: "sender", select: "fullname" }
            }
        ]);

        res.status(200).json(populatedChat);

    } catch (error) {
        console.error("Error updating message:", error);
        res.status(500).json({ message: "Failed to update message" });
    }
};
// Toggle pin status of a message
export const togglePinMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.body; // In real app, get from req.user (Auth middleware)

        const chat = await Chat.findById(messageId);
        if (!chat) return res.status(404).json({ message: "Message not found" });

        // Verify user role (should be teacher or admin)
        // Here we assume the frontend sent the userId and we blindly trust or check DB
        const user = await User.findById(userId);
        if (!user || user.role !== "teacher") { // Strict check: only teachers for now
            // For Admin features, we might need to check if user is admin. 
            // The schema has 'role': enum ['teacher', 'student']. 
            // If there is an 'admin' role, add it here.
            // Based on User model, only 'teacher' and 'student' exist in enum, but let's allow teachers to pin.
            return res.status(403).json({ message: "Unauthorized to pin messages" });
        }

        chat.isPinned = !chat.isPinned;
        await chat.save();

        const populatedChat = await chat.populate("sender", "fullname picture role");

        res.status(200).json(populatedChat);
    } catch (error) {
        console.error("Error toggling pin:", error);
        res.status(500).json({ message: "Failed to toggle pin" });
    }
};

// Get pinned messages for a subject
export const getPinnedMessages = async (req, res) => {
    try {
        const { subjectId } = req.params;
        let query = { isPinned: true };

        if (subjectId === "global") {
            query.isGlobal = true;
        } else {
            query.subjectId = subjectId;
        }

        const pinnedMessages = await Chat.find(query)
            .sort({ timestamp: -1 })
            .populate("sender", "fullname picture role")
            .limit(5); // Limit to 5 pinned messages to avoid clutter

        res.status(200).json(pinnedMessages);
    } catch (error) {
        console.error("Error fetching pinned messages:", error);
        res.status(500).json({ message: "Failed to fetch pinned messages" });
    }
};
// Get unseen message count
export const getUnseenCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const { subjectId } = req.query;

        let query = {
            sender: { $ne: userId },
            readBy: { $ne: userId }
        };

        if (subjectId === "global") {
            query.isGlobal = true;
        } else if (subjectId) {
            query.subjectId = subjectId;
        } else {
            // Default to global if no subject provided, or handle as needed
            // For now let's assume this is for Global Chat specifically if not specified
            query.isGlobal = true;
        }

        const count = await Chat.countDocuments(query);
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching unseen count:", error);
        res.status(500).json({ message: "Failed to fetch unseen count" });
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { userId } = req.body;
        const { subjectId } = req.params;

        let query = {
            sender: { $ne: userId },
            readBy: { $ne: userId }
        };

        if (subjectId === "global") {
            query.isGlobal = true;
        } else {
            query.subjectId = subjectId;
        }

        await Chat.updateMany(
            query,
            { $addToSet: { readBy: userId } }
        );

        // Notify other clients via Socket
        const io = req.app.get("io");
        if (io) {
            io.to(subjectId).emit("messagesRead", { subjectId, userId });
        }

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ message: "Failed to mark messages as read" });
    }
};

// Get viewers of a specific message
export const getMessageViewers = async (req, res) => {
    try {
        const { messageId } = req.params;

        const chat = await Chat.findById(messageId)
            .populate("readBy", "fullname picture email role")
            .lean();

        if (!chat) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json(chat.readBy || []);
    } catch (error) {
        console.error("Error fetching message viewers:", error);
        res.status(500).json({ message: "Failed to fetch message viewers" });
    }
};

// Search messages by text or sender
export const searchMessages = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { query } = req.query;

        if (!query) {
            return res.status(200).json([]);
        }

        let searchQuery = {};
        if (subjectId === "global") {
            searchQuery.isGlobal = true;
        } else {
            searchQuery.subjectId = subjectId;
        }

        // Use regex for case-insensitive search
        const regex = new RegExp(query, "i");

        // Find users matching the query to search by sender name as well
        const matchingUsers = await User.find({ fullname: regex }).select("_id");
        const userIds = matchingUsers.map(u => u._id);

        searchQuery.$or = [
            { message: regex },
            { sender: { $in: userIds } }
        ];

        const results = await Chat.find(searchQuery)
            .sort({ timestamp: -1 })
            .limit(50)
            .populate("sender", "fullname picture role")
            .populate("mentions", "fullname _id")
            .populate({
                path: "replyTo",
                select: "sender message",
                populate: { path: "sender", select: "fullname" }
            });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching messages:", error);
        res.status(500).json({ message: "Failed to search messages" });
    }
};

// Get link preview metadata
export const getLinkPreview = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: "URL is required" });

        // Add protocol if missing
        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            },
            timeout: 5000,
            validateStatus: false
        });

        if (response.status !== 200) {
            return res.status(404).json({ error: "Link not reachable" });
        }

        const html = response.data;
        if (typeof html !== 'string') {
            return res.status(400).json({ error: "Invalid response from link" });
        }

        const metadata = {
            url: targetUrl,
            title: "",
            description: "",
            image: "",
            siteName: ""
        };

        // Extract Title
        const titleMatch = html.match(/<title>(.*?)<\/title>/i) ||
            html.match(/<meta property="og:title" content="(.*?)"/i) ||
            html.match(/<meta name="twitter:title" content="(.*?)"/i);
        metadata.title = titleMatch ? titleMatch[1].trim() : "";

        // Extract Description
        const descMatch = html.match(/<meta name="description" content="(.*?)"/i) ||
            html.match(/<meta property="og:description" content="(.*?)"/i) ||
            html.match(/<meta name="twitter:description" content="(.*?)"/i);
        metadata.description = descMatch ? descMatch[1].trim() : "";

        // Extract Image
        const imgMatch = html.match(/<meta property="og:image" content="(.*?)"/i) ||
            html.match(/<meta name="twitter:image" content="(.*?)"/i) ||
            html.match(/<link rel="image_src" href="(.*?)"/i);
        metadata.image = imgMatch ? imgMatch[1] : "";

        // Extract Site Name
        const siteNameMatch = html.match(/<meta property="og:site_name" content="(.*?)"/i);
        metadata.siteName = siteNameMatch ? siteNameMatch[1] : "";

        res.json(metadata);
    } catch (error) {
        console.error("Link preview failed for URL:", req.query.url, error.message);
        res.status(500).json({ error: "Failed to fetch link preview" });
    }
};

// Get all online users
export const getOnlineUsers = async (req, res) => {
    try {
        const users = await User.find({ isOnline: true })
            .select("fullname picture role _id")
            .lean();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching online users:", error);
        res.status(500).json({ message: "Failed to fetch online users" });
    }
};
