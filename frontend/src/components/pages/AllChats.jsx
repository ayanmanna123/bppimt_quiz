import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import { useSocket } from "../../context/SocketContext";
import {
    MessageCircle, Search, Pin, ChevronLeft, MoreVertical,
    Phone, Video, Info, User, Hash, ShoppingBag, Users,
    ArrowLeft, Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';

// Reuse existing chat components
import MessageBubble from '../chat/MessageBubble';
import ChatInput from '../chat/ChatInput';
import TypingIndicator from '../chat/TypingIndicator';
import OnlineUsersBar from '../chat/OnlineUsersBar';
import ChatWindow from '../chat/ChatWindow';
import NotificationDropdown from '../shared/NotificationDropdown';

const AllChats = () => {
    const { usere: user } = useSelector(state => state.auth);
    const { getAccessTokenSilently } = useAuth0();
    const socket = useSocket();

    // UI State
    const [activeTab, setActiveTab] = useState('all'); // all, unread, groups
    const [selectedChat, setSelectedChat] = useState(null);
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Data State
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]); // [NEW]

    // Message Actions
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messageRefs = useRef({});

    // --- 1. Subscriptions & Data Fetching ---

    useEffect(() => {
        fetchAllChats();
        fetchOnlineUsers();
    }, [user]);

    const fetchOnlineUsers = async () => {
        try {
            const token = await getAccessTokenSilently();
            // Note: Route fixed in backend to be /chat/online/all
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat/online/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOnlineUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch online users", error);
        }
    };

    const fetchAllChats = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Global/Community Chat (Always there)
            const globalChat = {
                _id: 'global',
                type: 'global',
                name: 'Community Chat',
                avatar: '/bppimt.svg',
                lastMessage: null, // Will fetch or socket will update
                timestamp: new Date().toISOString(),
                unreadCount: 0
            };

            // 2. Subjects
            let subjects = [];
            if (user.role === 'teacher') {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/subject/teacher/subject`, { headers });
                subjects = res.data.subjects || [];
            } else {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/subject/subjectByQuery?department=${user.department}&semester=${user.semester}`, { headers });
                subjects = res.data.subjects || [];
            }

            const subjectChats = subjects.map(sub => ({
                _id: sub._id,
                type: 'subject',
                name: sub.subjectName,
                code: sub.subjectCode,
                avatar: null, // Could use a generated avatar based on subject name
                lastMessage: null,
                timestamp: sub.createdAt || new Date().toISOString(),
                unreadCount: 0
            }));

            // 3. Study Rooms
            const roomsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/study-room/all`, { headers });
            const studyRooms = (roomsRes.data || []).map(room => ({
                _id: room._id,
                type: 'study-room',
                name: room.name,
                avatar: null,
                lastMessage: null,
                timestamp: room.createdAt,
                unreadCount: 0,
                members: room.members.length
            }));

            // 4. Store Conversations
            const storeRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/conversations`, { headers });
            const storeChats = (storeRes.data.conversations || []).map(conv => {
                const otherUser = conv.participants.find(p => p._id !== user._id);
                return {
                    _id: conv._id,
                    type: 'store',
                    name: otherUser?.fullname || 'Unknown',
                    avatar: otherUser?.picture,
                    product: conv.product,
                    lastMessage: conv.lastMessage, // Store endpoint might return this
                    timestamp: conv.lastMessage, // Store endpoint returns ISO string
                    unreadCount: 0,
                    participants: conv.participants
                };
            });

            // Combine all
            const all = [globalChat, ...storeChats, ...subjectChats, ...studyRooms];
            // Sort by latest (mock sort for now, ideally backend provides lastMessageTime for all)
            // For now, we put Store chats first as they have real timestamps, others distinct.
            // In a real app, we'd need to fetch last message for subjects/global too. 
            // We'll skip complex lastMessage fetching for this iteration and just list them.
            setChats(all);

        } catch (error) {
            console.error("Failed to fetch chats", error);
            toast.error("Failed to load chats");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Chat Selection & Message Fetching ---

    const handleSelectChat = async (chat) => {
        setSelectedChat(chat);
        setIsMobileChatOpen(true);
        setMessages([]);
        setLoadingMessages(true);
        setReplyTo(null);
        setEditingMessage(null);
        setTypingUsers([]);

        try {
            const token = await getAccessTokenSilently();
            const headers = { Authorization: `Bearer ${token}` };

            if (chat.type === 'store') {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/message/${chat._id}`, { headers });
                if (res.data.success) {
                    // Store messages have 'content', regular have 'message'. Normalize here.
                    const normalized = (res.data.conversation.messages || []).map(m => ({
                        ...m,
                        message: m.content, // Map content to message for MessageBubble
                        isStore: true
                    }));
                    setMessages(normalized);
                }
            }
            // For other chat types (global, subject, study-room), ChatWindow component handles fetching.

            // Join Socket Room
            if (socket) {
                socket.emit("joinSubject", chat._id);
            }

        } catch (error) {
            console.error("Failed to fetch messages", error);
            toast.error("Could not load messages");
        } finally {
            setLoadingMessages(false);
        }
    };

    // --- 3. Socket Event Handling ---

    useEffect(() => {
        if (!socket) return;
        const activeChatId = selectedChat?._id;

        const handleReceiveMessage = (msg) => {
            // Check if message belongs to current chat
            // Fix activeChatId reference inside effect
            /* Due to closure staleness, we rely on checking against 'selectedChat' from dependency or
               using functional state updates if ID matches.
               Here selectedChat is in dependency array so it updates.
            */
            const currentChatId = selectedChat?._id;

            if (currentChatId) {
                const isGlobalMatch = currentChatId === 'global' && (msg.isGlobal || msg.subjectId === 'global');
                const isSubjectMatch = msg.subjectId === currentChatId;

                if (isGlobalMatch || isSubjectMatch) {
                    setMessages(prev => [...prev, msg]);
                    scrollToBottom();
                }
            } else if (msg.conversationId && currentChatId && msg.conversationId === currentChatId) {
                // Store message (different structure structure sometimes)
                const normalized = { ...msg.message, message: msg.message.content, isStore: true };
                setMessages(prev => [...prev, normalized]);
                scrollToBottom();
            }

            // Update Chat List Preview (timestamp etc) - Optional enhancement
        };

        const handleStoreMessage = (data) => {
            const { message, conversationId } = data;
            if (activeChatId === conversationId) {
                const normalized = { ...message, message: message.content, isStore: true };
                setMessages(prev => [...prev, normalized]);
                scrollToBottom();
            }
        };

        const handleTypingUpdate = ({ typingUsers, subjectId }) => {
            if (activeChatId === subjectId) {
                // Filter out self
                const others = typingUsers.filter(u => u !== user?.fullname);
                setTypingUsers(others);
            }
        };

        const handleMessageUpdated = (updatedMsg) => {
            setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
        };

        const handleMessageDeleted = ({ messageId, conversationId }) => {
            if (activeChatId === conversationId) {
                setMessages(prev => prev.filter(m => m._id !== messageId));
            }
        };

        const handleUpdatePresence = ({ userId, isOnline }) => {
            if (isOnline) {
                // Ideally fetch user details or just simple add if we have ID.
                // For full details we might need to refetch or just optimistcally add if we have data.
                // Simplest: Refetch list
                fetchOnlineUsers();
            } else {
                setOnlineUsers(prev => prev.filter(u => u._id !== userId));
            }
        };

        socket.on("receiveMessage", handleReceiveMessage); // Normal chats
        socket.on("newStoreMessage", handleStoreMessage); // Store chats
        socket.on("typingUpdate", handleTypingUpdate);
        socket.on("messageUpdated", handleMessageUpdated);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("updatePresence", handleUpdatePresence);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("newStoreMessage", handleStoreMessage);
            socket.off("typingUpdate", handleTypingUpdate);
            socket.off("messageUpdated", handleMessageUpdated);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("updatePresence", handleUpdatePresence);
        };
    }, [socket, selectedChat, user]); // Added user dependency

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- 4. Sending Messages ---

    const handleSendMessage = async (text, attachment) => {
        if (!selectedChat) return;

        // Stop typing immediately
        if (socket) {
            socket.emit("stopTyping", { subjectId: selectedChat._id, user: user.fullname });
        }

        try {
            const token = await getAccessTokenSilently();
            const headers = { Authorization: `Bearer ${token}` };

            if (selectedChat.type === 'store') {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/store/message/${selectedChat._id}`,
                    { content: text, attachments: attachment ? [attachment] : [], replyTo: replyTo?._id },
                    { headers }
                );
            } else {
                // Standard Chat
                socket.emit("sendMessage", {
                    subjectId: selectedChat._id,
                    message: text,
                    senderId: user._id,
                    isGlobal: selectedChat.type === 'global',
                    replyTo: replyTo?._id,
                    attachments: attachment ? [attachment] : []
                });
            }
            setReplyTo(null);
        } catch (error) {
            console.error("Failed to send", error);
            toast.error("Failed to send message");
        }
    };

    const handleTyping = () => {
        if (!socket || !selectedChat) return;
        socket.emit("typing", { subjectId: selectedChat._id, user: user.fullname });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { subjectId: selectedChat._id, user: user.fullname });
        }, 3000);
    };

    const handleEditMessage = (msg) => {
        setEditingMessage(msg);
    };

    const handleUpdateMessage = async (msgId, content) => {
        try {
            const token = await getAccessTokenSilently();
            // Store and Standard Chat use different update endpoints?
            // Checking chat.routes.js: router.put("/:messageId", updateMessage);
            // This seems generic for Standard Chat. Store likely has its own.
            // Let's assume Standard Chat for now per requirements context (Community/Subject).

            if (selectedChat.type === 'store') {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/store/message/${msgId}`, { content }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/chat/${msgId}`, {
                    userId: user._id,
                    message: content
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setEditingMessage(null);
        } catch (error) {
            console.error("Failed to update", error);
            toast.error("Failed to update message");
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            const token = await getAccessTokenSilently();
            if (selectedChat.type === 'store') {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/store/message/${msgId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/chat/${msgId}`, {
                    data: { userId: user._id }, // Helper to pass body in delete
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete message");
        }
    };

    // --- 5. Helpers ---

    const getChatIcon = (type) => {
        switch (type) {
            case 'global': return <MessageCircle className="w-5 h-5" />;
            case 'subject': return <Hash className="w-5 h-5" />;
            case 'study-room': return <Users className="w-5 h-5" />;
            case 'store': return <ShoppingBag className="w-5 h-5" />;
            default: return <MessageCircle className="w-5 h-5" />;
        }
    };

    const getChatSubtitle = (chat) => {
        if (chat.type === 'store') return `Product: ${chat.product?.title || 'Item'}`;
        if (chat.type === 'subject') return chat.code || 'Course';
        if (chat.type === 'study-room') return `${chat.members || 0} Members`;
        return 'All Community';
    };

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] w-full bg-white overflow-hidden">
            {/* Sidebar / Chat List */}
            <div className={`${isMobileChatOpen ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] flex-col border-r border-slate-200 bg-white overflow-hidden`}>
                {/* Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-slate-900">Chats</h1>
                        <div className="flex gap-2">
                            <NotificationDropdown />
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreVertical className="w-5 h-5 text-slate-600" />
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search or start new chat"
                            className="pl-9 bg-white border-slate-200 rounded-xl focus-visible:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Tabs (Optional - visually implies WhatsApp structure) */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
                    {['All', 'Unread', 'Groups', 'Store'].map(tab => (
                        <button
                            key={tab}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap
                                ${activeTab === tab.toLowerCase() || (activeTab === 'all' && tab === 'All')
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        // Just visual for now except filtering could be added
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Chat List */}
                <ScrollArea className="flex-1">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filteredChats.map(chat => (
                                <div
                                    key={chat._id}
                                    onClick={() => handleSelectChat(chat)}
                                    className={`flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors relative
                                        ${selectedChat?._id === chat._id ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                                >
                                    <div className="relative">
                                        <Avatar className="w-12 h-12 border border-slate-100">
                                            <AvatarImage src={chat.avatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                                                {chat.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* Type Icon Badge */}
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                            <div className="bg-slate-100 rounded-full p-1 text-slate-600">
                                                {getChatIcon(chat.type)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-semibold text-slate-900 truncate pr-2">{chat.name}</h3>
                                            {chat.timestamp && (
                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                    {format(new Date(chat.timestamp), 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">
                                            {getChatSubtitle(chat)}
                                        </p>
                                    </div>

                                    {chat.unreadCount > 0 && (
                                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* User Profile / Status (Bottom Sidebar) */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-white">
                        <AvatarImage src={user?.picture} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">{user?.fullname}</p>
                        <p className="text-xs text-emerald-500 font-medium">Online</p>
                    </div>
                </div>
            </div>

            {/* Chat Area (Responsive) */}
            <div className={`${isMobileChatOpen ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-100 relative`}>
                {selectedChat ? (
                    selectedChat.type !== 'store' ? (
                        <ChatWindow
                            subjectId={selectedChat._id}
                            subjectName={selectedChat.name}
                            isOverlay={false}
                            onClose={() => {
                                setSelectedChat(null);
                                setIsMobileChatOpen(false);
                            }}
                        />
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden -ml-2"
                                        onClick={() => setIsMobileChatOpen(false)}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <Avatar className="w-10 h-10 border border-slate-100 cursor-pointer">
                                        <AvatarImage src={selectedChat.avatar} />
                                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                            {selectedChat.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="cursor-pointer">
                                        <h2 className="font-bold text-slate-900 leading-tight">{selectedChat.name}</h2>
                                        <p className="text-xs text-slate-500 capitalize">{selectedChat.type} Chat</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="text-slate-500">
                                        <Search className="w-5 h-5" />
                                    </Button>
                                    {selectedChat.type === 'store' && (
                                        <Button variant="ghost" size="icon" className="text-slate-500">
                                            <ShoppingBag className="w-5 h-5" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="text-slate-500">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Online Users (Dynamic Bar) - Only show for Global or Subject chats ideally */}
                            {(selectedChat.type === 'global' || selectedChat.type === 'subject') && (
                                <OnlineUsersBar users={onlineUsers} />
                            )}

                            {/* Messages */}
                            <div className="flex-1 overflow-hidden relative bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f9640.png')] bg-repeat bg-opacity-5">
                                {/* Light overlay for custom pattern effect if image fails or for styling */}
                                <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-[1px]"></div>

                                <div className="relative h-full flex flex-col">
                                    <ScrollViewport messages={messages} loading={loadingMessages}>
                                        {messages.map((msg, idx) => {
                                            const isMe = msg.sender?._id === user?._id;
                                            const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;

                                            return (
                                                <MessageBubble
                                                    key={msg._id || idx}
                                                    message={msg}
                                                    isMe={isMe}
                                                    showAvatar={showAvatar}
                                                    showSenderName={selectedChat.type !== 'store' && showAvatar}
                                                    onReply={() => setReplyTo(msg)}
                                                    onEdit={handleEditMessage}
                                                    onDelete={handleDeleteMessage}
                                                // Simplified props for AllChats
                                                />
                                            );
                                        })}
                                        <TypingIndicator typingUsers={typingUsers} />
                                        <div ref={messagesEndRef} />
                                    </ScrollViewport>
                                </div>
                            </div>

                            {/* Input Area */}

                            <div className="bg-white p-3 border-t border-slate-200">
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    replyTo={replyTo}
                                    onCancelReply={() => setReplyTo(null)}
                                    // New Props
                                    onTyping={handleTyping}
                                    editingMessage={editingMessage}
                                    onUpdateMessage={handleUpdateMessage}
                                    onCancelEdit={() => setEditingMessage(null)}
                                // Pass other props as needed
                                />
                            </div>
                        </>
                    )
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 p-8 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <MessageCircle className="w-12 h-12 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-light text-slate-700 mb-2">BPPIMT Stats Web</h2>
                        <p className="max-w-md text-slate-500">
                            Select a chat to start messaging. Connect with your community, subjects, study rooms, and marketplace.
                        </p>
                        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
                            <LockIcon className="w-3 h-3" />
                            Your personal messages are end-to-end encrypted (simulated)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper sub-component for scroll management
const ScrollViewport = ({ children, messages, loading }) => {
    return (
        <ScrollArea className="h-full p-4">
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="flex flex-col gap-1 pb-2 max-w-5xl mx-auto">
                    {children}
                </div>
            )}
        </ScrollArea>
    );
};

const LockIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

export default AllChats;
