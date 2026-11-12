// 데코브라이트 견적 — 공통 기능: 기기 저장(견적·회사 정보), 금액 표시, 뒤로 가기, 휴대폰 설치
(function () {
  var KQ = 'deco-quotes', KS = 'deco-settings';
  function rd(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } try { window.DECO_SYNC && window.DECO_SYNC.changed(k, v); } catch (e) {} return true; }
  var DEF = { company: '데코브라이트', bizName: '데코브라이트 간접조명 실링팬', ceo: '이상호 외 1명', bizno: '480-38-01362', addr: '경상남도 창원시 의창구 봉곡로120번길 1(봉곡동)',
    bizType: '건설업, 도매 및 소매업', bizItem: '일반 전기 공사업, 그 외 기타 건축 마무리 공사업, 전구·램프 및 조명장치 도매업, 전기용품 및 조명장치 소매업', phone: '010-5854-2143', email: '', bank: '', staff: '', validDays: 30,
    slogan: '간접 조명 · 실링팬 전문 브랜드', deposit: 500000, vat: 'separate',
    refund: '계약금은 시공 일정 확정으로 인해 반환이 불가합니다.',
    closing: '우리 집을 인테리어한다는 마음으로\n생각하고 최선을 다해 시공하겠습니다.\n\n감사합니다. ^^',
    area: '창원', tags: '#데코브라이트 #데코브라이트간접조명 #데코브라이트실링팬 #경남간접조명 #경남실링팬 #창원간접조명 #김해간접조명 #부산간접조명 #창원실링팬 #부산실링팬 #우물천장간접조명 #실링팬시공 #간접조명시공 #창원인테리어', blog: 'blog.naver.com/decobright',
    terms: '실측과 현장 여건(천장 구조, 배선, 실링팬 모델)에 따라 금액이 달라질 수 있으며 방문 확인 후 확정됩니다.' };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var D = {
    won: function (n) { return Math.round(n || 0).toLocaleString('ko-KR') + '원'; },
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    date: function (t) { var d = new Date(t); return d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '.'; },
    settings: function () { var s = rd(KS, {}); var o = {}; for (var k in DEF) o[k] = (s[k] != null && s[k] !== '') ? s[k] : DEF[k]; return o; },
    saveSettings: function (s) { return wr(KS, s); },
    list: function () { return rd(KQ, []).sort(function (a, b) { return b.updated - a.updated; }); },
    getQuote: function (id) { return rd(KQ, []).filter(function (q) { return q.id === id; })[0] || null; },
    saveQuote: function (q) {
      var all = rd(KQ, []), now = Date.now(), old = q.id ? all.filter(function (x) { return x.id === q.id; })[0] : null;
      if (!old) {
        var d = new Date(now), day = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
        var n = all.filter(function (x) { return x.no && x.no.indexOf('DB-' + day) === 0; }).length + 1;
        q.id = 'q' + now.toString(36) + Math.random().toString(36).slice(2, 5); q.no = 'DB-' + day + '-' + pad(n); q.created = now;
      } else { q.no = old.no; q.created = old.created; }
      q.updated = now;
      var next = all.filter(function (x) { return x.id !== q.id; }); next.push(q);
      if (wr(KQ, next)) return q;
      q.img = ''; next[next.length - 1] = q;            // 저장 공간이 모자라면 미리보기 그림을 빼고 다시 저장
      return wr(KQ, next) ? q : null;
    },
    delQuote: function (id) { return wr(KQ, rd(KQ, []).filter(function (x) { return x.id !== id; })); },
    goBack: function () { if (history.length > 1 && document.referrer && new URL(document.referrer).origin === location.origin) history.back(); else location.href = 'index.html'; },
    // 금액을 한글로 (견적서 「일금 ○○원정」)
    hanWon: function (n) {
      n = Math.round(n || 0); if (!n) return '영';
      var dg = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'], sm = ['', '십', '백', '천'], bg = ['', '만', '억', '조'], out = '', g = 0;
      while (n > 0) { var part = n % 10000, s = ''; for (var i = 0; i < 4; i++) { var d = Math.floor(part / Math.pow(10, i)) % 10; if (d) s = dg[d] + sm[i] + s; }
        if (s) out = s + bg[g] + out; n = Math.floor(n / 10000); g++; }
      return out;
    }
  };
  // ---------- 가격표 (prices-default.js 기본값 + 기기에 저장한 고친 값) ----------
  var KP = 'deco-prices';
  D.priceEdits = function () { return rd(KP, { pkgs: {}, items: {}, extra: [] }); };
  D.savePriceEdits = function (o) { return wr(KP, o); };
  D.pkgs = function () { var e = D.priceEdits().pkgs || {};
    return (window.DECO_PKGS0 || []).map(function (p) { var x = e[p.id] || {}, o = {}; for (var k in p) o[k] = p[k];
      if (x.price != null && p.id !== 'none') o.price = x.price; if (x.desc) o.desc = x.desc; if (x.name) o.name = x.name; o.hide = !!x.hide && p.id !== 'none'; return o; }); };
  D.items = function () { var E2 = D.priceEdits(), e = E2.items || {};
    return (window.DECO_ITEMS0 || []).map(function (i) { var x = e[i.id] || {}, o = {}; for (var k in i) o[k] = i[k];
      if (x.price != null) o.price = x.price; if (x.name) o.name = x.name; if (x.unit) o.unit = x.unit; o.hide = !!x.hide; return o; })
      .concat((E2.extra || []).map(function (x) { return { id: x.id, name: x.name, price: x.price, unit: x.unit || '개', hide: !!x.hide, editable: !!x.editable }; })); };

  // ---------- 견적 상태 ----------
  D.STATUS = ['상담', '실측', '계약', '시공', '완료', '보류'];
  D.setQuoteStatus = function (id, st) { var all = rd(KQ, []); all.forEach(function (q) { if (q.id === id) q.status = st; }); return wr(KQ, all); };

  // ---------- 작업 지시서 (기기 저장) ----------
  var KO = 'deco-orders';
  D.orders = function () { return rd(KO, []).sort(function (a, b) { return (b.workDate || '').localeCompare(a.workDate || '') || b.updated - a.updated; }); };
  D.getOrder = function (id) { return rd(KO, []).filter(function (o) { return o.id === id; })[0] || null; };
  D.saveOrder = function (o) { var all = rd(KO, []), now = Date.now(), old = o.id ? all.filter(function (x) { return x.id === o.id; })[0] : null;
    if (!old) { var d = new Date(now), day = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
      o.id = 'w' + now.toString(36) + Math.random().toString(36).slice(2, 5); o.no = '작업-' + day + '-' + pad(all.filter(function (x) { return x.no && x.no.indexOf('작업-' + day) === 0; }).length + 1); o.created = now; }
    else { o.no = old.no; o.created = old.created; }
    o.updated = now; var next = all.filter(function (x) { return x.id !== o.id; }); next.push(o); return wr(KO, next) ? o : null; };
  D.delOrder = function (id) { return wr(KO, rd(KO, []).filter(function (x) { return x.id !== id; })); };

  // ---------- 고객 (기기 저장). 견적을 저장하면 같은 전화번호 고객에 자동으로 묶임 ----------
  var KC = 'deco-customers';
  D.SOURCES = ['소개', '인터넷 검색', '블로그·카페', '전단·현수막', '아파트 단지', '재방문', '기타'];
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  D.customers = function () { return rd(KC, []).sort(function (a, b) { return (b.touched || b.updated) - (a.touched || a.updated); }); };
  D.getCustomer = function (id) { return rd(KC, []).filter(function (c) { return c.id === id; })[0] || null; };
  D.saveCustomer = function (c) { var all = rd(KC, []), now = Date.now();
    if (!c.id) { c.id = 'c' + now.toString(36) + Math.random().toString(36).slice(2, 5); c.created = now; c.logs = c.logs || []; }
    c.updated = now; var next = all.filter(function (x) { return x.id !== c.id; }); next.push(c); return wr(KC, next) ? c : null; };
  D.delCustomer = function (id) { return wr(KC, rd(KC, []).filter(function (x) { return x.id !== id; })); };
  // 견적의 고객 정보로 고객을 찾거나 새로 만듦 → 고객 id
  D.ensureCustomer = function (cust, custId) {
    var all = rd(KC, []), p = digits(cust.phone), hit = custId ? all.filter(function (c) { return c.id === custId; })[0] : null;
    if (!hit && p.length >= 9) hit = all.filter(function (c) { return digits(c.phone) === p; })[0];
    if (!hit && !p && cust.name) hit = all.filter(function (c) { return !digits(c.phone) && c.name === cust.name && (c.addr || '') === (cust.addr || ''); })[0];
    if (hit) { var ch = false; ['name', 'phone', 'addr'].forEach(function (k) { if (cust[k] && !hit[k]) { hit[k] = cust[k]; ch = true; } });
      hit.touched = Date.now(); D.saveCustomer(hit); return hit.id; }
    if (!cust.name && !p) return '';
    var n = D.saveCustomer({ name: cust.name || '', phone: cust.phone || '', addr: cust.addr || '', source: '', memo: '', logs: [], touched: Date.now() });
    return n ? n.id : '';
  };
  D.custQuotes = function (c) { var p = digits(c.phone); return D.list().filter(function (q) { return q.custId === c.id || (p.length >= 9 && digits(q.cust && q.cust.phone) === p); }); };
  // 예전에 저장한 견적도 고객에 묶기
  D.syncCustomers = function () { var all = rd(KQ, []), ch = false;
    all.forEach(function (q) { if (!q.custId && q.cust && (q.cust.name || q.cust.phone)) { q.custId = D.ensureCustomer(q.cust); ch = true; } });
    if (ch) wr(KQ, all); };

  // ---------- 거래처 (작업 지시를 내리는 곳: 전기·목수·도배) ----------
  var KT = 'deco-partners';
  D.TRADES = ['목수', '전기', '도배'];          // 하루 시공 순서: 목공 → 전기 → 도배
  D.partners = function () { return rd(KT, []); };
  D.savePartner = function (p) { var all = rd(KT, []); if (!p.id) p.id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); var next = all.filter(function (x) { return x.id !== p.id; }); next.push(p); return wr(KT, next) ? p : null; };
  D.delPartner = function (id) { return wr(KT, rd(KT, []).filter(function (x) { return x.id !== id; })); };
  // 견적 내용 한 줄을 공종으로 나눔
  D.tradeOf = function (t) { if (/도배|벽지/.test(t)) return '도배'; if (/목공|보강|몰딩|세로면|목수|합판|석고|한방라운드/.test(t)) return '목수'; return '전기'; };

  // ---------- 메모장 ----------
  var KM = 'deco-memos';
  D.memos = function () { return rd(KM, []).sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.updated - a.updated; }); };
  D.saveMemo = function (m) { var all = rd(KM, []); if (!m.id) { m.id = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); m.created = Date.now(); } m.updated = Date.now();
    var next = all.filter(function (x) { return x.id !== m.id; }); next.push(m); return wr(KM, next) ? m : null; };
  D.delMemo = function (id) { return wr(KM, rd(KM, []).filter(function (x) { return x.id !== id; })); };

  // ---------- 일정 (실측·상담 방문 등, 시공은 작업 지시서에서) ----------
  var KE = 'deco-events';
  D.KINDS = ['실측 방문', '상담', '자재 입고', '하자 보수 방문', '기타'];
  D.events = function () { return rd(KE, []); };
  D.saveEvent = function (e) { var all = rd(KE, []); if (!e.id) e.id = 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); e.updated = Date.now();
    var next = all.filter(function (x) { return x.id !== e.id; }); next.push(e); return wr(KE, next) ? e : null; };
  D.delEvent = function (id) { return wr(KE, rd(KE, []).filter(function (x) { return x.id !== id; })); };
  // 하루 일정 (시공 지시서 + 일정)
  D.dayItems = function (ds) {
    return D.orders().filter(function (o) { return o.workDate === ds; }).map(function (o) { return { k: 0, time: o.workTime || '', t: '시공 ' + (o.name || ''), done: o.status === '완료', id: o.id }; })
      .concat(D.events().filter(function (e) { return e.date === ds; }).map(function (e) { return { k: D.KINDS.indexOf(e.kind) + 1, time: e.time || '', t: e.kind, done: !!e.done, id: e.id }; }))
      .sort(function (a, b) { return (a.time || '99').localeCompare(b.time || '99'); });
  };
  // 다가오는 알림: 시공은 7일·3일·1일 전, 일정(실측 등)은 1일 전
  D.alerts = function () { var t0 = new Date(D.today() + 'T00:00').getTime(), out = [];
    function left(ds) { return Math.round((new Date(ds + 'T00:00').getTime() - t0) / 864e5); }
    D.orders().forEach(function (o) { if (!o.workDate || o.status === '완료' || o.status === '보류') return; var n = left(o.workDate);
      if (n === 7 || n === 3 || n === 1 || n === 0) out.push({ key: o.id + '@' + n, n: n, date: o.workDate, time: o.workTime || '', what: (o.name ? o.name + ' 님 ' : '') + '현장 시공', where: o.addr || '', href: 'order.html?id=' + encodeURIComponent(o.id) }); });
    D.events().forEach(function (e) { if (e.done) return; var n = left(e.date);
      if (n === 1 || n === 0) out.push({ key: e.id + '@' + n, n: n, date: e.date, time: e.time || '', what: e.kind, where: e.title || '', href: 'calendar.html?d=' + e.date }); });
    return out.sort(function (a, b) { return a.n - b.n; }); };
  D.alertText = function (a) { var d = new Date(a.date + 'T00:00'), when = (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + '일월화수목금토'[d.getDay()] + '요일' + (a.time ? (function (h, m) { return ' ' + (h < 12 ? '오전 ' : '오후 ') + (h % 12 || 12) + '시' + (m ? ' ' + m + '분' : ''); })(+a.time.slice(0, 2), +a.time.slice(3, 5)) : '');
    var left = a.n === 0 ? '오늘입니다' : a.n === 1 ? '내일입니다' : a.n === 3 ? '3일 남았습니다' : '일주일 남았습니다';
    return when + ', ' + a.what + ' 일정이 ' + left + '.'; };
  D.speak = function (text) { try { if (!('speechSynthesis' in window)) return false; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = .95;
    var v = speechSynthesis.getVoices().filter(function (x) { return /ko/i.test(x.lang); })[0]; if (v) u.voice = v; speechSynthesis.speak(u); return true; } catch (e) { return false; } };
  D.ymd = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };

  // ---------- 작업 사진 보관함 (사진은 커서 IndexedDB에 저장) ----------
  D.STAGES = ['시공 전', '시공 중', '시공 후', '자재·도면', '하자·보수', '기타'];
  var dbp = null;
  function db() { if (!dbp) dbp = new Promise(function (ok, no) { var r = indexedDB.open('deco-photos', 1);
    r.onupgradeneeded = function () { var s = r.result.createObjectStore('photos', { keyPath: 'id' }); s.createIndex('job', 'job'); };
    r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; }); return dbp; }
  function tx(mode, fn) { return db().then(function (d) { return new Promise(function (ok, no) { var t = d.transaction('photos', mode), s = t.objectStore('photos'), out = fn(s);
    t.oncomplete = function () { ok(out && out.result !== undefined ? out.result : out); }; t.onerror = function () { no(t.error); }; }); }); }
  D.photoAdd = function (p) { p.id = p.id || ('p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)); p.added = p.added || Date.now(); return tx('readwrite', function (s) { s.put(p); }).then(function () { return p; }); };
  D.photoAll = function () { return tx('readonly', function (s) { return s.getAll(); }).then(function (a) { return (a || []).sort(function (x, y) { return y.taken - x.taken || y.added - x.added; }); }); };
  D.photoDel = function (id) { return tx('readwrite', function (s) { s.delete(id); }); };
  D.photoPut = function (p) { return tx('readwrite', function (s) { s.put(p); }); };
  // 사진을 긴 변 1600 이하 JPEG로 줄임 (저장 공간 절약)
  D.shrink = function (file, max) { max = max || 1600; return new Promise(function (ok, no) { var u = URL.createObjectURL(file), im = new Image();
    im.onload = function () { var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(function (b) { b ? ok({ blob: b, w: c.width, h: c.height }) : no(new Error('변환 실패')); }, 'image/jpeg', .82); };
    im.onerror = function () { URL.revokeObjectURL(u); no(new Error('사진을 열 수 없음')); }; im.src = u; }); };
  D.today = function () { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };

  window.DECO = D;
  // 휴대폰 설치(홈 화면에 추가)용 — 인터넷 주소(https)나 내 컴퓨터(localhost)에서만 동작
  if ('serviceWorker' in navigator && /^(https:|http:\/\/localhost)/.test(location.href)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
