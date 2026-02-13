import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Heart, BookOpen, Globe } from 'lucide-react';

const SplitText = lazy(() => import('./SplitText'));

const Foundation = () => {
    const cards = [
        { icon: Heart, title: "Philanthropy", text: "Founded on the principles of social upliftment and giving back to society." },
        { icon: BookOpen, title: "Education", text: "Dedicated to providing high-quality technical and management education." },
        { icon: Globe, title: "Reach", text: "Helping students from diverse backgrounds achieve their career dreams." },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <Suspense fallback={<h1>B. P. Poddar Foundation</h1>}>
                <div className="border-b-2 border-rose-500 pb-2 inline-block">
                    <SplitText text="B. P. Poddar Foundation" className="text-4xl md:text-5xl font-black text-slate-900" tag="h1" />
                </div>
            </Suspense>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-200/60 shadow-2xl space-y-8">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center shrink-0">
                        <GraduationCap className="w-14 h-14 text-blue-700" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">Empowering Through Education</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            B. P. Poddar Foundation for Education is a trust dedicated to enrich the quality of technical education in the country. The trust handles various educational initiatives and ensures that the legacy of Late B. P. Poddar continues to inspire future generations.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-3"
                        >
                            <card.icon className="w-10 h-10 text-blue-600 mx-auto" />
                            <h3 className="font-bold text-slate-900">{card.title}</h3>
                            <p className="text-sm text-slate-500">{card.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Foundation;
