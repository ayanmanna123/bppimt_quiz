import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

 const Subject = mongoose.model("Subject", subjectSchema);
 export default Subject
