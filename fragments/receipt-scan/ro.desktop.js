/* Receipt scan, chosen flow: desktop. The rail, the column that is a drop zone for a photo of the receipt (no webcam, RS-76), the right lane holding the receipt-order list, the keyboard, drop and paste. Loaded only from 1024px up (ro-run.js picks the file).
   Keys (RS-60, RS-26 amended): J K or arrows move between lines; Y or Right accepts a recommended line; N or Left makes it a new item (Left on an Unsure line ignores it); P pick another item; M match to existing; X ignore; Z put back or undo;
   F cycles the filter; R scan from the Pantry; Shift+Enter add; Escape closes the picker only (it never closes the scan: close is Ctrl or Cmd Enter and Done); drop or paste a photo to read it (RS-45). */
(function () {
  var RO = window.RO, S = RO.S, L = RO.L, out = RO.out;
  RO.vp.name = "desktop";
  /* No webcam on the desktop (owner, by voice, 14 October 2026, RS-76): no stream is asked for, no permission prompt, no shutter. A photo is dropped, pasted or chosen. The phone keeps its viewfinder (ro.phone.js). */
  RO.vp.noCamera = true;
  RO.vp.words = { photo: "Choose a photo", entry: "Drop or choose a photo of the receipt. Lines collect in the list as they are read" };
  RO.vp.compose = function (s) {
    var rail = '<nav class="rail" aria-label="Main"><div class="brand">Our kitchen</div>' + RO.nav() + '<div class="me"><a class="nv" href="#" tabindex="-1"><span class="qk">?</span><span>Keys</span></a><span class="av">S</span></div></nav>';
    if (s.step === "entry") return rail + '<div class="page"><main class="main">' + s.main + '</main></div><aside class="panel" data-mode="add" aria-label="Add an item">' + RO.addSheet() + "</aside>" + s.toast;
    if (s.step === "done") return rail + '<div class="page"><main class="main">' + s.main + '</main></div><aside class="panel" data-mode="done">' + doneLane() + "</aside>" + s.toast;
    return rail + '<div class="page"><div class="rl lv-rl ro-rl">' + s.col + '</div></div><aside class="panel" data-mode="lane" aria-label="Lines read">' + s.lane + "</aside>" + s.toast;
  };
  function doneLane() { var e = RO.entries(); return '<div class="rs-sh"><h2>Added</h2></div><div class="rs-counts"><div data-k="new"><b>' + e.news.length + "</b><span>new items</span></div><div data-k=\"top\"><b>" + e.top.length + "</b><span>updated</span></div><div data-k=\"skip\"><b>" + (e.ignored.length + e.left.length) + "</b><span>ignored</span></div></div><p class=\"rs-fine\">Undo is on the toast for 9 seconds, then in the Pantry’s history for 5 minutes.</p>"; }
  function move(d) {
    var o = RO.visible(); if (!o.length) return; var i = o.map(function (l) { return l.id; }).indexOf(S.sel), n = o[Math.max(0, Math.min(o.length - 1, i < 0 ? 0 : i + d))];
    S.sel = n.id; RO.render();
    var r = RO.$('.ro-li[data-id="' + n.id + '"] .ro-row'); if (r) r.focus({ preventScroll: true });
  }
  var FILTERS = ["all", "check", "unsure", "ignored"];
  RO.vp.key = function (e) {
    var t = e.target; if (t.closest && t.closest("input,textarea,select")) return; if (e.altKey) return;
    var k = e.key, cmd = e.ctrlKey || e.metaKey;
    if (cmd && k === "Enter") { e.preventDefault(); RO.act(S.sheet === "summary" ? "closesheet" : "leave"); return; }
    if (cmd) return;
    if (S.step === "entry" && (k === "r" || k === "R")) { RO.act("scan"); return; }
    if (S.step !== "view") return;
    if (e.shiftKey && k === "Enter") { e.preventDefault(); RO.act(S.sheet === "summary" ? "done" : "summary"); return; }
    if (S.sheet === "summary") return;
    if (k === "f" || k === "F") { S.filter = FILTERS[(FILTERS.indexOf(S.filter) + 1) % FILTERS.length]; RO.render(); return; }
    if (k === "ArrowDown" || k === "j") { e.preventDefault(); move(1); return; }
    if (k === "ArrowUp" || k === "k") { e.preventDefault(); move(-1); return; }
    var id = S.sel; if (!id) return;
    var l = L(id), o = out(l).k;
    if (k === "y" || k === "ArrowRight") { e.preventDefault(); if (o === "check" || o === "top") RO.act("accept", id); else if (o === "ignored") RO.act("restore", id); }
    else if (k === "n" || k === "ArrowLeft") { e.preventDefault(); if (o === "ignored") return; if (k === "ArrowLeft" && (o === "unsure" || o === "new")) RO.act("ignore", id); else RO.act("new", id); }
    else if (k === "x" && o !== "ignored") RO.act("ignore", id);
    else if ((k === "p" || k === "m") && o !== "ignored") { e.preventDefault(); RO.act("pickopen", id); }
    else if (k === "z") RO.act(S.res[id] || l.st === "left" ? "restore" : "undo", id);
  };
  /* drop, paste and choose: a photo dropped anywhere on the page, pasted, or chosen from the zone or the button is read (the only way in on the desktop, RS-76; RS-45) */
  var hasPhoto = function (it) { return it && Array.prototype.some.call(it, function (i) { return /^image\//.test(i.type); }); };
  var zone = function (on) { var z = RO.$(".rl-drop"); if (z) z.dataset.over = on ? "1" : "0"; };
  document.addEventListener("dragover", function (e) { if (S.step === "entry" || S.step === "view") { e.preventDefault(); zone(true); } });
  document.addEventListener("dragleave", function (e) { if (!e.relatedTarget) zone(false); });
  document.addEventListener("drop", function (e) { if (S.step === "entry" || S.step === "view") { e.preventDefault(); zone(false); RO.act("photos"); } });
  document.addEventListener("paste", function (e) { if (hasPhoto(e.clipboardData && e.clipboardData.items) && S.step !== "done") RO.act("photos"); });
})();
