/* Plan UI review, phone (390 and 360). 13 Oct 2026, later (decisions 159 to 167): the week summary strip is two week-level bulk actions, Add to buy and Reserve, with in-place Undo (?ws=actions|bare|counts, ?demo=week); 13 Oct 2026, later again (decisions 168 to 177): the buttons show only when they apply (hidden, not disabled), the label row carries the Not cooking moon and open-night box counts, and Reserve reads Release once held (the per-meal Hold too, ?rs=all|both|any); "use first" is dropped. 13 Oct 2026, live test (decisions 154 to 158): a Not cooking day opens a light panel (154), the swipe's Not cooking Undo is 3 s (155), Not cooking is the muted grey of past days and the ?ac= switch is gone (156), an ECG marker on the divider line opens the collapsed Not cooking days of a gap (157, ?gap=ecg|off); 13 Oct 2026, typed, later (decision 178): the marker is only where days are hidden, opened days carry none and fold back by the peek rule (96), the tear is on every drag and only on the top and bottom edges (158, ?tear=all|detail, default all).
   13 Oct 2026 01:55: the open day is UAT's dashed box with a right swipe for Not cooking (147 to 149, ?od=dash|text), a duller accent token (150, ?ac=dull|normal), the vanishing-options fix (151 to 153). 13 Oct 2026, later: the day ribbon shows ONLY while a detail is open (decision 136, owner-stated); ?rb=always restores the old always-on ribbon (superseded, for comparison).
   13 Oct 2026 batch 2 (decisions 120 to 133): plain red or green status, one combined ingredient list, Hold and Add at the bottom, total time, quiet open nights, first-run wiggle, auto-expiring undo, Open recipe.
   Batch 1: UAT day-row grid (.pw-day, .pw-dn, .pw-stack, verified against Kitchie uat), ribbon taps swap the docked stack, lift, tear. Day ribbon revision, 12 Oct 2026 (owner-stated decisions 85 to 119, see docs/knowledge/jobs-to-be-done/plan-ui-review.md).
   Swipes are pointer events, so a mouse drags exactly like a finger. Keyboard: focus a card, X replan, Shift X not cooking, H hold, E or Enter open, Z undo.
   Same service methods as the chat tools (plan_view, plan_update_meal, plan_remove_meal, plan_block_day, plan_reserve, plan_add_missing_to_list, plan_move_meal, plan_copy_last_week).
   Sample data is in data.js; status markup is in status.js. Nothing here is built in Kitchie. */
