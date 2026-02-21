import React from 'react';
import ChatWindow from '../../chat/ChatWindow';

const DMChat = ({ chat, onClose }) => {
    return (
        <ChatWindow
            subjectId={chat._id}
            subjectName={chat.name}
            isOverlay={false}
            onClose={onClose}
            type="dm"
            initialTargetUserId={chat.friendId}
        />
    );
};

export default DMChat;
