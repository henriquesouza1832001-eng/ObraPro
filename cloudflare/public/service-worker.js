const CACHE_NAME = 'obrapro-shell-v2';
const PUBLIC_SHELL = ['/', '/entrar', '/manifest.webmanifest', '/images/bricklayer-training.png', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PUBLIC_SHELL)));
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )));
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
    event.respondWith(fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
    }).catch(async () => (await caches.match(event.request)) || caches.match('/')));
});
