import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

// Firebase Messaging in Service Worker
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[sw.js] Received background message ', payload);
  
  // Customizing notification
  const notificationTitle = payload.notification?.title || payload.data?.title || 'BPPIMT Quiz Update';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || payload.data?.body || 'You have a new notification.',
    icon: '/bppimt.svg',
    badge: '/bppimt.svg',
    tag: payload.data?.tag || 'fcm-notification',
    renotify: true,
    data: {
      ...payload.data,
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url === urlToOpen) {
                matchingClient = windowClient;
                break;
            }
        }

        if (matchingClient) {
            return matchingClient.focus();
        } else {
            return clients.openWindow(urlToOpen);
        }
    });

    event.waitUntil(promiseChain);
});

// Optional: Background Sync / Periodic Sync to keep worker alive
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'notification-heartbeat') {
        console.log('Periodic sync heartbeat received...');
        // No action needed, just waking up the SW
    }
});