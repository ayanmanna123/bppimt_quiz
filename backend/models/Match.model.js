import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
    {
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure users array always has 2 participants
matchSchema.path("users").validate(function (value) {
    return value.length === 2;
}, "A match must have exactly two users.");

const Match = mongoose.model("Match", matchSchema);
export default Match;
