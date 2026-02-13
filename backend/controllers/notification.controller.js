import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

const getUserId = async (req) => {
    if (req.user && req.user._id) return req.user._id;
    if (req.auth && req.auth.payload && req.auth.payload.sub) {
        const user = await User.findOne({ auth0Id: req.auth.payload.sub });
        return user ? user._id : null;
    }
    return null;
};

export const getUserNotifications = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ recipient: userId });

        res.status(200).json({
            notifications,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId) return res.status(404).json({ message: "User not found" });

        const count = await Notification.countDocuments({ recipient: userId, isRead: false });
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = await getUserId(req);

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        if (id === 'all') {
            await Notification.updateMany(
                { recipient: userId, isRead: false },
                { $set: { isRead: true } }
            );
            return res.status(200).json({ message: "All notifications marked as read" });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to update notification" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = await getUserId(req);

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        if (id === 'all') {
            await Notification.deleteMany({ recipient: userId });
            return res.status(200).json({ message: "All notifications deleted" });
        }

        const result = await Notification.deleteOne({ _id: id, recipient: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Notification not found or already deleted" });
        }

        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Failed to delete notification" });
    }
}
