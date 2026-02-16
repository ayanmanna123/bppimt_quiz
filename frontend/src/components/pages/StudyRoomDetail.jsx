import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import {
    Users, Video, VideoOff, Mic, MicOff, Send,
    Hash, LogOut, MessageSquare, Info, Loader2,
    MonitorIcon, Settings
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessageBubble from "../chat/MessageBubble";
import ChatInput from "../chat/ChatInput";
import { toast } from "sonner";

const StudyRoomDetail = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { usere } = useSelector((store) => store.auth);
    const socket = useSocket();
    const { getAccessTokenSilently } = useAuth0();

    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);
    const messagesEndRef = useRef(null);
    const scrollViewportRef = useRef(null);

    // Fetch room details and history
    const fetchRoomData = async () => {
        try {
            setLoading(true);
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            // Join room on backend (adds member)
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/study-room/join/${roomId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Get room details
            const roomRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/study-room/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoom(roomRes.data);

            // Get chat history (reusing chat API with roomId as subjectId)
            const chatRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat/${roomId}?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(chatRes.data);

            setLoading(false);
        } catch (error) {
            console.error("Failed to load room", error);
            toast.error("Room not found or access denied");
            navigate("/study-rooms");
        }
    };

    useEffect(() => {
        fetchRoomData();
    }, [roomId]);

    // Socket.io for real-time chat
    useEffect(() => {
        if (!socket || !roomId) return;

        socket.emit("joinSubject", { subjectId: roomId, type: 'study-room' });

        const handleReceiveMessage = (message) => {
            if (message.subjectId === roomId) {
                setMessages((prev) => [...prev, message]);
                // Scroll to bottom on new message
                setTimeout(() => {
                    scrollViewportRef.current?.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
                }, 100);
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);
        return () => socket.off("receiveMessage", handleReceiveMessage);
    }, [socket, roomId]);

    // Initial scroll to bottom
    useEffect(() => {
        if (!loading) {
            setTimeout(() => {
                scrollViewportRef.current?.scrollTo({ top: scrollViewportRef.current.scrollHeight });
            }, 200);
        }
    }, [loading]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Jitsi Integration
    const startJitsi = () => {
        if (jitsiApiRef.current) return;

        const domain = "meet.jit.si";
        const options = {
            roomName: `BPPIMT_StudyRoom_${roomId}`,
            width: "100%",
            height: "100%",
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: usere.fullname,
                email: usere.email
            },
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: false
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                ],
            }
        };

        const script = document.createElement("script");
        script.src = `https://${domain}/external_api.js`;
        script.async = true;
        script.onload = () => {
            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
            jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
                setIsVideoActive(false);
                jitsiApiRef.current = null;
            });
        };
        document.body.appendChild(script);
    };

    const openJitsiInNewTab = () => {
        const url = `https://meet.jit.si/BPPIMT_StudyRoom_${roomId}#userInfo.displayName="${usere.fullname}"&userInfo.email="${usere.email}"&config.prejoinPageEnabled=false`;
        window.open(url, '_blank');
    };

    const toggleVideo = () => {
        if (!isVideoActive) {
            setIsVideoActive(true);
            setTimeout(startJitsi, 100);
        } else {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
            setIsVideoActive(false);
        }
    };

    const handleSendMessage = (text, attachment) => {
        if (!socket) return;
        socket.emit("sendMessage", {
            subjectId: roomId,
            message: text,
            senderId: usere._id,
            attachments: attachment ? [attachment] : [],
            type: 'study-room'
        });
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Entering Study Room...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-950 overflow-hidden">
            {/* Sidebar - Room Info & Members */}
            <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 hidden md:flex h-full">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black mb-1">
                        <Hash className="w-5 h-5" />
                        <span className="truncate text-slate-900 dark:text-slate-100">{room.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-4">Study Room</p>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant={isVideoActive ? "destructive" : "secondary"}
                            size="sm"
                            className={`w-full rounded-xl font-bold transition-all shadow-sm ${isVideoActive ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}
                            onClick={toggleVideo}
                        >
                            {isVideoActive ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                            {isVideoActive ? "Toggle Embedded" : "Join Embedded"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-xl font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-transparent"
                            onClick={openJitsiInNewTab}
                        >
                            <MonitorIcon className="w-4 h-4 mr-2" />
                            Open in New Tab
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="mb-8">
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            Active Members — {room.members.length}
                        </h4>
                        <div className="space-y-3">
                            {room.members.map((member) => (
                                <div key={member._id} className="flex items-center gap-3 group">
                                    <div className="relative">
                                        <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-slate-800">
                                            <AvatarImage src={member.picture} />
                                            <AvatarFallback>{member.fullname.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {member.isOnline && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-50 dark:border-slate-900" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{member.fullname}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            About
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {room.description || "No description provided for this study room."}
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold"
                        onClick={() => navigate("/study-rooms")}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave Room
                    </Button>
                </div>
            </div>

            {/* Main Area - Video & Chat */}
            <div className="flex-1 flex flex-col min-w-0 relative bg-slate-100 dark:bg-slate-950">
                {/* Top Toolbar */}
                <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black">
                            <Hash className="w-5 h-5" />
                            <span className="truncate max-w-[150px] text-slate-900 dark:text-slate-100">{room.name}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-slate-400 dark:text-slate-500">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm font-medium">Room Chat</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content - Chat or Video+Chat */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    {isVideoActive && (
                        <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col animate-in fade-in zoom-in duration-300">
                            {/* Call Header */}
                            <div className="bg-slate-900/40 backdrop-blur-md p-4 flex items-center justify-between text-white shrink-0 z-10 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold tracking-tight text-sm md:text-base">Live Study Session</h3>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/20 uppercase">Encrypted</span>
                                            <span>#{room.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-xs"
                                        onClick={openJitsiInNewTab}
                                    >
                                        <MonitorIcon className="w-4 h-4 mr-2" />
                                        Login in New Tab
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-xs"
                                        onClick={() => setIsVideoActive(false)}
                                    >
                                        Hide Video
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="rounded-xl font-black px-4 md:px-6 shadow-lg shadow-red-500/20 text-xs"
                                        onClick={toggleVideo}
                                    >
                                        <VideoOff className="w-4 h-4 mr-2" />
                                        Leave Call
                                    </Button>
                                </div>
                            </div>

                            <div ref={jitsiContainerRef} className="flex-1" />
                        </div>
                    )}

                    <div className={`flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950 overflow-hidden`}>
                        <div
                            className="flex-1 p-4 overflow-y-auto scroll-smooth"
                            ref={scrollViewportRef}
                        >
                            <div className="flex flex-col gap-1 pb-4 max-w-4xl mx-auto w-full">
                                <div className="py-10 text-center border-b border-slate-50 dark:border-slate-800 mb-6">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                                        {room.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Welcome to #{room.name}!</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">This is the beginning of the room history.</p>
                                </div>
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender?._id === usere?._id;
                                    const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;
                                    return (
                                        <MessageBubble
                                            key={msg._id || idx}
                                            message={msg}
                                            isMe={isMe}
                                            showAvatar={showAvatar}
                                            showSenderName={showAvatar}
                                        />
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="max-w-4xl mx-auto">
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    placeholder={`Message #${room.name}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyRoomDetail;
