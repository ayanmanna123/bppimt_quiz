import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";

const PushNotificationManager = ({ showButton = true, inline = false }) => {
    const { user, getAccessTokenSilently } = useAuth0();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isPersistent, setIsPersistent] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [periodicSyncSupported, setPeriodicSyncSupported] = useState(false);

    // ... (existing code)

    // VAPID Public Key from Backend (Should be in env, but for now hardcoded or fetched)
    // REPLACEME: Use the Public Key generated earlier
    const VAPID_PUBLIC_KEY = "BI9CAjZwb3pUMWhVxcwKNQWOF8NZepe3wXuvne7Jr7vtUJ1H-ZtN98OcZcS-a9oNtcTpKi9yt4f8OHdPZHT-rHw";

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            checkSubscription();
        }
        checkPersistence();
        checkInstallationStatus();
        checkPeriodicSyncSupport();
    }, []);

    const checkInstallationStatus = () => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        setIsStandalone(!!standalone);
    };

    const checkPeriodicSyncSupport = async () => {
        if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
            setPeriodicSyncSupported(true);
            const registration = await navigator.serviceWorker.ready;
            try {
                const tags = await registration.periodicSync.getTags();
                if (!tags.includes('notification-heartbeat')) {
                    const status = await navigator.permissions.query({
                        name: 'periodic-background-sync',
                    });
                    if (status.state === 'granted') {
                        await registration.periodicSync.register('notification-heartbeat', {
                            minInterval: 24 * 60 * 60 * 1000,
                        });
                        console.log('Periodic sync registered!');
                    }
                }
            } catch (err) {
                console.warn('Periodic Sync could not be registered:', err);
            }
        }
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
                toast.success("Storage made persistent. This helps notifications work better!");
            } else {
                toast.info("Could not enable persistent storage. You may need to bookmark the app or add it to home screen first.");
            }
        }
    };

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration) {
                if (Notification.permission === 'granted') {
                    console.log("Permission granted, ensuring token is synced...");
                    const { requestForToken } = await import('../firebase-config');
                    const fcmToken = await requestForToken(registration);
                    if (fcmToken && user?.sub) {
                        const token = await getAccessTokenSilently();
                        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notifications/subscribe`, {
                            fcmToken,
                            userId: user.sub
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log("Token synced on mount.");
                    }
                    setIsSubscribed(true);
                }
            }
        } catch (error) {
            console.error("Error checking/syncing subscription", error);
        }
    };


    const subscribeToPush = async () => {
        try {
            console.log("1. Requesting notification permission...");
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast.error("Permission denied. Please enable notifications in your browser.");
                return;
            }

            console.log("2. Importing Firebase Messaging...");
            const { messaging, requestForToken } = await import('../firebase-config');
            const registration = await navigator.serviceWorker.ready;

            console.log("3. Getting FCM Token...");
            const fcmToken = await requestForToken(registration);

            if (!fcmToken) {
                toast.error("Failed to get push token. Please try again.");
                return;
            }

            console.log("4. Sending token to backend...");
            if (!user?.sub) {
                toast.error("Please log in to enable notifications.");
                return;
            }

            const token = await getAccessTokenSilently();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notifications/subscribe`, {
                fcmToken,
                userId: user.sub
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setIsSubscribed(true);
            toast.success("Notifications enabled successfully!");
        } catch (error) {
            console.error("Error subscribing to push:", error);
            toast.error(`Error: ${error.message || "Failed to subscribe"}`);
        }
    };


    const sendTestNotification = async () => {
        if (!user?.sub) return;
        try {
            const token = await getAccessTokenSilently();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notifications/send`, {
                userId: user.sub,
                title: "Test Notification",
                message: "This is a test message to verify push notifications work!"
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Test notification sent! Check your device.");
        } catch (error) {
            console.error("Error sending test notification:", error);
            toast.error("Failed to send test notification.");
        }
    };

    if (!showButton) return null;

    return (
        <div className={inline ? "space-y-4" : "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"}>
            {isSubscribed && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-xs transition-all animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                        <span>Background Activity</span>
                        <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded uppercase">Connected</span>
                    </h4>
                    
                    {!isStandalone && (
                        <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] text-amber-800 dark:text-amber-200">
                            ⚠️ <b>Not Installed:</b> Background pushes are much more reliable when you "Install" the app to your Home Screen.
                        </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                        To receive notifications even when the app is closed, please ensure background activity is allowed.
                    </p>

                    <div className="space-y-2">
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
                            {showGuide ? "Hide Instructions" : "How to enable background?"}
                        </button>
                    </div>

                    {showGuide && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[11px] text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30">
                            <p className="font-bold mb-1">On Android:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Long-press the app icon</li>
                                <li>Tap "App Info"</li>
                                <li>Go to "Battery" or "Power Usage"</li>
                                <li>Enable "Allow background activity"</li>
                                <li>Disable "Optimize battery usage"</li>
                            </ol>
                        </div>
                    )}
                </div>
            )}
            
            {!isSubscribed && (
                <button
                    onClick={subscribeToPush}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-xl hover:bg-blue-700 transition flex items-center gap-2 font-bold"
                >
                    <span>Enable Notifications</span>
                    <span className="text-lg">🔔</span>
                </button>
            )}
        </div>
    );
};

export default PushNotificationManager;
