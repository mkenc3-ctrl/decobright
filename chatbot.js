// 손님용 상담 챗봇 (질문 단추형, AI 없음 — 정해 둔 답만 보여 줌)
// 답 내용: e모델하우스 자주 묻는 질문 · 자주 쓰는 답장(common.js) · 가격표(prices-default.js) · 회사 정보 설정
// 사장님이 「챗봇 질문·답 고치기」(botedit.html)에서 고친 내용은 서버 pub/bot 에 올라가고, 손님 화면이 읽어 덮어씀
// 붙이는 법: <script src="chatbot.js" data-bottom="130"></script>  (data-bottom = 아래 고정 막대 높이, px)
//            data-cust-only : 주소에 c=1 이 있을 때만 · data-noui : 기본 질문 목록만 만들고 화면은 안 띄움 (고치기 화면용)
(function () {
  var me = document.currentScript;
  var D = window.DECO || {}, S = {};
  try { S = D.settings ? D.settings() : {}; } catch (e) {}
  var KAKAO = S.kakaoCh || 'http://pf.kakao.com/_NHdxnn/chat', PHONE = S.phone || '010-5854-2143',
    AREA = S.areaTxt || '부산 · 창원 · 경남 전 지역', BLOG = S.blogUrl || 'https://blog.naver.com/decobright', CO = S.company || '데코브라이트';
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function man(n) { return (n / 10000).toLocaleString('ko-KR') + '만원'; }
  // 사장님이 쓴 글 → 화면용: 줄바꿈, **굵게**, {지역}{전화}{회사}
  function txt(t) { return esc(String(t || '').replace(/\{지역\}/g, AREA).replace(/\{전화\}/g, PHONE).replace(/\{회사\}/g, CO)).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  function pkgs() { var L = []; try { L = D.pkgs ? D.pkgs() : (window.DECO_PKGS0 || []); } catch (e) { L = window.DECO_PKGS0 || []; }
    return L.filter(function (p) { return p.price && !p.hide && !p.ad && p.id !== 'p6'; }); }
  var hasCalc = !!document.getElementById('pk');
  function talk(msg) { var tn = String(PHONE).replace(/[^\d]/g, '');
    return msg + '<div class="cb-go"><a class="kk" href="' + esc(KAKAO) + '" target="_blank" rel="noopener">💬 카톡 상담</a>' + (tn ? '<a class="tl" href="tel:' + tn + '">📞 ' + esc(PHONE) + '</a>' : '') + '</div>'; }

  // ── 자동으로 만드는 답 (가격표·추가 상품·회사 정보에서 가져옴) ──
  var AUTO = {
    price: { d: '가격표의 패키지 이름과 금액을 자동으로 보여 줍니다.', f: function () { var P = pkgs(); if (!P.length) return txt('집 크기와 원하시는 조명에 따라 금액이 달라집니다. 천장 사진과 평수를 보내 주시면 바로 견적 드립니다.');
      return '<b>패키지 가격</b> <small>(부가세 별도)</small><ul>' + P.map(function (p) { return '<li>' + esc(p.name) + (/^p[1-5]$/.test(p.id) ? ' <i>PVC몰드</i>' : '') + ' — <b>' + man(p.price) + '</b></li>'; }).join('') + '</ul>' +
        (hasCalc ? '이 화면 위쪽에서 패키지와 항목을 고르면 예상 금액이 바로 나옵니다.' : '<a href="calc.html">견적 계산기</a>에서 골라 보시면 예상 금액이 바로 나옵니다.') +
        '<br><small>실측 후 천장 구조·배선·실링팬 모델에 따라 금액이 달라질 수 있습니다.</small>'; } },
    wall: { d: '추가 상품의 도배 금액을 자동으로 보여 줍니다.', f: function () { var A = window.DECO_ADDONS, R = A ? A.rows.filter(function (r) { return /도배/.test(r[0]); }) : [];
      return '패키지 금액에는 <b>도배가 들어 있지 않습니다</b> (도배 별도).' + (R.length ? '<ul>' + R.map(function (r) { return '<li>' + esc(r[0]) + ' — <b>' + esc(r[1]) + '</b></li>'; }).join('') + '</ul><small>부가세 별도</small>' : ''); } },
    mold: { d: '추가 상품의 무몰딩 변경 금액을 자동으로 보여 줍니다.', f: function () { var A = window.DECO_ADDONS, n = A && A.note ? A.note : null;
      return '패키지는 기본이 <b>PVC몰드</b>(우물등박스) 방식입니다.<br>몰딩 없이 깔끔한 <b>무몰딩</b>(라운드·직각 목공)으로 바꾸시면 ' + (n ? '<b>' + esc(n[0].replace(/^.*?(\+?\d+만원).*$/, '$1')) + '</b>이 추가됩니다 <small>(부가세 별도)</small>.' : '금액이 추가됩니다.') + '<br>요즘 트렌드 시공은 무몰딩으로 합니다.'; } },
    case: { d: 'e모델하우스와 블로그 바로가기를 보여 줍니다.', f: function () { return '실제 시공한 집은 아래에서 보실 수 있습니다.<br><a href="emodel.html?c=1">e모델하우스 둘러보기 ›</a><br><a href="' + esc(BLOG) + '" target="_blank" rel="noopener">블로그 시공 사례 ›</a><br>마음에 드는 사진을 보내 주시면 같은 느낌으로 견적 드립니다.'; } },
    talk: { d: '카톡 상담·전화 버튼을 보여 줍니다.', f: function () { return talk(txt('편하신 방법으로 연락 주세요. 천장 사진과 평수를 보내 주시면 더 빠릅니다.')); } }
  };
  // ── 기본 질문과 답 ── (k: 손님이 쓸 만한 낱말, a: 답 글, auto: 자동 답)
  var T0 = [
    { id: 'price', q: '가격이 궁금해요', k: ['가격', '얼마', '금액', '비용', '견적', '패키지', '만원', '비싸', '싸'], auto: 'price' },
    { id: 'days', q: '공사는 며칠 걸려요?', k: ['며칠', '기간', '시간', '하루', '이틀', '오래', '언제 끝', '걸려'],
      a: '보통 30평대 아파트 기준 **하루**(아침 8시 ~ 오후) 안에 끝납니다.\n우물 목공(천장 모양 새로 만들기)이 있으면 **이틀 정도** 걸립니다.\n목수 작업 → 전기 작업 → 도배 마무리 순서로 하고, 끝나면 청소까지 해 드립니다.' },
    { id: 'area', q: '시공 지역은 어디예요?', k: ['지역', '어디', '부산', '창원', '김해', '양산', '경남', '울산', '출장', '멀'],
      a: '**{지역}** 시공합니다.\n그 밖의 지역은 카톡이나 전화로 물어봐 주세요.' },
    { id: 'visit', q: '실측 방문은 어떻게 해요?', k: ['실측', '방문', '와서', '보러', '측정', '견적 받'],
      a: '정확한 견적을 위해 **무료로 실측 방문**을 해 드립니다.\n편하신 날짜와 시간을 알려 주시면 맞춰 찾아뵙고, 20~30분 정도 걸립니다. 일요일은 쉽니다.' },
    { id: 'as', q: 'A/S는 어떻게 돼요?', k: ['as', 'a/s', '에이에스', '고장', '하자', '보증', '수리', '깜빡', '꺼져'],
      a: '시공 부위 하자는 **1년 동안 무상**으로 점검·보수해 드립니다.\n제품 자체 고장은 제조사 보증을 따릅니다.\n조명이 깜빡이거나 꺼지면 사진과 함께 연락 주세요.' },
    { id: 'wall', q: '도배도 해 주나요?', k: ['도배', '벽지', '실크', '디아망', '합지'], auto: 'wall' },
    { id: 'mold', q: 'PVC몰드랑 무몰딩 차이는?', k: ['무몰딩', '몰드', 'pvc', '목공', '라운드', '직각', '몰딩'], auto: 'mold' },
    { id: 'live', q: '살면서도 공사돼요?', k: ['살면서', '거주', '이사', '가구', '짐'],
      a: '네, 살고 계신 집에서도 합니다.\n공사하는 곳 아래 가구는 미리 옮기거나 덮어서 보호합니다.' },
    { id: 'fan', q: '실링팬 달면 천장 괜찮아요?', k: ['실링팬', '팬', '선풍기', '보강', '무거'],
      a: '실링팬 자리는 **천장을 보강한 뒤** 답니다.\n보강이 필요한지는 현장 확인 때 알려 드립니다.' },
    { id: 'color', q: '빛 색을 바꿀 수 있나요?', k: ['색', '빛', '전구색', '주백색', '주광색', '밝기', '디밍'],
      a: '색을 바꾸는 조명을 쓰면 스위치로 하얀 빛·중간 빛·따뜻한 빛을 바꿀 수 있습니다.\n제품에 따라 다르니 상담 때 말씀해 주세요.' },
    { id: 'elec', q: '전기요금 많이 나와요?', k: ['전기요금', '전기세', '요금', '전력', '전기료'],
      a: 'LED 조명을 쓰기 때문에 전기 사용량이 크지 않습니다.' },
    { id: 'pay', q: '계약은 어떻게 해요?', k: ['계약', '계약금', '입금', '결제', '카드', '계좌', '예약'],
      a: '실측 후 견적을 확인하시고, **계약금 입금 후 시공 날짜가 확정**됩니다.\n결제 방법은 상담 때 안내해 드립니다.' },
    { id: 'case', q: '시공 사례 보고 싶어요', k: ['사례', '사진', '후기', '블로그', '보고 싶', '모델하우스', '실제'], auto: 'case' },
    { id: 'talk', q: '사장님과 직접 상담', k: ['상담', '연락', '전화', '카톡', '문의', '사람', '사장'], auto: 'talk' }
  ];
  window.DECO_BOT0 = T0; window.DECO_BOT_AUTO = AUTO;
  // 고친 내용 합치기: ed = { items: { id: { q, k, a, hide } }, extra: [ { id, q, k, a } ] }
  function merge(ed) { ed = ed || {}; var I = ed.items || {};
    var L = T0.map(function (x) { var o = I[x.id] || {}; return { id: x.id, q: o.q || x.q, k: o.k && o.k.length ? o.k : x.k, a: o.a != null && o.a !== '' ? o.a : x.a, auto: (o.a != null && o.a !== '') ? null : x.auto, hide: !!o.hide }; });
    (ed.extra || []).forEach(function (x) { if (x && x.q && x.a) L.splice(L.length - 1, 0, { id: x.id, q: x.q, k: x.k || [], a: x.a, hide: !!x.hide }); });
    return L.filter(function (x) { return !x.hide; }); }
  window.DECO_BOT_MERGE = merge;
  if (me && me.hasAttribute('data-noui')) return;
  if (me && me.hasAttribute('data-cust-only') && !/[?&]c=1\b/.test(location.search)) return;
  var BOT = parseInt(me && me.getAttribute('data-bottom'), 10) || 20;

  // 고친 내용: ① 이 기기에 사장님이 저장한 것 ② 손님 기기에 받아 둔 것 → 서버에서 새로 받아 덮어씀
  var ED = null, AT = 0;
  try { var pub = JSON.parse(localStorage.getItem('deco-pub') || '[]').filter(function (x) { return x && x.id === 'bot'; })[0]; if (pub && pub.ed) { ED = pub.ed; AT = pub.at || 0; } } catch (e) {}
  if (!ED) try { var ca = JSON.parse(localStorage.getItem('deco-pubbot') || 'null'); if (ca && ca.ed) { ED = ca.ed; AT = ca.at || 0; } } catch (e) {}
  var T = merge(ED);
  function ans(x) { return x.auto && AUTO[x.auto] ? AUTO[x.auto].f() : (x.id === 'talk' ? talk(txt(x.a)) : txt(x.a)); }
  function find(t) { var s = String(t || '').toLowerCase().replace(/\s+/g, ' '), best = null, bn = 0;
    T.forEach(function (x) { var n = 0; (x.k || []).forEach(function (w) { w = String(w).toLowerCase().trim(); if (w && s.indexOf(w) >= 0) n += w.length; }); if (n > bn) { bn = n; best = x; } });
    return best; }

  // ── 화면 ──
  var css = document.createElement('style');
  css.textContent = [
    '.cb-fab{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(' + BOT + 'px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:7px;border:0;border-radius:999px;padding:12px 18px 12px 14px;font:inherit;font-size:16px;font-weight:800;color:#14213D;background:linear-gradient(115deg,#E3C35A 0%,#C9A227 55%,#9C7C14 100%);box-shadow:0 10px 26px rgba(10,18,38,.35);cursor:pointer}',
    '.cb-fab span{font-size:20px}',
    '.cb{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(' + BOT + 'px + env(safe-area-inset-bottom,0px));z-index:61;width:min(390px,calc(100vw - 24px));height:min(600px,calc(100vh - ' + (BOT + 40) + 'px));display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 22px 60px rgba(10,18,38,.42);font-size:16px;color:#1F2433}',
    '.cb[hidden]{display:none}',
    '.cb-h{display:flex;align-items:center;gap:10px;padding:14px 14px 14px 16px;color:#fff;background:linear-gradient(115deg,#0A1226 0%,#1E3566 52%,#7A6224 100%)}',
    '.cb-h b{flex:1;font-size:17px}.cb-h small{display:block;font-size:12.5px;font-weight:500;color:#E3C35A;margin-top:2px}',
    '.cb-h button{border:0;background:rgba(255,255,255,.16);color:#fff;width:38px;height:38px;border-radius:50%;font-size:18px;cursor:pointer}',
    '.cb-m{flex:1;overflow-y:auto;padding:14px 12px;background:#F4F6FA;display:flex;flex-direction:column;gap:10px}',
    '.cb-b{max-width:88%;padding:11px 13px;border-radius:14px;line-height:1.55;word-break:keep-all;overflow-wrap:anywhere}',
    '.cb-b.bot{align-self:flex-start;background:#fff;border:1px solid #E1E5EE;border-top-left-radius:4px}',
    '.cb-b.me{align-self:flex-end;background:#14213D;color:#fff;border-top-right-radius:4px}',
    '.cb-b ul{margin:6px 0;padding-left:18px}.cb-b li{margin:2px 0}.cb-b small{color:#6B7183}.cb-b i{font-style:normal;font-size:11.5px;font-weight:800;color:#8C6A1F;border:1px solid #B8963E;border-radius:3px;padding:0 4px}',
    '.cb-b a{color:#2A4A8C;font-weight:700}',
    '.cb-go{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.cb-go a{flex:1;min-width:120px;text-align:center;text-decoration:none;padding:10px;border-radius:10px;font-weight:800;font-size:15px}',
    '.cb-go .kk{background:#FEE500;color:#191919}.cb-go .tl{background:#14213D;color:#fff}',
    '.cb-c{display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px;background:#fff;border-top:1px solid #E1E5EE;max-height:132px;overflow-y:auto}',
    '.cb-c button{font:inherit;font-size:14.5px;font-weight:700;padding:8px 12px;border-radius:999px;border:1px solid #D9C27A;background:#FBF5E2;color:#5C4A10;cursor:pointer}',
    '.cb-f{display:flex;gap:6px;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));background:#fff;border-top:1px solid #E1E5EE}',
    '.cb-f input{flex:1;min-width:0;font:inherit;font-size:16px;padding:11px 12px;border:1px solid #D5DAE4;border-radius:10px}',
    '.cb-f button{font:inherit;font-size:15px;font-weight:800;padding:0 16px;border:0;border-radius:10px;background:#14213D;color:#fff;cursor:pointer}'
  ].join('\n');
  document.head.appendChild(css);
  var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'cb-fab'; fab.innerHTML = '<span aria-hidden="true">💬</span>궁금한 점 묻기';
  var box = document.createElement('section'); box.className = 'cb'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', CO + ' 상담 도우미');
  box.innerHTML = '<div class="cb-h"><b>' + esc(CO) + ' 상담 도우미<small>자주 묻는 질문에 바로 답해 드려요</small></b><button type="button" class="cb-x" aria-label="닫기">✕</button></div>' +
    '<div class="cb-m" aria-live="polite"></div><div class="cb-c" role="group" aria-label="자주 묻는 질문"></div>' +
    '<form class="cb-f"><input type="text" placeholder="예: 도배도 해 주나요?" aria-label="질문 쓰기" maxlength="200"><button type="submit">묻기</button></form>';
  document.body.appendChild(fab); document.body.appendChild(box);
  var M = box.querySelector('.cb-m'), C = box.querySelector('.cb-c'), I = box.querySelector('input'), started = false, asked = {};
  function say(html, who) { var b = document.createElement('div'); b.className = 'cb-b ' + (who || 'bot'); b.innerHTML = html; M.appendChild(b); M.scrollTop = M.scrollHeight; }
  function chips() { C.innerHTML = T.filter(function (x) { return !asked[x.id] || x.id === 'talk'; }).map(function (x) { return '<button type="button" data-q="' + esc(x.id) + '">' + esc(x.q) + '</button>'; }).join(''); }
  function answer(x, shown) { say(esc(shown || x.q), 'me'); asked[x.id] = 1; setTimeout(function () { say(ans(x)); chips(); }, 250); }
  function open() { box.hidden = false; fab.hidden = true;
    if (!started) { started = true; say('안녕하세요, <b>' + esc(CO) + '</b>입니다 😊<br>궁금한 것을 아래에서 누르거나 직접 써 주세요.'); chips(); }
    setTimeout(function () { M.scrollTop = M.scrollHeight; }, 0); }
  fab.addEventListener('click', open);
  box.querySelector('.cb-x').addEventListener('click', function () { box.hidden = true; fab.hidden = false; fab.focus(); });
  C.addEventListener('click', function (e) { var b = e.target.closest('[data-q]'); if (!b) return; var x = T.filter(function (t) { return t.id === b.dataset.q; })[0]; if (x) answer(x); });
  box.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); var t = I.value.trim(); if (!t) return; I.value = '';
    if (/\d{6}\s*-?\s*[1-4]\d{6}/.test(t)) { say('주민등록번호 같은 개인 정보는 여기에 쓰지 말아 주세요.'); return; }
    var x = find(t); if (x) answer(x, t);
    else { say(esc(t), 'me'); setTimeout(function () { say(talk('그 질문은 사장님이 직접 답해 드리는 게 정확합니다. 카톡이나 전화로 물어봐 주세요.')); }, 250); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) box.querySelector('.cb-x').click(); });

  // 서버에 올린 최신 질문·답 받기 (손님 기기). 사장님 기기에 저장된 것이 있으면 그걸 씀
  try { if (localStorage.getItem('deco-pub') && ED && AT) return; } catch (e) {}
  if (!window.fetch) return;
  fetch('https://dypvqgaayumrhaiphatu.supabase.co/rest/v1/records?coll=eq.pub&id=eq.bot&select=data', { headers: { apikey: 'sb_publishable_5-LUZwZQ3VwBxDKDA_nJpw_ddF6QKdE' } })
    .then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) { var x = rows && rows[0] && rows[0].data; if (!x || x._del || !x.ed || x.at === AT) return;
      try { localStorage.setItem('deco-pubbot', JSON.stringify({ at: x.at, ed: x.ed })); } catch (e) {}
      ED = x.ed; AT = x.at; T = merge(ED); if (started) chips(); }).catch(function () {});
})();
