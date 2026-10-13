/* Receipt scan, live: desktop. The rail, the column with the webcam or a dropped photo, the right lane, the keyboard, drop and paste. Loaded only from 1024px up (lv-run.js picks the file).
   Keys (RS-26 kept, additions RS-44): J K or arrows move between lines; Y yes or add as new; N new item; X not an item; T top up or new item; 1 to 3 pick a candidate; Z change my answer; Space take it now; L last look; R scan from Pantry; Shift+Enter add;
   Escape lets go of a held line (it never closes the scan: close is Ctrl or Cmd Enter and Done); drop or paste a photo to read it. */
(function () {
  var LV = window.LV, S = LV.S, D = LV.D, L = LV.L, out = LV.out;
  LV.vp.name = "desktop";
  LV.vp.words = { photo: "Upload or drop a photo", entry: "Webcam, or drop a photo. Answers appear on the picture", noCam: "No webcam found", noCamWhy: "Allow the camera in the browser, or add a photo of the receipt: drop it on this page, paste it, or choose a file.", noCamBtn: "Choose a photo" };
  LV.vp.compose = function (s) {
    var rail = '<nav class="rail" aria-label="Main"><div class="brand">Our kitchen</div>' + LV.nav() + '<div class="me"><a class="nv" href="#" tabindex="-1"><span class="qk">?</span><span>Keys</span></a><span class="av">S</span></div></nav>';
    if (s.step === "entry") return rail + '<div class="page"><main class="main">' + s.main + '</main></div><aside class="panel" data-mode="add" aria-label="Add an item">' + LV.addSheet() + "</aside>" + s.toast;
    if (s.step === "done") return rail + '<div class="page"><main class="main">' + s.main + '</main></div><aside class="panel" data-mode="done">' + doneLane() + "</aside>" + s.toast;
    if (s.step === "refused") return rail + '<div class="page"><div class="rl lv-rl" data-dir="' + LV.dir + '">' + s.html + '</div></div><aside class="panel"><div class="rs-sh"><h2>Nothing to read yet</h2></div><p class="rs-fine">Drop a photo of the receipt on this page, paste it, or choose a file.</p></aside>' + s.toast;
    return rail + '<div class="page"><div class="rl lv-rl" data-dir="' + LV.dir + '">' + s.col + '</div></div><aside class="panel" data-mode="lane" aria-label="' + (LV.dir === "d" ? "Lines read" : "Answers") + '">' + s.lane + "</aside>" + s.toast;
  };
  function doneLane() { var e = LV.entries(); return '<div class="rs-sh"><h2>Added</h2></div><div class="rs-counts"><div data-k="new"><b>' + e.news.length + "</b><span>new items</span></div><div data-k=\"top\"><b>" + e.top.length + "</b><span>topped up</span></div><div data-k=\"skip\"><b>" + e.skip.length + "</b><span>left out</span></div></div><p class=\"rs-fine\">Undo is on the toast for 9 seconds, then in the Pantry’s history for 5 minutes.</p>"; }
  var order = function () { return LV.seenLines().sort(function (a, b) { return LV.ORDER.indexOf(a.id) - LV.ORDER.indexOf(b.id); }); };
  function move(d) {
    var o = S.walk ? S.walk.q.map(L) : order(); if (!o.length) return; var cur = S.walk ? S.walk.cur : S.sel, i = o.map(function (l) { return l.id; }).indexOf(cur), n = o[Math.max(0, Math.min(o.length - 1, i < 0 ? 0 : i + d))];
    if (S.walk) LV.act("box", n.id); else LV.select(n.id);
  }
  LV.vp.key = function (e) {
    var t = e.target; if (t.closest && t.closest("input,textarea,select")) return; if (e.altKey) return;
    var k = e.key, cmd = e.ctrlKey || e.metaKey;
    if (cmd && k === "Enter") { e.preventDefault(); LV.act(S.sheet === "summary" ? "closesheet" : "leave"); return; }
    if (cmd) return;
    if (S.step === "entry" && (k === "r" || k === "R")) { LV.act("scan"); return; }
    if (S.step === "done") return;
    if (S.step !== "view") return;
    if (e.shiftKey && k === "Enter") { e.preventDefault(); LV.act(S.sheet === "summary" ? "done" : "summary"); return; }
    if (k === "Escape") { if (S.sel && !S.walk) LV.deselect(); return; }
    if (S.sheet === "summary") return;
    if (k === " ") { e.preventDefault(); LV.act("shutter"); return; }
    if (k === "l" || k === "L") { LV.act("last"); return; }
    if (k === "ArrowDown" || k === "j") { e.preventDefault(); move(1); return; }
    if (k === "ArrowUp" || k === "k") { e.preventDefault(); move(-1); return; }
    var id = S.walk ? S.walk.cur : S.sel; if (!id) return;
    var l = L(id), o = out(l).k;
    if (k === "y") { if (o === "open") LV.act(l.st === "fuzzy" ? "match" : "new", id); else if (l.st === "skip" && o === "skip") LV.act("add2", id); }
    else if (k === "n" && o === "open") LV.act("new", id);
    else if (k === "x" && o === "open") LV.act("skip", id);
    else if (k === "t" && (o === "top" || o === "newb")) LV.act("mode", id, o === "top" ? "newb" : "top");
    else if (/^[1-3]$/.test(k) && l.st === "fuzzy") { var cs = [l.m].concat(l.cand || []); if (cs[+k - 1]) LV.act("pick", id, cs[+k - 1]); }
    else if (k === "z") LV.act("undo", id);
  };
  /* drop and paste: a photo dropped anywhere on the page, or pasted, is read (webcams are poor at receipts, so this is a first-class path, RS-45) */
  var hasPhoto = function (it) { return it && Array.prototype.some.call(it, function (i) { return /^image\//.test(i.type); }); };
  document.addEventListener("dragover", function (e) { if (S.step === "entry" || S.step === "view" || S.step === "refused") e.preventDefault(); });
  document.addEventListener("drop", function (e) { if (S.step === "entry" || S.step === "view" || S.step === "refused") { e.preventDefault(); if (S.step !== "view") { S.cond = "auto"; S.perm = "allowed"; } LV.act("photos"); } });
  document.addEventListener("paste", function (e) { if (hasPhoto(e.clipboardData && e.clipboardData.items) && S.step !== "done") LV.act("photos"); });
})();
