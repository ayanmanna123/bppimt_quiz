import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { creatuser, getUserByEmail, updatesem } from "../controllers/auth.controller.js";
const userrouter = express.Router();

userrouter.post("/createuser", isAuthenticated, creatuser);
userrouter.put("/updateuser", isAuthenticated, updatesem);
userrouter.get("/:email",isAuthenticated,getUserByEmail)
export default userrouter;
