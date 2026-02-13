import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, Trash2, X, BookOpen, GraduationCap, MessageSquare, ClipboardList, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
    const navigate = useNavigate();

    const getIcon = () => {
        switch (notification.type) {
            case 'quiz': return <GraduationCap className="h-4 w-4 text-purple-500" />;
            case 'subject': return <BookOpen className="h-4 w-4 text-blue-500" />;
            case 'chat': return <MessageSquare className="h-4 w-4 text-green-500" />;
            case 'assignment': return <ClipboardList className="h-4 w-4 text-orange-500" />;
            case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-rose-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            default: return <Info className="h-4 w-4 text-slate-500" />;
        }
    };

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkRead(notification._id);
        }

        // Navigate based on type
        if (notification.type === 'quiz' && notification.relatedId) {
            if (notification.onModel === 'Quiz') navigate(`/quiz`);
            else if (notification.onModel === 'Result') navigate(`/result`);
        } else if (notification.type === 'subject') {
            navigate(`/dashboard`);
        } else if (notification.type === 'note' && notification.relatedId) {
            navigate(`/dashboard`); // Fallback until deep link is stable
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
            <div className="flex justify-between items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <p className={cn("text-xs leading-relaxed font-medium", notification.isRead ? "text-slate-600" : "text-slate-900")}>
                        {notification.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
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
    const { notifications, unreadCount, markAsRead, deleteNotification, loading, pagination, fetchNotifications } = useNotification();

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
            <PopoverContent className="w-80 sm:w-96 p-0 mr-4 overflow-hidden border-0 shadow-2xl" align="end">
                <div className="flex flex-col h-[500px]">
                    <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-slate-800">Notifications</h4>
                            {unreadCount > 0 && (
                                <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[11px] h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => markAsRead('all')}
                                >
                                    Mark all as read
                                </Button>
                            )}
                            {notifications.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[11px] h-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => deleteNotification('all')}
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4">
                            {loading && notifications.length === 0 ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex gap-3 p-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Bell className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h5 className="font-semibold text-slate-900">All caught up!</h5>
                                    <p className="text-xs text-slate-500 mt-1">No new notifications for you.</p>
                                </div>
                            ) : (
                                <>
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

                                    {pagination.hasMore && (
                                        <Button
                                            variant="ghost"
                                            className="w-full mt-4 text-xs text-blue-600 hover:bg-blue-50 font-medium"
                                            onClick={() => fetchNotifications(pagination.page + 1, true)}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                                    <span>Loading...</span>
                                                </div>
                                            ) : (
                                                "View previous notifications"
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-3 border-t bg-slate-50 text-center">
                        <p className="text-[10px] text-slate-400">Stay updated with your latest activities</p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationDropdown;
