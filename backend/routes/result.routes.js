import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getInduvisualREasult,
  getReasultByQUizeId,
  submitQuiz,
} from "../controllers/result.controller.js";
const reasultRoute = express.Router();

reasultRoute.post("/reasult/submite", isAuthenticated, submitQuiz);
reasultRoute.get("/get/allReasult", isAuthenticated, getReasultByQUizeId);
reasultRoute.get("/get/reasult/student", isAuthenticated, getInduvisualREasult);
export default reasultRoute;
