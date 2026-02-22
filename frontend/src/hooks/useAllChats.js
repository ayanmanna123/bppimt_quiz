import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { setuser } from '../Redux/auth.reducer';

const useAllChats = () => {
    const dispatch = useDispatch();
    const { usere: user } = useSelector(state => state.auth);
    const { getAccessTokenSilently } = useAuth0();
    const socket = useSocket();
    const [searchParams] = useSearchParams();
    const urlConversationId = searchParams.get('conversationId');

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
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Message Actions
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    // --- 1. Subscriptions & Data Fetching ---

    useEffect(() => {
        if (user) {
            fetchAllChats();
            fetchOnlineUsers();
        }
    }, [user]);

    // Auto-select chat from URL
    useEffect(() => {
        if (!loading && urlConversationId && chats.length > 0) {
            const chatToSelect = chats.find(c => String(c._id) === String(urlConversationId));
            if (chatToSelect) {
                handleSelectChat(chatToSelect);
            }
        }
    }, [loading, urlConversationId, chats.length]);

    const fetchOnlineUsers = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat/online/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOnlineUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch online users", error);
        }
    };

    const fetchAllChats = async (background = false) => {
        if (!user) return;
        if (!background) setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Global/Community Chat
            const globalChat = {
                _id: 'global',
                type: 'global',
                name: 'Community Chat',
                avatar: '/bppimt.svg',
                lastMessage: null,
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
                avatar: null,
                lastMessage: null,
                timestamp: sub.createdAt || new Date().toISOString(),
                unreadCount: 0
            }));

            // 3. Study Rooms (Only Joined)
            const roomsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/study-room/joined`, { headers });
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
                    lastMessage: conv.latestMessageContent,
                    timestamp: conv.lastMessage || conv.updatedAt,
                    unreadCount: 0,
                    participants: conv.participants,
                    subtitle: `Product: ${conv.product?.title || 'Item'}`
                };
            });

            // 5. Direct Messages (Friends)
            const friendsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/friend/list`, { headers });
            const friendsChats = (friendsRes.data.friends || []).map(friend => ({
                _id: friend.conversationId,
                type: 'dm',
                name: friend.user.fullname,
                avatar: friend.user.picture,
                lastMessage: null,
                timestamp: new Date().toISOString(),
                unreadCount: 0,
                isOnline: friend.user.isOnline,
                friendId: friend.user._id
            }));

            // 6. Dating Matches
            let matchChats = [];
            try {
                const matchesRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dating/matches`, { headers });
                matchChats = (matchesRes.data.matches || []).map(match => ({
                    _id: match.conversationId?._id || match.conversationId,
                    type: 'match',
                    name: `Match: ${match.otherUser?.fullname || 'Unknown'}`,
                    avatar: match.otherUser?.picture,
                    lastMessage: null,
                    timestamp: match.createdAt || new Date().toISOString(),
                    unreadCount: 0,
                    isOnline: false,
                    friendId: match.otherUser?._id
                }));
            } catch (err) {
                console.error("Failed to fetch match chats", err);
            }

            const standardChatIds = [
                'global',
                ...subjects.map(s => s._id),
                ...studyRooms.map(r => r._id),
                ...friendsChats.map(f => f._id),
                ...matchChats.map(m => m._id)
            ];

            let metadata = {};
            try {
                const metaRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat/meta`,
                    { targetIds: standardChatIds },
                    { headers }
                );
                metadata = metaRes.data;
            } catch (err) {
                console.error("Failed to fetch chat metadata", err);
            }

            // Merge Metadata for all standard and match chats
            const mergedChats = [globalChat, ...subjectChats, ...studyRooms, ...friendsChats, ...matchChats].map(chat => {
                const meta = metadata[chat._id];
                return {
                    ...chat,
                    lastMessage: meta?.lastMessage || chat.lastMessage,
                    timestamp: meta?.timestamp || chat.timestamp,
                    unreadCount: meta?.unreadCount || 0,
                    senderName: meta?.sender || null
                };
            });

            // Combine all
            const all = [...storeChats, ...mergedChats];

            // Sort by latest (Newest timestamp first)
            all.sort((a, b) => {
                const timeA = new Date(a.timestamp || 0);
                const timeB = new Date(b.timestamp || 0);
                return timeB - timeA;
            });

            setChats(all.map(c => {
                const muteInfo = user.mutedChats?.find(m => m.chatId === c._id);
                const isMuted = muteInfo && new Date(muteInfo.until) > new Date();
                return { ...c, isMuted };
            }));

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

        // Optimistic Update: Set unread count to 0
        setChats(prev => prev.map(c =>
            c._id === chat._id ? { ...c, unreadCount: 0 } : c
        ));

        try {
            const token = await getAccessTokenSilently();
            const headers = { Authorization: `Bearer ${token}` };

            if (chat.type === 'store') {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/message/${chat._id}`, { headers });
                if (res.data.success) {
                    const normalized = (res.data.conversation.messages || []).map(m => ({
                        ...m,
                        message: m.content,
                        isStore: true
                    }));
                    setMessages(normalized);
                }
            }

            if (socket) {
                socket.emit("joinSubject", { subjectId: chat._id, type: chat.type });
            }

        } catch (error) {
            console.error("Failed to fetch messages", error);
            toast.error("Could not load messages");
        } finally {
            setLoadingMessages(false);
        }
    };

    // --- 3. Socket Event Handling ---

    // Join all subject/group rooms to ensure we get real-time updates for the list
    // even if we haven't selected that chat.
    const chatIdsHash = chats.map(c => c._id).sort().join(',');

    useEffect(() => {
        if (!socket) return;

        chats.forEach(c => {
            if (['subject', 'study-room', 'global'].includes(c.type)) {
                socket.emit("joinSubject", { subjectId: c._id, type: c.type });
            }
        });
    }, [socket, chatIdsHash]);

    useEffect(() => {
        if (!socket) return;
        const activeChatId = selectedChat?._id;

        const handleReceiveMessage = (msg) => {
            const rawSubjectId = msg.subjectId?._id || msg.subjectId;
            const msgSubjectId = (typeof rawSubjectId === 'object' && rawSubjectId !== null) ? rawSubjectId.toString() : rawSubjectId;

            // MSG ID Resolution for DMs
            const rawConversationId = msg.conversationId?._id || msg.conversationId;
            const msgConversationId = (typeof rawConversationId === 'object' && rawConversationId !== null) ? rawConversationId.toString() : rawConversationId;

            const isGlobalMsg = msg.isGlobal === true || msgSubjectId === 'global';
            // Target ID is Global OR Subject OR Conversation
            const targetId = isGlobalMsg ? 'global' : (msgSubjectId || msgConversationId);

            console.log("Socket: receiveMessage", { msg, targetId, current: activeChatId });

            if (activeChatId) {
                const isMatch = (activeChatId === 'global' && isGlobalMsg) ||
                    (activeChatId === targetId);

                if (isMatch) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === msg._id)) return prev;
                        return [...prev, msg];
                    });
                    scrollToBottom();
                }
            }

            setChats(prev => {
                const targetIdStr = String(targetId);
                const existingIndex = prev.findIndex(c => String(c._id) === targetIdStr);

                if (existingIndex > -1) {
                    const existingChat = prev[existingIndex];
                    const newTimestamp = msg.timestamp || new Date().toISOString();
                    const isChatActive = String(activeChatId) === targetIdStr;
                    const currentUnread = existingChat.unreadCount || 0;
                    const newUnread = isChatActive ? 0 : currentUnread + 1;

                    const updatedChat = {
                        ...existingChat,
                        lastMessage: msg.message || (msg.attachments?.length > 0 ? 'Attachment' : 'New Message'),
                        timestamp: newTimestamp,
                        unreadCount: newUnread,
                        senderName: msg.sender?.fullname || 'Someone'
                    };

                    const otherChats = prev.filter((_, idx) => idx !== existingIndex);
                    return [updatedChat, ...otherChats];
                } else {
                    fetchAllChats(true);
                    return prev;
                }
            });
        };

        const handleStoreMessage = (data) => {
            const { message, conversationId, conversation } = data;

            if (activeChatId === conversationId) {
                const normalized = { ...message, message: message.content, isStore: true };
                setMessages(prev => [...prev, normalized]);
                scrollToBottom();
            }

            setChats(prev => {
                const existingIndex = prev.findIndex(c => c._id === conversationId);

                if (existingIndex > -1) {
                    const updatedChats = [...prev];
                    const newTimestamp = message.timestamp || new Date().toISOString();
                    updatedChats[existingIndex] = {
                        ...updatedChats[existingIndex],
                        lastMessage: message.content || (message.attachments?.length > 0 ? 'Attachment' : 'New Message'),
                        timestamp: newTimestamp,
                        unreadCount: activeChatId === conversationId ? 0 : (updatedChats[existingIndex].unreadCount || 0) + 1
                    };
                    return updatedChats.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                } else if (conversation) {
                    const otherUser = conversation.participants.find(p => p._id !== user._id);
                    const newChat = {
                        _id: conversation._id,
                        type: 'store',
                        name: otherUser?.fullname || 'Unknown',
                        avatar: otherUser?.picture,
                        product: conversation.product,
                        lastMessage: message.content || (message.attachments?.length > 0 ? 'Attachment' : 'New Message'),
                        timestamp: conversation.lastMessage || message.timestamp || new Date().toISOString(),
                        unreadCount: 1,
                        participants: conversation.participants
                    };
                    return [newChat, ...prev];
                } else if (conversationId) {
                    fetchAllChats(true);
                    return prev;
                }
                return prev;
            });
        };

        const handleTypingUpdate = ({ typingUsers, subjectId }) => {
            if (activeChatId === subjectId) {
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
                fetchOnlineUsers();
            } else {
                setOnlineUsers(prev => prev.filter(u => u._id !== userId));
            }
        };

        const handleMessagesRead = ({ subjectId, userId }) => {
            if (userId === user?._id) {
                setChats(prev => prev.map(c =>
                    c._id === subjectId ? { ...c, unreadCount: 0 } : c
                ));
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("newStoreMessage", handleStoreMessage);
        socket.on("typingUpdate", handleTypingUpdate);
        socket.on("messageUpdated", handleMessageUpdated);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("updatePresence", handleUpdatePresence);
        socket.on("messagesRead", handleMessagesRead);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("newStoreMessage", handleStoreMessage);
            socket.off("typingUpdate", handleTypingUpdate);
            socket.off("messageUpdated", handleMessageUpdated);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("updatePresence", handleUpdatePresence);
            socket.off("messagesRead", handleMessagesRead);
        };
    }, [socket, selectedChat, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // --- 4. Actions ---

    const handleSendMessage = async (text, attachment) => {
        if (!selectedChat) return;

        if (socket) {
            socket.emit("stopTyping", { subjectId: selectedChat._id, user: user.fullname });
        }

        setChats(prev => {
            const targetIdStr = String(selectedChat._id);
            const existingIndex = prev.findIndex(c => String(c._id) === targetIdStr);
            if (existingIndex > -1) {
                const chat = prev[existingIndex];
                const updatedChat = {
                    ...chat,
                    lastMessage: text || (attachment ? 'Attachment' : 'New Message'),
                    timestamp: new Date().toISOString(),
                    unreadCount: 0
                };
                const others = prev.filter((_, i) => i !== existingIndex);
                return [updatedChat, ...others];
            }
            return prev;
        });

        try {
            const token = await getAccessTokenSilently();
            const headers = { Authorization: `Bearer ${token}` };

            if (selectedChat.type === 'store') {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/store/message/${selectedChat._id}`,
                    { content: text, attachments: attachment ? [attachment] : [], replyTo: replyTo?._id },
                    { headers }
                );
            } else {
                socket.emit("sendMessage", {
                    subjectId: selectedChat._id,
                    message: text,
                    senderId: user._id,
                    isGlobal: selectedChat.type === 'global',
                    replyTo: replyTo?._id,
                    attachments: attachment ? [attachment] : [],
                    type: selectedChat.type // Pass type
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

    const handleUpdateMessage = async (msgId, content) => {
        try {
            const token = await getAccessTokenSilently();
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

    const handleMuteChat = async (chatId, duration) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat/mute`, { chatId, duration }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) {
                toast.success(`Muted ${duration === 'always' ? 'permanently' : `for ${duration} hours`}`);

                // Update Redux state
                const updatedMutedChats = [...(user.mutedChats || []).filter(m => m.chatId !== chatId), { chatId, until: res.data.until }];
                dispatch(setuser({ ...user, mutedChats: updatedMutedChats }));

                fetchAllChats(true);
            }
        } catch (error) {
            console.error("Failed to mute", error);
            toast.error("Failed to mute chat");
        }
    };

    const handleUnmuteChat = async (chatId) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat/unmute`, { chatId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) {
                toast.success("Unmuted successfully");

                // Update Redux state
                const updatedMutedChats = (user.mutedChats || []).filter(m => m.chatId !== chatId);
                dispatch(setuser({ ...user, mutedChats: updatedMutedChats }));

                fetchAllChats(true);
            }
        } catch (error) {
            console.error("Failed to unmute", error);
            toast.error("Failed to unmute chat");
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
                    data: { userId: user._id },
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete message");
        }
    };

    return {
        chats,
        loading,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        onlineUsers,
        selectedChat,
        setSelectedChat,
        isMobileChatOpen,
        setIsMobileChatOpen,
        messages,
        loadingMessages,
        replyTo,
        setReplyTo,
        editingMessage,
        setEditingMessage,
        typingUsers,
        messagesEndRef,
        handleSelectChat,
        handleSendMessage,
        handleTyping,
        handleUpdateMessage,
        handleDeleteMessage,
        handleMuteChat,
        handleUnmuteChat
    };
};

export default useAllChats;
