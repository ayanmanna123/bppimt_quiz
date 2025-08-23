import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createSubject, updateSubject } from "../controllers/subject.controller.js";
 
const SubjectRoute = express.Router();
 SubjectRoute.post("/creatsubject", isAuthenticated, createSubject)
 SubjectRoute.put("/updatesubject", isAuthenticated, updateSubject)
export default SubjectRoute;
