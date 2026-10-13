/* Option D, split slider: the Enhance sheet. Fetched with the engine on the first photo action, never on the default path.
   One picture, drawn twice in the same frame: Original on the left of a draggable divider, the chosen level on the right. One strength slider with four steps
   (Original, Light, Balanced, Full). Press and hold anywhere on the photo, or the Hold button, shows the whole original; let go and it returns.
   Every level is drawn by the engine from the untouched original (never from another level). Nothing is encoded until Use photo. */
(function () {
"use strict";
var STORE = "pe-d-level";
function remembered(PE) { try { var v = localStorage.getItem(STORE); if (v && PE.LEVELS.some(function (l) { return l.id === v; })) return v; } catch (e) { /* private window: fine */ } return PE.DEFAULT; }
function remember(v) { try { localStorage.setItem(STORE, v); } catch (e) { /* fine */ } }
var reduced = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches; };
var BIG_MP = 12e6, SMALL_EDGE = 480, TAP_MS = 250;

function open(o) {
  var PE = window.PhotoEnhance, X = o.X, D = o.D, K = o.K, ic = X.ic, esc = X.esc;
  var LV = PE.LEVELS, S = { level: remembered(PE), pos: 50, holding: false, latched: false, sess: null, tok: 0, busy: false, closed: false, fromPress: 0 };
  var html =
    "<h3>Enhance photo</h3>" +
    '<p class="enhk" id="ek">' + ic("img") + "<b>" + esc(K.label) + "</b> · " + K.edge + " px + 240 px square<span class=\"enhmp\" id=\"emp\" hidden></span></p>" +
    '<div class="enhv" id="ev" data-ready="no" data-view="split" role="group" aria-label="Photo, original on the left, enhanced on the right">' +
      '<canvas class="enhb" aria-hidden="true"></canvas><canvas class="enha" aria-hidden="true"></canvas><div class="enhsk" id="esk"><i class="pqs"></i>Opening your photo…</div>' +
      '<span class="enhl l">Original</span><span class="enhl r" id="elr">Balanced</span><div class="enhline"></div>' +
      '<div class="enhd" id="ed" role="slider" tabindex="0" aria-label="Divider between original and enhanced" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="Half and half">' + ic("split") + "</div>" +
      '<span class="pq" id="epq" data-q="processing" hidden role="status"><i class="pqs"></i>Preparing</span>' +
    "</div>" +
    '<button type="button" class="enhhold" id="eh" aria-pressed="false" disabled>' + ic("hand") + '<span id="eht">Hold to see the original</span></button>' +
    '<div class="enhs"><div class="flab"><label for="el">Strength</label><output id="eo" for="el">Balanced</output></div>' +
      '<div class="enhsl"><input type="range" id="el" min="0" max="' + (LV.length - 1) + '" step="1" value="2" disabled aria-valuetext="Balanced"><div class="enhtk" id="etk" aria-hidden="true"></div></div></div>' +
    '<div id="egood" hidden></div><div id="esmall" hidden></div>' +
    '<details class="enhn" id="en" hidden><summary>' + ic("spark") + 'What changed<small id="ens"></small></summary><div id="enb"></div></details>' +
    '<p class="enhwarn" id="ew">' + ic("lock") + '<span>Stays on this phone until you confirm.</span></p>' +
    '<p class="enhwarn" id="eo2" hidden>' + ic("info") + '<span>Saved enhanced: <b>Kitchie keeps no original.</b></span></p>' +
    '<div id="emade" hidden></div><p class="enhcerr" id="eerr" role="alert" hidden></p>' +
    '<div class="enhbar"><button type="button" class="btn ghost" id="eskip" disabled>Skip</button><button type="button" class="btn" id="euse" disabled>' + ic("check") + 'Use photo</button></div>' +
    '<span class="sr" id="elive" role="status" aria-live="polite"></span>';

  var $ = null, v, ca, cb, ed, sl, hb;
  X.sheet(html, function (s, close) {
    $ = function (id) { return s.querySelector("#" + id); };
    v = $("ev"); ca = v.querySelector(".enha"); cb = v.querySelector(".enhb"); ed = $("ed"); sl = $("el"); hb = $("eh");
    S.close = close; wire(s); boot();
  }, function (why) {
    S.closed = true; if (S.sess) { try { S.sess.close(); } catch (e) { /* fine */ } S.sess = null; }
    if (why === "cancel") D.tell("Enhance step cancelled: nothing was encoded or uploaded");
  });

  function say(t) { var l = $("elive"); if (l) l.textContent = t; }
  function lvl(id) { return LV.filter(function (l) { return l.id === id; })[0]; }
  function idx(id) { for (var i = 0; i < LV.length; i++) if (LV[i].id === id) return i; return 0; }

  /* ---- open: decode once, draw the original at once, then the chosen level, then the divider sweeps in ---- */
  function boot() {
    var tk = $("etk"); tk.innerHTML = LV.map(function (l, i) { return '<span data-i="' + i + '" style="left:calc(14px + (100% - 28px) * ' + i + ' / ' + (LV.length - 1) + ')">' + esc(l.label) + "</span>"; }).join("");
    PE.open(o.source).then(function (sess) {
      if (S.closed) { sess.close(); return; }
      S.sess = sess; window.PEDemo.session = sess;
      var w = sess.width, h = sess.height, mp = w * h, long = Math.max(w, h);
      v.style.setProperty("--arn", (w / h).toFixed(4));
      if (mp >= BIG_MP) { var e = $("emp"); e.hidden = false; e.textContent = (mp / 1e6).toFixed(0) + " MP"; }
      S.big = mp >= BIG_MP; S.small = long < SMALL_EDGE;
      return sess.render("off", ca).then(function () {
        if (S.closed) return;
        v.dataset.ready = "yes"; $("esk").remove(); hb.disabled = false; $("eskip").disabled = false;
        setPos(S.small ? 100 : 100); paintNotes();
        if (S.small) {
          sl.disabled = true; sl.value = 0; v.dataset.lock = "yes"; $("elr").textContent = "Original"; hb.disabled = true; $("eskip").hidden = true;
          $("esmall").hidden = false; $("esmall").innerHTML = '<p class="enhgood">' + ic("info") + "<span><b>This photo is small (" + w + " × " + h + ").</b> Enhancing would not help, so it goes up as it is and may look soft at " + K.edge + " px.</span></p>";
          $("euse").disabled = false; $("euse").lastChild.textContent = "Add it as it is"; paintTicks(); return;
        }
        sl.disabled = false; sl.value = idx(S.level); paintTicks();
        $("euse").disabled = false;
        return show(S.level, true);
      }).then(function () {
        if (S.closed || S.small) return;
        var rest = LV.map(function (l) { return l.id; }).filter(function (id) { return id !== "off" && id !== S.level; });
        sess.prefetch(rest).catch(function () { /* the next switch just waits for its render */ });
      });
    }, function (err) {
      if (S.closed) return; S.close("error");
      if (err && err.code === "unsupported") o.onUnreadable && o.onUnreadable(); else o.onUnreadable && o.onUnreadable();
    });
  }

  /* ---- a level: always rendered from the original by the engine; instant when cached, a quiet Preparing otherwise ---- */
  function show(id, sweep) {
    var my = ++S.tok, sess = S.sess, ready = sess.ready(id), t = null, pq = $("epq");
    S.level = id; paintTicks();
    $("elr").textContent = id === "off" ? "No change" : lvl(id).label;
    if (!ready) t = setTimeout(function () { if (my === S.tok) pq.hidden = false; }, 120);
    return sess.render(id, cb).then(function () {
      clearTimeout(t); if (my !== S.tok || S.closed) return;
      pq.hidden = true; paintNotes();
      if (sweep && id !== "off") sweepTo(50); else if (sweep) setPos(50);
      say(id === "off" ? "Original" : lvl(id).label + " ready");
    }, function () {
      clearTimeout(t); if (my !== S.tok) return; pq.hidden = true; err("Could not make that preview. Try another strength, or Skip.");
    });
  }
  function sweepTo(to) {
    if (reduced()) { setPos(to); return; }
    var from = S.pos, t0 = performance.now(), dur = 650;
    (function f(now) { var k = Math.min(1, (now - t0) / dur); k = 1 - Math.pow(1 - k, 3); setPos(from + (to - from) * k); if (k < 1 && !S.closed && !S.dragged) requestAnimationFrame(f); })(t0);
  }

  /* ---- divider ---- */
  function setPos(p) {
    S.pos = Math.max(0, Math.min(100, p)); v.style.setProperty("--pos", S.pos + "%");
    var r = Math.round(S.pos); ed.setAttribute("aria-valuenow", r);
    ed.setAttribute("aria-valuetext", r >= 98 ? "All original" : r <= 2 ? "All enhanced" : r + " percent original");
    v.dataset.hl = S.pos < 24 ? "yes" : "no"; v.dataset.hr = S.pos > 76 ? "yes" : "no";
  }
  function view() { v.dataset.view = (S.holding || S.latched) ? "orig" : "split"; }
  function paintHold() {
    hb.setAttribute("aria-pressed", String(S.latched)); hb.classList.toggle("down", S.holding);
    $("eht").textContent = S.latched ? "Showing original. Tap to go back" : S.holding ? "Showing original" : "Hold to see the original";
    view();
  }

  /* ---- pointer, touch, keyboard ---- */
  function wire(s) {
    var drag = false, vr;
    var ptrX = function (e) { vr = v.getBoundingClientRect(); return (e.clientX - vr.left) / vr.width * 100; };
    v.addEventListener("pointerdown", function (e) {
      if (v.dataset.ready !== "yes" || e.button > 0) return;
      e.preventDefault(); try { v.setPointerCapture(e.pointerId); } catch (x) { /* fine */ }
      if (e.target.closest("#ed") && !S.small) { drag = true; S.dragged = true; setPos(ptrX(e)); ed.focus({ preventScroll: true }); }
      else { S.holding = true; paintHold(); say("Showing the original"); }
    });
    v.addEventListener("pointermove", function (e) { if (drag) setPos(ptrX(e)); });
    var end = function () { if (drag) { drag = false; return; } if (S.holding) { S.holding = false; paintHold(); say("Showing " + (S.level === "off" ? "the original" : lvl(S.level).label)); } };
    v.addEventListener("pointerup", end); v.addEventListener("pointercancel", end); v.addEventListener("lostpointercapture", end);
    ["contextmenu", "selectstart", "dragstart", "gesturestart"].forEach(function (n) { v.addEventListener(n, function (e) { e.preventDefault(); }); });
    ed.addEventListener("keydown", function (e) {
      var d = { ArrowLeft: -5, ArrowRight: 5, ArrowDown: -5, ArrowUp: 5, PageDown: -20, PageUp: 20 }[e.key];
      if (e.key === "Home") { e.preventDefault(); S.dragged = true; setPos(0); } else if (e.key === "End") { e.preventDefault(); S.dragged = true; setPos(100); }
      else if (d !== undefined) { e.preventDefault(); S.dragged = true; setPos(S.pos + d); }
    });
    /* The Hold button: held = shows the original and goes back on release (pointer, Space or Enter). A quick tap (under 250 ms) latches it on or off for people who cannot hold. */
    var down = 0, press = function (on) {
      if (on) { if (S.holding) return; down = performance.now(); S.holding = true; paintHold(); say("Showing the original"); }
      else { if (!S.holding) return; S.holding = false; if (performance.now() - down < TAP_MS) S.latched = !S.latched; paintHold(); say(S.latched ? "Original pinned. Tap again to go back" : "Showing " + (S.level === "off" ? "the original" : lvl(S.level).label)); }
    };
    hb.addEventListener("pointerdown", function (e) { if (e.button > 0) return; e.preventDefault(); try { hb.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } S.fromPress = performance.now(); press(true); });
    hb.addEventListener("pointerup", function () { press(false); }); hb.addEventListener("pointercancel", function () { press(false); });
    hb.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); S.fromPress = performance.now(); press(true); } else if (e.key === " " || e.key === "Enter") e.preventDefault(); });
    hb.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); press(false); } });
    hb.addEventListener("blur", function () { press(false); });
    hb.addEventListener("click", function () { if (performance.now() - S.fromPress > 700) { S.latched = !S.latched; paintHold(); say(S.latched ? "Original pinned" : "Back to " + lvl(S.level).label); } }); /* a click with no press before it: a screen reader's activate */
    hb.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    sl.addEventListener("input", function () { var id = LV[+sl.value].id; remember(id); show(id, false); sl.setAttribute("aria-valuetext", LV[+sl.value].label); });
    $("eskip").onclick = function () { skip(); };
    $("euse").onclick = function () { use(); };
  }

  function paintTicks() {
    var i = idx(S.level); sl.setAttribute("aria-valuetext", LV[i].label); $("eo").textContent = i === 0 ? "Original (off)" : LV[i].label;
    [].forEach.call($("etk").children, function (sp) { if (+sp.dataset.i === i) sp.setAttribute("aria-current", "true"); else sp.removeAttribute("aria-current"); });
    $("eo2").hidden = !(i > 0 && !S.small);
  }

  /* ---- what changed, in plain words (the engine's own notes), collapsed ---- */
  function paintNotes() {
    var sess = S.sess, notes = (sess && sess.notes) || [], good = notes.some(function (n) { return /looks good already/i.test((n.text || "") + " " + (n.label || "")); });
    var n = $("en"); n.hidden = S.small || !notes.length; if (n.hidden) return;
    var l = lvl(S.level), k = l ? Math.round(l.k * 100) : 0;
    $("ens").textContent = S.level === "off" ? "Nothing yet" : (good ? "Barely anything" : notes.length + " tweaks · " + k + "%");
    var rows = notes.filter(function (x) { return !/looks good already/i.test((x.text || "") + " " + (x.label || "")); });
    $("enb").innerHTML = (S.level === "off" ? "<p>Original is showing. Nothing is changed.</p>" : "") +
      (rows.length ? "<ul>" + rows.map(function (x) { return "<li><b>" + esc(x.label || x.key) + "</b><span>" + esc(x.text || "") + "</span></li>"; }).join("") + "</ul>" : "") +
      "<p>" + (S.level === "off" ? "" : lvl(S.level).label + " applies each tweak at " + k + " percent of its full size, worked out from your original every time.") + "</p>";
    var g = $("egood"); g.hidden = !good;
    if (good) g.innerHTML = '<p class="enhgood">' + ic("check") + "<span><b>Looks good already.</b> Balanced hardly changes it. Slide the divider to check, or Skip.</span></p>";
  }

  function err(t) { var e = $("eerr"); e.textContent = t; e.hidden = !t; }

  /* ---- Skip: today's flow exactly. The original is shrunk the way the app does it, with no engine step and no encode call ---- */
  function skip() {
    if (S.busy) return; S.busy = true; $("euse").disabled = true; $("eskip").disabled = true;
    D.sizesOf(S.sess.original, S.sess.width, S.sess.height, K.edge).then(function (r) {
      r.enhanced = false; r.level = "off"; S.close("skip"); o.onUse(r);
    }, function () { S.busy = false; $("euse").disabled = false; $("eskip").disabled = false; err("Could not read the photo. Nothing was changed."); });
  }

  /* ---- Use photo: the ONLY place anything is encoded. Full size from the original at the chosen level, then the square cut from that SAME result ---- */
  function use() {
    if (S.busy) return;
    if (S.small || S.level === "off") { skip(); return; } // Original (or too small to help) is exactly today's flow
    S.busy = true; err(""); var b = $("euse"), sess = S.sess, level = S.level, t0 = performance.now();
    b.disabled = true; $("eskip").disabled = true; sl.disabled = true; hb.disabled = true;
    b.innerHTML = '<i class="pqs"></i>Making your photo…';
    var m = $("emade"); m.hidden = false;
    m.innerHTML = '<div class="enhmade"><b>' + (S.big ? "Making the full-size photo" : "Making your photo") + '</b><small>' + (S.big ? "A big picture takes a few seconds. You can keep using Kitchie once it is sent." : "Full size from your original, then one copy.") + '</small><div class="pbar" aria-hidden="true"><i></i></div></div>';
    m.scrollIntoView({ block: "nearest" }); D.encodes++; D.tell("encode(" + level + ") called, once");
    var enc = sess.encode(level, { maxEdge: K.edge, type: "image/webp", quality: 0.82 });
    enc.then(function (blob) {
      return createImageBitmap(blob).then(function (bm) {
        var c = document.createElement("canvas"); c.width = bm.width; c.height = bm.height; c.getContext("2d").drawImage(bm, 0, 0);
        return D.squareOf(c).then(function (sq) { return { blob: blob, sq: sq, w: bm.width, h: bm.height, level: level, enhanced: true }; });
      });
    }).then(function (r) {
      /* the not-enhanced copy the phone keeps for the 5 minutes of Undo (PE-D-O13, Proposal): made now, in this browser, never sent unless asked */
      return D.sizesOf(sess.original, sess.width, sess.height, K.edge).then(function (pl) { pl.enhanced = false; pl.level = "off"; r.plain = pl; return r; }, function () { return r; });
    }).then(function (r) {
      var kb = function (x) { return Math.max(1, Math.round(x / 1024)); };
      m.innerHTML = '<div class="enhmade"><b>' + ic("check") + "Ready: " + Math.max(r.w, r.h) + " px long edge · " + kb(r.blob.size) + ' KB</b><small>' + r.w + " × " + r.h + " " + lvl(level).label + ". Square 240 px · " + kb(r.sq.size) + " KB, cut from this same result, not enhanced twice. Sending to the upload queue.</small></div>";
      b.innerHTML = ic("check") + "Sent"; m.scrollIntoView({ block: "nearest" });
      D.tell("Made " + r.w + " × " + r.h + ", " + kb(r.blob.size) + " KB (" + Math.round(performance.now() - t0) + " ms)");
      setTimeout(function () { if (S.closed) return; S.close("used"); o.onUse(r); }, reduced() ? 600 : 1300);
    }, function () {
      S.busy = false; b.disabled = false; $("eskip").disabled = false; sl.disabled = false; hb.disabled = false; b.innerHTML = ic("check") + "Try again"; m.hidden = true;
      err("Could not make the photo. Nothing was changed. Try again, or Skip to save it as it is.");
    });
  }
}
window.EnhanceSplit = { open: open };
})();
