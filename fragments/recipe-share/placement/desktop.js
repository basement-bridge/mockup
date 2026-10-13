/* Desktop host for the Share placement options. Viewport-specific on purpose: a labelled entry with a key hint (S), and the stub opens in the
   flyout lane on the right (in place, no navigation: DESIGN.md 6a) instead of the phone's bottom sheet. */
(function () {
"use strict";
var S = window.SHR, f = document.getElementById("f"), lane = document.getElementById("lane"), n = S.links.length;
f.src = "../../../recipe/detail.html?id=" + (S.single ? "cur" : "efr");
var here = function (p) { return new URL(p, location.href).href; };
var MAC = /Mac|iPhone|iPad/.test(navigator.platform || ""), CLOSE = MAC ? "Cmd Enter" : "Ctrl Enter";
var lbl = n ? "Share this recipe, " + S.plural(n) + " out" : "Share this recipe";
var cnt = n ? '<span class="shr-n" aria-hidden="true">' + n + "</span>" : "";

function link(doc, href) { if (doc.querySelector('link[href="' + href + '"]')) return; var l = doc.createElement("link"); l.rel = "stylesheet"; l.href = href; doc.head.appendChild(l); }
function apply(doc) {
  var top = doc.querySelector(".top"); if (!top) return;
  [here("share.css"), here("desktop-frame.css"), here("../../../recipe/keys.css")].forEach(function (h) { link(doc, h); });
  if (!doc.querySelector("[data-shr]")) {
    var btn = function (cls, inner) { return '<button type="button" class="' + cls + '" data-shr aria-haspopup="dialog" aria-label="' + lbl + '">' + inner + "</button>"; };
    if (S.opt === "a") {
      top.querySelector("[data-more]").insertAdjacentHTML("beforebegin", btn("shr-chip" + (n ? " on" : ""), S.ic("share") + "Share" + cnt + '<span class="kbd" aria-hidden="true">S</span>'));
    } else if (S.opt === "b") {
      var meta = doc.querySelector(".meta");
      if (meta) meta.insertAdjacentHTML("beforeend", btn("shr-chip" + (n ? " on" : ""), S.ic("share") + "Share" + cnt + '<span class="kbd" aria-hidden="true">S</span>'));
    } else if (S.opt === "c" && n) {
      var h = doc.querySelector(".body h1"), row = h && h.parentNode;
      if (row) row.insertAdjacentHTML("afterend", btn("shr-line", S.ic("link") + "Shared with " + S.plural(n) + " <span>· see them</span>"));
    }
  }
  var sh = doc.querySelector(".sheet");
  if (S.opt === "c" && sh && sh.querySelector("[data-putaway]") && !sh.querySelector(".shr-opt")) {
    sh.querySelector(".opt").insertAdjacentHTML("beforebegin", '<button type="button" class="opt shr-opt" data-shr data-close>' + S.ic("share") + '<span class="t"><b>Share this recipe</b><small>A link anyone can open. No sign-in.</small></span>' + cnt + "</button>");
  }
}
function toast(m) { var o = document.querySelector(".toast"); if (o) o.remove(); var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 4000); }
function close() { lane.innerHTML = '<p class="idle">Share, Edit and History open here.</p>'; }
function open() {
  lane.innerHTML = '<div class="hd"><button type="button" class="x" data-x aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true">' + '<path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' + S.stubBody();
  var x = lane.querySelector("[data-x]"); if (x) x.focus();
}
lane.addEventListener("click", function (e) {
  if (e.target.closest("[data-x]")) close();
  else if (e.target.closest("[data-shr-stubbtn]")) toast("The links panel and the create sheet are in their own mockup");
});
function keys(d) {
  d.addEventListener("keydown", function (e) {
    var tag = d.activeElement && d.activeElement.tagName;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { close(); return; } // plain Esc closes nothing (the app's rule)
    if (e.key.toLowerCase() === "s" && !e.ctrlKey && !e.metaKey && !/INPUT|TEXTAREA|SELECT/.test(tag || "") && S.opt !== "c") open();
  });
}
f.addEventListener("load", function () {
  var win = f.contentWindow, doc = win.document, ph = doc.getElementById("ph");
  apply(doc); new MutationObserver(function () { apply(doc); }).observe(ph, { childList: true });
  doc.addEventListener("click", function (e) { if (e.target.closest("[data-shr]")) setTimeout(open, 0); });
  keys(doc); keys(document);
  if (S.Q.get("open") === "more") setTimeout(function () { var m = doc.querySelector("[data-more]"); if (m) m.click(); }, 150);
  if (S.Q.get("open") === "1") setTimeout(open, 150);
});
})();
