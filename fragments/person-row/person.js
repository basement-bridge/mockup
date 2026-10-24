/* Person row on the phone Menu: mockup behaviour. Draws the same markup the build draws (class names, data attributes) around stub rows, with sample data.
   Name: tap to edit in place (name field only; Enter or leaving saves, Escape cancels, an error shows under the name). Role: a rotary that snaps to one role and applies when it settles.
   Assistants: connected ones under the row (brand mark, name, linked symbol, star, unlink with a confirm in place), one "add" control for the rest.
   Sample data only here; the build reads the real roles (member-role.ts ROLE_PRESETS), the real assistants (Platform) and the real person. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ic = function (d, s, w) { return '<svg width="' + (s || 22) + '" height="' + (s || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var D = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    unlink: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/><path d="M4 4l16 16"/>',
    add: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    aa: '<path d="M4 18l5-12 5 12M6 14h6M15 18l3-7 3 7M16 16h4"/>',
    pal: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="15.5" cy="10" r="1"/>',
    back: '<path d="M15 6l-6 6 6 6"/>'
  };
  /* the six roles Kitchie has today (server/src/member-role.ts ROLE_PRESETS) with their icons (role-icons.ts) */
  var ROLES = [
    ["Head Chef", '<path d="M7 14a4 4 0 0 1-1-7.7 4.5 4.5 0 0 1 8.6-1.3 4 4 0 0 1 3.4 5.5A4 4 0 0 1 17 14v5H7z"/><path d="M7 17h10"/>'],
    ["Supply Runner", '<path d="M4 9h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z"/><path d="M8 9l3-5M16 9l-3-5"/>'],
    ["Full Stack Cook", '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>'],
    ["Knife Hand", '<path d="M4 20L16 8c2-2 4-3 4-3s-1 3-3 5L9 18z"/><path d="M4 20l3-3"/>'],
    ["Pantry Marshal", '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9.5 10.5h5V16h-5zM10 8.5h4"/>'],
    ["Sink General", '<path d="M12 3c3.5 4.5 6 7.2 6 10.2a6 6 0 0 1-12 0C6 10.2 8.5 7.5 12 3z"/><path d="M9.5 14a2.5 2.5 0 0 0 2 2.3"/>']
  ];
  var SPARK = '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>';
  /* Brand marks. NOT the official logos: their usage rules could not be checked, so each assistant gets a clean monogram in its brand tint (a swap point: the build draws these from one table). */
  var MARK = { claude: ["C", ""], chatgpt: ["GPT", "sm"], gemini: ["G", ""] };
  var NAMES = { claude: "Claude", chatgpt: "ChatGPT", gemini: "Gemini" };
  var S = { o: "A", name: "Alex", hh: "Fernwood", role: 1, ai: "two", ts: 0, nameErr: "", ask: null, adding: false, saveFail: false, picture: "" };
  var AI = { none: [], one: ["claude"], two: ["claude", "chatgpt"], all: ["claude", "chatgpt", "gemini"] };
  var dflt = "claude";

  function hue(n) { var h = 0; Array.from(n).forEach(function (c) { h = (h * 31 + c.codePointAt(0)) % 360; }); return h; }
  function initial(n) { return Array.from(n.trim())[0] ? Array.from(n.trim())[0].toUpperCase() : "?"; }

  function personHtml() {
    var roleIcon = S.role !== null && ROLES[S.role] ? ROLES[S.role][1] : SPARK;
    var items = ROLES.map(function (r, i) { return '<button type="button" class="role" role="radio" aria-checked="' + (S.role === i) + '" tabindex="' + (S.role === i ? 0 : -1) + '" data-role="' + i + '">' + ic(r[1], 26, 1.7) + "<span>" + esc(r[0]) + "</span></button>"; });
    if (S.role === null) items.unshift('<button type="button" class="role" role="radio" aria-checked="true" tabindex="0" data-role="none">' + ic(SPARK, 26, 1.7) + "<span>Pick a role</span></button>");
    var dots = items.map(function (_, i) { return "<i></i>"; }).join("");
    return '<div class="pcard" data-person data-setting="me" data-len="' + (Array.from(S.name).length > 22 ? "l" : Array.from(S.name).length > 12 ? "m" : "s") + '" style="--ph:' + hue(S.name) + '">' +
      '<div class="pwho"><a class="pav" href="#me" aria-label="Your profile"><span class="pmic" aria-hidden="true">' + ic(roleIcon, 54, 1.5) + '</span><span class="pmi">' + esc(S.picture || initial(S.name)) + "</span></a>" +
      '<div class="pid"><form class="pname" data-name-form onsubmit="return false"><button type="button" class="pn-b" data-edit aria-label="Your name: ' + esc(S.name) + '. Tap to change"><b class="pn">' + esc(S.name) + "</b></button>" +
      '<input class="pn-in" name="name" maxlength="40" autocomplete="off" aria-label="Your name" value="' + esc(S.name) + '" hidden><span class="pe" role="alert" hidden></span></form>' +
      '<p class="phh">' + ic(D.home, 16, 2) + "<span>" + esc(S.hh) + "</span></p></div></div>" +
      '<div class="roles" role="radiogroup" aria-label="Kitchen role" data-setting="role" data-roles>' + items.join("") + "</div>" +
      '<div class="rdots" aria-hidden="true">' + dots + '</div><span class="rsaved" aria-hidden="true">' + ic(D.check, 18, 2.4) + "</span></div>";
  }

  function logo(id) { var m = MARK[id] || [initial(id), ""]; return '<span class="logo ' + (MARK[id] ? id : "other") + '" data-s="' + m[1] + '" aria-hidden="true">' + esc(m[0]) + "</span>"; }
  function assistHtml() {
    var on = AI[S.ai], off = Object.keys(NAMES).filter(function (k) { return on.indexOf(k) < 0; }), many = on.length > 1;
    if (on.indexOf(dflt) < 0) dflt = on[0];
    var rows = on.map(function (id) {
      if (S.ask === id) return '<li class="ar ask" data-assistant="' + id + '"><span class="q">Disconnect ' + NAMES[id] + "?</span><span class=\"acts\"><button type=\"button\" class=\"go\" data-disc=\"" + id + '">Disconnect</button><button type="button" data-keep>Keep</button></span></li>';
      return '<li class="ar on" data-assistant="' + id + '" data-setting="' + id + ' disconnect' + (many ? " defassist" : "") + '">' + logo(id) + '<span class="nm">' + NAMES[id] + "</span>" +
        (many ? '<button type="button" class="star" aria-pressed="' + (dflt === id) + '" aria-label="Use ' + NAMES[id] + ' by default" data-star="' + id + '">' + ic(D.star, 22) + "</button>" : "") +
        '<span class="lk" role="img" aria-label="Connected">' + ic(D.link, 22, 2) + '</span><button type="button" class="unl" aria-label="Disconnect ' + NAMES[id] + '" data-ask="' + id + '">' + ic(D.unlink, 20, 1.8) + "</button></li>";
    }).join("");
    var add = off.length ? '<button type="button" class="addai" aria-expanded="' + S.adding + '" data-add>' + ic(D.add, 22, 1.8) + "<span>Add an assistant</span></button>" : "";
    var more = S.adding ? '<ul class="more">' + off.map(function (id) { return '<li class="ar off" data-assistant="' + id + '" data-setting="' + id + '">' + logo(id) + '<span class="nm">' + NAMES[id] + '</span><a class="cn" href="#connect-' + id + '" aria-label="Connect ' + NAMES[id] + '">' + ic(D.add, 22, 1.8) + "</a></li>"; }).join("") + "</ul>" : "";
    return '<section class="ai" data-assistants data-setting="assistants" aria-label="Assistants">' + (rows ? "<ul>" + rows + "</ul>" : "") + add + more + "</section>";
  }

  function stub(label, mu) { return '<a href="#">' + label + (mu ? '<span class="mu">' + mu + "</span>" : "") + "</a>"; }
  function draw() {
    var h = $(".host"); if (!h) return;
    h.innerHTML = '<div class="phone" data-o="' + S.o + '"><header class="hd"><a class="bk" href="#" aria-label="Back">' + ic(D.back, 22, 2) + '</a><h2>Menu</h2><i></i></header><div class="bd" data-bd>' +
      '<label class="find">' + ic(D.search, 20, 2) + "<span>Search settings</span></label>" +
      '<div class="qk"><div>' + ic(D.aa, 22) + "Text</div><div>" + ic(D.pal, 22) + "Theme</div></div>" +
      '<div class="pr">' + personHtml() + assistHtml() + "</div>" +
      '<div class="rowsx">' + stub("Household", "") + stub("Preferences", "") + "</div>" +
      '<div class="rowsx">' + stub("History", "") + stub("Install", "") + stub("Download my data", "") + "</div>" +
      '<div class="rowsx">' + stub("Sign out", "") + "</div></div></div>";
    wire(h); setRoles();
    document.body.setAttribute("data-ready", "1");
  }
  function redrawKeep() { var bd = $("[data-bd]"), y = bd ? bd.scrollTop : 0; draw(); var b = $("[data-bd]"); if (b) b.scrollTop = y; }

  /* ---- roles rotary ---- */
  var settleT = 0, progUntil = 0;
  function setRoles() {
    var r = $("[data-roles]"); if (!r) return;
    var items = $$(".role", r), i = items.findIndex(function (x) { return x.getAttribute("aria-checked") === "true"; });
    dots(r, i < 0 ? 0 : i);
    if (i > 0) { progUntil = Date.now() + 400; r.scrollLeft = items[i].offsetLeft; }
  }
  function dots(r, i) { $$(".rdots i", r.parentNode).forEach(function (d, k) { d.classList.toggle("on", k === i); }); }
  function nearest(r) { var items = $$(".role", r), w = r.clientWidth || 1, k = Math.round(r.scrollLeft / w); return Math.max(0, Math.min(items.length - 1, k)); }
  function applyRole(r, k) {
    var items = $$(".role", r), el = items[k]; if (!el) return;
    var v = el.getAttribute("data-role"); items.forEach(function (x, n) { x.setAttribute("aria-checked", String(n === k)); x.tabIndex = n === k ? 0 : -1; });
    dots(r, k);
    if (v === "none") return;
    if (S.saveFail) { return flash(false); }
    S.role = +v; flash(true);
    var av = $(".pav .pmic"); if (av) av.innerHTML = ic(ROLES[S.role][1], 54, 1.5);
  }
  function flash(ok) { var f = $(".rsaved"); if (!f) return; f.classList.toggle("on", ok); setTimeout(function () { f.classList.remove("on"); }, 1200); }

  function wire(h) {
    var r = $("[data-roles]", h);
    if (r) {
      r.addEventListener("scroll", function () { clearTimeout(settleT); settleT = setTimeout(function () { if (Date.now() < progUntil) return; var k = nearest(r), cur = $$(".role", r).findIndex(function (x) { return x.getAttribute("aria-checked") === "true"; }); if (k !== cur) applyRole(r, k); }, 120); }, { passive: true });
      ["pointerdown", "touchstart", "wheel"].forEach(function (ev) { r.addEventListener(ev, function () { progUntil = 0; }, { passive: true }); });
      r.addEventListener("keydown", function (e) {
        var items = $$(".role", r), i = items.indexOf(document.activeElement), j = -1; if (i < 0 || e.altKey) return;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") j = Math.min(items.length - 1, i + 1); else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = Math.max(0, i - 1); else if (e.key === "Home") j = 0; else if (e.key === "End") j = items.length - 1;
        if (j < 0) return; e.preventDefault(); progUntil = Date.now() + 500; r.scrollTo({ left: items[j].offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); items[j].focus({ preventScroll: true }); applyRole(r, j);
      });
    }
    var form = $("[data-name-form]", h);
    if (form) {
      var b = $("[data-edit]", form), inp = $(".pn-in", form), err = $(".pe", form), done = false;
      var open = function () { done = false; b.hidden = true; inp.hidden = false; inp.value = S.name; inp.focus(); inp.select(); };
      var close = function () { inp.hidden = true; b.hidden = false; $(".pn", b).textContent = S.name; b.setAttribute("aria-label", "Your name: " + S.name + ". Tap to change"); };
      var save = function () {
        if (done) return; done = true; var v = inp.value.trim();
        if (v === "" || v === S.name) { err.hidden = true; close(); return; }
        if (/!!/.test(v)) { err.textContent = "Try another name"; err.hidden = false; inp.hidden = false; b.hidden = true; inp.setAttribute("aria-invalid", "true"); done = false; inp.focus(); return; }
        S.name = v; err.hidden = true; redrawKeep();
      };
      b.addEventListener("click", open);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); save(); } else if (e.key === "Escape") { e.preventDefault(); done = true; err.hidden = true; close(); b.focus(); } });
      inp.addEventListener("blur", function () { setTimeout(function () { if (!inp.hidden) save(); }, 0); });
    }
    if (h._wired) return; h._wired = true;
    h.addEventListener("click", function (e) {
      var t = e.target.closest("[data-ask],[data-keep],[data-disc],[data-star],[data-add]"); if (!t) return;
      if (t.hasAttribute("data-ask")) { S.ask = t.getAttribute("data-ask"); redrawKeep(); var k = $("[data-keep]"); if (k) k.focus(); }
      else if (t.hasAttribute("data-keep")) { var was = S.ask; S.ask = null; redrawKeep(); var u = $('[data-ask="' + was + '"]'); if (u) u.focus(); }
      else if (t.hasAttribute("data-disc")) { var id = t.getAttribute("data-disc"); AI[S.ai] = AI[S.ai].filter(function (x) { return x !== id; }); S.ask = null; redrawKeep(); }
      else if (t.hasAttribute("data-star")) { dflt = t.getAttribute("data-star"); redrawKeep(); }
      else if (t.hasAttribute("data-add")) { S.adding = !S.adding; redrawKeep(); }
    });
  }

  /* ---- the page: bar, state from the address ---- */
  var q = new URLSearchParams(location.search);
  if (q.get("o") && /^[ABC]$/.test(q.get("o"))) S.o = q.get("o");
  if (q.get("ai") && AI[q.get("ai")]) S.ai = q.get("ai");
  if (q.get("role") === "none") S.role = null; else if (q.get("role") && ROLES[+q.get("role")]) S.role = +q.get("role");
  if (q.get("long") === "1") { S.name = "Bartholomew Featherstonehaugh-Smythe"; S.hh = "The Featherstonehaugh-Smythe family kitchen"; }
  if (q.get("pic")) S.picture = "🦊";
  if (q.get("ask") && AI[S.ai].indexOf(q.get("ask")) >= 0) S.ask = q.get("ask");
  if (q.get("add")) S.adding = true;
  var ts = parseInt(q.get("ts") || "0", 10); if (ts) { S.ts = Math.max(0, Math.min(3, ts)); document.documentElement.style.setProperty("--ts", 1 + S.ts * 0.1); }
  if (q.get("bare")) { document.body.classList.add("bare"); $$("iframe").forEach(function (f) { f.remove(); }); }
  if (q.get("fail")) S.saveFail = true;
  function bind(id, fn) { var el = document.getElementById(id); if (!el) return; el.addEventListener("change", function () { fn(el.value); }); }
  var selO = document.getElementById("st-o"), selAi = document.getElementById("st-ai"), selRole = document.getElementById("st-role"), selNm = document.getElementById("st-name");
  if (selO) selO.value = S.o; if (selAi) selAi.value = S.ai; if (selRole) selRole.value = S.role === null ? "none" : "set"; if (selNm) selNm.value = q.get("long") === "1" ? "long" : "short";
  bind("st-o", function (v) { S.o = v; draw(); });
  bind("st-ai", function (v) { S.ai = v; S.ask = null; S.adding = false; draw(); });
  bind("st-role", function (v) { S.role = v === "none" ? null : 1; draw(); });
  bind("st-name", function (v) { if (v === "long") { S.name = "Bartholomew Featherstonehaugh-Smythe"; S.hh = "The Featherstonehaugh-Smythe family kitchen"; } else { S.name = "Alex"; S.hh = "Fernwood"; } draw(); });
  window.PERSON = { S: S, draw: draw };
  draw();
})();
