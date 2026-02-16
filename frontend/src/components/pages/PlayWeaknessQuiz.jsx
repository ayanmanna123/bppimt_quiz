import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
    const { getAccessTokenSilently } = useAuth0();

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

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // Prepare Questions with answers for backend
        const processedQuestions = quizData.questions.map((q, idx) => {
            const selected = answers[idx];
            const selectedText = q.options[selected];

            // Determine correctness
            const isCorrect = selectedText === q.answer || selected === q.answer || (typeof q.answer === 'number' && q.options[q.answer] === selectedText);

            return {
                questionText: q.question,
                options: q.options,
                correctAnswer: q.answer,
                userAnswer: selectedText || selected, // Store text preferably or index
                isCorrect
            };
        });

        const calculatedScore = processedQuestions.filter(q => q.isCorrect).length;
        setScore(calculatedScore);

        // Save to Backend
        try {
            const token = await getAccessTokenSilently();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/weakness/save-weakness-result`, {
                topic: quizData.title.replace("Weakness Attack: ", ""),
                score: calculatedScore,
                totalQuestions: processedQuestions.length,
                questions: processedQuestions
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Result saved to history!");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save result, but you can see it here.");
        }

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#030014] dark:via-[#05001c] dark:to-[#030014] transition-colors duration-700 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-900/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
                {!showResult ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{quizData.title}</h1>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Question {currentIndex + 1} of {quizData.questions.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-black px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    Score: {score}
                                </span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 px-2">
                            <div className="flex justify-between text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                <span>Progress</span>
                                <span>{Math.round(((currentIndex + 1) / quizData.questions.length) * 100)}%</span>
                            </div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-white dark:border-slate-700 shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentIndex + 1) / quizData.questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Card */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                                    <CardContent className="p-8 md:p-12">
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-10 leading-tight">
                                            {quizData.questions[currentIndex].question}
                                        </h2>

                                        <RadioGroup
                                            value={answers[currentIndex]?.toString()}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {quizData.questions[currentIndex].options.map((option, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleAnswerSelect(idx)}
                                                    className={cn(
                                                        "group flex items-center p-6 rounded-3xl border-2 transition-all cursor-pointer hover:shadow-lg active:scale-95",
                                                        answers[currentIndex] === idx
                                                            ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 shadow-indigo-100 dark:shadow-none"
                                                            : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-900"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm",
                                                        answers[currentIndex] === idx
                                                            ? "bg-indigo-600 text-white"
                                                            : "bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600"
                                                    )}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className={cn(
                                                        "ml-4 font-bold text-lg",
                                                        answers[currentIndex] === idx ? "text-indigo-900 dark:text-indigo-100" : "text-slate-600 dark:text-slate-300"
                                                    )}>
                                                        {option}
                                                    </span>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>

                        {/* Controls */}
                        <div className="flex justify-between gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentIndex === 0}
                                className="h-14 px-8 rounded-2xl font-bold text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                            </Button>

                            {currentIndex === quizData.questions.length - 1 ? (
                                <Button
                                    onClick={handleSubmit}
                                    className="h-14 px-8 rounded-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl shadow-green-200 dark:shadow-none"
                                >
                                    Finish Quiz <CheckCircle className="w-5 h-5 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setCurrentIndex(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                                    disabled={answers[currentIndex] === undefined}
                                    className="h-14 px-8 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none"
                                >
                                    Next Question <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-12 text-center">
                            <div className="inline-flex p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-full mb-8">
                                <Trophy className="w-16 h-16 text-yellow-500" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">Quiz Completed!</h2>
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-12">Fantastic work! Here's how you performed.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="p-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                                    <div className="text-sm font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-2">Final Score</div>
                                    <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{score}/{quizData.questions.length}</div>
                                </div>
                                <div className="p-8 bg-purple-50 dark:bg-purple-900/30 rounded-3xl border border-purple-100 dark:border-purple-800">
                                    <div className="text-sm font-black text-purple-400 dark:text-purple-500 uppercase tracking-widest mb-2">Accuracy</div>
                                    <div className="text-5xl font-black text-purple-600 dark:text-purple-400">{Math.round((score / quizData.questions.length) * 100)}%</div>
                                </div>
                                <div className="p-8 bg-pink-50 dark:bg-pink-900/30 rounded-3xl border border-pink-100 dark:border-pink-800">
                                    <div className="text-sm font-black text-pink-400 dark:text-pink-500 uppercase tracking-widest mb-2">Points</div>
                                    <div className="text-5xl font-black text-pink-600 dark:text-pink-400">{score * 10}</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => navigate("/quiz")}
                                    variant="outline"
                                    className="h-16 px-10 rounded-2xl font-black text-lg border-2"
                                >
                                    Home
                                </Button>
                                {score < quizData.questions.length && (
                                    <Button
                                        onClick={handleRetry}
                                        className="h-16 px-10 rounded-2xl font-black text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none"
                                    >
                                        <RefreshCw className="w-6 h-6 mr-2" />
                                        Retry Weak Points
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PlayWeaknessQuiz;
