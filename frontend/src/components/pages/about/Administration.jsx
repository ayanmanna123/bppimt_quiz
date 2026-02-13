import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';

const SplitText = lazy(() => import('./SplitText'));

const Administration = () => {
    const staff = [
        { name: "Prof.(Dr.) Sutapa Mukherjee", role: "Principal" },
        { name: "Dr. Sandip Ghosh", role: "Registrar" },
        { name: "Prof.(Dr.) B. N. Chatterji", role: "Dean (Academic Affairs)" },
        { name: "Prof.(Dr.) Shampa Sengupta", role: "Head of the Department (CSE)" },
        { name: "Dr. Sabnam Sengupta", role: "Head of the Department (IT)" },
        { name: "Dr. Surajit Mandal", role: "Head of the Department (ECE)" },
        { name: "Dr. Nandita Sanyal", role: "Head of the Department (EE)" },
        { name: "Dr. Ivy Majumdar", role: "Head of the Department (APSC)" },
        { name: "Dr. Abhijit Bose", role: "Head of the Department (MBA/BBA)" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <Suspense fallback={<h1>Administration</h1>}>
                <div className="border-b-2 border-rose-500 pb-2 inline-block">
                    <SplitText text="Administration" className="text-4xl md:text-5xl font-black text-slate-900" tag="h1" />
                </div>
            </Suspense>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {staff.map((person, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-lg transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{person.name}</h3>
                                <p className="text-sm text-blue-600 font-medium">{person.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Administration;
