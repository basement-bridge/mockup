/* Option G: a curtain under Cooking ideas. Add to plan is REMOVED from the recipe's detail (flyout) view: it lives only on each recipe card under Cooking ideas
   (Tonight and Other ideas). Pressing a card's Plan drops a curtain directly under the Cooking ideas card, in place (no sheet, no right flyout), with Today / Tomorrow / Other.
   "Other" is the open design question, so it has two variants: ?other=strip (a compact week strip with week arrows) and ?other=grid (a small four-week grid).
   Both are reachable from the Mockup only toggle in the curtain. The owner said G is most likely not something we will do; it is built as a real option, not a sketch. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, H = window.HDP, esc = PK.esc, ico = PK.ico, $ = PK.$;
var el, want = null, other = false, rid = null, wk = 0, variant = (new URLSearchParams(location.search).get("other") || "strip");
if (variant !== "grid") variant = "strip";
/* the detail view without Add to plan: the button and its P hint are cut from what Home's own recipe view draws (the shared file is not edited) */
var orig = H.recipeHtml;
H.recipeHtml = function (r) {
  var d = document.createElement("div"); d.innerHTML = orig(r);
  var b = d.querySelector('[data-act="plan"]'); if (b) b.remove();
  var h = d.querySelector(".phint"); if (h) h.innerHTML = h.innerHTML.replace(/<kbd[^>]*>P<\/kbd>\s*add to plan\s*/i, "");
  return d.innerHTML;
};
H.set({});
function days() { var o = []; for (var i = 0; i < 7; i++) { var n = wk * 7 + i; if (!(wk === 0 && PK.info(n).past)) o.push(n); } return o; }
function strip() {
  var h = '<div class="pk-wk"><button type="button" class="pk-ib" data-wk="-1" aria-label="Previous week"' + (wk === 0 ? " disabled" : "") + ">" + ico.back + "</button><b>" + PK.weekLabel(wk) + '</b><button type="button" class="pk-ib" data-wk="1" aria-label="Next week"' + (wk === 4 ? " disabled" : "") + ">" + ico.chev + '</button></div><div class="days" role="group" aria-label="Day">';
  for (var i = 0; i < 7; i++) {
    var n = wk * 7 + i, d = PK.info(n), w0 = wk === 0, sub = w0 ? PK.sub(d) : "Free", cls = w0 && d.meals.length ? "full" : w0 && d.off ? "off" : "", on = S.sel === n;
    h += '<button type="button" data-n="' + n + '" class="' + cls + '" aria-pressed="' + on + '"' + (w0 && d.past ? " disabled" : "") + (S.sel != null && !on ? ' tabindex="-1"' : "") + ' aria-label="' + d.dn + ", " + sub + '">' + d.dn + "<small>" + d.num + "</small><small>" + sub + "</small></button>";
  }
  return h + "</div>";
}
function draw() {
  var r = PK.R(), t = PK.info(P.todayN), m = PK.info(P.todayN + 1);
  function q(d, label) { return '<button type="button" data-quick="' + d.n + '" class="' + (d.meals.length ? "full" : d.off ? "off" : "") + '" aria-pressed="' + (S.sel === d.n && !other) + '"><b>' + label + "</b><small>" + d.dn + " " + d.num + " &middot; " + PK.sub(d) + "</small></button>"; }
  var body = '<div class="pk-quick" role="group" aria-label="When">' + q(t, "Today") + q(m, "Tomorrow") + '<button type="button" class="more" data-other aria-pressed="' + other + '"><b>Other</b><small>Another day</small></button></div>';
  if (other) body += (variant === "grid" ? PK.grid.html() : strip());
  var hint = other ? (variant === "grid" ? PK.kbd("←") + PK.kbd("→") + PK.kbd("↑") + PK.kbd("↓") : PK.kbd("←") + PK.kbd("→")) + " move " + PK.kbd("Enter") + " plan " + PK.kbd("Esc") + " close" : PK.kbd("Esc") + " close";
  el.innerHTML = '<div class="pk-cin"><div class="pk-pt"><div><h3 id="pk-t">Plan ' + esc(r.name) + '</h3><p class="pk-sub">' + (other ? "Pick a day" : "When?") + '</p></div><button type="button" class="x" data-close aria-label="Close">' + ico.x + "</button></div>" + body +
    PK.noteHtml(true) + PK.guardHtml() + PK.whoHtml() + PK.holdHtml() + PK.footHtml(hint) +
    (other ? '<div class="pk-mock" role="group" aria-label="Mockup only: how Other is shown"><span>Mockup only: Other as</span>' + ["strip", "grid"].map(function (v) { return '<button type="button" data-variant="' + v + '" aria-pressed="' + (variant === v) + '">' + (v === "strip" ? "Week strip" : "Small grid") + "</button>"; }).join("") + "</div>" : "") + "</div>";
  if (want) { var f = el.querySelector(want); want = null; if (f) f.focus({ preventScroll: true }); }
}
function pick(n) { S.sel = n; S.leave = false; want = '[data-n="' + n + '"]'; draw(); }
function click(e) {
  var t = e.target.closest("button"); if (!t || t.disabled) return;
  if (t.dataset.variant) { variant = t.dataset.variant; want = '[data-variant="' + variant + '"]'; if (variant === "grid" && S.sel != null && S.sel >= P.GRIDN) S.sel = null; draw(); return; }
  if (t.dataset.quick != null) {
    var n = +t.dataset.quick, d = PK.info(n); S.sel = n; S.leave = false;
    if (!d.meals.length && !d.off && !PK.guard()) { PK.commit(n); return; }
    other = false; want = '[data-quick="' + n + '"]'; draw(); return;
  }
  if (t.hasAttribute("data-other")) { other = !other; if (other) { wk = 0; S.sel = PK.firstFree(variant === "grid" ? P.GRIDN : 7); want = S.sel != null ? '[data-n="' + S.sel + '"]' : ".pkc:not(:disabled), .days button:not(:disabled)"; } else want = "[data-other]"; draw(); return; }
  if (t.dataset.n != null) { pick(+t.dataset.n); return; }
  if (t.dataset.wk) { var pi = S.sel != null ? S.sel % 7 : null; wk = Math.max(0, Math.min(4, wk + +t.dataset.wk)); S.sel = pi != null ? wk * 7 + pi : null; S.leave = false; want = '[data-wk="' + t.dataset.wk + '"]'; draw(); return; }
  PK.common(t, function () { want = t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : t.hasAttribute("data-hold") ? "[data-hold]" : null; draw(); });
}
PK.register({
  noP: true,
  returnTo: function () { return $('#ideas [data-act="quickplan"][data-id="' + rid + '"]'); },
  open: function (anchor) {
    other = false; wk = 0; rid = P.rid; S.sel = null;
    el = document.createElement("section"); el.className = "pk pk-curtain"; el.setAttribute("role", "dialog"); el.setAttribute("aria-labelledby", "pk-t"); el.setAttribute("aria-modal", "false");
    var host = $("#ideas"); host.parentNode.insertBefore(el, host.nextSibling);
    el.addEventListener("click", click); draw();
    var f = el.querySelector("[data-quick]"); if (f) f.focus({ preventScroll: true });
    el.scrollIntoView({ block: "nearest" });
  },
  close: function () { if (el) { el.removeEventListener("click", click); el.remove(); } el = null; },
  key: function (e) {
    var k = e.key, tg = e.target;
    if (tg.closest && tg.closest(".pk-grid")) { var t = PK.grid.target(e); if (!t) return; e.preventDefault(); if (t.enter) { S.sel = t.n; PK.ok(); } else pick(t.n); return; }
    if (tg.closest && tg.closest(".days")) {
      var ds = days(), cur = ds.indexOf(+tg.dataset.n); if (cur < 0) return;
      if (k === "ArrowRight" || k === "ArrowLeft") { e.preventDefault(); pick(ds[Math.max(0, Math.min(ds.length - 1, cur + (k === "ArrowRight" ? 1 : -1)))]); }
      else if (k === "Home" || k === "End") { e.preventDefault(); pick(k === "Home" ? ds[0] : ds[ds.length - 1]); }
      else if (k === "Enter") { e.preventDefault(); S.sel = +tg.dataset.n; PK.ok(); }
      else if (/^[1-7]$/.test(k)) { var n = wk * 7 + (+k - 1); if (ds.indexOf(n) > -1) { e.preventDefault(); pick(n); } }
      return;
    }
    if ((k === "ArrowLeft" || k === "ArrowRight") && tg.closest && tg.closest(".pk-quick")) { e.preventDefault(); var b = Array.prototype.slice.call(el.querySelectorAll(".pk-quick button")), i = b.indexOf(tg); if (i > -1) b[Math.max(0, Math.min(b.length - 1, i + (k === "ArrowRight" ? 1 : -1)))].focus(); }
  },
  focus: function () { if (!el) return; var f = el.querySelector('[aria-selected="true"]') || el.querySelector('.days [aria-pressed="true"]') || el.querySelector("[data-quick]"); if (f) f.focus({ preventScroll: true }); },
  /* Home's list says P adds to plan; in G the detail has no Plan, so that row is rewritten */
  patch: function (c) { Array.prototype.slice.call(c.querySelectorAll(".kbr")).forEach(function (r) { if (/Add to plan/.test(r.textContent)) { r.lastElementChild.textContent = "Open recipe, Add the missing to the list (ideas). Adding to plan is the Plan button on each card."; r.firstElementChild.innerHTML = "<kbd>O</kbd> <kbd>S</kbd>"; } }); },
  help: function () { var r = [["←  →", "Move along Today, Tomorrow and Other, or along the days"], ["←  →  ↑  ↓", "Move between days (small grid)"], ["Enter", "Plan the chosen day"], ["Esc", "Close the curtain without planning"]]; r.title = "Choosing a day (Plan it, option G)"; return r; }
});
})();
