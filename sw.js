/* Rytíř Čísel – service worker
 * Dvě věci: Android bez něj hru nenainstaluje jako aplikaci (udělal by jen
 * zástupce, který se otevře v prohlížeči), a s ním hra funguje i bez sítě.
 *
 * Strategie: odpověz hned z cache a na pozadí si stáhni novější verzi.
 * Nová verze se tedy projeví při dalším spuštění – pro hru bez přihlášení
 * a bez serveru to stačí a dítě nikdy nečeká na síť.
 */
'use strict';

/* Jméno cache má prefix projektu, protože Cache Storage je společné pro celý
   origin – na zakkomino.github.io žijí i další projekty a nesmíme jim do cache
   sahat. VERZI je potřeba zvednout při každém nasazení, které přidá nebo
   přejmenuje soubor ve skořápce; jinak by ho první offline spuštění nemělo. */
var PREFIX = 'rytir-cisel-2-';
var VERZE = '2026-09-10';
var CACHE = PREFIX + 'skorapka-' + VERZE;

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
  './ikony/ikona-180.png',
  './ikony/ikona-maskable-192.png',
  './ikony/ikona-maskable-512.png'
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
        var moje = j.indexOf(PREFIX) === 0;
        return (moje && j !== CACHE) ? caches.delete(j) : Promise.resolve();
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  /* Cizí adresy neřešíme – hra žádná externí data nemá. */
  if (new URL(req.url).origin !== self.location.origin) return;

  function odpovedOffline() {
    return new Response('', { status: 504, statusText: 'Offline' });
  }

  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (ulozena) {
        var zeSite = fetch(req).then(function (odpoved) {
          if (odpoved && odpoved.ok && odpoved.type === 'basic') {
            /* Plná kvóta nesmí shodit odpověď – hra běží dál i bez uložení. */
            return cache.put(req, odpoved.clone())
              .catch(function () {})
              .then(function () { return odpoved; });
          }
          return odpoved;
        });

        if (ulozena) {
          /* Odpovíme hned ze cache, ale stažení novější verze musí doběhnout,
             i kdyby prohlížeč chtěl workera mezitím uspat. */
          e.waitUntil(zeSite.catch(function () {}));
          return ulozena;
        }
        return zeSite.catch(function () {
          if (req.mode !== 'navigate') return odpovedOffline();
          return cache.match('./index.html').then(function (skorapka) {
            return skorapka || odpovedOffline();
          });
        });
      });
    })
  );
});
