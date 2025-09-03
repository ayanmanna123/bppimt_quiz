import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  BookOpen, 
  CalendarDays,
  Calendar as CalendarIcon,
  Target,
  Award,
  Sparkles,
  Brain,
  Trophy,
  X,
  Timer,
  FileText,
  Users,
  Star,
  Zap,
  CheckCircle2
} from 'lucide-react';

const Calendar = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const [quiz, setQuiz] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({ total: 0, thisMonth: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `https://bppimt-quiz-kml1.vercel.app/api/v1/dashbord/calender/details?department=${usere.department}&semester=${usere.semester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setQuiz(res.data.quizzes);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (usere?.department && usere?.semester) {
      fetch();
    }
  }, [getAccessTokenSilently, usere]);

  // Animate stats when quiz data loads
  useEffect(() => {
    if (quiz.length === 0) return;

    const thisMonthQuizzes = quiz.filter(q => {
      const quizDate = new Date(q.date);
      return quizDate.getMonth() === currentDate.getMonth() && 
             quizDate.getFullYear() === currentDate.getFullYear();
    }).length;

    const totalAnim = animate(0, quiz.length, {
      duration: 1.5,
      onUpdate: (v) => setAnimatedStats(prev => ({ ...prev, total: Math.round(v) })),
    });

    const monthAnim = animate(0, thisMonthQuizzes, {
      duration: 1.5,
      onUpdate: (v) => setAnimatedStats(prev => ({ ...prev, thisMonth: Math.round(v) })),
    });

    return () => {
      totalAnim.stop();
      monthAnim.stop();
    };
  }, [quiz, currentDate]);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getQuizzesForDate = (date) => {
    const dateStr = formatDate(date);
    return quiz.filter(q => q.date === dateStr);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <motion.div 
          key={`empty-${i}`} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          className="h-32 bg-gradient-to-br from-gray-50/50 to-gray-100/50 backdrop-blur-sm border border-white/20"
        />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayQuizzes = getQuizzesForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const hasQuizzes = dayQuizzes.length > 0;

      days.push(
        <motion.div 
          key={day}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: (day + firstDay) * 0.02, type: "spring" }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`h-32 p-2 border border-white/30 backdrop-blur-xl overflow-hidden relative group cursor-pointer transition-all duration-300 ${
            isToday 
              ? 'bg-gradient-to-br from-blue-100/80 to-purple-100/80 border-blue-300/50 shadow-lg' 
              : hasQuizzes
                ? 'bg-gradient-to-br from-white/60 to-blue-50/60 hover:from-white/80 hover:to-blue-50/80'
                : 'bg-gradient-to-br from-white/40 to-gray-50/40 hover:from-white/60 hover:to-gray-50/60'
          }`}
        >
          {/* Date number */}
          <div className={`text-sm font-bold mb-2 flex items-center justify-between ${
            isToday ? 'text-blue-700' : hasQuizzes ? 'text-gray-800' : 'text-gray-600'
          }`}>
            <span>{day}</span>
            {isToday && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
              </motion.div>
            )}
          </div>

          {/* Quiz events */}
          <div className="space-y-1">
            {dayQuizzes.slice(0, 2).map((q, index) => (
              <motion.div
                key={q._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedQuiz(q)}
                className="text-xs p-2 rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg hover:scale-105 group/quiz"
              >
                <div className="font-semibold truncate flex items-center gap-1">
                  <Brain className="w-3 h-3 flex-shrink-0" />
                  {q.title}
                </div>
                <div className="opacity-90 flex items-center gap-1 mt-1">
                  <Timer className="w-3 h-3" />
                  {q.time}m
                </div>
              </motion.div>
            ))}
            {dayQuizzes.length > 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-center py-1 px-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg font-medium"
              >
                +{dayQuizzes.length - 2} more
              </motion.div>
            )}
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        </motion.div>
      );
    }

    return days;
  };

  const QuizModal = ({ quiz, onClose }) => {
    if (!quiz) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-700 p-8 overflow-hidden">
            {/* Background animations */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 w-20 h-20 border-2 border-white rounded-full"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-2xl rotate-45"
              />
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <div className="flex-1">
                <motion.h2 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  {quiz.title}
                </motion.h2>
                <motion.p 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/90 text-lg flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  {quiz.subject.subjectName} ({quiz.subject.subjectCode})
                </motion.p>
              </div>
              <motion.button
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-8">
            {/* Quiz Stats Cards */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border-2 border-blue-200">
                <CalendarDays className="w-6 h-6 text-blue-600 mb-2" />
                <div className="text-xs text-blue-600 font-semibold">Date</div>
                <div className="text-sm font-bold text-blue-800">{quiz.date}</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border-2 border-green-200">
                <Clock className="w-6 h-6 text-green-600 mb-2" />
                <div className="text-xs text-green-600 font-semibold">Duration</div>
                <div className="text-sm font-bold text-green-800">{quiz.time} min</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border-2 border-purple-200">
                <FileText className="w-6 h-6 text-purple-600 mb-2" />
                <div className="text-xs text-purple-600 font-semibold">Questions</div>
                <div className="text-sm font-bold text-purple-800">{quiz.totalQuestions}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border-2 border-orange-200">
                <Target className="w-6 h-6 text-orange-600 mb-2" />
                <div className="text-xs text-orange-600 font-semibold">Marks Each</div>
                <div className="text-sm font-bold text-orange-800">{quiz.marks}</div>
              </div>
            </motion.div>

            {/* Creator Info */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 mb-8 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Created by: {quiz.createdBy.fullname}</div>
                  <div className="text-sm text-gray-600">Quiz Administrator</div>
                </div>
              </div>
            </motion.div>

            {/* Questions Section */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Quiz Questions</h3>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </motion.div>
              </div>
              
              <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
                {quiz.questions.map((question, index) => (
                  <motion.div 
                    key={question._id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="font-semibold text-gray-800 text-lg leading-relaxed">
                        {question.questionText}
                      </p>
                    </div>
                    
                    <div className="space-y-3 ml-11">
                      {question.options.map((option, optIndex) => (
                        <motion.div
                          key={optIndex}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.05 * optIndex }}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                            optIndex === question.correctAnswer
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 shadow-md'
                              : 'bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-current">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              {option}
                            </div>
                            {optIndex === question.correctAnswer && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-bold text-green-700">Correct</span>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
          />
          <span className="ml-4 text-gray-600 text-lg font-semibold">Loading calendar...</span>
        </div>
      </motion.div>
    );
  }

  const thisMonthQuizzes = quiz.filter(q => {
    const quizDate = new Date(q.date);
    return quizDate.getMonth() === currentDate.getMonth() && 
           quizDate.getFullYear() === currentDate.getFullYear();
  }).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full blur-2xl"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-700 p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"
            >
              <CalendarIcon className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <motion.h1 
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Quiz Calendar
              </motion.h1>
              <motion.p 
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-lg"
              >
                {usere?.department} Department - {usere?.semester} Semester
              </motion.p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30 min-w-[100px]"
            >
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{animatedStats.total}</div>
              <div className="text-white/80 text-xs">Total Quizzes</div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30 min-w-[100px]"
            >
              <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{animatedStats.thisMonth}</div>
              <div className="text-white/80 text-xs">This Month</div>
            </motion.div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center mt-8 gap-6">
          <motion.button
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(-1)}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          
          <motion.h2 
            key={currentDate.getMonth()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-white min-w-[250px] text-center"
          >
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </motion.h2>
          
          <motion.button
            whileHover={{ scale: 1.1, x: 3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(1)}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative z-10 p-8">
        {/* Days of the week header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-7 gap-2 mb-4"
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <motion.div 
              key={day} 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="h-12 flex items-center justify-center font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-blue-100 rounded-xl border border-gray-200"
            >
              {day}
            </motion.div>
          ))}
        </motion.div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
            <span className="text-gray-600 font-medium">Quiz Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-blue-600"></div>
            <span className="text-gray-600 font-medium">Today</span>
          </div>
        </motion.div>
      </div>

      {/* Quiz Modal */}
      {selectedQuiz && (
        <QuizModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
      )}

      {/* Custom Styles */}
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

        /* Additional glassmorphism enhancements */
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
        }
        
        /* Custom pulse animation for today indicator */
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Smooth hover transitions for calendar days */
        .calendar-day {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .calendar-day:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        /* Custom modal backdrop */
        .modal-backdrop {
          backdrop-filter: blur(12px) saturate(1.2);
        }

        /* Enhanced quiz event styling */
        .quiz-event {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .quiz-event:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          transform: translateY(-1px) scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        /* Loading spinner enhancement */
        .loading-spinner {
          background: conic-gradient(from 0deg, transparent, #8b5cf6, transparent);
          animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Question card hover effects */
        .question-card {
          transition: all 0.3s ease;
        }

        .question-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        /* Correct answer highlight animation */
        .correct-answer {
          position: relative;
          overflow: hidden;
        }

        .correct-answer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.2), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* Stats card animations */
        .stats-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        /* Month navigation buttons */
        .nav-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.1);
        }

        .nav-button:active {
          transform: scale(0.95);
        }

        /* Day header styling */
        .day-header {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          transition: all 0.3s ease;
        }

        /* Empty day cells */
        .empty-day {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.3) 0%, rgba(226, 232, 240, 0.3) 100%);
        }

        /* Quiz modal enhancements */
        .quiz-modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(1.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .quiz-modal-header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
        }

        /* Legend styling */
        .legend-item {
          transition: all 0.3s ease;
        }

        .legend-item:hover {
          transform: scale(1.05);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .calendar-day {
            height: 120px;
          }
          
          .stats-card {
            min-width: 80px;
          }
          
          .quiz-modal {
            margin: 1rem;
            max-width: calc(100vw - 2rem);
          }
        }

        @media (max-width: 480px) {
          .calendar-day {
            height: 100px;
            padding: 0.5rem;
          }
          
          .quiz-event {
            font-size: 10px;
            padding: 0.25rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Calendar;