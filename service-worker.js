'use strict';

var cacheVersion = 1;
var currentCache = {
offline: 'offline-cache' + cacheVersion
};
const offlineUrl = './juegoOffline.html';
const js='./juego.js';
const favicon='./favicon.ico';

function createCacheBustedRequest(url) {
  let request = new Request(url, {cache: 'reload'});
  // See https://fetch.spec.whatwg.org/#concept-request-mode
  // This is not yet supported in Chrome as of M48, so we need to explicitly check to see
  // if the cache: 'reload' option had any effect.
  console.log("jjjjjjjjjjjjjjjjjjjjjj");
  if ('cache' in request) {
    return request;
  }

  // If {cache: 'reload'} didn't have any effect, append a cache-busting URL parameter instead.
  let bustedUrl = new URL(url, self.location.href);
  bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
  return new Request(bustedUrl);
}

this.addEventListener('install', event => {
event.waitUntil(
  caches.open(currentCache.offline).then(function(cache) {
    return cache.addAll([
        js,
        offlineUrl,
        favicon
    ]);
  })
);
});
this.addEventListener('fetch', event => {
  // request.mode = navigate isn't supported in all browsers
  // so include a check for Accept: text/html header.
  if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(createCacheBustedRequest(event.request.url)).catch(error => {
        // Return the offline page
        return caches.match(offlineUrl);
      })
    );
  } else {
    // Respond with everything else if we can
    event.respondWith(caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});
