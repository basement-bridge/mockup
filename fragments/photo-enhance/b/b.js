/* Option B: Enhance as its own step. Pick -> Crop and rotate (as today) -> Enhance (this option) -> Use photo -> the existing upload queue.
   Uses the shared engine (../engine/enhance.js, window.PhotoEnhance) and nothing else: no copy of any image code here.
   The engine is fetched when the person taps Next on the Crop step, not on page load (DESIGN.md section 6).
   Mockup-only: the sample list, the stand-in crop, the faked upload, the Mockup panel. Everything with a class starting e/ or the .pqpill is lifted into the app. */
(function () {
  "use strict";
  var Q = new URLSearchParams(location.search);
  var ph = document.getElementById("ph");
  var P = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    thermo: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/>',
    hi: '<path d="M4 18l5-9 4 6 2-3 5 6z"/><path d="M5 5h4"/>',
    lo: '<path d="M4 18l5-9 4 6 2-3 5 6z"/><path d="M15 5h4"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    grain: '<circle cx="7" cy="7" r="1"/><circle cx="12" cy="9" r="1"/><circle cx="17" cy="7" r="1"/><circle cx="8" cy="13" r="1"/><circle cx="14" cy="14" r="1"/><circle cx="18" cy="12" r="1"/><circle cx="10" cy="18" r="1"/><circle cx="16" cy="18" r="1"/>',
    sharp: '<path d="M12 4l8 14H4z"/><path d="M12 10v4"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    wand: '<path d="M5 19L15 9"/><path d="M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 12l.7 1.3 1.3.7-1.3.7-.7 1.3-.7-1.3-1.3-.7 1.3-.7z"/>',
    chev: '<path d="M9 6l6 6-6 6"/>', back: '<path d="M15 6l-6 6 6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>',
    cam: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', img: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M5 18l5-5 4 4 2-2 3 3"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/>'
  };
  var ic = function (n, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + "</svg>"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var NOTE_IC = { exposure: "sun", whitebalance: "thermo", highlights: "hi", shadows: "lo", vibrance: "spark", denoise: "grain", sharpen: "sharp" };
  var KB = function (n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + " KB" : (n / 1048576).toFixed(1) + " MB"; };

  /* Output sizes (locked: banner 1600 px long edge, every other photo 960 px, plus a 240 px square cut from the SAME result) */
  var KINDS = {
    banner: { name: "Banner", edge: 1600, title: "Add a banner", where: "the top of the page and the list. One per version." },
    step: { name: "Step photo", edge: 960, title: "Photo for a step", where: "one photo per step." },
    more: { name: "Photo", edge: 960, title: "Add a photo", where: "into Photos." },
    cooked: { name: "What you made", edge: 960, title: "Add a photo", where: "into Cooked, with your name." }
  };
  var S = { step: "pick", kind: KINDS[Q.get("kind")] ? Q.get("kind") : "cooked", from: Q.get("from") || "", level: "balanced", holding: false, latched: false, token: 0 };
  try { var lv = sessionStorage.getItem("pe-b-level"); if (lv && lv !== "off") S.level = lv; } catch (e) { /* remembered only inside this tab */ }
  var forceUnsupported = Q.get("force") === "unsupported";

  /* ---------- engine, loaded on engagement ---------- */
  var engineP = null;
  function loadEngine() {
    if (window.PhotoEnhance) return Promise.resolve(window.PhotoEnhance);
    return engineP || (engineP = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = "../engine/enhance.js";
      s.onload = function () { window.PhotoEnhance ? res(window.PhotoEnhance) : rej(new Error("no engine")); };
      s.onerror = function () { rej(new Error("engine failed")); };
      document.head.appendChild(s);
    }));
  }
  window.__encodeCalls = 0; /* proof: nothing is encoded before Use photo (tools/photo-enhance-b-check.mjs) */
  var LEVELS = function () { return (window.PhotoEnhance && PhotoEnhance.LEVELS) || [{ id: "off", label: "Original" }, { id: "light", label: "Light" }, { id: "balanced", label: "Balanced" }, { id: "full", label: "Full" }]; };
  var levelLabel = function (id) { return (LEVELS().filter(function (l) { return l.id === id; })[0] || { label: id }).label; };
  var $ = function (sel) { return ph.querySelector(sel); };

  /* ---------- samples ---------- */
  var SAMPLES = [
    { file: "dark.jpg", label: "Dark and flat" }, { file: "warm.jpg", label: "Yellow cast" }, { file: "blown.jpg", label: "Blown highlights" },
    { file: "noisy.jpg", label: "Noisy, low light" }, { file: "good.jpg", label: "Already good" }, { file: "large.jpg", label: "Big photo" }
  ];
  fetch("../engine/samples/samples.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (j && j.length) { SAMPLES = j.map(function (x) { return { file: x.file, label: x.label }; }); if (S.step === "pick") draw(); }
  }).catch(function () { /* the built-in list stays */ });

  /* ---------- screens ---------- */
  function top(back, title, right) {
    return '<div class="top">' + (back ? '<button type="button" class="back" data-back>' + ic("back", "s") + back + "</button>" : '<span style="width:64px"></span>') + '<span class="ttl">' + title + '</span><span style="width:64px;text-align:right">' + (right || "") + "</span></div>";
  }
  function aim() {
    var k = KINDS[S.kind];
    return '<div class="aim">' + ic(S.kind === "cooked" ? "cam" : "img", "s") + "<span><b>" + k.name + '</b><small style="display:block;color:var(--muted);font-size:12px">' + (S.kind === "banner" ? "Saved at 1600 px" : "Saved at 960 px") + " plus a 240 px square for the list.</small></span></div>";
  }
  function draw() {
    var h = "";
    if (S.step === "pick") {
      h = top("Cancel", KINDS[S.kind].title) + '<div class="body">' + aim() +
        '<div class="mockmark">Your phone\'s own picker</div><div class="epick">' +
        '<label class="own">' + ic("cam") + '<span>Try your own photo</span><input type="file" accept="image/*" id="own" aria-label="Try your own photo"></label>' +
        SAMPLES.map(function (s, i) { return '<button type="button" data-s="' + i + '" aria-label="' + esc(s.label) + '"><img src="../engine/samples/' + esc(s.file) + '" alt="" loading="lazy"><span class="flaw">' + esc(s.label) + "</span></button>"; }).join("") +
        '<button type="button" data-s="small" aria-label="A small photo"><img src="img/small.jpg" alt=""><span class="flaw">Small (400 px)</span></button>' +
        '<button type="button" data-s="heic" aria-label="A photo this browser cannot open"><span class="flaw" style="padding-top:4px">HEIC the browser cannot open</span></button></div>' +
        '<p class="local">' + ic("lock", "s") + "Stays on this phone until you confirm.</p>" +
        '<div class="kinds" role="group" aria-label="What kind of photo">' + Object.keys(KINDS).map(function (k) { return '<button type="button" data-k="' + k + '" aria-pressed="' + (S.kind === k) + '">' + KINDS[k].name + "</button>"; }).join("") + "</div></div>";
    } else if (S.step === "frame") {
      h = top("Back", "Crop and rotate") + '<div class="body"><div class="cstage"><div class="cframe" style="aspect-ratio:' + (S.w && S.h ? Math.min(S.w / S.h, 1.6) : 4 / 3) + '"><img id="fimg" src="' + S.url + '" alt="Your photo"></div></div>' +
        '<div class="pad" style="padding-top:0"><p style="font-size:12.5px">' + ic("info", "xs") + ' This is today\'s Crop and rotate, unchanged. Enhance comes <b>next</b>, after the crop, so it only ever works on pixels you keep.</p>' +
        '<p class="enote" id="smallnote" hidden>' + ic("info", "s") + "<span></span></p></div></div>" +
        '<div class="act"><button type="button" class="btn" id="next" disabled>Next</button></div>';
    } else if (S.step === "enhance") {
      var ls = LEVELS();
      h = top("Back", "Make it pop", '<button type="button" class="back" data-skip style="justify-content:flex-end">Skip</button>') +
        '<div class="body" id="ebody">' +
        '<div class="eprev" id="eprev" style="--ar:' + (S.w && S.h ? S.w + "/" + S.h : "4/3") + '" data-ready="0"><img class="eimg" id="eimg" src="' + S.url + '" alt="Your photo, original">' +
        '<canvas class="ec" id="ecv" role="img" aria-label="Enhanced preview"></canvas><canvas class="ec" id="eorig" role="img" aria-label="Original preview"></canvas>' +
        '<span class="etag" id="etag" aria-hidden="true"></span><span class="eprep" id="eprep" role="status" hidden><i></i>Preparing</span></div>' +
        '<div class="ehrow"><button type="button" class="ehold" id="ehold" aria-pressed="false" aria-describedby="ehint">' + ic("eye") + '<span id="eholdt">Hold for original</span></button>' +
        '<button type="button" class="ib" id="latch" aria-pressed="false" aria-label="Keep showing the original">' + ic("eye") + "</button></div>" +
        '<span class="vh" id="ehint">Press and hold, or hold Space or Enter, to see the original. The round button keeps it on.</span><p class="vh" id="elive" aria-live="polite"></p>' +
        '<div class="elv" role="radiogroup" aria-label="How much">' + ls.map(function (l) { return '<button type="button" role="radio" data-l="' + l.id + '" aria-checked="' + (S.level === l.id) + '">' + esc(l.label) + "</button>"; }).join("") + "</div>" +
        '<p class="egood" id="egood" hidden>' + ic("check", "s") + "<span>Looks good already. Balanced barely changes it, so Skip is a fine choice.</span></p>" +
        '<p class="enote" id="ebig" hidden>' + ic("info", "s") + "<span></span></p>" +
        '<details class="ewhat" id="ewhat"><summary>' + ic("wand", "s") + "What changed" + '<span class="n" id="ewn"></span>' + ic("chev", "xs") + '</summary><div id="ewl"></div></details>' +
        '<p class="efoot">' + ic("lock", "xs") + "<span>Nothing is made or sent until you tap Use photo. Your original is not changed.</span></p></div>" +
        '<div class="act"><button type="button" class="btn ghost" data-skip>' + (S.from === "cook" ? "Skip" : "Skip") + '</button><button type="button" class="btn" id="use" disabled>' + ic("check", "s") + "Use photo</button></div>";
    } else if (S.step === "make") {
      var big = S.mp >= 12;
      h = top("", "Making your photo") + '<div class="body"><div class="eframe"><img src="' + (S.snap || S.url) + '" alt=""></div>' +
        '<div class="eout"><div class="row"><b id="mk">' + (big ? "Making the full size (" + S.mp.toFixed(0) + " MP). This takes a few seconds." : "Making it at " + KINDS[S.kind].edge + " px.") + '</b></div>' +
        '<div class="indet" role="progressbar" aria-label="Making your photo"><i></i></div>' +
        '<p style="font-size:12.5px;margin-top:6px">This is the only moment the photo is made. Nothing has been sent yet.</p></div></div>';
    } else if (S.step === "up") {
      var o = S.out || {};
      h = top("", "Sending") + '<div class="body">' + ((o.url || S.url) ? '<div class="eframe"><img src="' + (o.url || S.url) + '" alt="">' : '<div class="eframe" hidden>') + '<span class="pq" id="pqchip" role="status" data-q="waiting">Waiting</span></div>' +
        '<div class="eout">' + (o.raw ? '<div class="row">' + ic("img", "s") + "<span>This phone could not make it smaller, so it goes as it is. Recipe prepares it when the server is free; until then it shows as <b>\"Photo is being prepared\"</b>.</span></div>" :
          '<div class="row">' + ic("check", "s") + "<span>Made on your phone just now: <b>" + o.w + " × " + o.h + " px, " + KB(o.bytes) + "</b>" + (S.bytes ? " (picked " + KB(S.bytes) + ")" : "") + ". Square: <b>240 px, " + KB(o.sqBytes) + '</b>, cut from the same photo. Location removed.</span></div>') +
        (o.level ? '<div class="row">' + ic("wand", "s") + "<span>" + (o.level === "off" ? "Not enhanced." : "Enhanced: <b>" + esc(levelLabel(o.level)) + "</b>.") + "</span></div>" : "") +
        '<div class="prog"><i id="bar"></i></div><p style="font-size:12.5px">You can leave this screen. If the signal drops it tries again; nothing is lost.</p></div>' +
        '<div id="done" hidden><div class="pundo"><span class="t"><b>Saved</b><small id="undot">Undo for 5 minutes</small></span><button type="button" class="mini" id="undo">Undo</button></div>' +
        '<p class="enote" style="margin-top:var(--sp-3)">' + ic("info", "s") + "<span>" + (o.level && o.level !== "off" ? "The saved photo is the enhanced one. Recipe keeps no original, so Enhance cannot be taken off later. To get the plain one back, remove it and add it again." : "Saved exactly as picked. Recipe keeps no original.") + "</span></p></div></div>" +
        '<div class="act" id="upact" hidden><button type="button" class="btn ghost" data-again>Add another</button><button type="button" class="btn" data-exit>' + (S.from === "cook" ? "Back to the cook" : "Done") + "</button></div>";
    }
    ph.innerHTML = h + panelHtml();
    after();
  }

  /* ---------- the Mockup panel (prototype only) ---------- */
  function panelHtml() {
    return '<button type="button" class="mockb" id="mockb" aria-expanded="false">Mockup</button><div class="mockp" id="mockp" hidden>' +
      "<h4>Kind of photo</h4>" + '<div class="seg">' + Object.keys(KINDS).map(function (k) { return '<button type="button" data-pk="' + k + '" aria-pressed="' + (S.kind === k) + '">' + KINDS[k].name + "</button>"; }).join("") + "</div>" +
      '<h4>States</h4><p><a href="?kind=' + S.kind + '&force=unsupported">Browser without Enhance (silent fallback)</a> · <a href="?kind=' + S.kind + '&from=cook">Arrive from a cook</a> · <a href="?kind=' + S.kind + '">Normal</a></p>' +
      '<h4>Theme</h4><div class="tgrid swatches">' + (window.themeHtml ? window.themeHtml(null, true) : "") + "</div>" +
      '<h4>What this page loaded</h4><p id="meter" style="font-size:12px"></p></div>';
  }
  function meter() {
    var m = document.getElementById("meter"); if (!m) return;
    var rs = performance.getEntriesByType("resource").filter(function (r) { return /photo-enhance\/engine\/(?!samples)/.test(r.name); });
    var sm = performance.getEntriesByType("resource").filter(function (r) { return /samples\/[^/]+\.(jpg|webp)/.test(r.name) && !/samples\.json/.test(r.name); });
    var sz = function (a) { return a.reduce(function (t, r) { return t + (r.encodedBodySize || r.transferSize || 0); }, 0); };
    m.innerHTML = "Engine and worker: <b>" + (rs.length ? rs.length + " files, " + KB(sz(rs)) : "not loaded yet") + "</b>. Sample photos fetched: <b>" + sm.length + "</b>.";
  }

  /* ---------- events ---------- */
  ph.addEventListener("click", function (e) {
    var t = e.target.closest("button, a"); if (!t) return;
    if (t.id === "mockb") { var p = $("#mockp"); p.hidden = !p.hidden; t.setAttribute("aria-expanded", String(!p.hidden)); meter(); return; }
    if (t.dataset.pk) { S.kind = t.dataset.pk; draw(); return; }
    if (t.dataset.k) { S.kind = t.dataset.k; draw(); return; }
    if (t.dataset.s) { pickSample(t.dataset.s); return; }
    if (t.hasAttribute("data-back")) { S.step === "frame" ? reset() : S.step === "enhance" ? backToFrame() : history.back(); return; }
    if (t.id === "next") { goEnhance(); return; }
    if (t.dataset.l) { setLevel(t.dataset.l); return; }
    if (t.id === "use") { useIt(); return; }
    if (t.hasAttribute("data-skip")) { skipIt(); return; }
    if (t.id === "latch") { S.latched = !S.latched; paint(); return; }
    if (t.id === "undo") { $("#undot").textContent = "Removed. It is gone after 5 minutes."; t.disabled = true; return; }
    if (t.hasAttribute("data-again")) { reset(); return; }
    if (t.hasAttribute("data-exit")) { location.href = S.from === "cook" ? "../../../recipe/cook.html" : "../../../recipe-photos/"; return; }
  });
  ph.addEventListener("change", function (e) { if (e.target.id === "own" && e.target.files[0]) { var f = e.target.files[0]; pick(f, f.name, f.type); } });
  ph.addEventListener("keydown", function (e) {
    var r = e.target.closest && e.target.closest(".elv button"); if (!r) return;
    var bs = [].slice.call(ph.querySelectorAll(".elv button")), i = bs.indexOf(r), n = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (n) { e.preventDefault(); var b = bs[(i + n + bs.length) % bs.length]; b.focus(); setLevel(b.dataset.l); }
  });

  /* ---------- pick and crop ---------- */
  function reset() {
    if (S.sess) { try { S.sess.close(); } catch (e) { /* nothing to free */ } }
    if (S.url) URL.revokeObjectURL(S.url);
    S = { step: "pick", kind: S.kind, from: S.from, level: S.level, holding: false, latched: false, token: S.token + 1 };
    draw();
  }
  function pickSample(i) {
    if (i === "heic") { S.heic = true; S.url = ""; S.out = { raw: true, url: "" }; S.step = "up"; draw(); upload(); return; }
    var url = i === "small" ? "img/small.jpg" : "../engine/samples/" + SAMPLES[+i].file;
    fetch(url).then(function (r) { return r.blob(); }).then(function (b) { pick(b, url.split("/").pop(), b.type); });
  }
  function pick(blob, name, type) {
    if (/heic|heif/i.test(type + name) && !/jpe?g|png|webp/i.test(type)) { S.heic = true; S.out = { raw: true, url: "" }; S.step = "up"; draw(); upload(); return; }
    S.blob = blob; S.bytes = blob.size; S.name = name; S.url = URL.createObjectURL(blob); S.step = "frame"; draw();
    var im = $("#fimg"); im.onload = function () {
      S.w = im.naturalWidth; S.h = im.naturalHeight; S.mp = S.w * S.h / 1e6;
      var long = Math.max(S.w, S.h), nb = $("#smallnote"), nx = $("#next");
      if (long < 240) { nb.hidden = false; nb.querySelector("span").textContent = "That photo is too small (" + long + " px). Pick one that is at least 240 px."; return; }
      if (long < 640) { nb.hidden = false; nb.querySelector("span").textContent = "A small photo (" + long + " px). Enhance still works, but it will look soft at full width."; }
      nx.disabled = false;
    };
    im.onerror = function () { S.heic = true; S.out = { raw: true, url: "" }; S.step = "up"; draw(); upload(); };
  }
  function backToFrame() { if (S.sess) { try { S.sess.close(); } catch (e) { /* nothing to free */ } S.sess = null; } S.token++; S.step = "frame"; draw(); var im = $("#fimg"); im.onload = function () { $("#next").disabled = false; }; if (im.complete) $("#next").disabled = false; }

  /* ---------- the Enhance step ---------- */
  function goEnhance() {
    var nx = $("#next"); nx.disabled = true; nx.textContent = "Getting ready";
    loadEngine().then(function (E) {
      if (!E.supported || forceUnsupported) throw new Error("unsupported"); /* silent fallback: upload as today, no Enhance anywhere */
      S.step = "enhance"; draw();
      return E.open(S.blob).then(ready);
    }).catch(function (err) { if (window.console && !/unsupported/.test(err && err.message)) console.warn("Enhance fell back:", err); asIs(); });
  }
  function isGood(notes) {
    if (!notes || !notes.length) return true;
    return notes.some(function (n) { return /looks good/i.test(n.text || ""); }) || notes.every(function (n) { return Math.abs(n.value) < 0.03; });
  }
  function ready(sess) {
    S.sess = sess;
    var enc = sess.encode.bind(sess); sess.encode = function () { window.__encodeCalls++; return enc.apply(null, arguments); };
    S.mp = sess.width * sess.height / 1e6; S.good = typeof sess.good === "boolean" ? sess.good : isGood(sess.notes);
    var eprev = $("#eprev"); if (!eprev) return;
    eprev.style.setProperty("--ar", sess.width + "/" + sess.height);
    $("#egood").hidden = !S.good;
    if (S.mp >= 12) { var b = $("#ebig"); b.hidden = false; b.querySelector("span").textContent = "Big photo (" + S.mp.toFixed(0) + " MP). The preview is smaller; the full size is made when you tap Use photo."; }
    sess.render("off", $("#eorig")).then(function () { $("#eorig").classList.add("in"); var im = $("#eimg"); if (im) { im.remove(); } });
    $("#use").disabled = false;
    showLevel(S.level, true);
  }
  function showLevel(id, first) {
    var sess = S.sess; if (!sess) return; var my = ++S.token, cv = $("#ecv"), prep = $("#eprep");
    if (!sess.ready(id)) prep.hidden = false;
    sess.render(id, cv).then(function () {
      if (my !== S.token) return; /* a newer choice wins */
      cv.classList.add("in"); prep.hidden = true; $("#eprev").dataset.ready = "1";
      if (first) sess.prefetch(LEVELS().map(function (l) { return l.id; }).filter(function (x) { return x !== id; }));
      paint();
    }).catch(function () { if (my === S.token) prep.hidden = true; });
    paint();
  }
  function setLevel(id) {
    S.level = id; if (id !== "off") { try { sessionStorage.setItem("pe-b-level", id); } catch (e) { /* not remembered */ } }
    ph.querySelectorAll(".elv button").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.l === id)); });
    showLevel(id);
  }
  function paint() {
    var ep = $("#eprev"); if (!ep) return;
    var showOrig = S.holding || S.latched;
    ep.classList.toggle("holding", S.holding); ep.classList.toggle("latched", S.latched);
    $("#etag").textContent = showOrig ? "Original" : levelLabel(S.level);
    var hb = $("#ehold"); hb.setAttribute("aria-pressed", String(S.holding)); $("#eholdt").textContent = S.holding ? "Showing original" : "Hold for original";
    var lt = $("#latch"); lt.setAttribute("aria-pressed", String(S.latched));
    $("#elive").textContent = showOrig ? "Showing the original" : "Showing " + levelLabel(S.level);
    /* what changed, in plain words */
    var ns = notesNow(), k = (LEVELS().filter(function (l) { return l.id === S.level; })[0] || {}).k;
    var l = $("#ewl"), n = $("#ewn");
    if (!S.sess) { l.innerHTML = ""; n.textContent = ""; return; }
    if (S.level === "off") { l.innerHTML = '<p class="scale">Nothing changed. This is your photo.</p>'; n.textContent = "none"; return; }
    n.textContent = S.good ? "looks good" : ns.length + (ns.length === 1 ? " tweak" : " tweaks");
    l.innerHTML = '<p class="scale">' + (k != null ? levelLabel(S.level) + " uses " + Math.round(k * 100) + "% of each change." : "") + "</p><ul>" +
      ns.map(function (x) { return "<li>" + ic(NOTE_IC[x.key] || "wand", "s") + "<b>" + esc(x.label) + "</b><span>" + esc(x.text) + "</span></li>"; }).join("") + "</ul>";
  }
  function notesNow() { /* the engine may offer notes scaled to a level (notesFor); the contract's session.notes is the fallback */
    var s = S.sess; if (!s) return [];
    try { if (s.notesFor) { var n = s.notesFor(S.level); if (n && n.length) return n; } } catch (e) { /* use session.notes */ }
    return s.notes || [];
  }
  function setHold(b) { if (S.holding === b) return; S.holding = b; paint(); }
  function after() {
    meter();
    var btn = $("#ehold"), prev = $("#eprev");
    if (!btn) return;
    [btn, prev].forEach(function (el) {
      el.addEventListener("pointerdown", function (e) { if (e.button > 0) return; try { el.setPointerCapture(e.pointerId); } catch (x) { /* older engines */ } if (e.cancelable) e.preventDefault(); setHold(true); });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) { el.addEventListener(t, function () { setHold(false); }); });
      el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    });
    btn.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); setHold(true); } });
    btn.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setHold(false); } });
    btn.addEventListener("blur", function () { setHold(false); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) setHold(false); });
    paint();
  }

  /* ---------- confirm: the only moment anything is encoded ---------- */
  function squareOf(blob) {
    return createImageBitmap(blob).then(function (bm) {
      var c = document.createElement("canvas"); c.width = c.height = 240; var s = Math.min(bm.width, bm.height);
      c.getContext("2d").drawImage(bm, (bm.width - s) / 2, (bm.height - s) / 2, s, s, 0, 0, 240, 240);
      var w = bm.width, h = bm.height; bm.close && bm.close();
      return new Promise(function (res) { c.toBlob(function (sq) { res({ w: w, h: h, sq: sq }); }, "image/webp", 0.8); });
    });
  }
  function useIt() { run(S.level); }
  function skipIt() { run("off"); }
  function run(level) {
    var sess = S.sess; if (!sess) { asIs(); return; }
    var cv = $("#ecv"); try { S.snap = (level === "off" ? $("#eorig") : cv).toDataURL("image/jpeg", 0.8); } catch (e) { S.snap = ""; }
    S.step = "make"; draw();
    sess.encode(level, { maxEdge: KINDS[S.kind].edge, type: "image/webp", quality: 0.82 }).then(function (blob) {
      return squareOf(blob).then(function (r) { S.out = { blob: blob, url: URL.createObjectURL(blob), bytes: blob.size, w: r.w, h: r.h, sqBytes: r.sq.size, level: level }; S.step = "up"; draw(); upload(); });
    }).catch(function () { asIs(); });
  }
  function asIs() { /* today's path: the phone shrinks it, no Enhance */
    if (!S.blob) { S.step = "up"; draw(); upload(); return; }
    var edge = KINDS[S.kind].edge;
    createImageBitmap(S.blob).then(function (bm) {
      var sc = Math.min(1, edge / Math.max(bm.width, bm.height)), c = document.createElement("canvas"); c.width = Math.round(bm.width * sc); c.height = Math.round(bm.height * sc);
      var x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(bm, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(res, "image/webp", 0.82); }).then(function (b) { return squareOf(b).then(function (r) { S.out = { blob: b, url: URL.createObjectURL(b), bytes: b.size, w: r.w, h: r.h, sqBytes: r.sq.size, level: null }; }); });
    }).catch(function () { S.out = { raw: true, url: S.url }; }).then(function () { S.step = "up"; draw(); upload(); });
  }

  /* the hand-off: the app's own queue does this for real; here a short faked run with the same wording as photo-queue.js */
  function upload() {
    var bar = $("#bar"), chip = $("#pqchip"), w = 0, pill = null;
    var set = function (q, t) { if (chip) { chip.dataset.q = q; chip.textContent = t; } };
    var go = function () {
      w += 20; if (bar) bar.style.width = Math.min(w, 100) + "%";
      if (w < 100) { set("uploading", "Uploading " + w + "%"); setTimeout(go, 260); }
      else { set("done", "Done"); var d = $("#done"), a = $("#upact"); if (d) d.hidden = false; if (a) a.hidden = false; }
    };
    setTimeout(go, 400);
  }
  window.__pe = S;
  draw();
})();
