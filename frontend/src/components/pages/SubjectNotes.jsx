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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6 hover:bg-white/50">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subject
                </Button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Study Materials</h1>
                        <p className="text-gray-600">Access and share lecture notes and resources</p>
                    </div>
                </div>

                {usere?.role === 'teacher' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 mb-10"
                    >
                        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-indigo-600" />
                            Upload New Material
                        </h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Title (e.g., Lecture 1: Introduction)"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                            </div>
                            <textarea
                                placeholder="Description (optional)"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-24 resize-none"
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
                    {notes.map((note, idx) => (
                        <motion.div
                            key={note._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                        >
                            <div className="p-6 flex-grow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    {(usere?.role === 'teacher' && usere?._id === note.uploadedBy?._id) && (
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(note._id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>

                                <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">{note.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{note.description || "No description provided."}</p>

                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium">Uploaded on</span>
                                    <span className="text-xs text-gray-700">{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>

                                <a
                                    href={note.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button size="sm" className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm rounded-xl">
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </Button>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {notes.length === 0 && !loading && (
                    <div className="text-center py-20 opacity-60">
                        <FileText className="h-20 w-20 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500">No notes available yet</h3>
                        <p className="text-gray-400">Check back later for updates</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SubjectNotes;
