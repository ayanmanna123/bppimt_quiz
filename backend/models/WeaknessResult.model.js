import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be string or index
    userAnswer: { type: mongoose.Schema.Types.Mixed },
    isCorrect: { type: Boolean, default: false },
});

const weaknessResultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        topic: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        questions: [questionSchema], // Store the full context of the dynamically generated quiz
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const WeaknessResult = mongoose.model("WeaknessResult", weaknessResultSchema);
export default WeaknessResult;
