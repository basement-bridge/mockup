/* Plan it on desktop, "Another day" as a month picker (Kitchie issue raised from #757): the parts the flyout shares with F (the seven days). Desktop only, never loaded on a phone. Sample data only,
   nothing is stored or sent. Copied from fragments/plan-day-picker/common.js (option F path only) so this fragment stands on its own while F is being edited elsewhere; the rules are F's.
   Rules kept (Kitchie #757): this week and up to four weeks ahead, past days greyed, a usual day off marked and not locked, a day with a meal gets a second meal, Hold on by default, the Hard avoid guard
   is asked live for the date picked, the desktop Home card replaces your own meal on the picked day. The phone sheet is not touched.
   The flyout registers itself with PK.register({ open, close, key, esc, help, focus, rules, confirm, undone }). */
(function () {
"use strict";
var H = window.HDP, D = H.D, P = window.PKD, esc = H.esc, $ = H.$, Q = new URLSearchParams(location.search);
var PK = window.PK = { S: { who: /^(Sam|Jo)$/.test(new URLSearchParams(location.search).get("who") || "") ? new URLSearchParams(location.search).get("who") : "all", hold: true, sel: null, leave: false, open: false }, esc: esc, $: $, mod: null, Q: Q };
PK.who0 = PK.S.who; /* ?who=Sam|Jo opens the flyout with that person selected (the scenarios on the hub use it) */
var S = PK.S, E0 = Date.UTC(2026, 9, 12);

/* ---------- the calendar ---------- */
/* a day off is per person: only for the person the Who pill selects, none under Everyone */
function offOf(n, i) { var w = S.who; if (w === "all") return null; var o = (P.offs || {})[w]; if (!o) return null; return o.usual === i ? "usual" : o.week && o.week[n] ? "week" : null; }
PK.info = function (n) {
  var d = new Date(E0 + n * 86400000), i = ((n % 7) + 7) % 7, meals = (P.meals[n] || []).slice();
  return { n: n, i: i, dn: P.dn[i], full: P.df[i], num: d.getUTCDate(), mon: P.mo[d.getUTCMonth()], monN: d.getUTCMonth(), monFull: P.mf[d.getUTCMonth()], past: n < P.todayN, today: n === P.todayN,
    off: offOf(n, i), meals: meals, own: meals.filter(function (m) { return m.who === "me"; })[0] || null,
    label: P.dn[i] + " " + d.getUTCDate() + " " + P.mo[d.getUTCMonth()] };
};
/* the month's view of a night: the meals the Who pill selects. Everyone: the household plan and anyone's own. A person: the household plan unless it leaves them out, and their own. */
PK.vis = function (n) {
  var i = PK.info(n), w = S.who;
  i.meals = i.meals.filter(function (m) { if (w === "all") return true; if (m.who === "all") return (m.notFor || []).indexOf(w) < 0; return m.who === w || (m.who === "me" && w === P.me); });
  return i;
};
PK.vdayObj = function (n) { var v = PK.vis(n); return { n: n, dn: v.dn, today: false, off: v.off, meals: v.meals.map(function (m) { return { name: m.name, who: m.who, notFor: [].concat(m.notFor || []) }; }) }; };
PK.R = function () { return H.idea(P.rid); };
/* one night as the row model reads it (rows.js R.view): { n, dn, today, off, meals: [{ name, who, notFor }] } */
PK.dayObj = function (n) { var i = PK.info(n); return { n: n, dn: i.dn, today: i.today, off: i.off, meals: i.meals.map(function (m) { return { name: m.name, who: m.who, notFor: [].concat(m.notFor || []) }; }) }; };
PK.replaces = function (n) { return P.replace && !!PK.info(n).own; };

/* ---------- the Hard avoid guard (SW-74 to SW-82), asked again for each date picked ---------- */
/* stop: a meal for that person alone. warn: a meal for everyone; no warning on a night where that person keeps their own plan (they are left out of the household meal already). */
PK.guardFor = function (n) {
  /* scoped to the recipe being planned and the people the Who pill selects (owner, voice, 17 Oct 2026): no recipe in context, or a recipe that does not touch the Hard avoid, shows nothing at all; a member's standing Hard avoid is never surfaced for its own sake */
  var a = P.avoid, r = PK.R();
  if (!a || !r || !r.lines || S.leave || !r.lines.some(function (l) { return l.n.toLowerCase().indexOf(a.item) > -1; })) return null;
  if (S.who === a.who) return "stop";
  if (S.who === "all") { if (n != null && PK.info(n).meals.some(function (m) { return m.who === a.who; })) return null; return "warn"; }
  return null;
};
var ICO = {
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5v10M12 19v.1"/></svg>',
  warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5v10M12 19v.1"/></svg>',
  hold: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  cal: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg>'
};
PK.ico = ICO;
var A = function () { return P.avoid; };
PK.guardHtml = function () {
  var g = S.sel == null ? null : PK.guardFor(S.sel); if (!g) return "";
  var a = A(), r = PK.R(), inf = PK.info(S.sel);
  if (g === "stop") return '<div class="pk-guard" role="alert" data-guard="stop">' + ICO.stop + "<div><b>Not for " + a.who + "</b><span>" + esc(r.name) + " has " + a.item + " in it, and " + a.who + " has a Hard avoid on " + a.item + ". Pick someone else above, or another meal.</span></div></div>";
  return '<div class="pk-guard" role="alert" data-guard="warn">' + ICO.warn + "<div><b>" + a.who + " has a Hard avoid on " + a.item + "</b><span>" + esc(r.name) + " has " + a.item + " in it and this meal is for everyone.</span>" +
    '<button type="button" class="btn sm" data-leave>Leave ' + a.who + " out of this meal</button><small>Plans " + inf.full + " for " + P.me + " only and marks it not for " + a.who + ".</small></div></div>";
};
PK.whoHtml = function () {
  return '<div class="pk-row"><span class="lbl">Who it is for</span></div><div class="fors" role="group" aria-label="Who it is for">' +
    [["all", "Everyone"]].concat(P.people.map(function (p) { return [p, p]; })).map(function (w) { return '<button type="button" data-who="' + w[0] + '" aria-pressed="' + (S.who === w[0]) + '">' + w[1] + "</button>"; }).join("") + "</div>";
};
PK.holdHtml = function () {
  return '<div class="pk-row"><span><b>Hold what is in</b><small>Keeps it for this meal; nothing else can claim it.</small></span><button type="button" class="mini" data-hold aria-pressed="' + S.hold + '">' + ICO.hold + (S.hold ? "Held" : "Hold") + "</button></div>";
};
PK.kbd = function (c) { return '<kbd class="kbd">' + c + "</kbd>"; };

/* ---------- planning it: writes to the sample calendar, redraws Home's own week, gives an Undo ---------- */
PK.commit = function (n, o) {
  o = o || {}; var r = PK.R(), inf = PK.info(n), rs = PK.mod.rules(n, o);
  var arr0 = (P.meals[n] || []).slice(), prev0 = JSON.stringify(arr0), gone = arr0.filter(rs.remove), keep = arr0.filter(function (m) { return !rs.remove(m); });
  if (rs.carve) keep.forEach(function (m) { if (m.who === "all") m.notFor = [].concat(m.notFor || [], rs.carve).filter(function (x, i, z) { return z.indexOf(x) === i; }); });
  keep.push({ name: r.name, who: rs.who, hold: S.hold, notFor: rs.notFor || [] }); P.meals[n] = keep;
  P.syncHome();
  PK.mod.confirm(gone.length ? "Replaced" : "Planned", r.name, inf.label, inf.off && !gone.length ? inf.dn + ": cooking this week. The usual day off stays." : "");
  var nf = rs.notFor && rs.notFor.length ? ", for everyone but " + rs.notFor.join(" and ") : "";
  H.toast(esc(r.name) + (gone.length ? " replaces " + esc(gone.map(function (m) { return m.name; }).join(" and ")) + " on " : " is planned for ") + inf.label + nf + (rs.stays ? ". " + esc(rs.stays) : "") + (S.hold ? (rs.stays ? " What is in is held" : ", what is in is held") : "") + ".", function () {
    P.meals[n] = JSON.parse(prev0); if (!P.meals[n].length) delete P.meals[n]; P.syncHome();
    if (!S.open) H.set({}); /* the flyout owns #week while it is open; it redraws the lane when it closes */
    if (S.open && PK.mod.undone) PK.mod.undone();
  });
};
/* shared buttons inside the flyout; returns true when it handled the click */
PK.common = function (t, redraw) {
  if (t.dataset.who) { S.who = t.dataset.who; S.leave = false; redraw(); return true; }
  if (t.hasAttribute("data-hold")) { S.hold = !S.hold; redraw(); return true; }
  if (t.hasAttribute("data-leave")) { PK.commit(S.sel, { leave: true }); return true; }
  if (t.hasAttribute("data-close")) { PK.close(); return true; }
  return false;
};

/* ---------- open and close ---------- */
PK.register = function (m) { PK.mod = m; };
PK.open = function (anchor, rid) {
  if (S.open || !PK.mod) return;
  if (rid && H.idea(rid)) P.rid = rid;
  S.who = PK.who0; S.hold = true; S.sel = null; S.leave = false; S.open = true; PK.anchor = anchor || $('#detail [data-act="plan"]');
  PK.mod.open(PK.anchor);
};
PK.refocus = function () { var rf = $('#detail [data-act="plan"]') || PK.anchor; if (rf && rf.focus) rf.focus({ preventScroll: true }); };
PK.close = function (keepFocus) { if (!S.open) return; S.open = false; PK.mod.close(); if (!keepFocus) PK.refocus(); };
var kbEl = $("#kb");
/* the plan button, or an idea row's quick plan, opens the flyout instead of planning at once; so does P */
document.addEventListener("click", function (e) {
  var b = e.target.closest('[data-act="plan"],[data-act="quickplan"]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  if (S.open) { PK.close(); return; }
  var K = String(H.S.open || ""); PK.open(b, b.dataset.id || (K.indexOf("recipe:") === 0 ? K.slice(7) : P.rid));
}, true);
document.addEventListener("keydown", function (e) {
  if (!kbEl.hidden) return;
  if (S.open) {
    if (e.key === "?") return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (PK.mod.esc) PK.mod.esc(); else PK.close(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (PK.mod.key) PK.mod.key(e);
    e.stopPropagation(); return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  var t = e.target; if (t.closest && t.closest("input,textarea,select,[contenteditable]")) return;
  var K = String(H.S.open || "");
  if ((e.key === "p" || e.key === "P") && K.indexOf("recipe:") === 0) {
    var r = H.idea(K.slice(7)); if (r && !r.planned) { e.preventDefault(); e.stopPropagation(); PK.open($('#detail [data-act="plan"]'), r.id); }
  }
}, true);

/* ---------- the ? list: the keys of the flyout are added to Home's list ---------- */
function kbRole() { if (kbEl.hidden) { kbEl.removeAttribute("role"); kbEl.removeAttribute("aria-modal"); kbEl.removeAttribute("aria-label"); } else { kbEl.setAttribute("role", "dialog"); kbEl.setAttribute("aria-modal", "true"); kbEl.setAttribute("aria-label", "Shortcuts"); } }
kbRole();
new MutationObserver(function () {
  kbRole();
  if (kbEl.hidden) { if (S.open && PK.mod && PK.mod.focus) PK.mod.focus(); return; }
  var c = kbEl.querySelector(".kbc"); if (!c || c.querySelector(".pk-kbs") || !PK.mod) return;
  var rows = PK.mod.help && PK.mod.help(); if (!rows || !rows.length) return;
  c.insertAdjacentHTML("beforeend", rows.map(function (g) {
    return '<div class="sh2 pk-kbs">' + esc(g.title) + "</div>" + g.rows.map(function (r) {
      return '<div class="kbr"><span class="kk">' + r[0].split(/\s{2}or\s{2}|\s{2}/).map(function (x) { return "<kbd>" + esc(x) + "</kbd>"; }).join(" ") + "</span><span>" + r[1] + "</span></div>";
    }).join("");
  }).join(""));
}).observe(kbEl, { attributes: true, attributeFilter: ["hidden"], childList: true });

/* ---------- the mockup controls, in the rail: scaffolding, not part of the app. Each choice is a link that reloads the page with the flyout open ---------- */
(function () {
  var u = new URL(location.href), wrap = document.createElement("div"); wrap.className = "pk-sw";
  function link(k, v, label, cur) { var p = new URLSearchParams(u.search); if (v === null) p.delete(k); else p.set(k, v); p.set("start", PK.startView || "month"); return '<a href="?' + p.toString() + '"' + (cur ? ' aria-current="true"' : "") + ">" + label + "</a>"; }
  function cur(k, d) { return Q.get(k) || d; }
  var groups = [
    ["Week", "scenario", [["empty", "Empty"], ["typical", "Typical"], ["full", "Full"]], cur("scenario", "typical")],
    ["Today", "today", [["2026-10-12", "Mon 12"], ["2026-10-14", "Wed 14"], ["2026-10-17", "Sat 17"], ["2026-10-18", "Sun 18"]], cur("today", "2026-10-17")],
    ["Who it is for", "who", [[null, "Everyone"], ["Sam", "Sam"], ["Jo", "Jo"]], cur("who", null)],
    ["Hard avoid (Jo, mango)", "avoid", [[null, "Off"], ["mango", "On"]], cur("avoid", null)],
    ["Recipe being planned", "recipe", [[null, "With mango"], ["clear", "No mango"]], cur("recipe", null)],
    ["Wide layout", "wide", [[null, "A: roomy (not chosen)"], ["b", "B: side card (chosen)"], ["c", "C: open first (not chosen)"], ["off", "Compact"]], cur("wide", null)],
    ["Date number", "num", [[null, "A: corner"], ["b", "B: plain cell"], ["c", "C: light numeral"]], cur("num", null)],
    ["Halo", "halo", [[null, "Timed (3 s)"], ["hold", "Held on"], ["off", "Faded"]], cur("halo", null)],
    ["Another day", "another", [[null, "A row"], ["header", "A header icon"]], cur("another", null)],
    ["Flyout width", "w", [[null, "Normal: two wide if room"], ["narrow", "Narrow: one flyout, compact"]], cur("w", null)]
  ];
  var h = '<button type="button" class="pk-swb" aria-expanded="false" aria-controls="pk-swp">Mockup controls</button><div class="pk-swp" id="pk-swp" hidden role="group" aria-label="Mockup controls">';
  groups.forEach(function (g) { h += '<div class="pk-swg"><span>' + g[0] + "</span>" + g[2].map(function (o) { return link(g[1], o[0], o[1], (o[0] === null ? !Q.get(g[1]) : g[3] === o[0])); }).join("") + "</div>"; });
  h += '<p>Sample data only. A choice reloads this page with the flyout open on the month. Day off shows only for the person the Who pill selects.</p></div>';
  wrap.innerHTML = h; var railEl = $(".rail"); if (!railEl) return; railEl.appendChild(wrap);
  var b = wrap.querySelector(".pk-swb"), pn = wrap.querySelector(".pk-swp");
  b.addEventListener("click", function () { var o = pn.hidden; pn.hidden = !o; b.setAttribute("aria-expanded", String(o)); });
})();
})();
