import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Reply, Pin, Edit2, Trash2, Eye, Check, CheckCheck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LinkPreview from "./LinkPreview";
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
    onDelete,
    searchTerm
}) => {
    const [isViewersOpen, setIsViewersOpen] = React.useState(false);

    // Helper to render mentions, links, and search highlighting
    const renderContent = (text, mentions, searchTerm) => {
        if (!text) return "";
        let content = text;

        // Escape regex special chars in searchTerm
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Apply search highlighting first
        if (searchTerm && searchTerm.trim()) {
            const escapedSearch = escapeRegExp(searchTerm);
            content = content.replace(new RegExp(`(${escapedSearch})`, 'gi'), '<mark class="bg-yellow-200 text-black rounded px-0.5">$1</mark>');
        }

        // Apply mention highlighting
        if (mentions && mentions.length > 0) {
            mentions.forEach(m => {
                content = content.replace(new RegExp(`@${m.fullname}`, 'g'), `<span class="text-indigo-600 font-bold">@${m.fullname}</span>`);
            });
        }

        // Make URLs clickable
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline decoration-indigo-400 hover:text-indigo-600 transition-colors">${url}</a>`;
        });

        return <span dangerouslySetInnerHTML={{ __html: content }} />;
    };

    const firstUrl = (message.message?.match(/(https?:\/\/[^\s]+)/) || [])[0];

    return (
        <div className={`group flex gap-3 ${isMe ? "justify-end" : "justify-start"} mb-2`}>
            {/* Avatar (Left) */}
            {!isMe && (
                <div className="w-8 shrink-0 flex flex-col justify-end">
                    {showAvatar ? (
                        <div className="relative">
                            <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
                                <AvatarImage src={message.sender?.picture} />
                                <AvatarFallback>{message.sender?.fullname?.[0]}</AvatarFallback>
                            </Avatar>
                            {message.sender?.isOnline && (
                                <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-50 dark:border-slate-800 rounded-full shadow-sm z-10" title="Online" />
                            )}
                            {!message.sender?.isOnline && message.sender?.lastSeen && (
                                <div className="hidden" title={`Last seen: ${new Date(message.sender.lastSeen).toLocaleString()}`} />
                            )}
                        </div>
                    ) : <div className="w-8" />}
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                {/* Sender Name */}
                {!isMe && showSenderName && (
                    <span
                        className="text-xs text-slate-500 dark:text-slate-400 ml-1 mb-1 cursor-default"
                        title={!message.sender?.isOnline && message.sender?.lastSeen ? `Last seen: ${new Date(message.sender.lastSeen).toLocaleString()}` : 'Online'}
                    >
                        {message.sender?.fullname} {message.sender?.role === 'teacher' && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1 rounded">Teacher</span>}
                    </span>
                )}

                {/* Reply Context */}
                {message.replyTo && (
                    <div className={`text-xs text-slate-500 dark:text-slate-400 mb-1 px-2 border-l-2 ${isMe ? "border-indigo-400 text-right" : "border-slate-400 dark:border-slate-600 text-left"}`}>
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
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm"
                    }`}>
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 flex flex-col gap-2">
                            {message.attachments.map((att, i) => (
                                att.type === 'image' ? (
                                    <img key={i} src={att.url} alt="attachment" className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(att.url, '_blank')} />
                                ) : att.type === 'audio' ? (
                                    <div key={i} className="flex items-center gap-2 min-w-[200px] bg-white/10 dark:bg-black/20 p-1 rounded-lg">
                                        <audio
                                            controls
                                            src={att.url}
                                            className="h-8 w-full max-w-[240px] rounded"
                                        />
                                    </div>
                                ) : (
                                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs underline bg-black/10 dark:bg-white/10 p-1 rounded">
                                        View Attachment
                                    </a>
                                )
                            ))}
                        </div>
                    )}

                    {/* Text Content */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {renderContent(message.message, message.mentions, searchTerm)}
                    </p>

                    {/* Rich Link Preview */}
                    {firstUrl && <LinkPreview url={firstUrl} />}

                    {/* Timestamp & Read Receipts */}
                    <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[9px] block ${isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                            message.readBy?.length > 0 ? (
                                <CheckCheck className="w-3 h-3 text-indigo-300" />
                            ) : (
                                <Check className="w-3 h-3 text-indigo-300 opacity-70" />
                            )
                        )}
                    </div>

                    {/* Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className={`absolute -bottom-3 ${isMe ? "left-0" : "right-0"} flex gap-1`}>
                            {message.reactions.map((r, i) => (
                                <span key={i} className="text-xs bg-white dark:bg-slate-800 shadow-sm rounded-full px-1 border border-slate-100 dark:border-slate-700" title={r.user?.fullname}>
                                    {r.emoji}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons (Hover) */}
                    <div className={`absolute top-0 ${isMe ? "-left-16" : "-right-16"} hidden group-hover:flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full px-2 py-1 shadow-sm border border-slate-100 dark:border-slate-800 transition-all opacity-0 group-hover:opacity-100`}>
                        <button onClick={() => onReply(message)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Reply">
                            <Reply className="w-3 h-3" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-yellow-500 transition-colors" title="React">
                                    <Smile className="w-3 h-3" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isMe ? "end" : "start"} className="flex flex-col gap-1 p-1 min-w-[120px] dark:bg-slate-900 dark:border-slate-700">
                                <DropdownMenuItem onClick={() => onReply(message)} className="cursor-pointer gap-2 dark:text-slate-300 dark:focus:bg-slate-800">
                                    <Reply className="w-4 h-4" /> Reply
                                </DropdownMenuItem>

                                {/* Pin Option (Teacher Only) */}
                                {onPin && (
                                    <DropdownMenuItem onClick={() => onPin(message._id)} className="cursor-pointer gap-2 dark:text-slate-300 dark:focus:bg-slate-800">
                                        <span className="text-xs">📌</span> {message.isPinned ? "Unpin" : "Pin"}
                                    </DropdownMenuItem>
                                )}

                                {/* Edit/Delete Options (Owner Only) */}
                                {isMe && (
                                    <>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                        <DropdownMenuItem onClick={() => onEdit && onEdit(message)} className="cursor-pointer gap-2 dark:text-slate-300 dark:focus:bg-slate-800">
                                            <Edit2 className="w-3 h-3" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete && onDelete(message._id)} className="cursor-pointer gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30">
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {isMe && (
                                    <DropdownMenuItem onClick={() => setIsViewersOpen(true)} className="cursor-pointer gap-2 dark:text-slate-300 dark:focus:bg-slate-800">
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
