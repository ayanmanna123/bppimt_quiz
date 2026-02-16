import React from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Play, Clock, AlertCircle } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";

const UpcomingQuizzes = ({ quizzes }) => {
    const navigate = useNavigate();
    const upcoming = quizzes ? quizzes.slice(0, 3) : [];

    return (
        <div className="bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] dark:from-[#3730a3] dark:to-[#5b21b6] text-white rounded-[2rem] p-6 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 relative overflow-hidden h-full flex flex-col transition-colors">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl mix-blend-overlay" />

            <div className="relative z-10 flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming
                </h3>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">
                    {upcoming.length}
                </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
                {upcoming.length > 0 ? (
                    upcoming.map((quiz, index) => {
                        const isToday = isSameDay(new Date(quiz.date), new Date());
                        return (
                            <motion.div
                                key={quiz._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => isToday && navigate(`/quiz/page/${quiz._id}`)}
                                className={`
                                    group p-4 rounded-2xl border transition-all cursor-pointer
                                    ${isToday
                                        ? 'bg-white/20 border-white/40 hover:bg-white/30'
                                        : 'bg-black/20 border-white/5 hover:bg-black/30'}
                                `}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-sm truncate max-w-[150px]">{quiz.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 opacity-70" />
                                            <span className="text-xs opacity-80 font-medium">
                                                {format(new Date(quiz.date), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                    </div>

                                    {isToday ? (
                                        <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                            <Play className="w-4 h-4 fill-current ml-0.5" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 pb-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <p className="text-sm">No quizzes scheduled</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => navigate('/calendar')}
                className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all"
            >
                View Full Calendar
            </button>
        </div>
    );
};

export default UpcomingQuizzes;
