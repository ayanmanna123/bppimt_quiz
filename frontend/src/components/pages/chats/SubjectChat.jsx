import React from 'react';
import ChatWindow from '../../chat/ChatWindow';

const SubjectChat = ({ chat, onClose }) => {
    return (
        <ChatWindow
            subjectId={chat._id}
            subjectName={chat.name}
            isOverlay={false}
            onClose={onClose}
            type="subject"
        />
    );
};

export default SubjectChat;
