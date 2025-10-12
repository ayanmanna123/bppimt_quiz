import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import Navbar from "../shared/Navbar";

// Student-focused gradient combinations
const studentGradients = [
  "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600",
  "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600",
  "bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600",
  "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
  "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600",
  "bg-gradient-to-br from-pink-400 via-rose-500 to-red-600",
];

// Student-focused creative patterns
const studentPatterns = [
  "radial-gradient(circle at 25% 75%, rgba(59, 130, 246, 0.4) 0%, transparent 60%), linear-gradient(135deg, rgba(147, 197, 253, 0.3) 0%, transparent 70%)",
  "conic-gradient(from 90deg at 70% 30%, rgba(16, 185, 129, 0.4) 0deg, transparent 120deg, rgba(52, 211, 153, 0.3) 240deg)",
  "radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.4) 0%, transparent 70%), linear-gradient(45deg, rgba(167, 139, 250, 0.3) 0%, transparent 100%)",
  "linear-gradient(60deg, rgba(239, 68, 68, 0.3) 25%, transparent 25%), radial-gradient(circle at 75% 25%, rgba(251, 113, 133, 0.4) 0%, transparent 50%)",
  "conic-gradient(from 0deg at 40% 60%, rgba(245, 158, 11, 0.4) 0deg, transparent 90deg, rgba(251, 191, 36, 0.3) 180deg, transparent 270deg)",
  "radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.4) 0%, transparent 60%), linear-gradient(120deg, rgba(244, 114, 182, 0.3) 0%, transparent 100%)",
];

const StudentAttendanceSummary = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          "http://localhost:5000/api/v1/attandance/total-attandance",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAttendanceData(res.data);
      } catch (err) {
        console.error("Error fetching attendance summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [getAccessTokenSilently]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex justify-center items-center">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  if (!attendanceData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex justify-center items-center">
        <div className="text-center text-red-600">
          Failed to load attendance data.
        </div>
      </div>
    );
  }

  const { student, attendanceSummary } = attendanceData;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/20 rounded-2xl rotate-45"></div>
          </div>

          <div className="relative z-10 text-center py-16 px-6">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Attendance Summary
                </h1>
                <p className="text-white/90 text-lg">
                  Track your progress across all subjects
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="px-6 -mt-8 relative z-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">
                  {student.fullname} ({student.universityNo})
                </h2>
                <div className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600 font-medium">
                      Department: {student.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600 font-medium">
                      Semester: {student.semester}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary Cards */}
        <div className="px-6 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {attendanceSummary.map((subj, index) => {
              const gradientClass =
                studentGradients[index % studentGradients.length];
              const patternStyle =
                studentPatterns[index % studentPatterns.length];

              return (
                <Card
                  key={subj.subjectId}
                  className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-110"
                >
                  {/* Enhanced gradient header */}
                  <div
                    className={`h-44 ${gradientClass} relative overflow-hidden`}
                    style={{ background: patternStyle }}
                  >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/40 rounded-full"></div>
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/30 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-white/30 rounded-2xl rotate-45"></div>
                      <div className="absolute top-6 left-6 w-6 h-6 bg-white/40 rounded-full"></div>
                      <div className="absolute bottom-8 right-8 w-4 h-4 bg-white/50 rounded-full"></div>
                    </div>

                    {/* Subject info */}
                    <div className="absolute bottom-4 left-4 right-4 text-gray-900">
                      <h3 className="text-xl font-bold drop-shadow-2xl mb-2 leading-tight">
                        {subj.subjectName}
                      </h3>
                      <p className="text-sm opacity-90 drop-shadow mb-3">
                        Code: {subj.subjectCode}
                      </p>
                      <div className="w-12 h-1 bg-white/60 rounded-full"></div>
                    </div>
                  </div>

                  {/* Enhanced content */}
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            TOTAL DAYS
                          </p>
                          <p className="text-sm font-bold text-gray-700">
                            {subj.totalDays}
                          </p>
                        </div>
                      </div>
                       <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                             TOTAL DAY NEED FOR 75% ATTENDANCE
                          </p>
                          <p className="text-sm font-bold text-gray-700">
                            {subj.classesNeededFor75}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              PRESENT
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {subj.totalPresent}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              ABSENT
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {subj.totalAbsent}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className="text-gray-500">ATTENDANCE %</span>
                          <span className="text-gray-800">
                            {subj.attendancePercentage}%
                          </span>
                        </div>
                        <Progress
                          value={parseFloat(subj.attendancePercentage)}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentAttendanceSummary;
