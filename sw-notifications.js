/*
self.addEventListener('install', function(event) {
    console.log('Service worker installed.');

    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    console.log('Service worker activated.');

    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {

    console.log('Réception de la notification push.');

    let options = {
        body: 'Une nouvelle annonce a été publiée',
    };

    event.waitUntil(self.registration.showNotification('titre !', options));
});

 */


