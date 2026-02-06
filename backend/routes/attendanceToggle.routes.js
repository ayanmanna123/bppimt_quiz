import express from "express";
import {
    toggleAttendanceRequests,
    giveAttendanceByToggle,
    getAttendanceStatus
} from "../controllers/attendanceToggle.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Teacher toggles attendance ON/OFF
router.post("/toggle", isAuthenticated, toggleAttendanceRequests);

// Student marks attendance (requires toggle to be ON + Proximity)
router.post("/mark", isAuthenticated, giveAttendanceByToggle);

// Get Status (for polling or initial check)
router.get("/status/:subjectId", isAuthenticated, getAttendanceStatus);

export default router;
