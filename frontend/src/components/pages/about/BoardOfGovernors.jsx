import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const SplitText = lazy(() => import('./SplitText'));

const BoardOfGovernors = () => {
    const members = [
        { name: "Shri Arun Poddar", role: "Chairman, B. P. Poddar Group" },
        { name: "Shri Ayush Poddar", role: "Vice-Chairman, B. P. Poddar Institute of Management and Technology" },
        { name: "Dr. Subir Choudhury", role: "Founder Trustee & Chief Mentor, B. P. Poddar Institute of Management and Technology" },
        { name: "Mr. Satish Kumar Jhunjhunwala", role: "MD, Victory Iron Works LTD" },
        { name: "AICTE – Regional Officer", role: "(Ex-officio)" },
        { name: "Prof. Atal Chowdhury, J.U.", role: "Nominee of AICTE Regional Committee" },
        { name: "Dr. Madhumita Das Sarkar", role: "Associate Professor, MAKAUT, Nominee of Maulana Abul Kalam Azad University of Technology, West Bengal" },
        { name: "Director of Technical Education", role: "(Ex-officio)" },
        { name: "Prof. (Dr.) B. N. Chatterji", role: "Professor, Computer Science and Engineering Dept., B. P. Poddar Institute of Management and Technology" },
        { name: "Mr. Amlan Raychaudhuri", role: "Assistant Professor, Computer Science and Engineering Dept., B. P. Poddar Institute of Management and Technology" },
        { name: "Prof.(Dr.) Sutapa Mukherjee", role: "Principal, B. P. Poddar Institute of Management and Technology — Member Secretary" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <Suspense fallback={<h1>Board of Governors</h1>}>
                <div className="border-b-2 border-rose-500 pb-2 inline-block">
                    <SplitText text="Board of Governors" className="text-4xl md:text-5xl font-black text-slate-900" tag="h1" />
                </div>
            </Suspense>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
                <div className="p-8 space-y-4">
                    {members.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 10, backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                            className="flex items-start gap-4 p-4 rounded-2xl transition-all border-b border-slate-50 last:border-0"
                        >
                            <div className="mt-1 shrink-0">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                                <p className="text-slate-500">{member.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default BoardOfGovernors;
