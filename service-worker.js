// Service worker for AHMED MAHMOUD PH.
// Strategy: cache-first for the static app shell (fonts, compiled JS/CSS, icons),
// network-first for everything else (album/photo data, images), so content
// stays fresh while the app itself still boots offline.
//
// All shell paths are resolved relative to this file's own location rather
// than hardcoded from "/", because a GitHub Pages *project* site serves the
// app under "/repo-name/", not the domain root.

const CACHE_NAME = "amph-shell-v1";
const SCOPE_URL = new URL("./", self.location.href);

const SHELL_RELATIVE_PATHS = [
  "",
  "index.html",
  "manifest.json",
  "dist/main.js",
  "src/styles/tokens.css",
  "src/styles/base.css",
  "src/styles/components.css",
  "src/styles/viewer.css",
  "src/styles/admin.css",
  "public/assets/logo.webp",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
];

const SHELL_ASSETS = SHELL_RELATIVE_PATHS.map((p) => new URL(p, SCOPE_URL).pathname);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // never cache admin POST/API writes

  const url = new URL(req.url);
  const isShellAsset = SHELL_ASSETS.indexOf(url.pathname) !== -1;

  if (isShellAsset) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // Network-first for everything else (album data, remote photo URLs, Apps Script API).
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
