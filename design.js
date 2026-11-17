/* 데코브라이트 — 화면 다듬기: 그림 문자(이모지)를 같은 굵기의 선 아이콘으로 바꾸거나 뺍니다.
   입력 칸·문자 미리보기·data-emo="keep" 안은 건드리지 않습니다. */
(function () {
  var P = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20l1.1-4.2A8 8 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>',
    cal: '<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    won: '<circle cx="12" cy="12" r="9"/><path d="M7.5 8.5l1.8 7 2.7-6 2.7 6 1.8-7M7 12h10"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    list: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    receipt: '<path d="M5 2.5v19l2.3-1.5 2.4 1.5 2.3-1.5 2.3 1.5 2.4-1.5 2.3 1.5v-19l-2.3 1.5-2.4-1.5L12 4 9.7 2.5 7.3 4z"/><path d="M9 9h6M9 13h6"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0 5.3 5.3L21 13l-8 8-5-5 8-8z" transform="translate(-2 -2)"/><path d="M3 21l5-5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    tick: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    camera: '<path d="M14.5 4h-5L7.5 6.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-3.5z"/><circle cx="12" cy="13" r="3.5"/>',
    bulb: '<path d="M9 18h6M10 21.5h4M12 2.5a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.3 1 2.1V17h6v-.8c0-.8.4-1.6 1-2.1a6.5 6.5 0 0 0-4-11.6z"/>',
    star: '<path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    hammer: '<path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 15 22 10.6 13.4 2 9 6.4z"/>',
    building: '<rect x="4" y="2.5" width="16" height="19" rx="1"/><path d="M9 21.5v-4h6v4M8.5 7h1M14.5 7h1M8.5 11h1M14.5 11h1M8.5 15h1M14.5 15h1"/>',
    doc: '<path d="M14 2.5H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5z"/><path d="M14 2.5v6h6M8 13h8M8 17h6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    cloud: '<path d="M17.5 19H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 11 4 4 0 0 1 17.5 19z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    hand: '<path d="m11 17 2 2a1.4 1.4 0 1 0 2-2"/><path d="m14 14 2.5 2.5a1.4 1.4 0 1 0 2-2l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1.4 1.4 0 1 1-2-2l2.8-2.8a5.1 5.1 0 0 1 6.1-.8l.5.3a3 3 0 0 0 2.1.3L21 6M21 3l1 10h-2M3 3 2 13l6.5 6.5a1.4 1.4 0 1 0 2-2M3 4h8"/>',
    worker: '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-1a9 9 0 0 0-20 0z"/><path d="M10 10V5a2 2 0 0 1 4 0v5M5 15V14a7 7 0 0 1 4-6.3M19 15v-1a7 7 0 0 0-4-6.3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    truck: '<path d="M14 17V5H2v12h2M14 8h4l4 4v5h-2M9 17h6"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    mobile: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    ruler: '<path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4zM7.5 10.5l2-2M10.5 13.5l2-2M13.5 16.5l2-2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    rain: '<path d="M17.5 15H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 7 4 4 0 0 1 17.5 15zM8 18v2M12 18v3M16 18v2"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7s3 4-2 7.5M14 12c4 0 7 1 7 4s-4 3-7.5-2M12 14c0 4-1 7-4 7s-3-4 2-7.5M10 12c-4 0-7-1-7-4s4-3 7.5 2"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
    chart: '<path d="M3 3v18h18M8 17v-5M13 17V8M18 17v-9"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    mega: '<path d="m3 11 15-6v14L3 13zM11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    swap: '<path d="M8 7h12l-4-4M16 17H4l4 4"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m4.9 4.9 4.3 4.3M14.8 14.8l4.3 4.3M14.8 9.2l4.3-4.3M4.9 19.1l4.3-4.3"/>',
    robot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M9 13v2M15 13v2M2 14h2M20 14h2"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    door: '<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01M13 4.6v16.2a1 1 0 0 1-1.2 1L5 20V5.6a2 2 0 0 1 1.5-1.9l4-1A2 2 0 0 1 13 4.6z"/>',
    paint: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7h2a5.6 5.6 0 0 0 5.4-5.6C22 6 17.5 2 12 2z"/>',
    video: '<path d="m22 8-6 4 6 4zM2 6h14v12H2z"/>',
    note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5z"/><path d="M15 3v6h6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    broom: '<path d="m13 11 9-9M14.6 12.6c.8.8.9 2.1.2 3L10 22l-8-8 6.4-4.8c.9-.7 2.2-.6 3 .2z"/><path d="m6.8 10.4 6.8 6.8"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  var M = {
    '📞': 'phone', '☎': 'phone', '📵': 'phone', '💬': 'chat', '📅': 'cal', '🗓': 'cal', '📍': 'pin', '📌': 'pin', '👤': 'user', '🧑': 'user', '👥': 'users', '👪': 'users',
    '💰': 'won', '💵': 'won', '💸': 'won', '💱': 'won', '🏦': 'building', '🏠': 'home', '🏡': 'home', '📋': 'list', '🗂': 'folder', '📂': 'folder', '🧾': 'receipt',
    '🛠': 'tool', '🔧': 'tool', '🧰': 'tool', '🔨': 'hammer', '✅': 'check', '☑': 'check', '✔': 'tick', '📸': 'camera', '📷': 'camera', '💡': 'bulb', '⭐': 'star',
    '🏅': 'star', '📦': 'box', '⚠': 'alert', '📨': 'send', '📤': 'upload', '📥': 'download', '📲': 'mobile', '📱': 'mobile', '🏢': 'building', '🏛': 'building',
    '📄': 'doc', '📝': 'edit', '✏': 'edit', '✍': 'edit', '🖼': 'image', '🎨': 'paint', '▶': 'play', '🎬': 'video', '📺': 'video', '☁': 'cloud', '🌫': 'cloud', '⛅': 'cloud',
    '🌤': 'sun', '☀': 'sun', '🌙': 'moon', '🛌': 'moon', '🌧': 'rain', '🌦': 'rain', '⛈': 'rain', '❄': 'rain', '🎁': 'gift', '🤝': 'hand', '👷': 'worker', '💾': 'save',
    '🚚': 'truck', '⏳': 'clock', '⏰': 'clock', '⏱': 'clock', '👀': 'eye', '🔎': 'search', '🔍': 'search', '♥': 'heart', '📐': 'ruler', '📏': 'ruler', '🏷': 'tag',
    '🔖': 'bookmark', '❓': 'help', '🤔': 'help', '✨': 'spark', '🌀': 'fan', '🎤': 'mic', '📊': 'chart', '📈': 'chart', '📢': 'mega', '📣': 'mega', '↔': 'swap',
    '🔁': 'swap', '🔄': 'swap', '💳': 'card', '🛟': 'lifebuoy', '🤖': 'robot', '↩': 'undo', '🔒': 'lock', '🔔': 'bell', '📇': 'list', '🖨': 'print', '⚙': 'gear',
    '✂': 'scissors', '🚪': 'door', '🎯': 'target', '🧹': 'broom', '❌': 'x', '🙅': 'x', '👉': 'arrow', '➡': 'arrow', '🧭': 'pin', '🗺': 'pin', '📖': 'doc', '🗜': 'box', '🧱': 'box'
  };
  var RE = /(\p{Extended_Pictographic}|[↔↩✔✅☑])️?‍?/gu, ONE = /^\s*(\p{Extended_Pictographic}|[↔↩✔✅☑])️?/u;
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1, CODE: 1, PRE: 1, NOSCRIPT: 1, svg: 1, SVG: 1, TITLE: 1 };
  function ic(n) { var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'dic'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = P[n]; return s; }
  function skip(el) { for (; el && el !== document.body; el = el.parentNode) { if (SKIP[el.nodeName] || el.isContentEditable || (el.getAttribute && el.getAttribute('data-emo') === 'keep')) return true; } return false; }
  function fix(t) {
    var v = t.nodeValue; if (!v || !t.parentNode || !RE.test(v)) return; RE.lastIndex = 0;
    if (skip(t.parentNode)) return;
    var m = v.match(ONE), lead = m && M[m[1]], first = !t.previousSibling;
    var rest = v.replace(RE, '').replace(/^\s+/, first || lead ? '' : ' ').replace(/ {2,}/g, ' ');
    var par = t.parentNode;
    if (lead) { t.nodeValue = (first ? '' : ' ') + rest.replace(/^\s+/, ''); var s = ic(lead); if (!t.nodeValue.trim() && !t.nextSibling) s.setAttribute('class', 'dic solo'); if (t.parentNode === par) par.insertBefore(s, t); }
    else t.nodeValue = rest;
  }
  function walk(root) {
    if (root.nodeType === 3) return fix(root);
    if (root.nodeType !== 1) return;
    if (root.querySelectorAll) [root].concat([].slice.call(root.querySelectorAll('[placeholder],[title],[aria-label]'))).forEach(function (e) { ['placeholder', 'title', 'aria-label'].forEach(function (k) { var v = e.getAttribute && e.getAttribute(k); if (v && RE.test(v)) { RE.lastIndex = 0; e.setAttribute(k, v.replace(RE, '').replace(/^\s+/, '').replace(/ {2,}/g, ' ')); } RE.lastIndex = 0; }); });
    if (SKIP[root.nodeName]) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), a = [], n; while ((n = w.nextNode())) a.push(n); a.forEach(fix);
  }
  function go() {
    walk(document.body);
    new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === 'characterData') fix(m.target); else m.addedNodes.forEach(walk); }); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
    document.title = document.title.replace(RE, '').trim();
  }
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})();
