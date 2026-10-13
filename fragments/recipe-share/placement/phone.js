/* Phone host for the Share placement options. Viewport-specific on purpose: phone only (bottom sheet, icon-only entries). */
(function () {
"use strict";
var S = window.SHR, f = document.getElementById("f"), n = S.links.length;
var id = S.single ? "cur" : "efr";
f.src = "../../../recipe/detail.html?id=" + id;
var base = new URL("share.css", location.href).href;

function entry(cls, label, inner) { return '<button type="button" class="' + cls + '" data-shr aria-haspopup="dialog" aria-label="' + label + '">' + inner + "</button>"; }
var cnt = function (c) { return n ? '<span class="shr-n" aria-hidden="true">' + n + "</span>" : ""; };
var lbl = n ? "Share this recipe, " + S.plural(n) + " out" : "Share this recipe";

function apply(doc, win) {
  var top = doc.querySelector(".top"); if (!top) return;
  if (!doc.querySelector("link[data-shr-css]")) { var l = doc.createElement("link"); l.rel = "stylesheet"; l.href = base; l.setAttribute("data-shr-css", ""); doc.head.appendChild(l); }
  if (!doc.querySelector("[data-shr]")) {
    if (S.opt === "a") {
      top.querySelector("[data-more]").insertAdjacentHTML("beforebegin", entry("ib bare shr-ic" + (n ? " on" : ""), lbl, S.ic("share") + cnt()));
    } else if (S.opt === "b") {
      var meta = doc.querySelector(".meta");
      if (meta) meta.insertAdjacentHTML("beforeend", entry("shr-chip" + (n ? " on" : ""), lbl, S.ic("share") + "Share" + cnt()));
    } else if (S.opt === "c" && n) {
      var h = doc.querySelector(".body h1"), row = h && h.parentNode;
      if (row) row.insertAdjacentHTML("afterend", entry("shr-line", lbl, S.ic("link") + "Shared with " + S.plural(n) + " <span>· see them</span>"));
    }
  }
  var sh = doc.querySelector(".sheet");
  if (S.opt === "c" && sh && sh.querySelector("[data-putaway]") && !sh.querySelector(".shr-opt")) {
    sh.querySelector(".opt").insertAdjacentHTML("beforebegin", '<button type="button" class="opt shr-opt" data-shr data-close>' + S.ic("share") + '<span class="t"><b>Share this recipe</b><small>A link anyone can open. No sign-in.</small></span>' + (n ? '<span class="shr-n" aria-hidden="true">' + n + "</span>" : "") + "</button>");
  }
}
function openStub(win) {
  if (win.document.querySelector("[data-shr-stub]")) return;
  win.RCP.sheet(S.stubBody(), function (sheet) {
    sheet.addEventListener("click", function (e) { if (e.target.closest("[data-shr-stubbtn]")) win.RCP.toast("The links panel and the create sheet are in their own mockup"); });
  });
}
f.addEventListener("load", function () {
  var win = f.contentWindow, doc = win.document, ph = doc.getElementById("ph");
  var run = function () { apply(doc, win); };
  run(); new MutationObserver(run).observe(ph, { childList: true });
  doc.addEventListener("click", function (e) {
    var t = e.target.closest("[data-shr]"); if (!t) return;
    // a row in the More sheet closes that sheet (data-close) in recipe.js first; the stub opens after
    setTimeout(function () { openStub(win); }, 0);
  });
  if (S.Q.get("open") === "more") setTimeout(function () { var m = doc.querySelector("[data-more]"); if (m) m.click(); }, 150);
  if (S.Q.get("open") === "1") setTimeout(function () { openStub(win); }, 150);
});
})();
