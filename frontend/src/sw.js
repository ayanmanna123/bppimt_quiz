import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

self.addEventListener('push', (event) => {
    let title = 'New Notification';
    let options = {
        body: 'You have a new update.',
        icon: '/bppimt.svg',
        badge: '/bppimt.svg',
        data: {}
    };

    try {
        if (event.data) {
            const data = event.data.json();
            title = data.title || title;
            options.body = data.body || options.body;
            options.icon = data.icon || options.icon;
            options.badge = data.badge || options.badge;
            options.tag = data.tag || 'general';
            options.renotify = data.renotify !== undefined ? data.renotify : true;
            options.data = data.data || options.data;
        }
    } catch (err) {
        console.error('Push payload error:', err);
        // data was not JSON, maybe text?
        options.body = event.data ? event.data.text() : options.body;
    }

    event.waitUntil(self.registration.showNotification(title, options));
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