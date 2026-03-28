import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import { generateToken, messaging } from '../firebase-config';
import { onMessage } from "firebase/messaging";

const PushNotificationManager = ({ showButton = true, inline = false }) => {
    const { user, getAccessTokenSilently } = useAuth0();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [token, setToken] = useState('');
    const [isPersistent, setIsPersistent] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const setupNotifications = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    // Check if already granted
                    if (Notification.permission === 'granted') {
                        const fetchedToken = await generateToken();
                        if (fetchedToken) {
                            setToken(fetchedToken);
                            setIsSubscribed(true);
                            // Sync with backend if logged in
                            if (user?.sub) {
                                syncTokenWithBackend(fetchedToken);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Failed to setup notifications', err);
                }
            }
        };

        setupNotifications();
        checkPersistence();
        checkInstallationStatus();

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Received foreground message:', payload);
            
            // Show toast for foreground message
            toast(payload.notification?.title || 'Notification', {
                description: payload.notification?.body || 'New message received',
                icon: '🔔',
            });

            // Trigger browser notification in foreground (Test project behavior)
            if (payload.notification) {
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: "/bppimt.svg"
                });
            }
        });

        return () => unsubscribe();
    }, [user]);

    const syncTokenWithBackend = async (fcmToken) => {
        try {
            const token = await getAccessTokenSilently();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notifications/subscribe`, {
                fcmToken,
                userId: user.sub
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Token synced with backend.");
        } catch (error) {
            console.error("Error syncing token", error);
        }
    };

    const checkInstallationStatus = () => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        setIsStandalone(!!standalone);
    };

    const checkPersistence = async () => {
        if (navigator.storage && navigator.storage.persisted) {
            const persisted = await navigator.storage.persisted();
            setIsPersistent(persisted);
        }
    };

    const requestPersistence = async () => {
        if (navigator.storage && navigator.storage.persist) {
            const persisted = await navigator.storage.persist();
            setIsPersistent(persisted);
            if (persisted) {
                toast.success("Storage made persistent!");
            } else {
                toast.info("Could not enable persistent storage.");
            }
        }
    };

    const subscribeToPush = async () => {
        setLoading(true);
        try {
            const fetchedToken = await generateToken();
            if (fetchedToken) {
                setToken(fetchedToken);
                setIsSubscribed(true);
                if (user?.sub) {
                    await syncTokenWithBackend(fetchedToken);
                }
                toast.success("Notifications enabled successfully!");
            } else {
                toast.error("Permission denied or failed to get token.");
            }
        } catch (error) {
            console.error("Error subscribing to push:", error);
            toast.error("Failed to enable notifications.");
        } finally {
            setLoading(false);
        }
    };

    const sendTestNotification = async () => {
        if (!user?.sub) {
            toast.error("Please log in first.");
            return;
        }
        try {
            const auth0Token = await getAccessTokenSilently();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notifications/send`, {
                userId: user.sub,
                title: "Test Notification",
                message: "Working exactly like the test project! 🚀"
            }, {
                headers: {
                    Authorization: `Bearer ${auth0Token}`
                }
            });
            toast.success("Test notification request sent!");
        } catch (error) {
            console.error("Error sending test notification:", error);
            toast.error("Failed to send test push.");
        }
    };

    if (!showButton) return null;

    return (
        <div className={inline ? "space-y-4" : "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"}>
            {isSubscribed && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-xs transition-all animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                        <span>Notification Status</span>
                        <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded uppercase">Active</span>
                    </h4>
                    
                    {!isStandalone && (
                        <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] text-amber-800 dark:text-amber-200">
                            💡 Install app for better background delivery.
                        </div>
                    )}

                    <div className="space-y-2 mt-4">
                        {!isPersistent && (
                            <button
                                onClick={requestPersistence}
                                className="w-full text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition"
                            >
                                🔒 Optimize Reliability
                            </button>
                        )}
                        
                        <button
                            onClick={sendTestNotification}
                            className="w-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg hover:bg-slate-200 transition"
                        >
                            📲 Send Test Push
                        </button>

                        <button
                            onClick={() => setShowGuide(!showGuide)}
                            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline py-1"
                        >
                            {showGuide ? "Hide Guide" : "Background delivery help?"}
                        </button>
                    </div>

                    {showGuide && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[10px] text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30">
                            <p className="font-bold mb-1">Android Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Allow background activity in App Info</li>
                                <li>Disable battery optimization</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
            
            {!isSubscribed && (
                <button
                    onClick={subscribeToPush}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-xl hover:bg-blue-700 transition flex items-center gap-2 font-bold disabled:opacity-50"
                >
                    <span>{loading ? "Enabling..." : "Enable Notifications"}</span>
                    {!loading && <span className="text-lg">🔔</span>}
                </button>
            )}
        </div>
    );
};

export default PushNotificationManager;
