// Shopper link, PHASE TWO, NOT BUILT: snap the receipt instead of ticking. Mockup only for now.
// Fetched by shopper.js only when the shopper picks "Snap the receipt": before that the page has no camera input, no WebSocket and none of this code.
// Owner's direction (voice, 10 October 2026): the photo goes to the Kitchie server over a WebSocket, the server reads it (OCR or computer vision
// on the server, no AI model, no tokens) and pushes the answer back over the same socket. The read is good enough when 80% or more of the list's
// lines are findable on the receipt. Under that the shopper is asked for one more photo; after a second miss they are steered to ticking the list.
// The server decides both (the threshold and whether another photo is allowed); this file only shows what the server says.
//
// Proposals (the owner did not say):
//   - the socket opens when the mode is chosen, so it is ready by the time the photo is taken;
//   - messages: browser to server, one binary frame (the photo). Server to browser, JSON text frames:
//       {"t":"progress","found":5,"total":12}                            while reading
//       {"t":"result","ok":true,"found":["l0","l1"],"total":12}          80% or more: the keys of the lines found
//       {"t":"result","ok":false,"again":true,"found":[...],"total":12}  under 80%; again says whether one more photo is allowed
//   - a good read does not send anything: the lines found arrive ticked on the list, the shopper checks the rest and presses Send as usual.
(function () {
  "use strict";
  var S = window.KitchieShopperLink;
  if (!S) return;
  var root = S.root, view = null, sock = null, total = S.rows().length;
  var ICON = { cam: "M4 8h3l2-3h6l2 3h3v11H4zM15.5 13a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z", receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  function icon(d, size) {
    var NS = "http://www.w3.org/2000/svg", s = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
    s.setAttribute("width", size); s.setAttribute("height", size); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "1.8"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
    p.setAttribute("d", d); s.appendChild(p);
    return s;
  }

  // ---- the receipt view: one card, four faces (ask, reading, retry, fallback)
  var title, text, bar, cam, camText, back;
  function build() {
    view = el("section", "sl-view sl-rcpt"); view.setAttribute("data-sl-view", "receipt"); view.hidden = true;
    var card = el("div", "shop-empty sl-end"), ric = el("span", "ric"), file = el("input", "sr-only");
    ric.setAttribute("aria-hidden", "true"); ric.appendChild(icon(ICON.receipt, "32"));
    title = el("b"); title.tabIndex = -1;
    text = el("p");
    bar = el("progress", "sl-rcpt-bar"); bar.max = total; bar.value = 0; bar.setAttribute("aria-label", "Reading the receipt");
    cam = el("label", "btn"); camText = el("span");
    file.type = "file"; file.accept = "image/*"; file.setAttribute("capture", "environment"); file.setAttribute("data-sl-rcpt-file", "");
    file.addEventListener("change", function () { if (file.files && file.files[0]) read(file.files[0]); file.value = ""; });
    cam.appendChild(icon(ICON.cam, "22")); cam.appendChild(camText); cam.appendChild(file);
    back = el("button", "btn"); back.type = "button";
    back.addEventListener("click", toList);
    [ric, title, text, bar, cam, back].forEach(function (n) { card.appendChild(n); });
    view.appendChild(card);
    S.form.appendChild(view);
  }
  function face(name, found) {
    var F = {
      ask: ["Snap the receipt", "Lay it flat and get all of it in the photo. We tick off what we can read.", "Open the camera", "Tick the list instead"],
      reading: ["Reading the receipt", "Found " + found + " of " + total + " so far.", "", ""],
      retry: ["That one was hard to read", "We could only find " + found + " of " + total + ". One more photo, flatter and closer?", "Try one more photo", "Tick the list instead"],
      fallback: ["Hey, that didn't work out", "It might just be easier to tick this off from the list.", "", "Tick the list"]
    }[name];
    view.setAttribute("data-sl-rcpt", name);
    title.textContent = F[0]; text.textContent = F[1];
    bar.hidden = name !== "reading"; bar.value = found || 0;
    cam.hidden = F[2] === ""; camText.textContent = F[2];
    back.hidden = F[3] === ""; back.textContent = F[3];
    back.className = name === "fallback" ? "btn go" : "btn";
  }
  function pressed(mode) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-sl-mode]"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-sl-mode") === mode)); });
  }
  function toList() { hang(); pressed("tick"); S.show("list"); }

  // ---- the socket: opened when the mode is chosen, closed when the shopper leaves it
  function connect() {
    if (sock && sock.readyState < 2) return sock;
    var u = new URL(root.getAttribute("data-sl-receipt-ws") || "receipt", location.href);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    sock = new WebSocket(u.href);
    sock.binaryType = "arraybuffer";
    sock.onmessage = function (e) {
      var m; try { m = JSON.parse(e.data); } catch (err) { return; }
      if (m.t === "progress") face("reading", Number(m.found) || 0);
      if (m.t === "result") result(m);
    };
    sock.onerror = function () { face("fallback"); };
    return sock;
  }
  function hang() { if (sock) { try { sock.close(); } catch (e) { /* already closed */ } sock = null; } }
  function read(photo) {
    face("reading", 0); title.focus({ preventScroll: true });
    var s = connect(), go = function () { s.send(photo); };
    if (s.readyState === 1) go(); else s.onopen = go;
  }
  function result(m) {
    var found = Array.isArray(m.found) ? m.found : [];
    if (m.ok) { apply(found); return; }
    if (m.again) { face("retry", found.length); title.focus({ preventScroll: true }); return; }
    // Second miss: the owner's fallback, and the receipt button goes away for this link.
    face("fallback"); title.focus({ preventScroll: true });
    var b = root.querySelector('[data-sl-mode="receipt"]'); if (b) b.hidden = true;
    var modes = root.querySelector("[data-sl-modes]"); if (modes) modes.hidden = true;
  }
  // A good read: the lines found arrive ticked, the rest say "Not on the receipt". Nothing is sent; the shopper checks and presses Send.
  function apply(found) {
    var missed = 0;
    S.rows().forEach(function (li) {
      var hit = found.indexOf(S.keyOf(li)) !== -1, old = li.querySelector(".sl-rcpt-miss");
      if (old) old.remove();
      if (hit) { if (S.words(li) === "") S.box(li).checked = true; return; }
      if (S.box(li).checked || S.words(li) !== "") return;
      missed++;
      li.querySelector(".smain").appendChild(el("span", "sl-rcpt-miss", "Not on the receipt"));
    });
    var note = root.querySelector(".sl-rcpt-note") || el("p", "sl-rcpt-note");
    note.textContent = ""; note.setAttribute("role", "status");
    note.appendChild(icon(ICON.receipt, "22"));
    note.appendChild(el("span", "", "Found " + found.length + " of " + total + " on the receipt. " + (missed ? "Check the " + (missed === 1 ? "one" : missed) + " left, then Send." : "Have a look, then Send.")));
    S.list.parentNode.insertBefore(note, S.list);
    S.refresh();
    toList();
  }

  window.KitchieReceipt = {
    open: function () { if (!view) build(); face("ask"); pressed("receipt"); S.show("receipt"); connect(); },
    read: read
  };
})();
