/* Option C: Enhance on the Add / Replace photo screen, AUTO-ON. Mockup, but REALLY working: it uses the shared engine (../engine/enhance.js) on real photos.
   What a person sees: the picture they picked opens already enhanced at the default level, with a small pill that says "Enhanced" (tap = toggle, chevron = levels),
   a line under it saying what happened with one-tap Undo, and press-and-hold on the photo itself to see the original. One button: Use photo. No extra step.
   Nothing is encoded until Use photo. Everything stays on this phone until then.
   Params: s (a sample: dark, warm, blown, noisy, good, large; jumps straight to the review), kind (banner | step | more | cooked), from=cook,
           sim (unsupported | slow | small | heic | fail), phone-frame width comes from the page. */
(function () {
  "use strict";
  var X = RCP, ic = X.ic, esc = X.esc, Q = X.Q;
  var ph = document.getElementById("ph");

  /* what the phone makes (locked, P-D6): banner large 1600 px, everything else 960 px, plus a 240 px square cut from the SAME result */
  var KINDS = { banner: ["Banner", 1600], step: ["Step photo", 960], more: ["Photo", 960], cooked: ["What you made", 960] };
  var kind = (function (k) { return KINDS[k] ? k : "cooked"; })(Q.get("kind") || "cooked");
  var from = Q.get("from") || "";
  var sim = Q.get("sim") || "";
  var EDGE = KINDS[kind][1];
  var SMALL_EDGE = 600;      /* Proposal: under 600 px on the long edge there is nothing to polish, so no Enhance */
  var BIG_PIXELS = 12e6;     /* Proposal: 12 MP and up gets the "big photo" wording and the progress state on confirm */
  var ENGINE = "../engine/";
  var SAMPLE_FALLBACK = [["dark", "Dark and flat"], ["warm", "Yellow cast"], ["blown", "Blown highlights"], ["noisy", "Noisy, low light"], ["good", "Already good"], ["large", "Big photo"]];

  var S = {
    step: "pick", blob: null, name: "", sess: null, level: "balanced", on: true, view: "busy", held: false,
    tok2: 0, notes: [], good: false, small: false, big: false, plain: false, raw: false, busy: false, url: "", seen: {}, tok: 0, out: null
  };
  /* The level and the on/off choice are remembered for this visit only (Proposal PE-C-O3): in the build, sessionStorage; the app keeps no setting for it. */
  try { var kept = JSON.parse(sessionStorage.getItem("peC") || "null"); if (kept) { S.level = kept.level || S.level; S.on = kept.on !== false; } } catch (e) {}
  function keep() { try { sessionStorage.setItem("peC", JSON.stringify({ level: S.level, on: S.on })); } catch (e) {} }

  function kb(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
  function qs(o) { var u = new URLSearchParams(location.search); for (var k in o) { if (o[k] === null) u["delete"](k); else u.set(k, o[k]); } return "?" + u.toString(); }
  function $(sel, root) { return (root || ph).querySelector(sel); }

  /* ---------------------------------------------------------------- the target, said once at the top (same as recipe-photos/add.html) */
  function aim() {
    if (kind === "banner") return '<div class="aim">' + ic("img", "s") + '<span><b>Banner of Egg fried rice</b><small>The top of the page and the list. One per version. Goes out at 1600 px.</small></span></div>';
    if (kind === "step") return '<div class="aim">' + ic("img", "s") + '<span><b>Step 3 of Egg fried rice</b><small>One photo per step. Goes out at 960 px.</small></span></div>';
    if (kind === "more") return '<div class="aim">' + ic("img", "s") + '<span><b>A photo of Egg fried rice</b><small>Into Photos. Goes out at 960 px.</small></span></div>';
    return '<div class="aim">' + ic("cam", "s") + '<span><b>' + (from === "cook" ? "What you made tonight" : "Your cook") + '</b><small>Egg fried rice · into Cooked. Goes out at 960 px.</small></span></div>';
  }
  function top(title, backLabel) {
    return '<div class="top"><button type="button" class="back" data-cancel>' + ic("x", "s") + (backLabel || "Cancel") + '</button><span class="ttl">' + title + '</span><span style="width:64px"></span></div>';
  }
  function title() { return kind === "banner" ? "Add a banner" : kind === "step" ? "Photo for a step" : "Add a photo"; }

  /* ---------------------------------------------------------------- step 1: the phone's own picker, drawn (as add.html does) */
  function drawPick() {
    S.step = "pick"; cleanup();
    ph.innerHTML = top(title()) + '<div class="body">' + aim() + '<div class="mockmark">Your phone\'s own picker</div><div class="pad" style="padding-top:0">' +
      '<div class="pe-pick" id="pk"><label class="addp" data-own>' + ic("cam") + 'Try your own photo<input type="file" accept="image/*" hidden data-own-file></label></div>' +
      '<div class="shrink">' + ic("check", "s") + '<span>Stays on this phone until you confirm. Nothing is sent, and nothing is changed, before you tap <b>Use photo</b>.</span></div>' +
      '</div></div>';
    fetch(ENGINE + "samples.json").then(function (r) { return r.json(); }).catch(function () { return SAMPLE_FALLBACK.map(function (s) { return { file: s[0] + ".jpg", label: s[1] }; }); }).then(function (list) {
      var g = $("#pk"); if (!g) return;
      g.insertAdjacentHTML("beforeend", list.map(function (s) {
        return '<button type="button" data-sample="' + esc(s.file) + '" aria-label="' + esc(s.label) + '"><img src="' + ENGINE + 'samples/' + esc(s.file) + '" alt="" loading="lazy"><span class="cap">' + esc(s.label) + '</span></button>';
      }).join(""));
    });
  }

  /* ---------------------------------------------------------------- step 2: the review, with Enhance already on */
  function drawReview() {
    S.step = "review";
    ph.innerHTML = top(title()) + '<div class="body" id="pebody">' + aim() +
      '<div class="pe-stage" data-stage data-shown="o">' +
        '<img class="pe-img" alt="The photo you picked" data-pe-img>' +
        '<canvas class="pe-cv" data-cv-o hidden></canvas><canvas class="pe-cv" data-cv-e hidden></canvas>' +
        '<button type="button" class="pe-hold" data-pe-hold aria-describedby="pe-hint" aria-label="Your photo. Hold to see the original."></button>' +
        '<div class="pe-pill" role="group" aria-label="Enhance" data-pe-pill data-view="busy" hidden>' +
          '<button type="button" data-pe-toggle aria-pressed="true">' + ic("spark") + '<span data-pe-label>Enhancing…</span></button>' +
          '<button type="button" data-pe-levels aria-haspopup="true" aria-expanded="false" aria-label="Strength: Balanced">' + ic("chev") + '</button></div>' +
        '<div class="pe-menu" role="menu" aria-label="Strength" data-pe-menu hidden></div>' +
      '</div>' +
      '<div class="pe-line" data-pe-line aria-live="polite" hidden></div>' +
      '<details class="pe-notes" data-pe-notes hidden><summary>' + ic("chev") + 'What changed</summary><ul data-pe-list></ul></details>' +
      '<span id="pe-hint" class="pe-sr">Press and hold the photo to see the original. Release to go back. The Enhanced button does the same as a toggle.</span>' +
      '<div class="shrink" data-pe-size>' + ic("check", "s") + '<span>Stays on this phone until you confirm.</span></div>' +
      '<p class="cerr" data-pe-err role="alert" hidden></p><div data-pe-make></div><div style="height:var(--sp-3)"></div></div>' +
      '<div class="act"><button type="button" class="btn" data-pe-use>' + ic("check", "s") + 'Use photo</button></div>';
    var img = $("[data-pe-img]");
    if (S.url) img.src = S.url;
    wireStage();
    paint();
  }

  var stage, cvO, cvE;
  function wireStage() {
    stage = $("[data-stage]"); cvO = $("[data-cv-o]"); cvE = $("[data-cv-e]");
    var hold = $("[data-pe-hold]");
    /* Hold the photo to see the original. Pointer capture, so the release always arrives; no long-press callout or selection; a vertical drag (scroll) cancels. */
    hold.addEventListener("pointerdown", function (e) { if (e.button > 0) return; try { hold.setPointerCapture(e.pointerId); } catch (x) {} setHeld(true); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) { hold.addEventListener(t, function () { setHeld(false); }); });
    hold.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    hold.addEventListener("dragstart", function (e) { e.preventDefault(); });
    /* the same, from the keyboard: Space or Enter held on the button */
    hold.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); setHeld(true); } });
    hold.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setHeld(false); } });
    hold.addEventListener("blur", function () { setHeld(false); });
  }
  function setHeld(h) { if (!S.sess || S.view === "plain" || S.small) return; if (S.held === h) return; S.held = h; paint(); }

  /* Which picture is on screen right now. The original canvas is always the untouched bitmap; flipping is a visibility change, so it is instant. */
  function shown() {
    if (!S.sess) return "i";
    if (S.held) return "o";
    return S.view === "enhanced" ? "e" : "o";
  }
  function notesNow() { return S.sess && S.sess.notesFor ? S.sess.notesFor(S.level) : S.notes; }   /* the words follow the level: Light says less than Full */
  function summary() {
    var parts = notesNow().filter(function (n) { return n.value; }).map(function (n) { return n.text; }).filter(Boolean).slice(0, 3);
    if (!parts.length) return "";
    return parts.map(function (t, i) { return i ? t.charAt(0).toLowerCase() + t.slice(1) : t; }).join(", ") + ".";
  }
  function levelLabel(id) { var L = (window.PhotoEnhance && PhotoEnhance.LEVELS) || []; for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i].label; return id; }

  function paint() {
    if (S.step !== "review" || !stage) return;
    var sh = shown();
    $("[data-pe-img]").hidden = sh !== "i" || S.raw;
    cvO.hidden = sh !== "o"; cvE.hidden = sh !== "e";
    stage.dataset.shown = sh;
    var pill = $("[data-pe-pill]"), line = $("[data-pe-line]"), notes = $("[data-pe-notes]"), lab = $("[data-pe-label]"), tg = $("[data-pe-toggle]"), lv = $("[data-pe-levels]");
    pill.hidden = S.plain || S.small || S.raw; line.hidden = S.plain || S.raw && !S.small; notes.hidden = !(S.sess && !S.small && S.view === "enhanced");
    if (S.small) { line.hidden = false; }
    var view = S.view; pill.dataset.view = view;
    var label, aria, pressed = view !== "orig";
    if (S.held) { label = "Original"; aria = "Showing the original while you hold. Release to go back."; pressed = false; }
    else if (view === "busy") { label = "Enhancing…"; aria = "Enhancing. Tap to stop and keep the original."; }
    else if (view === "enhanced") { label = S.good ? "Looks good" : "Enhanced"; aria = (S.good ? "Looks good already" : "Enhanced") + ". Tap to show the original."; }
    else { label = "Original"; aria = "Original. Tap to enhance."; }
    lab.textContent = label; tg.setAttribute("aria-label", aria); tg.setAttribute("aria-pressed", String(pressed));
    lv.setAttribute("aria-label", "Strength: " + levelLabel(S.level));
    pill.querySelector(".ic").outerHTML = ic(view === "orig" || S.held ? "img" : "spark", "");
    var html = "";
    if (S.small) html = ic("img", "s") + '<span class="t">Small photo (' + Math.max(S.sess ? S.sess.width : 0, S.sess ? S.sess.height : 0) + ' px). It goes as it is, there is nothing to polish.</span>';
    else if (view === "busy") html = ic("spark", "s") + '<span class="t">Making it look its best…<small>Your original is showing meanwhile.</small></span><button type="button" class="mini" data-pe-undo>Undo</button>';
    else if (view === "enhanced" && S.good) html = ic("check", "s") + '<span class="t">Looks good already. ' + levelLabel(S.level) + ' barely changes it.<small>Hold the photo to compare.</small></span><button type="button" class="mini" data-pe-undo>Undo</button>';
    else if (view === "enhanced") html = ic("spark", "s") + '<span class="t">' + esc(summary() || "Polished a touch.") + '<small>' + levelLabel(S.level) + ' · hold the photo to compare</small></span><button type="button" class="mini" data-pe-undo>Undo</button>';
    else html = ic("undo", "s") + '<span class="t">Original, nothing changed.</span><button type="button" class="mini" data-pe-redo>Enhance</button>';
    if (view === "enhanced") fillNotes();
    if (line.dataset.html !== html) { line.innerHTML = html; line.dataset.html = html; }
    line.dataset.view = S.good && view === "enhanced" ? "good" : view;
    var sz = $("[data-pe-size]");
    var msg = S.raw ? 'This phone could not open that kind of photo, so it goes as it is. Recipe prepares it when the server is free.' :
      S.big && S.sess ? 'Big photo (' + Math.round(S.sess.width * S.sess.height / 1e6) + ' MP). The preview is 1280 px; the full-size copy is made only when you tap <b>Use photo</b>, which takes a few seconds.' :
      'Stays on this phone until you confirm. Goes out at <b>' + EDGE + ' px</b> plus a <b>240 px</b> square, from the same picture.';
    sz.querySelector("span").innerHTML = msg;
  }

  /* ---------------------------------------------------------------- the engine: loaded on the first photo, never before */
  function loadEngine() {
    if (window.PhotoEnhance) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = ENGINE + "enhance.js"; s.onload = res; s.onerror = function () { rej({ code: "unsupported" }); };
      document.head.appendChild(s);
    });
  }
  function cleanup() {
    S.tok++; if (S.sess) { try { S.sess.close(); } catch (e) {} }
    if (S.url) { try { URL.revokeObjectURL(S.url); } catch (e) {} }
    S.sess = null; S.url = ""; S.held = false; S.view = "busy"; S.plain = false; S.small = false; S.big = false; S.raw = false; S.good = false; S.notes = []; S.busy = false; S.seen = {}; S.out = null;
  }

  function begin(blob, name) {
    cleanup(); S.blob = blob; S.name = name; S.url = URL.createObjectURL(blob);
    var tok = S.tok;
    drawReview();                                  /* the original shows at once, as a plain <img>, before any engine code exists */
    if (sim === "heic") { rawState(); return; }
    if (sim === "unsupported") { plainState(); return; }
    loadEngine().then(function () {
      if (tok !== S.tok) return;
      if (!PhotoEnhance.supported) throw { code: "unsupported" };
      return PhotoEnhance.open(blob);
    }).then(function (s) {
      if (!s) return;
      if (tok !== S.tok) { s.close(); return; }
      S.sess = s; S.notes = s.notes || [];
      S.good = isGood(S.notes);
      S.small = Math.max(s.width, s.height) < SMALL_EDGE;
      S.big = s.width * s.height >= BIG_PIXELS;
      if (!kept0()) S.level = PhotoEnhance.DEFAULT || "balanced";
      return s.render("off", cvO, { maxEdge: 1280 }).then(function () {
        if (tok !== S.tok) return;
        S.view = S.small ? "orig" : S.on ? "busy" : "orig";
        fillMenu(); fillNotes(); paint();
        if (!S.small && S.on) applyLevel();
      });
    }).catch(function (e) {
      if (tok !== S.tok) return;
      if (e && e.code === "unsupported") plainState(); else rawState();
    });
  }
  function kept0() { try { return !!sessionStorage.getItem("peC"); } catch (e) { return false; } }
  function isGood(notes) {
    if (!notes || !notes.length) return true;
    if (notes.some(function (n) { return /looks good/i.test((n.text || "") + " " + (n.label || "")); })) return true;
    return notes.every(function (n) { return !n.value; });
  }
  /* engine unsupported: no Enhance at all, silent. The screen is today's screen. */
  function plainState() { S.plain = true; S.view = "plain"; paint(); }
  /* the browser cannot open this photo (HEIC): existing behaviour, it goes as it is */
  function rawState() { S.raw = true; S.view = "plain"; S.plain = true; var im = $("[data-pe-img]"); if (im) im.hidden = true; var st = $("[data-stage]"); if (st && !st.querySelector(".pe-stock")) st.insertAdjacentHTML("afterbegin", '<span class="pf stock pe-stock" style="position:absolute;inset:0">' + ic("img") + '</span>'); paint(); }

  /* every level renders from the ORIGINAL (the engine's rule); this only asks for a level and waits for the answer, latest call wins */
  function applyLevel() {
    var lv = S.level, tok = ++S.tok2;
    var cached = S.sess.ready(lv), wait = sim === "slow" && !S.seen[lv] ? 2200 : 0;
    if (!(cached && !wait)) { S.view = "busy"; paint(); }       /* a cached level swaps in at once, with no "Preparing" frame in between */
    (wait ? new Promise(function (r) { setTimeout(r, wait); }) : Promise.resolve()).then(function () {
      if (tok !== S.tok2) return;
      return S.sess.render(lv, cvE, { maxEdge: 1280 });
    }).then(function () {
      if (tok !== S.tok2) return;
      S.seen[lv] = 1; S.view = "enhanced"; paint();
      var rest = (PhotoEnhance.LEVELS || []).map(function (l) { return l.id; }).filter(function (id) { return id !== "off" && !S.sess.ready(id); });
      if (rest.length) S.sess.prefetch(rest);
    }).catch(function () { if (tok === S.tok2) { S.view = "orig"; S.on = false; paint(); } });
  }
  function setOn(on) { if (!S.sess) return; S.on = on; keep(); if (on) applyLevel(); else { S.tok2 = (S.tok2 || 0) + 1; S.view = "orig"; paint(); } }
  function setLevel(id) { S.level = id; S.on = true; keep(); closeMenu(); fillMenu(); applyLevel(); }

  /* ---------------------------------------------------------------- levels, tucked behind the pill */
  function fillMenu() {
    var m = $("[data-pe-menu]"); if (!m) return;
    var hints = { light: "a touch", balanced: "default", full: "the most" };
    m.innerHTML = '<h4>Strength</h4>' + (PhotoEnhance.LEVELS || []).filter(function (l) { return l.id !== "off"; }).map(function (l) {
      return '<button type="button" role="menuitemradio" aria-checked="' + (l.id === S.level) + '" data-level="' + l.id + '">' + ic("check") + l.label + '<small>' + (hints[l.id] || "") + '</small></button>';
    }).join("");
  }
  function openMenu() { var m = $("[data-pe-menu]"), b = $("[data-pe-levels]"); if (!m || !S.sess || S.small) return; m.hidden = false; b.setAttribute("aria-expanded", "true"); var c = m.querySelector('[aria-checked="true"]'); if (c) c.focus(); }
  function closeMenu(refocus) { var m = $("[data-pe-menu]"), b = $("[data-pe-levels]"); if (!m) return; m.hidden = true; if (b) { b.setAttribute("aria-expanded", "false"); if (refocus) b.focus(); } }
  function fillNotes() {
    var ul = $("[data-pe-list]"); if (!ul) return;
    var rows = notesNow().filter(function (n) { return n.value; });
    ul.innerHTML = rows.length ? rows.map(function (n) { return '<li><span>' + esc(n.label || n.key) + '</span><span>' + esc(n.text || "") + '</span></li>'; }).join("") : '<li><span>Nothing to change</span><span>Looks good already</span></li>';
  }

  /* ---------------------------------------------------------------- confirm: the ONLY moment anything is encoded */
  function plainShrink(blob, edge) {
    return createImageBitmap(blob, { imageOrientation: "from-image" }).then(function (bm) {
      var k = Math.min(1, edge / Math.max(bm.width, bm.height)), w = Math.round(bm.width * k), h = Math.round(bm.height * k);
      var c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(bm, 0, 0, w, h); bm.close();
      return new Promise(function (res, rej) { c.toBlob(function (b) { b ? res(b) : rej(new Error("encode")); }, "image/webp", 0.82); });
    });
  }
  function squareOf(blob) {
    return createImageBitmap(blob).then(function (bm) {
      var m = Math.min(bm.width, bm.height), c = document.createElement("canvas"); c.width = c.height = 240;
      var x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(bm, (bm.width - m) / 2, (bm.height - m) / 2, m, m, 0, 0, 240, 240);
      var dims = [bm.width, bm.height]; bm.close();
      return new Promise(function (res) { c.toBlob(function (b) { res({ blob: b, dims: dims }); }, "image/webp", 0.8); });
    });
  }
  function usePhoto() {
    if (S.busy || S.step !== "review") return; S.busy = true; closeMenu();
    var use = $("[data-pe-use]"); use.disabled = true; use.lastChild.textContent = "Making your photo…";
    var enhanced = !!(S.sess && S.on && !S.small && !S.plain);
    var lv = enhanced ? S.level : "off";
    var big = S.big && enhanced;
    $("[data-pe-make]").innerHTML = '<div class="pe-make" role="status"><b>' + (big ? 'Big photo: making the full-size copy' : enhanced ? 'Making the ' + EDGE + ' px copy' : 'Making it smaller') + '</b>' +
      '<small>' + (big ? 'This is the one slow moment, a few seconds. It runs off the main thread, so the screen stays alive.' : 'Done on this phone. This is the only time the picture is encoded.') + '</small>' +
      '<div class="prog ind" aria-hidden="true"><i></i></div></div>';
    $("[data-pe-make]").scrollIntoView && $("[data-pe-make]").scrollIntoView({ block: "nearest" });
    var made, t0 = performance.now();
    if (sim === "fail" && enhanced) made = Promise.reject(new Error("encode failed"));
    else if (S.sess && S.sess.encodeSet) {
      /* the engine cuts the 240 square from the SAME enhanced pixels, so the square is never enhanced twice */
      made = S.sess.encodeSet(lv, { maxEdge: EDGE, type: "image/webp", quality: 0.82, square: 240, onProgress: function (m) {
        var bar = $("[data-pe-make] .prog"); if (bar && m && m.pct != null) { bar.classList.remove("ind"); bar.firstChild.style.width = Math.round(m.pct * 100) + "%"; }
      } }).then(function (r) { return { big: r.blob, sq: r.square, dims: [r.width, r.height] }; });
    } else made = plainShrink(S.blob, EDGE).then(function (b) { return squareOf(b).then(function (sq) { return { big: b, sq: sq.blob, dims: sq.dims }; }); });
    made.then(function (out) { out.enhanced = enhanced; out.level = lv; out.ms = Math.round(performance.now() - t0); S.out = out; drawSending(); })
      .catch(function () {
        S.busy = false; use.disabled = false; use.lastChild.textContent = "Use photo"; $("[data-pe-make]").innerHTML = "";
        var er = $("[data-pe-err]"); er.hidden = false;
        er.innerHTML = 'That one would not polish. Send your original as it is instead? <button type="button" class="mini" data-pe-asis style="margin-left:6px">Send original</button>';
      });
  }
  function sendAsIs() {
    S.on = false; S.sess = null; S.plain = true; S.busy = true;
    plainShrink(S.blob, EDGE).then(function (b) { return squareOf(b).then(function (sq) { S.out = { big: b, sq: sq.blob, dims: sq.dims, enhanced: false, level: "off" }; drawSending(); }); });
  }

  /* ---------------------------------------------------------------- hand-off to the existing upload queue (states and words are the queue's own) */
  var QSTATES = [["waiting", "Waiting"], ["uploading", "Uploading 40%"], ["uploading", "Uploading 100%"], ["processing", "Photo is being prepared"], ["done", "Done"]];
  var qtimer;
  function drawSending() {
    S.step = "sending"; var o = S.out; var url = URL.createObjectURL(o.big), sqUrl = URL.createObjectURL(o.sq);
    var was = S.blob ? S.blob.size : 0;
    ph.innerHTML = top("Sending", "Close") + '<div class="body">' + aim() +
      '<div class="frame"><span class="pf in" style="aspect-ratio:4/3"><img class="pi" alt="Your photo" src="' + url + '" style="object-fit:contain"><span class="pq" data-pq data-q="waiting">Waiting</span></span></div>' +
      '<div class="pe-res" data-pe-res>' +
        '<b>Picture</b><span>' + Math.max(o.dims[0], o.dims[1]) + ' px long edge · <b data-kb-big>' + kb(o.big.size) + '</b></span>' +
        '<b class="sq"><img class="sqt" alt="" src="' + sqUrl + '">Square</b><span>240 px · <b>' + kb(o.sq.size) + '</b></span>' +
        '<small style="grid-column:1/-1;color:var(--muted);margin-top:4px">' + (o.enhanced ? 'Enhanced (' + levelLabel(o.level) + ') from your original, once, just now' : 'Made smaller from your original, just now, as today. Not enhanced')+ (was ? '. Your original was ' + kb(was) + '.' : '.') + (o.enhanced ? ' The square is cut from that same result.' : '') + '</small></div>' +
      '<div class="pad"><b data-pq-text>Waiting</b><div class="prog"><i data-pq-bar></i></div><p style="font-size:12.5px;margin-top:8px">You can leave this screen. If the signal drops it tries again; nothing is lost.</p></div></div>' +
      '<div class="pqpill" role="status" aria-live="polite" data-q="waiting"><span class="pqt">Photo: waiting</span></div>';
    var i = 0; var step = sim === "slow" ? 1400 : 700; clearInterval(qtimer);
    function tick() {
      var s = QSTATES[i]; var chip = $("[data-pq]"); if (!chip) { clearInterval(qtimer); return; }
      chip.dataset.q = s[0]; chip.textContent = s[1]; $("[data-pq-text]").textContent = s[1]; $("[data-pq-bar]").style.width = (s[0] === "waiting" ? 5 : s[1].indexOf("40") > -1 ? 40 : s[1].indexOf("100") > -1 ? 100 : 100) + "%";
      var pill = $(".pqpill"); pill.dataset.q = s[0]; pill.firstChild.textContent = "Photo: " + s[1].toLowerCase();
      if (i === QSTATES.length - 1) { clearInterval(qtimer); setTimeout(function () { if (S.step === "sending") drawDone(url); }, 600); }
      i++;
    }
    tick(); qtimer = setInterval(tick, step);
  }
  function drawDone(url) {
    S.step = "done"; var o = S.out;
    ph.innerHTML = top("Photo added", "Close") + '<div class="body">' + aim() +
      '<div class="frame"><span class="pf in" style="aspect-ratio:4/3"><img class="pi" alt="Your photo" src="' + url + '" style="object-fit:contain"></span></div>' +
      '<div class="pundo" role="status">' + ic("check") + '<span class="t"><b>Photo added</b><small>Undo removes it for 5 minutes. Nothing else is kept.</small></span><button type="button" class="mini" data-pe-remove>Undo</button></div>' +
      '<details class="pe-keep"' + (o.enhanced ? " open" : "") + '><summary>' + ic("chev", "s") + 'Can I get the original back?</summary>' +
        '<p>' + (o.enhanced ? 'The photo stored is the enhanced one. The server keeps no originals, so <b>removing the enhancement later is not possible</b>. Your phone\'s own library still has the original: pick it again with Replace.' : 'This one was not enhanced, so what is stored is your original (made smaller), the same as today.') + '</p>' +
        '<p><b>Mockup note, open question:</b> is that enough? Proposal: yes for now. Keeping originals would break the "no originals" decision.</p></details>' +
      '</div><div class="act"><button type="button" class="btn ghost" data-pe-again>' + ic("plus", "s") + 'Add another</button></div>';
  }

  /* ---------------------------------------------------------------- start from a sample or from a file */
  function fromSample(file) {
    return fetch(ENGINE + "samples/" + file).then(function (r) { return r.blob(); }).then(function (b) {
      if (sim === "small") return downscale(b, 420);
      return b;
    }).then(function (b) { begin(b, file); });
  }
  function downscale(blob, edge) { return createImageBitmap(blob).then(function (bm) { var k = edge / Math.max(bm.width, bm.height), c = document.createElement("canvas"); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k); c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height); bm.close(); return new Promise(function (r) { c.toBlob(r, "image/jpeg", 0.85); }); }); }

  /* ---------------------------------------------------------------- one listener for the screen */
  ph.addEventListener("click", function (e) {
    var t = e.target.closest("button,label"); var menu = $("[data-pe-menu]");
    if (menu && !menu.hidden && !e.target.closest("[data-pe-menu],[data-pe-levels]")) closeMenu();
    if (!t) return;
    if (t.dataset.sample) fromSample(t.dataset.sample);
    else if (t.hasAttribute("data-cancel")) { if (S.step === "pick") X.toast("Nothing was changed"); else drawPick(); }
    else if (t.hasAttribute("data-pe-toggle")) setOn(!(S.on && S.view !== "orig"));
    else if (t.hasAttribute("data-pe-undo")) { setOn(false); }
    else if (t.hasAttribute("data-pe-redo")) { setOn(true); }
    else if (t.hasAttribute("data-pe-levels")) { menu.hidden ? openMenu() : closeMenu(true); }
    else if (t.dataset.level) setLevel(t.dataset.level);
    else if (t.hasAttribute("data-pe-use")) usePhoto();
    else if (t.hasAttribute("data-pe-asis")) sendAsIs();
    else if (t.hasAttribute("data-pe-remove")) { drawPick(); X.toast("Photo removed"); }
    else if (t.hasAttribute("data-pe-again")) drawPick();
  });
  ph.addEventListener("change", function (e) {
    var f = e.target.matches("[data-own-file]") && e.target.files && e.target.files[0]; if (f) begin(f, f.name);
  });
  ph.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("[data-pe-menu]") && !$("[data-pe-menu]").hidden) { e.stopPropagation(); closeMenu(true); }
    var m = e.target.closest && e.target.closest("[data-pe-menu]");
    if (m && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); var items = [].slice.call(m.querySelectorAll("button")), i = items.indexOf(document.activeElement); items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus(); }
  });

  /* ---------------------------------------------------------------- the prototype controls (one small button, like the theme picker) */
  (function controls() {
    var b = document.createElement("button"); b.type = "button"; b.className = "mockb"; b.textContent = "Mockup"; b.setAttribute("aria-expanded", "false");
    var p = document.createElement("div"); p.className = "mockp"; p.hidden = true;
    var L = function (label, o) { return '<a href="' + qs(o) + '">' + label + '</a>'; };
    p.innerHTML = '<h4>Option C: auto-on</h4><p style="font-size:12px">Opens already enhanced. Pill = toggle, chevron = strength, hold the photo = original, Undo = one tap.</p>' +
      '<h4>Photo</h4><p class="pe-jump">' + SAMPLE_FALLBACK.map(function (s) { return L(s[1], { s: s[0] }); }).join("") + '</p>' +
      '<h4>What is being added</h4><p class="pe-jump">' + L("Banner", { kind: "banner", from: null }) + L("Step", { kind: "step", from: null }) + L("More photos", { kind: "more", from: null }) + L("Cooked", { kind: "cooked", from: null }) + L("After cooking (cook mode)", { kind: "cooked", from: "cook" }) + '</p>' +
      '<h4>Edge states (on the photo you pick)</h4><p class="pe-jump">' + L("Engine unsupported", { sim: "unsupported" }) + L("Slow (Preparing)", { sim: "slow" }) + L("Small photo", { sim: "small" }) + L("HEIC, cannot open", { sim: "heic" }) + L("Encode fails", { sim: "fail" }) + L("None", { sim: null }) + '</p>' +
      '<h4>Theme</h4><div class="tgrid swatches">' + (window.themeHtml ? themeHtml(null, true) : "") + '</div>';
    document.body.appendChild(p); document.body.appendChild(b);
    b.addEventListener("click", function () { p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden)); if (window.themeWarm) themeWarm(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") p.hidden = true; });
  })();

  /* ---------------------------------------------------------------- go */
  var jump = Q.get("s");
  if (jump) fromSample(jump + ".jpg"); else drawPick();
})();
