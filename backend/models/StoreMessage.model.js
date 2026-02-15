import mongoose from "mongoose";

const storeMessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StoreConversation",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            trim: true,
            default: ""
        },
        attachments: [
            {
                url: { type: String, required: true },
                type: { type: String, enum: ['image', 'video', 'file', 'audio'], default: 'image' },
                publicId: { type: String }
            }
        ],
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StoreMessage",
            default: null,
        },
        reactions: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                emoji: String,
            }
        ],
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isPinned: {
            type: Boolean,
            default: false,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const StoreMessage = mongoose.model("StoreMessage", storeMessageSchema);
export default StoreMessage;
