import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './../../../styles/dating.css';

const DatingWelcomePopup = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        onClose();
        navigate('/dating/profile');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 20 }}
                        className="glass-morphism max-w-lg w-full p-10 text-center relative overflow-hidden"
                    >
                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-8 rotate-12">
                                <Heart className="w-10 h-10 text-white fill-current" />
                            </div>

                            <h2 className="text-4xl font-black neon-text-pink mb-4 italic tracking-tighter">
                                Welcome to BPPIMT Date
                            </h2>

                            <p className="text-xl text-white/80 mb-8 leading-relaxed">
                                Ready to find your perfect match within the campus?
                                <span className="block mt-2 text-pink-400 font-medium flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5" /> Your journey starts here.
                                </span>
                            </p>

                            <div className="space-y-4 text-left glass-morphism p-6 mb-10 bg-white/5">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400 font-bold">1</div>
                                    <p className="text-sm opacity-70">Complete your profile with your best photos and interests.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400 font-bold">2</div>
                                    <p className="text-sm opacity-70">Swipe right on people you find interesting.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400 font-bold">3</div>
                                    <p className="text-sm opacity-70">It's a match! Start a conversation and meet up.</p>
                                </div>
                            </div>

                            <button
                                onClick={handleGetStarted}
                                className="neon-button w-full py-5 text-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                Get Started <ArrowRight className="w-6 h-6" />
                            </button>

                            <p className="mt-6 text-xs opacity-40">
                                By joining, you agree to our community guidelines of respect and safety.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DatingWelcomePopup;
