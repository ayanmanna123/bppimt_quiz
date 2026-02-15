import React from 'react';
import ChatWindow from '../../chat/ChatWindow';

const StudyRoomChat = ({ chat, onClose }) => {
    return (
        <ChatWindow
            subjectId={chat._id}
            subjectName={chat.name}
            isOverlay={false}
            onClose={onClose}
            type="study-room"
        />
    );
};

export default StudyRoomChat;
