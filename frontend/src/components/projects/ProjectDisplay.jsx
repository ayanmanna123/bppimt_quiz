import React from "react";
import { motion } from "framer-motion";
import { X, Cpu, Code, User, Calendar, ExternalLink, Paperclip, FileText, Image as ImageIcon, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ProjectDisplay = ({ project, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white dark:bg-slate-800 w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${project.category === "Hardware" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                            }`}>
                            {project.category === "Hardware" ? <Cpu size={24} /> : <Code size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                {project.title}
                            </h2>
                            <p className="text-sm text-slate-500">{project.category} Project</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar info */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Project Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <User className="text-blue-500" />
                                        <span className="text-sm font-medium">{project.createdBy?.fullname || "AI Generated"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-purple-500" />
                                        <span className="text-sm font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Hardware Used</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.hardware?.map(h => (
                                        <span key={h} className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase font-bold tracking-wider">
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Software Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.software?.map(s => (
                                        <span key={s} className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase font-bold tracking-wider">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content (Guide) */}
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    Description
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {project.description}
                                </p>
                            </section>

                            <section className="prose dark:prose-invert max-w-none">
                                <h3 className="text-xl font-bold mb-4">Full Build Guide</h3>
                                <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="markdown-content">
                                        <ReactMarkdown>
                                            {project.fullGuide?.instructions || "No detailed instructions provided yet."}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </section>

                            {project.fullGuide?.code && (
                                <section>
                                    <h3 className="text-xl font-bold mb-4">Source Code</h3>
                                    <pre className="p-6 rounded-2xl bg-slate-900 text-slate-100 overflow-x-auto text-sm font-mono">
                                        <code>{project.fullGuide.code}</code>
                                    </pre>
                                </section>
                            )}

                            {/* Attachments Section */}
                            {project.attachments && project.attachments.length > 0 && (
                                <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-700">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Paperclip className="text-blue-500" />
                                        Project Attachments
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {project.attachments.map((file, idx) => (
                                            <motion.div
                                                key={file.fileId || idx}
                                                whileHover={{ y: -5 }}
                                                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                                            >
                                                {file.type === "image" ? (
                                                    <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        <img
                                                            src={file.url}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                            <a
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform"
                                                            >
                                                                <ExternalLink size={20} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50">
                                                        <FileText size={48} className="text-purple-500 mb-2" />
                                                        <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-200/50 dark:bg-slate-700 rounded-full">
                                                            {file.name.split('.').pop()?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="p-4 flex items-center justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold truncate">{file.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">
                                                            {(file.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={file.url}
                                                        download={file.name}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
                                                    >
                                                        <Download size={18} className="text-blue-500" />
                                                    </a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectDisplay;
