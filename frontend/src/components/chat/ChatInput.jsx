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

const ChatInput = ({ onSendMessage, onTyping, replyTo, onCancelReply }) => {
    const [message, setMessage] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const { getAccessTokenSilently } = useAuth0();

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else {
            onTyping();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Immediately upload logic or wait for send. 
        // Better UX to upload first then send message with link.

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

                // Stop all tracks
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
            // Create a file from blob
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
                type: 'audio', // res.data.type should be 'audio' now from backend
                publicId: res.data.publicId
            });

        } catch (error) {
            console.error("Audio upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    // Cleanup timer on unmount
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

        // Extract mentions (naive)
        // const mentions = ... (This logic currently handled in parent or here? 
        // Parent handled it in global chat. We should pass mentions or handle text processing here)
        // For now, allow parent to parse text if needed, or pass text as is.
        // Let's pass the raw text and attachment separate.

        onSendMessage(message, attachment);
        setMessage("");
        setAttachment(null);
        if (onCancelReply) onCancelReply();
    };

    return (
        <div className="p-4 bg-white border-t border-slate-100">
            {/* Reply Preview */}
            {replyTo && (
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
                    className="hidden colour-black"
                    accept="image/*"
                    onChange={handleFileSelect}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-indigo-600"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                </Button>

                {/* Mic Button */}
                {!message.trim() && !attachment && (
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
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
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
                    className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:hue-rotate-15 text-white shadow-lg disabled:opacity-50 disabled:shadow-none transition-all p-0 flex items-center justify-center shrink-0"
                >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 fill-current" />}
                </Button>
            </div>
        </div>
    );
};

export default ChatInput;
