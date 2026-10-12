/* The History view of one item. Fetched on the first History open, never on page load (DESIGN.md section 6). No size rules here.
   Same shape as the desktop Pantry's History column (docs/handover/desktop.md section 5): this item only, the last 3 days that have entries (quiet days are skipped), then 5 more days per "Show more",
   one line per field with the net change, long values cut with the full text as a tooltip. Each entry says what changed, when, who and from where.
   The journal mirrors Kitchie's (store.getHistory(id), MCP item_history): one entry per write, with an action, the item before and after, a source and a note. Sample data only: not a real household.
   Edits made on this page appear at the top under Today as they happen. */
(function () {
"use strict";
var IEF = window.IEF, $ = IEF.$, esc = IEF.esc, S = IEF.S, H = IEF.hist = {};
var HF = [["qty", "Quantity"], ["min", "Minimum"], ["level", "Level"], ["useby", "Use by"], ["area", "Location"], ["spot", "Spot"], ["note", "Note"]];
var SRC = { "item-sheet": "Item sheet", assistant: "Assistant", import: "Import", desk: "This page" }, FIRST = 3, MORE = 5, SHOWN = {};
function jr(t, who, src, a, b, gap) { return { t: t, who: who, src: src, gap: gap || 0, before: a, after: b }; }
function journal(it) {
  var q = IEF.qtyText(it) || "1", c = IEF.counted(it), n = it.amount || 0, alt = c && n > 0 ? String(n + 1) + (it.unit ? " " + it.unit : "") : (it.unit && n ? String(n * 2) + " " + it.unit : q), m = Math.max(1, Math.round(c && n > 0 ? n : 2));
  var NOTE = "Bought at the Saturday market with the second one for the long weekend cook-up, use this one first and keep the lid tight";
  return [jr("Mon 14 Sep, 11:10 am", "Priya", "import", {}, { qty: alt, area: it.area }),
    jr("Fri 18 Sep, 5:02 pm", "Sam", "item-sheet", { level: "Plenty" }, { level: "Some" }),
    jr("Mon 21 Sep, 8:15 am", "Priya", "assistant", { useby: "" }, { useby: "30 Sep" }),
    jr("Wed 23 Sep, 7:30 pm", "Sam", "item-sheet", { level: "Some" }, { level: "Plenty" }),
    jr("Tue 29 Sep, 4:30 pm", "Sam", "item-sheet", { useby: "30 Sep" }, { useby: "" }),
    jr("Thu 1 Oct, 6:12 pm", "Sam", "item-sheet", { level: "Plenty" }, { level: "Some" }),
    jr("Sat 3 Oct, 9:05 am", "Priya", "assistant", { area: it.area === "Fridge" ? "Pantry" : "Fridge" }, { area: it.area }),
    jr("Mon 5 Oct, 7:45 am", "Sam", "item-sheet", { level: "Some" }, { level: "Plenty" }),
    jr("Wed 7 Oct, 6:40 pm", "Sam", "item-sheet", { qty: alt, min: "" }, { qty: q, min: "" }),
    jr("Wed 7 Oct, 6:40 pm", "Sam", "item-sheet", { qty: q, min: "" }, { qty: alt, min: "" }, 12),
    jr("Wed 7 Oct, 6:41 pm", "Sam", "item-sheet", { qty: alt, min: "" }, { qty: q, min: m }, 20),
    jr("Thu 8 Oct, 8:20 pm", "Priya", "assistant", { note: "" }, { note: NOTE }),
    jr("Fri 9 Oct, 7:05 am", "Sam", "item-sheet", { spot: it.spot === "Door" ? "Top shelf" : "Door" }, { spot: it.spot })];
}
function net(g) {
  var a = g[0].before, b = g[g.length - 1].after, out = [];
  HF.forEach(function (f) { var x = a[f[0]], y = b[f[0]]; if (x === undefined && y === undefined) return; if (String(x === undefined ? "" : x) !== String(y === undefined ? "" : y)) out.push([f[1], x === undefined || x === "" ? "not set" : x, y === undefined || y === "" ? "not set" : y]); });
  return out;
}
/* newest first, grouped into days; only days that have entries count, so a quiet month is not padded with empty days */
function days(it) {
  var J = journal(it), G = [];
  J.forEach(function (e) { var g = G[G.length - 1]; if (g && g[0].src === e.src && g[0].who === e.who && e.gap && e.gap <= 120) g.push(e); else G.push([e]); });
  var ev = G.map(function (g) { var ch = net(g), first = !Object.keys(g[0].before).length, tt = g[0].t.split(", "); return { d: tt[0], t: tt[1], who: g[0].who, src: g[0].src, n: g.length, added: first, ch: ch }; }).filter(function (e) { return e.added || e.ch.length; }).reverse();
  var live = IEF.LOG[it.id] || [];
  if (live.length) {
    var used = live.filter(function (x) { return x.field === "Used up"; }).length, ch = live.filter(function (x) { return x.field !== "Used up" && x.field !== "Added"; }).map(function (x) { return [x.field, x.from, x.to, x.n]; });
    if (ch.length) ev.unshift({ d: "Today", t: "just now", who: "Sam", src: "desk", n: ch.reduce(function (a, x) { return a + (x[3] || 1); }, 0), ch: ch });
    if (used) ev.unshift({ d: "Today", t: "just now", who: "Sam", src: "desk", n: 1, text: "Used up" });
  }
  var out = []; ev.forEach(function (e) { var d = out[out.length - 1]; if (d && d.d === e.d) d.e.push(e); else out.push({ d: e.d, e: [e] }); }); return out;
}
function hch(a, b, c) { var full = a + ": " + b + " → " + c; return '<span class="hch" title="' + esc(full) + '">' + esc(a) + ": " + esc(b) + " &rarr; " + esc(c) + "</span>"; }
function line(e) {
  if (e.text) return "<b>" + esc(e.text) + "</b>";
  if (e.added) { var f = e.ch.map(function (c) { return c[0] + " " + c[2]; }).join(", "); return '<b>Added</b><span class="hch" title="' + esc(f) + '">' + esc(f) + "</span>"; }
  return "<b>" + (e.ch.length === 1 ? esc(e.ch[0][0]) + " changed" : "Edited") + (e.n > 1 ? " <em>" + e.n + " edits</em>" : "") + "</b>" + e.ch.map(function (c) { return hch(c[0], c[1], c[2]); }).join("");
}
function body(it) {
  var D = days(it), k = SHOWN[it.id] || FIRST, shown = D.slice(0, k), left = D.length - shown.length;
  if (!D.length) return '<p class="phint">No changes yet. Edits to ' + esc(it.name) + " will show up here.</p>";
  return shown.map(function (d) {
    return '<section class="hday"><h3>' + esc(d.d) + '</h3><ol class="hist" aria-label="' + esc(d.d) + '">' + d.e.map(function (e) { return "<li>" + line(e) + '<span class="trunc">' + esc(e.t) + " · " + esc(e.who) + " · " + esc(SRC[e.src] || e.src) + "</span></li>"; }).join("") + "</ol></section>";
  }).join("")
    + (left > 0 ? '<button type="button" class="btn hmore" data-ief="hmore">Show ' + Math.min(MORE, left) + ' more days <span class="kbd keep">' + left + " earlier</span></button>" : '<p class="phint">That is everything for this item.</p>');
}
H.fill = function (it, cb) {
  var b = $("#ief-cbody"); if (!b || !it) return;
  var shown = SHOWN[it.id] || FIRST; if (S.more && !SHOWN[it.id]) SHOWN[it.id] = FIRST + MORE * S.more;
  b.innerHTML = body(it); b.removeAttribute("aria-busy"); if (cb) cb();
};
IEF.act.hmore = function () { var it = IEF.cur(); SHOWN[it.id] = (SHOWN[it.id] || FIRST) + MORE; var b = $("#ief-cbody"), top = b.scrollTop; b.innerHTML = body(it); b.scrollTop = top; };
})();
