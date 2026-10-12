/* Which size-rule files this option loads (DESIGN.md section 7: viewport code in its own files, linked with media= so a size loads only its own).
   Option A (default): displace.css from 1624px, stack.css below. B: stack.css at every width. C: displace.css and push.css from 1448px, stack.css below.
   Written with document.write in the head so the right files are there before first paint. Sample choice only: the build would pick one option and drop this file. */
(function () {
  var Q = new URLSearchParams(location.search), o = (Q.get("opt") || "a").toLowerCase();
  if ("abc".indexOf(o) < 0 || o.length !== 1) o = "a";
  window.HDP_OPT = o;
  window.HDP_BP = { a: 1624, b: Infinity, c: 1448 }[o];
  var peek = parseFloat(Q.get("peek"));
  if (peek >= 2 && peek <= 16) document.documentElement.style.setProperty("--peek", peek + "px");
  var L = [];
  function link(f, m) { L.push('<link rel="stylesheet" href="' + f + '"' + (m ? ' media="' + m + '"' : "") + ">"); }
  if (o === "a") { link("displace.css", "(min-width:1624px)"); link("stack.css", "(max-width:1623.98px)"); }
  else if (o === "b") { link("stack.css"); }
  else { link("displace.css", "(min-width:1448px)"); link("push.css", "(min-width:1448px)"); link("stack.css", "(max-width:1447.98px)"); }
  document.write(L.join(""));
})();
