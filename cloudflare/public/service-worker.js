const CACHE_NAME = 'obrapro-shell-v3';
const PUBLIC_SHELL = ['/', '/manifest.webmanifest', '/images/bricklayer-training.png', '/icons/icon-192.png', '/icons/icon-512.png'];
const PUBLIC_ASSET_PREFIXES = ['/build/', '/images/', '/icons/'];

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
    const path = new URL(event.request.url).pathname;
    const isPublicAsset = PUBLIC_SHELL.includes(path) || PUBLIC_ASSET_PREFIXES.some(prefix => path.startsWith(prefix));

    if (!isPublicAsset) return;

    event.respondWith(fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
    }).catch(async () => (await caches.match(event.request)) || caches.match('/')));
});
