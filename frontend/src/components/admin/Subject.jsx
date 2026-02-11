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
  MoreVertical,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600",
  "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600",
  "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600",
  "bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600",
];

const cardThemes = [
  {
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    btnColor: "bg-[#6366F1]",
    accentLabel: "text-[#6366F1]",
    accentBg: "bg-[#F5F3FF]"
  },
  {
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    btnColor: "bg-[#10B981]",
    accentLabel: "text-[#10B981]",
    accentBg: "bg-[#F0FDF4]"
  },
  {
    gradient: "from-rose-500 via-pink-600 to-purple-600",
    btnColor: "bg-[#F43F5E]",
    accentLabel: "text-[#F43F5E]",
    accentBg: "bg-[#FFF1F2]"
  },
  {
    gradient: "from-amber-500 via-orange-600 to-rose-600",
    btnColor: "bg-[#F59E0B]",
    accentLabel: "text-[#F59E0B]",
    accentBg: "bg-[#FFFBEB]"
  }
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
                const theme = cardThemes[index % cardThemes.length];

                return (
                  <motion.div
                    key={subj._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    className="group"
                  >
                    <Card className="overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 rounded-[2.5rem] h-full flex flex-col">
                      {/* Premium Header */}
                      <div className={`h-40 bg-gradient-to-r ${theme.gradient} p-8 relative flex flex-col justify-end`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                            {subj?.subjectName}
                          </h3>
                          <p className="text-white/80 text-sm font-medium mt-1">
                            {subj?.description || "Educational Content"}
                          </p>
                        </div>
                      </div>

                      {/* Details Box Grid */}
                      <CardContent className="p-8 pb-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-4 rounded-[1.5rem] bg-[#F8FAFC] border border-[#F1F5F9]">
                            <p className="text-[10px] font-bold text-blue-600 tracking-wider mb-1 uppercase">Code</p>
                            <p className="text-base font-bold text-gray-800">{subj?.subjectCode}</p>
                          </div>
                          <div className="p-4 rounded-[1.5rem] bg-[#FDF2F8] border border-[#FCE7F3]">
                            <p className="text-[10px] font-bold text-pink-600 tracking-wider mb-1 uppercase">Dept</p>
                            <p className="text-base font-bold text-gray-800">{subj?.department}</p>
                          </div>
                        </div>

                        <div className="p-5 rounded-[1.5rem] bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-between mb-8">
                          <div>
                            <p className="text-[10px] font-bold text-indigo-600 tracking-wider mb-1 uppercase">Semester</p>
                            <p className="text-base font-bold text-gray-800">{subj?.semester}</p>
                          </div>
                          <GraduationCap className="w-6 h-6 text-indigo-400 opacity-60" />
                        </div>

                        {/* Actions Area */}
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/createQuize/${subj._id}`);
                            }}
                            className={`flex-1 ${theme.btnColor} hover:brightness-110 text-white font-bold py-7 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-indigo-100`}
                          >
                            <Plus className="w-5 h-5" />
                            Create Quiz
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-16 h-16 rounded-[1.5rem] border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors bg-white shadow-sm"
                              >
                                <MoreVertical className="w-6 h-6 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl">
                              {[
                                { icon: FileText, title: "View Notes", color: "text-indigo-500", onClick: () => navigate(`/subject/notes/${subj._id}`) },
                                { icon: ClipboardList, title: "Assignments", color: "text-pink-500", onClick: () => navigate(`/subject/assignments/${subj._id}`) },
                                { icon: Eye, title: "View Quizzes", color: "text-emerald-500", onClick: () => navigate(`/Admin/subject/quiz/${subj._id}`) },
                                { icon: Video, title: "Schedule Meeting", color: "text-violet-500", onClick: () => { setSelectedSubject(subj); setIsMeetingModalOpen(true); } },
                                { icon: Users, title: "View Attendance", color: "text-cyan-500", onClick: () => navigate(`/attandance/${subj._id}`) },
                                { icon: Clock, title: "Edit Time Slots", color: "text-amber-500", onClick: () => { setSelectedSubject(subj); setIsTimeSlotModalOpen(true); } },
                                { icon: BookOpen, title: "Question Bank", color: "text-blue-500", onClick: () => navigate(`/admin/question-bank/${subj._id}`) },
                                { icon: Video, title: "Chat Group", color: "text-slate-500", onClick: () => setActiveChatSubject(subj) },
                              ].map((action, i) => (
                                <DropdownMenuItem
                                  key={i}
                                  onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                                  className="flex items-center gap-3 p-3 cursor-pointer rounded-xl"
                                >
                                  <action.icon className={`w-5 h-5 ${action.color}`} />
                                  <span className="font-semibold text-gray-700">{action.title}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
