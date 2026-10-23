/* History search and filters, on the canonical event model (docs/knowledge/history-event-model.md, docs/knowledge/history-search.md).
   Everything this screen reads comes from GET /api/history rows (model.js stands in for it): occurred_at, actor, product, kind (area = first segment), kind_v, entity.
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
 back: '<path d="M15 6l-6 6 6 6"/>', tag: '<path d="M4 12.5V5h7.5l8 8-7.5 7.5z"/><circle cx="8.5" cy="9" r="1"/>'
};
var ic = function (n, c) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (c ? ' class="' + c + '"' : "") + ">" + (P[n] || "") + "</svg>"; };

/* ---------- state: URL parameters are the mockup's way in ---------- */
var ME = Q.get("as") === "sam" ? "sam" : "arjan", HOUSE = Q.get("household") === "more" ? "more" : "two";
var MEID = HM.IDS[ME], OTHERS = Object.keys(HM.IDS).filter(function (k) { return k !== ME && (HOUSE === "more" || k !== "priya"); });
var ALL = HM.build({ house: HOUSE });
var TPL = ["loading", "none"].indexOf(Q.get("tpl")) >= 0 ? Q.get("tpl") : "ready"; HM.setTplMode(TPL);
/* SEARCH: Preview B (free text over the days loaded; owner asked to see it, Q1). MULTI: Preview for Q2 (several topics at once; needs a Platform change; undecided). */
var WAY = { sentence: "b", quick: "c", tap: "d", cascade: "" }[Q.get("way") === null ? "tap" : Q.get("way")] || ""; /* the filter pattern (owner, voice, 24 Oct 2026): default (no way parameter) = d on phone and desktop; way=cascade = A (baseline), b = Sentence, c = Quick answers, d = Tap to filter */
var NOTES = Q.get("notes") !== "0", SEARCH = Q.get("search") === "text", MULTI = Q.get("choices") === "several";
var LAST = { sat: { iso: HM.utc(1, 17, 30), t: "Sat 17 Oct, 5:30 pm" }, wed: { iso: HM.utc(4, 17, 30), t: "Wed 14 Oct, 5:30 pm" } }[Q.get("last") === "wed" ? "wed" : "sat"];
var CAP = 3; /* H6: the catch-up is at most three calendar days that each had a change. The screen's rule, not the API's. */
var RANGES = [["today", "Today"], ["week", "Last 7 days"], ["month", "Last 30 days"]], DEFAULT_I = 1; /* the windows the rotary steps through; off reads "Anytime" */
var TAB0 = Q.get("tab") === "other" ? (HOUSE === "two" ? "person" : "others") : Q.get("tab");
function newF() { return { on: false, i: DEFAULT_I, areas: [], kind: "", day: "" }; }
var S = {
 view: Q.get("view") === "list" ? "list" : "catch", tab: ["mine", "person", "others"].indexOf(TAB0) >= 0 && !(TAB0 === "person" && HOUSE !== "two") ? TAB0 : "mine", panel: Q.get("filters") === "1" && !WAY ? "filters" : "",
 f: newF(), /* Date (from, and to for one day) and Topic (area, or kind): the only two filters. Who is the tab (actor). */
 who: "" /* a member id narrower than the Others tab (actor=<id>); only set by tapping a person in Others when the household has more than two */, pop: "" /* the open picker in B and D: who | what | when */, prev: null /* the state before the last tap in D, for Undo */, entLabel: "", entProduct: "kitchie",
 entity: Q.get("entity") || "" /* "item:itm_rice": in-context, from an item. The API wants the product with it, so it is sent but never shown as a filter. */, kw: "", state: Q.get("state") || "",
 pages: [], more: true, afterDay: null, open: null, seen: null, ticked: false, person: ""
};
(function () { /* URL: when=today|week|month, area=pantry (or pantry,recipe with choices=several), kind=pantry.moved */
 var wi = RANGES.map(function (r) { return r[0]; }).indexOf(Q.get("when")); if (wi >= 0) { S.f.on = true; S.f.i = wi; }
 var k = Q.get("kind"); if (k) { S.f.kind = k; S.f.areas = [k.split(".")[0]]; }
 else if (Q.get("area")) S.f.areas = Q.get("area").split(",").filter(function (a) { return HM.REGISTRY.areas.some(function (x) { return x.id === a; }); }).slice(0, MULTI ? 9 : 1);
})();
if (S.state === "" && Q.get("open")) S.open = +Q.get("open");

var wide = function () { return window.matchMedia("(min-width:1024px)").matches; };
function otherId() { return HM.IDS[OTHERS[0]]; }
function otherName() { return HM.NAMES[otherId()]; }
function isNull(e) { return e.actor === null; }
function isFormer(e) { return e.actor !== null && e.actor.name === null; } /* a removed member: the id stays on old events, the name is erased after a week */
function whoName(e) { if (isNull(e)) return "Someone"; if (e.actor.member === MEID) return "You"; return isFormer(e) ? "A former member" : e.actor.name; }
function areaOf(e) { return e.kind.split(".")[0]; }
function areaLabel(id) { var a = HM.REGISTRY.areas.filter(function (x) { return x.id === id; })[0]; return a ? a.label : id; }
function kindLabel(k) { var x = HM.REGISTRY.kinds.filter(function (y) { return y.kind === k; })[0]; return x ? x.label : k; }

