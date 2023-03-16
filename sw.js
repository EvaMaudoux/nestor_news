const CACHE_NAME = 'news-cache';
const urlsToCache = [
    'news.js',
    'news.css',
    'news.view.php',
    'news.api.php',
    'addNews.api.php'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', function(event) {
    console.log('Service worker activated.');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    // Vérifiez si la méthode est différente de POST
    if (event.request.method !== 'POST') {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request)
                        .then(response => {
                            // Clone the response since it can be consumed only once.
                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        });
                })
        );
    }
});

// event push
self.addEventListener('push', function(event) {
    console.log('Réception de la notification push.');

    let options = {
        icon: ('nestor.png'),
        body: 'Nestor a une nouvelle info pour toi.',
    };
    event.waitUntil(self.registration.showNotification('Nouvelle annonce !', options));
});

// Fonction de redirection quand l'utilisateur clique sur l'annonce
self.addEventListener('notificationclick', (event) => {
    // console.log(event);
event.waitUntil(
    openUrl('http://localhost/stage/2.0/news.view.php?ak=eva')
)
    // console.log(event.notification.data);
})

// Fonction permettant d'ouvrir l'Url de redirection au clic d'une notification
async function openUrl(url) {
    const windowClients = await self.clients.matchAll({type: 'window', includeUncontrolled: true})
    for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url === url && 'focus' in client) {
            return client.focus()
        }
    }
    if (self.clients.openWindow) {
        return self.clients.openWindow(url);
    }
    return null;

}
