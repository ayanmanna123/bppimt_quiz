import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GlobalChat = () => {
    const { usere } = useSelector((store) => store.auth);
    const socket = useSocket();
    const { getAccessTokenSilently } = useAuth0();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const subjectId = "global";

    // Mention state
    const [mentionQuery, setMentionQuery] = useState("");
    const [showMentionList, setShowMentionList] = useState(false);
    const [mentionUsers, setMentionUsers] = useState([]);
    const [mentionCursorPosition, setMentionCursorPosition] = useState(null);
    const [selectedMentions, setSelectedMentions] = useState([]); // Array of user objects

    // Fetch initial chat history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = await getAccessTokenSilently();
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

        fetchHistory();
    }, [getAccessTokenSilently]);

    // Socket listener
    useEffect(() => {
        if (!socket) return;

        // Join the global room
        socket.emit("joinSubject", subjectId);

        const handleReceiveMessage = (message) => {
            if (message.isGlobal || message.subjectId === "global") {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [socket]);

    // Auto-scroll into view
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Mention search
    useEffect(() => {
        const searchUsers = async () => {
            if (!mentionQuery) {
                setMentionUsers([]);
                return;
            }
            try {
                const token = await getAccessTokenSilently();
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/user/search?query=${mentionQuery}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMentionUsers(res.data);
            } catch (error) {
                console.error("Failed to search users", error);
            }
        };

        const timeoutId = setTimeout(() => {
            if (showMentionList) {
                searchUsers();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [mentionQuery, showMentionList, getAccessTokenSilently]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        const selectionStart = e.target.selectionStart;
        setNewMessage(value);

        // Check for duplicate @
        // Find the last @ before cursor
        const lastAt = value.lastIndexOf("@", selectionStart - 1);

        if (lastAt !== -1) {
            // Check if there's a space before @ (or it's start of string)
            const charBeforeAt = lastAt === 0 ? " " : value[lastAt - 1];

            if (charBeforeAt === " " || charBeforeAt === "\n") {
                const query = value.slice(lastAt + 1, selectionStart);
                // Only search if query doesn't contain spaces (simple assumption for username/firstname)
                // You might want to allow spaces for full names
                if (!query.includes("@")) {
                    setMentionQuery(query);
                    setShowMentionList(true);
                    setMentionCursorPosition(lastAt);
                    return;
                }
            }
        }

        setShowMentionList(false);
    };

    const handleSelectUser = (user) => {
        if (mentionCursorPosition === null) return;

        const beforeMention = newMessage.slice(0, mentionCursorPosition);
        const afterMention = newMessage.slice(mentionCursorPosition + mentionQuery.length + 1);

        const newText = `${beforeMention}@${user.fullname} ${afterMention}`;
        setNewMessage(newText);
        setShowMentionList(false);
        setMentionQuery("");

        // Track selected mention
        if (!selectedMentions.find(u => u._id === user._id)) {
            setSelectedMentions([...selectedMentions, user]);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        // Filter valid mentions that are actually in the final message
        const validMentions = selectedMentions.filter(user =>
            newMessage.includes(`@${user.fullname}`)
        ).map(user => user._id);

        const messageData = {
            subjectId, // "global"
            message: newMessage,
            senderId: usere._id,
            isGlobal: true,
            mentions: validMentions
        };

        socket.emit("sendMessage", messageData);
        setNewMessage("");
        setSelectedMentions([]);
    };

    // Helper to render message with highlighted mentions
    const renderMessageContent = (text, mentions) => {
        if (!mentions || mentions.length === 0) return text;

        // Create a regex pattern to match any of the mentioned names
        // We need to match @Name
        // We should verify if the text actually contains @Name corresponding to a mention ID
        // But for display, simply highlighting @Name patterns that match mentioned users is enough

        let content = [];
        let lastIndex = 0;

        // Helper function to escape regex special characters
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        // Find all occurrences of @MentionedName
        // This is a naive implementation; for robust parsing, use a library or tokenization
        const mentionMap = new Map();
        mentions.forEach(m => mentionMap.set(`@${m.fullname}`, m));

        const regex = new RegExp(
            Array.from(mentionMap.keys()).map(name => escapeRegExp(name)).join("|"),
            "g"
        );

        let match;
        while ((match = regex.exec(text)) !== null) {
            // Push text before match
            if (match.index > lastIndex) {
                content.push(text.slice(lastIndex, match.index));
            }

            // Push mention component
            const mentionedUser = mentionMap.get(match[0]);
            const isMe = mentionedUser._id === usere?._id;

            content.push(
                <span key={match.index} className={`font-semibold ${isMe ? "bg-yellow-200 text-yellow-800" : "text-indigo-600 bg-indigo-50"} px-1 rounded mx-0.5`}>
                    {match[0]}
                </span>
            );

            lastIndex = regex.lastIndex;
        }

        // Push remaining text
        if (lastIndex < text.length) {
            content.push(text.slice(lastIndex));
        }

        return content.length > 0 ? content : text;
    };


    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-7xl mx-auto p-4">
            <div className="bg-white w-full h-full rounded-2xl shadow-lg flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Community Chat</h3>
                            <p className="text-xs text-indigo-100">Connect with everyone in college</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4 bg-slate-50 relative">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-medium">No messages yet.</p>
                            <p className="text-sm">Be the first to say hello to the community!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender?._id === usere?._id;
                                const showAvatar =
                                    !isMe &&
                                    (idx === 0 ||
                                        messages[idx - 1]?.sender?._id !== msg.sender?._id);

                                // Check if I am mentioned
                                const amIMentioned = msg.mentions?.some(m => m._id === usere?._id);

                                return (
                                    <div
                                        key={msg._id || idx}
                                        className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"} ${amIMentioned ? "bg-yellow-50/50 -mx-4 px-4 py-1" : ""}`}
                                    >
                                        {!isMe && (
                                            <div className="w-8 shrink-0 flex flex-col justify-end pb-1">
                                                {showAvatar ? (
                                                    <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                                                        <AvatarImage src={msg.sender?.picture} />
                                                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-bold">
                                                            {msg.sender?.fullname?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : <div className="w-8" />}
                                            </div>
                                        )}

                                        <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                                            {!isMe && showAvatar && (
                                                <div className="flex items-center gap-2 mb-1 ml-1">
                                                    <span className="text-xs font-semibold text-slate-600">
                                                        {msg.sender?.fullname}
                                                    </span>
                                                    {msg.sender?.role === 'teacher' && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                                                            Teacher
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div
                                                className={`px-4 py-2.5 shadow-sm text-sm ${isMe
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm"
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm"
                                                    } ${amIMentioned && !isMe ? "border-l-4 border-l-yellow-400" : ""}`}
                                            >
                                                <p className="leading-relaxed">
                                                    {renderMessageContent(msg.message, msg.mentions)}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] mt-1 px-1 ${isMe ? "text-slate-400" : "text-slate-400"}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0 relative">
                    {/* Mention List Popover */}
                    {showMentionList && mentionUsers.length > 0 && (
                        <div className="absolute bottom-full left-4 mb-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10">
                            <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500">
                                Mention user
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {mentionUsers.map(user => (
                                    <button
                                        key={user._id}
                                        onClick={() => handleSelectUser(user)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user.picture} />
                                            <AvatarFallback>{user.fullname[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{user.fullname}</p>
                                            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-3"
                    >
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={handleInputChange}
                                placeholder="Type @ to mention someone..."
                                className="w-full bg-slate-50 text-slate-700 placeholder:text-slate-400 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:hue-rotate-15 text-white shadow-lg disabled:opacity-50 disabled:shadow-none transition-all p-0 flex items-center justify-center shrink-0"
                        >
                            <Send className="w-5 h-5 fill-current" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GlobalChat;
