import React from "react";
import Navbar from "../shared/Navbar";
import { useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Users,
  GraduationCap,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  Sparkles,
  Settings,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const OtherTeacher = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which teacher status is being updated
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          "https://bppimt-quiz-kml1.vercel.app/api/v1/subject/pending/teacher",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubjects(res.data.subjects);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [getAccessTokenSilently]);

  // Function to update teacher status
  const updateTeacherStatus = async (subjectId, teacherId, newStatus) => {
    try {
      setUpdatingStatus(`${subjectId}-${teacherId}`);

      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const response = await axios.patch(
        `https://bppimt-quiz-kml1.vercel.app/api/v1/subject/updateStatus/${subjectId}`,
        {
          teacherId: teacherId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update the local state with the new status
        setSubjects((prevSubjects) =>
          prevSubjects.map((subject) => {
            if (subject._id === subjectId) {
              return {
                ...subject,
                otherTeachers: subject.otherTeachers.map((teacher) => {
                  if (teacher.teacher._id === teacherId) {
                    return { ...teacher, status: newStatus };
                  }
                  return teacher;
                }),
              };
            }
            return subject;
          })
        );
      }
    } catch (error) {
      console.error("Error updating teacher status:", error);
      // You can add a toast notification here for error feedback
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accept":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reject":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accept":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "reject":
        return <XCircle className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg">Loading other teachers...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
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
          </div>

          {/* Creative Header with teacher collaboration theme */}
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
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <UserCheck className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Other Teachers
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Collaborate with teachers across subjects
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-15 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full opacity-10 blur-lg"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-12">
          {subjects.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-10"
              >
                <div className="w-28 h-28 bg-gradient-to-br from-purple-200 to-violet-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Users className="w-14 h-14 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No Other Teachers Yet
                </h3>
                <p className="text-gray-500 text-lg">
                  No collaborative teaching assignments found
                </p>
              </motion.div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {subjects.map((subject, index) => {
                const gradientClass =
                  subjectGradients[index % subjectGradients.length];
                const patternStyle =
                  subjectPatterns[index % subjectPatterns.length];

                return (
                  <motion.div
                    key={subject._id}
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
                    <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-105 relative h-full">
                      {/* Creative gradient header */}
                      <div
                        className={`h-32 ${gradientClass} relative overflow-hidden`}
                        style={{ background: patternStyle }}
                      >
                        {/* Animated background elements */}
                        <div className="absolute inset-0 opacity-40">
                          <div className="absolute top-3 right-3 w-12 h-12 border-2 border-white/40 rounded-full animate-pulse"></div>
                          <div className="absolute bottom-3 left-3 w-6 h-6 bg-white/30 rounded-full animate-bounce"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 rounded-xl rotate-45 animate-pulse"></div>
                        </div>

                        {/* Subject info overlay */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <CardTitle className="text-lg font-bold drop-shadow-2xl mb-1 leading-tight truncate text-black">
                            {subject?.subjectName}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white text-xs border-white/30">
                              {subject?.subjectCode}
                            </Badge>
                            <div className="w-8 h-0.5 bg-white/60 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Subject details and teachers list */}
                      <CardContent className="p-6">
                        {/* Subject Info */}
                        <div className="mb-6 space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <Users className="w-4 h-4 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 font-medium">
                                DEPARTMENT
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {subject?.department}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                            <GraduationCap className="w-4 h-4 text-purple-600" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 font-medium">
                                SEMESTER
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {subject?.semester}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Other Teachers List */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <UserCheck className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-semibold text-gray-700">
                              Collaborating Teachers
                            </h4>
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                          </div>

                          {subject.otherTeachers &&
                          subject.otherTeachers.length > 0 ? (
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                              {subject.otherTeachers.map(
                                (otherTeacher, teacherIndex) => (
                                  <motion.div
                                    key={teacherIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: teacherIndex * 0.1 }}
                                    className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">
                                              {otherTeacher.teacher?.fullname?.charAt(
                                                0
                                              )}
                                            </span>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-800 text-sm">
                                              {otherTeacher.teacher?.fullname}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-10">
                                          <Mail className="w-3 h-3" />
                                          <span className="truncate">
                                            {otherTeacher.teacher?.email}
                                          </span>
                                        </div>
                                      </div>
                                      <Badge
                                        className={`${getStatusColor(
                                          otherTeacher.status
                                        )} flex items-center gap-1 text-xs font-medium`}
                                      >
                                        {getStatusIcon(otherTeacher.status)}
                                        {otherTeacher.status}
                                      </Badge>
                                    </div>

                                    {/* Status Action Buttons - Only show if status is pending */}
                                    {otherTeacher.status === "pending" && (
                                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 flex-1">
                                          Update Status:
                                        </p>
                                        <div className="flex gap-2">
                                          <motion.button
                                            onClick={() =>
                                              updateTeacherStatus(
                                                subject._id,
                                                otherTeacher.teacher._id,
                                                "accept"
                                              )
                                            }
                                            disabled={
                                              updatingStatus ===
                                              `${subject._id}-${otherTeacher.teacher._id}`
                                            }
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            <Check className="w-3 h-3" />
                                            Accept
                                          </motion.button>
                                          <motion.button
                                            onClick={() =>
                                              updateTeacherStatus(
                                                subject._id,
                                                otherTeacher.teacher._id,
                                                "reject"
                                              )
                                            }
                                            disabled={
                                              updatingStatus ===
                                              `${subject._id}-${otherTeacher.teacher._id}`
                                            }
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            <X className="w-3 h-3" />
                                            Reject
                                          </motion.button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Loading indicator */}
                                    {updatingStatus ===
                                      `${subject._id}-${otherTeacher.teacher._id}` && (
                                      <div className="flex items-center justify-center pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <div className="w-3 h-3 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
                                          Updating status...
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-2xl">
                              <UserCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                No other teachers assigned
                              </p>
                            </div>
                          )}
                        </div>
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

export default OtherTeacher;
