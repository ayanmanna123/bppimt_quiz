import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createQuestion,
  deletQuiz,
  getQuizeByQuizeId,
  getQuizeBySubJectId,
  getQuizeByTeacherId,
} from "../controllers/quiz.controller.js";

const quizeRoute = express.Router();

quizeRoute.post("/creatquiz", isAuthenticated, createQuestion);
quizeRoute.get("/quiz/subject/:subjectId", isAuthenticated, getQuizeBySubJectId);
quizeRoute.get("/quiz/teacher", isAuthenticated, getQuizeByTeacherId);
quizeRoute.delete("/delet/quiz", isAuthenticated, deletQuiz);
quizeRoute.get("/getquizId/:quizId",isAuthenticated,getQuizeByQuizeId)
export default quizeRoute;
