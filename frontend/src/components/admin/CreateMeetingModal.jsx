import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calendar, Clock, Link as LinkIcon, Video } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";

const CreateMeetingModal = ({ isOpen, onClose, subjectId, subjectName }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        startTime: "",
        duration: "60",
        meetingLink: "",
        description: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const generateJitsiLink = () => {
        const roomName = `BPPIMT-${subjectName.replace(/\s+/g, '-')}-${Date.now()}`;
        const link = `https://meet.jit.si/${roomName}`;
        setFormData((prev) => ({ ...prev, meetingLink: link }));
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
                onClose();
                setFormData({
                    title: "",
                    date: "",
                    startTime: "",
                    duration: "60",
                    meetingLink: "",
                    description: "",
                })
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Schedule Online Class</DialogTitle>
                </DialogHeader>
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateMeetingModal;
