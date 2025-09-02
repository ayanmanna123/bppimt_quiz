import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    universityNo: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
      default: "student",
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    verified: {
      type: String,
      enum: ["pending", "accept", "reject"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
