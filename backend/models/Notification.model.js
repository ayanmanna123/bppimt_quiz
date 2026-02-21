import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: ["info", "warning", "error", "success", "chat", "assignment", "quiz", "subject", "note", "match"],
            default: "info",
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            // Dynamic reference could be complex, so we might just store the ID
            // or rely on 'onModel' if we want population.
            refPath: 'onModel'
        },
        onModel: {
            type: String,
            required: false,
            enum: ['Subject', 'Quiz', 'User', 'Note', 'Assignment', 'Chat', 'Result', 'Match']
        },
        url: {
            type: String, // [NEW] Added for deep linking and matching
            required: false
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
