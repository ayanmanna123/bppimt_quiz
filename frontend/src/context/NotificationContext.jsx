import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from './SocketContext';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Howl } from 'howler';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { usere } = useSelector((store) => store.auth);
    const socket = useSocket();
    const { getAccessTokenSilently } = useAuth0();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Sound effect
    const notificationSound = new Howl({
        src: ['/notification.mp3']
    });

    const fetchNotifications = async () => {
        if (!usere) return;
        try {
            setLoading(true);
            const token = await getAccessTokenSilently();
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/notifications`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = await getAccessTokenSilently();
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/notifications/${id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Optimistic update
            if (id === 'all') {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            } else {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            toast.error("Failed to update notification");
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = await getAccessTokenSilently();
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/notifications/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNotifications(prev => prev.filter(n => n._id !== id));
            // Recalculate unread count if needed, though usually we delete read ones? 
            // If deleting unread, decrement count
            const isUnread = notifications.find(n => n._id === id)?.isRead === false;
            if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (error) {
            console.error("Failed to delete notification:", error);
            toast.error("Failed to delete notification");
        }
    }

    useEffect(() => {
        if (usere) {
            fetchNotifications();
        }
    }, [usere]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Play sound and show toast
            notificationSound.play();
            toast.info(notification.message);
        };

        socket.on("newNotification", handleNewNotification);

        return () => {
            socket.off("newNotification", handleNewNotification);
        };
    }, [socket]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            markAsRead,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
