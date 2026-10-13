/* The recipe page behind the sheet: a short stand-in drawn from the recipe tab's sample data, so the sheet is seen in context.
   The Share button's place in the page is another slice's job; here it is only a way to open the sheet. */
(function () {
  var SH = window.SH, X = window.RCP, esc = X.esc, ic = SH.ic, R = SH.R;
  SH.shareBtn = function (cls) {
    return '<button type="button" class="' + cls + '" data-act="open" aria-label="Share this recipe">' + ic("share") + (cls.indexOf("ib") < 0 ? "Share" : "") + "</button>";
  };
  SH.page = function () {
    var v = R.vers.filter(function (x) { return x.def; })[0], res = X.resolve(R, v.id);
    return '<div class="pad"><div class="sh-pg-h"><span class="sh-pg-e" aria-hidden="true">' + R.e + '</span><div class="t"><h1>' + esc(R.name) + "</h1></div></div>" +
      '<div class="meta"><span class="mc ro">' + ic("clock") + R.min + ' min</span><span class="mc ro">' + ic("users") + "serves " + R.serves + '</span><span class="mc ro">' + ic("branch") + esc(v.name) + "</span></div></div>" +
      '<div class="pad"><div class="lblrow"><span class="lbl">Ingredients</span></div>' + res.ings.map(function (x) {
        var i = x.i, q = X.fmt(i[2], i[3], R.serves);
        return '<div class="ing"><span class="dot" aria-hidden="true"></span><span class="nm">' + esc(i[1]) + (q ? '<span class="q">' + q + "</span>" : "") + "</span></div>";
      }).join("") + '<div class="lblrow"><span class="lbl">Method</span></div>' + R.steps.slice(0, 3).map(function (s, k) {
        return '<div class="stp"><span class="nb">' + (k + 1) + "</span><div style=\"flex:1;min-width:0\"><p>" + esc(s[0]) + "</p></div></div>";
      }).join("") + "</div>";
  };
})();
