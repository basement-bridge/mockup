// MOCKUP ONLY. NOT FOR THE BUILD. (fragments/shopper-link)
// Stands in for the Kitchie server on this fragment's pages: the shopper's requests (line, extra, unresolved, undo, batch), the live stream that tells every
// open page what changed, a second shopper, and the member's Shopping screen following along. It also jumps a frame to the state named in its address,
// so the fragment page can show every state side by side. Sample answers and sample outcomes live here, never in the stylesheets or in the files meant for the build.
//   list.html            ?s=mid | drag | drag-armed | drag-no | drag-no-armed | leave | done | done-none | swap | also | multi | summary | none | wont | live | reopen | two        phase one (see the seeds below)
//                        ?s=p2 | p2-ask | p2-reading | p2-ok | p2-retry | p2-fallback   phase two (not built); ?p2=1 only shows the chooser
//                        ?g=<group>&as=A|B   several frames in one group share one pretend server (A and B are two links; the member sees both)
//                        SL-D21 on (11 October 2026, second round): ?s=fresh | trim | committed | committed-all | bailed | reject-ask | rejected | claimed-other | released | notfound-other (SL-D37)
//   member.html          ?share=a | b | c   where the hand-off control sits      ?live=0 | 1 | 2 | 3 | unsent   which links are out
//   member-result.html   ?at=mid starts scrolled to the swapped line     ?s=two shows two links' cards     ?g=<group> follows that group live
//   member-list.html    ?s=plain | states | three | sorting | dead | ended   the household's Shopping list with claims (SL-D21 on); ?g=<group> follows that group live (mock-member.js draws it)
//   link.html            ?s=unopened | opened | active | got | swapped | notfound | dead   one outstanding link, tapped into (SL-D29 on); ?g=live&as=A follows a live link
//   sent.html            ?from=<scope> shows what that frame really sent
(function () {
  "use strict";
  var q = new URLSearchParams(location.search), s = q.get("s") || "";
  var form = document.getElementById("sl-form"), list = document.getElementById("shop");
  var root_ = null;
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
  // links: per link { committed, dead, deadAt, slot, opened, left }; claims: line key -> the link that promised it (SL-D21 on). A claim is kept when its line is answered
  // (the answer wins) and goes when the link ends, is turned down or is cancelled, or when the promise is undone.
  function fresh() { return { rev: 0, lines: {}, extras: [], hist: { A: [], B: [] }, order: [], hours: 46, links: {}, claims: {}, removed: {} }; }
  function norm(o) { o.links = o.links || {}; o.claims = o.claims || {}; o.removed = o.removed || {}; return o; }
  function load() { try { return norm(JSON.parse(local.get(SKEY)) || fresh()); } catch (e) { return fresh(); } }
  var srv = (auto && !q.get("g")) ? fresh() : load();
  var streams = [];
  function save() { srv.rev++; local.set(SKEY, JSON.stringify(srv)); if (chan) chan.postMessage({ rev: srv.rev }); }
  function ping() { streams.forEach(function (t) { t(); }); } // tells this page's own live stream about a change made by a frame script (a change from another page arrives by itself)
  function label(k, r) {
    var n = NAMES[Number(k.slice(1))];
    return r.state === "got" ? n + ", got it" : r.state === "notgot" ? n + ", couldn't find" : r.state === "swapped" ? n + ", got " + r.words + " instead" : n + ", back to open";
  }
  function lineOf(k) { return srv.lines[k] || { state: "open", words: "", by: "" }; }
  function put(k, r) { if (r.state === "open") delete srv.lines[k]; else srv.lines[k] = r; }
  function seen(link) { if (srv.order.indexOf(link) === -1) srv.order.push(link); }
  function linkOf(link) { return srv.links[link] || (srv.links[link] = { committed: false, dead: false }); }
  // "I won't do it" is gone for good once the link has had any line answered or has promised, even if Undo takes either back (owner, 11 October 2026, SL-D34). The server answers reject with 409 after that.
  function touch(link) { linkOf(link).touched = true; }
  function live(link) { var l = srv.links[link]; return !!l && !l.dead && !l.ended; }
  function claimOf(k) { var c = srv.claims[k]; return c && live(c) ? c : ""; } // who has promised this line, if that link is still alive
  // A link stops (turned down by its shopper, ended by its window, cancelled by a member): what it had promised and not answered goes back to the open pool (SL-D23, SL-D27).
  function endLink(link, how) {
    var l = linkOf(link);
    if (how === "rejected") { l.dead = true; l.deadAt = Date.now(); } else { l.ended = how; }
    Object.keys(srv.claims).forEach(function (k) { if (srv.claims[k] === link) delete srv.claims[k]; });
  }
  function snapshot(link) {
    var lines = {};
    NAMES.forEach(function (n, i) {
      var k = "l" + i, r = lineOf(k), c = r.state === "open" ? claimOf(k) : "";
      lines[k] = { state: r.state, words: r.words, by: r.by ? (r.by === link ? "you" : "other") : "", claim: c ? (c === link ? "you" : "other") : "" };
    });
    var h = srv.hist[link] || [];
    return { rev: srv.rev, lines: lines, extras: srv.extras.filter(function (x) { return x.by === link; }).map(function (x) { return { id: x.id, text: x.text }; }), last: h.length ? { label: h[h.length - 1].label } : null, hours: srv.hours, committed: !!linkOf(link).committed, refusable: !linkOf(link).touched, dead: !!linkOf(link).dead, gone: !live(link) };
  }
  function push(link, label_, undo) { seen(link); (srv.hist[link] = srv.hist[link] || []).push({ label: label_, undo: undo }); }
  function act(path, d, link) {
    var k, r, prev;
    if (path === "line") {
      k = d.get("key"); r = lineOf(k); prev = r;
      if (r.state !== "open" && r.by && r.by !== link) return 409; // got, swapped or not found on another link: locked (SL-J4; not found joins them by the owner's answer of 11 October 2026, SL-D37)
      if (r.state === "open" && claimOf(k) && claimOf(k) !== link) return 409; // promised on another link: locked too, so two people never buy the same line (SL-D26, extends SL-J4)
      var w = (d.get("swap") || "").trim().slice(0, 120), st = d.get("state");
      var n = w ? { state: "swapped", words: w, by: link } : st === "open" ? { state: "open", words: "", by: "" } : { state: st, words: "", by: link };
      put(k, n); touch(link); push(link, label(k, n), [{ k: k, prev: prev }]);
    } else if (path === "extra") {
      var t = (d.get("text") || "").trim().slice(0, 120);
      if (t) { var x = { id: "x" + (srv.rev + 1), text: t, by: link }; srv.extras.push(x); push(link, "Also got: " + t, [{ extra: x.id }]); }
    } else if (path === "extra/remove") {
      var gone = srv.extras.filter(function (v) { return v.id === d.get("id"); })[0];
      if (gone) { srv.extras = srv.extras.filter(function (v) { return v !== gone; }); push(link, "Removed: " + gone.text, [{ put: gone }]); }
    } else if (path === "unresolved") {
      var undo = [];
      NAMES.forEach(function (n_, i) { var kk = "l" + i; if (lineOf(kk).state === "open" && (!claimOf(kk) || claimOf(kk) === link)) { undo.push({ k: kk, prev: lineOf(kk) }); put(kk, { state: "notgot", words: "", by: link }); } });
      if (undo.length) { touch(link); push(link, "The rest, can't buy", undo); }
    } else if (path === "undo") {
      var h = (srv.hist[link] || []).pop();
      if (h) h.undo.forEach(function (u) { if (u.k) put(u.k, u.prev); else if (u.claim) delete srv.claims[u.claim]; else if (u.committed) linkOf(link).committed = false; else if (u.extra) srv.extras = srv.extras.filter(function (v) { return v.id !== u.extra; }); else if (u.put) srv.extras.push(u.put); });
    } else if (path === "commit") {
      // "I'll get these" (SL-D21): every line still open and not promised elsewhere becomes this link's promise. Lines already answered are untouched.
      var mine = []; touch(link);
      NAMES.forEach(function (n_, i) { var kk = "l" + i; if (lineOf(kk).state === "open" && !claimOf(kk)) { srv.claims[kk] = link; mine.push({ claim: kk }); } });
      linkOf(link).committed = true;
      push(link, "Promised " + mine.length + (mine.length === 1 ? " line" : " lines"), mine.concat([{ committed: true }]));
    } else if (path === "reject") {
      // "I won't do it" (SL-D23): the link is dead at once, its promise is cleared, and it cannot be undone. After any swipe or a promise the server answers 409 and changes nothing (SL-D34).
      if (linkOf(link).touched) return 409;
      endLink(link, "rejected");
    } else if (path === "batch") {
      var got = d.getAll("got"), undo2 = [];
      NAMES.forEach(function (n_, i) {
        var kk = "l" + i, cur = lineOf(kk), sw = (d.get("swap_" + kk) || "").trim().slice(0, 120);
        if (cur.state !== "open" && cur.by && cur.by !== link) return; // answered on another link (got, swapped or not found): left as it is
        if (cur.state === "open" && claimOf(kk) && claimOf(kk) !== link) return;
        undo2.push({ k: kk, prev: cur });
        put(kk, sw ? { state: "swapped", words: sw, by: link } : got.indexOf(kk) !== -1 ? { state: "got", words: "", by: link } : { state: "notgot", words: "", by: link });
      });
      d.getAll("also").forEach(function (t2) { t2 = t2.trim().slice(0, 120); if (t2) { var x2 = { id: "x" + (srv.rev + 1) + undo2.length, text: t2, by: link }; srv.extras.push(x2); undo2.push({ extra: x2.id }); } });
      touch(link); push(link, "Sent the whole list", undo2);
    }
    save();
    return 200;
  }
  var realFetch = window.fetch;
  var json = function (status, body) { return new Response(JSON.stringify(body), { status: status, headers: { "content-type": "application/json" } }); };
  var SHARE_TEXT = "Shopping list\n- bananas, 6\n- bread, 1 loaf\n- cheddar, 1 block\n- dish soap\n- eggs, a dozen (2 left, minimum 6)\n- milk, 2 L\n- olive oil, 1 bottle\n- onions (running low)\n- penne, 500 g\n- rice, 2 kg\n- spinach, 1 bag\n- tomatoes, 1 kg\n\nTick off what you get, no sign-in needed. The link works for 48 hours:\nhttps://kitchie.example/list/sample-link-not-real-000000000000000000000";
  window.fetch = function (url, opts) {
    if (!opts || opts.method !== "POST") return realFetch.apply(window, arguments);
    var to = String(url), m = /(?:^|\/)(line|extra\/remove|extra|unresolved|undo|batch|commit|reject)$/.exec(to);
    if (m && /(^|\/)api\//.test(to)) {
      var d = new URLSearchParams(opts.body), code;
      return wait(120).then(function () {
        if (srv.links[me] && (srv.links[me].dead || srv.links[me].ended)) return json(404, {}); // a link that has finished answers the one neutral 404
        code = act(m[1], d, me); return json(code, snapshot(me));
      });
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
    streams.push(tell);
    setTimeout(tell, 0);
    me_._on = function () { srv = load(); tell(); };
    if (chan) chan.addEventListener("message", me_._on);
    window.addEventListener("storage", function (e) { if (e.key === SKEY) me_._on(); });
  }
  FakeStream.prototype.close = function () { this.readyState = 2; };
  window.EventSource = FakeStream;

  // ================================================================ seeds for the fixed frames
  function seed(lines, extras, last, committed) {
    Object.keys(lines).forEach(function (k) { var v = lines[k]; srv.lines[k] = { state: v[0], words: v[1] || "", by: v[2] || "A" }; });
    (extras || []).forEach(function (t, i) { srv.extras.push({ id: "x" + (i + 1), text: t, by: "A" }); });
    if (last) srv.hist.A.push({ label: last, undo: [] });
    if (committed) { var l = linkOf("A"); l.committed = true; Object.keys(committed).forEach(function (k) { srv.claims[k] = "A"; }); }
    if (committed || Object.keys(lines).some(function (k) { return (lines[k][2] || "A") === "A"; })) touch("A"); // this link has answered a line or promised: no "I won't do it" any more (SL-D34)
    srv.rev++;
  }
  // Link facts the member screens print (opened, hours left, slot); the shopper's page does not use them. Mockup only.
  function meta(link, o) { var l = linkOf(link); Object.keys(o).forEach(function (k) { l[k] = o[k]; }); if (srv.order.indexOf(link) === -1) srv.order.push(link); }
  function claim(link, keys) { keys.forEach(function (k) { srv.claims[k] = link; }); linkOf(link).committed = true; }
  var MID = { l0: ["got"], l1: ["got"], l2: ["got"], l3: ["notgot"], l4: ["got"], l5: ["got"], l8: ["swapped", "fusilli, same size"] };
  var ALL = ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11"];
  var rest = function (done) { return ALL.filter(function (k) { return done.indexOf(k) === -1; }); };
  if (auto && !q.get("g")) {
    if (s === "done" || s === "done-none") {
      // Nothing left (SL-D18). "done": 9 of 12 got, one swapped, two not found. "done-none": nothing was bought, every line not found; still a calm end, not an error.
      var all = {};
      NAMES.forEach(function (n_, i) { all["l" + i] = s === "done-none" ? ["notgot"] : [["l6", "l10"].indexOf("l" + i) !== -1 ? "notgot" : i === 8 ? "swapped" : "got", i === 8 ? "fusilli, same size" : ""]; });
      seed(all, s === "done" ? ["2 cans of sparkling water"] : [], s === "done-none" ? "The rest, can't buy" : "Tomatoes, got it");
    }
    if (s === "mid" || s.indexOf("drag") === 0 || s === "leave" || s === "swap" || s === "also" || s === "live" || s === "reopen" || s === "wont") {
      var mid = {};
      Object.keys(MID).forEach(function (k) { mid[k] = MID[k]; });
      if (s.indexOf("drag") === 0 || s === "leave") mid = { l0: ["got"], l1: ["got"] };
      if (s === "swap") mid = { l0: ["got"], l1: ["got"], l2: ["got"], l3: ["got"], l4: ["got"], l5: ["got"], l7: ["got"] };
      if (s === "live") { mid = { l0: ["got"], l1: ["got"], l5: ["got"], l10: ["got", "", "B"] }; }
      if (s === "also") mid = { l0: ["got"], l1: ["got"], l2: ["got"], l4: ["got"], l5: ["got"] };
      if (s === "reopen") { mid = { l0: ["got"], l1: ["got"], l2: ["got"], l3: ["got"], l4: ["got"], l5: ["got"], l6: ["notgot"], l8: ["swapped", "fusilli, same size"], l10: ["notgot"] }; }
      // These are mid-shop frames of the first round: the shopper has already made the promise (SL-D21), so the rest of the list is theirs.
      var promised = {};
      rest(Object.keys(mid).concat(s === "live" ? [] : [])).forEach(function (k) { promised[k] = 1; });
      seed(mid, s === "also" ? ["2 cans of sparkling water", "birthday candles"] : s === "mid" || s === "wont" ? ["2 cans of sparkling water"] : [], s === "also" ? "Also got: birthday candles" : s.indexOf("drag") === 0 || s === "leave" ? "Bread, got it" : s === "swap" ? "Onions, got it" : s === "live" ? "Milk, got it" : s === "reopen" ? "Spinach, couldn't find" : "Penne, got fusilli, same size instead", promised);
    }
    // ---- the second round (owner, voice, 11 October 2026: SL-D21 on) ----
    if (s === "trim" || s === "committed") {
      // Swiped left on three lines (wrong shop: dish soap, olive oil, spinach). "trim": not promised yet. "committed": then "I'll get these" on the nine that are left.
      var trimmed = { l3: ["notgot"], l6: ["notgot"], l10: ["notgot"] }, prom = {};
      if (s === "committed") rest(Object.keys(trimmed)).forEach(function (k) { prom[k] = 1; });
      seed(trimmed, [], s === "committed" ? "Promised 9 lines" : "Spinach, couldn't find", s === "committed" ? prom : null);
    }
    if (s === "committed-all") { var pall = {}; ALL.forEach(function (k) { pall[k] = 1; }); seed({}, [], "Promised 12 lines", pall); }
    if (s === "bailed") {
      // Promised, bought some on the way, then "Won't be able to buy these": what was still untouched is now not bought.
      var bl = { l0: ["got"], l1: ["got"], l2: ["got"], l4: ["got"], l5: ["got"], l8: ["swapped", "fusilli, same size"], l3: ["notgot"], l6: ["notgot"], l7: ["notgot"], l9: ["notgot"], l10: ["notgot"], l11: ["notgot"] }, pb = {};
      ALL.forEach(function (k) { pb[k] = 1; });
      seed(bl, [], "The rest, can't buy", pb);
    }
    if (s === "claimed-other" || s === "released") {
      // Another shopper (link B) promised the last five lines; they have dropped out of this shopper's list. "released": a moment after load that link is cancelled and they come back.
      meta("B", { slot: 2 }); claim("B", ["l7", "l8", "l9", "l10", "l11"]); srv.rev++;
    }
    if (s === "notfound-other") {
      // Another shopper (link B) could not find three lines (dish soap, olive oil, spinach). Like a line they got, they have dropped off this shopper's list, live (SL-D37).
      meta("B", { slot: 2 }); seed({ l3: ["notgot", "", "B"], l6: ["notgot", "", "B"], l10: ["notgot", "", "B"] }, [], ""); touch("B");
    }
    // ---- the household's view (SL-D25 on): member-list.html and link.html. The links' own facts (opened, hours left, slot) are mockup data; the lines and claims are the pretend server's.
    if (page === "member-list") {
      if (s === "states") {
        // One link out: Link 1 promised five lines and bought two of them, so the screen shows needed, claimed (grouped under the link) and bought side by side.
        meta("A", { slot: 1, opened: "3 hours ago", left: 45 }); claim("A", ["l0", "l1", "l6", "l7", "l8"]);
        seed({ l0: ["got"], l1: ["got"] }, ["2 cans of sparkling water"], "Bread, got it");
      }
      if (s === "three") {
        // Three links out at once, each with its own group: A has bought one, B has bought one and swapped one, C has only promised.
        meta("A", { slot: 1, opened: "3 hours ago", left: 45 }); claim("A", ["l0", "l1", "l2"]);
        meta("B", { slot: 2, opened: "5 hours ago", left: 43 }); claim("B", ["l4", "l5", "l6"]);
        meta("C", { slot: 3, opened: "40 minutes ago", left: 47 }); claim("C", ["l9", "l10", "l11"]);
        seed({ l0: ["got", "", "A"], l4: ["got", "", "B"], l5: ["swapped", "oat milk, 2 L", "B"] }, [], "");
      }
      if (s === "sorting") {
        // The shopper swiped left on three lines and bought the rest but three: the household is nudged, and the three that nobody has sit at the top with what to do.
        meta("A", { slot: 1, opened: "2 hours ago", left: 46 }); claim("A", ALL.filter(function (k) { return k !== "l3" && k !== "l6" && k !== "l10"; }));
        seed({ l0: ["got"], l1: ["got"], l2: ["got"], l4: ["got"], l5: ["got"], l8: ["swapped", "fusilli, same size"], l3: ["notgot"], l6: ["notgot"], l10: ["notgot"] }, [], "Spinach, couldn't find");
      }
      if (s === "dead") {
        // Link 1 is out; Link 2's shopper turned the trip down an hour ago (grey, no countdown, Dismiss; its slot is free); Link 3 has not been opened. Link 2 turned the trip down before swiping or promising anything (SL-D34), so there is nothing of its to clear.
        meta("A", { slot: 1, opened: "3 hours ago", left: 45 }); claim("A", ["l0", "l1", "l2"]);
        meta("B", { slot: 2 }); endLink("B", "rejected"); linkOf("B").deadAgo = "1 hour ago";
        meta("C", { slot: 3, opened: false, left: 31 });
        seed({ l0: ["got"] }, [], "Bananas, got it");
      }
      if (s === "ended") {
        // Link 2's window ran out 20 minutes ago with three lines promised and not answered: they went back to needed. Link 1 is still out.
        meta("A", { slot: 1, opened: "3 hours ago", left: 45 }); claim("A", ["l0", "l1"]);
        meta("B", { slot: 2 }); endLink("B", "expired"); linkOf("B").endedAgo = "20 minutes ago"; linkOf("B").back = 3;
        seed({ l0: ["got"] }, [], "Bananas, got it");
      }
      save();
    }
    if (page === "link") {
      // One link, tapped into. The same data on every frame but "unopened", "opened" and "dead": Link 2 promised nine lines; three are got, one swapped, two not found, three still promised.
      var base = function () {
        meta("A", { slot: 2, opened: "3 hours ago", left: 31 }); claim("A", ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"]);
        seed({ l0: ["got"], l1: ["got"], l2: ["got"], l8: ["swapped", "fusilli, same size"], l3: ["notgot"], l6: ["notgot"] }, [], "");
      };
      if (s === "unopened") meta("A", { slot: 2, opened: false, left: 47 });
      if (s === "opened") meta("A", { slot: 2, opened: "20 minutes ago", left: 47 });
      if (s === "promised") { meta("A", { slot: 2, opened: "20 minutes ago", left: 47 }); claim("A", ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11"]); }
      if (s === "active" || s === "got" || s === "swapped" || s === "notfound") base();
      if (s === "dead") { meta("A", { slot: 2 }); endLink("A", "rejected"); linkOf("A").deadAgo = "1 hour ago"; }
      save();
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

  // In the fragment's live try-it, a shopper's link shows up on the household's screen as soon as the page is opened, as a link that has been opened just now.
  if (page === "list" && q.get("g")) { seen(me); linkOf(me); save(); }
  // ================================================================ list.html as the server would draw it (SL-D18)
  // The real server draws every line with its state and marks the answered ones data-sl-gone, so the page is right before shopper.js runs and a second visit shows only what is left.
  // Here the static file has twelve open lines, so this does what that server would have done, from the pretend server's state, before shopper.js reads the page.
  if (page === "list" && list) {
    // A link that has been turned down, ended or cancelled answers with the neutral page, however it is opened again.
    if (srv.links[me] && (srv.links[me].dead || srv.links[me].ended)) { location.replace("finished.html"); return; }
    root_ = document.getElementById("sl"); if (root_) { root_.setAttribute("data-sl-committed", linkOf(me).committed ? "1" : "0"); root_.setAttribute("data-sl-refusable", linkOf(me).touched ? "0" : "1"); }
    Array.prototype.forEach.call(list.querySelectorAll("li[data-shop-row]"), function (li) {
      var r = lineOf(li.getAttribute("data-key")), by = r.by ? (r.by === me ? "you" : "other") : "", st = r.state;
      var lock = by === "other" && st !== "open"; // answered on another link (got, swapped or not found, SL-D37): locked here
      if (lock) li.setAttribute("data-sl-lock", st === "notgot" ? "passed" : "got");
      var cl = st === "open" ? claimOf(li.getAttribute("data-key")) : "";
      if (cl) li.setAttribute("data-claim", cl === me ? "you" : "other");
      if (cl && cl !== me) li.setAttribute("data-sl-gone", "");
      li.setAttribute("data-state", st);
      if (by === "you" || lock) li.setAttribute("data-by", by);
      if (st === "swapped" && !lock) li.querySelector(".sl-swap input").value = r.words;
      if (st === "got") li.querySelector('input[name="got"]').checked = true;
      if (st !== "open") li.setAttribute("data-sl-gone", "");
    });
  }

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
      if (also) { also.textContent = ""; srv.extras.forEach(function (x) { var li = document.createElement("li"), sp = document.createElement("span"), sm = document.createElement("small"); li.appendChild(icon("M6 8h12l-1 12H7zM9 8V6.5a3 3 0 0 1 6 0V8", 22)); sp.appendChild(document.createTextNode(x.text)); sm.textContent = pantryNote(x.text); sp.appendChild(sm); li.appendChild(sp); also.appendChild(li); }); sect.hidden = srv.extras.length === 0; }
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

  // What the household's pages (mock-member.js) read. Mockup only.
  window.KitchieMock = { srv: function () { return srv; }, reload: function () { srv = load(); }, names: NAMES, qty: QTY, pantry: PANTRY, linkOf: linkOf, live: live, claimOf: claimOf, endLink: endLink, put: put, save: save, ping: ping, group: group, as: me, auto: auto, chan: chan, key: SKEY, topOf: topOf, store: store };
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

  // A second visit (?s=reopen) needs no code of its own: the server's drawing above leaves out everything that was answered, so the page shows only what is left (SL-D18).
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
    // Mid-drag frames: the same attributes shopper.js sets while a finger moves (the reveal colour follows --sl-p, 0 to 1, and turns solid once armed).
    var DRAGS = { "drag": ["l3", "got", 62, false], "drag-armed": ["l3", "got", 150, true], "drag-no": ["l3", "notgot", -62, false], "drag-no-armed": ["l3", "notgot", -150, true] };
    if (DRAGS[s]) setTimeout(function () {
      var d = DRAGS[s], li = row(d[0]), need = Math.max(80, li.querySelector(".swfg").offsetWidth * 0.3);
      li.setAttribute("data-sl-drag", d[1]); if (d[3]) li.setAttribute("data-sl-armed", "");
      li.style.setProperty("--sl-p", Math.min(1, Math.abs(d[2]) / need).toFixed(3));
      li.querySelector(".swfg").style.setProperty("--dx", d[2] + "px");
      window.scrollTo(0, topOf(li) - 150);
    }, 80);
    // The line leaves: after a moment the frame answers Cheddar by tapping its tick, so the hold, the fold and the lines moving up can be watched. Reload to see it again.
    if (s === "leave") setTimeout(function () { window.scrollTo(0, topOf(row("l2")) - 100); }, 100);
    if (s === "leave") setTimeout(function () { row("l2").querySelector('input[name="got"]').click(); }, 1500);
    if (s === "swap") setTimeout(function () { row("l8").querySelector("details").open = true; typed("l8", "fusilli, same size", false); window.scrollTo(0, topOf(row("l5")) - 76); }, 120);
    if (s === "also") setTimeout(function () { var i = document.getElementById("sl-also-in"); i.value = "2 litres of lemonade"; window.scrollTo(0, document.body.scrollHeight); }, 120);
    if (s === "mid" || s === "wont") setTimeout(function () { window.scrollTo(0, topOf(row("l3")) - 100); }, 120);
    if (s === "live") setTimeout(function () { window.scrollTo(0, topOf(row("l9")) - 120); }, 120);
    if (s === "live") setTimeout(function () { S().say("Someone else just got Spinach."); }, 140);
    if (s === "wont") setTimeout(function () { document.querySelector("[data-sl-wont]").click(); }, 140);
    // ---- the second round (SL-D21 on)
    if (s === "reject-ask" || s === "rejected") setTimeout(function () { document.querySelector("[data-sl-plan] [data-sl-refuse]").click(); }, 140);
    if (s === "rejected") setTimeout(function () { document.querySelector("[data-sl-plan] [data-sl-refuse-yes]").click(); }, 260);
    if (s === "claimed-other") setTimeout(function () { S().say("Someone else is getting 5 of these."); }, 140);
    if (s === "notfound-other") setTimeout(function () { S().say("Someone else has dealt with 3 of these."); }, 140);
    // Link B ends (its member cancelled it; the same happens when it expires): what it had promised and not answered goes back to the open pool, live.
    if (s === "released") setTimeout(function () { endLink("B", "cancelled"); save(); ping(); }, 1500);
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
