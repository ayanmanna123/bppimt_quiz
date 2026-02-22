import mongoose from "mongoose";

const swipeSchema = new mongoose.Schema(
    {
        swiper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        swipedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["like", "pass"],
            required: true,
        },
    },
    { timestamps: true }
);

// Index for performance when checking for mutual likes
swipeSchema.index({ swiper: 1, swipedUser: 1, type: 1 });

const Swipe = mongoose.model("Swipe", swipeSchema);
export default Swipe;
