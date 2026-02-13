import mongoose from "mongoose";

const studyRoomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isPrivate: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const StudyRoom = mongoose.model("StudyRoom", studyRoomSchema);
export default StudyRoom;
