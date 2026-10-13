/* Plan UI review, phone: the scripted sequence for decisions 107, 108, 115 and 118 (owner-stated, 12 and 13 Oct 2026). Loaded only when the URL has ?demo=1 (DESIGN.md section 6: load on engagement).
   ?demo=1            auto-play, loops; Prev, Pause and Next under the stack
   ?demo=1&frame=3    one frame, still (cap=0 hides the caption bar, used for the screenshots)
   ?demo=agenda       the lift and shift straight from the plain week view, 7 frames (decisions 142 to 146): 1 week, 2 press and hold lifts the tile, 3 picked up and carried (plain, no tear), 4 dropped on a day with a meal (Replaced, pulse, Undo),
                      5 a past tile lifted to copy forward and a past day refusing it, 6 the detail drag-out is the ONLY torn one, 7 a quick sideways swipe still reveals the swipe actions (no lift)
   ?demo=open         the open day, 6 frames (decisions 147 to 153, 154, 155, 183): 1 the dashed open day, 2 right swipe reveals Not cooking, 3 Not cooking with Undo (3 s), 4 tap the Not cooking tile: the LIGHT panel (Ask AI, Surprise me, Mark as open), 5 tap an open night: the SAME card (Ask AI, Surprise me, Not cooking), 6 Not cooking from that card: the card swaps in place, Undo inside it (14 s)
   ?demo=nc           the 13 Oct live-test round (decisions 154 to 158), 8 frames: 1 a collapsed Not cooking day with the ECG marker on the divider line, 2 one tap opens it (no marker on the opened day, 178), 3 a gap of two days, 4 one tap opens both, 5 tap a Not cooking day: the light panel, 6 the open-day swipe and its 3 s Undo, 7 the tear in the plain agenda (top and bottom edges only), 8 scroll on and the opened days fold back, the flat marker returns (178, Proposal)
   ?demo=week         the week header and bulk actions (decisions 159 to 177), 12 frames: 1 label row with nights, moon and open-box counts, buttons below, 2 Add to buy then Undo, 3 Add to buy gone, Reserve alone, 4 Reserve then Undo, 5 everything held: Release, 6 one meal held by itself: Reserve with the rest, 7 Release then Undo, 8 nothing missing and nothing on hand: no strip, 9 several Not cooking and several open nights, 10 the counts after a swipe, 11 next week with a long label (sample meals seeded for this frame only), 12 the old strip (?ws=counts, superseded). Last week (read only, no strip, no indicators) is in the screenshots
   Frames (?demo=1): 1 week plan, 2 tap a day: the day docks top and the sheet docks bottom, 3 tap another day in the ribbon: the contents of the stack swap, the slot stays (115),
           4 start dragging the tile and it tears off, a ragged edge on the tile and on the piece left behind (118), 5 dragged to a day, torn all the way, 6 let go on a day,
           7 alternative: close the stack, the ribbon goes and the week returns. It drives the same code a finger does (beginDrag, moveHand, endHand, closeDetail). */
