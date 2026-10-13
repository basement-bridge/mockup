/* Recipe share, the create flow (slice "sheet"). Mockup only: nothing is created, no link is real.
   One state object, three option bodies (A, B, C), the states default / created / copied / error / done.
   This file is shared by phone and desktop; where they differ (the bottom sheet, the flyout) is phone.js / desktop.js, which set SH.layout.
   Sample data comes from the recipe tab's own script (recipe/recipe.js, window.RCP); sample names stay out of the stylesheets. */
(function () {
  var X = window.RCP, esc = X.esc;
  var Q = new URLSearchParams(location.search);
  var R = X.byId("efr");
  var DEFVER = R.vers.filter(function (v) { return v.def; })[0] || R.vers[0];

  /* Icons not in the recipe tab's set, drawn the same way (24 grid, 1.8 stroke). */
  var IC2 = {
    share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7h14v-7"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    pin: '<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>'
  };
  var ic = function (n, c) { return IC2[n] ? '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + IC2[n] + "</svg>" : X.ic(n, c); };

  /* Today in the mockup is fixed so every screenshot reads the same: Tuesday 13 October 2026, 9:41 am. */
  var NOW = new Date(2026, 9, 13, 9, 41), DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var EXP = [["24h", "24 hours", 1], ["7d", "7 days", 7], ["30d", "30 days", 30]];
  var dlab = function (d) { return DAY[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; };
  var plus = function (n) { var d = new Date(NOW); d.setDate(d.getDate() + n); return d; };
  var endLabel = function () {
    if (S.exp === "24h") return "Ends tomorrow, 9:41 am";
    if (S.exp === "custom") return "Ends " + dlab(new Date(S.date + "T12:00:00"));
    return "Ends " + dlab(plus(S.exp === "7d" ? 7 : 30));
  };
  var expWords = function () { return S.exp === "custom" ? "until " + dlab(new Date(S.date + "T12:00:00")) : EXP.filter(function (e) { return e[0] === S.exp; })[0][1]; };

  var O = (Q.get("o") || "a").toLowerCase();
  var ST = Q.get("s") || "";                     /* default | created | copied | error | done | "" (live) */
  var FROZEN = !!ST;                              /* a pinned state never runs timers, so a screenshot is steady */
  var S = {
    o: O, open: ST !== "done", phase: "form", err: false, copied: false, copyFail: false, live: false,
    name: R.name, exp: "7d", date: "2026-11-03", pin: true, ver: DEFVER.id, edit: null, toast: "", failNext: Q.get("fail") === "1"
  };
  if (O === "b") S.phase = "making";
  if (ST === "created" || ST === "copied" || ST === "done") S.phase = "created";
  if (ST === "copied") S.copied = true;
  if (ST === "error") { S.err = true; if (O === "b") S.phase = "making"; }
  if (ST === "done") S.toast = "Link ready. Anyone with it can view " + R.name + " until " + dlab(plus(7)) + ".";
  var ver = function () { return R.vers.filter(function (v) { return v.id === S.ver; })[0]; };
  var URL_ = "https://kitchie.example/s/efr-7Hq2xK9mPz";
  var HAS_SHARE = function () { return SH.layout && SH.layout.native; };

  /* ---------- pieces ---------- */
  var seg = function (name, items, cur, label) {
    return '<div class="sh-seg" role="group" aria-label="' + label + '">' + items.map(function (e) {
      return '<button type="button" data-act="' + name + '" data-v="' + e[0] + '" aria-pressed="' + (cur === e[0]) + '">' + e[1] + "</button>";
    }).join("") + "</div>";
  };
  var nameField = function () {
    return '<div class="sh-f"><label class="sh-lbl" for="sh-name">Link name</label><input id="sh-name" class="field" maxlength="60" autocomplete="off" value="' + esc(S.name) + '">' +
      '<p class="sh-help">For you. It tells your links apart. The people you send it to do not see it.</p></div>';
  };
  var expiry = function (custom) {
    var items = EXP.map(function (e) { return [e[0], e[1]]; });
    if (custom) items.push(["custom", "Pick a date"]);
    return '<div class="sh-f"><span class="sh-lbl" id="sh-el">Link works for</span>' + seg("exp", items, S.exp, "Link works for") +
      (S.exp === "custom" ? '<input type="date" class="field sh-date" id="sh-date" value="' + S.date + '" min="2026-10-14" max="2027-01-11" aria-label="Last day the link works">' : "") +
      '<p class="sh-end">' + ic("clock", "s") + endLabel() + "</p></div>";
  };
  var pinRow = function () {
    return '<div class="sh-row"><span class="sh-ri">' + ic("pin") + '</span><div class="t"><b>' + (S.pin ? "Keep it as it is today" : "Follow my later edits") + "</b><small>" +
      (S.pin ? "Edits you make after this will not show." : "They see the newest " + esc(ver().name) + ", whenever they open it.") + '</small></div>' +
      '<button type="button" class="sw2" role="switch" aria-checked="' + S.pin + '" aria-label="Keep it as it is today" data-act="pin">' + (S.pin ? "On" : "Off") + "</button></div>";
  };
  var seeRow = function () {
    return '<div class="sh-row"><span class="sh-ri">' + ic("eye") + '</span><div class="t"><b>Anyone with the link can look</b><small>View only. No sign-in. ' + esc(R.name) + ", " + esc(ver().name) + ".</small></div></div>";
  };
  var errBox = function () {
    return '<div class="sh-err" role="alert"><span class="sh-ri">' + ic("warn") + '</span><div class="t"><b>Link not made</b><small>Nothing was shared. Check your connection.</small></div>' +
      '<button type="button" class="btn sm" data-act="retry">Try again</button></div>';
  };
  var createBtn = function () { return '<button type="button" class="btn sh-go" data-act="create"' + (S.phase === "creating" ? " disabled" : "") + ">" + ic("link") + (S.phase === "creating" ? "Making the link" : "Create link") + "</button>"; };

  var okRow = function () {
    return '<div class="sh-ok"><span class="sh-okic">' + ic("check") + '</span><div class="t"><b>Link ready</b><small class="trunc">' + esc(S.name) + " · " + endLabel().replace("Ends", "ends") + "</small></div></div>";
  };
  var linkBox = function () {
    return '<input class="field sh-url" readonly value="' + URL_ + '" aria-label="The link" onfocus="this.select()">';
  };
  var acts = function () {
    return '<div class="sh-acts"><button type="button" class="btn" id="sh-copy" data-act="copy">' + (S.copied ? ic("check") + "Copied" : ic("copy") + "Copy link") + "</button>" +
      (HAS_SHARE() ? '<button type="button" class="btn ghost" data-act="share">' + ic("share") + "Share</button>" : "") + "</div>" +
      '<p class="sh-live" role="status" aria-live="polite">' + (S.copied ? "Link copied. Paste it anywhere." : S.copyFail ? "Could not copy. Press and hold the link to copy it." : "") + "</p>";
  };
  var doneBtn = function () { return '<button type="button" class="btn ghost sh-done" data-act="done">Done</button>'; };
  var summary = function () {
    return '<p class="sh-sum">' + ic("eye", "s") + "<span>View only, no sign-in. " + esc(ver().name) + (S.pin ? ", as it is today." : ", always the newest.") + "</span></p>";
  };

  /* ---------- Option A: one screen, three choices ---------- */
  function bodyA() {
    if (S.phase === "created") return okRow() + linkBox() + acts() + summary() + doneBtn();
    return (S.err ? errBox() : "") + nameField() + expiry(false) + seeRow() + pinRow() + createBtn();
  }

  /* ---------- Option B: the link exists the moment the sheet opens; the choices are edits ---------- */
  function bodyB() {
    if (S.phase === "making") {
      if (S.err) return errBox();
      return '<div class="sh-skel" aria-busy="true"><p class="sh-making">' + ic("link") + 'Making your link</p><i class="sk w1"></i><i class="sk w2"></i><i class="sk w3"></i></div>';
    }
    var nm = S.edit === "name"
      ? '<div class="sh-edit"><label class="sh-lbl" for="sh-name">Link name</label><div class="sh-inl"><input id="sh-name" class="field" maxlength="60" autocomplete="off" value="' + esc(S.name) + '"><button type="button" class="btn sm" data-act="save">Save</button></div></div>'
      : '<button type="button" class="sh-rowb" data-act="edit" data-v="name"><span class="sh-ri">' + ic("pen") + '</span><span class="t"><b>' + esc(S.name) + "</b><small>Link name, only you see it</small></span>" + ic("chev", "s") + "</button>";
    var ex = S.edit === "exp"
      ? '<div class="sh-edit">' + seg("exp", EXP.map(function (e) { return [e[0], e[1]]; }), S.exp, "Link works for") + '<p class="sh-end">' + ic("clock", "s") + endLabel() + '</p><button type="button" class="btn ghost sm" data-act="edit" data-v="">Close</button></div>'
      : '<button type="button" class="sh-rowb" data-act="edit" data-v="exp"><span class="sh-ri">' + ic("clock") + '</span><span class="t"><b>' + endLabel() + "</b><small>Works for " + expWords() + "</small></span>" + ic("chev", "s") + "</button>";
    return okRow() + linkBox() + acts() + '<div class="sh-list">' + nm + ex + seeRow().replace('<div class="sh-row">', '<div class="sh-row sh-ro">').replace("</small>", (S.pin ? " Kept as it is today." : " Follows your edits.") + "</small>") + "</div>" + doneBtn();
  }

  /* ---------- Option C: pick exactly what they will get, with a preview ---------- */
  function bodyC() {
    if (S.phase === "created") return okRow() + linkBox() + acts() + summary() + doneBtn();
    var v = ver();
    var prev = '<div class="sh-prev" aria-label="What they will see"><span class="sh-pe" aria-hidden="true">' + R.e + '</span><div class="t"><b>' + esc(R.name) + "</b><small>" + esc(v.name) + " · " + R.min + ' min</small></div><span class="badge sage">' + ic("eye", "xs") + "View only</span></div>";
    var vers = '<div class="sh-f"><span class="sh-lbl">Which version</span><div class="sh-radios" role="radiogroup" aria-label="Which version">' + R.vers.map(function (x) {
      return '<button type="button" role="radio" class="sh-rad" data-act="ver" data-v="' + x.id + '" aria-checked="' + (S.ver === x.id) + '"><span class="sh-dotr"></span><span class="t"><b>' + esc(x.name) + "</b><small>" + (x.def ? "Your usual" : x.state === "trying" ? "Still a try" : "First version") + "</small></span></button>";
    }).join("") + "</div></div>";
    var mode = '<div class="sh-f"><span class="sh-lbl">If you change it later</span><div class="sh-radios" role="radiogroup" aria-label="If you change it later">' +
      [[true, "They keep today's copy", "Your later edits stay private."], [false, "They get your edits", "They see the newest " + esc(v.name) + "."]].map(function (m) {
        return '<button type="button" role="radio" class="sh-rad" data-act="mode" data-v="' + m[0] + '" aria-checked="' + (S.pin === m[0]) + '"><span class="sh-dotr"></span><span class="t"><b>' + m[1] + "</b><small>" + m[2] + "</small></span></button>";
      }).join("") + "</div></div>";
    return (S.err ? errBox() : "") + prev + vers + mode + expiry(true) + nameField() + createBtn();
  }

  var BODY = { a: bodyA, b: bodyB, c: bodyC };
  var TITLE = { form: "Share this recipe", making: "Share this recipe", creating: "Share this recipe", created: "Share this recipe" };

  var SH = window.SH = {
    S: S, R: R, ic: ic, esc: esc, FROZEN: FROZEN, URL: URL_,
    title: function () { return S.phase === "created" ? "Your link" : "Share " + R.name; },
    sub: function () { return ""; },
    body: function () { return (BODY[S.o] || bodyA)(); },
    toast: function () { return S.toast ? '<div class="toast sh-toast" role="status"><span>' + esc(S.toast) + '</span><button type="button" data-act="undo-toast">OK</button></div>' : ""; }
  };

  /* ---------- behaviour ---------- */
  var timers = [];
  var later = function (f, ms) { if (!FROZEN) timers.push(setTimeout(f, ms)); };
  var draw = function (focus) { SH.layout && SH.layout.draw(); if (focus && S.live) { var el = document.querySelector(focus); if (el) el.focus(); } };
  SH.draw = draw;

  var make = function () {
    var fail = S.failNext; S.failNext = false;
    S.err = false; S.phase = S.o === "b" ? "making" : "creating"; draw();
    later(function () {
      if (fail) { S.err = true; S.phase = S.o === "b" ? "making" : "form"; draw("[data-act=retry]"); return; }
      S.phase = "created"; draw("#sh-copy");
    }, 650);
  };
  SH.autoMake = function () { if (S.o === "b" && !FROZEN && S.phase === "making") make(); };

  var copy = function () {
    var done = function (ok) { S.copied = ok; S.copyFail = !ok; draw("#sh-copy"); later(function () { S.copied = false; S.copyFail = false; draw(); }, 2600); };
    try { navigator.clipboard.writeText(URL_).then(function () { done(true); }, function () { done(true); }); } catch (e) { done(true); }
  };

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]"); if (!a && e.target.closest("[data-close]")) a = { dataset: { act: "close" } };
    if (!a) return;
    S.live = true;
    var act = a.dataset.act, v = a.dataset.v;
    if (act === "open") { S.open = true; S.toast = ""; S.phase = S.o === "b" ? "making" : "form"; S.err = false; S.copied = false; draw("#sh-name"); if (S.o === "b") make(); }
    else if (act === "close" || act === "done") {
      S.open = false; S.toast = act === "done" ? "Link ready. Anyone with it can view " + R.name + " until " + (S.exp === "24h" ? "tomorrow" : S.exp === "custom" ? dlab(new Date(S.date + "T12:00:00")) : dlab(plus(S.exp === "7d" ? 7 : 30))) + "." : "";
      draw("[data-act=open]"); if (S.toast) later(function () { S.toast = ""; draw(); }, 4000);
    }
    else if (act === "undo-toast") { S.toast = ""; draw(); }
    else if (act === "exp") { S.exp = v; if (v === "custom") S.edit = S.edit; draw(); }
    else if (act === "pin") { S.pin = !S.pin; draw("[data-act=pin]"); }
    else if (act === "mode") { S.pin = v === "true"; draw("[data-act=mode][aria-checked=true]"); }
    else if (act === "ver") { S.ver = v; draw("[data-act=ver][aria-checked=true]"); }
    else if (act === "create" || act === "retry") make();
    else if (act === "copy") copy();
    else if (act === "share") { try { navigator.share({ title: R.name, text: R.name + " on Kitchie", url: URL_ }).catch(function () {}); } catch (x) { S.toast = "The phone's share sheet opens here."; draw(); later(function () { S.toast = ""; draw(); }, 2500); } }
    else if (act === "edit") { S.edit = v || null; draw(v === "name" ? "#sh-name" : null); }
    else if (act === "save") { S.edit = null; draw("[data-act=edit][data-v=name]"); }
  });
  document.addEventListener("input", function (e) {
    if (e.target.id === "sh-name") S.name = e.target.value;
    else if (e.target.id === "sh-date") { S.date = e.target.value || S.date; var el = document.querySelector(".sh-end"); if (el) el.innerHTML = ic("clock", "s") + endLabel(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && S.open) { S.open = false; S.live = true; draw("[data-act=open]"); }
    else if (e.key === "Enter" && e.target.id === "sh-name" && S.o === "b") { S.edit = null; draw(); }
  });
})();
