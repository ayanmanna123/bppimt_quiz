import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["Hardware", "Software", "IoT", "Robotics", "Web", "AI/ML", "Other"],
            default: "Other",
        },
        hardware: [
            {
                type: String,
            },
        ],
        software: [
            {
                type: String,
            },
        ],
        fullGuide: {
            instructions: {
                type: String, // Markdown format
            },
            code: {
                type: String, // Code snippet
            },
            circuit: {
                type: String, // Mermaid or textual description
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Optional for AI generated base ideas
        },
        isAiGenerated: {
            type: Boolean,
            default: false,
        },
        originalRequirements: {
            type: String, // Stores the requirement that generated this project if applicable
        },
        attachments: [
            {
                url: String,
                fileId: String,
                type: { type: String }, // image, pdf, video, doc, etc.
                name: String,
                size: Number
            }
        ],
    },
    { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
