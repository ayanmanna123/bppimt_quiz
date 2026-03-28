importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');


firebase.initializeApp({
    apiKey: "AIzaSyBoA5Kfdl3Lfi_AmNpJQleUX5nQWcGSass",
    authDomain: "test-fe849.firebaseapp.com",
    projectId: "test-fe849",
    storageBucket: "test-fe849.firebasestorage.app",
    messagingSenderId: "220007914367",
    appId: "1:220007914367:web:c1410eea51d526e24ad84a",
    measurementId: "G-RP905YCPBD"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image || "/bppimt.svg", // Fallback to bppimt icon
        badge: "/bppimt.svg",
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
