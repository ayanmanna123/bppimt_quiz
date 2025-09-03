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
import AboutUs from "./components/pages/AboutUs";
import DepartmentSelector from "./components/admin/admin/DepartmentSelector";
import AdminSubject from "./components/admin/admin/AdminSubject";
import UnAuthorizeUser from "./components/admin/admin/UnAuthorizeUser";
import ProtectedRoute from "./components/pages/ProtectedRoute";
import NotFound from "./components/pages/NotFound ";

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
      element: <Dashboard />,
    },
    {
      path: "/about",
      element: <AboutUs />,
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
      element: (
        <ProtectedRoute>
          <Subject />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/createQuize/:subjectId",
      element: (
        <ProtectedRoute>
          <CreateQuize />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/allquiz",
      element: (
        <ProtectedRoute>
          <TeacherCreateQuiz />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/reasult/:quizeId",
      element: (
        <ProtectedRoute>
          <AdmineReacult />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/create/subject",
      element: (
        <ProtectedRoute>
          <CreateSubject />
        </ProtectedRoute>
      ),
    },
    {
      path: "/Admin/subject/quiz/:subjectId",
      element: (
        <ProtectedRoute>
          <SubjectRelatedQuiz />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admine/only/subject",
      element: (
        <ProtectedRoute>
          <DepartmentSelector />
        </ProtectedRoute>
      ),
    },
    {
      path: "/subject/:depName",
      element: (
        <ProtectedRoute>
          <AdminSubject />
        </ProtectedRoute>
      ),
    },
    {
      path: "/notvarifieduser",
      element: (
        <ProtectedRoute>
          <UnAuthorizeUser />
        </ProtectedRoute>
      ),
    },
    {
      path: "/notfound",
      element: <NotFound />,
    },
  ]);

  return (
    <>
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
