/* Plan UI review, desktop. Day ribbon revision, 12 Oct 2026: the owner's phone decisions 85 to 106 carried over as PROPOSALS for desktop (see plan-ui-review.md). Behaviour only; no viewport rules (those are in d-1024.css, d-1280.css, d-1440.css, d-1920.css).
   Every action here is one the chat tools already have (plan_remove_meal, plan_block_day, plan_reserve, plan_add_missing_to_list, plan_update_meal): the UI calls the same service methods. */
(function () {
  var P = window.PUR, ic = P.icons, q = new URLSearchParams(location.search);
  function pick(k, ok, d) { var v = q.get(k); return ok.indexOf(v) > -1 ? v : d; }
  var S = {
    lay: pick('lay', ['board', 'agenda', 'focus'], 'board'), insp: pick('insp', ['dock', 'flyout'], 'dock'),
    f: pick('f', ['menu', 'seg', 'chips'], 'menu'), e: pick('e', ['ghost', 'slim'], 'ghost'), c: pick('c', ['labels', 'badge', 'edge', 'progress', 'line', 'icons'], 'labels'), pc: pick('pc', ['step', 'drop'], 'step'),
    nc: pick('nc', ['slim', 'block'], 'slim'), cl: pick('cl', ['meals', 'all'], 'meals'), cu: pick('cu', ['start', 'idle', 'off'], 'start'),
    today: P.did(q.get('today'), 'd13'), sel: q.get('sel'), cur: P.did(q.get('day'), 'd14'), view: q.get('who') || 'mine', hl: null, pop: null, help: q.get('help') === '1',
    meals: JSON.parse(JSON.stringify(P.meals)), blocked: JSON.parse(JSON.stringify(P.blocked)), ustk: [], opts: false, cuShown: false, cuNew: false, cuDone: {}, pulse: null
  };
  if (S.c === 'icons') S.c = 'badge';
  if (!S.meals.some(function (m) { return m.id === S.sel; })) S.sel = null;
  var root = document.getElementById('root'), DI = P.RIB.map(function (d) { return d.id; }), TODAYN = 13;
  if (S.sel) { var sm = P.meals.filter(function (m) { return m.id === S.sel; })[0]; if (sm && !q.get('day')) S.cur = sm.day; }
  function wk() { return P.dinfo(S.cur).wk; }
  function weekDays() { var w = wk(); return P.RIB.filter(function (r) { return r.wk === w; }); }
  function ro() { return S.view !== 'mine' && S.view !== 'everyone'; }
  function dayIdx(d) { return DI.indexOf(d); }
  function isPast(d) { return dayIdx(d) < dayIdx(S.today); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function find(id) { return S.meals.filter(function (m) { return m.id === id; })[0]; }
  function vis() { return S.meals.filter(function (m) { return P.match(m, S.view); }); }
  function dayName(d) { var x = P.dinfo(d); return x.dow + ' ' + x.n + ' Oct'; }
  function viewLabel(v) { return v === 'mine' ? 'Mine' : v === 'everyone' ? 'Everyone' : P.people.filter(function (p) { return p.id === v; })[0].n; }
  function stats() {
    var ms = vis().filter(function (m) { return P.dinfo(m.day).wk === wk(); }), miss = 0, missMeals = 0, ub = [], onList = 0, left = 0, cooking = {};
    ms.forEach(function (m) { cooking[m.day] = 1; if (m.miss.length) { miss += m.miss.length; missMeals++; } m.useby.forEach(function (u) { ub.push(u); }); onList += m.list; if (m.left) left++; });
    return { miss: miss, missMeals: missMeals, ub: ub, onList: onList, left: left, nights: Object.keys(cooking).length, cooking: cooking };
  }

  /* ---------- pieces ---------- */
  function chips(m) { return S.c === 'edge' ? '' : P.status.html(m, S.c, TODAYN); }
  function card(m) {
    var hl = S.hl === 'missing' ? m.miss.length : S.hl === 'useby' ? m.useby.length : 1;
    return '<article class="mc' + (S.c === 'edge' ? ' e-' + P.status.edge(m, TODAYN) : '') + (S.sel === m.id ? ' sel' : '') + (hl ? '' : ' dim') + (isPast(m.day) ? ' past' : '') + '" tabindex="0" data-id="' + m.id + '" aria-label="' + esc(m.t) + ', ' + dayName(m.day) + (isPast(m.day) ? ', past, read only' : '') + '">' +
      '<div class="mh"><span class="em">' + m.em + '</span><div class="tx"><h3>' + esc(m.t) + '</h3><p>' + esc(P.whoLabel(m)) + '</p>' + (m.left ? '<p class="lf">' + ic.swap + ' Leftovers from ' + m.left + '</p>' : '') + '</div>' +
      (S.c === 'edge' ? P.status.html(m, 'edge', TODAYN) : '') + '<button class="more" data-more="' + m.id + '" aria-label="Actions for ' + esc(m.t) + '" aria-haspopup="menu" title="Actions (right-click)">' + ic.more + '</button></div>' + chips(m) + '</article>';
  }
  function emptyDay(d) {
    if (isPast(d)) return '<div class="empty past">Nothing was planned</div>';
    if (S.blocked[d]) { if (S.nc === 'slim') return '<button class="ncs" ' + (ro() ? 'disabled' : 'data-unblock="' + d + '"') + ' title="Click to cook this night (this week only)"><b>Not cooking</b><span>' + (S.blocked[d] === 'usual' ? 'Usual day off' : 'This week only') + (ro() ? '' : ' · click to cook') + '</span></button>';
      return '<button class="blk' + (S.blocked[d] === 'usual' ? ' usual' : '') + '" ' + (ro() ? 'disabled' : 'data-unblock="' + d + '"') + ' title="Click to cook this night (this week only)"><b>Not cooking</b><span>' + (S.blocked[d] === 'usual' ? 'Usual day off' : 'This week only') + (ro() ? '' : ' · click to cook') + '</span></button>'; }
    if (ro()) return '<div class="empty ghost ro"><span class="ph">Open night</span></div>';
    var acts = '<button data-ask="' + d + '">' + ic.spark + ' Ask AI</button><button data-surprise="' + d + '">' + ic.dice + ' Surprise me</button>';
    if (S.e === 'slim') return '<div class="empty slim"><button class="ph" data-block="' + d + '" title="Click if you are not cooking">Open night</button>' + acts + '</div>';
    return '<div class="empty ghost"><button class="ph" data-block="' + d + '" title="Click if you are not cooking">Open night<small>click if not cooking</small></button><div class="eacts">' + acts + '<button data-hand title="Opens the Plan it panel">' + ic.plus + ' Add by hand</button></div></div>';
  }
  function dayHead(d, extra) {
    var x = P.dinfo(d), t = d === S.today;
    return '<header class="dh' + (t ? ' today' : '') + '"><b>' + x.dow + '</b><span>' + x.n + ' Oct</span>' + (t ? '<em>Today</em>' : '') + (extra || '') + '</header>';
  }
  function dayBody(d) {
    var ms = vis().filter(function (m) { return m.day === d; });
    var tip = P.tips[d] && !isPast(d) ? '<p class="tipl">' + ic.leaf + ' ' + esc(P.tips[d]) + '</p>' : '';
    var usual = ms.some(function (m) { return m.usual; }) ? '<p class="tipl">Usual day off, cooking this week</p>' : '';
    if (ms.length) return usual + ms.map(card).join('') + tip;
    return emptyDay(d);
  }
  function secCls(d) { return 'day' + (d === S.today ? ' today' : '') + (isPast(d) ? ' pastday' : '') + (d === S.cur && S.lay !== 'focus' ? ' cur' : '') + (S.blocked[d] && !vis().some(function (m) { return m.day === d; }) && S.nc === 'slim' && !isPast(d) ? ' ncday' : '') + (S.pulse && S.pulse.indexOf(d) > -1 ? ' pulse' : ''); }
  function plan() {
    var days = weekDays();
    if (S.lay === 'board' || S.lay === 'agenda') return '<div class="' + S.lay + '">' + days.map(function (x) { var d = x.id; return '<section class="' + secCls(d) + '" data-day="' + d + '" id="day-' + d + '">' + dayHead(d) + '<div class="dc">' + dayBody(d) + '</div></section>'; }).join('') + '</div>';
    var tabs = days.map(function (x) {
      var d = x.id, ms = vis().filter(function (m) { return m.day === d; });
      var st = S.blocked[d] ? 'Off' : ms.length + (ms.length === 1 ? ' meal' : ' meals');
      return '<button class="tab' + (S.cur === d ? ' on' : '') + (d === S.today ? ' today' : '') + '" data-day="' + d + '" role="tab" aria-selected="' + (S.cur === d) + '"><b>' + x.dow + '</b><span>' + x.n + '</span><i>' + st + '</i></button>';
    }).join('');
    var d = S.cur;
    var dms = vis().filter(function (m) { return m.day === S.cur; }), buyN = [], ubN = [];
    dms.forEach(function (m) { m.miss.forEach(function (x) { buyN.push(x[0]); }); m.useby.forEach(function (u) { ubN.push(u[0] + ' by ' + u[1]); }); });
    var prep = dms.length ? '<div class="dayprep"><span><b>Before this night</b></span>' + (buyN.length ? '<span class="m">Buy: ' + esc(buyN.join(', ')) + '</span>' : '<span>Nothing to buy</span>') + (ubN.length ? '<span>Use first: ' + esc(ubN.join(', ')) + '</span>' : '') + '</div>' : '';
    return '<div class="tabs" role="tablist">' + tabs + '</div><section class="' + secCls(d).replace(' cur', '') + ' focusday" data-day="' + d + '"><h2 class="fh">' + dayName(d) + (d === S.today ? ' <em>Today</em>' : '') + '</h2><div class="dc">' + dayBody(d) + prep + '</div></section>';
  }
  function summary() {
    var s = stats(), dots = weekDays().map(function (x) {
      var d = x.id, c = s.cooking[d] ? 'on' : S.blocked[d] ? 'off' : 'open';
      return '<i class="rd ' + c + (d === S.today ? ' td' : '') + '" title="' + x.dow + ': ' + (c === 'on' ? 'cooking' : c === 'off' ? 'not cooking' : 'open') + '"></i>';
    }).join('');
    var ubn = s.ub.length;
    function tile(k, big, lab, sub, extra) { return '<button class="sumt' + (S.hl === k ? ' on' : '') + '" data-hl="' + k + '" aria-pressed="' + (S.hl === k) + '"><span class="big">' + big + '</span><span class="lab">' + lab + '</span><span class="sub">' + sub + '</span>' + (extra || '') + '</button>'; }
    return '<div class="sumstrip" role="group" aria-label="Week at a glance">' +
      '<div class="sumt rhythm"><span class="big">' + s.nights + '<small>/7</small></span><span class="lab">nights cooking</span><span class="rdots" aria-hidden="true">' + dots + '</span></div>' +
      tile('missing', s.miss, 'to buy', s.miss ? 'across ' + s.missMeals + ' meal' + (s.missMeals > 1 ? 's' : '') + ' · ' + s.onList + ' already on list' : 'nothing missing') +
      tile('useby', ubn, 'use first', ubn ? s.ub.slice(0, 2).map(function (u) { return esc(u[0]); }).join(', ') : 'nothing close') +
      '<div class="sumt"><span class="big">' + s.left + '</span><span class="lab">leftover night' + (s.left === 1 ? '' : 's') + '</span><span class="sub">planned from a bigger cook</span></div></div>';
  }
  function avatar(p) { return '<span class="av">' + p.n.charAt(0) + '</span>'; }
  function filter() {
    var ms = S.meals, cnt = function (v) { return ms.filter(function (m) { return P.match(m, v); }).length; };
    var opt = function (v, lab) { return '<button class="fo' + (S.view === v ? ' on' : '') + '" role="radio" aria-checked="' + (S.view === v) + '" data-view="' + v + '">' + (S.view === v ? ic.check : '') + '<span>' + lab + '</span><i>' + cnt(v) + '</i></button>'; };
    var others = P.people.filter(function (p) { return !p.me; });
    var pr = function (p) { return '<button class="fo pp' + (S.view === p.id ? ' on' : '') + '" role="radio" aria-checked="' + (S.view === p.id) + '" data-view="' + p.id + '">' + avatar(p) + '<span>' + p.n + '</span><i>' + cnt(p.id) + '</i></button>'; };
    if (S.f === 'chips') return '<div class="flt" role="radiogroup" aria-label="Whose meals"><div class="fseg">' + opt('mine', 'Mine') + opt('everyone', 'Everyone') + '</div><span class="fvr"></span><div class="fppl" id="fppl">' + others.map(pr).join('') + '</div><button class="fmore" id="fmore" data-pop="people" hidden aria-haspopup="listbox"></button></div>';
    if (S.f === 'menu') return '<div class="flt"><button class="fbtn" data-pop="all" aria-haspopup="listbox"><span class="k">Showing</span><b>' + viewLabel(S.view) + '</b>' + ic.down + '</button></div>';
    var isP = S.view !== 'mine' && S.view !== 'everyone';
    return '<div class="flt" role="radiogroup" aria-label="Whose meals"><div class="fseg">' + opt('mine', 'Mine') + opt('everyone', 'Everyone') + '</div><button class="fbtn' + (isP ? ' on' : '') + '" data-pop="people" aria-haspopup="listbox">' + ic.people + '<b>' + (isP ? viewLabel(S.view) : 'People') + '</b><i>' + others.length + '</i>' + ic.down + '</button></div>';
  }
  function ribbon() {
    var info = P.dinfo(S.cur), groups = [-1, 0, 1].map(function (w) {
      var days = P.RIB.filter(function (r) { return r.wk === w; });
      return '<div class="rg' + (w === wk() ? ' on' : '') + '"><span class="rl">' + P.REL[w] + ' · ' + days[0].n + ' Oct' + (w < 0 ? ' · read only' : '') + '</span><div class="rd7">' + days.map(function (r) {
        var d = r.id, ms = vis().filter(function (m) { return m.day === d; }), dot = ms.length ? (ms.some(function (m) { return m.miss.length; }) ? 'bad' : 'ok') : S.blocked[d] ? 'off' : 'open';
        return '<button class="rdy' + (d === S.today ? ' today' : '') + (d === S.cur ? ' on' : '') + (isPast(d) ? ' past' : '') + '" data-day="' + d + '" role="tab" aria-selected="' + (d === S.cur) + '" aria-label="' + dayName(d) + (d === S.today ? ', today' : '') + ', ' + (ms.length ? ms.length + ' meals' : S.blocked[d] ? 'not cooking' : 'open night') + '" title="' + dayName(d) + '"><small>' + r.dow.charAt(0) + '</small><b>' + r.n + '</b><i class="' + dot + '"></i></button>';
      }).join('') + '</div></div>';
    }).join('');
    return '<div class="ribd" id="ribd" role="tablist" aria-label="Days: last week, this week, next week"><span class="rmk" id="rmk" aria-hidden="true"></span>' + groups + '</div>';
  }
  /* Copy last week (99) and Clear week (109, owner-stated, 12 Oct 2026): side by side, one pattern. Each flips IN PLACE into Undo after use and says what it reverses.
     Undo is a short stack, each step lives 14 s: the latest action's button shows Undo; undo it and the earlier one shows Undo again (recommended; one level versus a stack is an open question). */
  var UW = 14000, ULAB = { copy: 'copy', clear: 'clear', edit: 'change' };
  function pruneU() { var t = Date.now(); S.ustk = S.ustk.filter(function (u) { return t - u.at < UW; }); }
  function topU() { pruneU(); return S.ustk[S.ustk.length - 1] || null; }
  function pushU(k, before, msg) { S.ustk.push({ k: k, s: before, at: Date.now(), msg: msg }); setTimeout(function () { pruneU(); render(); }, UW + 50); }
  function whyOff() { return ro() ? viewLabel(S.view) + "'s plan is read only" : wk() < 0 ? 'Last week is read only' : ''; }
  function flipBtn(u) { var l = ULAB[u.k]; return '<button class="pbtn flip" data-undo title="Undo ' + l + ' (Z)" aria-label="Undo ' + l + (S.ustk.length > 1 ? '. One more step is available after this' : '') + '">' + ic.undo + ' <b>Undo ' + l + '</b> <span class="kbd">Z</span></button>'; }
  function copyBtn() {
    var u = topU(); if (u && u.k === 'copy') return flipBtn(u);
    var why = whyOff(), tip = why || 'Copy last week into this one. Fills open nights only, never overwrites. Acts on ' + (S.view === 'mine' ? 'my plan' : 'the household plan') + '.';
    return '<button class="pbtn" data-copy ' + (why ? 'disabled ' : '') + 'title="' + tip + '" aria-label="' + tip + '">' + ic.copy + ' <b>Copy last week</b></button>';
  }
  function clearBtn() {
    var u = topU(); if (u && u.k === 'clear') return flipBtn(u);
    var why = whyOff(), r = P.clearWeek(S.meals, S.blocked, S.view, wk(), S.today, S.cl), dis = !!why || r.why === 'none';
    var tip = why || (r.why === 'none' ? 'Nothing to clear from today on.' : 'Clear week: removes ' + r.rm.length + (r.rm.length === 1 ? ' meal' : ' meals') + ' from today on in ' + (S.view === 'mine' ? 'my plan' : 'the household plan') + (S.cl === 'all' && r.nc.length ? ' and ' + r.nc.length + ' Not cooking mark(s)' : '. Not cooking days stay') + (r.shared ? ' (includes ' + r.shared + ' household meals)' : '') + '. Undo is one click.');
    return '<button class="pbtn" data-clearw ' + (dis ? 'disabled ' : '') + 'title="' + tip + '" aria-label="' + tip + '">' + ic.clear + ' <b>Clear week</b></button>';
  }
  function header() {
    var mn = P.dinfo(P.dinfo(S.cur).mon).n, w = wk();
    return '<div class="top"><div class="wkbar"><div class="wt"><h1>Week of ' + mn + ' Oct</h1><span class="sub">' + P.REL[w] + (w < 0 ? ' · read only' : '') + '</span></div>' + (S.cur !== S.today ? '<button class="tdy" data-today title="Jump to today (T)">Today <span class="kbd">T</span></button>' : '') +
      '<span class="sp"></span><span class="sync" title="Plan is live"><i></i>Live</span>' + (S.f === 'menu' ? filter() : '') + '<span class="wkacts">' + copyBtn() + clearBtn() + '</span><button class="ib" aria-label="Plan settings (the gear)" title="Plan settings (the gear)">' + ic.cog + '</button></div>' + (S.f !== 'menu' ? '<div class="tools">' + filter() + '</div>' : '') + ribbon() + (ro() ? '<div class="rol">' + ic.people + ' ' + viewLabel(S.view) + "'s plan: view only. You can look, not change it.</div>" : '') +
      '<div class="cslot' + (S.cuShown ? ' in' : '') + '">' + (S.cuShown ? '<button class="curtain' + (S.cuNew ? ' drop' : '') + '" data-curtain>' + ic.spark + ' Ask AI to plan this</button>' : '') + '</div></div>';
  }
  function rail() {
    var n = function (l, d, on, b) { return '<button class="nv' + (on ? ' on' : '') + '" tabindex="-1">' + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>' + l + (b ? '<em class="n">' + b + '</em>' : '') + '</button>'; };
    return '<nav class="rail" aria-label="Kitchie"><div class="brand">Our<br>kitchen</div>' + n('Home', '<path d="M4 11l8-7 8 7v9H4z"/>') + n('Pantry', '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 9h12"/>') + n('Plan', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', 1) + n('Recipes', '<path d="M6 14a4 4 0 1 1 2-7 4 4 0 0 1 8 0 4 4 0 1 1 2 7v5H6z"/>', 0, 2) + n('Shopping', '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12h11l2-8H6"/>', 0, 3) +
      '<div class="me"><button class="nv" data-help tabindex="-1"><span class="qk">?</span>Keys</button><button class="av" tabindex="-1">S</button></div></nav>';
  }

  /* ---------- inspector ---------- */
  function ingRows(list, miss, m) {
    return list.map(function (r) {
      var ub = m.useby.filter(function (u) { return u[0] === r[0]; })[0];
      return '<li><span class="in">' + esc(r[0]) + '</span><span class="qy">' + esc(r[1]) + '</span>' + (miss && !(ro() || isPast(m.day)) ? '<button class="ib sm" data-addone="' + esc(r[0]) + '" title="Add ' + esc(r[0]) + ' to the shopping list" aria-label="Add ' + esc(r[0]) + ' to the shopping list">' + ic.cart + '</button>' : (ub ? '<span class="tg ub small" title="Use-by">' + ic.clock + '<b>by ' + esc(ub[1]) + '</b></span>' : '')) + '</li>';
    }).join('');
  }
  function pcount(m, lk) {
    if (S.pc === 'drop') { var o = ''; for (var i = 1; i <= 8; i++) o += '<option value="' + i + '"' + (m.n === i ? ' selected' : '') + '>' + i + (i === 1 ? ' person' : ' people') + '</option>'; return '<div class="ppl"><span class="lbl">People</span><select class="pcs" data-pcsel aria-label="Number of people"' + (lk ? ' disabled' : '') + '>' + o + '</select></div>'; }
    return '<div class="ppl"><span class="lbl">People</span><button class="ib sm" data-n="-1" aria-label="Fewer people"' + (lk ? ' disabled' : '') + '>−</button><b>' + m.n + '</b><button class="ib sm" data-n="1" aria-label="More people"' + (lk ? ' disabled' : '') + '>+</button></div>';
  }
  function inspMeal(m) {
    var src = m.src === 'made' ? '<p class="srcl">' + ic.spark + ' <b>Made up by your AI</b> · not saved as a recipe</p>' : m.src === 'surprise' ? '<p class="srcl">' + ic.dice + ' <b>Surprise me</b> · ' + esc(m.why || '') + '</p>' : '';
    var lk = ro() || isPast(m.day);
    var held = m.held ? '<button class="hold on" data-hold aria-pressed="true">' + ic.mark + ' Held <span class="kbd">H</span></button>' : '<button class="hold" data-hold aria-pressed="false">' + ic.mark + ' Hold <span class="kbd">H</span></button>';
    return '<header class="ih"><span class="em lg">' + m.em + '</span><div class="tx"><h2 id="ititle">' + esc(m.t) + '</h2><p>' + dayName(m.day) + ' · ' + esc(P.whoLabel(m)) + '</p></div><button class="ib" data-close aria-label="Close (Ctrl+Enter)" title="Close  Ctrl/Cmd Enter">' + ic.x + '</button></header>' +
      '<div class="ibody">' + src + (P.mins(m) ? '<p class="nt tt">' + ic.clock + ' Total time <b>' + P.mins(m) + '</b></p>' : '') + (m.note ? '<p class="nt">' + esc(m.note) + '</p>' : '') +
      (lk ? '<p class="nt ronote">' + ic.cal + (ro() ? ' ' + viewLabel(S.view) + "'s plan is view only." : ' Past: read only.') + '</p>' : '') + pcount(m, lk) +
      '<section class="isec"><div class="ish"><h3>On hand</h3>' + (m.have.length && !lk ? held : '') + '</div><ul class="ing">' + ingRows(m.have, 0, m) + '</ul></section>' +
      (m.miss.length ? '<section class="isec"><div class="ish"><h3>Missing</h3>' + (lk ? '' : '<button class="addall" data-addall>' + ic.cart + ' Add all ' + m.miss.length + ' <span class="kbd">L</span></button>') + '</div>' + (lk ? '' : '<p class="hint">Ask AI about substitutes</p>') + '<ul class="ing miss">' + ingRows(m.miss, 1, m) + '</ul></section>' : '<p class="allgood">' + ic.check + ' Everything for this meal is on hand.</p>') +
      '</div>' + (lk ? '' : '<footer class="ifoot"><button class="b2" data-replan>Replan <span class="kbd">X</span></button><button class="b2" data-nocook>' + ic.moon + ' Not cooking <span class="kbd">⇧X</span></button></footer>');
  }
  function inspIdle() {
    var ms = vis().filter(function (m) { return P.dinfo(m.day).wk === wk(); }).slice().sort(function (a, b) { return dayIdx(a.day) - dayIdx(b.day); }), buy = {};
    ms.forEach(function (m) { m.miss.forEach(function (x) { (buy[m.day] = buy[m.day] || []).push(x[0]); }); });
    var buyH = Object.keys(buy).map(function (d) { return '<li><b>' + P.dinfo(d).dow + '</b><span>' + esc(buy[d].join(', ')) + '</span></li>'; }).join('');
    var ubH = ms.filter(function (m) { return m.useby.length; }).map(function (m) { return '<li><b>' + esc(m.useby[0][0]) + '</b><span>by ' + esc(m.useby[0][1]) + ' · ' + P.dinfo(m.day).dow + ' ' + esc(m.t) + '</span></li>'; }).join('');
    var ord = ms.map(function (m) { return '<li><b>' + P.dinfo(m.day).dow + '</b><span>' + m.em + ' ' + esc(m.t) + (m.makes ? ' <small>(cook double)</small>' : '') + '</span></li>'; }).join('');
    return '<header class="ih"><div class="tx"><h2>This week</h2><p>Pick a meal to see it here</p></div></header><div class="ibody"><section class="isec"><div class="ish"><h3>Buy by day</h3><button class="addall" data-addall-week>' + ic.cart + ' Add all</button></div><ul class="ing sumlist">' + (buyH || '<li><span>Nothing to buy</span></li>') + '</ul></section>' +
      '<section class="isec"><div class="ish"><h3>Use first</h3></div><ul class="ing sumlist">' + (ubH || '<li><span>Nothing close to use-by</span></li>') + '</ul></section>' +
      '<section class="isec"><div class="ish"><h3>Cook order</h3></div><ul class="ing sumlist">' + ord + '</ul></section></div>';
  }
  function insp() {
    var m = S.sel && find(S.sel);
    return '<aside class="insp" aria-label="' + (m ? 'Meal detail' : 'Week summary') + '">' + (m ? inspMeal(m) : inspIdle()) + '</aside>';
  }

  /* ---------- popovers, menus, toast ---------- */
  function popHtml() {
    if (!S.pop) return '';
    var st = 'left:' + S.pop.x + 'px;top:' + S.pop.y + 'px';
    if (S.pop.k === 'menu') {
      var m = find(S.pop.id);
      if (ro() || isPast(m.day)) return '<div class="pop menu" role="menu" style="' + st + '"><button role="menuitem" data-act="open" data-id="' + m.id + '">Open detail <span class="kbd">E</span></button><p class="mnote">' + (ro() ? 'View only' : 'Past: read only') + '</p></div>';
      return '<div class="pop menu" role="menu" style="' + st + '"><button role="menuitem" data-act="open" data-id="' + m.id + '">Open detail <span class="kbd">E</span></button><button role="menuitem" data-act="replan" data-id="' + m.id + '">Replan <span class="kbd">X</span></button><button role="menuitem" data-act="nocook" data-id="' + m.id + '">Not cooking <span class="kbd">⇧X</span></button><button role="menuitem" data-act="hold" data-id="' + m.id + '">' + (m.held ? 'Release hold' : 'Hold') + ' <span class="kbd">H</span></button>' + (m.miss.length ? '<button role="menuitem" data-act="list" data-id="' + m.id + '">Add missing to list <span class="kbd">L</span></button>' : '') + '</div>';
    }
    var cnt = function (v) { return S.meals.filter(function (x) { return P.match(x, v); }).length; };
    var all = S.pop.k === 'all', ppl = P.people.filter(function (p) { return all || !p.me; });
    var f = (S.pop.filter || '').toLowerCase();
    return '<div class="pop plist" role="listbox" style="' + st + '">' + (ppl.length > 5 ? '<input class="psearch" id="psearch" placeholder="Find a person" value="' + esc(S.pop.filter || '') + '" aria-label="Find a person">' : '') +
      (all ? '<button class="fo' + (S.view === 'mine' ? ' on' : '') + '" data-view="mine">' + (S.view === 'mine' ? ic.check : '') + '<span>Mine</span><i>' + cnt('mine') + '</i></button><button class="fo' + (S.view === 'everyone' ? ' on' : '') + '" data-view="everyone">' + (S.view === 'everyone' ? ic.check : '') + '<span>Everyone</span><i>' + cnt('everyone') + '</i></button><hr>' : '') +
      ppl.filter(function (p) { return !all || !p.me; }).concat(all ? [] : []).filter(function (p) { return p.n.toLowerCase().indexOf(f) > -1; }).map(function (p) { return '<button class="fo pp' + (S.view === p.id ? ' on' : '') + '" data-view="' + p.id + '">' + avatar(p) + '<span>' + p.n + '</span><i>' + cnt(p.id) + '</i></button>'; }).join('') + '</div>';
  }
  function helpHtml() {
    if (!S.help) return '';
    var r = [['↑ ↓ ← →', 'Move between meals'], ['E or Enter', 'Open the meal in the inspector'], ['Ctrl/Cmd Enter', 'Close the inspector'], ['Esc', 'Close a menu or popover; closes a flyout inspector'], ['X', 'Replan (remove, night stays open)'], ['Shift X', 'Remove and mark Not cooking'], ['H', 'Hold or release'], ['L', 'Add missing to the shopping list'], ['Z', 'Undo'], ['A', 'Ask AI, scoped to the day in view'], ['T', 'Jump to today'], ['M', 'Focus the main column'], ['Space', 'Lift a meal, arrows carry, Space drops (move)']];
    return '<div class="scrim" data-closehelp></div><div class="help" role="dialog" aria-label="Keyboard shortcuts"><header><h2>Keyboard</h2><button class="ib" data-closehelp aria-label="Close">' + ic.x + '</button></header><dl>' + r.map(function (x) { return '<dt><span class="kbd">' + x[0] + '</span></dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl><p>Everything a swipe does on a phone has a key or a menu here.</p></div>';
  }
  var toastT;
  function toast(msg, undo) {
    var t = document.getElementById('toast'); if (!t) return;
    t.innerHTML = '<span>' + msg + '</span>' + (undo ? '<button data-undo>' + ic.undo + ' Undo <span class="kbd">Z</span></button>' : ''); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 6000);
  }

  /* ---------- render ---------- */
  function optionsPanel() {
    var g = function (k, lab, vals) { return '<fieldset><legend>' + lab + '</legend>' + vals.map(function (v) { return '<label><input type="radio" name="' + k + '" value="' + v[0] + '"' + (S[k] === v[0] ? ' checked' : '') + '> ' + v[1] + '</label>'; }).join('') + '</fieldset>'; };
    return '<button class="optfab" data-opts aria-expanded="' + S.opts + '">Mockup options</button>' + (S.opts ? '<div class="optpanel" role="dialog" aria-label="Mockup options"><p class="onote">Mockup-only switch. It is not part of the app.</p>' +
      g('lay', 'Layout (decision 63 to 64, owner has not picked)', [['board', '1 Week board (recommended)'], ['agenda', '2 Agenda rows'], ['focus', '3 Day focus']]) + g('insp', 'Inspector', [['dock', 'Docked (recommended)'], ['flyout', 'Flyout']]) +
      g('f', 'Who filter (97)', [['menu', 'One dropdown (recommended)'], ['seg', 'Mine / Everyone + People dropdown'], ['chips', 'Chips + overflow (earlier)']]) + g('pc', 'Number of people in the detail (98)', [['step', 'Stepper − 4 +'], ['drop', 'Dropdown']]) +
      g('e', 'Open night', [['ghost', 'Quiet, Add by hand on hover (recommended)'], ['slim', 'Slim row']]) + g('nc', 'Not cooking (93, proposal for desktop)', [['slim', 'Slim line (recommended)'], ['block', 'Block with accent bar (earlier)']]) +
      g('cl', 'Clear week also clears (109, open)', [['meals', 'Meals only, Not cooking stays (recommended)'], ['all', 'Meals and this-week Not cooking marks']]) + g('c', 'Status (104)', [['labels', 'a Labelled chips (recommended)'], ['badge', 'b Icon + count badge'], ['edge', 'c Edge strip + dot'], ['progress', 'd Progress, "5 of 7 ready"'], ['line', 'One status line (earlier)']]) + g('cu', 'Ask AI to plan this curtain (96)', [['start', 'At the start of an empty week (default)'], ['idle', 'Idle, whole week empty'], ['off', 'Off']]) +
      '<p class="onote">Also in the URL: <code>?lay=&amp;insp=&amp;f=&amp;pc=&amp;e=&amp;nc=&amp;c=&amp;cu=&amp;sel=wed-curry&amp;day=d19&amp;who=mine</code></p></div>' : '');
  }
  /* Ask AI to plan this: the curtain (decision 96, prototype, not locked). Same drop as the phone and the idle nudge of decisions 15, 19, 20. */
  var cuT;
  function cuDays() { return weekDays().filter(function (r) { return !isPast(r.id); }); }
  function cuWeekEmpty() { var d = cuDays(); return d.length && d.every(function (r) { return !vis().some(function (m) { return m.day === r.id; }); }); }
  function cuStartEmpty() { var d = cuDays().slice(0, 3); return d.length && d.every(function (r) { return !vis().some(function (m) { return m.day === r.id; }); }); }
  function cuEval() {
    clearTimeout(cuT); var w = wk(), was = S.cuShown;
    if (S.cu === 'off' || S.sel || S.cuDone[w]) { S.cuShown = false; S.cuNew = false; return; }
    if (S.cu === 'start') { S.cuShown = !!cuStartEmpty(); S.cuNew = S.cuShown && !was; return; }
    if (S.cuShown && !cuWeekEmpty()) S.cuShown = false; S.cuNew = false;
    if (!S.cuShown && cuWeekEmpty()) cuT = setTimeout(function () { if (cuWeekEmpty() && !S.cuDone[wk()] && !S.sel) { S.cuShown = true; S.cuNew = true; render(); S.cuNew = false; } }, 5000);
  }
  function cuDismiss() { if (S.cuShown) { S.cuDone[wk()] = true; S.cuShown = false; S.cuNew = false; return true; } clearTimeout(cuT); if (S.cu === 'idle') cuEval(); return false; }
  function render() {
    var keepScroll = window.scrollY, mainEl = document.querySelector('.main'), ae = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id : null;
    var hasSel = !!S.sel;
    cuEval();
    root.innerHTML = '<div class="app lay-' + S.lay + ' insp-' + S.insp + (hasSel ? ' has-sel' : ' idle') + '" data-c="' + S.c + '">' + rail() + '<main class="main" id="main">' + header() + summary() + '<div class="plan" id="plan">' + plan() + '</div></main>' + insp() + (S.insp === 'flyout' && hasSel ? '<div class="fscrim" data-close></div>' : '') + '</div><div class="toast" id="toast" role="status" hidden></div><div id="popwrap">' + popHtml() + '</div>' + helpHtml() + optionsPanel();
    window.scrollTo(0, keepScroll);
    if (ae) { var el = root.querySelector('.mc[data-id="' + ae + '"]'); if (el) el.focus({ preventScroll: true }); }
    fit(); placeRmk(); if (S.cuNew) S.cuNew = false;
  }
  var lastRmk = null;
  function placeRmk() {
    var r = document.getElementById('ribd'), mk = document.getElementById('rmk'), c = r && r.querySelector('.rdy.on'); if (!c || !mk) return;
    var a = r.getBoundingClientRect(), b = c.getBoundingClientRect(), x = b.left - a.left, y = b.top - a.top; mk.style.width = b.width + 'px'; mk.style.height = b.height + 'px';
    if (lastRmk) { mk.style.transition = 'none'; mk.style.transform = 'translate(' + lastRmk.x + 'px,' + lastRmk.y + 'px)'; void mk.offsetWidth; mk.style.transition = ''; } else mk.style.transition = 'none';
    mk.style.transform = 'translate(' + x + 'px,' + y + 'px)'; lastRmk = { x: x, y: y };
  }
  function fit() {
    var box = document.getElementById('fppl'), more = document.getElementById('fmore'); if (!box || !more) return;
    var kids = [].slice.call(box.children), hidden = 0; kids.forEach(function (k) { k.hidden = false; });
    more.hidden = false; more.innerHTML = '+' + kids.length + ic.down;
    var room = box.parentNode.clientWidth - box.parentNode.querySelector('.fseg').offsetWidth - 60 - more.offsetWidth - 24;
    box.style.maxWidth = Math.max(room, 0) + 'px'; var used = 0;
    kids.forEach(function (k) { var w = k.offsetWidth + 6; if (used + w > room) { k.hidden = true; hidden++; } else used += w; });
    if (!hidden) more.hidden = true; else more.innerHTML = '+' + hidden + ' more' + ic.down;
    var sel = kids.filter(function (k) { return k.classList.contains('on') && k.hidden; })[0]; if (sel) { more.classList.add('on'); }
  }
  window.addEventListener('resize', function () { fit(); lastRmk = null; placeRmk(); });

  /* ---------- actions ---------- */
  function snap() { return JSON.stringify({ m: S.meals, b: S.blocked, sel: S.sel }); }
  function doUndo() { var u = topU(); if (!u) return; S.ustk.pop(); var o = JSON.parse(u.s); S.meals = o.m; S.blocked = o.b; S.sel = o.sel; S.pulse = null; render(); var nx = topU(); toast('Undid ' + ULAB[u.k] + (nx ? '. Next undo: ' + ULAB[nx.k] : '')); }
  function pulseOff() { setTimeout(function () { S.pulse = null; document.querySelectorAll('.pulse').forEach(function (e) { e.classList.remove('pulse'); }); }, 2600); }
  function change(fn, msg, days, kind) { var before = snap(); fn(); pushU(kind || 'edit', before, msg); S.pulse = days || null; render(); toast(msg, kind !== 'copy' && kind !== 'clear'); if (days) pulseOff(); }
  function act(a, id) {
    var m = find(id); if (!m) return;
    if (a === 'open') { S.sel = id; S.cur = m.day; S.pop = null; render(); return; }
    if (ro() || isPast(m.day)) return toast(ro() ? viewLabel(S.view) + "'s plan is view only." : 'Past nights are read only.');
    if (a === 'hold') { m.held = m.held ? 0 : 1; S.pop = null; render(); toast(m.held ? 'Holding ' + esc(m.t) + ' ingredients for ' + P.dinfo(m.day).dow : 'Hold released'); return; }
    if (a === 'list') { var n = m.miss.length; return change(function () { m.list += n; S.pop = null; }, 'Added ' + n + ' to the shopping list'); }
    change(function () { S.meals = S.meals.filter(function (x) { return x.id !== id; }); if (S.sel === id) S.sel = null; S.pop = null; if (a === 'nocook') S.blocked[m.day] = 'once'; }, a === 'nocook' ? esc(m.t) + ' removed, ' + P.dinfo(m.day).dow + ' is Not cooking' : esc(m.t) + ' removed, ' + P.dinfo(m.day).dow + ' is open to replan', [m.day]);
  }
  function copyLast() {
    var r = P.copyLast(S.meals, S.blocked, S.view, wk(), S.today); if (r.why === 'readonly' || r.why === 'bounds') return;
    if (!r.add.length) return toast('Nothing to fill: every open night already has a plan, or is Not cooking.');
    change(function () { S.meals = S.meals.concat(r.add); }, 'Copied ' + r.days.length + (r.days.length === 1 ? ' night' : ' nights') + ' from ' + (wk() - 1 === 0 ? 'this week' : 'last week') + ' (' + (S.view === 'mine' ? 'my plan' : 'household plan') + '). Open nights only', r.days, 'copy');
  }
  /* Clear week (109): same scope as Copy last week; meals only by default; no confirm because Undo is one click, but never silent. */
  function clearWeek() {
    var r = P.clearWeek(S.meals, S.blocked, S.view, wk(), S.today, S.cl); if (r.why === 'readonly' || r.why === 'bounds') return;
    if (r.why === 'none') return toast('Nothing to clear from today on.');
    var nm = r.rm.length, nc = r.nc.length, a = P.dinfo(r.days[0]), z = P.dinfo(r.days[r.days.length - 1]);
    change(function () { S.meals = S.meals.filter(function (x) { return r.rm.indexOf(x.id) < 0; }); r.nc.forEach(function (d) { delete S.blocked[d]; }); if (S.sel && r.rm.indexOf(S.sel) > -1) S.sel = null; },
      'Cleared ' + nm + (nm === 1 ? ' meal' : ' meals') + (nc ? ' and ' + nc + ' Not cooking mark' + (nc > 1 ? 's' : '') : '') + ', ' + a.dow + ' ' + a.n + (r.days.length > 1 ? ' to ' + z.dow + ' ' + z.n : '') + ' (' + (S.view === 'mine' ? 'my plan' : 'household plan') + '). ' + (nc ? '' : 'Not cooking days stay.'), r.days, 'clear');
  }
  function surprise(d) {
    var c = P.surprise(S.meals, d, S.today); if (!c) return toast('Nothing fits from what is in. Try Ask AI.');
    c.id = 'sur-' + Date.now(); c.day = d; c.who = S.view === 'mine' ? ['sam'] : 'all'; c.n = S.view === 'mine' ? 1 : 4; c.src = 'surprise'; c.note = ''; c.held = 0; c.useby = c.useby || [];
    change(function () { S.meals.push(c); }, 'Surprise: ' + esc(c.t) + ' for ' + dayName(d), [d]);
  }
  function goDay(d) { S.cur = d; if (S.sel && find(S.sel) && find(S.sel).day !== d) S.sel = null; render(); var el = document.getElementById('day-' + d); if (el && S.lay === 'agenda') el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  function focusedId() { var a = document.activeElement; return a && a.classList.contains('mc') ? a.dataset.id : S.sel; }
  function closeInsp() { var id = S.sel; S.sel = null; render(); if (id) { var el = root.querySelector('.mc[data-id="' + id + '"]'); if (el) el.focus(); } }
  function openMenu(id, x, y) { S.pop = { k: 'menu', id: id, x: Math.min(x, innerWidth - 250), y: Math.min(y, innerHeight - 230) }; render(); var f = document.querySelector('.pop button'); if (f) f.focus(); }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button,article,[data-closehelp]'); var pw = e.target.closest('.pop');
    if (S.cuShown && !(t && t.dataset.curtain !== undefined) && cuDismiss()) { render(); }
    if (S.pop && !pw && !(t && t.dataset.pop)) { S.pop = null; render(); if (!t) return; }
    if (!t) return;
    var d = t.dataset;
    if (d.opts !== undefined) { S.opts = !S.opts; return render(); }
    if (d.more) { var r = t.getBoundingClientRect(); return openMenu(d.more, r.right - 230, r.bottom + 4); }
    if (d.act) return act(d.act, d.id);
    if (d.view) { S.view = d.view; S.pop = null; if (S.sel && !find(S.sel)) S.sel = null; if (S.sel && !P.match(find(S.sel), S.view)) S.sel = null; return render(); }
    if (d.pop) { var b = t.getBoundingClientRect(); S.pop = { k: d.pop, x: Math.max(8, Math.min(b.left, innerWidth - 270)), y: b.bottom + 6 }; render(); var s = document.getElementById('psearch'); if (s) s.focus(); return; }
    if (d.hl) { S.hl = S.hl === d.hl ? null : d.hl; return render(); }
    if (d.day) return goDay(d.day);
    if (d.today !== undefined) return goDay(S.today);
    if (d.copy !== undefined) return copyLast();
    if (d.clearw !== undefined) return clearWeek();
    if (d.ask) return toast('Ask AI opens your default AI app, scoped to ' + dayName(d.ask) + '. Nothing happens inside Kitchie.');
    if (d.surprise) return surprise(d.surprise);
    if (d.curtain !== undefined) { cuDismiss(); render(); return toast('Ask AI opens your default AI app with the week of ' + P.dinfo(P.dinfo(S.cur).mon).n + ' Oct. Nothing happens inside Kitchie.'); }
    if (d.tab) { return goDay(d.tab); }
    if (d.close !== undefined) return closeInsp();
    if (d.hold !== undefined) return act('hold', S.sel);
    if (d.replan !== undefined) return act('replan', S.sel);
    if (d.nocook !== undefined) return act('nocook', S.sel);
    if (d.addall !== undefined) return act('list', S.sel);
    if (d.addone) { var m = find(S.sel); return change(function () { m.miss = m.miss.filter(function (x) { return x[0] !== d.addone; }); m.list++; }, esc(d.addone) + ' added to the shopping list'); }
    if (d.addallWeek !== undefined) return change(function () { S.meals.filter(function (m) { return P.dinfo(m.day).wk === wk() && !isPast(m.day); }).forEach(function (m) { m.list += m.miss.length; m.miss = []; }); }, 'Added everything missing to the shopping list');
    if (d.n) { var mm = find(S.sel); mm.n = Math.max(1, mm.n + (+d.n)); return render(); }
    if (d.block) return change(function () { S.blocked[d.block] = 'once'; }, P.dinfo(d.block).dow + ' is Not cooking (this week only)', [d.block]);
    if (d.unblock) return change(function () { delete S.blocked[d.unblock]; }, P.dinfo(d.unblock).dow + ' is open again', [d.unblock]);
    if (d.hand !== undefined) return toast('Opens the Plan it panel (hand-add path, fragments/plan-hard-avoid).');
    if (d.undo !== undefined) return doUndo();
    if (d.help !== undefined) { S.help = true; return render(); }
    if (d.closehelp !== undefined) { S.help = false; return render(); }
    if (t.classList.contains('mc') && !e.target.closest('.more')) { S.sel = t.dataset.id; S.pop = null; render(); }
  });
  document.addEventListener('change', function (e) { var n = e.target.name; if (e.target.dataset && e.target.dataset.pcsel !== undefined) { find(S.sel).n = +e.target.value; return render(); } if (n && S[n] !== undefined) { S[n] = e.target.value; if (n === 'lay') S.hl = null; if (n === 'cu') { S.cuDone = {}; S.cuShown = false; } render(); S.opts = true; render(); } });
  document.addEventListener('input', function (e) { if (e.target.id === 'psearch' && S.pop) { S.pop.filter = e.target.value; var pos = e.target.selectionStart; document.getElementById('popwrap').innerHTML = popHtml(); var s = document.getElementById('psearch'); s.focus(); s.setSelectionRange(pos, pos); } });
  document.addEventListener('contextmenu', function (e) { var c = e.target.closest('.mc'); if (c) { e.preventDefault(); openMenu(c.dataset.id, e.clientX, e.clientY); } });
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input') { if (e.key === 'Escape') { S.pop = null; render(); } return; }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { if (S.sel) { e.preventDefault(); closeInsp(); } return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === 'Escape') { if (S.pop) { S.pop = null; render(); } else if (S.help) { S.help = false; render(); } else if (S.opts) { S.opts = false; render(); } else if (S.sel && S.insp === 'flyout') closeInsp(); return; }
    if (S.pop) return;
    if (k === '?') { S.help = !S.help; return render(); }
    var id = focusedId();
    if (k.toLowerCase() === 'x' && id) { e.preventDefault(); return act(e.shiftKey ? 'nocook' : 'replan', id); }
    if (k.toLowerCase() === 'h' && id) return act('hold', id);
    if (k.toLowerCase() === 'l' && id) return act('list', id);
    if ((k === 'e' || k === 'E' || (k === 'Enter' && document.activeElement.classList.contains('mc'))) && id) { e.preventDefault(); return act('open', id); }
    if (k.toLowerCase() === 'z') return doUndo();
    if (k.toLowerCase() === 'a') return toast('Ask AI opens your default AI app, scoped to ' + dayName(S.cur) + '.');
    if (k.toLowerCase() === 't') return goDay(S.today);
    if (k.toLowerCase() === 'm') { var f = root.querySelector('.mc'); if (f) f.focus(); return; }
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(k) > -1 && document.activeElement.classList.contains('mc')) {
      e.preventDefault(); var all = [].slice.call(root.querySelectorAll('.mc')), i = all.indexOf(document.activeElement), nx = all[i + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : -1)]; if (nx) nx.focus(); }
  });
  render();
})();
