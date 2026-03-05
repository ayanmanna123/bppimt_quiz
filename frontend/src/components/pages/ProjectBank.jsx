import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Book, Cpu, Code } from "lucide-react";
import axios from "axios";
import IdeaWizard from "../projects/IdeaWizard"; // We'll create this next
import ProjectDisplay from "../projects/ProjectDisplay"; // We'll create this next
import UploadProjectForm from "../projects/UploadProjectForm";

const ProjectBank = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get("/api/v1/projects/all");
            if (res.data.success) {
                setProjects(res.data.projects);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-20 px-4 md:px-8 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
                        >
                            Project Bank
                        </motion.h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
                            Discover student projects or use AI to generate instructions and code for your next big idea.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl font-semibold transition-all active:scale-95"
                        >
                            <Plus />
                            <span>Share Project</span>
                        </button>
                        <button
                            onClick={() => setShowWizard(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                        >
                            <Search className="text-xl" />
                            <span>AI Project Idea</span>
                        </button>
                    </div>
                </div>

                {/* Search & Stats */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl flex items-center gap-2">
                            <Book className="text-blue-500" />
                            <span className="font-medium">{projects.length} Projects</span>
                        </div>
                    </div>
                </div>

                {/* Project Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <motion.div
                                key={project._id}
                                layoutId={project._id}
                                onClick={() => setSelectedProject(project)}
                                className="group relative bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/30 hover:border-blue-500/50 transition-all cursor-pointer backdrop-blur-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${project.category === "Hardware" ? "bg-orange-500/10 text-orange-500" :
                                        project.category === "Software" ? "bg-blue-500/10 text-blue-500" :
                                            "bg-purple-500/10 text-purple-500"
                                        }`}>
                                        {project.category === "Hardware" ? <Cpu size={24} /> : <Code size={24} />}
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50">
                                        {project.category}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">
                                    {project.description}
                                </p>

                                <div className="flex items-center gap-3 mt-auto">
                                    {project.createdBy?.picture && (
                                        <img src={project.createdBy.picture} alt="" className="w-8 h-8 rounded-full" />
                                    )}
                                    <div className="text-xs">
                                        <p className="font-semibold">{project.createdBy?.fullname || "AI Generator"}</p>
                                        <p className="text-slate-500">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* No Results */}
                {!loading && filteredProjects.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-medium text-slate-500">No projects found.</h3>
                        <button
                            onClick={() => setShowWizard(true)}
                            className="mt-4 text-blue-500 hover:underline"
                        >
                            Be the first to add one!
                        </button>
                    </div>
                )}
            </div>

            {/* Idea Wizard Modal */}
            <AnimatePresence>
                {showWizard && (
                    <IdeaWizard
                        onClose={() => setShowWizard(false)}
                        onProjectCreated={fetchProjects}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showUpload && (
                    <UploadProjectForm
                        onClose={() => setShowUpload(false)}
                        onProjectUploaded={fetchProjects}
                    />
                )}
            </AnimatePresence>

            {/* Project Details Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectDisplay
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectBank;
