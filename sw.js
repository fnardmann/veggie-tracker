'use strict';

const CACHE = 'veggie-tracker-v106';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './i18n.js',
  './nutrition-data.json',
  './nutrition.js',
  './data.js',
  './render-gallery.js',
  './render-nutrition.js',
  './app.js',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
