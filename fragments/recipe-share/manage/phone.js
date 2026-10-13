/* Phone drawings of options A, B and C (390px frame at every width, like recipe/). Loaded only when Phone is shown. */
(function () {
  "use strict";
  var R = window.RS, F = R.forms.phone = {};
  F.host = function (stage) {
    var d = document.createElement("div"); d.className = "rs-frame rs-phone"; d.setAttribute("aria-label", "Phone, 390 wide"); stage.appendChild(d); return d;
  };
  // A (recommended): a Shared section at the end of the continuous scroll, and a Shared chip in the jump row. Both exist only while there is a link to show.
  F.A = function (st) {
    var has = R.shown(st).length > 0, n = R.counts(st).live;
    return '<div class="rs-scroll">' + R.bar(R.shareBtn(0, false)) + R.chips() + R.jumps(has ? { n: n } : null, 4) + R.stub("Photos", 3) + (has ? R.sectionA(st) : "") + "</div>" + R.toast(st);
  };
  // B: a sheet from the Share button (badge = links out). The only place the empty state exists.
  F.B = function (st) {
    var n = R.counts(st).live;
    return '<div class="rs-scroll">' + R.bar(R.shareBtn(n, true, st.open)) + R.chips() + R.jumps(null) + R.stub("Ingredients", 5) + R.stub("Method", 4) + "</div>" +
      (st.open ? '<div class="rs-dim"></div><div class="rs-sheet" role="dialog" aria-label="Shared links"><div class="rs-grab"></div>' + R.panelHead("Shared links") + '<div class="rs-panel-b">' + R.panelBody(st) + "</div></div>" : "") + R.toast(st);
  };
  // C: a card in the recipe's details, between the title block and the ingredients, closed or open.
  F.C = function (st) {
    var has = R.shown(st).length > 0;
    return '<div class="rs-scroll">' + R.bar(R.shareBtn(0, false)) + R.chips() + (has ? R.cardC(st) : "") + R.jumps(null) + R.stub("Ingredients", 5) + R.stub("Method", 4) + "</div>" + R.toast(st);
  };
})();
