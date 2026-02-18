import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Plus, Users, Search, BookOpen, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const StudyRooms = () => {
    // const { darktheme } = useSelector((store) => store.auth);
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // New room form state
    const [newRoom, setNewRoom] = useState({
        name: "",
        description: "",
        isPrivate: false
    });

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/study-room/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(res.data);
        } catch (error) {
            console.error("Failed to fetch rooms", error);
            toast.error("Failed to load study rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/study-room/create`, newRoom, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Study room created!");
            setIsModalOpen(false);
            setRooms([res.data, ...rooms]);
            navigate(`/study-room/${res.data._id}`);
        } catch (error) {
            console.error("Failed to create room", error);
            toast.error("Failed to create room");
        }
    };

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
                            Group Study Rooms
                            <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-bold">ALPHA</div>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">Create or join rooms to study together in real-time.</p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto text-lg font-bold shadow-indigo-200 dark:shadow-indigo-900/40 shadow-lg transition-all hover:scale-105"
                    >
                        <Plus className="w-6 h-6 mr-2" />
                        Create New Room
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                    <Input
                        placeholder="Search for a study topic or room name..."
                        className="pl-12 py-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 overflow-hidden"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Rooms Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400" />
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">No study rooms found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Either nobody has created a room for this topic yet, or you're the first one here!</p>
                        <Button variant="outline" className="mt-8 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => setIsModalOpen(true)}>
                            Create the first one
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map((room) => (
                            <motion.div
                                key={room._id}
                                layoutId={room._id}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                                onClick={() => navigate(`/study-room/${room._id}`)}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {room.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex -space-x-2">
                                        {room.members.slice(0, 3).map((member, i) => (
                                            <img
                                                key={i}
                                                src={member.picture}
                                                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                                alt={member.fullname}
                                            />
                                        ))}
                                        {room.members.length > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                +{room.members.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{room.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 h-10">{room.description || "No description provided."}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
                                        <Users className="w-4 h-4" />
                                        <span>{room.members.length} member{room.members.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Room Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl dark:border dark:border-slate-800"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-6">Create Study Room</h2>

                            <form onSubmit={handleCreateRoom} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Room Name</label>
                                    <Input
                                        required
                                        placeholder="e.g. Discrete Math Discussion"
                                        className="py-6 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 focus:ring-indigo-500"
                                        value={newRoom.name}
                                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                    <textarea
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 focus:ring-indigo-500 border p-4 text-sm h-32"
                                        placeholder="What are we studying?"
                                        value={newRoom.description}
                                        onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl py-6 h-auto text-lg font-bold shadow-lg shadow-indigo-100 dark:shadow-indigo-900/40 transition-all">
                                    Launch Room
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudyRooms;
