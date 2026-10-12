/* Plan UI review, phone: the scripted sequence for decisions 107, 108, 115 and 118 (owner-stated, 12 and 13 Oct 2026). Loaded only when the URL has ?demo=1 (DESIGN.md section 6: load on engagement).
   ?demo=1            auto-play, loops; Prev, Pause and Next under the stack
   ?demo=1&frame=3    one frame, still (cap=0 hides the caption bar, used for the screenshots)
   ?demo=agenda       the lift and shift straight from the plain week view, 7 frames (decisions 142 to 146): 1 week, 2 press and hold lifts the tile, 3 picked up and carried (plain, no tear), 4 dropped on a day with a meal (Replaced, pulse, Undo),
                      5 a past tile lifted to copy forward and a past day refusing it, 6 the detail drag-out is the ONLY torn one, 7 a quick sideways swipe still reveals the swipe actions (no lift)
   ?demo=open         the open day, 4 frames (decisions 147 to 153): 1 the dashed open day, 2 right swipe reveals Not cooking, 3 Not cooking with Undo, 4 tap the Not cooking tile: the night reopens and its detail stays docked with the options
   Frames (?demo=1): 1 week plan, 2 tap a day: the day docks top and the sheet docks bottom, 3 tap another day in the ribbon: the contents of the stack swap, the slot stays (115),
           4 start dragging the tile and it tears off, a ragged edge on the tile and on the piece left behind (118), 5 dragged to a day, torn all the way, 6 let go on a day,
           7 alternative: close the stack, the ribbon goes and the week returns. It drives the same code a finger does (beginDrag, moveHand, endHand, closeDetail). */
(function () {
  var A = window.__plan, q = new URLSearchParams(location.search), AG = q.get('demo') === 'agenda', OP = q.get('demo') === 'open', N = OP ? 4 : 7, cur = 1, timer = null, playing = true;
  var CAPD = [
    ['Week plan, no ribbon', 'The week view has no day ribbon (136): a slim header, then the agenda across three weeks. Wed 14 has a meal. Tap it.'],
    ['Tap a day with a meal', 'The ribbon fades in, docked under the header, only now (136). The day docks directly under it and the detail at the bottom. One stack, no gap, no overlay; the stack does not move when the ribbon appears.'],
    ['Tap another day in the ribbon', 'The ribbon stays docked and scrollable. The stack does not close and does not move: only what is in it swaps to Thu 15 (or to an open night, Not cooking or a past day).'],
    ['Start dragging: it tears', 'The tile comes off the docked detail with a ragged, torn-paper edge, and the piece left behind has the matching edge. This is the only tear (142): a tile lifted in the plain week is not torn (see ?demo=agenda). The tile fades and tilts as before. Reduced motion: the edge is there at once, no growth.'],
    ['Dragged to a day', 'The week plan is back under the finger, the tile in hand. Every day is a drop target, even a hidden Not cooking day (Sat).'],
    ['Let go on a day', 'Sat was Not cooking, so it is a cooking day now. Wed is an open day (the dashed box). The day says what happened, and Undo is on the day.'],
    ['Or close instead', 'Close the stack (x, Esc, handle down, swipe down) and the ribbon fades out; the week plan returns, scrolled to Wed.']
  ];
  var CAPA = [
    ['Week plan, nothing open', 'The plain week view. No detail is open. Wed 14 has the curry; Thu has two meals. Every tile can be lifted from here (143, 144).'],
    ['Press and hold: it lifts', 'Hold a tile about a third of a second without moving more than 8 px: it rises, grows, tilts and casts a deeper shadow. A quick sideways swipe still reveals the swipe actions (frame 7); a vertical move scrolls.'],
    ['Pick it up and carry it', 'Move and it is in hand: the plain lifted, tilted tile of before the tear, no ragged edge (142). The week shows every day, even Sat, which is Not cooking. The week scrolls near the top and bottom edge and across the three weeks.'],
    ['Drop on a day with a meal', 'Let go on Thu: the curry replaces Salmon patties and the day says so, pulses and offers Undo, which expires on its own. Wed is an open day (the dashed box). Dropping outside a day, Esc or a cancelled touch moves nothing and says so.'],
    ['A past tile: copy forward only', 'A past meal lifts the same way but only copies: the original stays. Past days are read only, so a tile over one shows a red outline and a drop there is refused with a note.'],
    ['The tear is only for the detail', 'Dragging the tile out of the docked detail is the one place with the torn-paper edge (142, owner-stated, 13 Oct). Everything else is the plain lift. ?tear=all draws it everywhere for comparison.'],
    ['A swipe is still a swipe', 'A quick sideways move reveals the swipe actions (Replan, Not cooking) and never lifts. The hold has to start before any real movement, so the two gestures cannot fight.']
  ];
  var CAPO = [
    ['The open day, UAT\'s dashed box', 'An open day on the plain week is the faint dashed rounded box beside the day label (Sun 18 and the days below), no words and no buttons (147, owner-stated: "The open day with this visual is great"). Tap it for that day\'s detail.'],
    ['Right swipe: Not cooking', 'A right swipe on the open day shows the tinted Not cooking reveal, the same as on a meal tile (148, owner-stated: "Right swipe to making not cooking"). Past days and other people\'s plans have no swipe. Keys: Shift X.'],
    ['Not cooking, with Undo', 'The day is Not cooking (this week only) with Undo in place; the Undo expires by itself and the tile hides once you move on (92, 96, 130). The accent is a notch duller (150, Proposal; ?ac=normal for the old one).'],
    ['Tap the Not cooking tile', 'The tile reopens the night and docks that day\'s detail with Ask AI, Surprise me and Not cooking. They stay until you close the detail, tap another day or act (151 to 153, owner-stated bug fixed: they used to vanish).']
  ];
  var CAP = OP ? CAPO : AG ? CAPA : CAPD;
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
    if (n === 3) { A.block('d18'); return; }
    S.blocked.d18 = 'once'; A.render(false); A.unblock('d18');
  }
  function build(n) {
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
