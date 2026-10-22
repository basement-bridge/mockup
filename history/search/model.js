/* History search and filters: the data layer. A stand-in for Platform, in the canonical read shape (docs/knowledge/history-event-model.md).
   Nothing in this file is drawn on a screen. The screen (search.js) may use only what GET /api/history returns, so this file is the only place that knows a payload.
   Replace it with: GET /api/history?...&days=1&tz=..., GET /api/history/kinds, GET /api/history/templates (the last two are designed in ADR 0003 and NOT built). */
(function (W) {
"use strict";
var TZ = "Australia/Sydney"; /* Q9: the device's zone is a Proposal; Platform has no household zone. */
var IDS = { arjan: "a1f3c9d2e4b60718a3c5d9e0", sam: "b7e2d4a6c8f01357b9d1e3f5", priya: "c3d5e7f9a1b30246c8e0f2a4" };
var NAMES = {}; NAMES[IDS.arjan] = "Arjan"; NAMES[IDS.sam] = "Sam"; NAMES[IDS.priya] = "Priya";
var NOW = Date.parse("2026-10-17T23:00:00.000Z"); /* Sun 18 Oct 2026, 10:00 in Sydney (UTC+11). */
var PRODUCTS = { kitchie: "Kitchie", recipe: "Recipe" };

/* ---- the sample: events exactly as GET /api/history returns them (seq, event_id, product, kind, kind_v, entity, actor, via, affects, ref_event_id, occurred_at, payload) ----
   Payloads follow Kitchie's plan section 4 (docs/plans/history-extraction.md). Kitchie sends no via, affects or ref_event_id today; the sample fills affects (Proposal, Q6)
   unless ?affects=today. The recipe row is hypothetical: Recipe emits no History yet and its kind name is a placeholder. */
function utc(daysAgo, hh, mm) { /* Sydney local time on the sample's calendar -> UTC. DST began 4 Oct 2026 (UTC+11), +10 before. */
  var day = 18 - daysAgo, off = (daysAgo <= 14) ? 11 : 10; /* 18 - 14 = 4 Oct */
  return new Date(Date.UTC(2026, 9, day, hh - off, mm)).toISOString().replace(/\.\d{3}Z$/, ".000Z");
}
var RAW = [];
function add(d, hhmm, who, kind, ent, payload, aff, extra) {
  var p = hhmm.split(":");
  RAW.push({ at: utc(d, +p[0], +p[1]), who: who, kind: kind, ent: ent, payload: payload, aff: aff || [], extra: extra || {} });
}
var P = function (area, place) { return { area: area, place: place }; };
/* Sun 18 */
add(0, "08:12", "sam", "pantry.removed", { type: "item", id: "itm_tea" }, { name: "Green tea", reason: "manual" }, ["arjan"]);
add(0, "07:40", "sam", "pantry.moved", { type: "item", id: "itm_peas" }, { name: "Frozen peas", from: { area: "Freezer", place: "Drawer 1" }, to: { area: "Freezer", place: "Drawer 2" } });
/* Sat 17 */
add(1, "21:30", "arjan", "pantry.moved", { type: "item", id: "itm_rice" }, { name: "Basmati rice", from: { area: "Pantry", place: "Door" }, to: { area: "Pantry", place: "Top shelf" } }, ["sam"]);
add(1, "18:20", null, "pantry.purchased", { type: "item", id: "itm_milk" }, { name: "Milk", quantity: "2", how: "topped_up", from_list: true, visitor: "shopper_link" });
add(1, "17:50", "arjan", "pantry.added", { type: "item", id: "itm_eggs" }, { name: "Eggs", quantity: "12", origin: "manual" }, ["sam"]);
add(1, "12:10", "arjan", "pantry.stock_checked", { type: "item", id: "itm_soy" }, { name: "Soy sauce", level_from: "some", level_to: "low" });
add(1, "09:40", "sam", "recipe.edited", { type: "recipe", id: "rcp_fried_rice" }, {}, ["arjan"], { product: "recipe" });
/* Thu 15 (Fri 16 is quiet: no events, so it is skipped when days are counted) */
add(3, "20:15", "sam", "pantry.used", { type: "item", id: "itm_milk" }, { name: "Milk", from: 2, to: 1 });
add(3, "19:02", "arjan", "pantry.corrected", { type: "item", id: "itm_flour" }, { name: "Flour", fields: ["name", "category"] }, ["sam"]);
add(3, "08:30", "sam", "pantry.removed", { type: "item", id: "itm_bread" }, { name: "Bread", reason: "manual" });
/* generated tail: about three weeks of older activity so the day-at-a-time loading has somewhere to go (Wed 14 back to 30 days). Deterministic. */
(function () {
  var items = [["itm_oats", "Oats"], ["itm_yog", "Yoghurt"], ["itm_lent", "Lentils"], ["itm_tom", "Tomatoes"], ["itm_pasta", "Pasta"], ["itm_butter", "Butter"], ["itm_rice2", "Jasmine rice"], ["itm_lemon", "Lemons"]];
  var kinds = ["pantry.used", "pantry.removed", "pantry.moved", "pantry.added", "pantry.stock_checked", "pantry.corrected"];
  var s = 7, rnd = function (n) { s = (s * 9301 + 49297) % 233280; return Math.floor(s / 233280 * n); };
  for (var d = 4; d <= 30; d++) {
    if ((d * 7) % 5 === 0 || d === 18) continue; /* quiet days */
    var n = 1 + rnd(3);
    for (var i = 0; i < n; i++) {
      var it = items[rnd(items.length)], k = kinds[rnd(kinds.length)], who = ["arjan", "sam", "arjan"][rnd(3)];
      var pl = { name: it[1] };
      if (k === "pantry.used") { pl.from = 3; pl.to = 2; }
      if (k === "pantry.removed") pl.reason = "manual";
      if (k === "pantry.moved") { pl.from = P("Fridge", "Top shelf"); pl.to = P("Fridge", "Door"); }
      if (k === "pantry.added") pl.quantity = String(1 + rnd(6));
      if (k === "pantry.stock_checked") { pl.level_from = "plenty"; pl.level_to = "some"; }
      if (k === "pantry.corrected") pl.fields = ["quantity"];
      add(d, ("0" + (8 + rnd(12))).slice(-2) + ":" + ("0" + (5 * rnd(12))).slice(-2), who, k, { type: "item", id: it[0] }, pl, rnd(5) === 0 ? [who === "sam" ? "arjan" : "sam"] : []);
    }
  }
})();
RAW.sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : 0; });

