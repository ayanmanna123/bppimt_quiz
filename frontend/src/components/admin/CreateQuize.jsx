import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  Sparkles,
  Brain,
  Plus,
  Trash2,
  Wand2,
  BookOpen,
  Calendar,
  Clock,
  Trophy,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { Howl } from "howler";
import { motion } from "framer-motion";
import { generateQuizQuestions } from "../services/geminiService";
import { parseFile } from "../services/fileParserService";

const ValidatedInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  icon: Icon,
  label,
}) => {
  const isValid = value && value.toString().trim();

  return (
    <div className="relative group">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-3 rounded-2xl border-2 transition-all duration-300 text-gray-800 dark:text-white font-medium
            ${isValid
              ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500/30 focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
            }
            focus:outline-none shadow-sm hover:shadow-md
            ${className}
          `}
        />
        {isValid && (
          <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>
    </div>
  );
};

const CreateQuize = () => {
  const { subjectId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [marks, setMarks] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [quizContext, setQuizContext] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "questionText") {
      updated[index].questionText = value;
    } else if (field.startsWith("option")) {
      const optionIndex = parseInt(field.split("-")[1]);
      updated[index].options[optionIndex] = value;
    } else if (field === "correctAnswer") {
      updated[index].correctAnswer = parseInt(value);
    }
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/quize/creatquiz/${subjectId}`,
        {
          title,
          questions,
          date,
          time,
          marks,
          totalQuestions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message);
      const sound = new Howl({ src: ["/notification.wav"], volume: 0.7 });
      sound.play();

      navigate("/Admin/subject");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const transformQuestions = (rawQuestions) =>
    rawQuestions.map((q) => {
      const correctIndex = q.options.findIndex(
        (opt) => opt.toLowerCase().trim() === q.answer?.toLowerCase().trim()
      );
      return {
        questionText: q.question || q.questionText,
        options: q.options,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
      };
    });

  const autoGenerateQuestions = async () => {
    setLoadingAI(true);
    try {
      const aiQuestions = await generateQuizQuestions(
        title || "General Knowledge",
        totalQuestions || 5,
        quizContext
      );

      const formatted = transformQuestions(aiQuestions);
      if (formatted.length > 0) {
        setQuestions(formatted);
        toast.success("AI generated questions added!");
      } else {
        toast.error("No questions generated.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate questions.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlText = e.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const questionNodes = xmlDoc.getElementsByTagName("question");
        const newQuestions = [];

        for (let i = 0; i < questionNodes.length; i++) {
          const qNode = questionNodes[i];

          // Extract question text
          let questionText = "";
          const textNode = qNode.getElementsByTagName("text")[0];
          if (textNode) questionText = textNode.textContent;
          else if (qNode.getElementsByTagName("questionText")[0]) questionText = qNode.getElementsByTagName("questionText")[0].textContent;

          // Extract options
          const optionsNodes = qNode.getElementsByTagName("option");
          const options = ["", "", "", ""]; // Initialize with 4 empty strings
          for (let j = 0; j < Math.min(optionsNodes.length, 4); j++) {
            options[j] = optionsNodes[j]?.textContent || "";
          }

          // Extract correct answer
          let correctAnswerIndex = 0;
          const correctAnswerNode = qNode.getElementsByTagName("correctAnswer")[0];
          if (correctAnswerNode) {
            const answerText = correctAnswerNode.textContent.trim();
            // Check if it's an index (0-3) or text match
            if (!isNaN(answerText) && parseInt(answerText) >= 0 && parseInt(answerText) < 4) {
              correctAnswerIndex = parseInt(answerText);
            } else {
              // Try to find index by matching text
              const idx = options.findIndex(opt => opt.trim().toLowerCase() === answerText.toLowerCase());
              if (idx !== -1) correctAnswerIndex = idx;
            }
          }

          if (questionText) {
            newQuestions.push({
              questionText,
              options,
              correctAnswer: correctAnswerIndex
            });
          }
        }

        if (newQuestions.length > 0) {
          setQuestions(prev => [...prev, ...newQuestions]);
          toast.success(`Imported ${newQuestions.length} questions successfully!`);
        } else {
          toast.warning("No valid questions found in the XML file.");
        }
      } catch (error) {
        console.error("XML Parsing Error:", error);
        toast.error("Failed to parse XML file.");
      }
      // Reset input
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleNotesUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessingFile(true);
    try {
      const text = await parseFile(file);
      if (text && text.trim().length > 0) {
        setQuizContext(prev => (prev ? prev + "\n\n" : "") + `--- Content from ${file.name} ---\n` + text);
        toast.success(`Extracted content from ${file.name}`);
      } else {
        toast.warning("Could not extract text from file.");
      }
    } catch (error) {
      console.error("File parsing error:", error);
      toast.error(`Failed to parse file: ${error.message}`);
    } finally {
      setProcessingFile(false);
      e.target.value = null; // Reset input
    }
  };

  const getCompletionPercentage = () => {
    const basicFields = [title, date, time, marks, totalQuestions].filter(Boolean).length;
    const questionFields = questions.reduce((acc, q) => {
      const filledOptions = q.options.filter(Boolean).length;
      return acc + (q.questionText ? 1 : 0) + (filledOptions / 4);
    }, 0);

    return Math.round(((basicFields + questionFields) / (5 + questions.length * 2)) * 100);
  };

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-[#030014] dark:via-[#05001c] dark:to-[#1e1b4b] transition-colors duration-700">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-white/70 dark:hover:bg-indigo-900/30 hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back</span>
            </motion.div>
          </div>

          {/* Creative Header for Quiz Creation */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Quiz Creator Studio
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Craft engaging quizzes with AI assistance
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="bg-white/80 dark:bg-indigo-950/40 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border border-white/50 dark:border-indigo-500/20 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Quiz Completion</span>
                  <Badge className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">{getCompletionPercentage()}%</Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-15 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-10 blur-lg"></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Quiz Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden shadow-2xl bg-white/80 dark:bg-indigo-950/40 backdrop-blur-sm border-0 dark:border dark:border-indigo-500/20 rounded-3xl">
                <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-3 right-3 w-20 h-20 border-2 border-white/30 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-3 left-3 w-12 h-12 bg-white/20 rounded-full animate-bounce"></div>
                  </div>
                  <div className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <BookOpen className="w-6 h-6" />
                      Quiz Information
                      <Sparkles className="w-5 h-5" />
                    </CardTitle>
                    <p className="text-white/90 mt-2">Set up the basic details for your quiz</p>
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ValidatedInput
                      label="Quiz Title"
                      icon={BookOpen}
                      placeholder="Enter an engaging quiz title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />

                    <ValidatedInput
                      label="Submission Date"
                      icon={Calendar}
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />

                    <ValidatedInput
                      label="Duration (minutes)"
                      icon={Clock}
                      type="number"
                      placeholder="How long should the quiz be?"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />

                    <ValidatedInput
                      label="Marks per Question"
                      icon={Trophy}
                      type="number"
                      placeholder="Points for each question"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                    />
                  </div>

                  <ValidatedInput
                    label="Total Questions"
                    icon={Target}
                    type="number"
                    placeholder="How many questions will there be?"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(e.target.value)}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Generation Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 border-0 rounded-3xl text-white relative">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4 w-24 h-24 border border-white/30 rounded-full animate-spin-slow"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-2xl rotate-45 animate-pulse"></div>
                </div>

                <CardContent className="p-8 relative z-10">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Wand2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">AI Quiz Generator</h3>
                        <p className="text-white/80">Let AI create questions for you instantly</p>
                      </div>
                    </div>

                    <div className="mb-6 max-w-2xl mx-auto">
                      <div className="relative group text-left">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-semibold text-white/90 items-center gap-2">
                            <BookOpen className="w-4 h-4 text-white inline mr-2" />
                            Context / Lecture Notes (Optional)
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.docx,.pptx,.txt"
                              onChange={handleNotesUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              disabled={processingFile}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 h-8 text-xs backdrop-blur-sm"
                              disabled={processingFile}
                            >
                              {processingFile ? (
                                <div className="animate-spin w-3 h-3 border-2 border-white/50 border-t-white rounded-full mr-2"></div>
                              ) : (
                                <Upload className="w-3 h-3 mr-2" />
                              )}
                              Upload Notes (PDF/Word/PPT)
                            </Button>
                          </div>
                        </div>
                        <textarea
                          placeholder="Paste lecture notes or text here to generate questions from specific content..."
                          value={quizContext}
                          onChange={(e) => setQuizContext(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-white/10 text-white placeholder-white/50 focus:border-white/50 focus:ring-4 focus:ring-white/20 focus:outline-none shadow-sm transition-all duration-300 min-h-[100px]"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={autoGenerateQuestions}
                      disabled={loadingAI || !title}
                      className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 backdrop-blur-sm font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loadingAI ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                          Generating Magic...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Generate with AI
                          <Sparkles className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {!title && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-white/70">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Add a quiz title to enable AI generation</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* XML Import Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-500 border-0 rounded-3xl text-white relative">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-20 h-20 border-2 border-dashed border-white/40 rounded-xl -rotate-12"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 rounded-full animate-bounce"></div>
                </div>

                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Import Questions</h3>
                        <p className="text-white/80">Upload XML file to bulk add questions</p>
                      </div>
                    </div>

                    <div className="relative group">
                      <input
                        type="file"
                        accept=".xml"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Button
                        type="button"
                        className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 backdrop-blur-sm font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl group-hover:scale-105"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload XML
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Questions Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="overflow-hidden shadow-2xl bg-white/80 dark:bg-indigo-950/40 backdrop-blur-sm border-0 dark:border dark:border-indigo-500/20 rounded-3xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 right-2 w-16 h-16 border border-white/30 rounded-2xl rotate-12 animate-pulse"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <Lightbulb className="w-6 h-6" />
                        Questions ({questions.length})
                      </CardTitle>
                      <p className="text-white/90 mt-2">Craft your quiz questions and answers</p>
                    </div>

                    <Button
                      type="button"
                      onClick={addQuestion}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm font-bold py-2 px-4 rounded-xl transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                  {questions.map((q, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="relative p-6 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-3xl border-2 border-gray-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {i + 1}
                          </div>
                          <span className="text-lg font-bold text-gray-800 dark:text-white">Question {i + 1}</span>
                        </div>

                        {questions.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeQuestion(i)}
                            variant="destructive"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 rounded-xl shadow-lg"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="mb-6">
                        <ValidatedInput
                          label="Question"
                          icon={Brain}
                          placeholder="Enter your question here..."
                          value={q.questionText}
                          onChange={(e) =>
                            handleQuestionChange(i, "questionText", e.target.value)
                          }
                        />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {q.options.map((opt, j) => (
                          <ValidatedInput
                            key={j}
                            placeholder={`Option ${String.fromCharCode(65 + j)}`}
                            value={opt}
                            onChange={(e) =>
                              handleQuestionChange(i, `option-${j}`, e.target.value)
                            }
                            className={q.correctAnswer === j ? "ring-2 ring-green-300 bg-green-50 dark:bg-green-900/20" : ""}
                          />
                        ))}
                      </div>

                      {/* Correct Answer Selector */}
                      <div className="bg-blue-50 dark:bg-indigo-900/30 rounded-2xl p-4 border-l-4 border-blue-400 dark:border-blue-500">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Correct Answer:
                        </label>
                        <div className="flex gap-2">
                          {q.options.map((_, j) => (
                            <button
                              key={j}
                              type="button"
                              onClick={() => handleQuestionChange(i, "correctAnswer", j)}
                              className={`
                                w-12 h-12 rounded-xl font-bold transition-all duration-300 border-2
                                ${q.correctAnswer === j
                                  ? "bg-green-500 text-white border-green-600 shadow-lg scale-110"
                                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105"
                                }
                              `}
                            >
                              {String.fromCharCode(65 + j)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500"
              >
                <Trophy className="w-6 h-6 mr-2" />
                Create Amazing Quiz
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateQuize;