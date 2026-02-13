import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Send, X, MessageCircle, Loader2, Search, ChevronUp, ChevronDown, Clock, User as UserIcon, Pin, Trash, Reply, Smile, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import OnlineUsersBar from "./OnlineUsersBar";

const ChatWindow = ({ subjectId, subjectName, onClose }) => {
    const { usere } = useSelector((store) => store.auth);
    const socket = useSocket();
    const { getAccessTokenSilently } = useAuth0();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const scrollViewportRef = useRef(null);

    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const typingTimeoutRef = useRef(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);

    // Pinned messages
    const [pinnedMessages, setPinnedMessages] = useState([]);

    // Search state
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const messageRefs = useRef({});

    // Fetch chat history
    const fetchHistory = async (pageNum = 1) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setIsFetchingMore(true);

            const token = await getAccessTokenSilently();
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/chat/${subjectId}?page=${pageNum}&limit=50`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.length < 50) {
                setHasMore(false);
            }

            if (pageNum === 1) {
                setMessages(res.data);
                // Scroll to bottom on initial load
                setTimeout(() => {
                    scrollViewportRef.current?.scrollTo({ top: scrollViewportRef.current.scrollHeight });
                }, 100);
            } else {
                setMessages((prev) => [...res.data, ...prev]);
            }
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    // Fetch pinned messages
    const fetchPinnedMessages = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/chat/pinned/${subjectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPinnedMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch pinned messages", error);
        }
    };

    const fetchOnlineUsers = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/chat/online/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOnlineUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch online users", error);
        }
    };

    // Mark messages as read
    const markAsRead = async () => {
        try {
            const token = await getAccessTokenSilently();
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/chat/read/${subjectId}`,
                { userId: usere._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Failed to mark messages as read", error);
        }
    };

    useEffect(() => {
        if (usere && subjectId) {
            fetchHistory(1);
            fetchPinnedMessages();
            fetchOnlineUsers();
            markAsRead();
        }
    }, [subjectId, usere, getAccessTokenSilently]);

    // Handle Scroll for Pagination
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight } = e.currentTarget;
        if (scrollTop === 0 && hasMore && !isFetchingMore && !loading) {
            setPrevScrollHeight(scrollHeight);
            setPage((prev) => {
                const nextPage = prev + 1;
                fetchHistory(nextPage);
                return nextPage;
            });
        }
    };

    // Maintain scroll position after fetching more messages
    useEffect(() => {
        if (isFetchingMore || loading) return;
        if (page > 1 && scrollViewportRef.current) {
            const newScrollHeight = scrollViewportRef.current.scrollHeight;
            const scrollDiff = newScrollHeight - prevScrollHeight;
            if (scrollDiff > 0) {
                scrollViewportRef.current.scrollTop = scrollDiff;
            }
        }
    }, [messages, page, isFetchingMore, loading, prevScrollHeight]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !subjectId) return;

        socket.emit("joinSubject", subjectId);

        const handleReceiveMessage = (message) => {
            if (message.subjectId === subjectId) {
                setMessages((prev) => [...prev, message]);
                markAsRead();
            }
        };

        const handleMessageUpdated = (updatedMsg) => {
            if (updatedMsg.subjectId === subjectId) {
                setMessages(prev => prev.map(msg => msg._id === updatedMsg._id ? updatedMsg : msg));
            }
        };

        const handleMessageDeleted = ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        };

        const handleTypingUpdate = ({ typingUsers: users, subjectId: sid }) => {
            if (sid === subjectId) {
                // Filter out current user from the typing list shown to them
                setTypingUsers(users.filter(u => u !== usere.fullname));
            }
        };

        const handleMessagesRead = ({ userId }) => {
            setMessages((prev) => prev.map(msg => {
                if (msg.sender?._id !== userId && !msg.readBy?.includes(userId)) {
                    return { ...msg, readBy: [...(msg.readBy || []), userId] };
                }
                return msg;
            }));
        };

        const handleUpdatePresence = ({ userId, isOnline, lastSeen }) => {
            setMessages((prev) => prev.map(msg => {
                if (msg.sender?._id === userId) {
                    return {
                        ...msg,
                        sender: {
                            ...msg.sender,
                            isOnline,
                            lastSeen: lastSeen || msg.sender.lastSeen
                        }
                    };
                }
                return msg;
            }));

            // Update onlineUsers bar state
            if (isOnline) {
                fetchOnlineUsers();
            } else {
                setOnlineUsers(prev => prev.filter(u => u._id !== userId));
            }
        };

        const handlePinnedUpdated = () => fetchPinnedMessages();

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("messageUpdated", handleMessageUpdated);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("typingUpdate", handleTypingUpdate);
        socket.on("messagesRead", handleMessagesRead);
        socket.on("pinnedMessagesUpdated", handlePinnedUpdated);
        socket.on("updatePresence", handleUpdatePresence);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("messageUpdated", handleMessageUpdated);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("typingUpdate", handleTypingUpdate);
            socket.off("messagesRead", handleMessagesRead);
            socket.off("pinnedMessagesUpdated", handlePinnedUpdated);
            socket.off("updatePresence", handleUpdatePresence);
        };
    }, [socket, subjectId, usere, getAccessTokenSilently]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSearch = async (val) => {
        const query = val || searchTerm;
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/chat/search/${subjectId}?query=${query}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSearchResults(res.data);
            if (res.data.length > 0) {
                setCurrentSearchIndex(0);
            } else {
                setCurrentSearchIndex(-1);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                handleSearch(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const jumpToMessage = (messageId) => {
        const element = messageRefs.current[messageId];
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Add a temporary highlight effect
            element.classList.add("bg-indigo-50");
            setTimeout(() => {
                element.classList.remove("bg-indigo-50");
            }, 2000);
        }
    };

    const nextSearchResult = () => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentSearchIndex + 1) % searchResults.length;
        setCurrentSearchIndex(nextIndex);
        jumpToMessage(searchResults[nextIndex]._id);
    };

    const prevSearchResult = () => {
        if (searchResults.length === 0) return;
        const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
        setCurrentSearchIndex(prevIndex);
        jumpToMessage(searchResults[prevIndex]._id);
    };

    const handleSendMessage = (text, attachment) => {
        if (!socket || !subjectId) return;

        // Stop typing immediately
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("stopTyping", { subjectId, user: usere.fullname });

        const messageData = {
            subjectId,
            message: text,
            senderId: usere._id,
            isGlobal: false,
            replyTo: replyTo ? replyTo._id : null,
            attachments: attachment ? [attachment] : []
        };

        socket.emit("sendMessage", messageData);
        setReplyTo(null);
    };

    const handleTyping = () => {
        if (!socket || !subjectId) return;

        // Emit typing only if not already typing (or keep-alive)
        socket.emit("typing", { subjectId, user: usere.fullname });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { subjectId, user: usere.fullname });
        }, 2000);
    };

    const handleTogglePin = async (messageId) => {
        try {
            const token = await getAccessTokenSilently();
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/chat/pin/${messageId}`,
                { userId: usere._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Failed to toggle pin", error);
        }
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/chat/react/${messageId}`,
                { userId: usere._id, emoji },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedMsg = res.data;
            setMessages(prev => prev.map(msg => msg._id === messageId ? updatedMsg : msg));
            socket.emit("messageUpdated", updatedMsg);
        } catch (error) {
            console.error("Failed to react", error);
        }
    };

    const onEditMessage = (message) => {
        setEditingMessage(message);
    };

    const handleUpdateMessage = async (messageId, newText) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/chat/${messageId}`,
                { userId: usere._id, message: newText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedMsg = res.data;
            setMessages(prev => prev.map(msg => msg._id === messageId ? updatedMsg : msg));
            socket.emit("messageUpdated", updatedMsg);
            setEditingMessage(null);
        } catch (error) {
            console.error("Failed to update message", error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            const token = await getAccessTokenSilently();
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/chat/${messageId}`,
                {
                    data: { userId: usere._id },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMessages(prev => prev.filter(msg => msg._id !== messageId));
            socket.emit("messageDeleted", { messageId, subjectId });
        } catch (error) {
            console.error("Failed to delete message", error);
        }
    };

    return (
        <div className="fixed top-[64px] left-0 right-0 bottom-0 z-40 bg-white flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="w-full h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shrink-0 relative">
                    {!showSearch ? (
                        <>
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                <MessageCircle className="w-5 h-5 shrink-0" />
                                <h3 className="font-bold truncate">{subjectName}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                                    <Search className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 w-full">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className="pl-9 bg-white/10 border-white/20 h-8 focus-visible:ring-1 focus-visible:ring-white/30 text-white placeholder:text-white/50 text-sm"
                                        autoFocus
                                    />
                                </form>
                            </div>
                            {searchResults.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-white">
                                    <span>{currentSearchIndex + 1}/{searchResults.length}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={prevSearchResult}>
                                        <ChevronUp className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={nextSearchResult}>
                                        <ChevronDown className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => {
                                setShowSearch(false);
                                setSearchTerm("");
                                setSearchResults([]);
                                setCurrentSearchIndex(-1);
                            }} className="text-white hover:bg-white/20 h-8 w-8">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Telegram-style Search Results List */}
                    {showSearch && searchTerm.trim() && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white shadow-2xl z-50 border-b border-gray-200 max-h-[250px] flex flex-col animate-in slide-in-from-top-2 duration-200">
                            <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2">
                                    {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'} found
                                </span>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="divide-y divide-gray-50">
                                    {searchResults.map((result, idx) => (
                                        <button
                                            key={result._id}
                                            onClick={() => {
                                                setCurrentSearchIndex(idx);
                                                jumpToMessage(result._id);
                                            }}
                                            className={`w-full p-2.5 text-left hover:bg-indigo-50/50 transition-colors flex gap-2.5 items-start ${currentSearchIndex === idx ? 'bg-indigo-50 border-l-2 border-indigo-600' : ''}`}
                                        >
                                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                {result.sender?.picture ? (
                                                    <img src={result.sender.picture} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <span className="text-[11px] font-bold text-gray-900 truncate">
                                                        {result.sender?.fullname || 'Unknown'}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[8px] text-gray-400 whitespace-nowrap ml-2">
                                                        <Clock className="w-2 h-2" />
                                                        {new Date(result.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-gray-600 line-clamp-2 break-words leading-snug"
                                                    dangerouslySetInnerHTML={{
                                                        __html: result.message.replace(new RegExp(`(${searchTerm})`, 'gi'), '<mark class="bg-yellow-200 text-black px-0.5 rounded">$1</mark>')
                                                    }}>
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {showSearch && searchTerm.trim() && searchResults.length === 0 && !isSearching && (
                        <div className="absolute top-full left-0 right-0 bg-white shadow-xl z-50 border-b border-gray-200 p-6 text-center animate-in slide-in-from-top-2 duration-200">
                            <Search className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 font-medium">No messages found for "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                {/* Online Users Bar */}
                <OnlineUsersBar users={onlineUsers} />

                {/* Pinned Messages Banner */}
                {pinnedMessages.length > 0 && (
                    <div className="bg-indigo-50 border-b border-indigo-100 p-2 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <Pin className="w-4 h-4 text-indigo-600 shrink-0 fill-current" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Pinned Message</span>
                                <p className="text-[11px] text-indigo-900 truncate font-medium">
                                    {pinnedMessages[0].message}
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

                {/* Messages Area */}
                <div className="flex-1 overflow-hidden bg-slate-50 relative flex flex-col">
                    <div
                        className="flex-1 p-4 overflow-y-auto"
                        onScroll={handleScroll}
                        ref={scrollViewportRef}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="font-medium">No messages yet.</p>
                                <p className="text-sm">Be the first to say hello!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1 pb-4">
                                {isFetchingMore && (
                                    <div className="flex justify-center py-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                                    </div>
                                )}
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender?._id === usere?._id;
                                    const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;
                                    const showSenderName = showAvatar;

                                    // Date Separator Logic
                                    const currentDate = new Date(msg.timestamp).toDateString();
                                    const prevDate = idx > 0 ? new Date(messages[idx - 1].timestamp).toDateString() : null;
                                    const showDateSeparator = currentDate !== prevDate;

                                    let dateLabel = currentDate;
                                    const today = new Date().toDateString();
                                    const yesterday = new Date();
                                    yesterday.setDate(yesterday.getDate() - 1);

                                    if (currentDate === today) dateLabel = "Today";
                                    else if (currentDate === yesterday.toDateString()) dateLabel = "Yesterday";

                                    return (
                                        <React.Fragment key={msg._id || idx}>
                                            {showDateSeparator && (
                                                <div className="flex justify-center my-4">
                                                    <span className="bg-slate-200 text-slate-600 text-[10px] px-3 py-1 rounded-full shadow-sm">
                                                        {dateLabel}
                                                    </span>
                                                </div>
                                            )}
                                            <div
                                                ref={(el) => (messageRefs.current[msg._id] = el)}
                                                className="transition-colors duration-500 rounded-lg"
                                            >
                                                <MessageBubble
                                                    message={msg}
                                                    isMe={isMe}
                                                    showAvatar={showAvatar}
                                                    showSenderName={showSenderName}
                                                    onReply={() => setReplyTo(msg)}
                                                    onReact={(emoji) => handleReaction(msg._id, emoji)}
                                                    onPin={() => handleTogglePin(msg._id)}
                                                    onEdit={() => onEditMessage(msg)}
                                                    onDelete={() => handleDeleteMessage(msg._id)}
                                                    searchTerm={searchTerm}
                                                />
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                <TypingIndicator typingUsers={typingUsers} />
                                <div ref={scrollRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <ChatInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    editingMessage={editingMessage}
                    onUpdateMessage={handleUpdateMessage}
                    onCancelEdit={() => setEditingMessage(null)}
                />
            </div>
        </div>
    );
};

export default ChatWindow;
