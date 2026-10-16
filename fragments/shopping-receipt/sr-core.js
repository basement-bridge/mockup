/* Shopping receipt review mockup (Kitchie #797): draws the review for option A, B or C from SRD (sr-data.js).
   No size rules here (DESIGN.md section 7): phone.css and desktop.css hold them. Mockup only: nothing is saved, nothing is read from a real image.
   Query: ?step=review|done  ?pre=resolved (every question answered)  ?open=agree,pantry (option C folds open). Body data-opt = a | b | c. */
(function () {
  "use strict";
  var D = window.SRD, Q = new URLSearchParams(location.search), opt = document.body.dataset.opt || "a";
  var app = document.getElementById("app");
  var S = { step: Q.get("step") || "review", pre: Q.get("pre") || "", open: (Q.get("open") || "").split(",").filter(Boolean), R: {}, X: {}, undone: false, toast: false };
  if (S.step === "done") S.pre = "resolved";
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
  var N = function (n) { return String(Math.round(n * 1000) / 1000); };
  var F = function (a) { return a ? N(a.q) + (a.u ? " " + a.u : "") : "no amount"; };
  var CONV = { "kg>g": 1000, "g>kg": .001, "L>mL": 1000, "mL>L": .001 };
  var FAM = { kg: ["kg", "g"], g: ["kg", "g"], L: ["L", "mL"], mL: ["L", "mL"], tin: ["tin", "pack"] };
  var step = function (u) { return u === "g" || u === "mL" ? 50 : u === "kg" || u === "L" ? .5 : 1; };
  var IC = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', neq: '<path d="M6 9h12M6 15h12M9 20L15 4"/>',
    q: '<path d="M9.5 9.5a2.5 2.5 0 115 0c0 2-2.5 2.2-2.5 4.2"/><path d="M12 17.3v.4"/>', box: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>', chev: '<path d="M9 6l6 6-6 6"/>', undo: '<path d="M9 7L5 11l4 4"/><path d="M5 11h9a5 5 0 010 10h-3"/>', cart: '<path d="M4 5h2l2 10h9l2-7H8"/><circle cx="10" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'
  };
  var ic = function (n, s) { s = s || 14; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + "</svg>"; };
  var GL = { ok: "check", fill: "plus", differ: "neq", unit: "q", done: "box", fix: "pencil", extra: "plus" };

  var isDone = function (r) { return r.state === "bought" || r.state === "finished"; };
  var same = function (a, b) { return a && b && N(a.q) === N(b.q) && (a.u || "") === (b.u || ""); };
  /* the static kind of a row, before anything is chosen */
  function kind(r) {
    if (isDone(r)) return "done";
    if (r.rcpt.bare && r.exact) return "unit";
    if (!r.list) return "fill";
    return same(r.list, r.rcpt) ? "ok" : "differ";
  }
  var fam = function (r) { var u = (r.list && r.list.u) || (r.rcpt && r.rcpt.u) || (r.exact ? "kg" : ""); return FAM[u] || []; };

  /* ---------- starting answers ---------- */
  function init() {
    D.rows.forEach(function (r) {
      var k = kind(r), res = S.pre === "resolved";
      if (isDone(r)) { S.R[r.id] = { mode: res && r.id === "banana" ? "fix" : "keep", q: r.rcpt.q, u: r.rcpt.u }; return; }
      var ru = r.rcpt.bare ? "" : r.rcpt.u, src = "rcpt";
      if (opt === "b" && (k === "differ" || k === "unit") && !res) src = null; /* B: nothing preselected where list and receipt differ */
      if (res && r.rcpt.bare) ru = fam(r)[0];
      S.R[r.id] = { src: src, q: r.rcpt.q, u: ru };
    });
    D.extra.forEach(function (x) { S.X[x.id] = S.R[x.id] = { add: true, q: x.rcpt.q, u: x.rcpt.u }; }); /* owner, 16 Oct: not on the list means add (SR-16) */
  }
  init();

  var needsUnit = function (r, a) { return r.rcpt.bare && a.src !== null && a.src !== "list" && !a.u; };
  var pending = function (r) { var a = S.R[r.id]; return !isDone(r) && (a.src === null || needsUnit(r, a)); };

  /* ---------- pieces ---------- */
  function chip(k, text, resolved) {
    return '<span class="sr-chip" data-k="' + k + '"' + (resolved ? ' data-r="resolved"' : "") + ">" + ic(resolved ? "check" : GL[k]) + text + "</span>";
  }
  function chipFor(r) {
    var k = kind(r), a = S.R[r.id];
    if (isDone(r)) return chip("done", "Already in your Pantry");
    if (a.typed && !needsUnit(r, a)) return chip("differ", "Edited by you", true);
    if (k === "ok") return chip("ok", "Matches your list");
    if (k === "fill") return chip("fill", "Fills a blank");
    if (a.src === null) return chip("differ", "List and receipt differ");
    if (needsUnit(r, a)) return chip("unit", "Needs a unit");
    if (same(a, r.list)) return chip("ok", "Keeping your list amount", true);
    if (a.typed) return chip("differ", "Edited by you", true);
    if (opt === "b") return chip("differ", a.src === "edit" ? "Edited by you" : "Receipt amount chosen", true);
    return chip("differ", "Changed from " + F(r.list) + ", now " + F(a));
  }
  function pills(r, a) {
    var u = fam(r);
    if (u.length < 2) return "";
    return '<span class="sr-pills" role="group" aria-label="Unit">' + u.map(function (x) {
      return '<button class="sr-pill" data-act="unit" data-id="' + r.id + '" data-v="' + x + '" aria-pressed="' + (a.u === x) + '">' + x + "</button>";
    }).join("") + "</span>";
  }
  function stepper(r, a, swap) {
    var h = '<div class="sr-amt"><button class="sr-step" data-act="dec" data-id="' + r.id + '" aria-label="Less ' + esc(r.name) + '">&minus;</button>' +
      '<input class="sr-in" type="text" inputmode="decimal" autocomplete="off" data-id="' + r.id + '" value="' + N(a.q) + '" aria-label="Type an amount for ' + esc(r.name) + '">' +
      '<button class="sr-step" data-act="inc" data-id="' + r.id + '" aria-label="More ' + esc(r.name) + '">+</button>' + pills(r, a);
    if (swap && r.list && !same(r.list, r.rcpt) && !r.rcpt.bare) {
      h += same(a, r.list) ? '<button class="sr-was" data-act="src" data-id="' + r.id + '" data-v="rcpt">Receipt said ' + F(r.rcpt) + "</button>"
        : '<button class="sr-was" data-act="src" data-id="' + r.id + '" data-v="list">List said ' + F(r.list) + "</button>";
    } else if (swap && r.list && r.rcpt.bare) {
      h += same(a, r.list) ? '<button class="sr-was" data-act="src" data-id="' + r.id + '" data-v="rcpt">Receipt said ' + N(r.rcpt.q) + "</button>"
        : '<button class="sr-was" data-act="src" data-id="' + r.id + '" data-v="list">List said ' + F(r.list) + "</button>";
    }
    h += "</div>";
    if (needsUnit(r, a)) h += '<p class="sr-note">The receipt says ' + N(r.rcpt.q) + ' but not what. ' + esc(r.name) + " is kept in exact units, so pick one.</p>";
    return h;
  }
  /* option B: two chips, both on show */
  function chooser(r, a) {
    var l = r.list, rc = r.rcpt, rcTxt = rc.bare ? N(rc.q) + " (no unit)" : F(rc);
    var h = '<div class="sr-ch" role="group" aria-label="Amount for ' + esc(r.name) + '">';
    h += '<button class="sr-pill" data-act="src" data-id="' + r.id + '" data-v="list"' + (l ? "" : " disabled") + ' aria-pressed="' + (a.src === "list" || (a.src === "edit" && same(a, l))) + '"><b>List</b><small>' + (l ? F(l) : "no amount") + "</small></button>";
    h += '<button class="sr-pill" data-act="src" data-id="' + r.id + '" data-v="rcpt" aria-pressed="' + (a.src === "rcpt" || (a.src === "edit" && !same(a, l))) + '"><b>Receipt</b><small>' + esc(rcTxt) + "</small></button></div>";
    if (a.src !== null) h += stepper(r, a, false);
    else h += '<p class="sr-note">Pick one. Nothing is chosen for you.</p>';
    if (needsUnit(r, a) && a.src !== null) h += '<p class="sr-note">Pick a unit for the receipt number.</p>';
    return h;
  }
  /* rows already in the Pantry: three explicit choices, default keep */
  function pantryRow(r, a) {
    var p = r.pantry, diff = !same(p, r.rcpt), id = r.id;
    var b = function (v, t, s) { return '<button class="sr-pill" data-act="mode" data-id="' + id + '" data-v="' + v + '" aria-pressed="' + (a.mode === v) + '"><b>' + t + "</b><small>" + s + "</small></button>"; };
    var h = '<div class="sr-ch" role="group" aria-label="What to do with ' + esc(r.name) + '">' + b("keep", "Keep Pantry&rsquo;s", F(p) + " stays");
    if (diff) h += b("fix", "Same item", "Fix to " + F(r.rcpt));
    h += b("again", "Another one", "Add " + F(r.rcpt) + " again") + "</div>";
    var out = a.mode === "keep" ? "Not added again. The Pantry keeps " + F(p) + "." : a.mode === "fix" ? "Pantry " + F(p) + " becomes " + F(r.rcpt) + ". Nothing new is added." : "Adds a second record to the Pantry.";
    h += '<p class="sr-note" data-out="' + a.mode + '">' + out + "</p>";
    if (a.mode === "again") h += stepper(r, a, false);
    return h;
  }
  function stateLine(r) {
    var l = r.list ? "On your list: " + F(r.list) : "On your list, no amount";
    if (r.state === "ticked") return "Ticked. " + l + ". Not in the Pantry yet.";
    if (r.state === "bought") return "Bought " + r.at + " (swipe). " + F(r.pantry) + " went to the Pantry.";
    if (r.state === "finished") return "Done shopping. " + F(r.pantry) + " went to the Pantry.";
    return l + ".";
  }
  /* the working for lines combined into one row; mixed units are added through the known relationship (g to kg, mL to L, 1000:1) */
  function sumLine(r) {
    var parts = r.lines.map(F).join(" + "), mixed = r.lines.some(function (l) { return l.u !== r.lines[0].u; });
    return parts + " = " + F(r.rcpt) + (mixed ? ". Shown in " + r.pantryU + ", the unit the Pantry holds " + esc(r.name.toLowerCase()) + " in." : ".");
  }
  function row(r) {
    var a = S.R[r.id], k = kind(r), body, recv;
    recv = "Receipt: " + r.raw.map(esc).join(" + ") + (r.note && k !== "done" ? ". " + esc(r.note) : r.note ? ". " + esc(r.note) : "") + ".";
    if (isDone(r)) body = pantryRow(r, a);
    else if (opt === "b" && (k === "differ" || k === "unit")) body = chooser(r, a);
    else if (opt === "b" && k === "fill") body = '<p class="sr-note">List has no amount. The receipt fills it.</p>' + stepper(r, a, false);
    else body = stepper(r, a, opt !== "b");
    var h = '<li data-id="' + r.id + '" data-k="' + k + '"><div class="row"><span class="sr-em" aria-hidden="true">' + (r.em || esc(r.name.charAt(0))) + '</span><div class="rmain">' +
      '<span class="nm">' + esc(r.name) + (r.from ? ' <span class="tag">' + r.from + " lines combined</span>" : "") + "</span>" + chipFor(r) +
      '<span class="mt">' + esc(stateLine(r)) + '</span><span class="mt">' + recv + "</span>";
    if (r.from) h += '<span class="sr-note" data-sum>' + sumLine(r) + "</span>";
    return h + body + "</div></div></li>";
  }
  function extraRow(x) {
    var a = S.X[x.id], b = function (v, t, s) { return '<button class="sr-pill" data-act="extra" data-id="' + x.id + '" data-v="' + v + '" aria-pressed="' + (a.add === (v === "add")) + '"><b>' + t + "</b><small>" + s + "</small></button>"; };
    return '<li data-id="' + x.id + '" data-k="extra"><div class="row"><span class="sr-em" aria-hidden="true">' + esc(x.name.charAt(0)) + '</span><div class="rmain"><span class="nm">' + esc(x.name) + "</span>" + chip("extra", a.add ? "Not on your list, added" : "Not on your list, left out") +
      '<span class="mt">Receipt: ' + esc(x.raw.join(" + ")) + '.</span><div class="sr-ch" role="group" aria-label="' + esc(x.name) + '">' + b("add", "Add", "Bought, once") + b("leave", "Leave out", "Not added") + "</div>" + (a.add ? stepper(x, a, false) : "") + "</div></div></li>";
  }

  /* ---------- totals ---------- */
  function totals() {
    var t = { add: 0, fix: 0, keep: 0, pend: 0, again: [], fixed: [], kept: [], added: [], left: [] };
    D.rows.forEach(function (r) {
      var a = S.R[r.id];
      if (isDone(r)) {
        if (a.mode === "fix") { t.fix++; t.fixed.push(r.name + ": " + F(r.pantry) + " to " + F(r.rcpt)); }
        else if (a.mode === "again") { t.add++; t.added.push(r.name + " " + F(a) + " (another one)"); }
        else { t.keep++; t.kept.push(r.name + " (Pantry keeps " + F(r.pantry) + ")"); }
      } else if (pending(r)) t.pend++;
      else { t.add++; t.added.push(r.name + " " + F(a)); }
    });
    D.extra.forEach(function (x) { if (S.X[x.id].add) { t.add++; t.added.push(x.name + " " + F(S.X[x.id]) + " (not on your list)"); } else t.left.push(x.name); });
    return t;
  }

  /* ---------- groups per option ---------- */
  var byId = function (id) { return D.rows.concat(D.extra).filter(function (r) { return r.id === id; })[0]; };
  function grp(title, small) { return '<div class="sr-grp"><span>' + title + "</span><small>" + small + "</small></div>"; }
  function list(rows) { return '<ul class="rows">' + rows.map(row).join("") + "</ul>"; }
  function fold(key, glyph, title, rest, rows, extra) {
    var o = S.open.indexOf(key) > -1;
    return '<button class="sr-fold" data-act="fold" data-v="' + key + '" aria-expanded="' + o + '">' + ic("chev") + "<span><b>" + title + "</b> " + rest + "</span></button>" + (o ? (extra ? '<ul class="rows">' + rows.map(extraRow).join("") + "</ul>" : list(rows)) : "");
  }
  function review() {
    var h = "";
    if (opt === "a") {
      h += grp("In receipt order", D.order.length + " lines read");
      h += '<ul class="rows">' + D.order.map(function (id) { var x = D.extra.filter(function (e) { return e.id === id; })[0]; return x ? extraRow(x) : row(byId(id)); }).join("") + "</ul>";
    } else if (opt === "b") {
      h += grp("In list order", D.rows.length + " list rows");
      h += list(D.rows);
      h += grp("Not on your list", D.extra.length + " line");
      h += '<ul class="rows">' + D.extra.map(extraRow).join("") + "</ul>";
    } else {
      var top = D.rows.filter(function (r) { var k = kind(r); return k === "unit" || k === "differ" || k === "fill"; });
      var agree = D.rows.filter(function (r) { return kind(r) === "ok"; }), had = D.rows.filter(isDone);
      var keeps = had.filter(function (r) { return S.R[r.id].mode === "keep"; }).length;
      h += grp("Needs you", top.length + " of " + (D.rows.length + D.extra.length));
      h += list(top);
      h += grp("Nothing to decide", "folded");
      h += fold("agree", "ok", agree.length + " agree with your list", "&middot; " + agree.map(function (r) { return esc(r.name); }).join(", "), agree);
      h += '<div class="sr-gap"></div>';
      var added = D.extra.filter(function (x) { return S.X[x.id].add; }).length;
      h += '<div class="sr-gap"></div>';
      h += fold("extra", "extra", D.extra.length + " not on your list", "&middot; " + added + " added" + (D.extra.length - added ? ", " + (D.extra.length - added) + " left out" : ""), D.extra, true);
      h += '<div class="sr-gap"></div>';
      h += fold("pantry", "done", had.length + " already in your Pantry", "&middot; " + keeps + " not added again" + (had.length - keeps ? ", " + (had.length - keeps) + " changed" : ""), had);
    }
    return h;
  }
  function bar(t) {
    var msg = t.pend ? "<b>" + t.pend + " to answer</b> before you add" : "<b>Adds " + t.add + "</b>" + (t.fix ? ", fixes " + t.fix : "") + (t.keep ? ", " + t.keep + " not added again" : "");
    return '<div class="sr-bar"><p>' + msg + '</p><button class="btn pri" data-act="commit"' + (t.pend ? " disabled" : "") + ">" + ic("cart", 18) + "Add " + t.add + " to the Pantry</button></div>";
  }
  function doneView(t) {
    var list = function (title, a) { return a.length ? "<h2>" + title + "</h2><ul class=\"sr-sum\">" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; };
    if (S.undone) return '<div class="sr-done"><h1>Undone</h1><p>Nothing changed in your Pantry. The receipt is still open.</p><button class="btn" data-act="redo">Add them again</button></div>';
    return '<div class="sr-done"><span class="sr-chip" data-k="ok">' + ic("check") + "Done</span><h1>Receipt added</h1><p>Your list stays as it is.</p></div>" +
      '<div class="sr-sumbox">' + list("Added", t.added) + list("Pantry amount fixed", t.fixed) + list("Not added again", t.kept) + list("Left out", t.left) + "</div>";
  }

  function render() {
    var f = document.activeElement, key = f && f.dataset && f.dataset.act ? '[data-act="' + f.dataset.act + '"]' + (f.dataset.id ? '[data-id="' + f.dataset.id + '"]' : "") + (f.dataset.v ? '[data-v="' + f.dataset.v + '"]' : "") : null;
    var t = totals(), name = { a: "A &middot; Receipt order", b: "B &middot; List order", c: "C &middot; Only what needs you" }[opt];
    var h;
    if (S.step === "done") {
      h = '<main class="sr-page"><header class="hd"><h1>Shopping</h1><span class="tag">' + name + "</span></header>" + doneView(t) + "</main>";
      if (!S.undone) h += '<div class="toast" role="status">Added ' + t.add + (t.fix ? ", fixed " + t.fix : "") + '. <button class="sr-was" data-act="undo">Undo</button></div>';
      else h += '<div class="toast" role="status">Undone.</div>';
    } else {
      h = '<main class="sr-page"><header class="hd"><h1>Check the receipt</h1><span class="tag">' + name + '</span></header>' +
        '<p class="sr-sub">Your list is still open. Ticks and swipes stay as they are. Nothing goes to the Pantry until you add.</p>' + review() + "</main>" + bar(t);
    }
    app.innerHTML = h;
    if (key) { var n = app.querySelector(key); if (n) n.focus(); }
  }

  /* ---------- actions ---------- */
  function setUnit(r, a, u) {
    var c = CONV[(a.u || "") + ">" + u];
    if (c) a.q = Math.round(a.q * c * 1000) / 1000;
    a.u = u;
    if (a.src !== null && a.src !== "edit") a.src = "edit";
  }
  app.addEventListener("change", function (e) {
    var t = e.target; if (!t.classList.contains("sr-in")) return;
    var r = byId(t.dataset.id), a = S.R[r.id], v = parseFloat(String(t.value).replace(",", "."));
    if (isFinite(v) && v >= 0 && /^\s*\d*[.,]?\d*\s*$/.test(t.value)) { a.q = Math.round(v * 1000) / 1000; if (!isDone(r)) { a.src = "edit"; a.typed = true; } }
    render();
  });
  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
    var act = b.dataset.act, id = b.dataset.id, v = b.dataset.v, r = id ? byId(id) : null, a = r ? S.R[id] : null;
    if (act === "inc" || act === "dec") {
      var d = step(a.u) * (act === "inc" ? 1 : -1); a.q = Math.max(0, Math.round((a.q + d) * 1000) / 1000);
      if (!isDone(r)) a.src = "edit";
    } else if (act === "unit") setUnit(r, a, v);
    else if (act === "src") {
      a.src = v; a.typed = false;
      if (v === "list") { a.q = r.list.q; a.u = r.list.u; } else { a.q = r.rcpt.q; a.u = r.rcpt.bare ? "" : r.rcpt.u; }
    } else if (act === "mode") { a.mode = v; if (v === "again") { a.q = r.rcpt.q; a.u = r.rcpt.u; } }
    else if (act === "extra") S.X[id].add = v === "add";
    else if (act === "fold") { var i = S.open.indexOf(v); if (i > -1) S.open.splice(i, 1); else S.open.push(v); }
    else if (act === "commit") { S.step = "done"; S.undone = false; }
    else if (act === "undo") S.undone = true;
    else if (act === "redo") S.undone = false;
    render();
  });
  render();
})();
