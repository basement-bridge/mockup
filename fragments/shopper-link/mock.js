// MOCKUP ONLY. NOT FOR THE BUILD. (fragments/shopper-link)
// Stands in for the Kitchie server on this fragment's pages: the shopper's requests (line, extra, unresolved, undo, batch), the live stream that tells every
// open page what changed, a second shopper, and the member's Shopping screen following along. It also jumps a frame to the state named in its address,
// so the fragment page can show every state side by side. Sample answers and sample outcomes live here, never in the stylesheets or in the files meant for the build.
//   list.html            ?s=mid | drag | swap | also | multi | summary | none | wont | live | reopen | two        phase one (see seedFor below)
//                        ?s=p2 | p2-ask | p2-reading | p2-ok | p2-retry | p2-fallback   phase two (not built); ?p2=1 only shows the chooser
//                        ?g=<group>&as=A|B   several frames in one group share one pretend server (A and B are two links; the member sees both)
//   member.html          ?share=a | b | c   where the hand-off control sits      ?live=0 | 1 | 2 | 3 | unsent   which links are out
//   member-result.html   ?at=mid starts scrolled to the swapped line     ?s=two shows two links' cards     ?g=<group> follows that group live
//   sent.html            ?from=<scope> shows what that frame really sent
(function () {
  "use strict";
  var q = new URLSearchParams(location.search), s = q.get("s") || "";
  var form = document.getElementById("sl-form"), list = document.getElementById("shop");
  var page = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var auto = s !== "";
  var wait = function (ms) { return new Promise(function (ok) { setTimeout(ok, auto ? 0 : ms); }); };
  var topOf = function (el) { return el.getBoundingClientRect().top + window.scrollY; };
  var store = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* no storage */ } } };
  var local = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* no storage */ } } };

  // A theme picked on the fragment page reaches its frames.
  window.addEventListener("storage", function (e) { if (e.key === "theme") location.reload(); });

  // ================================================================ the pretend server
  var scope = "demo-" + page + (s ? "-" + s : "");
  var group = q.get("g") || scope, me = q.get("as") || "A";
  var NAMES = ["Bananas", "Bread", "Cheddar", "Dish soap", "Eggs", "Milk", "Olive oil", "Onions", "Penne", "Rice", "Spinach", "Tomatoes"];
  var QTY = ["6", "1 loaf", "1 block", "", "a dozen", "2 L", "1 bottle", "", "500 g", "2 kg", "1 bag", "1 kg"];
  var PANTRY = ["fusilli", "milk", "rice", "eggs"]; // what the pretend Pantry already holds (for add-item matching)
  var SKEY = "kitchie.sl.srv:" + group;
  var chan = window.BroadcastChannel ? new BroadcastChannel("kitchie.sl:" + group) : null;
  function fresh() { return { rev: 0, lines: {}, extras: [], hist: { A: [], B: [] }, order: [], hours: 46 }; }
  function load() { try { return JSON.parse(local.get(SKEY)) || fresh(); } catch (e) { return fresh(); } }
  var srv = (auto && !q.get("g")) ? fresh() : load();
  function save() { srv.rev++; local.set(SKEY, JSON.stringify(srv)); if (chan) chan.postMessage({ rev: srv.rev }); }
  function label(k, r) {
    var n = NAMES[Number(k.slice(1))];
    return r.state === "got" ? n + ", got it" : r.state === "notgot" ? n + ", couldn't find" : r.state === "swapped" ? n + ", got " + r.words + " instead" : n + ", back to open";
  }
  function lineOf(k) { return srv.lines[k] || { state: "open", words: "", by: "" }; }
  function put(k, r) { if (r.state === "open") delete srv.lines[k]; else srv.lines[k] = r; }
  function seen(link) { if (srv.order.indexOf(link) === -1) srv.order.push(link); }
  function snapshot(link) {
    var lines = {};
    NAMES.forEach(function (n, i) { var k = "l" + i, r = lineOf(k); lines[k] = { state: r.state, words: r.words, by: r.by ? (r.by === link ? "you" : "other") : "" }; });
    var h = srv.hist[link] || [];
    return { rev: srv.rev, lines: lines, extras: srv.extras.filter(function (x) { return x.by === link; }).map(function (x) { return { id: x.id, text: x.text }; }), last: h.length ? { label: h[h.length - 1].label } : null, hours: srv.hours };
  }
  function push(link, label_, undo) { seen(link); (srv.hist[link] = srv.hist[link] || []).push({ label: label_, undo: undo }); }
  function act(path, d, link) {
    var k, r, prev;
    if (path === "line") {
      k = d.get("key"); r = lineOf(k); prev = r;
      if (r.state === "got" && r.by && r.by !== link) return 409;
      var w = (d.get("swap") || "").trim().slice(0, 120), st = d.get("state");
      var n = w ? { state: "swapped", words: w, by: link } : st === "open" ? { state: "open", words: "", by: "" } : { state: st, words: "", by: link };
      put(k, n); push(link, label(k, n), [{ k: k, prev: prev }]);
    } else if (path === "extra") {
      var t = (d.get("text") || "").trim().slice(0, 120);
      if (t) { var x = { id: "x" + (srv.rev + 1), text: t, by: link }; srv.extras.push(x); push(link, "Also got: " + t, [{ extra: x.id }]); }
    } else if (path === "extra/remove") {
      var gone = srv.extras.filter(function (v) { return v.id === d.get("id"); })[0];
      if (gone) { srv.extras = srv.extras.filter(function (v) { return v !== gone; }); push(link, "Removed: " + gone.text, [{ put: gone }]); }
    } else if (path === "unresolved") {
      var undo = [];
      NAMES.forEach(function (n_, i) { var kk = "l" + i; if (lineOf(kk).state === "open") { undo.push({ k: kk, prev: lineOf(kk) }); put(kk, { state: "notgot", words: "", by: link }); } });
      if (undo.length) push(link, "The rest, can't buy", undo);
    } else if (path === "undo") {
      var h = (srv.hist[link] || []).pop();
      if (h) h.undo.forEach(function (u) { if (u.k) put(u.k, u.prev); else if (u.extra) srv.extras = srv.extras.filter(function (v) { return v.id !== u.extra; }); else if (u.put) srv.extras.push(u.put); });
    } else if (path === "batch") {
      var got = d.getAll("got"), undo2 = [];
      NAMES.forEach(function (n_, i) {
        var kk = "l" + i, cur = lineOf(kk), sw = (d.get("swap_" + kk) || "").trim().slice(0, 120);
        if (cur.state === "got" && cur.by && cur.by !== link) return;
        undo2.push({ k: kk, prev: cur });
        put(kk, sw ? { state: "swapped", words: sw, by: link } : got.indexOf(kk) !== -1 ? { state: "got", words: "", by: link } : { state: "notgot", words: "", by: link });
      });
      d.getAll("also").forEach(function (t2) { t2 = t2.trim().slice(0, 120); if (t2) { var x2 = { id: "x" + (srv.rev + 1) + undo2.length, text: t2, by: link }; srv.extras.push(x2); undo2.push({ extra: x2.id }); } });
      push(link, "Sent the whole list", undo2);
    }
    save();
    return 200;
  }
  var realFetch = window.fetch;
  var json = function (status, body) { return new Response(JSON.stringify(body), { status: status, headers: { "content-type": "application/json" } }); };
  var SHARE_TEXT = "Shopping list\n- bananas, 6\n- bread, 1 loaf\n- cheddar, 1 block\n- dish soap\n- eggs, a dozen (2 left, minimum 6)\n- milk, 2 L\n- olive oil, 1 bottle\n- onions (running low)\n- penne, 500 g\n- rice, 2 kg\n- spinach, 1 bag\n- tomatoes, 1 kg\n\nTick off what you get, no sign-in needed. The link works for 48 hours:\nhttps://kitchie.example/list/sample-link-not-real-000000000000000000000";
  window.fetch = function (url, opts) {
    if (!opts || opts.method !== "POST") return realFetch.apply(window, arguments);
    var to = String(url), m = /(?:^|\/)(line|extra\/remove|extra|unresolved|undo|batch)$/.exec(to);
    if (m && /(^|\/)api\//.test(to)) {
      var d = new URLSearchParams(opts.body), code;
      return wait(120).then(function () { code = act(m[1], d, me); return json(code, snapshot(me)); });
    }
    if (/share$/.test(to)) {
      store.set("sl-mock-live", "1");
      return wait(350).then(function () { return json(200, { link: "3f9a1c2e", url: "https://kitchie.example/list/sample-link-not-real-000000000000000000000", text: SHARE_TEXT, expires_at: new Date(Date.now() + 48 * 3600000).toISOString() }); });
    }
    if (/share\/(cancel|dismiss|unsent)$/.test(to)) { if (!/unsent$/.test(to)) store.set("sl-mock-live", null); return wait(250).then(function () { return new Response("", { status: 200 }); }); }
    return realFetch.apply(window, arguments);
  };
  // The live stream: a snapshot now, and another every time anything in the group changes.
  function FakeStream(url) {
    var me_ = this;
    me_.url = url; me_.readyState = 1;
    var tell = function () { if (me_.onmessage) me_.onmessage({ data: JSON.stringify(snapshot(me)) }); };
    setTimeout(tell, 0);
    me_._on = function () { srv = load(); tell(); };
    if (chan) chan.addEventListener("message", me_._on);
    window.addEventListener("storage", function (e) { if (e.key === SKEY) me_._on(); });
  }
  FakeStream.prototype.close = function () { this.readyState = 2; };
  window.EventSource = FakeStream;

  // ================================================================ seeds for the fixed frames
  function seed(lines, extras, last) {
    Object.keys(lines).forEach(function (k) { var v = lines[k]; srv.lines[k] = { state: v[0], words: v[1] || "", by: v[2] || "A" }; });
    (extras || []).forEach(function (t, i) { srv.extras.push({ id: "x" + (i + 1), text: t, by: "A" }); });
    if (last) srv.hist.A.push({ label: last, undo: [] });
    srv.rev++;
  }
  var MID = { l0: ["got"], l1: ["got"], l2: ["got"], l3: ["notgot"], l4: ["got"], l5: ["got"], l8: ["swapped", "fusilli, same size"] };
  if (auto && !q.get("g")) {
    if (s === "mid" || s === "drag" || s === "swap" || s === "also" || s === "live" || s === "reopen" || s === "wont") {
      var mid = {};
      Object.keys(MID).forEach(function (k) { mid[k] = MID[k]; });
      if (s === "drag") mid = { l0: ["got"], l1: ["got"] };
      if (s === "swap") mid = { l0: ["got"], l1: ["got"], l2: ["got"], l3: ["got"], l4: ["got"], l5: ["got"], l7: ["got"] };
      if (s === "live") { mid = { l0: ["got"], l1: ["got"], l5: ["got"], l10: ["got", "", "B"] }; }
      if (s === "also") mid = { l0: ["got"], l1: ["got"], l2: ["got"], l4: ["got"], l5: ["got"] };
      if (s === "reopen") { mid = { l0: ["got"], l1: ["got"], l2: ["got"], l3: ["got"], l4: ["got"], l5: ["got"], l6: ["notgot"], l8: ["swapped", "fusilli, same size"], l10: ["notgot"] }; }
      seed(mid, s === "also" ? ["2 cans of sparkling water", "birthday candles"] : s === "mid" || s === "wont" ? ["2 cans of sparkling water"] : [], s === "also" ? "Also got: birthday candles" : s === "drag" ? "Bread, got it" : s === "swap" ? "Onions, got it" : s === "live" ? "Milk, got it" : s === "reopen" ? "Spinach, couldn't find" : "Penne, got fusilli, same size instead");
    }
    if (s === "two") {
      seed({ l0: ["got", "", "A"], l1: ["got", "", "A"], l2: ["got", "", "A"], l3: ["got", "", "A"], l4: ["got", "", "A"], l5: ["got", "", "A"], l6: ["notgot", "", "A"],
        l7: ["got", "", "B"], l8: ["swapped", "fusilli, same size", "B"], l9: ["got", "", "B"], l10: ["notgot", "", "B"], l11: ["got", "", "B"] }, [], "");
      srv.extras.push({ id: "x1", text: "2 cans of sparkling water", by: "B" }); srv.order = ["A", "B"];
    }
    save();
  }
  if (form) {
    form.setAttribute("data-sl-link", scope);
    if (auto && q.get("g")) { /* grouped frames keep the shared server */ }
  }
  srv.order = srv.order || [];

  // ================================================================ sent.html: show what this frame's shopper really sent
  if (page === "sent" && q.get("from")) {
    var gsrv = null;
    try { gsrv = JSON.parse(local.get("kitchie.sl.srv:" + q.get("from"))); } catch (e) { gsrv = null; }
    if (gsrv) {
      var keys = NAMES.map(function (n, i) { return "l" + i; }), L = gsrv.lines || {};
      var swapped = keys.filter(function (k) { return L[k] && L[k].state === "swapped"; });
      var got = keys.filter(function (k) { return L[k] && L[k].state === "got"; });
      var notgot = keys.filter(function (k) { return !L[k] || L[k].state === "notgot" || L[k].state === "open"; });
      var n = { got: got.length, swapped: swapped.length, notgot: notgot.length };
      var bits = ["Got " + n.got + " of " + keys.length];
      if (n.swapped) bits.push(n.swapped + " swap" + (n.swapped === 1 ? "" : "s"));
      if (n.notgot) bits.push(n.notgot + " not got");
      document.querySelector("[data-sl-sum]").textContent = n.got + n.swapped === 0 ? "Nothing ticked." : bits.join(" · ") + ".";
      Object.keys(n).forEach(function (k) { var c = document.querySelector('[data-sl-tally="' + k + '"]'); c.setAttribute("data-n", n[k]); c.querySelector("b").textContent = n[k]; });
      var ul = document.querySelector(".sl-lines"), proto = { swapped: ul.querySelector('[data-sl-line="swapped"]'), notgot: ul.querySelector('[data-sl-line="notgot"]') };
      ul.textContent = "";
      if (n.got + n.swapped > 0) [["swapped", swapped], ["notgot", notgot]].forEach(function (g) {
        g[1].forEach(function (k) { var li = proto[g[0]].cloneNode(true), i = Number(k.slice(1)); li.querySelector("b").textContent = NAMES[i]; li.querySelector("small").textContent = g[0] === "swapped" ? "Got instead: " + L[k].words : "Not got"; ul.appendChild(li); });
      });
    }
  }
  // ---- summary.html and the pages with no script: a plain POST has nowhere to go on a static host, so Send walks on to the next page.
  if (page === "summary") document.addEventListener("submit", function (e) { e.preventDefault(); location.href = "sent.html"; });

  // ================================================================ member.html: which hand-off control, which links are out
  if (page === "member") {
    var share = q.get("share") || "a";
    Array.prototype.forEach.call(document.querySelectorAll("[data-mock-share]"), function (n) { if (n.getAttribute("data-mock-share") !== share) n.remove(); });
    var fresh_ = !q.has("live") && store.get("sl-mock-live") === "1";
    var kinds = fresh_ ? ["fresh"] : { "0": [], "1": ["opened"], "2": ["opened", "fresh"], "3": ["opened", "fresh", "unsent"], "unsent": ["unsent"] }[q.get("live") || "0"] || [];
    var lines = document.querySelectorAll(".sl-live");
    Array.prototype.forEach.call(lines, function (n) { if (kinds.indexOf(n.getAttribute("data-sl-kind")) === -1) n.remove(); });
    if (fresh_) { var t0 = document.querySelector(".sl-live .sl-live-t span"); if (t0) t0.textContent = "Not opened yet · ends in 48 hours"; }
    if (share === "c") window.addEventListener("load", function () { window.scrollTo(0, document.body.scrollHeight); });
    if (kinds.length >= 3) { document.querySelector("[data-sl-full]").hidden = false; var f = document.querySelector(".sl-top .sl-share"); if (f) f.hidden = true; }
  }

  // ================================================================ the member's Shopping screen
  // ticks, and the Shopping screen's own scribble (shopping.js and scribble.js in the app), enough of them to try the screen
  var PATHS = ["M2 8 C20 3 40 11 60 5 S90 9 98 4", "M2 5 L98 9 M4 9 L96 4 M2 7 L98 6", "M1 7 C15 2 25 12 40 6 S70 2 99 8", "M2 4 C30 10 50 2 98 7 M3 9 C40 3 70 11 97 5", "M2 6 L10 3 L18 9 L28 3 L38 9 L50 3 L62 9 L74 3 L86 9 L98 5"];
  var hash = function (t) { var h = 0; for (var i = 0; i < t.length; i++) h = (Math.imul(h, 31) + t.charCodeAt(i)) >>> 0; return h; };
  var NS = "http://www.w3.org/2000/svg";
  var icon = function (d, n) { var sv = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path"); [["width", n], ["height", n], ["viewBox", "0 0 24 24"], ["fill", "none"], ["stroke", "currentColor"], ["stroke-width", "1.8"], ["stroke-linecap", "round"], ["stroke-linejoin", "round"], ["aria-hidden", "true"], ["focusable", "false"]].forEach(function (a) { sv.setAttribute(a[0], a[1]); }); p.setAttribute("d", d); sv.appendChild(p); return sv; };
  var draw = function (li) {
    var span = li.querySelector("[data-scribble]"), old = span.querySelector(".scr");
    if (old) old.remove();
    if (!li.hasAttribute("data-ticked")) return;
    var svg = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
    svg.setAttribute("class", "scr"); svg.setAttribute("viewBox", "0 0 100 12"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "left:-4%;width:108%;top:50%;height:.9em;margin-top:-.45em";
    p.setAttribute("d", PATHS[hash(li.getAttribute("data-id")) % PATHS.length]); p.setAttribute("pathLength", "1");
    svg.appendChild(p); span.style.cssText = "position:relative;display:inline-block"; span.appendChild(svg);
  };
  if (page === "member-result" && list) {
    var bar = document.getElementById("shop-done"), nEl = document.getElementById("shop-done-n"), toast = document.getElementById("toast");
    var recount = function () { var n = list.querySelectorAll("li[data-ticked]").length; nEl.textContent = n; bar.hidden = n === 0; };
    list.addEventListener("click", function (e) {
      var b = e.target.closest(".tick"); if (!b || b.closest("[data-sl]")) return;
      var li = b.closest("li"), on = b.getAttribute("aria-checked") !== "true";
      b.setAttribute("aria-checked", String(on)); li.toggleAttribute("data-ticked", on); draw(li); recount();
    });
    bar.addEventListener("click", function () { toast.textContent = "In the app this asks “How much did you buy?” where no amount is known, then puts the ticked lines in the Pantry."; toast.hidden = false; setTimeout(function () { toast.hidden = true; }, 4200); });
    if (q.get("at") === "mid") window.addEventListener("load", function () { window.scrollTo(0, topOf(list.querySelector('li[data-id="s-07"]')) - 76); });

    // Following a group live (or a seeded one): rebuild the rows and the cards from the pretend server, in the same markup as the static page.
    var pantryNote = function (txt) {
      var key = txt.toLowerCase().replace(/,.*$/, "").replace(/^\d+\s*(cans? of |x )?/, "").trim();
      var hit = PANTRY.some(function (p) { return key.indexOf(p) === 0 || p.indexOf(key) === 0; });
      return hit ? "Topped up your " + key.split(" ")[0] + " in the Pantry" : "Added to the Pantry as new";
    };
    var add = function (parent, cls, text, ic) { var d = document.createElement("div"); d.className = cls; if (ic) d.appendChild(icon(ic, 16)); d.appendChild(document.createTextNode(text)); parent.appendChild(d); return d; };
    var follow = function () {
      srv = load();
      var lis = Array.prototype.slice.call(list.querySelectorAll("li[data-shop-row]")), tallies = {};
      lis.forEach(function (li, i) {
        var r = lineOf("l" + i), main = li.querySelector(".smain"), tick = li.querySelector(".tick");
        Array.prototype.slice.call(main.querySelectorAll(".sl-instead,.sl-notgot,.sl-pantry")).forEach(function (n) { n.remove(); });
        var shome = main.querySelector(".shome"); if (shome && shome.dataset.orig === undefined) shome.dataset.orig = shome.innerHTML;
        if (shome && shome.dataset.orig !== undefined && r.state === "open") shome.innerHTML = shome.dataset.orig;
        li.removeAttribute("data-sl"); li.removeAttribute("data-ticked");
        tick.setAttribute("aria-checked", "false"); tick.removeAttribute("aria-disabled");
        var was = li.getAttribute("data-sl-was");
        if (r.state === "got") { li.setAttribute("data-sl", "got"); tick.setAttribute("aria-checked", "true"); tick.setAttribute("aria-disabled", "true"); add(main, "shome sl-pantry", "Got · in the Pantry", "M5 12.5l4.5 4.5L19 7.5"); }
        if (r.state === "notgot") { li.setAttribute("data-sl", "notgot"); add(main, "shome sl-notgot", "Couldn't find"); }
        if (r.state === "swapped") { li.setAttribute("data-sl", "swapped"); add(main, "shome sl-instead", "Got instead: " + r.words, "M5 9h12l-3-3M19 15H7l3 3"); add(main, "shome sl-pantry", pantryNote(r.words), "M5 12.5l4.5 4.5L19 7.5"); }
        if (was !== r.state + r.by && r.state !== "open" && li.hasAttribute("data-sl-seen")) { li.setAttribute("data-fresh", ""); setTimeout(function () { li.removeAttribute("data-fresh"); }, 2600); }
        li.setAttribute("data-sl-was", r.state + r.by); li.setAttribute("data-sl-seen", "");
        if (r.state !== "open") { var by = r.by; tallies[by] = tallies[by] || { got: 0, swapped: 0, notgot: 0, names: [] }; tallies[by][r.state]++; tallies[by].names.push(NAMES[i]); }
      });
      // the also-got section
      var also = document.querySelector("[data-sl-also]"), sect = document.querySelector(".sl-also-m");
      if (also) { also.textContent = ""; srv.extras.forEach(function (x) { var li = document.createElement("li"), sp = document.createElement("span"), sm = document.createElement("small"); li.appendChild(icon("M12 5v14M5 12h14", 22)); sp.appendChild(document.createTextNode(x.text)); sm.textContent = pantryNote(x.text); sp.appendChild(sm); li.appendChild(sp); also.appendChild(li); }); sect.hidden = srv.extras.length === 0; }
      // one card per link that has answered
      var top = document.getElementById("sl-top"), tpl = top.querySelector(".sl-card");
      Array.prototype.slice.call(top.querySelectorAll(".sl-card")).forEach(function (c, i) { if (i > 0) c.remove(); });
      var links = (srv.order || []).filter(function (l) { return tallies[l]; });
      Object.keys(tallies).forEach(function (l) { if (links.indexOf(l) === -1) links.push(l); });
      var open = lis.filter(function (li, i) { return lineOf("l" + i).state === "open"; }).length;
      tpl.hidden = links.length === 0;
      links.forEach(function (l, idx) {
        var c = idx === 0 ? tpl : tpl.cloneNode(true), t = tallies[l], xs = srv.extras.filter(function (x) { return x.by === l; }).length;
        c.hidden = false;
        if (idx > 0) { c.querySelector("[id]").removeAttribute("id"); c.removeAttribute("aria-labelledby"); top.appendChild(c); }
        var done = open === 0;
        c.querySelector(".sl-card-h b").textContent = done ? "The shop is back" : "Shopping is coming in"; // no link is named: the lines in the card say which shopper it is (SL-D3)
        var live = c.querySelector(".sl-card-live"); if (!live) { live = document.createElement("span"); live.className = "sl-card-live"; c.querySelector(".sl-card-h b").after(live); }
        live.textContent = done ? "" : "Live"; live.hidden = done;
        ["got", "swapped", "notgot"].forEach(function (k) { var cell = c.querySelector('[data-sl-tally="' + k + '"]'); cell.setAttribute("data-n", t[k]); cell.querySelector("b").textContent = t[k]; });
        var names = t.names.slice(0, 3).join(", ") + (t.names.length > 3 ? " and " + (t.names.length - 3) + " more" : "");
        c.querySelector(".sl-card-who").textContent = names + (xs ? ", and " + xs + " also got" : "") + ".";
      });
    };
    if (q.get("g") || s === "two") {
      follow();
      if (chan) chan.addEventListener("message", follow);
      window.addEventListener("storage", function (e) { if (e.key === SKEY) follow(); });
    }
    // bought lines use the plain strike-through in member.css, so no drawn stroke is needed here
  }

  if (page !== "list" || !list) return;

  // ================================================================ PHASE TWO, NOT BUILT: the receipt reader. The server finds list lines on the receipt and applies the owner's rule (80%, one more try).
  var photos = 0, bad = q.get("r") === "bad" || s === "p2-retry" || s === "p2-fallback";
  function FakeSocket() { var me2 = this; me2.readyState = 0; setTimeout(function () { me2.readyState = 1; if (me2.onopen) me2.onopen({}); }, 0); }
  FakeSocket.prototype.close = function () { this.readyState = 3; };
  FakeSocket.prototype.send = function () {
    var me2 = this, keys = Array.prototype.map.call(list.querySelectorAll("li[data-shop-row]"), function (li) { return li.getAttribute("data-key"); });
    var miss = bad ? ["l1", "l3", "l6", "l7", "l10"] : ["l6", "l10"]; // 7 of 12 is 58%; 10 of 12 is 83%
    var found = keys.filter(function (k) { return miss.indexOf(k) === -1; }), stop = s === "p2-reading" ? 5 : found.length, n = 0;
    photos++;
    (function step() {
      if (me2.readyState !== 1) return;
      if (n < stop) { n++; me2.onmessage({ data: JSON.stringify({ t: "progress", found: n, total: keys.length }) }); wait(170).then(step); return; }
      if (s === "p2-reading") return; // this frame stays on the reading face
      me2.onmessage({ data: JSON.stringify({ t: "result", ok: found.length / keys.length >= 0.8, again: photos < 2, found: found, total: keys.length }) });
    })();
  };
  window.WebSocket = FakeSocket;
  // No camera in a mockup: a tap on the camera button hands the reader a stand-in photo.
  document.addEventListener("click", function (e) {
    var lab = e.target.closest && e.target.closest(".sl-rcpt label.btn");
    if (!lab) return;
    e.preventDefault();
    window.KitchieReceipt.read(new Blob(["sample receipt"], { type: "image/jpeg" }));
  }, true);
  if (q.has("p2") || s.indexOf("p2") === 0) document.querySelector("[data-sl-modes]").hidden = false;

  // ================================================================ list.html, a second visit: the server draws what is still to get first, what is bought after (SL-J9)
  if (s === "reopen") {
    var all = Array.prototype.slice.call(list.querySelectorAll("li[data-shop-row]")), todo = [], done_ = [];
    all.forEach(function (li, i) { var r = lineOf("l" + i); (r.state === "got" || r.state === "swapped" ? done_ : todo).push(li); li.setAttribute("data-state", r.state); });
    var mk = function (t) { var li = document.createElement("li"); li.className = "sl-divider"; li.setAttribute("role", "presentation"); li.textContent = t; return li; };
    list.textContent = "";
    list.appendChild(mk("Still to get")); todo.forEach(function (li) { list.appendChild(li); });
    list.appendChild(mk("Bought already")); done_.forEach(function (li) { list.appendChild(li); });
  }
  if (!auto) return;

  // ================================================================ jump to the state, after shopper.js has run, by doing what a shopper would do
  var row = function (k) { return list.querySelector('li[data-key="' + k + '"]'); };
  var typed = function (k, text, done) { var f = row(k).querySelector(".sl-swap input"); f.value = text; f.dispatchEvent(new Event("input", { bubbles: true })); if (done) f.dispatchEvent(new Event("change", { bubbles: true })); };
  var GOT = ["l0", "l1", "l2", "l3", "l4", "l5", "l7", "l9", "l11"]; // 9 of 12; penne swapped; olive oil and spinach not got
  document.addEventListener("DOMContentLoaded", function () {
    // A frame must not pull the keyboard focus (and the fragment page's scroll) to itself while it sets itself up.
    var focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function () {};
    setTimeout(function () { HTMLElement.prototype.focus = focus; }, 900);
    var S = function () { return window.KitchieShopperLink; };
    if (s === "drag") setTimeout(function () { var li = row("l5"); li.setAttribute("data-sl-drag", "got"); li.setAttribute("data-sl-armed", ""); li.querySelector(".swfg").style.setProperty("--dx", "150px"); window.scrollTo(0, topOf(row("l3")) - 90); }, 80);
    if (s === "swap") setTimeout(function () { row("l8").querySelector("details").open = true; typed("l8", "fusilli, same size", false); window.scrollTo(0, topOf(row("l5")) - 76); }, 120);
    if (s === "also") setTimeout(function () { var i = document.getElementById("sl-also-in"); i.value = "2 litres of lemonade"; window.scrollTo(0, document.body.scrollHeight); }, 120);
    if (s === "mid" || s === "wont") setTimeout(function () { window.scrollTo(0, topOf(row("l3")) - 100); }, 120);
    if (s === "live") setTimeout(function () { window.scrollTo(0, topOf(row("l9")) - 120); }, 120);
    if (s === "live") setTimeout(function () { S().say("Someone else just got Spinach."); }, 140);
    if (s === "wont") setTimeout(function () { document.querySelector("[data-sl-wont]").click(); }, 140);
    if (s === "multi" || s === "summary" || s === "none") setTimeout(function () {
      var api = S();
      api.enterMulti(s === "multi" ? row("l7") : null);
      if (s === "multi") { ["l9", "l11", "l5"].forEach(function (k) { row(k).querySelector('input[name="got"]').click(); }); typed("l8", "fusilli, same size", true); }
      if (s === "summary") { GOT.forEach(function (k) { var b = row(k).querySelector('input[name="got"]'); if (!b.checked) b.click(); }); typed("l8", "fusilli, same size", true); }
      if (s === "summary" || s === "none") setTimeout(function () { form.querySelector('[data-sl-bar="multi"] button[type="submit"]').click(); }, 60);
      if (s === "multi") setTimeout(function () { window.scrollTo(0, topOf(row("l5")) - 90); }, 80);
    }, 200);
    if (s.indexOf("p2-") === 0) {
      document.querySelector('[data-sl-mode="receipt"]').click();
      var snap = function () { window.KitchieReceipt.read(new Blob(["sample receipt"], { type: "image/jpeg" })); };
      var ready = setInterval(function () {
        if (!window.KitchieReceipt || !document.querySelector(".sl-rcpt")) return;
        clearInterval(ready);
        if (s === "p2-ask") return;
        snap();
        if (s === "p2-fallback") setTimeout(snap, 150);
      }, 20);
    }
  });
})();
