import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Eye, Facebook, Twitter, Send, Mail, MessageCircle } from 'lucide-react';

const SplitText = lazy(() => import('./SplitText'));

const Vision = () => {
    const socialIcons = [
        { icon: Facebook, color: "text-blue-600" },
        { icon: Twitter, color: "text-slate-950" }, // X icon
        { icon: MessageCircle, color: "text-green-500" }, // WhatsApp
        { icon: Send, color: "text-sky-500" }, // Telegram
        { icon: Mail, color: "text-slate-500" }, // Email
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
        >
            <div className="text-center space-y-6">
                <Suspense fallback={<h1 className="text-5xl font-black text-slate-900 leading-tight">Vision</h1>}>
                    <SplitText
                        text="Vision"
                        className="text-5xl md:text-6xl font-black text-slate-900 leading-tight"
                        delay={50}
                        duration={0.5}
                        textAlign="center"
                        tag="h1"
                    />
                </Suspense>

                {/* Social Icons */}
                <div className="flex justify-center gap-6 py-2 border-b border-slate-200/60 max-w-sm mx-auto">
                    {socialIcons.map((social, i) => (
                        <motion.a
                            key={i}
                            href="#"
                            whileHover={{ y: -3, scale: 1.1 }}
                            className={`${social.color} transition-colors p-1`}
                        >
                            <social.icon className="w-5 h-5" />
                        </motion.a>
                    ))}
                </div>
            </div>

            <div className="relative p-10 md:p-16 rounded-[3rem] bg-gradient-to-br from-[#03045E] to-blue-900 text-white shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Eye className="w-48 h-48" />
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg mb-8">
                        <Eye className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black">Our Vision</h2>
                    <p className="text-xl md:text-2xl leading-relaxed text-blue-50 font-medium italic">
                        "To emerge as a progressive and premier Institute for Engineering and Technology education with ethical values for creative engineering solutions commensurate with global changes."
                    </p>
                    <div className="pt-10 flex gap-4">
                        <div className="h-1 w-20 bg-rose-500 rounded-full"></div>
                        <div className="h-1 w-10 bg-blue-400 rounded-full"></div>
                        <div className="h-1 w-5 bg-blue-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Vision;
