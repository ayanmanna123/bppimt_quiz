import axios from "axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Howl } from "howler";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Brain, 
  Target, 
  CheckCircle2, 
  Circle,
  Zap,
  Trophy,
  Timer,
  RotateCcw
} from "lucide-react";

const GiveQuiz = ({ tabSwitchCount }) => {
  const { quizId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  // Add ref to track if quiz has been submitted
  const hasSubmitted = useRef(false);
  // Keep track of latest answers using ref
  const answersRef = useRef({});

  // Update answersRef whenever answers state changes
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `https://bppimt-quiz-kml1.vercel.app/api/v1/quize/getquizId/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setQuiz(res.data.quize);

        const duration = parseInt(res.data.quize.time) * 60;
        setTimeLeft(duration);
      } catch (error) {
        console.log(error);
      }
    };

    fetchQuiz();
  }, [quizId, getAccessTokenSilently]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft !== null]);

  // Separate effect to handle auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !hasSubmitted.current && !isSubmitting) {
      handleSubmit();
    }
  }, [timeLeft]);

  // Warning for last 30s
  useEffect(() => {
    if (timeLeft === 30) {
      setShowWarning(true);
      toast.warning("Only 30 seconds left!");
    }
  }, [timeLeft]);

  // Auto-submit when tab switch count > 5
  useEffect(() => {
    if (tabSwitchCount >= 10 && !hasSubmitted.current && !isSubmitting) {
      toast.error("Too many tab switches! Quiz will be auto-submitted.");
      handleSubmit();
    }
    if (tabSwitchCount > 0) {
      toast.error(`You changed tab ${tabSwitchCount} times`);
    }

    if (tabSwitchCount == 9) {
      toast.error("That's the last warning");
    }
  }, [tabSwitchCount]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleAnswerChange = (questionId, optionIndexString) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndexString,
    }));
  };

  const handleNext = () => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    // Prevent multiple submissions
    if (hasSubmitted.current || isSubmitting) {
      return;
    }

    hasSubmitted.current = true;
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      // Use the ref to get the latest answers, even in async operations
      const latestAnswers = answersRef.current;

      // Create answer array directly from latest answers
      const answerArray = Object.entries(latestAnswers).map(
        ([questionId, option]) => ({
          questionId,
          selectedOption: option !== "" ? Number(option) : null,
        })
      );

      console.log("Submitting answers:", answerArray);
      console.log("Total answers:", answerArray.length);

      const res = await axios.post(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/reasult/reasult/submite",
        {
          quizId,
          answers: answerArray,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      const sound = new Howl({
        src: ["/notification.wav"],
        volume: 0.7,
      });
      sound.play();
      navigate("/quiz");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Error submitting quiz");
      navigate("/quiz");
    } finally {
      setIsSubmitting(false);
    }
  }, [getAccessTokenSilently, quizId, navigate, isSubmitting]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Brain className="w-10 h-10 text-white animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading your quiz...</p>
        </motion.div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentSelected = answers[currentQuestion._id] ?? "";
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = questions.every((q) => answers[q._id] !== undefined);
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Time-based styling
  const timeColor = timeLeft > 300 ? "text-green-600" : timeLeft > 60 ? "text-yellow-600" : "text-red-600";
  const timeBgColor = timeLeft > 300 ? "bg-green-50" : timeLeft > 60 ? "bg-yellow-50" : "bg-red-50";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
                <p className="text-sm text-gray-600">Question {currentIndex + 1} of {questions.length}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${timeBgColor} border-2 ${timeLeft <= 30 ? 'border-red-200 animate-pulse' : 'border-transparent'}`}>
              <Timer className={`w-5 h-5 ${timeColor}`} />
              <span className={`font-mono font-bold text-lg ${timeColor}`}>
                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
              </span>
              {showWarning && timeLeft <= 30 && (
                <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-bold text-indigo-600">{answeredCount}/{questions.length} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Tab switch warning */}
          {tabSwitchCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Tab switches: {tabSwitchCount}/10 (Auto-submit at 10)
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Question {currentIndex + 1}</CardTitle>
                      <p className="text-white/90 text-lg">Choose the best answer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{currentIndex + 1}</div>
                    <div className="text-white/80 text-sm">of {questions.length}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 leading-relaxed mb-6">
                      {currentQuestion.questionText}
                    </h3>
                  </motion.div>

                  <RadioGroup
                    value={currentSelected}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQuestion._id, value)
                    }
                    className="space-y-4"
                  >
                    {currentQuestion.options.map((option, idx) => {
                      const id = `${currentQuestion._id}-${idx}`;
                      const isSelected = currentSelected === String(idx);
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                          className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-indigo-300"
                          }`}
                          onClick={() => handleAnswerChange(currentQuestion._id, String(idx))}
                        >
                          <RadioGroupItem value={String(idx)} id={id} className="text-indigo-600" />
                          <Label htmlFor={id} className="flex-1 cursor-pointer text-base font-medium text-gray-700">
                            {option}
                          </Label>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                        </motion.div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Navigation Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-center justify-between pt-6 border-t border-gray-100"
                >
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 hover:shadow-lg transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {questions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? "bg-indigo-600 scale-125"
                            : answers[questions[idx]._id]
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {!isLast ? (
                    <Button
                      onClick={handleNext}
                      disabled={currentSelected === "" || isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!allAnswered || isSubmitting}
                      className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Quiz
                          <Trophy className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Question Navigation Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 p-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20"
        >
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            Quick Navigation
          </h4>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-12 h-12 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center ${
                  idx === currentIndex
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg scale-110"
                    : answers[questions[idx]._id]
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GiveQuiz;