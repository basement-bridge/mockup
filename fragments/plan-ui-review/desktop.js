/* Plan UI review, desktop. Behaviour only; no viewport rules (those are in d-1024.css, d-1280.css, d-1440.css, d-1920.css).
   Every action here is one the chat tools already have (plan_remove_meal, plan_block_day, plan_reserve, plan_add_missing_to_list, plan_update_meal): the UI calls the same service methods. */
(function () {
  var P = window.PUR, ic = P.icons, q = new URLSearchParams(location.search);
  function pick(k, ok, d) { var v = q.get(k); return ok.indexOf(v) > -1 ? v : d; }
  var S = {
    lay: pick('lay', ['board', 'agenda', 'focus'], 'board'), insp: pick('insp', ['dock', 'flyout'], 'dock'),
    f: pick('f', ['chips', 'menu', 'seg'], 'chips'), e: pick('e', ['ghost', 'slim'], 'ghost'), c: pick('c', ['labels', 'icons', 'line'], 'labels'),
    today: pick('today', ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], 'tue'), sel: q.get('sel'), day: q.get('day') || 'wed', view: q.get('who') || 'mine', hl: null, pop: null, help: q.get('help') === '1',
    meals: JSON.parse(JSON.stringify(P.meals)), blocked: JSON.parse(JSON.stringify(P.blocked)), undo: null, opts: false
  };
  if (!S.meals.some(function (m) { return m.id === S.sel; })) S.sel = null;
  var root = document.getElementById('root'), DI = P.DAYS.map(function (d) { return d[0]; });
  function dayIdx(d) { return DI.indexOf(d); }
  function isPast(d) { return dayIdx(d) < dayIdx(S.today); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function find(id) { return S.meals.filter(function (m) { return m.id === id; })[0]; }
  function vis() { return S.meals.filter(function (m) { return P.match(m, S.view); }); }
  function dayName(d) { var x = P.DAYS[dayIdx(d)]; return x[1] + ' ' + x[2] + ' Oct'; }
  function viewLabel(v) { return v === 'mine' ? 'Mine' : v === 'everyone' ? 'Everyone' : P.people.filter(function (p) { return p.id === v; })[0].n; }
  function stats() {
    var ms = vis(), miss = 0, missMeals = 0, ub = [], onList = 0, left = 0, cooking = {};
    ms.forEach(function (m) { cooking[m.day] = 1; if (m.miss.length) { miss += m.miss.length; missMeals++; } m.useby.forEach(function (u) { ub.push(u); }); onList += m.list; if (m.left) left++; });
    return { miss: miss, missMeals: missMeals, ub: ub, onList: onList, left: left, nights: Object.keys(cooking).length, cooking: cooking };
  }

  /* ---------- pieces ---------- */
  function chips(m) {
    var out = '', mc = m.miss.length;
    var ubt = m.useby.length ? m.useby[0][1] : '';
    if (S.c === 'line') {
      var parts = [];
      if (mc) parts.push('<span class="st bad">' + ic.warn + ' Missing ' + esc(m.miss.map(function (x) { return x[0]; }).join(', ')) + '</span>');
      else parts.push('<span class="st ok">' + ic.check + ' All on hand</span>');
      var s2 = [];
      if (m.list) s2.push(m.list + ' on list'); if (m.held) s2.push('held'); if (m.useby.length) s2.push('use ' + esc(m.useby[0][0]) + ' by ' + esc(ubt));
      if (s2.length) parts.push('<span class="st sub">' + s2.join(' · ') + '</span>');
      return '<div class="stl">' + parts.join('') + '</div>';
    }
    var lab = S.c === 'labels';
    function chip(cls, icon, short, long, tip) { return '<span class="tg ' + cls + '" title="' + tip + '" aria-label="' + tip + '">' + icon + (lab ? '<b>' + long + '</b>' : '<b>' + short + '</b>') + '</span>'; }
    if (mc) out += chip('bad', ic.warn, mc, 'Missing ' + mc, mc + ' missing ingredient' + (mc > 1 ? 's' : ''));
    else out += chip('ok', ic.check, '', 'All on hand', 'Everything is on hand');
    if (m.list) out += chip('list', ic.cart, m.list, 'On list ' + m.list, m.list + ' on the shopping list');
    if (m.held) out += chip('held', ic.mark, '', 'Held', 'Ingredients held for this meal');
    if (m.useby.length) out += chip('ub', ic.clock, '', 'Use by ' + esc(ubt), esc(m.useby[0][0]) + ' use-by ' + esc(ubt));
    var names = mc ? '<div class="names">Missing: ' + esc(m.miss.map(function (x) { return x[0]; }).join(', ')) + '</div>' : '';
    return '<div class="chs">' + out + '</div>' + (S.c === 'icons' ? '' : names);
  }
  function card(m) {
    var hl = S.hl === 'missing' ? m.miss.length : S.hl === 'useby' ? m.useby.length : 1;
    return '<article class="mc' + (S.sel === m.id ? ' sel' : '') + (hl ? '' : ' dim') + (isPast(m.day) ? ' past' : '') + '" tabindex="0" data-id="' + m.id + '" aria-label="' + esc(m.t) + ', ' + dayName(m.day) + '">' +
      '<div class="mh"><span class="em">' + m.em + '</span><div class="tx"><h3>' + esc(m.t) + '</h3><p>' + esc(P.whoLabel(m)) + '</p>' + (m.left ? '<p class="lf">' + ic.swap + ' Leftovers from ' + m.left + '</p>' : '') + '</div>' +
      '<button class="more" data-more="' + m.id + '" aria-label="Actions for ' + esc(m.t) + '" aria-haspopup="menu" title="Actions (right-click)">' + ic.more + '</button></div>' + chips(m) + '</article>';
  }
  function emptyDay(d) {
    var past = isPast(d);
    if (past) return '<div class="empty past">Nothing was planned</div>';
    if (S.blocked[d]) return '<button class="blk' + (S.blocked[d] === 'usual' ? ' usual' : '') + '" data-unblock="' + d + '" title="Tap to cook this night (this week only)"><b>Not cooking</b><span>' + (S.blocked[d] === 'usual' ? 'Usual day off' : 'This week only') + ' · click to cook</span></button>';
    if (S.e === 'slim') return '<div class="empty slim"><span>Open night</span><button data-assist>' + ic.spark + ' Ask assistant</button><button data-block="' + d + '">' + ic.moon + ' Not cooking</button></div>';
    return '<div class="empty ghost"><span class="ph">Open night</span><div class="eacts"><button data-assist>' + ic.spark + ' Ask assistant</button><button data-hand title="Opens the Plan it panel">' + ic.plus + ' Add by hand</button><button data-block="' + d + '">' + ic.moon + ' Not cooking</button></div></div>';
  }
  function dayHead(d, extra) {
    var x = P.DAYS[dayIdx(d)], t = d === S.today, n = vis().filter(function (m) { return m.day === d; }).length;
    return '<header class="dh' + (t ? ' today' : '') + '"><b>' + x[1] + '</b><span>' + x[2] + ' Oct</span>' + (t ? '<em>Today</em>' : '') + (extra || '') + '</header>';
  }
  function dayBody(d) {
    var ms = vis().filter(function (m) { return m.day === d; });
    var tip = P.tips[d] && !isPast(d) ? '<p class="tipl">' + ic.leaf + ' ' + esc(P.tips[d]) + '</p>' : '';
    var usual = ms.some(function (m) { return m.usual; }) ? '<p class="tipl">Usual day off, cooking this week</p>' : '';
    if (ms.length) return usual + ms.map(card).join('') + tip;
    return emptyDay(d);
  }
  function plan() {
    if (S.lay === 'board') return '<div class="board">' + P.DAYS.map(function (x) { var d = x[0]; return '<section class="day' + (d === S.today ? ' today' : '') + (isPast(d) ? ' pastday' : '') + '" data-day="' + d + '">' + dayHead(d) + '<div class="dc">' + dayBody(d) + '</div></section>'; }).join('') + '</div>';
    if (S.lay === 'agenda') return '<div class="agenda">' + P.DAYS.map(function (x) { var d = x[0]; return '<section class="day' + (d === S.today ? ' today' : '') + (isPast(d) ? ' pastday' : '') + '" data-day="' + d + '">' + dayHead(d) + '<div class="dc">' + dayBody(d) + '</div></section>'; }).join('') + '</div>';
    var tabs = P.DAYS.map(function (x) {
      var d = x[0], ms = vis().filter(function (m) { return m.day === d; });
      var st = S.blocked[d] ? 'Off' : ms.length + (ms.length === 1 ? ' meal' : ' meals');
      return '<button class="tab' + (S.day === d ? ' on' : '') + (d === S.today ? ' today' : '') + '" data-tab="' + d + '" role="tab" aria-selected="' + (S.day === d) + '"><b>' + x[1] + '</b><span>' + x[2] + '</span><i>' + st + '</i></button>';
    }).join('');
    var d = S.day;
    var dms = vis().filter(function (m) { return m.day === S.day; }), buyN = [], ubN = [];
    dms.forEach(function (m) { m.miss.forEach(function (x) { buyN.push(x[0]); }); m.useby.forEach(function (u) { ubN.push(u[0] + ' by ' + u[1]); }); });
    var prep = dms.length ? '<div class="dayprep"><span><b>Before this night</b></span>' + (buyN.length ? '<span class="m">Buy: ' + esc(buyN.join(', ')) + '</span>' : '<span>Nothing to buy</span>') + (ubN.length ? '<span>Use first: ' + esc(ubN.join(', ')) + '</span>' : '') + '</div>' : '';
    return '<div class="tabs" role="tablist">' + tabs + '</div><section class="day focusday' + (d === S.today ? ' today' : '') + '" data-day="' + d + '"><h2 class="fh">' + dayName(d) + (d === S.today ? ' <em>Today</em>' : '') + '</h2><div class="dc">' + dayBody(d) + prep + '</div></section>';
  }
  function summary() {
    var s = stats(), dots = P.DAYS.map(function (x) {
      var d = x[0], c = s.cooking[d] ? 'on' : S.blocked[d] ? 'off' : 'open';
      return '<i class="rd ' + c + (d === S.today ? ' td' : '') + '" title="' + x[1] + ': ' + (c === 'on' ? 'cooking' : c === 'off' ? 'not cooking' : 'open') + '"></i>';
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
  function header() {
    return '<div class="top"><div class="wkbar"><button class="ib" data-wk="-1" aria-label="Previous week (Page Up)" disabled title="Last week is read-only; not drawn here">' + ic.left + '</button><div class="wt"><h1>Week of 12 Oct</h1><button class="sub" data-wk="0">This week ' + ic.down + '</button></div><button class="ib" data-wk="1" aria-label="Next week (Page Down)">' + ic.right + '</button>' +
      '<span class="sp"></span><span class="sync" title="Plan is live"><i></i>Live</span><button class="ib" aria-label="Copy last week" title="Copy last week">' + ic.copy + '</button><button class="ib" aria-label="Plan settings" title="Plan settings">' + ic.cog + '</button><button class="pbtn" data-assist title="Opens your default AI app">' + ic.spark + ' <b><span class="pre">Open your </span>assistant</b> <span class="kbd">A</span></button></div>' +
      '<div class="tools">' + filter() + '<span class="sp"></span><button class="lnk" data-help>Keyboard <span class="kbd">?</span></button></div></div>';
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
      return '<li><span class="in">' + esc(r[0]) + '</span><span class="qy">' + esc(r[1]) + '</span>' + (miss ? '<button class="ib sm" data-addone="' + esc(r[0]) + '" title="Add ' + esc(r[0]) + ' to the shopping list" aria-label="Add ' + esc(r[0]) + ' to the shopping list">' + ic.cart + '</button>' : (ub ? '<span class="tg ub small" title="Use-by">' + ic.clock + '<b>by ' + esc(ub[1]) + '</b></span>' : '')) + '</li>';
    }).join('');
  }
  function inspMeal(m) {
    var src = m.src === 'made' ? '<p class="srcl">' + ic.spark + ' <b>Made up by your assistant</b> · not saved as a recipe</p>' : '';
    var held = m.held ? '<button class="hold on" data-hold aria-pressed="true">' + ic.mark + ' Held <span class="kbd">H</span></button>' : '<button class="hold" data-hold aria-pressed="false">' + ic.mark + ' Hold <span class="kbd">H</span></button>';
    return '<header class="ih"><span class="em lg">' + m.em + '</span><div class="tx"><h2 id="ititle">' + esc(m.t) + '</h2><p>' + dayName(m.day) + ' · ' + esc(P.whoLabel(m)) + '</p></div><button class="ib" data-close aria-label="Close (Ctrl+Enter)" title="Close  Ctrl/Cmd Enter">' + ic.x + '</button></header>' +
      '<div class="ibody">' + src + (m.note ? '<p class="nt">' + esc(m.note) + '</p>' : '') +
      '<div class="ppl"><span class="lbl">People</span><button class="ib sm" data-n="-1" aria-label="Fewer people">−</button><b>' + m.n + '</b><button class="ib sm" data-n="1" aria-label="More people">+</button></div>' +
      '<section class="isec"><div class="ish"><h3>On hand</h3>' + (m.have.length ? held : '') + '</div><ul class="ing">' + ingRows(m.have, 0, m) + '</ul></section>' +
      (m.miss.length ? '<section class="isec"><div class="ish"><h3>Missing</h3><button class="addall" data-addall>' + ic.cart + ' Add all ' + m.miss.length + ' <span class="kbd">L</span></button></div><p class="hint">Talk to your assistant about substitutes</p><ul class="ing miss">' + ingRows(m.miss, 1, m) + '</ul></section>' : '<p class="allgood">' + ic.check + ' Everything for this meal is on hand.</p>') +
      '</div><footer class="ifoot"><button class="b2" data-replan>Replan <span class="kbd">X</span></button><button class="b2" data-nocook>' + ic.moon + ' Not cooking <span class="kbd">⇧X</span></button></footer>';
  }
  function inspIdle() {
    var ms = vis().slice().sort(function (a, b) { return dayIdx(a.day) - dayIdx(b.day); }), buy = {};
    ms.forEach(function (m) { m.miss.forEach(function (x) { (buy[m.day] = buy[m.day] || []).push(x[0]); }); });
    var buyH = Object.keys(buy).map(function (d) { return '<li><b>' + P.DAYS[dayIdx(d)][1] + '</b><span>' + esc(buy[d].join(', ')) + '</span></li>'; }).join('');
    var ubH = ms.filter(function (m) { return m.useby.length; }).map(function (m) { return '<li><b>' + esc(m.useby[0][0]) + '</b><span>by ' + esc(m.useby[0][1]) + ' · ' + P.DAYS[dayIdx(m.day)][1] + ' ' + esc(m.t) + '</span></li>'; }).join('');
    var ord = ms.map(function (m) { return '<li><b>' + P.DAYS[dayIdx(m.day)][1] + '</b><span>' + m.em + ' ' + esc(m.t) + (m.makes ? ' <small>(cook double)</small>' : '') + '</span></li>'; }).join('');
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
    var r = [['↑ ↓ ← →', 'Move between meals'], ['E or Enter', 'Open the meal in the inspector'], ['Ctrl/Cmd Enter', 'Close the inspector'], ['Esc', 'Close a menu or popover; closes a flyout inspector'], ['X', 'Replan (remove, night stays open)'], ['Shift X', 'Remove and mark Not cooking'], ['H', 'Hold or release'], ['L', 'Add missing to the shopping list'], ['Z', 'Undo'], ['A', 'Open your assistant'], ['T', 'Back to today'], ['M', 'Focus the main column'], ['Space', 'Lift a meal, arrows carry, Space drops (move)']];
    return '<div class="scrim" data-closehelp></div><div class="help" role="dialog" aria-label="Keyboard shortcuts"><header><h2>Keyboard</h2><button class="ib" data-closehelp aria-label="Close">' + ic.x + '</button></header><dl>' + r.map(function (x) { return '<dt><span class="kbd">' + x[0] + '</span></dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl><p>Everything a swipe does on a phone has a key or a menu here.</p></div>';
  }
  var toastT;
  function toast(msg, undo) {
    var t = document.getElementById('toast'); if (!t) return;
    t.innerHTML = '<span>' + msg + '</span>' + (undo ? '<button data-undo>Undo <span class="kbd">Z</span></button>' : ''); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 6000);
  }

  /* ---------- render ---------- */
  function optionsPanel() {
    var g = function (k, lab, vals) { return '<fieldset><legend>' + lab + '</legend>' + vals.map(function (v) { return '<label><input type="radio" name="' + k + '" value="' + v[0] + '"' + (S[k] === v[0] ? ' checked' : '') + '> ' + v[1] + '</label>'; }).join('') + '</fieldset>'; };
    return '<button class="optfab" data-opts aria-expanded="' + S.opts + '">Options</button>' + (S.opts ? '<div class="optpanel" role="dialog" aria-label="Mockup options">' +
      g('lay', 'Layout', [['board', '1 Week board (recommended)'], ['agenda', '2 Agenda rows'], ['focus', '3 Day focus']]) + g('insp', 'Inspector', [['dock', 'Docked (recommended)'], ['flyout', 'Flyout']]) +
      g('f', 'People filter', [['chips', 'Chips + overflow (recommended)'], ['menu', 'One menu'], ['seg', 'Segment + People']]) + g('e', 'Open night', [['ghost', 'Ghost, actions on hover (recommended)'], ['slim', 'Slim row']]) + g('c', 'Status', [['labels', 'Labelled chips (recommended)'], ['icons', 'Icons + tooltips'], ['line', 'One status line']]) +
      '<p class="onote">Also in the URL: <code>?lay=&amp;insp=&amp;f=&amp;e=&amp;c=&amp;sel=wed-curry&amp;today=tue&amp;who=mine</code></p></div>' : '');
  }
  function render() {
    var keepScroll = window.scrollY, mainEl = document.querySelector('.main'), ae = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id : null;
    var hasSel = !!S.sel;
    root.innerHTML = '<div class="app lay-' + S.lay + ' insp-' + S.insp + (hasSel ? ' has-sel' : ' idle') + '" data-c="' + S.c + '">' + rail() + '<main class="main" id="main">' + header() + summary() + '<div class="plan" id="plan">' + plan() + '</div></main>' + insp() + (S.insp === 'flyout' && hasSel ? '<div class="fscrim" data-close></div>' : '') + '</div><div class="toast" id="toast" role="status" hidden></div><div id="popwrap">' + popHtml() + '</div>' + helpHtml() + optionsPanel();
    window.scrollTo(0, keepScroll);
    if (ae) { var el = root.querySelector('.mc[data-id="' + ae + '"]'); if (el) el.focus({ preventScroll: true }); }
    fit();
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
  window.addEventListener('resize', fit);

  /* ---------- actions ---------- */
  function snap() { return JSON.stringify({ m: S.meals, b: S.blocked, sel: S.sel }); }
  function doUndo() { if (!S.undo) return; var u = JSON.parse(S.undo); S.meals = u.m; S.blocked = u.b; S.sel = u.sel; S.undo = null; render(); toast('Restored'); }
  function act(a, id) {
    var m = find(id); if (!m) return;
    if (a === 'open') { S.sel = id; S.pop = null; render(); var i = root.querySelector('.insp'); return; }
    if (a === 'hold') { m.held = m.held ? 0 : 1; S.pop = null; render(); toast(m.held ? 'Holding ' + esc(m.t) + ' ingredients for ' + P.DAYS[dayIdx(m.day)][1] : 'Hold released'); return; }
    if (a === 'list') { S.undo = snap(); m.list += m.miss.length; m.miss = m.miss.map(function (x) { return x; }); S.pop = null; render(); toast('Added ' + m.miss.length + ' to the shopping list', 1); return; }
    S.undo = snap(); S.meals = S.meals.filter(function (x) { return x.id !== id; }); if (S.sel === id) S.sel = null; S.pop = null;
    if (a === 'nocook') S.blocked[m.day] = 'once';
    render(); toast(a === 'nocook' ? esc(m.t) + ' removed, ' + P.DAYS[dayIdx(m.day)][1] + ' is Not cooking' : esc(m.t) + ' removed, ' + P.DAYS[dayIdx(m.day)][1] + ' is open to replan', 1);
  }
  function focusedId() { var a = document.activeElement; return a && a.classList.contains('mc') ? a.dataset.id : S.sel; }
  function closeInsp() { var id = S.sel; S.sel = null; render(); if (id) { var el = root.querySelector('.mc[data-id="' + id + '"]'); if (el) el.focus(); } }
  function openMenu(id, x, y) { S.pop = { k: 'menu', id: id, x: Math.min(x, innerWidth - 250), y: Math.min(y, innerHeight - 230) }; render(); var f = document.querySelector('.pop button'); if (f) f.focus(); }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button,article,[data-closehelp]'); var pw = e.target.closest('.pop');
    if (S.pop && !pw && !(t && t.dataset.pop)) { S.pop = null; render(); if (!t) return; }
    if (!t) return;
    var d = t.dataset;
    if (d.opts !== undefined) { S.opts = !S.opts; return render(); }
    if (d.more) { var r = t.getBoundingClientRect(); return openMenu(d.more, r.right - 230, r.bottom + 4); }
    if (d.act) return act(d.act, d.id);
    if (d.view) { S.view = d.view; S.pop = null; if (S.sel && !find(S.sel)) S.sel = null; if (S.sel && !P.match(find(S.sel), S.view)) S.sel = null; return render(); }
    if (d.pop) { var b = t.getBoundingClientRect(); S.pop = { k: d.pop, x: Math.max(8, Math.min(b.left, innerWidth - 270)), y: b.bottom + 6 }; render(); var s = document.getElementById('psearch'); if (s) s.focus(); return; }
    if (d.hl) { S.hl = S.hl === d.hl ? null : d.hl; return render(); }
    if (d.tab) { S.day = d.tab; return render(); }
    if (d.close !== undefined) return closeInsp();
    if (d.hold !== undefined) return act('hold', S.sel);
    if (d.replan !== undefined) return act('replan', S.sel);
    if (d.nocook !== undefined) return act('nocook', S.sel);
    if (d.addall !== undefined) return act('list', S.sel);
    if (d.addone) { var m = find(S.sel); S.undo = snap(); m.miss = m.miss.filter(function (x) { return x[0] !== d.addone; }); m.list++; render(); return toast(esc(d.addone) + ' added to the shopping list', 1); }
    if (d.addallWeek !== undefined) { S.undo = snap(); S.meals.forEach(function (m) { m.list += m.miss.length; m.miss = []; }); render(); return toast('Added everything missing to the shopping list', 1); }
    if (d.n) { var mm = find(S.sel); mm.n = Math.max(1, mm.n + (+d.n)); return render(); }
    if (d.block) { S.undo = snap(); S.blocked[d.block] = 'once'; render(); return toast(P.DAYS[dayIdx(d.block)][1] + ' is Not cooking (this week only)', 1); }
    if (d.unblock) { S.undo = snap(); delete S.blocked[d.unblock]; render(); return toast(P.DAYS[dayIdx(d.unblock)][1] + ' is open again', 1); }
    if (d.assist !== undefined) return toast('Opens your default AI app (decision 45). Nothing happens inside Kitchie.');
    if (d.hand !== undefined) return toast('Opens the Plan it panel (hand-add path, fragments/plan-hard-avoid).');
    if (d.undo !== undefined) return doUndo();
    if (d.help !== undefined) { S.help = true; return render(); }
    if (d.closehelp !== undefined) { S.help = false; return render(); }
    if (d.wk !== undefined) return toast(d.wk === '0' ? 'The week picker opens here: last week to four weeks ahead (decision 57).' : 'Not drawn: one sample week.');
    if (t.classList.contains('mc') && !e.target.closest('.more')) { S.sel = t.dataset.id; S.pop = null; render(); }
  });
  document.addEventListener('change', function (e) { var n = e.target.name; if (n && S[n] !== undefined) { S[n] = e.target.value; if (n === 'lay') S.hl = null; render(); S.opts = true; render(); } });
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
    if (k.toLowerCase() === 'a') return toast('Opens your default AI app (decision 45).');
    if (k.toLowerCase() === 't') { S.day = S.today; return render(); }
    if (k.toLowerCase() === 'm') { var f = root.querySelector('.mc'); if (f) f.focus(); return; }
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(k) > -1 && document.activeElement.classList.contains('mc')) {
      e.preventDefault(); var all = [].slice.call(root.querySelectorAll('.mc')), i = all.indexOf(document.activeElement), nx = all[i + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : -1)]; if (nx) nx.focus(); }
  });
  render();
})();
