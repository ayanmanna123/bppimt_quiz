import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const SplitText = lazy(() => import('./SplitText'));

const AboutBPPIMT = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <Suspense fallback={<h1 className="text-4xl font-bold text-slate-900 dark:text-white">About BPPIMT</h1>}>
                <div className="border-b-2 border-rose-500 dark:border-purple-500 pb-2 inline-block">
                    <SplitText text="About BPPIMT" className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white" tag="h1" />
                </div>
            </Suspense>

            <div className="space-y-8">
                <motion.div
                    className="rounded-3xl overflow-hidden shadow-2xl h-[400px] relative group"
                    whileHover={{ scale: 1.01 }}
                >
                    <img src="/campas.png" alt="BPPIMT Campus" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
                        <p className="text-white text-xl font-medium max-w-2xl">
                            "A tribute to Late B. P. Poddar, a visionary philanthropist, educationist and founding father of the group."
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-lg leading-relaxed text-slate-700 dark:text-indigo-100/80">
                    <div className="space-y-4">
                        <p>
                            In 1999, B.P Poddar Institute of Management & Technology (BPPIMT) was established as a tribute to late B. P. Poddar, a visionary philanthropist, educationist and founding father of the group.
                        </p>
                        <p>
                            Supported by the B. P. Poddar Foundation for Education, a trust dedicated to enrich the quality of technical education in the country, the institute is affiliated to the Maulana Abul Kalam Azad University of Technology, West Bengal (MAKAUT) and approved by the All India Council for Technical Education (AICTE).
                        </p>
                    </div>
                    <div className="p-8 bg-blue-50 dark:bg-indigo-950/20 backdrop-blur-md rounded-3xl border border-blue-100 dark:border-indigo-500/20 flex items-center justify-center shadow-lg dark:shadow-indigo-500/10">
                        <div className="text-center">
                            <h4 className="text-4xl font-black text-blue-800 dark:text-white mb-2">1999</h4>
                            <p className="text-blue-600 dark:text-indigo-400 font-bold tracking-wider">ESTABLISHED</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AboutBPPIMT;
