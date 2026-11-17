// 데코브라이트 견적 — 공통 기능: 기기 저장(견적·회사 정보), 금액 표시, 뒤로 가기, 휴대폰 설치
(function () {
  var KQ = 'deco-quotes', KS = 'deco-settings';
  function rd(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } try { window.DECO_SYNC && window.DECO_SYNC.changed(k, v); } catch (e) {} return true; }
  var DEF = { kakaoCh: 'http://pf.kakao.com/_NHdxnn/chat', blogUrl: 'https://blog.naver.com/decobright', areaTxt: '부산 · 창원 · 경남 전 지역', goal: '', stamp: '', coupon: '소개받아 오신 분 시공비 5% 할인 (소개해 주신 분께도 감사 선물)', company: '데코브라이트', bizName: '데코브라이트 간접조명 실링팬', ceo: '이상호 외 1명', bizno: '480-38-01362', addr: '경상남도 창원시 의창구 봉곡로120번길 1(봉곡동)',
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
      if (x.price != null && p.id !== 'none') o.price = x.price; if (x.desc) { o.desc = x.desc; o.descEdited = true; } if (x.name) o.name = x.name; if (x.lines) o.lines = x.lines; if (x.opts) o.opts = x.opts; if (x.note) o.note = x.note; o.hide = !!x.hide && p.id !== 'none'; return o; }); };
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
  // ---------- AI 정리 대기함 (매일 오전·오후 10시에 컴퓨터의 Claude가 정리) ----------
  var KI = 'deco-inbox';
  D.inbox = function () { return rd(KI, []).filter(function (x) { return x && x.id; }).sort(function (a, b) { return b.at - a.at; }); };
  D.inboxAdd = function (text, src) { var all = rd(KI, []), x = { id: 'ib' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: Date.now(), text: String(text || '').slice(0, 150000), src: src || '붙여넣기', st: 'wait' }; all.push(x); return wr(KI, all) ? x : null; };
  D.saveInbox = function (x) { return wr(KI, rd(KI, []).filter(function (y) { return y.id !== x.id; }).concat([x])); };
  D.delInbox = function (id) { return wr(KI, rd(KI, []).filter(function (x) { return x.id !== id; })); };
  // AI가 넣은 것 되돌리기 (새로 만든 고객·일정·메모, 덧붙인 상담 기록)
  D.undoInbox = function (x) { (x.made || []).forEach(function (m) {
      if (m.c === 'events') D.delEvent(m.id); else if (m.c === 'memos') D.delMemo(m.id); else if (m.c === 'customers' && m.isNew) D.delCustomer(m.id);
      else if (m.c === 'clog') { var c = D.getCustomer(m.id); if (c) { c.logs = (c.logs || []).filter(function (l) { return l.id !== m.log; }); D.saveCustomer(c); } } });
    x.st = 'undo'; x.ack = 1; D.saveInbox(x); };

  // ---------- 일정 (실측·상담 방문 등, 시공은 작업 지시서에서) ----------
  var KE = 'deco-events';
  // 고객·현장 특징 (지시서에 「현장 주의」로 나옴)
  D.TAGS = ['엘리베이터 없음', '주차 어려움', '반려동물', '아기·어르신 있음', '층고 높음', '오전만 가능', '주말만 가능', '관리실 신고 필요', '소음 민감', '단골·소개 많음'];
  D.KINDS = ['실측 방문', '상담', '자재 입고', '하자 보수 방문', '기타', '시공 예정', '휴무'];
  D.events = function () { return rd(KE, []); };
  D.saveEvent = function (e) { var all = rd(KE, []); if (!e.id) e.id = 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); e.updated = Date.now();
    var next = all.filter(function (x) { return x.id !== e.id; }); next.push(e); return wr(KE, next) ? e : null; };
  D.delEvent = function (id) { return wr(KE, rd(KE, []).filter(function (x) { return x.id !== id; })); };
  // ---------- 공개용 「바쁜 날」 (e모델하우스 실측 희망일 고르기에 씀, 개인 정보 없음) ----------
  D.pubFree = function () { var t0 = D.today(), e = new Date(); e.setDate(e.getDate() + 35); var t1 = e.getFullYear() + '-' + pad(e.getMonth() + 1) + '-' + pad(e.getDate()), B = {};
    D.orders().forEach(function (o) { if (o.workDate && o.workDate >= t0 && o.workDate <= t1 && o.status !== '보류' && o.status !== '완료') B[o.workDate] = (B[o.workDate] || 0) + 2; });
    D.events().forEach(function (x) { if (x.date && x.date >= t0 && x.date <= t1 && !x.done && /실측|시공|하자|휴무/.test(x.kind || '')) B[x.date] = (B[x.date] || 0) + (x.kind === '휴무' ? 9 : x.kind === '시공 예정' ? 2 : 1); });
    var old = rd('deco-pub', []).filter(function (x) { return x && x.id === 'free'; })[0];
    if (old && JSON.stringify(old.busy) === JSON.stringify(B) && old.from === t0) return;
    wr('deco-pub', rd('deco-pub', []).filter(function (x) { return x && x.id && x.id !== 'free'; }).concat([{ id: 'free', from: t0, busy: B, at: Date.now() }])); };
  // 고친 금액·내역을 손님 화면(e모델하우스 손님용)에 올림 — 서버 pub/pkgs. 바뀐 게 없으면 false
  D.pubPkgs = function () { var E2 = D.priceEdits(), ed = { pkgs: E2.pkgs || {}, items: E2.items || {}, extra: E2.extra || [] }, arr = rd('deco-pub', []).filter(function (x) { return x && x.id; }), old = arr.filter(function (x) { return x.id === 'pkgs'; })[0];
    if (old && JSON.stringify(old.ed) === JSON.stringify(ed)) return false; var it = { id: 'pkgs', at: Date.now(), ed: ed };
    try { localStorage.setItem('deco-pubpk', JSON.stringify({ at: it.at, ed: ed })); } catch (e) {}
    return wr('deco-pub', arr.filter(function (x) { return x.id !== 'pkgs'; }).concat([it])); };
  // ---------- 주소 → 시·군 / 구 (구가 없으면 읍·면·동) ----------
  // ---------- 주소 → 아파트 단지 이름 (지번 다음 ~ 「○동/○호」 앞) ----------
  D.apt = function (a) { var t = String(a || '').replace(/\([^)]*\)/g, ' ').replace(/,/g, ' ').trim().split(/\s+/), i, s = -1, e = t.length;
    for (i = 0; i < t.length; i++) { if (/^\d+(-\d+)?(번지)?$/.test(t[i])) s = i; if (/^\d+동$|^\d+호$|^[A-Z]?\d+-\d+$/.test(t[i])) { e = i; break; } }
    var n = s >= 0 ? t.slice(s + 1, e) : t.slice(0, e).filter(function (x) { return /아파트|APT|타운|맨션|빌|캐슬|파크|자이|푸르지오|힐스테이트|래미안|더샵|e편한세상|아이파크|유보라|위브|휴먼시아|시티|하이츠|단지/i.test(x); });
    n = n.join('').replace(/아파트$|APT$/i, ''); return n.length >= 2 && e < t.length ? n : ''; };
  // 같은 단지에서 계약·시공한 현장 (자기 자신 빼고)
  D.aptJobs = function (addr, cid) { var k = D.apt(addr), r = D.region(addr), J = [], seen = {}; if (!k) return { k: '', J: J };
    var same = function (a) { var b = D.region(a); return D.apt(a) === k && (!r.si || !b.si || b.si === r.si); };
    D.orders().forEach(function (o) { if (o.status === '보류' || (cid && o.custId === cid) || !same(o.addr)) return; var q = o.quoteId ? D.getQuote(o.quoteId) : null; if (q) seen[q.id] = 1;
      J.push({ d: o.workDate || '', pkg: (q && q.pkgName) || '', amt: q && q.totals ? q.totals.total || 0 : 0, qid: q ? q.id : '', done: o.status === '완료' }); });
    D.list().forEach(function (q) { if (seen[q.id] || (cid && q.custId === cid) || !/계약|시공|완료/.test(q.status || '') || !same(q.cust && q.cust.addr)) return;
      J.push({ d: q.wish || D.date(q.updated), pkg: q.pkgName || '', amt: q.totals ? q.totals.total || 0 : 0, qid: q.id, done: q.status === '완료' }); });
    J.sort(function (a, b) { return a.d < b.d ? 1 : -1; }); return { k: k, J: J }; };
  D.region = (function () {
    return function (a) { var T = String(a || '').replace(/[(),]/g, ' ').split(/\s+/).filter(Boolean), si = '', gu = '', i = 0;
    for (; i < T.length; i++) { var t = T[i];
      if (/(특별시|광역시|특별자치시)$/.test(t) || /^(서울|부산|대구|인천|광주|대전|울산|세종)$/.test(t)) { si = t.replace(/(특별시|광역시|특별자치시)$/, ''); i++; break; }
      if (/(도|특별자치도)$/.test(t) && !/(시|군)$/.test(t)) continue;
      if (/[가-힣](시|군)$/.test(t)) { si = t; i++; break; } }
    if (!si) return { si: '', gu: '' };
    for (; i < T.length && i < 5; i++) { if (/[가-힣]구$/.test(T[i])) { gu = T[i]; break; } if (!gu && /[가-힣](읍|면|동|가)$/.test(T[i]) && !/[0-9]/.test(T[i])) { gu = T[i]; break; } }
    return { si: si, gu: gu }; };
  })();
  // ---------- 다른 화면에서 넣은 날짜 → 시공 달력에 자동 등록 (연결 일정 id는 L로 시작, 날짜를 지우면 달력에서도 빠짐) ----------
  function linkEv(id, date, kind, time, custId, title) { var all = rd(KE, []), old = all.filter(function (x) { return x.id === id; })[0];
    if (!date) { if (old) wr(KE, all.filter(function (x) { return x.id !== id; })); return; }
    if (old && old.date === date && (old.time || '') === (time || '') && old.kind === kind && (old.title || '') === (title || '') && (old.custId || '') === (custId || '')) return;
    D.saveEvent({ id: id, date: date, time: time || '', kind: kind, custId: custId || '', title: title || '', auto: 1, done: !!(old && old.date === date && old.done) }); }
  D.linkQuote = function (q) { if (!q || !q.id) return; var v = q.visit || {}, w = q.wish || (q.sign && q.sign.d1) || '', who = (q.cust && (q.cust.name || q.cust.addr)) || '';
    linkEv('Lv' + q.id, v.d || '', '실측 방문', v.t || '', q.custId, '견적 ' + (q.no || '') + (who ? ' · ' + who : ''));
    var hasO = D.orders().some(function (o) { return o.quoteId === q.id && o.workDate && o.status !== '보류'; });   // 지시서가 생기면 지시서 시공일이 달력에 나오므로 「시공 예정」은 뺌
    linkEv('Lw' + q.id, hasO || q.status === '보류' ? '' : w, '시공 예정', '', q.custId, '견적 ' + (q.no || '') + (who ? ' · ' + who : '') + (q.pkgName ? ' · ' + q.pkgName : '')); };
  D.linkCustomer = function (c) { if (!c || !c.id) return; var x = c.next || {}; linkEv('Ln' + c.id, x.d || '', '상담', '', c.id, '📞 다시 연락' + (x.m ? ' · ' + x.m : '')); };
  (function () { var sq = D.saveQuote, so = D.saveOrder, sc = D.saveCustomer;
    D.saveQuote = function (q) { try { var o0 = q && q.id ? D.getQuote(q.id) : null, t0 = o0 && o0.totals ? o0.totals.total || 0 : 0, t1 = q.totals ? q.totals.total || 0 : 0; q.hist = (o0 && o0.hist) || q.hist || [];
      if (o0 && t0 && t1 && (t0 !== t1 || (o0.pkgName || '') !== (q.pkgName || ''))) { q.hist = q.hist.concat([{ at: Date.now(), from: t0, to: t1, pkg0: o0.pkgName || '', pkg: q.pkgName || '' }]).slice(-10); } } catch (e) {}
      var r = sq.apply(this, arguments); try { if (r) D.linkQuote(r); } catch (e) {} return r; };
    D.saveOrder = function (o) { var r = so.apply(this, arguments); try { if (o && o.quoteId) { var q = D.getQuote(o.quoteId); if (q) D.linkQuote(q); } } catch (e) {} return r; };
    D.saveCustomer = function (c) { var r = sc.apply(this, arguments); try { if (r) D.linkCustomer(r); } catch (e) {} return r; }; })();
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
    // 고객 다음 연락할 날
    D.customers().forEach(function (c) { var x = c.next; if (!x || !x.d) return; var n = left(x.d); if (n > 0 || n < -7) return;
      out.push({ key: c.id + '@nx' + x.d, n: 0, lab: '연락', date: D.today(), time: '', what: '', where: c.phone || '', href: 'customer.html?id=' + encodeURIComponent(c.id), txt: (c.name || c.phone || '고객') + ' 님 다시 연락할 날' + (n < 0 ? '이 ' + (-n) + '일 지났습니다' : '입니다') + (x.m ? ': ' + x.m : '') }); });
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
    return Promise.all([load(o.pic), ready, load(o.stamp && /^data:image\//.test(s.stamp || '') ? s.stamp : '')]).then(function (r) { var pic = r[0], stp = r[2];
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
        if (stp) { var sw = 150, sh = Math.round(sw * stp.height / stp.width); y += 40; txt(s.company + (s.ceo ? '  대표 ' + s.ceo : ''), W - P - sw - 16, y + sh / 2 + 10, '800 28px ' + F, '#221C18', 'right'); if (draw) g.drawImage(stp, W - P - sw, y, sw, sh); y += sh; }
        y += 50; rect(0, y, W, 120, '#2A211C'); txt(s.company + (s.ceo ? '  대표 ' + s.ceo : ''), P, y + 50, '800 28px ' + F, '#F3C98A'); txt('📞 ' + (s.phone || ''), W - P, y + 50, '800 30px ' + F, '#FFFFFF', 'right');
        txt([s.addr, s.bizno ? '사업자 ' + s.bizno : ''].filter(Boolean).join('  ·  '), P, y + 92, '500 21px ' + F, '#E9DCCB'); return y + 120; }
      var c = document.createElement('canvas'), g = c.getContext('2d'); c.width = W; c.height = 100; var H = pass(g, false); c.height = H; pass(c.getContext('2d'), true);
      return new Promise(function (ok, no) { c.toBlob(function (b) { b ? ok(b) : no(new Error('그림을 만들지 못했습니다')); }, 'image/jpeg', 0.9); }); }); };
  // 그림 보내기: 핸드폰은 공유 창(카톡 고르기), 컴퓨터는 내려받기
  // ── 그림 보내기 (카톡에 맞춤) ──
  // 1) 긴 그림은 카톡에서 글씨가 작아지지 않게 빈 줄에서 나눠 여러 장으로
  // 2) 미리보기 창의 노란 버튼을 눌러야 공유 창이 열림 (휴대폰이 「누른 직후」만 공유를 허락하기 때문)
  // 3) 사진만 공유하고, 함께 갈 글은 복사해 둠 → 카톡 입력칸에 붙여넣기 (사진+글을 같이 넘기면 카톡이 한쪽을 빠뜨림)
  function splitImg(blob) {
    return new Promise(function (ok) { var u = URL.createObjectURL(blob), im = new Image();
      im.onerror = function () { URL.revokeObjectURL(u); ok([blob]); };
      im.onload = function () { var w = im.naturalWidth, h = im.naturalHeight; if (h <= w * 1.6) { URL.revokeObjectURL(u); ok([blob]); return; }
        try { var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'); g.drawImage(im, 0, 0); URL.revokeObjectURL(u);
          var plain = function (y) { var d = g.getImageData(0, y, w, 1).data; for (var i = 4; i < d.length; i += 16) { if (Math.abs(d[i] - d[0]) + Math.abs(d[i + 1] - d[1]) + Math.abs(d[i + 2] - d[2]) > 18) return false; } return true; };
          var n = Math.ceil(h / (w * 1.35)), cuts = [0];
          for (var k = 1; k < n; k++) { var t = Math.round(h * k / n), best = t; for (var dd = 0; dd < 260; dd += 2) { if (plain(t - dd)) { best = t - dd; break; } if (plain(t + dd)) { best = t + dd; break; } } cuts.push(best); }
          cuts.push(h);
          Promise.all(cuts.slice(1).map(function (y2, i) { var y1 = cuts[i], p = document.createElement('canvas'); p.width = w; p.height = y2 - y1;
            var pg = p.getContext('2d'); pg.fillStyle = '#fff'; pg.fillRect(0, 0, w, p.height); pg.drawImage(c, 0, y1, w, y2 - y1, 0, 0, w, y2 - y1);
            return new Promise(function (r) { p.toBlob(function (b) { r(b); }, 'image/jpeg', 0.9); }); })).then(function (L) { ok(L.every(Boolean) ? L : [blob]); });
        } catch (e) { ok([blob]); } };
      im.src = u; }); }
  D.shareImg = function (blob, name, text) {
    return splitImg(blob).then(function (B) { return new Promise(function (done) {
      if (!document.getElementById('ksSt')) { var st = document.createElement('style'); st.id = 'ksSt';
        st.textContent = '#ks{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:210;display:flex;align-items:flex-end;justify-content:center}#ks>div{background:#fff;width:100%;max-width:560px;max-height:94vh;overflow:auto;border-radius:16px 16px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));box-sizing:border-box;color:#221C18}#ks b{font-size:19px}#ks p{margin:6px 0 10px;color:#7A6E66;font-size:15px}#ks .pv{max-height:44vh;overflow:auto;border:1px solid #CDBBA3;border-radius:10px;background:#F4EEE6;padding:6px;display:grid;gap:6px}#ks .pv img{width:100%;display:block;border-radius:6px}#ks .tx{white-space:pre-wrap;background:#FFFBEA;border:1px solid #E8D9A8;border-radius:10px;padding:8px 10px;font-size:14px;color:#221C18;max-height:16vh;overflow:auto}#ks .r{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}#ks .r button{flex:1 1 140px;font:inherit;font-size:17px;font-weight:800;height:56px;border-radius:12px;border:1px solid #CDBBA3;background:#fff;color:#221C18;cursor:pointer}#ks .r .y{background:#FEE500;border-color:#FEE500;color:#191919;flex-basis:100%;font-size:19px;height:62px}#ks .m{min-height:22px;font-weight:700;color:#2E6A4E;margin:8px 0 0}@media(min-width:600px){#ks{align-items:center}#ks>div{border-radius:16px}}';
        document.head.appendChild(st); }
      var old = document.getElementById('ks'); if (old) old.remove();
      var F = B.map(function (b, i) { return new File([b], B.length > 1 ? name.replace(/(\.jpe?g)?$/i, '_' + (i + 1) + '.jpg') : name, { type: 'image/jpeg' }); }), can = false, U = B.map(function (b) { return URL.createObjectURL(b); }), last = '';
      try { can = !!(navigator.canShare && navigator.canShare({ files: F })); } catch (e) {}
      var w = document.createElement('div'); w.id = 'ks'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
      w.innerHTML = '<div><b>💬 카톡으로 보내기</b><p>' + (B.length > 1 ? '글씨가 잘 보이게 <b style="font-size:inherit">' + B.length + '장</b>으로 나눴습니다. ' : '') + (can ? '노란 버튼을 누르고 「카카오톡」 → 받을 사람을 고르세요.' : '「사진 저장」 뒤 카톡 대화방에서 ＋ → 사진(앨범)으로 보내세요.') + '</p>' +
        '<div class="pv">' + U.map(function (u, i) { return '<img src="' + u + '" alt="보낼 그림 ' + (i + 1) + '">'; }).join('') + '</div>' +
        (text ? '<p style="margin:10px 0 4px">함께 보낼 글 <small>(버튼을 누르면 복사해 둡니다 → 사진을 보낸 뒤 입력칸을 길게 눌러 「붙여넣기」)</small></p><div class="tx"></div>' : '') +
        '<div class="r">' + (can ? '<button type="button" class="y" data-a="sh">💬 카톡으로 보내기' + (B.length > 1 ? ' (' + B.length + '장)' : '') + '</button>' : '') + '<button type="button" data-a="sv">💾 사진 저장</button><button type="button" data-a="x">닫기</button></div><p class="m" role="status"></p></div>';
      document.body.appendChild(w); if (text) w.querySelector('.tx').textContent = text; var m = w.querySelector('.m');
      function say(t) { last = t; m.textContent = t; }
      function cp() { if (!text) return Promise.resolve(false); return (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { return true; }, function () { return false; }); }
      function close() { w.remove(); setTimeout(function () { U.forEach(function (u) { URL.revokeObjectURL(u); }); }, 1000); done(last || '닫았습니다.'); }
      w.addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (e.target === w || (b && b.dataset.a === 'x')) { close(); return; } if (!b) return;
        if (b.dataset.a === 'sh') { var c0 = cp(); navigator.share({ files: F }).then(function () { return c0.then(function (c) { say('✔ 보냈습니다.' + (c ? ' 안내 글도 복사해 두었으니, 카톡 입력칸을 길게 눌러 「붙여넣기」 하세요.' : '')); }); },
          function (er) { say(er && er.name === 'AbortError' ? '보내기를 취소했습니다. 다시 누르면 됩니다.' : '공유 창을 열지 못했습니다. 「사진 저장」 뒤 카톡에서 보내 주세요.'); }); }
        if (b.dataset.a === 'sv') { F.forEach(function (f, i) { setTimeout(function () { var a = document.createElement('a'), u = URL.createObjectURL(f); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }, i * 400); });
          cp().then(function (c) { say('✔ 사진 ' + F.length + '장을 저장했습니다. 카톡 대화방 ＋ → 앨범에서 보내세요.' + (c ? ' 안내 글은 복사해 두었습니다.' : '')); }); } });
      document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', esc); if (document.body.contains(w)) close(); } });
    }); }); };

  // ── 카톡에 붙여넣기 좋은 글 ──
  // D.kfmt({ title, info:[['👤','고객','홍길동 님'],...], secs:[['작업 내용',[...]],...], total:['💰 합계 : 1,000원', ...], foot:['※ ...'] })
  D.KL = '━━━━━━━━━━━━━━';
  // 자주 쓰는 답장 (reply.html · 고객 화면 공용)
  D.REPLY_DEF = [
  { id: 'r1', title: '가격 문의', body: '안녕하세요, {회사}입니다 😊\n천장 조명 공사는 집 크기와 원하시는 조명 종류에 따라 금액이 달라집니다.\n집 평수와 원하시는 곳(거실·주방·방)을 알려 주시거나, 천장 사진을 보내 주시면 바로 견적을 보내 드리겠습니다.\n📞 {전화}' },
  { id: 'r2', title: '시공 기간·시간', body: '보통 30평대 아파트 기준으로 하루(아침 8시 ~ 오후) 안에 끝납니다.\n목수 작업 → 전기 작업 → 도배 마무리 순서로 진행하고, 작업이 끝나면 청소까지 해 드립니다.' },
  { id: 'r3', title: '실측 방문 안내', body: '정확한 견적을 위해 실측 방문을 해 드립니다 (무료).\n편하신 날짜와 시간을 알려 주시면 맞춰 찾아뵙겠습니다.\n방문 시간은 20~30분 정도 걸립니다.' },
  { id: 'r4', title: '계약금·입금 안내', body: '계약금 입금 후 시공 날짜가 확정됩니다.\n입금 계좌: {계좌}\n입금하신 뒤 성함을 알려 주시면 확인해 드리겠습니다. 감사합니다.' },
  { id: 'r5', title: '하자 보증(A/S)', body: '{회사} 시공은 1년 무상 점검을 해 드립니다.\n조명이 깜빡이거나 꺼지는 등 문제가 생기면 사진과 함께 연락 주세요. 빠르게 찾아뵙겠습니다.\n📞 {전화}' },
  { id: 'r6', title: '시공 사례 보기', body: '{지역} 지역 시공 사례는 아래 블로그에서 보실 수 있습니다.\n마음에 드시는 사진을 보내 주시면 같은 느낌으로 견적 드리겠습니다.' }
];
  D.replies = function () { var a = rd('deco-reply', null); a = Array.isArray(a) ? a.filter(function (x) { return x && x.id && !x._del; }) : null; var init = false; try { init = !!localStorage.getItem('deco-reply-init'); } catch (e) {} return a && (a.length || init) ? a : D.REPLY_DEF.slice(); };
  D.replyFill = function (t) { var S = D.settings(); return String(t || '').replace(/\{회사\}/g, S.company || '데코브라이트').replace(/\{전화\}/g, S.phone || '').replace(/\{계좌\}/g, S.bank || '(계좌는 회사 정보 설정에 적어 주세요)').replace(/\{지역\}/g, S.area || '') + (/\{지역\}|블로그/.test(t) && S.blog ? '\n' + (/^http/.test(S.blog) ? '' : 'https://') + S.blog : ''); };
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
  // 숨고 견적 메시지 (광고 상품 + 요즘 트렌드 견적 + 연락처 묶음). pkg: 견적에서 고른 패키지 id, nmIn: 고객 이름
  D.soomgo = function (pkg, nmIn) { const s=D.settings(), won=D.won, PKGS=D.pkgs().filter(p=>!p.web), mw=v=>v%10000===0?(v/10000).toLocaleString()+"만 원":won(v);
    const p=PKGS.find(x=>x.id===pkg&&(x.lines||x.opts))||PKGS.find(x=>x.ad)||PKGS.find(x=>x.trend); if(!p){ return ""; }
    const nm=String(nmIn||"").trim().replace(/\s*(고객님|님)$/,""), L=[];
    L.push("안녕하세요"+(nm?", "+nm+" 고객님":"")+". "+(s.company||"데코브라이트")+"입니다.");
    L.push(p.name.replace(/\s*\(.*\)$/,"")+" 구성과 금액 안내드립니다.","");
    // 요즘 트렌드 견적 모양: [거실] - 항목 : 금액 … 총 견적
    const trBlock=t=>{ L.push("■ 요즘 트렌드 시공 견적 ("+((t.name.match(/\(([^)]*)\)/)||[])[1]||"거실 기준")+")"); let g="";
      t.lines.forEach(l=>{ if(l[0]!==g){ g=l[0]; L.push("","["+g+"]"); } L.push("- "+l[1]+" : "+mw(l[2])); }); L.push("","총 견적 : "+mw(t.price)); if(t.blog) L.push("▶ 트렌드 시공 사례 : "+t.blog); };
    if(p.trend) trBlock(p); else { L.push("■ 기본 구성 — "+mw(p.price));
    (p.lines||[]).forEach((l,i)=>L.push((i+1)+". "+l[1]+(l[2]?" ("+mw(l[2])+")":""))); }
    if(p.opts&&p.opts.length){ L.push("","■ 추가 추천 항목"); p.opts.forEach((o,i)=>L.push((i+1)+". "+o[1]+" — "+mw(o[2])+(o[3]==="개"&&o[2]<100000?" (개당)":"")+(o[4]?" ("+o[4]+")":""))); }
    if(p.note&&p.note.length){ L.push("","■ "+p.note[0].replace(/^·\s*/,"")); p.note.slice(1).forEach(x=>L.push(x.replace(/^·\s*/,"• "))); }
    const tr=PKGS.find(x=>x.trend&&x.lines&&x.lines.length); if(tr&&tr!==p){ L.push(""); trBlock(tr); }
    L.push("","✔ 실측 후 정확한 견적을 드립니다","✔ 대부분 하루면 시공이 끝납니다","✔ 시공 부위는 1년 동안 무상 점검해 드립니다","");
    L.push("실제 시공 사진·영상은 아래에서 보실 수 있습니다.","https://mkenc3-ctrl.github.io/decobright/house.html","");
    L.push("편하신 실측 날짜를 알려 주시면 일정 잡아 드리겠습니다. 감사합니다.","");
    L.push("🏠 시공지역 : "+(s.areaTxt||"부산 · 창원 · 경남 전지역"),"☎ 상담문의 : "+(s.phone||""));
    if(s.kakaoCh) L.push("➡️ 카톡상담 : "+s.kakaoCh); if(s.blogUrl) L.push("📝 더 많은 시공후기 : "+s.blogUrl);
    return L.join("\n"); };
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

  // ---------- 자주 여는 화면 (이 기기) ----------
  (function () { var p = (location.pathname.split('/').pop() || 'index.html'); if (!/\.html$/.test(p) || p === 'index.html') return; try { var v = JSON.parse(localStorage.getItem('deco-visits') || '{}'); v[p] = (v[p] || 0) + 1; localStorage.setItem('deco-visits', JSON.stringify(v)); } catch (e) {} })();
  // ---------- 휴대폰 연락처 파일 (.vcf) ----------
  D.vcf = function (L, name) { var NL = String.fromCharCode(13, 10), es = function (s) { return String(s || '').replace(/([,;])/g, String.fromCharCode(92) + '$1').replace(/[\r\n]+/g, ' '); };
    var txt = L.filter(function (x) { return x && x.phone; }).map(function (x) { return ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + es(x.fn), 'N:' + es(x.fn) + ';;;;', 'TEL;TYPE=CELL:' + String(x.phone).replace(/[^0-9+]/g, ''), x.addr ? 'ADR;TYPE=HOME:;;' + es(x.addr) + ';;;;' : '', x.note ? 'NOTE:' + es(x.note) : '', 'END:VCARD'].filter(Boolean).join(NL); }).join(NL);
    if (!txt) return Promise.resolve('전화번호가 있는 사람이 없습니다.');
    var bl = new Blob([txt + NL], { type: 'text/vcard' }), f = new File([bl], name, { type: 'text/vcard' }), ok = false; try { ok = !!(navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) {}
    if (ok) return navigator.share({ files: [f] }).then(function () { return '연락처 파일을 보냈습니다. 「연락처」 앱을 고르면 저장됩니다.'; }, function () { return '취소했습니다.'; });
    var a = document.createElement('a'), u = URL.createObjectURL(bl); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    return Promise.resolve('연락처 파일을 받았습니다. 휴대폰에서 파일을 누르면 연락처에 저장됩니다.'); };
  // ---------- 휴지통 (이 기기, 30일) ----------
  var TRK = { delQuote: [KQ, '견적'], delOrder: [KO, '작업 지시서'], delCustomer: [KC, '고객'], delPartner: [KT, '거래처'], delExp: [KX, '지출'], delMemo: [KM, '메모'], delEvent: [KE, '일정'] };
  function trAll() { return rd('deco-trash', []).filter(function (t) { return t && t.item && Date.now() - t.at < 30 * 864e5; }); }
  Object.keys(TRK).forEach(function (fn) { var f = D[fn]; if (!f) return; D[fn] = function (id) { var k = TRK[fn][0], it = rd(k, []).filter(function (x) { return x && x.id === id; })[0];
    if (it) { var T = trAll(); T.unshift({ k: k, kind: TRK[fn][1], item: it, at: Date.now() }); for (var n = Math.min(T.length, 150); n > 0; n--) { try { localStorage.setItem('deco-trash', JSON.stringify(T.slice(0, n))); break; } catch (e) {} } }
    return f.apply(this, arguments); }; });
  D.trash = trAll;
  D.restore = function (at) { var T = trAll(), t = T.filter(function (x) { return x.at === at; })[0]; if (!t) return false; var a = rd(t.k, []).filter(function (x) { return x && x.id !== t.item.id; });
    t.item.updated = Date.now(); a.push(t.item); if (!wr(t.k, a)) return false; try { localStorage.setItem('deco-trash', JSON.stringify(T.filter(function (x) { return x.at !== at; }))); } catch (e) {} return true; };
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
    // 앱이 새 버전으로 바뀌면 아래에 알림 (쓰던 글이 날아가지 않게 자동으로 새로 고치지 않음)
    var hadCtl = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (!hadCtl || document.getElementById('nvBar')) return; var b = document.createElement('div'); b.id = 'nvBar';
      b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9999;background:#2E6A4E;color:#fff;border-radius:12px;padding:10px 14px;font-size:16px;display:flex;gap:10px;align-items:center;box-shadow:0 4px 16px rgba(0,0,0,.25);max-width:calc(100% - 32px)';
      b.innerHTML = '<span>✨ 앱이 새로 바뀌었습니다</span><button type="button" style="font:inherit;font-weight:800;background:#fff;color:#2E6A4E;border:0;border-radius:8px;padding:6px 12px;cursor:pointer">새로 고치기</button>';
      b.querySelector('button').onclick = function () { location.reload(); }; document.body.appendChild(b); });
  }
})();
