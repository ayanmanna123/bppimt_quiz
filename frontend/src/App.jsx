import { useState, lazy, Suspense, useEffect } from "react";
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
const SubjectNotes = lazy(() => import("./components/pages/SubjectNotes"));
const Assignments = lazy(() => import("./components/pages/Assignments"));
const GlobalChat = lazy(() => import("./components/pages/GlobalChat"));
const WelcomeMessages = lazy(() => import("./components/pages/about/WelcomeMessages"));
const OurFounder = lazy(() => import("./components/pages/about/OurFounder"));
const AboutBPPIMT = lazy(() => import("./components/pages/about/AboutBPPIMT"));
const BoardOfGovernors = lazy(() => import("./components/pages/about/BoardOfGovernors"));
const Administration = lazy(() => import("./components/pages/about/Administration"));
const Vision = lazy(() => import("./components/pages/about/Vision"));
const Mission = lazy(() => import("./components/pages/about/Mission"));
const Foundation = lazy(() => import("./components/pages/about/Foundation"));
const PYQ = lazy(() => import("./components/pages/PYQ"));
const StudyRooms = lazy(() => import("./components/pages/StudyRooms"));
const StudyRoomDetail = lazy(() => import("./components/pages/StudyRoomDetail"));


import CubeLoader from "./components/shared/CubeLoader";

// Simple loading fallback
const LoadingFallback = () => null;

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <CubeLoader />;
  }

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
          children: [
            { path: "", element: <WelcomeMessages /> },
            { path: "welcome-messages", element: <WelcomeMessages /> },
            { path: "our-founder", element: <OurFounder /> },
            { path: "about-bppimt", element: <AboutBPPIMT /> },
            { path: "board-of-governors", element: <BoardOfGovernors /> },
            { path: "administration", element: <Administration /> },
            { path: "vision", element: <Vision /> },
            { path: "mission", element: <Mission /> },
            { path: "foundation", element: <Foundation /> },
          ],
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
        {
          path: "/subject/notes/:subjectId",
          element: <SubjectNotes />,
        },
        {
          path: "/subject/assignments/:subjectId",
          element: <Assignments />,
        },
        {
          path: "/community-chat",
          element: <GlobalChat />,
        },
        {
          path: "/pyq",
          element: <PYQ />,
        },
        {
          path: "/study-rooms",
          element: <StudyRooms />,
        },
        {
          path: "/study-room/:roomId",
          element: <StudyRoomDetail />,
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
    <Suspense fallback={null}>
      <RouterProvider router={approute} />
    </Suspense>
  );
}

export default App;
