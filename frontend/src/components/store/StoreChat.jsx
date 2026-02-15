
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useAuth0 } from "@auth0/auth0-react";
import { MessageCircle, Search } from 'lucide-react';
import { io } from "socket.io-client";
import MessageBubble from '../chat/MessageBubble';
import ChatInput from '../chat/ChatInput';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StoreChat = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const socket = useRef(null);
    const activeConversationRef = useRef(null);
    const { usere: user } = useSelector(state => state.auth); // Accessing auth state and aliasing usere to user
    const [searchTerm, setSearchTerm] = useState("");

    // Keep ref in sync with state for socket callback
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // Socket Initialization
    useEffect(() => {
        if (user) {
            // socket.current = io("http://localhost:5000", { 
            // Better to drive from env if possible, assuming backend is on 5000 based on API calls
            socket.current = io("http://localhost:5000", {
                query: { userId: user._id }
            });

            socket.current.on("newStoreMessage", (data) => {
                const { message, conversationId } = data;

                // Use ref to check active conversation without re-running effect
                if (activeConversationRef.current && activeConversationRef.current._id === conversationId) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }

                // Update conversations list (move to top, update last message)
                setConversations((prevConversations) => {
                    const updatedConversations = prevConversations.map(conv => {
                        if (conv._id === conversationId) {
                            return {
                                ...conv,
                                messages: [...(conv.messages || []), message],
                                lastMessage: message.timestamp
                            };
                        }
                        return conv;
                    });

                    // Sort by last message timestamp (descending)
                    return updatedConversations.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));
                });
            });

            return () => {
                if (socket.current) socket.current.disconnect();
            };
        }
    }, [user]); // Only re-run if user changes

    // Poll for conversations (Keep as fallback or remove? User asked for real-time, polling is distinct. Let's keep it for initial sync safety but increase interval maybe?)
    useEffect(() => {
        fetchConversations();
        // const interval = setInterval(fetchConversations, 10000); // Remove polling since we have sockets
        // return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
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
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/message/${convId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setMessages(data.conversation.messages);
                setActiveConversation(data.conversation);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = async (text, attachment) => {
        if ((!text.trim() && !attachment) || !activeConversation) return;

        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const payload = {
                content: text || "",
                attachments: attachment ? [attachment] : []
            };

            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/store/message/${activeConversation._id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (data.success) {
                setMessages([...messages, data.message]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredConversations = conversations.filter(conv => {
        const otherUser = conv.participants.find(p => p._id !== user?._id);
        const productName = conv.product?.title || "";
        const userName = otherUser?.fullname || "";
        const searchLower = searchTerm.toLowerCase();
        return productName.toLowerCase().includes(searchLower) || userName.toLowerCase().includes(searchLower);
    });

    return (

        <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h1 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-primary" />
                        Messages
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary font-medium"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="divide-y divide-slate-100">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map(conv => {
                                const otherUser = conv.participants.find(p => p._id !== user?._id);
                                const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
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
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                                                        {otherUser?.fullname?.[0]}
                                                    </AvatarFallback>
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
                                                    {lastMsg && (
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(lastMsg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-indigo-600 truncate mb-1 bg-indigo-50 inline-block px-1.5 py-0.5 rounded-sm">
                                                    {conv.product?.title}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {lastMsg ? (
                                                        <>
                                                            {lastMsg.sender === user?._id && <span className="font-bold text-slate-700">You: </span>}
                                                            {lastMsg.content || 'Sent an attachment'}
                                                        </>
                                                    ) : <span className="italic">No messages yet</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-sm font-medium text-slate-500">No conversations found</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
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
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            {messages.length > 0 ? messages.map((msg, idx) => {
                                let sender = msg.sender || { _id: 'unknown', fullname: 'Unknown' };
                                let isMe = false;

                                if (typeof sender === 'string') {
                                    if (sender === user?._id) {
                                        isMe = true;
                                        sender = user;
                                    } else {
                                        const foundParticipant = activeConversation?.participants?.find(p => p._id === sender);
                                        if (foundParticipant) sender = foundParticipant;
                                    }
                                } else {
                                    isMe = sender._id === user?._id;
                                }

                                const normalizedMsg = {
                                    ...msg,
                                    message: msg.content || msg.message,
                                    sender: sender
                                };

                                const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== normalizedMsg.sender?._id;

                                return (
                                    <MessageBubble
                                        key={idx}
                                        message={normalizedMsg}
                                        isMe={isMe}
                                        showAvatar={showAvatar}
                                        showSenderName={showAvatar}
                                        onReply={() => { }}
                                        onReact={() => { }}
                                    />
                                );
                            }) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <p className="text-sm font-medium">Start the conversation!</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="max-w-4xl mx-auto">
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    placeholder={`Message about ${activeConversation.product.title}...`}
                                    onTyping={() => { }}
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
                        <p className="text-slate-500 max-w-sm">Select a conversation from the sidebar to start chatting with buyers or sellers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreChat;

