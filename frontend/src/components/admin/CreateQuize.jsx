import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "../shared/Navbar";
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
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { Howl } from "howler";
import { motion } from "framer-motion";
import { generateQuizQuestions } from "../services/geminiService";

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
        <label className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
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
            w-full px-4 py-3 rounded-2xl border-2 transition-all duration-300 text-gray-800 font-medium
            ${isValid 
              ? "border-green-400 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100" 
              : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
  const [loadingAI, setLoadingAI] = useState(false);

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
        `https://bppimt-quiz-kml1.vercel.app/api/v1/quize/creatquiz/${subjectId}`,
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
        totalQuestions || 5
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
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-white/70 hover:shadow-md"
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
                  <p className="text-gray-600 text-lg mt-1">
                    Craft engaging quizzes with AI assistance
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border border-white/50 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700">Quiz Completion</span>
                  <Badge className="bg-indigo-100 text-indigo-700">{getCompletionPercentage()}%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
              <Card className="overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
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

            {/* Questions Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
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
                      className="relative p-6 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {i + 1}
                          </div>
                          <span className="text-lg font-bold text-gray-800">Question {i + 1}</span>
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
                            className={q.correctAnswer === j ? "ring-2 ring-green-300 bg-green-50" : ""}
                          />
                        ))}
                      </div>

                      {/* Correct Answer Selector */}
                      <div className="bg-blue-50 rounded-2xl p-4 border-l-4 border-blue-400">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:scale-105"
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