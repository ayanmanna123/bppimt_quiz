import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Reply, Pin, Edit2, Trash2, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ViewersModal from "./ViewersModal";

const MessageBubble = ({
    message,
    isMe,
    onReply,
    onReact,
    showAvatar,
    showSenderName,
    onPin,
    onEdit,
    onDelete
}) => {
    const [isViewersOpen, setIsViewersOpen] = React.useState(false);
    // Helper to render mentions
    const renderContent = (text, mentions) => {
        if (!mentions || mentions.length === 0) return text;

        // Simple replacement for display (can be improved with better parsing)
        let content = text;
        mentions.forEach(m => {
            content = content.replace(new RegExp(`@${m.fullname}`, 'g'), `<span class="text-indigo-600 font-bold">@${m.fullname}</span>`);
        });

        return <span dangerouslySetInnerHTML={{ __html: content }} />;
    };

    return (
        <div className={`group flex gap-3 ${isMe ? "justify-end" : "justify-start"} mb-2`}>
            {/* Avatar (Left) */}
            {!isMe && (
                <div className="w-8 shrink-0 flex flex-col justify-end">
                    {showAvatar ? (
                        <Avatar className="w-8 h-8 border border-slate-200">
                            <AvatarImage src={message.sender?.picture} />
                            <AvatarFallback>{message.sender?.fullname?.[0]}</AvatarFallback>
                        </Avatar>
                    ) : <div className="w-8" />}
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                {/* Sender Name */}
                {!isMe && showSenderName && (
                    <span className="text-xs text-slate-500 ml-1 mb-1">
                        {message.sender?.fullname} {message.sender?.role === 'teacher' && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">Teacher</span>}
                    </span>
                )}

                {/* Reply Context */}
                {message.replyTo && (
                    <div className={`text-xs text-slate-500 mb-1 px-2 border-l-2 ${isMe ? "border-indigo-400 text-right" : "border-slate-400 text-left"}`}>
                        <span className="font-semibold">Replying to {message.replyTo.sender?.fullname}: </span>
                        <span className="italic truncate block decoration-slate-400">{message.replyTo.message?.substring(0, 30)}...</span>
                    </div>
                )}

                {/* Pinned Indicator */}
                {message.isPinned && (
                    <div className="flex items-center gap-1 text-[10px] text-indigo-500 mb-1 font-semibold">
                        <Pin className="w-3 h-3 fill-current" /> Pinned
                    </div>
                )}

                {/* Message Bubble */}
                <div className={`relative px-4 py-2 shadow-sm ${isMe
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm"
                    }`}>
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 flex flex-col gap-2">
                            {message.attachments.map((att, i) => (
                                att.type === 'image' ? (
                                    <img key={i} src={att.url} alt="attachment" className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(att.url, '_blank')} />
                                ) : att.type === 'audio' ? (
                                    <div key={i} className="flex items-center gap-2 min-w-[200px] bg-white/10 p-1 rounded-lg">
                                        <audio
                                            controls
                                            src={att.url}
                                            className="h-8 w-full max-w-[240px] rounded"
                                        />
                                    </div>
                                ) : (
                                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs underline bg-black/10 p-1 rounded">
                                        View Attachment
                                    </a>
                                )
                            ))}
                        </div>
                    )}

                    {/* Text Content */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {renderContent(message.message, message.mentions)}
                    </p>

                    {/* Timestamp */}
                    <span className={`text-[9px] block mt-1 text-right ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className={`absolute -bottom-3 ${isMe ? "left-0" : "right-0"} flex gap-1`}>
                            {message.reactions.map((r, i) => (
                                <span key={i} className="text-xs bg-white shadow-sm rounded-full px-1 border border-slate-100" title={r.user?.fullname}>
                                    {r.emoji}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons (Hover) */}
                    <div className={`absolute top-0 ${isMe ? "-left-16" : "-right-16"} hidden group-hover:flex items-center gap-1 bg-white/80 backdrop-blur rounded-full px-2 py-1 shadow-sm border border-slate-100 transition-all opacity-0 group-hover:opacity-100`}>
                        <button onClick={() => onReply(message)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors" title="Reply">
                            <Reply className="w-3 h-3" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-yellow-500 transition-colors" title="React">
                                    <Smile className="w-3 h-3" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isMe ? "end" : "start"} className="flex flex-col gap-1 p-1 min-w-[120px]">
                                <DropdownMenuItem onClick={() => onReply(message)} className="cursor-pointer gap-2">
                                    <Reply className="w-4 h-4" /> Reply
                                </DropdownMenuItem>

                                {/* Pin Option (Teacher Only) */}
                                {onPin && (
                                    <DropdownMenuItem onClick={() => onPin(message._id)} className="cursor-pointer gap-2">
                                        <span className="text-xs">📌</span> {message.isPinned ? "Unpin" : "Pin"}
                                    </DropdownMenuItem>
                                )}

                                {/* Edit/Delete Options (Owner Only) */}
                                {isMe && (
                                    <>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <DropdownMenuItem onClick={() => onEdit && onEdit(message)} className="cursor-pointer gap-2">
                                            <Edit2 className="w-3 h-3" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete && onDelete(message._id)} className="cursor-pointer gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {isMe && (
                                    <DropdownMenuItem onClick={() => setIsViewersOpen(true)} className="cursor-pointer gap-2">
                                        <Eye className="w-3 h-3" /> Seen by
                                    </DropdownMenuItem>
                                )}

                                <div className="h-px bg-slate-100 my-1" />

                                <div className="flex justify-between px-2 py-1">
                                    {["👍", "❤️", "😂", "😮"].map(emoji => (
                                        <button key={emoji} onClick={() => onReact(message._id, emoji)} className="hover:scale-110 transition-transform">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <ViewersModal
                    messageId={message._id}
                    isOpen={isViewersOpen}
                    onClose={() => setIsViewersOpen(false)}
                />
            </div>
        </div>
    );
};

export default MessageBubble;
