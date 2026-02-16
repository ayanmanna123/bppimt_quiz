import React from 'react';
import { useSelector } from 'react-redux';
import {
    MessageCircle, Search, MoreVertical,
    Users, Hash, ShoppingBag, Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import NotificationDropdown from '../shared/NotificationDropdown';
import { format } from "date-fns";

// Custom Hook
import useAllChats from '../../hooks/useAllChats';

// Sub Components
import ProductChat from './chats/ProductChat';
import DMChat from './chats/DMChat';
import CommunityChat from './chats/CommunityChat';
import SubjectChat from './chats/SubjectChat';
import StudyRoomChat from './chats/StudyRoomChat';

const AllChats = () => {
    const { usere: user } = useSelector(state => state.auth);
    const {
        chats,
        loading,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        onlineUsers,
        selectedChat,
        isMobileChatOpen,
        setIsMobileChatOpen,
        setSelectedChat,
        // For ProductChat
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
        handleDeleteMessage
    } = useAllChats();

    // --- Helpers ---

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
        if (chat.lastMessage) {
            const prefix = chat.senderName && chat.type !== 'store' ? `${chat.senderName}: ` : '';
            return (
                <span className="text-slate-500">
                    {prefix}{chat.lastMessage}
                </span>
            );
        }

        // Fallback subtitles
        if (chat.type === 'store') return `Product: ${chat.product?.title || 'Item'}`;
        if (chat.type === 'subject') return chat.code || 'Course';
        if (chat.type === 'study-room') return `${chat.members || 0} Members`;
        if (chat.type === 'dm') return 'Start a conversation';
        return 'All Community';
    };

    const formatChatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const isToday = date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        return isToday ? format(date, 'h:mm a') : format(date, 'MMM d');
    };

    const filteredChats = chats.filter(chat => {
        // 1. Search Filter
        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Tab Filter
        let matchesTab = true;
        if (activeTab === 'unread') {
            matchesTab = chat.unreadCount > 0;
        } else if (activeTab === 'groups') {
            matchesTab = ['subject', 'study-room', 'global'].includes(chat.type);
        } else if (activeTab === 'store') {
            matchesTab = chat.type === 'store';
        }

        return matchesSearch && matchesTab;
    });

    const renderChatContent = () => {
        if (!selectedChat) {
            return (
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
            );
        }

        const handleClose = () => {
            setSelectedChat(null);
            setIsMobileChatOpen(false);
        };

        switch (selectedChat.type) {
            case 'global':
                return <CommunityChat chat={selectedChat} onClose={handleClose} />;
            case 'subject':
                return <SubjectChat chat={selectedChat} onClose={handleClose} />;
            case 'study-room':
                return <StudyRoomChat chat={selectedChat} onClose={handleClose} />;
            case 'dm':
                return <DMChat chat={selectedChat} onClose={handleClose} />;
            case 'store':
                return (
                    <ProductChat
                        chat={selectedChat}
                        messages={messages}
                        loadingMessages={loadingMessages}
                        user={user}
                        replyTo={replyTo}
                        setReplyTo={setReplyTo}
                        editingMessage={editingMessage}
                        setEditingMessage={setEditingMessage}
                        typingUsers={typingUsers}
                        onSendMessage={handleSendMessage}
                        onTyping={handleTyping}
                        onUpdateMessage={handleUpdateMessage}
                        onDeleteMessage={handleDeleteMessage}
                        onClose={handleClose}
                        messagesEndRef={messagesEndRef}
                    />
                );
            default:
                // Fallback to Community or Generic if unknown
                return <CommunityChat chat={selectedChat} onClose={handleClose} />;
        }
    };

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

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
                    {['All', 'Unread', 'Groups', 'Store'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap
                                ${activeTab === tab.toLowerCase() || (activeTab === 'all' && tab === 'All')
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filteredChats.map(chat => {
                                const isOnline = chat.type === 'dm' && onlineUsers.some(u => u._id === chat.friendId);
                                return (
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
                                                    <span className={`text-[10px] shrink-0 ${chat.unreadCount > 0 ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                                                        {formatChatTime(chat.timestamp)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 truncate flex items-center gap-2">
                                                {chat.type === 'dm' && (
                                                    <span className={`text-[10px] font-bold ${isOnline ? 'text-green-500' : 'text-slate-400'}`}>
                                                        {isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                )}
                                                <span className="truncate">{getChatSubtitle(chat)}</span>
                                            </p>
                                        </div>

                                        {chat.unreadCount > 0 && (
                                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

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
                {renderChatContent()}
            </div>
        </div>
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
