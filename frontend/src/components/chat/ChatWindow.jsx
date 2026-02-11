import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Send, X, MessageCircle, Loader2, Search, ChevronUp, ChevronDown, Clock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ subjectId, subjectName, onClose }) => {
    const { usere } = useSelector((store) => store.auth);
    const socket = useSocket();
    const { getAccessTokenSilently } = useAuth0();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    // Search state
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const messageRefs = useRef({});

    // Fetch initial chat history and mark as read
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = await getAccessTokenSilently({
                    audience: "http://localhost:5000/api/v2",
                });
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/chat/${subjectId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessages(res.data);
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            } finally {
                setLoading(false);
            }
        };

        const markAsRead = async () => {
            try {
                const token = await getAccessTokenSilently({
                    audience: "http://localhost:5000/api/v2",
                });
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/chat/read/${subjectId}`,
                    { userId: usere._id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Failed to mark messages as read", error);
            }
        };

        if (subjectId && usere) {
            fetchHistory();
            markAsRead();
        }
    }, [subjectId, getAccessTokenSilently, usere]);

    // Socket listener
    useEffect(() => {
        if (!socket) return;

        // Join the subject room
        socket.emit("joinSubject", subjectId);

        const handleReceiveMessage = (message) => {
            // Only append if it belongs to this subject
            if (message.subjectId === subjectId) {
                setMessages((prev) => [...prev, message]);
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

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("messagesRead", handleMessagesRead);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("messagesRead", handleMessagesRead);
        };
    }, [socket, subjectId]);

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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            subjectId,
            message: newMessage,
            senderId: usere._id,
        };

        // Optimistic update (optional, but good for UX)
        // For now, we rely on the server broadcast to avoid duplication logic complexity
        // or we can append it locally and rely on ID checks. 
        // Let's just emit and wait for broadcast for simplicity and consistency.

        socket.emit("sendMessage", messageData);
        setNewMessage("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
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

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 pb-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender?._id === usere?._id;
                                const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;

                                return (
                                    <div
                                        key={msg._id || idx}
                                        ref={(el) => (messageRefs.current[msg._id] = el)}
                                        className="transition-colors duration-500 rounded-lg"
                                    >
                                        <MessageBubble
                                            message={msg}
                                            isMe={isMe}
                                            showAvatar={showAvatar}
                                            showSenderName={showAvatar}
                                            onReply={() => { }}
                                            onReact={() => { }}
                                            onPin={null}
                                            onEdit={null}
                                            onDelete={null}
                                            searchTerm={searchTerm}
                                        />
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
                    >
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent px-4 py-1 focus:outline-none text-sm text-gray-700 placeholder:text-gray-400"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!newMessage.trim()}
                            className="rounded-full w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
