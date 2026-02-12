import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        files: [{
            type: String
        }],
        contentType: {
            type: String,
            enum: ['image', 'pdf', 'other']
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;
