import express from "express";
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriends,
    checkFriendStatus
} from "../controllers/friend.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/request", isAuthenticated, sendFriendRequest);
router.post("/accept", isAuthenticated, acceptFriendRequest);
router.post("/reject", isAuthenticated, rejectFriendRequest);
router.get("/requests", isAuthenticated, getFriendRequests);
router.get("/list", isAuthenticated, getFriends);
router.get("/status/:targetUserId", isAuthenticated, checkFriendStatus);

export default router;
