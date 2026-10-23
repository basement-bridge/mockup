/* History search and filters, on the canonical event model (docs/knowledge/history-event-model.md, docs/knowledge/history-search.md).
   Everything this screen reads comes from GET /api/history rows (model.js stands in for it): occurred_at, actor, product, kind (area = first segment), kind_v, entity, affects.
   It never reads a payload; row and detail text come from the kind's template via HM.render. Mockup data lives in model.js, not here.
   Markup uses option D's classes (../option-d/option-d.css) plus search.css; the build lifts those and replaces model.js with the calls. */
(function () {
"use strict";
var Q = new URLSearchParams(location.search), HM = window.HM;
var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var esc = HM.esc;
var P = {
 sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', home: '<path d="M4 11l8-6.5 8 6.5v8.5H4z"/>', jar: '<path d="M8 4h8M7 7h10v12.5a1 1 0 01-1 1H8a1 1 0 01-1-1z"/><path d="M7 11h10"/>',
 cart: '<path d="M3.5 5h2.5l2 10h9.5l2-7.5H7"/><circle cx="9.5" cy="19" r="1.2"/><circle cx="16.5" cy="19" r="1.2"/>', cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
 book: '<path d="M5 4.5h10a3 3 0 013 3V20H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h10"/>', user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5"/>',
 users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.5-3 2.7-4.6 5.5-4.6s5 1.6 5.5 4.6"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14.6c2.4 0 4 1.2 4.5 3.9"/>',
 x: '<path d="M6 6l12 12M18 6L6 18"/>', chev: '<path d="M9 6l6 6-6 6"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', bell: '<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>',
 info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
 hand: '<path d="M7 11V6.5a1.5 1.5 0 013 0V11M10 10V5a1.5 1.5 0 013 0v5M13 10V6a1.5 1.5 0 013 0v6.5M16 12V9.5a1.5 1.5 0 013 0v4.5c0 4-2.5 6.5-6 6.5-3 0-5-1.5-6.5-4L4.5 13a1.5 1.5 0 012.5-1.5L8 13"/>',
 back: '<path d="M15 6l-6 6 6 6"/>'
};
var ic = function (n, c) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (c ? ' class="' + c + '"' : "") + ">" + (P[n] || "") + "</svg>"; };

/* ---------- state: URL parameters are the mockup's way in ---------- */
var ME = Q.get("as") === "sam" ? "sam" : "arjan", HOUSE = Q.get("household") === "more" ? "more" : "two";
var MEID = HM.IDS[ME], OTHERS = Object.keys(HM.IDS).filter(function (k) { return k !== ME && (HOUSE === "more" || k !== "priya"); });
var ALL = HM.build({ affects: Q.get("affects") === "today" ? "today" : "sample", house: HOUSE });
var TPL = ["loading", "none"].indexOf(Q.get("tpl")) >= 0 ? Q.get("tpl") : "ready"; HM.setTplMode(TPL);
var NOTES = Q.get("notes") !== "0", KEYWORD = Q.get("keyword") === "1", NOMEMBER_IN = Q.get("nomember") === "include";
var LAST = { sat: { iso: HM.utc(1, 17, 30), t: "Sat 17 Oct, 5:30 pm" }, wed: { iso: HM.utc(4, 17, 30), t: "Wed 14 Oct, 5:30 pm" } }[Q.get("last") === "wed" ? "wed" : "sat"];
var CAP = 3; /* H6: the catch-up is at most three calendar days that each had a change. The screen's rule, not the API's. */
var RANGES = [["any", "Any time"], ["today", "Today"], ["week", "Last 7 days"], ["month", "Last 30 days"]];
var S = {
 view: Q.get("view") === "list" ? "list" : "catch", tab: Q.get("tab") === "other" ? "other" : "mine", panel: Q.get("filters") === "1" ? "filters" : "", step: Q.get("step") || "",
 f: { when: Q.get("when") || "any", area: Q.get("area") || "", kind: Q.get("kind") || "", product: Q.get("product") || "", touches: Q.get("touches") || "" },
 entity: Q.get("entity") || "" /* "item:itm_rice": in-context, from an item. Needs product (API rule). */, kw: "", state: Q.get("state") || "",
 pages: [], more: true, afterDay: null, open: null, seen: null, ticked: false, person: ""
};
if (S.entity && !S.f.product) S.f.product = "kitchie";
if (S.state === "" && Q.get("open")) S.open = +Q.get("open");

var wide = function () { return window.matchMedia("(min-width:1024px)").matches; };
function otherId() { return HM.IDS[OTHERS[0]]; }
function otherName() { return HOUSE === "two" ? HM.NAMES[otherId()] : "Others"; }
function whoName(e) { if (e.actor === null) return "Someone"; if (e.actor.member === MEID) return "You"; return e.actor.name === null ? "A former member" : e.actor.name; }
function isNull(e) { return e.actor === null; }
function areaOf(e) { return e.kind.split(".")[0]; }
function areaLabel(id) { var a = HM.REGISTRY.areas.filter(function (x) { return x.id === id; })[0]; return a ? a.label : id; }
function kindLabel(k) { var x = HM.REGISTRY.kinds.filter(function (y) { return y.kind === k; })[0]; return x ? x.label : k; }
function memberLabel(id) { return id === MEID ? "you" : HM.NAMES[id] || "a member"; }

/* ---------- the query: only parameters GET /api/history accepts, each single-valued ---------- */
function startOfTodayISO() { return HM.utc(0, 0, 0); }
function params(forCatch) {
 var q = {};
 if (!forCatch) { if (S.tab === "mine") q.actor = "me"; else if (HOUSE === "two") q.actor = otherId(); else { q.actorNot = MEID; q.noMember = NOMEMBER_IN; } }
 if (S.f.touches) q.affects = S.f.touches === "me" ? "me" : S.f.touches;
 if (S.f.product) q.product = S.f.product;
 if (S.f.area) q.area = S.f.area;
 if (S.f.kind) q.kind = S.f.kind;
 if (S.entity) { var e = S.entity.split(":"); q.entityType = e[0]; q.entityId = e[1]; }
 if (S.f.when === "today") q.from = startOfTodayISO();
 if (S.f.when === "week") q.from = new Date(HM.NOW - 7 * 86400000).toISOString();
 if (S.f.when === "month") q.from = new Date(HM.NOW - 30 * 86400000).toISOString();
 return q;
}
function catchQ() { var q = params(true); q.since = S.seen || LAST.iso; return q; }
function reset() { S.pages = []; S.more = true; S.afterDay = null; }
function loadDay() { /* one calendar day with activity per call, newest first (days=1&tz=) */
 var q = S.view === "catch" ? catchQ() : params(false);
 var r = HM.pageDay(ALL, q, MEID, S.afterDay);
 if (r.day === null) { S.more = false; return false; }
 S.pages.push({ day: r.day, events: r.events }); S.afterDay = r.day; S.more = r.more;
 if (S.view === "catch" && S.pages.length >= CAP) S.capped = r.more;
 return true;
}
function ensureFirst() { reset(); S.capped = false; var n = S.view === "catch" ? CAP : 1; for (var i = 0; i < n && S.more; i++) loadDay(); }
function rows() { var o = []; S.pages.forEach(function (p) { o = o.concat(p.events); }); return o; }
function byTab(e, tab) { return tab === "mine" ? (e.actor && e.actor.member === MEID) : (HOUSE === "two" ? (e.actor && e.actor.member === otherId()) : (e.actor ? e.actor.member !== MEID : NOMEMBER_IN)); }
/* catch-up: the three days are loaded without an actor (one call), then split by actor in the client; summary counts are of exactly these loaded rows */
function catchRows() { return rows().filter(function (e) { return !S.person || (S.person === "none" ? isNull(e) : e.actor && e.actor.member === S.person); }); }
function tabRows() { return catchRows().filter(function (e) { return byTab(e, S.tab); }); }
function viewRows() { var L = S.view === "catch" ? tabRows() : rows(); if (S.kw) { var k = S.kw.toLowerCase(); L = L.filter(function (e) { var r = HM.render(e); return ((r.state === "ok" || r.state === "generic") ? r.text : "").toLowerCase().indexOf(k) >= 0; }); } return L; }

/* ---------- rows ---------- */
function avatar(e, small) {
 var cls = "av" + (small ? " sm" : "") + (e.actor && e.actor.member === MEID ? " me" : "");
 if (e.actor === null) return '<span class="' + cls + ' none" aria-hidden="true">' + ic("link", "sm") + "</span>";
 var n = e.actor.name; return '<span class="' + cls + '" aria-hidden="true">' + esc(n ? n.charAt(0) : "?") + "</span>";
}
function evRow(e, isNew) {
 var r = HM.render(e), who = whoName(e), line;
 if (r.state === "ok") line = '<b class="wh">' + esc(who) + '</b><span class="sep"> · </span><span class="ln">' + r.html + "</span>";
 else if (r.state === "generic") line = '<span class="ln gen"><b class="wh">' + esc(who) + "</b> " + r.html + "</span>";
 else line = '<b class="wh">' + esc(who) + '</b><span class="skbody" aria-label="Loading this row"><i></i></span>';
 var m = [];
 if (e.affects.indexOf(MEID) >= 0 && e.actor && e.actor.member !== MEID) m.push('<span class="chip me">Touches you</span>');
 m.push("<span>" + esc(HM.PRODUCTS[e.product] || e.product) + " · " + esc(areaLabel(areaOf(e))) + "</span>");
 return '<button type="button" class="ev' + (isNew ? " new" : "") + '" data-seq="' + e.seq + '" aria-haspopup="dialog"' + (S.open === e.seq ? ' aria-current="true"' : "") + ">" + avatar(e, 1) +
  '<div class="tx">' + line + '<div class="meta">' + m.join("") + "</div></div><time datetime=\"" + e.occurred_at + '">' + esc(HM.timeOf(e.occurred_at)) + "</time></button>";
}
function dayBlock(page, L) {
 var evs = L.filter(function (e) { return HM.dayKey(e.occurred_at) === page.day; });
 if (!evs.length) return "";
 var lab = HM.dayLabel(page.day), sub = lab.indexOf(" ") > 0 ? "" : " <small>" + esc(HM.longDay(page.day + "T12:00:00.000Z")) + "</small>";
 return '<section class="day" aria-label="' + esc(lab) + '"><div class="lbl">' + esc(lab) + sub + '</div><div class="pg">' + evs.map(function (e) { return evRow(e, S.view === "catch"); }).join("") + "</div></section>";
}
function skeleton() { var r = '<div class="sk"><span class="av"></span><div><i></i><i class="s"></i></div></div>'; return '<section class="day"><div class="sklbl lbl"><i></i></div><div class="pg">' + r + r + r + "</div></section>"; }

/* ---------- active filters and labels ---------- */
function toks() {
 var t = [];
 if (S.entity) t.push(["entity", "In", S.entity.indexOf("item:") === 0 ? "This item" : "This " + S.entity.split(":")[0]]);
 if (S.f.when !== "any") t.push(["when", "When", RANGES.filter(function (r) { return r[0] === S.f.when; })[0][1]]);
 if (S.f.product) t.push(["product", "App", HM.PRODUCTS[S.f.product]]);
 if (S.f.area) t.push(["area", "Area", areaLabel(S.f.area)]);
 if (S.f.kind) t.push(["kind", "What happened", kindLabel(S.f.kind)]);
 if (S.f.touches) t.push(["touches", "Touches", memberLabel(S.f.touches === "me" ? MEID : S.f.touches)]);
 return t;
}
function tokBar() { var t = toks(); return t.length ? '<div class="toks" aria-label="Active filters">' + t.map(function (x) { return '<button type="button" class="tok" data-rm="' + x[0] + '"><i>' + x[1] + "</i> " + esc(x[2]) + '<span class="x">' + ic("x", "sm") + "</span></button>"; }).join("") + "</div>" : ""; }

/* groups: [id, label, icon, canonical parameter]. Who is the tab (actor). Where (place) and counts are gone: payload and facets are not in the model. */
var GROUPS = [["when", "When", "clock", "occurred_at"], ["who", "Who", "user", "actor"], ["area", "Area", "jar", "kind, first part"], ["kind", "What happened", "check", "kind"], ["product", "App", "home", "product"], ["touches", "Touches", "bell", "affects"]];
function visibleGroups() { return GROUPS.filter(function (g) { return !(g[0] === "area" && HM.REGISTRY.areas.length < 2); }); }
function options(g) { /* [group, value, label, icon] */
 if (g === "when") return RANGES.map(function (r) { return ["when", r[0], r[1]]; });
 if (g === "who") return [["who", "mine", "You"]].concat(HOUSE === "two" ? [["who", "other", HM.NAMES[otherId()]]] : [["who", "other", "Others"]]);
 if (g === "area") return HM.REGISTRY.areas.map(function (a) { return ["area", a.id, a.label]; });
 if (g === "kind") return HM.REGISTRY.kinds.map(function (k) { return ["kind", k.kind, k.label, k.kind.split(".")[0]]; });
 if (g === "product") return Object.keys(HM.PRODUCTS).map(function (p) { return ["product", p, HM.PRODUCTS[p]]; });
 if (g === "touches") return [["touches", "me", "You"]].concat(OTHERS.map(function (k) { return ["touches", HM.IDS[k], HM.NAMES[HM.IDS[k]]]; }));
 return [];
}
function isOn(o) { if (o[0] === "who") return S.tab === o[1]; if (o[0] === "when") return S.f.when === o[1]; return S.f[o[0]] === o[1]; }
function chipSet(g, cls) {
 var opts = options(g), out = "", lastArea = null;
 opts.forEach(function (o) {
  if (g === "kind" && o[3] !== lastArea) { lastArea = o[3]; out += '</div><p class="ksub">' + esc(areaLabel(o[3])) + '</p><div class="' + (cls === "mc" ? "mcs" : "fchips") + '">'; }
  var on = isOn(o);
  out += cls === "mc" ? '<button type="button" class="mc' + (on ? " on" : "") + '" aria-pressed="' + on + '" data-opt="' + o[0] + "|" + o[1] + '"><span class="mi">' + (on ? ic("check", "sm") : "") + "</span>" + esc(o[2]) + "</button>"
   : '<button type="button" class="fpl' + (on ? " on" : "") + '" aria-pressed="' + on + '" data-opt="' + o[0] + "|" + o[1] + '">' + esc(o[2]) + "</button>";
 });
 return out;
}
function groupValue(g) {
 if (g === "when") return RANGES.filter(function (r) { return r[0] === S.f.when; })[0][1];
 if (g === "who") return S.tab === "mine" ? "You" : otherName();
 if (g === "area") return S.f.area ? areaLabel(S.f.area) : "Any";
 if (g === "kind") return S.f.kind ? kindLabel(S.f.kind) : "Any";
 if (g === "product") return S.f.product ? HM.PRODUCTS[S.f.product] : "Any";
 if (g === "touches") return S.f.touches ? memberLabel(S.f.touches === "me" ? MEID : S.f.touches) : "Any";
 return "Any";
}
var isAny = function (g) { return g === "when" ? S.f.when === "any" : g === "who" ? false : groupValue(g) === "Any"; };

/* ---------- the panels ---------- */
function ann(t) { return NOTES ? '<aside class="ann"><b>Mockup note</b> ' + t + "</aside>" : ""; }
function filtersPanel() {
 var n = toks().length;
 var sec = function (g) { return "<section><h3>" + g[1] + (NOTES ? " <small>" + g[3] + "</small>" : "") + '</h3><div class="fchips">' + chipSet(g[0], "fpl") + "</div></section>"; };
 return '<div class="fp"><div class="fph"><div><h2>Filters</h2><p>' + esc(rangeName()) + "</p></div></div><div class=\"fpb\">" +
  '<p class="fhint">Nothing is typed. Pick one in each group; the list updates as you pick.</p>' + visibleGroups().map(sec).join("") +
  '<div class="acts2"><button type="button" class="sec2" data-clear>Clear all' + (n ? " (" + n + ")" : "") + "</button></div>" +
  '<p class="rule">' + ic("info", "sm") + "<span>One choice per group. There are no counts: the history can say what matches, not how many.</span></p>" +
  ann("Each group name above is the Platform parameter it sets. Choices for Area and What happened come from the registry (<code>/api/history/kinds</code>, designed, not built). Where, counts and several choices in one group are gone: place is payload, and the API has no facets or lists (model, sections 2 and 3).") + "</div></div>";
}
function sheetHtml() {
 var G = visibleGroups(), step = S.step && G.some(function (g) { return g[0] === S.step; }) ? S.step : "", g = G.filter(function (x) { return x[0] === step; })[0], body;
 if (!step) body = '<p class="fsub">Pick a group, then one choice in it. Groups combine.</p><div class="strows">' + G.map(function (x) { var v = groupValue(x[0]); return '<button type="button" class="strow' + (!isAny(x[0]) ? " on" : "") + '" data-step="' + x[0] + '"><span class="stt"><span class="dotc">' + ic(x[2], "sm") + "</span>" + x[1] + '</span><span class="sval">' + esc(v) + ic("chev", "sm") + "</span></button>"; }).join("") + "</div>";
 else body = '<button type="button" class="back2" data-step="">' + ic("chev", "sm") + ' All filters</button><h3 class="fh">' + g[1] + ' <small>pick one</small></h3><div class="mcs">' + chipSet(step, "mc") + "</div>" + (NOTES ? '<p class="fsub">Sets <code>' + g[3] + "</code>.</p>" : "");
 return '<div class="sheet-dim" data-dim><div class="sheet tall" role="dialog" aria-modal="true" aria-label="Pick a filter" data-keep><div class="grab"></div><div class="fhead"><div class="ftabs"><button type="button" class="on">' + (step ? g[1] : "Pick a filter") + '</button></div><button type="button" class="ib" data-closepanel aria-label="Close">' + ic("x") + "</button></div>" +
  '<div class="fbody">' + body + '</div><div class="ffoot"><button type="button" class="pri wide" data-closepanel>Show results</button><div class="flinks"><button type="button" class="link" data-clear>Clear</button><span></span></div></div></div></div>';
}
function rangeName() { return {any: "Recent history", today: "Today", week: "The last 7 days", month: "The last 30 days"}[S.f.when]; }

/* ---------- the result detail: the skeleton (who, when, app) plus the kind's template output. Nothing else is drawn. ---------- */
function find(seq) { return ALL.filter(function (e) { return e.seq === seq; })[0]; }
function detailBody(e) {
 var r = HM.render(e, true), who = whoName(e), when = HM.longDay(e.occurred_at) + ", " + HM.timeOf(e.occurred_at), body;
 if (r.state === "ok") body = '<p class="dline">' + r.html + "</p>" + r.detail.map(function (d) { return '<p class="dsub">' + d + "</p>"; }).join("");
 else if (r.state === "generic") body = '<p class="dline gen">' + esc(who) + " " + r.html + "</p>";
 else body = '<p class="dline"><span class="skbody"><i></i></span></p>';
 var note = r.state === "ok" ? "Rendered by the generic evaluator from the template <code>" + esc(r.tpl) + "</code>. " + esc(HM.PRODUCTS[e.product]) + " wrote it and published it; Platform served it. The name above is a link only because the template defines one, to a route " + esc(HM.PRODUCTS[e.product]) + " registered."
  : r.state === "generic" ? "No template for <code>" + esc(e.product + "/" + e.kind + "/" + e.kind_v) + "</code> is published (" + esc(HM.PRODUCTS[e.product]) + " owns that wording; Platform does not write it). The generic row needs only when, who and app, and upgrades in place when the template arrives."
  : "The template is being fetched from Platform. The skeleton shows when, who and app, and never a claim about what happened.";
 return '<div class="dh">' + avatar(e) + '<div class="dw"><b>' + esc(who) + "</b><span>" + esc(when) + '</span></div><span class="chip">' + esc(HM.PRODUCTS[e.product] || e.product) + "</span></div>" + body + ann(note);
}
function detailPanel(e, sheet) {
 return '<div class="dtl"><div class="ph">' + (sheet ? "" : '<button type="button" class="ib" data-closedetail aria-label="Back to filters">' + ic("back") + "</button>") + "<h2>This change</h2>" + (sheet ? '<button type="button" class="ib" data-closedetail aria-label="Close">' + ic("x") + "</button>" : "") + "</div>" + detailBody(e) + "</div>";
}

/* ---------- catch-up ---------- */
function catchCard() {
 var all = rows(), x = '<button type="button" class="ib xcatch" data-closecatch aria-label="Leave the catch-up and pick a filter (C). Does not mark it caught up">' + ic("x") + "</button>";
 var tick = '<button type="button" class="ib tickcatch" data-tick aria-label="Mark as caught up (T). Your next visit starts fresh from here">' + ic("check") + "</button>";
 if (!all.length) return '<section class="catch" aria-label="Since you were last here"><div class="chead"><h2>' + ic("check") + "You’re caught up</h2>" + x + "</div><p class=\"sum\">" + (S.ticked ? "Marked as caught up just now. Your next visit starts fresh from here." : "Nothing new since " + esc(LAST.t) + ". Enjoy the quiet.") + "</p></section>";
 var by = {}, ord = [];
 all.forEach(function (e) { var k = e.actor ? e.actor.member : "none"; if (!by[k]) { by[k] = 0; ord.push(k); } by[k]++; });
 var parts = ord.map(function (k) { var lab = k === "none" ? "no sign-in" : k === MEID ? "you" : HM.NAMES[k] || "a former member"; return k === "none" ? by[k] + " with no member" : by[k] + " by " + (S.person ? esc(lab) : '<button type="button" class="plink2" data-person="' + k + '">' + esc(lab) + "</button>"); });
 var touch = all.filter(function (e) { return e.affects.indexOf(MEID) >= 0 && e.actor && e.actor.member !== MEID; }).length;
 var sum = esc(LAST.t) + " · " + all.length + " change" + (all.length === 1 ? "" : "s") + (S.capped ? " in the last 3 days with activity" : "") + (parts.length && !S.person ? ": " + parts.join(", ") : "");
 var bar = S.person ? '<div class="pbar"><span class="pt">Only changes by ' + esc(S.person === "none" ? "no member" : S.person === MEID ? "you" : HM.NAMES[S.person]) + ' in this catch-up</span><button type="button" class="lnk2" data-person="">Back to the full catch-up</button></div>' : "";
 return '<section class="catch" aria-label="Since you were last here"><div class="chead"><h2>' + ic("bell") + "Since you were last here</h2>" + tick + x + '</div><p class="sum">' + sum + "</p>" +
  (touch ? '<p class="sum touch">' + ic("bell", "sm") + " " + touch + " " + (touch === 1 ? "change touches" : "changes touch") + " you, marked on the rows.</p>" : "") + bar +
  ann("The old per-person sentence and action button are gone: <code>affects</code> is member ids only, and product-written words are not allowed. A person is touched by a row, and the row is the template’s. Counts are of the " + all.length + " loaded rows only.") + "</section>";
}

/* ---------- empty, zero, down ---------- */
function emptyHtml(kind) {
 var t = toks().map(function (x) { return x[2]; });
 if (S.view === "list" || kind === "zero") { if (S.tab === "other") t.unshift(otherName()); else t.unshift("You"); }
 if (kind === "down") return '<div class="empty"><div class="big">' + ic("clock") + "</div><h2>History is not reachable</h2><p>This is the feed being down, not an empty history. Nothing you did is lost.</p><div class=\"acts\"><button type=\"button\" class=\"pri\" data-retry>Try again</button></div></div>";
 if (kind === "empty") return '<div class="empty"><div class="big">' + ic("clock") + "</div><h2>A quiet kitchen so far</h2><p>Changes you and the household make will show here.</p></div>";
 var more = S.f.when !== "month" ? '<button type="button" class="pri" data-month>Look back 30 days</button>' : "";
 return '<div class="empty"><div class="big">' + ic("search") + "</div><h2>No matches</h2><p>" + (S.kw ? "Nothing in the days loaded says “" + esc(S.kw) + "”." : "Nothing on record for " + esc(t.join(" · ")) + ".") + '</p><div class="acts">' + more + '<button type="button" class="sec2" data-clear>Clear filters</button></div></div>';
}
function feed() {
 if (S.state === "loading") return skeleton();
 if (S.state === "empty") return emptyHtml("empty");
 if (S.state === "down") return emptyHtml("down");
 var L = viewRows();
 if (S.view === "catch") {
  if (!rows().length) return "";
  if (!L.length) return '<div class="empty slim"><h2>' + (S.tab === "mine" ? "Nothing from you" : "Nothing from " + esc(otherName())) + " in this catch-up</h2></div>" + footnote();
  return S.pages.map(function (p) { return dayBlock(p, L); }).join("") + footnote() + catchEnd();
 }
 if (!L.length && !S.more) return emptyHtml("zero");
 return (S.kw ? '<p class="kwnote">' + ic("search", "sm") + " Searching the " + S.pages.length + " day" + (S.pages.length === 1 ? "" : "s") + " loaded. Older days load as you scroll.</p>" : "") +
  S.pages.map(function (p) { return dayBlock(p, L); }).join("") + footnote() + (S.more ? '<div class="sentinel" id="sentinel" role="status"><span class="dots" aria-hidden="true"></span>Loading one more day with activity</div>' : '<p class="note">That is everything on record.</p>');
}
function catchEnd() { return S.capped ? '<div class="more cap"><p class="capline">' + ic("clock", "sm") + " Showing the last 3 days with activity. Search for older.</p><button type=\"button\" class=\"sec2\" data-closecatch>Pick a filter</button></div>" : ""; }
function footnote() { /* Q5: what the reference store does today, said plainly */
 if (S.tab !== "other") return "";
 var nm = (S.view === "catch" ? rows() : ALL.filter(function (e) { return isNull(e); })).filter(isNull).length;
 if (!nm || NOMEMBER_IN) return "";
 return ann("Q5. " + nm + " change" + (nm === 1 ? " has" : "s have") + " no member (a shopping link or the system) and is in neither tab: <code>actor=others</code> skips a null actor, and no parameter selects one. Preview: Others also returns them.");
}

/* ---------- page ---------- */
function railHtml() { var it = [["home", "Home"], ["jar", "Pantry"], ["cal", "Plan"], ["book", "Recipes"], ["cart", "Shopping"], ["clock", "History"]]; return '<div class="brand">Kitchie</div>' + it.map(function (i) { return '<a href="#" data-rail aria-label="' + i[1] + '"' + (i[1] === "History" ? ' aria-current="page"' : "") + ">" + ic(i[0]) + "<span>" + i[1] + "</span></a>"; }).join(""); }
function tabsHtml() {
 var all = S.view === "catch" ? rows() : [], c = { mine: all.filter(function (e) { return byTab(e, "mine"); }).length, other: all.filter(function (e) { return byTab(e, "other"); }).length };
 return '<div class="hx-tabs" role="tablist" aria-label="Whose activity">' + [["mine", "My activity", ic("user", "sm")], ["other", otherName(), ic(HOUSE === "two" ? "user" : "users", "sm")]].map(function (t) { return '<button type="button" role="tab" aria-selected="' + (S.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[2] + t[1] + (c[t[0]] ? ' <span class="c">' + c[t[0]] + "</span>" : "") + "</button>"; }).join("") + "</div>";
}
function kwBox() { return KEYWORD ? '<div class="kw"><label class="kwl"><span class="kwi">' + ic("search", "sm") + '</span><input type="search" id="kw" value="' + esc(S.kw) + '" placeholder="Search the days loaded" autocomplete="off" aria-label="Search the days loaded"></label><span class="chip prop">Proposal · Q1 · S1</span></div>' + (NOTES ? ann("A keyword box is not in the locked design (H9) and the API has no text parameter. This is the only reading that needs nothing from Platform: the client matches the template-rendered text of the days it has loaded. Esc clears it. Off by default; <code>?keyword=1</code>.") : "") : ""; }
function lane() {
 if (S.open !== null && find(S.open)) return detailPanel(find(S.open), false);
 if (S.view === "catch" && S.panel !== "filters") return '<div class="grab"></div>' + catchCard();
 return filtersPanel();
}
function render() {
 var root = $("#hx"), nt = toks().length, showFilterBtn = wide() ? S.view === "catch" : S.view !== "catch";
 var head = '<header class="hx-head"><h1>History</h1>' + (showFilterBtn ? '<button type="button" class="ib' + (S.panel === "filters" ? " on" : "") + '" data-filters aria-label="Filters (F)">' + ic("sliders") + (nt ? '<span class="n">' + nt + "</span>" : "") + "</button>" : "") + "</header>";
 root.innerHTML = '<nav class="hx-rail" aria-label="Main">' + railHtml() + "</nav>" +
  '<main class="hx-main">' + head + tabsHtml() + (NOTES ? ann("Fields this screen reads: <code>occurred_at</code>, <code>actor</code>, <code>product</code>, <code>kind</code> (area is its first part), <code>kind_v</code>, <code>entity</code>, <code>affects</code>. It never reads <code>payload</code>; text comes from the kind’s template.") : "") +
  (S.view === "catch" && !S.state ? '<div class="phonecatch">' + catchCard() + "</div>" : "") + kwBox() + tokBar() + '<div id="feed">' + feed() + "</div></main>" +
  '<aside class="hx-panel" id="panel" aria-label="' + (S.open !== null ? "This change" : S.view === "catch" && S.panel !== "filters" ? "Catch-up" : "Filters") + '">' + (wide() ? lane() : "") + "</aside>" +
  (!wide() && S.panel === "filters" && S.open === null ? sheetHtml() : "") +
  (!wide() && S.open !== null && find(S.open) ? '<div class="sheet-dim" data-dim><div class="sheet dsheet" role="dialog" aria-modal="true" aria-label="This change" data-keep><div class="grab"></div><div class="fbody">' + detailPanel(find(S.open), true) + "</div></div></div>" : "") +
  '<div class="toast" id="toast" hidden></div>';
 watch();
 var pv = $(".pv"); if (pv) pv.style.display = (!wide() && (S.panel === "filters" || S.open !== null)) ? "none" : "";
}
var tmr;
function toast(t) { var el = $("#toast"); if (!el) return; el.textContent = t; el.hidden = false; clearTimeout(tmr); tmr = setTimeout(function () { el.hidden = true; }, 2400); }
function refreshFeed() { var f = $("#feed"); if (f) { f.innerHTML = feed(); watch(); } var tb = $(".hx-tabs"); if (tb) tb.outerHTML = tabsHtml(); }
var io;
function watch() {
 if (io) io.disconnect();
 var s = $("#sentinel"); if (!s || !("IntersectionObserver" in window)) return;
 io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); setTimeout(moreDay, 350); } }, { rootMargin: "200px" }); io.observe(s);
}
function moreDay() { if (S.view !== "list" || !S.more) return; loadDay(); refreshFeed(); }
function setView(v) { S.view = v; S.person = ""; S.open = null; ensureFirst(); }

