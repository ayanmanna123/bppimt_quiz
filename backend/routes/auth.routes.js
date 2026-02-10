import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  creatuser,
  getallstudent,
  getallteacher,
  getUserByEmail,
  sendCode,
  updatesem,
  verifycode,
} from "../controllers/auth.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const userrouter = express.Router();

userrouter.post("/createuser", isAuthenticated, creatuser);
userrouter.put("/updateuser", isAuthenticated, singleUpload, updatesem);

userrouter.get("/:email", isAuthenticated, getUserByEmail);
userrouter.get("/teacher/all", getallteacher);
userrouter.get("/student/count", getallstudent);
userrouter.post("/send-code", sendCode)
userrouter.post("/verify-code", isAuthenticated, verifycode)
export default userrouter;
