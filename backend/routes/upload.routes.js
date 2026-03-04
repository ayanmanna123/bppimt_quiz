import express from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post("/", upload.single("file"), uploadFile);

export default router;
