import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "./shared/Navbar";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowLeft, Clock, Calendar, Trophy, Brain, Play, Sparkles, BookOpen, Timer, Users } from "lucide-react";
import QuizCardSkeleton from "./QuizCardSkeleton";

// Unique gradient combinations for student quiz cards
const studentQuizGradients = [
  "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600",
  "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600",
  "bg-gradient-to-br from-orange-500 via-red-600 to-pink-600",
  "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600",
  "bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600",
  "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600",
];

// Creative mesh patterns for student cards
const studentPatterns = [
  "radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.4) 0%, transparent 50%), linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
  "conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0.3) 0deg, transparent 120deg, rgba(99, 102, 241, 0.3) 240deg)",
  "radial-gradient(circle at 70% 20%, rgba(239, 68, 68, 0.4) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
  "linear-gradient(45deg, rgba(6, 182, 212, 0.3) 25%, transparent 25%), linear-gradient(135deg, rgba(59, 130, 246, 0.3) 25%, transparent 25%)",
  "radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.3) 0%, transparent 70%), conic-gradient(from 180deg at 50% 50%, rgba(168, 85, 247, 0.3) 0deg, transparent 120deg)",
  "linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.2) 0%, transparent 60%)"
];

const AllQuiz = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { subjectId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `http://localhost:5000/api/v1/quize/quiz/subject/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setQuizzes(res.data.quizes || []);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [subjectId, getAccessTokenSilently]);

  const getRemainingTime = (targetDate) => {
    if (!targetDate) return "N/A";

    const now = new Date();
    const endDate = new Date(targetDate);

    const diffMs = endDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
    } else {
      return `${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      } ago`;
    }
  };

  const getQuizStatus = (targetDate) => {
    if (!targetDate) return "unknown";
    return new Date(targetDate) > new Date() ? "active" : "expired";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              onClick={() => navigate("/quiz")}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-white/70 hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Subjects</span>
            </motion.div>
          </div>

          {/* Creative Header with student theme */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Available Quizzes
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Challenge yourself and test your knowledge
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating decorative elements with student theme */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-15 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-teal-400 to-green-500 rounded-full opacity-10 blur-lg"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-12">
          {loading ? (
            <div className="text-center py-16">
              <QuizCardSkeleton />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-10"
              >
                <div className="w-28 h-28 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-14 h-14 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Loading Quizzes...</h3>
                <p className="text-gray-500 text-lg">Please wait while we fetch your quizzes</p>
              </motion.div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-28 h-28 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-14 h-14 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Quizzes Available</h3>
                <p className="text-gray-500 text-lg">Check back later for new quizzes in this subject</p>
              </motion.div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {quizzes.map((quiz, index) => {
                const gradientClass = studentQuizGradients[index % studentQuizGradients.length];
                const patternStyle = studentPatterns[index % studentPatterns.length];
                const status = getQuizStatus(quiz.date);
                const isActive = status === "active";

                return (
                  <motion.div
                    key={quiz._id || index}
                    initial={{ opacity: 0, y: 60, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ 
                      duration: 0.7, 
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 100
                    }}
                    className="group"
                  >
                    <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-110 relative">
                      {/* Creative gradient header with enhanced patterns */}
                      <div 
                        className={`h-36 ${gradientClass} relative overflow-hidden`}
                        style={{ background: patternStyle }}
                      >
                        {/* Enhanced animated background elements */}
                        <div className="absolute inset-0 opacity-40">
                          <div className="absolute top-3 right-3 w-20 h-20 border-2 border-white/40 rounded-full animate-pulse"></div>
                          <div className="absolute bottom-3 left-3 w-12 h-12 bg-white/30 rounded-full animate-bounce"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-white/30 rounded-2xl rotate-45 animate-pulse"></div>
                          <div className="absolute top-6 left-6 w-6 h-6 bg-white/40 rounded-full"></div>
                          <div className="absolute bottom-8 right-8 w-4 h-4 bg-white/50 rounded-full"></div>
                        </div>

                        {/* Status badge */}
                        <div className="absolute top-4 right-4">
                          <Badge
                            className={`${
                              isActive
                                ? "bg-white/90 text-green-700 border-green-200"
                                : "bg-white/90 text-red-700 border-red-200"
                            } font-semibold shadow-lg backdrop-blur-sm`}
                          >
                            {getRemainingTime(quiz.date)}
                          </Badge>
                        </div>

                        {/* Quiz title with enhanced styling */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-gray-800 font-bold text-xl leading-tight drop-shadow-2xl truncate">
                            {quiz.title}
                          </h3>
                          <div className="w-12 h-1 bg-white/60 rounded-full mt-2"></div>
                        </div>
                      </div>

                      {/* Enhanced content section */}
                      <CardContent className="p-6 space-y-5">
                        {/* Enhanced stats grid with icons */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Submit Date</p>
                              <p className="text-sm font-bold text-gray-700">{quiz.date}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                            <Timer className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Duration</p>
                              <p className="text-sm font-bold text-gray-700">{quiz.time}m</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Total Marks</p>
                              <p className="text-sm font-bold text-gray-700">{quiz.marks || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <Brain className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Questions</p>
                              <p className="text-sm font-bold text-gray-700">{quiz.questions?.length || quiz.totalQuestions || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced created date section */}
                        <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border-l-4 border-green-400">
                          <p className="text-xs text-gray-500 font-semibold mb-1">CREATED ON</p>
                          <p className="text-sm font-bold text-gray-800">
                            {quiz.createdAt
                              ? new Date(quiz.createdAt).toLocaleDateString('en-US', { 
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })
                              : 'N/A'
                            }
                          </p>
                        </div>

                        {/* Quiz availability status */}
                        <div className={`rounded-xl p-4 border-l-4 ${
                          isActive 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400'
                        }`}>
                          <p className="text-xs text-gray-500 font-semibold mb-1">STATUS</p>
                          <p className={`text-sm font-bold ${
                            isActive ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {isActive ? 'Available to Take' : 'Quiz Expired'}
                          </p>
                        </div>

                        {/* Enhanced action button */}
                        <Button
                          onClick={() => navigate(`/quiz/page/${quiz._id}`)}
                          disabled={!isActive}
                          className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 ${
                            isActive
                              ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100 hover:shadow-lg'
                          }`}
                        >
                          <Play className="w-5 h-5" />
                          {isActive ? 'Start Quiz' : 'Quiz Expired'}
                          {isActive && <Sparkles className="w-4 h-4" />}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Bottom stats section */}
        {!loading && quizzes.length > 0 && (
          <motion.div
            className="relative max-w-4xl mx-auto px-6 text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 shadow-xl">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-800">{quizzes.length}</p>
                    <p className="text-sm text-gray-600">Total Quizzes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-800">
                      {quizzes.filter(q => getQuizStatus(q.date) === 'active').length}
                    </p>
                    <p className="text-sm text-gray-600">Active Quizzes</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default AllQuiz;