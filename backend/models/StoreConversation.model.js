import mongoose from "mongoose";

const storeConversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        lastMessage: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const StoreConversation = mongoose.model("StoreConversation", storeConversationSchema);
export default StoreConversation;
