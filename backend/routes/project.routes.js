import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
import { uploadProject, discoverIdeas, generateGuide, getAllProjects } from "../controllers/project.controller.js";

dotenv.config();

const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
    tokenSigningAlg: "RS256",
});

const router = express.Router();

router.get("/all", getAllProjects);
router.post("/upload", jwtCheck, uploadProject);
router.post("/ideas", jwtCheck, discoverIdeas);
router.post("/guide", jwtCheck, generateGuide);

export default router;
