/* Phone layout (under 1024px): the recipe page in the phone frame, the sheet a bottom sheet over a dim (same .scrim and .sheet as the recipe tab's sheets).
   Loaded only below 1024px (screen.html decides), so desktop never fetches it. */
(function () {
  var SH = window.SH, S = SH.S, ic = SH.ic, ph = document.getElementById("ph");
  SH.layout = {
    native: true,   /* a phone has a share sheet; the Share button shows */
    draw: function () {
      var keep = ph.querySelector(".sheet"), y = keep ? keep.scrollTop : 0;
      ph.innerHTML = '<div class="top"><a class="back" href="#" aria-label="Back to recipes">' + ic("back") + '</a><div class="ttl">' + SH.esc(SH.R.name) + "</div>" + SH.shareBtn("ib") + "</div>" +
        '<div class="body">' + SH.page() + "</div>" +
        (S.open ? '<div class="scrim" data-close></div><div class="sheet sh" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-o="' + S.o + '" data-phase="' + S.phase + '"><div class="grab"></div>' +
          '<div class="sh-h"><div class="t"><h3 id="sh-t">' + SH.esc(SH.title()) + "</h3>" + (SH.sub() ? "<p>" + SH.sub() + "</p>" : "") + '</div><button type="button" class="ib bare" data-act="close" aria-label="Close">' + ic("x") + "</button></div>" +
          '<div class="sh-body">' + SH.body() + "</div></div>" : "") + SH.toast();
      var sh = ph.querySelector(".sheet"); if (sh) sh.scrollTop = y;
    }
  };
  SH.layout.draw(); SH.autoMake();
})();
