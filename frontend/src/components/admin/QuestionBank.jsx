import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const QuestionBank = () => {
    const { getAccessTokenSilently } = useAuth0();
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [subjectName, setSubjectName] = useState("Question Bank");

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const token = await getAccessTokenSilently({
                    audience: "http://localhost:5000/api/v2",
                });

                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/quize/questions/all/${subjectId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data.success) {
                    setQuestions(res.data.questions);
                }
            } catch (error) {
                console.error("Error fetching question bank:", error);
                toast.error("Failed to load questions");
            } finally {
                setLoading(false);
            }
        };

        if (subjectId) {
            fetchQuestions();
        }
    }, [subjectId, getAccessTokenSilently]);

    const filteredQuestions = questions.filter(
        (q) =>
            q.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.quizTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#030014] p-6 transition-colors duration-700 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-[#030014] dark:via-[#05001c] dark:to-[#030014]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none"></div>
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                        radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
                }}
            ></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            {subjectName}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Viewing all {questions.length} questions for this subject
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search questions or quiz titles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-500/20 bg-white dark:bg-indigo-950/40 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent shadow-sm placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredQuestions.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-indigo-950/40 rounded-3xl shadow-sm border border-gray-100 dark:border-indigo-500/20 backdrop-blur-md">
                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">No questions found</h3>
                                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or add some quizzes first.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {filteredQuestions.map((q, qIndex) => (
                                    <motion.div
                                        key={q._id || qIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: qIndex * 0.05 }}
                                        className="bg-white dark:bg-indigo-950/40 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-indigo-500/20 hover:shadow-md transition-shadow backdrop-blur-sm"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-500/20">
                                                {q.quizTitle || "Untitled Quiz"}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                            {q.questionText}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options && q.options.map((opt, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-3 rounded-xl border flex items-center gap-3 text-sm transition-colors
                            ${(i + 1) === q.correctAnswer
                                                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-300 ring-1 ring-green-500 dark:ring-green-500/50"
                                                            : "bg-gray-50 dark:bg-indigo-900/20 border-gray-100 dark:border-indigo-500/10 text-gray-600 dark:text-gray-300"
                                                        }
                          `}
                                                >
                                                    <span
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${(i + 1) === q.correctAnswer
                                                                ? "bg-green-500 text-white"
                                                                : "bg-white dark:bg-indigo-950/50 border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                                            }
                          `}
                                                    >
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span>{opt}</span>
                                                    {(i + 1) === q.correctAnswer && (
                                                        <Sparkles className="w-4 h-4 text-green-500 ml-auto shrink-0" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionBank;
