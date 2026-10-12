/* Plan UI review, phone: the scripted sequence for decisions 107 and 108 (owner-stated, 12 Oct 2026). Loaded only when the URL has ?demo=1 (DESIGN.md section 6: load on engagement).
   ?demo=1            auto-play, loops; Prev, Pause and Next under the stack
   ?demo=1&frame=3    one frame, still (cap=0 hides the caption bar, used for the screenshots)
   Frames: 1 week plan, 2 tap a day: the day docks top and the sheet docks bottom, 3 start dragging the tile: the week is back under the finger, tile in hand,
           4 let go on a day, 5 alternative: close the stack and the week returns. It drives the same code a finger does (beginDrag, moveHand, endHand, closeDetail). */
(function () {
  var A = window.__plan, q = new URLSearchParams(location.search), N = 5, cur = 1, timer = null, playing = true;
  var CAP = [
    ['Week plan', 'Wed 14 has a meal. Tap it.'],
    ['Tap a day with a meal', 'The day docks at the top, directly under the ribbon. The detail docks at the bottom. One stack, no gap, no overlay; the other days are out of it.'],
    ['Start dragging the tile', 'The week plan is back at once, under the finger, with the tile in hand. Every day is a drop target, even a hidden Not cooking day (Sat).'],
    ['Let go on a day', 'Sat was Not cooking, so it is a cooking day now. Wed is an open night. The day says what happened, and Undo is on the day.'],
    ['Or close instead', 'Close the stack (x, Esc, handle down, swipe down) and the week plan returns, scrolled to Wed.']
  ];
  function rect(sel) { var e = document.querySelector(sel); return e ? e.getBoundingClientRect() : null; }
  function build(n) {
    A.resetDemo(); A.showWeek('d14');
    if (n === 1) return;
    A.openDetail('wed-curry'); if (n === 2) return;
    if (n === 5) { A.closeDetail(); return; }
    var t = rect('.mc[data-tile]'), x = t ? t.left + t.width / 2 : 195, y = t ? t.top + t.height / 2 : 200;
    A.beginDrag('wed-curry', x, y, 99);
    var sat = rect('#d-d17'), cx = 200, cy = sat ? sat.top + sat.height / 2 : 400; A.moveHand(cx, cy);
    if (n === 3) return;
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
  function tick() { clearTimeout(timer); if (playing) timer = setTimeout(function () { show(cur + 1); tick(); }, cur === 3 ? 2600 : 3200); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-dprev],[data-dnext],[data-dplay]'); if (!t) return;
    if (t.hasAttribute('data-dplay')) { playing = !playing; paint(); return tick(); }
    playing = false; show(cur + (t.hasAttribute('data-dnext') ? 1 : -1)); clearTimeout(timer);
  }, true);
  var f = parseInt(q.get('frame'), 10);
  if (f >= 1 && f <= N) { playing = false; show(f); } else { show(1); tick(); }
})();
