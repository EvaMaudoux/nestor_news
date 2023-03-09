self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("push", () => {
    self.registration.sendNotification('test message', {})
    /*
    const data = event.data ? event.data.json() : {};
    event.waitUntil(self.registration.showNotification(data.title, data));
     */
});