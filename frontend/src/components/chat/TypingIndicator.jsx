import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
    const getTypingText = () => {
        if (!typingUsers || typingUsers.length === 0) return null;

        if (typingUsers.length === 1) {
            return `${typingUsers[0]} is typing...`;
        }
        if (typingUsers.length === 2) {
            return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
        }
        if (typingUsers.length === 3) {
            return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers[2]} are typing...`;
        }
        return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} others are typing...`;
    };

    const text = getTypingText();
    if (!text) return null;

    return (
        <div className="flex items-center gap-1.5 px-4 py-1 animate-pulse">
            <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium italic">
                {text}
            </span>
        </div>
    );
};

export default TypingIndicator;
