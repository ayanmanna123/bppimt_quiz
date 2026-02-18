import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            default: null,
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            default: null,
        },
        isGlobal: {
            type: Boolean,
            default: false,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: function () {
                return this.attachments.length === 0;
            },
            trim: true,
        },
        mentions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
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
        attachments: [
            {
                url: { type: String, required: true },
                type: { type: String, enum: ['image', 'video', 'file', 'audio'], default: 'image' },
                publicId: { type: String }
            }
        ],
        timestamp: {
            type: Date,
            default: Date.now,
        },
        isEncrypted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
