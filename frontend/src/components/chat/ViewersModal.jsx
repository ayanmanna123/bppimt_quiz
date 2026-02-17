import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users } from "lucide-react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../ui/button";

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
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white">Message Viewers</DialogTitle>
                        </DialogHeader>
                        <p className="text-white/80 text-sm font-medium">People who have seen this message</p>
                    </div>
                </div>

                <div className="p-2">
                    <ScrollArea className="h-[350px] px-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                <p className="text-slate-400 font-bold text-sm animate-pulse uppercase tracking-widest">Fetching viewers...</p>
                            </div>
                        ) : viewers.length > 0 ? (
                            <div className="space-y-2 py-4">
                                {viewers.map((viewer) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={viewer._id}
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group cursor-default"
                                    >
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform">
                                                <AvatarImage src={viewer.picture} />
                                                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {viewer.fullname[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {viewer.fullname}
                                                </h4>
                                                <div className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500 dark:text-slate-400 font-black uppercase tracking-tighter">
                                                    <Clock className="w-3 h-3" />
                                                    Just Now
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 capitalize">{viewer.role || 'Student'}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Users className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                                </div>
                                <h3 className="text-slate-900 dark:text-slate-100 font-bold">No viewers yet</h3>
                                <p className="text-slate-400 text-sm max-w-[200px] mt-1">This message hasn't been seen by anyone else yet.</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewersModal;
