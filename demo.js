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
