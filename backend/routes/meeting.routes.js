import express from "express";
import { createMeeting, getMeetingsBySubject, deleteMeeting, getUpcomingMeetings } from "../controllers/meeting.controller.js";

const router = express.Router();

// Create a new meeting
router.post("/create", createMeeting);

// Get all meetings for a subject
router.get("/subject/:subjectId", getMeetingsBySubject);

// Get upcoming meetings for student
router.get("/upcoming", getUpcomingMeetings);

// Delete a meeting
router.delete("/:meetingId", deleteMeeting);

export default router;