/* ---------- the query: only parameters GET /api/history accepts. Who is the tab (actor); Date is from; Topic is area or kind. ---------- */
function startOfTodayISO() { return HM.utc(0, 0, 0); }
function params(forCatch) {
 var q = {};
 if (!forCatch) { if (S.tab === "mine") q.actor = "me"; else if (S.tab === "person") q.actor = otherId(); else if (S.who) q.actor = S.who; else q.actorNot = MEID; /* Others = actor=others: everyone but me, and events with no member */ }
 if (S.f.kind) q.kind = S.f.kind; else if (S.f.areas.length) q.area = S.f.areas.length === 1 ? S.f.areas[0] : S.f.areas.slice();
 if (S.entity) { var e = S.entity.split(":"); q.entityType = e[0]; q.entityId = e[1]; q.product = S.entProduct; /* the API wants the product with an entity; it is sent, never shown */ }
 if (S.f.on && S.f.day) { var b = HM.dayBounds(S.f.day); q.from = b[0]; q.to = b[1]; }
 else if (S.f.on) { var w = RANGES[S.f.i][0]; q.from = w === "today" ? startOfTodayISO() : new Date(HM.NOW - (w === "week" ? 7 : 30) * 86400000).toISOString(); }
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
function byTab(e, tab) { return tab === "mine" ? (e.actor !== null && e.actor.member === MEID) : tab === "person" ? (e.actor !== null && e.actor.member === otherId()) : !(e.actor !== null && e.actor.member === MEID); }
/* catch-up: the three days are loaded without an actor (one call), then split by actor in the client */
function catchRows() { return rows().filter(function (e) { return (!S.who || (e.actor !== null && e.actor.member === S.who)) && (!S.person || (S.person === "others" ? (isNull(e) || isFormer(e)) : e.actor !== null && e.actor.member === S.person)); }); }
function tabRows() { return catchRows().filter(function (e) { return byTab(e, S.tab); }); }
function viewRows() { var L = S.view === "catch" ? tabRows() : rows(); if (S.kw) { var k = S.kw.toLowerCase(); L = L.filter(function (e) { var r = HM.render(e); return ((r.state === "ok" || r.state === "generic") ? r.text : "").toLowerCase().indexOf(k) >= 0; }); } return L; }

/* ---------- rows ---------- */
function avatar(e, small) {
 var cls = "av" + (small ? " sm" : "") + (e.actor !== null && e.actor.member === MEID ? " me" : "");
 if (isNull(e)) return '<span class="' + cls + ' none" aria-hidden="true">' + ic("link", "sm") + "</span>";
 if (isFormer(e)) return '<span class="' + cls + ' none" aria-hidden="true">' + ic("user", "sm") + "</span>";
 return '<span class="' + cls + '" aria-hidden="true">' + esc(e.actor.name.charAt(0)) + "</span>";
}
function evRow(e, isNew) {
 var r = HM.render(e), who = whoName(e), line;
 if (r.state === "ok") line = '<b class="wh">' + esc(who) + '</b><span class="sep"> · </span><span class="ln">' + r.html + "</span>";
 else if (r.state === "generic") line = '<span class="ln gen"><b class="wh">' + esc(who) + "</b> " + r.html + "</span>";
 else line = '<b class="wh">' + esc(who) + '</b><span class="skbody" aria-label="Loading this row"><i></i></span>';
 return '<button type="button" class="ev' + (isNew ? " new" : "") + '" data-seq="' + e.seq + '" aria-haspopup="dialog"' + (S.open === e.seq ? ' aria-current="true"' : "") + ">" + avatar(e, 1) +
  '<div class="tx">' + line + '<div class="meta"><span>' + esc(areaLabel(areaOf(e))) + "</span></div></div><time datetime=\"" + e.occurred_at + '">' + esc(HM.timeOf(e.occurred_at)) + "</time></button>";
}
/* D (Tap to filter): the row is a group of separate targets instead of one button: the avatar (a person, only where it narrows), the line (opens the change),
   and a handle line (topic, kind, and the thing itself). The time stays plain text. A handle whose filter is already on is not drawn, so the row gets quieter as the list narrows. */
function personTarget(e) { /* a member id, only where tapping narrows the list: never on an event with no member or a removed member (no single person to filter by), never on a row already in that person's view */
 if (e.actor === null || e.actor.name === null) return "";
 var id = e.actor.member;
 if (id === MEID) return S.tab === "mine" ? "" : id;
 if (HOUSE === "two" && id === otherId()) return S.tab === "person" ? "" : id;
 return S.who === id ? "" : id;
}
function entText(e, r) { return r && r.state === "ok" && r.entity ? r.entity : "This " + e.entity.type.replace(/_/g, " "); }
function handle(f, label, aria, icon, extra) { return '<button type="button" class="hd" data-f="' + esc(f) + '"' + (extra || "") + ' aria-label="' + esc(aria) + '">' + (icon ? ic(icon, "sm") : "") + "<span>" + esc(label) + "</span></button>"; }
function handlesFor(e, r) {
 var hs = [], ar = areaOf(e), ks = HM.REGISTRY.kinds.filter(function (k) { return k.kind.indexOf(ar + ".") === 0; });
 var kindKnown = ks.some(function (k) { return k.kind === e.kind; });
 if (!S.f.kind && S.f.areas.indexOf(ar) < 0) hs.push(handle("area:" + ar, areaLabel(ar), "Show only " + areaLabel(ar), ""));
 if (!S.f.kind && kindKnown && ks.length > 1) hs.push(handle("kind:" + e.kind, kindLabel(e.kind), "Show only " + kindLabel(e.kind) + " in " + areaLabel(ar), ""));
 if (e.entity.id && S.entity !== e.entity.type + ":" + e.entity.id) { /* entity_type + entity_id: both are guaranteed on every row, but the id may be null (kinds about no single thing), so there is no handle then */
  var lab = entText(e, r); hs.push(handle("entity:" + e.entity.type + ":" + e.entity.id, lab, "Show only changes to " + lab + " (matched by its id)", "tag", ' data-product="' + esc(e.product) + '" data-label="' + esc(lab) + '"'));
 }
 return hs.join("");
}
function evRowD(e, isNew) {
 var r = HM.render(e), who = whoName(e), line;
 if (r.state === "ok") line = '<b class="wh">' + esc(who) + '</b><span class="sep"> · </span><span class="ln">' + r.html + "</span>";
 else if (r.state === "generic") line = '<span class="ln gen"><b class="wh">' + esc(who) + "</b> " + r.html + "</span>";
 else line = '<b class="wh">' + esc(who) + '</b><span class="skbody" aria-label="Loading this row"><i></i></span>';
 var pid = personTarget(e), hs = r.state === "loading" ? "" : handlesFor(e, r);
 var av = pid ? '<button type="button" class="avb" data-f="who:' + pid + '" aria-label="Show only changes by ' + esc(e.actor.name) + '">' + avatar(e, 1) + "</button>" : '<span class="avb">' + avatar(e, 1) + "</span>";
 return '<div class="ev dv' + (isNew ? " new" : "") + '">' + av + '<div class="tx"><button type="button" class="evo" data-seq="' + e.seq + '" aria-haspopup="dialog"' + (S.open === e.seq ? ' aria-current="true"' : "") + '><span>' + line + "</span></button>" +
  (hs ? '<div class="meta hds">' + hs + "</div>" : "") + '</div><time datetime="' + e.occurred_at + '">' + esc(HM.timeOf(e.occurred_at)) + "</time></div>";
}
function dayBlock(page, L) {
 var evs = L.filter(function (e) { return HM.dayKey(e.occurred_at) === page.day; });
 if (!evs.length) return "";
 var lab = HM.dayLabel(page.day), sub = lab.indexOf(" ") > 0 ? "" : " <small>" + esc(HM.longDay(page.day + "T12:00:00.000Z")) + "</small>";
 var head = WAY === "d" && !S.f.day ? '<button type="button" class="dl" data-f="day:' + page.day + '" aria-label="Show only ' + esc(lab) + (sub ? "" : ", " + esc(HM.longDay(page.day + "T12:00:00.000Z"))) + '">' + esc(lab) + sub + "</button>" : esc(lab) + sub;
 return '<section class="day" aria-label="' + esc(lab) + '"><div class="lbl">' + head + '</div><div class="pg">' + evs.map(function (e) { return (WAY === "d" ? evRowD : evRow)(e, S.view === "catch"); }).join("") + "</div></section>";
}
function skeleton() { var r = '<div class="sk"><span class="av"></span><div><i></i><i class="s"></i></div></div>'; return '<section class="day"><div class="sklbl lbl"><i></i></div><div class="pg">' + r + r + r + "</div></section>"; }

/* ---------- the quiet filter: Date (the same rotary row as Pantry's Filters sheet) and Topic ---------- */
function dateLabel() { return S.f.on && S.f.day ? HM.longDay(S.f.day + "T12:00:00.000Z") : S.f.on ? RANGES[S.f.i][1] : "Anytime"; }
function topicName() {
 if (S.f.kind) return kindLabel(S.f.kind) + " in " + areaLabel(S.f.kind.split(".")[0]);
 return S.f.areas.length ? S.f.areas.map(areaLabel).join(", ") : "All topics";
}
function hasFilters() { return S.f.on || S.f.areas.length > 0 || !!S.f.kind || !!S.entity || !!S.who; }
function summary() { return (S.entity ? "This item · " : "") + dateLabel() + " · " + topicName(); }
/* The status row, copied from Pantry's Filters sheet (flows/household/app.js srow): a toggle on the left, the rotary on the right. */
function rotRow() {
 var on = S.f.on, drag = ro && ro.moved;
 return '<div class="strow rotrow' + (on ? " on" : "") + (drag ? " drag" : "") + '" data-fk="when"><button type="button" class="stt" data-dt="toggle" role="checkbox" aria-checked="' + on + '"><span class="dotc" aria-hidden="true">' + (on ? ic("check", "sm") : "") + '</span><span class="lbl2">' + (drag ? esc(dateLabel()) : "Date") +
  '</span></button><button type="button" class="rot" data-rot="when" aria-label="Date: ' + esc(dateLabel()) + '. Drag up or down, or tap, to change"><span class="rv">' + esc(dateLabel()) + '</span><span class="rar" aria-hidden="true"><i>▴</i><i>▾</i></span></button></div>';
}
function chip(cls, opt, label, on) {
 return cls === "mc" ? '<button type="button" class="mc' + (on ? " on" : "") + '" aria-pressed="' + on + '" data-opt="' + opt + '"><span class="mi">' + (on ? ic("check", "sm") : "") + "</span>" + esc(label) + "</button>"
  : '<button type="button" class="fpl' + (on ? " on" : "") + '" aria-pressed="' + on + '" data-opt="' + opt + '">' + esc(label) + "</button>";
}
function topicSet(cls, any) { /* choices come from the registry (/api/history/kinds, designed, not built); B's picker adds an Anything chip that clears Topic */
 var wrap = cls === "mc" ? "mcs" : "fchips", out = '<div class="' + wrap + '" role="group" aria-label="Topic">';
 if (any) out += chip(cls, "topic|clear", "Anything", !S.f.areas.length && !S.f.kind);
 HM.REGISTRY.areas.forEach(function (a) { out += chip(cls, "topic|area:" + a.id, a.label, S.f.areas.indexOf(a.id) >= 0); });
 out += "</div>";
 if (!MULTI && S.f.areas.length === 1) { /* a finer step only where an area has several kinds */
  var ks = HM.REGISTRY.kinds.filter(function (k) { return k.kind.indexOf(S.f.areas[0] + ".") === 0; });
  if (ks.length > 1) out += '<p class="ksub">In ' + esc(areaLabel(S.f.areas[0])) + '</p><div class="' + wrap + '" role="group" aria-label="Kind">' + ks.map(function (k) { return chip(cls, "topic|kind:" + k.kind, k.label, S.f.kind === k.kind); }).join("") + "</div>";
 }
 return out;
}
var WAYNOTE = {
 b: "<b>B: Sentence.</b> The line is the filter: tap a word to change that part (a short sheet on a phone, a small popover on desktop). Who is the tab, so the tabs stay as they are; what is <code>area</code> or <code>kind</code>; when is the Pantry rotary. No panels. Free text stays the Preview B-search.",
 c: "<b>C: Quick answers.</b> Each chip is a partial filter made only of real model filters (<code>actor</code>, <code>kind</code>, <code>from</code>). One tap sets the parts it names; a second chip adds its parts over the first (a later When replaces an earlier one); tapping a chip that is on clears just its parts; the line says what is on. No cascade.",
 d: "<b>D: Tap to filter.</b> Tap a name, a topic or kind, a day label, or the thing itself. A person tap only appears where it narrows (in Others). The thing is <code>entity_type</code> + <code>entity_id</code>: the model guarantees both on every row but the id can be null (such rows get no handle), and a name is never filtered on, only its id. The line shows what is on; each part clears with one tap; Undo is in the toast."
};
function ann(t) { return NOTES ? '<aside class="ann"><b>Mockup note</b> ' + t + "</aside>" : ""; }
function filtersBody(cls) {
 return '<div class="strows">' + rotRow() + '</div><h3 class="fh">Topic' + (MULTI ? " <small>pick any</small>" : "") + "</h3>" + topicSet(cls) +
  ann("Date sets <code>from</code> (Today, 7 or 30 days); off reads Anytime. Topic sets <code>kind</code>, whose first part is the area; choosing a kind needs its area first. Who is the tab (<code>actor</code>). There is no app, touches or where control. Days are cut in this device’s time zone (undecided). " + (MULTI ? "Preview: several topics at once needs Platform to accept a list per parameter (undecided)." : "One choice at a time; whether to allow several is undecided."));
}
function filtersPanel() { /* desktop lane */
 return '<div class="fp"><div class="fph"><div><h2>Filter</h2><p>' + esc(summary()) + '</p></div></div><div class="fpb">' + filtersBody("fpl") +
  '<div class="acts2"><button type="button" class="sec2" data-clear>Clear</button></div></div></div>';
}
function sheetHtml() { /* phone: a short bottom sheet, the same one-page body */
 return '<div class="sheet-dim" data-dim><div class="sheet fsheet" role="dialog" aria-modal="true" aria-label="Filter" data-keep><div class="grab"></div><div class="fhead"><div class="ftabs"><button type="button" class="on">Filter</button></div><button type="button" class="ib" data-closepanel aria-label="Close">' + ic("x") + "</button></div>" +
  '<div class="fbody">' + filtersBody("mc") + '</div><div class="ffoot"><button type="button" class="pri wide" data-closepanel>Done</button><div class="flinks"><button type="button" class="link" data-clear>Clear</button><span></span></div></div></div></div>';
}
/* ---------- B, C and D: the filter is a sentence (owner, voice, 24 Oct 2026). Each part reads one real model filter: who = actor (the tab), what = area or kind, when = from (and to for one day). ---------- */
function whoText() { return S.who ? HM.NAMES[S.who] : S.tab === "mine" ? "You" : S.tab === "person" ? otherName() : "Others"; }
function whatText() { return S.f.areas.length || S.f.kind ? topicName() : "anything"; }
function whenText() { return S.f.on ? dateLabel() : "anytime"; }
function entityText() { return "just " + (S.entLabel || "this " + S.entity.split(":")[0].replace(/_/g, " ")); }
function sentenceText() { return [whoText(), whatText(), whenText()].concat(S.entity ? [entityText()] : []).join(" · "); }
var DOT = '<span class="sd" aria-hidden="true">·</span>';
function seg(h) { return '<span class="sg">' + DOT + h + "</span>"; } /* the dot travels with the word after it, so a wrapped line never ends on a dot */
function clearX(label) { return '<button type="button" class="ib qfx" data-clear aria-label="' + (label || "Clear the filter") + '">' + ic("x", "sm") + "</button>"; }
/* B: the line is the state; tap a word to change that part */
function word(k, t, on) { return '<button type="button" class="sw' + (on ? " on" : "") + '" data-pick="' + k + '" aria-haspopup="dialog" aria-expanded="' + (S.pop === k) + '">' + esc(t) + "</button>"; }
function lineB() {
 return '<div class="sline" role="group" aria-label="Filter. Now: ' + esc(sentenceText()) + '">' + '<span class="sl">' + word("who", whoText(), true) + seg(word("what", whatText(), S.f.areas.length || S.f.kind)) + seg(word("when", whenText(), S.f.on)) +
  (S.entity ? seg(pill("entity", entityText())) : "") + (hasFilters() ? clearX() : "") + "</span></div>";
}
/* D: only what is on is a pill, and each pill clears with one tap. The person part is the tab (not clearable: the tabs stay as they are); a narrower person (Others, three or more people) is a pill. */
function pill(k, t) { return '<button type="button" class="ap" data-unset="' + k + '" aria-label="' + esc(t) + ". Tap to clear" + '"><span>' + esc(t) + "</span>" + ic("x", "sm") + "</button>"; }
function lineD() {
 var on = S.f.areas.length || S.f.kind, parts = [S.who ? pill("who", whoText()) : '<span class="sw plain">' + esc(whoText()) + "</span>"];
 parts.push(on ? pill("what", whatText()) : '<span class="sw plain off">anything</span>');
 parts.push(S.f.on ? '<span class="ap split"><button type="button" class="apt" data-pick="when" aria-haspopup="dialog" aria-label="Date: ' + esc(dateLabel()) + '. Change">' + esc(dateLabel()) + '</button><button type="button" class="apx" data-unset="when" aria-label="Clear the date">' + ic("x", "sm") + "</button></span>" : word("when", "anytime", false));
 if (S.entity) parts.push(pill("entity", entityText()));
 return '<div class="sline" role="group" aria-label="Filter. Now: ' + esc(sentenceText()) + '">' + parts[0] + parts.slice(1).map(seg).join("") + "</div>" + (hasFilters() ? "" : '<p class="hint">Tap a name, a topic or a day in the list to narrow it.</p>');
}
/* C: ready-made answers. Each chip is a partial filter built only from real model filters and sets the parts it names; a second chip adds its parts over the first (a later When replaces an earlier one); tapping a chip that is on clears just its parts. */
function chips() {
 var c = [{ id: "mine-today", t: "Mine today", tab: "mine", when: 0 }, { id: "removed-week", t: "Removed this week", kind: "pantry.removed", when: 1 }, { id: "moved-week", t: "Moved this week", kind: "pantry.moved", when: 1 }];
 if (HOUSE === "two") c.push({ id: "by-person", t: "By " + otherName(), tab: "person" });
 c.push({ id: "by-others", t: "By others", tab: "others" });
 return c;
}
function chipOn(c) { return (c.tab === undefined || (S.tab === c.tab && !S.who)) && (c.kind === undefined || S.f.kind === c.kind) && (c.when === undefined || (S.f.on && !S.f.day && S.f.i === c.when)); }
function chipTap(c) {
 if (chipOn(c)) { if (c.tab !== undefined) { S.tab = "mine"; S.who = ""; } if (c.kind) { S.f.kind = ""; S.f.areas = []; } if (c.when !== undefined) { S.f.on = false; S.f.day = ""; } }
 else { if (c.tab !== undefined) { S.tab = c.tab; S.who = ""; } if (c.kind) { S.f.kind = c.kind; S.f.areas = [c.kind.split(".")[0]]; } if (c.when !== undefined) { S.f.on = true; S.f.i = c.when; S.f.day = ""; } }
 S.view = "list"; S.person = ""; S.open = null; ensureFirst(); render();
}
function lineC() {
 return '<div class="qstrip" role="group" aria-label="Quick answers">' + chips().map(function (c) { var on = chipOn(c); return '<button type="button" class="qc' + (on ? " on" : "") + '" aria-pressed="' + on + '" data-chip="' + c.id + '">' + esc(c.t) + "</button>"; }).join("") + "</div>" +
  '<div class="sline ro" role="status" aria-label="Filter. Now: ' + esc(sentenceText()) + '"><span class="sl"><span class="sw plain">' + esc(whoText()) + "</span>" + seg('<span class="sw plain' + (S.f.areas.length || S.f.kind ? "" : " off") + '">' + esc(whatText()) + "</span>") + seg('<span class="sw plain' + (S.f.on ? "" : " off") + '">' + esc(whenText()) + "</span>") + (S.entity ? seg(pill("entity", entityText())) : "") + (hasFilters() ? clearX() : "") + "</span></div>";
}
function wayLine() { return WAY === "b" ? lineB() : WAY === "c" ? lineC() : lineD(); }
/* the pickers: a short bottom sheet on a phone, a small popover under the line on desktop */
function popBody(k) {
 var cls = wide() ? "fpl" : "mc", wrap = wide() ? "fchips" : "mcs";
 if (k === "who") {
  var T = [["mine", "You"]]; if (HOUSE === "two") T.push(["person", otherName()]); T.push(["others", "Others"]);
  return '<div class="' + wrap + '" role="group" aria-label="Whose">' + T.map(function (t) { var on = S.tab === t[0] && !S.who; return '<button type="button" class="' + cls + (on ? " on" : "") + '" aria-pressed="' + on + '" data-who="' + t[0] + '">' + (cls === "mc" ? '<span class="mi">' + (on ? ic("check", "sm") : "") + "</span>" : "") + esc(t[1]) + "</button>"; }).join("") + "</div>" +
   ann("Who is the tabs’ <code>actor</code> (me, the other person, others). The same state, so the tabs below stay as they are. There is no “anyone”: a list is always someone’s.");
 }
 if (k === "what") return topicSet(cls, true) + ann("What is <code>area</code>, or <code>kind</code> once an area is picked. One choice at a time (Q2 undecided).");
 return '<div class="strows">' + rotRow() + "</div>" + ann("When is <code>from</code> (Today, 7 or 30 days) or, for one day, <code>from</code> and <code>to</code>. The Pantry rotary, unchanged.");
}
function popHtml() {
 if (!WAY || !S.pop || S.view === "catch") return "";
 var title = { who: "Who", what: "What", when: "When" }[S.pop];
 if (!wide()) return '<div class="sheet-dim" data-dim><div class="sheet fsheet psheet" role="dialog" aria-modal="true" aria-label="' + title + '" data-keep><div class="grab"></div><div class="fhead"><div class="ftabs"><button type="button" class="on">' + title + '</button></div><button type="button" class="ib" data-closepop aria-label="Close">' + ic("x") + '</button></div><div class="fbody">' + popBody(S.pop) + '</div><div class="ffoot"><button type="button" class="pri wide" data-closepop>Done</button></div></div></div>';
 return '<div class="pdim" data-dim></div><div class="pop2" role="dialog" aria-label="' + title + '"><div class="fbody">' + popBody(S.pop) + "</div></div>";
}
function qlineHtml() { /* phone only: one quiet line under the tabs; the lane carries this on desktop */
 if (S.view === "catch") return "";
 if (WAY) return wayLine();
 if (wide()) return "";
 var t = summary();
 return '<div class="qline"><button type="button" class="qfb" data-filters aria-label="Filter. Now: ' + esc(t) + '">' + ic("sliders", "sm") + "<span>" + esc(t) + "</span></button>" + (hasFilters() ? '<button type="button" class="ib qfx" data-clear aria-label="Clear the filter">' + ic("x", "sm") + "</button>" : "") + "</div>";
}

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
 var seen = [], lab = {};
 all.forEach(function (e) { var k = isNull(e) || isFormer(e) ? "others" : e.actor.member; if (seen.indexOf(k) < 0) seen.push(k); lab[k] = k === "others" ? "Others" : k === MEID ? "you" : e.actor.name; });
 var link = function (k) { return S.person ? esc(lab[k]) : '<button type="button" class="plink2" data-person="' + k + '">' + esc(lab[k]) + "</button>"; };
 var by = seen.length && !S.person ? '<p class="sum">By ' + seen.map(link).join(" · ") + "</p>" : "";
 var sum = esc(LAST.t) + (S.capped ? " · the last 3 days with activity" : "");
 var bar = S.person ? '<div class="pbar"><span class="pt">Only changes by ' + esc(S.person === "others" ? "others" : S.person === MEID ? "you" : HM.NAMES[S.person]) + ' in this catch-up</span><button type="button" class="lnk2" data-person="">Back to the full catch-up</button></div>' : "";
 return '<section class="catch" aria-label="Since you were last here"><div class="chead"><h2>' + ic("bell") + "Since you were last here</h2>" + tick + x + '</div><p class="sum">' + sum + "</p>" + by + bar +
  ann("No counts: the history can say what changed, not how many. The old per-person sentence, action button and “touches you” mark are gone: Kitchie does not record who an event affects for now. Others means events with no member (a shopping link, an assistant link, the system) and past events by someone who has left.") + "</section>";
}

