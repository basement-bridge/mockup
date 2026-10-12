/* Desktop (1024px and up): the left rail, the right lane, the keyboard, drop and paste. Loaded only on these widths (DESIGN.md section 7).
   Keys (proposals, RS-D24): J K or arrows move between lines; Y yes or add as new; N new item; X not an item; T top up or new item; Shift+Enter add to the Pantry; R scan a receipt from the Add flyout.
   Close is Ctrl or Cmd Enter and the x; plain Esc only cancels a menu or a drag (the Pantry's rule). */
(function () {
  var RS = window.RS, S = RS.S, D = RS.D;
  RS.vp.name = "desktop";
  RS.vp.chrome = function () { return '<nav class="rail" aria-label="Main"><div class="brand">Our kitchen</div>' + RS.navHtml() + '<div class="me"><a class="nv" href="#" tabindex="-1"><span class="qk">?</span><span>Keys</span></a><span class="av">S</span></div></nav>'; };
  RS.vp.dim = function () { return ""; };
  RS.vp.grab = function () { return ""; };
  var order = function () { return D.lines.filter(function (l) { return !RS.views[RS.opt].visible || RS.views[RS.opt].visible(l); }); };
  function move(d) { var o = order(), i = o.map(function (l) { return l.id; }).indexOf(S.sel); var n = o[Math.max(0, Math.min(o.length - 1, i < 0 ? 0 : i + d))]; if (n) { S.sel = n.id; RS.render(true); var el = RS.$('[data-id="' + n.id + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" }); } }
  RS.vp.key = function (e) {
    var t = e.target; if (t.closest && t.closest("input,textarea,select")) return; if (e.altKey) return;
    var k = e.key, cmd = e.ctrlKey || e.metaKey;
    if (cmd && k === "Enter") { e.preventDefault(); if (S.step === "review") RS.act("cancelreview"); else RS.act("closepanel"); return; }
    if (cmd) return;
    if (k === "Escape") { if (S.menu) { S.menu = false; RS.render(true); } return; }
    if (S.step === "entry" && (k === "r" || k === "R")) { RS.act("scan"); return; }
    if (S.step === "pantry" && (k === "+" || k === "=")) { RS.act("add"); return; }
    if (S.step === "review" && e.shiftKey && k === "Enter") { e.preventDefault(); if (S.commit) RS.act("done"); else RS.act("commit"); return; }
    if (S.step !== "review" || S.commit) return;
    if (k === "ArrowDown" || k === "j") { e.preventDefault(); move(1); } else if (k === "ArrowUp" || k === "k") { e.preventDefault(); move(-1); }
    else if (S.sel) {
      var l = RS.L(S.sel), o = RS.out(l).k;
      if (k === "y") { if (o === "open") RS.act(l.st === "fuzzy" ? "match" : "new", l.id); else if (l.st === "skip" && o === "skip") RS.act("add2", l.id); }
      else if (k === "n" && o === "open") RS.act("new", l.id);
      else if (k === "x" && o === "open") RS.act("skip", l.id);
      else if (k === "t" && (o === "top" || o === "newb")) RS.act("mode", l.id, o === "top" ? "newb" : "top");
      else if (/^[1-3]$/.test(k) && l.st === "fuzzy") { var cs = [l.m].concat(l.cand || []); if (cs[+k - 1]) RS.act("pick", l.id, cs[+k - 1]); }
      else if (k === "z") RS.act("undo", l.id);
    }
  };
  /* drop and paste: a photo dropped anywhere on the page, or pasted, starts the read (the Add flyout says so in option D) */
  RS.vp.init = function () {
    document.addEventListener("dragover", function (e) { if (S.step === "capture" || S.step === "entry" || S.step === "pantry") e.preventDefault(); });
    document.addEventListener("drop", function (e) { if (S.step === "capture" || S.step === "entry" || S.step === "pantry") { e.preventDefault(); S.step = "capture"; S.photo = true; RS.render(); } });
    document.addEventListener("paste", function (e) { var it = e.clipboardData && e.clipboardData.items; if (it && Array.prototype.some.call(it, function (i) { return /^image\//.test(i.type); }) && S.step !== "review") { S.step = "capture"; S.photo = true; RS.render(); } });
    if (RS.views[RS.opt].deskInit) RS.views[RS.opt].deskInit();
  };
})();
