/* Live camera receipt scan, mobile mockup. Plain names and sample data stay here, never in the stylesheet (AGENTS.md).
   Nothing here touches a camera, a file or the network. Synthetic receipt, no real shop. */
(function () {
  var I = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    cam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    camoff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><path d="M3 3l18 18"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    img: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M4 17l5-4 4 3 3-2 4 3"/></svg>',
    warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>',
    hold: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 9v6M21 9v6"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>',
    vib: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 9v6M20 9v6"/></svg>'
  };
  var HOLD = 1.2; /* seconds of steadiness before auto-capture, as built */
  var LIST = [["Milk", "2 L"], ["Eggs", "12"], ["Bananas", "1 kg"], ["Penne pasta", "500 g"], ["Butter", "250 g"], ["Chopped tomatoes", "4 tin"]];
  var LINES = [
    { t: "MILK 2L", p: "4.20", k: "direct", n: "Milk" },
    { t: "FREE RANGE EGGS 12", p: "7.50", k: "direct", n: "Eggs" },
    { t: "BANANAS 1.2KG", p: "5.10", k: "direct", n: "Bananas" },
    { t: "PENNE RIGATE 500G", p: "1.99", k: "direct", n: "Penne pasta" },
    { t: "MARGARINE 500G", p: "3.40", k: "swap", n: "Butter" },
    { t: "DISH SPONGE 3PK", p: "4.00", k: "other" },
    { t: "CHOC BISCUITS", p: "2.80", k: "other" },
    { t: "BIN LINERS 30", p: "3.90", k: "other" }
  ];
  /* viewfinder conditions. boxes = the lines are drawn with their boxes. tone = the prompt's style. */
  var ST = {
    look: { tone: "info", ic: "eye", text: "Looking for a receipt...", sub: "Point the camera at it", boxes: false, receipt: true, p: 0 },
    found: { tone: "ok", ic: "hold", text: "Receipt found. Hold steady...", boxes: true, receipt: true, p: 0.33 },
    hold: { tone: "ok", ic: "hold", text: "Receipt found. Hold steady...", boxes: true, receipt: true, p: 0.83 },
    take: { tone: "take", ic: "cam", text: "Steady. Taking the photo...", boxes: true, receipt: true, p: 1 },
    blur: { tone: "warn", ic: "warn", text: "Hold steady, the image is blurry.", boxes: true, receipt: true, blur: true, p: 0 },
    wall: { tone: "soft", ic: "eye", text: "Can't find a receipt (best guess): very little text.", boxes: false, receipt: false, p: 0 },
    rest: { tone: "info", ic: "pause", text: "Camera resting", sub: "Stopped after 150 s without a photo", boxes: true, receipt: true, rest: true, p: 0 }
  };
  var DONE_SHOP = 2;

  function counts(s) { var c = { direct: 0, swap: 0, other: 0 }; if (s.boxes) LINES.forEach(function (l) { c[l.k]++; }); return c; }
  function tag(l) {
    if (l.k === "direct") return '<i class="cs-tg">' + I.check + l.n + '</i>';
    if (l.k === "swap") return '<i class="cs-tg">' + I.swap + 'Swap for ' + l.n + '?</i>';
    return '<i class="cs-tg">' + I.plus + 'Other</i>';
  }
  function receipt(s) {
    if (!s.receipt) return '<div class="cs-wall"><i></i></div>';
    var h = '<div class="cs-rc"><div class="cs-rh"><span>FRESH MART</span><span>14/10 10:42</span></div>';
    LINES.forEach(function (l) { h += '<div class="cs-ln is-' + l.k + '"><span class="tx"><span>' + l.t + '</span><span>' + l.p + '</span></span>' + tag(l) + '</div>'; });
    return h + '<div class="cs-rt"><span>TOTAL</span><span>32.89</span></div></div>';
  }
  function ring(p) {
    var C = 2 * Math.PI * 34;
    return '<svg class="ring" viewBox="0 0 76 76" aria-hidden="true"><circle class="bg" cx="38" cy="38" r="34"/><circle class="pg" cx="38" cy="38" r="34" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - p)).toFixed(1) + '"/></svg>';
  }
  function prompt(s) {
    return '<div class="cs-st ' + s.tone + '" role="status" aria-live="polite">' + I[s.ic] + '<span>' + s.text + (s.sub ? '<small>' + s.sub + '</small>' : '') + '</span></div>';
  }
  function progress(s) {
    if (!(s.p > 0)) return '<div class="cs-prog" aria-hidden="true"></div>';
    var sec = Math.min(HOLD, s.p * HOLD).toFixed(1);
    return '<div class="cs-prog"><span class="tr" role="progressbar" aria-label="Steady" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(s.p * 100) + '"><span class="fl" style="width:' + Math.round(s.p * 100) + '%"></span></span><span class="pt">Steady ' + sec + ' of ' + HOLD.toFixed(1) + ' s</span></div>';
  }
  function legend(s) {
    var c = counts(s);
    return '<div class="cs-lg" aria-label="What the camera sees">' +
      '<div class="d"><span>' + I.check + 'On your list</span><b>' + c.direct + '</b></div>' +
      '<div class="s"><span>' + I.swap + 'Usual swap</span><b>' + c.swap + '</b></div>' +
      '<div class="o"><span>' + I.plus + 'Other</span><b>' + c.other + '</b></div></div>';
  }
  function view(key, extra) {
    var s = ST[key];
    var h = '<div class="cs-bar"><button type="button" class="cs-btn" data-act="done">' + I.x + 'Done</button><h4>Scan receipt</h4><span style="width:84px"></span></div>';
    h += prompt(s) + progress(s);
    h += '<div class="cs-view ' + (s.boxes ? 'cs-box-on ' : '') + (s.blur ? 'cs-blur' : '') + '">' + receipt(s) + '<div class="cs-flash"></div>' +
      '<span class="cs-tick' + (extra && extra.tick ? ' on' : '') + '">' + I.vib + 'Tick on first match (15 ms)</span>' +
      (s.rest ? '<div class="cs-rest"><p>Looking has stopped to save battery.</p><button type="button" class="cs-btn pri" data-act="resume">Resume</button></div>' : '') + '</div>';
    h += legend(s);
    h += '<div class="cs-ctl"><button type="button" class="cs-btn cs-l" data-act="photos">' + I.img + 'Choose a photo</button>' +
      '<button type="button" class="cs-sh" data-act="shutter" aria-label="Take the photo now">' + ring(s.p) + '<span class="core"></span></button><span></span></div>';
    return h;
  }
  function basket(callout) {
    var h = '<div class="cs-bar"><h4>Shopping</h4><span class="qt" style="font-size:13px;color:var(--muted)">6 items</span></div><div class="cs-body"><h5>Ticked</h5>';
    [["Bananas", "1 kg"], ["Eggs", "12"]].forEach(function (x) { h += '<div class="cs-li on"><span class="bx">' + I.check.replace('<svg', '<svg width="16" height="16" style="width:16px;height:16px;stroke-width:3"') + '</span><span class="nm">' + x[0] + '</span><span class="qt">' + x[1] + '</span></div>'; });
    h += '<h5>To get</h5>';
    [["Milk", "2 L"], ["Penne pasta", "500 g"], ["Butter", "250 g"], ["Chopped tomatoes", "4 tin"]].forEach(function (x) { h += '<div class="cs-li"><span class="bx"></span><span class="nm">' + x[0] + '</span><span class="qt">' + x[1] + '</span></div>'; });
    h += '</div><div class="cs-selbar" role="region" aria-label="Basket"><button type="button" class="cs-btn' + (callout ? ' cs-call' : '') + '" data-act="scan" aria-label="Scan the receipt with the camera">' + I.cam + 'Scan</button><button type="button" class="cs-btn pri done" data-act="shopfinish">Done shopping · ' + DONE_SHOP + ' in the basket</button></div>';
    return h;
  }
  function review(a, toast) {
    var matched = LINES.filter(function (l) { return l.k === "direct"; });
    var h = '<div class="cs-bar"><button type="button" class="cs-btn" data-act="done">' + I.x + 'Back</button><h4>Review receipt</h4><span style="width:84px"></span></div><div class="cs-rv">';
    h += '<h5><span>On your list</span><span class="cs-done">' + matched.length + ' ticked</span></h5>';
    matched.forEach(function (l, i) {
      var off = a["m" + i] === "off";
      h += '<div class="cs-rr"><div class="hd"><button type="button" class="cs-tk" data-act="tick" data-i="' + i + '" aria-pressed="' + (!off) + '" aria-label="' + l.n + ' bought"><span class="bx">' + I.check + '</span></button><span class="nm">' + l.n + '<small>' + l.t + '</small></span><span class="qt" style="color:var(--muted);font-size:13px">' + l.p + '</span></div></div>';
    });
    var cf = a.chk;
    h += '<h5><span>Check this</span>' + (cf ? '<span class="cs-done">' + (cf === "yes" ? 'Confirmed' : 'Not this') + '</span>' : '<span class="cs-need">1 to confirm</span>') + '</h5>';
    h += '<div class="cs-rr"><div class="hd"><span class="nm">Margarine<small>MARGARINE 500G</small></span><span style="color:var(--muted);font-size:13px">3.40</span></div><div class="cs-seg" style="grid-template-columns:1fr 1fr"><button type="button" data-act="chk" data-v="yes" aria-pressed="' + (cf === "yes") + '">Yes, instead of Butter</button><button type="button" data-act="chk" data-v="no" aria-pressed="' + (cf === "no") + '">Not this</button></div></div>';
    var left = 0;
    ["DISH SPONGE 3PK", "CHOC BISCUITS", "BIN LINERS 30"].forEach(function (t, i) { if (!a["o" + i]) left++; });
    var open = left + (cf ? 0 : 1);
    h += '<h5><span>Not on your list</span>' + (left ? '<span class="cs-need">' + left + ' to answer</span>' : '<span class="cs-done">Answered</span>') + '</h5>';
    [["Dish sponge 3pk", "DISH SPONGE 3PK"], ["Choc biscuits", "CHOC BISCUITS"], ["Bin liners 30", "BIN LINERS 30"]].forEach(function (x, i) {
      var v = a["o" + i];
      h += '<div class="cs-rr"><div class="hd"><span class="nm">' + x[0] + '<small>' + x[1] + '</small></span></div><div class="cs-seg">' +
        [["add", "Add as bought"], ["sub", "Substitute"], ["skip", "Skip"]].map(function (b) { return '<button type="button" data-act="ans" data-i="' + i + '" data-v="' + b[0] + '" aria-pressed="' + (v === b[0]) + '">' + b[1] + '</button>'; }).join("") + '</div></div>';
    });
    h += '</div><div class="cs-selbar"><button type="button" class="cs-btn pri done" data-act="save"' + (open ? ' disabled aria-disabled="true"' : '') + '>' + (open ? open + ' left to answer' : 'Save to the list') + '</button></div>';
    if (toast) h += '<div class="cs-toast" role="status">Saved (mockup, nothing written)</div>';
    return h;
  }
  function refused() {
    return '<div class="cs-bar"><button type="button" class="cs-btn" data-act="done">' + I.x + 'Done</button><h4>Scan receipt</h4><span style="width:84px"></span></div>' +
      '<div class="cs-ref"><span class="ic">' + I.camoff + '</span><h4>No camera here</h4><p>The camera is blocked or missing. You can still scan: take a photo, or choose one you already have.</p>' +
      '<button type="button" class="cs-btn pri" data-act="photos">' + I.img + 'Take or choose a photo</button><button type="button" class="cs-btn" data-act="done">Back to the shopping list</button></div>';
  }
  function picker() {
    return refused() + '<div class="cs-sheet"><div><h4>Choose a photo</h4><small>The phone\'s own picker, not drawn by Kitchie. Sample photos.</small><div class="cs-ph3">' +
      '<button type="button" class="rc" data-act="pick">' + I.img + 'Receipt</button><button type="button" data-act="pick">' + I.img + 'Dinner</button><button type="button" data-act="pick">' + I.img + 'Garden</button>' +
      '<button type="button" data-act="pick">' + I.img + 'Dog</button><button type="button" data-act="pick">' + I.img + 'Fridge</button><button type="button" data-act="pick">' + I.img + 'Sunset</button></div></div></div>';
  }
  function draw(el, screen, state, a, extra) {
    el.setAttribute("data-screen", screen);
    el.innerHTML = screen === "basket" ? basket(extra && extra.callout) : screen === "view" ? view(state, extra) : screen === "review" ? review(a || {}, extra && extra.toast) : screen === "refused" ? refused() : picker();
  }

  /* static frame strip */
  document.querySelectorAll("[data-static]").forEach(function (el) {
    var pre = el.getAttribute("data-pre");
    var a = pre === "part" ? { chk: "yes", o0: "add" } : {};
    draw(el, el.getAttribute("data-screen"), el.getAttribute("data-state"), a, { callout: el.hasAttribute("data-callout"), tick: el.hasAttribute("data-tick") });
  });

  /* the clickable prototype */
  var P = document.getElementById("proto");
  if (!P) return;
  var S = { screen: "basket", cond: "auto", perm: "allowed", ans: {}, timer: 0, t0: 0 };
  var KEY = { auto: "look", blur: "blur", wall: "wall", rest: "rest" };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
  function stop() { clearInterval(S.timer); S.timer = 0; }
  function paint(extra) {
    var key = S.screen === "view" ? (S.cond === "auto" ? S.auto || "look" : KEY[S.cond]) : "";
    draw(P, S.screen, key, S.ans, extra);
    syncCtl();
  }
  function setP(p) {
    var fl = P.querySelector(".fl"), pt = P.querySelector(".pt"), pgc = P.querySelector(".pg"), tr = P.querySelector("[role=progressbar]");
    if (!fl) { paint(); fl = P.querySelector(".fl"); }
    if (!fl) return;
    fl.style.width = Math.round(p * 100) + "%"; tr.setAttribute("aria-valuenow", Math.round(p * 100));
    pt.textContent = "Steady " + Math.min(HOLD, p * HOLD).toFixed(1) + " of " + HOLD.toFixed(1) + " s";
    var C = 2 * Math.PI * 34; pgc.setAttribute("stroke-dashoffset", (C * (1 - p)).toFixed(1));
  }
  function runAuto() {
    stop(); S.auto = "look"; paint();
    setTimeout(function () {
      if (S.screen !== "view" || S.cond !== "auto") return;
      S.auto = "found"; paint({ tick: true }); setP(0); buzz(15);
      S.t0 = Date.now();
      S.timer = setInterval(function () {
        if (S.screen !== "view" || S.cond !== "auto") { stop(); return; }
        var p = Math.min(1, (Date.now() - S.t0) / (HOLD * 1000));
        if (p < 1) { setP(p); return; }
        stop(); S.auto = "take"; paint({ tick: true });
        var f = P.querySelector(".cs-flash"); if (f) f.classList.add("go"); buzz(30);
        setTimeout(function () { if (S.screen === "view") { S.screen = "review"; paint(); } }, reduce ? 200 : 450);
      }, 60);
    }, reduce ? 300 : 800);
  }
  function enterView() {
    stop(); S.screen = "view"; S.auto = "look";
    if (S.cond === "auto") runAuto(); else paint();
  }
  function go(screen) {
    stop();
    if (screen === "view" && S.perm === "refused") screen = "refused";
    S.screen = screen;
    if (screen === "view") { enterView(); return; }
    if (screen === "review") S.ans = {};
    paint();
  }
  P.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
    var a = b.getAttribute("data-act"), i = b.getAttribute("data-i"), v = b.getAttribute("data-v");
    if (a === "scan") go("view");
    else if (a === "done") go("basket");
    else if (a === "shopfinish") { /* the existing finish flow, not part of this mockup */ }
    else if (a === "shutter") { stop(); var f = P.querySelector(".cs-flash"); if (f) f.classList.add("go"); buzz(30); setTimeout(function () { S.screen = "review"; S.ans = {}; paint(); }, reduce ? 100 : 350); }
    else if (a === "photos") { stop(); S.screen = "picker"; paint(); }
    else if (a === "pick") { S.screen = "review"; S.ans = {}; paint(); }
    else if (a === "resume") { S.cond = "auto"; enterView(); }
    else if (a === "tick") { S.ans["m" + i] = S.ans["m" + i] === "off" ? "" : "off"; paint(); }
    else if (a === "chk") { S.ans.chk = v; paint(); }
    else if (a === "ans") { S.ans["o" + i] = v; paint(); }
    else if (a === "save") { paint({ toast: true }); }
    if (a === "chk" || a === "ans" || a === "tick") { var q = '[data-act="' + a + '"]' + (i != null ? '[data-i="' + i + '"]' : '') + (v != null ? '[data-v="' + v + '"]' : ''); var t = P.querySelector(q); if (t) t.focus(); }
  });
  var C = document.getElementById("proto-ctl");
  function syncCtl() {
    C.querySelectorAll("[data-go]").forEach(function (x) { var g = x.getAttribute("data-go"); x.setAttribute("aria-pressed", String((g === "refused" ? S.screen === "refused" || S.screen === "picker" : g === S.screen))); });
    C.querySelectorAll("[data-cond]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-cond") === S.cond)); });
    C.querySelectorAll("[data-perm]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-perm") === S.perm)); });
  }
  C.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.hasAttribute("data-go")) { var g = b.getAttribute("data-go"); if (g === "refused") { S.perm = "refused"; stop(); S.screen = "refused"; paint(); } else { if (S.perm === "refused" && g === "view") S.perm = "allowed"; go(g); } }
    else if (b.hasAttribute("data-cond")) { S.cond = b.getAttribute("data-cond"); if (S.perm === "refused") S.perm = "allowed"; enterView(); }
    else if (b.hasAttribute("data-perm")) { S.perm = b.getAttribute("data-perm"); if (S.screen === "view" || S.screen === "refused") go("view"); else syncCtl(); }
  });
  go("basket");
})();
