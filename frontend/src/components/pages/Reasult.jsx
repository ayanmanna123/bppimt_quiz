import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Calendar, Clock, Brain, BookOpen, Sparkles, Award, Target, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import QuizCardSkeleton from "../QuizCardSkeleton";
import { generateWeaknessAttackQuiz } from "../services/geminiService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Unique gradient combinations for result cards
const resultGradients = [
  "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600",
  "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600",
  "bg-gradient-to-br from-orange-500 via-red-600 to-pink-600",
  "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600",
  "bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600",
  "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600",
  "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600",
  "bg-gradient-to-br from-lime-500 via-green-600 to-emerald-600",
];

// Creative mesh patterns for result cards
const resultPatterns = [
  "radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.4) 0%, transparent 50%), linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
  "conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0.3) 0deg, transparent 120deg, rgba(99, 102, 241, 0.3) 240deg)",
  "radial-gradient(circle at 70% 20%, rgba(239, 68, 68, 0.4) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
  "linear-gradient(45deg, rgba(6, 182, 212, 0.3) 25%, transparent 25%), linear-gradient(135deg, rgba(59, 130, 246, 0.3) 25%, transparent 25%)",
  "radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.3) 0%, transparent 70%), conic-gradient(from 180deg at 50% 50%, rgba(168, 85, 247, 0.3) 0deg, transparent 120deg)",
  "linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.2) 0%, transparent 60%)",
  "radial-gradient(circle at 30% 70%, rgba(244, 63, 94, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
  "linear-gradient(135deg, rgba(132, 204, 22, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 60%)"
];

