import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './../../../styles/dating.css';
import { useEffect, useState } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Heart, MessageCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const DatingMatches = () => {
    const { getAccessTokenSilently } = useAuth0();
    const socket = useSocket();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMatches();

        if (socket) {
            socket.on('newNotification', (notification) => {
                if (notification.type === 'match') {
                    fetchMatches();
                }
            });

            return () => socket.off('newNotification');
        }
    }, [socket]);

    const fetchMatches = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dating/matches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMatches(response.data.matches);
            }
        } catch (error) {
            console.error("Error fetching matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const openChat = (match) => {
        // Navigating to the existing chat system with the conversation ID
        navigate(`/chats?conversationId=${match.conversationId}`);
    };

    if (loading) return <div className="dating-container flex items-center justify-center pt-20">Loading...</div>;

    return (
        <div className="dating-container pt-10 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black neon-text-purple mb-10 flex items-center gap-3">
                    <Heart className="w-10 h-10 text-pink-500 fill-current" /> Your Matches
                </h1>

                {matches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {matches.map((match) => (
                            <motion.div
                                key={match._id}
                                whileHover={{ scale: 1.02 }}
                                className="glass-morphism p-6 flex items-center gap-4 cursor-pointer hover:neon-border transition-all"
                                onClick={() => openChat(match)}
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500 shadow-lg shadow-pink-500/20">
                                        <img
                                            src={match.otherUser?.picture || "/api/placeholder/100/100"}
                                            alt={match.otherUser?.fullname}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-[#1a1a2e] rounded-full shadow-lg"></div>
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-xl font-bold">{match.otherUser?.fullname}</h2>
                                    <p className="text-sm opacity-60 line-clamp-1">{match.otherUser?.bio || "No bio yet."}</p>
                                    <span className="text-xs text-pink-400 mt-2 block">{match.otherUser?.department} • {match.otherUser?.semester}th Sem</span>
                                </div>

                                <button
                                    className="p-3 rounded-full bg-pink-500/20 text-pink-500 hover:bg-pink-500 hover:text-white transition-all"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-20 glass-morphism">
                        <Heart className="w-20 h-20 mx-auto mb-6 opacity-10" />
                        <h3 className="text-2xl font-bold mb-2">No matches yet</h3>
                        <p className="opacity-60 mb-8">Keep swiping to find someone special!</p>
                        <button
                            onClick={() => navigate('/dating')}
                            className="neon-button px-10"
                        >
                            Start Discovery
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatingMatches;
