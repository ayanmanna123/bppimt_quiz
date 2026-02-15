import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Store.css';
import { useSelector } from 'react-redux';
import { useAuth0 } from "@auth0/auth0-react";

const StoreChat = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const { usere: user } = useSelector(state => state.auth); // Accessing auth state and aliasing usere to user

    // Poll for conversations (simple MVP approach)
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // 10s poll
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const fetchMessages = async (convId) => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/message/${convId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setMessages(data.conversation.messages);
                setActiveConversation(data.conversation);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/store/message/${activeConversation._id}`,
                { content: newMessage },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (data.success) {
                setMessages([...messages, data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="store-container chat-layout-container">
            <div className="conversations-list">
                <h3>Messages</h3>
                {conversations.map(conv => {
                    // Determine other participant
                    const otherUser = conv.participants.find(p => p._id !== user?._id);
                    return (
                        <div
                            key={conv._id}
                            className={`conversation-item ${activeConversation?._id === conv._id ? 'active' : ''}`}
                            onClick={() => fetchMessages(conv._id)}
                        >
                            <img src={otherUser?.picture || conv.product?.images[0]} alt="Avatar" className="conv-avatar" />
                            <div className="conv-info">
                                <p className="conv-name">{otherUser?.fullname}</p>
                                <p className="conv-product">{conv.product?.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="chat-window">
                {activeConversation ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <img src={activeConversation.product.images[0]} alt="Product" className="header-product-img" />
                                <div>
                                    <h4>{activeConversation.product.title}</h4>
                                    <span className="price">₹{activeConversation.product.price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="messages-area">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message-bubble ${msg.sender._id === user?._id ? 'my-message' : 'other-message'}`}>
                                    <p>{msg.content}</p>
                                    <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreChat;
