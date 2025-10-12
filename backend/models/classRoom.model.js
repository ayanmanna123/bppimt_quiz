import mongoose from "mongoose";

// Attendance sub-schema (for each day)
const attendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  records: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      markedAt: { type: Date, default: Date.now },
    },
  ],
});

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attendance: [attendanceRecordSchema],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    timestamp: { type: Date, default: Date.now },
  },
  timeSlots: [
    {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const ClassRoom = mongoose.model("Classroom", classroomSchema);

export default ClassRoom;
