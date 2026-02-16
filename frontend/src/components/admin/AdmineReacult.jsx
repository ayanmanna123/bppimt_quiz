import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";

import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Target,
  Star,
  Trophy,
  AlertTriangle,
  CheckSquare,
  User,
  Mail,
  Sparkles,
  ChevronDown,
  FileText,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Admin-focused gradient combinations
const adminGradients = [
  "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800",
  "bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800",
  "bg-gradient-to-br from-amber-600 via-orange-700 to-red-800",
  "bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800",
  "bg-gradient-to-br from-blue-600 via-cyan-700 to-teal-800",
  "bg-gradient-to-br from-rose-600 via-pink-700 to-purple-800",
];

const AdmineResult = () => {
  const { darktheme } = useSelector((store) => store.auth);
  const { getAccessTokenSilently } = useAuth0();
  const { quizeId } = useParams();
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    onTimeSubmissions: 0,
    lateSubmissions: 0,
    passRate: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/reasult/get/allReasult/${quizeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const resultData = res.data.allReasult || [];
        setResults(resultData);
        setFilteredResults(resultData);

        // Calculate statistics
        calculateStats(resultData);
      } catch (error) {
        console.log("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [getAccessTokenSilently, quizeId]);

  const calculateStats = (data) => {
    if (data.length === 0) return;

    const totalStudents = data.length;
    const totalScore = data.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / totalStudents;

    const onTime = data.filter(
      (result) =>
        checkSubmissionStatus(result.quiz, result.submittedAt) === "onTime"
    ).length;
    const late = totalStudents - onTime;

    const passRate =
      (data.filter((result) => result.score >= 60).length / totalStudents) *
      100;

    setStats({
      totalStudents,
      averageScore: Math.round(averageScore * 100) / 100,
      onTimeSubmissions: onTime,
      lateSubmissions: late,
      passRate: Math.round(passRate * 100) / 100,
    });
  };

  // Helper to check if submission is on time
  const checkSubmissionStatus = (quiz, submittedAt) => {
    const quizEnd = new Date(quiz.date);
    quizEnd.setMinutes(quizEnd.getMinutes() + parseInt(quiz.time));
    const submittedDate = new Date(submittedAt);
    return submittedDate <= quizEnd ? "onTime" : "late";
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = results.filter((result) => {
      const matchesSearch =
        result.student?.fullname
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        result.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.universityNo
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "onTime" &&
          checkSubmissionStatus(result.quiz, result.submittedAt) ===
          "onTime") ||
        (statusFilter === "late" &&
          checkSubmissionStatus(result.quiz, result.submittedAt) === "late");

      return matchesSearch && matchesStatus;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.score - a.score;
        case "name":
          return a.student?.fullname?.localeCompare(b.student?.fullname) || 0;
        case "submissionTime":
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  }, [results, searchTerm, statusFilter, sortBy]);

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-blue-600 bg-blue-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getPerformanceIcon = (score) => {
    if (score >= 85) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (score >= 70) return <Award className="w-4 h-4 text-blue-500" />;
    if (score >= 60) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const exportToExcel = () => {
    try {
      // Prepare data for Excel export
      const exportData = filteredResults.map((result, index) => {
        const status = checkSubmissionStatus(result.quiz, result.submittedAt);

        // Calculate correct/incorrect answers
        const correctAnswers =
          result.answers?.filter((ans) => ans.isCorrect).length || 0;
        const totalQuestions = result.answers?.length || 0;
        const incorrectAnswers = totalQuestions - correctAnswers;

        return {
          "S.No": index + 1,
          "University No": result.student?.universityNo || "N/A", // ✅ Added new column
          "Student Name": result.student?.fullname || "N/A",
          Email: result.student?.email || "N/A",
          Role: result.student?.role || "Student",
          Score: result.score,
          "Total Questions": totalQuestions,
          "Correct Answers": correctAnswers,
          "Incorrect Answers": incorrectAnswers,
          "Accuracy (%)":
            totalQuestions > 0
              ? Math.round((correctAnswers / totalQuestions) * 100)
              : 0,
          "Submission Status": status === "onTime" ? "On Time" : "Late",
          "Submitted At": new Date(result.submittedAt).toLocaleString(),
          "Quiz Date": new Date(result.quiz?.date).toLocaleDateString(),
          "Quiz Duration (min)": result.quiz?.time || "N/A",
        };
      });

      // Add summary statistics at the top
      const summaryData = [
        {
          "S.No": "SUMMARY",
          "University No": "", // ✅ Empty since summary isn’t per student
          "Student Name": "Total Students",
          Email: stats.totalStudents,
          Role: "Average Score",
          Score: stats.averageScore,
          "Total Questions": "Pass Rate (%)",
          "Correct Answers": stats.passRate,
          "Incorrect Answers": "On Time",
          "Accuracy (%)": stats.onTimeSubmissions,
          "Submission Status": "Late",
          "Submitted At": stats.lateSubmissions,
          "Quiz Date": "",
          "Quiz Duration (min)": "",
        },
        {}, // Empty row for separation
      ];

      // Combine summary and detailed data
      const finalData = [...exportData]; // If you want summary on top: [...summaryData, ...exportData]

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(finalData);

      // Set column widths (added University No)
      const colWidths = [
        { wch: 8 },  // S.No
        { wch: 18 }, // University No ✅
        { wch: 29 }, // Student Name
        { wch: 29 }, // Email
        { wch: 12 }, // Role
        { wch: 10 }, // Score
        { wch: 15 }, // Total Questions
        { wch: 15 }, // Correct Answers
        { wch: 16 }, // Incorrect Answers
        { wch: 12 }, // Accuracy
        { wch: 15 }, // Status
        { wch: 18 }, // Submitted At
        { wch: 12 }, // Quiz Date
        { wch: 18 }, // Duration
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Quiz Results");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Quiz_Results_${quizeId}_${currentDate}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);

      toast.success("Excel file downloaded successfully!")
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  if (loading) {
    return (
      <>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-100 dark:from-slate-950 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center transition-colors">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full"
          />
        </div>
      </>
    );
  }

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-100 dark:from-slate-950 dark:via-gray-900 dark:to-blue-950 transition-colors duration-500">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 dark:from-slate-900 dark:via-black dark:to-slate-900 opacity-95 transition-colors"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 right-1/3 w-40 h-40 border border-white/20 rounded-2xl rotate-45 animate-pulse"></div>
          </div>

          <div className="relative z-10 px-6 py-8">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <Button
                onClick={() => navigate("/admin/allquiz")}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Quizzes
              </Button>
            </motion.div>

            {/* Title and Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckSquare className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Quiz Results Dashboard 📊
                  </h1>
                  <p className="text-white/90 text-lg">
                    Comprehensive analysis and student performance overview
                  </p>
                </div>
              </div>

              {/* Admin Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-white/10">
                  <Users className="w-6 h-6 text-blue-400 mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-white">
                    {stats.totalStudents}
                  </div>
                  <div className="text-white/80 text-sm">Total Students</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-white/10">
                  <TrendingUp className="w-6 h-6 text-green-400 mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-white">
                    {stats.averageScore}
                  </div>
                  <div className="text-white/80 text-sm">Average Score</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-white/10">
                  <CheckCircle className="w-6 h-6 text-emerald-400 mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-white">
                    {stats.onTimeSubmissions}
                  </div>
                  <div className="text-white/80 text-sm">On Time</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-white/10">
                  <Clock className="w-6 h-6 text-orange-400 mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-white">
                    {stats.lateSubmissions}
                  </div>
                  <div className="text-white/80 text-sm">Late</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-white/10">
                  <Trophy className="w-6 h-6 text-yellow-400 mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-white">
                    {stats.passRate}%
                  </div>
                  <div className="text-white/80 text-sm">Pass Rate</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        <div className="px-6 -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-6 mb-8 transition-colors"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Students
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, university number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-white/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-400 dark:text-gray-100 transition-all duration-300 font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Submission Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-white/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-green-400 dark:text-gray-100 transition-all duration-300 font-medium appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="onTime">On Time</option>
                    <option value="late">Late Submissions</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Sort Results
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-white/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-purple-400 dark:text-gray-100 transition-all duration-300 font-medium appearance-none"
                  >
                    <option value="score">Highest Score</option>
                    <option value="name">Student Name</option>
                    <option value="submissionTime">Submission Time</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Quick Actions
                </label>
                <Button
                  onClick={exportToExcel}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  Export Results
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Results Grid */}
        <div className="px-6 pb-12">
          {filteredResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-gray-200 to-slate-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Users className="w-14 h-14 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Try adjusting your search or filters
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {filteredResults.map((result, index) => {
                const status = checkSubmissionStatus(
                  result.quiz,
                  result.submittedAt
                );
                const gradientClass =
                  adminGradients[index % adminGradients.length];

                return (
                  <motion.div
                    key={result._id}
                    initial={{ opacity: 0, y: 60, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.7,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/reasult/details/${result?._id}`)}
                  >
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-slate-700 transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
                      {/* Student Header */}
                      <div
                        className={`${gradientClass} p-6 relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/40 rounded-full animate-pulse"></div>
                          <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/30 rounded-full animate-bounce"></div>
                        </div>

                        <div className="relative z-10 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">
                                  {result.student?.fullname || "N/A"}
                                </h3>
                                <div className="flex items-center gap-1 text-white/80 text-sm">
                                  <Mail className="w-3 h-3" />
                                  {result.student?.email || "N/A"}
                                </div>
                                <div className="flex items-center gap-1 text-white/80 text-sm">
                                  <Hash className="w-3 h-3" />
                                  {result.student?.universityNo || "N/A"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(
                                  result.score
                                )} bg-white/90`}
                              >
                                {getPerformanceIcon(result.score)}
                                <span className="ml-1">
                                  {result.score} Points
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {status === "onTime" ? (
                              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                On Time
                              </div>
                            ) : (
                              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Late
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                ROLE
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                              {result.student?.role || "Student"}
                            </p>
                          </div>

                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                SUBMITTED
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                              {new Date(
                                result.submittedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Answers Summary */}
                        {result.answers && result.answers.length > 0 && (
                          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Answer Summary
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {result.answers.length} Questions
                              </span>
                            </div>

                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {result.answers.slice(0, 3).map((ans, idx) => {
                                const question = result.quiz.questions.find(
                                  (q) => q._id === ans.questionId
                                );
                                return (
                                  <div
                                    key={ans._id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-600 dark:text-gray-300 truncate flex-1">
                                      Q{idx + 1}:{" "}
                                      {question?.questionText?.substring(
                                        0,
                                        30
                                      ) || "Unknown"}
                                      ...
                                    </span>
                                    {ans.isCorrect ? (
                                      <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-500 ml-2" />
                                    )}
                                  </div>
                                );
                              })}
                              {result.answers.length > 3 && (
                                <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                                  +{result.answers.length - 3} more questions
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/reasult/details/${result?._id}`);
                          }}
                          className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                        >
                          <Eye className="w-4 h-4" />
                          View Detailed Report
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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

export default AdmineResult;
