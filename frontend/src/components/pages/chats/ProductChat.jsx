import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreVertical, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from '../../chat/MessageBubble';
import ChatInput from '../../chat/ChatInput';
import TypingIndicator from '../../chat/TypingIndicator';

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
    onClose,
    messagesEndRef
}) => {
    return (
        <div className="flex flex-col h-full bg-slate-100 relative">
            {/* Chat Header */}
            <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10 shrink-0">
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
                        <h2 className="font-bold text-slate-900 leading-tight">{chat.name}</h2>
                        <p className="text-xs text-slate-500 capitalize">{chat.type} Chat</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-slate-500">
                        <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-500">
                        <ShoppingBag className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-500">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden relative bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f9640.png')] bg-repeat bg-opacity-5">
                <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-[1px]"></div>

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
                                        <MessageBubble
                                            key={msg._id || idx}
                                            message={msg}
                                            isMe={isMe}
                                            showAvatar={showAvatar}
                                            showSenderName={false}
                                            onReply={() => setReplyTo(msg)}
                                            onEdit={(msg) => setEditingMessage(msg)}
                                            onDelete={(id) => onDeleteMessage(id)}
                                        />
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
            <div className="bg-white p-3 border-t border-slate-200">
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
