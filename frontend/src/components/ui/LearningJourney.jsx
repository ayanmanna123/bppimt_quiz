import React, { useMemo } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { motion } from "framer-motion";
import { Activity, Flame, Trophy } from "lucide-react";
import { format, subDays, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from "date-fns";
import "react-calendar-heatmap/dist/styles.css";

const LearningJourney = ({ streakData }) => {
    // Transform streak data into the format expected by react-calendar-heatmap
    // streakData is assumed to be an array of { date: string, count: number }
    const heatmapData = useMemo(() => {
        if (!streakData || streakData.length === 0) return [];

        // Normalize data
        const map = new Map();
        streakData.forEach(item => {
            const dateStr = item.date.split('T')[0]; // Ensure YYYY-MM-DD
            map.set(dateStr, (map.get(dateStr) || 0) + item.count);
        });

        // Convert map to array
        return Array.from(map, ([date, count]) => ({ date, count }));
    }, [streakData]);

    // Calculate stats
    const totalActivities = heatmapData.reduce((acc, curr) => acc + curr.count, 0);
    const maxStreak = streakData?.length > 0 ? Math.max(...streakData.map(s => s.count)) : 0;

    // Date Range (Show full year mostly for the visual shown in screenshot)
    const today = new Date();
    const startDate = subDays(today, 365);

    return (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white/40 dark:border-slate-800 shadow-sm w-full relative overflow-hidden transition-colors">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 relative z-10 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Learning Journey
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <span className="text-xl">🚀</span>
                        </motion.div>
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Your daily quiz activity throughout the year
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-xl shadow-md shadow-green-200 dark:shadow-green-900/40">
                        <Flame className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm whitespace-nowrap">{streakData?.length || 0} Day Streak</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] dark:bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/40">
                        <Trophy className="w-4 h-4" />
                        <span className="font-bold text-sm whitespace-nowrap">{totalActivities} Total Activities</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[800px]">
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={today}
                        values={heatmapData}
                        classForValue={(value) => {
                            if (!value) {
                                return "color-empty";
                            }
                            return `color-github-${Math.min(value.count, 4)}`;
                        }}
                        tooltipDataAttrs={(value) => {
                            if (!value || !value.date) {
                                return { 'data-tooltip-content': 'No activity' };
                            }
                            const date = new Date(value.date);
                            return {
                                'data-tooltip-id': 'heatmap-tooltip',
                                'data-tooltip-content': `${format(date, 'MMM d, yyyy')}: ${value.count} activities`,
                            };
                        }}
                        showweekdaylabels={true}
                        gutterSize={2}
                    />
                    <ReactTooltip id="heatmap-tooltip" />
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-[#ebedf0] dark:bg-slate-800" />
                    <div className="w-3 h-3 rounded-sm bg-[#dbeafe] dark:bg-blue-900/40" />
                    <div className="w-3 h-3 rounded-sm bg-[#93c5fd] dark:bg-blue-700/60" />
                    <div className="w-3 h-3 rounded-sm bg-[#3b82f6] dark:bg-blue-600" />
                    <div className="w-3 h-3 rounded-sm bg-[#1d4ed8] dark:bg-blue-500" />
                </div>
                <span>More</span>
            </div>

            {/* Simple Style Injection for Heatmap Colors */}
            <style dangerouslySetInnerHTML={{
                __html: `
            .react-calendar-heatmap text {
                font-size: 10px;
                fill: #9ca3af;
            }
            .dark .react-calendar-heatmap text {
                fill: #64748b;
            }
            .react-calendar-heatmap .color-empty { fill: #f3f4f6; }
            .dark .react-calendar-heatmap .color-empty { fill: #1e293b; } /* slate-800 */
            
            .react-calendar-heatmap .color-github-1 { fill: #dbeafe; } /* blue-100 */
            .dark .react-calendar-heatmap .color-github-1 { fill: #1e3a8a; } /* blue-900 */
            
            .react-calendar-heatmap .color-github-2 { fill: #93c5fd; } /* blue-300 */
            .dark .react-calendar-heatmap .color-github-2 { fill: #1d4ed8; } /* blue-700 */
            
            .react-calendar-heatmap .color-github-3 { fill: #3b82f6; } /* blue-500 */
            .dark .react-calendar-heatmap .color-github-3 { fill: #2563eb; } /* blue-600 */
            
            .react-calendar-heatmap .color-github-4 { fill: #1d4ed8; } /* blue-700 */
            .dark .react-calendar-heatmap .color-github-4 { fill: #3b82f6; } /* blue-500 */
            
            /* Rounded rects */
            .react-calendar-heatmap rect {
                rx: 2px;
                ry: 2px;
            }
        `}} />
        </div>
    );
};

export default LearningJourney;
