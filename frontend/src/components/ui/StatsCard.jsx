import React from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Target,
    Flame,
    Brain,
    TrendingUp,
    Zap
} from "lucide-react";

const StatsCard = ({ title, value, subtext, icon: Icon, color, delay, trend }) => {
    // Premium glassmorphism styles
    const styles = {
        blue: "from-blue-500/10 to-blue-600/5 border-blue-200/50 text-blue-600",
        purple: "from-purple-500/10 to-purple-600/5 border-purple-200/50 text-purple-600",
        orange: "from-orange-500/10 to-orange-600/5 border-orange-200/50 text-orange-600",
        yellow: "from-yellow-500/10 to-yellow-600/5 border-yellow-200/50 text-yellow-600",
        green: "from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 text-emerald-600",
    };

    const currentStyle = styles[color] || styles.blue;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -5, shadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            className={`
                relative overflow-hidden rounded-[2rem] p-5
                bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm
                flex flex-col justify-between h-full min-h-[160px]
                transition-all duration-300
            `}
        >
            {/* Background Gradient Mesh */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${currentStyle} blur-2xl opacity-60`} />

            <div className="relative z-10 flex justify-between items-start">
                <div className={`
                    p-3 rounded-2xl bg-white/80 shadow-sm border border-white/50 
                    ${currentStyle.split(' ').pop()}
                `}>
                    <Icon className="w-6 h-6" />
                </div>

                {trend && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-4">
                <h3 className="text-gray-500 font-medium text-sm tracking-wide">{title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                        {value}
                    </h2>
                    {subtext && (
                        <span className="text-xs font-semibold text-gray-400">
                            {subtext}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const StatsGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
            <StatsCard
                title="Total Quizzes"
                value={stats.totalQuizzes || 0}
                subtext="Attempted"
                icon={Brain}
                color="blue"
                delay={0.1}
                trend="+12%"
            />
            <StatsCard
                title="Average Score"
                value={`${Math.round(stats.percentage || 0)}%`}
                icon={Target}
                color="purple"
                delay={0.2}
                trend={stats.percentage > 80 ? "Top 5%" : "Improving"}
            />
            <StatsCard
                title="Current Streak"
                value={stats.streak || 0}
                subtext="Days"
                icon={Flame}
                color="orange"
                delay={0.3}
                trend="On Fire!"
            />
            <StatsCard
                title="Badges Earned"
                value={stats.badges || 0}
                icon={Trophy}
                color="yellow"
                delay={0.4}
                subtext="Keep going"
            />
        </div>
    );
};

export default StatsGrid;
