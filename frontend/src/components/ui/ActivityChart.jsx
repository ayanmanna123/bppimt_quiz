import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import { Activity, ArrowUpRight } from "lucide-react";

const ActivityChart = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800 transition-colors">
                    <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">{label}</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                        Score: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/40 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
            <div className="flex justify-between items-start mb-6 relative z-10 transition-colors">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                        Performance Trend
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your progress over the last 7 days</p>
                </div>
                <button className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <ArrowUpRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#6366f1"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityChart;
