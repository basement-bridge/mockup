/* Desktop layout (1024px and up): the Pantry's three lanes, rail | recipe column | flyout (docs/knowledge/desktop-layout.md).
   The flyout sits in the right lane, pushing nothing and covering nothing; closing it leaves the lane empty. Loaded only at 1024px and up. */
(function () {
  var SH = window.SH, S = SH.S, ic = SH.ic, root = document.getElementById("app");
  var nv = function (i, t, on) { return '<a class="nv' + (on ? " on" : "") + '" href="#">' + ic(i) + "<span>" + t + "</span></a>"; };
  SH.layout = {
    native: false,  /* desktop browsers rarely have a share sheet: Copy link is the one action */
    draw: function () {
      var keep = root.querySelector(".panel"), y = keep ? keep.scrollTop : 0;
      root.innerHTML = '<nav class="rail" aria-label="Main"><div class="brand">Kitchie</div>' + nv("cal", "Home") + nv("jar", "Pantry") + nv("chef", "Recipes", true) + nv("cart", "Shopping") + "</nav>" +
        '<main class="main"><div class="col"><div class="sh-dh"><a class="back" href="#">' + ic("back") + "Recipes</a>" + SH.shareBtn("btn sm") + "</div>" + SH.page() + "</div></main>" +
        (S.open ? '<aside class="panel sh" role="dialog" aria-labelledby="sh-t" data-o="' + S.o + '" data-phase="' + S.phase + '"><div class="sh-h"><div class="t"><h3 id="sh-t">' + SH.esc(SH.title()) + "</h3>" + (SH.sub() ? "<p>" + SH.sub() + "</p>" : "") +
          '</div><span class="kbd cap">Esc</span><button type="button" class="ib bare" data-act="close" aria-label="Close">' + ic("x") + "</button></div>" +
          '<div class="sh-body">' + SH.body() + "</div></aside>" : "") + SH.toast();
      var p = root.querySelector(".panel"); if (p) p.scrollTop = y;
    }
  };
  SH.layout.draw(); SH.autoMake();
})();
