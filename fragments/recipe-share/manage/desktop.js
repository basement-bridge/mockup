/* Desktop drawings of options A, B and C: left rail, off-centre column, side panel (DESIGN.md section 7). Loaded only when Desktop is shown. */
(function () {
  "use strict";
  var R = window.RS, F = R.forms.desktop = {};
  F.host = function (stage) {
    var w = document.createElement("div"); w.className = "rs-winwrap"; var d = document.createElement("div"); d.className = "rs-frame rs-desk"; d.setAttribute("aria-label", "Desktop window"); w.appendChild(d); stage.appendChild(w); return d;
  };
  function rail() { return '<div class="rs-rail" aria-hidden="true"><span class="rs-iconbtn">' + R.ic("home") + '</span><span class="rs-iconbtn on">' + R.ic("book") + '</span><span class="rs-iconbtn">' + R.ic("cart") + "</span></div>"; }
  function col(inner, st) { return '<div class="rs-col"><div class="rs-scroll">' + inner + "</div>" + R.toast(st) + "</div>"; }
  F.A = function (st) {
    var has = R.shown(st).length > 0;
    return rail() + col(R.bar(R.shareBtn(0, false)) + R.chips() + R.jumps(has ? { n: R.counts(st).live } : null, 4) + R.stub("Photos", 3) + (has ? R.sectionA(st) : ""), st);
  };
  // B: the Share button opens a side panel in the lane to the right of the column, like the Pantry item panel. Closing it gives the width back.
  F.B = function (st) {
    var n = R.counts(st).live;
    return rail() + col(R.bar(R.shareBtn(n, true, st.open)) + R.chips() + R.jumps(null) + R.stub("Ingredients", 5) + R.stub("Method", 4), st) +
      (st.open ? '<aside class="rs-aside rs-panel" aria-label="Shared links">' + R.panelHead("Shared links") + '<div class="rs-panel-b">' + R.panelBody(st) + "</div></aside>" : "");
  };
  F.C = function (st) {
    var has = R.shown(st).length > 0;
    return rail() + col(R.bar(R.shareBtn(0, false)) + R.chips() + (has ? R.cardC(st) : "") + R.jumps(null) + R.stub("Ingredients", 5) + R.stub("Method", 4), st);
  };
})();
