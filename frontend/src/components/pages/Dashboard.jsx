import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Rocket,
  Shield,
  Zap,
  LayoutDashboard,
  Calendar as CalendarIcon
} from "lucide-react";

// Components
import StatsGrid from "../ui/StatsCard";
import ActivityChart from "../ui/ActivityChart";
import RecentActivity from "../ui/RecentActivity";
import UpcomingQuizzes from "../ui/UpcomingQuizzes";
import Calendar from "./Calendar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { usere } = useSelector((store) => store.auth);

  // ✅ Auth0 with isLoading check
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect, user, isLoading } = useAuth0();

  // ✅ States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data States
  const [dashboardData, setDashboardData] = useState({
    progress: null,
    subjects: [],
    badges: [],
    streak: [],
    recentActivity: [],
    calendarQuizzes: []
  });

  // Redirect teacher
  useEffect(() => {
    if (usere?.role === "teacher") {
      navigate("/");
    }
  }, [usere, navigate]);

  // Time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        const token = await getAccessTokenSilently({
          audience: "https://bppimt-quiz-kml1.vercel.app/api/v2",
        });

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Parallel fetching
        const [progressRes, subjectRes, badgeRes, streakRes, recentRes, calendarRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/dashbord/data/progress`, { headers }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/data/subject`, { headers }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/data/badge`, { headers }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/data/streak`, { headers }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/data/recent`, { headers }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/calender/details?department=${usere?.department || ''}&semester=${usere?.semester || ''}`, { headers }).then(r => r.json())
        ]);

        setDashboardData({
          progress: progressRes?.success ? progressRes.data : null,
          subjects: subjectRes?.success ? subjectRes.data : [],
          badges: badgeRes?.success ? badgeRes.quizzes : [],
          streak: streakRes?.success ? streakRes.streak : [],
          recentActivity: recentRes?.success ? recentRes.data : [],
          calendarQuizzes: calendarRes?.quizzes || []
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && usere) {
      fetchData();
    }
  }, [getAccessTokenSilently, isAuthenticated, usere]);


  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Calculate percentages
  const totalAnswers = (dashboardData.progress?.correctAnswers || 0) + (dashboardData.progress?.wrongAnswers || 0);
  const accuracy = totalAnswers > 0 ? (dashboardData.progress?.correctAnswers / totalAnswers) * 100 : 0;
  const currentStreak = dashboardData.streak.length > 0 ? Math.max(...dashboardData.streak.map(s => s.count)) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 relative overflow-x-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-50" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header (Bento Style) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-indigo-900 tracking-wider uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Student Dashboard
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.given_name || 'Student'}</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">
              Ready to crush your goals today? 🚀
            </p>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-6xl font-black text-slate-200 tracking-tighter">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/\s[AP]M/, '')}
            </p>
            <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Main Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">

          {/* Row 1: Stats Cards (Full Width) */}
          <div className="md:col-span-4">
            <StatsGrid
              stats={{
                totalQuizzes: dashboardData.progress?.totalQuizzes || 0,
                quizzesAttempted: dashboardData.progress?.quizzesAttempted || 0,
                percentage: accuracy,
                streak: currentStreak,
                badges: dashboardData.badges.length
              }}
            />
          </div>

          {/* Row 2: Main Activity Chart + Widgets */}

          {/* Activity Chart (Large Area) */}
          <motion.div
            className="md:col-span-3 min-h-[400px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ActivityChart data={dashboardData.streak.map(s => ({ date: s.date, score: s.count * 10 }))} />
          </motion.div>

          {/* Right Column Stack */}
          <div className="md:col-span-1 flex flex-col gap-6">

            {/* Motivation Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 bg-gradient-to-br from-orange-400 to-pink-500 p-6 rounded-[2rem] text-white shadow-lg shadow-orange-200 relative overflow-hidden min-h-[180px] flex flex-col justify-center"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <span className="font-bold opacity-90">Daily Boost</span>
                </div>
                <p className="text-lg font-bold leading-tight">
                  "Believe you can and you're halfway there."
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl" />
            </motion.div>

            {/* Upcoming Quizzes */}
            <div className="flex-[2]">
              <UpcomingQuizzes quizzes={dashboardData.calendarQuizzes} />
            </div>
          </div>

          {/* Row 3: Calendar + Recent Activity */}

          {/* Calendar (Wider) */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/40 overflow-hidden">
              <Calendar />
            </div>
          </motion.div>

          {/* Recent Activity (Tall) */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RecentActivity activities={dashboardData.recentActivity} />
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;