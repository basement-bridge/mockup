/* Plan day flyout: four fixes (mockup only, nothing is saved or sent). Sample data only.
   A night is { dn, num, off: null | "usual" | "week", meals: [{ name, who: "all" | "me" | "<person>", notFor: [people] }] } (the plan's own model: a household meal is for everyone minus notFor, a personal meal is for one member).
   view() is the row model: the Plan it flyout's rule with the fixes (a blocked night that has a meal is cooking, a replace is called out). plan() is a pick: one tap, no confirm. hold() is the 3 second hold: held while hovered, restarts on leave. */
(function () {
"use strict";
var Q = new URLSearchParams(location.search);
var HOLD = Math.max(200, +Q.get("hold") || 3000), OUT = 240, UNDONE = 1100;
var ME = "Brown Bogan", NEW = "Mandarin Mango Yogurt Bowl", PEOPLE = ["Brown Bogan", "UAT-AL", "Green Slander"];
var NUM = { Sat: 17, Sun: 18, Mon: 19, Tue: 20, Wed: 21, Thu: 22, Fri: 23 };
var ICO = {
  x: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  swap: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>'
};
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function names(a) { return a.map(function (m) { return m.name; }); }
function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
function join(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
function m(name, who, notFor) { return { name: name, who: who, notFor: notFor || [] }; }
function day(dn, meals, off) { return { dn: dn, num: NUM[dn], off: off || null, meals: meals || [] }; }
function dlabel(d) { return d.dn + " " + d.num + " Oct"; }

/* the row model */
function view(d, who, legacy) {
  var hh = d.meals.filter(function (x) { return x.who === "all"; }), own = d.meals.filter(function (x) { return x.who === "me"; });
  var oth = uniq(d.meals.filter(function (x) { return x.who !== "all" && x.who !== "me"; }).map(function (x) { return x.who; }));
  var pw = who === "all" ? "all" : who === ME ? "me" : who, v = { kind: "plan", lines: [], pill: false, sub: "", cons: "", rp: "", gone: false, muted: false };
  if (pw === "all") v.lines = legacy ? names(hh) : names(hh).concat(names(own).map(function (n) { return n + " (yours)"; }));
  else if (pw === "me") { v.lines = own.length ? names(own).map(function (n) { return n + " (yours)"; }) : names(hh.filter(function (x) { return x.notFor.indexOf(ME) < 0; })).map(function (n) { return n + " (household)"; }); }
  else { var mine = d.meals.filter(function (x) { return x.who === pw; }); v.lines = mine.length ? names(mine) : names(hh.filter(function (x) { return x.notFor.indexOf(pw) < 0; })).map(function (n) { return n + " (household)"; }); }
  /* Fix 1: a usual day off is "Not cooking" only while nothing at all is planned for it. Once anyone cooks, it is just a night with a meal. The legacy path is today's wording, kept to show the bug. */
  var blocked = legacy ? !v.lines.length && !!d.off : !!d.off && !d.meals.length;
  if (!v.lines.length) { v.muted = true; if (blocked) { v.lines = ["Not cooking"]; v.pill = true; v.sub = d.off === "usual" ? "Every week, usual day off" : "This week only"; } else v.lines = ["Open"]; }
  else if (legacy && d.off === "usual" && d.meals.length) v.sub = "Usual day off, cooking this week";
  var O = join(oth);
  if (blocked && !(legacy && (hh.length || own.length))) v.cons = d.off === "usual" ? d.dn + " is a usual day off. Planning it cooks this week only." : "Planning it cooks this week only.";
  else if (pw === "all") {
    if (hh.length || own.length) { v.kind = "replace"; v.gone = true; v.rp = hh.length ? "Replaces for everyone" : "Replaces yours"; v.cons = (legacy ? "Replaces " + names(hh.concat(own)).join(" and ") + (oth.length ? " for everyone but " + O + ". " + O + "’s meal stays." : ".") : (hh.length ? "Replaces it for everyone" : "Replaces yours and plans it for everyone") + (oth.length ? " but " + O + ". " + O + "’s meal stays." : ".")); if (legacy) { v.kind = "plan"; v.rp = ""; v.gone = false; } }
    else v.cons = oth.length ? "Plans it for everyone but " + O + ". " + O + "’s meal stays." : "Plans it for everyone.";
  } else if (pw === "me") {
    var hhMe = hh.filter(function (x) { return x.notFor.indexOf(ME) < 0; });
    if (own.length) { v.kind = "replace"; v.gone = true; v.rp = "Replaces yours"; v.cons = "Replaces your meal."; }
    else if (hhMe.length) { v.kind = "replace"; v.gone = true; v.rp = "Replaces for you"; v.cons = "Takes you out of it. Everyone else keeps it."; }
    else v.cons = "Plans it for you.";
  } else v.cons = d.meals.some(function (x) { return x.who === pw; }) ? "Adds a second meal. " + pw + "’s meal stays." : "Plans it for " + pw + ".";
  v.label = d.dn + ", " + v.lines.join(" and ") + ". " + (v.kind === "replace" ? "Warning, replaces an existing meal. " : "") + v.cons;
  return v;
}
function rowHtml(d, who, i, legacy) {
  var v = view(d, who, legacy), cls = "row-d" + (v.kind === "replace" ? " replace" : d.meals.length || v.pill ? "" : "") + (v.muted && !v.pill ? " open" : "") + (v.pill ? " off" : "");
  return '<button type="button" class="' + cls + '" data-i="' + i + '" data-kind="' + v.kind + '" aria-label="' + esc(v.label) + '"><span class="dl">' + esc(d.dn) + '</span><span class="dt">' +
    (v.rp ? '<span class="ln rp">' + ICO.swap + esc(v.rp) + "</span>" : "") +
    v.lines.map(function (l) { return '<span class="ln' + (v.pill ? " pill" : v.gone ? " gone" : v.muted ? " mu" : "") + '">' + esc(l) + "</span>"; }).join("") +
    (v.sub ? '<span class="ln sub">' + esc(v.sub) + "</span>" : "") + '<small class="cons">' + esc(v.cons) + "</small></span></button>";
}

/* a pick: one tap plans, nothing asks first. Returns what the confirmation says. */
function plan(s, i) {
  var d = s.days[i], v = view(d, s.who), pw = s.who === "all" ? "all" : s.who === ME ? "me" : s.who;
  var snap = JSON.stringify(d.meals), replaced = v.kind === "replace", out = [], keep = [], to;
  var hh = d.meals.filter(function (x) { return x.who === "all"; }), own = d.meals.filter(function (x) { return x.who === "me"; });
  var oth = uniq(d.meals.filter(function (x) { return x.who !== "all" && x.who !== "me"; }).map(function (x) { return x.who; }));
  if (pw === "all") { out = names(hh.concat(own)); keep = oth; d.meals = d.meals.filter(function (x) { return x.who !== "all" && x.who !== "me"; }); d.meals.push(m(NEW, "all", oth)); to = PEOPLE.filter(function (p) { return oth.indexOf(p) < 0; }); }
  else if (pw === "me") { out = own.length ? names(own) : names(hh); hh.forEach(function (x) { if (x.notFor.indexOf(ME) < 0) x.notFor.push(ME); }); d.meals = d.meals.filter(function (x) { return x.who !== "me"; }); d.meals.push(m(NEW, "me")); to = [ME]; }
  else { d.meals.push(m(NEW, pw)); to = [pw]; }
  var who = to.length === PEOPLE.length ? "everyone" : join(to.filter(function (p) { return p !== ME; }).concat(to.indexOf(ME) > -1 ? ["you"] : []));
  var x = (replaced ? join(out) + " is out" + (pw === "me" && !own.length ? " for you" : "") + ". " : "") + "For " + who + "." + (keep.length ? " " + join(keep) + (keep.length > 1 ? " keep their meals." : " keeps their meal.") : "");
  return { snap: snap, i: i, verb: replaced ? "Replaced" : "Planned", name: NEW, label: dlabel(d), note: x };
}
function confHtml(c) {
  return '<div class="pk-pt"><div><h2>Plan ' + esc(NEW) + '</h2></div><button type="button" class="x" data-close aria-label="Close">' + ICO.x + "</button></div>" +
    '<div class="pk-conf" role="status" aria-live="polite"><span class="pk-conf-tick" aria-hidden="true">&#10003;</span><div><b class="pk-conf-v">' + c.verb + '</b><span class="pk-conf-n">' + esc(c.name) + '</span><span class="pk-conf-d">' + esc(c.label) + '</span><span class="pk-conf-x">' + esc(c.note) +
    '</span><button type="button" class="pk-conf-undo btn ghost" data-undo aria-label="Undo: ' + c.verb.toLowerCase() + " " + esc(c.name) + '">Undo</button></div></div>';
}

/* the hold: HOLD ms, then the flyout slides out. While a mouse is on the flyout it holds for as long as the mouse stays (hover means they are reading); when the pointer leaves, the full HOLD starts again.
   Touch has no hover, so the count simply runs from display (a finger resting on the flyout does not hold it). Keyboard focus on Undo holds the same way and restarts on blur. Esc ends it at once. No countdown is drawn. */
function hold(fr, done) {
  var h = { st: "run", t: null, over: false, foc: false, live: true };
  function show() { fr.dataset.hold = h.st; }
  function off() { fr.removeEventListener("pointerenter", pe); fr.removeEventListener("pointerleave", pl); fr.removeEventListener("focusin", fi); fr.removeEventListener("focusout", fo); fr.removeEventListener("keydown", kd); }
  function end() { if (!h.live) return; h.live = false; clearTimeout(h.t); off(); fr.dataset.hold = "done"; done(); }
  function go() { h.st = "out"; show(); fr.classList.add("pk-out"); h.t = setTimeout(function () { fr.classList.remove("pk-out"); end(); }, OUT); }
  function arm() { clearTimeout(h.t); h.st = "run"; h.t = setTimeout(go, HOLD); show(); }
  function sync() { if (!h.live || h.st === "out") return; if (h.over || h.foc) { clearTimeout(h.t); h.st = "held"; show(); } else if (h.st === "held") arm(); }
  function pe(e) { if (e.pointerType === "touch") return; h.over = true; sync(); }
  function pl(e) { if (e.pointerType === "touch") return; h.over = false; sync(); }
  function fi(e) { if (e.target.closest && e.target.closest("[data-undo]")) { h.foc = true; sync(); } }
  function fo() { h.foc = false; sync(); }
  function kd(e) { if (e.key === "Escape") { e.preventDefault(); clearTimeout(h.t); fr.classList.remove("pk-out"); end(); } }
  fr.addEventListener("pointerenter", pe); fr.addEventListener("pointerleave", pl); fr.addEventListener("focusin", fi); fr.addEventListener("focusout", fo); fr.addEventListener("keydown", kd);
  h.cancel = function () { clearTimeout(h.t); fr.classList.remove("pk-out"); end(); };
  h.stop = function () { h.live = false; clearTimeout(h.t); off(); };
  /* a mouse already resting on the flyout when the confirmation appears (the pick itself was a click) counts as hovering */
  h.over = !!(window.matchMedia && matchMedia("(hover:hover)").matches && fr.matches(":hover")); if (h.over) { h.st = "held"; show(); } else arm();
  return h;
}

/* a frame: one flyout, drawn from its config (cfg.rows is [{ d, cap, legacy }]) */
var frames = {};
function head(who, interactive) {
  return '<div class="pk-pt"><div><h2>Plan ' + esc(NEW) + '</h2><p class="pk-sub">Pick a night. It is planned as soon as you pick.</p></div><button type="button" class="pk-holdb" aria-pressed="true" aria-label="Hold ingredients for this recipe">' + ICO.lock + "Held</button>" +
    '<button type="button" class="x" data-close aria-label="Close">' + ICO.x + "</button></div>" +
    '<span class="lbl">Who it is for</span><div class="fors" role="group" aria-label="Who it is for">' + [["all", "Everyone"]].concat(PEOPLE.map(function (p) { return [p, p]; })).map(function (w) { return '<button type="button" data-who="' + esc(w[0]) + '" aria-pressed="' + (who === w[0]) + '"' + (interactive ? "" : " tabindex=\"-1\"") + ">" + esc(w[1]) + "</button>"; }).join("") + "</div>";
}
function draw(fr) {
  var s = fr.s, body;
  if (s.view === "conf") body = confHtml(s.conf);
  else if (s.view === "undone") body = '<div class="pk-pt"><div><h2>Plan ' + esc(NEW) + '</h2></div><button type="button" class="x" data-close aria-label="Close">' + ICO.x + '</button></div><div class="pk-conf" role="status" aria-live="polite"><span class="pk-conf-tick" aria-hidden="true">&#10003;</span><div><b class="pk-conf-v">Undone</b><span class="pk-conf-d">Back as it was</span></div></div>';
  else if (s.view === "gone") body = '<div class="fr-gone"><span>The flyout slid out. In the app it is gone and you are back on the Plan.</span><button type="button" class="btn ghost" data-reopen>Reopen the flyout</button></div>';
  else {
    body = head(s.who, !s.cfg.fixed) + '<div class="rows" role="group" aria-label="Day">' + s.cfg.rows.map(function (r, i) { return (r.cap ? '<span class="cap">' + esc(r.cap) + "</span>" : "") + rowHtml(s.days[i], s.who, i, r.legacy); }).join("") + "</div>" +
      (s.cfg.dev === "desk" ? '<p class="phint"><span class="kbd">↑</span><span class="kbd">↓</span> move <span class="kbd">Enter</span> plan <span class="kbd">→</span> everyone’s plans <span class="kbd">Esc</span> close</p>' : "");
  }
  fr.innerHTML = body;
}
function reset(fr) {
  var c = fr.s && fr.s.cfg || fr.cfg; if (fr.s && fr.s.h) fr.s.h.stop();
  fr.classList.remove("pk-out"); delete fr.dataset.hold;
  fr.s = { cfg: c, who: c.who, view: "pick", days: c.rows.map(function (r) { return JSON.parse(JSON.stringify(r.d)); }), conf: null, h: null };
  if (c.view === "conf") { fr.s.conf = plan(fr.s, c.pick || 0); fr.s.view = "conf"; }
  draw(fr);
}
function choose(fr, i) {
  var s = fr.s; if (s.view !== "pick") return;
  s.conf = plan(s, i); s.view = "conf"; draw(fr); var cb = fr.querySelector("[data-close]"); if (cb) cb.focus({ preventScroll: true });
  if (!s.cfg.fixed) s.h = hold(fr, function () { s.h = null; s.view = "gone"; draw(fr); });
}
function undo(fr) {
  var s = fr.s; if (s.view !== "conf") return;
  if (s.h) s.h.stop(); s.h = null; s.days[s.conf.i].meals = JSON.parse(s.conf.snap); s.view = "undone"; draw(fr); fr.dataset.hold = "undone";
  if (!s.cfg.fixed) setTimeout(function () { if (fr.s === s && s.view === "undone") { s.view = "pick"; delete fr.dataset.hold; draw(fr); } }, UNDONE);
}
function click(fr, e) {
  var t = e.target.closest("button"), s = fr.s; if (!t) return;
  if (t.hasAttribute("data-undo")) { undo(fr); return; }
  if (t.hasAttribute("data-reopen")) { s.view = "pick"; draw(fr); return; }
  if (t.hasAttribute("data-close")) { if (s.h) s.h.cancel(); else if (s.view !== "pick") { s.view = "gone"; draw(fr); } else { s.view = "gone"; draw(fr); } return; }
  if (s.cfg.fixed) return;
  if (t.dataset.who !== undefined && s.view === "pick") { s.who = t.dataset.who; draw(fr); var b = fr.querySelector('[data-who="' + (window.CSS && CSS.escape ? CSS.escape(t.dataset.who) : t.dataset.who) + '"]'); if (b) b.focus({ preventScroll: true }); return; }
  if (t.classList.contains("row-d")) choose(fr, +t.dataset.i);
}
function build(host) {
  var cfg = host.__cfg; host.classList.add(cfg.dev); var fr = document.createElement("div");
  fr.className = "fr pk " + cfg.dev; fr.id = host.dataset.frame; fr.setAttribute("role", "group"); fr.setAttribute("aria-label", cfg.title); fr.cfg = cfg;
  var lb = document.createElement("figcaption"); lb.className = "fr-lbl"; lb.textContent = cfg.title;
  var ctl = document.createElement("div"); ctl.className = "fr-ctl"; ctl.innerHTML = '<button type="button" data-reset>Reset this frame</button><span>' + esc(cfg.hint || "Mockup control") + "</span>";
  host.appendChild(lb); host.appendChild(fr); host.appendChild(ctl);
  fr.addEventListener("click", function (e) { click(fr, e); });
  ctl.querySelector("[data-reset]").addEventListener("click", function () { reset(fr); });
  frames[fr.id] = fr; reset(fr);
}

/* the sample nights (today is Sat 17 Oct 2026). Brown Bogan is you. */
var GS = "Green Slander", UA = "UAT-AL";
var DEF = {
  "s1-phone": { dev: "phone", who: "all", fixed: true, title: "Phone: Everyone", rows: [
    { d: day("Sun", [m("Ginger-Soy Chicken Stir-Fry with Rice", "me")], "usual"), legacy: true, cap: "Today: shows Not cooking (the bug)" },
    { d: day("Sun", [m("Ginger-Soy Chicken Stir-Fry with Rice", "me")], "usual"), cap: "Fixed: you are cooking, so it says so" },
    { d: day("Sun", [m("Roast chicken and greens", "all")], "usual"), cap: "Fixed: a household meal on a usual day off" },
    { d: day("Sun", [], "usual"), cap: "Nothing planned: still Not cooking" }] },
  "s1-desk": { dev: "desk", who: "all", fixed: true, title: "Desktop flyout: Everyone", rows: [
    { d: day("Sun", [m("Ginger-Soy Chicken Stir-Fry with Rice", "me")], "usual"), legacy: true, cap: "Today: shows Not cooking (the bug)" },
    { d: day("Sun", [m("Ginger-Soy Chicken Stir-Fry with Rice", "me")], "usual"), cap: "Fixed: you are cooking, so it says so" },
    { d: day("Sun", [m("Roast chicken and greens", "all")], "usual"), cap: "Fixed: a household meal on a usual day off" },
    { d: day("Sun", [], "usual"), cap: "Nothing planned: still Not cooking" }] },
  "s2-phone-me": { dev: "phone", who: ME, title: "Phone: for yourself (tap a row)", rows: [
    { d: day("Tue", []), cap: "Open: plain, no warning" },
    { d: day("Wed", [m("Japanese golden curry", "me")]), cap: "Your own meal: replace call-out" },
    { d: day("Thu", [m("Salmon traybake", "all")]), cap: "A household meal you are in: replace call-out" }] },
  "s2-phone-all": { dev: "phone", who: "all", title: "Phone: Everyone (tap a row)", rows: [
    { d: day("Tue", []), cap: "Open: plain, no warning" },
    { d: day("Wed", [m("Japanese golden curry", "all")]), cap: "Replaces the household meal: call-out" },
    { d: day("Thu", [m("Salmon traybake", UA)]), cap: "UAT-AL keeps theirs: nothing is lost, no warning" },
    { d: day("Fri", [m("Ginger-Soy Chicken Stir-Fry with Rice", "me"), m("Pasta bake", UA)]), cap: "Replaces yours; UAT-AL keeps theirs" }] },
  "s2-desk-me": { dev: "desk", who: ME, title: "Desktop flyout: for yourself (click a row)", rows: [
    { d: day("Tue", []), cap: "Open: plain, no warning" },
    { d: day("Wed", [m("Japanese golden curry", "me")]), cap: "Your own meal: replace call-out" },
    { d: day("Thu", [m("Salmon traybake", "all")]), cap: "A household meal you are in: replace call-out" }] },
  "s2-desk-all": { dev: "desk", who: "all", title: "Desktop flyout: Everyone (click a row)", rows: [
    { d: day("Tue", []), cap: "Open: plain, no warning" },
    { d: day("Wed", [m("Japanese golden curry", "all")]), cap: "Replaces the household meal: call-out" },
    { d: day("Thu", [m("Salmon traybake", UA)]), cap: "UAT-AL keeps theirs: nothing is lost, no warning" },
    { d: day("Fri", [m("Ginger-Soy Chicken Stir-Fry with Rice", "me"), m("Pasta bake", UA)]), cap: "Replaces yours; UAT-AL keeps theirs" }] },
  "s3-phone": { dev: "phone", who: "all", fixed: true, view: "conf", title: "Phone: Everyone, UAT-AL keeps their meal", rows: [{ d: day("Thu", [m("Salmon traybake", UA)]) }], hint: "Shown held; Undo works" },
  "s3-desk": { dev: "desk", who: "all", fixed: true, view: "conf", title: "Desktop flyout: Everyone, UAT-AL keeps their meal", rows: [{ d: day("Thu", [m("Salmon traybake", UA)]) }], hint: "Shown held; Undo works" },
  "s3-phone-b": { dev: "phone", who: "all", fixed: true, view: "conf", title: "Phone: Everyone, a replace, two people keep theirs", rows: [{ d: day("Fri", [m("Japanese golden curry", "all"), m("Pasta bake", UA), m("Fried rice", GS)]) }], hint: "Shown held; Undo works" },
  "s4-timer": { dev: "phone", who: "all", title: "Try it: tap Tue, then rest the mouse on the flyout, then move off", rows: [{ d: day("Tue", []) }, { d: day("Wed", [m("Japanese golden curry", "all")]) }] }
};
function init() {
  [].forEach.call(document.querySelectorAll("[data-frame]"), function (h) { var c = DEF[h.dataset.frame]; if (c) { h.__cfg = c; build(h); } });
}
window.PDFR = { HOLD: HOLD, view: view, frames: frames, join: join };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
