/* Rytíř Čísel – service worker
 * Dvě věci: Android bez něj hru nenainstaluje jako aplikaci (udělal by jen
 * zástupce, který se otevře v prohlížeči), a s ním hra funguje i bez sítě.
 *
 * Strategie: odpověz hned z cache a na pozadí si stáhni novější verzi.
 * Nová verze se tedy projeví při dalším spuštění – pro hru bez přihlášení
 * a bez serveru to stačí a dítě nikdy nečeká na síť.
 */
'use strict';

var CACHE = 'rytir-cisel-v1';

/* Skořápka hry – tohle musí být k dispozici i offline. */
var SKORAPKA = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/levels.css',
  './js/core.js',
  './js/engine.js',
  './js/levels-act1.js',
  './js/levels-act2.js',
  './js/story.js',
  './js/main.js',
  './ikony/ikona-192.png',
  './ikony/ikona-512.png',
  './ikony/ikona-180.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(SKORAPKA); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (jmena) {
      return Promise.all(jmena.map(function (j) {
        return j === CACHE ? Promise.resolve() : caches.delete(j);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  /* Cizí adresy neřešíme – hra žádná externí data nemá. */
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (ulozena) {
        var zeSite = fetch(req).then(function (odpoved) {
          if (odpoved && odpoved.ok && odpoved.type === 'basic') {
            cache.put(req, odpoved.clone());
          }
          return odpoved;
        }).catch(function () {
          /* Bez sítě: co je v cache, případně skořápka pro navigaci. */
          return ulozena || (req.mode === 'navigate' ? cache.match('./index.html') : Promise.reject());
        });
        return ulozena || zeSite;
      });
    })
  );
});
