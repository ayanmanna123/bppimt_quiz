import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, UploadCloud, Paperclip, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const UploadProjectForm = ({ onClose, onProjectUploaded }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [loading, setLoading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    // ... rest same
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "Hardware",
        hardware: "",
        software: "",
        instructions: "",
        code: "",
        attachments: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.post("/api/v1/projects/upload", {
                ...form,
                hardware: form.hardware.split(",").map(i => i.trim()),
                software: form.software.split(",").map(i => i.trim()),
                fullGuide: {
                    instructions: form.instructions,
                    code: form.code
                }
            }, config);
            if (res.data.success) {
                onProjectUploaded();
                onClose();
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingFiles(true);
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            };

            const uploaded = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                try {
                    const res = await axios.post("/api/v1/upload", formData, config);
                    uploaded.push(res.data);
                } catch (err) {
                    console.error("Upload failed for:", file.name, err);
                }
            }

            setForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...uploaded]
            }));
        } catch (error) {
            console.error("Token error during upload:", error);
        } finally {
            setUploadingFiles(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-2xl font-bold">Share Your Project</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500">Project Title</label>
                            <input
                                required
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="e.g. Smart Irrigation System"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option>Hardware</option>
                                <option>Software</option>
                                <option>IoT</option>
                                <option>Robotics</option>
                                <option>Web</option>
                                <option>AI/ML</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-500">Description</label>
                        <textarea
                            required
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                            placeholder="What does it do?"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500">Hardware (comma separated)</label>
                            <input
                                value={form.hardware}
                                onChange={(e) => setForm({ ...form, hardware: e.target.value })}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Arduino, L298N, IR Sensor"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500">Software Stack (comma separated)</label>
                            <input
                                value={form.software}
                                onChange={(e) => setForm({ ...form, software: e.target.value })}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Arduino IDE, Blynk App"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-500">Instructions (Markdown)</label>
                        <textarea
                            value={form.instructions}
                            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none h-32 font-mono text-sm"
                            placeholder="Step 1: Connect the components... (Supports Markdown)"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-500">Source Code</label>
                        <textarea
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            className="w-full p-4 rounded-xl bg-slate-900 text-green-400 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none h-32 font-mono text-sm"
                            placeholder="Paste your code here..."
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                            <Paperclip size={16} />
                            Attachments (Images, PDF, Files)
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 transition-colors cursor-pointer group">
                                {uploadingFiles ? (
                                    <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UploadCloud className="text-slate-400 group-hover:text-blue-500 transition-colors mb-2" size={32} />
                                        <span className="text-xs font-medium text-slate-500">Click to upload files</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>

                            {/* Attachment List */}
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence>
                                    {form.attachments.map((file, idx) => (
                                        <motion.div
                                            key={file.fileId || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {file.type === "image" ? <ImageIcon size={18} className="text-blue-500 shrink-0" /> : <FileText size={18} className="text-purple-500 shrink-0" />}
                                                <span className="text-xs font-medium truncate">{file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setForm(prev => ({
                                                    ...prev,
                                                    attachments: prev.attachments.filter((_, i) => i !== idx)
                                                }))}
                                                className="p-1 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {form.attachments.length === 0 && !uploadingFiles && (
                                    <div className="h-full flex items-center justify-center border border-slate-100 dark:border-slate-800 rounded-2xl italic text-xs text-slate-400">
                                        No files attached
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <UploadCloud size={20} />
                                <span>Upload Project</span>
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default UploadProjectForm;
