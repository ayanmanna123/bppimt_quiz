import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Monitor, Target, ChevronRight, Check } from "lucide-react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const IdeaWizard = ({ onClose, onProjectCreated }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    // ... rest of state stays same
    const [form, setForm] = useState({
        requirements: "",
        hardware: "",
        software: "",
    });
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIdea, setSelectedIdea] = useState(null);

    const handleNext = async () => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (step === 1) {
                setLoading(true);
                const fullReqs = `Project Goal: ${form.requirements}\nHardware: ${form.hardware}\nSoftware: ${form.software}`;
                const res = await axios.post("/api/v1/projects/ideas", { requirements: fullReqs }, config);
                if (res.data.success) {
                    setSuggestions(res.data.suggestedIdeas);
                    setStep(2);
                }
            } else if (step === 2 && selectedIdea) {
                setLoading(true);
                const res = await axios.post("/api/v1/projects/guide", { projectIdea: selectedIdea }, config);
                if (res.data.success) {
                    const saveRes = await axios.post("/api/v1/projects/upload", {
                        ...selectedIdea,
                        fullGuide: { instructions: res.data.guide },
                        isAiGenerated: true,
                        originalRequirements: form.requirements
                    }, config);

                    if (saveRes.data.success) {
                        onProjectCreated();
                        onClose();
                    }
                }
            }
        } catch (error) {
            console.error("Discovery/Guide error:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-2xl font-bold">New Project Discovery</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Multi-step Content */}
                <div className="p-8">
                    {/* Step Indicators */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= i ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                                    }`}>
                                    {step > i ? <Check /> : i}
                                </div>
                                {i === 1 && <div className={`w-12 h-1 ${step > 1 ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`} />}
                            </div>
                        ))}
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    <Target className="text-blue-500" />
                                    What do you want to build?
                                </label>
                                <textarea
                                    value={form.requirements}
                                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                                    placeholder="Example: I want to build a smart home monitoring system using Arduino..."
                                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none h-32 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                        <Cpu className="text-orange-500" />
                                        Hardware components (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.hardware}
                                        onChange={(e) => setForm({ ...form, hardware: e.target.value })}
                                        placeholder="e.g. ESP32, DHT11 sensor"
                                        className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                        <Monitor className="text-blue-400" />
                                        Preferred Software
                                    </label>
                                    <input
                                        type="text"
                                        value={form.software}
                                        onChange={(e) => setForm({ ...form, software: e.target.value })}
                                        placeholder="e.g. Arduino IDE, Python"
                                        className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg mb-2">Select an idea to generate full instructions:</h3>
                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                {suggestions.map((idea, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedIdea(idea)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedIdea === idea
                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-slate-100 dark:border-slate-700 hover:border-blue-500/50"
                                            }`}
                                    >
                                        <h4 className="font-bold text-blue-600 dark:text-blue-400">{idea.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{idea.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {idea.hardware?.map(h => (
                                                <span key={h} className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase font-bold tracking-wider">
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                    <button
                        onClick={() => step === 1 ? onClose() : setStep(1)}
                        className="px-6 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                    >
                        {step === 1 ? "Cancel" : "Back"}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={loading || (step === 2 && !selectedIdea) || (step === 1 && !form.requirements)}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{step === 1 ? "Find Ideas" : "Generate Full Guide"}</span>
                                <ChevronRight />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default IdeaWizard;
