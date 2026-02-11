import express from "express";
import { createAssignment, getAssignmentsBySubject, deleteAssignment } from "../controllers/assignment.controller.js";
import { submitHomework, getSubmissions, downloadAllSubmissions } from "../controllers/submission.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createAssignment);
router.route("/subject/:subjectId").get(isAuthenticated, getAssignmentsBySubject);
router.route("/:assignmentId").delete(isAuthenticated, deleteAssignment);

router.route("/submit").post(isAuthenticated, singleUpload, submitHomework);
router.route("/:assignmentId/submissions").get(isAuthenticated, getSubmissions);
router.route("/:assignmentId/download-all").get(downloadAllSubmissions);

export default router;
