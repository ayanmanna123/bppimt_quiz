import express from "express";
import {
    createRoom,
    getAllRooms,
    joinRoom,
    getRoomDetails,
    deleteRoom
} from "../controllers/studyRoom.controller.js";

const studyRoomRoute = express.Router();

studyRoomRoute.post("/create", createRoom);
studyRoomRoute.get("/all", getAllRooms);
studyRoomRoute.get("/:roomId", getRoomDetails);
studyRoomRoute.post("/join/:roomId", joinRoom);
studyRoomRoute.delete("/:roomId", deleteRoom);

export default studyRoomRoute;
