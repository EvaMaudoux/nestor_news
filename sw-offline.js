const CACHE_NAME = 'news-cache-v1';
const urlsToCache = [
    'news.js',
    'news.css',
    'news.view.php',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'POST') { // Vérifiez si la méthode est différente de POST (bug console : put)
        event.respondWith(
            fetch(event.request)
                .then(response => {

                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                        });
                })
        );
    }
});