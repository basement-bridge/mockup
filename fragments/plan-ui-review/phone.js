/* Plan UI review, phone (390 and 360). 13 Oct 2026, later: the day ribbon shows ONLY while a detail is open (decision 136, owner-stated); ?rb=always restores the old always-on ribbon (superseded, for comparison).
   13 Oct 2026 batch 2 (decisions 120 to 133): plain red or green status, one combined ingredient list, Hold and Add at the bottom, total time, quiet open nights, first-run wiggle, auto-expiring undo, Open recipe.
   Batch 1: UAT day-row grid (.pw-day, .pw-dn, .pw-stack, verified against Kitchie uat), ribbon taps swap the docked stack, lift, tear. Day ribbon revision, 12 Oct 2026 (owner-stated decisions 85 to 119, see docs/knowledge/jobs-to-be-done/plan-ui-review.md).
   Swipes are pointer events, so a mouse drags exactly like a finger. Keyboard: focus a card, X replan, Shift X not cooking, H hold, E or Enter open, Z undo.
   Same service methods as the chat tools (plan_view, plan_update_meal, plan_remove_meal, plan_block_day, plan_reserve, plan_add_missing_to_list, plan_move_meal, plan_copy_last_week).
   Sample data is in data.js; status markup is in status.js. Nothing here is built in Kitchie. */
