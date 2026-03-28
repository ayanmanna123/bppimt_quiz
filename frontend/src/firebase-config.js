import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBoA5Kfdl3Lfi_AmNpJQleUX5nQWcGSass",
    authDomain: "test-fe849.firebaseapp.com",
    projectId: "test-fe849",
    storageBucket: "test-fe849.firebasestorage.app",
    messagingSenderId: "220007914367",
    appId: "1:220007914367:web:c1410eea51d526e24ad84a",
    measurementId: "G-RP905YCPBD"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const generateToken = async () => {
    try {
        const permission = await Notification.requestPermission()
        console.log("Permission status:", permission);
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: "BFGF7gIbbivjnRw48yHIp_xGuZM-vQiGnArPamUMBjAEJ7t2uBNjU0iD8bamGQV0XZ0R8KORfktmPayAOV80xfQ"
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
    return await generateToken();
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('On Message (Foreground):', payload);
            resolve(payload);
        });
    });
