import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  BookOpen,
  Calendar as CalendarIcon,
  X,
  Target,
  Sparkles,
  Play,
  Eye,
  FileText,
} from "lucide-react";

const Calendar = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        // Note: Keeping the original API endpoint structure
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/dashbord/calender/details?department=${usere.department}&semester=${usere.semester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setQuizzes(res.data.quizzes || []);
      } catch (error) {
        console.error("Error fetching calendar details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (usere?.department && usere?.semester) {
      fetchQuizzes();
    }
  }, [getAccessTokenSilently, usere]);

  const navigateMonth = (dir) => {
    setDirection(dir);
    setCurrentDate((prev) => (dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1)));
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const getQuizzesForDate = (date) => {
    return quizzes.filter((q) => isSameDay(parseISO(q.date), date));
  };

  // Animation variants
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  const QuizModal = ({ quiz, onClose }) => {
    if (!quiz) return null;

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-2xl font-bold pr-8">{quiz.title}</h2>
              <div className="flex items-center gap-2 mt-2 text-blue-100">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">
                  {quiz.subject.subjectName} ({quiz.subject.subjectCode})
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase">Date</p>
                    <p className="font-medium text-gray-800">{quiz.date}</p>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-semibold uppercase">Duration</p>
                    <p className="font-medium text-gray-800">{quiz.time} mins</p>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-semibold uppercase">Questions</p>
                    <p className="font-medium text-gray-800">{quiz.totalQuestions}</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl text-green-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-semibold uppercase">Marks</p>
                    <p className="font-medium text-gray-800">{quiz.marks}/Q</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Created By</p>
                  <p className="font-medium text-gray-800">{quiz.createdBy?.fullname || "Instructor"}</p>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                Close Details
              </button>
              {usere?.role === "teacher" ? (
                <button
                  onClick={() => navigate(`/admin/reasult/${quiz._id}`)}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  View Result
                </button>
              ) : quiz.isAttempted ? (
                <button
                  disabled
                  className="flex-[2] py-3 rounded-xl bg-gray-100 text-gray-500 font-bold cursor-not-allowed border border-gray-200 flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5 line-through" />
                  Submitted
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/quiz/page/${quiz._id}`)}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Quiz
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const AllQuestionsModal = ({ onClose }) => {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                All Quiz Questions
              </h2>
              <p className="text-blue-100 mt-1">
                Comprehensive list of questions from all quizzes in this view
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
              {quizzes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No quizzes found for this month.</p>
                </div>
              ) : (
                quizzes.map((quiz, quizIndex) => (
                  <div key={quiz._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{quiz.title}</h3>
                        <p className="text-sm text-gray-500">
                          {quiz.subject.subjectName} • {format(parseISO(quiz.date), "PPP")}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                        {quiz.questions?.length || 0} Questions
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {quiz.questions && quiz.questions.length > 0 ? (
                        quiz.questions.map((q, qIndex) => (
                          <div key={q._id || qIndex} className="p-6 hover:bg-gray-50/50 transition-colors">
                            <div className="flex gap-4">
                              <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center font-bold text-sm">
                                {qIndex + 1}
                              </span>
                              <div className="flex-1 space-y-3">
                                <p className="font-medium text-gray-900 text-lg">{q.questionText}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {q.options.map((opt, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`p-3 rounded-xl text-sm border flex items-center gap-3
                                        ${(optIndex + 1) === q.correctAnswer
                                          ? "bg-green-50 border-green-200 text-green-800 ring-1 ring-green-500"
                                          : "bg-white border-gray-200 text-gray-600"
                                        }`}
                                    >
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                                        ${(optIndex + 1) === q.correctAnswer
                                          ? "bg-green-500 border-green-500 text-white"
                                          : "bg-gray-50 border-gray-200 text-gray-400"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + optIndex)}
                                      </span>
                                      {opt}
                                      {(optIndex + 1) === q.correctAnswer && (
                                        <Sparkles className="w-4 h-4 text-green-500 ml-auto" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-400 italic">
                          No questions available for this quiz.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white shrink-0">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Close Question Bank
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
        <p className="text-gray-500 font-medium animate-pulse">Loading calendar events...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Quiz Calendar
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 justify-center md:justify-start">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">{usere?.department}</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-semibold">{usere?.semester} Semester</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {usere?.role === "teacher" && (
              <button
                onClick={() => setShowAllQuestions(true)}
                className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">All Questions</span>
              </button>
            )}

            <div className="flex items-center gap-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-blue-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-lg font-bold text-gray-800 min-w-[140px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </div>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-blue-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-400 text-sm uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          <motion.div
            key={currentDate.toString()}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className="grid grid-cols-7 gap-4"
          >
            {daysInMonth.map((date, idx) => {
              const dayQuizzes = getQuizzesForDate(date);
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, currentDate);

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] rounded-2xl p-3 border transition-all duration-300 group
                    ${!isCurrentMonth
                      ? "bg-gray-50/50 border-transparent opacity-40 hover:opacity-100"
                      : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1"
                    }
                    ${isToday ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50/30" : ""}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday
                          ? "bg-blue-600 text-white shadow-blue-200 shadow-lg"
                          : isCurrentMonth
                            ? "text-gray-700 group-hover:bg-gray-100"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {format(date, "d")}
                    </span>
                    {dayQuizzes.length > 0 && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {dayQuizzes.map((q) => (
                      <motion.button
                        key={q._id}
                        onClick={() => setSelectedQuiz(q)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <p className="text-[10px] font-bold truncate leading-tight">
                          {q.title}
                        </p>
                        <p className="text-[9px] opacity-90 truncate">
                          {q.time} min • {q.marks / q.totalQuestions || 0}m/q
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <QuizModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
      {showAllQuestions && (
        <AllQuestionsModal onClose={() => setShowAllQuestions(false)} />
      )}
    </div>
  );
};

export default Calendar;