/* ---------- empty, zero, down ---------- */
function emptyHtml(kind) {
 var t = []; if (S.f.on) t.push(dateLabel()); if (S.f.areas.length || S.f.kind) t.push(topicName());
 if (S.view === "list" || kind === "zero") t.unshift(S.tab === "mine" ? "You" : S.tab === "person" ? otherName() : "Others");
 if (kind === "down") return '<div class="empty"><div class="big">' + ic("clock") + "</div><h2>History is not reachable</h2><p>This is the feed being down, not an empty history. Nothing you did is lost.</p><div class=\"acts\"><button type=\"button\" class=\"pri\" data-retry>Try again</button></div></div>";
 if (kind === "empty") return '<div class="empty"><div class="big">' + ic("clock") + "</div><h2>A quiet kitchen so far</h2><p>Changes you and the household make will show here.</p></div>";
 var more = !(S.f.on && S.f.i === 2) ? '<button type="button" class="pri" data-month>Look back 30 days</button>' : "";
 return '<div class="empty"><div class="big">' + ic("search") + "</div><h2>No matches</h2><p>" + (S.kw ? "Nothing in the days loaded says “" + esc(S.kw) + "”." : "Nothing on record for " + esc(t.join(" · ")) + ".") + '</p><div class="acts">' + more + '<button type="button" class="sec2" data-clear>Clear filter</button></div></div>';
}
function feed() {
 if (S.state === "loading") return skeleton();
 if (S.state === "empty") return emptyHtml("empty");
 if (S.state === "down") return emptyHtml("down");
 var L = viewRows();
 if (S.view === "catch") {
  if (!rows().length) return "";
  if (!L.length) return '<div class="empty slim"><h2>' + (S.tab === "mine" ? "Nothing from you" : "Nothing from " + esc(S.tab === "person" ? otherName() : "others")) + " in this catch-up</h2></div>" + othersNote();
  return S.pages.map(function (p) { return dayBlock(p, L); }).join("") + othersNote() + catchEnd();
 }
 if (!L.length && !S.more) return emptyHtml("zero");
 return S.pages.map(function (p) { return dayBlock(p, L); }).join("") + othersNote() + (S.more ? '<div class="sentinel" id="sentinel" role="status"><span class="dots" aria-hidden="true"></span>Loading one more day with activity</div>' : '<p class="note">That is everything on record.</p>');
}
function catchEnd() { return S.capped ? '<div class="more cap"><p class="capline">' + ic("clock", "sm") + " Showing the last 3 days with activity. Search for older.</p><button type=\"button\" class=\"sec2\" data-closecatch>Pick a filter</button></div>" : ""; }
function othersNote() { /* Q4 (owner, voice, 23 Oct 2026): nothing is hidden; these are under Others */
 if (S.tab !== "others") return "";
 return ann("Others holds every change that is not yours, and the ones with no member: a shopping link, a shared assistant link, the system (read “Someone”), and changes by a member who has since left (read “A former member”; their name is erased after a week and History is anonymised). <code>actor=others</code> returning them is a Platform change, listed in the PR.");
}

