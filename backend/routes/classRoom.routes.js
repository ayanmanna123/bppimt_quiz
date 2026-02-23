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
  generateQrCodeToken,
  giveQrAttendance,
  checkQrStatus,
  stopQrAttendance,
  updateTimeSlots,
  enrollFace,
} from "../controllers/clasRoom.controller.js";

const classroomRoute = express.Router();

classroomRoute.post("/give-attandance", isAuthenticated, giveAttandance);
classroomRoute.post("/enroll-face", isAuthenticated, enrollFace);
classroomRoute.get("/get-subject/:subjectId", isAuthenticated, getAttandance);
classroomRoute.get("/total-attandance", isAuthenticated, getAttandanceforStudent)
classroomRoute.post("/give-attandance-manuly", isAuthenticated, markManualAttendance)

// OTP Routes
classroomRoute.post("/generate-otp", isAuthenticated, generateOtp);
classroomRoute.post("/give-attandance-otp", isAuthenticated, giveOtpAttendance);
classroomRoute.get("/check-otp-status/:subjectId", isAuthenticated, checkActiveOtp);

// QR Routes
classroomRoute.post("/generate-qr", isAuthenticated, generateQrCodeToken);
classroomRoute.post("/give-attandance-qr", isAuthenticated, giveQrAttendance);
classroomRoute.get("/check-qr-status/:subjectId", isAuthenticated, checkQrStatus);
classroomRoute.post("/stop-qr/:subjectId", isAuthenticated, stopQrAttendance);

classroomRoute.put("/update-time-slots/:subjectId", isAuthenticated, updateTimeSlots);

export default classroomRoute;
