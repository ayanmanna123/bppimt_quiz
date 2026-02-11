import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
    if (!typingUsers || typingUsers.length === 0) return null;

    const text = typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : typingUsers.length === 2
            ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
            : `${typingUsers.length} people are typing...`;

    return (
        <div className="text-xs text-slate-400 italic px-4 py-1 animate-pulse">
            {text}
        </div>
    );
};

export default TypingIndicator;
