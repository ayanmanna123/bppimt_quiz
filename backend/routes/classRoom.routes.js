import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getAttandance,
  getAttandanceforStudent,
  giveAttandance,
  markManualAttendance,
  generateOtp,
  giveOtpAttendance,
  checkActiveOtp,
  updateTimeSlots,
} from "../controllers/clasRoom.controller.js";

const classroomRoute = express.Router();

classroomRoute.post("/give-attandance", isAuthenticated, giveAttandance);
classroomRoute.get("/get-subject/:subjectId", isAuthenticated, getAttandance);
classroomRoute.get("/total-attandance", isAuthenticated, getAttandanceforStudent)
classroomRoute.post("/give-attandance-manuly", isAuthenticated, markManualAttendance)

// OTP Routes
classroomRoute.post("/generate-otp", isAuthenticated, generateOtp);
classroomRoute.post("/give-attandance-otp", isAuthenticated, giveOtpAttendance);
classroomRoute.get("/check-otp-status/:subjectId", isAuthenticated, checkActiveOtp);
classroomRoute.put("/update-time-slots/:subjectId", isAuthenticated, updateTimeSlots);

export default classroomRoute;
