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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            {subjectName}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Viewing all {questions.length} questions for this subject
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search questions or quiz titles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredQuestions.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800">No questions found</h3>
                                <p className="text-gray-500">Try adjusting your search or add some quizzes first.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {filteredQuestions.map((q, qIndex) => (
                                    <motion.div
                                        key={q._id || qIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: qIndex * 0.05 }}
                                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                                                {q.quizTitle || "Untitled Quiz"}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            {q.questionText}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options && q.options.map((opt, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-3 rounded-xl border flex items-center gap-3 text-sm
                            ${(i + 1) === q.correctAnswer
                                                            ? "bg-green-50 border-green-200 text-green-800 ring-1 ring-green-500"
                                                            : "bg-gray-50 border-gray-100 text-gray-600"
                                                        }
                          `}
                                                >
                                                    <span
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${(i + 1) === q.correctAnswer
                                                                ? "bg-green-500 text-white"
                                                                : "bg-white border border-gray-200 text-gray-400"
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
