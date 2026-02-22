import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, User, Star, MapPin, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './../../../styles/dating.css';

const DatingLikes = () => {
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const [likedUsers, setLikedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLikes();
    }, []);

    const fetchLikes = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dating/likes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setLikedUsers(response.data.users);
            }
        } catch (error) {
            console.error("Error fetching likes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, type) => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/dating/swipe`, {
                swipedUserId: userId,
                type: type === 'like' ? 'like' : 'pass'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Remove from local list
                setLikedUsers(prev => prev.filter(u => u._id !== userId));
                if (response.data.isMatch) {
                    alert("It's a Match! You can now chat with them.");
                }
            }
        } catch (error) {
            console.error("Error swiping from Likes page:", error);
        }
    };

    if (loading) return <div className="dating-container flex items-center justify-center pt-20">Loading...</div>;

    return (
        <div className="dating-container pt-10 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black neon-text-pink mb-10 flex items-center gap-3">
                    <Star className="w-10 h-10 text-yellow-400 fill-current" /> People Who Like You
                </h1>

                {likedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {likedUsers.map((user) => (
                                <motion.div
                                    key={user._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="glass-morphism overflow-hidden group hover:neon-border transition-all flex flex-col h-full"
                                >
                                    <div className="relative aspect-[4/5]">
                                        <img
                                            src={user.datingPhotos?.[0] || user.picture}
                                            alt={user.fullname}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                            <h2 className="text-xl font-bold">{user.fullname}, {user.age || '—'}</h2>
                                            <p className="text-xs opacity-70">{user.department} • {user.semester}th Sem</p>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3 flex-1">
                                        {user.bio && <p className="text-sm opacity-60 line-clamp-2 italic">"{user.bio}"</p>}
                                        <div className="flex flex-wrap gap-1">
                                            {user.interests?.slice(0, 3).map((interest, i) => (
                                                <span key={i} className="text-[10px] uppercase font-bold tracking-widest bg-white/5 py-1 px-2 rounded-full border border-white/10">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 grid grid-cols-2 gap-3 border-t border-white/5">
                                        <button
                                            onClick={() => handleAction(user._id, 'pass')}
                                            className="py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 border border-white/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Pass
                                        </button>
                                        <button
                                            onClick={() => handleAction(user._id, 'like')}
                                            className="py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Heart className="w-4 h-4 fill-current" /> Like back
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center p-20 glass-morphism">
                        <Star className="w-20 h-20 mx-auto mb-6 opacity-10" />
                        <h3 className="text-2xl font-bold mb-2">No new likes yet</h3>
                        <p className="opacity-60 mb-8">Increase your chances by completing your profile!</p>
                        <button
                            onClick={() => navigate('/dating')}
                            className="neon-button px-10"
                        >
                            Back to Discovery
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatingLikes;
