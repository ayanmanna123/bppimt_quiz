import Notification from "../models/Notification.model.js";
import NotificationSubscription from "../models/NotificationSubscription.model.js";
import admin from "firebase-admin";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Admin initialized successfully from environment variables!");
    } else {
        const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("✅ Firebase Admin initialized successfully from JSON file!");
        } else {
            console.warn("⚠️ Firebase Service Account configuration missing! Push notifications will not work.");
        }
    }
} catch (error) {
    console.error("❌ Error initializing Firebase Admin:", error.message || error);
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
            onModel,
            url // [NEW] Save URL to DB
        });
        await notification.save();

        // 2. Send Real-time Notification via Socket.io
        if (io) {
            // Emitting to the room named after the recipient's User ID
            io.to(recipientId.toString()).emit("newNotification", notification);
        }

        // 3. Send Web Push Notification via Firebase
        const subscriptions = await NotificationSubscription.find({ userId: recipientId });

        if (subscriptions.length > 0) {
            const tokens = subscriptions.map(sub => sub.fcmToken);
            
            const messagePayload = {
                tokens: tokens,
                notification: {
                    title: type === "quiz" && onModel === "Result" ? "Quiz Submission Received" : type === "quiz" ? "New Quiz Available" : type === "subject" ? "New Subject Added" : "New Notification",
                    body: message,
                },
                data: {
                    url: url.toString(),
                    type: type.toString(),
                    relatedId: relatedId ? relatedId.toString() : ""
                },
                webpush: {
                    headers: {
                      Urgency: 'high',
                    },
                    notification: {
                      icon: "/bppimt.svg",
                      badge: "/bppimt.svg",
                      tag: "quiz-notification",
                      renotify: true,
                    },
                    fcmOptions: {
                        link: url.toString()
                    }
                }
            };

            try {
                console.log(`[FCM] Attempting to send multicast to ${tokens.length} tokens.`);
                const response = await admin.messaging().sendEachForMulticast(messagePayload);
                console.log(`[FCM] Success: ${response.successCount}, Failure: ${response.failureCount}`);

                
                if (response.failureCount > 0) {
                    const failedTokens = [];
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            console.error(`Error sending to token ${tokens[idx]}:`, resp.error);
                            // If invalid or unregistered, clean up
                            if (resp.error.code === 'messaging/registration-token-not-registered' || 
                                resp.error.code === 'messaging/invalid-registration-token') {
                                failedTokens.push(tokens[idx]);
                            }
                        }
                    });
                    
                    if (failedTokens.length > 0) {
                        console.log(`Removing ${failedTokens.length} invalid tokens...`);
                        await NotificationSubscription.deleteMany({ fcmToken: { $in: failedTokens } });
                    }
                }
            } catch (error) {
                console.error("Error in Firebase Multicast:", error);
            }
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
