import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

self.addEventListener('push', (event) => {
    const data = event.data.json();
    console.log('Push received...', data);

    const title = data.title || 'New Notification';
    const options = {
        body: data.body || 'You have a new update.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('http://localhost:5173') // Change to production URL in real app
    );
});
