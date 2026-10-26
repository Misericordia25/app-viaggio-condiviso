/* Genera Chiamata – service worker: rende l'app installabile e utilizzabile senza rete */
const C='gc-v1.1.0';
const LIBH=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|www\.gstatic\.com)\//; // solo librerie in cache, mai i dati Firestore
const PRE=['./','./index.html',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(PRE.map(u=>
  fetch(u,u.startsWith('http')?{mode:'no-cors'}:{}).then(r=>c.put(u,r)).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  if(q.mode==='navigate'){ // pagina: prima la rete (aggiornamenti), senza rete la copia in cache
    e.respondWith(fetch(q).then(r=>{const k=r.clone();caches.open(C).then(c=>c.put('./index.html',k));return r})
      .catch(()=>caches.match('./index.html',{ignoreSearch:true}).then(r=>r||caches.match('./'))));return}
  if(!LIBH.test(q.url)&&new URL(q.url).origin!==location.origin)return; // Firestore e altri servizi: sempre dalla rete
  e.respondWith(caches.match(q).then(r=>r||fetch(q).then(n=>{if(n.ok||n.type==='opaque'){const k=n.clone();caches.open(C).then(c=>c.put(q,k))}return n})));
});
