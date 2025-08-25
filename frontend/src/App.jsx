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
      path: "/quizedetails/:subjectId",
      element: <AllQuiz />,
    },
    {
      path: "/quiz/page/:quizId",
      element: <GiveQuiz />,
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
      element:<AdmineReacult/>,
    },
  ]);

  return (
    <>
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
