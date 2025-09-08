import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { ArrowLeft, Trash2, Calendar, Clock, Award, HelpCircle, Eye, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import QuizCardSkeleton from "./QuizCardSkeleton";
import { Howl } from "howler";
import { toast } from "sonner";

// Creative gradient backgrounds with different styles
const quizGradients = [
  "bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600",
  "bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600", 
  "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
  "bg-gradient-to-br from-lime-400 via-green-500 to-teal-600",
  "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500",
  "bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600",
];

// Creative background patterns
const backgroundPatterns = [
  "radial-gradient(circle at 20% 50%, rgba(120,119,198,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.3) 0%, transparent 50%)",
  "linear-gradient(45deg, rgba(0,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,255,255,0.1) 25%, transparent 25%)",
  "radial-gradient(circle at 50% 50%, rgba(255,0,150,0.2) 0%, transparent 70%)",
  "linear-gradient(90deg, rgba(50,205,50,0.1) 0%, transparent 100%)",
  "conic-gradient(from 180deg at 50% 50%, rgba(255,215,0,0.2) 0deg, transparent 60deg, rgba(255,215,0,0.2) 120deg, transparent 180deg)",
  "radial-gradient(ellipse at center, rgba(255,20,147,0.2) 0%, transparent 70%)"
];

const SubjectRelatedQuiz = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [quizzes, setQuizzes] = useState([]);
  const { subjectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `https://bppimt-quiz-kml1.vercel.app/api/v1/quize/getSubjectId/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuizzes(res.data.allquiz || []);
        
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, [getAccessTokenSilently, subjectId]);

  const handleDelete = async (quizId) => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.delete(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/quize/delet/quiz",
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Header Section */}
        <div className="p-2">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              onClick={() => navigate("/Admin/subject")}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors p-2 rounded-lg hover:bg-white/60"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Subjects</span>
            </motion.div>
          </div>

          {/* Creative Header with floating elements */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Quizzes
                </h1>
              </div>
              
            </motion.div>

            {/* Floating decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 blur-2xl"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-12">
          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <QuizCardSkeleton />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <HelpCircle className="w-12 h-12 text-gray-500" />
                </div>
                <p className="text-gray-500 text-lg">No quizzes created yet.</p>
                <p className="text-gray-400 text-sm mt-2">Start by creating your first quiz!</p>
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
                const gradientClass = quizGradients[index % quizGradients.length];
                const patternStyle = backgroundPatterns[index % backgroundPatterns.length];

                return (
                  <motion.div
                    key={quiz._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-2xl transform hover:scale-105 relative">
                      {/* Creative gradient header with pattern */}
                      <div 
                        className={`h-32 ${gradientClass} relative overflow-hidden`}
                        style={{ background: patternStyle }}
                      >
                        {/* Animated background shapes */}
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute top-2 right-2 w-16 h-16 border-2 border-white/30 rounded-full"></div>
                          <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/20 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/20 rounded-lg rotate-45"></div>
                        </div>

                        {/* Delete button */}
                        <div className="absolute top-3 right-3">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(quiz._id);
                            }}
                            className="h-8 w-8 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm border-0 shadow-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Quiz title overlay */}
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-gray-700 font-bold text-lg leading-tight drop-shadow-lg truncate">
                            {quiz.title}
                          </h3>
                        </div>
                      </div>

                      {/* Content section */}
                      <CardContent className="p-2 space-y-4">
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span className="text-gray-600">{quiz.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-600">{quiz.time}m</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-gray-600">{quiz.marks} pts</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <HelpCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{quiz.totalQuestions} Q</span>
                          </div>
                        </div>

                        {/* Created date with creative styling */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-medium">Created</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {new Date(quiz.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>

                        {/* Action button with gradient */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/reasult/${quiz._id}`);
                          }}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <Eye className="w-4 h-4" />
                          View Results
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

export default SubjectRelatedQuiz;