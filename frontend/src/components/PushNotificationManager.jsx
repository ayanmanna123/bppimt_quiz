import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";

const PushNotificationManager = () => {
    const { user, getAccessTokenSilently } = useAuth0();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);

    // ... (existing code)

    // VAPID Public Key from Backend (Should be in env, but for now hardcoded or fetched)
    // REPLACEME: Use the Public Key generated earlier
    const VAPID_PUBLIC_KEY = "BI9CAjZwb3pUMWhVxcwKNQWOF8NZepe3wXuvne7Jr7vtUJ1H-ZtN98OcZcS-a9oNtcTpKi9yt4f8OHdPZHT-rHw";

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            registerServiceWorker();
        }
    }, []);

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            if (sub) {
                setSubscription(sub);
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error("Error checking subscription", error);
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

            console.log("2. Waiting for Service Worker...");
            if (!('serviceWorker' in navigator)) {
                toast.error("Service Worker not supported in this browser.");
                return;
            }

            // This promise will verify if the SW is actually registered and active
            const registration = await navigator.serviceWorker.ready;

            if (!registration) {
                console.error("Service Worker ready assertion failed.");
                toast.error("Service Worker not ready. Try reloading the page.");
                return;
            }

            console.log("3. Service Worker ready:", registration);

            const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

            console.log("4. Subscribing to PushManager...");
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            console.log("5. Subscription object:", sub);
            setSubscription(sub);
            setIsSubscribed(true);

            // Send subscription to backend
            console.log("6. Sending subscription to backend...");

            if (!user?.sub) {
                toast.error("Please log in to enable notifications.");
                return;
            }

            // sub is a PushSubscription object. We need to serialize it or use .toJSON() if we want just the data, 
            // but axios will serialize the object. However, PushSubscription is special. 
            // It's safer to explicitly use .toJSON() or construct the object.
            // standard properties are endpoint, expirationTime, options. keys is inside toJSON().

            const subscriptionData = sub.toJSON();
            const token = await getAccessTokenSilently();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notifications/subscribe`, {
                ...subscriptionData,
                userId: user.sub
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

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

    if (isSubscribed) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={sendTestNotification}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition"
                >
                    Send Test Notification 📲
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={subscribeToPush}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
                Enable Notifications 🔔
            </button>
        </div>
    );
};

export default PushNotificationManager;
