import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useAuth0 } from "@auth0/auth0-react";
import { MessageCircle, Search, Pin, ChevronUp, ChevronDown, Clock, User as UserIcon, X, Loader2 } from 'lucide-react';
import { useSocket } from "../../context/SocketContext";
import MessageBubble from '../chat/MessageBubble';
import ChatInput from '../chat/ChatInput';
import TypingIndicator from '../chat/TypingIndicator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const StoreChat = () => {
    const { getAccessTokenSilently } = useAuth0();
    const { usere: user } = useSelector(state => state.auth);
    const socket = useSocket();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Message Actions State
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);

    // Search State (Sidebar)
    const [sidebarSearchTerm, setSidebarSearchTerm] = useState("");

    // Search State (Chat)
    const [showChatSearch, setShowChatSearch] = useState(false);
    const [chatSearchTerm, setChatSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);

    // Pinned Messages
    const [pinnedMessages, setPinnedMessages] = useState([]);

    const messagesEndRef = useRef(null);
    const messageRefs = useRef({});

    // Fetch conversations on load
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const token = await getAccessTokenSilently();
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const fetchMessages = async (convId) => {
        setLoadingMessages(true);
        try {
            const token = await getAccessTokenSilently();
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/message/${convId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setMessages(data.conversation.messages || []);
                setActiveConversation(data.conversation);
                // Also fetch pinned if any (could filter from messages, but if pagination exists in future...)
                const pinned = (data.conversation.messages || []).filter(m => m.isPinned);
                setPinnedMessages(pinned);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Join Conversation Room
    useEffect(() => {
        if (socket && activeConversation) {
            socket.emit("joinSubject", activeConversation._id);
        }
    }, [socket, activeConversation]);

    // Socket Listeners
    useEffect(() => {
        if (!socket || !user) return;

        const handleNewMessage = (data) => {
            const { message, conversationId, conversation } = data;

            // If active conversation, append message
            if (activeConversation?._id === conversationId) {
                setMessages((prev) => [...prev, message]);
            }

            // Update conversation list
            setConversations((prev) => {
                const exists = prev.find(c => c._id === conversationId);

                if (exists) {
                    const updated = prev.map(conv => {
                        if (conv._id === conversationId) {
                            return {
                                ...conv,
                                lastMessage: message.timestamp,
                            };
                        }
                        return conv;
                    });
                    return updated.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));
                } else if (conversation) {
                    // Start of new conversation
                    return [conversation, ...prev];
                }
                return prev;
            });
        };

        const handleMessageUpdated = (updatedMsg) => {
            setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));

            if (updatedMsg.isPinned) {
                setPinnedMessages(prev => {
                    if (!prev.find(p => p._id === updatedMsg._id)) return [...prev, updatedMsg];
                    return prev.map(p => p._id === updatedMsg._id ? updatedMsg : p);
                });
            } else {
                setPinnedMessages(prev => prev.filter(p => p._id !== updatedMsg._id));
            }
        };

        const handleMessageDeleted = ({ messageId, conversationId }) => {
            if (activeConversation?._id === conversationId) {
                setMessages(prev => prev.filter(m => m._id !== messageId));
                setPinnedMessages(prev => prev.filter(p => p._id !== messageId));
            }
        };

        const handleTypingUpdate = ({ typingUsers: users, subjectId }) => {
            if (activeConversation?._id === subjectId) {
                // Filter out current user
                setTypingUsers(users.filter(u => u !== user.fullname));
            }
        };

        socket.on("newStoreMessage", handleNewMessage);
        socket.on("storeMessageUpdated", handleMessageUpdated);
        socket.on("storeMessageDeleted", handleMessageDeleted);
        socket.on("typingUpdate", handleTypingUpdate);

        return () => {
            socket.off("newStoreMessage", handleNewMessage);
            socket.off("storeMessageUpdated", handleMessageUpdated);
            socket.off("storeMessageDeleted", handleMessageDeleted);
            socket.off("typingUpdate", handleTypingUpdate);
        };
    }, [socket, activeConversation, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    // --- Actions ---

    const handleSendMessage = async (text, attachment) => {
        if ((!text.trim() && !attachment) || !activeConversation) return;

        // Validations for attachments
        if (attachment) {
            // Assuming attachment validation handled in ChatInput or here
        }

        // Stop typing immediately
        if (socket && activeConversation) {
            socket.emit("stopTyping", { subjectId: activeConversation._id, user: user.fullname });
        }

        try {
            const token = await getAccessTokenSilently();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/store/message/${activeConversation._id}`,
                {
                    content: text,
                    attachments: attachment ? [attachment] : [],
                    replyTo: replyTo?._id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setReplyTo(null);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleTyping = () => {
        if (!socket || !activeConversation) return;
        socket.emit("typing", { subjectId: activeConversation._id, user: user.fullname });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { subjectId: activeConversation._id, user: user.fullname });
        }, 3000);
    };

    const handleSearchChat = async (e) => {
        if (e) e.preventDefault();
        if (!chatSearchTerm.trim()) return;

        setIsSearching(true);
        try {
            const token = await getAccessTokenSilently();
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/search/${activeConversation._id}?query=${chatSearchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSearchResults(data.messages);
                if (data.messages.length > 0) setCurrentSearchIndex(0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const jumpToMessage = (id) => {
        const el = messageRefs.current[id];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("bg-indigo-50");
            setTimeout(() => el.classList.remove("bg-indigo-50"), 2000);
        }
    };

    useEffect(() => {
        if (currentSearchIndex >= 0 && searchResults[currentSearchIndex]) {
            jumpToMessage(searchResults[currentSearchIndex]._id);
        }
    }, [currentSearchIndex]);

    const handleReaction = async (msgId, emoji) => {
        try {
            const token = await getAccessTokenSilently();
            // Toggle logic: Check if I already reacted with this emoji
            const msg = messages.find(m => m._id === msgId);
            const hasReacted = msg?.reactions?.some(r => r.user?._id === user._id && r.emoji === emoji) ||
                msg?.reactions?.some(r => r.user === user._id && r.emoji === emoji); // Handle populated/unpopulated

            if (hasReacted) {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/store/message/unreact/${msgId}`, { emoji }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/store/message/react/${msgId}`, { emoji }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePin = async (msgId) => {
        try {
            const token = await getAccessTokenSilently();
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/store/message/pin/${msgId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (msgId) => {
        if (!confirm("Delete Message?")) return;
        try {
            const token = await getAccessTokenSilently();
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/store/message/${msgId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) { console.error(e); }
    };

    const handleEdit = (msg) => {
        setEditingMessage(msg);
    };

    const handleUpdateMessage = async (msgId, content) => {
        try {
            const token = await getAccessTokenSilently();
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/store/message/${msgId}`, { content }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingMessage(null);
        } catch (e) { console.error(e); }
    };

    // Filter Sidebar
    const filteredConversations = conversations.filter(conv => {
        const otherUser = conv.participants.find(p => p._id !== user?._id);
        const term = sidebarSearchTerm.toLowerCase();
        return otherUser?.fullname?.toLowerCase().includes(term) || conv.product?.title?.toLowerCase().includes(term);
    });

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h1 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-primary" />
                        Store Messages
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search chats..."
                            value={sidebarSearchTerm}
                            onChange={(e) => setSidebarSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary font-medium"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="divide-y divide-slate-100">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map(conv => {
                                const otherUser = conv.participants.find(p => p._id !== user?._id);
                                const isActive = activeConversation?._id === conv._id;
                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => fetchMessages(conv._id)}
                                        className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${isActive ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative shrink-0">
                                                <Avatar className="w-10 h-10 border border-slate-200">
                                                    <AvatarImage src={otherUser?.picture} />
                                                    <AvatarFallback>{otherUser?.fullname?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md border-2 border-white overflow-hidden bg-slate-100">
                                                    <img src={conv.product?.images[0]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h4 className={`text-sm truncate ${isActive ? 'font-bold text-indigo-900' : 'font-semibold text-slate-700'}`}>
                                                        {otherUser?.fullname}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(conv.lastMessage).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-indigo-600 truncate mb-1 bg-indigo-50 inline-block px-1.5 py-0.5 rounded-sm">
                                                    {conv.product?.title}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-500 text-sm">No conversations found</div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                                    <img src={activeConversation.product.images[0]} alt="Product" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 leading-tight">{activeConversation.product.title}</h2>
                                    <p className="text-xs font-bold text-indigo-600">₹{activeConversation.product.price}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {!showChatSearch ? (
                                    <Button variant="ghost" size="icon" onClick={() => setShowChatSearch(true)}>
                                        <Search className="w-5 h-5 text-slate-500" />
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md">
                                        <Search className="w-4 h-4 text-slate-400 ml-2" />
                                        <form onSubmit={handleSearchChat}>
                                            <Input
                                                autoFocus
                                                value={chatSearchTerm}
                                                onChange={e => setChatSearchTerm(e.target.value)}
                                                placeholder="Search in chat..."
                                                className="h-8 border-none bg-transparent focus-visible:ring-0 w-40"
                                            />
                                        </form>
                                        {searchResults.length > 0 && (
                                            <span className="text-xs text-slate-500 whitespace-nowrap px-1">
                                                {currentSearchIndex + 1}/{searchResults.length}
                                            </span>
                                        )}
                                        <div className="flex">
                                            <Button size="icon" variant="ghost" className="h-8 w-6" onClick={() => setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length)}>
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-6" onClick={() => setCurrentSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length)}>
                                                <ChevronUp className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-200 rounded-sm" onClick={() => {
                                            setShowChatSearch(false);
                                            setChatSearchTerm("");
                                            setSearchResults([]);
                                        }}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pinned Messages Banner */}
                        {pinnedMessages.length > 0 && (
                            <div className="bg-indigo-50 border-b border-indigo-100 p-2 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer" onClick={() => jumpToMessage(pinnedMessages[0]._id)}>
                                    <Pin className="w-4 h-4 text-indigo-600 shrink-0 fill-current" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Pinned Message</span>
                                        <p className="text-[11px] text-indigo-900 truncate font-medium">
                                            {pinnedMessages[0].content}
                                        </p>
                                    </div>
                                </div>
                                {pinnedMessages.length > 1 && (
                                    <span className="text-[9px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full ml-2">
                                        +{pinnedMessages.length - 1}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            {loadingMessages ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                </div>
                            ) : messages.length > 0 ? (
                                <div className="flex flex-col gap-1 pb-4">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender?._id === user?._id;
                                        const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;

                                        // Normalize msg structure for MessageBubble
                                        const normalizedMsg = {
                                            ...msg,
                                            message: msg.content, // MessageBubble expects 'message' prop for text
                                        };

                                        return (
                                            <div key={msg._id} ref={(el) => (messageRefs.current[msg._id] = el)}>
                                                <MessageBubble
                                                    message={normalizedMsg}
                                                    isMe={isMe}
                                                    showAvatar={showAvatar}
                                                    showSenderName={showAvatar}
                                                    onReply={() => setReplyTo(msg)}
                                                    onReact={(emoji) => handleReaction(msg._id, emoji)}
                                                    onPin={() => handlePin(msg._id)}
                                                    onEdit={() => handleEdit(msg)}
                                                    onDelete={() => handleDelete(msg._id)}
                                                    searchTerm={chatSearchTerm}
                                                />
                                            </div>
                                        );
                                    })}
                                    <TypingIndicator typingUsers={typingUsers} />
                                    <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <p className="text-sm font-medium">Start the conversation!</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="max-w-4xl mx-auto">
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    placeholder={`Message about ${activeConversation.product.title}...`}
                                    replyTo={replyTo}
                                    onCancelReply={() => setReplyTo(null)}
                                    editingMessage={editingMessage}
                                    onUpdateMessage={handleUpdateMessage}
                                    onCancelEdit={() => setEditingMessage(null)}
                                    onTyping={handleTyping}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <MessageCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to Store Chat</h2>
                        <p className="text-slate-500 max-w-sm">Select a conversation from the sidebar to make offers and chat with sellers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreChat;
