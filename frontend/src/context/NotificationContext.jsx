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
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false
    });

    // Sound effect
    const notificationSound = new Howl({
        src: ['/notification.mp3']
    });

    const fetchNotifications = async (page = 1, append = false) => {
        if (!usere) return;
        try {
            setLoading(true);
            const token = await getAccessTokenSilently();
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/notifications?page=${page}&limit=${pagination.limit}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { notifications: newNotifications, pagination: pagData } = res.data;

            if (append) {
                setNotifications(prev => [...prev, ...newNotifications]);
            } else {
                setNotifications(newNotifications);
            }

            setPagination(pagData);

            // Fetch unread count separately for accuracy or use header/meta if backend provides it
            const countRes = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/notifications/unread-count`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUnreadCount(countRes.data.unreadCount);

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
                window.dispatchEvent(new CustomEvent('notification:mark_all_read'));
            } else {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
                window.dispatchEvent(new CustomEvent('notification:read', { detail: { id } }));
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

            if (id === 'all') {
                setNotifications([]);
                setUnreadCount(0);
                toast.success("All notifications cleared");
            } else {
                const isUnread = notifications.find(n => n._id === id)?.isRead === false;
                setNotifications(prev => prev.filter(n => n._id !== id));
                if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));
            }

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

        const handleNotificationsUpdated = () => {
            fetchNotifications(1);
        };

        socket.on("newNotification", handleNewNotification);
        socket.on("notificationsUpdated", handleNotificationsUpdated);

        return () => {
            socket.off("newNotification", handleNewNotification);
            socket.off("notificationsUpdated", handleNotificationsUpdated);
        };
    }, [socket]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            pagination,
            fetchNotifications,
            markAsRead,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
