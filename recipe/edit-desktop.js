/* Edit by hand, desktop lane (1024px and up). Fetched by edit.js only at that size. Adds one aside to the same window: the live list of changes
   (the same change set Save will write), who is saving, and for a keeper the question (fix this one / keep both / different dish) drawn in place,
   so it needs no sheet. Everything it does goes through window.EDIT, which edit.js exposes: the diff, the listeners, commit. */
(function () {
"use strict";
var E = window.EDIT; if (!E) return;
var X = E.X, ic = E.ic, esc = E.esc, ph = document.querySelector(".phone");
var MAC = /Mac|iPhone|iPad/.test(navigator.platform || ""), CLOSE = MAC ? ["Cmd", "Enter"] : ["Ctrl", "Enter"];
var pick = null;
var lane = document.createElement("aside"); lane.className = "edlane"; lane.setAttribute("aria-label", "Your changes");
lane.innerHTML = '<h2>Your changes <span class="cnt" id="lcount">0</span></h2><p class="wh">' + esc(E.who) + ', by hand. ' + (E.keeper ? 'Saved changes need no review: you made them.' : 'A try: it goes straight in as revision ' + (E.headN + 1) + '.') + '</p>' +
  '<div class="ld" id="ldiff"></div>' +
  (E.keeper ? '<div class="lq" id="lq" hidden><b style="font-size:13.5px">' + esc(E.name) + ' is a keeper' + (E.usual ? ' and our usual' : '') + '. Where should this go?</b>' +
    [["fix", "star", "Fix " + esc(E.name), "Revision " + (E.headN + 1) + " of the same version"], ["both", "branch", "Keep both", "A new version that starts as Trying"], ["own", "spark", "It is a different dish now", "Its own recipe, linked back"]].map(function (o) {
      return '<button type="button" class="ch" data-p="' + o[0] + '" aria-pressed="false">' + ic(o[1]) + '<span class="t"><b>' + o[2] + '</b><small>' + o[3] + '</small></span><span class="rad" aria-hidden="true"></span></button>';
    }).join("") + '<div id="lfollow"></div></div>' : '') +
  '<div class="lf"><button type="button" class="btn ghost" id="lcancel">Cancel</button><button type="button" class="btn" id="lsave" disabled>Save</button></div>' +
  '<p class="phint">Close: <span class="kbd keep">' + CLOSE[0] + '</span> <span class="kbd keep">' + CLOSE[1] + '</span> asks before it leaves changes behind.</p>';
ph.appendChild(lane);
var $ = function (s) { return lane.querySelector(s); };
function labels() {
  var n = (E.changes || []).length, b = $("#lsave");
  if (!E.keeper) { b.textContent = n ? "Save " + n + " change" + (n > 1 ? "s" : "") : "Save"; b.disabled = !n; return; }
  b.textContent = !n ? "Save" : pick ? { fix: "Save as revision " + (E.headN + 1), both: "Save new version", own: "Make its own recipe" }[pick] : "Choose where it goes";
  b.disabled = !n || !pick;
}
E.listeners.push(function (rows) {
  $("#lcount").textContent = rows.length;
  $("#ldiff").innerHTML = rows.length ? E.diffHtml(rows) : '<p class="ednone">Nothing changed yet. Edit anything on the left; each change is listed here as you make it.</p>';
  if (E.keeper) $("#lq").hidden = !rows.length;
  labels();
});
E.ask = function () { var q = $("#lq"); if (q) q.scrollIntoView({ block: "nearest" }); };
lane.addEventListener("click", function (e) {
  var t = e.target.closest("button"); if (!t) return;
  if (t.dataset.p) {
    pick = t.dataset.p;
    [].forEach.call(lane.querySelectorAll("[data-p]"), function (x) { x.setAttribute("aria-pressed", String(x === t)); });
    $("#lfollow").innerHTML = (pick === "both" ? '<label class="edf"><span class="edlab">Name the new version</span><input class="field" id="lnm" value="' + esc(E.suggestName()) + '"></label>' : pick === "own" ? '<label class="edf"><span class="edlab">Name the new recipe</span><input class="field" id="lnm" value="' + esc(E.suggestName()) + '"></label>' : '') +
      '<label class="edf"><span class="edlab">' + { fix: "What did you change? (optional)", both: "Why keep it? (optional)", own: "Why is it a different dish? (optional)" }[pick] + '</span><input class="field" id="lwhy" placeholder="In your words" maxlength="200"></label>';
    labels();
  } else if (t.id === "lcancel") { var bk = ph.querySelector(".top .back"); if (bk) bk.click(); }
  else if (t.id === "lsave" && !t.disabled) { var nm = $("#lnm"); E.commit(E.keeper ? pick : "fix", { name: nm && nm.value, why: ($("#lwhy") || {}).value }); }
});
E.listeners.forEach(function (f) { f(E.changes || []); });
if (E.scrollSec) E.scrollSec();
})();
