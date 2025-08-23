import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createSubject, departmentQuiry, subjectById, teacherCreatedSubject, updateSubject } from "../controllers/subject.controller.js";
 
const SubjectRoute = express.Router();
 SubjectRoute.post("/creatsubject", isAuthenticated, createSubject)
 SubjectRoute.put("/updatesubject", isAuthenticated, updateSubject)
 SubjectRoute.get("/teacher/subject", isAuthenticated,teacherCreatedSubject )
 SubjectRoute.get("/subject/:id",isAuthenticated,subjectById)
 SubjectRoute.get("/subjectByQuery", isAuthenticated,departmentQuiry)
export default SubjectRoute;
