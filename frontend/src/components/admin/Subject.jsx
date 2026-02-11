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
  Clock,
  FileText,
  ClipboardList,
  Sparkles,
  Video,
} from "lucide-react";

import { toast } from "sonner";
import { motion } from "framer-motion";
import SchlitonSubject from "./SchlitonSubject";
import EditTimeSlotModal from "./EditTimeSlotModal";
import CreateMeetingModal from "./CreateMeetingModal";
import ChatWindow from "../chat/ChatWindow";
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
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [activeChatSubject, setActiveChatSubject] = useState(null);
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
                    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 rounded-2xl group h-full flex flex-col">
                      {/* Compact Colorful Header */}
                      <div
                        className={`h-24 ${gradientClass} relative overflow-hidden p-4 flex flex-col justify-end`}
                      >
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{ background: patternStyle }}
                        ></div>
                        <div className="absolute inset-0 bg-black/10"></div>

                        <div className="relative z-10 text-white">
                          <h3 className="font-bold text-lg leading-tight truncate">
                            {subj?.subjectName}
                          </h3>
                          <p className="text-xs opacity-90 truncate">
                            {subj?.description || "Educational Content"}
                          </p>
                        </div>
                      </div>

                      {/* Content Grid */}
                      <CardContent className="p-4 flex-grow">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-1 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                              Code
                            </p>
                            <p className="text-sm font-bold text-gray-700 truncate">
                              {subj?.subjectCode}
                            </p>
                          </div>

                          <div className="col-span-1 bg-purple-50/50 p-2 rounded-lg border border-purple-100/50">
                            <p className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">
                              Dept
                            </p>
                            <p className="text-sm font-bold text-gray-700 truncate">
                              {subj?.department}
                            </p>
                          </div>

                          <div className="col-span-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">
                                Semester
                              </p>
                              <p className="text-sm font-bold text-gray-700 truncate">
                                {subj?.semester}
                              </p>
                            </div>
                            <GraduationCap className="w-4 h-4 text-indigo-400 opacity-50" />
                          </div>
                        </div>
                      </CardContent>

                      {/* Actions Footer */}
                      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/createQuize/${subj._id}`);
                          }}
                          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl font-medium"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Quiz
                        </Button>

                        <div className="grid grid-cols-5 gap-2 w-full">
                          <Button
                            variant="outline"
                            size="icon"
                            title="Notes"
                            className="w-full h-9 rounded-lg border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/subject/notes/${subj._id}`);
                            }}
                          >
                            <FileText className="w-4 h-4 text-gray-600 hover:text-indigo-600" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            title="Assignments"
                            className="w-full h-9 rounded-lg border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/subject/assignments/${subj._id}`);
                            }}
                          >
                            <ClipboardList className="w-4 h-4 text-gray-600 hover:text-pink-600" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            title="View Quizzes"
                            className="w-full h-9 rounded-lg border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/Admin/subject/quiz/${subj._id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 text-gray-600 hover:text-emerald-600" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            title="Schedule Meeting"
                            className="w-full h-9 rounded-lg border-gray-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubject(subj);
                              setIsMeetingModalOpen(true);
                            }}
                          >
                            <Video className="w-4 h-4 text-gray-600 hover:text-violet-600" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            title="View Attendance"
                            className="w-full h-9 rounded-lg border-gray-200 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/attandance/${subj._id}`);
                            }}
                          >
                            <Users className="w-4 h-4 text-gray-600 hover:text-cyan-600" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            title="Edit Time Slots"
                            className="w-full h-9 rounded-lg border-gray-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubject(subj);
                              setIsTimeSlotModalOpen(true);
                            }}
                          >
                            <Clock className="w-4 h-4 text-gray-600 hover:text-amber-600" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            title="Question Bank"
                            className="w-full h-9 rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/question-bank/${subj._id}`);
                            }}
                          >
                            <BookOpen className="w-4 h-4 text-gray-600 hover:text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            title="Chat Group"
                            className="w-full h-9 rounded-lg border-gray-200 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveChatSubject(subj);
                            }}
                          >
                            <Video className="w-4 h-4 text-gray-600 hover:text-slate-600" />
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

      <CreateMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => {
          setIsMeetingModalOpen(false);
          setSelectedSubject(null);
        }}
        subjectId={selectedSubject?._id}
        subjectName={selectedSubject?.subjectName}
      />

      {activeChatSubject && (
        <ChatWindow
          subjectId={activeChatSubject._id}
          subjectName={activeChatSubject.subjectName}
          onClose={() => setActiveChatSubject(null)}
        />
      )}
    </>
  );
};

export default Subject;
