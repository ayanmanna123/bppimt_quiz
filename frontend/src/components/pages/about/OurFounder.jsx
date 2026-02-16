import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const SplitText = lazy(() => import('./SplitText'));

const OurFounder = () => {
    const content = [
        "The founder of our Group Late Badri Prasad Poddar, was a multi-faceted personality. After graduating from the University of Calcutta, he embarked on a career in business at the tender age of 19. Within a few years he was a name to reckon with in the industrial, social and educational spheres.",
        "Since the early years of Independence, he involved himself in a nation-building exercise by promoting core-sector industries like coal mining, textiles, jute, tea plantation, engineering, chemicals and infrastructure development. He served as a member of the West Bengal legislature for 11 years and of the All India Congress for over 16 years. He was President of the Bharat Chamber of Commerce, Calcutta for two successive terms and also the President of the Federation of Indian Chambers of Commerce and Industry. As Chairman of the Commission (Asian & Pacific Affairs) and member of the Executive Board of International Chamber of Commerce, he kept abreast of international development in the fields of industry and finance.",
        "He was involved in many educational institutions of the country. He was Chairman of Birla Industrial and Technological Museum and executive committee member of the National Council of Science Museums. He was on the court of governors of Jawaharlal Nehru University, New Delhi and on the Board of Governors of the Indian Institute of Social Welfare and Business Management, Calcutta. As Chairman of the Indian Institute of Technology, Kharagpur he was responsible for initiating the latest Engineering System of Education in India."
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
        >
            <div className="space-y-4">
                <Suspense fallback={<h1 className="text-4xl font-bold text-slate-900 dark:text-white border-b-2 border-rose-500 dark:border-purple-500 pb-2 inline-block">Our Founder</h1>}>
                    <div className="border-b-2 border-rose-500 dark:border-purple-500 pb-2 inline-block">
                        <SplitText
                            text="Our Founder"
                            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white"
                            delay={50}
                            duration={0.5}
                            textAlign="left"
                            tag="h1"
                        />
                    </div>
                </Suspense>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                <motion.div
                    whileHover={{ scale: 1.02, rotate: -1 }}
                    className="w-full lg:w-2/5 shrink-0"
                >
                    <div className="relative p-2 bg-white dark:bg-indigo-950/20 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-blue-100 dark:border-indigo-500/20 rotate-1 transition-transform shadow-[0_10px_40px_rgba(99,102,241,0.1)]">
                        <img
                            src="/Founder.png"
                            alt="Late Badri Prasad Poddar"
                            className="w-full h-auto rounded-2xl object-cover"
                        />
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-600/10 dark:bg-purple-600/20 rounded-full blur-2xl -z-10"></div>
                    </div>
                    <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-blue-100 text-center">
                        <h3 className="text-xl font-bold text-blue-900">Late Badri Prasad Poddar</h3>
                        <p className="text-slate-500 italic">Visionary, Philanthropist & Founder</p>
                    </div>
                </motion.div>

                <div className="flex-1 space-y-6 text-slate-700 leading-relaxed text-lg">
                    {content.map((p, i) => (
                        <motion.p
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                        >
                            {p}
                        </motion.p>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default OurFounder;
