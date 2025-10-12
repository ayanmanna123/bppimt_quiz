import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { giveAttandance } from "../controllers/clasRoom.controller.js";
 

const classroomRoute = express.Router();

classroomRoute.post("/give-attandance", isAuthenticated, giveAttandance);

export default classroomRoute;
