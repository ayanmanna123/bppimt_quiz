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
    const { getAccessTokenSilently, user } = useAuth0();
    const navigate = useNavigate();
    const socket = useSocket();
    const [users, setUsers] = useState([]);
    const [lastDirection, setLastDirection] = useState();
    const [loading, setLoading] = useState(true);
    const [showMatch, setShowMatch] = useState(null);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [newMatches, setNewMatches] = useState([]);
    const [globalMatches, setGlobalMatches] = useState([]);

    // Refs for programmatic swiping
    const childRefs = useMemo(
        () => Array(users.length).fill(0).map((i) => React.createRef()),
        [users]
    );

    useEffect(() => {
        fetchDiscoveries();
        fetchNewMatches();
        fetchGlobalMatches();
        checkFirstTime();

        if (socket) {
            socket.on('newNotification', (notification) => {
                if (notification.type === 'match') {
                    fetchNewMatches();
                    // Show match overlay
                    // notification.relatedId contains the match ID
                    // We can potentially fetch more info or just show a generic 'new match' UI
                    setShowMatch({
                        _id: notification.relatedId,
                        users: [
                            { fullname: 'New Match' },
                        ],
                        url: notification.url || '/dating/matches'
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

    const fetchNewMatches = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dating/matches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                const recentMatches = response.data.matches.filter(match => {
                    const matchDate = new Date(match.createdAt);
                    return matchDate > twentyFourHoursAgo;
                });

                setNewMatches(recentMatches);
            }
        } catch (error) {
            console.error("Error fetching new matches:", error);
        }
    };

    const fetchGlobalMatches = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dating/all-matches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setGlobalMatches(response.data.matches);
            }
        } catch (error) {
            console.error("Error fetching global matches:", error);
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

            {/* New Matches Section */}
            {newMatches.length > 0 && (
                <div className="max-w-md mx-auto px-6 mb-8 mt-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-pink-500/80 mb-6 flex items-center justify-center gap-2">
                        Recent Matches
                    </h2>
                    <div className="flex gap-8 overflow-x-auto py-4 px-2 no-scrollbar">
                        {newMatches.map((match) => (
                            <div
                                key={match._id}
                                onClick={() => navigate(`/chats?conversationId=${match.conversationId?._id || match.conversationId}`)}
                                className="flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer"
                            >
                                <div className="match-circle-wrapper relative flex items-center justify-center">
                                    {/* Circle background with glow */}
                                    <div className="absolute inset-0 rounded-full bg-pink-500/10 blur-xl group-hover:bg-pink-500/20 transition-all"></div>

                                    <div className="relative flex items-center bg-[#1a1a2e] p-2 rounded-full border border-white/10 shadow-2xl">
                                        {/* My Avatar */}
                                        <div className="w-12 h-12 rounded-full border-2 border-[#1a1a2e] overflow-hidden z-10 shadow-lg">
                                            <img
                                                src={user?.picture || "/api/placeholder/100/100"}
                                                alt="Me"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Heart Icon between */}
                                        <div className="mx-[-8px] z-20 bg-pink-500 p-1.5 rounded-full shadow-lg pulse-pink">
                                            <Heart className="w-3 h-3 text-white fill-current" />
                                        </div>

                                        {/* Match Avatar */}
                                        <div className="w-12 h-12 rounded-full border-2 border-[#1a1a2e] overflow-hidden z-10 shadow-lg">
                                            <img
                                                src={match.otherUser?.picture || "/api/placeholder/100/100"}
                                                alt={match.otherUser?.fullname}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center leading-tight">
                                    <span className="text-[11px] font-bold text-white group-hover:text-pink-400 transition-colors">
                                        {(user?.nickname || user?.name?.split(' ')[0] || 'Me')} & {(match.otherUser?.fullname?.split(' ')[0] || 'User')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Global College Matches Section */}
            {globalMatches.length > 0 && (
                <div className="max-w-md mx-auto px-6 mb-8 mt-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center justify-center gap-2">
                        <span className="w-8 h-[1px] bg-white/10"></span>
                        Happening in College
                        <span className="w-8 h-[1px] bg-white/10"></span>
                    </h2>
                    <div className="flex gap-8 overflow-x-auto py-4 px-2 no-scrollbar">
                        {globalMatches.map((match) => {
                            const user1 = match.users[0];
                            const user2 = match.users[1];
                            if (!user1 || !user2) return null;

                            return (
                                <div
                                    key={match._id}
                                    className="flex-shrink-0 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <div className="match-circle-wrapper relative flex items-center justify-center scale-90">
                                        <div className="relative flex items-center bg-white/5 p-2 rounded-full border border-white/5">
                                            {/* User 1 Avatar */}
                                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden z-10">
                                                <img
                                                    src={user1.picture || "/api/placeholder/100/100"}
                                                    alt={user1.fullname}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Heart Icon between */}
                                            <div className="mx-[-6px] z-20 bg-pink-500/20 p-1 rounded-full">
                                                <Heart className="w-2.5 h-2.5 text-pink-500 fill-current" />
                                            </div>

                                            {/* User 2 Avatar */}
                                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden z-10">
                                                <img
                                                    src={user2.picture || "/api/placeholder/100/100"}
                                                    alt={user2.fullname}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center leading-tight">
                                        <span className="text-[10px] font-medium text-white/50">
                                            {user1.fullname?.split(' ')[0]} & {user2.fullname?.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
                                    onClick={() => {
                                        if (showMatch.conversationId) {
                                            const conversationId = showMatch.conversationId?._id || showMatch.conversationId;
                                            navigate(`/chats?conversationId=${conversationId}`);
                                        } else {
                                            navigate('/dating/matches');
                                        }
                                        setShowMatch(null);
                                    }}
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
