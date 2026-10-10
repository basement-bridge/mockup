// Shopper link, the shopper's page (list.html). NEW FOR THE BUILD: lift this file as it is.
// The page is one plain form (a checkbox per line named got, a text field per line named swap_<key>, one submit), so it works without this file:
// the server then answers the first POST with the summary page and the second, carrying confirm=1, with the sent page. With this file:
//   - a line is one of three things: got (ticked), swapped (its field has words; the tick comes off, because a swap wins) or not got (neither);
//   - ticks and swap words are kept in this browser until the list is sent (Proposal P4), so a dropped tab loses nothing; nothing reaches the
//     server before Send on the summary: one write per link;
//   - Send shows the summary in place; Send there is one POST of got, swap_<key> (only the filled ones) and confirm=1, then the page the server
//     answers with (sent, or "That link has finished") replaces this one. If the POST cannot be made, the ticks stay and the person can try again;
//   - the receipt code (phase two) is fetched only when the shopper picks that mode. Nothing of it loads before.
// Item text and the shopper's words only ever go into the page as text, never as HTML.
(function () {
  "use strict";
  var root = document.getElementById("sl");
  var form = document.getElementById("sl-form");
  var list = document.getElementById("shop");
  if (!root || !form || !list) return; // summary.html, sent.html and finished.html have no list and need no script
  var summary = form.querySelector('[data-sl-view="summary"]');
  var countEl = form.querySelector("[data-sl-count]");
  var toastEl = document.getElementById("toast");
  var KEY = "kitchie.sl:" + (form.getAttribute("data-sl-link") || "");
  var MAX = 120;
  var SVG = "http://www.w3.org/2000/svg";
  var ICONS = { swapped: "M5 9h12l-3-3M19 15H7l3 3", notgot: "M7 12h10" };
  var quiet = true; // nothing takes the keyboard while the page sets itself up

  function rows() { return Array.prototype.slice.call(list.querySelectorAll("li[data-shop-row]")); }
  function keyOf(li) { return li.getAttribute("data-key") || ""; }
  function box(li) { return li.querySelector('input[name="got"]'); }
  function field(li) { return li.querySelector(".sl-swap input"); }
  function words(li) { return field(li).value.trim().slice(0, MAX); }
  function stateOf(li) { return words(li) !== "" ? "swapped" : box(li).checked ? "got" : "notgot"; }

  var toastTimer = 0;
  function say(text) {
    if (!toastEl) return;
    toastEl.textContent = text; toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }

  // ---- one line, and the count on the Send button
  function paint(li, label) {
    var s = stateOf(li);
    li.toggleAttribute("data-sl-swapped", s === "swapped");
    if (s === "swapped") box(li).checked = false;
    if (label) li.querySelector("[data-sl-swap-label]").textContent = s === "swapped" ? "Got instead: " + words(li) : "Got something else";
  }
  function tally() {
    var t = { got: 0, swapped: 0, notgot: 0, total: 0 };
    rows().forEach(function (li) { t[stateOf(li)]++; t.total++; });
    return t;
  }
  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }
  function count() {
    var t = tally(), bits = [];
    if (t.got) bits.push(t.got + " got");
    if (t.swapped) bits.push(plural(t.swapped, "swap"));
    if (countEl) { countEl.textContent = bits.length ? " · " + bits.join(" · ") : ""; countEl.hidden = bits.length === 0; }
    return t;
  }

  // ---- kept in this browser until sent
  function remember() {
    var keep = {};
    rows().forEach(function (li) { var s = stateOf(li); if (s !== "notgot") keep[keyOf(li)] = s === "got" ? 1 : words(li); });
    try { localStorage.setItem(KEY, JSON.stringify(keep)); } catch (e) { /* private mode: kept for this visit only */ }
  }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing was kept */ } }
  function recall() {
    var keep = {};
    try { keep = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { keep = {}; }
    rows().forEach(function (li) {
      var v = keep[keyOf(li)];
      if (v === 1) box(li).checked = true; else if (typeof v === "string") field(li).value = v.slice(0, MAX);
    });
  }
  function refresh() { rows().forEach(function (li) { paint(li, true); }); count(); remember(); }

  // ---- which view
  function show(view) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-sl-view]"), function (s) { s.hidden = s.getAttribute("data-sl-view") !== view; });
    root.setAttribute("data-sl-state", view);
    window.scrollTo(0, 0);
    var head = root.querySelector('[data-sl-view="' + view + '"] [tabindex="-1"]');
    if (head) head.focus({ preventScroll: true });
  }

  // ---- ticking and swapping
  list.addEventListener("change", function (e) {
    var li = e.target.closest && e.target.closest("li[data-shop-row]");
    if (!li) return;
    var det = li.querySelector("details.sl-swap");
    if (e.target.name === "got" && words(li) !== "") {
      // A tap on a swapped line opens its words to change or clear, it does not tick: the swap wins.
      e.target.checked = false; det.open = true; field(li).focus();
    } else if (e.target === field(li)) {
      field(li).value = words(li);
      if (words(li) !== "") det.open = false; // said: fold it back to one line that reads "Got instead: ..."
    }
    paint(li, true); count(); remember();
  });
  list.addEventListener("input", function (e) {
    var li = e.target.closest && e.target.closest("li[data-shop-row]");
    if (li && e.target === field(li)) { paint(li, false); count(); remember(); }
  });
  // Enter in the words field finishes that line; it does not send the list.
  list.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.closest && e.target.closest(".sl-swap-f")) { e.preventDefault(); e.target.blur(); } });
  // Opening "Got something else" puts the keyboard straight on its field. (toggle does not bubble, so it is caught on the way down.)
  list.addEventListener("toggle", function (e) {
    var det = e.target;
    if (!det.matches || !det.matches("details.sl-swap")) return;
    var li = det.closest("li[data-shop-row]");
    if (det.open) { li.querySelector("[data-sl-swap-label]").textContent = "Got something else"; if (!quiet) field(li).focus(); } else paint(li, true);
  }, true);

  // ---- the summary
  function sentence(t) {
    if (t.got + t.swapped === 0) return "Send anyway? It tells the kitchen the shop did not happen.";
    var bits = ["Got " + t.got + " of " + t.total];
    if (t.swapped) bits.push(plural(t.swapped, "swap"));
    if (t.notgot) bits.push(t.notgot + " not got");
    return bits.join(" · ") + ".";
  }
  function line(li, s) {
    var out = document.createElement("li"), ic = document.createElementNS(SVG, "svg"), p = document.createElementNS(SVG, "path");
    var txt = document.createElement("span"), nm = document.createElement("b"), sub = document.createElement("small");
    out.setAttribute("data-sl-line", s);
    ["width", "height"].forEach(function (a) { ic.setAttribute(a, "22"); });
    ic.setAttribute("viewBox", "0 0 24 24"); ic.setAttribute("fill", "none"); ic.setAttribute("stroke", "currentColor"); ic.setAttribute("stroke-width", "1.8");
    ic.setAttribute("stroke-linecap", "round"); ic.setAttribute("stroke-linejoin", "round"); ic.setAttribute("aria-hidden", "true"); ic.setAttribute("focusable", "false");
    p.setAttribute("d", ICONS[s]); ic.appendChild(p);
    nm.textContent = li.getAttribute("data-name") || "";
    sub.textContent = s === "swapped" ? "Got instead: " + words(li) : "Not got";
    txt.appendChild(nm); txt.appendChild(sub); out.appendChild(ic); out.appendChild(txt);
    return out;
  }
  function summarise() {
    var t = count(), none = t.got + t.swapped === 0, lines = summary.querySelector("[data-sl-lines]");
    summary.querySelector("[data-sl-sum-title]").textContent = none ? "Nothing ticked" : "Send this?";
    summary.querySelector("[data-sl-sum]").textContent = sentence(t);
    summary.querySelector("[data-sl-confirm]").textContent = none ? "Send anyway" : "Send";
    ["got", "swapped", "notgot"].forEach(function (k) {
      var cell = summary.querySelector('[data-sl-tally="' + k + '"]');
      cell.setAttribute("data-n", String(t[k])); cell.querySelector("b").textContent = String(t[k]);
    });
    lines.textContent = "";
    if (!none) ["swapped", "notgot"].forEach(function (s) { rows().forEach(function (li) { if (stateOf(li) === s) lines.appendChild(line(li, s)); }); });
    return t;
  }

  // ---- sending
  var shownAt = 0, sending = false;
  function send(button) {
    if (sending) return;
    sending = true; button.disabled = true;
    var body = new URLSearchParams();
    rows().forEach(function (li) {
      var s = stateOf(li);
      if (s === "got") body.append("got", keyOf(li)); else if (s === "swapped") body.append("swap_" + keyOf(li), words(li));
    });
    body.append("confirm", "1");
    fetch(form.getAttribute("action") || location.href, { method: "POST", body: body })
      .then(function (res) {
        // 404 is the one neutral answer for a link that has finished; anything else that is not a success is worth another try.
        if (!res.ok && res.status !== 404) throw res;
        forget();
        location.replace(res.url || location.href);
      })
      .catch(function () { sending = false; button.disabled = false; say("That didn't send. Your ticks are still here. Try again."); });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!summary.hidden) return;
    rows().forEach(function (li) { paint(li, true); });
    summarise(); show("summary"); shownAt = Date.now();
  });
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest("[data-sl-back]")) { refresh(); show("list"); return; }
    var go = t.closest("[data-sl-confirm]");
    // A second tap landing where Send was a moment ago must not skip the confirm step.
    if (go) { e.preventDefault(); if (Date.now() - shownAt > 500) send(go); }
  });

  // ---- PHASE TWO, NOT BUILT: the receipt code arrives only when asked for
  var receipt = null;
  function loadReceipt() {
    if (!receipt) receipt = new Promise(function (ok, no) {
      var css = document.createElement("link"), js = document.createElement("script");
      css.rel = "stylesheet"; css.href = root.getAttribute("data-sl-receipt-css");
      js.src = root.getAttribute("data-sl-receipt-js"); js.onload = ok; js.onerror = function () { receipt = null; no(); };
      document.head.appendChild(css); document.head.appendChild(js);
    });
    return receipt;
  }
  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest('[data-sl-mode="receipt"]');
    if (b) loadReceipt().then(function () { window.KitchieReceipt.open(); }, function () { say("The camera part didn't load. Tick the list instead."); });
  });

  window.KitchieShopperLink = { root: root, form: form, list: list, rows: rows, keyOf: keyOf, box: box, words: words, show: show, refresh: refresh, say: say };
  recall();
  rows().forEach(function (li) { if (words(li) !== "") li.querySelector("details.sl-swap").open = false; });
  refresh();
  setTimeout(function () { quiet = false; }, 0);
})();
