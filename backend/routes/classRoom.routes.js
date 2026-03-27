import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getAttandance,
  getAttandanceforStudent,
  generateQrCodeToken,
  giveQrAttendance,
  checkQrStatus,
  stopQrAttendance,
  updateTimeSlots,
  markManualAttendance,
} from "../controllers/clasRoom.controller.js";

const classroomRoute = express.Router();

classroomRoute.get("/get-subject/:subjectId", isAuthenticated, getAttandance);
classroomRoute.get("/total-attandance", isAuthenticated, getAttandanceforStudent)
classroomRoute.post("/give-attandance-manuly", isAuthenticated, markManualAttendance)
// QR Routes
classroomRoute.post("/generate-qr", isAuthenticated, generateQrCodeToken);
classroomRoute.post("/give-attandance-qr", isAuthenticated, giveQrAttendance);
classroomRoute.get("/check-qr-status/:subjectId", isAuthenticated, checkQrStatus);
classroomRoute.post("/stop-qr/:subjectId", isAuthenticated, stopQrAttendance);

classroomRoute.put("/update-time-slots/:subjectId", isAuthenticated, updateTimeSlots);

export default classroomRoute;
