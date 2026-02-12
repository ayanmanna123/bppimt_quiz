import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const PushNotificationManager = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);

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
            await axios.post('http://localhost:5000/api/v1/notifications/subscribe', sub);

            toast.success("Notifications enabled successfully!");
        } catch (error) {
            console.error("Error subscribing to push:", error);
            toast.error(`Error: ${error.message || "Failed to subscribe"}`);
        }
    };

    if (isSubscribed) return null; // Or return a button to unsubscribe

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
