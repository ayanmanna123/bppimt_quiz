import express from "express";
import admin from "firebase-admin";
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

// Firebase Admin is initialized in notification.util.js
// but we might need it here for some logic if not encapsulated.
// For now, we'll use the utils for sending.
import { sendNotification } from "../utils/notification.util.js";



// Notification CRUD
router.get("/", getUserNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

// Subscribe functionality
router.post("/subscribe", async (req, res) => {
    const { fcmToken, userId: bodyUserId } = req.body;
    let userId = req.auth?.payload?.sub || bodyUserId;

    try {
        if (userId) {
            const user = await User.findOne({ auth0Id: userId });
            if (user) {
                userId = user._id;
            } else {
                return res.status(404).json({ error: "User not found in database." });
            }
        } else {
            return res.status(400).json({ error: "User ID required for subscription" });
        }

        if (!fcmToken) {
            return res.status(400).json({ error: "FCM Token required." });
        }

        // Check if this token is already registered to THIS user
        const existing = await NotificationSubscription.findOne({ fcmToken });

        if (existing) {
            existing.userId = userId;
            await existing.save();
            return res.status(200).json({ message: "Subscription updated." });
        }

        const newSubscription = new NotificationSubscription({
            userId: userId,
            fcmToken: fcmToken
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
        if (userId) {
            const user = await User.findOne({ auth0Id: userId });
            if (user) {
                userId = user._id;
            }
        }

        const result = await sendNotification({
            recipientId: userId,
            message,
            type: "info",
            url: "/"
            // io is not provided here, but sendNotification handles it if missing.
        });

        if (!result) {
            return res.status(500).json({ error: "Failed to send notification via utility." });
        }

        res.status(200).json({ message: "Notification sent successfully." });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ error: "Failed to send notification." });
    }
});

export default router;