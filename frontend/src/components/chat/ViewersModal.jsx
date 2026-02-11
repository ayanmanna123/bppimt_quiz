import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users } from "lucide-react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const ViewersModal = ({ isOpen, onClose, messageId }) => {
    const [viewers, setViewers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchViewers = async () => {
            if (!messageId || !isOpen) return;
            setLoading(true);
            try {
                const token = await getAccessTokenSilently();
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/chat/viewers/${messageId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setViewers(res.data);
            } catch (error) {
                console.error("Failed to fetch viewers", error);
            } finally {
                setLoading(false);
            }
        };

        fetchViewers();
    }, [messageId, isOpen, getAccessTokenSilently]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Seen by
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[300px] mt-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm">Loading viewers...</p>
                        </div>
                    ) : viewers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <p className="text-sm italic">No one has seen this message yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {viewers.map((viewer) => (
                                <div key={viewer._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Avatar className="w-10 h-10 border border-slate-100">
                                        <AvatarImage src={viewer.picture} />
                                        <AvatarFallback>{viewer.fullname?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-700">
                                            {viewer.fullname}
                                        </span>
                                        <span className="text-xs text-slate-400 capitalize">
                                            {viewer.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default ViewersModal;
