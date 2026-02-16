import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, Trash2, ArrowLeft, Upload, BookOpen } from 'lucide-react';
import { motion } from "framer-motion";

const SubjectNotes = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();
    const { usere } = useSelector(store => store.auth);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upload state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, [subjectId]);

    const fetchNotes = async () => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/note/subject/${subjectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotes(res.data.notes);
            }
        } catch (error) {
            console.error(error);
            // toast.error("Failed to fetch notes"); // Fails silently if unauthorized initially
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return toast.error("Title and File are required");

        setUploading(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("subjectId", subjectId);
        formData.append("file", file);

        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/note/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.success) {
                toast.success("Note uploaded successfully");
                setNotes([res.data.note, ...notes]);
                setTitle("");
                setDescription("");
                setFile(null);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/note/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(notes.filter(n => n._id !== noteId));
            toast.success("Deleted successfully");
        } catch (err) {
            toast.error("Delete failed");
        }
    }

    const handlePreviewPdf = async (noteId) => {
        try {
            const toastId = toast.loading("Generating PDF preview...");

            // We can use the public endpoint directly since we made it public (or use token if we reverted that, but likely public for now based on previous steps)
            // Using axios to fetch blob
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/note/${noteId}/download/pdf`, {
                responseType: 'blob'
            });

            const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(pdfBlob);

            toast.dismiss(toastId);
            window.open(pdfUrl, '_blank');

            // Optional: revoke URL after some time to free memory, but tricky if user keeps tab open. 
            // Often acceptable to let it be for the session or revoke on component unmount if stored.
            // For a simple open, we might not revoke immediately.
            setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 60000); // Revoke after 1 minute

        } catch (error) {
            console.error("PDF Preview Error:", error);
            toast.error("Failed to load PDF preview");
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-[#030014] dark:via-[#05001c] dark:to-[#030014] transition-colors duration-700 p-6 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none"></div>
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
                }}
            ></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto relative z-10"
            >
                <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6 hover:bg-white/50 dark:hover:bg-indigo-900/30 dark:text-gray-300">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subject
                </Button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Study Materials</h1>
                        <p className="text-gray-600 dark:text-gray-300">Access and share lecture notes and resources</p>
                    </div>
                </div>

                {usere?.role === 'teacher' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 dark:bg-indigo-950/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 dark:border-indigo-500/20 mb-10"
                    >
                        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Upload New Material
                        </h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Title (e.g., Lecture 1: Introduction)"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-500/30 bg-white dark:bg-indigo-900/30 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder-indigo-300/50"
                                />
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-500/30 bg-white dark:bg-indigo-900/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/50 cursor-pointer dark:text-gray-300"
                                />
                            </div>
                            <textarea
                                placeholder="Description (optional)"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-500/30 bg-white dark:bg-indigo-900/30 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-24 resize-none dark:text-white dark:placeholder-indigo-300/50"
                            />

                            <div className="flex justify-end">
                                <Button disabled={uploading} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                                    {uploading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                            Uploading...
                                        </div>
                                    ) : (
                                        <><Upload className="mr-2 h-5 w-5" /> Upload Note</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note, idx) => {
                        const isPdf = note.fileUrl?.endsWith(".pdf");
                        const isImage = note.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        const isVideo = note.fileUrl?.match(/\.(mp4|webm|ogg)$/i);

                        return (
                            <motion.div
                                key={note._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-indigo-950/40 rounded-2xl shadow-lg border border-gray-100 dark:border-indigo-500/20 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group backdrop-blur-sm"
                            >
                                <div className="p-6 flex-grow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${isPdf ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : isImage ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : isVideo ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>
                                            {isPdf ? <FileText className="h-6 w-6" /> : isImage ? <FileText className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                        </div>
                                        {(usere?.role === 'teacher' && usere?._id === note.uploadedBy?._id) && (
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(note._id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full">
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 line-clamp-2" title={note.title}>{note.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">{note.description || "No description provided."}</p>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 dark:bg-indigo-900/20 border-t border-gray-100 dark:border-indigo-500/20 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Uploaded on</span>
                                        <span className="text-xs text-gray-700 dark:text-gray-300">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {isPdf ? (
                                            <>
                                                <a
                                                    href={`${import.meta.env.VITE_BACKEND_URL}/note/${note._id}/download`}
                                                    download
                                                >
                                                    <Button size="sm" className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm rounded-xl">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        ZIP
                                                    </Button>
                                                </a>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePreviewPdf(note._id)}
                                                    className="bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-sm rounded-xl"
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Preview PDF
                                                </Button>
                                            </>
                                        ) : (
                                            <a
                                                href={note.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button size="sm" variant="outline" className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 dark:hover:bg-indigo-900/30">
                                                    View
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {notes.length === 0 && !loading && (
                    <div className="text-center py-20 opacity-60">
                        <FileText className="h-20 w-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">No notes available yet</h3>
                        <p className="text-gray-400 dark:text-gray-500">Check back later for updates</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SubjectNotes;