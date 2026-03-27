import mongoose from "mongoose";

const notificationSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fcmToken: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const NotificationSubscription = mongoose.model(
    "NotificationSubscription",
    notificationSubscriptionSchema
);

export default NotificationSubscription;
