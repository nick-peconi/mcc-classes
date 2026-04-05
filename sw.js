var CACHE_NAME = 'mcc-v2';
var urlsToCache = [
  '/mcc-classes/',
  '/mcc-classes/index.html',
  '/mcc-classes/pick.html',
  '/mcc-classes/sheet.html',
  '/mcc-classes/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network-first for API calls (Firebase), cache-first for static assets
  if (e.request.url.indexOf('firebaseio.com') !== -1 ||
      e.request.url.indexOf('googleapis.com') !== -1 ||
      e.request.url.indexOf('gstatic.com') !== -1) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});