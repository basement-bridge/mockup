/* Recipe share, placement slice: sample data and markup builders shared by phone.js and desktop.js. Mockup only; nothing is sent or stored.
   Query: opt=a|b|c  links=0|2  id=efr (three versions, strip shows) | cur (one version)  open=1 (the stub is open). Fictional links only. */
(function () {
"use strict";
var Q = new URLSearchParams(location.search);
var opt = (Q.get("opt") || "a").toLowerCase();
var links = Q.get("links") === "2" ? [
  { id: "7f3a", name: "For the neighbours", opened: "Opened 6 times", ends: "ends in 5 days", url: "https://kitchie.example/r/7f3a9c" },
  { id: "b21e", name: "Book club", opened: "Not opened yet", ends: "ends in 12 days", url: "https://kitchie.example/r/b21e04" }
] : [];
var PATH = {
  share: '<path d="M12 15V4M8 7.5L12 4l4 3.5M6 12v6.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V12"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>'
};
var ic = function (n, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + PATH[n] + "</svg>"; };
var plural = function (n) { return n + " link" + (n === 1 ? "" : "s"); };
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

/* what tapping an entry opens: a stub. The active-links list (rename, cancel) and the create sheet are drawn in their own slice. */
function stubBody() {
  var n = links.length;
  return '<div class="shr-stub" data-shr-stub><h3>' + ic("share") + 'Share this recipe</h3>' +
    '<p class="shr-sub">Anyone with a link can read it, with no sign-in. A link works more than once and then expires.</p>' +
    '<span class="shr-stubtag">Stub: the links panel and the create sheet are their own mockup</span>' +
    (n ? '<ul class="shr-ls" aria-label="' + plural(n) + ' out">' + links.map(function (l) {
      return '<li data-link="' + l.id + '">' + ic("link") + '<span class="t"><b>' + esc(l.name) + '</b><small>' + l.opened + ' · ' + l.ends + '</small></span><button type="button" class="mini" data-shr-stubbtn aria-label="Cancel ' + esc(l.name) + '">Cancel</button></li>';
    }).join("") + "</ul>"
    : '<p class="shr-none">No links yet. Make one to send this recipe to someone outside the household.</p>') +
    '<button type="button" class="btn" data-shr-stubbtn>' + ic("link") + (n ? "Make another link" : "Make a link") + "</button>" +
    '<p class="shr-fine">The household sees every link here and can cancel it.</p></div>';
}
window.SHR = { Q: Q, opt: opt, links: links, ic: ic, plural: plural, stubBody: stubBody, esc: esc, single: Q.get("id") === "cur" };
})();
