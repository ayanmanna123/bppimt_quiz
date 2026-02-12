import express from "express";
import webpush from "web-push";
import NotificationSubscription from "../models/NotificationSubscription.model.js";

const router = express.Router();

// Configure web-push with VAPID keys
// Note: In a real app, ensure these are loaded from process.env
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error("VAPID keys are missing! Push notifications will not work.");
} else {
    webpush.setVapidDetails(
        "mailto:example@yourdomain.org",
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// Subscribe functionality
router.post("/subscribe", async (req, res) => {
    const subscription = req.body;
    const userId = req.auth?.payload?.sub || req.body.userId; // Use Auth0 ID or passed ID

    // In a real app, you'd associate this with the logged-in user
    // For now, we'll just save it. 
    // Ideally, you should check if this endpoint+keys combination already exists for the user.

    try {
        // Basic check: if we have a userId from auth, try to find existing sub
        // For simplicity, we just save/update based on endpoint which is unique per browser instance usually
        const existing = await NotificationSubscription.findOne({ endpoint: subscription.endpoint });

        if (existing) {
            // Update keys if they changed
            existing.keys = subscription.keys;
            if (userId) existing.userId = userId; // update user association if available
            await existing.save();
            return res.status(200).json({ message: "Subscription updated." });
        }

        // Creating new subscription
        // If no userId is provided (e.g. testing), we might need to handle that. 
        // But schema requires userId. For now, assuming user is logged in or we pass a placeholder.
        // If you are testing without auth, you might need to relax the model's required userId or pass a fake one.

        // Let's assume the frontend sends userId if available or we extract from token
        // If userId is missing, we can't save due to schema. 
        // Let's make it optional in schema or robust here? 
        // Modification: I will check if userId is present.

        if (!userId && !req.body.userId) {
            // if completely anonymous, maybe don't save or save with dummy?
            // For this specific app, let's assume we need a user.
            return res.status(400).json({ error: "User ID required for subscription" });
        }

        const newSubscription = new NotificationSubscription({
            userId: userId || req.body.userId,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
        });

        await newSubscription.save();
        res.status(201).json({ message: "Subscription added." });
    } catch (error) {
        console.error("Error saving subscription:", error);
        res.status(500).json({ error: "Failed to save subscription." });
    }
});

// Route to send a notification (for testing/admin)
router.post("/send", async (req, res) => {
    const { userId, title, message } = req.body;

    try {
        const subscriptions = await NotificationSubscription.find({ userId });

        if (subscriptions.length === 0) {
            return res.status(404).json({ message: "No subscriptions found for this user." });
        }

        const notificationPayload = JSON.stringify({ title, body: message });

        const promises = subscriptions.map((sub) =>
            webpush.sendNotification(sub, notificationPayload).catch((err) => {
                console.error("Error sending notification", err);
                // Optionally remove invalid subscriptions here (e.g., 410 Gone)
                if (err.statusCode === 410) {
                    NotificationSubscription.deleteOne({ _id: sub._id }).exec();
                }
            })
        );

        await Promise.all(promises);
        res.status(200).json({ message: "Notification sent successfully." });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ error: "Failed to send notification." });
    }
});

export default router;
