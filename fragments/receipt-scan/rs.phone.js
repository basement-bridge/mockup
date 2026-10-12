/* Phone and tablet (under 1024px): the app's tab bar, a dim behind bottom sheets, a grab handle, touch gestures. Loaded only on these widths (DESIGN.md section 7). */
(function () {
  var RS = window.RS;
  RS.vp.name = "phone";
  RS.vp.chrome = function () { return '<nav class="tabbar" aria-label="Main">' + RS.navHtml() + "</nav>"; };
  RS.vp.dim = function () { return '<div class="dim" data-act="dim"></div>'; };
  RS.vp.grab = function () { return '<button type="button" class="grab" data-act="dim" aria-label="Close"></button>'; };
  RS.vp.key = function (e) { if (e.key === "Escape" && (RS.S.sheet || RS.S.step === "capture" || RS.S.step === "entry")) RS.act("dim"); };
  RS.vp.init = function () { if (RS.views[RS.opt].swipe) RS.views[RS.opt].swipe(); };
})();
