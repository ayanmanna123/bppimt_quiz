import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Send, Paperclip, Smile, X, Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const ChatInput = ({ onSendMessage, onTyping, replyTo, onCancelReply, editingMessage, onUpdateMessage, onCancelEdit }) => {
    const [message, setMessage] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    // Mention states
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionUsers, setMentionUsers] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0);

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const textareaRef = useRef(null);
    const { getAccessTokenSilently } = useAuth0();

    // Populate input when editing
    useEffect(() => {
        if (editingMessage) {
            setMessage(editingMessage.message);
        } else if (!editingMessage) {
            if (message === editingMessage?.message) setMessage("");
        }
    }, [editingMessage]);

    // Handle Mentions
    useEffect(() => {
        const fetchUsers = async () => {
            if (!mentionQuery) return;
            try {
                const token = await getAccessTokenSilently();
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/search?query=${mentionQuery}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMentionUsers(res.data);
            } catch (error) {
                console.error("Failed to search users", error);
            }
        };

        if (showMentions) {
            const delayDebounceFn = setTimeout(() => {
                fetchUsers();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [mentionQuery, showMentions, getAccessTokenSilently]);

    const handleKeyDown = (e) => {
        if (showMentions) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                // Navigate list support could be added here
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (mentionUsers.length > 0) {
                    insertMention(mentionUsers[0]); // Select first one on Enter
                }
            } else if (e.key === 'Escape') {
                setShowMentions(false);
            }
        } else {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            } else {
                onTyping();
            }
        }
    };

    const handleChange = (e) => {
        const newVal = e.target.value;
        setMessage(newVal);

        const { selectionStart } = e.target;
        setCursorPosition(selectionStart);

        // Detect @
        const textBeforeCursor = newVal.slice(0, selectionStart);
        const lastAt = textBeforeCursor.lastIndexOf('@');

        if (lastAt !== -1) {
            const query = textBeforeCursor.slice(lastAt + 1);
            // Check if there are spaces, usually mentions don't have spaces unless we allow it.
            // Let's assume mentions end at space for query purposes, or allow simple names.
            if (!/\s/.test(query)) {
                setMentionQuery(query);
                setShowMentions(true);
                return;
            }
        }
        setShowMentions(false);
    };

    const insertMention = (user) => {
        const textBeforeCursor = message.slice(0, cursorPosition);
        const lastAt = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = message.slice(cursorPosition);

        const newText = textBeforeCursor.slice(0, lastAt) + `@${user.fullname} ` + textAfterCursor;
        setMessage(newText);
        setShowMentions(false);
        // Reset cursor focus (simple ref focus)
        textareaRef.current?.focus();
    };


    // ... (keep file handling and audio handling same) ...

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            setAttachment({
                url: res.data.url,
                type: res.data.type, // 'image', etc.
                publicId: res.data.publicId
            });

        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                await handleUploadAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleUploadAudio = async (audioBlob) => {
        setUploading(true);
        try {
            const token = await getAccessTokenSilently();
            const formData = new FormData();
            const file = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
            formData.append("file", file);

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            setAttachment({
                url: res.data.url,
                type: 'audio',
                publicId: res.data.publicId
            });

        } catch (error) {
            console.error("Audio upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSend = () => {
        if ((!message.trim() && !attachment) || uploading) return;

        if (editingMessage) {
            onUpdateMessage(editingMessage._id, message);
            setMessage("");
        } else {
            onSendMessage(message, attachment);
            setMessage("");
            setAttachment(null);
            if (onCancelReply) onCancelReply();
        }
    };

    return (
        <div className="p-4 bg-white border-t border-slate-100 relative">
            {/* Mention Popover */}
            {showMentions && mentionUsers.length > 0 && (
                <div className="absolute bottom-full left-4 mb-2 bg-white rounded-lg shadow-xl border border-slate-100 w-64 max-h-48 overflow-y-auto z-50">
                    <div className="p-2 border-b border-slate-50 text-xs font-semibold text-slate-500 bg-slate-50">
                        Suggesting users...
                    </div>
                    {mentionUsers.map(user => (
                        <button
                            key={user._id}
                            onClick={() => insertMention(user)}
                            className="w-full text-left flex items-center gap-2 p-2 hover:bg-indigo-50 transition-colors"
                        >
                            <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700">{user.fullname}</span>
                                <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Edit Preview */}
            {editingMessage && (
                <div className="flex items-center justify-between bg-yellow-50 p-2 rounded-t-lg border-b border-yellow-100 mb-2 border-l-4 border-l-yellow-500">
                    <div className="text-sm">
                        <span className="font-semibold text-yellow-700">Editing Message</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setMessage(""); onCancelEdit(); }} className="h-6 w-6 text-yellow-700 hover:bg-yellow-100">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Reply Preview */}
            {!editingMessage && replyTo && (
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-t-lg border-b border-slate-100 mb-2 border-l-4 border-l-indigo-500">
                    <div className="text-sm">
                        <span className="font-semibold text-indigo-600">Replying to {replyTo.sender?.fullname}</span>
                        <p className="text-slate-500 text-xs truncate max-w-md">{replyTo.message}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCancelReply} className="h-6 w-6">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Attachment Preview */}
            {attachment && (
                <div className="relative inline-block mb-2">
                    <img src={attachment.url} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                    <button
                        onClick={() => setAttachment(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    {uploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg"><Loader2 className="animate-spin w-4 h-4" /></div>}
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* File Button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-indigo-600"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !!editingMessage}
                >
                    <Paperclip className="w-5 h-5" />
                </Button>

                {/* Mic Button */}
                {!message.trim() && !attachment && !editingMessage && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`${isRecording ? "text-red-500 animate-pulse bg-red-50" : "text-slate-400 hover:text-indigo-600"}`}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={uploading}
                    >
                        {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                    </Button>
                )}


                {/* Emoji Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-yellow-500">
                            <Smile className="w-5 h-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-auto p-0 border-none shadow-none">
                        <EmojiPicker
                            onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
                            width={300}
                            height={400}
                        />
                    </PopoverContent>
                </Popover>

                {/* Text Area or Recording UI */}
                <div className="flex-1 relative">
                    {isRecording ? (
                        <div className="flex items-center gap-2 h-full px-4 py-3 bg-red-50 rounded-xl border border-red-100 text-red-600 font-medium">
                            <span className="animate-pulse">● Rec</span>
                            <span>{formatTime(recordingDuration)}</span>
                        </div>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                            className="w-full bg-slate-50 text-slate-700 placeholder:text-slate-400 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none min-h-[48px] max-h-32"
                            rows={1}
                            style={{ height: "auto", minHeight: "48px" }}
                        />
                    )}
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={(!message.trim() && !attachment) || uploading}
                    className={`h-12 w-12 rounded-xl text-white shadow-lg disabled:opacity-50 disabled:shadow-none transition-all p-0 flex items-center justify-center shrink-0 ${editingMessage ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:hue-rotate-15"}`}
                >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingMessage ? <span className="text-xs font-bold">Save</span> : <Send className="w-5 h-5 fill-current" />}
                </Button>
            </div>
        </div>
    );
};

export default ChatInput;
