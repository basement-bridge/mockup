/* Plan it, choosing the day on desktop: the parts every option shares. Desktop only, never loaded on a phone. Sample data only, nothing is stored or sent.
   Rules kept from the issue (Kitchie #757): this week and up to four weeks ahead, past days greyed, usual day off marked, a day with a meal gets a second meal,
   Hold on by default, the Hard avoid guard is asked live, the desktop Home card replaces your own meal on the picked day. The phone sheet is not touched.
   An option file registers itself with PK.register({ open, close, key, help, focus }). */
(function () {
"use strict";
var H = window.HDP, D = H.D, P = window.PKD, esc = H.esc, $ = H.$, Q = new URLSearchParams(location.search);
var PK = window.PK = { opt: window.PK_OPT, S: { who: "all", hold: true, wk: 0, sel: null, more: false, leave: false, open: false }, esc: esc, $: $, mod: null };
var S = PK.S;

/* ---------- the calendar ---------- */
PK.info = function (n) {
  var d = new Date(2026, 9, 12 + n), i = n % 7, meals = (P.meals[n] || []).slice();
  return { n: n, i: i, dn: P.dn[i], num: d.getDate(), mon: P.mo[d.getMonth()], past: n < P.todayN, off: i === 3, meals: meals,
    own: meals.filter(function (m) { return m.who === "me"; })[0] || null, label: P.dn[i] + " " + d.getDate() + " " + P.mo[d.getMonth()] };
};
PK.first = function (s) { return esc(s.split(" ")[0]); };
/* what a day button says under its date: the first word of the meal, Off, or Free (as the sheet does today) */
PK.sub = function (d) { return d.meals.length ? PK.first(d.meals[0].name) : d.off ? "Off" : "Free"; };
/* today is preselected unless it is past, a usual day off or already has a meal; then the next day that is free (never a day that would take a second meal by accident) */
PK.firstFree = function (max) {
  for (var n = P.todayN; n < max; n++) { var d = PK.info(n); if (!d.past && !d.off && !d.meals.length) return n; }
  return null;
};
PK.R = function () { return H.idea(P.rid); };
PK.replaces = function (n) { return P.replace && !PK.noReplace && !!PK.info(n).own; };
PK.weekLabel = function (wk) { return wk === 0 ? "This week" : wk === 1 ? "Next week" : "In " + wk + " weeks"; };

/* ---------- the Hard avoid guard (SW-74 to SW-82), asked again each time the day or the person changes ---------- */
PK.guard = function () {
  var a = P.avoid, r = PK.R();
  if (!a || S.leave || !r.lines.some(function (l) { return l.n.toLowerCase().indexOf(a.item) > -1; })) return null;
  if (S.who === a.who) return "stop";
  return S.who === "all" ? "warn" : null;
};
var ICO = {
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>',
  warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.2"/></svg>',
  hold: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  chev: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
PK.ico = ICO;
var A = function () { return P.avoid; };
PK.guardHtml = function () {
  var g = PK.guard(); if (!g || S.sel == null) return "";
  var a = A(), r = PK.R(), inf = PK.info(S.sel);
  if (g === "stop") return '<div class="pk-guard" role="alert" data-guard="stop">' + ICO.stop + "<div><b>Not for " + a.who + "</b><span>" + esc(r.name) + " has " + a.item + " in it, and " + a.who + " has a Hard avoid on " + a.item + ". Pick someone else above, or another meal.</span></div></div>";
  return '<div class="pk-guard" role="alert" data-guard="warn">' + ICO.warn + "<div><b>" + a.who + " has a Hard avoid on " + a.item + "</b><span>" + esc(r.name) + " has " + a.item + " in it and this meal is for everyone.</span>" +
    '<button type="button" class="btn sm" data-leave>Leave ' + a.who + " out of this meal</button><small>Plans " + inf.dn + " for " + P.me + " only and marks it not for " + a.who + ".</small></div></div>";
};
/* the line under the days about the chosen day: a second meal, a replace, or a usual day off (wording from the sheet today) */
PK.noteHtml = function (wide) {
  if (S.sel == null) return "";
  var inf = PK.info(S.sel), out = "";
  if (wide || S.sel < 7) {
    if (inf.meals.length && !PK.replaces(S.sel)) out += '<p class="pk-note">' + esc(inf.meals[0].name) + " is already on " + inf.dn + ". This adds a second meal; it does not replace it.</p>";
    if (PK.replaces(S.sel)) out += '<p class="pk-note">' + esc(inf.own.name) + " is your meal on " + inf.dn + ". This replaces it" + (inf.meals.length > 1 ? "; the others stay" : "") + ".</p>";
    if (inf.off) out += '<p class="pk-note">' + inf.dn + " is a usual day off. Planning it cooks this week only.</p>";
  }
  return out;
};
PK.whoHtml = function () {
  return '<div class="pk-row"><span class="lbl">Who it is for</span></div><div class="fors" role="group" aria-label="Who it is for">' +
    [["all", "Everyone"]].concat(P.people.map(function (p) { return [p, p]; })).map(function (w) { return '<button type="button" data-who="' + w[0] + '" aria-pressed="' + (S.who === w[0]) + '">' + w[1] + "</button>"; }).join("") + "</div>";
};
PK.holdHtml = function () {
  return '<div class="pk-row"><span><b>Hold what is in</b><small>Keeps it for this meal; nothing else can claim it.</small></span><button type="button" class="mini" data-hold aria-pressed="' + S.hold + '">' + ICO.hold + (S.hold ? "Held" : "Hold") + "</button></div>";
};
PK.okLabel = function () {
  if (S.sel == null) return "Pick a day";
  var inf = PK.info(S.sel); return PK.replaces(S.sel) ? "Replace " + inf.dn + "’s meal" : "Plan for " + inf.dn;
};
PK.okDisabled = function () { return S.sel == null || !!PK.guard(); };
PK.footHtml = function (hint) {
  return '<div class="pk-foot"><button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn pri" data-ok' + (PK.okDisabled() ? " disabled" : "") + ">" + esc(PK.okLabel()) + "</button></div>" + (hint ? '<p class="phint hint pk-hint">' + hint + "</p>" : "");
};
PK.kbd = function (c) { return '<kbd class="kbd">' + c + "</kbd>"; };

/* ---------- planning it: writes to the sample calendar, redraws Home's own week, gives an Undo ---------- */
PK.commit = function (n, o) {
  o = o || {}; var r = PK.R(), inf = PK.info(n), rep = PK.replaces(n), a = A();
  /* an option that has its own rules for what a pick replaces and who it leaves out (F) says so through mod.rules; A, B, C, D, E and G keep the sheet's rules */
  var rs = PK.mod.rules ? PK.mod.rules(n, o) : null;
  if (rs) {
    var arr0 = (P.meals[n] || []).slice(), prev0 = JSON.stringify(arr0), gone = arr0.filter(rs.remove), keep = arr0.filter(function (m) { return !rs.remove(m); });
    if (rs.carve) keep.forEach(function (m) { if (m.who === "all") m.notFor = [].concat(m.notFor || [], rs.carve).filter(function (x, i, z) { return z.indexOf(x) === i; }); });
    keep.push({ name: r.name, who: rs.who, hold: S.hold, notFor: rs.notFor || [] }); P.meals[n] = keep;
    PK.close(true); P.syncHome(); H.set({}); PK.refocus();
    var nf = rs.notFor && rs.notFor.length ? ", for everyone but " + rs.notFor.join(" and ") : "";
    H.toast(esc(r.name) + (gone.length ? " replaces " + esc(gone.map(function (m) { return m.name; }).join(" and ")) + " on " : " is planned for ") + inf.label + nf + (rs.stays ? ". " + esc(rs.stays) : "") + (S.hold ? (rs.stays ? " What is in is held" : ", what is in is held") : "") + ".", function () {
      P.meals[n] = JSON.parse(prev0); if (!P.meals[n].length) delete P.meals[n]; P.syncHome(); H.set({}); if (S.open && PK.mod.undone) PK.mod.undone();
    });
    return;
  }
  var who = o.leave ? "me" : S.who === "all" ? "all" : S.who === P.me ? "me" : S.who, prev = JSON.stringify(P.meals[n] || []), hold = S.hold;
  var arr = P.meals[n] = P.meals[n] || []; if (rep) arr = P.meals[n] = arr.filter(function (m) { return m.who !== "me"; });
  arr.push({ name: r.name, who: who, hold: hold, notFor: o.leave && a ? a.who : null });
  PK.last = { n: n, rep: rep, leave: !!o.leave };
  var stay = PK.mod.after; /* D stays on the Plan page and shows the meal on its day */
  if (!stay) PK.close(true);
  P.syncHome(); H.set({});
  if (stay) PK.mod.after(n); else PK.refocus();
  H.toast(esc(r.name) + (rep ? " replaces your meal on " : " is planned for ") + inf.label + (o.leave ? ", for " + P.me + " only" : "") + (hold ? ", what is in is held" : "") + ".", function () {
    P.meals[n] = JSON.parse(prev); if (!P.meals[n].length) delete P.meals[n]; P.syncHome(); H.set({}); if (S.open && PK.mod.undone) PK.mod.undone();
  });
};
PK.ok = function () { if (S.sel != null && !PK.okDisabled()) PK.commit(S.sel); };
/* shared buttons inside any option; returns true when it handled the click */
PK.common = function (t, redraw) {
  if (t.dataset.who) { S.who = t.dataset.who; S.leave = false; redraw(); return true; }
  if (t.hasAttribute("data-hold")) { S.hold = !S.hold; redraw(); return true; }
  if (t.hasAttribute("data-leave")) { PK.commit(S.sel, { leave: true }); return true; }
  if (t.hasAttribute("data-close")) { PK.close(); return true; }
  if (t.hasAttribute("data-ok")) { PK.ok(); return true; }
  return false;
};

/* ---------- open and close ---------- */
PK.register = function (m) { PK.mod = m; };
PK.open = function (anchor, rid) {
  if (S.open || !PK.mod) return;
  if (rid && H.idea(rid)) P.rid = rid;
  S.who = "all"; S.hold = true; S.wk = 0; S.sel = null; S.more = false; S.leave = false; S.open = true; PK.anchor = anchor || $('#detail [data-act="plan"]');
  PK.mod.open(PK.anchor);
};
/* where focus goes back to: the Plan button in the pane (G has none there: the card's own Plan button) */
PK.refocus = function () {
  var rf = PK.mod && PK.mod.returnTo ? PK.mod.returnTo() : ($('#detail [data-act="plan"]') || PK.anchor);
  if (rf && rf.focus) rf.focus({ preventScroll: true });
};
PK.close = function (keepFocus) {
  if (!S.open) return; S.open = false; PK.mod.close();
  if (!keepFocus) PK.refocus();
};
var kbEl = $("#kb");
/* the plan button, or an idea row's quick plan, opens the picker instead of planning at once; so does P */
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
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); PK.close(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (PK.mod.key) PK.mod.key(e);
    e.stopPropagation(); return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  var t = e.target; if (t.closest && t.closest("input,textarea,select,[contenteditable]")) return;
  var K = String(H.S.open || "");
  if ((e.key === "p" || e.key === "P") && K.indexOf("recipe:") === 0 && PK.mod && PK.mod.noP) { e.preventDefault(); e.stopPropagation(); return; }
  if ((e.key === "p" || e.key === "P") && K.indexOf("recipe:") === 0) {
    var r = H.idea(K.slice(7)); if (r && !r.planned) { e.preventDefault(); e.stopPropagation(); PK.open($('#detail [data-act="plan"]'), r.id); }
  }
}, true);

/* ---------- Start cooking (owner, 16 Oct 2026): on the planned primary card. VISUAL ONLY: nothing is sent. In Kitchie today the only way in is the MCP tool start_cooking (personal link,
   by user when the person says so); this is the first screen for it. What it would do (docs/adr/cooking-session.md): declare a "Cooking now" session for the household (title, the recipe's ingredients,
   recipe_id), shown as a card on every member's screen, at most two shown (a third is kept but not shown), clears by itself 45 minutes after the last start_cooking for it, ended by the dismiss X or stop_cooking. ---------- */
(function () {
  var live = null;
  function banner() {
    var b = document.querySelector(".cookbn"); if (b) b.remove();
    if (!live) return;
    b = document.createElement("div"); b.className = "cookbn"; b.setAttribute("role", "region"); b.setAttribute("aria-label", "Cooking now");
    b.innerHTML = '<div class="cookbn-c"><span class="cookbn-go"><span class="cookbn-dot" aria-hidden="true"></span><span class="cookbn-t"><b>Cooking now</b><span class="cookbn-n">' + esc(live) + '</span></span></span><button type="button" class="cookbn-x" data-cookx aria-label="Dismiss ' + esc(live) + '" title="Dismiss">' + ICO.x + '</button><button type="button" class="cookbn-open" data-cookopen aria-label="Open ' + esc(live) + '">' + ICO.chev + "</button></div>";
    document.body.appendChild(b);
  }
  document.addEventListener("click", function (e) {
    var s = e.target.closest('[data-act="startcook"]');
    if (s) { e.preventDefault(); e.stopPropagation(); if (live) return; live = H.idea(P.rid).name; window.PK_COOKING = true; banner(); H.set({}); return; }
    if (e.target.closest("[data-cookx]")) { live = null; window.PK_COOKING = false; banner(); H.set({}); return; }
    if (e.target.closest("[data-cookopen]")) H.toast("Opens the ingredients view for this dish (not drawn here).");
  }, true);
})();

/* ---------- the ? list: the keys of the chosen option are added to Home's list ---------- */
new MutationObserver(function () {
  if (kbEl.hidden) { if (S.open && PK.mod && PK.mod.focus) PK.mod.focus(); return; }
  var c = kbEl.querySelector(".kbc"); if (!c || c.querySelector(".pk-kbs") || !PK.mod) return;
  if (PK.mod.patch) PK.mod.patch(c);
  var rows = PK.mod.help && PK.mod.help(); if (!rows || !rows.length) return;
  c.insertAdjacentHTML("beforeend", '<div class="sh2 pk-kbs">' + esc(rows.title) + "</div>" + rows.map(function (r) {
    return '<div class="kbr"><span class="kk">' + r[0].split(/\s{2}or\s{2}|\s{2}/).map(function (x) { return "<kbd>" + esc(x) + "</kbd>"; }).join(" ") + "</span><span>" + r[1] + "</span></div>";
  }).join(""));
}).observe(kbEl, { attributes: true, attributeFilter: ["hidden"], childList: true });

/* ---------- the option switch, at the foot of the rail: mockup scaffolding, not part of the app ---------- */
(function () {
  var nav = document.createElement("nav"); nav.className = "pk-sw"; nav.setAttribute("aria-label", "Day picker option");
  var u = new URL(location.href), h = '<span>Option</span>';
  "abcdefg".split("").forEach(function (o) { var p = new URLSearchParams(u.search); p.set("pick", o); h += '<a href="?' + p.toString() + '"' + (o === PK.opt ? ' aria-current="true"' : "") + ">" + o.toUpperCase() + "</a>"; });
  /* tonight: nothing planned (default, the primary card has Plan) or the meal already planned (no Plan on that card or in its pane; owner, 16 Oct 2026) */
  h += "<span>Tonight</span>";
  [["none", "Open"], ["planned", "Planned"]].forEach(function (t) {
    var p = new URLSearchParams(u.search); p.set("pick", PK.opt); p.delete("lead"); p.delete("open"); p.delete("week"); if (t[0] === "planned") p.set("night", "planned"); else p.delete("night");
    h += '<a class="w" href="?' + p.toString() + '"' + ((P.night === "planned") === (t[0] === "planned") ? ' aria-current="true"' : "") + ">" + t[1] + "</a>";
  });
  nav.innerHTML = h; $(".rail").appendChild(nav);
})();
})();
