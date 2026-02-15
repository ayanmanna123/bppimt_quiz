import React from 'react';
import ChatWindow from '../../chat/ChatWindow';

const CommunityChat = ({ chat, onClose }) => {
    return (
        <ChatWindow
            subjectId={chat._id}
            subjectName={chat.name}
            isOverlay={false}
            onClose={onClose}
            type="global"
        />
    );
};

export default CommunityChat;
