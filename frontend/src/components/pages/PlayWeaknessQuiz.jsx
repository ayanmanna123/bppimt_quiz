import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Howl } from "howler";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Send,
    Brain,
    Target,
    CheckCircle2,
    Zap,
    Trophy,
    ArrowLeft,
    XCircle,
    RefreshCcw
} from "lucide-react";
import confetti from 'canvas-confetti';
import { generateFollowUpQuestions } from "../services/geminiService";

const PlayWeaknessQuiz = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State from navigation (generated quiz)
    const [quizData, setQuizData] = useState(null);

    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        if (location.state && location.state.questions) {
            setQuizData({
                title: `Weakness Attack: ${location.state.topic || "General"}`,
                questions: location.state.questions
            });
        } else {
            toast.error("No quiz data found. Redirecting...");
            navigate("/reasult");
        }
    }, [location, navigate]);

    const handleAnswerChange = (questionIndex, optionIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [questionIndex]: optionIndex,
        }));
    };

    const handleNext = () => {
        if (quizData && currentIndex < quizData.questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        // Calculate Score
        let calculatedScore = 0;
        quizData.questions.forEach((q, idx) => {
            const selected = answers[idx];
            // Check if answer is correct. 
            // Note: Gemini sometimes returns "answer" as index or string.
            // We'll try to match loosely.
            const correct = q.answer;

            // If correct answer is a string (e.g., "Option A"), we might need logic.
            // But usually our prompt asks for "answer" as the correct option text or index.
            // Let's assume the Gemini prompt returns the index (0-3) or the exact string of the option.

            const selectedOptionText = q.options[selected];

            // Flexible checking: match index or text
            if (selected == correct || selectedOptionText === correct) {
                calculatedScore++;
            } else if (typeof correct === 'string' && q.options.findIndex(opt => opt === correct) === selected) {
                calculatedScore++;
            }
        });

        setScore(calculatedScore);

        const sound = new Howl({
            src: ["/notification.wav"],
            volume: 0.7,
        });
        sound.play();

        if (calculatedScore > quizData.questions.length / 2) {
            confetti({ particleCount: 150, spread: 60 });
        }

        setShowResult(true);
        setIsSubmitting(false);
    };

    if (!quizData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-100 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Target className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700">Loading Attack Plan...</p>
                </motion.div>
            </div>
        );
    }

    const questions = quizData.questions;
    const currentQuestion = questions[currentIndex];
    // We use index as key for answers since these generated questions might not have unique IDs
    const currentSelected = answers[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const allAnswered = questions.every((_, idx) => answers[idx] !== undefined);
    const answeredCount = Object.keys(answers).length;
    const progressPercentage = (answeredCount / questions.length) * 100;

    if (showResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-8 text-white text-center">
                            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                            <h1 className="text-3xl font-bold mb-2">Attack Complete!</h1>
                            <p className="text-red-100">Here is how you performed on your weak topics</p>
                        </div>

                        <div className="p-8 text-center">
                            <div className="mb-8">
                                <span className="text-6xl font-bold text-gray-800">{score}</span>
                                <span className="text-2xl text-gray-500"> / {questions.length}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                                {questions.map((q, idx) => {
                                    const selected = answers[idx];
                                    const selectedText = q.options[selected];
                                    const isCorrect = selectedText === q.answer || selected === q.answer || (typeof q.answer === 'number' && q.options[q.answer] === selectedText);

                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border-l-4 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                                            <p className="font-semibold text-gray-800 text-sm mb-2">Q{idx + 1}: {q.question}</p>
                                            <div className="space-y-1 text-sm">
                                                <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                    Your Answer: <span className="font-bold">{selectedText}</span>
                                                    {isCorrect && <CheckCircle2 className="inline w-4 h-4 ml-1" />}
                                                    {!isCorrect && <XCircle className="inline w-4 h-4 ml-1" />}
                                                </p>
                                                {!isCorrect && (
                                                    <p className="text-gray-600">
                                                        Correct Answer: <span className="font-bold">{q.answer}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button
                                    onClick={() => navigate('/reasult')}
                                    variant="outline"
                                    className="px-8 py-4 rounded-xl h-auto text-lg"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Back to Results
                                </Button>



                                <Button
                                    onClick={async () => {
                                        setIsRetrying(true);
                                        try {
                                            // Identify wrong answers
                                            const wrongQuestions = questions.filter((q, idx) => {
                                                const selected = answers[idx];
                                                const selectedText = q.options[selected];
                                                // Check NOT correct
                                                return !(selectedText === q.answer || selected === q.answer || (typeof q.answer === 'number' && q.options[q.answer] === selectedText));
                                            }).map(q => q.question);

                                            const topic = quizData.title.replace("Weakness Attack: ", "");
                                            const newQuestions = await generateFollowUpQuestions(topic, wrongQuestions);

                                            if (newQuestions && newQuestions.length > 0) {
                                                setQuizData({ ...quizData, questions: newQuestions });
                                                setAnswers({});
                                                setCurrentIndex(0);
                                                setScore(0);
                                                setShowResult(false);
                                                toast.success("New attack plan generated!");
                                            } else {
                                                toast.error("Failed to generate new questions. Try again.");
                                            }
                                        } catch (error) {
                                            console.error("Retry error:", error);
                                            toast.error("Something went wrong.");
                                        } finally {
                                            setIsRetrying(false);
                                        }
                                    }}
                                    disabled={isRetrying}
                                    className="px-8 py-4 rounded-xl h-auto text-lg bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isRetrying ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCcw className="w-5 h-5 mr-2" />
                                            Retry Attack
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-100">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl border-b border-red-100 sticky top-0 z-50"
            >
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold text-gray-800">{quizData.title}</h1>
                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">HARD MODE</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Question {currentIndex + 1} of {questions.length}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => navigate('/reasult')}
                            className="text-gray-500 hover:text-gray-800"
                        >
                            Exit
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden relative">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <CardHeader className="p-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-sm font-bold text-red-500 tracking-wider uppercase mb-2 block">Question {currentIndex + 1}</span>
                                        <h3 className="text-2xl font-bold text-gray-800 leading-relaxed">
                                            {currentQuestion.question}
                                        </h3>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8 pt-0 space-y-6">
                                <RadioGroup
                                    value={currentSelected !== undefined ? String(currentSelected) : ""}
                                    onValueChange={(value) =>
                                        handleAnswerChange(currentIndex, Number(value))
                                    }
                                    className="space-y-4"
                                >
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = currentSelected === idx;
                                        return (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                className={`flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                                                    ? "border-red-500 bg-red-50/50 shadow-md ring-1 ring-red-200"
                                                    : "border-gray-100 bg-white hover:border-red-200 hover:bg-gray-50"
                                                    }`}
                                                onClick={() =>
                                                    handleAnswerChange(currentIndex, idx)
                                                }
                                            >
                                                <RadioGroupItem
                                                    value={String(idx)}
                                                    id={`opt-${idx}`}
                                                    className="text-red-600 border-gray-300"
                                                />
                                                <Label
                                                    htmlFor={`opt-${idx}`}
                                                    className="flex-1 cursor-pointer text-base font-medium text-gray-700"
                                                >
                                                    {option}
                                                </Label>
                                                {isSelected && (
                                                    <CheckCircle2 className="w-5 h-5 text-red-600" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </RadioGroup>

                                <div className="flex items-center justify-between pt-8 mt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={handlePrevious}
                                        disabled={currentIndex === 0}
                                        className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                                    >
                                        <ChevronLeft className="w-5 h-5 mr-2" />
                                        Previous
                                    </Button>

                                    {/* Navigation dots */}
                                    <div className="hidden md:flex gap-1.5">
                                        {questions.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-red-500' :
                                                    answers[idx] !== undefined ? 'w-1.5 bg-red-200' : 'w-1.5 bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {!isLast ? (
                                        <Button
                                            onClick={handleNext}
                                            disabled={currentSelected === undefined}
                                            className="bg-gray-900 hover:bg-black text-white px-8 py-6 rounded-xl text-lg font-medium shadow-xl hover:shadow-2xl transition-all"
                                        >
                                            Next Question
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!allAnswered || isSubmitting}
                                            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-8 py-6 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                                        >
                                            {isSubmitting ? "Submitting..." : "Complete Attack"}
                                            {!isSubmitting && <Trophy className="w-5 h-5 ml-2" />}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    Weakness Attack Mode · AI Generated Quiz
                </div>
            </div>
        </div>
    );
};

export default PlayWeaknessQuiz;