(function () {
  var P = window.PUR, ic = P.icons, REDUCE = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches), q = new URLSearchParams(location.search), RIB = P.RIB, DI = RIB.map(function (r) { return r.id; });
  function pick(k, ok, d) { var v = q.get(k); return ok.indexOf(v) > -1 ? v : d; }
  var S = {
    lay: pick('lay', ['rib', 'focus'], 'rib'), hd: pick('hd', ['shrink', 'fixed'], 'shrink'), f: pick('f', ['drop', 'seg', 'strip'], 'drop'), pc: pick('pc', ['step', 'drop'], 'step'),
    nc: pick('nc', ['hide', 'show'], 'hide'), u: pick('u', ['day', 'flip', 'banner', 'pill'], 'day'), dt: pick('dt', ['stack', 'peek', 'strip', 'hide', 'sheet'], 'stack'), cw: pick('cw', ['menu', 'pair'], 'menu'), cl: pick('cl', ['meals', 'all'], 'meals'), long: pick('long', ['0', '1'], '0'), st: pick('st', ['plain', 'labels', 'badge', 'edge', 'progress'], 'plain'), gr: pick('gr', ['list', 'hand'], 'list'), hdl: pick('hdl', ['none', 'light'], 'none'), jig: pick('jig', ['1', '0', 'reset'], ''), ba: pick('ba', ['bar', 'list', 'both'], 'bar'), rb: pick('rb', ['detail', 'always'], 'detail'),
    cu: pick('cu', ['start', 'idle', 'off'], 'start'), sw: pick('sw', ['tint', 'buttons'], 'tint'),
    today: 'd13', cur: P.did(q.get('day'), 'd13'), view: q.get('who') || 'mine', hl: null, sel: q.get('sel'), snap: q.get('snap') === 'full' ? 'full' : 'half', expand: q.get('expand') === '1',
    dday: q.get('dock') || null, pop: null, opts: false, ustk: [], wkm: false, pickMove: false, note: null, carry: null, pickd: null, revealed: null, cuShown: false, cuDone: {}, cmp: false,
    meals: JSON.parse(JSON.stringify(P.meals)), blocked: JSON.parse(JSON.stringify(P.blocked))
  };
  var TODAYN = 13, root = document.getElementById('root'), nid = 0;
  if (!S.meals.some(function (m) { return m.id === S.sel; })) S.sel = null; else if (!q.get('day')) S.cur = S.meals.filter(function (m) { return m.id === S.sel; })[0].day;
  var dd0 = S.dday ? P.did(S.dday, null) : null; S.dday = dd0 && S.dt === 'stack' && !S.sel ? dd0 : null;
  if ((S.sel || S.dday) && S.dt === 'stack' && S.hd === 'shrink') S.cmp = true;
  function di(d) { return DI.indexOf(d); } function info(d) { return RIB[di(d)]; } function past(d) { return di(d) < di(S.today); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function find(id) { return S.meals.filter(function (m) { return m.id === id; })[0]; }
  function ro() { return S.view !== 'mine' && S.view !== 'everyone'; }
  function vis() { return S.meals.filter(function (m) { return P.match(m, S.view); }); }
  function on(d) { return vis().filter(function (m) { return m.day === d; }); }
  function dName(d) { var x = info(d); return x.dow + ' ' + x.n + ' Oct'; }
  function dLong(d) { var x = info(d); return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][x.i % 7]; }
  function vlab(v) { return v === 'mine' ? 'Mine' : v === 'everyone' ? 'Everyone' : P.people.filter(function (p) { return p.id === v; })[0].n; }
  function cnt(v) { return S.meals.filter(function (m) { return P.match(m, v); }).length; }
  function weekOf(d) { return info(d).wk; }
  function monN(d) { return info(info(d).mon).n; }
  function hidden(d) { return S.nc === 'hide' && S.blocked[d] && !S.carry && d !== S.cur && d !== S.revealed; }
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
  function unlisted(m) { return m.miss.filter(function (x) { return !x[2]; }); }
  function haveList(m) { return S.long === '1' ? m.have.concat(P.LONG) : m.have; }

  /* ---------- cards ---------- */
  function card(m, lite) {
    var lift = S.carry && S.carry.move && S.carry.from === m.id, hl = S.hl === 'missing' ? m.miss.length : S.hl === 'useby' ? m.useby.length : 1, pst = past(m.day), lock = ro(), e = S.st === 'edge' ? ' e-' + P.status.edge(m, TODAYN) : '';
    var who = lock ? 'all' : pst ? 'past' : 'edit';
    var hint = lock ? 'View only.' : pst ? 'Past, read only. Swipe right: copy forward.' : 'Swipe right: not cooking. Swipe left: replan. Or press X, Shift X.';
    return '<div class="sw' + (S.sw === 'buttons' ? ' btns' : '') + '" data-sw="' + m.id + '"><div class="und" aria-hidden="true"><span class="l">' + (pst ? ic.cal + ' Copy forward' : ic.moon + ' Not cooking') + '</span><span class="r">Replan ' + ic.swap + '</span></div>' +
      '<article class="mc' + e + (lift ? ' lifted' : '') + (lite ? ' lite' : '') + (S.sel === m.id ? ' sel' : '') + (S.jigOn && lite && who === 'edit' ? ' jig' : '') + (hl ? '' : ' dim') + (pst ? ' past' : '') + '" tabindex="0" data-id="' + m.id + '"' + (lite && who === 'edit' ? ' data-tile="1"' : '') + ' data-ro="' + who + '" aria-label="' + esc(m.t) + ', ' + dName(m.day) + '. ' + hint + '">' +
      '<span class="em">' + m.em + '</span><div class="tx"><h3>' + esc(m.t) + '</h3><p>' + esc(P.whoLabel(m)) + '</p>' + (m.left ? '<p class="lf">' + ic.swap + ' Leftovers from ' + m.left + '</p>' : '') + '</div>' +
      (S.st === 'edge' ? P.status.html(m, 'edge', TODAYN) : S.st === 'plain' && !pst ? P.status.html(m, 'plain', TODAYN, !dealt(m)) : '') + '<button class="more" data-more="' + m.id + '" aria-label="Actions for ' + esc(m.t) + '">' + ic.more + '</button>' + (S.st === 'edge' || S.st === 'plain' || lite ? '' : P.status.html(m, S.st, TODAYN)) + '</article></div>';
  }
  /* Decision 125 (owner-stated): on the week an open night is only the quiet words "Open night". Ask AI and Surprise me appear once the person taps into that day (full = the day's own detail).
     Other detail variants have no day detail, so they keep the buttons on the row. */
  function emptyHtml(d, full) {
    if (past(d)) return '<div class="empty past">Nothing was planned</div>';
    if (S.blocked[d]) return '<button class="blk' + (S.blocked[d] === 'usual' ? ' usual' : '') + '" ' + (ro() ? 'disabled' : 'data-unblock="' + d + '"') + '><b>Not cooking</b><span>' + (S.blocked[d] === 'usual' ? 'Usual day off' : 'This week only') + (ro() ? '' : ' · tap to cook') + '</span></button>';
    if (ro()) return '<div class="nite ro"><span class="ot">Open night</span></div>';
    var btns = '<div class="oa"><button data-ask="' + d + '">' + ic.spark + ' Ask AI</button><button data-surprise="' + d + '">' + ic.dice + ' Surprise me</button>' + (full ? '<button data-block="' + d + '">' + ic.moon + ' Not cooking</button>' : '') + '</div>';
    if (full) return '<div class="nite full"><span class="ot">Open night</span>' + btns + '</div>';
    if (S.dt === 'stack') return '<button class="nite quiet" data-openday="' + d + '" aria-label="Open night, ' + dName(d) + '. Tap to plan it"><span class="ot">Open night</span></button>';
    return '<div class="nite"><button class="ot" data-block="' + d + '" aria-label="Open night. Tap to mark Not cooking">Open night<small>tap if not cooking</small></button>' + btns + '</div>';
  }
  function dayBody(d) {
    var ms = on(d);
    if (!ms.length) return emptyHtml(d);
    return (ms.some(function (m) { return m.usual; }) ? '<p class="tipl">Usual day off, cooking this week</p>' : '') + ms.map(card).join('') + (P.tips[d] && !past(d) ? '<p class="tipl">' + ic.leaf + ' ' + esc(P.tips[d]) + '</p>' : '');
  }
  function noteHtml(d) { var n = S.note; if (!n || S.u !== 'day' || n.day !== d) return ''; return '<div class="unote" role="status"><span>' + n.msg + '</span>' + (n.undo ? '<button data-undo>' + ic.undo + ' Undo</button>' : '') + '</div>'; }
  /* UAT stencil (decision 110): one row per day, a narrow left gutter with the weekday and the date, then the stack of meals. Class names are the ones Kitchie UAT draws
     (verified, basement-bridge/kitchie uat, server/src/web-plan.ts and assets/plan.js, 12 Oct 2026): .pw-day, .pw-dn, .pw-stack. Today and the carry labels are mockup additions (111). */
  function daySec(d, extra) {
    var x = info(d), tgt = S.carry && !past(d), hid = hidden(d), lab = (S.blocked[d] && S.carry ? '<i class="ncl">Not cooking</i>' : '') + (tgt ? '<i class="drp">' + (S.carry.drag ? (S.carry.day === d ? 'Lifted from here' : 'Drop here') : 'Tap to drop here') + '</i>' : '');
    return '<section class="pw-day' + (past(d) ? ' past' : '') + (d === S.today ? ' today' : '') + (hid ? ' hid' : '') + (tgt ? ' target' : '') + (S.pulse && S.pulse.indexOf(d) > -1 ? ' pulse' : '') + '" id="d-' + d + '" data-d="' + d + '"' + (S.carry && past(d) ? ' aria-disabled="true"' : '') + '><div class="pw-dn" aria-label="' + dLong(d) + ' ' + x.n + ' Oct' + (d === S.today ? ', today' : '') + '">' + x.dow + '<small>' + x.n + ' Oct</small>' + (S.st === 'plain' && !past(d) && on(d).length ? '<i class="gs ' + (dayDealt(d) ? 'ok' : 'bad') + '" role="img" aria-label="' + (dayDealt(d) ? 'Dealt with' : 'Something is missing') + '"></i>' : '') + (d === S.today ? '<em>Today</em>' : '') + '</div><div class="pw-stack">' + (lab ? '<div class="dsh">' + lab + '</div>' : '') + noteHtml(d) + dayBody(d) + '</div></section>';
  }
  function wkDiv(r) { return '<div class="wkd"><span>Week of ' + r.n + ' Oct</span><i>' + P.REL[r.wk] + (r.wk < 0 ? ' · read only' : '') + '</i></div>' + (r.wk >= 0 ? summary(r.wk) : ''); }
  function agenda() { return RIB.map(function (r) { return (r.dow === 'Mon' ? wkDiv(r) : '') + daySec(r.id); }).join('') + '<div class="endsp" aria-hidden="true"></div>'; }

  /* ---------- detail: docked below the ribbon (default) or the two-stop sheet ---------- */
  /* Decision 123 (owner-stated, voice): "rather than the split of on hand and missing, I just want to see the missing ingredient in red at the top". ONE list: missing first, then on hand.
     No headings, no boxes, no pills. A missing name is plain red until it is dealt with (on the list); a listed one reads as a normal name with a small cart tick. */
  function ubTxt(m, r) { var ub = m.useby.filter(function (u) { return u[0] === r[0]; })[0]; return ub ? '<span class="ubt ' + P.status.urg(m, TODAYN) + '">use by ' + esc(ub[1]) + '</span>' : ''; }
  function ingList(m, lk) {
    var ms = m.miss.filter(function (x) { return !x[2]; }).concat(m.miss.filter(function (x) { return x[2]; })), hv = haveList(m);
    /* Decision 134 (Proposal, ?ba=bar|list|both): group-level bulk actions in the list itself. They reuse the bottom bar's handlers (data-addall, data-hold), so the undo flip and its expiry are the same. */
    var ga = !lk && !past(m.day) && !ro() && S.ba !== 'bar', un = unlisted(m).length;
    var addRow = ga && un ? '<li class="ga ga-add"><button class="gbtn" data-addall aria-label="Add all ' + un + ' missing ' + (un === 1 ? 'ingredient' : 'ingredients') + ' to the shopping list">' + ic.cart + ' Add all</button></li>' : '';
    var holdRow = ga && hv.length ? '<li class="ga ga-hold"><button class="gbtn' + (m.held ? ' on' : '') + '" data-hold aria-pressed="' + !!m.held + '" aria-label="' + (m.held ? 'Release the hold on ' : 'Hold all ') + hv.length + ' on-hand ingredients">' + ic.mark + (m.held ? ' Held' : ' Hold all') + '</button></li>' : '';
    var rows = ms.map(function (x, i) {
      var tail = lk ? '' : x[2] ? '<span class="onl" role="img" aria-label="On the shopping list" title="On the shopping list">' + ic.cart + '</span>' : '<button class="ib" data-addone="' + esc(x[0]) + '" aria-label="Add ' + esc(x[0]) + ' to the shopping list">' + ic.cart + '</button>';
      return '<li class="m' + (isRed(x) ? ' red' : '') + (i === ms.length - 1 && hv.length && !addRow ? ' mlast' : '') + '"><span class="in">' + esc(x[0]) + '</span><span class="qy">' + esc(x[1]) + '</span>' + tail + '</li>';
    }).join('');
    return '<ul class="ing one' + (ga ? ' bulk' : '') + '">' + rows + addRow + hv.map(function (r) { return '<li><span class="in">' + esc(r[0]) + '</span><span class="qy">' + esc(r[1]) + '</span>' + ubTxt(m, r) + '</li>'; }).join('') + holdRow + '</ul>';
  }
  function lockEdit(m) { return ro() || past(m.day); }
  function pcount(m) {
    if (S.pc === 'drop') { var o = ''; for (var i = 1; i <= 8; i++) o += '<option value="' + i + '"' + (m.n === i ? ' selected' : '') + '>' + i + (i === 1 ? ' person' : ' people') + '</option>'; return '<div class="ppl"><span class="lbl">People</span><select class="pcs" data-pcsel aria-label="Number of people"' + (lockEdit(m) ? ' disabled' : '') + '>' + o + '</select></div>'; }
    return '<div class="ppl"><span class="lbl">People</span><button class="ib" data-n="-1" aria-label="Fewer people"' + (lockEdit(m) ? ' disabled' : '') + '>−</button><b>' + m.n + '</b><button class="ib" data-n="1" aria-label="More people"' + (lockEdit(m) ? ' disabled' : '') + '>+</button></div>';
  }
  function detailBody(m) {
    var src = m.src === 'made' ? '<p class="srcl">' + ic.spark + ' <b>Made up by your AI</b> · not saved as a recipe</p>' : m.src === 'surprise' ? '<p class="srcl">' + ic.dice + ' <b>Surprise me</b> · ' + esc(m.why || '') + '</p>' : '';
    var lk = lockEdit(m);
    return src + '<p class="tt">' + ic.clock + ' Total time <b>' + P.mins(m) + '</b></p>' + (m.note ? '<p class="nt">' + esc(m.note) + '</p>' : '') + (lk ? '<p class="nt ronote">' + ic.cal + (ro() ? ' ' + vlab(S.view) + "'s plan is view only." : ' Past: read only. Swipe the card right, or use Copy forward, to bring it into a coming day.') + '</p>' : '') + pcount(m) + ingList(m, lk);
  }
  /* Decision 126 (owner-stated): the bottom of the detail is "Hold" plus the number and a cart "Add" plus the number, nothing else. Replan and Not cooking live in the ... menu and in dragging the tile out.
     The number is what the button will touch (on-hand items to hold, missing items not yet on the list), Proposal; it is not a second status count. No missing items to add: no Add. */
  function footActions(m) {
    if (ro()) return; if (past(m.day)) return '<button class="b2" data-act="copyfwd" data-id="' + m.id + '">' + ic.cal + ' Copy forward</button>';
    if (S.ba === 'list') return ''; var hv = haveList(m).length, un = unlisted(m).length, o = '';
    if (hv) o += '<button class="b2 hold' + (m.held ? ' on' : '') + '" data-hold aria-pressed="' + !!m.held + '" aria-label="' + (m.held ? 'Release the hold on ' : 'Hold all ') + hv + ' on-hand ingredients">' + ic.mark + (m.held ? ' Held' : ' Hold') + ' <b class="ct">' + hv + '</b></button>';
    if (un) o += '<button class="b2 add" data-addall aria-label="Add ' + un + ' missing ' + (un === 1 ? 'ingredient' : 'ingredients') + ' to the shopping list">' + ic.cart + ' Add <b class="ct">' + un + '</b></button>';
    return o;
  }
  function mini(d, cls) { var ms = on(d); return '<button class="mini ' + (cls || '') + '" data-dy="' + d + '"><b>' + info(d).dow + ' ' + info(d).n + '</b><span>' + (ms.length ? ms.map(function (m) { return m.em + ' ' + esc(m.t); }).join(' · ') : S.blocked[d] ? 'Not cooking' : 'Open night') + '</span></button>'; }
  function dockHtml(m) {
    var d = m.day, sibs = on(d);
    var inner = '<div class="dkh"><h2 id="stt"><b>' + dLong(d) + '</b> ' + info(d).n + ' Oct' + (d === S.today ? ' <em>Today</em>' : '') + '</h2><button class="ib" data-close aria-label="Close detail">' + ic.x + '</button></div>' +
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
    var day = '<div class="dpiece"><div class="dkh"><h2 id="stt"><b>' + dLong(d) + '</b> ' + info(d).n + ' Oct' + (d === S.today ? ' <em>Today</em>' : '') + '</h2><button class="ib" data-close aria-label="Close detail">' + ic.x + '</button></div>' +
      '<div class="pw-stack">' + card(m, true) + others.map(function (x) { return '<button class="mini oth" data-act="open" data-id="' + x.id + '"><b>Also</b><span>' + x.em + ' ' + esc(x.t) + '</span></button>'; }).join('') + noteHtml(d) + '</div>' +
      '<button class="tongue" data-tongue aria-label="Drag down to close, or press Enter" aria-describedby="stt"><i></i></button></div>';
    var sheet = '<div class="spiece"><div class="sbody" id="sbody">' + st + detailBody(m) + '</div>' + (foot ? '<footer class="sfoot">' + foot + '</footer>' : '') + '</div>';
    return '<section class="stackw pw hdl-' + S.hdl + (S.swap ? ' noin' : '') + '" id="d-' + d + '" data-d="' + d + '" role="region" aria-labelledby="stt">' + day + sheet + '</section>';
  }
  /* Decision 115, 116: tapping another day in the ribbon swaps the CONTENTS of the docked stack; the slot stays. A day with no meal shows its open-night, Not cooking or past state in the same two pieces. */
  function stackEmptyHtml(d) {
    var pst = past(d), nc = S.blocked[d], msg = pst ? 'Nothing was planned on this day.' : nc ? (nc === 'usual' ? 'Usual day off. ' : 'Not cooking, this week only. ') + (ro() ? '' : 'Tap the block above to cook this night.') : ro() ? vlab(S.view) + "'s plan is view only." : 'Nothing planned yet. Ask AI to plan it, try Surprise me, or mark it Not cooking.';
    var day = '<div class="dpiece"><div class="dkh"><h2 id="stt"><b>' + dLong(d) + '</b> ' + info(d).n + ' Oct' + (d === S.today ? ' <em>Today</em>' : '') + '</h2><button class="ib" data-close aria-label="Close detail">' + ic.x + '</button></div><div class="pw-stack">' + emptyHtml(d, true) + noteHtml(d) + '</div><button class="tongue" data-tongue aria-label="Drag down to close, or press Enter" aria-describedby="stt"><i></i></button></div>';
    var sheet = '<div class="spiece"><div class="sbody emptyb" id="sbody"><p class="nt">' + msg + '</p></div></div>';
    return '<section class="stackw pw hdl-' + S.hdl + (S.swap ? ' noin' : '') + '" id="d-' + d + '" data-d="' + d + '" role="region" aria-labelledby="stt">' + day + sheet + '</section>';
  }
  function sheetHtml() {
    var m = S.sel && find(S.sel); if (!m || S.dt !== 'sheet') return '<div class="sheet" id="sheet" aria-hidden="true"></div>';
    var foot = footActions(m);
    return '<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="stt"><button class="grab" id="grab" aria-label="Drag to resize or close; press Enter to switch half and full" data-grab><i></i></button>' +
      '<header class="shd"><span class="em lg">' + m.em + '</span><div class="tx"><h2 id="stt">' + esc(m.t) + '</h2><p>' + dName(m.day) + ' · ' + esc(P.whoLabel(m)) + '</p></div><button class="ib" data-close aria-label="Close">' + ic.x + '</button></header>' +
      '<div class="sbody">' + detailBody(m) + '</div>' + (foot ? '<footer class="sfoot">' + foot + '</footer>' : '') + '</div>';
  }

  /* ---------- header, ribbon, filter ---------- */
  function stats(wk) { var ms = vis().filter(function (m) { return weekOf(m.day) === wk; }), miss = 0, ub = 0, nights = {}; ms.forEach(function (m) { nights[m.day] = 1; miss += m.miss.length; ub += m.useby.length; }); return { miss: miss, ub: ub, nights: Object.keys(nights).length }; }
  function summary(wk) {
    var s = stats(wk);
    return '<div class="sum"><span class="sb"><b>' + s.nights + '/7</b><span>nights</span></span><button class="sb' + (S.hl === 'missing' ? ' on' : '') + '" data-hl="missing" aria-pressed="' + (S.hl === 'missing') + '">' + ic.warn + '<b>' + s.miss + '</b><span>to buy</span></button><button class="sb' + (S.hl === 'useby' ? ' on' : '') + '" data-hl="useby" aria-pressed="' + (S.hl === 'useby') + '">' + ic.clock + '<b>' + s.ub + '</b><span>use first</span></button></div>';
  }
  function ribbon() {
    return '<div class="rib" id="rib" role="tablist" aria-label="Days. Scroll sideways, one day at a time; tap a day to bring it into focus."><div class="ribin" id="ribin"><span class="mk" id="mk" aria-hidden="true"></span>' + RIB.map(function (r) {
      var d = r.id, ms = on(d), dots = '';
      if (ms.length) ms.slice(0, 3).forEach(function (m) { dots += '<i class="' + (dealt(m) ? '' : 'bad') + '"></i>'; }); else dots = S.blocked[d] ? '<i class="off"></i>' : '<i class="open"></i>';
      return (r.dow === 'Mon' && r.i ? '<span class="wsep" aria-hidden="true"></span>' : '') + '<button class="dy' + (d === S.today ? ' today' : '') + (d === S.cur ? ' on' : '') + (past(d) ? ' past' : '') + (r.dow === 'Mon' ? ' mon' : '') + '" data-dy="' + d + '" role="tab" aria-selected="' + (d === S.cur) + '" aria-label="' + dName(d) + (d === S.today ? ', today' : '') + ', ' + (ms.length ? ms.length + (ms.length === 1 ? ' meal' : ' meals') + (past(d) ? '' : dayDealt(d) ? ', dealt with' : ', something missing') : S.blocked[d] ? 'not cooking' : 'open night') + '">' + r.dow.charAt(0) + '<b>' + r.n + '</b><span class="st">' + dots + '</span></button>';
    }).join('') + '</div></div>';
  }
  function filterCtl() {
    var lab = vlab(S.view);
    if (S.f === 'seg') return '';
    return '<button class="fmenu" data-fmenu aria-haspopup="listbox" aria-expanded="' + !!(S.pop && S.pop.k === 'f') + '"><span class="av">' + (ro() ? lab.charAt(0) : '') + '</span><b>' + lab + '</b>' + ic.down + '</button>';
  }
  function segRow() {
    if (S.f === 'seg') { var o = function (v, l) { return '<button class="ch' + (S.view === v ? ' on' : '') + '" data-view="' + v + '" role="radio" aria-checked="' + (S.view === v) + '">' + l + ' <i>' + cnt(v) + '</i></button>'; }; var other = ro(); return '<div class="pp"><div class="pstrip" role="radiogroup" aria-label="Whose meals">' + o('mine', 'Mine') + o('everyone', 'Everyone') + '<button class="ch' + (other ? ' on' : '') + '" data-fmenu aria-haspopup="listbox">' + ic.people + (other ? vlab(S.view) : 'People') + ic.down + '</button></div></div>'; }
    if (S.f === 'strip' && S.expand) { var ch = function (v, l, av) { return '<button class="ch' + (S.view === v ? ' on' : '') + '" data-view="' + v + '" role="radio" aria-checked="' + (S.view === v) + '">' + (av ? '<span class="av">' + av + '</span>' : '') + l + ' <i>' + cnt(v) + '</i></button>'; }; return '<div class="pp"><div class="pstrip open" role="radiogroup" aria-label="Whose meals">' + ch('mine', 'Mine') + ch('everyone', 'Everyone') + P.people.filter(function (p) { return !p.me; }).map(function (p) { return ch(p.id, p.n, p.n.charAt(0)); }).join('') + '</div></div>'; }
    return '';
  }
  /* Copy last week (99) and Clear week (109): two week-level actions, one pattern. Each flips IN PLACE into Undo after use and names what it reverses ("Undo copy", "Undo clear").
     Undo is a short stack (each step lives 14 s): the latest action's button shows Undo; undo it and the earlier one shows Undo again. */
  /* Decision 130 (owner: "not indefinitely, maybe"): every in-place Undo (the day note, the header flip, the banner, the pill, the drop undo) expires. 14 s, recommended 10 to 15 s; ?ut=4 shortens it for review. */
  var UW = (+q.get('ut') > 0 ? Math.min(60, +q.get('ut')) * 1000 : 14000), ULAB = { copy: 'copy', clear: 'clear', drop: 'drop', move: 'move', edit: 'change' };
  function pruneU() { var t = Date.now(); S.ustk = S.ustk.filter(function (u) { return t - u.at < UW; }); }
  function topU() { pruneU(); return S.ustk[S.ustk.length - 1] || null; }
  function plain(h) { return String(h).replace(/<[^>]+>/g, ''); }
  function flipKind() { var u = topU(); if (!u) return null; if (u.k === 'copy' || u.k === 'clear') return u.k; return S.u === 'flip' ? 'copy' : null; }
  function pill(u) { var l = ULAB[u.k] || 'change'; return '<button class="flipundo two" data-undo aria-label="Undo ' + l + ': ' + esc(plain(u.msg)) + (S.ustk.length > 1 ? '. One more step is available after this' : '') + '" title="Undo ' + l + '">' + ic.undo + '<span><b>Undo</b><small>' + l + '</small></span></button>'; }
  function whyOff() { return ro() ? vlab(S.view) + "'s plan is view only" : weekOf(S.cur) < 0 ? 'Last week is read only' : ''; }
  function wkCtl() {
    var fk = flipKind(), u = topU(), why = whyOff(), cr = P.clearWeek(S.meals, S.blocked, S.view, weekOf(S.cur), S.today, S.cl), cdis = !!why || cr.why === 'none';
    if (S.cw === 'pair') {
      var cp = fk === 'copy' ? pill(u) : '<button class="ib" data-copy aria-label="Copy last week into this one: fills open nights only, never overwrites"' + (why ? ' disabled' : '') + ' title="' + (why || 'Copy last week: fills open nights only') + '">' + ic.copy + '</button>';
      var cl = fk === 'clear' ? pill(u) : '<button class="ib" data-clearw aria-label="Clear week: removes this week\'s meals from today on, with Undo"' + (cdis ? ' disabled' : '') + ' title="' + (why || (cr.why === 'none' ? 'Nothing to clear from today on' : 'Clear week: removes meals from today on. Undo is one tap')) + '">' + ic.clear + '</button>';
      return '<span class="cpy pair">' + cp + cl + '</span>';
    }
    return '<span class="cpy menu">' + (fk ? pill(u) : '') + '<button class="ib" data-wkmenu aria-haspopup="menu" aria-expanded="' + S.wkm + '" aria-label="Week actions: Copy last week, Clear week" title="Week actions">' + ic.more + '</button></span>';
  }
  function wkMenu() {
    if (!S.wkm) return '';
    var wk = weekOf(S.cur), scope = S.view === 'mine' ? 'my plan' : 'the household plan', why = whyOff(), cr = P.clearWeek(S.meals, S.blocked, S.view, wk, S.today, S.cl), cp = P.copyLast(S.meals, S.blocked, S.view, wk, S.today);
    var csub = why || (cp.days.length ? 'Fills ' + cp.days.length + (cp.days.length === 1 ? ' open night' : ' open nights') + ' from ' + (wk - 1 === 0 ? 'this week' : 'last week') + ', never overwrites' : 'Nothing to fill: every open night has a plan');
    var xsub = why || (cr.why === 'none' ? 'Nothing to clear from today on' : 'Removes ' + cr.rm.length + (cr.rm.length === 1 ? ' meal' : ' meals') + ' from today on in ' + scope + (S.cl === 'all' && cr.nc.length ? ' and ' + cr.nc.length + ' Not cooking mark' + (cr.nc.length > 1 ? 's' : '') : '. Not cooking days stay') + (cr.shared ? ' · includes ' + cr.shared + ' household ' + (cr.shared === 1 ? 'meal' : 'meals') : ''));
    return '<div class="scrim2" data-closea></div><div class="dd wkm" role="menu" aria-label="Week actions" style="--ddt:' + (stkH() + 2) + 'px"><h2>Week of ' + info(info(S.cur).mon).n + ' Oct · ' + scope + '</h2>' +
      '<button class="it" role="menuitem" data-wk="copy"' + (why ? ' disabled' : '') + '>' + ic.copy + '<span><b>Copy last week</b><small>' + esc(csub) + '</small></span></button>' +
      '<button class="it" role="menuitem" data-wk="clear"' + (why || cr.why === 'none' ? ' disabled' : '') + '>' + ic.clear + '<span><b>Clear week</b><small>' + esc(xsub) + '</small></span></button>' +
      '<p class="hint2">Both can be undone for 14 seconds (Z). Undo names the action it reverses.</p></div>';
  }
  function header() {
    var r = info(S.cur), mn = info(r.mon), n = S.note, fk = flipKind(), tu = topU(), sub = (fk && tu) ? (tu.short || plain(tu.msg)) + (S.ustk.length > 1 ? ' · +' + (S.ustk.length - 1) + ' more' : '') : P.REL[r.wk];
    var t = '<div class="hd' + (fk ? ' flipped' : '') + (S.cw === 'pair' ? ' pairm' : '') + '"><div class="wt"><h1 id="wkt">Week of ' + mn.n + ' Oct</h1><small id="wks" class="' + (fk ? 'fl' : '') + '">' + sub + '</small></div><span class="sp"></span>' + (S.cur !== S.today ? '<button class="tdy" data-today aria-label="Jump to today">Today</button>' : '') + filterCtl() + wkCtl() + '<button class="ib cog" aria-label="Plan settings" title="Plan settings">' + ic.cog + '</button></div>';
    var ex = '';
    if (n && S.u === 'banner') ex += '<div class="ubn" role="status"><span>' + n.msg + '</span>' + (n.undo ? '<button data-undo>' + ic.undo + ' Undo</button>' : '') + '</div>';
    if (n && S.u === 'pill') ex += '<div class="upill" role="status"><span>' + n.msg + '</span>' + (n.undo ? '<button data-undo>' + ic.undo + ' Undo</button>' : '') + '</div>';
    if (ro()) ex += '<div class="rol">' + ic.people + ' ' + vlab(S.view) + "'s plan: view only. You can look, not change it.</div>";
    return '<div class="stk' + (S.cmp && S.hd === 'shrink' && ribOn() ? ' cmp' : '') + '" id="stk">' + t + segRow() + (ribOn() ? ribbon() : '') + ex + '<div class="cslot' + (S.cuShown ? ' in' : '') + '" id="cslot">' + (S.cuShown ? '<button class="curtain" data-curtain>' + ic.spark + ' Ask AI to plan this</button>' : '') + '</div></div><div class="stkp" id="stkp"></div>';
  }
  function popHtml() {
    if (!S.pop) return '';
    var it = function (v, l, sub) { return '<button class="it' + (S.view === v ? ' on' : '') + '" role="option" aria-selected="' + (S.view === v) + '" data-view="' + v + '">' + (S.view === v ? ic.check : '<span class="av">' + (v === 'mine' || v === 'everyone' ? '' : l.charAt(0)) + '</span>') + '<span>' + l + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="kbd">' + cnt(v) + '</span></button>'; };
    var fq = (S.pop.q || '').toLowerCase();
    return '<div class="scrim2" data-closea></div><div class="dd" role="listbox" aria-label="Whose meals"><h2>Showing</h2>' + it('mine', 'Mine', 'your plan: you can change it') + it('everyone', 'Everyone', 'the household plan: you can change it') + '<hr><p class="lbl">Other members: view only</p><input id="fq" placeholder="Find a person" aria-label="Find a person" value="' + esc(S.pop.q || '') + '">' + P.people.filter(function (p) { return !p.me && p.n.toLowerCase().indexOf(fq) > -1; }).map(function (p) { return it(p.id, p.n, ''); }).join('') + '</div>';
  }
  function actionSheet() {
    if (S.pickd) {
      var m = find(S.pickd), cells = RIB.filter(function (r) { return r.wk >= 0; }).map(function (r) { var dis = past(r.id); return (r.dow === 'Mon' ? '<p class="cwk">Week of ' + r.n + ' Oct · ' + P.REL[r.wk] + '</p>' : '') + '<button class="cd' + (r.id === S.today ? ' today' : '') + '" data-pickday="' + r.id + '"' + (dis ? ' disabled' : '') + '><small>' + r.dow + '</small><b>' + r.n + '</b></button>'; }).join('');
      return '<div class="scrim2" data-closea></div><div class="asheet" role="dialog" aria-label="Copy forward: pick a date"><h2>' + (S.pickMove ? 'Move “' + esc(m.t) + '” to another day' : 'Copy “' + esc(m.t) + '” forward') + '</h2><p class="hint2">Pick a date to go to. Then the meal stays in your hand until you tap a day to drop it.</p><div class="cal">' + cells + '</div></div>';
    }
    if (S.pop) return '';
    var a = S.asheet; if (!a) return '';
    var m2 = find(a.id), lock = ro(), pst = past(m2.day);
    /* Decision 127 (owner-stated): no gesture hints in brackets ("People know how to do it"), no key badges on the phone, Hold and Add missing live at the bottom of the detail now. */
    var items = '<button class="it" role="menuitem" data-act="recipe" data-id="' + m2.id + '">' + ic.book + 'Open recipe</button>';
    if (pst && !lock) items += '<button class="it" role="menuitem" data-act="copyfwd" data-id="' + m2.id + '">' + ic.cal + 'Copy forward</button><p class="hint2">Past meals are read only: no delete, move or Not cooking.</p>';
    else if (!lock) items += '<button class="it" role="menuitem" data-act="replan" data-id="' + m2.id + '">' + ic.swap + 'Replan</button><button class="it" role="menuitem" data-act="moveto" data-id="' + m2.id + '">' + ic.cal + 'Move to another day</button><button class="it" role="menuitem" data-act="nocook" data-id="' + m2.id + '">' + ic.moon + 'Not cooking</button>';
    return '<div class="scrim2" data-closea></div><div class="asheet" role="menu" aria-label="Actions for ' + esc(m2.t) + '"><h2>' + esc(m2.t) + '</h2>' + items + '</div>';
  }
  function nav() {
    var n = function (l, d, on) { return '<button class="nv' + (on ? ' on' : '') + '" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>' + l + '</button>'; };
    return '<nav class="nav" aria-label="Kitchie">' + n('Home', '<path d="M4 11l8-7 8 7v9H4z"/>') + n('Pantry', '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 9h12"/>') + n('Plan', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', 1) + n('Recipes', '<path d="M6 14a4 4 0 1 1 2-7 4 4 0 0 1 8 0 4 4 0 1 1 2 7v5H6z"/>') + n('Shopping', '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12h11l2-8H6"/>') + '</nav>';
  }
  function carryBar() { if (!S.carry || S.carry.drag) return ''; var m = S.carry; return '<div class="carry" role="status"><span class="em">' + m.em + '</span><div><b>' + esc(m.t) + '</b><small>In hand. Tap a day to drop it here.</small></div><button data-cancelcarry>Cancel</button></div>'; }
  function optionsPanel() {
    var g = function (k, lab, vals) { return '<fieldset><legend>' + lab + '</legend>' + vals.map(function (v) { return '<label><input type="radio" name="' + k + '" value="' + v[0] + '"' + (S[k] === v[0] ? ' checked' : '') + '> ' + v[1] + '</label>'; }).join('') + '</fieldset>'; };
    if (!(window.top === window || q.get('opts') === '1')) return '';
    return '<button class="optfab" data-opts aria-expanded="' + S.opts + '">Mockup options</button>' + (S.opts ? '<div class="optpanel" role="dialog" aria-label="Mockup options"><p class="onote">Mockup-only switch. It is not part of the app.</p>' +
      g('rb', 'Day ribbon (136, owner 13 Oct)', [['detail', 'Only while a detail is open (recommended)'], ['always', 'Always on, week view too (superseded 13 Oct, for comparison)']]) + g('lay', 'Layout', [['rib', 'Agenda across three weeks (recommended)'], ['focus', 'One day at a time (keeps the ribbon)']]) + g('hd', 'Header while a detail is open (91, revised by 136)', [['shrink', 'Compact (recommended)'], ['fixed', 'Full size']]) + g('f', 'Who filter (97)', [['drop', 'One dropdown (recommended)'], ['seg', 'Mine / Everyone + People dropdown'], ['strip', 'Old chips behind a chevron']]) +
      g('pc', 'Number of people in the detail (98)', [['step', 'Stepper − 4 +'], ['drop', 'Dropdown']]) + g('nc', 'Not cooking days (93)', [['hide', 'Hidden, peek at the edge (recommended)'], ['show', 'Always shown']]) + g('u', 'Undo on a phone (101)', [['day', 'On the changed day (recommended)'], ['flip', 'Copy button flips to Undo'], ['banner', 'Banner under the ribbon'], ['pill', 'Pill under the ribbon']]) +
      g('dt', 'Meal detail (103, 107)', [['stack', 'Day on top, detail at the bottom, one locked stack (recommended)'], ['peek', 'Docked, neighbours peek'], ['strip', 'Docked, other days as one line each'], ['hide', 'Docked, other days hidden'], ['sheet', 'Two-stop bottom sheet (comparison)']]) + g('st', 'Status (121, supersedes 104)', [['plain', 'Plain red or green, no count (owner, 13 Oct)'], ['labels', 'a Labelled chips: rejected'], ['badge', 'b Icon + count: rejected'], ['edge', 'c Edge strip + dot: rejected'], ['progress', 'd Progress: rejected']]) + g('gr', 'Green means (122, open)', [['list', 'Dealt with: every missing item is on the list (recommended)'], ['hand', 'Everything is on hand']]) + g('hdl', 'Grey bar on the tab (128)', [['none', 'Removed (recommended)'], ['light', 'Much lighter']]) + g('jig', 'Wiggle hint (129)', [['', 'First 3 opens, 7 days, stops after a drag'], ['1', 'Always, for review'], ['0', 'Off'], ['reset', 'Reset the stored count']]) +
      g('cu', 'Ask AI to plan this curtain (96)', [['start', 'At the start of an empty week (default)'], ['idle', 'Idle, whole week empty'], ['off', 'Off']]) + g('sw', 'Swipe', [['tint', 'Tinted reveal, commits'], ['buttons', 'Buttons stay open']]) + g('cw', 'Clear week placement (109)', [['menu', 'Week actions menu, split Undo (recommended)'], ['pair', 'Two icon buttons next to each other']]) + g('cl', 'Clear week also clears (109, open)', [['meals', 'Meals only, Not cooking stays (recommended)'], ['all', 'Meals and this-week Not cooking marks']]) + g('ba', 'Bulk Hold and Add (134, open)', [['bar', 'Bottom bar only: Hold N, cart Add N (current)'], ['list', 'In the list only: Add all on the missing group, Hold all on the on-hand group'], ['both', 'Both']]) + g('long', 'Long ingredient list (107 demo)', [['0', 'Normal'], ['1', 'Long: 21 lines, the sheet scrolls']]) + '</div>' : '');
  }

  /* ---------- render ---------- */
  function body() {
    if (S.dt === 'stack' && !S.sel && S.dday) { var dm = on(S.dday); if (dm.length) { S.sel = dm[0].id; S.dday = null; } else return stackEmptyHtml(S.dday); }
    if (S.sel && S.dt !== 'sheet' && find(S.sel)) return S.dt === 'stack' ? stackHtml(find(S.sel)) : dockHtml(find(S.sel));
    if (S.lay === 'focus') { var d = S.cur, ms = on(d), i = di(d), buy = [], ubn = []; ms.forEach(function (m) { m.miss.forEach(function (x) { buy.push(x[0]); }); m.useby.forEach(function (u) { ubn.push(u[0] + ' by ' + u[1]); }); });
      return '<h2 class="fh">' + dLong(d) + ' ' + info(d).n + ' Oct' + (d === S.today ? ' <em>Today</em>' : '') + '</h2>' + (ms.length ? '<div class="prep"><b>Before this night</b>' + (buy.length ? '<span class="m">Buy: ' + esc(buy.join(', ')) + '</span>' : '<span>Nothing to buy</span>') + (ubn.length ? '<span>Use first: ' + esc(ubn.join(', ')) + '</span>' : '') + '</div>' : '') + '<section class="pw-day' + (S.carry && !past(d) ? ' target' : '') + '" data-d="' + d + '" id="d-' + d + '" style="padding-top:0">' + noteHtml(d) + '<div class="pw-stack">' + dayBody(d) + '</div></section><div class="dnav"><button data-step="-1"' + (i > 0 ? '' : ' disabled') + '>' + ic.left + ' ' + (i > 0 ? RIB[i - 1].dow : '') + '</button><button data-step="1"' + (i < DI.length - 1 ? '' : ' disabled') + '>' + (i < DI.length - 1 ? RIB[i + 1].dow : '') + ' ' + ic.right + '</button></div>'; }
    return agenda();
  }
  function render(keep) {
    var sy = window.scrollY, rb = document.getElementById('rib'), rl = rb ? rb.scrollLeft : null, gh = null;
    /* 136: the ribbon comes and goes with the detail. It fades in (and a copy of it fades out) over 0.2 s; the stack's slot is placed for the final header height at once, so nothing under it moves. Reduced motion: none. */
    if (rb && !REDUCE) { var gr = rb.getBoundingClientRect(); gh = rb.cloneNode(true); gh.removeAttribute('id'); gh.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); }); gh.classList.add('rib-ghost'); gh.setAttribute('aria-hidden', 'true'); gh.style.cssText = 'top:' + gr.top + 'px;left:' + gr.left + 'px;width:' + gr.width + 'px'; gh.scrollLeft = rl; }
    root.innerHTML = '<div class="app' + (S.carry ? ' carrying' : '') + (S.carry && S.carry.drag ? ' dragging' : '') + '">' + header() + '<main id="plan" class="pw">' + body() + '</main></div>' + carryBar() + '<div class="peek t" id="peekT" hidden></div><div class="peek b" id="peekB" hidden></div>' + nav() + '<div class="scrim' + (S.sel && S.dt === 'sheet' ? ' on' : '') + '" data-close></div>' + sheetHtml() + '<div id="aw">' + popHtml() + wkMenu() + actionSheet() + '</div>' + optionsPanel();
    sizeStk(); if (keep !== false) window.scrollTo(0, sy);
    var rb2 = document.getElementById('rib'); if (rb2 && rl !== null) rb2.scrollLeft = rl; if (rb2 && !rb && !REDUCE) rb2.classList.add('rib-in'); placeMk(true);
    if (gh && !rb2) { document.body.appendChild(gh); gh.scrollLeft = rl; setTimeout(function () { gh.remove(); }, 230); }
    var sh = document.getElementById('sheet'); if (sh && S.sel && S.dt === 'sheet') requestAnimationFrame(function () { setSnap(S.snap); });
    syncPeek();
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
  function note(msg, o) { o = o || {}; S.note = { msg: msg, short: o.short, undo: !!o.undo, day: o.day, kind: o.kind || '', id: ++nid }; clearTimeout(noteT); var id = S.note.id; noteT = setTimeout(function () { if (S.note && S.note.id === id) { S.note = null; render(); } }, UW); }
  function snapshot() { return JSON.stringify({ m: S.meals, b: S.blocked, sel: S.sel, dd: S.dday }); }
  function mutate(fn, msg, day, kind, pulse, short) { var before = snapshot(); fn(); S.ustk.push({ k: kind || 'edit', s: before, at: Date.now(), msg: msg, short: short, day: day }); setTimeout(function expire() { if (S.carry || td) return setTimeout(expire, 1000); pruneU(); render(); }, UW + 50); S.pulse = pulse || (day ? [day] : null); note(msg, { undo: 1, day: day, kind: kind, short: short }); render(); if (day && S.lay === 'rib' && !S.sel) ensureVisible(day); if (S.pulse) setTimeout(function () { S.pulse = null; document.querySelectorAll('.pulse').forEach(function (e) { e.classList.remove('pulse'); }); }, 2600); }
  function ensureVisible(d) { var el = document.getElementById('d-' + d); if (!el) return; var r = el.getBoundingClientRect(), top = stkH() + 8; if (r.top < top || r.top > innerHeight - 220) { lockUntil = Date.now() + 700; window.scrollBy({ top: r.top - top - 4, behavior: 'smooth' }); } }
  function doUndo() { var u = topU(); if (!u) return; S.ustk.pop(); var o = JSON.parse(u.s); S.meals = o.m; S.blocked = o.b; S.sel = o.sel; S.dday = o.dd || null; S.pulse = null; S.wkm = false; var nx = topU(); note('Undid ' + (ULAB[u.k] || 'change') + (nx ? '. Next undo: ' + ULAB[nx.k] : ''), { day: u.day }); render(); evalCurtain(); }
  function nextId(b) { return b + '-' + (++nid); }

  function act(a, id) {
    var m = find(id); if (!m) return;
    if (a === 'open') return openDetail(id);
    /* Decision 127: Open recipe is a real action. Meals with a sample recipe page in this mockup (recipe/detail.html) navigate there; any other is a clearly marked stub (open question). */
    if (a === 'recipe') { S.asheet = null; if (m.rid) { location.href = '../../recipe/detail.html?id=' + m.rid + '&from=plan'; return; } note(m.src === 'saved' ? 'Stub: this sample meal has no recipe page in the mockup. In the app this opens its recipe in Recipes.' : 'Made up by your AI, so it is not a saved recipe and has no recipe page. In the app this action would be absent or offer to save it.', { day: m.day }); return render(); }
    if (a === 'copyfwd') { S.asheet = null; S.pickd = id; S.sel = null; return render(); }
    if (ro()) return; if (past(m.day) && a !== 'hold') return;
    if (a === 'moveto') { S.asheet = null; S.pickd = id; S.pickMove = true; S.sel = null; return render(); }
    if (a === 'hold') { if (past(m.day)) return; m.held = m.held ? 0 : 1; S.asheet = null; note(m.held ? 'Holding the ingredients' : 'Hold released'); return render(); }
    if (a === 'list') { var un = unlisted(m).length; if (!un) return; return mutate(function () { m.miss = m.miss.map(function (x) { return [x[0], x[1], 1]; }); m.list = m.miss.length; S.asheet = null; }, 'Added ' + un + (un === 1 ? ' item' : ' items') + ' to the shopping list', m.day); }
    var nm = esc(m.t), dn = info(m.day).dow;
    mutate(function () { S.meals = S.meals.filter(function (x) { return x.id !== id; }); if (S.sel === id) S.sel = null; S.asheet = null; if (a === 'nocook') { S.blocked[m.day] = 'once'; S.revealed = m.day; } }, a === 'nocook' ? nm + ' removed. ' + dn + ' is Not cooking' : nm + ' removed. ' + dn + ' is an open night', m.day);
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
  function openDetail(id) { var m = find(id); if (!m) return; jigStart(m); S.sel = id; S.dday = null; S.pop = null; S.asheet = null; S.wkm = false; S.cur = m.day; S.snap = 'half'; if (S.dt === 'stack' && S.hd === 'shrink') S.cmp = true; render(false); if (S.dt !== 'sheet') window.scrollTo(0, 0); }
  /* Decision 125: tapping an open night on the week opens that day's own detail (the docked stack), where Ask AI, Surprise me and Not cooking live. */
  function openDay(d) { S.dday = d; S.sel = null; S.cur = d; S.revealed = d; S.pop = null; S.asheet = null; S.wkm = false; if (S.hd === 'shrink') S.cmp = true; render(false); window.scrollTo(0, 0); }
  function block(d) { mutate(function () { S.blocked[d] = 'once'; S.cur = d; S.revealed = d; }, dName(d) + ' is Not cooking (this week only)', d); }
  function unblock(d) { mutate(function () { delete S.blocked[d]; }, dName(d) + ' is open again', d); }
  /* Surprise me (owner-confirmed heuristics, decision 94): timing aware, and never a repeat of a recent meal. */
  function surprise(d) {
    var c = P.surprise(S.meals, d, S.today); if (!c) return note('No fresh idea that is not a repeat. Try Ask AI.');
    var nm = c; nm.id = nextId('sur'); nm.day = d; nm.who = S.view === 'mine' ? ['sam'] : 'all'; nm.n = S.view === 'mine' ? 1 : 4; nm.src = 'surprise'; nm.note = ''; nm.held = 0; nm.useby = nm.useby || [];
    mutate(function () { S.meals.push(nm); }, 'Surprise: ' + esc(c.t) + ' for ' + dName(d), d);
  }
  function copyLast() {
    S.wkm = false; var wk = weekOf(S.cur), r = P.copyLast(S.meals, S.blocked, S.view, wk, S.today); if (r.why === 'readonly' || r.why === 'bounds') return;
    if (!r.add.length) { note('Nothing to fill: every open night already has a plan, or is Not cooking.', { day: S.cur }); return render(); }
    var days = r.days, from = wk - 1 === 0 ? 'this week' : 'last week';
    mutate(function () { S.meals = S.meals.concat(r.add); }, 'Copied ' + days.length + (days.length === 1 ? ' night' : ' nights') + ' from ' + from + ' (' + (S.view === 'mine' ? 'my plan' : 'household plan') + '). Open nights only', days[0], 'copy', days, 'Copied ' + days.length + (days.length === 1 ? ' night' : ' nights'));
    if (S.u === 'day' || S.u === 'flip') goDay(days[0], true);
  }
  /* Clear week (decision 109): the same scope as Copy last week. Meals only by default; no confirm because Undo is one tap, but never silent: the day says what went. */
  function clearWeek() {
    var wk = weekOf(S.cur), r = P.clearWeek(S.meals, S.blocked, S.view, wk, S.today, S.cl); S.wkm = false;
    if (r.why === 'readonly' || r.why === 'bounds') return render();
    if (r.why === 'none') { note('Nothing to clear from today on.', { day: S.cur }); return render(); }
    var nm = r.rm.length, nc = r.nc.length, a = info(r.days[0]), b = info(r.days[r.days.length - 1]), scope = S.view === 'mine' ? 'my plan' : 'household plan';
    var msg = 'Cleared ' + nm + (nm === 1 ? ' meal' : ' meals') + (nc ? ' and ' + nc + ' Not cooking mark' + (nc > 1 ? 's' : '') : '') + ', ' + a.dow + ' ' + a.n + (r.days.length > 1 ? ' to ' + b.dow + ' ' + b.n : '') + ' (' + scope + '). ' + (nc ? '' : 'Not cooking days stay.');
    mutate(function () { S.meals = S.meals.filter(function (x) { return r.rm.indexOf(x.id) < 0; }); r.nc.forEach(function (d) { delete S.blocked[d]; }); if (S.sel && r.rm.indexOf(S.sel) > -1) S.sel = null; }, msg, r.days[0], 'clear', r.days, 'Cleared ' + nm + (nm === 1 ? ' meal' : ' meals'));
    evalCurtain();
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
    mutate(function () { if (mv) S.meals = S.meals.filter(function (x) { return x.id !== src.from; }); if (ms.length) { var rid = ms[0].id; S.meals = S.meals.filter(function (x) { return x.id !== rid; }); } delete S.blocked[d]; S.meals.unshift(c); S.cur = d; }, msg, d, mv ? 'move' : 'drop', mv ? [d, src.day] : [d]);
  }

  /* ---------- navigation: continuous ribbon, scroll-linked ---------- */
  var lockUntil = 0;
  function goDay(d, quiet) {
    if (S.dt === 'stack' && (S.sel || S.dday)) return swapDock(d);
    S.cur = d; S.revealed = d; if (S.sel && S.dt !== 'sheet') { S.sel = null; render(false); }
    var el = document.getElementById('d-' + d); if (!el) { render(false); el = document.getElementById('d-' + d); } if (!el) return;
    if (S.lay === 'focus') { render(false); window.scrollTo(0, 0); return; }
    if (el.classList.contains('hid')) el.classList.remove('hid');
    var y = el.getBoundingClientRect().top + window.scrollY, cmpH = 64, full = document.getElementById('stkp').offsetHeight, go = S.hd === 'shrink' && ribOn() && y - full > 40 && !(S.note && S.u === 'flip' && S.note.undo);
    S.cmp = go; document.getElementById('stk').classList.toggle('cmp', go && ribOn()); lockUntil = Date.now() + 800;
    window.scrollTo({ top: Math.max(0, y - (go ? stkH() : full) - 6), behavior: 'smooth' }); syncHead(); setTimeout(function () { follow(true); }, 850);
  }
  /* Decision 115: with the stack open a tap on the ribbon keeps the slot where it is and swaps only what is in it: that day's first meal and its detail, or its open-night, Not cooking or past state. */
  function swapDock(d) {
    var ms = on(d), keep = S.sel && find(S.sel) && find(S.sel).day === d ? find(S.sel) : ms[0];
    S.jigOn = false; if (S.jig === '1') jigStart(keep);
    S.cur = d; S.revealed = d; S.pop = null; S.asheet = null; S.wkm = false; S.snap = 'half'; S.sel = keep ? keep.id : null; S.dday = keep ? null : d; S.swap = true;
    render(false); S.swap = false;
    var sb = document.querySelector('.stackw'); if (sb) { sb.classList.add('swapped'); setTimeout(function () { sb.classList.remove('swapped'); }, 400); }
  }
  function syncHead() {
    var r = info(S.cur), t = document.getElementById('wkt'), s = document.getElementById('wks'); if (t) t.textContent = 'Week of ' + info(r.mon).n + ' Oct'; if (s && !(S.note && S.u === 'flip' && S.note.undo)) s.textContent = P.REL[r.wk];
    document.querySelectorAll('.dy').forEach(function (b) { var o = b.dataset.dy === S.cur; b.classList.toggle('on', o); b.setAttribute('aria-selected', o); }); placeMk(false);
    var hd = document.querySelector('.hd'), tdy = hd && hd.querySelector('.tdy'); if (hd && S.cur !== S.today && !tdy) { var b = document.createElement('button'); b.className = 'tdy'; b.dataset.today = ''; b.setAttribute('aria-label', 'Jump to today'); b.textContent = 'Today'; hd.insertBefore(b, hd.querySelector('.sp').nextSibling); } else if (tdy && S.cur === S.today) tdy.remove();
    var cb = document.querySelector('.cpy'); if (cb && !flipKind() && !S.wkm) cb.outerHTML = wkCtl();
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
    Object.keys(S.blocked).forEach(function (d) { var el = document.getElementById('d-' + d); if (!el || el.classList.contains('hid') || d === S.cur || d === S.revealed) return; if (S.revealed === d) return; var r = el.getBoundingClientRect(), above = r.bottom <= stkH() + 4, h = el.offsetHeight + parseFloat(getComputedStyle(el).marginBottom || 0); if (r.bottom < 0 || r.top > innerHeight || above || r.top > innerHeight - 64) { el.classList.add('hid'); if (above) window.scrollBy(0, -h); } });
    if (S.revealed && S.revealed !== S.cur) S.revealed = null;
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
    var id = d.mc.dataset.id, t = d.dx, right = d.past ? 'copyfwd' : 'nocook';
    if (S.sw === 'tint') { if (t > TH) return act(right, id); if (t < -TH) return act('replan', id); d.mc.style.transform = ''; d.sw.classList.remove('l', 'r', 'ready'); return; }
    var to = t > TH / 2 ? OPEN : t < -TH / 2 ? -OPEN : 0; d.mc.style.transform = to ? 'translateX(' + to + 'px)' : ''; d.mc.dataset.open = to; if (!to) d.sw.classList.remove('l', 'r', 'ready'); else { d.sw.classList.add(to > 0 ? 'l' : 'r'); d.sw.dataset.id = id; d.sw.dataset.right = right; }
  }
  document.addEventListener('pointerup', function (e) { ribTouch = false; endDrag(e); }); document.addEventListener('pointercancel', function (e) { ribTouch = false; endDrag(e); });
  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.sw.btns');
    if (sw && sw.querySelector('.mc').dataset.open && !e.target.closest('.mc')) { var id = sw.dataset.id, o = +sw.querySelector('.mc').dataset.open; return act(o > 0 ? sw.dataset.right : 'replan', id); }
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
  function beginDrag(id, x, y, pid) {
    var m = find(id); if (!m) return; S.carry = JSON.parse(JSON.stringify(m)); S.carry.move = true; S.carry.from = id; S.carry.drag = true; S.sel = null; S.dday = null; S.wkm = false;
    if (!td) td = { id: id, pid: pid, on: true, x: x, y: y, px: x, py: y }; td.on = true;
    hand = document.createElement('div'); hand.className = 'hand'; hand.id = 'hand'; hand.innerHTML = '<div class="hand-p"><span class="em">' + m.em + '</span><div><b>' + esc(m.t) + '</b><small>from ' + dName(m.day) + '</small></div></div>'; tear = { edge: 'top', on: 0 }; document.body.appendChild(hand);
    try { document.body.setPointerCapture(pid); } catch (z) { }
    render(false); S.cur = m.day;
    var el = document.getElementById('d-' + m.day); if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - stkH() - 4));
    moveHand(x, y); autoT = requestAnimationFrame(auto);
  }
  function moveHand(x, y) { if (!hand) return; td.px = x; td.py = y; tearUpdate(x, y); hand.style.transform = 'translate(' + Math.round(x - hand.offsetWidth / 2) + 'px,' + Math.round(y - hand.offsetHeight - 14) + 'px) rotate(-1.5deg)'; hov(x, y); }
  /* Decision 118: the tear. Where the tile leaves the stack its edge is ragged like torn paper; the piece left behind (the dashed place-holder in the week) has the matching ragged edge.
     Cheap: no assets, one clip-path polygon per edge built once from a fixed row of tooth depths; --tz (0 to 1, grows over the first 36 px of the drag) scales the teeth.
     The torn edge is the one that faces where the tile came from (drag down: the tile's top edge, the place-holder's bottom edge). prefers-reduced-motion: full teeth at once, no growth. */
  var tear = null, TD = [2.5, 5.5, 2, 7, 4, 6.5, 1.5, 5, 7, 3, 5.5, 2, 4, 7, 3.5, 5.5, 1.5, 6.5, 4, 7, 3, 5];
  function tearPts(edge, k, n) {
    var pts = [], i, t, v, vr;
    for (i = 0; i < n; i++) { t = (i / (n - 1) * 100).toFixed(1) + '%'; v = 'calc(var(--tz,1)*' + (TD[i % TD.length] * k).toFixed(1) + 'px)'; vr = 'calc(100% - var(--tz,1)*' + (TD[(i * 3 + 1) % TD.length] * k).toFixed(1) + 'px)';
      pts.push(edge === 'top' ? t + ' ' + v : edge === 'bottom' ? t + ' ' + vr : edge === 'left' ? v + ' ' + t : vr + ' ' + t); }
    return pts;
  }
  function tearPoly(edge, k, n) { return 'polygon(' + tearPts(edge, k, n).concat(edge === 'top' ? ['100% 100%', '0 100%'] : edge === 'bottom' ? ['100% 0', '0 0'] : edge === 'left' ? ['100% 100%', '100% 0'] : ['0 100%', '0 0']).join(',') + ')'; }
  /* the pale fringe of torn fibre along the cut, as a band between the cut line and a smoother line outside it */
  function tearBand(edge, n) { return 'polygon(' + tearPts(edge, 1, n).concat(tearPts(edge, .4, n).reverse()).join(',') + ')'; }
  var OPP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  function tearUpdate(x, y) {
    if (!tear || !td) return; var dx = x - td.x, dy = y - td.y, dist = Math.hypot(dx, dy), e = tear.edge, ne = Math.abs(dy) >= Math.abs(dx) ? (dy >= 0 ? 'top' : 'bottom') : (dx >= 0 ? 'left' : 'right');
    if (dist > 14 && ne !== e && Math.abs(Math.abs(dx) - Math.abs(dy)) > 10) e = ne;
    var tz = REDUCE ? 1 : Math.min(1, dist / 36), ph = document.querySelector('.mc.lifted');
    hand.style.setProperty('--tz', tz.toFixed(2)); if (ph) { ph.style.setProperty('--tz', tz.toFixed(2)); ph.parentNode.style.setProperty('--tz', tz.toFixed(2)); }
    if (e !== tear.on) { var n = e === 'top' || e === 'bottom' ? 22 : 6;
      hand.dataset.tear = e; hand.style.setProperty('--tin', tearPoly(e, 1, n)); hand.style.setProperty('--tfib', tearPoly(e, .5, n));
      if (ph) { var oe = OPP[e], pn = e === 'top' || e === 'bottom' ? 26 : 6; ph.dataset.tear = oe; ph.style.setProperty('--tpl', tearPoly(oe, 1, pn)); ph.parentNode.style.setProperty('--tfp', tearBand(oe, pn)); }
      tear.on = e; tear.edge = e; }
  }
  function secAt(x, y) { var el = document.elementFromPoint(x, y), sec = el && el.closest ? el.closest('.pw-day') : null; return sec && !sec.classList.contains('past') ? sec.dataset.d : null; }
  function hov(x, y) { var d = secAt(x, y); document.querySelectorAll('.pw-day.over').forEach(function (e) { if (e.dataset.d !== d) e.classList.remove('over'); }); if (d && S.carry && d !== S.carry.day) { var s = document.getElementById('d-' + d); if (s) s.classList.add('over'); } }
  function auto() { if (!hand || !td) return; var y = td.py, top = stkH() + 56, bot = innerHeight - 64 - 64; if (y > bot) window.scrollBy(0, Math.min(18, (y - bot) / 3 + 3)); else if (y < top) window.scrollBy(0, -Math.min(18, (top - y) / 3 + 3)); hov(td.px, td.py); autoT = requestAnimationFrame(auto); }
  function endHand(x, y, cancelled, why) {
    var o = td; td = null; tear = null; cancelAnimationFrame(autoT); if (hand) { hand.remove(); hand = null; } supp = Date.now() + 400; document.querySelectorAll('.over').forEach(function (e) { e.classList.remove('over'); });
    var d = cancelled ? null : secAt(x, y);
    if (d && S.carry && d !== S.carry.day) return drop(d);
    var m = S.carry && find(S.carry.from); S.carry = null;
    note((why || 'Dropped outside a day') + '. Not moved: ' + (m ? esc(m.t) + ' stays on ' + dName(m.day) : 'nothing changed'), { day: m ? m.day : S.cur }); render();
  }
  function cancelDrag(why) { if (td) endHand(td.px, td.py, true, why); }
  function upHand(e) { if (!td || e.pointerId !== td.pid) return; if (!td.on) { td = null; return; } endHand(e.clientX, e.clientY, e.type === 'pointercancel', e.type === 'pointercancel' ? 'Drag interrupted' : 'Dropped outside a day'); }
  document.addEventListener('pointerup', upHand); document.addEventListener('pointercancel', upHand);

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
    if (S.carry && t && !d.cancelcarry && !d.dy && !d.today && !d.opts && !d.undo && !t.closest('.nav') && t.closest('.pw-day')) { return drop(t.closest('.pw-day').dataset.d); }
    if (!t) { if (S.cuShown) idleReset(); return; }
    if (S.cuShown && d.curtain === undefined) idleReset();
    if (t.classList.contains('mc') && t.dataset.moved) return;
    if (d.opts !== undefined) { S.opts = !S.opts; return render(); }
    if (d.more) { S.asheet = { k: 'm', id: d.more }; return render(); }
    if (d.closea !== undefined) { S.asheet = null; S.pop = null; S.pickd = null; S.pickMove = false; S.wkm = false; return render(); }
    if (d.wkmenu !== undefined) { S.wkm = !S.wkm; return render(); }
    if (d.wk) { return d.wk === 'copy' ? copyLast() : clearWeek(); }
    if (d.clearw !== undefined) return clearWeek();
    if (d.tongue !== undefined) { if (e.detail === 0) closeDetail(); return; }
    if (d.act) return act(d.act, d.id);
    if (d.fmenu !== undefined) { S.pop = { k: 'f', q: '' }; render(); var f = document.getElementById('fq'); return; }
    if (d.view) { S.view = d.view; S.pop = null; S.asheet = null; if (S.sel && !P.match(find(S.sel), S.view)) S.sel = null; S.cuDone = {}; render(); return syncHead(); }
    if (d.expand !== undefined) { S.expand = !S.expand; return render(); }
    if (d.hl) { S.hl = S.hl === d.hl ? null : d.hl; return render(); }
    if (d.dy !== undefined) return goDay(d.dy);
    if (d.peek) return goDay(d.peek);
    if (d.today !== undefined) return goDay(S.today);
    if (d.step) { S.cur = DI[di(S.cur) + (+d.step)]; S.revealed = S.cur; render(false); return syncHead(); }
    if (d.copy !== undefined) return copyLast();
    if (d.undo !== undefined) return doUndo();
    if (d.close !== undefined) return closeDetail();
    if (d.grab !== undefined) { if (Date.now() - lastMove < 150) return; return setSnap(S.snap === 'half' ? 'full' : 'half'); }
    if (d.hold !== undefined) return act('hold', S.sel); if (d.replan !== undefined) return act('replan', S.sel); if (d.nocook !== undefined) return act('nocook', S.sel); if (d.addall !== undefined) return act('list', S.sel);
    if (d.addone) { var m = find(S.sel); return mutate(function () { m.miss = m.miss.map(function (x) { return x[0] === d.addone ? [x[0], x[1], 1] : x; }); m.list = m.miss.filter(function (x) { return x[2]; }).length; }, esc(d.addone) + ' added to the shopping list', m.day); }
    if (d.n) { var mm = find(S.sel); mm.n = Math.max(1, mm.n + (+d.n)); return render(); }
    if (d.openday) return openDay(d.openday);
    if (d.block) return block(d.block);
    if (d.unblock) return unblock(d.unblock);
    if (d.ask) { note('Ask AI opens your default AI app, scoped to ' + dName(d.ask) + '. Nothing happens inside Kitchie.', { day: d.ask }); return render(); }
    if (d.surprise) return surprise(d.surprise);
    if (d.curtain !== undefined) { S.cuDone[weekOf(S.cur)] = true; showCurtain(false); note('Ask AI opens your default AI app with the week of ' + info(info(S.cur).mon).n + ' Oct. Nothing happens inside Kitchie.'); return render(); }
    if (d.cancelcarry !== undefined) { S.carry = null; S.pickMove = false; return render(); }
    if (d.pickday) return startCarry(S.pickd, d.pickday);
    if (t.classList.contains('mc')) { if (t.dataset.tile) return; return openDetail(t.dataset.id); }
  });
  document.addEventListener('change', function (e) { if (e.target.dataset && e.target.dataset.pcsel !== undefined) { var m = find(S.sel); m.n = +e.target.value; return render(); } var n = e.target.name; if (n && S[n] !== undefined) { S[n] = e.target.value; if (n === 'jig' && S.jig === 'reset') { try { localStorage.removeItem(JK); } catch (x) { } S.jig = ''; } S.hl = null; S.opts = true; if (n === 'cu') { S.cuDone = {}; S.cuShown = false; } render(); syncHead(); } });
  document.addEventListener('input', function (e) { if (e.target.id === 'fq' && S.pop) { S.pop.q = e.target.value; var pos = e.target.selectionStart; document.getElementById('aw').innerHTML = popHtml() + wkMenu() + actionSheet(); var f = document.getElementById('fq'); f.focus(); f.setSelectionRange(pos, pos); } });
  document.addEventListener('keydown', function (e) {
    if ((e.target.tagName || '').toLowerCase() === 'input') { if (e.key === 'Escape') { S.pop = null; render(); } return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return; var k = e.key;
    if (k === 'Escape') { if (td && td.on) { cancelDrag('Cancelled with Esc'); } else if (S.carry) { S.carry = null; S.pickMove = false; render(); } else if (S.wkm) { S.wkm = false; render(); } else if (S.pickd || S.asheet || S.pop) { S.pickd = S.asheet = S.pop = null; S.pickMove = false; render(); } else if (S.sel || S.dday) closeDetail(); return; }
    var a = document.activeElement, id = a && a.classList.contains('mc') ? a.dataset.id : S.sel;
    if (k.toLowerCase() === 'z') { return doUndo(); }
    if (k.toLowerCase() === 'x' && id) { e.preventDefault(); return act(e.shiftKey ? 'nocook' : 'replan', id); }
    if (k.toLowerCase() === 'h' && id) return act('hold', id); if (k.toLowerCase() === 'l' && id) return act('list', id);
    if ((k.toLowerCase() === 'e' || (k === 'Enter' && a && a.classList.contains('mc'))) && id) { e.preventDefault(); return act('open', id); }
    if (a && a.dataset && a.dataset.tongue !== undefined && (k === 'ArrowDown' || k === 'Enter')) { e.preventDefault(); return closeDetail(); }
    if (a && a.id === 'grab' && (k === 'ArrowUp' || k === 'ArrowDown')) { e.preventDefault(); return setSnap(k === 'ArrowUp' ? 'full' : 'half'); }
  });
  window.addEventListener('resize', function () { sizeStk(); placeMk(true); });
  function resetDemo() { if (hand) { hand.remove(); hand = null; } td = null; cancelAnimationFrame(autoT); S.meals = JSON.parse(JSON.stringify(P.meals)); S.blocked = JSON.parse(JSON.stringify(P.blocked)); S.sel = null; S.dday = null; S.carry = null; S.note = null; S.pulse = null; S.ustk = []; S.pop = null; S.asheet = null; S.wkm = false; S.cmp = true; }
  function showWeek(d) { S.sel = null; S.dday = null; S.carry = null; S.cur = d; S.cmp = true; render(false); var el = document.getElementById('d-' + d); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - stkH() - 6); syncHead(); }
  window.__plan = { resetDemo: resetDemo, showWeek: showWeek, find: find, stkH: stkH, openDetail: openDetail, closeDetail: closeDetail, beginDrag: beginDrag, moveHand: moveHand, endHand: endHand, clearWeek: clearWeek, S: S, act: act, goDay: goDay, drop: drop, startCarry: startCarry, surprise: surprise, copyLast: copyLast, render: render, syncHead: syncHead, follow: follow };

  if (S.sel && S.dt === 'stack') jigStart(find(S.sel));
  render(false);
  if (q.get('demo')) { document.body.classList.add('hasdemo'); var ds = document.createElement('script'); ds.src = 'demo.js'; document.body.appendChild(ds); }
  if (q.get('carry')) { var cm = find(q.get('carry')); if (cm) { S.carry = JSON.parse(JSON.stringify(cm)); render(false); } }
  if (q.get('pick')) { S.pickd = q.get('pick'); render(false); }
  if (S.lay === 'rib' && !S.sel && !q.get('top') || q.get('day')) { requestAnimationFrame(function () { var el = document.getElementById('d-' + S.cur); if (el && di(S.cur) > 0) { var y = el.getBoundingClientRect().top + window.scrollY - document.getElementById('stkp').offsetHeight - 4; window.scrollTo(0, Math.max(0, y)); } lastY = window.scrollY; follow(true); evalCurtain(); }); } else evalCurtain();
})();
