import axios from "axios";
import { explainAnswer } from "../services/geminiService";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Star,
  Trophy,
  User,
  XCircle,
  Sparkles,
  Target,
  Brain,
  Medal,
  Crown,
  Zap,
  BookOpen,
  BarChart3,
  MessageCircleQuestion,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ResultDetails = () => {
  // const { darktheme } = useSelector((store) => store.auth);
  const { getAccessTokenSilently } = useAuth0();
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [explanationIndex, setExplanationIndex] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(null);

  const handleExplain = async (question, userAnswer, correctAnswer, index) => {
    if (explanationIndex === index) {
      setExplanationIndex(null);
      return;
    }
    setLoadingExplanation(index);
    setExplanationIndex(null);
    const text = await explainAnswer(question, userAnswer, correctAnswer);
    setExplanation(text);
    setExplanationIndex(index);
    setLoadingExplanation(null);
  };

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/reasult/result/details/${resultId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResult(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load result details");
      }
    };

    getUserDetails();
  }, [getAccessTokenSilently, resultId]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Loading your results...</p>
        </div>
      </div>
    );
  }

  const generateCertificate = () => {
    if (!result) return;

    const doc = new jsPDF("landscape", "pt", "a4");
    const img = new Image();
    img.src = "/certificate4.jpg";

    img.onload = () => {
      doc.addImage(
        img,
        "JPG",
        0,
        0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight()
      );

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Result ID: ${resultId}`, pageWidth - 80, 60, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(40, 40, 40);
      doc.text(result.student.fullname, pageWidth / 2, 280, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);

      const certificationLines = [
        "appeared in the Mock Test Examination conducted by",
        "B. P. Poddar Institute of Management & Technology.",
        "",
        `The candidate has demonstrated commendable performance in`,
        ` ${result.quizTitle},`,
        `securing an overall score of ${result.score}/${result.totalSoure}.`,
        "",
        "This achievement reflects the student's dedication, knowledge,",
      ];

      let yPosition = 350;
      const lineHeight = 22;

      certificationLines.forEach((line) => {
        if (line === "") {
          yPosition += lineHeight / 2;
        } else {
          if (line.includes("B. P. Poddar Institute of Management & Technology")) {
            doc.setFont("helvetica", "bold");
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            doc.setFont("helvetica", "normal");
          } else if (line.includes(result.quizTitle)) {
            doc.setFont("helvetica", "bold");
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            doc.setFont("helvetica", "normal");
          } else {
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
          }
          yPosition += lineHeight;
        }
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 200, pageHeight - 80);

      const percentage = (result.score / result.totalSoure) * 100;
      let grade = "F";
      let gradeColor = [255, 0, 0];

      if (percentage >= 90) {
        grade = "A+";
        gradeColor = [0, 128, 0];
      } else if (percentage >= 80) {
        grade = "A";
        gradeColor = [0, 128, 0];
      } else if (percentage >= 70) {
        grade = "B";
        gradeColor = [255, 165, 0];
      } else if (percentage >= 60) {
        grade = "C";
        gradeColor = [255, 165, 0];
      } else if (percentage >= 50) {
        grade = "D";
        gradeColor = [255, 0, 0];
      }

      doc.setTextColor(...gradeColor);
      doc.text(`Grade: ${grade}`, pageWidth / 2, yPosition + 30, { align: "center" });

      doc.save(`${result.student.fullname}_Certificate.pdf`);
      toast.success("Certificate downloaded successfully!");
    };

    img.onerror = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setDrawColor(200, 0, 0);
      doc.setLineWidth(3);
      doc.rect(50, 50, pageWidth - 100, pageHeight - 100);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.setTextColor(200, 0, 0);
      doc.text("CERTIFICATE", pageWidth / 2, 130, { align: "center" });

      doc.setFontSize(24);
      doc.text("OF ACHIEVEMENT", pageWidth / 2, 160, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(40, 40, 40);
      doc.text(result.student.fullname, pageWidth / 2, 280, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);

      const certificationLines = [
        "This is to certify that the above-named student has successfully",
        "appeared in the Mock Test Examination conducted by",
        "B. P. Poddar Institute of Management & Technology.",
        "",
        `The candidate has demonstrated commendable performance in ${result.quizTitle},`,
        `securing an overall score of ${result.score}/${result.totalSoure}.`,
        "",
        "This achievement reflects the student's dedication, knowledge,",
        "and readiness for upcoming academic evaluations.",
      ];

      let yPosition = 350;
      const lineHeight = 22;

      certificationLines.forEach((line) => {
        if (line === "") {
          yPosition += lineHeight / 2;
        } else {
          if (
            line.includes("B. P. Poddar Institute of Management & Technology") ||
            line.includes(result.quizTitle)
          ) {
            doc.setFont("helvetica", "bold");
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            doc.setFont("helvetica", "normal");
          } else {
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
          }
          yPosition += lineHeight;
        }
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 200, pageHeight - 80);

      const percentage = (result.score / result.totalSoure) * 100;
      let grade = "F";
      let gradeColor = [255, 0, 0];

      if (percentage >= 90) {
        grade = "A+";
        gradeColor = [0, 128, 0];
      } else if (percentage >= 80) {
        grade = "A";
        gradeColor = [0, 128, 0];
      } else if (percentage >= 70) {
        grade = "B";
        gradeColor = [255, 165, 0];
      } else if (percentage >= 60) {
        grade = "C";
        gradeColor = [255, 165, 0];
      } else if (percentage >= 50) {
        grade = "D";
        gradeColor = [255, 0, 0];
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...gradeColor);
      doc.text(`Grade: ${grade}`, pageWidth / 2, yPosition + 30, { align: "center" });

      doc.save(`${result.student.fullname}_Certificate.pdf`);
      toast.success("Certificate downloaded successfully!");
    };
  };

  const getGradeInfo = () => {
    const percentage = (result.score / result.totalSoure) * 100;
    if (percentage >= 90) return { grade: "A+", color: "from-green-500 to-emerald-600", icon: Crown, bgColor: "bg-green-100", textColor: "text-green-700" };
    if (percentage >= 80) return { grade: "A", color: "from-green-500 to-green-600", icon: Medal, bgColor: "bg-green-100", textColor: "text-green-700" };
    if (percentage >= 70) return { grade: "B", color: "from-yellow-500 to-orange-500", icon: Trophy, bgColor: "bg-yellow-100", textColor: "text-yellow-700" };
    if (percentage >= 60) return { grade: "C", color: "from-orange-500 to-red-500", icon: Award, bgColor: "bg-orange-100", textColor: "text-orange-700" };
    if (percentage >= 50) return { grade: "D", color: "from-red-500 to-red-600", icon: Target, bgColor: "bg-red-100", textColor: "text-red-700" };
    return { grade: "F", color: "from-gray-500 to-gray-600", icon: XCircle, bgColor: "bg-gray-100", textColor: "text-gray-700" };
  };

  const gradeInfo = getGradeInfo();
  const percentage = Math.round((result.score / result.totalSoure) * 100);
  const correctAnswers = result.details.filter(q => q.studentAnswerIndex?.isCorrect).length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-500">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-white/70 dark:hover:bg-slate-800/70 hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Results</span>
            </motion.div>
          </div>

          {/* Creative Header for Results */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${gradeInfo.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                    <gradeInfo.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Quiz Results
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
                    Detailed performance analysis
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 dark:border-slate-700/50 shadow-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Score</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</div>
                </div>

                <div className={`backdrop-blur-sm rounded-2xl p-4 border border-white/50 dark:border-slate-700/50 shadow-lg ${gradeInfo.bgColor} dark:bg-slate-800/80`}>
                  <div className="flex items-center gap-2">
                    <gradeInfo.icon className={`w-5 h-5 ${gradeInfo.textColor}`} />
                    <span className={`text-sm font-semibold ${gradeInfo.textColor} dark:text-gray-200`}>Grade</span>
                  </div>
                  <div className={`text-2xl font-bold ${gradeInfo.textColor} dark:text-white`}>{gradeInfo.grade}</div>
                </div>
              </div>
            </motion.div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-15 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-10 blur-lg"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 pb-12">

          {/* Quiz Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Card className="overflow-hidden shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-3xl">
              <CardHeader className={`bg-gradient-to-r ${gradeInfo.color} text-white relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-3 right-3 w-20 h-20 border-2 border-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-3 left-3 w-12 h-12 bg-white/20 rounded-full animate-bounce"></div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <BookOpen className="w-6 h-6" />
                        {result.quizTitle}
                        <Sparkles className="w-5 h-5" />
                      </CardTitle>
                      <p className="text-white/90 mt-2">Quiz Performance Overview</p>
                    </div>

                    <Button
                      onClick={generateCertificate}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Get Certificate
                      <Award className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Student</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{result.student.fullname}</p>
                      <p>{result.student.universityNo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Score</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {result.score}/{result.totalSoure} ({percentage}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Submitted</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Questions Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 right-2 w-16 h-16 border border-white/30 rounded-2xl rotate-12 animate-pulse"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/20 rounded-full"></div>
                </div>
                <div className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Brain className="w-6 h-6" />
                    Question Analysis ({result.details.length} Questions)
                  </CardTitle>
                  <p className="text-white/90 mt-2">
                    Correct: {correctAnswers}/{result.details.length} •
                    Accuracy: {Math.round((correctAnswers / result.details.length) * 100)}%
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {result.details.map((q, index) => {
                  const studentAnsIndex = q.studentAnswerIndex?.selectedOption;
                  const isCorrect = q.studentAnswerIndex?.isCorrect;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`relative p-6 rounded-3xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${isCorrect
                        ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-700"
                        : "bg-gradient-to-br from-red-50 to-pink-100 border-red-300 dark:from-red-900/30 dark:to-pink-900/30 dark:border-red-700"
                        }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${isCorrect ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-pink-600"
                            }`}>
                            {index + 1}
                          </div>
                          <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Question {index + 1}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                              <Badge className="bg-green-500 text-white">Correct</Badge>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-6 h-6 text-red-600" />
                              <Badge className="bg-red-500 text-white">Incorrect</Badge>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-6 p-4 bg-white/70 dark:bg-slate-800/70 rounded-2xl">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{q.questionText}</p>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, i) => {
                          const isStudentAns = i === studentAnsIndex;
                          const isCorrectAns = i === q.correctAnswerIndex;

                          return (
                            <div
                              key={i}
                              className={`p-4 rounded-2xl border-2 transition-all duration-300 relative ${isCorrectAns && isStudentAns
                                ? "border-green-400 bg-green-100 shadow-lg"
                                : isCorrectAns
                                  ? "border-green-400 bg-green-100 dark:bg-green-900/40 shadow-md"
                                  : isStudentAns && !isCorrect
                                    ? "border-red-400 bg-red-100 dark:bg-red-900/40 shadow-md"
                                    : "border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm ${isCorrectAns
                                    ? "bg-green-500"
                                    : isStudentAns && !isCorrect
                                      ? "bg-red-500"
                                      : "bg-gray-400"
                                    }`}>
                                    {String.fromCharCode(65 + i)}
                                  </div>
                                  <span className="font-medium text-gray-800">{opt}</span>
                                </div>

                                <div className="flex gap-2">
                                  {isCorrectAns && (
                                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Correct
                                    </Badge>
                                  )}
                                  {isStudentAns && !isCorrect && (
                                    <Badge className="bg-red-500 text-white flex items-center gap-1">
                                      <XCircle className="w-3 h-3" />
                                      Your Answer
                                    </Badge>
                                  )}
                                  {isStudentAns && isCorrect && (
                                    <Badge className="bg-blue-500 text-white flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      Your Correct Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* AI Explain Button */}
                      {!isCorrect && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700 dark:hover:bg-indigo-900/50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExplain(q.questionText, q.options[studentAnsIndex], q.options[q.correctAnswerIndex], index);
                            }}
                            disabled={loadingExplanation === index}
                          >
                            {loadingExplanation === index ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <MessageCircleQuestion className="w-4 h-4 mr-2" />
                            )}
                            Ask AI why this is wrong
                          </Button>
                        </div>
                      )}

                      {/* AI Explanation Area */}
                      {explanationIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 overflow-hidden"
                        >
                          <div className="flex gap-3">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm h-fit shrink-0">
                              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm">AI Explanation</h4>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                {explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Final Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 border-0 rounded-3xl text-white">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <gradeInfo.icon className="w-12 h-12" />
                  <div>
                    <h3 className="text-3xl font-bold">Final Grade: {gradeInfo.grade}</h3>
                    <p className="text-white/80 text-lg">
                      {correctAnswers} out of {result.details.length} questions correct
                    </p>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex justify-center items-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{percentage}%</div>
                      <div className="text-white/80">Overall Score</div>
                    </div>
                    <div className="w-px h-12 bg-white/30"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.score}</div>
                      <div className="text-white/80">Points Earned</div>
                    </div>
                    <div className="w-px h-12 bg-white/30"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.totalSoure}</div>
                      <div className="text-white/80">Total Points</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ResultDetails;