/* ---------- page ---------- */
function railHtml() { var it = [["home", "Home"], ["jar", "Pantry"], ["cal", "Plan"], ["book", "Recipes"], ["cart", "Shopping"], ["clock", "History"]]; return '<div class="brand">Kitchie</div>' + it.map(function (i) { return '<a href="#" data-rail aria-label="' + i[1] + '"' + (i[1] === "History" ? ' aria-current="page"' : "") + ">" + ic(i[0]) + "<span>" + i[1] + "</span></a>"; }).join(""); }
function tabsHtml() { /* no counts: not on a tab, not on a button */
 var T = [["mine", "My activity", ic("user", "sm")]]; if (HOUSE === "two") T.push(["person", otherName(), ic("user", "sm")]); T.push(["others", "Others", ic("users", "sm")]);
 return '<div class="hx-tabs" role="tablist" aria-label="Whose activity">' + T.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (S.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[2] + t[1] + "</button>"; }).join("") + "</div>";
}
function searchBox() { /* Preview B: free text over the days loaded (S1). Not the default design (Q1). */
 return SEARCH ? '<div class="kw"><label class="kwl"><span class="kwi">' + ic("search", "sm") + '</span><input type="search" id="kw" value="' + esc(S.kw) + '" placeholder="Search the days loaded" autocomplete="off" aria-label="Search the days loaded only"></label><span class="chip prop">Comparison · Q1 · B</span></div><p class="kwnote">' + ic("info", "sm") + " Searches only the days loaded so far, not the whole history. Older days load as you scroll." + "</p>" +
  ann("Preview B. Not in the default design (owner, voice, 23 Oct 2026). The API has no text parameter, so this is the one reading that needs nothing from Platform: the client matches the template-rendered text of the days it has loaded (S1). It cannot find something older that has not loaded yet, which is why it says so. Esc clears it.") : "";
}
function lane() {
 if (S.open !== null && find(S.open)) return detailPanel(find(S.open), false);
 if (S.view === "catch" && S.panel !== "filters") return '<div class="grab"></div>' + catchCard();
 if (WAY) return '<div class="lane0"><h2>This change</h2><p>Open a change to see it here.</p></div>' + ann(WAYNOTE[WAY]); /* B, C and D have no filter panel: the filter is the line above the list */
 return filtersPanel();
}
function render() {
 var root = $("#hx"), showFilterBtn = wide() && S.view === "catch" && !WAY;
 var head = '<header class="hx-head"><h1>History</h1>' + (showFilterBtn ? '<button type="button" class="ib' + (S.panel === "filters" ? " on" : "") + '" data-filters aria-label="Filter (F)">' + ic("sliders") + "</button>" : "") + "</header>";
 root.innerHTML = '<nav class="hx-rail" aria-label="Main">' + railHtml() + "</nav>" +
  '<main class="hx-main">' + head + tabsHtml() + (NOTES ? ann("Two jobs: catch up on what changed since you were last here, and find who did something and when after it looks wrong (the milk vanished), often knowing only roughly when and what. So the screen carries Date and Topic, and the tab says whose. Fields read: <code>occurred_at</code>, <code>actor</code>, <code>kind</code> (area is its first part), <code>kind_v</code>, <code>entity</code>, <code>product</code> (on the detail, never a filter). It never reads <code>payload</code>; text comes from the kind’s template.") : "") +
  (S.view === "catch" && !S.state ? '<div class="phonecatch">' + catchCard() + "</div>" : "") + searchBox() + '<div class="qwrap"><div id="qline">' + qlineHtml() + '</div><div id="popslot">' + popHtml() + '</div></div>' + (WAY && !wide() && S.view !== "catch" ? ann(WAYNOTE[WAY]) : "") + '<div id="feed">' + feed() + "</div></main>" +
  '<aside class="hx-panel" id="panel" aria-label="' + (S.open !== null ? "This change" : S.view === "catch" && S.panel !== "filters" ? "Catch-up" : WAY ? "Details" : "Filter") + '">' + (wide() ? lane() : "") + "</aside>" +
  (!wide() && S.panel === "filters" && S.open === null ? sheetHtml() : "") +
  (!wide() && S.open !== null && find(S.open) ? '<div class="sheet-dim" data-dim><div class="sheet dsheet" role="dialog" aria-modal="true" aria-label="This change" data-keep><div class="grab"></div><div class="fbody">' + detailPanel(find(S.open), true) + "</div></div></div>" : "") +
  '<div class="toast" id="toast" hidden></div>';
 watch();
 var pv = $(".pv"); if (pv) pv.style.display = (!wide() && (S.panel === "filters" || S.open !== null || S.pop)) ? "none" : "";
}
var tmr;
function toast(t, undo) { var el = $("#toast"); if (!el) return; el.innerHTML = "<span>" + esc(t) + "</span>" + (undo ? '<button type="button" class="tundo" data-undo>Undo</button>' : ""); el.classList.toggle("withundo", !!undo); el.hidden = false; clearTimeout(tmr); tmr = setTimeout(function () { el.hidden = true; }, undo ? 6000 : 2400); }
function refreshFeed() { var f = $("#feed"); if (f) { f.innerHTML = feed(); watch(); } var tb = $(".hx-tabs"); if (tb) tb.outerHTML = tabsHtml(); }
var io;
function watch() {
 if (io) io.disconnect();
 var s = $("#sentinel"); if (!s || !("IntersectionObserver" in window)) return;
 io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); setTimeout(moreDay, 350); } }, { rootMargin: "200px" }); io.observe(s);
}
function moreDay() { if (S.view !== "list" || !S.more) return; loadDay(); refreshFeed(); }
function setView(v) { S.view = v; S.person = ""; S.open = null; ensureFirst(); }

