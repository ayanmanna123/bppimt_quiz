import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            type: String,
            default: null,
        },
        lastMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat", // Referencing the Chat model where actual messages are stored
        },
        lastMessageTimestamp: {
            type: Date,
            default: Date.now
        },
        unreadCounts: {
            type: Map,
            of: Number, // UserId -> Count
            default: {},
        }
    },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
