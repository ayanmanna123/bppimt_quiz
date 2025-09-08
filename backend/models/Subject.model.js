import mongoose from "mongoose";

const otherTeacherSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accept", "reject"],
      default: "pending",
    },
  },
  { _id: false }  
);

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
    subjectCode: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otherTeachers: [otherTeacherSchema], // array of objects with teacher + status
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