(function () {
  var A = window.__plan, q = new URLSearchParams(location.search), AG = q.get('demo') === 'agenda', OP = q.get('demo') === 'open', NC = q.get('demo') === 'nc', WKD = q.get('demo') === 'week', N = OP ? 6 : 7, cur = 1, timer = null, playing = true;
  var CAPD = [
    ['Week plan, no ribbon', 'The week view has no day ribbon (136): a slim header, then the agenda across three weeks. Wed 14 has a meal. Tap it.'],
    ['Tap a day with a meal', 'The ribbon fades in, docked under the header, only now (136). The day docks directly under it and the detail at the bottom. One stack, no gap, no overlay; the stack does not move when the ribbon appears.'],
    ['Tap another day in the ribbon', 'The ribbon stays docked and scrollable. The stack does not close and does not move: only what is in it swaps to Thu 15 (or to an open night, Not cooking or a past day).'],
    ['Start dragging: it tears', 'The tile comes off the docked detail with a ragged, torn-paper edge on its top (or bottom) edge, and the piece left behind has the matching edge. The tear is on every lift-and-drag now (158) but only ever on the top and bottom edge, never a side. The tile fades and tilts as before. Reduced motion: the edge is there at once, no growth.'],
    ['Dragged to a day', 'The week plan is back under the finger, the tile in hand. Every day is a drop target, even a hidden Not cooking day (Sat).'],
    ['Let go on a day', 'Sat was Not cooking, so it is a cooking day now. Wed is an open day (the dashed box). The day says what happened, and Undo is on the day.'],
    ['Or close instead', 'Close the stack (x, Esc, handle down, swipe down) and the ribbon fades out; the week plan returns, scrolled to Wed.']
  ];
  var CAPA = [
    ['Week plan, nothing open', 'The plain week view. No detail is open. Wed 14 has the curry; Thu has two meals. Every tile can be lifted from here (143, 144).'],
    ['Press and hold: it lifts', 'Hold a tile about a third of a second without moving more than 8 px: it rises, grows, tilts and casts a deeper shadow. A quick sideways swipe still reveals the swipe actions (frame 7); a vertical move scrolls.'],
    ['Pick it up and carry it', 'Move and it is in hand, with the torn top edge (158, owner-stated: the same tear in the agenda, top and bottom edges only), the opacity fade on the place-holder and the tilt. The week shows every day, even Sat, which is Not cooking. The week scrolls near the top and bottom edge and across the three weeks.'],
    ['Drop on a day with a meal', 'Let go on Thu: the curry replaces Salmon patties and the day says so, pulses and offers Undo, which expires on its own. Wed is an open day (the dashed box). Dropping outside a day, Esc or a cancelled touch moves nothing and says so.'],
    ['A past tile: copy forward only', 'A past meal lifts the same way but only copies: the original stays. Past days are read only, so a tile over one shows a red outline and a drop there is refused with a note.'],
    ['The tear on every drag', 'Dragging the tile out of the docked detail has the same torn top or bottom edge as the plain week (158, owner-stated 13 Oct; this reverses 142). Never a side edge. ?tear=detail restores the old detail-only scoping for comparison.'],
    ['A swipe is still a swipe', 'A quick sideways move reveals the swipe actions (Replan, Not cooking) and never lifts. The hold has to start before any real movement, so the two gestures cannot fight.']
  ];
  var CAPO = [
    ['The open day, UAT\'s dashed box', 'An open day on the plain week is the faint dashed rounded box beside the day label (Sun 18 and the days below), no words and no buttons (147, owner-stated: "The open day with this visual is great"). Tap it for that day\'s light card (183).'],
    ['Right swipe: Not cooking', 'A right swipe on the open day shows the tinted Not cooking reveal, the same as on a meal tile (148, owner-stated: "Right swipe to making not cooking"). Past days and other people\'s plans have no swipe. Keys: Shift X.'],
    ['Not cooking, with Undo', 'The day is Not cooking (this week only), in the muted grey of the past days (156), with Undo in place on the tile. For this swipe the Undo lasts 3 seconds (155, owner-stated); other undos keep 14 s (130). The tile then hides once you move on (92, 96).'],
    ['Tap a Not cooking day', 'A light panel docks under the ribbon: the day, Ask AI, Surprise me and Mark as open. No tile, people, ingredients or time, and the week stays under it (154, owner-stated: the full detail "blocks"). The day stays Not cooking until you mark it open or pick Surprise me.'],
    ['Tap an open night: the same card', 'Wed 21 opens the same light card as a Not cooking day (183, owner-stated: "Open night should behaviour like not cooking night. No need for empty area"): the day, a quiet "Open night", Ask AI, Surprise me and Not cooking, the mirror of Mark as open. No tongue and no empty sheet; the week stays under it. It stays until closed, another day is tapped, or you act.'],
    ['Not cooking from the card', 'The night is marked and the card swaps to the Not cooking version in place (Proposal, 183): moon line, Mark as open, and the Undo inside the card for 14 s. The 3 s Undo is only for the right swipe (155).']
  ];
  var CAPN = [
    ['A collapsed Not cooking day', 'Sat 17 is Not cooking and collapsed, so the week reads quietly. The start of the divider line above Sun carries a small ECG marker: it beats once and goes flat (157, owner-stated). The peek at the scroll edge is unchanged (96).'],
    ['Tap the marker: the day opens', 'One tap opens what is hidden in that gap, here just Saturday. Not cooking is the muted grey of last week (156). The opened day has no marker (178, owner-stated: the ECG is "for when the cooking is hidden"); it folds back by itself when you scroll on.'],
    ['A gap of two days', 'Mon 19 and Tue 20 are both Not cooking and collapsed: one marker, at the start of the line above Wed 21.'],
    ['One tap opens all of them', 'Both days open at once (owner-stated: "if multiple days ... it should open up all of them"). No marker on them now (178).'],
    ['Tap a Not cooking day', 'The light panel: day, Ask AI, Surprise me, Mark as open (154). The week stays under it and the day stays Not cooking. An open night opens the same card with Not cooking as the third button (183).'],
    ['Right swipe an open day', 'Not cooking, with the Undo in place on the tile. For this swipe the Undo lasts 3 seconds (155, owner-stated).'],
    ['The tear in the plain agenda', 'Hold a tile and drag it: the torn edge shows on the top (dragging down) or bottom (dragging up) only, with the fade on the place-holder and the tilt of the tile in hand (158).'],
    ['Scroll on: the opened days fold back', 'Mon 19 and Tue 20 were opened, then scrolled out of view. They are hidden again and the flat marker is back in the gap, the same as the peek rule (96) always did for a revealed day. Nothing to tap to close (178, Proposal; the cost is that a day you want to keep open folds back when you scroll past it).']
  ];
  var CAPW = [
    ['Label row: nights, moon, open box. Buttons below', 'On the right of "Week of 12 Oct  This week": "5 of 7 nights", then the moon with a number (Not cooking nights) and a tiny dashed box with a number (open nights), no words (168 to 170: owner-stated; the icon details are Proposals). Under the row, Add to buy and Reserve appear only because something is missing and something on hand can be reserved.'],
    ['Add to buy, then Undo in place', 'One tap lists every missing item from today on (160). The button flips to Undo for 14 s (166, Proposal); Reserve stays because it still applies.'],
    ['Add to buy has gone, Reserve is alone', 'After the Undo window nothing is missing, so Add to buy is not drawn, not dimmed (168, owner-stated; 172, Proposal). Reserve takes the row.'],
    ['Reserve, then Undo in place', 'One tap holds everything on hand from today on, the same Held as the per-meal Hold (176). The button flips to Undo for 14 s; Add to buy stays.'],
    ['Everything held: Reserve reads Release', 'When everything on hand this week is held, the button says Release and the number is the held items (173, owner-stated words; the state rule is a Proposal). It is in the held green, like the per-meal Release (174).'],
    ['One meal held by itself: Reserve with the rest', 'Thu 15 Salmon patties was held with its own Hold (item level). The week button still reads Reserve, now with the smaller number of items not held yet (173, Proposal). ?rs=both draws Release beside it; ?rs=any makes any hold turn it into Release.'],
    ['Release, then Undo in place', 'Release lets go of everything held this week. It flips to Undo for 14 s, then Reserve is back (173, 175, Proposals). Undo reverses the last action; Release is a state, so it stays after the window.'],
    ['Nothing missing, nothing on hand: no strip', 'Every missing item is listed and nothing on hand is left to reserve or release, so there is no button row at all, only the label row with its indicators (168, owner-stated).'],
    ['Several Not cooking and several open nights', 'Thu 15 and Sat 17 are Not cooking, Wed 14, Fri 16 and Sun 18 are open: the moon with 2 and a dashed box with 3, nothing for zero (169 to 171). Counts are nights from today on; a past day of this week is not counted (Proposal).'],
    ['The counts follow the week', 'Sun 18 was just marked Not cooking: the dashed box goes from 3 to 2 and the moon from 2 to 3. Undo, Mark as open, a drop or a new meal change them the same way (171).'],
    ['Next week, a long label', 'Next week has the same label row: "Week of 19 Oct  Next week", its nights and indicators on one line, no wrap (171). Each week counts its own nights. Last week has no indicators, as in #151.'],
    ['For comparison: the old strip', 'The old passive strip (4/7 nights, to buy, use first, with the highlight filter), still available as ?ws=counts. Superseded by 159 to 161; it shows no moon or open-box indicators.']
  ];
  var CAP = WKD ? CAPW : NC ? CAPN : OP ? CAPO : AG ? CAPA : CAPD; if (NC) N = 8; if (WKD) N = 12;
  function rect(sel) { var e = document.querySelector(sel); return e ? e.getBoundingClientRect() : null; }
  function buildA(n) {
    A.resetDemo(); A.showWeek('d14'); var S = A.S, tile = function (id) { var e = document.querySelector('.pw-day .mc[data-id="' + id + '"]'); return e ? e.getBoundingClientRect() : null; };
    if (n === 1) return;
    if (n === 7) { var sw = document.querySelector('#d-d14 .sw'), mc = sw && sw.querySelector('.mc'); if (mc) { sw.classList.add('r', 'ready'); mc.style.transform = 'translateX(-110px)'; } return; }
    if (n === 6) { A.openDetail('wed-curry'); var t = rect('.mc[data-tile]'), x = t ? t.left + t.width / 2 : 195, y = t ? t.top + t.height / 2 : 200; A.beginDrag('wed-curry', x, y, 99); A.moveHand(x + 4, y + 26); return; }
    if (n === 2) { var m = document.querySelector('#d-d14 .mc'); if (m) m.classList.add('hold'); return; }
    if (n === 5) { var pid = S.meals.filter(function (m) { return m.day === 'd11'; })[0].id, d11 = document.getElementById('d-d11'); window.scrollTo(0, d11.getBoundingClientRect().top + scrollY - A.stkH() - 140); var r = tile(pid), px = r.left + r.width / 2, py = r.top + r.height / 2; A.beginDrag(pid, px, py, 99, { src: 'agenda', copy: true }); var past = rect('#d-d10') || rect('#d-d11'); A.moveHand(px, past ? past.top + past.height / 2 : py + 40); return; }
    var r0 = tile('wed-curry'), x0 = r0 ? r0.left + r0.width / 2 : 200, y0 = r0 ? r0.top + r0.height / 2 : 200;
    A.beginDrag('wed-curry', x0, y0, 99, { src: 'agenda' });
    function toDay(d) { var e = document.getElementById('d-' + d); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight / 2 + e.offsetHeight / 2); var r = e.getBoundingClientRect(); return [200, r.top + r.height / 2]; }
    var c = toDay(n === 3 ? 'd17' : 'd15'); A.moveHand(c[0], c[1]);
    if (n === 3) return; A.endHand(c[0], c[1]);
  }
  function buildO(n) {
    A.resetDemo(); A.showWeek('d17'); var S = A.S, sw = document.querySelector('#d-d18 .sw.od-sw'), od = sw && sw.querySelector('.od');
    if (n === 1) return;
    if (n === 2) { if (od) { sw.classList.add('l', 'ready'); od.style.transform = 'translateX(150px)'; } return; }
    if (n === 3) { A.block('d18', 3000); return; }
    if (n >= 5) { A.openDay('d21'); if (n === 6) A.block('d21'); return; }
    S.blocked.d18 = 'once'; A.render(false); A.openDay('d18');
  }
  function buildN(n) {
    A.resetDemo(); var S = A.S, ec = function (k) { var b = document.querySelector('.ecg[data-ecg="' + k + '"]'); if (b) b.click(); };
    if (n >= 3 && n <= 4) { S.blocked.d19 = 'once'; S.blocked.d20 = 'once'; }
    A.showWeek(n >= 3 && n <= 4 ? 'd21' : n === 5 ? 'd17' : 'd16'); var el;
    if (n === 1) return; if (n === 2) { ec('d17'); return; }
    if (n === 3 || n === 4) { A.render(false); el = document.getElementById('d-d21'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - A.stkH() - 110); if (n === 4) ec('d19,d20'); return; }
    if (n === 5) { ec('d17'); A.openDay('d17'); return; }
    if (n === 8) { S.blocked.d19 = 'once'; S.blocked.d20 = 'once'; A.showWeek('d21'); A.render(false); el = document.getElementById('d-d21'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - A.stkH() - 110); ec('d19,d20'); setTimeout(function () { window.scrollBy(0, 900); setTimeout(function () { var e = document.getElementById('d-d21'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - A.stkH() - 110); }, 600); }, 1500); return; }
    if (n === 6) { A.block('d18', 3000); return; }
    A.showWeek('d14'); var t = document.querySelector('.pw-day .mc[data-id="wed-curry"]').getBoundingClientRect(), x = t.left + t.width / 2, y = t.top + t.height / 2;
    A.beginDrag('wed-curry', x, y, 99, { src: 'agenda' }); A.moveHand(x + 6, y + 36);
  }
  function buildW(n) {
    A.resetDemo(); var S = A.S, go = function (k) { S.cur = ['d05', 'd12', 'd19'][k]; var w = document.querySelectorAll('.wkd')[k]; if (w) window.scrollTo(0, w.getBoundingClientRect().top + scrollY - 70); A.syncHead(); setTimeout(A.syncHead, 150); }, tap = function (sel) { var b = document.querySelector(sel); if (b) b.click(); };
    var seed = function () { S.meals.filter(function (m) { var d = +m.day.slice(1); return d >= 13 && d <= 18; }).forEach(function (m) { var c = JSON.parse(JSON.stringify(m)); c.id = 'n-' + m.id; c.day = 'd' + (+m.day.slice(1) + 7); c.held = 0; if (!S.blocked[c.day]) S.meals.push(c); }); };
    var wk = function (m) { var d = +m.day.slice(1); return d >= 12 && d <= 18; };
    S.ws = 'actions'; A.render(false); go(1);
    if (n === 1) return;
    if (n === 2) { tap('.wact [data-wbuy="0"]'); go(1); return; }
    if (n === 3) { tap('.wact [data-wbuy="0"]'); S.ustk = []; A.render(false); go(1); return; }
    if (n === 4) { tap('.wact [data-wres="0"]'); go(1); return; }
    if (n === 5) { tap('.wact [data-wres="0"]'); S.ustk = []; A.render(false); go(1); return; }
    if (n === 6) { S.meals.forEach(function (m) { if (m.id === 'thu-salmon') m.held = 1; }); A.render(false); go(1); return; }
    if (n === 7) { tap('.wact [data-wres="0"]'); S.ustk = []; A.render(false); tap('.wact [data-wrel="0"]'); go(1); return; }
    if (n === 8) { S.meals.forEach(function (m) { if (wk(m)) { m.have = []; m.held = 0; m.miss = m.miss.map(function (x) { return [x[0], x[1], 1]; }); m.list = m.miss.length; } }); A.render(false); go(1); return; }
    if (n === 9 || n === 10) { S.blocked.d15 = 'once'; S.meals = S.meals.filter(function (m) { return ['d14', 'd15', 'd16', 'd18'].indexOf(m.day) < 0; }); if (n === 10) S.blocked.d18 = 'once'; A.render(false); go(1); return; }
    if (n === 11) { seed(); A.render(false); go(2); return; }
    S.ws = 'counts'; A.render(false); go(1);
  }
  function build(n) {
    if (WKD) return buildW(n);
    if (NC) return buildN(n);
    if (OP) return buildO(n);
    if (AG) return buildA(n);
    A.resetDemo(); A.showWeek('d14');
    if (n === 1) return;
    A.openDetail('wed-curry'); if (n === 2) return;
    if (n === 3) { A.goDay('d15'); return; }
    if (n === 7) { A.closeDetail(); return; }
    var t = rect('.mc[data-tile]'), x = t ? t.left + t.width / 2 : 195, y = t ? t.top + t.height / 2 : 200;
    A.beginDrag('wed-curry', x, y, 99);
    if (n === 4) { A.moveHand(x + 4, y + 26); return; }
    var sat = rect('#d-d17'), cx = 200, cy = sat ? sat.top + sat.height / 2 : 400; A.moveHand(cx, cy);
    if (n === 5) return;
    A.endHand(cx, cy);
  }
  function bar() {
    if (q.get('cap') === '0') return null;
    var b = document.createElement('div'); b.className = 'demobar'; b.setAttribute('role', 'group'); b.setAttribute('aria-label', 'Scripted sequence'); document.body.appendChild(b); return b;
  }
  var B = bar();
  function paint() {
    if (!B) return; var c = CAP[cur - 1];
    B.innerHTML = '<div class="dtx"><b>' + cur + ' of ' + N + ' · ' + c[0] + '</b><span>' + c[1] + '</span></div><div class="dbt"><button data-dprev aria-label="Previous frame">‹</button><button data-dplay aria-label="' + (playing ? 'Pause' : 'Play') + '">' + (playing ? 'Pause' : 'Play') + '</button><button data-dnext aria-label="Next frame">›</button></div>';
  }
  function show(n) { cur = (n - 1 + N) % N + 1; build(cur); paint(); }
  function tick() { clearTimeout(timer); if (playing) timer = setTimeout(function () { show(cur + 1); tick(); }, cur === 4 || cur === 5 ? 2600 : 3200); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-dprev],[data-dnext],[data-dplay]'); if (!t) return;
    if (t.hasAttribute('data-dplay')) { playing = !playing; paint(); return tick(); }
    playing = false; show(cur + (t.hasAttribute('data-dnext') ? 1 : -1)); clearTimeout(timer);
  }, true);
  var f = parseInt(q.get('frame'), 10);
  if (f >= 1 && f <= N) { playing = false; show(f); } else { show(1); tick(); }
})();
