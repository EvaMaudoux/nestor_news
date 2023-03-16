/*
const CACHE_NAME = 'news-cache-v1';
const urlsToCache = [
    'news.js',
    'news.css',
    'news.view.php',
    'news.api.php',
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

 */
