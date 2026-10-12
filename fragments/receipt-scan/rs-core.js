/* Receipt scan mockup: shared logic and shared screens (entry, capture, reading, the line detail, the summary, done, edge states).
   No size rules here: anything that depends on the viewport is in rs.phone.js or rs.desktop.js (DESIGN.md section 7). The review screen itself is drawn by the option's own file (view-a.js ... view-d.js).
   Mockup only: nothing is saved, nothing is read from a real image. Names and numbers come from rs-data.js. */
(function () {
  "use strict";
  var D = window.RSD, Q = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var P = function (id) { return D.pantry.filter(function (p) { return p.id === id; })[0]; };
  var L = function (id) { return D.lines.filter(function (l) { return l.id === id; })[0]; };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
  var opt = document.body.dataset.opt || "a";
  var DESK = function () { return matchMedia("(min-width:1024px)").matches; };
  var DEFCONF = { a: "pips", b: "bars", c: "ring", d: "pips" };

  var S = { opt: opt, step: Q.get("step") || "entry", state: Q.get("state") || "", sel: Q.get("sel") || null, open: Q.get("open") || null,
    filter: Q.get("filter") || "all", conf: Q.get("conf") || DEFCONF[opt], res: {}, q: {}, nm: {}, split: {}, menu: Q.get("menu") === "1", commit: false, sheet: false,
    photo: Q.get("photo") === "1", toast: null, undone: false, q2: Q.get("q") || "", card: 0, keys: true };
  var RS = window.RS = { S: S, D: D, views: {}, vp: {}, $: $, $$: $$, P: P, L: L, esc: esc, opt: opt, DESK: DESK };

  /* ---------- icons (one stroke family, like the app's) ---------- */
  var IC = {
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M5 18l5-5 4 4 2-2 3 3"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', up: '<path d="M12 19V6M6 11l6-6 6 6"/>',
    q: '<path d="M9.5 9.5a2.5 2.5 0 115 0c0 2-2.5 2.2-2.5 4.2"/><path d="M12 17.3v.4"/>', approx: '<path d="M5 9c2-2 4-2 7 0s5 2 7 0M5 15c2-2 4-2 7 0s5 2 7 0"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', undo: '<path d="M9 7L5 11l4 4"/><path d="M5 11h9a5 5 0 010 10h-3"/>', chev: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>', swap: '<path d="M7 8h11l-3-3M17 16H6l3 3"/>', pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>', strike: '<path d="M4 12h16"/>',
    layers: '<path d="M12 4l8 4-8 4-8-4zM4 12l8 4 8-4"/>', warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.4"/>', minus: '<path d="M5 12h14"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/>', pantry: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/>', cook: '<path d="M6 14a4 4 0 114-5 4 4 0 118 1 4 4 0 01-2 4v4H8v-4z"/>', cart: '<path d="M4 5h2l2 10h9l2-7H8"/><circle cx="10" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/>',
    drop: '<path d="M12 4v11M7 10l5 5 5-5M5 19h14"/>', lock: '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/>', wifi: '<path d="M3 9a14 14 0 0118 0M6 12.5a9 9 0 0112 0M9 16a4.5 4.5 0 016 0"/><path d="M12 19.5v.1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>', list: '<path d="M8 7h11M8 12h11M8 17h11M4.5 7h.1M4.5 12h.1M4.5 17h.1"/>', hand: '<path d="M8 12V6a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6a1.5 1.5 0 013 0v7a6 6 0 01-6 6 5 5 0 01-4-2l-3-4a1.5 1.5 0 012.2-2L8 14"/>'
  };
  var ic = function (n, s) { s = s || 20; return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + "</svg>"; };
  RS.ic = ic;
  /* five hand-drawn scribbles, the Shopping list's (flows/household/app.js); one is picked per line from its id */
  var SCR = ["M2 8 C20 3 40 11 60 5 S90 9 98 4", "M2 5 L98 9 M4 9 L96 4 M2 7 L98 6", "M1 7 C15 2 25 12 40 6 S70 2 99 8", "M2 4 C30 10 50 2 98 7 M3 9 C40 3 70 11 97 5", "M2 6 L10 3 L18 9 L28 3 L38 9 L50 3 L62 9 L74 3 L86 9 L98 5"];
  RS.scrib = function (id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return SCR[h % SCR.length]; };

  /* ---------- quantities ---------- */
  var fmtN = function (n) { return String(Math.round(n * 1000) / 1000); };
  var fmt = function (n, u) { return fmtN(n) + (u ? " " + u : ""); };
  var toU = function (q, u, to) { if (!to || u === to) return q; var m = { "kg>g": 1000, "L>mL": 1000, "g>kg": .001, "mL>L": .001 }[u + ">" + to]; return m ? q * m : q; };
  var qOf = function (l) { return S.q[l.id] != null ? S.q[l.id] : l.q; };
  var step = function (u) { return u === "g" || u === "mL" ? 50 : u === "kg" || u === "L" ? .5 : 1; };
  RS.fmt = fmt; RS.qOf = qOf;

  var band = function (s) { return s >= .85 ? "hi" : s >= .6 ? "mid" : "lo"; };
  var BW = { hi: "Very likely", mid: "Likely", lo: "Weak guess" };
  /* ---------- the one rule for what a line will do (RS-D5 to RS-D9) ---------- */
  var defMode = function (id) { var p = P(id); return p && p.use ? "newb" : "top"; }; /* an item with a use by gets a new item: a new carton has its own date (RS-D8) */
  function out(l) {
    var r = S.res[l.id];
    if (l.st === "skip") return r && r.k === "add" ? { k: "new", own: true } : { k: "skip" };
    if (r && r.k === "skip") return { k: "skip" };
    if (r && r.k === "new") return { k: "new", own: true };
    if (l.st === "exact" || (r && (r.k === "match" || r.k === "pick"))) {
      var m = r && r.k === "pick" ? r.pick : l.m, mode = (r && r.mode) || defMode(m);
      return { k: mode === "top" ? "top" : "newb", m: m, picked: r && r.k === "pick" };
    }
    return { k: "open" };
  }
  RS.out = out;
  function info(l) {
    var o = out(l), p = o.m && P(o.m), q = qOf(l), nm = S.nm[l.id] != null ? S.nm[l.id] : l.guess;
    var x = { k: o.k, m: o.m, name: p ? p.name : nm, ex: l.st === "exact" };
    if (o.k === "top") { var add = toU(q, l.u, p.u), tu = p.u || l.u; x.label = p.out ? "Back in stock" : "Top up"; x.g = "up"; x.detail = fmt(p.q, p.u) + " → " + fmt(p.q + add, p.u); x.add = add; }
    else if (o.k === "newb") { x.label = "New item"; x.g = "plus"; x.detail = fmt(q, l.u) + ", keeps " + p.name + " as it is"; }
    else if (o.k === "new") { x.label = "New item"; x.g = "plus"; x.detail = (nm || "Unnamed") + ", " + fmt(q, l.u); }
    else if (o.k === "skip") { x.label = "Not added"; x.g = "x"; x.detail = l.st === "skip" ? l.short : "Left out"; }
    else if (l.st === "fuzzy") { x.label = "Check"; x.g = "approx"; x.detail = BW[band(l.score)]; }
    else { x.label = "New?"; x.g = "q"; x.detail = l.unclear ? "Unclear text" : "Not in your Pantry"; }
    return x;
  }
  RS.info = info;
  var items = function () { return D.lines.filter(function (l) { return l.st !== "skip" || out(l).k !== "skip"; }); };
  function tally() { var t = { top: 0, newb: 0, new: 0, open: 0, skip: 0, check: 0, newq: 0 }; D.lines.forEach(function (l) { var k = out(l).k; t[k]++; if (k === "open") { if (l.st === "fuzzy") t.check++; else t.newq++; } }); t.ready = t.top + t.newb + t.new; return t; }
  RS.tally = tally;

  /* ---------- the confidence indicator: one confidence per line, shown as a band (RS-D12). Never drawn like the Pantry battery (RS-D13). ---------- */
  RS.band = band; RS.BW = BW;
  RS.conf = function (l, style) {
    var b = band(l.score), n5 = { hi: 5, mid: 3, lo: 1 }[b], n3 = { hi: 3, mid: 2, lo: 1 }[b], lab = "Match: " + BW[b] + (style === "bars" ? ", " + n3 + " of 3 bars" : style === "ring" ? "" : ", " + n5 + " of 5 dots");
    style = style || S.conf;
    if (style === "bars") return '<span class="cf bars" data-b="' + b + '" role="img" aria-label="' + lab + '">' + [1, 2, 3].map(function (i) { return "<i" + (i <= n3 ? ' class="on"' : "") + "></i>"; }).join("") + "</span>";
    if (style === "ring") { var c = 2 * Math.PI * 8, f = { hi: 1, mid: .66, lo: .33 }[b]; return '<span class="cf ring" data-b="' + b + '" role="img" aria-label="' + lab + '"><svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" class="t"/><circle cx="11" cy="11" r="8" class="v" stroke-dasharray="' + (c * f).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 11 11)"/></svg></span>'; }
    return '<span class="cf pips" data-b="' + b + '" role="img" aria-label="' + lab + '">' + [1, 2, 3, 4, 5].map(function (i) { return "<i" + (i <= n5 ? ' class="on"' : "") + "></i>"; }).join("") + "</span>";
  };

  /* ---------- small parts shared by every option ---------- */
  var lc = function (n) { return /^[A-Z][a-z]/.test(n) ? n.charAt(0).toLowerCase() + n.slice(1) : n; };
  RS.lc = lc;
  var raw = function (l) { return '<span class="rs-raw">' + l.raw.map(esc).join("<br>") + "</span>"; };
  var chip = function (l) { var x = info(l); return '<span class="rs-chip" data-k="' + x.k + '" data-st="' + l.st + '">' + ic(x.g, 14) + "<b>" + x.label + "</b></span>"; };
  var stepper = function (l) { var u = l.u; return '<span class="rs-step" role="group" aria-label="Quantity"><button type="button" class="rs-sb" data-act="qm" data-id="' + l.id + '" aria-label="Less">' + ic("minus", 16) + '</button><output>' + fmt(qOf(l), u) + '</output><button type="button" class="rs-sb" data-act="qp" data-id="' + l.id + '" aria-label="More">' + ic("plus", 16) + "</button></span>"; };
  var money = function (n) { return (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2); };
  RS.parts = { raw: raw, chip: chip, stepper: stepper, money: money };
  var kc = function (k) { return '<span class="kbd cap">' + k + "</span>"; };
  RS.kc = kc;
  var btn = function (act, id, label, cls, g, key) { return '<button type="button" class="rs-b ' + (cls || "") + '" data-act="' + act + '" data-id="' + id + '">' + (g ? ic(g, 18) : "") + "<span>" + label + "</span>" + (key ? kc(key) : "") + "</button>"; };
  RS.btn = btn;

  /* the quick actions for a line, by what it is. Every state has one tap path. */
  RS.acts = function (l, o) {
    o = o || {}; var k = out(l).k, p = l.m && P(l.m), id = l.id, key = DESK() && S.keys;
    if (l.st === "skip") return k === "skip" ? btn("add", id, "This is an item", "ghost sm", "plus") : btn("undo", id, "Leave it out", "ghost sm", "undo");
    if (k === "open" && l.st === "fuzzy") return btn("match", id, o.short ? "Yes" : "Yes, it’s " + p.name, "pri sm", "check", key && "Y") + btn("new", id, o.short ? "New" : "No, new item", "sm", "plus", key && "N");
    if (k === "open") return btn("new", id, "Add as new", "pri sm", "check", key && "Y") + btn("skip", id, "Not an item", "sm", "x", key && "X");
    return btn("undo", id, "Change", "ghost sm", "pencil");
  };

  /* ---------- the line detail: shared by the phone's inline expansion, the phone's sheet and the desktop's right lane ---------- */
  RS.detail = function (l) {
    var x = info(l), o = out(l), p = l.m && P(l.m), h = "", key = DESK() && S.keys, id = l.id;
    h += '<div class="rs-det" data-id="' + id + '">';
    h += '<div class="rs-read"><span class="rs-lbl">On the receipt</span><div class="rs-print">' + l.raw.map(function (r) { return "<div>" + esc(r) + "</div>"; }).join("") + '</div><span class="rs-price">' + money(l.price) + "</span></div>";
    if (l.st !== "skip") h += '<p class="rs-how">' + ic("receipt", 14) + "<span>" + esc(l.note) + "</span></p>";
    if (l.st === "skip") { h += '<p class="rs-why">' + esc(l.why) + "</p>"; h += '<div class="rs-acts">' + RS.acts(l) + "</div></div>"; return h; }
    if (l.st === "fuzzy" && o.k === "open") {
      var b = band(l.score);
      h += '<div class="rs-sug" data-b="' + b + '"><span class="rs-lbl">Closest in your Pantry</span><div class="rs-it">' + itemTile(p) + '<span class="rs-cw">' + RS.conf(l) + "<em>" + BW[b] + "</em></span></div></div>";
    }
    if (o.k === "top" || o.k === "newb") {
      var m = P(o.m);
      h += '<div class="rs-sug rs-res"><span class="rs-lbl">' + (l.st === "exact" ? "Exact match" : "You chose") + '</span><div class="rs-it">' + itemTile(m) + "</div>";
      h += '<div class="rs-seg" role="radiogroup" aria-label="What happens"><button type="button" role="radio" aria-checked="' + (o.k === "top") + '" data-act="mode" data-id="' + id + '" data-v="top">' + ic("up", 16) + "<span>Top up</span>" + (key ? kc("T") : "") + '</button><button type="button" role="radio" aria-checked="' + (o.k === "newb") + '" data-act="mode" data-id="' + id + '" data-v="newb">' + ic("plus", 16) + "<span>New item</span></button></div>";
      h += '<p class="rs-eff">' + (o.k === "top" ? "<b>" + m.name + "</b> goes " + x.detail + "." : "A new <b>" + m.name + "</b> of " + fmt(qOf(l), l.u) + " is added with its own use by. The one you have stays " + fmt(m.q, m.u) + ".") + "</p></div>";
    }
    if (o.k === "new" || o.k === "open" && l.st === "none") {
      h += '<label class="rs-lbl" for="nm-' + id + '">New item name</label><input id="nm-' + id + '" class="rs-in" data-nm="' + id + '" value="' + esc(S.nm[id] != null ? S.nm[id] : l.guess || "") + '" placeholder="' + (l.unclear ? "What is it? The text was unclear" : "Name") + '" autocomplete="off">';
    }
    if (l.st === "fuzzy" && o.k !== "new") {
      var cs = [l.m].concat(l.cand || []).filter(function (c) { return c !== o.m; });
      h += '<div class="rs-cands"><span class="rs-lbl">' + (o.k === "open" ? "Or pick another item" : "Pick another item") + '</span><div class="rs-cl">' + cs.map(function (c) { return '<button type="button" class="rs-cc" data-act="pick" data-id="' + id + '" data-v="' + c + '">' + (P(c).em || "•") + " " + esc(P(c).name) + "</button>"; }).join("") + '<button type="button" class="rs-cc" data-act="find" data-id="' + id + '">' + ic("pencil", 14) + " Search the Pantry</button></div></div>";
    }
    h += '<div class="rs-qrow"><span class="rs-lbl">Amount bought</span>' + stepper(l) + '<span class="rs-un">' + (l.from && !S.split[id] ? '<button type="button" class="rs-lk" data-act="split" data-id="' + id + '">' + ic("layers", 14) + " Combined from " + l.from + " lines. Keep separate</button>" : l.from ? '<button type="button" class="rs-lk" data-act="split" data-id="' + id + '">' + ic("layers", 14) + " Kept separate. Combine again</button>" : "") + "</span></div>";
    h += '<div class="rs-acts">' + RS.acts(l) + "</div>";
    if (l.st === "fuzzy" && o.k === "open") h += '<p class="rs-fine">Not this one makes a new item called “' + esc(l.guess) + "”. Nothing changes until you add to the Pantry.</p>";
    h += "</div>"; return h;
  };
  function itemTile(p) { return '<span class="rs-itile"><span class="rs-em">' + (p.em || ic("pantry", 20)) + '</span><span class="rs-itx"><b>' + esc(p.name) + "</b><small>" + (p.out ? "Out, " : "") + fmt(p.q, p.u) + " · " + p.place + (p.use ? " · use by " + p.use + (p.use === 1 ? " day" : " days") : "") + "</small></span></span>"; }
  RS.itemTile = itemTile;

  /* ---------- the Pantry behind (the page the flow starts from and ends on) ---------- */
  function pantryHtml(menu) {
    var rows = {}, fresh = S.step === "done" && !S.undone, ov = {};
    if (fresh) D.lines.forEach(function (l) { var o = out(l), x = info(l); if (o.k === "top") ov[o.m] = x.detail; });
    D.pantry.filter(function (p) { return !p.out || ov[p.id]; }).forEach(function (p) { var a = p.place.split(" · ")[0]; (rows[a] = rows[a] || []).push(p); });
    var news = fresh ? D.lines.filter(function (l) { return out(l).k === "new" || out(l).k === "newb"; }) : [], own = news.filter(function (l) { return out(l).k === "new"; });
    news = news.filter(function (l) { return out(l).k === "newb"; });
    var cnt = D.pantry.filter(function (p) { return !p.out; }).length + (fresh ? news.length + own.length : 0);
    var h = '<div class="hd"><span class="count">' + cnt + ' items</span><div class="rs-addw"><button type="button" class="btn pri" data-act="add" aria-haspopup="' + (opt === "c" ? "menu" : "dialog") + '"' + (opt === "c" ? ' aria-expanded="' + !!menu + '"' : "") + ">+ Add" + (opt === "c" ? ic("down", 16) : "") + (DESK() && S.keys ? '<span class="kbd cap">+</span>' : "") + "</button>" + (menu ? '<div class="rs-menu" role="menu"><button type="button" role="menuitem" data-act="addone">' + ic("pencil", 18) + "<span>Add one item</span></button><button type=\"button\" role=\"menuitem\" data-act=\"scan\">" + ic("receipt", 18) + "<span>Add from a receipt</span></button></div>" : "") + "</div></div>";
    ["Fridge", "Pantry", "Freezer"].forEach(function (a) {
      if (!rows[a]) return;
      h += '<div class="grp"><b>' + a + '</b><span class="tag">' + rows[a].length + '</span></div><ul class="rows">';
      rows[a].forEach(function (p) { h += '<li><div class="row"><span class="rmain"><span class="nm">' + (p.em ? p.em + " " : "") + esc(p.name) + '</span><span class="mt">' + (ov[p.id] ? "" : p.place + " · ") + (ov[p.id] ? '<b class="rs-new">' + ov[p.id] + "</b>" : fmt(p.q, p.u)) + "</span></span>" + (ov[p.id] ? '<span class="rs-just">Topped up</span>' : p.use ? '<span class="due">Use within<br>' + p.use + (p.use === 1 ? " day" : " days") + "</span>" : "") + "</div></li>"; });
      if (fresh) news.filter(function (l) { return P(out(l).m).place.split(" \u00B7 ")[0] === a; }).forEach(function (l) { var x = info(l), p = P(out(l).m); h += '<li><div class="row"><span class="rmain"><span class="nm">' + (p.em ? p.em + " " : "") + esc(x.name) + '</span><span class="mt">' + fmt(qOf(l), l.u) + " \u00B7 " + p.place + '</span></span><span class="rs-just">Added</span></div></li>'; });
      h += "</ul>";
    });
    if (own.length) { h += '<div class="grp"><b>Where do these go?</b><span class="tag">' + own.length + '</span></div><ul class="rows">'; own.forEach(function (l) { var x = info(l); h += '<li><div class="row"><span class="rmain"><span class="nm">' + esc(x.name) + '</span><span class="mt">' + fmt(qOf(l), l.u) + ' \u00B7 no place yet</span></span><span class="rs-just">Added</span></div></li>'; }); h += "</ul>"; }
    return h;
  }
  RS.pantryHtml = pantryHtml;
  var addForm = function () { return '<div class="rs-form" aria-hidden="true"><span class="rs-lbl">Item</span><div class="rs-frow"><span class="rs-emt">+</span><span class="rs-fld">What is it?</span></div><span class="rs-lbl">Amount</span><span class="rs-fld">In your own words, e.g. a handful</span></div>'; };

  /* ---------- the entry, one per option (RS-D1) ---------- */
  function addSheet() {
    var d = DESK(), key = d && S.keys;
    var head = '<div class="rs-sh"><h2>Add an item</h2><button type="button" class="x ib" data-act="closepanel" aria-label="Close"><svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' + IC.x + "</svg></button></div>";
    if (opt === "a") return head + '<div class="rs-tabs" role="tablist"><button type="button" role="tab" aria-selected="true">' + ic("pencil", 18) + 'One item</button><button type="button" role="tab" aria-selected="false" data-act="scan">' + ic("receipt", 18) + 'From a receipt' + (key ? kc("R") : "") + "</button></div>" + addForm();
    if (opt === "b") return head + '<button type="button" class="rs-scan-tile" data-act="scan">' + '<span class="rs-st-ic">' + ic("camera", 26) + '</span><span class="rs-st-tx"><b>Scan a receipt</b><small>Add what you bought in one go</small></span>' + (key ? kc("R") : ic("chev", 18)) + "</button><p class=\"rs-or\">or add one item</p>" + addForm();
    if (opt === "d") return head + '<span class="rs-lbl">Item</span><div class="rs-frow"><span class="rs-emt">+</span><span class="rs-fld rs-fld-cam"><span>What is it?</span><button type="button" class="rs-cam" data-act="scan" aria-label="Scan a receipt instead">' + ic("camera", 22) + (key ? kc("R") : "") + "</button></span></div>" + (d ? '<p class="rs-hint">' + ic("drop", 16) + "<span>Drop a photo of a receipt anywhere, or paste it (" + kc("Ctrl V") + "), and it opens here.</span></p>" : '<p class="rs-hint">' + ic("camera", 16) + "<span>Tap the camera to add a whole receipt at once.</span></p>") + '<span class="rs-lbl">Amount</span><span class="rs-fld">In your own words, e.g. a handful</span>';
    return head + addForm();
  }

  /* ---------- capture, reading, nothing found ---------- */
  var tips = function () { return '<ul class="rs-tips"><li>' + ic("receipt", 20) + "<span>Flat, the whole receipt in view</span></li><li>" + ic("sun", 20) + "<span>Good light, no shadow</span></li><li>" + ic("layers", 20) + "<span>Long receipt? Take two photos</span></li></ul>"; };
  function captureHtml() {
    var d = DESK(), st = S.state, h = '<div class="rs-sh"><h2>Scan a receipt</h2><button type="button" class="x ib" data-act="closepanel" aria-label="Close"><svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' + IC.x + "</svg></button></div>";
    if (st === "download") return h + '<div class="rs-note"><span class="rs-ni">' + ic("drop", 22) + '</span><div><b>One-time download, about 16 MB</b><p>Reading a receipt happens on this ' + (d ? "computer" : "phone") + ", so it needs its reader once. After that it works without a connection. You are on mobile data.</p></div></div><div class=\"rs-acts col\"><button type=\"button\" class=\"rs-b pri\" data-act=\"dl\">" + ic("drop", 18) + "<span>Download and continue</span></button><button type=\"button\" class=\"rs-b\" data-act=\"closepanel\"><span>Not now, add by hand</span></button></div>" + '<p class="rs-fine">Nothing leaves the ' + (d ? "computer" : "phone") + ": the photo is read here and then thrown away.</p>";
    if (st === "offline") return h + '<div class="rs-note warn"><span class="rs-ni">' + ic("wifi", 22) + '</span><div><b>No connection, and the reader is not saved yet</b><p>Reading needs a one-time download. Connect once and it stays for next time. Until then you can add the items by hand, or tick them off your shopping list.</p></div></div><div class="rs-acts col"><button type="button" class="rs-b pri" data-act="closepanel"><span>Add by hand</span></button><button type="button" class="rs-b" data-act="retry"><span>Try again</span></button></div>';
    if (st === "perm") h += '<div class="rs-note warn"><span class="rs-ni">' + ic("lock", 22) + '</span><div><b>The camera is blocked for Kitchie</b><p>Allow the camera in the browser’s site settings, or choose a photo you already took.</p></div></div>';
    if (S.photo) {
      h += '<div class="rs-thumbs"><div class="rs-thumb" aria-label="Photo 1">' + paper(false) + "</div>" + '<button type="button" class="rs-thumb add" data-act="more">' + ic("plus", 22) + "<span>Add the other half</span></button></div>";
      if (st === "dark") h += '<div class="rs-note warn"><span class="rs-ni">' + ic("sun", 22) + '</span><div><b>Quite dark. It may read badly</b><p>Move to the light or turn a lamp on, then retake. Or read it anyway and check the lines.</p></div></div>';
      return h + '<div class="rs-acts col"><button type="button" class="rs-b pri" data-act="read">' + ic("receipt", 18) + "<span>Read the receipt</span></button><button type=\"button\" class=\"rs-b\" data-act=\"retake\"><span>Retake</span></button></div>";
    }
    h += '<div class="rs-vf" aria-hidden="true">' + paper(false) + "</div>";
    if (d) h += '<div class="rs-drop" data-drop><span class="rs-di">' + ic("drop", 30) + "</span><b>Drop a photo of the receipt here</b><small>or paste it with " + kc("Ctrl V") + "</small><button type=\"button\" class=\"rs-b pri\" data-act=\"choose\">" + ic("image", 18) + "<span>Choose a file</span></button></div>";
    else h += '<div class="rs-acts col cap2"><button type="button" class="rs-b pri big" data-act="take"' + (st === "perm" ? " disabled" : "") + ">" + ic("camera", 22) + "<span>Take a photo</span></button><button type=\"button\" class=\"rs-b big\" data-act=\"choose\">" + ic("image", 22) + "<span>Choose a photo</span></button></div>";
    return h + tips() + '<p class="rs-fine">' + ic("lock", 14) + " Read on this " + (d ? "computer" : "phone") + ". The photo is not sent anywhere or kept.</p>";
  }
  function paper(big) { return '<div class="rs-paper' + (big ? " big" : "") + '" aria-hidden="true">' + [70, 55, 80, 60, 75, 45, 66, 52, 78, 40].map(function (w, i) { return '<i style="width:' + w + '%"></i>'; }).join("") + "</div>"; }
  RS.paper = paper;
  function readingHtml() { var n = S.state === "slow" ? 28 : 62; return '<div class="rs-sh"><h2>Reading…</h2><button type="button" class="x ib" data-act="cancelread" aria-label="Cancel"><svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' + IC.x + '</svg></button></div><div class="rs-read-wrap">' + paper(true) + '<div class="rs-scanbar" style="top:' + n + '%"></div></div><div class="rs-prog" role="progressbar" aria-valuenow="' + n + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + n + '%"></i></div><div class="rs-piles" aria-hidden="true"><span data-k="top">' + ic("check", 14) + " 5 look right</span><span data-k=\"open\">" + ic("approx", 14) + " 3 to check</span><span data-k=\"none\">" + ic("q", 14) + ' 1 new?</span></div><p class="rs-lbl" style="text-align:center">Reading line ' + Math.round(n / 100 * 14) + " of about 14</p><p class=\"rs-fine\">" + ic("lock", 14) + " The photo stays on this " + (DESK() ? "computer" : "phone") + ".</p><div class=\"rs-acts col\"><button type=\"button\" class=\"rs-b\" data-act=\"cancelread\"><span>Cancel</span></button></div>"; }
  function nothingHtml() { return '<div class="rs-empty"><div class="rs-qr">' + paper(true) + '<span class="rs-qm">' + ic("q", 34) + '</span></div><h2>Couldn’t find any items</h2><p>The photo may be too dark, too far away, or not a till receipt. Nothing has been added.</p><ul class="rs-tips tight"><li>' + ic("sun", 18) + "<span>Try again in better light</span></li><li>" + ic("receipt", 18) + "<span>Fill the frame with the receipt</span></li></ul><div class=\"rs-acts col\"><button type=\"button\" class=\"rs-b pri\" data-act=\"retake\">" + ic("camera", 18) + "<span>Try another photo</span></button><button type=\"button\" class=\"rs-b\" data-act=\"addone\">" + ic("pencil", 18) + '<span>Add items by hand</span></button></div></div>'; }
  RS.nothingHtml = nothingHtml;

  /* ---------- the banner that sits above any review (low quality, duplicates, discounts) ---------- */
  RS.banner = function () {
    var h = "", t = tally();
    if (S.state === "lowq") h += '<div class="rs-note warn" role="status"><span class="rs-ni">' + ic("warn", 22) + "</span><div><b>Hard to read. 5 of 14 lines were unclear</b><p>The photo is a little blurry. Check the amber lines, or <button type=\"button\" class=\"rs-lk\" data-act=\"retake\">retake the photo</button>.</p></div></div>";
    h += '<p class="rs-sumline">' + ic("receipt", 16) + "<span>14 lines read" + (D.lines.some(function (l) { return l.from; }) ? ", 2 merged into one" : "") + ". " + D.ignored.length + " total and header lines ignored.</span></p>";
    return h;
  };

  /* the page header and the phone's sticky bar, shared by every option's review */
  RS.head = function (sub) { return '<header class="rs-rh"><button type="button" class="ib" data-act="cancelreview" aria-label="Back to the Pantry">' + ic("back", 20) + "</button><div class=\"rs-rt\"><h1>Receipt</h1><span>" + sub + "</span></div></header>"; };
  RS.bar = function () { var t = tally(), n = t.ready; return '<div class="rs-bar"><div class="rs-bt"><b>' + n + " ready</b><span>" + (t.open ? t.open + " to check" : "all checked") + '</span></div><button type="button" class="rs-b pri" data-act="commit">' + ic("check", 18) + "<span>Review and add " + n + "</span></button></div>"; };
  RS.nameOf = function (l) { var o = out(l), x = info(l); if (o.k === "open") return l.st === "fuzzy" ? P(l.m).name : (l.guess || "Unclear text"); return x.name || l.raw[0]; };
  RS.glyph = function (l) { var x = info(l); return '<span class="rs-g" data-k="' + x.k + '" data-st="' + l.st + '">' + ic(x.g, 18) + "</span>"; };

  /* ---------- the summary (the commit step) ---------- */
  function entries() { var e = { top: [], news: [], skip: [], open: [] }; D.lines.forEach(function (l) { var o = out(l), x = info(l); if (o.k === "top") e.top.push([l, x]); else if (o.k === "new" || o.k === "newb") { if (l.from && S.split[l.id]) { e.news.push([l, x, 1]); e.news.push([l, x, 2]); } else e.news.push([l, x]); } else if (o.k === "skip") e.skip.push([l, x]); else e.open.push([l, x]); }); return e; }
  RS.entries = entries;
  function summaryHtml(commit) {
    var t = tally(), e = entries(), n = e.top.length + e.news.length, h = "";
    h += '<div class="rs-sh"><h2>' + (commit ? "Add to your Pantry" : "So far") + '</h2>' + (commit ? '<button type="button" class="x ib" data-act="back" aria-label="Back to the review"><svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' + IC.x + "</svg></button>" : "") + "</div>";
    h += '<div class="rs-counts"><div data-k="new"><b>' + e.news.length + "</b><span>new items</span></div><div data-k=\"top\"><b>" + e.top.length + "</b><span>topped up</span></div><div data-k=\"skip\"><b>" + (e.skip.length) + "</b><span>left out</span></div></div>";
    h += '<div class="rs-stack" aria-hidden="true"><i data-k="new" style="flex:' + (e.news.length || .01) + '"></i><i data-k="top" style="flex:' + (e.top.length || .01) + '"></i><i data-k="skip" style="flex:' + ((e.skip.length + e.open.length) || .01) + '"></i></div>';
    if (e.open.length) h += '<div class="rs-note warn"><span class="rs-ni">' + ic("q", 22) + "</span><div><b>" + e.open.length + " still to check</b><p>They will not be added unless you check them.</p>" + (commit ? '<button type="button" class="rs-lk" data-act="back">Back to the review</button>' : '<button type="button" class="rs-lk" data-act="next">Go to the next one' + (DESK() && S.keys ? " " + kc("J") : "") + "</button>") + "</p></div></div>";
    if (commit || !DESK()) {
      var grp = function (t, arr, f) { return arr.length ? '<div class="rs-sg"><h3>' + t + " (" + arr.length + ")</h3><ul>" + arr.map(f).join("") + "</ul></div>" : ""; };
      h += grp("Topped up", e.top, function (a) { return "<li><span class=\"rs-sn\">" + esc(a[1].name) + "</span><span class=\"rs-sd\">" + a[1].detail + "</span></li>"; });
      h += grp("New items", e.news, function (a) { return "<li><span class=\"rs-sn\">" + esc(a[1].name) + "</span><span class=\"rs-sd\">" + fmt(a[2] ? a[0].q / 2 : qOf(a[0]), a[0].u) + "</span></li>"; });
      h += grp("Left out", e.skip, function (a) { return "<li class=\"mute\"><span class=\"rs-sn\">" + esc(a[0].raw[0]) + "</span><span class=\"rs-sd\">" + (a[0].st === "skip" ? a[0].short : "Not an item") + "</span></li>"; });
    }
    if (commit) h += '<div class="rs-acts col stick"><button type="button" class="rs-b pri big" data-act="done"' + (n ? "" : " disabled") + ">" + ic("check", 20) + "<span>Add " + n + " to the Pantry</span>" + (DESK() && S.keys ? kc("⇧↵") : "") + '</button><button type="button" class="rs-b" data-act="back"><span>Back to the review</span></button></div><p class="rs-fine">You can undo this for a few minutes from the Pantry’s history.</p>';
    else h += '<div class="rs-acts col stick"><button type="button" class="rs-b pri big" data-act="commit"' + (n ? "" : " disabled") + ">" + ic("check", 20) + "<span>Review and add " + n + "</span></button></div>";
    return h;
  }
  RS.summaryHtml = summaryHtml;

  /* ---------- panel contents by step ---------- */
  function panelHtml() {
    var s = S.step, d = DESK();
    if (s === "entry") return S.menu ? "" : addSheet();
    if (s === "capture") return captureHtml();
    if (s === "reading") return readingHtml();
    if (s === "review") {
      if (S.commit) return summaryHtml(true);
      if (S.state === "nothing") return "";
      var l = S.sel && L(S.sel);
      if (d && RS.views[opt].panel) return RS.views[opt].panel();
      if (d || S.sheet) return l ? '<div class="rs-sh"><h2>' + esc(info(l).name || l.raw[0]) + '</h2><button type="button" class="x ib" data-act="deselect" aria-label="Close"><svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' + IC.x + "</svg></button></div>" + RS.detail(l) : (d ? summaryHtml(false) : "");
    }
    return "";
  }

  /* ---------- the rail and the tab bar (the app's chrome around the page) ---------- */
  var navItems = [["home", "Home"], ["pantry", "Pantry"], ["cook", "Recipes"], ["cart", "Shopping"]];
  RS.navHtml = function () { return navItems.map(function (n) { return '<a class="nv' + (n[0] === "pantry" ? " on" : "") + '" href="#" tabindex="-1">' + ic(n[0], 24) + "<span>" + n[1] + "</span></a>"; }).join(""); };

  /* ---------- render ---------- */
  var root;
  RS.render = function (keepScroll) {
    var sc = $(".scr, .main", root), top = sc ? sc.scrollTop : 0, d = DESK();
    var reviewing = S.step === "review" || S.step === "summary";
    root.dataset.step = S.step; root.dataset.opt = opt; root.dataset.sheet = S.sheet ? "1" : "0"; root.dataset.commit = S.commit ? "1" : "0"; root.dataset.sel = S.sel ? "1" : "0";
    var main;
    if (reviewing) {
      if (S.state === "nothing") main = '<section class="scr rs-reviewpage" aria-label="Receipt review"><header class="rs-rh"><button type="button" class="ib" data-act="cancelreview" aria-label="Back">' + ic("back", 20) + "</button><h1>Receipt</h1></header>" + nothingHtml() + "</section>";
      else main = RS.views[opt].review(S);
    } else main = '<section class="main" id="pg">' + pantryHtml(S.menu) + "</section>";
    var pn = panelHtml(), showP = pn !== "";
    root.innerHTML = RS.vp.chrome() + '<div class="page">' + main + '</div>' + RS.vp.dim() + '<aside class="panel" id="panel" data-mode="' + (S.step === "review" && !S.commit ? "inspect" : S.step) + '"' + (showP ? "" : " hidden") + ' aria-label="Receipt scan">' + RS.vp.grab() + pn + "</aside>" + (S.toast ? '<div class="toast" role="status">' + S.toast + "</div>" : "");
    root.dataset.panel = showP ? "1" : "0";
    var sc2 = $(".scr, .main", root); if (sc2 && keepScroll) sc2.scrollTop = top;
    if (RS.vp.after) RS.vp.after();
  };

  /* ---------- actions ---------- */
  function setRes(id, r) { if (r) S.res[id] = r; else delete S.res[id]; }
  var nextOpen = function (from) { var a = D.lines.filter(function (l) { return out(l).k === "open"; }); if (!a.length) return null; var i = a.map(function (l) { return l.id; }).indexOf(from); return a[(i + 1) % a.length].id; };
  RS.nextOpen = nextOpen;
  var toast = function (h, ms) { S.toast = h; RS.render(true); clearTimeout(toast.t); if (ms) toast.t = setTimeout(function () { S.toast = null; RS.render(true); }, ms); };
  RS.act = function (a, id, v) {
    var l = id && L(id), adv = false;
    switch (a) {
      case "add": if (opt === "c") S.menu = !S.menu; else { S.menu = false; S.step = "entry"; } break;
      case "addone": S.menu = false; S.step = "entry"; S.state = ""; if (opt === "c") { toast("Add one item opens the Add form (unchanged)", 2200); return; } break;
      case "scan": S.menu = false; S.step = "capture"; S.photo = false; break;
      case "closepanel": S.step = "pantry"; S.state = ""; S.photo = false; S.menu = false; break;
      case "take": case "choose": S.photo = true; break;
      case "retake": S.step = "capture"; S.photo = false; S.state = ""; break;
      case "more": toast("A second photo is read and its lines are added below the first", 2400); return;
      case "read": S.step = "reading"; clearTimeout(RS.tm); RS.tm = setTimeout(function () { if (S.step === "reading") { S.step = "review"; S.state = ""; RS.render(); } }, 1700); break;
      case "dl": S.state = ""; break;
      case "retry": S.state = "offline"; toast("Still offline", 1800); return;
      case "cancelread": S.step = "capture"; S.photo = true; clearTimeout(RS.tm); break;
      case "cancelreview": S.step = "pantry"; S.state = ""; break;
      case "dim": if (S.step === "review") { S.sheet = false; S.sel = null; S.commit = false; } else S.step = "pantry"; break;
      case "deselect": S.sel = null; S.sheet = false; break;
      case "sel": S.sel = id; S.sheet = !DESK(); S.open = id; break;
      case "toggle": S.open = S.open === id ? null : id; break;
      case "match": setRes(id, { k: "match" }); adv = true; break;
      case "new": setRes(id, { k: "new" }); adv = true; break;
      case "skip": setRes(id, { k: "skip" }); adv = true; break;
      case "add2": setRes(id, { k: "add" }); break;
      case "undo": setRes(id, null); break;
      case "pick": setRes(id, { k: "pick", pick: v }); break;
      case "mode": S.res[id] = Object.assign({ k: l.st === "exact" ? "match" : (S.res[id] && S.res[id].k) || "match" }, S.res[id], { mode: v }); break;
      case "qp": S.q[id] = Math.round((qOf(l) + step(l.u)) * 1000) / 1000; break;
      case "qm": S.q[id] = Math.max(step(l.u), Math.round((qOf(l) - step(l.u)) * 1000) / 1000); break;
      case "split": S.split[id] = !S.split[id]; break;
      case "find": toast("Search the Pantry opens the Pantry search, with the receipt kept", 2400); return;
      case "filter": S.filter = v; break;
      case "commit": S.commit = true; break;
      case "back": S.commit = false; break;
      case "next": var n = nextOpen(S.sel); if (n) { S.sel = n; S.open = n; S.sheet = !DESK(); } break;
      case "accept": D.lines.forEach(function (l2) { if (l2.st === "exact" && !S.res[l2.id]) setRes(l2.id, { k: "match" }); }); break;
      case "done": S.snap = JSON.stringify(S.res); S.step = "done"; S.commit = false; S.sel = null; S.sheet = false; S.undone = false; var e = entries(); S.toast = 'Added ' + e.news.length + " new, topped up " + e.top.length + '. <button type="button" data-act="undodone">Undo</button>'; RS.render(); clearTimeout(toast.t); toast.t = setTimeout(function () { S.toast = null; RS.render(true); }, 9000); return;
      case "undodone": S.undone = true; S.toast = "Undone. The Pantry is as it was. <button type=\"button\" data-act=\"redo\">Redo</button>"; RS.render(); return;
      case "redo": S.undone = false; S.toast = null; break;
      default: if (RS.views[opt].act && RS.views[opt].act(a, id, v)) { RS.render(true); return; }
    }
    if (adv && DESK()) { var n2 = nextOpen(id); if (n2 && RS.views[opt].advance !== false) S.sel = n2; }
    RS.render(true);
  };
  RS.setRes = setRes; RS.toast = toast;
  RS.resolveAll = function (half) {
    ["l6", "l7", "l8", "l9", "l10"].forEach(function (i) { S.res[i] = { k: "match" }; });
    S.res.l11 = { k: "new" }; S.res.l12 = { k: "new" }; S.res.l13 = { k: "new" }; S.res.l14 = { k: "skip" };
    if (half) { delete S.res.l10; delete S.res.l11; delete S.res.l13; delete S.res.l14; }
  };

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]"); if (!t || !root.contains(t) && !t.closest(".toast")) return;
    if (t.tagName === "A") e.preventDefault();
    var a = t.dataset.act; if (a === "dim" && e.target !== t) return;
    RS.act(a, t.dataset.id, t.dataset.v);
  });
  document.addEventListener("input", function (e) { var t = e.target; if (t.dataset && t.dataset.nm) { S.nm[t.dataset.nm] = t.value; } });
  document.addEventListener("keydown", function (e) { if (RS.vp.key) RS.vp.key(e); });

  /* ---------- start ---------- */
  function load(src, cb) { var s = document.createElement("script"); s.src = src; s.onload = cb; document.head.appendChild(s); }
  function start() {
    root = $("#app");
    if (!Q.get("step") && Q.get("state") && /^(dark|perm|download|offline)$/.test(Q.get("state"))) S.step = "capture";
    if (!Q.get("step") && /^(lowq|nothing)$/.test(Q.get("state"))) S.step = "review";
    if (S.step === "summary") { S.step = "review"; S.commit = true; }
    if (opt === "c" && S.step === "entry") S.menu = true;
    if (Q.get("pre") === "resolved" || S.step === "done") RS.resolveAll(false); else if (Q.get("pre") === "half") RS.resolveAll(true);
    if (S.step === "done") { var e = entries(); S.toast = 'Added ' + e.news.length + " new, topped up " + e.top.length + '. <button type="button" data-act="undodone">Undo</button>'; if (S.state === "undone") { S.undone = true; S.toast = "Undone. The Pantry is as it was."; } }
    if (S.open && S.step === "review" && DESK()) { S.sel = S.sel || S.open; }
    if (S.sel && !DESK() && S.step === "review" && RS.views[opt].phoneDetail === "sheet") S.sheet = true;
    if (Q.get("close") === "1") { S.sel = null; S.sheet = false; }
    if (Q.get("keys") === "0") S.keys = false;
    var vpf = DESK() ? "rs.desktop.js" : "rs.phone.js";
    load(vpf, function () { RS.render(); if (RS.vp.init) RS.vp.init(); });
  }
  load("view-" + opt + ".js", start);
})();
