import React from 'react';
import ChatWindow from '../../chat/ChatWindow';

const MatchChat = ({ chat, onClose }) => {
    return (
        <ChatWindow
            subjectId={chat._id}
            subjectName={chat.name}
            isOverlay={false}
            onClose={onClose}
            type="match"
            initialTargetUserId={chat.friendId}
        />
    );
};

export default MatchChat;
