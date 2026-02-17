import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users, Search, GraduationCap, School } from "lucide-react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";

const GroupMembersModal = ({ isOpen, onClose, subjectId, type, groupName }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchMembers = async () => {
            if (!subjectId || !isOpen) return;
            setLoading(true);
            try {
                const token = await getAccessTokenSilently();
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/chat/members/${subjectId}?type=${type}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMembers(res.data);
            } catch (error) {
                console.error("Failed to fetch members", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [subjectId, isOpen, type, getAccessTokenSilently]);

    const filteredMembers = members.filter(m =>
        m.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden transition-all duration-300">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full -ml-12 -mb-12 blur-2xl" />

                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/20 rounded-[1.25rem] flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-inner">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-white tracking-tight">Group Members</DialogTitle>
                            </DialogHeader>
                            <p className="text-indigo-100/90 text-sm font-semibold mt-1 flex items-center gap-1.5">
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-white/10">
                                    {type === 'subject' ? 'Academic' : 'Collaborative'}
                                </span>
                                {groupName || 'Community'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="Find a member..."
                            className="pl-11 pr-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-sm font-medium shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-2">
                    <ScrollArea className="h-[400px] px-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-5">
                                <div className="relative">
                                    <Loader2 className="h-14 w-14 animate-spin text-indigo-500 opacity-20" />
                                    <Loader2 className="h-14 w-14 animate-spin text-indigo-600 absolute inset-0 [animation-delay:-0.5s]" />
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">Gathering Members</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Preparing the list for you...</p>
                                </div>
                            </div>
                        ) : filteredMembers.length > 0 ? (
                            <div className="space-y-1.5 py-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredMembers.map((member, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            key={member._id}
                                            className="flex items-center gap-4 p-3.5 rounded-[1.5rem] hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group cursor-default border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50"
                                        >
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-110 transition-transform duration-300">
                                                    <AvatarImage src={member.picture} />
                                                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-600 dark:text-indigo-400 font-bold">
                                                        {member.fullname[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {member.isOnline && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {member.fullname}
                                                    </h4>
                                                    <div className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${member.role === 'teacher'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50'
                                                        }`}>
                                                        {member.role === 'teacher' ? <GraduationCap className="w-3 h-3" /> : <School className="w-3 h-3" />}
                                                        {member.role || 'Student'}
                                                    </div>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 truncate flex items-center gap-1">
                                                    {member.department} • Semester {member.semester}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 border-2 border-slate-100 dark:border-slate-800">
                                    <Users className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                                </div>
                                <h3 className="text-slate-900 dark:text-white font-black text-lg">No members found</h3>
                                <p className="text-slate-400 dark:text-slate-500 text-sm max-w-[240px] mt-2 font-medium">Try adjusting your search or check back later.</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">
                        {members.length} {members.length === 1 ? 'member' : 'members'} in total
                    </p>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="rounded-2xl font-black text-sm px-8 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        Dismiss
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GroupMembersModal;
