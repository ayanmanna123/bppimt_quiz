import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        originalFileName: {
            type: String,
        },
        comments: {
            type: String
        }
    },
    { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
