import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useAuth0 } from "@auth0/auth0-react";
import {
  TrendingUp,
  Target,
  Award,
  Zap,
  Crown,
  Star,
  Trophy,
  Calendar,
  BookOpen,
  Brain,
  Sparkles,
  ChevronRight,
  Flame,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Lightbulb,
  Shield,
  Rocket,
  Diamond
} from "lucide-react";
import Calander from "./Calander";

const Dashboard = () => {
  // ✅ Auth0
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect, user } = useAuth0();

  // ✅ States
  const [progress, setProgress] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Animated values
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [percentage, setPercentage] = useState(0);

  // Time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
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

        const [progressRes, subjectRes, badgeRes, streakRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/dashbord/data/progress`, { headers })
            .then(res => {
              if (!res.ok) throw new Error(`Progress API failed: ${res.status}`);
              return res.json();
            }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/data/subject`, { headers })
            .then(res => {
              if (!res.ok) throw new Error(`Subject API failed: ${res.status}`);
              return res.json();
            }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/data/badge`, { headers })
            .then(res => {
              if (!res.ok) throw new Error(`Badge API failed: ${res.status}`);
              return res.json();
            }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/dashbord/data/streak`, { headers })
            .then(res => {
              if (!res.ok) throw new Error(`Streak API failed: ${res.status}`);
              return res.json();
            }),
        ]);

        if (progressRes?.success && progressRes?.data) {
          setProgress(progressRes.data);
        }

        if (subjectRes?.success && Array.isArray(subjectRes?.data)) {
          setSubjects(subjectRes.data);

        }

        if (badgeRes?.success && Array.isArray(badgeRes?.quizzes)) {
          setBadges(badgeRes.quizzes);
        }

        if (streakRes?.success && Array.isArray(streakRes?.streak)) {
          const heatmapData = streakRes.streak.map(item => ({
            date: item.date,
            count: item.count || 0
          }));
          setStreak(heatmapData);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      loginWithRedirect();
    }
  }, [getAccessTokenSilently, isAuthenticated, loginWithRedirect]);

  // ✅ Animate numbers when progress data is available
  useEffect(() => {
    if (!progress) return;

    const animations = [];

    const attemptedAnim = animate(0, progress.quizzesAttempted || 0, {
      duration: 2,
      onUpdate: (v) => setAttempted(Math.round(v)),
    });
    animations.push(attemptedAnim);

    const correctAnim = animate(0, progress.correctAnswers || 0, {
      duration: 2,
      onUpdate: (v) => setCorrect(Math.round(v)),
    });
    animations.push(correctAnim);

    const wrongAnim = animate(0, progress.wrongAnswers || 0, {
      duration: 2,
      onUpdate: (v) => setWrong(Math.round(v)),
    });
    animations.push(wrongAnim);

    const totalAnswers = (progress.correctAnswers || 0) + (progress.wrongAnswers || 0);
    const calculatedPercentage = totalAnswers > 0 ? (progress.correctAnswers / totalAnswers) * 100 : 0;

    const percentageAnim = animate(0, calculatedPercentage, {
      duration: 2,
      onUpdate: (v) => setPercentage(v),
    });
    animations.push(percentageAnim);

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [progress]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getMotivationalMessage = () => {
    if (percentage >= 90) return "Outstanding performance! 🌟";
    if (percentage >= 80) return "Great work! Keep it up! 🚀";
    if (percentage >= 70) return "Good progress! Almost there! 💪";
    if (percentage >= 60) return "Keep pushing forward! 📈";
    return "Every expert was once a beginner! 🌱";
  };

  const currentStreak = streak.length > 0 ? Math.max(...streak.map(s => s.count)) : 0;
  const totalBadges = badges.length;
  const topperBadges = badges.filter(b => b.isUserTopper).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex justify-center items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-white"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full mx-auto mb-6"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl font-semibold"
          >
            Loading Your Dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex justify-center items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-white p-8 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20"
        >
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Oops! Something went wrong</p>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center gap-2 mx-auto"
          >
            <Rocket className="w-4 h-4" />
            Retry Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex justify-center items-center">
        <motion.div
          animate={{ y: [-10, 0, -10] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-center text-white"
        >
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <p className="text-xl font-semibold">Securing Your Session...</p>
        </motion.div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            rotate: { duration: 45, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-bl from-indigo-200/20 to-purple-200/20 rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10 p-6 space-y-8 max-w-8xl mx-auto">
        {/* Epic Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, type: "spring" }}
          className="relative overflow-hidden"
        >
          <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-4 left-4 w-24 h-24 border border-white rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-2xl rotate-45"
              />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                  className="flex items-center gap-3 justify-center lg:justify-start mb-4"
                >
                  <div className="relative">
                    <Crown className="w-10 h-10 text-yellow-400" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
                    />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white">
                      {getGreeting()}, {user?.name?.split(' ')[0] || 'Champion'}! 👋
                    </h1>
                    <motion.p
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-white/90 text-lg mt-2"
                    >
                      {getMotivationalMessage()}
                    </motion.p>
                  </div>
                </motion.div>

                <div className="flex items-center gap-6 justify-center lg:justify-start text-white/90">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-mono">
                      {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30"
                >
                  <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{currentStreak}</div>
                  <div className="text-white/80 text-sm">Day Streak</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30"
                >
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{totalBadges}</div>
                  <div className="text-white/80 text-sm">Total Badges</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.9, duration: 0.8, type: "spring" }}
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30"
                >
                  <Diamond className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{topperBadges}</div>
                  <div className="text-white/80 text-sm">Top Scores</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.1, duration: 0.8, type: "spring" }}
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30"
                >
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{attempted}</div>
                  <div className="text-white/80 text-sm">Quizzes</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Primary Progress Circle - Enhanced */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="xl:col-span-4"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
              {/* Animated background */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30"
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Brain className="w-7 h-7 text-purple-600" />
                    Performance
                  </h2>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🎯
                  </motion.div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 mb-6">
                    <CircularProgressbar
                      value={percentage}
                      text={`${percentage.toFixed(1)}%`}
                      styles={buildStyles({
                        pathColor: percentage >= 90 ? "#10b981" : percentage >= 75 ? "#f59e0b" : percentage >= 60 ? "#3b82f6" : "#ef4444",
                        textColor: "#1f2937",
                        textSize: "14px",
                        pathTransitionDuration: 2,
                        trailColor: "#f3f4f6",
                      })}
                      strokeWidth={8}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 text-center border-2 border-green-200"
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-700">{correct}</div>
                      <div className="text-green-600 text-sm font-semibold">Correct</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-4 text-center border-2 border-red-200"
                    >
                      <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-700">{wrong}</div>
                      <div className="text-red-600 text-sm font-semibold">Wrong</div>
                    </motion.div>
                  </div>

                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(59, 130, 246, 0.3)",
                        "0 0 40px rgba(59, 130, 246, 0.5)",
                        "0 0 20px rgba(59, 130, 246, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold text-lg"
                  >
                    {percentage.toFixed(1)}% Accuracy Rate
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subject Progress - Enhanced */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="xl:col-span-5"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-7 h-7 text-blue-600" />
                  Subject Mastery
                </h2>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl"
                >
                  📚
                </motion.div>
              </div>

              <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
                {subjects.length > 0 ? (
                  subjects.map((subject, index) => (
                    <motion.div
                      key={subject.subjectId}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {subject.subjectName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">{subject.subjectName}</h3>
                              <h3 className="font-bold text-gray-800 text-sm">{subject.subjectCode}</h3>

                              <p className="text-gray-600 text-sm">Subject Progress</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800">
                              {subject.completedQuizzes}/{subject.totalQuizzes}
                            </div>
                            <div className="text-gray-500 text-sm">Completed</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                            <motion.div
                              className="h-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                              initial={{ width: 0 }}
                              animate={{
                                width: subject.totalQuizzes > 0
                                  ? `${(subject.completedQuizzes / subject.totalQuizzes) * 100}%`
                                  : '0%'
                              }}
                              transition={{ duration: 1.5, delay: 0.5 + index * 0.2 }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              {subject.completedQuizzes} Done
                            </span>
                            <span className="flex items-center gap-1 text-orange-600 font-semibold">
                              <Clock className="w-4 h-4" />
                              {subject.pendingQuizzes} Pending
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No subjects found</p>
                    <p className="text-gray-400 text-sm">Start your learning journey!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Achievement Showcase - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="xl:col-span-3"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Trophy className="w-7 h-7 text-yellow-500" />
                  Achievements
                </h2>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-2xl"
                >
                  🏆
                </motion.div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {badges.length > 0 ? (
                  badges.map((badge, index) => (
                    <motion.div
                      key={badge._id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="group cursor-pointer"
                    >
                      <div className={`relative rounded-2xl p-5 border-2 transition-all duration-300 ${badge.isUserTopper
                        ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 border-yellow-300 shadow-lg'
                        : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 hover:border-purple-300'
                        }`}>
                        {/* Crown for top performers */}
                        {badge.isUserTopper && (
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                          >
                            <Crown className="w-4 h-4 text-yellow-800" />
                          </motion.div>
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-sm leading-tight">
                              {badge.title}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {badge.subject?.subjectName || 'Unknown Subject'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {badge.isUserTopper ? (
                              <Star className="w-5 h-5 text-yellow-500" />
                            ) : (
                              <Award className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                              Score: {badge.highestScore || 0}
                            </span>
                            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                              {Math.round(badge.highestPercentage || 0)}%
                            </span>
                          </div>

                          {badge.isUserTopper && (
                            <motion.div
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-center"
                            >
                              <span className="text-xs text-yellow-600 font-bold bg-yellow-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                TOP SCORER
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center"
                    >
                      <Award className="w-10 h-10 text-gray-400" />
                    </motion.div>
                    <p className="text-gray-500 text-lg font-semibold">No badges yet</p>
                    <p className="text-gray-400 text-sm mt-2">Score 90%+ on quizzes to earn badges!</p>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mt-4 text-2xl"
                    >
                      🎯
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Heatmap - Ultra Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="relative"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-5">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 180, 270, 360]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 270, 180, 90, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-4 left-4 w-40 h-40 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full"
              />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                    <Activity className="w-8 h-8 text-green-600" />
                    Learning Journey
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 text-purple-500" />
                    </motion.div>
                  </h2>
                  <p className="text-gray-600">Your daily quiz activity throughout the year</p>
                </div>

                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {currentStreak} Day Streak
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {streak.reduce((sum, day) => sum + day.count, 0)} Total
                  </motion.div>
                </div>
              </div>

              {streak.length > 0 ? (
                <div className="relative">
                  <div className="overflow-x-auto pb-4">
                    <CalendarHeatmap
                      startDate={new Date("2025-01-01")}
                      endDate={new Date("2025-12-31")}
                      values={streak}
                      classForValue={(val) => {
                        if (!val || val.count === 0) return "color-empty";
                        if (val.count === 1) return "color-scale-1";
                        if (val.count === 2) return "color-scale-2";
                        if (val.count === 3) return "color-scale-3";
                        if (val.count >= 4) return "color-scale-4";
                        return "color-empty";
                      }}
                      tooltipDataAttrs={(value) => ({
                        "data-tip": value?.date
                          ? `${value.date}: ${value.count || 0} quiz${value.count !== 1 ? 'es' : ''}`
                          : "No activity",
                      })}
                      gutterSize={3}
                    />
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-600">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#dbeafe' }}></div>
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#93c5fd' }}></div>
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#60a5fa' }}></div>
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#2563eb' }}></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full mx-auto mb-6 flex items-center justify-center"
                  >
                    <Calendar className="w-12 h-12 text-blue-600" />
                  </motion.div>
                  <p className="text-gray-500 text-xl font-semibold">Start Your Journey!</p>
                  <p className="text-gray-400 text-lg mt-2">Take your first quiz to begin tracking</p>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-6 text-4xl"
                  >
                    🚀
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        <Calander />
      </div>

      {/* Enhanced Custom Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5, #7c3aed);
        }

        .react-calendar-heatmap .color-empty { fill: #f3f4f6; }
        .react-calendar-heatmap .color-scale-1 { fill: #dbeafe; }
        .react-calendar-heatmap .color-scale-2 { fill: #93c5fd; }
        .react-calendar-heatmap .color-scale-3 { fill: #60a5fa; }
        .react-calendar-heatmap .color-scale-4 { fill: #2563eb; }
        .react-calendar-heatmap rect { 
          rx: 3; 
          ry: 3; 
          transition: all 0.2s ease;
        }
        .react-calendar-heatmap rect:hover { 
          stroke: #1e40af;
          stroke-width: 1;
          transform: scale(1.1);
        }
        .react-calendar-heatmap .react-calendar-heatmap-tooltip {
          background: linear-gradient(135deg, #1f2937, #374151);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Glassmorphism enhancements */
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
        }
        
        /* Custom animations */
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
export default Dashboard