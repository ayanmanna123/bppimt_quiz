import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  creatuser,
  getallstudent,
  getallteacher,
  getUserByEmail,
  updatesem,
} from "../controllers/auth.controller.js";
const userrouter = express.Router();

userrouter.post("/createuser", isAuthenticated, creatuser);
userrouter.put("/updateuser", isAuthenticated, updatesem);
userrouter.get("/:email", isAuthenticated, getUserByEmail);
userrouter.get("/teacher/all", getallteacher);
userrouter.get("/student/count", getallstudent);
export default userrouter;