/* ---------- the date rotary: Pantry's, copied (flows/household/app.js, "status rotary").
   What Pantry has, and so what is here: drag up or down on the value, scroll over it, or tap to step through the windows; a light vibration on each step where the device allows it;
   while dragging, the row's label shows the window live. Pantry has NO press-and-hold on the rotary (verified in the code), so there is none here. Added for access only: arrow keys and Enter. ---------- */
var ro = null;
function rowRefresh() { /* the in-place update Pantry's refreshSheet does, so a drag is not interrupted by a redraw */
 $$(".rotrow").forEach(function (r) {
  var on = S.f.on, drag = !!(ro && ro.moved);
  r.classList.toggle("on", on); r.classList.toggle("drag", drag);
  r.querySelector(".stt").setAttribute("aria-checked", on); r.querySelector(".dotc").innerHTML = on ? ic("check", "sm") : "";
  r.querySelector(".lbl2").textContent = drag ? dateLabel() : "Date"; r.querySelector(".rv").textContent = dateLabel();
  r.querySelector(".rot").setAttribute("aria-label", "Date: " + dateLabel() + ". Drag up or down, or tap, to change");
 });
}
function commit() { /* the list follows the date as it changes; leaving the catch-up redraws the page once */
 var c = S.view === "catch"; if (c) { S.view = "list"; S.person = ""; }
 ensureFirst();
 if (c) render(); else { rowRefresh(); refreshFeed(); var ql = $("#qline"); if (ql) ql.innerHTML = qlineHtml(); var sm = $(".fph p"); if (sm) sm.textContent = summary(); }
}
function rotStep(i) { var n = RANGES.length; i = Math.max(0, Math.min(n - 1, i)); if (i !== S.f.i || !S.f.on || S.f.day) { S.f.i = i; S.f.on = true; S.f.day = ""; commit(); if (navigator.vibrate) navigator.vibrate(6); } }
function rotTap() { if (!S.f.on || S.f.day) rotStep(S.f.i); else rotStep((S.f.i + 1) % RANGES.length); } /* Pantry's tap always advances; here the first tap on an off row turns it on at its remembered window, so "Anytime" is not skipped over */
document.addEventListener("pointerdown", function (e) { var r = e.target.closest ? e.target.closest("[data-rot]") : null; if (!r || e.button > 0) return; ro = { y: e.clientY, base: S.f.i, moved: false }; });
document.addEventListener("pointermove", function (e) { if (!ro) return; var dy = ro.y - e.clientY; if (Math.abs(dy) > 6 && !ro.moved) { ro.moved = true; rowRefresh(); } if (ro.moved) rotStep(ro.base + Math.round(dy / 20)); });
var endRo = function () { if (!ro) return; var x = ro; ro = null; if (!x.moved) rotTap(); else rowRefresh(); };
document.addEventListener("pointerup", endRo); document.addEventListener("pointercancel", endRo);
document.addEventListener("wheel", function (e) { var r = e.target.closest ? e.target.closest("[data-rot]") : null; if (!r) return; e.preventDefault(); rotStep(S.f.i + (e.deltaY > 0 ? 1 : -1)); }, { passive: false });

