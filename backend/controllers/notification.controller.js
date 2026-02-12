import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

const getUserId = async (req) => {
    if (req.user && req.user._id) return req.user._id;
    if (req.auth && req.auth.sub) {
        const user = await User.findOne({ auth0Id: req.auth.sub });
        return user ? user._id : null;
    }
    return null;
};

export const getUserNotifications = async (req, res) => {
    try {
        const userId = await getUserId(req);

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
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