/* ---------- behaviour ---------- */
function apply(g, v) {
 if (g === "who") { S.tab = v; }
 else if (g === "when") S.f.when = v;
 else if (g === "kind") { S.f.kind = S.f.kind === v ? "" : v; if (S.f.kind) S.f.area = ""; }
 else if (g === "area") { S.f.area = S.f.area === v ? "" : v; if (S.f.area) S.f.kind = ""; }
 else S.f[g] = S.f[g] === v ? "" : v;
 if (S.view === "catch") S.view = "list";
 ensureFirst(); render();
}
document.addEventListener("click", function (ev) {
 var t = ev.target;
 if (t.hasAttribute && t.hasAttribute("data-dim")) { if (S.open !== null) S.open = null; else { S.panel = ""; S.step = ""; } render(); return; }
 var b = t.closest ? t.closest("button,a") : null; if (!b) return;
 if (b.matches("a[data-route]")) { ev.preventDefault(); toast("Would open " + b.getAttribute("data-route")); return; }
 if (b.matches("a[data-rail]")) { ev.preventDefault(); return; }
 if (b.dataset.seq) { S.open = +b.dataset.seq; render(); return; }
 if (b.hasAttribute("data-closedetail")) { S.open = null; render(); return; }
 if (b.dataset.tab) { S.tab = b.dataset.tab; S.open = null; if (S.view === "list") ensureFirst(); render(); return; }
 if (b.hasAttribute("data-filters")) { S.panel = S.panel === "filters" && wide() ? "" : "filters"; S.step = ""; S.open = null; render(); return; }
 if (b.hasAttribute("data-closecatch")) { S.view = "list"; S.person = ""; S.open = null; if (!wide()) { S.panel = "filters"; S.step = ""; } ensureFirst(); render(); toast("Left the catch-up. Not marked as caught up."); return; }
 if (b.hasAttribute("data-tick")) { S.ticked = true; S.seen = new Date(HM.NOW).toISOString(); ensureFirst(); render(); toast("Marked as caught up. Your next visit starts fresh from here."); return; }
 if (b.dataset.person !== undefined) { S.person = b.dataset.person; if (S.person && S.person !== "none") S.tab = S.person === MEID ? "mine" : "other"; render(); return; }
 if (b.dataset.opt) { var p = b.dataset.opt.split("|"); apply(p[0], p[1]); return; }
 if (b.dataset.step !== undefined) { S.step = b.dataset.step; render(); return; }
 if (b.dataset.rm) { var k = b.dataset.rm; if (k === "entity") S.entity = ""; else if (k === "when") S.f.when = "any"; else S.f[k] = ""; if (S.view === "catch") S.view = "list"; ensureFirst(); render(); return; }
 if (b.hasAttribute("data-clear")) { S.f = { when: "any", area: "", kind: "", product: "", touches: "" }; S.entity = ""; S.kw = ""; ensureFirst(); render(); return; }
 if (b.hasAttribute("data-month")) { S.f.when = "month"; ensureFirst(); render(); return; }
 if (b.hasAttribute("data-retry")) { S.state = ""; ensureFirst(); render(); return; }
 if (b.hasAttribute("data-closepanel")) { S.panel = ""; S.step = ""; render(); return; }
});
document.addEventListener("input", function (ev) { if (ev.target && ev.target.id === "kw") { S.kw = ev.target.value; refreshFeed(); } });
document.addEventListener("keydown", function (ev) {
 var tag = (ev.target && ev.target.tagName) || ""; if (tag === "INPUT") { if (ev.key === "Escape" && S.kw) { S.kw = ""; ev.target.value = ""; refreshFeed(); } return; }
 if (ev.ctrlKey || ev.metaKey) { if (ev.key === "Escape") { if (S.open !== null) S.open = null; else S.panel = ""; render(); } return; }
 var k = ev.key.toLowerCase();
 if (k === "f") { S.panel = "filters"; S.open = null; render(); }
 else if (k === "1" || k === "2") { S.tab = k === "1" ? "mine" : "other"; S.open = null; if (S.view === "list") ensureFirst(); render(); }
 else if (k === "c" && S.view === "catch") { S.view = "list"; ensureFirst(); render(); }
 else if (k === "t" && S.view === "catch") { S.ticked = true; S.seen = new Date(HM.NOW).toISOString(); ensureFirst(); render(); }
 else if (k === "m" && S.view === "list") moreDay();
});
var wasWide = wide(); window.addEventListener("resize", function () { if (wasWide !== wide()) { wasWide = wide(); render(); } });

