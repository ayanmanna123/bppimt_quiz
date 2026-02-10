import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, ChevronRight, BarChart3, Medal } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const RecentActivity = ({ activities }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/40 shadow-sm h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Recent Activity
                </h3>
            </div>

            {/* Timeline Content */}
            <div className="space-y-0 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {activities && activities.length > 0 ? (
                    activities.map((activity, index) => (
                        <div key={activity._id || index} className="relative pl-6 pb-6 last:pb-0 group">
                            {/* Timeline Line */}
                            {index !== activities.length - 1 && (
                                <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-gray-100 group-hover:bg-purple-100 transition-colors" />
                            )}

                            {/* Timeline Dot */}
                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-white bg-purple-50 flex items-center justify-center shadow-sm z-10">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/50 hover:bg-white p-4 rounded-2xl border border-transparent hover:border-purple-100 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => navigate(`/quiz/result/${activity.quizId}`)} // Assuming navigation to result
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm truncate">{activity.quizTitle}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{activity.subjectName}</p>
                                    </div>
                                    <span className={`
                                        text-xs font-bold px-2 py-1 rounded-lg
                                        ${(activity.score / activity.totalMarks) >= 0.8 ? 'bg-green-100 text-green-700' :
                                            (activity.score / activity.totalMarks) >= 0.5 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}
                                    `}>
                                        {Math.round((activity.score / activity.totalMarks) * 100)}%
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                    <span>{format(new Date(activity.date), 'MMM d, h:mm a')}</span>
                                    {activity.score === activity.totalMarks && (
                                        <Medal className="w-4 h-4 text-yellow-500" />
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm">No recent activity yet</p>
                    </div>
                )}
            </div>

            {/* Fade at bottom for scrolling effect */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/80 to-transparent pointer-events-none rounded-b-[2rem]" />
        </div>
    );
};

export default RecentActivity;
