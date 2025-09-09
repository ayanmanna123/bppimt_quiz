import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createSubject, departmentQuiry, getMySubjects, getpendingTeacher, subjectById, teacherCreatedSubject, updateSubject, updateTeacherStatus } from "../controllers/subject.controller.js";
 
const SubjectRoute = express.Router();
 SubjectRoute.post("/creatsubject", isAuthenticated, createSubject)
 SubjectRoute.put("/updatesubject", isAuthenticated, updateSubject)
 SubjectRoute.get("/teacher/subject", isAuthenticated,teacherCreatedSubject )
 SubjectRoute.get("/subject/:id",isAuthenticated,subjectById)
 SubjectRoute.get("/subjectByQuery", isAuthenticated,departmentQuiry)
 SubjectRoute.get("/MySubject",isAuthenticated,getMySubjects)
 SubjectRoute.patch("/updateStatus/:id",isAuthenticated,updateTeacherStatus)
 SubjectRoute.get("/pending/teacher",isAuthenticated,getpendingTeacher)
export default SubjectRoute;
