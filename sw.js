// BudgetSmart service worker — offline cache.
// Network first, falling back to cache, so a new build is picked up
// immediately while an offline user still gets the last good copy.
const CACHE = 'budgetsmart-v31';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;   // leave CDNs alone
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r && r.status === 200) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('./')))
  );
});