const Result = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weaknessLoading, setWeaknessLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getResults = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/reasult/get/reasult/student`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResults(res.data.getReasult);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    getResults();
  }, [getAccessTokenSilently]);

  const today = new Date();
  const expiredResults = results.filter((item) => {
    if (!item?.quiz?.date) return false;
    const quizDate = new Date(item.quiz.date);
    return quizDate < today;
  });

  const getScorePercentage = (score, totalMarks) => {
    if (!totalMarks) return 0;
    return Math.round((score / totalMarks) * 100);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadgeColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (percentage >= 80) return "bg-blue-100 text-blue-700 border-blue-200";
    if (percentage >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (percentage >= 60) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getPerformanceText = (percentage) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Good";
    if (percentage >= 70) return "Average";
    if (percentage >= 60) return "Below Average";
    return "Needs Improvement";
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              onClick={() => navigate("/quiz")}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-white/70 hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Quizzes</span>
            </motion.div>
          </div>

          {/* Creative Header with results theme */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Quiz Results
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Your academic performance dashboard
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Button
                  onClick={async () => {
                    setWeaknessLoading(true);
                    const result = await generateWeaknessAttackQuiz(results);
                    setWeaknessLoading(false);

                    if (result.questions && result.questions.length > 0) {
                      setGeneratedQuiz(result);
                      setIsModalOpen(true);
                    } else {
                      toast.info(result.message);
                    }
                  }}
                  disabled={weaknessLoading || results.length === 0}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg"
                >
                  {weaknessLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Analyzing Weaknesses...
                    </>
                  ) : (
                    <>
                      <Target className="w-6 h-6 mr-2" />
                      Launch Weakness Attack Quiz
                      <Sparkles className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  AI analyzes your past mistakes to create a custom study plan
                </p>
              </motion.div>
            </motion.div>

            {/* Floating decorative elements with results theme */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-15 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-10 blur-lg"></div>
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
                <div className="w-28 h-28 bg-gradient-to-br from-purple-200 to-indigo-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Trophy className="w-14 h-14 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Loading Results...</h3>
                <p className="text-gray-500 text-lg">Please wait while we fetch your quiz results</p>
              </motion.div>
            </div>
          ) : expiredResults?.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-28 h-28 bg-gradient-to-br from-gray-200 to-slate-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Trophy className="w-14 h-14 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Results Found</h3>
                <p className="text-gray-500 text-lg">Complete some quizzes to see your results here</p>
              </motion.div>
            </div>
          ) : (
            <motion.div
              className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {expiredResults.map((result, index) => {
                const gradientClass = resultGradients[index % resultGradients.length];
                const patternStyle = resultPatterns[index % resultPatterns.length];
                const totalMarks = result?.quiz?.marks * result?.quiz?.totalQuestions;
                const percentage = getScorePercentage(result?.score, totalMarks);

                return (
                  <motion.div
                    key={index}
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
                    <Card
                      className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-105 relative cursor-pointer"
                      onClick={() => navigate(`/reasult/details/${result?._id}`)}
                    >
                      {/* Creative gradient header with enhanced patterns */}
                      <div
                        className={`h-40 ${gradientClass} relative overflow-hidden`}
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

                        {/* Performance badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className={`${getGradeBadgeColor(percentage)} font-semibold shadow-lg backdrop-blur-sm`}>
                            {percentage}% · {getPerformanceText(percentage)}
                          </Badge>
                        </div>

                        {/* Trophy icon for high scores */}
                        {percentage >= 80 && (
                          <div className="absolute top-4 left-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Award className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Quiz title with enhanced styling */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-gray-800 font-bold text-xl leading-tight drop-shadow-2xl truncate">
                            {result?.quiz?.title || "Untitled Quiz"}
                          </h3>
                          <div className="w-12 h-1 bg-white/60 rounded-full mt-2"></div>
                        </div>
                      </div>

                      {/* Enhanced content section */}
                      <CardContent className="p-6 space-y-5">
                        {/* Score section with circular progress */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full -translate-y-8 translate-x-8 opacity-60"></div>
                          <div className="relative z-10">
                            <p className="text-xs text-gray-500 font-semibold mb-2">YOUR SCORE</p>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-blue-600" />
                              <span className={`text-3xl font-bold ${getGradeColor(percentage)}`}>
                                {result?.score}
                              </span>
                              <span className="text-lg text-gray-400 font-medium">
                                / {totalMarks}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-sm font-bold text-gray-700">{percentage}% Accuracy</p>
                          </div>
                        </div>

                        {/* Subject and Department info */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <BookOpen className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Subject</p>
                              <p className="text-sm font-bold text-gray-800">{result?.quiz?.subject?.subjectName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                            <Users className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Department</p>
                              <p className="text-sm font-bold text-gray-700">
                                {result?.quiz?.subject?.department} ({result?.quiz?.subject?.semester} sem)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced stats grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Quiz Date</p>
                              <p className="text-sm font-bold text-gray-700">
                                {new Date(result?.quiz?.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                            <Brain className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Questions</p>
                              <p className="text-sm font-bold text-gray-700">{result?.quiz?.totalQuestions}</p>
                            </div>
                          </div>
                        </div>

                        {/* Submission time */}
                        <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4 border-l-4 border-purple-400">
                          <p className="text-xs text-gray-500 font-semibold mb-1">SUBMITTED ON</p>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <p className="text-sm font-bold text-gray-800">
                              {new Date(result?.submittedAt).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* View Details button */}
                        <div className="pt-2">
                          <div className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 cursor-pointer">
                            <Trophy className="w-5 h-5" />
                            View Detailed Results
                            <Sparkles className="w-4 h-4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Bottom stats section */}
        {!loading && expiredResults.length > 0 && (
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
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-800">{expiredResults.length}</p>
                    <p className="text-sm text-gray-600">Completed Quizzes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-800">
                      {Math.round(expiredResults.reduce((acc, result) => {
                        const totalMarks = result?.quiz?.marks * result?.quiz?.totalQuestions;
                        return acc + getScorePercentage(result?.score, totalMarks);
                      }, 0) / expiredResults.length)}%
                    </p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 p-6 text-white text-center relaltive overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
            <div className="relative z-10">
              <DialogTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                <Target className="w-8 h-8" />
                Weakness Attack Mode
              </DialogTitle>
              <DialogDescription className="text-red-100 text-lg mt-2 font-medium">
                Targeting: {generatedQuiz?.focusTopic}
              </DialogDescription>
            </div>
          </div>

          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Brain className="w-10 h-10 text-red-500" />
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              {generatedQuiz?.message}
            </p>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Questions</p>
                <p className="text-2xl font-bold text-gray-800">{generatedQuiz?.questions?.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Difficulty</p>
                <p className="text-2xl font-bold text-red-600">Adaptive Hard</p>
              </div>
            </div>

            <Button
              onClick={() => {
                // Navigate to quiz play page with generated questions passed in state
                // Assuming you have a route like /quiz/play/custom or handle custom quiz state
                // For now, we'll navigate to a new route that needs to be handled
                navigate('/quiz/play-weakness', { state: { questions: generatedQuiz?.questions, topic: generatedQuiz?.focusTopic } });
                setIsModalOpen(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Start Attack Quiz Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Result;