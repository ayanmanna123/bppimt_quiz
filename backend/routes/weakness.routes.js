import express from "express";
import {
    saveWeaknessResult,
    getWeaknessHistory
} from "../controllers/weakness.controller.js";

import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// All routes here should be protected by Auth0
router.post("/save-weakness-result", isAuthenticated, saveWeaknessResult);
router.get("/get-weakness-history", isAuthenticated, getWeaknessHistory);

export default router;
