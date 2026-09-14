/* Pekerja layanan: membuat aplikasi bisa dipasang di layar utama
   dan tetap terbuka saat sinyal hilang. */
var SIMPANAN = 'stok-fjm-v1';
var ASET = ['./', './index.html', './manifest.json',
            './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(SIMPANAN).then(function (c) {
      return c.addAll(ASET).catch(function () {});
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (kunci) {
      return Promise.all(kunci.map(function (k) {
        if (k !== SIMPANAN) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var minta = e.request;
  if (minta.method !== 'GET') return;
  if (minta.url.indexOf('script.google.com') >= 0) return;
  if (minta.url.indexOf('googleusercontent.com') >= 0) return;

  e.respondWith(
    fetch(minta).then(function (jawab) {
      var salinan = jawab.clone();
      caches.open(SIMPANAN).then(function (c) { c.put(minta, salinan); }).catch(function () {});
      return jawab;
    }).catch(function () {
      return caches.match(minta).then(function (simpan) {
        return simpan || caches.match('./index.html');
      });
    })
  );
});
