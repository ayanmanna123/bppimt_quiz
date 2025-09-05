import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  conpareCurrectAnsWrongAns,
  getAllQuizByUserId,
  getInduvisualREasult,
  getReasultByQUizeId,
  submitQuiz,
  veryfiReult,
} from "../controllers/result.controller.js";
const reasultRoute = express.Router();

reasultRoute.post("/reasult/submite", isAuthenticated, submitQuiz);
reasultRoute.get("/get/allReasult/:quizeId", isAuthenticated, getReasultByQUizeId);
reasultRoute.get("/get/reasult/student", isAuthenticated, getInduvisualREasult);
reasultRoute.get("/result/details/:resultId", isAuthenticated,conpareCurrectAnsWrongAns)
reasultRoute.get("/all/quiz/userId",isAuthenticated,getAllQuizByUserId)
reasultRoute.post("/veryfi",isAuthenticated,veryfiReult)
export default reasultRoute;