/* ---------- behaviour ---------- */
function apply(g, v) { /* Topic: area:<id> or kind:<kind> */
 if (v === "clear") { S.f.areas = []; S.f.kind = ""; }
 else if (v.indexOf("area:") === 0) {
  var a = v.slice(5);
  if (MULTI) { var ix = S.f.areas.indexOf(a); if (ix >= 0) S.f.areas.splice(ix, 1); else S.f.areas.push(a); }
  else S.f.areas = S.f.areas[0] === a && !S.f.kind ? [] : [a];
  S.f.kind = "";
 } else { var k = v.slice(5); S.f.kind = S.f.kind === k ? "" : k; }
 if (S.pop === "what" && (v === "clear" || v.indexOf("kind:") === 0 || HM.REGISTRY.kinds.filter(function (x) { return x.kind.indexOf((S.f.areas[0] || "-") + ".") === 0; }).length < 2)) S.pop = ""; /* B: the picker closes when the choice is complete */
 if (S.view === "catch") S.view = "list";
 ensureFirst(); render();
}
document.addEventListener("click", function (ev) {
 var t = ev.target;
 if (t.hasAttribute && t.hasAttribute("data-dim")) { if (S.pop) S.pop = ""; else if (S.open !== null) S.open = null; else S.panel = ""; render(); return; }
 var b = t.closest ? t.closest("button,a") : null; if (!b) return;
 if (b.matches("a[data-route]")) { ev.preventDefault(); toast("Would open " + b.getAttribute("data-route")); return; }
 if (b.matches("a[data-rail]")) { ev.preventDefault(); return; }
 if (b.matches("[data-rot]")) { if (ev.detail === 0) rotTap(); return; } /* a pointer tap is handled on pointerup, as in Pantry; this is the keyboard */
 if (b.dataset.dt) { S.f.on = !S.f.on; if (!S.f.on) S.f.day = ""; commit(); return; }
 if (b.dataset.seq) { S.open = +b.dataset.seq; render(); return; }
 if (b.hasAttribute("data-closedetail")) { S.open = null; render(); return; }
 if (b.dataset.tab) { S.tab = b.dataset.tab; S.who = ""; S.pop = ""; S.open = null; if (S.view === "list") ensureFirst(); render(); return; }
 if (b.hasAttribute("data-filters")) { S.panel = S.panel === "filters" && wide() ? "" : "filters"; S.open = null; render(); return; }
 if (b.hasAttribute("data-closecatch")) { S.view = "list"; S.person = ""; S.open = null; if (!wide() && !WAY) S.panel = "filters"; ensureFirst(); render(); toast("Left the catch-up. Not marked as caught up."); return; }
 if (b.hasAttribute("data-tick")) { S.ticked = true; S.seen = new Date(HM.NOW).toISOString(); ensureFirst(); render(); toast("Marked as caught up. Your next visit starts fresh from here."); return; }
 if (b.dataset.person !== undefined) { S.who = ""; S.person = b.dataset.person; if (S.person === MEID) S.tab = "mine"; else if (S.person === "others") S.tab = "others"; else if (S.person) S.tab = HOUSE === "two" ? "person" : "others"; render(); return; }
 if (b.dataset.opt) { var p = b.dataset.opt.split("|"); apply(p[0], p[1]); return; }
 if (b.dataset.pick) { S.pop = S.pop === b.dataset.pick ? "" : b.dataset.pick; S.open = null; render(); return; }
 if (b.hasAttribute("data-closepop")) { S.pop = ""; render(); return; }
 if (b.dataset.who) { S.tab = b.dataset.who; S.who = ""; S.pop = ""; S.open = null; S.person = ""; if (S.view === "list") ensureFirst(); render(); return; }
 if (b.dataset.chip) { chipTap(chips().filter(function (c) { return c.id === b.dataset.chip; })[0]); return; }
 if (b.dataset.f) { tapContent(b); return; }
 if (b.dataset.unset) { unset(b.dataset.unset); return; }
 if (b.hasAttribute("data-undo")) { undo(); return; }
 if (b.hasAttribute("data-clear")) { S.f = newF(); S.entity = ""; S.entLabel = ""; S.who = ""; S.kw = ""; S.pop = ""; ensureFirst(); render(); return; }
 if (b.hasAttribute("data-month")) { S.f.on = true; S.f.i = 2; S.f.day = ""; ensureFirst(); render(); return; }
 if (b.hasAttribute("data-retry")) { S.state = ""; ensureFirst(); render(); return; }
 if (b.hasAttribute("data-closepanel")) { S.panel = ""; render(); return; }
});
/* D: tap the content to filter. One tap narrows the list and scrolls to the line that says so; Undo puts the list back. */
function snap() { return JSON.stringify({ f: S.f, tab: S.tab, who: S.who, entity: S.entity, entLabel: S.entLabel, entProduct: S.entProduct, view: S.view, person: S.person }); }
function land(msg) { if (S.view === "catch") { S.view = "list"; S.person = ""; } S.open = null; S.pop = ""; ensureFirst(); render(); window.scrollTo(0, 0); toast(msg, true); }
function tapContent(b) {
 var f = b.dataset.f, i = f.indexOf(":"), k = f.slice(0, i), v = f.slice(i + 1); S.prev = snap();
 if (k === "who") { if (v === MEID) { S.tab = "mine"; S.who = ""; } else if (HOUSE === "two" && v === otherId()) { S.tab = "person"; S.who = ""; } else { S.tab = "others"; S.who = v; } return land("Showing only changes by " + (v === MEID ? "you" : HM.NAMES[v])); }
 if (k === "area") { if (MULTI) { if (S.f.areas.indexOf(v) < 0) S.f.areas.push(v); } else S.f.areas = [v]; S.f.kind = ""; return land("Showing only " + areaLabel(v)); }
 if (k === "kind") { S.f.kind = v; S.f.areas = [v.split(".")[0]]; return land("Showing only " + kindLabel(v) + " in " + areaLabel(v.split(".")[0])); }
 if (k === "day") { S.f.on = true; S.f.day = v; return land("Showing only " + dateLabel()); }
 if (k === "entity") { S.entity = v; S.entLabel = b.dataset.label || ""; S.entProduct = b.dataset.product || "kitchie"; return land("Showing only changes to " + (S.entLabel || "this item")); }
}
function unset(k) {
 if (k === "who") S.who = ""; else if (k === "what") { S.f.areas = []; S.f.kind = ""; } else if (k === "when") { S.f.on = false; S.f.day = ""; } else if (k === "entity") { S.entity = ""; S.entLabel = ""; }
 S.pop = ""; ensureFirst(); render();
}
function undo() { if (!S.prev) return; var o = JSON.parse(S.prev); S.f = o.f; S.tab = o.tab; S.who = o.who; S.entity = o.entity; S.entLabel = o.entLabel; S.entProduct = o.entProduct; S.view = o.view; S.person = o.person; S.prev = null; S.pop = ""; ensureFirst(); render(); toast("Back to how it was"); }
document.addEventListener("input", function (ev) { if (ev.target && ev.target.id === "kw") { S.kw = ev.target.value; refreshFeed(); } });
document.addEventListener("keydown", function (ev) {
 var tag = (ev.target && ev.target.tagName) || ""; if (tag === "INPUT") { if (ev.key === "Escape" && S.kw) { S.kw = ""; ev.target.value = ""; refreshFeed(); } return; }
 if (ev.target && ev.target.matches && ev.target.matches("[data-rot]") && (ev.key === "ArrowUp" || ev.key === "ArrowDown")) { ev.preventDefault(); rotStep(S.f.i + (ev.key === "ArrowDown" ? 1 : -1)); return; }
 if (ev.key === "Escape" && S.pop) { S.pop = ""; render(); return; }
 if (ev.ctrlKey || ev.metaKey) { if (ev.key === "Escape") { if (S.open !== null) S.open = null; else S.panel = ""; render(); } return; }
 var k = ev.key.toLowerCase();
 if (k === "f") { if (!WAY) { S.panel = "filters"; S.open = null; render(); } }
 else if (k === "1" || k === "2" || (k === "3" && HOUSE === "two")) { S.tab = k === "1" ? "mine" : k === "2" ? (HOUSE === "two" ? "person" : "others") : "others"; S.open = null; if (S.view === "list") ensureFirst(); render(); }
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
  grp("Filter pattern (owner, 24 Oct)", "way", [["cascade", "A: Cascade (baseline)"], ["sentence", "B: Sentence"], ["quick", "C: Quick answers"], ["tap", "D: Tap to filter (default)"]], { b: "sentence", c: "quick", d: "tap" }[WAY] || "cascade") +
  grp("Search (Q1)", "search", [["", "A: filters only (default)"], ["text", "B: free text, days loaded"]], SEARCH ? "text" : "") +
  grp("Choices per group (Q2, undecided)", "choices", [["", "One at a time (shown)"], ["several", "Several (lists)"]], MULTI ? "several" : "") +
  grp("Signed in as", "as", [["", "Arjan"], ["sam", "Sam"]], ME === "sam" ? "sam" : "") + grp("Household", "household", [["", "Two people"], ["more", "More"]], HOUSE === "more" ? "more" : "") +
  grp("Opens at", "view", [["", "Catch-up"], ["list", "Recent"]], S.view === "list" ? "list" : "") + grp("Last visit", "last", [["", "Sat"], ["wed", "Wed (older than the cap)"]], Q.get("last") === "wed" ? "wed" : "") +
  grp("Template registry", "tpl", [["", "Published"], ["loading", "Fetching"], ["none", "Nothing published"]], TPL === "ready" ? "" : TPL) +
  grp("Mockup notes", "notes", [["", "On"], ["0", "Off"]], NOTES ? "" : "0") + "</div></div>";
}
document.body.insertAdjacentHTML("beforeend", pvHtml());
$("#pvb").addEventListener("click", function () { var o = $("#pv").classList.toggle("open"); this.setAttribute("aria-expanded", o); });

if (S.state === "" || S.state === "down") ensureFirst();
render();
window.__hx = { S: S, params: params, catchQ: catchQ, WAY: WAY, moreDay: moreDay, rows: rows, ALL: ALL };
})();
