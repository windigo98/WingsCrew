/* WingsCrew Cooks service worker.
   Scope is /cooks/ only. It does not cache the rest of wingscrew.com.
   brand_picks.json is precached with the rest of /cooks/. */
var CACHE = "wingscrew-cooks-v2";
var ROOT = new URL("./", self.location);

var PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./pantry.js",
  "./stores.js",
  "./manifest.webmanifest",
  "./data/recipes.json",
  "./data/brand_picks.json",
  "./fonts/fraunces-latin.woff2",
  "./fonts/outfit-latin.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/favicon-16.png",
  "./icons/favicon.ico",
  "./icons/logo.webp",
  "./icons/logo.png",
];

function inScope(url) {
  return url.origin === ROOT.origin && url.pathname.indexOf(ROOT.pathname) === 0;
}

function putClean(cache, url) {
  return fetch(url).then(function (response) {
    if (!response || !response.ok) throw new Error(url);
    if (!response.redirected) return cache.put(url, response);
    return response.blob().then(function (body) {
      var headers = new Headers(response.headers);
      headers.delete("content-encoding");
      return cache.put(url, new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      }));
    });
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(PRECACHE.map(function (path) {
        return putClean(cache, new URL(path, ROOT).href);
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function fromNetwork(request) {
  return fetch(request).then(function (response) {
    if (response && response.ok) {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) {
        cache.put(request, copy);
      });
    }
    return response;
  });
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url = new URL(request.url);
  if (!inScope(url)) return;

  event.respondWith(
    fromNetwork(request).catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        if (request.mode === "navigate") {
          return caches.match(new URL("./index.html", ROOT).href);
        }
        return new Response("", { status: 504, statusText: "offline" });
      });
    })
  );
});
