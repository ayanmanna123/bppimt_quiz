import express from "express";
import webpush from "web-push";
import NotificationSubscription from "../models/NotificationSubscription.model.js";
import User from "../models/User.model.js";
import {
    getUserNotifications,
    markAsRead,
    deleteNotification,
    getUnreadCount
} from "../controllers/notification.controller.js";
import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
    tokenSigningAlg: "RS256",
});

// Configure web-push with VAPID keys handled in utility
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys are missing! Push notifications will not work reliably.");
}


// Notification CRUD
router.get("/", jwtCheck, getUserNotifications);
router.get("/unread-count", jwtCheck, getUnreadCount);
router.put("/:id/read", jwtCheck, markAsRead);
router.delete("/:id", jwtCheck, deleteNotification); // This handles /:id and /all

// Subscribe functionality
router.post("/subscribe", jwtCheck, async (req, res) => {
    const subscription = req.body;
    let userId = req.auth?.payload?.sub || req.body.userId;

    try {
        // Resolve Auth0 ID to MongoDB ObjectId
        if (userId) {
            const user = await User.findOne({ auth0Id: userId });
            if (user) {
                userId = user._id; // Use the ObjectId
            } else {
                // If user not found in DB but has Auth0 ID, maybe they haven't completed profile yet?
                // For now, let's error out or handle gracefully.
                return res.status(404).json({ error: "User not found in database." });
            }
        } else {
            return res.status(400).json({ error: "User ID required for subscription" });
        }

        // Basic check: if we have a userId from auth, try to find existing sub
        const existing = await NotificationSubscription.findOne({ endpoint: subscription.endpoint });

        if (existing) {
            // Update keys if they changed
            existing.keys = subscription.keys;
            existing.userId = userId; // Ensure it's associated with the correct user
            await existing.save();
            return res.status(200).json({ message: "Subscription updated." });
        }

        const newSubscription = new NotificationSubscription({
            userId: userId,
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
    let { userId, title, message } = req.body;

    try {
        // Resolve Auth0 ID to MongoDB ObjectId if needed
        if (userId) {
            const user = await User.findOne({ auth0Id: userId });
            if (user) {
                userId = user._id;
            }
            // If not found by Auth0 ID, maybe it's already a Mongo ID? 
            // We'll let the find({}) below handle it or return empty.
        }

        const subscriptions = await NotificationSubscription.find({ userId });

        if (subscriptions.length === 0) {
            return res.status(404).json({ message: "No subscriptions found for this user." });
        }

        const notificationPayload = JSON.stringify({
            title,
            body: message,
            data: { url: '/' }
        });

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