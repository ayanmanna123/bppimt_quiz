import Notification from "../models/Notification.model.js";
import NotificationSubscription from "../models/NotificationSubscription.model.js";
import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        "mailto:example@yourdomain.org",
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn("VAPID keys are missing! Push notifications will not work reliably.");
}


/**
 * Sends a notification to a specific user.
 * 
 * @param {Object} params - The notification parameters.
 * @param {string} params.recipientId - The ID of the user receiving the notification.
 * @param {string} params.senderId - The ID of the user sending the notification (optional).
 * @param {string} params.message - The notification message.
 * @param {string} params.type - The type of notification (e.g., 'info', 'quiz', 'subject').
 * @param {string} params.relatedId - ID of the related entity (optional).
 * @param {string} params.onModel - Model name of the related entity (optional).
 * @param {string} params.url - URL to open when clicking the web push notification (optional).
 * @param {object} io - The Socket.io instance.
 */
export const sendNotification = async ({
    recipientId,
    senderId = null,
    message,
    type = "info",
    relatedId = null,
    onModel = null,
    url = "/",
    io
}) => {
    try {
        // 1. Save to Database
        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            message,
            type,
            relatedId,
            onModel
        });
        await notification.save();

        // 2. Send Real-time Notification via Socket.io
        if (io) {
            // Emitting to the room named after the recipient's User ID
            io.to(recipientId.toString()).emit("newNotification", notification);
        }

        // 3. Send Web Push Notification
        // Find subscriptions for this user
        const subscriptions = await NotificationSubscription.find({ userId: recipientId });

        if (subscriptions.length > 0) {
            const payload = JSON.stringify({
                title: type === "quiz" ? "New Quiz Available" : type === "subject" ? "New Subject Added" : "New Notification",
                body: message,
                icon: "/pwa-192x192.png",
                badge: "/pwa-192x192.png",
                data: {
                    url,
                    type,
                    relatedId
                }
            });

            const promises = subscriptions.map((sub) =>
                webpush.sendNotification(sub, payload).catch(async (err) => {
                    console.error("Error sending push notification:", err);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription has expired or is no longer valid
                        await NotificationSubscription.deleteOne({ _id: sub._id });
                    }
                })
            );

            await Promise.all(promises);
        }


        return notification;

    } catch (error) {
        console.error("Error in sendNotification utility:", error);
        // We don't throw here to avoid failing the main request logic 
        // just because a notification failed.
        return null;
    }
};

/**
 * Sends notifications to multiple users.
 * 
 * @param {Object} params - The notification parameters same as above but with recipientIds array.
 * @param {Array<string>} params.recipientIds - Array of user IDs.
 * @param {object} io - The Socket.io instance.
 * ... other params
 */
export const sendProjectNotification = async ({
    recipientIds,
    senderId = null,
    message,
    type = "info",
    relatedId = null,
    onModel = null,
    url = "/",
    io
}) => {
    // This can be optimized with bulkWrite for DB if needed, 
    // but for now, simple iteration is safer and easier to implement.
    const promises = recipientIds.map(recipientId =>
        sendNotification({
            recipientId,
            senderId,
            message,
            type,
            relatedId,
            onModel,
            url,
            io
        })
    );

    await Promise.all(promises);
};
