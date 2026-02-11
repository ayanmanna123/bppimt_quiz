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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6 hover:bg-white/50">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subject
                </Button>

                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                            <ClipboardList className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
                            <p className="text-gray-600">Track and submit your coursework</p>
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
                            className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{assign.title}</h3>
                                    <p className="text-gray-600 mb-4">{assign.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-lg">
                                            <Calendar className="h-4 w-4" />
                                            Deadline: {new Date(assign.deadline).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                                            <FileText className="h-4 w-4" />
                                            Parsed from {new Date(assign.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                {usere?.role === 'teacher' ? (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => loadSubmissions(assign)} className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                            <Users className="mr-2 h-4 w-4" /> Submissions
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assign._id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {submittingId === assign._id ? (
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                <Input type="file" onChange={e => setSubmissionFile(e.target.files[0])} />
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
                            <ClipboardList className="h-20 w-20 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-500">No assignments yet</h3>
                        </div>
                    )}
                </div>

                {/* Create Assignment Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Assignment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Chapter 1 Homework" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Instructions..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline</Label>
                                <Input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
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
                            <DialogTitle className="flex justify-between items-center">
                                <span>Submissions for: {selectedAssignment?.title}</span>
                                {submissions.length > 0 && (
                                    <a href={`${import.meta.env.VITE_BACKEND_URL}/assignment/${selectedAssignment?._id}/download-all`} download>
                                        <Button size="sm" className="bg-green-600">
                                            <Download className="mr-2 h-4 w-4" /> Download All ZIP
                                        </Button>
                                    </a>
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            {loadingSubmissions ? (
                                <p className="text-center text-gray-500">Loading...</p>
                            ) : submissions.length === 0 ? (
                                <p className="text-center text-gray-500">No submissions yet.</p>
                            ) : (
                                submissions.map(sub => (
                                    <div key={sub._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                        <div>
                                            <p className="font-semibold">{sub.student?.fullname || "Unknown Student"}</p>
                                            <p className="text-xs text-gray-500">{sub.student?.universityNo} • {new Date(sub.createdAt).toLocaleString()}</p>
                                        </div>
                                        <a href={sub.fileUrl} target="_blank" rel="noreferrer">
                                            <Button size="sm" variant="outline">View File</Button>
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