var HOUSE = "two";
function build(opts) { /* opts.affects: "today" strips affects (what Kitchie writes today). opts.house two|more */
  var out = RAW.map(function (r, i) {
    var product = r.extra.product || "kitchie";
    var aff = opts.affects === "today" ? [] : r.aff.map(function (k) { return IDS[k]; });
    return {
      seq: i + 1, event_id: product + ":journal:" + (i + 1), product: product, kind: r.kind, kind_v: 1,
      entity: { type: r.ent.type, id: r.ent.id || null },
      actor: r.who === null ? null : { member: IDS[r.who], name: NAMES[IDS[r.who]] },
      via: null, affects: aff, ref_event_id: null, occurred_at: r.at, payload: r.payload
    };
  });
  if (opts.house === "more") { /* a third member, so the second tab is "Others" */
    out.push({ seq: out.length + 1, event_id: "kitchie:journal:" + (out.length + 1), product: "kitchie", kind: "pantry.added", kind_v: 1, entity: { type: "item", id: "itm_basil" }, actor: { member: IDS.priya, name: "Priya" }, via: null, affects: [], ref_event_id: null, occurred_at: utc(0, 9, 5), payload: { name: "Basil", quantity: "1", origin: "manual" } });
  }
  return out.sort(function (a, b) { return a.occurred_at < b.occurred_at ? 1 : a.occurred_at > b.occurred_at ? -1 : b.seq - a.seq; });
}

