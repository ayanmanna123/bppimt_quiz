import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Clock,
  Trophy,
  Brain,
  Eye,
  Sparkles,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import QuizCardSkeleton from "./QuizCardSkeleton";
import { Howl } from "howler";

// Unique gradient combinations for teacher quiz cards
const teacherQuizGradients = [
  "bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-600",
  "bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600",
  "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600",
  "bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600",
  "bg-gradient-to-br from-red-500 via-rose-600 to-pink-600",
  "bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-700",
];

// Creative mesh patterns for teacher cards
const teacherPatterns = [
  "conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0.3) 0deg, transparent 120deg, rgba(59, 130, 246, 0.3) 240deg)",
  "radial-gradient(circle at 30% 70%, rgba(168, 85, 247, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
  "linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, transparent 50%), linear-gradient(45deg, rgba(6, 182, 212, 0.3) 50%, transparent 100%)",
  "radial-gradient(ellipse at top, rgba(245, 158, 11, 0.3) 0%, transparent 70%), linear-gradient(45deg, rgba(251, 191, 36, 0.2) 0%, transparent 100%)",
  "conic-gradient(from 90deg at 50% 50%, rgba(239, 68, 68, 0.3) 0deg, transparent 90deg, rgba(236, 72, 153, 0.3) 180deg, transparent 270deg)",
  "linear-gradient(45deg, rgba(71, 85, 105, 0.3) 25%, transparent 25%), linear-gradient(-45deg, rgba(100, 116, 139, 0.3) 25%, transparent 25%)",
];

const TeacherCreateQuiz = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  // Fetch all quizzes
  const getAllQuizzes = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/quize/quiz/teacher`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuizzes(res.data.allQuize);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  useEffect(() => {
    getAllQuizzes();
  }, [getAccessTokenSilently]);

  // Delete Quiz
  const handleDelete = async (quizId) => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/quize/delet/quiz`,
        {
          data: { quizId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sound = new Howl({
        src: ["/notification.wav"],
        volume: 0.7,
      });
      sound.play();
      toast.success(res.data.message);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              onClick={() => navigate("/Admin/subject")}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-white/70 hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Subjects</span>
            </motion.div>
          </div>

          {/* Creative Header with teacher theme */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Teacher's Quiz Hub
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Your comprehensive quiz management dashboard
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating decorative elements with teacher theme */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-15 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-10 blur-lg"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-12">
          {quizzes.length === 0 ? (
            <div className="text-center py-16">
              <QuizCardSkeleton />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-10"
              >
                <div className="w-28 h-28 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Brain className="w-14 h-14 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No Quizzes Yet
                </h3>
                <p className="text-gray-500 text-lg">
                  Ready to create your first masterpiece quiz?
                </p>
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
                const gradientClass =
                  teacherQuizGradients[index % teacherQuizGradients.length];
                const patternStyle =
                  teacherPatterns[index % teacherPatterns.length];

                return (
                  <motion.div
                    key={quiz._id}
                    initial={{ opacity: 0, y: 60, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="group"
                  >
                    <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-110   relative">
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

                        {/* Enhanced delete button */}
                        <div className="absolute top-4 right-4">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(quiz._id);
                            }}
                            className="h-9 w-9 bg-red-500/90 hover:bg-red-600 backdrop-blur-md border-0 shadow-xl rounded-full transition-all duration-300 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Quiz title with enhanced styling */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="  font-bold text-xl leading-tight drop-shadow-2xl truncate text-gray-800">
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
                              <p className="text-xs text-gray-500 font-medium">
                                Date
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {quiz.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                            <Clock className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                Time
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {quiz.time}m
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                Marks
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {quiz.marks}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <Brain className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                Questions
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {quiz.totalQuestions}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced created date section */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                          <p className="text-xs text-gray-500 font-semibold mb-1">
                            CREATED ON
                          </p>
                          <p className="text-sm font-bold text-gray-800">
                            {new Date(quiz.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>

                        {/* Enhanced action button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/reasult/${quiz._id}`);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105"
                        >
                          <Eye className="w-5 h-5" />
                          View Results
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherCreateQuiz;
