import express from "express";
import { uploadNote, getNotesBySubject, deleteNote } from "../controllers/note.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Teacher uploads a note
router.route("/upload").post(isAuthenticated, singleUpload, uploadNote);

// Get all notes for a specific subject
router.route("/subject/:subjectId").get(isAuthenticated, getNotesBySubject);

// Delete a note
router.route("/:noteId").delete(isAuthenticated, deleteNote);

export default router;
