import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: "G-RP905YCPBD" // Public identifier, harmless to keep if needed or move to env
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const generateToken = async () => {
    try {
        const permission = await Notification.requestPermission()
        console.log("Permission status:", permission);
        
        if (permission === "granted") {
            // Get the service worker registration
            const registration = await navigator.serviceWorker.ready;
            
            const token = await getToken(messaging, {
                serviceWorkerRegistration: registration,
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            })
            console.log("FCM Token generated:", token)
            return token;
        }
        return null;
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
        return null;
    }
}

// Keeping this for compatibility with existing code if needed
export const requestForToken = async (serviceWorkerRegistration) => {
    // If registration is passed, use it, otherwise fall back to generateToken's default
    if (serviceWorkerRegistration) {
        return await getToken(messaging, {
            serviceWorkerRegistration,
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
    }
    return await generateToken();
};
