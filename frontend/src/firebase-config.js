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
  measurementId: "G-P4QS2KY6CL" // Corrected from the user's initial config snippet
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const requestForToken = async (serviceWorkerRegistration) => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: serviceWorkerRegistration
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('On Message:', payload);
      resolve(payload);
    });
  });
