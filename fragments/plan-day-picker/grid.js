/* The four-week grid and its keys, shared by C and F (pulled out of pick-c.js so both draw and move the same way). Desktop only. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, esc = PK.esc;
function enabled(n) { return n >= 0 && n < P.GRIDN && !PK.info(n).past; }
function nextEnabled(n, d) { for (var m = n + d; m >= 0 && m < P.GRIDN; m += d) if (enabled(m)) return m; return n; }
function rowDays(n) { var r = Math.floor(n / 7), out = []; for (var i = 0; i < 7; i++) if (enabled(r * 7 + i)) out.push(r * 7 + i); return out; }
PK.grid = {
  /* header row, then four rows: a week label and seven day cells */
  html: function (label) {
    var h = '<div class="pk-grid" role="grid" aria-label="' + (label || "Day, four weeks") + '"><div class="pk-gh" aria-hidden="true"></div>' + P.dn.map(function (d) { return '<div class="pk-gh" aria-hidden="true">' + d + "</div>"; }).join("");
    for (var r = 0; r < 4; r++) {
      var m = PK.info(r * 7);
      h += '<div class="pk-gw" role="rowheader"><b>' + (r === 0 ? "This" : r === 1 ? "Next" : "+" + r) + '</b><span>' + m.num + " " + m.mon + "</span></div>";
      for (var i = 0; i < 7; i++) {
        var n = r * 7 + i, d = PK.info(n), cls = "pkc" + (n === P.todayN ? " today" : "") + (d.meals.length ? " full" : d.off ? " off" : ""), on = S.sel === n;
        var txt = d.meals.length ? PK.first(d.meals[0].name) + (d.meals.length > 1 ? " +" + (d.meals.length - 1) : "") : d.off ? "Off" : "Free";
        var lab = d.label + (n === P.todayN ? ", today" : "") + (d.past ? ", past" : "") + ", " + (d.meals.length ? d.meals.map(function (x) { return x.name; }).join(" and ") : d.off ? "usual day off" : "free");
        h += '<button type="button" role="gridcell" class="' + cls + '" data-n="' + n + '" aria-selected="' + on + '"' + (d.past ? " disabled" : "") + ' tabindex="' + (on ? 0 : -1) + '" aria-label="' + esc(lab) + '"><i>' + (d.num === 1 ? d.num + " " + d.mon : d.num) + "</i><span>" + txt + "</span></button>";
      }
    }
    return h + "</div>";
  },
  /* the key on a focused cell: { n } to move the choice, { n, enter: true } to plan it, or null when the key is not the grid's */
  target: function (e) {
    var k = e.key, cur = +e.target.dataset.n; if (isNaN(cur)) return null;
    if (k === "ArrowRight") return { n: nextEnabled(cur, 1) };
    if (k === "ArrowLeft") return { n: nextEnabled(cur, -1) };
    if (k === "ArrowDown") return { n: enabled(cur + 7) ? cur + 7 : cur };
    if (k === "ArrowUp") return { n: enabled(cur - 7) ? cur - 7 : cur };
    if (k === "Home" || k === "End") { var ds = rowDays(cur); return { n: k === "Home" ? ds[0] : ds[ds.length - 1] }; }
    if (k === "Enter") return { n: cur, enter: true };
    if (k.length === 1 && /[1-7a-zA-Z]/.test(k) && !e.shiftKey) {
      var rd = rowDays(cur); if (/^[1-7]$/.test(k)) { var t = Math.floor(cur / 7) * 7 + (+k - 1); return rd.indexOf(t) > -1 ? { n: t } : null; }
      var L = ["m", "t", "w", "t", "f", "s", "s"], c = k.toLowerCase(), cand = rd.filter(function (x) { return L[x % 7] === c; });
      return cand.length ? { n: cand[(cand.indexOf(cur) + 1) % cand.length] } : null;
    }
    return null;
  },
  helpRows: function (name) { var r = [["←  →  ↑  ↓", "Move between days and weeks"], ["Home  End", "First and last day of that week"], ["Enter", "Plan the chosen day"], ["1 – 7  or  M T W F S", "Jump to a day of that week (T and S again for the second one)"], ["Esc", "Close without planning"]]; r.title = "Choosing a day (Plan it, option " + name + ")"; return r; }
};
})();