(function () {
  var P = window.PUR; P.useRange(3); /* 197: one week back, this week and three more ("four forward, one backward", owner-stated 13 Oct 2026) */ var ic = P.icons, REDUCE = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches), q = new URLSearchParams(location.search), RIB = P.RIB, DI = RIB.map(function (r) { return r.id; });
  function pick(k, ok, d) { var v = q.get(k); return ok.indexOf(v) > -1 ? v : d; }
  var S = {
    lay: pick('lay', ['rib', 'focus'], 'rib'), hd: pick('hd', ['shrink', 'fixed'], 'shrink'), f: pick('f', ['drop', 'seg', 'strip'], 'drop'), pc: pick('pc', ['step', 'drop'], 'step'),
    nc: pick('nc', ['hide', 'show'], 'hide'), u: pick('u', ['day', 'flip', 'banner', 'pill'], 'day'), dt: pick('dt', ['stack', 'peek', 'strip', 'hide', 'sheet'], 'stack'), long: pick('long', ['0', '1'], '0'), st: pick('st', ['plain', 'labels', 'badge', 'edge', 'progress'], 'plain'), gr: pick('gr', ['list', 'hand'], 'list'), hdl: pick('hdl', ['none', 'light'], 'none'), jig: pick('jig', ['1', '0', 'reset'], ''), ba: pick('ba', ['bar', 'list', 'both'], 'bar'), rb: pick('rb', ['detail', 'always'], 'detail'), tear: pick('tear', ['detail', 'all'], 'all'), gap: pick('gap', ['ecg', 'off'], 'ecg'),
    cu: pick('cu', ['start', 'idle', 'off'], 'start'), od: pick('od', ['dash', 'text'], 'dash'), sw: pick('sw', ['tint', 'buttons'], 'tint'), ws: pick('ws', ['actions', 'bare', 'counts'], 'actions'), rs: pick('rs', ['all', 'both', 'any'], 'all'), cs: pick('cs', ['own', 'visible'], 'own'),
    today: 'd13', cur: P.did(q.get('day'), 'd13'), view: (q.get('who') === 'everyone' ? 'household' : q.get('who')) || 'mine', hl: null, sel: q.get('sel'), snap: q.get('snap') === 'full' ? 'full' : 'half', expand: q.get('expand') === '1',
    dday: q.get('dock') || null, pop: null, opts: false, ustk: [], pickMove: false, note: null, carry: null, pickd: null, revealed: null, xp: {}, cuShown: false, cuDone: {}, cmp: false,
    meals: P.phoneMeals(), blocked: P.baseBlocked('d13'), bown: P.baseOwners(), bought: P.phoneBought(), extras: P.phoneExtras()
  };
  var TODAYN = 13, root = document.getElementById('root'), nid = 0;
  if (!S.meals.some(function (m) { return m.id === S.sel; })) S.sel = null; else if (!q.get('day')) S.cur = S.meals.filter(function (m) { return m.id === S.sel; })[0].day;
  var dd0 = S.dday ? P.did(S.dday, null) : null; S.dday = dd0 && S.dt === 'stack' && !S.sel ? dd0 : null; if (S.dday) { S.cur = S.dday; S.revealed = S.dday; }
  if ((S.sel || S.dday) && S.dt === 'stack' && S.hd === 'shrink') S.cmp = true;
  function di(d) { return DI.indexOf(d); } function info(d) { return RIB[di(d)]; } function past(d) { return di(d) < di(S.today); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function find(id) { return S.meals.filter(function (m) { return m.id === id; })[0]; }
  function ro() { return S.view !== 'mine' && S.view !== 'household'; }
  function vis() { return S.meals.filter(function (m) { return P.match(m, S.view); }); }
  function on(d) { return vis().filter(function (m) { return m.day === d; }); }
  function dName(d) { var x = info(d); return x.dow + ' ' + x.n + ' ' + x.mo; }
  function dLong(d) { var x = info(d); return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][x.i % 7]; }
  function vlab(v) { return v === 'mine' ? 'Mine' : v === 'household' ? 'Household' : P.people.filter(function (p) { return p.id === v; })[0].n; }
  function cnt(v) { return S.meals.filter(function (m) { return P.match(m, v); }).length; }
  function weekOf(d) { return info(d).wk; }
  function monN(d) { return info(info(d).mon).n; }
  function hidden(d) { return S.nc === 'hide' && S.blocked[d] && !S.carry && d !== S.cur && d !== S.revealed && !S.xp[d]; }
  /* Plan UI review 136 (owner-stated, 13 Oct 2026: "Horizontal date slide only during the detail view"). The day ribbon exists only while a docked detail is open (the stack, the dock variants), where it swaps the day.
     In the plain week view it is gone; the agenda scrolls across the three weeks itself. ?rb=always brings the old always-on ribbon back for comparison (superseded). The two-stop sheet is an overlay on the week, so it has no ribbon;
     the one-day-at-a-time layout (?lay=focus) keeps it because there it is the only day picker. */
  function detailOpen() { return !!((S.sel && S.dt !== 'sheet' && find(S.sel)) || S.dday); }
  function ribOn() { return S.rb === 'always' || S.lay === 'focus' || detailOpen(); }
  function isOpen(d) { return !on(d).length && !S.blocked[d]; }
  /* Plan UI review 121, 122 (owner: "green means it's been dealt with"). One rule for the tile, the ribbon dots, the gutter and the red names in the list.
     gr=list (recommended): a missing item is dealt with once it is on the shopping list. gr=hand: green only when everything is on hand. x[2] = on the list. */
  function isRed(x) { return S.gr === 'hand' || !x[2]; }
  function dealt(m) { return !m.miss.some(isRed); }
  function dayDealt(d) { return on(d).every(dealt); }
  /* ---------- the shopping list, as the cart sees it (owner, 14 Oct 2026: Replan also undoes that meal's own footprint) ----------
     A line is derived, never stored: every ingredient a meal needs, is missing and was added for that meal (the third value of the miss row) puts the meal's own amount on the line for that ingredient.
     Removing the meal takes exactly that amount off; a line nothing else needs goes. A bought item is in Pantry (S.bought), is not on the list, and a replan never touches it. Lines count my plan only, from today on. */
  function parseQ(s) { var m = /^\s*(\d+\s*\/\s*\d+|\d+(?:\.\d+)?|\u00bd)?\s*(.*)$/.exec(String(s || '')), n = m[1], v = 0; if (n) { if (n === '\u00bd') v = .5; else if (n.indexOf('/') > -1) { var f = n.split('/'); v = f[0] / f[1]; } else v = +n; } return { v: v, u: m[2] }; }
  function fmtV(v) { var w = Math.floor(v + 1e-9), f = v - w; if (f >= .25 && f < .75) return w ? w + '\u00bd' : '\u00bd'; return String(Math.round(v)); }
  function fmtQ(v, u) { if (!v) return u || ''; return (u === 'g' || u === 'ml' ? Math.round(v / 5) * 5 : fmtV(v)) + (u ? ' ' + u : ''); }
  function shopLines(skip) {
    var map = {}, order = [];
    S.meals.filter(function (m) { return !past(m.day) && P.match(m, 'mine') && !(skip && skip.indexOf(m.id) > -1); }).sort(function (a, b) { return di(a.day) - di(b.day); }).forEach(function (m) {
      m.miss.forEach(function (x) { if (!x[2]) return; var q = parseQ(x[1]), l = map[x[0]]; if (!l) { l = map[x[0]] = { name: x[0], tot: 0, u: q.u, from: [] }; order.push(x[0]); } l.tot += q.v; l.from.push({ m: m, q: x[1] }); });
    });
    return order.map(function (n) { var l = map[n]; l.qty = fmtQ(l.tot, l.u); return l; });
  }
  function shopCount() { return shopLines().length + S.extras.length; }
  /* what removing a meal does to the list, in words: lines reduced, lines taken off, bought items it left alone */
  function cartNote(ms) {
    var ids = ms.map(function (m) { return m.id; }), b = shopLines(), a = shopLines(ids), am = {}, parts = [], kept = [];
    a.forEach(function (l) { am[l.name] = l; });
    b.forEach(function (l) { var x = am[l.name]; if (!x) parts.push(esc(l.name) + (l.qty ? ' ' + esc(l.qty) : '') + ' taken off, nothing else needs it'); else if (x.tot < l.tot - 1e-9) parts.push(esc(l.name) + ' ' + esc(l.qty) + ' down to ' + esc(x.qty || 'less')); });
    Object.keys(S.bought).forEach(function (i) { if (ids.some(function (id) { return (S.bought[i]['for'] || []).indexOf(id) > -1; })) kept.push(i); });
    return (parts.length ? 'Shopping list: ' + parts.join('; ') + '.' : '') + (kept.length ? (parts.length ? ' ' : '') + 'Already bought, left alone: ' + esc(kept.join(', ')) + '.' : '');
  }
  function holdNote(ms) { var n = []; ms.forEach(function (m) { if (m.held) haveList(m).forEach(function (r) { n.push(r[0]); }); }); return n.length ? 'Hold released: ' + esc(n.join(', ')) + '.' : ''; }
  function buyLine(name) {
    var l = shopLines().filter(function (x) { return x.name === name; })[0]; if (!l) return;
    var ids = l.from.map(function (f) { return f.m.id; });
    mutate(function () {
      S.meals.forEach(function (m) { if (ids.indexOf(m.id) < 0) return; var r = m.miss.filter(function (x) { return x[0] === name; })[0]; if (!r) return; m.miss = m.miss.filter(function (x) { return x[0] !== name; }); m.have.push([r[0], r[1]]); m.list = m.miss.filter(function (x) { return x[2]; }).length; });
      S.bought[name] = { day: 'Sat 10 Oct', q: l.qty, 'for': ids };
    }, 'Bought ' + esc(name) + (l.qty ? ' ' + esc(l.qty) : '') + '. It is in Pantry now, so every meal counts it as on hand. Replanning will not touch it', null, 'buy', null, 'Bought ' + esc(name));
  }
  function shopSheet() {
    var L = shopLines(), B = Object.keys(S.bought), h = '<div class="scrim2" data-closea></div><div class="asheet shopsh" role="dialog" aria-label="Shopping list"><h2>Shopping list <span class="nbd">' + shopCount() + '</span></h2><p class="hint2">Stand-in for the Shopping tab in this mockup. Each line is what the meals behind it need. Replan takes only that meal\u2019s amount off; a line nothing needs any more goes. Bought items are in Pantry and are never touched.</p><ul class="shl">';
    L.forEach(function (l) { h += '<li data-line="' + esc(l.name) + '"><span class="sn"><span class="ln"><b>' + esc(l.name) + '</b>' + (l.qty ? ' <i>' + esc(l.qty) + '</i>' : '') + '</span><small>' + l.from.map(function (f) { return esc(f.m.t) + ' (' + dName(f.m.day).split(' ')[0] + (f.q ? ', ' + esc(f.q) : '') + ')'; }).join(' \u00b7 ') + '</small></span><button class="bt" data-buy="' + esc(l.name) + '" aria-label="Mark ' + esc(l.name) + ' as bought">Bought</button></li>'; });
    S.extras.forEach(function (x) { h += '<li data-line="' + esc(x.name) + '"><span class="sn"><span class="ln"><b>' + esc(x.name) + '</b> <i>' + esc(x.q) + '</i></span><small>Added by hand, no meal behind it</small></span></li>'; });
    if (!L.length && !S.extras.length) h += '<li class="none">Nothing on the list.</li>';
    h += '</ul>';
    if (B.length) { h += '<p class="lbl">Bought, in Pantry</p><ul class="shl bought">'; B.forEach(function (n) { var b = S.bought[n]; h += '<li data-line="' + esc(n) + '"><span class="sn"><span class="ln"><b>' + esc(n) + '</b>' + (b.q ? ' <i>' + esc(b.q) + '</i>' : '') + '</span><small>Bought ' + esc(b.day) + '</small></span><span class="tk" aria-hidden="true">' + ic.check + '</span></li>'; }); h += '</ul>'; }
    return h + '</div>';
  }
  function unlisted(m) { return m.miss.filter(function (x) { return !x[2]; }); }
  function haveList(m) { return S.long === '1' ? m.have.concat(P.LONG) : m.have; }

  /* ---------- cards ---------- */
  /* Plan UI review 190 (owner-stated, 13 Oct 2026: "maybe the padlock on other people's read-only is a bad idea ... I think just the eye, but I don't want the normal eye emoji ... find an eye in the same language as the theme" and "dimming ... alongside"): a tile or box in another
     person's plan carries a small eye drawn like the moon, cog and spark glyphs (ic.eye), and the tile is dimmed a little. Past days keep their grey and get no eye. The eye is aria-hidden: the tile or box says "view only, Priya's plan" in its own label. Size and place are a Proposal. */
  function voLab() { return 'view only, ' + vlab(S.view) + "'s plan"; }
  function voHtml() { return '<span class="vo" aria-hidden="true" title="View only, ' + esc(vlab(S.view)) + "'s plan\">" + ic.eye + '</span>'; }
  /* The Surprise me reason in plain words (decision 292, Proposal); the markup the app can lift. data-why carries the sentence; focusable through its button, not hover only. */
  function whyChip(m) { return '<span class="why" data-why="' + esc(m.why) + '"><button type="button" class="why-btn" aria-expanded="false" aria-describedby="why-' + m.id + '">' + ic.dice + ' Why this</button><span class="why-tip" id="why-' + m.id + '" role="tooltip">' + esc(m.why) + '</span></span>'; }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.why-btn'); [].forEach.call(document.querySelectorAll('.why-btn[aria-expanded=true]'), function (x) { if (x !== b) x.setAttribute('aria-expanded', 'false'); }); if (b) { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'); e.stopPropagation(); } }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var o = document.querySelector('.why-btn[aria-expanded=true]'); if (o) { o.setAttribute('aria-expanded', 'false'); e.stopPropagation(); } } }, true);
  function card(m, lite) {
    var lift = S.carry && S.carry.move && S.carry.from === m.id, hl = S.hl === 'missing' ? m.miss.length : S.hl === 'useby' ? m.useby.length : 1, pst = past(m.day), lock = ro(), e = S.st === 'edge' ? ' e-' + P.status.edge(m, TODAYN) : '';
    var who = lock ? 'all' : pst ? 'past' : 'edit';
    var hint = lock ? (pst ? 'Past, read only.' : voLab().charAt(0).toUpperCase() + voLab().slice(1) + '.') : pst ? 'Past, read only. Swipe right: copy forward.' : 'Swipe right: not cooking. Swipe left: replan. Or press X, Shift X.';
    return '<div class="sw' + (S.sw === 'buttons' ? ' btns' : '') + '" data-sw="' + m.id + '"><div class="und" aria-hidden="true"><span class="l' + (pst ? ' cf' : '') + '">' + (pst ? ic.cal + ' Copy forward' : ic.moon + ' Not cooking') + '</span><span class="r">Replan ' + ic.swap + '</span></div>' +
      '<article class="mc' + e + (lift ? ' lifted' : '') + (lite ? ' lite' : '') + (S.sel === m.id ? ' sel' : '') + (lock && !pst ? ' vonly' : '') + (S.jigOn && lite && who === 'edit' ? ' jig' : '') + (hl ? '' : ' dim') + (pst ? ' past' : '') + '" tabindex="0" data-id="' + m.id + '"' + (lite && who === 'edit' ? ' data-tile="1"' : '') + ' data-ro="' + who + '" aria-label="' + esc(m.t) + ', ' + dName(m.day) + (m.part ? ', ' + P.whoFull(m) : '') + '. ' + hint + '">' + (lock && !pst ? voHtml() : '') +
      '<span class="em">' + m.em + '</span><div class="tx"><h3>' + esc(m.t) + '</h3><p' + (m.part ? ' class="aud" title="' + esc(P.whoFull(m)) + '"' : '') + '>' + esc(P.whoLabel(m, true)) + '</p>' + (m.left ? '<p class="lf">' + ic.swap + ' Leftovers from ' + m.left + '</p>' : '') + (m.why && m.whyk === P.whyKey(m) ? whyChip(m) : '') + '</div>' +
      (S.st === 'edge' ? P.status.html(m, 'edge', TODAYN) : S.st === 'plain' && !pst ? P.status.html(m, 'plain', TODAYN, !dealt(m)) : '') + '<button class="more" data-more="' + m.id + '" aria-label="Actions for ' + esc(m.t) + '">' + ic.more + '</button>' + (S.st === 'edge' || S.st === 'plain' || lite ? '' : P.status.html(m, S.st, TODAYN)) + '</article></div>';
  }
  /* Decision 125 (owner-stated): on the week an open night is only the quiet words "Open night". Ask AI and Surprise me appear once the person taps into that day. 183 refines it: that day is the light card (liteHtml), never a big empty detail.
     Other detail variants have no day card, so they keep the buttons on the row. */
  function emptyHtml(d) {
    if (past(d)) return '<div class="empty past">Nothing was planned</div>';
    if (S.blocked[d]) { var us = S.blocked[d] === 'usual', rol = ro(); return '<button class="blk' + (us ? ' usual' : '') + (rol ? ' vonly' : '') + '" ' + (rol ? 'disabled aria-label="Not cooking, ' + (us ? 'usual day off' : 'this week only') + ', ' + voLab() + '"' : S.dt === 'stack' ? 'data-openday="' + d + '"' : 'data-unblock="' + d + '"') + '>' + (rol ? voHtml() : '') + '<b>Not cooking</b><span>' + (us ? 'Every week, usual day off' : 'This week only') + (rol ? '' : S.dt === 'stack' ? ' · tap for options' : ' · tap to cook') + '</span></button>'; }
    if (ro()) return S.dt === 'stack' && S.od === 'dash' ? '<div class="sw od-sw ro"><div class="od vonly" role="img" aria-label="Open night, ' + voLab() + '">' + ic.unlock + voHtml() + '</div></div>' : '<div class="nite ro vonly" role="img" aria-label="Open night, ' + voLab() + '">' + voHtml() + '<span class="ot">Open night</span></div>';
    var btns = '<div class="oa"><button data-ask="' + d + '">' + ic.spark + ' Ask AI</button><button data-surprise="' + d + '">' + ic.dice + ' Surprise me</button></div>';
    /* Plan UI review 147 to 149: the open day on the plain week is the UAT dashed slot, with the Not cooking swipe under it. ?od=text is the quiet "Open night" words of 125. Past days and other people's plans have no swipe (and a past day never gets here). */
    if (S.dt === 'stack' && S.od === 'dash') return '<div class="sw od-sw' + (S.sw === 'buttons' ? ' btns' : '') + '" data-od="' + d + '"><div class="und" aria-hidden="true"><span class="l">' + ic.moon + ' Not cooking</span><span class="r"></span></div><button class="od" data-openday="' + d + '" data-od-b="' + d + '" aria-keyshortcuts="Shift+X" aria-label="Open night, ' + dName(d) + '. Tap to plan it. Swipe right or press Shift X for Not cooking">' + ic.unlock + '<span class="sr">Open night</span></button></div>';
    if (S.dt === 'stack') return '<button class="nite quiet" data-openday="' + d + '" aria-label="Open night, ' + dName(d) + '. Tap to plan it"><span class="ot">Open night</span></button>';
    return '<div class="nite"><button class="ot" data-block="' + d + '" aria-label="Open night. Tap to mark Not cooking">Open night<small>tap if not cooking</small></button>' + btns + '</div>';
  }
  function dayBody(d) {
    var ms = on(d);
    if (!ms.length) return emptyHtml(d);
    return (S.view === 'mine' && P.routineDefault(d, S.today) && !S.blocked[d] ? '<p class="tipl">Usual day off, cooking this week</p>' : '') + ms.map(card).join('') + (P.tips[d] && !past(d) ? '<p class="tipl">' + ic.leaf + ' ' + esc(P.tips[d]) + '</p>' : '');
  }
  function noteHtml(d, lite) { var n = S.note; if (!n || S.u !== 'day' || n.day !== d || (!lite && S.dday === d && S.dt === 'stack' && !S.sel && (S.blocked[d] || isLite()))) return ''; return '<div class="unote" role="status"><span>' + n.msg + '</span>' + (n.undo ? '<button data-undo>' + ic.undo + ' Undo</button>' : '') + '</div>'; }
  /* UAT stencil (decision 110): one row per day, a narrow left gutter with the weekday and the date, then the stack of meals. Class names are the ones Kitchie UAT draws
     (verified, basement-bridge/kitchie uat, server/src/web-plan.ts and assets/plan.js, 12 Oct 2026): .pw-day, .pw-dn, .pw-stack. Today and the carry labels are mockup additions (111). */
  function daySec(d, extra) {
    var x = info(d), tgt = S.carry && !past(d), hid = hidden(d), lab = (S.blocked[d] && S.carry ? '<i class="ncl">Not cooking</i>' : '') + (tgt ? '<i class="drp">' + (S.carry.drag ? (S.carry.day === d ? 'Lifted from here' : 'Drop here') : 'Tap to drop here') + '</i>' : '');
    return '<section class="pw-day' + (past(d) ? ' past' : '') + (d === S.today ? ' today' : '') + (hid ? ' hid' : '') + (tgt ? ' target' : '') + (S.pulse && S.pulse.indexOf(d) > -1 ? ' pulse' : '') + '" id="d-' + d + '" data-d="' + d + '"' + (S.carry && past(d) ? ' aria-disabled="true"' : '') + '><div class="pw-dn" aria-label="' + dLong(d) + ' ' + x.n + ' ' + x.mo + (d === S.today ? ', today' : '') + '">' + x.dow + '<small>' + x.n + ' ' + x.mo + '</small>' + (S.st === 'plain' && !past(d) && on(d).length ? '<i class="gs ' + (dayDealt(d) ? 'ok' : 'bad') + '" role="img" aria-label="' + (dayDealt(d) ? 'Dealt with' : 'Something is missing') + '"></i>' : '') + (d === S.today ? '<em>Today</em>' : '') + '</div><div class="pw-stack">' + (lab ? '<div class="dsh">' + lab + '</div>' : '') + noteHtml(d) + dayBody(d) + '</div></section>';
  }
  function wkDiv(r) { return '<div class="wkd"><span>Week of ' + r.n + ' ' + r.mo + '</span><i>' + P.REL[r.wk] + (r.wk < 0 ? ' · read only' : '') + '</i>' + (r.wk >= 0 && S.ws !== 'counts' ? '<span class="wr"><i class="wn">' + stats(r.wk).nights + ' of 7 nights</i>' + wkInd(r.wk) + '</span>' : '') + '</div>' + (r.wk >= 0 ? summary(r.wk) : ''); }
  function agenda() { return RIB.map(function (r) { return (r.dow === 'Mon' ? wkDiv(r) : '') + daySec(r.id); }).join('') + '<div class="endsp" aria-hidden="true"></div>'; }

  /* ---------- detail: docked below the ribbon (default) or the two-stop sheet ---------- */
  /* Decision 123 (owner-stated, voice): "rather than the split of on hand and missing, I just want to see the missing ingredient in red at the top". ONE list: missing first, then on hand.
     No headings, no boxes, no pills. A missing name is plain red until it is dealt with (on the list); a listed one reads as a normal name with a small cart tick. */
  function ubTxt(m, r) { var ub = m.useby.filter(function (u) { return u[0] === r[0]; })[0]; return ub ? '<span class="ubt ' + P.status.urg(m, TODAYN) + '">use by ' + esc(ub[1]) + '</span>' : ''; }
  function ingList(m, lk) {
    var ms = m.miss.filter(function (x) { return !x[2]; }).concat(m.miss.filter(function (x) { return x[2]; })), hv = haveList(m);
    /* Decision 134 (Proposal, ?ba=bar|list|both): group-level bulk actions in the list itself. They reuse the bottom bar's handlers (data-addall, data-hold), so the undo flip and its expiry are the same. */
    var vo = ro(), ga = !lk && !vo && S.ba !== 'bar', un = unlisted(m).length; /* 206: another person's plan is fully view only, so no Add all, Hold all or cart */
    var addRow = ga && un ? '<li class="ga ga-add"><button class="gbtn" data-addall aria-label="Add all ' + un + ' missing ' + (un === 1 ? 'ingredient' : 'ingredients') + ' to the shopping list">' + ic.cart + ' Add all</button></li>' : '';
    var holdRow = ga && hv.length ? '<li class="ga ga-hold"><button class="gbtn' + (m.held ? ' on' : '') + '" data-hold aria-label="' + (m.held ? 'Release the hold on ' : 'Hold all ') + hv.length + ' on-hand ingredients">' + ic.mark + (m.held ? ' Release' : ' Hold all') + '</button></li>' : '';
    var rows = ms.map(function (x, i) {
      var tail = lk ? '' : x[2] ? '<span class="onl" role="img" aria-label="On the shopping list" title="On the shopping list">' + ic.cart + '</span>' : vo ? '' : '<button class="ib" data-addone="' + esc(x[0]) + '" aria-label="Add ' + esc(x[0]) + ' to the shopping list">' + ic.cart + '</button>';
      return '<li class="m' + (isRed(x) ? ' red' : '') + (i === ms.length - 1 && hv.length && !addRow ? ' mlast' : '') + '"><span class="in">' + esc(x[0]) + '</span><span class="qy">' + esc(x[1]) + '</span>' + tail + '</li>';
    }).join('');
    return '<ul class="ing one' + (ga ? ' bulk' : '') + '">' + rows + addRow + hv.map(function (r) { return '<li><span class="in">' + esc(r[0]) + '</span><span class="qy">' + esc(r[1]) + '</span>' + ubTxt(m, r) + '</li>'; }).join('') + holdRow + '</ul>';
  }
  function lockEdit(m) { return ro() || past(m.day); }
  function pcount(m) {
    if (S.pc === 'drop') { var o = ''; for (var i = 1; i <= 8; i++) o += '<option value="' + i + '"' + (m.n === i ? ' selected' : '') + '>' + i + (i === 1 ? ' person' : ' people') + '</option>'; return '<div class="ppl"><span class="lbl">People</span><select class="pcs" data-pcsel aria-label="Number of people"' + (lockEdit(m) ? ' disabled' : '') + '>' + o + '</select></div>'; }
    return '<div class="ppl"><span class="lbl">People</span><button class="ib" data-n="-1" aria-label="Fewer people"' + (lockEdit(m) ? ' disabled' : '') + '>−</button><b>' + m.n + '</b><button class="ib" data-n="1" aria-label="More people"' + (lockEdit(m) ? ' disabled' : '') + '>+</button></div>';
  }
  /* ORDER of the detail (owner, 14 Oct 2026: the same order on phone and desktop; this is the phone's, since 123, 124, 126 and 127 fixed most of it, and the desktop now follows it): 1 who and when with close, and the tile (the meal, who, the one status glyph, the ... menu with Open recipe);
     2 where it comes from (made up, Surprise me); 3 Total time, then the meal's note; 4 a view-only or past line; 5 who is eating (People); 6 one ingredient list (missing first, red until it is on the list, then on hand with use-by);
     7 the hold hint, only while held; 8 the footer, Hold N and Add N (past: Copy forward). Replan and Not cooking are not in the detail (126). */
  function detailBody(m) {
    var src = m.src === 'made' ? '<p class="srcl">' + ic.spark + ' <b>Made up by your AI</b> · not saved as a recipe</p>' : m.src === 'surprise' ? '<p class="srcl">' + ic.dice + ' <b>Surprise me</b>' + (m.why && m.whyk === P.whyKey(m) ? ' · ' + esc(m.why) : '') + '</p>' : '';
    var lk = lockEdit(m);
    return src + '<p class="tt">' + ic.clock + ' Total time <b>' + P.mins(m) + '</b></p>' + (m.note ? '<p class="nt">' + esc(m.note) + '</p>' : '') + (lk ? '<p class="nt ronote">' + (ro() ? ic.eye + ' ' + esc(voLab().charAt(0).toUpperCase() + voLab().slice(1)) : ic.cal + ' Past: read only. Swipe the card right, or use Copy forward, to bring it into a coming day.') + '</p>' : '') + pcount(m) + ingList(m, past(m.day)) + (m.held && !lk ? '<p class="nt holdhint">Replan or Not cooking also releases this hold.</p>' : '');
  }
  /* Decision 126 (owner-stated): the bottom of the detail is "Hold" plus the number and a cart "Add" plus the number, nothing else. Replan and Not cooking live in the ... menu and in dragging the tile out.
     The number is what the button will touch (on-hand items to hold, missing items not yet on the list), Proposal; it is not a second status count. No missing items to add: no Add.
     174: a held meal's button reads Release (it was Held), in the footer and in the list, the same word as the week button (173); the sage colour still marks it held. */
  function footActions(m) {
    if (ro()) return ''; /* 206 (owner-stated): another person's plan is view only, no exceptions: no Hold, Release, Add or Copy forward */
    if (past(m.day)) return ro() ? '' : '<button class="b2" data-act="copyfwd" data-id="' + m.id + '">' + ic.cal + ' Copy forward</button>';
    if (S.ba === 'list') return ''; var hv = haveList(m).length, un = unlisted(m).length, o = '';
    if (hv) o += '<button class="b2 hold' + (m.held ? ' on' : '') + '" data-hold aria-label="' + (m.held ? 'Release the hold on ' : 'Hold all ') + hv + ' on-hand ingredients">' + ic.mark + (m.held ? ' Release' : ' Hold') + ' <b class="ct">' + hv + '</b></button>';
    if (un) o += '<button class="b2 add" data-addall aria-label="Add ' + un + ' missing ' + (un === 1 ? 'ingredient' : 'ingredients') + ' to the shopping list">' + ic.cart + ' Add <b class="ct">' + un + '</b></button>';
    return o;
  }
  function mini(d, cls) { var ms = on(d); return '<button class="mini ' + (cls || '') + '" data-dy="' + d + '"><b>' + info(d).dow + ' ' + info(d).n + '</b><span>' + (ms.length ? ms.map(function (m) { return m.em + ' ' + esc(m.t); }).join(' · ') : S.blocked[d] ? 'Not cooking' : 'Open night') + '</span></button>'; }
  function dockHtml(m) {
    var d = m.day, sibs = on(d);
    var inner = '<div class="dkh"><h2 id="stt"><b>' + dLong(d) + '</b> ' + info(d).n + ' ' + info(d).mo + (d === S.today ? ' <em>Today</em>' : '') + '</h2><button class="ib" data-close aria-label="Close detail">' + ic.x + '</button></div>' +
      '<div class="pw-stack">' + sibs.map(function (x) { return x.id === m.id ? card(x) : card(x); }).join('') + '</div>' + '<div class="dkb">' + detailBody(m) + '</div>';
    var foot = footActions(m); inner += foot ? '<footer class="sfoot dkf">' + foot + '</footer>' : '';
    var i = di(d), wk = weekOf(d), others = RIB.filter(function (r) { return r.wk === wk && r.id !== d; }).map(function (r) { return r.id; });
    var before = '', after = '';
    if (S.dt === 'peek') { var pv = DI[i - 1], nx = DI[i + 1]; before = pv ? mini(pv, 'peekm') : ''; after = nx ? mini(nx, 'peekm') : ''; }
    if (S.dt === 'strip') { after = '<div class="minis"><p class="lbl">Other days, ' + (wk === 0 ? 'this week' : P.REL[wk].toLowerCase()) + '</p>' + others.map(function (x) { return mini(x); }).join('') + '</div>'; }
    return before + '<section class="dock' + (S.pulse && S.pulse.indexOf(d) > -1 ? ' pulse' : '') + '" id="d-' + d + '" data-d="' + d + '" role="region" aria-labelledby="stt">' + inner + '</section>' + after;
  }
  /* Decision 107: the day card docks at the top, directly under the ribbon; the detail docks at the bottom; one locked stack. The day piece is pinned; only the detail scrolls. */
  function stackHtml(m) {
    var d = m.day, others = on(d).filter(function (x) { return x.id !== m.id; }), foot = footActions(m), lk = lockEdit(m);
    var st = S.st === 'edge' || S.st === 'plain' ? '' : '<div class="stst">' + P.status.html(m, S.st, TODAYN) + '</div>';
    var day = '<div class="dpiece"><div class="dkh"><h2 id="stt"><b>' + dLong(d) + '</b> ' + info(d).n + ' ' + info(d).mo + (d === S.today ? ' <em>Today</em>' : '') + '</h2><button class="ib" data-close aria-label="Close detail">' + ic.x + '</button></div>' +
      '<div class="pw-stack">' + card(m, true) + others.map(function (x) { return '<button class="mini oth" data-act="open" data-id="' + x.id + '"><b>Also</b><span>' + x.em + ' ' + esc(x.t) + '</span></button>'; }).join('') + noteHtml(d) + '</div>' +
      '<button class="tongue" data-tongue aria-label="Drag down to close, or press Enter" aria-describedby="stt"><i></i></button></div>';
    var sheet = '<div class="spiece"><div class="sbody" id="sbody">' + st + detailBody(m) + '</div>' + (foot ? '<footer class="sfoot">' + foot + '</footer>' : '') + '</div>';
    return '<section class="stackw pw hdl-' + S.hdl + (S.swap ? ' noin' : '') + '" id="d-' + d + '" data-d="' + d + '" role="region" aria-labelledby="stt">' + day + sheet + '</section>';
  }
  /* Plan UI review 183 (owner-stated, 13 Oct 2026: "Open night should behaviour like not cooking night. No need for empty area"): an open night opens this same card; one component, two states. Not cooking state: moon line, third button Mark as open. Open state: the line "Open night", Ask AI and Surprise me only (187: no Not cooking button, the swipe or Shift X marks it).
     Plan UI review 154 (owner-stated, 13 Oct 2026: tapping a Not cooking day opens "that detailed view that blocks"; he expects only Ask AI and Surprise me). A Not cooking day opens a LIGHT panel, docked under the ribbon like the stack (107) but one small card:
     the day, one quiet line, Ask AI, Surprise me and Mark as open. No tile, no people, no ingredients, no time, no sheet, no tongue. The day stays Not cooking until Mark as open or Surprise me; the week stays under the panel. */
  function liteHtml(d) {
    var nc = S.blocked[d], x = info(d);
    return '<section class="stackw lite pw' + (S.swap ? ' noin' : '') + (S.lay === 'focus' ? ' infl' : '') + '" id="lite" data-d="' + d + '" role="region" aria-labelledby="stt"' + (nc ? '' : ' aria-keyshortcuts="Shift+X" aria-description="Shift X marks this night Not cooking"') + '><div class="lpiece"><div class="dkh"><h2 id="stt"><b>' + dLong(d) + '</b> ' + x.n + ' ' + x.mo + (d === S.today ? ' <em>Today</em>' : '') + '</h2><button class="ib" data-close aria-label="Close">' + ic.x + '</button></div>' +
      '<p class="lnote">' + (nc ? ic.moon + ' ' + (nc === 'usual' ? 'Not cooking, every week (usual day off)' : 'Not cooking, this week only') : ic.unlock + ' ' + (P.routineDefault(d, S.today) && S.view === 'mine' ? 'Open night, usual day off opened this week' : 'Open night')) + '</p><div class="oa"><button data-ask="' + d + '">' + ic.spark + ' Ask AI</button><button data-surprise="' + d + '">' + ic.dice + ' Surprise me</button>' + (nc ? '<button class="mko" data-unblock="' + d + '">Mark as open</button>' : '') + '</div>' + noteHtml(d, true) + '</div></section>';
  }
  function isLite() { return liteDay(S.dday) && S.dt === 'stack' && !S.sel; }
  function liteDay(d) { return !!d && !past(d) && !ro() && !on(d).length; }
  /* Decision 115, 116: tapping another day in the ribbon swaps the CONTENTS of the docked stack; the slot stays. A day with no meal shows its open-night, Not cooking or past state in the same two pieces. */
  function stackEmptyHtml(d) {
    var pst = past(d), nc = S.blocked[d], msg = pst ? 'Nothing was planned on this day.' : nc ? (nc === 'usual' ? 'Usual day off. ' : 'Not cooking, this week only. ') : vlab(S.view) + "'s plan is view only.";
    var day = '<div class="dpiece"><div class="dkh"><h2 id="stt"><b>' + dLong(d) + '</b> ' + info(d).n + ' ' + info(d).mo + (d === S.today ? ' <em>Today</em>' : '') + '</h2><button class="ib" data-close aria-label="Close detail">' + ic.x + '</button></div><div class="pw-stack">' + emptyHtml(d) + noteHtml(d) + '</div><button class="tongue" data-tongue aria-label="Drag down to close, or press Enter" aria-describedby="stt"><i></i></button></div>';
    var sheet = '<div class="spiece"><div class="sbody emptyb" id="sbody"><p class="nt">' + msg + '</p></div></div>';
    return '<section class="stackw pw hdl-' + S.hdl + (S.swap ? ' noin' : '') + '" id="d-' + d + '" data-d="' + d + '" role="region" aria-labelledby="stt">' + day + sheet + '</section>';
  }
  function sheetHtml() {
    var m = S.sel && find(S.sel); if (!m || S.dt !== 'sheet') return '<div class="sheet" id="sheet" aria-hidden="true"></div>';
    var foot = footActions(m);
    return '<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="stt"><button class="grab" id="grab" aria-label="Drag to resize or close; press Enter to switch half and full" data-grab><i></i></button>' +
      '<header class="shd"><span class="em lg">' + m.em + '</span><div class="tx"><h2 id="stt">' + esc(m.t) + '</h2><p>' + dName(m.day) + ' · ' + esc(P.whoLabel(m, true)) + '</p></div><button class="ib" data-close aria-label="Close">' + ic.x + '</button></header>' +
      '<div class="sbody">' + detailBody(m) + '</div>' + (foot ? '<footer class="sfoot">' + foot + '</footer>' : '') + '</div>';
  }

  /* ---------- header, ribbon, filter ---------- */
  function stats(wk) { var ms = vis().filter(function (m) { return weekOf(m.day) === wk; }), miss = 0, ub = 0, nights = {}; ms.forEach(function (m) { nights[m.day] = 1; miss += m.miss.length; ub += m.useby.length; }); return { miss: miss, ub: ub, nights: Object.keys(nights).length }; }
  /* Plan UI review 159 to 167 (owner-stated, 13 Oct 2026, by voice): the week summary strip's passive "to buy" and "use first" counts are replaced by two week-level bulk actions, Add to buy and Reserve, for the week the strip sits under.
     The read-only "n of 7 nights" moves up onto the week label row (wkDiv). ?ws=actions (default, counts inside the buttons) | bare (no counts) | counts (the old strip, superseded, for comparison). */
  function weekPlan(wk) {
    var ms = vis().filter(function (m) { return weekOf(m.day) === wk && !past(m.day); }), buy = 0, buyM = 0, hold = 0, holdM = 0, held = 0;
    var heldN = 0;
    ms.forEach(function (m) { var u = unlisted(m).length, h = haveList(m).length; if (u) { buy += u; buyM++; } if (h && !m.held) { hold += h; holdM++; } if (h && m.held) { held++; heldN += h; } });
    return { buy: buy, buyM: buyM, hold: hold, holdM: holdM, held: held, heldN: heldN, meals: ms.length };
  }
  /* Plan UI review 169 to 171 (owner-stated, 13 Oct 2026): on the right of the week label row, after "5 of 7 nights", two icon-and-number indicators and no words: the moon and a number = Not cooking nights, a tiny dashed rounded box with a number = open nights. Each only when above 0.
     Count rule (Proposal): nights of that week from today on (past days of this week are not counted, the same scope as the strip); Not cooking counts any Not cooking mark, one-off or usual, collapsed or open; open = no meal and not Not cooking. Recomputed on every render, so a swipe, an Undo or a drop updates it. */
  function wkCounts(wk) { var nc = 0, op = 0; RIB.forEach(function (r) { if (r.wk !== wk || past(r.id)) return; if (S.blocked[r.id]) nc++; else if (!on(r.id).length) op++; }); return { nc: nc, op: op }; }
  function wkInd(wk) {
    var c = wkCounts(wk), nt = function (n) { return n + (n === 1 ? ' night' : ' nights'); }, h = '';
    /* 191, 192: both counts are real buttons now (keyboard focusable, a 44 px hit area around the small glyph). Tap = jump to the first such night of this week. 192: the open-night box is redrawn larger with a solid numeral; the moon is unchanged. */
    if (c.nc) h += '<button class="wnc" data-jump="nc" data-jwk="' + wk + '" aria-label="' + nt(c.nc) + ' not cooking. Go to the first one" title="' + nt(c.nc) + ' not cooking. Tap to go to the first"><b>' + c.nc + '</b>' + ic.moon + '</button>';
    if (c.op) h += '<button class="wop" data-jump="op" data-jwk="' + wk + '" aria-label="' + nt(c.op) + ' open. Go to the first one" title="' + nt(c.op) + ' open. Tap to go to the first"><b>' + c.op + '</b>' + ic.unlock + '</button>';
    return h ? '<span class="wi">' + h + '</span>' : '';
  }
  function wkName(wk) { if (wk === 0) return 'this week'; if (wk === 1) return 'next week'; var m = RIB.filter(function (r) { return r.wk === wk; })[0]; return 'the week of ' + m.n + ' ' + m.mo; }
  function wkUndo(k, wk) { var u = topU(); return u && u.k === k && u.wk === wk ? u : null; }
  function weekAct(wk) {
    var w = weekPlan(wk), lock = ro(), nm = wkName(wk), cn = S.ws !== 'bare';
    if (!w.meals) return '';
    var bu = wkUndo('wbuy', wk), ru = wkUndo('wres', wk) || wkUndo('wrel', wk);
    var undoB = function (u, lab) { return '<button class="wab undo" data-undo aria-label="Undo ' + lab + ': ' + esc(plain(u.msg)) + '" title="Undo ' + lab + '">' + ic.undo + '<span>Undo</span><small>' + lab + '</small></button>'; };
    /* Plan UI review 168 (owner-stated, 13 Oct 2026: "Buttons are underneath only if there are things that are missing. They need to be there."): a button is drawn only when it applies; the disabled state of 163 is replaced by hidden. After use it is Undo for its window, then it goes away. Neither applies: no row at all. A view-only plan has none.
       173 (owner-stated words, 13 Oct 2026: "when something is already held ... mark that button as release"; the state rule is a Proposal): Reserve while anything on hand is not yet held, Release when everything on hand is held. Mixed: ?rs=all (default) Reserve with the not-yet-held count; both draws both; any = Release as soon as anything is held. */
    var rs = S.rs, hasRes = w.hold > 0, hasRel = w.heldN > 0, showRes = hasRes && !(rs === 'any' && hasRel), showRel = hasRel && (!hasRes || rs !== 'all');
    var showB = !lock && (bu || w.buy), showR = !lock && (ru || showRes || showRel);
    if (!showB && !showR) return '';
    var b1 = !showB ? '' : bu ? undoB(bu, 'add to buy') : '<button class="wab" data-wbuy="' + wk + '" aria-label="Add to buy: put the ' + w.buy + (w.buy === 1 ? ' missing item' : ' missing items') + ' for ' + nm + ' on the shopping list" title="Adds everything missing ' + nm + ' to the shopping list. Undo is one tap">' + ic.cart + '<span>Add to buy</span>' + (cn ? '<b class="ct">' + w.buy + '</b>' : '') + '</button>';
    var b2 = '';
    if (showR && ru) b2 = undoB(ru, ru.k === 'wrel' ? 'release' : 'reserve');
    else if (showR) {
      if (showRes) b2 += '<button class="wab" data-wres="' + wk + '" aria-label="Reserve: hold the ' + w.hold + ' on-hand ' + (w.hold === 1 ? 'item' : 'items') + ' for ' + nm + ' that ' + (w.hold === 1 ? 'is' : 'are') + ' not held yet" title="Holds everything on hand for ' + nm + ' that is not held yet. Undo is one tap">' + ic.mark + '<span>Reserve</span>' + (cn ? '<b class="ct">' + w.hold + '</b>' : '') + '</button>';
      if (showRel) b2 += '<button class="wab rel" data-wrel="' + wk + '" aria-label="Release: let go of the ' + w.heldN + ' held on-hand ' + (w.heldN === 1 ? 'item' : 'items') + ' for ' + nm + '" title="Releases everything held for ' + nm + '. Undo is one tap">' + ic.mark + '<span>Release</span>' + (cn ? '<b class="ct">' + w.heldN + '</b>' : '') + '</button>';
    }
    return '<div class="wact" role="group" aria-label="Bulk actions for ' + nm + '">' + b1 + b2 + '</div>';
  }
  function weekBulk(wk, kind) {
    if (ro()) return; /* 206: no week buttons on another person's plan; the ?wo=show switch of 205 is removed */
    var ms = vis().filter(function (m) { return weekOf(m.day) === wk && !past(m.day); }), nm = wkName(wk), n = 0, k = 0, ids = {};
    if (kind === 'wbuy') { ms.forEach(function (m) { var u = unlisted(m).length; if (u) { n += u; k++; ids[m.id] = 1; } }); if (!n) return; S.ux = { wk: wk }; return mutate(function () { S.meals.forEach(function (m) { if (ids[m.id]) { m.miss = m.miss.map(function (x) { return [x[0], x[1], 1]; }); m.list = m.miss.length; } }); S.asheet = null; }, 'Added ' + n + (n === 1 ? ' item' : ' items') + ' for ' + nm + ' to the shopping list, across ' + k + (k === 1 ? ' meal' : ' meals'), null, 'wbuy', null, 'Added ' + n + (n === 1 ? ' item' : ' items') + ' to buy'); }
    if (kind === 'wrel') { ms.forEach(function (m) { var h = haveList(m).length; if (h && m.held) { n += h; k++; ids[m.id] = 1; } }); if (!n) return; S.ux = { wk: wk }; return mutate(function () { S.meals.forEach(function (m) { if (ids[m.id]) m.held = 0; }); S.asheet = null; }, 'Released ' + n + ' held ' + (n === 1 ? 'item' : 'items') + ' for ' + nm + ', across ' + k + (k === 1 ? ' meal' : ' meals'), null, 'wrel', null, 'Released ' + n + (n === 1 ? ' item' : ' items')); }
    ms.forEach(function (m) { var h = haveList(m).length; if (h && !m.held) { n += h; k++; ids[m.id] = 1; } }); if (!n) return;
    S.ux = { wk: wk }; return mutate(function () { S.meals.forEach(function (m) { if (ids[m.id]) m.held = 1; }); S.asheet = null; }, 'Reserved ' + n + ' on-hand ' + (n === 1 ? 'item' : 'items') + ' for ' + nm + ', across ' + k + (k === 1 ? ' meal' : ' meals'), null, 'wres', null, 'Reserved ' + n + (n === 1 ? ' item' : ' items'));
  }
  function summary(wk) {
    if (S.ws !== 'counts') return weekAct(wk);
    var s = stats(wk);
    return '<div class="sum"><span class="sb"><b>' + s.nights + '/7</b><span>nights</span></span><button class="sb' + (S.hl === 'missing' ? ' on' : '') + '" data-hl="missing" aria-pressed="' + (S.hl === 'missing') + '">' + ic.warn + '<b>' + s.miss + '</b><span>to buy</span></button><button class="sb' + (S.hl === 'useby' ? ' on' : '') + '" data-hl="useby" aria-pressed="' + (S.hl === 'useby') + '">' + ic.clock + '<b>' + s.ub + '</b><span>use first</span></button></div>';
  }
  function ribbon() {
    return '<div class="rib" id="rib" role="tablist" aria-label="Days. Scroll sideways, one day at a time; tap a day to bring it into focus."><div class="ribin" id="ribin"><span class="mk" id="mk" aria-hidden="true"></span>' + RIB.map(function (r) {
      var d = r.id, ms = on(d), dots = '';
      if (ms.length) ms.slice(0, 3).forEach(function (m) { dots += '<i class="' + (dealt(m) ? '' : 'bad') + '"></i>'; }); else dots = S.blocked[d] ? '<i class="off"></i>' : '<i class="open"></i>';
      return (r.dow === 'Mon' && r.i ? '<span class="wsep" aria-hidden="true"></span>' : '') + '<button class="dy' + (d === S.today ? ' today' : '') + (d === S.cur ? ' on' : '') + (past(d) ? ' past' : '') + (r.dow === 'Mon' ? ' mon' : '') + '" data-dy="' + d + '" role="tab" aria-selected="' + (d === S.cur) + '" aria-label="' + dName(d) + (d === S.today ? ', today' : '') + ', ' + (ms.length ? ms.length + (ms.length === 1 ? ' meal' : ' meals') + (past(d) ? '' : dayDealt(d) ? ', dealt with' : ', something missing') : S.blocked[d] ? 'not cooking' : 'open night') + '">' + r.dow.charAt(0) + '<b>' + r.n + '</b>' + (r.n === 1 ? '<i class="mo" aria-hidden="true">' + r.mo + '</i>' : '') + '<span class="st">' + dots + '</span></button>';
    }).join('') + '</div></div>';
  }
  function filterCtl() {
    var lab = vlab(S.view);
    if (S.f === 'seg') return '';
    return '<button class="fmenu" data-fmenu aria-haspopup="listbox" aria-expanded="' + !!(S.pop && S.pop.k === 'f') + '"><span class="av">' + (ro() ? lab.charAt(0) : '') + '</span><b>' + lab + '</b>' + ic.down + '</button>';
  }
  function segRow() {
    if (S.f === 'seg') { var o = function (v, l) { return '<button class="ch' + (S.view === v ? ' on' : '') + '" data-view="' + v + '" role="radio" aria-checked="' + (S.view === v) + '">' + l + ' <i>' + cnt(v) + '</i></button>'; }; var other = ro(); return '<div class="pp"><div class="pstrip" role="radiogroup" aria-label="Whose meals">' + o('mine', 'Mine') + o('household', 'Household') + '<button class="ch' + (other ? ' on' : '') + '" data-fmenu aria-haspopup="listbox">' + ic.people + (other ? vlab(S.view) : 'People') + ic.down + '</button></div></div>'; }
    if (S.f === 'strip' && S.expand) { var ch = function (v, l, av) { return '<button class="ch' + (S.view === v ? ' on' : '') + '" data-view="' + v + '" role="radio" aria-checked="' + (S.view === v) + '">' + (av ? '<span class="av">' + av + '</span>' : '') + l + ' <i>' + cnt(v) + '</i></button>'; }; return '<div class="pp"><div class="pstrip open" role="radiogroup" aria-label="Whose meals">' + ch('mine', 'Mine') + ch('household', 'Household') + P.people.filter(function (p) { return !p.me; }).map(function (p) { return ch(p.id, p.n, p.n.charAt(0)); }).join('') + '</div></div>'; }
    return '';
  }
  /* Copy last week (99) and Clear week (109): two week-level actions, one pattern. Each flips IN PLACE into Undo after use and names what it reverses ("Undo copy", "Undo clear").
     Undo is a short stack (each step lives 14 s): the latest action's button shows Undo; undo it and the earlier one shows Undo again. */
  /* Decision 130 (owner: "not indefinitely, maybe"): every in-place Undo (the day note, the header flip, the banner, the pill, the drop undo) expires. 14 s, recommended 10 to 15 s; ?ut=4 shortens it for review. */
  var UW = (+q.get('ut') > 0 ? Math.min(60, +q.get('ut')) * 1000 : 14000), ULAB = { wbuy: 'add to buy', wres: 'reserve', wrel: 'release', copy: 'copy', clear: 'clear', drop: 'drop', move: 'move', edit: 'change' };
  /* Plan UI review 155 (owner-stated, 13 Oct 2026: "limit that to just three seconds"): the in-place Undo after the right swipe on an open day to Not cooking lives UNDO_NC_MS = 3000 ms, its own constant; every other undo keeps UW (14 s, decision 130). ?ut=N still shortens both for review. */
  var UNDO_NC_MS = Math.min(3000, UW);
  function pruneU() { var t = Date.now(); S.ustk = S.ustk.filter(function (u) { return t - u.at < (u.ms || UW); }); }
  function topU() { pruneU(); return S.ustk[S.ustk.length - 1] || null; }
  function plain(h) { return String(h).replace(/<[^>]+>/g, ''); }
  function flipKind() { var u = topU(); if (!u) return null; if (u.k === 'copy' || u.k === 'clear') return u.k; return S.u === 'flip' ? 'copy' : null; }
  function pill(u) { var l = u.lab || ULAB[u.k] || 'change'; return '<button class="flipundo two" data-undo aria-label="Undo ' + l + ': ' + esc(plain(u.msg)) + (S.ustk.length > 1 ? '. One more step is available after this' : '') + '" title="Undo ' + l + '">' + ic.undo + '<span><b>Undo</b><small>' + l + '</small></span></button>'; }
  function whyOff() { return ro() ? vlab(S.view) + "'s plan is view only" : weekOf(S.cur) < 0 ? 'Last week is read only' : ''; }
  /* Plan UI review 194 (owner-stated, 13 Oct 2026: "double dots for copy and clear week. I want them to be exposed next to the cogwheel. And there should be an undo ... that replaces the same button."): Copy last week and Clear week are two icon buttons
     in the header next to the settings cogwheel; the ... menu is gone (nothing is left in it). Tapping one flips THAT button in place to Undo (14 s, 130, 166), then it is the icon again. Last week (read only): both are drawn disabled so the row does not move
     as you scroll across the boundary (Proposal). Another person's plan: not drawn at all (scope rule, 190). */
  function wkCtl() {
    if (ro()) return '';
    var fk = flipKind(), u = topU(), why = whyOff(), cr = P.clearWeek2(S.meals, S.blocked, S.view, weekOf(S.cur), S.today, S.bown, S.cs), sc = S.view === 'mine' ? 'mine' : 'household', cdis = !!why || cr.why === 'none';
    var cp = fk === 'copy' ? pill(u) : '<button class="ib" data-copy aria-label="Copy last week into this one: fills open nights only, never overwrites"' + (why ? ' disabled' : '') + ' title="' + (why || 'Copy last week: fills open nights only') + '">' + ic.copy + '</button>';
    var cl = fk === 'clear' ? pill(u) : '<button class="ib" data-clearw aria-label="Clear week, ' + sc + ': removes ' + (sc === 'mine' ? 'my' : 'the household\'s') + ' meals and changes from today on, with Undo"' + (cdis ? ' disabled' : '') + ' title="' + (why || (cr.why === 'none' ? (sc === 'mine' ? 'Nothing of mine to clear from today on' : 'Nothing to clear from today on') : 'Clear week, ' + sc + ': removes ' + (sc === 'mine' ? 'my' : 'the household\'s') + ' meals and changes from today on. Undo is one tap')) + '">' + ic.clear + '</button>';
    return '<span class="cpy pair">' + cp + cl + '</span>';
  }
  function header() {
    var r = info(S.cur), mn = info(r.mon), n = S.note, fk = flipKind(), tu = topU(), sub = (fk && tu) ? (tu.short || plain(tu.msg)) + (S.ustk.length > 1 ? ' · +' + (S.ustk.length - 1) + ' more' : '') : P.REL[r.wk];
    var t = '<div class="hd' + (fk ? ' flipped' : '') + (S.view === 'household' ? ' hh' : '') + '"><div class="wt"><h1><button class="wkl" id="wkt" data-wkl aria-keyshortcuts="T" aria-description="Press and hold, or press T, to jump to today">Week of ' + mn.n + ' ' + mn.mo + '</button></h1><small id="wks" class="' + (fk ? 'fl' : '') + '">' + sub + '</small></div><span class="sp"></span>' + filterCtl() + wkCtl() + '<button class="ib cog" aria-label="Plan settings" title="Plan settings">' + ic.cog + '</button></div>';
    var ex = '';
    if (n && S.u === 'banner') ex += '<div class="ubn" role="status"><span>' + n.msg + '</span>' + (n.undo ? '<button data-undo>' + ic.undo + ' Undo</button>' : '') + '</div>';
    if (n && S.u === 'pill') ex += '<div class="upill" role="status"><span>' + n.msg + '</span>' + (n.undo ? '<button data-undo>' + ic.undo + ' Undo</button>' : '') + '</div>';
    if (ro()) ex += '<div class="rol">' + ic.people + ' ' + vlab(S.view) + "'s plan: view only. You can look, not change it.</div>";
    return '<div class="stk' + (S.cmp && S.hd === 'shrink' && ribOn() ? ' cmp' : '') + '" id="stk">' + t + segRow() + (ribOn() ? ribbon() : '') + ex + '<div class="cslot' + (S.cuShown ? ' in' : '') + '" id="cslot">' + (S.cuShown ? '<button class="curtain" data-curtain>' + ic.spark + ' Ask AI to plan this</button>' : '') + '</div></div><div class="stkp" id="stkp"></div>';
  }
  function popHtml() {
    if (!S.pop) return '';
    var it = function (v, l, sub) { return '<button class="it' + (S.view === v ? ' on' : '') + '" role="option" aria-selected="' + (S.view === v) + '" data-view="' + v + '">' + (S.view === v ? ic.check : '<span class="av">' + (v === 'mine' || v === 'household' ? '' : l.charAt(0)) + '</span>') + '<span>' + l + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="kbd">' + cnt(v) + '</span></button>'; };
    var fq = (S.pop.q || '').toLowerCase();
    return '<div class="scrim2" data-closea></div><div class="dd" role="listbox" aria-label="Whose meals"><h2>Showing</h2>' + it('mine', 'Mine', 'your plan: you can change it') + it('household', 'Household', 'the household plan: you can change it') + '<hr><p class="lbl">Other members: view only</p><input id="fq" placeholder="Find a person" aria-label="Find a person" value="' + esc(S.pop.q || '') + '">' + P.people.filter(function (p) { return !p.me && p.n.toLowerCase().indexOf(fq) > -1; }).map(function (p) { return it(p.id, p.n, ''); }).join('') + '</div>';
  }
  function actionSheet() {
    if (S.pickd) {
      var m = find(S.pickd), cells = RIB.filter(function (r) { return r.wk >= 0; }).map(function (r) { var dis = past(r.id); return (r.dow === 'Mon' ? '<p class="cwk">Week of ' + r.n + ' ' + r.mo + ' · ' + P.REL[r.wk] + '</p>' : '') + '<button class="cd' + (r.id === S.today ? ' today' : '') + '" data-pickday="' + r.id + '"' + (dis ? ' disabled' : '') + '><small>' + r.dow + '</small><b>' + r.n + '</b></button>'; }).join('');
      return '<div class="scrim2" data-closea></div><div class="asheet" role="dialog" aria-label="Copy forward: pick a date"><h2>' + (S.pickMove ? 'Move “' + esc(m.t) + '” to another day' : 'Copy “' + esc(m.t) + '” forward') + '</h2><p class="hint2">Pick a date to go to. Then the meal stays in your hand until you tap a day to drop it.</p><div class="cal">' + cells + '</div></div>';
    }
    if (S.pop) return '';
    var a = S.asheet; if (!a) return '';
    if (a.k === 'shop') return shopSheet();
    var m2 = find(a.id), lock = ro(), pst = past(m2.day);
    /* Decision 127 (owner-stated): no gesture hints in brackets ("People know how to do it"), no key badges on the phone, Hold and Add missing live at the bottom of the detail now. */
    var items = '<button class="it" role="menuitem" data-act="recipe" data-id="' + m2.id + '">' + ic.book + 'Open recipe</button>';
    if (pst && !lock) items += '<button class="it" role="menuitem" data-act="copyfwd" data-id="' + m2.id + '">' + ic.cal + 'Copy forward</button><p class="hint2">Past meals are read only: no delete, move or Not cooking.</p>';
    else if (!lock) items += '<button class="it" role="menuitem" data-act="replan" data-id="' + m2.id + '">' + ic.swap + 'Replan</button><button class="it" role="menuitem" data-act="moveto" data-id="' + m2.id + '">' + ic.cal + 'Move to another day</button><button class="it" role="menuitem" data-act="nocook" data-id="' + m2.id + '">' + ic.moon + 'Not cooking</button>';
    return '<div class="scrim2" data-closea></div><div class="asheet" role="menu" aria-label="Actions for ' + esc(m2.t) + '"><h2>' + esc(m2.t) + '</h2>' + items + '</div>';
  }
  function nav() {
    var n = function (l, d, on, shop) { return '<button class="nv' + (on ? ' on' : '') + '"' + (shop ? ' data-shop aria-haspopup="dialog" aria-label="Shopping list, ' + shopCount() + ' lines"' : ' tabindex="-1"') + '>' + (shop ? '<i class="nb">' + shopCount() + '</i>' : '') + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>' + l + '</button>'; };
    return '<nav class="nav" aria-label="Kitchie">' + n('Home', '<path d="M4 11l8-7 8 7v9H4z"/>') + n('Pantry', '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 9h12"/>') + n('Plan', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', 1) + n('Recipes', '<path d="M6 14a4 4 0 1 1 2-7 4 4 0 0 1 8 0 4 4 0 1 1 2 7v5H6z"/>') + n('Shopping', '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12h11l2-8H6"/>', 0, 1) + '</nav>';
  }
  function carryBar() { if (!S.carry || S.carry.drag) return ''; var m = S.carry; return '<div class="carry" role="status"><span class="em">' + m.em + '</span><div><b>' + esc(m.t) + '</b><small>In hand. Tap a day to drop it here.</small></div><button data-cancelcarry>Cancel</button></div>'; }
  function optionsPanel() {
    var g = function (k, lab, vals) { return '<fieldset><legend>' + lab + '</legend>' + vals.map(function (v) { return '<label><input type="radio" name="' + k + '" value="' + v[0] + '"' + (S[k] === v[0] ? ' checked' : '') + '> ' + v[1] + '</label>'; }).join('') + '</fieldset>'; };
    if (!(window.top === window || q.get('opts') === '1')) return '';
    return '<button class="optfab" data-opts aria-expanded="' + S.opts + '">Mockup options</button>' + (S.opts ? '<div class="optpanel" role="dialog" aria-label="Mockup options"><p class="onote">Mockup-only switch. It is not part of the app.</p>' +
      g('ws', 'Week header and bulk actions (159 to 177, owner 13 Oct)', [['actions', 'Nights, moon and open-box indicators on the label row; Add to buy and Reserve below only when they apply, counts inside (recommended)'], ['bare', 'The same, no counts inside the buttons'], ['counts', 'Old passive counts and highlight filter, no indicators (superseded, for comparison)']]) + g('rs', 'Reserve and Release when some meals are held (173, Proposal)', [['all', 'Reserve with the not-yet-held count; Release only when all are held (recommended)'], ['both', 'Both buttons'], ['any', 'Release as soon as anything is held']]) + g('rb', 'Day ribbon (136, owner 13 Oct)', [['detail', 'Only while a detail is open (recommended)'], ['always', 'Always on, week view too (superseded 13 Oct, for comparison)']]) + g('tear', 'Torn-paper edge, top and bottom only (158, owner 13 Oct)', [['all', 'On every lift-and-drag, agenda and detail, top and bottom edges only (recommended)'], ['detail', 'Only on the tile pulled out of the docked detail (142, superseded, for comparison)']]) + g('gap', 'Collapsed Not cooking gap (157, 178, owner 13 Oct)', [['ecg', 'ECG marker at the start of the divider line, only where Not cooking days are hidden: tap opens every hidden day in the gap; opened days have no marker and fold back when you scroll on (157, 178; recommended)'], ['off', 'No marker, the peek at the edge only (96)']]) + g('lay', 'Layout', [['rib', 'Agenda across five weeks: last week, this week and three more (197; recommended)'], ['focus', 'One day at a time (keeps the ribbon)']]) + g('hd', 'Header while a detail is open (91, revised by 136)', [['shrink', 'Compact (recommended)'], ['fixed', 'Full size']]) + g('f', 'Who filter (97)', [['drop', 'One dropdown (recommended)'], ['seg', 'Mine / Household + People dropdown'], ['strip', 'Old chips behind a chevron']]) +
      g('pc', 'Number of people in the detail (98)', [['step', 'Stepper − 4 +'], ['drop', 'Dropdown']]) + g('nc', 'Not cooking days (93)', [['hide', 'Hidden, peek at the edge (recommended)'], ['show', 'Always shown']]) + g('u', 'Undo on a phone (101)', [['day', 'On the changed day (recommended)'], ['flip', 'Copy button flips to Undo'], ['banner', 'Banner under the ribbon'], ['pill', 'Pill under the ribbon']]) +
      g('dt', 'Meal detail (103, 107)', [['stack', 'Day on top, detail at the bottom, one locked stack (recommended)'], ['peek', 'Docked, neighbours peek'], ['strip', 'Docked, other days as one line each'], ['hide', 'Docked, other days hidden'], ['sheet', 'Two-stop bottom sheet (comparison)']]) + g('st', 'Status (121, supersedes 104)', [['plain', 'Plain red or green, no count (owner, 13 Oct)'], ['labels', 'a Labelled chips: rejected'], ['badge', 'b Icon + count: rejected'], ['edge', 'c Edge strip + dot: rejected'], ['progress', 'd Progress: rejected']]) + g('gr', 'Green means (122, open)', [['list', 'Dealt with: every missing item is on the list (recommended)'], ['hand', 'Everything is on hand']]) + g('hdl', 'Grey bar on the tab (128)', [['none', 'Removed (recommended)'], ['light', 'Much lighter']]) + g('jig', 'Wiggle hint (129)', [['', 'First 3 opens, 7 days, stops after a drag'], ['1', 'Always, for review'], ['0', 'Off'], ['reset', 'Reset the stored count']]) +
      g('cu', 'Ask AI to plan this curtain (96)', [['start', 'At the start of an empty week (default)'], ['idle', 'Idle, whole week empty'], ['off', 'Off']]) + g('od', 'Open day in the week (147, owner 13 Oct)', [['dash', 'UAT dashed box, no words, right swipe for Not cooking; a tap opens the light card with Ask AI and Surprise me only, not a big empty detail (183, 187; recommended)'], ['text', 'Quiet "Open night" words (125, for comparison)']]) + g('sw', 'Swipe', [['tint', 'Tinted reveal, commits'], ['buttons', 'Buttons stay open']]) + g('cs', 'Clear week and a household meal (203, confirmed by the owner in 211)', [['own', 'Mine clears only meals that are in my own plan; Household clears the household\'s meals, named subsets included (confirmed)'], ['visible', 'Each clears every meal its view shows, shared ones included (the other reading, for comparison)']]) + g('ba', 'Bulk Hold and Add (134, open; Mine and Household only, never another person\'s plan, 206)', [['bar', 'Bottom bar only: Hold N, cart Add N (current)'], ['list', 'In the list only: Add all on the missing group, Hold all on the on-hand group'], ['both', 'Both']]) + g('long', 'Long ingredient list (107 demo)', [['0', 'Normal'], ['1', 'Long: 21 lines, the sheet scrolls']]) + '</div>' : '');
  }

  /* ---------- render ---------- */
  function focusHtml() { var d = S.cur, ms = on(d), i = di(d), buy = [], ubn = []; ms.forEach(function (m) { m.miss.forEach(function (x) { buy.push(x[0]); }); m.useby.forEach(function (u) { ubn.push(u[0] + ' by ' + u[1]); }); });
      return '<h2 class="fh">' + dLong(d) + ' ' + info(d).n + ' ' + info(d).mo + (d === S.today ? ' <em>Today</em>' : '') + '</h2>' + (ms.length ? '<div class="prep"><b>Before this night</b>' + (buy.length ? '<span class="m">Buy: ' + esc(buy.join(', ')) + '</span>' : '<span>Nothing to buy</span>') + (ubn.length ? '<span>Use first: ' + esc(ubn.join(', ')) + '</span>' : '') + '</div>' : '') + '<section class="pw-day' + (S.carry && !past(d) ? ' target' : '') + '" data-d="' + d + '" id="d-' + d + '" style="padding-top:0">' + noteHtml(d) + '<div class="pw-stack">' + dayBody(d) + '</div></section><div class="dnav"><button data-step="-1"' + (i > 0 ? '' : ' disabled') + '>' + ic.left + ' ' + (i > 0 ? RIB[i - 1].dow : '') + '</button><button data-step="1"' + (i < DI.length - 1 ? '' : ' disabled') + '>' + (i < DI.length - 1 ? RIB[i + 1].dow : '') + ' ' + ic.right + '</button></div>'; }
  function body() {
    if (S.dt === 'stack' && !S.sel && S.dday) { var dm = on(S.dday); if (dm.length) { S.sel = dm[0].id; S.dday = null; } else if (isLite()) return liteHtml(S.dday) + (S.lay === 'focus' ? focusHtml() : agenda()); else return stackEmptyHtml(S.dday); }
    if (S.sel && S.dt !== 'sheet' && find(S.sel)) return S.dt === 'stack' ? stackHtml(find(S.sel)) : dockHtml(find(S.sel));
    if (S.lay === 'focus') return focusHtml();
    return agenda();
  }
  function render(keep) {
    var sy = window.scrollY, rb = document.getElementById('rib'), rl = rb ? rb.scrollLeft : null, gh = null;
    /* 136: the ribbon comes and goes with the detail. It fades in (and a copy of it fades out) over 0.2 s; the stack's slot is placed for the final header height at once, so nothing under it moves. Reduced motion: none. */
    if (rb && !REDUCE) { var gr = rb.getBoundingClientRect(); gh = rb.cloneNode(true); gh.removeAttribute('id'); gh.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); }); gh.classList.add('rib-ghost'); gh.setAttribute('aria-hidden', 'true'); gh.style.cssText = 'top:' + gr.top + 'px;left:' + gr.left + 'px;width:' + gr.width + 'px'; gh.scrollLeft = rl; }
    root.innerHTML = '<div class="app' + (S.carry ? ' carrying' : '') + (S.carry && S.carry.drag ? ' dragging' : '') + '">' + header() + '<main id="plan" class="pw">' + body() + '</main></div>' + carryBar() + '<div class="peek t" id="peekT" hidden></div><div class="peek b" id="peekB" hidden></div>' + nav() + '<div class="scrim' + (S.sel && S.dt === 'sheet' ? ' on' : '') + '" data-close></div>' + sheetHtml() + '<div id="aw">' + popHtml() + actionSheet() + '</div>' + optionsPanel();
    sizeStk(); if (keep !== false) window.scrollTo(0, sy);
    var rb2 = document.getElementById('rib'); if (rb2 && rl !== null) rb2.scrollLeft = rl; if (rb2 && !rb && !REDUCE) rb2.classList.add('rib-in'); placeMk(true);
    if (gh && !rb2) { document.body.appendChild(gh); gh.scrollLeft = rl; setTimeout(function () { gh.remove(); }, 230); }
    var sh = document.getElementById('sheet'); if (sh && S.sel && S.dt === 'sheet') requestAnimationFrame(function () { setSnap(S.snap); });
    syncPeek(); syncEcg();
  }
  function sizeStk() { var s = document.getElementById('stk'), p = document.getElementById('stkp'); if (!s || !p) return; document.documentElement.style.setProperty('--sth', s.offsetHeight + 'px'); var c = s.classList.contains('cmp'); s.classList.remove('cmp'); p.style.height = s.offsetHeight + 'px'; if (c) s.classList.add('cmp'); }
  function stkH() { var s = document.getElementById('stk'); return s ? s.offsetHeight : 120; }
  function placeMk(instant) {
    var rb = document.getElementById('rib'), mk = document.getElementById('mk'), c = rb && rb.querySelector('.dy[data-dy="' + S.cur + '"]'); if (!c || !mk) return;
    if (instant) mk.style.transition = 'none'; mk.style.width = (c.offsetWidth - 6) + 'px'; mk.style.height = c.offsetHeight + 'px'; mk.style.transform = 'translate(' + (c.offsetLeft + 3) + 'px,0)'; if (instant) { void mk.offsetWidth; mk.style.transition = ''; }
    if (!ribTouch) rb.scrollTo({ left: Math.max(0, c.offsetLeft - (rb.clientWidth - c.offsetWidth) / 2), behavior: instant ? 'auto' : 'smooth' });
  }
  var ribTouch = false;

  /* ---------- notes and undo (no bottom snackbar: owner did not like it) ---------- */
  var noteT;
  function note(msg, o) { o = o || {}; S.note = { msg: msg, short: o.short, undo: !!o.undo, day: o.day, kind: o.kind || '', id: ++nid }; clearTimeout(noteT); var id = S.note.id; noteT = setTimeout(function () { if (S.note && S.note.id === id) { S.note = null; render(); } }, o.ms || UW); }
  function snapshot() { return JSON.stringify({ m: S.meals, b: S.blocked, o: S.bown, bt: S.bought, sel: S.sel, dd: S.dday }); }
  function mutate(fn, msg, day, kind, pulse, short, ms) { var before = snapshot(); fn(); var ue = { k: kind || 'edit', s: before, at: Date.now(), msg: msg, short: short, day: day, ms: ms }; if (S.ux) { ue.wk = S.ux.wk; ue.lab = S.ux.lab; S.ux = null; } S.ustk.push(ue); setTimeout(function expire() { if (S.carry || td) return setTimeout(expire, 1000); pruneU(); render(); }, (ms || UW) + 50); S.pulse = pulse || (day ? [day] : null); note(msg, { undo: 1, day: day, kind: kind, short: short, ms: ms }); render(); if (day && S.lay === 'rib' && !S.sel) ensureVisible(day); if (S.pulse) setTimeout(function () { S.pulse = null; document.querySelectorAll('.pulse').forEach(function (e) { e.classList.remove('pulse'); }); }, 2600); }
  function ensureVisible(d) { var el = document.getElementById('d-' + d); if (!el) return; var r = el.getBoundingClientRect(), top = stkH() + 8; if (r.top < top || r.top > innerHeight - 220) { lockUntil = Date.now() + 700; window.scrollBy({ top: r.top - top - 4, behavior: 'smooth' }); } }
  function doUndo() { var u = topU(); if (!u) return; S.ustk.pop(); var o = JSON.parse(u.s); S.meals = o.m; S.blocked = o.b; S.bown = o.o || {}; S.bought = o.bt || {}; S.sel = o.sel; S.dday = o.dd || null; S.pulse = null; var nx = topU(); note('Undid ' + (ULAB[u.k] || 'change') + (nx ? '. Next undo: ' + ULAB[nx.k] : ''), { day: u.day }); render(); evalCurtain(); }
  function nextId(b) { return b + '-' + (++nid); }

  function act(a, id) {
    var m = find(id); if (!m) return;
    if (a === 'open') return openDetail(id);
    /* Decision 127: Open recipe is a real action. Meals with a sample recipe page in this mockup (recipe/detail.html) navigate there; any other is a clearly marked stub (open question). */
    if (a === 'recipe') { S.asheet = null; if (m.rid) { location.href = '../../recipe/detail.html?id=' + m.rid + '&from=plan'; return; } note(m.src === 'saved' ? 'Stub: this sample meal has no recipe page in the mockup. In the app this opens its recipe in Recipes.' : 'Made up by your AI, so it is not a saved recipe and has no recipe page. In the app this action would be absent or offer to save it.', { day: m.day }); return render(); }
    /* Plan UI review 206 (owner-stated, 13 Oct 2026: "Just leave it. It's up to them to do their own planning."): another person's plan is view only, no exceptions. This replaces 204's "can hold and add": Hold, Release and Add stop at ro() like everything else (the H and L keys end here too). */
    if (a === 'copyfwd') { if (ro()) return; S.asheet = null; S.pickd = id; S.sel = null; return render(); }
    if (a === 'hold') { if (ro() || past(m.day)) return; m.held = m.held ? 0 : 1; S.asheet = null; note(m.held ? 'Holding the ingredients' : 'Hold released'); return render(); }
    if (a === 'list') { if (ro() || past(m.day)) return; var un = unlisted(m).length; if (!un) return; return mutate(function () { m.miss = m.miss.map(function (x) { return [x[0], x[1], 1]; }); m.list = m.miss.length; S.asheet = null; }, 'Added ' + un + (un === 1 ? ' item' : ' items') + ' to the shopping list', m.day); }
    if (ro() || past(m.day)) return;
    if (a === 'moveto') { S.asheet = null; S.pickd = id; S.pickMove = true; S.sel = null; return render(); }
    var nm = esc(m.t), dn = info(m.day).dow, rn = [holdNote([m]), cartNote([m])].filter(Boolean).join(' ');
    /* owner, 14 Oct 2026: a hold never blocks anything, and replanning a held meal lets the hold go entirely (the held ingredients are released); Replan also takes the meal's own amounts off the shopping list while they are unbought */
    mutate(function () { S.meals = S.meals.filter(function (x) { return x.id !== id; }); if (S.sel === id) S.sel = null; S.asheet = null; if (a === 'nocook') { setMark(m.day); S.revealed = m.day; } }, (a === 'nocook' ? nm + ' removed. ' + dn + ' is Not cooking' : nm + ' removed. ' + dn + ' is an open night') + (rn ? '. ' + rn : ''), m.day);
  }
  /* Decision 129 (owner: "for the first week, this is part of training the user. For a few days, you can kind of make it jiggle so that people know"): the instruction line is gone; the draggable tile wiggles once when
     the detail opens. RECOMMENDED rule (his wording was loose): the first 3 opens within 7 days of the first one, and never again after the first successful drag. Stored per browser (localStorage; if blocked it just
     shows the first 3 times per page load). ?jig=1 forces it every time, ?jig=0 turns it off, ?jig=reset clears the count. prefers-reduced-motion: no movement, a still lift for the same moment. */
  var JK = 'kitchie.plan.jiggle';
  function jget() { try { return JSON.parse(localStorage.getItem(JK)) || {}; } catch (e) { return {}; } }
  function jset(o) { try { localStorage.setItem(JK, JSON.stringify(o)); } catch (e) { } }
  if (S.jig === 'reset') { try { localStorage.removeItem(JK); } catch (e) { } S.jig = ''; }
  function jigStart(m) {
    S.jigOn = false; if (S.dt !== 'stack' || !m || lockEdit(m) || S.jig === '0') return;
    if (S.jig !== '1') { var j = jget(); if (j.done || (j.first && Date.now() - j.first > 7 * 864e5) || (j.opens || 0) >= 3) return; j.opens = (j.opens || 0) + 1; j.first = j.first || Date.now(); jset(j); }
    S.jigOn = true; setTimeout(function () { S.jigOn = false; }, 150);
  }
  function jigDone() { if (S.jig === '1') return; var j = jget(); j.done = true; jset(j); }
  function openDetail(id) { var m = find(id); if (!m) return; jigStart(m); S.sel = id; S.dday = null; S.pop = null; S.asheet = null; S.cur = m.day; S.snap = 'half'; if (S.dt === 'stack' && S.hd === 'shrink') S.cmp = true; render(false); if (S.dt !== 'sheet') window.scrollTo(0, 0); }
  /* Decision 125, refined by 183 (owner-stated, 13 Oct 2026): tapping an open night on the week opens the same light card as a Not cooking day (Ask AI, Surprise me only, 187), never a big empty detail. */
  function openDay(d) { var lite = S.dt === 'stack' && liteDay(d); S.dday = d; S.sel = null; S.cur = d; S.revealed = d; S.pop = null; S.asheet = null; if (S.hd === 'shrink') S.cmp = true; if (lite) { render(); placeLite(d); } else { render(false); window.scrollTo(0, 0); } }
  /* Plan UI review 151 to 153 (owner-stated bug, 13 Oct 2026: "Clicking on the Not cooking tile brings up Surprise me and Ask AI options which then disappears").
     Cause found: (1) in the plain week the tile reopened the night but showed a quiet "Open night" only, so the options existed in one place (the docked detail) and not the other, and the next move on, a scroll, hid the day again; (2) in the docked detail the tile and the options sit in the same spot, with Not cooking the third button, so a second touch landing there (a double tap, a bounce) marked the day Not cooking again and the options vanished with it. Fix: a tap on the Not cooking tile (week or detail) reopens the night AND docks that day's detail, which stays until the person closes it, taps another day or acts (nothing on a timer or a scroll closes it); the opposite toggle on the same day is ignored for TOGGLE_GUARD ms. */
  var TOGGLE_GUARD = 450, tgDay = null, tgAt = 0;
  function guarded(d) { return tgDay === d && Date.now() - tgAt < TOGGLE_GUARD; }
  /* Plan UI review 203: a Not cooking change remembers which scope made it (mine or household), so Clear week can clear only its own scope's changes. Opening a usual day off for this week is an override too; opening a one-off mark leaves nothing behind. */
  function setMark(d) { S.blocked[d] = 'once'; S.bown[d] = P.scopeOf(S.view); }
  function openMark(d) { if (S.blocked[d] === 'usual') S.bown[d] = P.scopeOf(S.view); else delete S.bown[d]; delete S.blocked[d]; }
  function block(d, ms) { if (guarded(d)) return; tgDay = d; tgAt = Date.now(); mutate(function () { setMark(d); delete S.xp[d]; S.cur = d; S.revealed = d; }, dName(d) + ' is Not cooking (this week only)', d, undefined, undefined, undefined, ms); }
  /* 154: Mark as open (and a tile tap in the variants without a per-day detail) turns the night back into an open night. From the light panel the panel closes and the week is back on that day, with the Undo in place; the open night's own detail is one tap away. */
  function unblock(d) { if (guarded(d)) return; tgDay = d; tgAt = Date.now(); var lite = isLite() && S.dday === d; var us = S.blocked[d] === 'usual'; mutate(function () { openMark(d); delete S.xp[d]; if (lite) { S.dday = null; S.sel = null; S.cur = d; S.revealed = d; S.pop = null; } }, dName(d) + (us ? ' is open this week only. The usual day off stays' : ' is open again'), d); if (lite) { var el = document.getElementById('d-' + d); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - stkH() - 6); syncHead(); } }
  function placeLite(d) { var el = document.getElementById('d-' + d), pn = document.getElementById('lite'); if (!el || !pn) return; var r = el.getBoundingClientRect(), lim = stkH() + pn.offsetHeight + 12; window.scrollBy(0, r.top - lim - 4); }
  /* Surprise me (decision 292): the Home cooking-ideas engine; P.surprise returns the top idea or null. */
  function surprise(d) {
    var c = P.surprise(S.meals, d, S.today); if (!c) return note('Nothing fits from what is in. Try Ask AI.');
    var nm = c; nm.id = nextId('sur'); nm.day = d; nm.who = S.view === 'mine' ? ['sam'] : 'all'; nm.n = S.view === 'mine' ? 1 : 4; nm.src = 'surprise'; nm.note = ''; nm.held = 0; nm.useby = nm.useby || []; nm.whyk = P.whyKey(nm);
    mutate(function () { S.meals.push(nm); openMark(d); }, 'Surprise: ' + esc(c.t) + ' for ' + dName(d), d);
  }
  function copyLast() {
    var wk = weekOf(S.cur), r = P.copyLast(S.meals, S.blocked, S.view, wk, S.today); if (r.why === 'readonly' || r.why === 'bounds') return;
    if (!r.add.length) { note('Nothing to fill: every open night already has a plan, or is Not cooking.', { day: S.cur }); return render(); }
    var days = r.days, from = wk - 1 === 0 ? 'this week' : 'last week';
    mutate(function () { S.meals = S.meals.concat(r.add); }, 'Copied ' + days.length + (days.length === 1 ? ' night' : ' nights') + ' from ' + from + ' (' + (S.view === 'mine' ? 'my plan' : 'household plan') + '). Open nights only', days[0], 'copy', days, 'Copied ' + days.length + (days.length === 1 ? ' night' : ' nights'));
    if (S.u === 'day' || S.u === 'flip') goDay(days[0], true);
  }
  /* Clear week (decisions 109, 195): the same scope as Copy last week (the active person's own plan, the week in view, from today on, never another person's plan or a past night). Owner-stated 13 Oct 2026: it clears "only the planned meals", and "if they have overridden their routine,
     they should clear that". So it removes the planned meals AND this week's overrides of the routine: a one-off Not cooking mark goes, a usual day off that was opened for this week goes back to Not cooking every week. The routine itself (the usual days off set in Plan settings) is never touched.
     No confirm because Undo is one tap, but never silent: the changed day says what went, and the header button is Undo in place. */
  function clearWeek() {
    var wk = weekOf(S.cur), r = P.clearWeek2(S.meals, S.blocked, S.view, wk, S.today, S.bown, S.cs);
    if (r.why === 'readonly' || r.why === 'bounds') return render();
    var mine = r.scope === 'mine';
    if (r.why === 'none') { note(mine ? 'Nothing of mine to clear from today on.' : 'Nothing to clear from today on.', { day: S.cur }); return render(); }
    var nm = r.rm.length, no = r.nc.length, bk = r.back.length, a = info(r.days[0]), b = info(r.days[r.days.length - 1]), scope = mine ? 'my plan' : 'household plan', ml = nm + (nm === 1 ? ' meal' : ' meals');
    /* 203 (Proposal): what stays because it belongs to the other scope is said quietly at the end. */
    var stay = r.keep ? ' ' + r.keep + (mine ? ' household ' : ' personal ') + (r.keep === 1 ? 'meal stays.' : 'meals stay.') : '';
    var msg = 'Cleared ' + (nm ? ml + (no + bk ? ' and ' : '') : '') + (no + bk ? (no + bk) + ' Not cooking ' + (no + bk === 1 ? 'change' : 'changes') + ' (' + [no ? no + (no === 1 ? ' mark removed' : ' marks removed') : '', bk ? bk + (bk === 1 ? ' usual day' : ' usual days') + ' back to Not cooking' : ''].filter(Boolean).join(', ') + ')' : '') + ', ' + a.dow + ' ' + a.n + (r.days.length > 1 ? ' to ' + b.dow + ' ' + b.n : '') + ' (' + scope + '). Usual days off stay.' + stay + (function () { var g = S.meals.filter(function (x) { return r.rm.indexOf(x.id) > -1; }), c = [holdNote(g), cartNote(g)].filter(Boolean).join(' '); return c ? ' ' + c : ''; })();
    var short = (mine ? 'Mine' : 'Household') + ': cleared ' + (nm ? ml : '') + (nm && no + bk ? ' and ' : '') + (no + bk ? (no + bk) + (no + bk === 1 ? ' change' : ' changes') : '');
    S.ux = { lab: 'clear, ' + (mine ? 'mine' : 'household') };
    mutate(function () { S.meals = S.meals.filter(function (x) { return r.rm.indexOf(x.id) < 0; }); r.nc.forEach(function (d) { delete S.blocked[d]; delete S.bown[d]; }); r.back.forEach(function (d) { S.blocked[d] = 'usual'; delete S.bown[d]; }); if (S.sel && r.rm.indexOf(S.sel) > -1) S.sel = null; }, msg, r.days[0], 'clear', r.days, short);
    evalCurtain(); if (S.lay === 'rib' && !S.sel) setTimeout(function () { ensureVisible(r.days[0]); }, 450); /* the Ask AI curtain may have just grown the header over the note */
  }
  function startCarry(id, d) { var m = find(id); S.carry = JSON.parse(JSON.stringify(m)); if (S.pickMove) { S.carry.move = true; S.carry.from = id; } S.pickMove = false; S.pickd = null; S.sel = null; S.cur = d; render(); goDay(d, true); }
  function drop(d) {
    if (!S.carry || past(d)) return;
    var src = S.carry, mv = !!src.move; if (src.drag) jigDone();
    if (mv && d === src.day) { S.carry = null; note('Not moved. ' + esc(src.t) + ' stays on ' + dName(d), { day: d }); return render(); }
    var ms = S.meals.filter(function (x) { return x.day === d && P.match(x, S.view) && (!mv || x.id !== src.from); }), wasNc = S.blocked[d], c = JSON.parse(JSON.stringify(src));
    delete c.move; delete c.from; delete c.drag;
    if (mv) c.day = d; else { c.id = nextId('cf'); c.day = d; c.note = 'Copied from ' + dName(src.day); c.held = 0; c.list = 0; c.miss = c.miss.map(function (i) { return [i[0], i[1]]; }); delete c.left; delete c.makes; delete c.usual; }
    var homeLeft = mv ? S.meals.filter(function (x) { return x.day === src.day && x.id !== src.from && P.match(x, S.view); }).length : 1;
    var msg = ms.length ? 'Replaced ' + esc(ms[0].t) + ' with ' + esc(c.t) : wasNc ? esc(c.t) + (mv ? ' moved to ' : ' dropped. ') + (mv ? dName(d) + '. ' + info(d).dow + ' is a cooking day now' : dName(d) + ' is a cooking day now') : mv ? esc(c.t) + ' moved to ' + dName(d) : esc(c.t) + ' dropped on ' + dName(d);
    if (mv && !homeLeft) msg += '. ' + info(src.day).dow + ' is an open night now';
    S.carry = null;
    mutate(function () { if (mv) S.meals = S.meals.filter(function (x) { return x.id !== src.from; }); if (ms.length) { var rid = ms[0].id; S.meals = S.meals.filter(function (x) { return x.id !== rid; }); } openMark(d); S.meals.unshift(c); S.cur = d; }, msg, d, mv ? 'move' : 'drop', mv ? [d, src.day] : [d]);
  }

  /* ---------- navigation: continuous ribbon, scroll-linked ---------- */
  var lockUntil = 0;
  function goDay(d, quiet) {
    if (S.dt === 'stack' && (S.sel || S.dday)) return swapDock(d);
    S.cur = d; S.revealed = d; if (S.sel && S.dt !== 'sheet') { S.sel = null; render(false); }
    var el = document.getElementById('d-' + d); if (!el) { render(false); el = document.getElementById('d-' + d); } if (!el) return;
    if (S.lay === 'focus') { render(false); window.scrollTo(0, 0); return; }
    if (el.classList.contains('hid')) { el.classList.remove('hid'); syncEcg(); }
    var y = el.getBoundingClientRect().top + window.scrollY, cmpH = 64, full = document.getElementById('stkp').offsetHeight, go = S.hd === 'shrink' && ribOn() && y - full > 40 && !(S.note && S.u === 'flip' && S.note.undo);
    S.cmp = go; document.getElementById('stk').classList.toggle('cmp', go && ribOn()); lockUntil = Date.now() + 800;
    window.scrollTo({ top: Math.max(0, y - (go ? stkH() : full) - 6), behavior: REDUCE ? 'auto' : 'smooth' }); syncHead(); setTimeout(function () { var e2 = document.getElementById('d-' + d); if (e2 && !S.sel) { var want = e2.getBoundingClientRect().top - (document.getElementById('stk').getBoundingClientRect().bottom + 6); if (Math.abs(want) > 12) window.scrollBy(0, want); } follow(true); }, REDUCE ? 120 : 850);
  }
  /* Decision 115: with the stack open a tap on the ribbon keeps the slot where it is and swaps only what is in it: that day's first meal and its detail, or its open-night, Not cooking or past state. */
  function swapDock(d) {
    var ms = on(d), keep = S.sel && find(S.sel) && find(S.sel).day === d ? find(S.sel) : ms[0];
    S.jigOn = false; if (S.jig === '1') jigStart(keep);
    S.cur = d; S.revealed = d; S.pop = null; S.asheet = null; S.snap = 'half'; S.sel = keep ? keep.id : null; S.dday = keep ? null : d; S.swap = true;
    render(false); S.swap = false; if (isLite()) placeLite(d);
    var sb = document.querySelector('.stackw'); if (sb) { sb.classList.add('swapped'); setTimeout(function () { sb.classList.remove('swapped'); }, 400); }
  }
  /* Plan UI review 193 (owner-stated, 13 Oct 2026: "There's a Today button. I don't need a Today button specifically ... If somebody does a long hold on the week [label] at the top left, long hold on that is just going to today ... So just taking clutter off."):
     the Today pill is gone. Press and hold the "Week of ..." label LABEL_HOLD_MS (Proposal: 500 ms, a little longer than the tile lift because nothing here should fire by accident; more than HOLD_SLOP px of movement, or a scroll (pointercancel), cancels) and the plan jumps to today,
     the ribbon and the agenda together, and the label pulses once (no toast). No visible hint (the owner's standing no-gesture-hints rule). For keys and screen readers: T jumps to today, and pressing Enter or Space on the focused label does the same (a click with no pointer behind it);
     a plain tap or click on the label has no meaning yet (open question: UAT's week title taps to next week, and a date picker is the other candidate). */
  var LABEL_HOLD_MS = 500, lbl = null;
  /* Plan UI review 202 (owner-stated, 13 Oct 2026: "Long hold - make list move to today"): the long hold moves the LIST to today, not only the header and the ribbon. goDay scrolls (smooth, or instant with reduced motion) and follow() then re-reads the header; on a phone a scroll that is still gliding, a header that
     changes height when the Ask AI curtain comes or goes, or an open sheet can leave the list short, so after the jump the page is checked again (four times in about 2.4 s) and nudged until today's row is just under the header, unless the person has touched or scrolled since. An open two-stop sheet (?dt=sheet) is closed first (it sits over the list).
     With a detail docked the docked day swaps to today (the list is behind the stack) and closing the detail lands on today. A plain tap or click on the label still means nothing (the owner gave it no other meaning). */
  var userAt = 0; ['touchstart', 'wheel', 'keydown'].forEach(function (t) { document.addEventListener(t, function () { userAt = Date.now(); }, { passive: true, capture: true }); });
  function settleToday() {
    var t0 = Date.now(); [450, 950, 1600, 2400].forEach(function (ms) { setTimeout(function () {
      if (userAt > t0 || S.sel || S.dday || S.carry || S.lay === 'focus') return;
      var el = document.getElementById('d-' + S.today), stk = document.getElementById('stk'); if (!el || !stk) return;
      var want = el.getBoundingClientRect().top - (stk.getBoundingClientRect().bottom + 6);
      if (Math.abs(want) > 10) { lockUntil = Date.now() + 400; window.scrollBy({ top: want, behavior: 'auto' }); follow(true); }
    }, REDUCE ? Math.round(ms / 3) : ms); });
  }
  function goToday() { if (S.sel && S.dt === 'sheet') { S.sel = null; render(false); } goDay(S.today); settleToday(); var b = document.getElementById('wkt'); if (b) { b.classList.remove('wkl-pulse'); void b.offsetWidth; b.classList.add('wkl-pulse'); setTimeout(function () { var x = document.getElementById('wkt'); if (x) x.classList.remove('wkl-pulse'); }, 1500); } }
  function lblEnd() { if (!lbl) return; clearTimeout(lbl.t); lbl.b.classList.remove('arm'); lbl = null; }
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('[data-wkl]'); lblEnd(); if (!b || (e.pointerType === 'mouse' && e.button !== 0)) return;
    lbl = { b: b, x: e.clientX, y: e.clientY, pid: e.pointerId }; b.classList.add('arm');
    lbl.t = setTimeout(function () { if (!lbl) return; lbl.b.classList.remove('arm'); lbl = null; supp = Date.now() + 500; try { if (navigator.vibrate) navigator.vibrate(8); } catch (z) { } goToday(); }, LABEL_HOLD_MS);
  });
  document.addEventListener('pointermove', function (e) { if (lbl && e.pointerId === lbl.pid && Math.hypot(e.clientX - lbl.x, e.clientY - lbl.y) > HOLD_SLOP) lblEnd(); });
  document.addEventListener('pointerup', lblEnd); document.addEventListener('pointercancel', lblEnd);
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('[data-wkl]')) e.preventDefault(); });
  /* Plan UI review 191 (owner-stated, 13 Oct 2026: "tapping that moon number should jump to the first Not cooking night; the dashed box to the first open night ... Yeah, I like that"): the two counts on a week's label row are real buttons. A tap goes to the first matching night of THAT week
     from today on (the same set the count counts: past nights are never counted, Not cooking is any mark, open follows the person filter), then pulses it once. Not cooking nights are collapsed, so the target is opened (goDay does it). Always the first, as he said; there is no "next one" on a second tap
     (the label row has scrolled out of sight by then, so a second tap never lands on the same row). */
  function nightsOf(kind, wk) { return RIB.filter(function (r) { return r.wk === wk && !past(r.id) && (kind === 'nc' ? !!S.blocked[r.id] : !S.blocked[r.id] && !on(r.id).length); }).map(function (r) { return r.id; }); }
  function jumpTo(kind, wk) {
    var ds = nightsOf(kind, wk); if (!ds.length) return; var d = ds[0];
    goDay(d); setTimeout(function () { var el = document.getElementById('d-' + d); if (!el) return; el.classList.add('pulse'); setTimeout(function () { el.classList.remove('pulse'); }, 2600); }, REDUCE ? 60 : 650);
  }
  function syncHead() {
    var r = info(S.cur), t = document.getElementById('wkt'), s = document.getElementById('wks'); /* 193: the Today pill is gone (owner-stated); the label is the way back (long hold, T) */ if (t) t.textContent = 'Week of ' + info(r.mon).n + ' ' + info(r.mon).mo; if (s && !(S.note && S.u === 'flip' && S.note.undo)) s.textContent = P.REL[r.wk];
    document.querySelectorAll('.dy').forEach(function (b) { var o = b.dataset.dy === S.cur; b.classList.toggle('on', o); b.setAttribute('aria-selected', o); }); placeMk(false);
    var cb = document.querySelector('.cpy'); if (cb && !flipKind()) cb.outerHTML = wkCtl();
    evalCurtain();
  }
  var tick = 0, lastY = 0;
  function follow(force) {
    tick = 0; var y = window.scrollY;
    if (S.hd === 'shrink' && ribOn() && !((S.sel || S.dday) && S.dt === 'stack') && !(S.carry && S.carry.drag)) { var s = document.getElementById('stk'); if (s) { if (y > 70 && y > lastY + 4 && !S.cmp && !(S.note && S.u === 'flip')) { S.cmp = true; s.classList.add('cmp'); } else if ((y < lastY - 6 || y < 30) && S.cmp) { S.cmp = false; s.classList.remove('cmp'); } } } lastY = y;
    if (S.lay !== 'rib' || (S.sel || S.dday) && S.dt !== 'sheet') return syncPeek();
    if (!force && Date.now() < lockUntil) return syncPeek();
    var lim = stkH() + 24, cur = DI[0], secs = document.querySelectorAll('.pw-day');
    secs.forEach(function (el) { if (el.classList.contains('hid')) return; if (el.getBoundingClientRect().top <= lim) cur = el.dataset.d; });
    if (S.carry === null && cur !== S.cur) { S.cur = cur; if (S.revealed && S.revealed !== cur) { } syncHead(); }
    settleHidden(); syncPeek();
  }
  function settleHidden() {
    if (S.nc !== 'hide' || S.carry) return;
    Object.keys(S.blocked).forEach(function (d) { var el = document.getElementById('d-' + d); if (!el || el.classList.contains('hid') || d === S.cur || d === S.revealed || xpHeld(d, el)) return; if (S.revealed === d) return; var r = el.getBoundingClientRect(), above = r.bottom <= stkH() + 4, h = el.offsetHeight + parseFloat(getComputedStyle(el).marginBottom || 0); if (r.bottom < 0 || r.top > innerHeight || above || r.top > innerHeight - 64) { el.classList.add('hid'); if (above) window.scrollBy(0, -h); } });
    if (S.revealed && S.revealed !== S.cur) S.revealed = null;
    Object.keys(S.xp).forEach(function (d) { var el = document.getElementById('d-' + d); if (!el || el.classList.contains('hid')) delete S.xp[d]; });
    syncEcg();
  }
  /* Plan UI review 178 (Proposal): a day opened from the marker is held open only while the person is on it: for 1.2 s after the tap (so the open cannot be undone by the scroll it causes), and while focus is inside any opened day (so the days of one gap fold together). After that it follows the peek rule (96) exactly: once it has scrolled out of view it is hidden again and its gap shows the flat marker. */
  function xpHeld(d, el) { var t = S.xp[d]; return !!t && (Date.now() - t < 1200 || Object.keys(S.xp).some(function (k) { var e = document.getElementById('d-' + k); return e && e.contains(document.activeElement); })); }
  /* Plan UI review 157 and 178 (owner-stated, 13 Oct 2026: the first bit of the horizontal divider line carries "a squiggle, like flatlining someone's heart, starts beating, ECG kind of idea, and then goes flat"; tapping it opens what is hidden in that gap, "if multiple days ... it should open up all of them"; then, typed: "ECG for when the cooking is hidden not th other way").
     One small marker at the START of the divider line wherever one or more Not cooking days are collapsed in that gap, and ONLY there. It is a real button. It beats once when its gap first appears and settles into a quiet flat stub; tap opens EVERY hidden day in that gap at once. Opened days carry NO marker (178, reading of his typed line; PR #150's settled-beat close control is removed). They go back to hidden by the peek rule (96) once the person has scrolled on (settleHidden, xpHeld), and then the flat marker is back in the gap.
     Markers are rebuilt from the DOM (the hid class is also set by scrolling, settleHidden) and never drawn while a tile is carried. ?gap=off removes them for comparison. */
  var ecgDone = {}, ECG_BEAT = 'M2 8H9l2-3 2 3h3l1.5 3 3-11 3 14 2-6h3l3-4 3 4H42';
  function ecgBtn(ds) {
    var key = ds.join(','), b = document.createElement('button'), n = ds.length, nm = ds.map(dName).join(', '), t = ecgDone[key];
    b.type = 'button'; b.className = 'ecg' + (!REDUCE && (!t || Date.now() - t < 2300) ? ' beat' : ''); if (!t) ecgDone[key] = Date.now(); b.dataset.ecg = key; b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', 'Show ' + n + ' hidden Not cooking ' + (n === 1 ? 'day' : 'days') + ': ' + nm);
    b.innerHTML = '<svg viewBox="0 0 44 16" aria-hidden="true"><path class="fl" d="M2 8H42"/><path class="bt" pathLength="80" d="' + ECG_BEAT + '"/></svg>'; return b;
  }
  function syncEcg() {
    var pl = document.getElementById('plan'), want = [], old = document.querySelectorAll('.ecg');
    if (pl && S.gap !== 'off' && S.nc === 'hide' && !S.carry && S.lay === 'rib') {
      var run = [];
      Array.prototype.forEach.call(pl.children, function (el) {
        if (el.classList.contains('pw-day') && el.classList.contains('hid')) { run.push(el.dataset.d); return; }
        if (run.length) { want.push([el, run]); run = []; }
      });
      if (run.length) { var es = pl.querySelector('.endsp'); if (es) want.push([es, run]); }
    }
    /* unchanged since the last pass: leave the buttons alone, so a beat in progress is not restarted and focus stays */
    if (old.length === want.length && want.every(function (w, i) { return old[i].parentNode === w[0] && old[i].dataset.ecg === w[1].join(','); })) return;
    old.forEach(function (e) { e.remove(); }); want.forEach(function (w) { w[0].appendChild(ecgBtn(w[1])); });
  }
  function toggleEcg(b) {
    var ds = b.dataset.ecg.split(','), kb = false; try { kb = b.matches(':focus-visible'); } catch (x) { }
    ds.forEach(function (d) { var el = document.getElementById('d-' + d); if (!el) return; S.xp[d] = Date.now(); el.classList.remove('hid'); el.classList.add('xin'); setTimeout(function () { el.classList.remove('xin'); }, 300); });
    syncEcg();
    /* the marker is gone once its days are open: keyboard focus moves to the first opened day, so it is not lost to the page */
    var f = kb && document.querySelector('#d-' + ds[0] + ' .blk'); if (f) f.focus({ preventScroll: true });
  }
  /* a hidden Not cooking day peeks from the edge it scrolls past, then is gone */
  function syncPeek() {
    var t = document.getElementById('peekT'), b = document.getElementById('peekB'); if (!t || !b) return; var top = null, bot = null;
    if (S.lay === 'rib' && !((S.sel || S.dday) && S.dt !== 'sheet')) { var sb = stkH(), nb = innerHeight - 64;
      document.querySelectorAll('.pw-day.hid').forEach(function (el) { var y = el.getBoundingClientRect().top; if (y >= sb && y <= sb + 40) top = { d: el.dataset.d, y: y - 32 }; else if (y <= nb && y >= nb - 40) bot = { d: el.dataset.d, y: y }; }); }
    function set(el, o) { var d = o && o.d; if (o) el.style.top = o.y + 'px'; if (d) { el.hidden = false; el.dataset.peek = d; el.innerHTML = '<button data-peek="' + d + '"><b>' + dName(d) + '</b> Not cooking</button>'; } else el.hidden = true; }
    set(t, top); set(b, bot);
  }
  window.addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(function () { follow(); }); idleReset(true); }, { passive: true });

  /* ---------- Ask AI to plan this: the curtain (decision 96, prototype, not locked) ---------- */
  var cuT, cuAt = 0;
  function cuWeekEmpty() { var wk = weekOf(S.cur), days = RIB.filter(function (r) { return r.wk === wk && !past(r.id); }); return days.length && days.every(function (r) { return !on(r.id).length; }); }
  function cuStartEmpty() { var wk = weekOf(S.cur), days = RIB.filter(function (r) { return r.wk === wk && !past(r.id); }).slice(0, 3); return days.length && days.every(function (r) { return !on(r.id).length; }); }
  function showCurtain(v) { var slot = document.getElementById('cslot'); if (!slot) return; S.cuShown = v; if (v) { cuAt = Date.now(); slot.className = 'cslot in'; slot.innerHTML = '<button class="curtain" data-curtain>' + ic.spark + ' Ask AI to plan this</button>'; } else { slot.className = 'cslot'; slot.innerHTML = ''; } sizeStk(); }
  function evalCurtain() {
    clearTimeout(cuT); if (S.cu === 'off' || S.carry || S.sel || S.dday) return showCurtain(false); var wk = weekOf(S.cur);
    if (S.cuDone[wk]) return S.cuShown && showCurtain(false);
    if (S.cu === 'start') { if (cuStartEmpty()) { if (!S.cuShown) showCurtain(true); } else if (S.cuShown) showCurtain(false); return; }
    if (S.cuShown && !cuWeekEmpty()) showCurtain(false); if (cuWeekEmpty() && !S.cuShown) cuT = setTimeout(function () { if (cuWeekEmpty() && !S.cuDone[weekOf(S.cur)]) showCurtain(true); }, 5000);
  }
  function idleReset(fromScroll) { if (fromScroll && Date.now() - cuAt < 900) return; if (S.cuShown && !(fromScroll && Date.now() - cuAt < 900)) { S.cuDone[weekOf(S.cur)] = true; showCurtain(false); } else if (S.cu === 'idle') evalCurtain(); }

  /* ---------- swipe: pointer events for touch and mouse alike ---------- */
  var drag = null, TH = 88, OPEN = 150;
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest('#rib')) ribTouch = true;
    var od0 = e.target.closest('.od[data-od-b]');
    if (od0 && !S.carry && !(e.pointerType === 'mouse' && e.button !== 0)) { drag = { mc: od0, sw: od0.parentNode, x: e.clientX, y: e.clientY, dx: 0, on: false, id: e.pointerId, base: +(od0.dataset.open || 0), past: true, od: od0.dataset.odB }; return; }
    var mc = e.target.closest('.mc'); if (!mc || S.carry || e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0) || mc.dataset.ro === 'all' || mc.dataset.tile) return;
    drag = { mc: mc, sw: mc.parentNode, x: e.clientX, y: e.clientY, dx: 0, on: false, id: e.pointerId, base: +(mc.dataset.open || 0), past: mc.dataset.ro === 'past' };
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) { if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4) { drag.on = true; drag.mc.classList.add('drag'); try { drag.mc.setPointerCapture(e.pointerId); } catch (x) { } } else if (Math.abs(dy) > 10) { drag = null; return; } else return; }
    var lo = drag.past ? 0 : -OPEN - 20, t = Math.max(lo, Math.min(OPEN + 20, drag.base + dx)); drag.dx = t; drag.mc.style.transform = 'translateX(' + t + 'px)';
    drag.sw.classList.toggle('l', t > 0); drag.sw.classList.toggle('r', t < 0); drag.sw.classList.toggle('ready', Math.abs(t) > TH);
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return; var d = drag; drag = null; if (!d.on) return; d.mc.classList.remove('drag'); d.mc.dataset.moved = '1'; setTimeout(function () { delete d.mc.dataset.moved; }, 50);
    var id = d.mc.dataset.id, t = d.dx, right = d.od ? 'odblock' : d.past ? 'copyfwd' : 'nocook';
    if (d.od) { /* Plan UI review 148: a right swipe on the dashed open day sets Not cooking; there is no left action */
      if (S.sw === 'tint') { if (t > TH) return block(d.od, UNDO_NC_MS); d.mc.style.transform = ''; d.sw.classList.remove('l', 'r', 'ready'); return; }
      var to0 = t > TH / 2 ? OPEN : 0; d.mc.style.transform = to0 ? 'translateX(' + to0 + 'px)' : ''; d.mc.dataset.open = to0; if (!to0) d.sw.classList.remove('l', 'ready'); else { d.sw.classList.add('l'); d.sw.dataset.id = d.od; d.sw.dataset.right = right; } return; }
    if (S.sw === 'tint') { if (t > TH) return act(right, id); if (t < -TH) return act('replan', id); d.mc.style.transform = ''; d.sw.classList.remove('l', 'r', 'ready'); return; }
    var to = t > TH / 2 ? OPEN : t < -TH / 2 ? -OPEN : 0; d.mc.style.transform = to ? 'translateX(' + to + 'px)' : ''; d.mc.dataset.open = to; if (!to) d.sw.classList.remove('l', 'r', 'ready'); else { d.sw.classList.add(to > 0 ? 'l' : 'r'); d.sw.dataset.id = id; d.sw.dataset.right = right; }
  }
  document.addEventListener('pointerup', function (e) { ribTouch = false; endDrag(e); }); document.addEventListener('pointercancel', function (e) { ribTouch = false; endDrag(e); });
  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.sw.btns');
    var tl = sw && sw.querySelector('.mc,.od');
    if (sw && tl && tl.dataset.open && !e.target.closest('.mc,.od')) { var id = sw.dataset.id, o = +tl.dataset.open; if (sw.dataset.right === 'odblock') return block(id, UNDO_NC_MS); return act(o > 0 ? sw.dataset.right : 'replan', id); }
  }, true);

  /* ---------- decision 108b: start dragging the tile out of the stack and the week plan is back under the finger, tile in hand ---------- */
  var td = null, hand = null, autoT = 0, supp = 0;
  document.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('[data-tile]'); if (!t || e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0) || S.carry) return;
    td = { id: t.dataset.id, x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, pid: e.pointerId, on: false };
  });
  document.addEventListener('pointermove', function (e) {
    if (!td || e.pointerId !== td.pid) return;
    if (!td.on) { if (Math.hypot(e.clientX - td.x, e.clientY - td.y) < 8) return; td.on = true; beginDrag(td.id, e.clientX, e.clientY, e.pointerId); }
    moveHand(e.clientX, e.clientY);
  });
  /* Decisions 142 to 146 (owner-stated 13 Oct 2026, readings are Proposals): ONE carry for every lift-and-shift. o.src is 'detail' (the tile dragged out of the docked stack: the ONLY place the tear is drawn, 142; ?tear=all draws it everywhere, for comparison) or 'agenda' (held and dragged in the plain week view, 144). o.copy is a past tile lifted to copy forward (100 to 102): the original stays, the carry is a copy. */
  var HAND_TILT = -1.5; /* the tilt of a tile in hand, as before 118 (119 keeps it) */
  function beginDrag(id, x, y, pid, o) {
    o = o || {}; var m = find(id); if (!m) return; var mc0 = o.src === 'agenda' ? document.querySelector('.pw-day .mc[data-id="' + id + '"]') : null, y0 = mc0 ? mc0.getBoundingClientRect().top : 0;
    S.carry = JSON.parse(JSON.stringify(m)); if (!o.copy) { S.carry.move = true; S.carry.from = id; } S.carry.drag = true; S.carry.src = o.src || 'detail'; S.sel = null; S.dday = null;
    if (!td) td = { id: id, pid: pid, on: true, x: x, y: y, px: x, py: y }; td.on = true;
    var torn = S.carry.src === 'detail' || S.tear === 'all';
    hand = document.createElement('div'); hand.className = 'hand' + (torn ? ' torn' : ' plain'); hand.id = 'hand'; hand.dataset.src = S.carry.src; hand.innerHTML = '<div class="hand-p"><span class="em">' + m.em + '</span><div><b>' + esc(m.t) + '</b><small>' + (o.copy ? 'copy from ' : 'from ') + dName(m.day) + '</small></div></div>'; tear = torn ? { edge: 'top', on: 0 } : null; document.body.appendChild(hand);
    try { document.body.setPointerCapture(pid); } catch (z) { }
    render(false); S.cur = m.day;
    var el = document.getElementById('d-' + m.day);
    if (o.src === 'agenda') { var mc1 = document.querySelector('.pw-day .mc[data-id="' + id + '"]'); if (mc1 && mc0) window.scrollBy(0, mc1.getBoundingClientRect().top - y0); }
    else if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - stkH() - 4));
    moveHand(x, y); autoT = requestAnimationFrame(auto);
  }
  function moveHand(x, y) { if (!hand) return; td.px = x; td.py = y; tearUpdate(x, y); hand.style.transform = 'translate(' + Math.round(x - hand.offsetWidth / 2) + 'px,' + Math.round(y - hand.offsetHeight - 14) + 'px) rotate(' + HAND_TILT + 'deg)'; hov(x, y); }
  /* Decision 118: the tear. Where the tile leaves the stack its edge is ragged like torn paper; the piece left behind (the dashed place-holder in the week) has the matching ragged edge.
     Cheap: no assets, one clip-path polygon per edge built once from a fixed row of tooth depths; --tz (0 to 1, grows over the first 36 px of the drag) scales the teeth.
     The torn edge is the one that faces where the tile came from (drag down: the tile's top edge, the place-holder's bottom edge). prefers-reduced-motion: full teeth at once, no growth. */
  var tear = null, TD = [2.5, 5.5, 2, 7, 4, 6.5, 1.5, 5, 7, 3, 5.5, 2, 4, 7, 3.5, 5.5, 1.5, 6.5, 4, 7, 3, 5];
  function tearPts(edge, k, n) {
    var pts = [], i, t, v, vr;
    for (i = 0; i < n; i++) { t = (i / (n - 1) * 100).toFixed(1) + '%'; v = 'calc(var(--tz,1)*' + (TD[i % TD.length] * k).toFixed(1) + 'px)'; vr = 'calc(100% - var(--tz,1)*' + (TD[(i * 3 + 1) % TD.length] * k).toFixed(1) + 'px)';
      pts.push(edge === 'top' ? t + ' ' + v : t + ' ' + vr); }
    return pts;
  }
  function tearPoly(edge, k, n) { return 'polygon(' + tearPts(edge, k, n).concat(edge === 'top' ? ['100% 100%', '0 100%'] : ['100% 0', '0 0']).join(',') + ')'; }
  /* the pale fringe of torn fibre along the cut, as a band between the cut line and a smoother line outside it */
  function tearBand(edge, n) { return 'polygon(' + tearPts(edge, 1, n).concat(tearPts(edge, .4, n).reverse()).join(',') + ')'; }
  var OPP = { top: 'bottom', bottom: 'top' };
  function tearUpdate(x, y) {
    if (!tear || !td) return; var dx = x - td.x, dy = y - td.y, dist = Math.hypot(dx, dy), e = tear.edge, ne = dy >= 0 ? 'top' : 'bottom';
    if (Math.abs(dy) > 10 && ne !== e) e = ne; /* 158: only the top and bottom edges tear, never a side: a sideways move keeps the edge it had */
    var tz = REDUCE ? 1 : Math.min(1, dist / 36), ph = document.querySelector('.mc.lifted');
    hand.style.setProperty('--tz', tz.toFixed(2)); if (ph) { ph.style.setProperty('--tz', tz.toFixed(2)); ph.parentNode.style.setProperty('--tz', tz.toFixed(2)); }
    if (e !== tear.on) { var n = 22;
      hand.dataset.tear = e; hand.style.setProperty('--tin', tearPoly(e, 1, n)); hand.style.setProperty('--tfib', tearPoly(e, .5, n));
      if (ph) { var oe = OPP[e], pn = 26; ph.dataset.tear = oe; ph.style.setProperty('--tpl', tearPoly(oe, 1, pn)); ph.parentNode.style.setProperty('--tfp', tearBand(oe, pn)); }
      tear.on = e; tear.edge = e; }
  }
  function secAt(x, y) { var el = document.elementFromPoint(x, y), sec = el && el.closest ? el.closest('.pw-day') : null; return sec && !sec.classList.contains('past') ? sec.dataset.d : null; }
  function hov(x, y) { var d = secAt(x, y), pe = document.elementFromPoint(x, y), ps = pe && pe.closest ? pe.closest('.pw-day.past') : null; document.querySelectorAll('.pw-day.nodrop').forEach(function (e) { if (e !== ps) e.classList.remove('nodrop'); }); if (ps && S.carry) ps.classList.add('nodrop'); document.querySelectorAll('.pw-day.over').forEach(function (e) { if (e.dataset.d !== d) e.classList.remove('over'); }); if (d && S.carry && d !== S.carry.day) { var s = document.getElementById('d-' + d); if (s) s.classList.add('over'); } }
  var AUTO_TOP = 56, AUTO_BOT = 64, AUTO_MAX = 18; /* Proposal (146): the hot zones for edge scrolling while carrying, in px below the header and above the nav, and the top speed in px per frame; speed rises with depth into the zone. */
  function auto() { if (!hand || !td) return; var y = td.py, top = stkH() + AUTO_TOP, bot = innerHeight - 64 - AUTO_BOT; if (y > bot) window.scrollBy(0, Math.min(AUTO_MAX, (y - bot) / 3 + 3)); else if (y < top) window.scrollBy(0, -Math.min(AUTO_MAX, (top - y) / 3 + 3)); hov(td.px, td.py); autoT = requestAnimationFrame(auto); }
  function endHand(x, y, cancelled, why) {
    var o = td; td = null; tear = null; cancelAnimationFrame(autoT); if (hand) { hand.remove(); hand = null; } supp = Date.now() + 400; document.querySelectorAll('.over').forEach(function (e) { e.classList.remove('over'); });
    var d = cancelled ? null : secAt(x, y), pe = !cancelled && !d ? document.elementFromPoint(x, y) : null, ps = pe && pe.closest ? pe.closest('.pw-day.past') : null;
    if (d && S.carry && d !== S.carry.day) return drop(d);
    var cp = S.carry && !S.carry.move, m = S.carry && find(S.carry.from || S.carry.id); S.carry = null;
    note((why || (ps ? 'Past days are read only, nothing can be dropped on ' + dName(ps.dataset.d) : 'Dropped outside a day')) + '. ' + (cp ? 'Not copied' : 'Not moved') + ': ' + (m ? esc(m.t) + ' stays on ' + dName(m.day) : 'nothing changed'), { day: m ? m.day : S.cur }); render();
  }
  function cancelDrag(why) { if (td) endHand(td.px, td.py, true, why); }
  function upHand(e) { if (!td || e.pointerId !== td.pid) return; if (!td.on) { td = null; return; } endHand(e.clientX, e.clientY, e.type === 'pointercancel', e.type === 'pointercancel' ? 'Drag interrupted' : ''); }
  document.addEventListener('pointerup', upHand); document.addEventListener('pointercancel', upHand);

  /* ---------- decisions 143 to 146: lift and shift straight from the plain week view, no detail first (owner-stated availability, 13 Oct 2026; the gesture is a Proposal) ----------
     Press and hold a tile HOLD_MS without moving more than HOLD_SLOP px: it lifts (scale, shadow, tilt, one short buzz where the device has one). Then a move of DRAG_START px picks it up and the same carry as the detail drag-out runs (the hand, all days as targets incl. hidden Not cooking, edge scroll across the three weeks, Replaced label, pulse, Undo with expiry).
     Moving more than HOLD_SLOP before the hold ends it, so a quick sideways swipe still reveals the swipe actions (the swipe code is untouched) and a vertical move scrolls. A mouse has no scroll to protect: a vertical press-and-drag lifts at once, a sideways one is the swipe, press-and-hold works as on touch.
     A past tile lifts the same way but only to copy forward (100 to 102): the original stays. A tile in an other person's plan (data-ro="all") does not lift. */
  var HOLD_MS = 350, HOLD_SLOP = 8, DRAG_START = 6, lf = null;
  function lfEnd() { if (!lf) return; clearTimeout(lf.t); lf.mc.classList.remove('hold'); if (lf.pv) lf.mc.removeEventListener('touchmove', lf.pv); lf = null; }
  function lfFire() {
    if (!lf || lf.held) return; lf.held = true; drag = null; lf.mc.classList.add('hold'); try { if (navigator.vibrate) navigator.vibrate(8); } catch (z) { }
    lf.pv = function (ev) { if (ev.cancelable) ev.preventDefault(); }; lf.mc.addEventListener('touchmove', lf.pv, { passive: false });
  }
  document.addEventListener('pointerdown', function (e) {
    var mc = e.target.closest('.pw-day .mc'); lfEnd();
    if (!mc || S.carry || td || e.target.closest('button') || e.target.closest('.stackw') || (e.pointerType === 'mouse' && e.button !== 0) || mc.dataset.ro === 'all' || mc.dataset.tile || mc.dataset.open || !mc.dataset.id) return;
    lf = { mc: mc, id: mc.dataset.id, x: e.clientX, y: e.clientY, pid: e.pointerId, mouse: e.pointerType === 'mouse', held: false, on: false, past: mc.dataset.ro === 'past' };
    lf.t = setTimeout(lfFire, HOLD_MS);
  });
  document.addEventListener('pointermove', function (e) {
    if (!lf || e.pointerId !== lf.pid || lf.on) return; var dx = e.clientX - lf.x, dy = e.clientY - lf.y, dist = Math.hypot(dx, dy);
    if (!lf.held) { if (lf.mouse && dist > DRAG_START && Math.abs(dy) > Math.abs(dx) * 1.4) lfFire(); else { if (dist > HOLD_SLOP) lfEnd(); return; } }
    if (dist >= DRAG_START) { var o = lf; lf.on = true; td = { id: o.id, x: o.x, y: o.y, px: e.clientX, py: e.clientY, pid: o.pid, on: true }; beginDrag(o.id, e.clientX, e.clientY, o.pid, { src: 'agenda', copy: o.past }); }
  });
  function lfUp(e) { if (!lf || e.pointerId !== lf.pid) return; if (!lf.on && lf.held) supp = Date.now() + 400; lfEnd(); }
  document.addEventListener('pointerup', lfUp); document.addEventListener('pointercancel', lfUp);
  document.addEventListener('contextmenu', function (e) { if ((lf && lf.held) || hand) e.preventDefault(); });

  /* decision 108a: the handle (tongue) and a swipe down on the detail both close the stack and bring the week back */
  var tg = null, ts = null;
  function stackShift(dy) { var sp = document.querySelector('.spiece'); if (!sp) return; sp.style.transition = 'none'; sp.style.transform = 'translateY(' + dy + 'px)'; sp.style.opacity = String(Math.max(.35, 1 - dy / 320)); }
  function stackReset() { var sp = document.querySelector('.spiece'); if (sp) { sp.style.transition = ''; sp.style.transform = ''; sp.style.opacity = ''; } }
  document.addEventListener('pointerdown', function (e) { var g = e.target.closest('[data-tongue]'); if (!g) return; tg = { y: e.clientY, id: e.pointerId, dy: 0, moved: 0 }; try { g.setPointerCapture(e.pointerId); } catch (x) { } });
  document.addEventListener('pointermove', function (e) { if (!tg || e.pointerId !== tg.id) return; var dy = e.clientY - tg.y; tg.moved = Math.max(tg.moved, Math.abs(dy)); tg.dy = Math.max(0, dy); stackShift(tg.dy); });
  function endTongue(e) { if (!tg || e.pointerId !== tg.id) return; var d = tg; tg = null; if (d.dy > 90) return closeDetail(); stackReset(); }
  document.addEventListener('pointerup', endTongue); document.addEventListener('pointercancel', endTongue);
  document.addEventListener('touchstart', function (e) { var b = e.target.closest && e.target.closest('#sbody'); if (!b || b.scrollTop > 0 || e.touches.length !== 1) { ts = null; return; } ts = { y: e.touches[0].clientY, dy: 0 }; }, { passive: true });
  document.addEventListener('touchmove', function (e) { if (!ts) return; var dy = e.touches[0].clientY - ts.y; if (dy <= 0) { ts.dy = 0; stackReset(); return; } ts.dy = dy; if (dy > 12) stackShift(dy - 12); }, { passive: true });
  document.addEventListener('touchend', function () { if (!ts) return; var d = ts; ts = null; if (d.dy > 100) return closeDetail(); stackReset(); });
  /* Gap fix (owner screenshot, 13 Oct): iOS Safari ends a swipe-down at the top of the sheet with touchcancel (edge gesture, rubber band, bottom bar), not touchend, so the pull-down offset stayed on .spiece and left a hole under the tongue. Every way a touch can end now resets it, and a new touch or a page return clears a stale one. */
  document.addEventListener('touchcancel', function () { ts = null; stackReset(); });
  document.addEventListener('touchstart', function () { if (!tg) stackReset(); }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (!tg) stackReset(); }); window.addEventListener('pagehide', stackReset); window.addEventListener('blur', function () { if (!tg) stackReset(); });

  /* sheet drag (comparison option) */
  var sd = null, lastMove = 0;
  function setSnap(s) { var sh = document.getElementById('sheet'); if (!sh) return; S.snap = s; var H = innerHeight * 0.92, y = s === 'full' ? 0 : Math.round(H * 0.38); sh.style.setProperty('--y', y + 'px'); sh.classList.remove('drag'); }
  document.addEventListener('pointerdown', function (e) { var g = e.target.closest('[data-grab]'); if (!g) return; var sh = document.getElementById('sheet'); sd = { y: e.clientY, id: e.pointerId, h: innerHeight * 0.92, s0: S.snap, moved: 0 }; sh.classList.add('drag'); try { g.setPointerCapture(e.pointerId); } catch (x) { } });
  document.addEventListener('pointermove', function (e) { if (!sd || e.pointerId !== sd.id) return; var dy = e.clientY - sd.y; sd.moved = Math.max(sd.moved, Math.abs(dy)); var base = sd.s0 === 'full' ? 0 : Math.round(sd.h * .38); document.getElementById('sheet').style.setProperty('--y', Math.max(0, base + dy) + 'px'); sd.dy = dy; });
  function endSheet(e) { if (!sd || e.pointerId !== sd.id) return; var d = sd; sd = null; var dy = d.dy || 0; lastMove = d.moved > 5 ? Date.now() : 0; document.getElementById('sheet').classList.remove('drag'); if (d.moved < 6) return; if (d.s0 === 'half' && dy > 90) return closeDetail(); if (dy < -50) return setSnap('full'); if (dy > 60 && d.s0 === 'full') return setSnap('half'); setSnap(d.s0); }
  document.addEventListener('pointerup', endSheet); document.addEventListener('pointercancel', endSheet);
  /* Decision 108a: closing the stack (x, Esc, handle down, swipe down) brings the week plan back, scrolled to that day. */
  function closeDetail() { var d = S.sel && find(S.sel) ? find(S.sel).day : S.dday || S.cur; S.sel = null; S.dday = null; render(false); var el = document.getElementById('d-' + d); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - stkH() - 6); S.cur = d; syncHead(); var pl = document.getElementById('plan'); if (pl) pl.classList.add('wk-in'); }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    if (Date.now() < supp) return;
    var t = e.target.closest('button,article,[data-closea],[data-close]'), d = t ? t.dataset : {};
    if (S.carry && !t) { var sc = e.target.closest('.pw-day'); if (sc) return drop(sc.dataset.d); }
    if (S.carry && t && t.classList.contains('mc')) { var sc2 = t.closest('.pw-day'); if (sc2) return drop(sc2.dataset.d); }
    if (S.carry && t && !d.cancelcarry && !d.dy && !d.wkl && !d.opts && !d.undo && !t.closest('.nav') && t.closest('.pw-day')) { return drop(t.closest('.pw-day').dataset.d); }
    if (!t) { if (S.cuShown) idleReset(); return; }
    if (S.cuShown && d.curtain === undefined) idleReset();
    if ((t.classList.contains('mc') || t.classList.contains('od')) && t.dataset.moved) return;
    if (d.wkl !== undefined) { if (e.detail === 0) goToday(); return; }
    if (d.ecg !== undefined) return toggleEcg(t);
    if (d.opts !== undefined) { S.opts = !S.opts; return render(); }
    if (d.shop !== undefined) { S.asheet = { k: 'shop' }; S.pop = null; return render(); }
    if (d.buy !== undefined) { return buyLine(d.buy); }
    if (d.more) { S.asheet = { k: 'm', id: d.more }; return render(); }
    if (d.closea !== undefined) { S.asheet = null; S.pop = null; S.pickd = null; S.pickMove = false; return render(); }
    if (d.clearw !== undefined) return clearWeek();
    if (d.tongue !== undefined) { if (e.detail === 0) closeDetail(); return; }
    if (d.act) return act(d.act, d.id);
    if (d.fmenu !== undefined) { S.pop = { k: 'f', q: '' }; render(); var f = document.getElementById('fq'); return; }
    if (d.view) { S.view = d.view; S.pop = null; S.asheet = null; if (S.sel && !P.match(find(S.sel), S.view)) S.sel = null; S.cuDone = {}; render(); return syncHead(); }
    if (d.expand !== undefined) { S.expand = !S.expand; return render(); }
    if (d.wbuy !== undefined) return weekBulk(+d.wbuy, 'wbuy'); if (d.wres !== undefined) return weekBulk(+d.wres, 'wres'); if (d.wrel !== undefined) return weekBulk(+d.wrel, 'wrel');
    if (d.hl) { S.hl = S.hl === d.hl ? null : d.hl; return render(); }
    if (d.dy !== undefined) return goDay(d.dy);
    if (d.peek) return goDay(d.peek);
    if (d.jump) return jumpTo(d.jump, +d.jwk);
    if (d.step) { S.cur = DI[di(S.cur) + (+d.step)]; S.revealed = S.cur; render(false); return syncHead(); }
    if (d.copy !== undefined) return copyLast();
    if (d.undo !== undefined) return doUndo();
    if (d.close !== undefined) return closeDetail();
    if (d.grab !== undefined) { if (Date.now() - lastMove < 150) return; return setSnap(S.snap === 'half' ? 'full' : 'half'); }
    if (d.hold !== undefined) return act('hold', S.sel); if (d.replan !== undefined) return act('replan', S.sel); if (d.nocook !== undefined) return act('nocook', S.sel); if (d.addall !== undefined) return act('list', S.sel);
    if (d.addone) { var m = find(S.sel); if (!m || ro() || past(m.day)) return; return mutate(function () { m.miss = m.miss.map(function (x) { return x[0] === d.addone ? [x[0], x[1], 1] : x; }); m.list = m.miss.filter(function (x) { return x[2]; }).length; }, esc(d.addone) + ' added to the shopping list', m.day); }
    if (d.n) { var mm = find(S.sel); if (!mm || lockEdit(mm)) return; mm.n = Math.max(1, mm.n + (+d.n)); return render(); }
    if (d.openday) return openDay(d.openday);
    if (d.block) return block(d.block);
    if (d.unblock) return unblock(d.unblock);
    if (d.ask) { note('Ask AI opens your default AI app, scoped to ' + dName(d.ask) + '. Nothing happens inside Kitchie.', { day: d.ask }); return render(); }
    if (d.surprise) return surprise(d.surprise);
    if (d.curtain !== undefined) { S.cuDone[weekOf(S.cur)] = true; showCurtain(false); note('Ask AI opens your default AI app with the week of ' + info(info(S.cur).mon).n + ' ' + info(info(S.cur).mon).mo + '.  Nothing happens inside Kitchie.'); return render(); }
    if (d.cancelcarry !== undefined) { S.carry = null; S.pickMove = false; return render(); }
    if (d.pickday) return startCarry(S.pickd, d.pickday);
    if (t.classList.contains('mc')) { if (t.dataset.tile) return; return openDetail(t.dataset.id); }
  });
  document.addEventListener('change', function (e) { if (e.target.dataset && e.target.dataset.pcsel !== undefined) { var m = find(S.sel); if (!m || lockEdit(m)) return render(); m.n = +e.target.value; return render(); } var n = e.target.name; if (n && S[n] !== undefined) { S[n] = e.target.value; if (n === 'jig' && S.jig === 'reset') { try { localStorage.removeItem(JK); } catch (x) { } S.jig = ''; } S.hl = null; S.opts = true; if (n === 'cu') { S.cuDone = {}; S.cuShown = false; } render(); syncHead(); } });
  document.addEventListener('input', function (e) { if (e.target.id === 'fq' && S.pop) { S.pop.q = e.target.value; var pos = e.target.selectionStart; document.getElementById('aw').innerHTML = popHtml() + actionSheet(); var f = document.getElementById('fq'); f.focus(); f.setSelectionRange(pos, pos); } });
  document.addEventListener('keydown', function (e) {
    if ((e.target.tagName || '').toLowerCase() === 'input') { if (e.key === 'Escape') { S.pop = null; render(); } return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return; var k = e.key;
    if (k === 'Escape') { if (lf && !lf.on) { lfEnd(); } else if (td && td.on) { cancelDrag('Cancelled with Esc'); } else if (S.carry) { S.carry = null; S.pickMove = false; render(); } else if (S.pickd || S.asheet || S.pop) { S.pickd = S.asheet = S.pop = null; S.pickMove = false; render(); } else if (S.sel || S.dday) closeDetail(); return; }
    var a = document.activeElement, id = a && a.classList.contains('mc') ? a.dataset.id : S.sel;
    if (k.toLowerCase() === 'z') { return doUndo(); }
    if (k.toLowerCase() === 't' && !e.shiftKey) { e.preventDefault(); return goToday(); }
    /* Plan UI review 148 (key equivalent of the right swipe): Shift X on a focused open day, or on the open day's detail, sets Not cooking, as it does on a meal tile (98: Shift X is Not cooking) */
    if (k.toLowerCase() === 'x' && e.shiftKey) { var od1 = a && a.dataset && a.dataset.odB, d1 = od1 || (!S.sel && S.dday); if (d1 && !past(d1) && !ro() && isOpen(d1)) { e.preventDefault(); return block(d1, od1 ? UNDO_NC_MS : undefined); } }
    if (k.toLowerCase() === 'x' && id) { e.preventDefault(); return act(e.shiftKey ? 'nocook' : 'replan', id); }
    if (k.toLowerCase() === 'h' && id) return act('hold', id); if (k.toLowerCase() === 'l' && id) return act('list', id);
    if ((k.toLowerCase() === 'e' || (k === 'Enter' && a && a.classList.contains('mc'))) && id) { e.preventDefault(); return act('open', id); }
    if (a && a.dataset && a.dataset.tongue !== undefined && (k === 'ArrowDown' || k === 'Enter')) { e.preventDefault(); return closeDetail(); }
    if (a && a.id === 'grab' && (k === 'ArrowUp' || k === 'ArrowDown')) { e.preventDefault(); return setSnap(k === 'ArrowUp' ? 'full' : 'half'); }
  });
  window.addEventListener('resize', function () { sizeStk(); placeMk(true); });
  function resetDemo() { if (hand) { hand.remove(); hand = null; } td = null; cancelAnimationFrame(autoT); S.meals = P.phoneMeals(); S.blocked = P.baseBlocked('d13'); S.bown = P.baseOwners(); S.bought = P.phoneBought(); S.extras = P.phoneExtras(); S.sel = null; S.dday = null; S.carry = null; S.note = null; S.pulse = null; S.ustk = []; S.pop = null; S.asheet = null; S.cmp = true; }
  function showWeek(d) { S.sel = null; S.dday = null; S.carry = null; S.cur = d; S.cmp = true; render(false); var el = document.getElementById('d-' + d); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - stkH() - 6); syncHead(); }
  window.__plan = { goToday: goToday, jumpTo: jumpTo, LABEL_HOLD_MS: LABEL_HOLD_MS, syncEcg: syncEcg, block: block, unblock: unblock, openDay: openDay, HOLD_MS: HOLD_MS, resetDemo: resetDemo, showWeek: showWeek, find: find, stkH: stkH, openDetail: openDetail, closeDetail: closeDetail, beginDrag: beginDrag, moveHand: moveHand, endHand: endHand, clearWeek: clearWeek, S: S, act: act, goDay: goDay, drop: drop, startCarry: startCarry, surprise: surprise, copyLast: copyLast, render: render, syncHead: syncHead, follow: follow };

  if (S.sel && S.dt === 'stack') jigStart(find(S.sel));
  render(false);
  if (q.get('demo')) { document.body.classList.add('hasdemo'); var ds = document.createElement('script'); ds.src = 'demo.js'; document.body.appendChild(ds); }
  if (q.get('carry')) { var cm = find(q.get('carry')); if (cm) { S.carry = JSON.parse(JSON.stringify(cm)); render(false); } }
  if (q.get('pick')) { S.pickd = q.get('pick'); render(false); }
  if (S.lay === 'rib' && !S.sel && !q.get('top') || q.get('day')) { requestAnimationFrame(function () { var el = document.getElementById('d-' + S.cur); if (el && di(S.cur) > 0) { var y = el.getBoundingClientRect().top + window.scrollY - document.getElementById('stkp').offsetHeight - 4; window.scrollTo(0, Math.max(0, y)); } lastY = window.scrollY; follow(true); evalCurtain(); if (isLite()) placeLite(S.dday); }); } else evalCurtain();
})();
