// Network-first for the app itself (so every deploy shows up on the next launch),
// cache-first only for the Three.js CDN module. Cached copies are used when offline.
const CACHE = 'mountain-goat-v333';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./index.html', './manifest.json']).catch(() => {}).then(() => Promise.all(['img/splash.png', 'img/loading.png', 'img/dim-mountain.png', 'img/dim-city.png', 'img/dim-yard.png', 'img/dim-frog.png', 'img/dim-moon.png', 'img/win.png', 'img/icon.ico', 'img/icon-180.png', './icon-192.png', './icon-512.png'].map(f => c.add(f).catch(() => {})))))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (url.includes('three')) { // vendor module: cache-first
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; })));
    return;
  }
  if (!url.startsWith(self.location.origin)) return;
  if (url.includes('?v=')) return; // version checks go straight to the network and are never cached
  e.respondWith(fetch(e.request, { cache: 'no-store' }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
});
