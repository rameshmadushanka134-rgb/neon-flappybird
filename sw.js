const CACHE_NAME = 'neon-flappy-v41';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './db.js',
  './cyber_assistant_avatar.png',
  './cover.png',
  './manifest.json',
  './icon.svg',
  './cartoon_bg.png',
  './fire_mountain_bg.png',
  './eagle_3d_icon.png',
  './canary_3d_icon.png',
  './phoenix_3d_icon.png',
  './hawk_3d_icon.png',
  './wings_3d_icon.png',
  './coordinator_3d_icon.png',
  './jetpack_3d_icon.png',
  './login_backdrop.png',
  './greeting_parrot.png'
];

// Install Event: Cache all essential assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching files');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event: Serve from Cache or Network fallback
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        // Fallback if network and cache fail
        console.log('[Service Worker] Fetch failed offline');
      });
    })
  );
});
