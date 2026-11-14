/* 데코브라이트 — 같이 쓰기(서버 맞추기)
   기기 저장(localStorage)은 그대로 쓰고, 로그인하면 서버(수파베이스 서울)와 주고받습니다.
   - 고친 것만 서버로 보냄(대기열은 기기에 보관 → 인터넷이 끊겨도 나중에 보냄)
   - 다른 기기에서 고친 것은 들어올 때 받아서 이 기기에 합침
   - 지운 것은 _del 표시로 보내서 다른 기기에서도 지워짐
   - 현장 사진은 아직 기기마다 따로(다음 단계) */
(function () {
  var URL = 'https://dypvqgaayumrhaiphatu.supabase.co', KEY = 'sb_publishable_5-LUZwZQ3VwBxDKDA_nJpw_ddF6QKdE';
  var LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.js';
  var MAP = { 'deco-quotes': 'quotes', 'deco-customers': 'customers', 'deco-orders': 'orders', 'deco-events': 'events', 'deco-partners': 'partners', 'deco-memos': 'memos', 'deco-settings': 'settings', 'deco-prices': 'prices', 'deco-stock': 'stock', 'deco-exp': 'exp', 'deco-okq': 'okq', 'deco-chk': 'chk', 'deco-asreq': 'asreq', 'deco-rvq': 'rvq', 'deco-qtpl': 'qtpl', 'deco-reply': 'reply', 'deco-seen': 'seen' };
  // 임시(2026-11-12): 로그인 없이 같이 쓰기. 나중에 팀 코드로 바꿀 때 false 로
  var OPEN = true;
  var OBJ = { 'deco-settings': 1, 'deco-prices': 1 }, REV = {};
  Object.keys(MAP).forEach(function (k) { REV[MAP[k]] = k; });
  var SNAP = 'deco-sync-snap', QK = 'deco-sync-q', LAST = 'deco-sync-last';
  var LIVE = /(^|\/)(index|list|customers|orders|calendar|partners)\.html$|\/$/.test(location.pathname);
  function rd(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function hash(s) { var h = 5381, i = s.length; while (i) h = (h * 33) ^ s.charCodeAt(--i); return (h >>> 0).toString(36) + s.length; }
  function toMap(k, v) { if (OBJ[k]) return v && typeof v === 'object' ? { main: v } : {}; var m = {}; (Array.isArray(v) ? v : []).forEach(function (x) { if (x && x.id != null) m[String(x.id)] = x; }); return m; }

  var S = { client: null, user: null, member: null, state: '로그인 전', err: '', busy: false, lastOk: 0, pulled: 0 };
  var listeners = [];
  function emit() { listeners.forEach(function (f) { try { f(S); } catch (e) {} }); paint(); }

  // 기기에서 고친 것 → 대기열
  function changed(k, v) {
    if (!MAP[k] || !(OPEN || localStorage.getItem('deco-auth'))) return; var snap = rd(SNAP, {}), old = snap[k] || {}, now = toMap(k, v), q = rd(QK, {}), nh = {}, n = 0;
    Object.keys(now).forEach(function (id) { var h = hash(JSON.stringify(now[id])); nh[id] = h; if (old[id] !== h) { q[MAP[k] + '|' + id] = { c: MAP[k], id: id, data: now[id], v: Date.now() }; n++; } });
    Object.keys(old).forEach(function (id) { if (!(id in now)) { q[MAP[k] + '|' + id] = { c: MAP[k], id: id, data: { _del: true }, v: Date.now() }; n++; } });
    snap[k] = nh; wr(SNAP, snap); if (n) { wr(QK, q); later(); }
  }
  var tm = null; function later() { clearTimeout(tm); tm = setTimeout(function () { flush().then(flushPhotos); }, 800); }

  // 대기열 → 서버
  function flush() {
    if (!S.client || !S.user || S.member === false) return Promise.resolve();
    var q = rd(QK, {}), keys = Object.keys(q); if (!keys.length) return Promise.resolve();
    var rows = keys.slice(0, 40).map(function (x) { return { coll: q[x].c, id: q[x].id, data: q[x].data }; }), sent = {};
    keys.slice(0, 40).forEach(function (x) { sent[x] = q[x].v; });
    return S.client.from('records').upsert(rows, { onConflict: 'coll,id' }).then(function (r) {
      if (r.error) { S.err = '서버에 보내지 못했습니다: ' + r.error.message; emit(); return; }
      var q2 = rd(QK, {}); Object.keys(sent).forEach(function (x) { if (q2[x] && q2[x].v === sent[x]) delete q2[x]; }); wr(QK, q2);
      S.err = ''; S.lastOk = Date.now(); emit(); if (Object.keys(q2).length) return flush();
    });
  }

  // 서버 → 기기
  function pull() {
    if (!S.client || !S.user || S.member === false) return Promise.resolve(0);
    var last = rd(LAST, '1970-01-01T00:00:00Z'), got = 0;
    function page(from) {
      return S.client.from('records').select('coll,id,data,updated_at').gt('updated_at', from).order('updated_at').limit(500).then(function (r) {
        if (r.error) { S.err = '서버에서 받지 못했습니다: ' + r.error.message; emit(); return got; }
        var rows = r.data || []; if (!rows.length) return got;
        var q = rd(QK, {}), snap = rd(SNAP, {}), cache = {};
        rows.forEach(function (row) {
          if (row.coll === 'photos') { PIN.push(row); got++; return; }
          var k = REV[row.coll]; if (!k || q[row.coll + '|' + row.id]) return;
          if (!cache[k]) cache[k] = rd(k, OBJ[k] ? null : []);
          var del = row.data && row.data._del, sn = snap[k] = snap[k] || {};
          if (OBJ[k]) { if (!del) { cache[k] = row.data; sn.main = hash(JSON.stringify(row.data)); } }
          else {
            var arr = cache[k], i = arr.findIndex(function (x) { return x && String(x.id) === row.id; });
            if (del) { if (i >= 0) arr.splice(i, 1); delete sn[row.id]; }
            else { if (i >= 0) arr[i] = row.data; else arr.push(row.data); sn[row.id] = hash(JSON.stringify(row.data)); }
          }
          got++;
        });
        Object.keys(cache).forEach(function (k) { if (cache[k] != null) wr(k, cache[k]); });
        wr(SNAP, snap); last = rows[rows.length - 1].updated_at; wr(LAST, last);
        return rows.length === 500 ? page(last) : got;
      });
    }
    return page(last);
  }

  // ---------- 현장 사진 (IndexedDB ↔ 서버 보관함 photos) ----------
  var PQ = 'deco-sync-pq', PS = 'deco-sync-psnap', PIN = [], O = null;
  function meta(p) { var m = {}; Object.keys(p).forEach(function (k) { if (k !== 'blob') m[k] = p[k]; }); m.path = 'p/' + p.id + '.jpg'; return m; }
  function pq(id, op) { var q = rd(PQ, {}); if (q[id] && q[id].op === 'up' && op === 'meta') return; q[id] = { op: op, v: Date.now() }; wr(PQ, q); later(); }
  function hookPhotos() {
    var D = window.DECO; if (!D || !D.photoAdd || O) return;
    O = { add: D.photoAdd, put: D.photoPut, del: D.photoDel, all: D.photoAll };
    D.photoAdd = function (p) { return O.add(p).then(function (r) { pq(r.id, 'up'); return r; }); };
    D.photoPut = function (p) { return O.put(p).then(function (r) { pq(p.id, 'meta'); return r; }); };
    D.photoDel = function (id) { return O.del(id).then(function (r) { pq(id, 'del'); return r; }); };
  }
  // 서버에서 받은 사진 기록 → 이 기기에 합치기 (없는 사진은 내려받기)
  function applyPhotos() {
    if (!O || !PIN.length) return Promise.resolve(0);
    var rows = PIN.splice(0), q = rd(PQ, {}), ps = rd(PS, {}), n = 0;
    return O.all().then(function (all) {
      var have = {}; all.forEach(function (p) { have[p.id] = p; });
      return rows.reduce(function (pr, row) { return pr.then(function () {
        if (q[row.id]) return; var d = row.data || {};
        if (d._del) { delete ps[row.id]; if (have[row.id]) { n++; return O.del(row.id); } return; }
        ps[row.id] = 1;
        if (have[row.id]) { var p = have[row.id], ch = false; Object.keys(d).forEach(function (k) { if (k !== 'path' && JSON.stringify(p[k]) !== JSON.stringify(d[k])) { p[k] = d[k]; ch = true; } }); if (ch) { n++; return O.put(p); } return; }
        return S.client.storage.from('photos').download(d.path).then(function (r) {
          if (r.error || !r.data) return; var p = {}; Object.keys(d).forEach(function (k) { if (k !== 'path') p[k] = d[k]; }); p.blob = r.data; n++; return O.put(p);
        });
      }); }, Promise.resolve()).then(function () { wr(PS, ps); return n; });
    });
  }
  // 이 기기 사진 → 서버 (올리기·고치기·지우기)
  function flushPhotos() {
    if (!O || !S.client || !S.user || S.member === false) return Promise.resolve();
    return O.all().then(function (all) {
      var q = rd(PQ, {}), ps = rd(PS, {}), have = {};
      all.forEach(function (p) { have[p.id] = p; if (!ps[p.id] && !q[p.id]) q[p.id] = { op: 'up', v: Date.now() }; });
      wr(PQ, q); var ids = Object.keys(q); if (!ids.length) return;
      S.photoLeft = ids.length; emit();
      return ids.reduce(function (pr, id) { return pr.then(function () {
        var it = q[id], p = have[id], bucket = S.client.storage.from('photos'), done;
        if (it.op === 'del' || !p) done = bucket.remove(['p/' + id + '.jpg']).then(function () { return S.client.from('records').upsert({ coll: 'photos', id: id, data: { _del: true } }, { onConflict: 'coll,id' }); });
        else if (it.op === 'up' || !ps[id]) done = bucket.upload('p/' + id + '.jpg', p.blob, { upsert: true, contentType: p.blob.type || 'image/jpeg' }).then(function (r) { if (r.error) throw r.error; return S.client.from('records').upsert({ coll: 'photos', id: id, data: meta(p) }, { onConflict: 'coll,id' }); });
        else done = S.client.from('records').upsert({ coll: 'photos', id: id, data: meta(p) }, { onConflict: 'coll,id' });
        return done.then(function (r) {
          if (r && r.error) throw r.error;
          var q2 = rd(PQ, {}), ps2 = rd(PS, {}); if (q2[id] && q2[id].v === it.v) delete q2[id];
          if (it.op === 'del' || !p) delete ps2[id]; else ps2[id] = 1; wr(PQ, q2); wr(PS, ps2); S.photoLeft = Object.keys(q2).length; emit();
        }, function (e) { S.err = '사진을 보내지 못했습니다: ' + (e && e.message || e); emit(); throw e; });
      }); }, Promise.resolve());
    }).catch(function () {});
  }

  function sync(first) {
    if (S.busy) return Promise.resolve(); S.busy = true; emit();
    return pull().then(function (n) {
      S.pulled = n || 0;
      // 처음 연결: 이 기기에만 있던 자료를 대기열에 올림
      if (first || !localStorage.getItem(SNAP)) Object.keys(MAP).forEach(function (k) { var v = rd(k, null); if (v != null) changed(k, v); });
      return applyPhotos().then(function (pn) { n = (n || 0) + (pn || 0); S.photoIn = pn; return flush(); }).then(flushPhotos).then(function () { return n; });
    }).then(function (n) {
      S.busy = false; if (!S.err) S.lastOk = Date.now(); emit();
      if (n) arrived();
    }, function (e) { S.busy = false; S.err = '연결이 불안정합니다. 잠시 뒤 다시 맞춥니다.'; emit(); });
  }
  function arrived() {
    if (window.DECO && DECO.rvMerge) try { DECO.rvMerge(); } catch (e) {}
    if (!LIVE && window.DECO && DECO.ntfCheck) DECO.ntfCheck();
    if (LIVE) { var g = +sessionStorage.getItem('deco-sync-reload') || 0; if (Date.now() - g > 15000) { sessionStorage.setItem('deco-sync-reload', Date.now()); location.reload(); return; } }
    var b = document.getElementById('syncNew');
    if (!b) { b = document.createElement('div'); b.id = 'syncNew'; b.style.cssText = 'position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;background:#3B2F2A;color:#fff;padding:10px 14px;border-radius:12px;font-size:15px;box-shadow:0 6px 20px rgba(0,0,0,.25);display:flex;gap:10px;align-items:center';
      b.innerHTML = '다른 기기에서 고친 내용이 들어왔습니다 <button type="button" style="font:inherit;font-weight:700;border:0;border-radius:8px;padding:6px 10px;background:#E0952B;color:#fff">새로 보기</button>';
      b.querySelector('button').onclick = function () { location.reload(); }; document.body.appendChild(b); }
  }

  // 처음 화면 등의 상태 표시 (#syncBox 가 있는 화면)
  function paint() {
    var el = document.getElementById('syncBox'); if (!el) return;
    var t;
    if (!S.client) t = '☁ 같이 쓰기 준비 중…';
    else if (!S.user) t = '☁ <b>로그인하면</b> 동업자와 같은 자료를 봅니다 ›';
    else if (S.member === false) t = '⚠ ' + S.user.email + ' 은(는) 팀원 명단에 없습니다 ›';
    else if (S.err) t = '⚠ ' + S.err + ' ›';
    else { var q = Object.keys(rd(QK, {})).length; t = '☁ 같이 쓰는 중' + (S.user.id === 'open' ? '' : ' · ' + S.user.email) + (S.busy ? ' · 맞추는 중…' : q ? ' · 보낼 것 ' + q + '건' : S.photoLeft ? ' · 사진 보내는 중 ' + S.photoLeft + '장' : ' · 모두 맞춤'); }
    el.innerHTML = t; el.classList.toggle('on', !!(S.user && S.member && !S.err));
    var inst = document.querySelector('.inst'); if (inst && S.user && S.member) inst.innerHTML = '※ 견적·고객·지시서·일정·거래처·메모·가격표·회사 정보·현장 사진이 <b>서버에 함께 저장</b>됩니다.';
  }

  function start() {
    hookPhotos();
    if (!window.supabase || !window.supabase.createClient) { S.state = '불러오기 실패'; emit(); return; }
    S.client = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'deco-auth' } });
    S.client.auth.onAuthStateChange(function (ev, session) {
      var u = session && session.user; var was = S.user && S.user.id; if (u || !OPEN) S.user = u || null;
      if (!u) { if (OPEN) { if (S.user && S.user.id === 'open') return; S.user = { id: 'open', email: '로그인 없이' }; S.member = true; emit(); sync(!localStorage.getItem(LAST)); } else { S.member = null; emit(); } return; }
      if (was === u.id && S.member != null) return;
      S.client.from('members').select('email').eq('email', u.email).then(function (r) {
        S.member = !!(r.data && r.data.length); emit();
        if (S.member) sync(!localStorage.getItem(LAST));
      });
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && S.member) sync(); });
    setInterval(function () { if (S.member && (!document.hidden || (window.Notification && Notification.permission === 'granted'))) sync(); }, 60000);
    window.addEventListener('online', function () { if (S.member) sync(); });
    setTimeout(pushReg, 3000);
    emit();
  }
  // ---------- 서버 알림 (앱을 꺼 둬도 휴대폰에 알림) ----------
  var PUSH_PUB = 'BEF8hPtZJupghdggfkBwvOrYG7xplRP7zvPNA3XEsxRkqLyNIcMp7dl8iiOZMl9sfEAIyMavmNdpAXwkh5r1GDw';
  function b64u(s) { var p = '='.repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function pushReg() { if (!S.client || !('serviceWorker' in navigator) || !('PushManager' in window) || !window.Notification || Notification.permission !== 'granted') return;
    if (window.DECO && DECO.staff && DECO.staff()) return;
    navigator.serviceWorker.ready.then(function (r) { return r.pushManager.getSubscription().then(function (s) { return s || r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(PUSH_PUB) }); }); }).then(function (s) {
      var j = s.toJSON(), old = localStorage.getItem('deco-pushsub'); if (old === j.endpoint) return;
      var h = 0; for (var i = 0; i < j.endpoint.length; i++) h = (h * 31 + j.endpoint.charCodeAt(i)) | 0; var id = 'ps' + (h >>> 0).toString(36);
      return S.client.from('records').upsert({ coll: 'pushsub', id: id, data: { id: id, sub: j, at: Date.now(), dev: /iPhone|iPad/.test(navigator.userAgent) ? '아이폰' : /Android/.test(navigator.userAgent) ? '안드로이드' : '컴퓨터' } }, { onConflict: 'coll,id' })
        .then(function (r) { if (!r.error) localStorage.setItem('deco-pushsub', j.endpoint); }); }).catch(function () {}); }
  window.DECO_PUSH = pushReg;

  window.DECO_SYNC = {
    changed: changed, sync: function () { return sync(); }, state: function () { return S; }, on: function (f) { listeners.push(f); f(S); },
    login: function (email) {
      var to = location.href.replace(/[^\/]*([?#].*)?$/, '') + 'index.html';
      return S.client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: to, shouldCreateUser: true } });
    },
    logout: function () { return S.client.auth.signOut().then(function () { [SNAP, QK, LAST, PQ, PS].forEach(function (k) { localStorage.removeItem(k); }); }); },
    pending: function () { return Object.keys(rd(QK, {})).length; }
  };
  var s = document.createElement('script'); s.src = LIB; s.onload = start; s.onerror = function () { S.state = '불러오기 실패'; S.err = '인터넷 연결을 확인해 주세요. 자료는 이 기기에 저장되고 있습니다.'; emit(); };
  document.head.appendChild(s);
  hookPhotos();
  if (document.readyState !== 'loading') paint(); else document.addEventListener('DOMContentLoaded', paint);
})();
