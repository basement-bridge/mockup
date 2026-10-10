// MOCKUP ONLY. NOT FOR THE BUILD. (fragments/shopper-link)
// Stands in for the Kitchie server on this fragment's pages and jumps a frame to the state named in its address, so the fragment page can
// show every state side by side. Sample answers and sample outcomes live here, never in the stylesheets or in the files meant for the build.
//   list.html            ?s=ticked | swap | ready | summary | none            phase one
//                        ?s=p2 | p2-ask | p2-reading | p2-ok | p2-retry | p2-fallback   phase two (not built); ?p2=1 only shows the chooser
//   member.html          ?share=a | b | c   where the Share control sits      ?live=0 | 1 | 3   how many links are live
//   member-result.html   ticks, the Done shopping count and Dismiss work     ?at=mid   starts scrolled to the swapped line
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

  // A theme picked on the fragment page reaches its frames.
  window.addEventListener("storage", function (e) { if (e.key === "theme") location.reload(); });

  // Each frame keeps its own ticks, and a frame that shows a fixed state starts clean every time.
  var scope = "demo-" + page + (s ? "-" + s : "");
  if (form) {
    form.setAttribute("data-sl-link", scope);
    if (auto) { try { localStorage.removeItem("kitchie.sl:" + scope); } catch (e) { /* no storage */ } }
  }

  // ---- the server's answers
  var SHARE_TEXT = "Shopping list\n- bananas, 6\n- bread, 1 loaf\n- cheddar, 1 block\n- dish soap\n- eggs, a dozen (2 left, minimum 6)\n- milk, 2 L\n- olive oil, 1 bottle\n- onions (running low)\n- penne, 500 g\n- rice, 2 kg\n- spinach, 1 bag\n- tomatoes, 1 kg\n\nTick off what you got, no sign-in needed. Works for 48 hours:\nhttps://kitchie.example/list/sample-link-not-real-000000000000000000000";
  var realFetch = window.fetch;
  window.fetch = function (url, opts) {
    if (!opts || opts.method !== "POST") return realFetch.apply(window, arguments);
    var to = String(url);
    if (/share$/.test(to)) {
      store.set("sl-mock-live", "1");
      return wait(350).then(function () { return new Response(JSON.stringify({ url: "https://kitchie.example/list/sample-link-not-real-000000000000000000000", text: SHARE_TEXT, expires_at: new Date(Date.now() + 48 * 3600000).toISOString() }), { status: 200, headers: { "content-type": "application/json" } }); });
    }
    if (/share\/(cancel|dismiss)$/.test(to)) { store.set("sl-mock-live", null); return wait(250).then(function () { return new Response("", { status: 200 }); }); }
    // The shopper's Send: remember what was posted so sent.html can show it, then answer as the server would after its redirect.
    var body = new URLSearchParams(opts.body), sent = { got: body.getAll("got"), swaps: {}, names: {} };
    body.forEach(function (v, k) { if (k.indexOf("swap_") === 0) sent.swaps[k.slice(5)] = v; });
    Array.prototype.forEach.call(list.querySelectorAll("li[data-shop-row]"), function (li) { sent.names[li.getAttribute("data-key")] = li.getAttribute("data-name"); });
    store.set("sl-mock-sent:" + scope, JSON.stringify(sent));
    return wait(450).then(function () { return { ok: true, status: 200, url: "sent.html?from=" + encodeURIComponent(scope) }; });
  };

  // ---- sent.html: show what this frame's shopper really sent (the server would have drawn it)
  if (page === "sent" && q.get("from")) {
    var raw = store.get("sl-mock-sent:" + q.get("from")), sent = null;
    try { sent = JSON.parse(raw); } catch (e) { sent = null; }
    if (sent) {
      var keys = Object.keys(sent.names), swapped = keys.filter(function (k) { return sent.swaps[k]; });
      var got = keys.filter(function (k) { return sent.got.indexOf(k) !== -1 && !sent.swaps[k]; });
      var notgot = keys.filter(function (k) { return got.indexOf(k) === -1 && swapped.indexOf(k) === -1; });
      var n = { got: got.length, swapped: swapped.length, notgot: notgot.length };
      var bits = ["Got " + n.got + " of " + keys.length];
      if (n.swapped) bits.push(n.swapped + " swap" + (n.swapped === 1 ? "" : "s"));
      if (n.notgot) bits.push(n.notgot + " not got");
      document.querySelector("[data-sl-sum]").textContent = n.got + n.swapped === 0 ? "Nothing ticked." : bits.join(" · ") + ".";
      Object.keys(n).forEach(function (k) { var c = document.querySelector('[data-sl-tally="' + k + '"]'); c.setAttribute("data-n", n[k]); c.querySelector("b").textContent = n[k]; });
      var ul = document.querySelector(".sl-lines"), proto = { swapped: ul.querySelector('[data-sl-line="swapped"]'), notgot: ul.querySelector('[data-sl-line="notgot"]') };
      ul.textContent = "";
      if (n.got + n.swapped > 0) [["swapped", swapped], ["notgot", notgot]].forEach(function (g) {
        g[1].forEach(function (k) { var li = proto[g[0]].cloneNode(true); li.querySelector("b").textContent = sent.names[k]; li.querySelector("small").textContent = g[0] === "swapped" ? "Got instead: " + sent.swaps[k] : "Not got"; ul.appendChild(li); });
      });
    }
  }
  // ---- summary.html and the pages with no script: a plain POST has nowhere to go on a static host, so Send walks on to the next page.
  if (page === "summary") document.addEventListener("submit", function (e) { e.preventDefault(); location.href = "sent.html"; });

  // ---- member.html: which Share control, how many live links
  if (page === "member") {
    var share = q.get("share") || "a";
    Array.prototype.forEach.call(document.querySelectorAll("[data-mock-share]"), function (n) { if (n.getAttribute("data-mock-share") !== share) n.remove(); });
    var fresh = !q.has("live") && store.get("sl-mock-live") === "1";
    var live = fresh ? 1 : Number(q.get("live") || 0), lines = document.querySelectorAll(".sl-live");
    Array.prototype.forEach.call(lines, function (n, i) { if (i >= live) n.remove(); });
    if (fresh) lines[0].querySelector(".sl-live-t span").textContent = "Ends in 48 hours";
    if (share === "c") window.addEventListener("load", function () { window.scrollTo(0, document.body.scrollHeight); });
    if (live >= 3) { document.querySelector("[data-sl-full]").hidden = false; var f = document.querySelector('.sl-top [data-sl-share]'); if (f) f.hidden = true; }
  }

  // ---- member-result.html: the Shopping screen's own ticks (shopping.js and scribble.js in the app), enough of them to try the screen
  if (page === "member-result" && list) {
    var PATHS = ["M2 8 C20 3 40 11 60 5 S90 9 98 4", "M2 5 L98 9 M4 9 L96 4 M2 7 L98 6", "M1 7 C15 2 25 12 40 6 S70 2 99 8", "M2 4 C30 10 50 2 98 7 M3 9 C40 3 70 11 97 5", "M2 6 L10 3 L18 9 L28 3 L38 9 L50 3 L62 9 L74 3 L86 9 L98 5"];
    var hash = function (t) { var h = 0; for (var i = 0; i < t.length; i++) h = (Math.imul(h, 31) + t.charCodeAt(i)) >>> 0; return h; };
    var NS = "http://www.w3.org/2000/svg";
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
    var bar = document.getElementById("shop-done"), nEl = document.getElementById("shop-done-n"), toast = document.getElementById("toast");
    var recount = function () { var n = list.querySelectorAll("li[data-ticked]").length; nEl.textContent = n; bar.hidden = n === 0; };
    Array.prototype.forEach.call(list.querySelectorAll("li[data-shop-row]"), draw);
    list.addEventListener("click", function (e) {
      var b = e.target.closest(".tick"); if (!b) return;
      var li = b.closest("li"), on = b.getAttribute("aria-checked") !== "true";
      b.setAttribute("aria-checked", String(on)); li.toggleAttribute("data-ticked", on); draw(li); recount();
    });
    if (q.get("at") === "mid") window.addEventListener("load", function () { window.scrollTo(0, topOf(list.querySelector('li[data-id="s-07"]')) - 76); });
    bar.addEventListener("click", function () { toast.textContent = "In the app this asks “How much did you buy?” where no amount is known, then puts the ticked lines in the Pantry."; toast.hidden = false; setTimeout(function () { toast.hidden = true; }, 4200); });
  }

  if (page !== "list" || !list) return;

  // ---- PHASE TWO, NOT BUILT: the receipt reader. The server finds list lines on the receipt and applies the owner's rule (80%, one more try).
  var photos = 0, bad = q.get("r") === "bad" || s === "p2-retry" || s === "p2-fallback";
  function FakeSocket() { var me = this; me.readyState = 0; setTimeout(function () { me.readyState = 1; if (me.onopen) me.onopen({}); }, 0); }
  FakeSocket.prototype.close = function () { this.readyState = 3; };
  FakeSocket.prototype.send = function () {
    var me = this, keys = Array.prototype.map.call(list.querySelectorAll("li[data-shop-row]"), function (li) { return li.getAttribute("data-key"); });
    var miss = bad ? ["l1", "l3", "l6", "l7", "l10"] : ["l6", "l10"]; // 7 of 12 is 58%; 10 of 12 is 83%
    var found = keys.filter(function (k) { return miss.indexOf(k) === -1; }), stop = s === "p2-reading" ? 5 : found.length, n = 0;
    photos++;
    (function step() {
      if (me.readyState !== 1) return;
      if (n < stop) { n++; me.onmessage({ data: JSON.stringify({ t: "progress", found: n, total: keys.length }) }); wait(170).then(step); return; }
      if (s === "p2-reading") return; // this frame stays on the reading face
      me.onmessage({ data: JSON.stringify({ t: "result", ok: found.length / keys.length >= 0.8, again: photos < 2, found: found, total: keys.length }) });
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
  if (!auto) return;

  // ---- jump to the state, after shopper.js has run, by doing what a shopper would do
  var row = function (k) { return list.querySelector('li[data-key="' + k + '"]'); };
  var tick = function (keys) { keys.forEach(function (k) { row(k).querySelector('input[name="got"]').click(); }); };
  var typed = function (k, text, done) { var f = row(k).querySelector(".sl-swap input"); f.value = text; f.dispatchEvent(new Event("input", { bubbles: true })); if (done) f.dispatchEvent(new Event("change", { bubbles: true })); };
  var GOT = ["l0", "l1", "l2", "l3", "l4", "l5", "l7", "l9", "l11"]; // 9 of 12; penne swapped; olive oil and spinach not got
  document.addEventListener("DOMContentLoaded", function () {
    // A frame must not pull the keyboard focus (and the fragment page's scroll) to itself while it sets itself up.
    var focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function () {};
    setTimeout(function () { HTMLElement.prototype.focus = focus; }, 900);
    if (s === "ticked") tick(["l0", "l1", "l4", "l5"]);
    if (s === "swap") { tick(["l0", "l1", "l2", "l3", "l4", "l5", "l7"]); row("l8").querySelector("details").open = true; typed("l8", "fusilli, same size", false); setTimeout(function () { window.scrollTo(0, topOf(row("l5")) - 8); }, 60); }
    if (s === "ready" || s === "summary") { tick(GOT); typed("l8", "fusilli, same size", true); }
    if (s === "ready") setTimeout(function () { window.scrollTo(0, document.body.scrollHeight); }, 60);
    if (s === "summary" || s === "none") document.querySelector('.sl-send button[type="submit"]').click();
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
