// 가상 고객 (시험용) 넣기·지우기 — 이름 앞 「(가상)」, 전화 010-0000-, 모든 자료에 demo:1 표시
(function () {
  var D = window.DECO; if (!D) return;
  var KEYS = { c: 'deco-customers', q: 'deco-quotes', o: 'deco-orders', p: 'deco-partners', e: 'deco-events' };
  function rd(k) { try { return JSON.parse(localStorage.getItem(k) || '[]') || []; } catch (e) { return []; } }
  function put(k, v) { localStorage.setItem(k, JSON.stringify(v)); if (window.DECO_SYNC && DECO_SYNC.changed) DECO_SYNC.changed(k, v); }
  function day(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function ago(n) { return Date.now() - n * 864e5; }
  var PK = { p1: ['우물 패키지', 790000], p2: ['거실 간접등 패키지', 1100000], p3: ['거실 실링팬 패키지', 1650000], p4: ['풀 패키지', 1900000], p5: ['VIP 패키지', 2350000] };
  function pk(id) { var L = D.pkgs ? D.pkgs() : [], p = L.filter(function (x) { return x.id === id; })[0]; return p ? [p.name, p.price, p.desc || ''] : PK[id].concat(['']); }
  // [이름, 전화 끝, 주소, 등록 며칠 전, 상태, 패키지, 알게 된 곳, 소개, 받은 돈 비율, 시공일(오늘 기준 날짜 차이, null=없음), 지시서 상태, 실측(날짜차, 시간), 시공 희망(날짜차), 다음 연락(날짜차), 메모]
  var P0 = [
    ['김민수', '0001', '경상남도 창원시 의창구 용호동 7 현대아파트 101동 1203호', 40, '완료', 'p3', '블로그', '', 1, -20, '완료', null, null, null, '실링팬 우드 색 원함'],
    ['이영희', '0002', '창원시 성산구 상남동 45 대동아파트 203동 805호', 25, '시공', 'p4', '인스타그램', '', 0.3, 0, '진행', null, null, null, '오전 9시 이후 작업 가능'],
    ['박철수', '0003', '창원시 마산합포구 월영동 12 롯데캐슬 105동 1502호', 12, '계약', 'p2', '지인 소개', '(가상) 김민수', 0.3, 5, '예정', null, null, null, '반려견 있음'],
    ['최지영', '0004', '창원시 마산회원구 양덕동 88 메트로시티 2단지 210동 302호', 6, '실측', 'p3', '네이버 검색', '', 0, null, '', [2, '10:00'], 14, null, '입주 전 시공 희망'],
    ['정우진', '0005', '창원시 진해구 석동 33 풍호동 아이파크 107동 1101호', 0, '상담', 'p2', '전단지(QR)', '', 0, null, '', null, null, 1, '가격 비교 중'],
    ['강수진', '0006', '김해시 장유동 150 율하 휴먼시아 504동 701호', 5, '상담', 'p1', '블로그', '', 0, null, '', null, null, null, '우물천장만 문의'],
    ['윤재호', '0007', '김해시 내외동 1020 대우아파트 3동 1204호', 30, '보류', 'p5', '인스타그램', '', 0, null, '', null, null, null, '내년 봄에 다시 연락'],
    ['한미경', '0008', '부산광역시 동래구 온천동 230 래미안 108동 901호', 50, '완료', 'p2', '지인 소개', '(가상) 김민수', 1, -35, '완료', null, null, null, ''],
    ['오성민', '0009', '부산광역시 해운대구 우동 1400 두산위브 101동 2304호', 9, '계약', 'p3', '네이버 검색', '', 0, 10, '예정', null, null, null, '잔금은 시공 당일'],
    ['서지은', '0010', '경상남도 양산시 물금읍 가촌리 1200 반도유보라 103동 402호', 2, '', '', '전화', '', 0, null, '', null, null, 3, '견적 요청 예정'],
    ['임동현', '0011', '창원시 의창구 봉곡동 101 봉곡 한마음아파트 6동 503호', 70, '완료', 'p1', '지인 소개', '(가상) 김민수', 1, -60, '완료', null, null, null, ''],
    ['배수정', '0012', '창원시 성산구 중앙동 90 대방아파트 1동 1406호', 3, '실측', 'p4', '블로그', '', 0, null, '', [0, '15:00'], 21, null, '거실·현관 같이']
  ];
  D.demoCount = function () { var n = 0; ['c', 'q', 'o', 'p', 'e'].forEach(function (k) { n += rd(KEYS[k]).filter(function (x) { return x && x.demo; }).length; }); return n; };
  D.demoAdd = function () {
    if (D.demoCount()) return '이미 가상 고객이 들어 있습니다. 먼저 「가상 고객 모두 지우기」를 누르세요.';
    var pc = D.savePartner({ name: '(가상) 박목수', phone: '010-0000-1001', trade: '목수', memo: '시험용 거래처', demo: 1 }) || {},
      pe = D.savePartner({ name: '(가상) 이전기', phone: '010-0000-1002', trade: '전기', memo: '시험용 거래처', demo: 1 }) || {};
    var n = 0;
    P0.forEach(function (r) {
      var nm = '(가상) ' + r[0], ph = '010-0000-' + r[1];
      var c = D.saveCustomer({ name: nm, phone: ph, addr: r[2], source: r[6], ref: r[7], memo: r[14], demo: 1, logs: [{ id: 'l' + Math.random().toString(36).slice(2, 8), date: day(-r[3]), text: '첫 상담 (' + r[6] + ')' }],
        next: r[13] != null ? { d: day(r[13]), m: '견적 답 듣기' } : undefined });
      if (!c) return; n++;
      var all = rd(KEYS.c); all.forEach(function (x) { if (x.id === c.id) { x.created = ago(r[3]); x.touched = x.updated = ago(Math.min(r[3], 5)); } }); put(KEYS.c, all);   // 등록일을 과거로
      if (!r[4]) return;
      var P = pk(r[5]), sup = P[1], vat = Math.round(sup * 0.1), tot = sup + vat, pays = [];
      if (r[8] >= 1) pays = [{ d: day(-r[3] + 2), amt: Math.round(tot * 0.3), kind: '계약금', memo: '' }, { d: day(r[9] != null ? r[9] : 0), amt: tot - Math.round(tot * 0.3), kind: '잔금', memo: '' }];
      else if (r[8] > 0) pays = [{ d: day(-r[3] + 2), amt: Math.round(tot * r[8]), kind: '계약금', memo: '' }];
      var q = D.saveQuote({ cust: { name: nm, phone: ph, addr: r[2], staff: '' }, custId: c.id, memo: r[14], pkg: r[5], pkgName: P[0], pkgPrice: P[1], pkgDesc: P[2], items: [], etc: [], kelvin: 3000, layout: null, discount: 0,
        status: r[4], totals: { pa: sup, ia: 0, ea: 0, dc: 0, supply: sup, vat: vat, total: tot }, pays: pays, visit: r[11] ? { d: day(r[11][0]), t: r[11][1] } : undefined, wish: r[12] != null ? day(r[12]) : '', demo: 1 });
      if (!q) return;
      var qa = rd(KEYS.q); qa.forEach(function (x) { if (x.id === q.id) { x.created = ago(r[3]); x.updated = ago(Math.min(r[3], 5)); } }); put(KEYS.q, qa);
      if (r[9] == null) return;
      var done = r[10] === '완료';
      D.saveOrder({ quoteId: q.id, custId: c.id, name: nm, phone: ph, addr: r[2], workDate: day(r[9]), workTime: '09:00', status: r[10], lead: '(가상) 박목수', color: '전구색 3000K', notes: r[14], checks: {}, demo: 1,
        trades: { '목수': { on: true, partner: pc.id || '', tasks: '우물천장 몰딩\n커튼박스 보강', time: '09:00' }, '전기': { on: true, partner: pe.id || '', tasks: P[0] + ' 조명 설치', time: '13:00' }, '도배': { on: false, partner: '', tasks: '', time: '' } },
        cost: { '목수': 350000, '전기': 280000 }, costPaid: done ? { '목수': day(r[9] + 1), '전기': day(r[9] + 1) } : {} });
    });
    return '가상 고객 ' + n + '명과 견적·지시서·거래처 2곳을 넣었습니다. 이름 앞에 「(가상)」이 붙어 있습니다.';
  };
  D.demoDel = function () {
    var qs = rd(KEYS.q).filter(function (x) { return x.demo; }).map(function (x) { return x.id; }), cs = rd(KEYS.c).filter(function (x) { return x.demo; }).map(function (x) { return x.id; }), n = 0;
    var link = {}; qs.forEach(function (id) { link['Lv' + id] = 1; link['Lw' + id] = 1; }); cs.forEach(function (id) { link['Ln' + id] = 1; });
    ['c', 'q', 'o', 'p', 'e'].forEach(function (k) { var a = rd(KEYS[k]), b = a.filter(function (x) { return !(x && (x.demo || link[x.id])); }); n += a.length - b.length; if (a.length !== b.length) put(KEYS[k], b); });
    return n ? '가상 자료 ' + n + '개를 지웠습니다. (다른 기기에서도 곧 사라집니다)' : '지울 가상 자료가 없습니다.';
  };
})();
// ── 나머지 카테고리 가상 자료 (지출·고정 지출·재고·메모·일정·사진·평가·후기·하자 접수·손님 답·점검표) ──
(function () {
  var D = window.DECO; if (!D || !D.demoAdd) return;
  var X = ['deco-exp', 'deco-fixexp', 'deco-stock', 'deco-memos', 'deco-asreq', 'deco-okq', 'deco-chk', 'deco-rvq'];
  function rd(k) { try { return JSON.parse(localStorage.getItem(k) || '[]') || []; } catch (e) { return []; } }
  function put(k, v) { localStorage.setItem(k, JSON.stringify(v)); if (window.DECO_SYNC && DECO_SYNC.changed) DECO_SYNC.changed(k, v); }
  function day(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function at(ds, h) { return new Date(ds + 'T' + String(h).padStart(2, '0') + ':00').getTime(); }
  function rid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function pic(t1, t2, warm) { return new Promise(function (ok) { var c = document.createElement('canvas'); c.width = 1080; c.height = 810; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 810);
    gr.addColorStop(0, warm ? '#3a2a1e' : '#cfc8bf'); gr.addColorStop(1, warm ? '#f2c27a' : '#8f8a84'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 810);
    if (warm) { g.fillStyle = 'rgba(255,214,150,.85)'; g.fillRect(140, 150, 800, 16); g.fillRect(140, 150, 16, 120); g.fillRect(924, 150, 16, 120); }
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 640, 1080, 170); g.fillStyle = '#fff'; g.font = '800 64px sans-serif'; g.fillText(t1, 50, 720); g.font = '500 38px sans-serif'; g.fillText(t2, 50, 780);
    c.toBlob(function (b) { ok(b); }, 'image/jpeg', 0.85); }); }
  var base = D.demoAdd, bdel = D.demoDel, bcnt = D.demoCount;
  D.demoCount = function () { var n = bcnt(); X.forEach(function (k) { n += rd(k).filter(function (x) { return x && x.demo; }).length; }); return n; };
  D.demoAdd = function () { var m = base(); if (/^이미/.test(m)) return m;
    var C = {}; D.customers().filter(function (c) { return c.demo; }).forEach(function (c) { C[c.name.replace('(가상) ', '')] = c; });
    var Q = {}; D.list().filter(function (q) { return q.demo; }).forEach(function (q) { Q[q.cust.name.replace('(가상) ', '')] = q; });
    var O = {}; D.orders().filter(function (o) { return o.demo; }).forEach(function (o) { O[o.name.replace('(가상) ', '')] = o; });
    var P = D.partners().filter(function (p) { return p.demo; }), pid = function (t) { return (P.filter(function (p) { return p.trade === t; })[0] || {}).id || ''; };
    // 지시서: 출발·작업 시작·완료 시간, 거래처 평가, 고객 후기, 준비물
    var RV = { '김민수': [5, '거실이 완전히 달라졌어요. 실링팬 바람도 조용하고 좋습니다.'], '한미경': [5, '꼼꼼하게 해 주시고 청소까지 깔끔했어요.'], '임동현': [4, '우물천장 조명 예쁩니다. 일정이 하루 밀린 것만 아쉬워요.'] };
    Object.keys(O).forEach(function (k) { var o = O[k], wd = o.workDate;
      if (o.status === '완료') { o.prog = { go: at(wd, 8), 'in': at(wd, 9), done: at(wd, 15) + Math.round(Math.random() * 5) * 600000 };
        o.prate = { '목수': { s: 5, m: '마감 깔끔', pid: pid('목수'), at: at(wd, 18) }, '전기': { s: 4, m: '조금 늦게 도착', pid: pid('전기'), at: at(wd, 18) } };
        if (RV[k]) o.review = { star: RV[k][0], text: RV[k][1], ok: true, at: at(wd, 20), from: 'app' }; }
      if (o.status === '진행') { o.prog = { go: at(wd, 8), 'in': at(wd, 9) }; o.prep = { '타카·타카 핀': 1, '사다리': 1, 'LED 바·드라이버(SMPS)': 1 }; }
      D.saveOrder(o); });
    // 일정: 자재 입고·하자 보수 방문·기타·상담
    [[3, '10:00', '자재 입고', '', '(가상) LED 바·T5 등기구 입고 (오성민 현장용)'], [6, '14:00', '하자 보수 방문', C['김민수'] && C['김민수'].id, '(가상) 간접등 한쪽 깜빡임 점검'], [8, '11:00', '기타', '', '(가상) 조명 자재 업체 미팅'], [1, '16:00', '상담', C['강수진'] && C['강수진'].id, '(가상) 전화 상담 약속']]
      .forEach(function (e) { D.saveEvent({ date: day(e[0]), time: e[1], kind: e[2], custId: e[3] || '', title: e[4], done: false, demo: 1 }); });
    // 메모
    [['할 일', '(가상) 다음 주 자재 주문', 'T5 1200mm 20개\nLED 바 2m 30개\n타카 핀 2통', true], ['상담', '(가상) 김해 장유 문의 메모', '우물천장만 원함, 예산 100만 원 안쪽'], ['현장', '(가상) 상남동 대동아파트 주차', '지하 2층 방문 차량 등록 필요'], ['자재', '(가상) 실링팬 재고 확인', '우드 2대, 화이트 1대 남음']]
      .forEach(function (m) { D.saveMemo({ cat: m[0], title: m[1], body: m[2], pin: !!m[3], demo: 1 }); });
    // 지출 (이번 달·지난달) + 매달 고정 지출
    [[-1, '기름값', 68000, '카드', '창원→부산 현장'], [-3, '식대', 36000, '카드', '현장 점심 3명'], [-5, '소모품', 42000, '현금', '타카 핀·실리콘'], [-8, '공구·장비', 189000, '카드', '레이저 수평기'], [-12, '광고', 150000, '계좌이체', '블로그 광고'], [-20, '차량', 55000, '카드', '엔진오일 교환'], [-35, '기름값', 72000, '카드', '김해 현장'], [-40, '소모품', 31000, '현금', '보양 비닐']]
      .forEach(function (x) { D.saveExp({ d: day(x[0]), cat: x[1], amt: x[2], pm: x[3], memo: '(가상) ' + x[4], demo: 1 }); });
    var fx = rd('deco-fixexp'); fx.push({ id: rid('f'), cat: '통신', amt: 66000, pm: '카드', memo: '(가상) 휴대폰 2대', day: 25, demo: 1 }, { id: rid('f'), cat: '차량', amt: 450000, pm: '계좌이체', memo: '(가상) 화물차 할부', day: 10, demo: 1 }); put('deco-fixexp', fx);
    // 재고 (T5 등기구는 「주문 필요」)
    [['(가상) LED 바 2m', 24, '개', 10], ['(가상) T5 등기구 1200mm', 6, '개', 8], ['(가상) 다운라이트 3인치', 40, '개', 15], ['(가상) 실링팬 우드', 2, '대', 1], ['(가상) SMPS 150W', 9, '개', 5], ['(가상) 타카 핀', 3, '통', 2]]
      .forEach(function (s) { D.saveStock({ name: s[0], qty: s[1], unit: s[2], min: s[3], demo: 1 }); });
    // 손님이 보낸 것: 하자 접수·견적 답·작업자 점검표
    var now = Date.now(), om = O['김민수'], ol = O['이영희'], qj = Q['정우진'];
    if (om) { var a = rd('deco-asreq'); a.push({ id: rid('a'), oid: om.id, custId: om.custId, name: om.name, addr: om.addr, phone: om.phone, kinds: ['간접등 깜빡임'], say: '(가상) 거실 커튼박스 간접등 한쪽이 가끔 깜빡여요.', md: '평일 오후', ph: [], at: now - 864e5, demo: 1 }); put('deco-asreq', a); }
    if (qj) { var k = rd('deco-okq'); k.push({ id: qj.id, qid: qj.id, act: 'ok', at: now - 3 * 3600e3, name: qj.cust.name, no: qj.no, tm: '평일 저녁 7시 이후', say: '(가상) 이 견적으로 진행하고 싶어요. 실측 날짜 알려 주세요.', k: '', demo: 1 }); put('deco-okq', k); }
    if (ol) { var h = rd('deco-chk'); h.push({ id: rid('h'), oid: ol.id, tr: '목수', by: '(가상) 박목수', at: now - 2 * 3600e3, ok: ['몰딩 마감', '커튼박스 보강', '먼지 청소'], no: [], memo: '(가상) 목공 끝, 전기팀 오후 투입', demo: 1 }); put('deco-chk', h); }
    // 소개 감사 혜택 기록
    if (C['김민수']) { var cm = D.getCustomer(C['김민수'].id); cm.perks = [{ d: D.date(Date.now() - 20 * 864e5), what: '(가상) 상품권 3만 원' }]; D.saveCustomer(cm); }
    // 현장 사진 (그림으로 만든 가상 사진)
    var PH = [['김민수', '시공 전', '(가상) 시공 전', '용호동 거실 · 공사 전', false], ['김민수', '시공 후', '(가상) 시공 후', '용호동 거실 · 실링팬·간접등', true], ['한미경', '시공 후', '(가상) 시공 후', '온천동 거실 · 간접등', true], ['이영희', '시공 중', '(가상) 시공 중', '상남동 · 목공 작업', false]];
    PH.reduce(function (p, x) { return p.then(function () { var q = Q[x[0]]; if (!q) return; return pic(x[2], x[3], x[4]).then(function (b) { return D.photoAdd({ blob: b, job: q.id, stage: x[1], memo: x[2] + ' ' + x[3], taken: Date.now() - 864e5, by: '사장님', demo: 1 }); }); }); }, Promise.resolve());
    return m + ' 지출·고정 지출·재고·메모·일정·사진 4장·평가·후기·하자 접수·손님 답·점검표도 넣었습니다.'; };
  D.demoDel = function () { var m = bdel(), n = 0;
    X.forEach(function (k) { var a = rd(k), b = a.filter(function (x) { return !(x && x.demo); }); n += a.length - b.length; if (a.length !== b.length) put(k, b); });
    if (D.photoAll) D.photoAll().then(function (A) { A.filter(function (p) { return p.demo; }).forEach(function (p) { D.photoDel(p.id); }); });
    return n ? '가상 자료를 모두 지웠습니다 (사진 포함). 다른 기기에서도 곧 사라집니다.' : m; };
})();
