const CACHE='grupo-estrella-ultimate-v1';
const ASSETS=['./','./index.html','./style.css','./game.js','./manifest.json','./assets/app-icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/apple-touch-icon.png','./assets/syringe.svg','./assets/coffee.svg','./assets/amir.svg','./assets/florencia.svg','./assets/angela.svg','./assets/aline.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