/* ---- time helpers: calendar days in a named zone (what days=1&tz= does on Platform) ---- */
var fmtDay = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
var fmtTime = new Intl.DateTimeFormat("en-AU", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });
var fmtLong = new Intl.DateTimeFormat("en-AU", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
function dayKey(iso) { return fmtDay.format(new Date(iso)); }
function timeOf(iso) { return fmtTime.format(new Date(iso)).replace(/\s?([ap])m/i, function (m, c) { return " " + c.toLowerCase() + "m"; }); }
function longDay(iso) { return fmtLong.format(new Date(iso)).replace(",", ""); }
function dayLabel(key) {
  var today = dayKey(new Date(NOW).toISOString());
  var y = new Date(NOW - 86400000); var yk = dayKey(y.toISOString());
  if (key === today) return "Today"; if (key === yk) return "Yesterday";
  return longDay(key + "T12:00:00.000Z");
}

/* ---- GET /api/history, as Platform's reference store filters it (packages/store/src/memory-history.ts). Every parameter is single-valued. ---- */
function matches(r, q, me) {
  if (q.actor !== undefined) { var a = q.actor === "me" ? me : q.actor; if (!r.actor || r.actor.member !== a) return false; }
  if (q.actorNot !== undefined) { if (q.noMember ? (r.actor && r.actor.member === q.actorNot) : (r.actor === null || r.actor.member === q.actorNot)) return false; }
  if (q.affects !== undefined) { var f = q.affects === "me" ? me : q.affects; if (r.affects.indexOf(f) < 0) return false; }
  if (q.product !== undefined && r.product !== q.product) return false;
  if (q.area !== undefined && r.kind.indexOf(q.area + ".") !== 0) return false;
  if (q.kind !== undefined && r.kind !== q.kind) return false;
  if (q.entityType !== undefined && r.entity.type !== q.entityType) return false;
  if (q.entityId !== undefined && r.entity.id !== q.entityId) return false;
  if (q.from !== undefined && r.occurred_at < q.from) return false;
  if (q.to !== undefined && r.occurred_at > q.to) return false;
  if (q.since !== undefined && !(r.occurred_at > q.since)) return false;
  return true;
}
/* One day at a time: the next older calendar day (in TZ) that has at least one matching event, strictly older than the cursor day. */
function pageDay(all, q, me, afterDay) {
  var rows = all.filter(function (r) { return matches(r, q, me); });
  var day = null;
  for (var i = 0; i < rows.length; i++) { var k = dayKey(rows[i].occurred_at); if (afterDay === null || k < afterDay) { day = k; break; } }
  if (day === null) return { events: [], day: null, more: false };
  var ev = rows.filter(function (r) { return dayKey(r.occurred_at) === day; });
  var more = rows.some(function (r) { return dayKey(r.occurred_at) < day; });
  return { events: ev, day: day, more: more };
}

/* ---- the registry: what Kitchie (and Recipe) publish and Platform serves. NOT built; ADR 0003 section 3. Areas and kinds for the filter lists (GET /api/history/kinds),
   templates keyed (product, kind, kind_v) (GET /api/history/templates). The WORDING below is Kitchie's "wording today" column (docs/plans/history-extraction.md section 4),
   written here as stand-ins; Kitchie authors and publishes the real ones. Recipe publishes none. ---- */
var REGISTRY = {
  areas: [{ id: "pantry", label: "Pantry", product: "kitchie" }, { id: "recipe", label: "Recipe", product: "recipe" }],
  kinds: [
    { kind: "pantry.added", label: "Added" }, { kind: "pantry.purchased", label: "Purchased" }, { kind: "pantry.swapped", label: "Swapped" },
    { kind: "pantry.used", label: "Used" }, { kind: "pantry.removed", label: "Removed" }, { kind: "pantry.restored", label: "Restored" },
    { kind: "pantry.moved", label: "Moved" }, { kind: "pantry.corrected", label: "Corrected" }, { kind: "pantry.stock_checked", label: "Stock checked" },
    { kind: "pantry.bulk_changed", label: "Bulk changed" }, { kind: "pantry.undone", label: "Undone" },
    { kind: "recipe.edited", label: "Edited" }
  ],
  routes: { kitchie: { item: "/kitchie-uat/pantry/items/{id}" } }
};
var S = function (p) { return { k: "slot", p: p }; }, SO = function (p) { return { k: "slot", p: p, opt: true }; };
var T = function (v) { return { k: "text", v: v }; }, E = function (c) { return { k: "emph", c: c }; };
var NAME = { k: "link", to: "item", c: [E([S("name")])] };
var TEMPLATES = {
  "kitchie/pantry.removed/1": { rev: 2, vocab: 1, body: [NAME, T(" Used up")] },
  "kitchie/pantry.moved/1": { rev: 3, vocab: 1, body: [NAME, T(" Moved to "), S("to.area"), T(", "), S("to.place"), { k: "detail", c: [T("Was in "), S("from.area"), T(", "), S("from.place")] }] },
  "kitchie/pantry.used/1": { rev: 1, vocab: 1, body: [NAME, T(" Amount "), S("from"), T(" to "), S("to")] },
  "kitchie/pantry.added/1": { rev: 1, vocab: 1, body: [NAME, T(" Added "), { k: "group", c: [SO("quantity")] }] },
  "kitchie/pantry.purchased/1": { rev: 1, vocab: 1, body: [NAME, T(" Added "), { k: "group", c: [SO("quantity")] }] },
  "kitchie/pantry.stock_checked/1": { rev: 1, vocab: 1, body: [NAME, T(" Level "), S("level_from"), T(" to "), S("level_to")] },
  "kitchie/pantry.corrected/1": { rev: 1, vocab: 1, body: [NAME, T(" Changed "), { k: "list", p: "fields" }] }
};
var tplMode = "ready"; /* ready | loading (fetch in flight) | none (registry has nothing published) */
function setTplMode(m) { tplMode = m; }
function template(e) { return TEMPLATES[e.product + "/" + e.kind + "/" + e.kind_v] || null; }

/* ---- the generic evaluator: template + payload -> a semantic tree, then the painter's HTML. One evaluator, whatever the kind. ---- */
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function get(o, p) { return p.split(".").reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }
function paint(nodes, e, cx) { /* returns {html, text}; detail nodes are collected in cx.detail, never in the line */
  var html = "", text = "";
  nodes.forEach(function (n) {
    if (n.k === "text") { html += esc(n.v); text += n.v; }
    else if (n.k === "slot") { var v = get(e.payload, n.p); if (v === undefined || v === null || v === "") { if (n.opt) { cx.omit = true; return; } throw new Error("slot"); } html += esc(v); text += v; }
    else if (n.k === "emph") { var r = paint(n.c, e, cx); html += "<b>" + r.html + "</b>"; text += r.text; }
    else if (n.k === "group") { var g = paint(n.c, e, cx); if (g.text !== "") { html += "(" + g.html + ")"; text += "(" + g.text + ")"; } }
    else if (n.k === "list") { var arr = get(e.payload, n.p); if (!Array.isArray(arr)) throw new Error("list"); html += esc(arr.join(", ")); text += arr.join(", "); }
    else if (n.k === "link") { var r2 = paint(n.c, e, cx); var rt = (REGISTRY.routes[e.product] || {})[n.to]; if (rt && e.entity.id && /^[A-Za-z0-9_.:-]+$/.test(e.entity.id)) { var href = rt.replace("{id}", e.entity.id); html += cx.links ? '<a class="tl" href="' + esc(href) + '" data-route="' + esc(href) + '">' + r2.html + "</a>" : r2.html; } else html += r2.html; text += r2.text; }
    else if (n.k === "detail") { var d = paint(n.c, e, cx); cx.detail.push(d.html); }
    else { var u = paint(n.c || [], e, cx); html += u.html; text += u.text; } /* unknown tag: keep its children as plain text (ADR 0003 proposed rule, O-2) */
  });
  return { html: html, text: text };
}
/* -> {state:"ok", html, text, detail:[]} | {state:"loading"} | {state:"generic", html, text} */
function render(e, links) {
  var gen = function () { var who = e.actor === null ? "Someone" : e.actor.name === null ? "A former member" : e.actor.name; var t = PRODUCTS[e.product] || e.product; return { state: "generic", html: "made a change in " + esc(t), text: who + " made a change in " + t }; };
  if (tplMode === "loading") return { state: "loading" };
  var tpl = tplMode === "none" ? null : template(e);
  if (!tpl) return gen();
  var cx = { detail: [], links: !!links };
  try { var r = paint(tpl.body, e, cx); return { state: "ok", html: r.html, text: r.text, detail: cx.detail, tpl: e.product + "/" + e.kind + "/" + e.kind_v + " rev " + tpl.rev }; }
  catch (x) { return gen(); }
}

W.HM = { TZ: TZ, IDS: IDS, NAMES: NAMES, NOW: NOW, PRODUCTS: PRODUCTS, REGISTRY: REGISTRY, build: build, pageDay: pageDay, matches: matches, dayKey: dayKey, dayLabel: dayLabel, timeOf: timeOf, longDay: longDay, render: render, setTplMode: setTplMode, utc: utc, esc: esc };
})(window);
