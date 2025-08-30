import { useState } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/pages/Home";
import Complete from "./components/Complete";
import Quiz from "./components/pages/Quiz";
import QuizDEtails from "./components/AllQuiz";
import GiveQuiz from "./components/pages/GiveQuiz";
import AllQuiz from "./components/AllQuiz";
import Reasult from "./components/pages/Reasult";
import ReasultDetails from "./components/pages/ReasultDetails";
import Subject from "./components/admin/Subject";
import CreateQuize from "./components/admin/CreateQuize";
import TeacherCreateQuiz from "./components/admin/TeacherCreateQuiz";
import AdmineReacult from "./components/admin/AdmineReacult";
import CreateSubject from "./components/admin/CreateSubject";
import Profile from "./components/Profile";
import SubjectRelatedQuiz from "./components/admin/SubjectRelatedQuiz";
import FullScreen from "./components/FullScreen";
import Dashboard from "./components/pages/Dashboard";

function App() {
  const approute = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/complete/profile",
      element: <Complete />,
    },
    {
      path: "/quiz",
      element: <Quiz />,
    },
     {
      path: "/dashbord",
      element:<Dashboard/>,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/quizedetails/:subjectId",
      element: <AllQuiz />,
    },
    {
      path: "/quiz/page/:quizId",
      element: <FullScreen />,
    },
    {
      path: "/reasult",
      element: <Reasult />,
    },
    {
      path: "/reasult/details/:resultId",
      element: <ReasultDetails />,
    },
    //admin panel
    {
      path: "/Admin/subject",
      element: <Subject />,
    },
    {
      path: "/admin/createQuize/:subjectId",
      element: <CreateQuize />,
    },
    {
      path: "/admin/allquiz",
      element: <TeacherCreateQuiz />,
    },
    {
      path: "/admin/reasult/:quizeId",
      element: <AdmineReacult />,
    },
    {
      path: "/admin/create/subject",
      element: <CreateSubject />,
    },
    {
      path: "/Admin/subject/quiz/:subjectId",
      element: <SubjectRelatedQuiz />,
    },
  ]);

  return (
    <>
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
