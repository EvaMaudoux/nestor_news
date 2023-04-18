const CACHE_NAME = 'news-cache';
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

self.addEventListener('activate', function(event) {
    console.log('Service worker activated.');
    event.waitUntil(self.clients.claim());
});

/*
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log("Found response in cache:", response);
                return response;
            }

            return fetch(event.request)
                .then((response) => {
                    console.log("Response from network is:", response);
                    return response;
                })
                .catch((error) => {
                    console.error("Fetching failed:", error);
                    throw error;
                });
        })
    );
});
*/

self.addEventListener('push', function (event) {

    let pushData = event.data.json();
    const options = {
        body: pushData.body,
        icon: pushData.icon,
    };

    event.waitUntil(self.registration.showNotification(pushData.title, options));
});

// Fonction de redirection quand l'utilisateur clique sur l'annonce
self.addEventListener('notificationclick', (event) => {
    // console.log(event);
    event.waitUntil(
        openUrl('https://df58-81-240-95-131.ngrok-free.app/stage/2.0/news.view.php?ak=eva')
    )
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
