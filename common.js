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
  // 기기마다 다른 글자 하나(A~Z) — 두 기기가 같은 날 번호를 만들어도 겹치지 않게
  function dev() { try { var v = localStorage.getItem('deco-dev'); if (!v) { v = 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]; localStorage.setItem('deco-dev', v); } return v; } catch (e) { return 'X'; } }
  function nextNo(all, pre) { var n = all.filter(function (x) { return x.no && x.no.indexOf(pre) === 0; }).length + 1, no;
    do { no = pre + pad(n++) + dev(); } while (all.some(function (x) { return x.no === no; })); return no; }
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
                q.id = 'q' + now.toString(36) + Math.random().toString(36).slice(2, 5); q.no = nextNo(all, 'DB-' + day + '-'); q.created = now;
      } else { q.no = old.no; q.created = old.created; }
      if (!q.vk) q.vk = (old && old.vk) || (Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6));   // 손님용 견적서 주소 열쇠
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
      o.id = 'w' + now.toString(36) + Math.random().toString(36).slice(2, 5); o.no = nextNo(all, '작업-' + day + '-'); o.created = now; }
    else { o.no = old.no; o.created = old.created; }
    o.updated = now; var next = all.filter(function (x) { return x.id !== o.id; }); next.push(o); if (!wr(KO, next)) return null;
    // 지시서 진행 상태 → 연결된 견적 상태도 앞으로만 맞춤 (진행 → 시공, 완료 → 완료)
    var to = { '진행': '시공', '완료': '완료' }[o.status], q = to && o.quoteId ? D.getQuote(o.quoteId) : null, R = ['상담', '실측', '계약', '시공', '완료'];
    if (q && R.indexOf(q.status || '상담') >= 0 && R.indexOf(q.status || '상담') < R.indexOf(to)) D.setQuoteStatus(q.id, to);
    return o; };
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
  var KK = 'deco-stock';
  D.stock = function () { return rd(KK, []); };
  D.saveStock = function (s) { var all = rd(KK, []); if (!s.id) s.id = 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); s.upd = Date.now(); var next = all.filter(function (x) { return x.id !== s.id; }); next.push(s); return wr(KK, next) ? s : null; };
  var KX = 'deco-exp';
  D.exps = function () { return rd(KX, []); };
  D.saveExp = function (x) { var all = rd(KX, []); if (!x.id) x.id = 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); x.upd = Date.now(); var next = all.filter(function (y) { return y.id !== x.id; }); next.push(x); return wr(KX, next) ? x : null; };
  D.delExp = function (id) { return wr(KX, rd(KX, []).filter(function (y) { return y.id !== id; })); };
  D.delStock = function (id) { return wr(KK, rd(KK, []).filter(function (x) { return x.id !== id; })); };
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
    // 견적 낸 뒤 3일·7일 지나도 상담·실측이면 다시 연락
    D.list().forEach(function (q) { var st = q.status || '상담'; if (st !== '상담' && st !== '실측') return; var g = -left(D.ymd(new Date(q.created || q.updated)));
      if (g === 3 || g === 7) { var c = q.cust || {}; out.push({ key: q.id + '@f' + g, n: 0, lab: '연락', date: D.today(), time: '', what: '', where: c.phone || '', href: 'quote.html?id=' + encodeURIComponent(q.id),
        txt: (c.name ? c.name + ' 님' : '견적 ' + q.no) + ' 견적 드린 지 ' + g + '일 지났습니다. 다시 연락해 보세요.' }); } });
    // 시공 1년 뒤 무상 점검 연락 (일주일 전·당일)
    D.orders().forEach(function (o) { if (!o.workDate || o.status === '보류') return; var y = (+o.workDate.slice(0, 4) + 1) + o.workDate.slice(4), n = left(y);
      if (n === 7 || n === 0) out.push({ key: o.id + '@as' + n, n: n, date: y, time: '', what: (o.name ? o.name + ' 님 ' : '') + '시공 1년 무상 점검 연락', where: o.addr || '', href: 'order.html?id=' + encodeURIComponent(o.id) }); });
    D.events().forEach(function (e) { if (e.done) return; var n = left(e.date);
      if (n === 1 || n === 0) out.push({ key: e.id + '@' + n, n: n, date: e.date, time: e.time || '', what: e.kind, where: e.title || '', href: 'calendar.html?d=' + e.date }); });
    return out.sort(function (a, b) { return a.n - b.n; }); };
  D.alertText = function (a) { if (a.txt) return a.txt; var d = new Date(a.date + 'T00:00'), when = (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + '일월화수목금토'[d.getDay()] + '요일' + (a.time ? (function (h, m) { return ' ' + (h < 12 ? '오전 ' : '오후 ') + (h % 12 || 12) + '시' + (m ? ' ' + m + '분' : ''); })(+a.time.slice(0, 2), +a.time.slice(3, 5)) : '');
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

  // ── 문서를 그림 한 장으로 (카톡으로 사진처럼 보내기) ──
  // D.docImg({ title, no, date, to, info:[[이름,값]], secs:[[제목, [[왼쪽, 오른쪽], ...]]], totals:[[이름, 값, 굵게]], notes:[...], pic: dataURL }) → Promise<Blob>
  D.docImg = function (o) { var s = D.settings(), W = 1080, P = 56, F = "'Noto Sans KR', sans-serif";
    function load(u) { return new Promise(function (ok) { if (!u) return ok(null); var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = u; }); }
    var ready = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 40px "Noto Sans KR"'), document.fonts.load('500 26px "Noto Sans KR"')]).catch(function () {}) : Promise.resolve();
    return Promise.all([load(o.pic), ready]).then(function (r) { var pic = r[0];
      function wrap(g, t, w) { var out = [], line = ''; String(t).split('').forEach(function (ch) { if (ch === '\n') { out.push(line); line = ''; return; } if (g.measureText(line + ch).width > w && line) { out.push(line); line = ch; } else line += ch; }); out.push(line); return out; }
      // 1차: 높이 계산, 2차: 그리기
      function pass(g, draw) { var y = 0;
        function txt(t, x, yy, font, col, al) { if (!draw) return; g.font = font; g.fillStyle = col || '#221C18'; g.textAlign = al || 'left'; g.fillText(t, x, yy); }
        function rect(x, yy, w, h, col) { if (draw) { g.fillStyle = col; g.fillRect(x, yy, w, h); } }
        rect(0, 0, W, 9999, '#FBF6EE');
        rect(0, 0, W, 190, '#2A211C'); txt(s.company, P, 70, '800 30px ' + F, '#F3C98A'); txt(o.title, P, 140, '800 58px ' + F, '#FFFFFF');
        txt((o.no ? o.no + '   ' : '') + (o.date || ''), W - P, 70, '500 24px ' + F, '#E9DCCB', 'right'); y = 190;
        if (o.to) { y += 66; txt(o.to, P, y, '800 38px ' + F); }
        y += 20; (o.info || []).forEach(function (x) { if (!x[1]) return; g.font = '500 27px ' + F; var ls = wrap(g, x[1], W - P * 2 - 170); ls.forEach(function (l, k) { y += 42; if (!k) txt(x[0], P, y, '700 26px ' + F, '#7A6E66'); txt(l, P + 170, y, '500 27px ' + F); }); });
        (o.secs || []).forEach(function (sc) { var rows = (sc[1] || []).filter(function (x) { return x && (x[0] || x[1]); }); if (!rows.length) return;
          y += 40; rect(P, y, W - P * 2, 52, '#3B2F2A'); txt(sc[0], P + 18, y + 36, '800 27px ' + F, '#FFFFFF'); y += 52;
          rows.forEach(function (x, k) { g.font = '500 27px ' + F; var rw = x[1] ? g.measureText(x[1]).width + 30 : 0, ls = wrap(g, x[0], W - P * 2 - 36 - rw), h = ls.length * 38 + 22;
            rect(P, y, W - P * 2, h, k % 2 ? '#FFFFFF' : '#F6EBDD'); ls.forEach(function (l, j) { txt(l, P + 18, y + 40 + j * 38, '500 27px ' + F); }); if (x[1]) txt(x[1], W - P - 18, y + 40, '700 27px ' + F, '#221C18', 'right'); y += h; }); });
        if (o.totals && o.totals.length) { y += 30; o.totals.forEach(function (x) { if (!x) return; var big = x[2]; y += big ? 70 : 44;
          if (big) { rect(P, y - 50, W - P * 2, 68, '#FCEBD2'); txt(x[0], P + 18, y, '800 34px ' + F); txt(x[1], W - P - 18, y, '800 40px ' + F, '#B5541C', 'right'); }
          else { txt(x[0], P + 18, y, '500 27px ' + F, '#4A403A'); txt(x[1], W - P - 18, y, '700 27px ' + F, '#221C18', 'right'); } }); }
        if (pic) { var ph = Math.round((W - P * 2) * pic.height / pic.width); y += 70; txt(o.picCap || '예상 모습', P, y, '800 27px ' + F); y += 14; if (draw) g.drawImage(pic, P, y, W - P * 2, ph); y += ph; }
        (o.notes || []).forEach(function (n, k) { if (!n) return; g.font = '500 24px ' + F; wrap(g, n, W - P * 2).forEach(function (l, j) { y += (k || j) ? 36 : 56; txt(l, P, y, '500 24px ' + F, '#4A403A'); }); });
        y += 50; rect(0, y, W, 120, '#2A211C'); txt(s.company + (s.ceo ? '  대표 ' + s.ceo : ''), P, y + 50, '800 28px ' + F, '#F3C98A'); txt('📞 ' + (s.phone || ''), W - P, y + 50, '800 30px ' + F, '#FFFFFF', 'right');
        txt([s.addr, s.bizno ? '사업자 ' + s.bizno : ''].filter(Boolean).join('  ·  '), P, y + 92, '500 21px ' + F, '#E9DCCB'); return y + 120; }
      var c = document.createElement('canvas'), g = c.getContext('2d'); c.width = W; c.height = 100; var H = pass(g, false); c.height = H; pass(c.getContext('2d'), true);
      return new Promise(function (ok, no) { c.toBlob(function (b) { b ? ok(b) : no(new Error('그림을 만들지 못했습니다')); }, 'image/jpeg', 0.9); }); }); };
  // 그림 보내기: 핸드폰은 공유 창(카톡 고르기), 컴퓨터는 내려받기
  D.shareImg = function (blob, name, text) { var f = new File([blob], name, { type: 'image/jpeg' }), ok = false;
    try { ok = !!(navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) {}
    if (ok) return navigator.share({ files: [f], text: text || '' }).then(function () { return '보냈습니다.'; }, function () { return '보내기를 취소했습니다.'; });
    var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    return Promise.resolve('그림 파일을 내려받았습니다. 카톡 대화방에서 📎(+) → 사진으로 보내세요.'); };

  // ── 카톡에 붙여넣기 좋은 글 ──
  // D.kfmt({ title, info:[['👤','고객','홍길동 님'],...], secs:[['작업 내용',[...]],...], total:['💰 합계 : 1,000원', ...], foot:['※ ...'] })
  D.KL = '━━━━━━━━━━━━━━';
  // 손님용 온라인 견적서 주소 · 손님 답(okq)
  D.viewLink = function (q) { return q && q.vk ? 'https://mkenc3-ctrl.github.io/decobright/view.html?q=' + encodeURIComponent(q.id) + '&k=' + q.vk : ''; };
  D.seen = function () { var m = {}; rd('deco-seen', []).forEach(function (x) { if (x && x.qid && !x._del) m[x.qid] = x; }); return m; };
  D.okq = function () { return rd('deco-okq', []).filter(function (a) { return a && a.qid && !a._del; }); };
  // 하루 할 일 카톡 (아침 단톡방용): 시공 현장·작업자·일정·자재·재고·연락할 고객·내일 미리 보기
  D.dayBrief = function (ds) { ds = ds || D.today(); var d = new Date(ds + 'T00:00'), PT = D.partners(), today = ds === D.today();
    function ptn(id) { return PT.filter(function (p) { return p.id === id; })[0]; }
    function wd(x) { return (x.getMonth() + 1) + '월 ' + x.getDate() + '일 (' + '일월화수목금토'[x.getDay()] + ')'; }
    var O = D.orders().filter(function (o) { return o.workDate === ds && o.status !== '보류'; }), site = [], mats = [];
    O.forEach(function (o, i) { site.push((i + 1) + '. ' + (o.name ? o.name + ' 님' : '현장') + (o.addr ? ' · ' + o.addr : '') + (o.status === '완료' ? ' (끝남)' : ''));
      if (o.addr) site.push('- 🗺 길 안내 https://map.kakao.com/link/search/' + encodeURIComponent(o.addr));
      D.TRADES.forEach(function (t) { var b = o.trades && o.trades[t]; if (!b || !b.on) return; var p = ptn(b.partner);
        site.push('- ' + t + ' ' + (b.time || '') + (p ? '  ' + p.name + (p.phone ? ' ' + p.phone : '') : ''));
        if (b.mats) mats.push('- [' + t + '] ' + (o.name || o.addr || '') + ' : ' + String(b.mats).replace(/\n/g, ', ')); });
      if (o.lead) site.push('- 현장 책임 ' + o.lead); });
    var EV = D.events().filter(function (e) { return e.date === ds && !e.done; }).sort(function (a, b) { return (a.time || '99').localeCompare(b.time || '99'); })
      .map(function (e, i) { return (i + 1) + '. ' + (e.time ? e.time + '  ' : '') + e.kind + (e.title ? ' — ' + e.title : ''); });
    var low = D.stock().filter(function (s) { return s.min && s.qty <= s.min; }).map(function (s) { return s.name + ' (지금 ' + s.qty + (s.unit || '개') + ')'; });
    var call = today ? D.alerts().filter(function (a) { return a.n === 0 && (a.lab === '연락' || /점검/.test(a.what || '')); }).map(function (a) { return D.alertText(a); }) : [];
    var t2 = new Date(d.getTime() + 864e5), ds2 = D.ymd(t2), nx = D.dayItems(ds2).map(function (x) { return (x.time ? x.time + '  ' : '') + x.t; });
    var wx = D.wx(ds);
    return D.kfmt({ icon: '☀', title: today ? '오늘 할 일' : '할 일', info: [['📅', '날짜', wd(d)], ['🌤', '날씨', wx], ['📌', '요약', '시공 ' + O.length + '곳 · 일정 ' + EV.length + '건']],
      secs: [['🛠 시공 현장', site.length ? site : ['시공 일정 없음']], ['📍 실측·상담·방문', EV], ['🧰 챙길 자재', mats], ['📦 주문할 재고', low], ['📞 연락할 고객', call], ['🔜 내일 ' + wd(t2), nx.length ? nx : ['일정 없음']]],
      foot: [today ? '오늘도 안전 작업 부탁드립니다! 💪' : ''] }); };
  // 날씨 (창원 기준, 3일 예보를 기기에 기억)
  var WXK = { 0: '☀ 맑음', 1: '🌤 대체로 맑음', 2: '⛅ 구름 조금', 3: '☁ 흐림', 45: '🌫 안개', 48: '🌫 안개' };
  function wxName(c) { return WXK[c] || (c >= 95 ? '⛈ 뇌우' : c >= 80 ? '🌦 소나기' : c >= 71 && c <= 77 ? '❄ 눈' : c >= 51 && c <= 67 ? '🌧 비' : '☁ 흐림'); }
  D.wx = function (ds) { var m = rd('deco-wx', {}), w = m[ds]; if (!w) return ''; return wxName(w.c) + ' ' + Math.round(w.lo) + '~' + Math.round(w.hi) + '℃' + (w.p != null ? ' · 비 올 확률 ' + w.p + '%' : '') + (w.p >= 60 ? ' (자재 젖지 않게 챙기세요)' : ''); };
  D.wxLoad = function () { var m = rd('deco-wx', {}); if (m._at && Date.now() - m._at < 3 * 36e5) return Promise.resolve();
    return fetch('https://api.open-meteo.com/v1/forecast?latitude=35.23&longitude=128.68&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=3').then(function (r) { return r.json(); }).then(function (j) { var d = j.daily, o = { _at: Date.now() };
      d.time.forEach(function (t, i) { o[t] = { c: d.weather_code[i], hi: d.temperature_2m_max[i], lo: d.temperature_2m_min[i], p: d.precipitation_probability_max ? d.precipitation_probability_max[i] : null }; }); try { localStorage.setItem('deco-wx', JSON.stringify(o)); } catch (e) {} }).catch(function () {}); };
  // 하루 마감 보고 (저녁)
  D.dayEnd = function (ds) { ds = ds || D.today(); var d = new Date(ds + 'T00:00'), t0 = d.getTime(), t1 = t0 + 864e5, wd = function (x) { return (x.getMonth() + 1) + '월 ' + x.getDate() + '일 (' + '일월화수목금토'[x.getDay()] + ')'; };
    var O = D.orders().filter(function (o) { return o.workDate === ds && o.status !== '보류'; }), site = O.map(function (o) { var pg = o.prog || {}; return (o.status === '완료' || pg.done ? '✅ ' : pg['in'] ? '🔨 ' : pg.go ? '🚚 ' : '⏳ ') + (o.name ? o.name + ' 님' : o.addr || '현장') + (o.status === '완료' || pg.done ? ' 완료' : pg['in'] ? ' 작업 중' : pg.go ? ' 출발함' : ' 시작 기록 없음'); });
    var ins = [], sum = 0; D.list().forEach(function (q) { (q.pays || []).forEach(function (p) { if (p.d === ds) { sum += +p.amt || 0; ins.push(((q.cust && q.cust.name) || q.no) + ' 님 ' + (p.kind || '') + ' ' + D.won(p.amt)); } }); });
    var nq = D.list().filter(function (q) { return (q.created || 0) >= t0 && (q.created || 0) < t1; }), ex = D.exps().filter(function (x) { return x.d === ds; }).reduce(function (a, x) { return a + (+x.amt || 0); }, 0);
    var ck = rd('deco-chk', []).filter(function (c) { return c && !c._del && c.at >= t0 && c.at < t1; }), nochk = O.filter(function (o) { return !ck.some(function (c) { return c.oid === o.id; }); });
    var as = rd('deco-asreq', []).filter(function (a) { return a && !a._del && a.at >= t0 && a.at < t1; }), ok = rd('deco-okq', []).filter(function (a) { return a && !a._del && a.at >= t0 && a.at < t1; });
    var t2 = new Date(t1), nx = D.dayItems(D.ymd(t2)).map(function (x) { return (x.time ? x.time + '  ' : '') + x.t; });
    return D.kfmt({ icon: '🌙', title: '오늘 마감 보고', info: [['📅', '날짜', wd(d)], ['📌', '요약', '시공 ' + O.length + '곳 · 새 견적 ' + nq.length + '건 · 입금 ' + ins.length + '건']],
      secs: [['🛠 오늘 현장', site.length ? site : ['시공 없음']], ['⚠ 점검표 아직 안 온 현장', nochk.map(function (o) { return o.name || o.addr || '현장'; })], ['💰 오늘 들어온 돈', ins], ['🧾 오늘 지출', ex ? [D.won(ex)] : []], ['📨 손님 답·하자 접수', ok.map(function (a) { return (a.name || '손님') + ' 님 ' + (a.act === 'ok' ? '진행 결정' : '상담 요청'); }).concat(as.map(function (a) { return '🛠 ' + (a.name || '고객') + ' 님 하자 접수'; }))], ['🔜 내일 ' + wd(t2), nx.length ? nx : ['일정 없음']]],
      total: sum ? ['💰 오늘 입금 합계 : ' + D.won(sum)] : [], foot: ['오늘도 수고 많으셨습니다! 🙏'] }); };
  D.kfmt = function (o) { var s = D.settings(), L = [D.KL, (o.icon || '📋') + ' ' + s.company + ' ' + o.title, D.KL];
    (o.info || []).forEach(function (r) { if (r && r[2] !== '' && r[2] != null) L.push(r[0] + ' ' + r[1] + ' : ' + r[2]); });
    (o.secs || []).forEach(function (x) { var ls = (x[1] || []).filter(function (t) { return t != null && String(t).trim() !== ''; }); if (!ls.length) return;
      L.push('', '▶ ' + x[0]); ls.forEach(function (t) { String(t).split('\n').forEach(function (u) { if (!u.trim()) return; L.push(/^\s*(\d+[.)]|·|-|※|\()/.test(u) ? ' ' + u.trim() : ' · ' + u.trim()); }); }); });
    if (o.total && o.total.length) { L.push('', D.KL); o.total.forEach(function (t) { if (t) L.push(t); }); L.push(D.KL); } else L.push('');
    (o.foot || []).forEach(function (t) { if (t) L.push(t); });
    L.push('📞 ' + s.company + ' ' + (s.phone || ''));
    return L.join('\n').replace(/\n{3,}/g, '\n\n'); };
  // 미리보기 창: 고쳐서 복사 / 카톡·문자로 보내기
  D.kakao = function (text, title) {
    if (!document.getElementById('kkSt')) { var st = document.createElement('style'); st.id = 'kkSt';
      st.textContent = '#kk{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;display:flex;align-items:flex-end;justify-content:center}#kk>div{background:#fff;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:16px 16px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));box-sizing:border-box}#kk b{font-size:19px}#kk p{margin:6px 0 10px;color:#7A6E66;font-size:15px}#kk textarea{width:100%;box-sizing:border-box;min-height:46vh;font-size:15px;line-height:1.6;font-family:inherit;border:1px solid #CDBBA3;border-radius:10px;padding:10px;background:#FFFBEA}#kk .r{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}#kk .r button{flex:1 1 140px;font:inherit;font-size:17px;font-weight:800;height:54px;border-radius:12px;border:1px solid #CDBBA3;background:#fff;cursor:pointer}#kk .r .y{background:#FEE500;border-color:#FEE500;color:#191919}#kk .r .k{background:#3B2F2A;border-color:#3B2F2A;color:#fff}#kk .m{min-height:22px;font-weight:700;color:#2E6A4E;margin:8px 0 0}@media(min-width:600px){#kk{align-items:center}#kk>div{border-radius:16px}}';
      document.head.appendChild(st); }
    var old = document.getElementById('kk'); if (old) old.remove();
    var w = document.createElement('div'); w.id = 'kk'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.innerHTML = '<div><b>💬 ' + D.esc(title || '카톡으로 보내기') + '</b><p>카톡에 붙여넣으면 이렇게 보입니다. 고칠 곳이 있으면 여기서 고친 뒤 누르세요.</p><textarea aria-label="보낼 내용"></textarea>' +
      '<div class="r"><button type="button" class="y" data-a="cp">📋 복사하기</button>' + (navigator.share ? '<button type="button" class="k" data-a="sh">💬 카톡·문자 고르기</button>' : '') + '<button type="button" data-a="x">닫기</button></div><p class="m" role="status"></p></div>';
    document.body.appendChild(w); var ta = w.querySelector('textarea'), m = w.querySelector('.m'); ta.value = text;
    function cp() { var t = ta.value; return (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { m.textContent = '✔ 복사했습니다. 카톡 대화방 입력칸을 길게 눌러 「붙여넣기」 하세요.'; },
      function () { ta.focus(); ta.select(); try { document.execCommand('copy'); m.textContent = '✔ 복사했습니다. 카톡 대화방에 붙여넣기 하세요.'; } catch (e) { m.textContent = '글을 길게 눌러 「전체 선택 → 복사」 해 주세요.'; } }); }
    w.addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (e.target === w || (b && b.dataset.a === 'x')) { w.remove(); return; } if (!b) return;
      if (b.dataset.a === 'cp') cp();
      if (b.dataset.a === 'sh') { cp(); navigator.share({ text: ta.value }).catch(function () {}); } });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { w.remove(); document.removeEventListener('keydown', esc); } });
    cp(); return w; };

  window.DECO = D;
  // 말로 입력: data-mic 가 붙은 칸 옆에 🎤 버튼 (안드로이드 크롬·삼성 인터넷 등 지원 브라우저만)
  function micInit() { var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return;
    if (!document.getElementById('micCss')) { var st = document.createElement('style'); st.id = 'micCss'; st.textContent = '.micb{margin-top:6px;border:1px solid #d9c9b0;background:#fff;border-radius:10px;padding:8px 14px;font-size:16px;cursor:pointer;font-family:inherit}.micb.on{background:#b5462f;color:#fff;border-color:#b5462f}'; document.head.appendChild(st); }
    document.querySelectorAll('[data-mic]:not([data-micok])').forEach(function (el) { el.setAttribute('data-micok', '1');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'micb'; b.textContent = '🎤 말로 입력'; b.setAttribute('aria-label', '말로 입력');
      el.insertAdjacentElement('afterend', b);
      b.addEventListener('click', function () { if (b.rec) { b.rec.stop(); return; }
        var r = new SR(); r.lang = 'ko-KR'; r.interimResults = false; r.continuous = false; b.rec = r; b.classList.add('on'); b.textContent = '● 듣는 중… (다시 누르면 멈춤)';
        r.onresult = function (e) { var t = ''; for (var i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; t = t.trim(); if (!t) return;
          el.value = el.value ? el.value.replace(/\s*$/, '') + (el.tagName === 'TEXTAREA' ? '\n' : ' ') + t : t; el.dispatchEvent(new Event('input', { bubbles: true })); };
        r.onend = r.onerror = function () { b.rec = null; b.classList.remove('on'); b.textContent = '🎤 말로 입력'; };
        try { r.start(); } catch (e) { r.onend(); } }); }); }
  // 인터넷 끊김 안내 띠
  function netBar() { var b = document.getElementById('netBar');
    if (navigator.onLine !== false) { if (b) b.remove(); return; }
    if (b || !document.body) return; b = document.createElement('div'); b.id = 'netBar'; b.setAttribute('role', 'status');
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:60;background:#3B2F2A;color:#fff;font-size:15px;line-height:1.4;padding:10px max(16px,env(safe-area-inset-left,0px)) calc(10px + env(safe-area-inset-bottom,0px));text-align:center';
    b.textContent = '📶 인터넷이 끊겼습니다. 입력한 자료는 이 기기에 저장되고, 다시 연결되면 자동으로 서버에 보냅니다.'; document.body.appendChild(b); }
  window.addEventListener('online', netBar); window.addEventListener('offline', netBar); document.addEventListener('DOMContentLoaded', netBar);
  D.micInit = micInit;
  // 실측 기록 → 줄글 (지시서·문자용)
  D.measureText = function (q) { var m = q && q.measure; if (!m) return []; var L = [], h = [];
    if (m.ch) h.push('천장 높이 ' + m.ch + 'cm'); if (m.mat) h.push('천장 ' + m.mat); if (m.pan) h.push('분전함 ' + m.pan); if (h.length) L.push(h.join(' · '));
    (m.rooms || []).forEach(function (r) { var t = [];
      if (r.w || r.l) t.push((r.w || '?') + '×' + (r.l || '?')); if (r.ww || r.wl) t.push('우물 ' + (r.ww || '?') + '×' + (r.wl || '?') + (r.wd ? ' 깊이 ' + r.wd : ''));
      if (r.ck && r.ck.length) t.push(r.ck.join(', ')); if (r.note) t.push(r.note); L.push('- ' + (r.name || '공간') + ': ' + (t.join(' · ') || '기록 없음')); });
    if (m.memo) L.push('메모: ' + m.memo); return L; };
  // 주소 → 길찾기 링크 (카카오맵·네이버지도)
  D.mapLinks = function (addr) { addr = String(addr || '').trim(); if (!addr) return ''; var a = encodeURIComponent(addr);
    return '<a class="btn2" href="https://map.kakao.com/link/search/' + a + '" target="_blank" rel="noopener">카카오맵 길찾기</a><a class="btn2" href="https://map.naver.com/p/search/' + a + '" target="_blank" rel="noopener">네이버지도</a>'; };
  document.addEventListener('DOMContentLoaded', micInit);
  // 휴대폰 설치(홈 화면에 추가)용 — 인터넷 주소(https)나 내 컴퓨터(localhost)에서만 동작
  // 휴대폰 알림: 손님 답·하자 접수·점검표·새 사진 (지난번 확인 뒤 새로 온 것만)
  D.ntfShow = function (t, b, url, tag) { if (!('Notification' in window) || Notification.permission !== 'granted') return;
    var o = { body: b, tag: tag || t, icon: 'icons/icon.svg', badge: 'icons/icon.svg', data: { url: url || 'index.html' } };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function (r) { r.showNotification(t, o); }).catch(function () { try { new Notification(t, o); } catch (e) {} });
    else try { new Notification(t, o); } catch (e) {} };
  D.rvMerge = function () { var R = rd('deco-rvq', []).filter(function (r) { return r && r.oid && !r._del; }); if (!R.length) return 0; var n = 0;
    D.orders().forEach(function (o) { var r = R.filter(function (x) { return x.oid === o.id; })[0]; if (!r || (o.review && o.review.from === 'web' && o.review.at >= r.at)) return;
      o.review = { star: r.star, text: r.text, ok: !!r.ok, at: r.at, from: 'web' }; D.saveOrder(o); n++; }); return n; };
  D.ntfCheck = function () { if (!('Notification' in window) || Notification.permission !== 'granted') return; var K = 'deco-ntf-at', last = +localStorage.getItem(K) || 0, now = Date.now();
    try { localStorage.setItem(K, String(now)); } catch (e) {} if (!last) return;
    var nw = function (k, f) { return rd(k, []).filter(function (x) { return x && !x._del && (+x[f] || 0) > last; }); };
    nw('deco-okq', 'at').forEach(function (a) { D.ntfShow('데코브라이트 · 손님 답', (a.name || a.no || '손님') + ' 님 ' + (a.act === 'ok' ? '「이 견적으로 진행」' : '「상담이 더 필요」') + (a.md ? ' · 실측 희망 ' + a.md : ''), 'list.html', 'okq-' + a.qid); });
    nw('deco-asreq', 'at').forEach(function (a) { D.ntfShow('데코브라이트 · 🛠 하자 접수', (a.name || '고객') + ' 님 · ' + ((a.kinds || []).join(', ') || a.say || ''), 'index.html', 'as-' + a.id); });
    nw('deco-rvq', 'at').forEach(function (r) { D.ntfShow('데코브라이트 · ⭐ 새 후기', '★'.repeat(r.star || 0) + ' ' + (r.text || '').slice(0, 40), 'stats.html', 'rv-' + r.id); });
    nw('deco-chk', 'at').forEach(function (c) { D.ntfShow('데코브라이트 · 점검표 도착', (c.by || '작업자') + (c.tr ? ' (' + c.tr + ')' : '') + (c.no && c.no.length ? ' · 못 한 것 ' + c.no.length + '개' : ' · 모두 확인'), 'order.html?id=' + encodeURIComponent(c.oid), 'chk-' + c.id); });
    if (D.photoAll) D.photoAll().then(function (a) { var N = a.filter(function (p) { return p.by && (p.added || 0) > last; }); if (!N.length) return; var c = N.filter(function (p) { return /^손님/.test(p.by); }).length;
      D.ntfShow('데코브라이트 · 📸 새 사진 ' + N.length + '장', c ? '손님이 보낸 사진 ' + c + '장 포함' : '작업자가 올린 사진', 'photos.html', 'photo-new'); }).catch(function () {}); };
  try { D.rvMerge(); } catch (e) {}
  // ── 자동 백업: 일주일에 한 번 이 기기 안(IndexedDB)에 자료 사본을 남김 (최근 4개) ──
  var BKK = ['deco-quotes', 'deco-customers', 'deco-orders', 'deco-events', 'deco-partners', 'deco-memos', 'deco-settings', 'deco-prices', 'deco-stock', 'deco-exp'];
  function bkDb() { return new Promise(function (ok, no) { var r = indexedDB.open('deco-bk', 1); r.onupgradeneeded = function () { r.result.createObjectStore('snap', { keyPath: 'at' }); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; }); }
  D.bkList = function () { return bkDb().then(function (db) { return new Promise(function (ok, no) { var q = db.transaction('snap').objectStore('snap').getAll(); q.onsuccess = function () { ok((q.result || []).sort(function (a, b) { return b.at - a.at; })); }; q.onerror = function () { no(q.error); }; }); }); };
  D.bkNow = function () { var o = { app: 'decobright', ver: 1, at: Date.now(), auto: 1, data: {} }, n = 0; BKK.forEach(function (k) { var v = rd(k, null); if (v != null) { o.data[k] = v; if (Array.isArray(v)) n += v.length; } }); o.n = n; if (!Object.keys(o.data).length) return Promise.resolve(null);
    return bkDb().then(function (db) { return D.bkList().then(function (L) { return new Promise(function (ok, no) { var tx = db.transaction('snap', 'readwrite'), st = tx.objectStore('snap'); st.put(o); L.slice(3).forEach(function (x) { st.delete(x.at); }); tx.oncomplete = function () { try { localStorage.setItem('deco-autobk', String(o.at)); } catch (e) {} ok(o); }; tx.onerror = function () { no(tx.error); }; }); }); }); };
  window.addEventListener('load', function () { var l = +localStorage.getItem('deco-autobk') || 0; if (window.indexedDB && Date.now() - l > 7 * 864e5) setTimeout(function () { D.bkNow().catch(function () {}); }, 6000); });
  // ── 직원 기기 모드: 가격표·회사 설정·돈 화면은 사장님 번호를 넣어야 열림 (이 기기에만 적용) ──
  D.sha = function (t) { if (!(window.crypto && crypto.subtle)) return Promise.resolve('p' + t.split('').reduce(function (h, c) { return (h * 31 + c.charCodeAt(0)) | 0; }, 7)); return crypto.subtle.digest('SHA-256', new TextEncoder().encode('deco|' + t)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }); };
  D.staff = function () { try { return localStorage.getItem('deco-staff') || ''; } catch (e) { return ''; } };
  (function () { if (!D.staff() || !/(^|\/)(prices|settings|stats|expense)\.html$/.test(location.pathname)) return; try { if (sessionStorage.getItem('deco-unlock') === '1') return; } catch (e) {}
    var st = document.createElement('style'); st.textContent = 'body>*:not(#stLock){visibility:hidden}'; document.head.appendChild(st);
    window.addEventListener('DOMContentLoaded', function () { var d = document.createElement('div'); d.id = 'stLock';
      d.style.cssText = 'position:fixed;inset:0;z-index:99;background:#FBF6EE;display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit';
      d.innerHTML = '<div style="background:#fff;border:2px solid #3B2F2A;border-radius:16px;padding:20px;max-width:380px;width:100%;text-align:center"><div style="font-size:40px">🔒</div><h2 style="margin:6px 0">사장님 확인이 필요합니다</h2><p style="font-size:16px;color:#7A6E66;margin:0 0 12px">이 기기는 직원용입니다. 가격·돈 화면은 사장님 번호를 넣어야 열립니다.</p>' +
        '<input id="stP" type="password" inputmode="numeric" autocomplete="off" placeholder="사장님 번호" style="font:inherit;font-size:22px;text-align:center;width:100%;padding:10px;border:2px solid #CDBBA3;border-radius:10px"><button type="button" id="stG" style="font:inherit;font-size:19px;font-weight:800;width:100%;margin-top:10px;padding:12px;border:0;border-radius:12px;background:#3B2F2A;color:#fff">열기</button><p id="stM" style="color:#B42318;font-weight:700;min-height:22px;margin:8px 0 0"></p><a href="index.html" style="font-size:16px">← 처음 화면으로</a></div>';
      document.body.appendChild(d); var go = function () { D.sha(document.getElementById('stP').value.trim()).then(function (h) { if (h === D.staff()) { try { sessionStorage.setItem('deco-unlock', '1'); } catch (e) {} st.remove(); d.remove(); } else { document.getElementById('stM').textContent = '번호가 맞지 않습니다.'; } }); };
      document.getElementById('stG').onclick = go; document.getElementById('stP').onkeydown = function (e) { if (e.key === 'Enter') go(); }; }); })();
  window.addEventListener('load', function () { setTimeout(D.ntfCheck, 4000); });
  if ('serviceWorker' in navigator && /^(https:|http:\/\/localhost)/.test(location.href)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
