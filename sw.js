// Mise en cache des annonces (système de fichier html - coquille vide)
const CACHE_NAME = 'news-cache';
const urlsToCache = [
    'news.js',
    'news.css',
    'news.view.php',
];

// Installation du service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Activation du service worker
self.addEventListener('activate', function(event) {
    console.log('Service worker activated.');
    event.waitUntil(self.clients.claim());
});


// Event fetch permettant d'afficher la page tout en étant hors ligne
self.addEventListener("fetch", (event) => {
    event.respondWith(
        // recherche dans le cache
        caches.match(event.request).then((response) => {
            if (response) {
                // console.log("Found response in cache:", response);
                return response;
            }
            return fetch(event.request)
                .then((response) => {
                    // console.log("Response from network is:", response);
                    return response;
                })
                .catch((error) => {
                    // console.error("Fetching failed:", error);
                    throw error;
                });
        })
    );
});


// Event push des notifications
self.addEventListener('push', function (event) {
    let pushData = event.data.json();
    const options = {
        body: pushData.body,
        icon: pushData.icon,
    };
    event.waitUntil(self.registration.showNotification(pushData.title, options));
});

// Redirection quand l'utilisateur clique sur la notification
self.addEventListener('notificationclick', (event) => {
    event.waitUntil(
        // à modifier avec la bonne url du site
        openUrl('https://8b6b-81-240-95-131.ngrok-free.app/stage/2.0/news.view.php?ak=eva')
    )
})

// Si la page de redirection est déjà ouverte dans le navigateur, redirection. Sinon, ouverture de la page
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
