import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    ClipboardList,
    Plus,
    Upload,
    Download,
    Trash2,
    ArrowLeft,
    Calendar,
    CheckCircle,
    FileText,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

const Assignments = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();
    const { usere } = useSelector(store => store.auth);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create Assignment State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newDeadline, setNewDeadline] = useState("");
    const [creating, setCreating] = useState(false);

    // Submit Assignment State
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submittingId, setSubmittingId] = useState(null); // Assignment ID being submitted to

    // View Submissions State
    const [viewSubmissionsOpen, setViewSubmissionsOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [subjectId]);

    const fetchAssignments = async () => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/assignment/subject/${subjectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAssignments(res.data.assignments);
            }
        } catch (error) {
            console.error(error);
            // toast.error("Failed to fetch assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async () => {
        if (!newTitle || !newDeadline) return toast.error("Title and Deadline are required");
        setCreating(true);
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/assignment/create`,
                { title: newTitle, description: newDesc, deadline: newDeadline, subjectId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success("Assignment created!");
                setAssignments([res.data.assignment, ...assignments]);
                setIsCreateOpen(false);
                setNewTitle("");
                setNewDesc("");
                setNewDeadline("");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Creation failed");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm("Delete this assignment?")) return;
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/assignment/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(assignments.filter(a => a._id !== id));
            toast.success("Deleted successfully");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleSubmitHomework = async (assignmentId) => {
        if (!submissionFile) return toast.error("Please select a file");

        const formData = new FormData();
        formData.append("assignmentId", assignmentId);
        formData.append("file", submissionFile);

        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/assignment/submit`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.success) {
                toast.success("Homework submitted!");
                setSubmittingId(null);
                setSubmissionFile(null);
                // Optionally refresh to show submitted status if we tracked it in list
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Submission failed");
        }
    };

    const loadSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        setViewSubmissionsOpen(true);
        setLoadingSubmissions(true);
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/assignment/${assignment._id}/submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmissions(res.data.submissions);
        } catch (err) {
            toast.error("Failed to load submissions");
        } finally {
            setLoadingSubmissions(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-[#030014] dark:via-[#05001c] dark:to-[#030014] transition-colors duration-700 p-6 overflow-hidden">
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
                className="max-w-6xl mx-auto relative z-10"
            >
                <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6 hover:bg-white/50 dark:hover:bg-indigo-900/30 dark:text-gray-300">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subject
                </Button>

                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-500/30">
                            <ClipboardList className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Assignments</h1>
                            <p className="text-gray-600 dark:text-gray-300">Track and submit your coursework</p>
                        </div>
                    </div>
                    {usere?.role === 'teacher' && (
                        <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <Plus className="mr-2 h-5 w-5" /> Create Assignment
                        </Button>
                    )}
                </div>

                <div className="grid gap-6">
                    {assignments.map((assign, idx) => (
                        <motion.div
                            key={assign._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-indigo-950/40 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-indigo-500/20 hover:shadow-xl transition-all backdrop-blur-sm"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{assign.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">{assign.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg">
                                            <Calendar className="h-4 w-4" />
                                            Deadline: {new Date(assign.deadline).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg">
                                            <FileText className="h-4 w-4" />
                                            Parsed from {new Date(assign.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                {usere?.role === 'teacher' ? (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => loadSubmissions(assign)} className="border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                            <Users className="mr-2 h-4 w-4" /> Submissions
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assign._id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {submittingId === assign._id ? (
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id={`file-${assign._id}`}
                                                        className="hidden"
                                                        onChange={e => setSubmissionFile(e.target.files[0])}
                                                    />
                                                    <label
                                                        htmlFor={`file-${assign._id}`}
                                                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer transition-all text-sm font-medium"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        {submissionFile ? submissionFile.name.substring(0, 15) + "..." : "Select File"}
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleSubmitHomework(assign._id)} className="flex-1 bg-green-600">Submit</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setSubmittingId(null)}>Cancel</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button onClick={() => setSubmittingId(assign._id)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                                                <Upload className="mr-2 h-4 w-4" /> Upload Work
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {assignments.length === 0 && !loading && (
                        <div className="text-center py-20 opacity-60">
                            <ClipboardList className="h-20 w-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">No assignments yet</h3>
                        </div>
                    )}
                </div>

                {/* Create Assignment Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">Create New Assignment</DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                                Fill in the details below to create a new assignment for this subject.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="dark:text-gray-300">Title</Label>
                                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Chapter 1 Homework" className="dark:bg-indigo-950/50 dark:border-indigo-500/30 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="dark:text-gray-300">Description</Label>
                                <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Instructions..." className="dark:bg-indigo-950/50 dark:border-indigo-500/30 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="dark:text-gray-300">Deadline</Label>
                                <Input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="dark:bg-indigo-950/50 dark:border-indigo-500/30 dark:text-white" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateAssignment} disabled={creating}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* View Submissions Dialog */}
                <Dialog open={viewSubmissionsOpen} onOpenChange={setViewSubmissionsOpen}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex justify-between items-center dark:text-white">
                                <span>Submissions for: {selectedAssignment?.title}</span>
                                {submissions.length > 0 && (
                                    <a href={`${import.meta.env.VITE_BACKEND_URL}/assignment/${selectedAssignment?._id}/download-all`} download>
                                        <Button size="sm" className="bg-green-600">
                                            <Download className="mr-2 h-4 w-4" /> Download All ZIP
                                        </Button>
                                    </a>
                                )}
                            </DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                                Review and download student submissions for this assignment.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            {loadingSubmissions ? (
                                <p className="text-center text-gray-500">Loading...</p>
                            ) : submissions.length === 0 ? (
                                <p className="text-center text-gray-500">No submissions yet.</p>
                            ) : (
                                submissions.map(sub => (
                                    <div key={sub._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-indigo-900/30 rounded-lg border dark:border-indigo-500/20 hover:bg-white dark:hover:bg-indigo-900/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${sub.fileUrl?.endsWith('.pdf') ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{sub.student?.fullname || "Unknown Student"}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{sub.student?.universityNo} • {new Date(sub.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <a href={sub.fileUrl} target="_blank" rel="noreferrer">
                                            <Button size="sm" variant="outline" className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                                {sub.fileUrl?.endsWith('.pdf') ? "View PDF" : "View File"}
                                            </Button>
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

            </motion.div>
        </div>
    );
};

export default Assignments;
