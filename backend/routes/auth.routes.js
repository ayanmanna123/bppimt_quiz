import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { creatuser, updatesem } from "../controllers/auth.controller.js";
const userrouter = express.Router();

userrouter.post("/createuser", isAuthenticated, creatuser);
userrouter.put("/updateuser", isAuthenticated, updatesem);
export default userrouter;
