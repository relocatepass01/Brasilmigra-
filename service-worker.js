const CACHE_NAME = 'brasilmigra-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache)
                    .catch(error => {
                        console.log('Cache addAll error:', error);
                        // Continue even if some resources fail to cache
                    });
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deletando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch Event - Cache First Strategy
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (event.request.url.startsWith('http') && !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return from cache if available
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the response for future use
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.log('Fetch error:', error);
                        // Return offline page or cached response
                        return caches.match(event.request)
                            .then(response => {
                                return response || new Response('Estás desconectado. Por favor, reconecta-te à Internet.');
                            });
                    });
            })
    );
});

// Background Sync (opcional)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Aqui você pode sincronizar dados com o servidor quando a conexão voltar
            Promise.resolve()
        );
    }
});

// Push Notifications (opcional)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Você tem uma nova notificación',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231a6b5e" width="192" height="192"/><text x="50%" y="50%" font-size="100" fill="white" text-anchor="middle" dy=".3em">✈</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%231a6b5e" width="96" height="96"/><text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle" dy=".3em">✈</text></svg>',
        tag: 'brasilmigra-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('BrasilMigra', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});
