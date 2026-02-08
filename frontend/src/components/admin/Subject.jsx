import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  Eye,
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SchlitonSubject from "./SchlitonSubject";
import EditTimeSlotModal from "./EditTimeSlotModal";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Enhanced gradient combinations for subject cards
const subjectGradients = [
  "bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600",
  "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600",
  "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600",
  "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600",
  "bg-gradient-to-br from-pink-500 via-rose-600 to-red-600",
  "bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-700",
];

// Creative mesh patterns for subject cards
const subjectPatterns = [
  "radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)",
  "linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, transparent 50%), linear-gradient(45deg, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
  "conic-gradient(from 180deg at 50% 50%, rgba(16, 185, 129, 0.3) 0deg, transparent 120deg, rgba(34, 197, 94, 0.3) 240deg)",
  "radial-gradient(ellipse at bottom, rgba(245, 158, 11, 0.4) 0%, transparent 70%), linear-gradient(-45deg, rgba(251, 146, 60, 0.3) 0%, transparent 100%)",
  "linear-gradient(60deg, rgba(236, 72, 153, 0.3) 25%, transparent 25%), linear-gradient(120deg, rgba(219, 39, 119, 0.3) 25%, transparent 25%)",
  "conic-gradient(from 45deg at 30% 70%, rgba(71, 85, 105, 0.3) 0deg, transparent 90deg, rgba(100, 116, 139, 0.3) 180deg, transparent 270deg)",
];

const Subject = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/subject/teacher/subject`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSubjects(res.data.subjects);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSubjects();
  }, [getAccessTokenSilently]);

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <motion.div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-white/70 hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/admin/create/subject")}
                className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-2xl font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create New Subject
                <Sparkles className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Creative Header with subject theme */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    My Subject Library
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Manage your course subjects and educational content
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating decorative elements with subject theme */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-15 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full opacity-10 blur-lg"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-12">
          {subjects.length === 0 ? (
            <div className="text-center py-16">
              <SchlitonSubject />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-10"
              >
                <div className="w-28 h-28 bg-gradient-to-br from-purple-200 to-violet-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-14 h-14 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No Subjects Yet
                </h3>
                <p className="text-gray-500 text-lg">
                  Ready to create your first subject?
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
              {subjects.map((subj, index) => {
                const gradientClass =
                  subjectGradients[index % subjectGradients.length];
                const patternStyle =
                  subjectPatterns[index % subjectPatterns.length];

                return (
                  <motion.div
                    key={subj._id}
                    initial={{ opacity: 0, y: 60, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="group cursor-pointer"
                  >
                    <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-110 relative h-full">
                      {/* Creative gradient header with enhanced patterns */}
                      <div
                        className={`h-40 ${gradientClass} relative overflow-hidden`}
                        style={{ background: patternStyle }}
                      >
                        {/* Enhanced animated background elements */}
                        <div className="absolute inset-0 opacity-40">
                          <div className="absolute top-3 right-3 w-16 h-16 border-2 border-white/40 rounded-full animate-pulse"></div>
                          <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/30 rounded-full animate-bounce"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/30 rounded-2xl rotate-45 animate-pulse"></div>
                          <div className="absolute top-4 left-4 w-4 h-4 bg-white/40 rounded-full"></div>
                          <div className="absolute bottom-6 right-6 w-3 h-3 bg-white/50 rounded-full"></div>
                        </div>

                        {/* Subject info overlay with enhanced styling */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <CardTitle className="text-xl font-bold drop-shadow-2xl mb-1 leading-tight truncate text-black">
                            {subj?.subjectName}
                          </CardTitle>
                          <p className="text-sm opacity-90 drop-shadow truncate">
                            {subj?.description || "Educational Content"}
                          </p>
                          <div className="w-10 h-1 bg-white/60 rounded-full mt-2"></div>
                        </div>
                      </div>

                      {/* Enhanced course details section */}
                      <CardContent className="p-6 flex-grow">
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                SUBJECT CODE
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {subj?.subjectCode}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                            <Users className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                DEPARTMENT
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {subj?.department}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                SEMESTER
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {subj?.semester}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      {/* Enhanced action buttons section */}
                      <CardFooter className="p-6 pt-0 space-y-3">
                        <div className="w-full space-y-3">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/createQuize/${subj._id}`);
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white flex items-center justify-center gap-3 transition-all duration-300 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                          >
                            <Plus className="w-5 h-5" />
                            Create Quiz
                            <Sparkles className="w-4 h-4" />
                          </Button>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/Admin/subject/quiz/${subj._id}`);
                            }}
                            className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white flex items-center justify-center gap-3 transition-all duration-300 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                          >
                            <Eye className="w-5 h-5" />
                            View Quizzes
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/attandance/${subj._id}`);
                            }}
                            className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white flex items-center justify-center gap-3 transition-all duration-300 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                          >
                            <Eye className="w-5 h-5" />
                            view Attandance
                          </Button>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubject(subj);
                              setIsTimeSlotModalOpen(true);
                            }}
                            className="w-full bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:via-orange-700 hover:to-red-700 text-white flex items-center justify-center gap-3 transition-all duration-300 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                          >
                            <Clock className="w-5 h-5" />
                            Edit Time Slots
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      <EditTimeSlotModal
        isOpen={isTimeSlotModalOpen}
        onClose={() => {
          setIsTimeSlotModalOpen(false);
          setSelectedSubject(null);
        }}
        subjectId={selectedSubject?._id}
        subjectName={selectedSubject?.subjectName}
      />
    </>
  );
};

export default Subject;
