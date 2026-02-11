import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String, // Storing as string "HH:mm" for simplicity, or could be part of Date
        required: true,
    },
    duration: {
        type: Number, // in minutes
        required: true,
    },
    meetingLink: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
