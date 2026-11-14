// 데코브라이트 견적 — 휴대폰 설치(홈 화면 추가)와 인터넷이 끊겼을 때 열기를 위한 서비스 워커
// 화면 파일은 네트워크 우선(고친 판이 바로 보이도록), 실패하면 저장본 사용
var CACHE = 'deco-v61';
var SHELL = ['index.html', 'quote.html', 'list.html', 'print.html', 'settings.html', 'prices.html', 'photos.html', 'orders.html', 'order.html', 'customers.html', 'customer.html', 'calendar.html', 'partners.html', 'memo.html', 'sns.html', 'contract.html', 'stats.html', 'mats.html', 'sign.html', 'measure.html', 'stock.html', 'expense.html', 'emodel.html', 'house.html',
  'common.css', 'common.js', 'sync.js', 'login.html', 'prices-default.js', 'real-photos.js', 'manifest.webmanifest', 'icons/icon.svg'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// 알림을 누르면 해당 화면 열기
self.addEventListener('notificationclick', function (e) { e.notification.close(); var u = new URL((e.notification.data && e.notification.data.url) || 'index.html', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (L) { for (var i = 0; i < L.length; i++) { if ('navigate' in L[i]) return L[i].navigate(u).then(function (c) { return c && c.focus(); }); } return self.clients.openWindow(u); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var same = new URL(e.request.url).origin === location.origin;
  e.respondWith((same ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request)).then(function (r) {
    if (same && r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
