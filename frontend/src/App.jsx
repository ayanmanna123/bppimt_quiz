import { useState, lazy, Suspense } from "react";
import "./App.css";
import Layout from "./components/Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Lazy load all page components
const Home = lazy(() => import("./components/pages/Home"));
const Complete = lazy(() => import("./components/Complete"));
const Quiz = lazy(() => import("./components/pages/Quiz"));
const AllQuiz = lazy(() => import("./components/AllQuiz"));
const GiveQuiz = lazy(() => import("./components/pages/GiveQuiz")); // Assuming this was meant to be used
const Reasult = lazy(() => import("./components/pages/Reasult"));
const ReasultDetails = lazy(() => import("./components/pages/ReasultDetails"));
const Subject = lazy(() => import("./components/admin/Subject"));
const CreateQuize = lazy(() => import("./components/admin/CreateQuize"));
const TeacherCreateQuiz = lazy(() => import("./components/admin/TeacherCreateQuiz"));
const AdmineReacult = lazy(() => import("./components/admin/AdmineReacult"));
const CreateSubject = lazy(() => import("./components/admin/CreateSubject"));
const SubjectRelatedQuiz = lazy(() => import("./components/admin/SubjectRelatedQuiz"));
const Profile = lazy(() => import("./components/Profile"));
const FullScreen = lazy(() => import("./components/FullScreen"));
const Dashboard = lazy(() => import("./components/pages/Dashboard"));
const AboutUs = lazy(() => import("./components/pages/AboutUs"));
const DepartmentSelector = lazy(() => import("./components/admin/admin/DepartmentSelector"));
const AdminSubject = lazy(() => import("./components/admin/admin/AdminSubject"));
const UnAuthorizeUser = lazy(() => import("./components/admin/admin/UnAuthorizeUser"));
const ProtectedRoute = lazy(() => import("./components/pages/ProtectedRoute"));
const NotFound = lazy(() => import("./components/pages/NotFound "));
const CertificateVerifier = lazy(() => import("./components/pages/CertificateVerifier"));
const EnterName = lazy(() => import("./components/pages/EnterName"));
const OtherTeacher = lazy(() => import("./components/admin/OtherTeacher"));
const AttendanceSheet = lazy(() => import("./components/pages/AttendanceSheet"));
const StudentAttendanceSummary = lazy(() => import("./components/pages/StudentAttendanceSummary"));
const QuestionBank = lazy(() => import("./components/admin/QuestionBank"));
const PlayWeaknessQuiz = lazy(() => import("./components/pages/PlayWeaknessQuiz"));

// Simple loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  const approute = createBrowserRouter([
    {
      element: <Layout />,
      children: [
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
          path: "/admin/question-bank/:subjectId",
          element: (
            <ProtectedRoute>
              <QuestionBank />
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
          path: "/admin/othersubject",
          element: (
            <ProtectedRoute>
              <OtherTeacher />
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
        {
          path: "/veryfi",
          element: <CertificateVerifier />,
        },
        {
          path: "/attandance/:subjectId",
          element: <AttendanceSheet />,
        },
        {
          path: "/StudentAttendanceSummary",
          element: <StudentAttendanceSummary />
        },
        {
          path: "/quiz/play-weakness",
          element: <PlayWeaknessQuiz />,
        },
      ],
    },
    // Routes OUTSIDE the main layout (no Navbar)
    {
      path: "/quiz/page/:quizId",
      element: <FullScreen />,
    },
    {
      path: "/enter/name",
      element: <EnterName />,
    },
  ]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={approute} />
    </Suspense>
  );
}

export default App;
