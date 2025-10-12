import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getAttandance,
  getAttandanceforStudent,
  giveAttandance,
} from "../controllers/clasRoom.controller.js";

const classroomRoute = express.Router();

classroomRoute.post("/give-attandance", isAuthenticated, giveAttandance);
classroomRoute.get("/get-subject/:subjectId", isAuthenticated, getAttandance);
classroomRoute.get("/total-attandance", isAuthenticated,getAttandanceforStudent )
export default classroomRoute;
