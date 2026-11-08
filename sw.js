const CACHE_NAME = 'pomodoro-cube-v1';
const assets = [
    './',
    './index.html',
    './style.css',
    './script.js'
];

// Cache the files when the app is installed
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(assets))
    );
});

// Load files from the cache when the app is opened
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});