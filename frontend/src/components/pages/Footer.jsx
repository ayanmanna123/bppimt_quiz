import { useEffect, useState } from "react";
import Counter from "./Counter";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

const Footer = () => {
  const { getAccessTokenSilently } = useAuth0();

  // State for counts
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();
  // Fetch student count
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/student/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStudentCount(res.data.length ?? res.data.count ?? 0);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudents();
  }, [getAccessTokenSilently]);
  const handleLogin = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect();
    }
    toast.error("you already login ")
  };
  // Fetch teacher count
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/teacher/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeacherCount(res.data.length ?? res.data.count ?? 0);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTeachers();
  }, [getAccessTokenSilently]);

  // Fetch quiz count
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/quize/quiz/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuizCount(res.data.length ?? res.data.count ?? 0);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [getAccessTokenSilently]);

  const stats = [
    {
      title: "Active Students",
      count: studentCount,
      icon: "👨‍🎓",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-700 dark:text-emerald-400",
      glowColor: "shadow-emerald-500/25",
    },
    {
      title: "Expert Teachers",
      count: teacherCount,
      icon: "👩‍🏫",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-400",
      glowColor: "shadow-blue-500/25",
    },
    {
      title: "Quizzes Created",
      count: quizCount,
      icon: "📚",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-700 dark:text-purple-400",
      glowColor: "shadow-purple-500/25",
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-16 mt-16 transition-colors duration-700 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10"></div>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                         radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
        }}
      ></div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/5 dark:to-purple-400/5 border border-blue-200/50 dark:border-blue-800/30 mb-4">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              PLATFORM STATISTICS
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            Growing Every Day
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Join thousands of learners and educators in our thriving educational
            community
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300/60 dark:hover:border-slate-700/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${stat.glowColor}`}
            >
              {/* Glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}
              ></div>

              {/* Icon */}
              <div
                className={`relative w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-2xl">{stat.icon}</span>
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                ></div>
              </div>

              {/* Count */}
              <div className="text-center mb-4">
                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600"></div>
                  </div>
                ) : (
                  <div className="text-5xl lg:text-6xl font-black mb-2">
                    <span
                      className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      <Counter from={0} to={stat.count} duration={4} />
                    </span>
                    <span className={`${stat.textColor} opacity-75`}>+</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                {stat.title}
              </h3>

              {/* Description */}
              <p className="text-slate-500 text-sm leading-relaxed">
                {index === 0 &&
                  "Engaged learners actively participating in courses"}
                {index === 1 && "Certified instructors sharing their expertise"}
                {index === 2 && "Interactive assessments created and completed"}
              </p>

              {/* Progress bar */}
              <div className="mt-6 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transform origin-left transition-transform duration-1000 group-hover:scale-x-100`}
                  style={{ transform: loading ? "scaleX(0)" : "scaleX(1)" }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1">
            <span onClick={handleLogin}>Join Our Community</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
