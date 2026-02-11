import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatWindow = ({ subjectId, subjectName, onClose }) => {
    const { usere } = useSelector((store) => store.auth);
    const socket = useSocket();
    const { getAccessTokenSilently } = useAuth0();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

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

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [socket, subjectId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <h3 className="font-bold truncate max-w-[250px]">{subjectName}</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </Button>
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
                        <div className="flex flex-col gap-3">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender?._id === usere?._id;
                                const showAvatar =
                                    !isMe &&
                                    (idx === 0 ||
                                        messages[idx - 1]?.sender?._id !== msg.sender?._id);

                                return (
                                    <div
                                        key={msg._id || idx}
                                        className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        {!isMe && (
                                            <div className="w-8 shrink-0 flex flex-col justify-end">
                                                {showAvatar ? (
                                                    <Avatar className="w-8 h-8 border border-gray-200">
                                                        <AvatarImage src={msg.sender?.picture} />
                                                        <AvatarFallback>{msg.sender?.fullname?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                ) : <div className="w-8" />}
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                                }`}
                                        >
                                            {!isMe && showAvatar && (
                                                <p className="text-[10px] text-gray-400 mb-1 font-semibold">
                                                    {msg.sender?.fullname} {msg.sender?.role === 'teacher' ? '(Teacher)' : ''}
                                                </p>
                                            )}
                                            <p>{msg.message}</p>
                                            <p
                                                className={`text-[10px] mt-1 text-right ${isMe ? "text-indigo-200" : "text-gray-400"
                                                    }`}
                                            >
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
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
