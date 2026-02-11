import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calendar, Clock, Link as LinkIcon, Video, Trash2, ExternalLink, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";

const CreateMeetingModal = ({ isOpen, onClose, subjectId, subjectName }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("list"); // 'list' or 'create'
    const [meetings, setMeetings] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        startTime: "",
        duration: "60",
        meetingLink: "",
        description: "",
    });

    const fetchMeetings = async () => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/meeting/subject/${subjectId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.data.success) {
                setMeetings(res.data.meetings);
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
        }
    };

    React.useEffect(() => {
        if (isOpen && subjectId) {
            fetchMeetings();
            setActiveTab("list");
        }
    }, [isOpen, subjectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const generateJitsiLink = () => {
        const roomName = `BPPIMT-${subjectName.replace(/\s+/g, '-')}-${Date.now()}`;
        const link = `https://meet.jit.si/${roomName}`;
        setFormData((prev) => ({ ...prev, meetingLink: link }));
    };

    const handleDelete = async (meetingId) => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const res = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/meeting/${meetingId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success("Meeting deleted");
                fetchMeetings();
            }
        } catch (error) {
            toast.error("Failed to delete meeting");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/meeting/create`,
                {
                    ...formData,
                    subjectId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                toast.success("Meeting scheduled successfully!");
                setFormData({
                    title: "",
                    date: "",
                    startTime: "",
                    duration: "60",
                    meetingLink: "",
                    description: "",
                });
                setActiveTab("list"); // Switch back to list view
                fetchMeetings(); // Refresh list
            }
        } catch (error) {
            console.error("Error creating meeting:", error);
            toast.error(error.response?.data?.message || "Failed to schedule meeting");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-xl">Manage Online Classes</DialogTitle>
                    </div>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
                    <button
                        onClick={() => setActiveTab("list")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "list" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Scheduled Classes
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "create" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Schedule New
                    </button>
                </div>

                {activeTab === "list" ? (
                    <div className="space-y-4">
                        {meetings.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <Video className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No meetings scheduled.</p>
                                <Button variant="link" onClick={() => setActiveTab("create")} className="mt-2">
                                    Schedule one now
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {meetings.map((meeting) => (
                                    <div key={meeting._id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{meeting.title}</h4>
                                                <p className="text-xs text-gray-500">{meeting.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-blue-600 hover:bg-blue-50 h-8"
                                                    onClick={() => window.open(meeting.meetingLink, "_blank")}
                                                >
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Join
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDelete(meeting._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(meeting.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {meeting.startTime} ({meeting.duration}m)
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Meeting Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., Weekly Doubt Clearing Session"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                min="15"
                                step="15"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="meetingLink">Meeting Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="meetingLink"
                                    name="meetingLink"
                                    placeholder="https://meet.google.com/..."
                                    value={formData.meetingLink}
                                    onChange={handleChange}
                                    required
                                />
                                <Button type="button" variant="outline" size="icon" onClick={generateJitsiLink} title="Generate Jitsi Link">
                                    <Video className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Paste a link or click video icon to generate a Jitsi Meet link.</p>
                        </div>

                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Topics to cover..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setActiveTab("list")}>
                                Back to List
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    "Schedule Meeting"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CreateMeetingModal;
