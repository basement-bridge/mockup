/* Plan UI review, phone. Behaviour for 390 and 360 wide. Swipes are pointer events, so a mouse drags exactly like a finger;
   keyboard: focus a card, X replan, Shift X not cooking, H hold, E or Enter open. Same service methods as the chat tools. */
(function () {
  var P = window.PUR, ic = P.icons, q = new URLSearchParams(location.search);
  function pick(k, ok, d) { var v = q.get(k); return ok.indexOf(v) > -1 ? v : d; }
  var S = { lay: pick('lay', ['agenda', 'focus'], 'agenda'), f: pick('f', ['strip', 'menu'], 'strip'), sw: pick('sw', ['tint', 'buttons'], 'tint'),
    today: pick('today', ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], 'tue'), day: q.get('day') || 'wed', view: q.get('who') || 'mine', hl: null, sel: q.get('sel'), snap: q.get('snap') === 'full' ? 'full' : 'half',
    expand: q.get('expand') === '1', asheet: null, opts: false, undo: null, meals: JSON.parse(JSON.stringify(P.meals)), blocked: JSON.parse(JSON.stringify(P.blocked)) };
  var root = document.getElementById('root'), DI = P.DAYS.map(function (d) { return d[0]; });
  if (!S.meals.some(function (m) { return m.id === S.sel; })) S.sel = null;
  function di(d) { return DI.indexOf(d); } function past(d) { return di(d) < di(S.today); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function find(id) { return S.meals.filter(function (m) { return m.id === id; })[0]; }
  function vis() { return S.meals.filter(function (m) { return P.match(m, S.view); }); }
  function dayName(d) { var x = P.DAYS[di(d)]; return x[1] + ' ' + x[2] + ' Oct'; }
  function vlab(v) { return v === 'mine' ? 'Mine' : v === 'everyone' ? 'Everyone' : P.people.filter(function (p) { return p.id === v; })[0].n; }
  function cnt(v) { return S.meals.filter(function (m) { return P.match(m, v); }).length; }

  function chips(m) {
    var o = '', mc = m.miss.length;
    function c(cls, i, t, tip) { return '<span class="tg ' + cls + '" aria-label="' + tip + '">' + i + t + '</span>'; }
    o += mc ? c('bad', ic.warn, 'Missing ' + mc, mc + ' missing') : c('ok', ic.check, 'All on hand', 'All on hand');
    if (m.list) o += c('list', ic.cart, 'On list ' + m.list, m.list + ' on list'); if (m.held) o += c('held', ic.mark, 'Held', 'Held');
    if (m.useby.length) o += c('ub', ic.clock, 'Use by ' + esc(m.useby[0][1]), 'use-by');
    return '<div class="chs">' + o + '</div>' + (mc ? '<div class="names">Missing: ' + esc(m.miss.map(function (x) { return x[0]; }).join(', ')) + '</div>' : '');
  }
  function card(m) {
    var hl = S.hl === 'missing' ? m.miss.length : S.hl === 'useby' ? m.useby.length : 1;
    return '<div class="sw' + (S.sw === 'buttons' ? ' btns' : '') + '" data-sw="' + m.id + '"><div class="und" aria-hidden="true"><span class="l">' + ic.moon + ' Not cooking</span><span class="r">Replan ' + ic.swap + '</span></div>' +
      '<article class="mc' + (S.sel === m.id ? ' sel' : '') + (hl ? '' : ' dim') + '" tabindex="0" data-id="' + m.id + '" aria-label="' + esc(m.t) + ', ' + dayName(m.day) + '. Swipe right: not cooking. Swipe left: replan. Or press X, Shift X.">' +
      '<span class="em">' + m.em + '</span><div class="tx"><h3>' + esc(m.t) + '</h3><p>' + esc(P.whoLabel(m)) + '</p>' + (m.left ? '<p class="lf">' + ic.swap + ' Leftovers from ' + m.left + '</p>' : '') + '</div>' +
      '<button class="more" data-more="' + m.id + '" aria-label="Actions for ' + esc(m.t) + '">' + ic.more + '</button>' + chips(m) + '</article></div>';
  }
  function emptyHtml(d) {
    if (past(d)) return '<div class="empty past">Nothing was planned</div>';
    if (S.blocked[d]) return '<button class="blk' + (S.blocked[d] === 'usual' ? ' usual' : '') + '" data-unblock="' + d + '"><b>Not cooking</b><span>This week only · tap to cook</span></button>';
    return '<div class="empty" data-blockrow="' + d + '"><span>Open night</span><span class="sp"></span><button data-assist>' + ic.spark + ' Ask assistant</button><button data-block="' + d + '">' + ic.moon + ' Not cooking</button></div>';
  }
  function dayBody(d) {
    var ms = vis().filter(function (m) { return m.day === d; });
    if (!ms.length) return emptyHtml(d);
    return (ms.some(function (m) { return m.usual; }) ? '<p class="tipl">Usual day off, cooking this week</p>' : '') + ms.map(card).join('') + (P.tips[d] && !past(d) ? '<p class="tipl">' + ic.leaf + ' ' + esc(P.tips[d]) + '</p>' : '');
  }
  function stats() {
    var ms = vis(), miss = 0, ub = 0, nights = {}; ms.forEach(function (m) { nights[m.day] = 1; miss += m.miss.length; ub += m.useby.length; }); return { miss: miss, ub: ub, nights: Object.keys(nights).length };
  }
  function dayStrip() {
    return '<div class="days" role="tablist" aria-label="Days">' + P.DAYS.map(function (x) {
      var d = x[0], ms = vis().filter(function (m) { return m.day === d; }), dots = '';
      if (ms.length) ms.slice(0, 3).forEach(function (m) { dots += '<i class="' + (m.miss.length ? 'bad' : '') + '"></i>'; });
      else dots = S.blocked[d] ? '<i class="off"></i>' : '<i class="open"></i>';
      var on = S.lay === 'focus' ? S.day === d : S.cur === d;
      return '<button class="dy' + (d === S.today ? ' today' : '') + (on ? ' on' : '') + (past(d) ? ' past' : '') + '" data-dy="' + d + '" role="tab" aria-selected="' + on + '" aria-label="' + x[1] + ' ' + x[2] + ', ' + (ms.length ? ms.length + ' meals' : S.blocked[d] ? 'not cooking' : 'open') + '">' + x[1].charAt(0) + '<b>' + x[2] + '</b><span class="st">' + dots + '</span></button>';
    }).join('') + '</div>';
  }
  function people() {
    var others = P.people.filter(function (p) { return !p.me; });
    if (S.f === 'menu') return '<button class="fmenu" data-fmenu aria-haspopup="dialog"><span>Showing</span><b>' + vlab(S.view) + '</b>' + ic.down + '</button>';
    var ch = function (v, l, av) { return '<button class="ch' + (S.view === v ? ' on' : '') + '" data-view="' + v + '" role="radio" aria-checked="' + (S.view === v) + '">' + (av ? '<span class="av">' + av + '</span>' : '') + l + ' <i>' + cnt(v) + '</i></button>'; };
    return '<div class="pp"><div class="pstrip' + (S.expand ? ' open' : '') + '" id="pstrip" role="radiogroup" aria-label="Whose meals">' + ch('mine', 'Mine') + ch('everyone', 'Everyone') + others.map(function (p, i) { return ch(p.id, p.n, p.n.charAt(0)).replace('class="ch', 'class="ch' + (i === 0 ? ' dv' : '')); }).join('') + '</div><button class="chev" id="pchev" data-expand aria-label="' + (S.expand ? 'Collapse people' : 'Show everyone') + '" aria-expanded="' + S.expand + '" hidden>' + (S.expand ? ic.up : ic.down) + '</button></div>';
  }
  function summary() {
    var s = stats();
    return '<div class="sum"><span class="sb"><b>' + s.nights + '/7</b><span>nights</span></span><button class="sb' + (S.hl === 'missing' ? ' on' : '') + '" data-hl="missing" aria-pressed="' + (S.hl === 'missing') + '">' + ic.warn + '<b>' + s.miss + '</b><span>to buy</span></button><button class="sb' + (S.hl === 'useby' ? ' on' : '') + '" data-hl="useby" aria-pressed="' + (S.hl === 'useby') + '">' + ic.clock + '<b>' + s.ub + '</b><span>use first</span></button></div>';
  }
  function body() {
    if (S.lay === 'agenda') return P.DAYS.map(function (x) { var d = x[0]; return '<section class="dsec' + (past(d) ? ' past' : '') + '" id="d-' + d + '" data-d="' + d + '"><div class="dsh"><b>' + x[1] + '</b><span>' + x[2] + ' Oct</span>' + (d === S.today ? '<em>Today</em>' : '') + '</div><div class="cl">' + dayBody(d) + '</div></section>'; }).join('');
    var d = S.day, ms = vis().filter(function (m) { return m.day === d; }), buy = [], ubn = [];
    ms.forEach(function (m) { m.miss.forEach(function (x) { buy.push(x[0]); }); m.useby.forEach(function (u) { ubn.push(u[0] + ' by ' + u[1]); }); });
    var i = di(d), prev = i > 0 ? P.DAYS[i - 1] : null, next = i < 6 ? P.DAYS[i + 1] : null;
    return '<h2 class="fh">' + dayName(d) + (d === S.today ? ' <em>Today</em>' : '') + '</h2>' + (ms.length ? '<div class="prep"><b>Before this night</b>' + (buy.length ? '<span class="m">Buy: ' + esc(buy.join(', ')) + '</span>' : '<span>Nothing to buy</span>') + (ubn.length ? '<span>Use first: ' + esc(ubn.join(', ')) + '</span>' : '') + '</div>' : '') + '<div class="dsec" style="padding-top:0"><div class="cl">' + dayBody(d) + '</div></div>' +
      '<div class="dnav"><button data-step="-1"' + (prev ? '' : ' disabled') + '>' + ic.left + ' ' + (prev ? prev[1] : '') + '</button><button data-step="1"' + (next ? '' : ' disabled') + '>' + (next ? next[1] : '') + ' ' + ic.right + '</button></div>';
  }
  function nav() {
    var n = function (l, d, on) { return '<button class="nv' + (on ? ' on' : '') + '" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>' + l + '</button>'; };
    return '<nav class="nav" aria-label="Kitchie">' + n('Home', '<path d="M4 11l8-7 8 7v9H4z"/>') + n('Pantry', '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 9h12"/>') + n('Plan', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', 1) + n('Recipes', '<path d="M6 14a4 4 0 1 1 2-7 4 4 0 0 1 8 0 4 4 0 1 1 2 7v5H6z"/>') + n('Shopping', '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12h11l2-8H6"/>') + '</nav>';
  }
  function ingRows(list, miss, m) { return list.map(function (r) { var ub = m.useby.filter(function (u) { return u[0] === r[0]; })[0]; return '<li><span class="in">' + esc(r[0]) + '</span><span class="qy">' + esc(r[1]) + '</span>' + (miss ? '<button class="ib" data-addone="' + esc(r[0]) + '" aria-label="Add ' + esc(r[0]) + ' to the shopping list">' + ic.cart + '</button>' : (ub ? '<span class="tg ub small">' + ic.clock + 'by ' + esc(ub[1]) + '</span>' : '')) + '</li>'; }).join(''); }
  function sheet() {
    var m = S.sel && find(S.sel); if (!m) return '<div class="sheet" id="sheet" aria-hidden="true"></div>';
    var src = m.src === 'made' ? '<p class="srcl">' + ic.spark + ' <b>Made up by your assistant</b> · not saved as a recipe</p>' : '';
    return '<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="stt"><button class="grab" id="grab" aria-label="Drag to resize or close; press Enter to switch half and full" data-grab><i></i></button>' +
      '<header class="shd"><span class="em lg">' + m.em + '</span><div class="tx"><h2 id="stt">' + esc(m.t) + '</h2><p>' + dayName(m.day) + ' · ' + esc(P.whoLabel(m)) + '</p></div><button class="ib" data-close aria-label="Close (Esc)">' + ic.x + '</button></header>' +
      '<div class="sbody">' + src + (m.note ? '<p class="nt">' + esc(m.note) + '</p>' : '') + '<div class="ppl"><span class="lbl">People</span><button class="ib" data-n="-1" aria-label="Fewer people">−</button><b>' + m.n + '</b><button class="ib" data-n="1" aria-label="More people">+</button></div>' +
      '<section class="isec"><div class="ish"><h3>On hand</h3><button class="hold' + (m.held ? ' on' : '') + '" data-hold aria-pressed="' + !!m.held + '">' + ic.mark + (m.held ? ' Held' : ' Hold') + '</button></div><ul class="ing">' + ingRows(m.have, 0, m) + '</ul></section>' +
      (m.miss.length ? '<section class="isec"><div class="ish"><h3>Missing</h3><button class="addall" data-addall>' + ic.cart + ' Add all ' + m.miss.length + '</button></div><p class="hint">Talk to your assistant about substitutes</p><ul class="ing miss">' + ingRows(m.miss, 1, m) + '</ul></section>' : '<p class="allgood">' + ic.check + ' Everything for this meal is on hand.</p>') + '</div>' +
      '<footer class="sfoot"><button class="b2" data-replan>Replan</button><button class="b2" data-nocook>' + ic.moon + ' Not cooking</button></footer></div>';
  }
  function asheetHtml() {
    var a = S.asheet; if (!a) return '';
    if (a.k === 'f') {
      var f = (a.q || '').toLowerCase();
      var it = function (v, l) { return '<button class="it' + (S.view === v ? ' on' : '') + '" data-view="' + v + '">' + (S.view === v ? ic.check : ic.people) + l + '<span class="kbd">' + cnt(v) + '</span></button>'; };
      return '<div class="scrim2" data-closea></div><div class="asheet" role="dialog" aria-label="Whose meals"><h2>Showing</h2><input id="fq" placeholder="Find a person" aria-label="Find a person" value="' + esc(a.q || '') + '">' + it('mine', 'Mine') + it('everyone', 'Everyone') + P.people.filter(function (p) { return !p.me && p.n.toLowerCase().indexOf(f) > -1; }).map(function (p) { return it(p.id, p.n); }).join('') + '</div>';
    }
    var m = find(a.id);
    return '<div class="scrim2" data-closea></div><div class="asheet" role="menu" aria-label="Actions for ' + esc(m.t) + '"><h2>' + esc(m.t) + '</h2><button class="it" role="menuitem" data-act="open" data-id="' + m.id + '">' + ic.right + 'Open detail<span class="kbd">E</span></button><button class="it" role="menuitem" data-act="replan" data-id="' + m.id + '">' + ic.swap + 'Replan (swipe left)<span class="kbd">X</span></button><button class="it" role="menuitem" data-act="nocook" data-id="' + m.id + '">' + ic.moon + 'Not cooking (swipe right)<span class="kbd">⇧X</span></button><button class="it" role="menuitem" data-act="hold" data-id="' + m.id + '">' + ic.mark + (m.held ? 'Release hold' : 'Hold') + '<span class="kbd">H</span></button>' + (m.miss.length ? '<button class="it" role="menuitem" data-act="list" data-id="' + m.id + '">' + ic.cart + 'Add missing to list<span class="kbd">L</span></button>' : '') + '</div>';
  }
  function optionsPanel() {
    var g = function (k, lab, vals) { return '<fieldset><legend>' + lab + '</legend>' + vals.map(function (v) { return '<label><input type="radio" name="' + k + '" value="' + v[0] + '"' + (S[k] === v[0] ? ' checked' : '') + '> ' + v[1] + '</label>'; }).join('') + '</fieldset>'; };
    return (window.top === window || q.get('opts') === '1') ? '<button class="optfab" data-opts>Options</button>' + (S.opts ? '<div class="optpanel">' + g('lay', 'Layout', [['agenda', 'M1 Agenda + day strip (recommended)'], ['focus', 'M2 One day at a time']]) + g('f', 'People filter', [['strip', 'Scroll strip + expand (recommended)'], ['menu', 'One menu with search']]) + g('sw', 'Swipe', [['tint', 'Tinted reveal, commits (recommended)'], ['buttons', 'Buttons stay open']]) + '</div>' : '') : '';
  }
  var toastT;
  function toast(msg, undo) { var t = document.getElementById('toast'); if (!t) return; t.innerHTML = '<span>' + msg + '</span>' + (undo ? '<button data-undo>Undo</button>' : ''); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 6000); }

  function render(keep) {
    var sy = window.scrollY;
    root.innerHTML = '<div class="app ' + (S.lay === 'focus' ? 'focuslay' : '') + '"><div class="stk"><div class="hd"><button class="ib" disabled aria-label="Previous week (last week is read-only)">' + ic.left + '</button><div class="wt"><h1>Week of 12 Oct</h1><small>This week</small></div><button class="ib" data-wk aria-label="Next week">' + ic.right + '</button><span class="sp"></span><button class="ib" aria-label="Copy last week">' + ic.copy + '</button><button class="ib" aria-label="Plan settings">' + ic.cog + '</button></div>' + people() + dayStrip() + '</div>' + summary() + '<main id="plan">' + body() + '</main></div>' +
      '<button class="ast" data-assist>' + ic.spark + ' Open your assistant</button>' + nav() + '<div class="scrim' + (S.sel ? ' on' : '') + '" data-close></div>' + sheet() + '<div id="aw">' + asheetHtml() + '</div><div class="toast" id="toast" role="status" hidden></div>' + optionsPanel();
    if (keep !== false) window.scrollTo(0, sy);
    var sh = document.getElementById('sheet'); if (sh && S.sel) { requestAnimationFrame(function () { setSnap(S.snap, true); var c = document.querySelector('.mc.sel'); if (c && S.lay === 'agenda') { var top = c.getBoundingClientRect().top - document.querySelector('.stk').offsetHeight - 8; if (top > 4 || top < -4) window.scrollBy(0, top); } }); }
    var st = document.getElementById('pstrip'), ch = document.getElementById('pchev'); if (st && ch) ch.hidden = !(st.scrollWidth > st.clientWidth + 2 || S.expand);
  }
  function setSnap(s, instant) {
    var sh = document.getElementById('sheet'); if (!sh) return; S.snap = s; var H = innerHeight * 0.92, y = s === 'full' ? 0 : Math.round(H * 0.38);
    sh.style.setProperty('--y', y + 'px'); sh.classList.remove('drag');
  }
  function snapshot() { return JSON.stringify({ m: S.meals, b: S.blocked, sel: S.sel }); }
  function act(a, id) {
    var m = find(id); if (!m) return;
    if (a === 'open') { S.sel = id; S.asheet = null; S.snap = 'half'; return render(); }
    if (a === 'hold') { m.held = m.held ? 0 : 1; S.asheet = null; render(); return toast(m.held ? 'Holding the ingredients' : 'Hold released'); }
    if (a === 'list') { S.undo = snapshot(); m.list += m.miss.length; S.asheet = null; render(); return toast('Added ' + m.miss.length + ' to the shopping list', 1); }
    S.undo = snapshot(); S.meals = S.meals.filter(function (x) { return x.id !== id; }); if (S.sel === id) S.sel = null; S.asheet = null; if (a === 'nocook') S.blocked[m.day] = 'once';
    render(); toast(a === 'nocook' ? esc(m.t) + ' removed. ' + P.DAYS[di(m.day)][1] + ' is Not cooking' : esc(m.t) + ' removed. ' + P.DAYS[di(m.day)][1] + ' is open to replan', 1);
  }
  function closeSheet() { S.sel = null; render(); }

  /* swipe: pointer events for touch and mouse alike */
  var drag = null, TH = 88, OPEN = 150;
  document.addEventListener('pointerdown', function (e) {
    var mc = e.target.closest('.mc'); if (!mc || e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { mc: mc, sw: mc.parentNode, x: e.clientX, y: e.clientY, dx: 0, on: false, id: e.pointerId, base: +(mc.dataset.open || 0) };
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) { if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4) { drag.on = true; drag.mc.classList.add('drag'); try { drag.mc.setPointerCapture(e.pointerId); } catch (x) { } } else if (Math.abs(dy) > 10) { drag = null; return; } else return; }
    var t = Math.max(-OPEN - 20, Math.min(OPEN + 20, drag.base + dx)); drag.dx = t; drag.mc.style.transform = 'translateX(' + t + 'px)';
    drag.sw.classList.toggle('l', t > 0); drag.sw.classList.toggle('r', t < 0); drag.sw.classList.toggle('ready', Math.abs(t) > TH);
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return; var d = drag; drag = null; if (!d.on) return; d.mc.classList.remove('drag'); d.mc.dataset.moved = '1'; setTimeout(function () { delete d.mc.dataset.moved; }, 50);
    var id = d.mc.dataset.id, t = d.dx;
    if (S.sw === 'tint') { if (t > TH) return act('nocook', id); if (t < -TH) return act('replan', id); d.mc.style.transform = ''; d.sw.classList.remove('l', 'r', 'ready'); return; }
    var to = t > TH / 2 ? OPEN : t < -TH / 2 ? -OPEN : 0; d.mc.style.transform = to ? 'translateX(' + to + 'px)' : ''; d.mc.dataset.open = to; if (!to) d.sw.classList.remove('l', 'r', 'ready'); else { d.sw.classList.add(to > 0 ? 'l' : 'r'); d.sw.dataset.id = id; }
  }
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);
  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.sw.btns');
    if (sw && sw.querySelector('.mc').dataset.open && !e.target.closest('.mc')) { var id = sw.dataset.id, o = +sw.querySelector('.mc').dataset.open; return act(o > 0 ? 'nocook' : 'replan', id); }
  }, true);

  /* sheet drag */
  var sd = null, lastMove = 0;
  document.addEventListener('pointerdown', function (e) {
    var g = e.target.closest('[data-grab]'); if (!g) return; var sh = document.getElementById('sheet'); sd = { y: e.clientY, id: e.pointerId, h: innerHeight * 0.92, s0: S.snap, moved: 0 }; sh.classList.add('drag'); try { g.setPointerCapture(e.pointerId); } catch (x) { }
  });
  document.addEventListener('pointermove', function (e) {
    if (!sd || e.pointerId !== sd.id) return; var dy = e.clientY - sd.y; sd.moved = Math.max(sd.moved, Math.abs(dy)); var base = sd.s0 === 'full' ? 0 : Math.round(sd.h * .38); document.getElementById('sheet').style.setProperty('--y', Math.max(0, base + dy) + 'px'); sd.dy = dy;
  });
  function endSheet(e) {
    if (!sd || e.pointerId !== sd.id) return; var d = sd; sd = null; var dy = d.dy || 0; lastMove = d.moved > 5 ? Date.now() : 0; var sh = document.getElementById('sheet'); sh.classList.remove('drag');
    if (d.moved < 6) return; if (d.s0 === 'half' && dy > 90) return closeSheet(); if (dy < -50) return setSnap('full'); if (dy > 60 && d.s0 === 'full') return setSnap('half'); setSnap(d.s0);
  }
  document.addEventListener('pointerup', endSheet); document.addEventListener('pointercancel', endSheet);

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button,article,[data-closea],[data-close],[data-blockrow]'); if (!t) return; var d = t.dataset;
    if (t.classList.contains('mc') && t.dataset.moved) return;
    if (d.opts !== undefined) { S.opts = !S.opts; return render(); }
    if (d.more) { S.asheet = { k: 'm', id: d.more }; return render(); }
    if (d.closea !== undefined) { S.asheet = null; return render(); }
    if (d.act) return act(d.act, d.id);
    if (d.fmenu !== undefined) { S.asheet = { k: 'f', q: '' }; render(); var f = document.getElementById('fq'); if (f) f.focus(); return; }
    if (d.view) { S.view = d.view; S.asheet = null; if (S.sel && !P.match(find(S.sel), S.view)) S.sel = null; return render(); }
    if (d.expand !== undefined) { S.expand = !S.expand; return render(); }
    if (d.hl) { S.hl = S.hl === d.hl ? null : d.hl; return render(); }
    if (d.dy) { if (S.lay === 'focus') { S.day = d.dy; return render(false); } var el = document.getElementById('d-' + d.dy); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); S.cur = d.dy; return; }
    if (d.step) { S.day = P.DAYS[di(S.day) + (+d.step)][0]; return render(false); }
    if (d.close !== undefined) return closeSheet();
    if (d.grab !== undefined) { if (Date.now() - lastMove < 150) return; return setSnap(S.snap === 'half' ? 'full' : 'half'); }
    if (d.hold !== undefined) return act('hold', S.sel); if (d.replan !== undefined) return act('replan', S.sel); if (d.nocook !== undefined) return act('nocook', S.sel); if (d.addall !== undefined) return act('list', S.sel);
    if (d.addone) { var m = find(S.sel); S.undo = snapshot(); m.miss = m.miss.filter(function (x) { return x[0] !== d.addone; }); m.list++; var st = S.snap; render(); return toast(esc(d.addone) + ' added to the shopping list', 1); }
    if (d.n) { var mm = find(S.sel); mm.n = Math.max(1, mm.n + (+d.n)); return render(); }
    if (d.block) { S.undo = snapshot(); S.blocked[d.block] = 'once'; render(); return toast(P.DAYS[di(d.block)][1] + ' is Not cooking (this week only)', 1); }
    if (d.blockrow) { if (e.target.closest('button')) return; S.undo = snapshot(); S.blocked[d.blockrow] = 'once'; render(); return toast(P.DAYS[di(d.blockrow)][1] + ' is Not cooking (this week only)', 1); }
    if (d.unblock) { S.undo = snapshot(); delete S.blocked[d.unblock]; render(); return toast(P.DAYS[di(d.unblock)][1] + ' is open again', 1); }
    if (d.assist !== undefined) return toast('Opens your default AI app (decision 45).');
    if (d.wk !== undefined) return toast('Next week is not drawn: one sample week.');
    if (d.undo !== undefined) { if (!S.undo) return; var u = JSON.parse(S.undo); S.meals = u.m; S.blocked = u.b; S.sel = u.sel; S.undo = null; render(); return toast('Restored'); }
    if (t.classList.contains('mc')) { S.sel = t.dataset.id; S.snap = 'half'; render(); }
  });
  document.addEventListener('change', function (e) { var n = e.target.name; if (n && S[n] !== undefined) { S[n] = e.target.value; S.hl = null; S.opts = true; render(); } });
  document.addEventListener('input', function (e) { if (e.target.id === 'fq' && S.asheet) { S.asheet.q = e.target.value; var pos = e.target.selectionStart; document.getElementById('aw').innerHTML = asheetHtml(); var f = document.getElementById('fq'); f.focus(); f.setSelectionRange(pos, pos); } });
  document.addEventListener('keydown', function (e) {
    if ((e.target.tagName || '').toLowerCase() === 'input') { if (e.key === 'Escape') { S.asheet = null; render(); } return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return; var k = e.key;
    if (k === 'Escape') { if (S.asheet) { S.asheet = null; render(); } else if (S.sel) closeSheet(); return; }
    var a = document.activeElement, id = a && a.classList.contains('mc') ? a.dataset.id : S.sel;
    if (k.toLowerCase() === 'x' && id) { e.preventDefault(); return act(e.shiftKey ? 'nocook' : 'replan', id); }
    if (k.toLowerCase() === 'h' && id) return act('hold', id); if (k.toLowerCase() === 'l' && id) return act('list', id);
    if ((k.toLowerCase() === 'e' || (k === 'Enter' && a && a.classList.contains('mc'))) && id) { e.preventDefault(); return act('open', id); }
    if (k.toLowerCase() === 'z' && S.undo) { var u = JSON.parse(S.undo); S.meals = u.m; S.blocked = u.b; S.sel = u.sel; S.undo = null; render(); return toast('Restored'); }
    if (a && a.id === 'grab' && (k === 'ArrowUp' || k === 'ArrowDown')) { e.preventDefault(); return setSnap(k === 'ArrowUp' ? 'full' : 'half'); }
  });
  /* the day strip follows the page in the agenda layout: the day whose heading last passed under the sticky stack */
  var tick = 0;
  function follow() {
    tick = 0; if (S.lay !== 'agenda') return; var stk = document.querySelector('.stk'); if (!stk) return; var lim = stk.offsetHeight + 24, cur = DI[0];
    DI.forEach(function (d) { var s = document.getElementById('d-' + d); if (s && s.getBoundingClientRect().top <= lim) cur = d; });
    if (cur !== S.cur) { S.cur = cur; document.querySelectorAll('.dy').forEach(function (b) { var on = b.dataset.dy === cur; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); }
  }
  window.addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(follow); }, { passive: true });
  window.addEventListener('resize', function () { var st = document.getElementById('pstrip'), ch = document.getElementById('pchev'); if (st && ch) ch.hidden = !(st.scrollWidth > st.clientWidth + 2 || S.expand); });
  S.cur = S.today;
  render(false);
  if (S.lay === 'agenda' && di(S.today) > 0 && !q.get('top')) { var el = document.getElementById('d-' + S.today); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - document.querySelector('.stk').offsetHeight - 4); follow(); }
})();
