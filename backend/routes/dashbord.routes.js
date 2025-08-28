import express from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import { dashbordSubject, progressroute, userHighScoreQuizzes, userStreakRoute } from '../controllers/dashbord.controller.js'
 const dashBordRoute =express.Router()
 dashBordRoute.get("/dashbord/data/progress",isAuthenticated,progressroute)
 dashBordRoute.get("/data/subject",isAuthenticated,dashbordSubject)
 dashBordRoute.get("/data/badge",isAuthenticated,userHighScoreQuizzes)
 dashBordRoute.get("/data/streak",isAuthenticated,userStreakRoute)
 export default dashBordRoute