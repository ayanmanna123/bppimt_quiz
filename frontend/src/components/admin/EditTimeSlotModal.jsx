import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Clock, Calendar, Save, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const EditTimeSlotModal = ({ isOpen, onClose, subjectId, subjectName }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [timeSlots, setTimeSlots] = useState([]);
    const [error, setError] = useState(null);

    const dayOfWeekOptions = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];

    // Fetch existing slots when modal opens
    useEffect(() => {
        if (isOpen && subjectId) {
            fetchTimeSlots();
        }
    }, [isOpen, subjectId]);

    const fetchTimeSlots = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            // Use the get-subject endpoint which returns the ClassRoom object including timeSlots
            // Route: /get-subject/:subjectId
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/attandance/get-subject/${subjectId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // The response structure is { success: true, subject: { ...timeSlots: [...] } }
            // Note: In clasRoom.controller.js getAttandance, 'subject' is the ClassRoom document.
            if (res.data.success && res.data.subject) {
                setTimeSlots(res.data.subject.timeSlots || []);
            }
        } catch (err) {
            console.error("Error fetching time slots:", err);
            // If 404, it might mean no classroom exists yet (shouldn't happen for valid subjects usually)
            if (err.response?.status === 404) {
                setError("Classroom data not found.");
            } else {
                setError("Failed to load time slots.");
            }
            toast.error("Failed to fetch current time slots");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = () => {
        setTimeSlots([...timeSlots, { dayOfWeek: "", startTime: "", endTime: "" }]);
    };

    const handleRemoveSlot = (index) => {
        const newSlots = [...timeSlots];
        newSlots.splice(index, 1);
        setTimeSlots(newSlots);
    };

    const handleChange = (index, field, value) => {
        const newSlots = [...timeSlots];
        newSlots[index][field] = value;
        setTimeSlots(newSlots);
    };

    const handleSave = async () => {
        // Validation
        for (const slot of timeSlots) {
            if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
                toast.error("Please fill in all fields for all slots");
                return;
            }
        }

        setSaving(true);
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/attandance/update-time-slots/${subjectId}`,
                { timeSlots },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data.success) {
                toast.success("Time slots updated successfully!");
                onClose();
            }
        } catch (err) {
            console.error("Error updating time slots:", err);
            toast.error(err.response?.data?.message || "Failed to update time slots");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-emerald-700 dark:text-emerald-400">
                        <Clock className="w-6 h-6" />
                        Edit Time Slots
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        Manage the weekly schedule for <span className="font-semibold text-gray-700 dark:text-gray-200">{subjectName}</span>.
                    </DialogDescription>
                </DialogHeader>

                {error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-red-500">
                        <AlertCircle className="w-10 h-10 mb-2" />
                        <p>{error}</p>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="mb-4 flex justify-between items-center">
                            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50">
                                {timeSlots.length} Active Slots
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddSlot}
                                className="border-emerald-200 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-800 dark:hover:text-emerald-300 dark:bg-transparent"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Slot
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 pr-4 -mr-4">
                            <div className="space-y-4 p-1">
                                {timeSlots.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p>No time slots configured.</p>
                                        <p className="text-sm">Click "Add Slot" to create a schedule.</p>
                                    </div>
                                ) : (
                                    timeSlots.map((slot, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex-1 min-w-[140px]">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Day</Label>
                                                <Select
                                                    value={slot.dayOfWeek || ""}
                                                    onValueChange={(val) => handleChange(index, "dayOfWeek", val)}
                                                >
                                                    <SelectTrigger className="h-9 bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700">
                                                        <SelectValue placeholder="Select Day" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                        {dayOfWeekOptions.map(day => (
                                                            <SelectItem key={day} value={day} className="dark:text-gray-200 dark:focus:bg-slate-800">{day}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Start Time</Label>
                                                <Input
                                                    type="time"
                                                    value={slot.startTime}
                                                    onChange={(e) => handleChange(index, "startTime", e.target.value)}
                                                    className="h-9 bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">End Time</Label>
                                                <Input
                                                    type="time"
                                                    value={slot.endTime}
                                                    onChange={(e) => handleChange(index, "endTime", e.target.value)}
                                                    className="h-9 bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700"
                                                />
                                            </div>

                                            <div className="flex items-end pb-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveSlot(index)}
                                                    className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-full"
                                                    title="Remove Slot"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditTimeSlotModal;
