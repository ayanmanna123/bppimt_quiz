import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    updateDatingProfile,
    getDiscoveryUsers,
    handleSwipe,
    getMyMatches,
    getLikesSentToMe,
    getAllCollegeMatches
} from "../controllers/dating.controller.js";

const router = express.Router();

router.use(isAuthenticated); // All dating routes require authentication

router.put("/profile", updateDatingProfile);
router.get("/discovery", getDiscoveryUsers);
router.post("/swipe", handleSwipe);
router.get("/matches", getMyMatches);
router.get("/likes", getLikesSentToMe);
router.get("/all-matches", getAllCollegeMatches);

export default router;
