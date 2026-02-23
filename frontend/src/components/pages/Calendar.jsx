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
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transition-colors"
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
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-3 transition-colors">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-xl text-blue-600 dark:text-blue-300">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">Date</p>
                    <p className="font-medium text-gray-800 dark:text-white">{quiz.date}</p>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center gap-3 transition-colors">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-xl text-purple-600 dark:text-purple-300">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">Duration</p>
                    <p className="font-medium text-gray-800 dark:text-white">{quiz.time} mins</p>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center gap-3 transition-colors">
                  <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-xl text-orange-600 dark:text-orange-300">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase">Questions</p>
                    <p className="font-medium text-gray-800 dark:text-white">{quiz.totalQuestions}</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center gap-3 transition-colors">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-xl text-green-600 dark:text-green-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase">Marks</p>
                    <p className="font-medium text-gray-800 dark:text-white">{quiz.marks}/Q</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase">Created By</p>
                  <p className="font-medium text-gray-800 dark:text-white">{quiz.createdBy?.fullname || "Instructor"}</p>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold transition-colors">
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
                  className="flex-[2] py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 font-bold cursor-not-allowed border border-gray-200 dark:border-slate-700 flex items-center justify-center gap-2"
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
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
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
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-slate-950 transition-colors">
              {quizzes.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                  <p>No quizzes found for this month.</p>
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <div key={quiz._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{quiz.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {quiz.subject.subjectName} • {format(parseISO(quiz.date), "PPP")}
                        </p>
                      </div>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                        {quiz.questions?.length || 0} Questions
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                      {quiz.questions && quiz.questions.length > 0 ? (
                        quiz.questions.map((q, qIndex) => (
                          <div key={q._id || qIndex} className="p-6 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex gap-4">
                              <span className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-lg flex items-center justify-center font-bold text-sm">
                                {qIndex + 1}
                              </span>
                              <div className="flex-1 space-y-3">
                                <p className="font-medium text-gray-900 dark:text-white text-lg">{q.questionText}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {q.options.map((opt, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`p-3 rounded-xl text-sm border flex items-center gap-3 transition-colors
                                        ${(optIndex + 1) === q.correctAnswer
                                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 ring-1 ring-green-500"
                                          : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300"
                                        }`}
                                    >
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors
                                        ${(optIndex + 1) === q.correctAnswer
                                          ? "bg-green-500 border-green-500 text-white"
                                          : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-400"
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
                        <div className="p-6 text-center text-gray-400 dark:text-slate-500 italic">
                          No questions available for this quiz.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 transition-colors">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
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
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800/20 overflow-hidden transition-colors">
        {/* Moodle-style Header */}
        <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex flex-col gap-6">
            {/* Title and New Event Button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
                Calendar
              </h1>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-[#0070bc] hover:bg-[#005a96] text-white rounded-lg font-medium transition-colors shadow-sm">
                  New event
                </button>
                {usere?.role === "teacher" && (
                  <button
                    onClick={() => setShowAllQuestions(true)}
                    className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    title="All Questions"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[140px]">
                <select className="w-full p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                  <option>Month</option>
                  <option>Table</option>
                  <option>Upcoming</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
              <div className="relative min-w-[200px] flex-1 md:flex-none">
                <select className="w-full p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                  <option>All courses</option>
                  <option>{usere?.department} - {usere?.semester} Sem</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-2 border-t border-gray-50 dark:border-slate-800 pt-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors text-sm md:text-base"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{format(subMonths(currentDate, 1), "MMMM")}</span>
              </button>

              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {format(currentDate, "MMMM yyyy")}
              </h2>

              <button
                onClick={() => navigateMonth(1)}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors text-sm md:text-base"
              >
                <span>{format(addMonths(currentDate, 1), "MMMM")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-2 md:p-8">
          <div className="grid grid-cols-7 gap-1 md:gap-4 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-500 dark:text-slate-400 text-[10px] md:text-sm uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentDate.toString()}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.3 }}
              className="grid grid-cols-7 gap-1 md:gap-4"
            >
              {daysInMonth.map((date, idx) => {
                const dayQuizzes = getQuizzesForDate(date);
                const isToday = isSameDay(date, new Date());
                const isCurrentMonth = isSameMonth(date, currentDate);

                return (
                  <div
                    key={idx}
                    className={`min-h-[60px] md:min-h-[120px] rounded-xl md:rounded-2xl p-1 md:p-3 border transition-all duration-300 group relative
                    ${!isCurrentMonth
                        ? "bg-gray-50/30 dark:bg-slate-800/10 border-transparent opacity-30"
                        : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800"
                      }
                    ${isToday ? "ring-1 md:ring-2 ring-blue-500 ring-offset-1 md:ring-offset-2 dark:ring-offset-slate-900 z-10" : "z-0"}
                  `}
                  >
                    <div className="flex flex-col items-center md:items-start h-full">
                      <span
                        className={`text-xs md:text-sm font-semibold w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-colors
                        ${isToday
                            ? "bg-[#0070bc] text-white"
                            : isCurrentMonth
                              ? "text-gray-700 dark:text-slate-300"
                              : "text-gray-400 dark:text-slate-600"
                          }
                      `}
                      >
                        {format(date, "d")}
                      </span>

                      {/* Event indicators */}
                      <div className="mt-1 w-full space-y-1 overflow-hidden">
                        {dayQuizzes.length > 0 && (
                          <div className="flex flex-wrap justify-center md:justify-start gap-1">
                            {/* Mobile: Dots */}
                            <div className="md:hidden flex gap-0.5">
                              {dayQuizzes.map((q) => (
                                <div key={q._id} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              ))}
                            </div>

                            {/* Desktop: Full Labels */}
                            <div className="hidden md:block w-full space-y-1">
                              {dayQuizzes.map((q) => (
                                <motion.button
                                  key={q._id}
                                  onClick={() => setSelectedQuiz(q)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full text-left p-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 transition-all overflow-hidden"
                                >
                                  <p className="text-[9px] font-bold truncate leading-tight">
                                    {q.title}
                                  </p>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Click Overlay */}
                      {dayQuizzes.length > 0 && (
                        <button
                          onClick={() => setSelectedQuiz(dayQuizzes[0])}
                          className="md:hidden absolute inset-0 z-20"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
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
