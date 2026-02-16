import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Send, Mail, MessageCircle } from 'lucide-react';

const SplitText = lazy(() => import('./SplitText'));

const Mission = () => {
    const points = [
        "Offer quality education through modern accessible, comprehensive and research oriented teaching – learning process.",
        "Create opportunities for students and faculty members in acquiring knowledge through research and development.",
        "Providing effective interface with industry by strengthening Industry-Institute interaction and developing entrepreneurial skills.",
        "Meet ever-changing needs for the nation through rational evolution towards sustainable and environment friendly technologies."
    ];

    const socialIcons = [
        { icon: Facebook, color: "text-blue-600" },
        { icon: Twitter, color: "text-slate-950" }, // X icon
        { icon: MessageCircle, color: "text-green-500" }, // WhatsApp
        { icon: Send, color: "text-sky-500" }, // Telegram
        { icon: Mail, color: "text-slate-500" }, // Email
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
        >
            <div className="text-center space-y-6">
                <Suspense fallback={<h1 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">Mission</h1>}>
                    <SplitText
                        text="Mission"
                        className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight"
                        delay={50}
                        duration={0.5}
                        textAlign="center"
                        tag="h1"
                    />
                </Suspense>

                {/* Social Icons */}
                <div className="flex justify-center gap-6 py-2 border-b border-slate-200/60 dark:border-indigo-500/20 max-w-sm mx-auto">
                    {socialIcons.map((social, i) => (
                        <motion.a
                            key={i}
                            href="#"
                            whileHover={{ y: -3, scale: 1.1 }}
                            className={`${social.color} dark:text-indigo-400 transition-colors p-1`}
                        >
                            <social.icon className="w-5 h-5" />
                        </motion.a>
                    ))}
                </div>
            </div>

            <div className="space-y-10 py-4">
                {points.map((point, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                        className="flex items-start gap-8"
                    >
                        <div className="mt-2 shrink-0">
                            <div className="w-5 h-5 rounded-full bg-[#5E17EB] dark:bg-purple-500 shadow-[0_0_15px_rgba(94,23,235,0.4)] dark:shadow-purple-500/40" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                            {point}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Mission;
