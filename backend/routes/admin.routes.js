import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  subjectByQuiry,
  unAuthorize,
  verifyed,
} from "../controllers/admin.controller.js";

const adminRoute = express.Router();

adminRoute.get("/subject/:depName", isAuthenticated, subjectByQuiry);
adminRoute.get("/all/unauthorize/user", isAuthenticated, unAuthorize);
adminRoute.put("/veryfy/newUser", isAuthenticated, verifyed);
export default adminRoute;
