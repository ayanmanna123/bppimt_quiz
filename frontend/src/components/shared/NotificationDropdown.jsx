import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkRead(notification._id);
        }

        // Navigate based on type
        if (notification.type === 'quiz' && notification.relatedId) {
            // If url is provided in notification, use it, else fallback
            if (notification.onModel === 'Quiz') navigate(`/quiz`); // Or specific quiz page if route exists like /quiz/start/:id
            else if (notification.onModel === 'Result') navigate(`/reasult`);
        } else if (notification.type === 'subject') {
            navigate(`/dashbord`);
        } else if (notification.type === 'note' && notification.relatedId) {
            // navigate to notes
            navigate(`/subject/notes/${notification.relatedId}`); // This might need subjectId, wait.
            // If the notification doesn't have enough info for deep link, go to module root.
            // Best effort navigation
        } else if (notification.type === 'chat') {
            navigate(notification.url || '/community-chat');
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={cn(
                "p-3 rounded-lg mb-2 transition-colors cursor-pointer group relative border-l-4",
                notification.isRead ? "bg-white border-transparent hover:bg-slate-50" : "bg-blue-50 border-blue-500 hover:bg-blue-100"
            )}
            onClick={handleClick}
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                    <p className={cn("text-sm font-medium", notification.isRead ? "text-slate-700" : "text-slate-900")}>
                        {notification.message}
                    </p>
                    <span className="text-xs text-slate-500 mt-1 block">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                </div>

                <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {!notification.isRead && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkRead(notification._id);
                            }}
                            title="Mark as Read"
                        >
                            <Check className="h-3 w-3" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification._id);
                        }}
                        title="Delete"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, deleteNotification, loading } = useNotification();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-slate-100">
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:bg-blue-50 h-auto py-1 px-2"
                            onClick={() => markAsRead('all')}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px] w-full p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-20">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                            <Bell className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <AnimatePresence mode='popLayout'>
                            {notifications.map(notification => (
                                <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    onMarkRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationDropdown;