/* ---------- mockup-only preview control (not part of the app) ---------- */
function pvHtml() {
 var u = function (k, v) { var p = new URLSearchParams(location.search); if (v === null) p.delete(k); else p.set(k, v); return "?" + p.toString(); };
 var grp = function (title, k, opts, cur) { return "<h3>" + title + '</h3><div class="pills">' + opts.map(function (o) { return '<a class="pl" aria-pressed="' + (cur === o[0]) + '" href="' + u(k, o[0] === "" ? null : o[0]) + '">' + o[1] + "</a>"; }).join("") + "</div>"; };
 return '<div class="pv" id="pv"><button type="button" id="pvb" aria-expanded="false">Preview</button><div class="pop" id="pvp">' +
  grp("Signed in as", "as", [["", "Arjan"], ["sam", "Sam"]], ME === "sam" ? "sam" : "") + grp("Household", "household", [["", "Two people"], ["more", "More"]], HOUSE === "more" ? "more" : "") +
  grp("Opens at", "view", [["", "Catch-up"], ["list", "Recent"]], S.view === "list" ? "list" : "") + grp("Last visit", "last", [["", "Sat"], ["wed", "Wed (older than the cap)"]], Q.get("last") === "wed" ? "wed" : "") +
  grp("Template registry", "tpl", [["", "Published"], ["loading", "Fetching"], ["none", "Nothing published"]], TPL === "ready" ? "" : TPL) +
  grp("Affects", "affects", [["", "Filled (Proposal)"], ["today", "As Kitchie writes it today"]], Q.get("affects") === "today" ? "today" : "") +
  grp("No-member events in Others (Q5)", "nomember", [["", "No (today)"], ["include", "Yes (option a)"]], NOMEMBER_IN ? "include" : "") +
  grp("Keyword box (Q1, S1)", "keyword", [["", "Off"], ["1", "On"]], KEYWORD ? "1" : "") + grp("Mockup notes", "notes", [["", "On"], ["0", "Off"]], NOTES ? "" : "0") + "</div></div>";
}
document.body.insertAdjacentHTML("beforeend", pvHtml());
$("#pvb").addEventListener("click", function () { var o = $("#pv").classList.toggle("open"); this.setAttribute("aria-expanded", o); });

if (S.state === "" || S.state === "down") ensureFirst();
if (S.state === "" && S.view === "list" && !S.pages.length && !S.more) { /* zero results straight from the URL */ }
render();
window.__hx = { S: S, moreDay: moreDay, rows: rows, ALL: ALL };
})();
