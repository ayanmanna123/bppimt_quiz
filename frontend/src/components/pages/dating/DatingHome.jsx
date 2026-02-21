import axios from 'axios';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import DatingWelcomePopup from './DatingWelcomePopup';
import './../../../styles/dating.css';
import { useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Briefcase, Filter, Heart, MapPin, User, X, MessageSquare, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import TinderCard from 'react-tinder-card';
import { useNavigate } from 'react-router-dom';
import React, { useMemo, useRef } from 'react';

const DatingHome = () => {
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const socket = useSocket();
    const [users, setUsers] = useState([]);
    const [lastDirection, setLastDirection] = useState();
    const [loading, setLoading] = useState(true);
    const [showMatch, setShowMatch] = useState(null);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

    // Refs for programmatic swiping
    const childRefs = useMemo(
        () => Array(users.length).fill(0).map((i) => React.createRef()),
        [users]
    );

    useEffect(() => {
        fetchDiscoveries();
        checkFirstTime();

        if (socket) {
            socket.on('newNotification', (notification) => {
                if (notification.type === 'match') {
                    // Show match overlay
                    // We might not have the full match object here, but we can set enough to trigger the UI
                    setShowMatch({
                        users: [
                            { fullname: 'someone' }, // Fallback if we don't have sender details in notification
                        ]
                    });
                }
            });

            return () => socket.off('newNotification');
        }
    }, [socket]);

    const checkFirstTime = () => {
        const hasJoinedJourney = localStorage.getItem('dating_journey_joined');
        if (!hasJoinedJourney) {
            setIsWelcomeOpen(true);
        }
    };

    const handleCloseWelcome = () => {
        setIsWelcomeOpen(false);
        localStorage.setItem('dating_journey_joined', 'true');
    };

    const fetchDiscoveries = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dating/discovery`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error("Error fetching discoveries:", error);
        } finally {
            setLoading(false);
        }
    };

    const swiped = async (direction, swipedUserId) => {
        setLastDirection(direction);
        try {
            const token = await getAccessTokenSilently();
            const type = direction === 'right' ? 'like' : 'pass';
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/dating/swipe`, {
                swipedUserId,
                type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.isMatch) {
                setShowMatch(response.data.match);
            }
        } catch (error) {
            console.error("Error swiping:", error);
        }
    };

    const outOfFrame = (userId) => {
        // Remove the swiped user from the state to keep it clean
        setUsers(prev => prev.filter(user => user._id !== userId));
    };

    const swipe = async (dir) => {
        if (users.length > 0) {
            await childRefs[users.length - 1].current.swipe(dir);
        }
    };

    if (loading) {
        return (
            <div className="dating-container flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="dating-container relative overflow-hidden pt-10">
            {/* Header */}
            <div className="max-w-md mx-auto px-6 mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-black neon-text-pink italic tracking-tighter">BPPIMT Date</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dating/likes')}
                        className="p-2 rounded-full glass-morphism text-yellow-400 hover:scale-110 transition-transform active:scale-90"
                    >
                        <Star className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => navigate('/dating/matches')}
                        className="p-2 rounded-full glass-morphism text-purple-400 hover:scale-110 transition-transform active:scale-90"
                    >
                        <MessageSquare className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => navigate('/dating/profile')}
                        className="p-2 rounded-full glass-morphism text-pink-400 hover:scale-110 transition-transform active:scale-90"
                    >
                        <Filter className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Cards Container */}
            <div className="flex justify-center items-center h-[600px] relative">
                {users.length > 0 ? (
                    <div className="cardContainer relative w-[90%] max-w-[400px] h-full">
                        {users.map((user, index) => (
                            <TinderCard
                                ref={childRefs[index]}
                                className="absolute"
                                key={user._id}
                                onSwipe={(dir) => swiped(dir, user._id)}
                                onCardLeftScreen={() => outOfFrame(user._id)}
                                preventSwipe={['up', 'down']}
                            >
                                <div className="swipe-card relative shadow-2xl">
                                    <img
                                        src={user.datingPhotos?.[0] || user.picture}
                                        alt={user.fullname}
                                        className="w-full h-full object-cover pointer-events-none"
                                    />
                                    <div className="swipe-card-info">
                                        <div className="flex items-end gap-2 mb-2">
                                            <h2 className="text-3xl font-bold">{user.fullname}</h2>
                                            <span className="text-2xl opacity-80">{user.age || '—'}</span>
                                        </div>
                                        <div className="space-y-2 opacity-90 text-sm mb-4">
                                            {user.job && <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {user.job}</div>}
                                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {user.department}, {user.semester}th Sem</div>
                                        </div>
                                        <div className="flex flex-wrap">
                                            {user.interests?.slice(0, 3).map((interest, i) => (
                                                <span key={i} className="interest-tag">{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TinderCard>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 glass-morphism mx-6">
                        <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">No more potential matches</h3>
                        <p className="opacity-60">Try expanding your search radius or changing your preferences.</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-8 mt-12 pb-10">
                <button
                    onClick={() => swipe('left')}
                    className="w-16 h-16 rounded-full glass-morphism flex items-center justify-center text-red-500 hover:scale-110 transition-transform shadow-lg active:scale-90"
                >
                    <X className="w-8 h-8" />
                </button>
                <button
                    onClick={() => swipe('right')}
                    className="w-20 h-20 rounded-full neon-button flex items-center justify-center text-white scale-110 hover:scale-125 transition-all shadow-2xl active:scale-95"
                >
                    <Heart className="w-10 h-10 fill-current" />
                </button>
                <button
                    onClick={() => navigate('/dating/profile')}
                    className="w-16 h-16 rounded-full glass-morphism flex items-center justify-center text-blue-400 hover:scale-110 transition-transform shadow-lg active:scale-90"
                >
                    <Filter className="w-8 h-8" />
                </button>
            </div>

            {/* Match Overlay */}
            <AnimatePresence>
                {showMatch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex flex-center items-center justify-center p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-transparent"
                        >
                            <h2 className="text-5xl font-black neon-text-pink mb-4 italic">It's a Match!</h2>
                            <p className="text-xl mb-8 opacity-80">You and {showMatch.users?.find(u => u !== 'me')?.fullname || 'someone'} like each other.</p>

                            <div className="flex justify-center gap-4 mb-10">
                                <div className="w-24 h-24 rounded-full border-4 border-pink-500 overflow-hidden shadow-pink-500/50 shadow-xl">
                                    <img src="/api/placeholder/100/100" alt="me" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-24 h-24 rounded-full border-4 border-purple-500 overflow-hidden shadow-purple-500/50 shadow-xl">
                                    <Heart className="w-12 h-12 text-pink-500 mx-auto mt-5" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => setShowMatch(null)}
                                    className="neon-button w-full"
                                >
                                    Send a Message
                                </button>
                                <button
                                    onClick={() => setShowMatch(null)}
                                    className="px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    Keep Swiping
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DatingWelcomePopup
                isOpen={isWelcomeOpen}
                onClose={handleCloseWelcome}
            />
        </div>
    );
};

export default DatingHome;
