/* One-time retirement of the legacy offline worker; v3 does not register a worker. */
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await caches.delete('grupo-estrella-ultimate-v1');
 await self.clients.claim();
 const scope=self.registration.scope;
 await self.registration.unregister();
 const windows=await self.clients.matchAll({type:'window'});
 await Promise.all(windows.filter(client=>client.url.startsWith(scope)).map(client=>client.navigate(client.url).catch(()=>{})));
})()));
