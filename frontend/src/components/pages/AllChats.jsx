import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    MessageCircle, Search, MoreVertical,
    Users, Hash, ShoppingBag, Loader2,
    BellOff, Bell, Clock, Info, Lock, Heart
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
import MatchChat from './chats/MatchChat';
import CommunityChat from './chats/CommunityChat';
import SubjectChat from './chats/SubjectChat';
import StudyRoomChat from './chats/StudyRoomChat';
import GroupMembersModal from '../chat/GroupMembersModal';

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
        handleTyping,
        handleUpdateMessage,
        handleDeleteMessage,
        handleMuteChat,
        handleUnmuteChat,
        handleSelectChat,
        handleSendMessage
    } = useAllChats();

    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [memberContext, setMemberContext] = useState(null);

    // --- Helpers ---

    const getChatIcon = (type) => {
        switch (type) {
            case 'global': return <MessageCircle className="w-5 h-5" />;
            case 'subject': return <Hash className="w-5 h-5" />;
            case 'study-room': return <Users className="w-5 h-5" />;
            case 'store': return <ShoppingBag className="w-5 h-5" />;
            case 'match': return <Heart className="w-5 h-5 text-pink-500 fill-current" />;
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
        if (chat.type === 'match') return "You matched! Send a message";
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
        } else if (activeTab === 'dating') {
            matchesTab = chat.type === 'match';
        }

        return matchesSearch && matchesTab;
    });

    const renderChatContent = () => {
        if (!selectedChat) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-500 p-8 text-center transition-colors">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                    </div>
                    <h2 className="text-2xl font-light text-slate-700 dark:text-slate-200 mb-2">BPPIMT Stats Web</h2>
                    <p className="max-w-md text-slate-500 dark:text-slate-400">
                        Select a chat to start messaging. Connect with your community, subjects, study rooms, and marketplace.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600">
                        <Lock className="w-3 h-3" />
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
            case 'match':
                return <MatchChat chat={selectedChat} onClose={handleClose} />;
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
        <div className="flex h-[calc(100vh-64px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-500">
            {/* Sidebar / Chat List */}
            <div className={`${isMobileChatOpen ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors`}>
                {/* Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chats</h1>
                        <div className="flex gap-2">
                            <NotificationDropdown />
                            <Button variant="ghost" size="icon" className="rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <Input
                            placeholder="Search or start new chat"
                            className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
                    {['All', 'Unread', 'Groups', 'Store', 'Dating'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap
                                ${activeTab === tab.toLowerCase() || (activeTab === 'all' && tab === 'All')
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredChats.map(chat => {
                                const isOnline = (chat.type === 'dm' || chat.type === 'match') && onlineUsers.some(u => u._id === chat.friendId);
                                return (
                                    <div
                                        key={chat._id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`group flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative
                                        ${selectedChat?._id === chat._id ? 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-l-4 border-l-indigo-500 pl-3' : 'border-l-4 border-l-transparent pl-3'}`}
                                    >
                                        <div className="relative">
                                            <Avatar className="w-12 h-12 border border-slate-100 dark:border-slate-800">
                                                {!(chat.type === 'dm' && user?.blockedUsers?.includes(chat.friendId)) && (
                                                    <AvatarImage src={chat.avatar} />
                                                )}
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                                                    {chat.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm">
                                                <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 text-slate-600 dark:text-slate-400">
                                                    {getChatIcon(chat.type)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    <h3 className={`font-semibold truncate ${selectedChat?._id === chat._id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{chat.name}</h3>
                                                    {chat.isMuted && (
                                                        <BellOff className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                                                    )}
                                                </div>
                                                {chat.timestamp && (
                                                    <span className={`text-[10px] shrink-0 ${chat.unreadCount > 0 ? 'text-emerald-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                                                        {formatChatTime(chat.timestamp)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-2">
                                                {(chat.type === 'dm' || chat.type === 'match') && (
                                                    <span className={`text-[10px] font-bold ${isOnline ? 'text-green-500' : 'text-slate-400 dark:text-slate-600'}`}>
                                                        {isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                )}
                                                <span className="truncate">{getChatSubtitle(chat)}</span>
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 dark:border-slate-800 dark:bg-slate-900">
                                                    <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-2">
                                                        Notifications
                                                    </DropdownMenuLabel>
                                                    {chat.isMuted ? (
                                                        <DropdownMenuItem
                                                            onClick={(e) => { e.stopPropagation(); handleUnmuteChat(chat._id); }}
                                                            className="flex items-center gap-2 text-indigo-600 focus:text-indigo-600 focus:bg-indigo-50 dark:focus:bg-indigo-900/20 cursor-pointer py-2.5 rounded-lg mx-1"
                                                        >
                                                            <Bell className="w-4 h-4" />
                                                            <span>Unmute Chat</span>
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); handleMuteChat(chat._id, 1); }}
                                                                className="flex items-center gap-2 focus:bg-slate-50 dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer py-2.5 rounded-lg mx-1"
                                                            >
                                                                <Clock className="w-4 h-4 text-slate-400" />
                                                                <span>Mute for 1 hour</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); handleMuteChat(chat._id, 8); }}
                                                                className="flex items-center gap-2 focus:bg-slate-50 dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer py-2.5 rounded-lg mx-1"
                                                            >
                                                                <Clock className="w-4 h-4 text-slate-400" />
                                                                <span>Mute for 8 hours</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); handleMuteChat(chat._id, 24); }}
                                                                className="flex items-center gap-2 focus:bg-slate-50 dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer py-2.5 rounded-lg mx-1"
                                                            >
                                                                <Clock className="w-4 h-4 text-slate-400" />
                                                                <span>Mute for 24 hours</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => { e.stopPropagation(); handleMuteChat(chat._id, 'always'); }}
                                                                className="flex items-center gap-2 focus:bg-slate-50 dark:focus:bg-slate-800 dark:text-slate-300 cursor-pointer py-2.5 rounded-lg mx-1"
                                                            >
                                                                <BellOff className="w-4 h-4 text-slate-400" />
                                                                <span>Mute Always</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
                                                    {['subject', 'study-room', 'global'].includes(chat.type) && (
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setMemberContext(chat);
                                                                setIsMembersModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 cursor-pointer py-2.5 rounded-lg mx-1"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                            <span>Group Members</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem className="flex items-center gap-2 text-slate-600 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer py-2.5 rounded-lg mx-1">
                                                        <Info className="w-4 h-4 text-slate-400" />
                                                        <span>Chat Info</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            {chat.unreadCount > 0 && (
                                                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                                    {chat.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* User Profile / Status (Bottom Sidebar) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-slate-800">
                        <AvatarImage src={user?.picture} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.fullname}</p>
                        <p className="text-xs text-emerald-500 font-medium">Online</p>
                    </div>
                </div>
            </div>

            {/* Chat Area (Responsive) */}
            <div className={`${isMobileChatOpen ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-100 dark:bg-slate-950/50 relative overflow-hidden`}>
                {renderChatContent()}
            </div>

            <GroupMembersModal
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
                subjectId={memberContext?._id}
                type={memberContext?.type}
                groupName={memberContext?.name}
            />
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
