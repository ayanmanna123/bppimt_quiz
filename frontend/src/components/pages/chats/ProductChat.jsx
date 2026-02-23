import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreVertical, ShoppingBag, ArrowLeft, Loader2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from '../../chat/MessageBubble';
import ChatInput from '../../chat/ChatInput';
import TypingIndicator from '../../chat/TypingIndicator';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import { Input } from "@/components/ui/input";

const ProductChat = ({
    chat,
    messages,
    loadingMessages,
    user,
    replyTo,
    setReplyTo,
    editingMessage,
    setEditingMessage,
    typingUsers,
    onSendMessage,
    onTyping,
    onUpdateMessage,
    onDeleteMessage,
    onReact,
    onClose,
    messagesEndRef
}) => {
    const { getAccessTokenSilently } = useAuth0();
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const messageRefs = useRef({});

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            const token = await getAccessTokenSilently();
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/search/${chat._id}?query=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSearchResults(data.messages);
                if (data.messages.length > 0) setCurrentSearchIndex(0);
                else setCurrentSearchIndex(-1);
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
            el.classList.add("bg-yellow-200", "dark:bg-yellow-900", "p-1", "rounded", "transition-all");
            setTimeout(() => el.classList.remove("bg-yellow-200", "dark:bg-yellow-900", "p-1", "rounded"), 3000);
        }
    };

    useEffect(() => {
        if (currentSearchIndex >= 0 && searchResults[currentSearchIndex]) {
            jumpToMessage(searchResults[currentSearchIndex]._id);
        }
    }, [currentSearchIndex, searchResults]);

    // Mark messages as read when chat opens or new messages arrive
    useEffect(() => {
        const markAsRead = async () => {
            if (!chat?._id) return;
            try {
                const token = await getAccessTokenSilently();
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/store/message/read/${chat._id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Failed to mark store messages as read", error);
            }
        };
        markAsRead();
    }, [chat?._id, getAccessTokenSilently, messages]);
    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 relative transition-colors">
            {/* Chat Header */}
            <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm z-10 shrink-0 transition-colors">
                {!showSearch ? (
                    <>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden -ml-2"
                                onClick={onClose}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <Avatar className="w-10 h-10 border border-slate-100 cursor-pointer">
                                <AvatarImage src={chat.avatar} />
                                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                    {chat.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="cursor-pointer">
                                <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{chat.name}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{chat.type} Chat</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setShowSearch(true)}>
                                <Search className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <ShoppingBag className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="relative flex-1">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isSearching ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                            <form onSubmit={handleSearch}>
                                <Input
                                    placeholder="Search in chat..."
                                    className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-9 rounded-full focus-visible:ring-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </form>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2">
                                    {currentSearchIndex + 1}/{searchResults.length}
                                </span>
                                <div className="flex">
                                    <Button size="icon" variant="ghost" className="h-7 w-6 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" onClick={() => setCurrentSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length)}>
                                        <ChevronUp className="w-4 h-4 text-slate-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-6 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" onClick={() => setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length)}>
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" onClick={() => {
                            setShowSearch(false);
                            setSearchTerm("");
                            setSearchResults([]);
                            setCurrentSearchIndex(-1);
                        }}>
                            <X className="w-5 h-5 text-slate-500" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div
                className={`flex-1 overflow-hidden relative transition-colors ${!user?.chatBackground ? "bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f9640.png')] bg-repeat bg-opacity-5 dark:bg-opacity-10" : ""}`}
                style={user?.chatBackground ? {
                    backgroundImage: `url(${user.chatBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                } : {}}
            >
                <div className={`absolute inset-0 transition-colors ${user?.chatBackground ? "bg-black/10 dark:bg-black/20" : "bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-[1px]"}`}></div>


                <div className="relative h-full flex flex-col">
                    <ScrollArea className="h-full p-4">
                        {loadingMessages ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1 pb-2 max-w-5xl mx-auto">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender?._id === user?._id;
                                    const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;

                                    return (
                                        <div key={msg._id || idx} ref={el => messageRefs.current[msg._id] = el}>
                                            <MessageBubble
                                                message={msg}
                                                isMe={isMe}
                                                showAvatar={showAvatar}
                                                showSenderName={false}
                                                onReply={() => setReplyTo(msg)}
                                                onReact={(emoji) => onReact(msg._id, emoji)}
                                                onEdit={(msg) => setEditingMessage(msg)}
                                                onDelete={(id) => onDeleteMessage(id)}
                                                searchTerm={searchTerm}
                                            />
                                        </div>
                                    );
                                })}
                                <TypingIndicator typingUsers={typingUsers} />
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-800 transition-colors">
                <ChatInput
                    onSendMessage={onSendMessage}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    onTyping={onTyping}
                    editingMessage={editingMessage}
                    onUpdateMessage={onUpdateMessage}
                    onCancelEdit={() => setEditingMessage(null)}
                />
            </div>
        </div>
    );
};

export default ProductChat;
