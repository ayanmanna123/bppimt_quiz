import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createQuestion,
  deletQuiz,
  getquizBysubjectId,
  getQuizeByQuizeId,
  getQuizeBySubJectId,
  getQuizeByTeacherId,
  getquizlength,
  getAllQuestionsBySubject,
  updateQuiz,
} from "../controllers/quiz.controller.js";

const quizeRoute = express.Router();

quizeRoute.post("/creatquiz/:subjectId", isAuthenticated, createQuestion);
quizeRoute.get("/quiz/subject/:subjectId", isAuthenticated, getQuizeBySubJectId);
quizeRoute.get("/quiz/teacher", isAuthenticated, getQuizeByTeacherId);
quizeRoute.delete("/delet/quiz", isAuthenticated, deletQuiz);
quizeRoute.get("/getquizId/:quizId", isAuthenticated, getQuizeByQuizeId)
quizeRoute.get("/getSubjectId/:subjectId", isAuthenticated, getquizBysubjectId)
quizeRoute.get("/questions/all/:subjectId", isAuthenticated, getAllQuestionsBySubject);
quizeRoute.put("/update/:quizId", isAuthenticated, updateQuiz);
quizeRoute.get("/quiz/count", getquizlength)
export default quizeRoute;
