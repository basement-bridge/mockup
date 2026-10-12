// Shopper link, the shopper's page (list.html). NEW FOR THE BUILD: lift this file as it is.
// Two modes (decisions SL-D5 to SL-D10 and judgement calls SL-J4 to SL-J8, docs/knowledge/shopper-link.md):
//   SWIPE (default). Swipe right = got it, swipe left = couldn't find it, a tap on the tick = got it, "Got something else" opens one text field in place
//     (120 characters). Every action is ONE request and syncs at once, with no confirm step. Undo is always on screen. The bottom button, "Won't be able
//     to buy these", marks the lines still open as not found and touches nothing already answered. "Also got" adds a free-text line at once.
//   MULTI-SELECT. A long-press on any line turns the whole list into checkboxes. Nothing syncs: the picks are one batch. Send shows the three counts and
//     only the lines that are not a plain "got"; Send there is one POST. "Back to swiping" drops the picks that were not sent.
// The server owns the truth. Every answer from it, and every event on its stream, is a whole snapshot:
//   { lines: { <key>: { state: "open"|"got"|"notgot"|"swapped", words: "", by: "you"|"other"|"" } }, extras: [{ id, text }], last: { label } | null, hours: 46 }
// "by" tells the page whether a line was answered on this link ("you") or on another one ("other"): the shopper never sees a name (kitchie#479 P6).
// PROMISING (owner, voice, 11 October 2026, SL-D21 to SL-D28): the shopper first trims the list (swipe left = can't or won't get it), then says "I'll get these" (one request, `commit`), which
// promises every line still open to this link. A promised line is hidden, live, from every other link's page (the snapshot says `claim: "other"`; it leaves like a line another shopper got).
// "I won't do it" (`reject`, after a confirm) ends this link at once; it is offered only before the shopper has swiped any line AND before they have promised, and once either has happened it is gone
// for good, even if Undo takes the swipe or the promise back (owner, 11 October 2026, SL-D34). Snapshot additions: `committed`, `refusable`, `gone`, and `claim: "you"|"other"|""` per line.
// A line got, swapped or NOT FOUND on another link is locked here (owner, 11 October 2026, SL-D37: not found locks like got and swapped), so two shoppers cannot buy it twice and a line one shopper
// passed on is not offered to the next; it comes back only when the household says "Still need it" (SL-D36).
// AN ANSWERED LINE LEAVES THE LIST (owner's live test, 11 October 2026, SL-D18). The server draws every line and marks the answered ones data-sl-gone (display:none in
// shopper.css), so the page is right before this file runs. Here a line that is answered holds for a moment (the tick, or the swipe's colour, is seen), folds away and the
// rest move up; Undo, or a failed sync, takes the mark off and the line comes back in its place. A line is "answered" when this link got it, swapped it or could not find
// it, or when another link got or swapped it (it says "Someone else got this" for a moment first). A line another link could not find is still to do here.
// In multi-select nothing vanishes: lines stay as they are until the batch is sent. The drag colours (SL-D17) are the CSS's; this file only says how far the line is
// pulled (--sl-p, 0 to 1) and whether letting go would answer it (data-sl-armed). Requests (form-encoded POST, base = data-sl-api):
//   line (key, state, swap)   extra (text)   extra/remove (id)   unresolved   undo   batch (got..., swap_<key>..., also..., confirm=1)   GET events (stream)
// A 404 is the one neutral answer for a link that has finished. Without this file the page is the multi-select form and still works.
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
  var undoBtn = form.querySelector("[data-sl-undo]");
  var exitBtn = form.querySelector("[data-sl-exit-multi]");
  var statusEl = form.querySelector("[data-sl-status]");
  var extrasEl = form.querySelector("[data-sl-extras]");
  var alsoIn = document.getElementById("sl-also-in");
  var API = root.getAttribute("data-sl-api") || "";
  var MAX = 120, HOLD = 550, SVG = "http://www.w3.org/2000/svg";
  var ICONS = { swapped: "M5 9h12l-3-3M19 15H7l3 3", notgot: "M7 12h10", also: "M6 8h12l-1 12H7zM9 8V6.5a3 3 0 0 1 6 0V8", remove: "M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" }; // also: the bag (it came home); remove: the bin (it really removes)
  var mode = "swipe";
  var synced = { lines: {}, extras: [], last: null, hours: null, committed: false, refusable: true }; // the last snapshot the server gave
  var plan = form.querySelector("[data-sl-plan]"), promisedEl = form.querySelector("[data-sl-promised]"), rejecting = false;
  var rev = -1, quiet = true; // quiet: nothing takes the keyboard while the page sets itself up
  var history = [], shadow = {}, pending = []; // multi-select only: undo steps, last known pick per line, extras not sent yet
  var instant = false; // set while a whole batch comes back at once: lines then leave with no hold and no folding

  function rows() { return Array.prototype.slice.call(list.querySelectorAll("li[data-shop-row]")); }
  function rowOf(key) { return list.querySelector('li[data-key="' + key + '"]'); }
  function keyOf(li) { return li.getAttribute("data-key") || ""; }
  function box(li) { return li.querySelector('input[name="got"]'); }
  function field(li) { return li.querySelector(".sl-swap input"); }
  function words(li) { return field(li).value.trim().slice(0, MAX); }
  function det(li) { return li.querySelector("details.sl-swap"); }
  function name(li) { return li.getAttribute("data-name") || ""; }
  function claimedElsewhere(li) { return li.getAttribute("data-claim") === "other"; } // another link promised it (SL-D26): it is not this shopper's to answer
  function locked(li) { return li.getAttribute("data-by") === "other" || claimedElsewhere(li); }
  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }
  function resolved(s) { return s === "got" || s === "swapped" || s === "notgot"; }
  function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function isGone(li) { return li.hasAttribute("data-sl-gone"); }
  function isLeaving(li) { return li.hasAttribute("data-sl-leaving"); }
  function visibleRows() { return rows().filter(function (li) { return !isGone(li); }); }

  var toastTimer = 0;
  function say(text) {
    if (!toastEl) return;
    toastEl.textContent = text; toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }

  // ---- one line
  // swipe: the state is the server's (data-state). multi-select: it is what the picks say, and "open" and "notgot" look the same (an empty box).
  function pickState(li) { return locked(li) ? "got" : words(li) !== "" ? "swapped" : box(li).checked ? "got" : "open"; }
  function stateOf(li) { return mode === "multi" ? pickState(li) : li.getAttribute("data-state") || "open"; }
  function paint(li, label) {
    var s = stateOf(li), sub = li.querySelector("[data-sl-sub]");
    li.setAttribute("data-state", s);
    if (s === "swapped" && !locked(li)) box(li).checked = false;
    if (label !== false) {
      var w = words(li);
      li.querySelector("[data-sl-swap-label]").textContent = s === "swapped" && w ? "Got instead: " + w : "Got something else";
      if (claimedElsewhere(li)) { sub.textContent = "Someone else is getting this"; sub.hidden = false; }
      else if (locked(li)) { sub.textContent = li.getAttribute("data-sl-lock") === "passed" ? "Someone else has dealt with this" : "Someone else got this"; sub.hidden = false; }
      else if (s === "notgot" && mode === "swipe") { sub.textContent = "Couldn't find"; sub.hidden = false; }
      else { sub.textContent = ""; sub.hidden = true; }
    }
  }
  // Put one line into a state. Used for the server's word and for the optimistic first guess. "how" is "swipe" when the line was swiped away, so it leaves from where it was
  // pulled to; anything else leaves the usual way (see leave).
  function set(li, state, by, w, how, claim) {
    // A line answered on another link (got, swapped or not found, owner 11 October 2026, SL-D37) is locked here; the other shopper's words, and which of the three it was, are never shown.
    var lock = by === "other" && resolved(state);
    var cl = claim === "other" && state === "open"; // promised on another link
    if (cl) li.setAttribute("data-claim", "other"); else if (claim === "you" && state === "open") li.setAttribute("data-claim", "you"); else li.removeAttribute("data-claim");
    if (lock) { li.setAttribute("data-by", "other"); li.setAttribute("data-sl-lock", state === "notgot" ? "passed" : "got"); }
    else if (by === "you") li.setAttribute("data-by", "you");
    else li.removeAttribute("data-by");
    li.setAttribute("data-state", state);
    li.setAttribute("data-sl-w", state === "swapped" && !lock ? w || "" : "");
    box(li).checked = state === "got";
    box(li).disabled = lock || cl;
    // A shopper who is typing "got something else" on a line another shopper has just got keeps what they typed until they finish: the line leaves after (see busy, flush).
    var typing = (lock || cl) && det(li).open;
    if (!typing) field(li).value = state === "swapped" && !lock ? (w || "") : "";
    if (state !== "swapped" && det(li).open && !typing) det(li).open = false;
    paint(li);
    settle(li, lock ? "other" : cl ? "claim" : state, how);
  }

  // ---- answered lines leave the list (SL-D18)
  var STAY = { swipe: 0.14, tap: 0.45, other: 1.6 }; // seconds a line stays before it folds away; the swipe has already shown its colour
  function busy(li) { return (drag && drag.li === li && drag.on) || det(li).open; } // being dragged, or its words are being typed
  // Where the keyboard goes when the line it is on leaves: the next line, else the one before, else the end-state card.
  function rehome(li) {
    var a = document.activeElement;
    if (!a || !li.contains(a)) return;
    var vis = rows().filter(function (r) { return r !== li && !isGone(r) && !isLeaving(r); });
    var next = vis.filter(function (r) { return li.compareDocumentPosition(r) & 4; })[0] || vis[vis.length - 1];
    if (next) next.querySelector('input[name="got"]').focus({ preventScroll: true });
    else setTimeout(function () { var c = form.querySelector("[data-sl-allset]"); if (c && !c.hidden) c.focus({ preventScroll: true }); }, 0);
  }
  function clearLeave(li) {
    clearTimeout(li._slT);
    ["data-sl-leaving", "data-sl-hold", "data-sl-drag", "data-sl-armed"].forEach(function (a) { li.removeAttribute(a); });
    ["--sl-h", "--sl-hold", "--sl-p"].forEach(function (p) { li.style.removeProperty(p); });
    li.querySelector(".swfg").style.removeProperty("--dx");
  }
  function goneNow(li) { rehome(li); clearLeave(li); li.setAttribute("data-sl-gone", ""); bar(); }
  function leave(li, kind, how) {
    if (isGone(li) || isLeaving(li)) return;
    if (quiet || instant || reduced()) { goneNow(li); return; }
    if (busy(li)) { li.setAttribute("data-sl-hold", ""); return; } // never pull a line away from under a finger or a keyboard: it leaves when they let go
    rehome(li);
    var hold = kind === "other" || kind === "claim" ? STAY.other : how === "swipe" ? STAY.swipe : STAY.tap;
    li.style.setProperty("--sl-h", li.offsetHeight + "px");
    li.style.setProperty("--sl-hold", hold + "s");
    li.setAttribute("data-sl-leaving", kind);
    li._slT = setTimeout(function () { goneNow(li); }, (hold + 0.22) * 1000 + 200); // animationend is the usual way; this is for a tab that is not drawing
    li.addEventListener("animationend", function done(e) { if (e.animationName !== "sl-leave") return; li.removeEventListener("animationend", done); goneNow(li); });
  }
  // An answered line comes back (Undo, or a sync that failed). Returns true when it was already out of sight.
  function back(li) {
    var was = isGone(li);
    clearLeave(li);
    li.removeAttribute("data-sl-gone");
    if (was && !quiet && !instant && !reduced()) { li.setAttribute("data-sl-back", ""); setTimeout(function () { li.removeAttribute("data-sl-back"); }, 400); }
    return was;
  }
  var backed = []; // lines that came back during one snapshot, so the page can say so once
  // After a line has been given its state: in swipe mode an answered line leaves and an open one is shown; in multi-select nothing moves (the batch is not sent yet).
  function settle(li, kind, how) {
    if (mode !== "swipe") return;
    var s = li.getAttribute("data-state");
    if (resolved(s) || claimedElsewhere(li)) leave(li, kind, instant ? "tap" : how);
    else if (back(li)) backed.push(li);
  }
  // A line that was held back because it was being dragged or typed on leaves now, if it is still answered.
  function flush(li) {
    if (!li.hasAttribute("data-sl-hold") || busy(li)) return;
    li.removeAttribute("data-sl-hold");
    if (resolved(li.getAttribute("data-state")) || claimedElsewhere(li)) leave(li, claimedElsewhere(li) ? "claim" : locked(li) ? "other" : li.getAttribute("data-state"), "tap");
  }

  // ---- the top bar and the bottom bars
  function tallyPicks() {
    var t = { got: 0, swapped: 0, notgot: 0, total: 0 };
    rows().forEach(function (li) { if (locked(li)) return; var s = pickState(li); t[s === "open" ? "notgot" : s]++; t.total++; });
    return t;
  }
  function openCount() { return rows().filter(function (li) { return li.getAttribute("data-state") === "open" && !claimedElsewhere(li); }).length; }
  function actedOn() { return rows().some(function (li) { return li.getAttribute("data-by") === "you" && resolved(li.getAttribute("data-state")); }); } // any line swiped, either way
  function bar() {
    var n, last, lastEl = statusEl.querySelector("[data-sl-last]"), nEl = statusEl.querySelector("[data-sl-n]");
    var wont = form.querySelector('[data-sl-bar="swipe"]'), send = form.querySelector('[data-sl-bar="multi"]');
    var allset = form.querySelector("[data-sl-allset]");
    if (mode === "multi") {
      var t = tallyPicks(), bits = [];
      if (t.got) bits.push(t.got + " got");
      if (t.swapped) bits.push(plural(t.swapped, "swap"));
      if (countEl) { countEl.textContent = bits.length ? " · " + bits.join(" · ") : ""; countEl.hidden = bits.length === 0; }
      nEl.textContent = "Pick what you got";
      lastEl.textContent = "Not sent yet";
      undoBtn.disabled = history.length === 0;
      wont.hidden = true; send.hidden = false; allset.hidden = true;
      plan.hidden = true; promisedEl.hidden = true;
      return;
    }
    n = openCount(); last = synced.last && synced.last.label;
    // Only what is left is counted (SL-D18): lines that were answered, found or not, are off the list and are not tallied.
    nEl.textContent = n === 0 ? "All done" : n + " to go";
    lastEl.textContent = last ? "Undo takes back: " + last : (n === 0 ? "" : "Swipe a line to answer it.");
    lastEl.hidden = lastEl.textContent === "";
    undoBtn.disabled = !last;
    undoBtn.setAttribute("aria-label", last ? "Undo: " + last : "Undo");
    wont.hidden = n === 0; send.hidden = true;
    // The wholesale actions at the very top (SL-D21, SL-D22). Before a promise: "I'll get these" (on whatever is still open) and, until a line has been swiped, "I won't do it".
    // After the promise: a calm strip, and "I won't do it" there too while nothing has been swiped. Once any line is swiped the flat decline is gone; only the bottom button ends the rest.
    var acted = actedOn(), committed = synced.committed;
    plan.hidden = committed || n === 0; promisedEl.hidden = !committed || n === 0;
    // "I won't do it" (SL-D34): gone for good after the first swipe or the promise, even if Undo takes either back (the server says so in `refusable`; the page also stops offering it at once).
    var refusable = synced.refusable !== false && !acted && !committed;
    Array.prototype.forEach.call(form.querySelectorAll("[data-sl-refuse-wrap]"), function (w) { w.hidden = !refusable; if (!refusable) w.querySelector("[data-sl-refuse-ask]").hidden = true; });
    plan.querySelector("[data-sl-plan-t]").textContent = acted ? "Ready to promise the rest?" : "Will you do this trip?";
    plan.querySelector("[data-sl-plan-p]").textContent = acted ? "Press I'll get these and the household knows the lines below are yours. Nobody else is asked to buy them." : "Swipe left on anything you can't or won't get. Then promise the rest, so nobody else buys it.";
    plan.querySelector("[data-sl-promise-n]").textContent = acted ? plural(n, "line") + " left" : n === 1 ? "The one line" : "All " + n + " lines";
    promisedEl.querySelector("[data-sl-promised-n]").textContent = plural(n, "line") + " still to get";
    // The end state shows once the last line has finished leaving, so the card and a half-folded line are never on screen together.
    var done = n === 0 && rows().length > 0 && visibleRows().length === 0;
    allset.hidden = !done;
    form.querySelector("#shop-hint").hidden = done;
    if (done) {
      var bought = rows().some(function (li) { var L = synced.lines[keyOf(li)] || {}; return (L.state === "got" || L.state === "swapped") && L.by !== "other"; }) || synced.extras.length > 0;
      var lost = rows().some(function (li) { var L = synced.lines[keyOf(li)] || {}; return L.state === "notgot" && L.by !== "other"; });
      allset.querySelector("[data-sl-fin-t]").textContent = !bought ? "Nothing was bought on this link, and that's fine. The household has your answers and will sort out what is left. You can close this page."
        : lost ? "The household has your answers and their list is up to date. What you couldn't get is back with them to sort out. You can close this page."
        : "The household has your answers and their list is up to date. You can close this page.";
    }
    var foot = form.querySelector("[data-sl-foot]");
    if (foot && synced.hours) foot.textContent = "No sign-in needed. This link works for another " + synced.hours + " hours.";
  }
  function refresh() {
    // The receipt code (phase two) ticks boxes itself and then calls this: picks made that way are a batch, so the page goes to multi-select.
    if (mode === "swipe" && rows().some(function (li) { return !locked(li) && box(li).checked !== (li.getAttribute("data-state") === "got"); })) enterMulti(null, true);
    rows().forEach(function (li) { paint(li); });
    bar();
  }

  // ---- extras: "also got"
  function drawExtras() {
    extrasEl.textContent = "";
    synced.extras.concat(pending).forEach(function (x) {
      var li = document.createElement("li"), ic = document.createElementNS(SVG, "svg"), p = document.createElementNS(SVG, "path");
      var sp = document.createElement("span"), x_ = document.createElement("button");
      ["width", "height"].forEach(function (a) { ic.setAttribute(a, "22"); });
      ic.setAttribute("viewBox", "0 0 24 24"); ic.setAttribute("fill", "none"); ic.setAttribute("stroke", "currentColor"); ic.setAttribute("stroke-width", "1.8");
      ic.setAttribute("stroke-linecap", "round"); ic.setAttribute("stroke-linejoin", "round"); ic.setAttribute("aria-hidden", "true"); ic.setAttribute("focusable", "false");
      p.setAttribute("d", ICONS.also); ic.appendChild(p);
      sp.textContent = x.text;
      if (x.id === undefined) { var sm = document.createElement("small"); sm.textContent = "Not sent yet"; sp.appendChild(sm); } else li.setAttribute("data-sent", "");
      x_.type = "button"; x_.className = "sl-x"; x_.setAttribute("data-sl-extra-x", x.id === undefined ? "p" + pending.indexOf(x) : String(x.id));
      x_.setAttribute("aria-label", "Remove " + x.text); x_.title = "Remove"; // this one really removes the line, so it is drawn as a bin (SL-D19); it was a cross
      x_.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + ICONS.remove + '"/></svg>';
      li.appendChild(ic); li.appendChild(sp); li.appendChild(x_); extrasEl.appendChild(li);
    });
  }

  // ---- talking to the server
  var chain = Promise.resolve();
  function post(path, data) {
    var body = new URLSearchParams();
    Object.keys(data || {}).forEach(function (k) { [].concat(data[k]).forEach(function (v) { body.append(k, v); }); });
    var run = function () {
      return fetch(API + path, { method: "POST", body: body, credentials: "same-origin" }).then(function (res) {
        // 404 is the one neutral answer for a link that has finished.
        if (res.status === 404) { location.replace("finished.html"); return new Promise(function () {}); }
        if (res.status === 409) { return res.json().then(function (snap) { apply(snap); say("Someone else just got that one."); throw new Error("taken"); }); }
        if (!res.ok) throw res;
        return res.json();
      });
    };
    chain = chain.then(run, run); // one at a time and in order, so a quick run of swipes lands in the order they were made
    return chain;
  }
  function sync(path, data, undo) {
    return post(path, data).then(apply, function (err) {
      if (err && err.message === "taken") return;
      if (undo) undo();
      say("That didn't sync. Try again.");
    });
  }

  // Take a snapshot from the server. In multi-select the picks are left alone; only the locks (lines answered on another link) follow the server.
  function apply(snap) {
    if (!snap || typeof snap !== "object") return;
    if (typeof snap.rev === "number") { if (snap.rev < rev) return; rev = snap.rev; }
    var fresh = [], taken = [], passed = [];
    backed = [];
    if (snap.gone && !rejecting) { location.replace("finished.html"); return; } // this link has been ended or cancelled: the one neutral page
    if (typeof snap.committed === "boolean") synced.committed = snap.committed;
    if (typeof snap.refusable === "boolean") synced.refusable = snap.refusable;
    Object.keys(snap.lines || {}).forEach(function (k) {
      var li = rowOf(k), L = snap.lines[k], was = synced.lines[k] || {};
      if (!li) return;
      var other = L.by === "other" && (L.state === "got" || L.state === "notgot");
      if (other && !(was.by === "other" && was.state === L.state)) { (L.state === "got" ? fresh : passed).push(li); li.setAttribute("data-fresh", ""); setTimeout(function () { li.removeAttribute("data-fresh"); }, 2600); }
      var cother = L.claim === "other" && L.state === "open";
      if (cother && was.claim !== "other") taken.push(li);
      if (mode === "swipe") set(li, L.state, L.by, L.words, undefined, L.claim);
      else if (other) set(li, L.state, "other", "");
      else if (cother) set(li, "open", "", "", undefined, "other");
      else if (locked(li)) set(li, "open", "", "");
    });
    synced = { lines: snap.lines || synced.lines, extras: snap.extras || [], last: snap.last || null, hours: snap.hours || synced.hours, committed: synced.committed, refusable: synced.refusable };
    drawExtras(); bar();
    if (fresh.length && !quiet) say("Someone else just got " + (fresh.length === 1 ? name(fresh[0]) : fresh.length + " more lines") + ".");
    else if (passed.length && !quiet) say("Someone else has dealt with " + (passed.length === 1 ? name(passed[0]) : passed.length + " of these") + ".");
    else if (taken.length && !quiet) say("Someone else is getting " + (taken.length === 1 ? name(taken[0]) : taken.length + " of these") + ".");
    else if (backed.length && !quiet && !instant) { // Undo took an answer back: say where the line went, and bring it into view
      say(backed.length === 1 ? name(backed[0]) + " is back on your list." : backed.length + " lines are back on your list.");
      var first = backed[0], r = first.getBoundingClientRect(), bh = (form.querySelector(".sl-undo-bar") || { offsetHeight: 0 }).offsetHeight;
      if (r.top < bh + 8 || r.bottom > window.innerHeight - 90) first.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
    }
    backed = [];
  }
  // What the page was drawn with (the server renders data-state, data-by and the swap words) is the first snapshot.
  function readPage() {
    var lines = {};
    rows().forEach(function (li) { lines[keyOf(li)] = { state: li.getAttribute("data-state") || "open", words: words(li), by: li.getAttribute("data-by") || "", claim: li.getAttribute("data-claim") || "" }; });
    synced = { lines: lines, extras: [], last: null, hours: null, committed: root.getAttribute("data-sl-committed") === "1", refusable: root.getAttribute("data-sl-refusable") !== "0" };
  }

  // ---- swipe mode
  function commit(li, state, w, how) {
    var key = keyOf(li), before = { state: li.getAttribute("data-state"), by: li.getAttribute("data-by") || "", words: words(li) };
    set(li, state, "you", w || "", how);
    bar();
    sync("line", { key: key, state: state === "swapped" ? "got" : state, swap: w || "" }, function () { set(li, before.state, before.by, before.words); bar(); });
  }
  function answer(li, target, how) {
    if (locked(li)) { say(claimedElsewhere(li) ? "Someone else is getting this one." : "Someone else has already answered this one."); return; }
    if (li.getAttribute("data-state") === target) return;
    commit(li, target, "", how);
  }
  function finishSwap(li) {
    if (locked(li)) { field(li).value = ""; det(li).open = false; say("Someone else has already answered this one."); flush(li); return; }
    var w = words(li), cur = li.getAttribute("data-sl-w") || "";
    field(li).value = w;
    det(li).open = false;
    if (mode === "multi") { paint(li); bar(); return; }
    if (w === cur) { paint(li); return; }
    if (w) commit(li, "swapped", w); else commit(li, "open", "");
  }

  var drag = null, hold = 0, swallow = 0;
  function stopHold() { clearTimeout(hold); hold = 0; }
  function endDrag(li) { li.removeAttribute("data-sl-drag"); li.removeAttribute("data-sl-armed"); li.style.removeProperty("--sl-p"); li.querySelector(".swfg").style.removeProperty("--dx"); }
  list.addEventListener("pointerdown", function (e) {
    if (e.button) return;
    var fg = e.target.closest && e.target.closest(".swfg");
    if (!fg) return;
    var li = fg.closest("li[data-shop-row]");
    drag = { li: li, fg: fg, id: e.pointerId, x: e.clientX, y: e.clientY, on: false, w: fg.offsetWidth, dx: 0 };
    stopHold();
    if (mode === "swipe" && !locked(li)) hold = setTimeout(function () { if (drag && !drag.on) { var l = drag.li; drag = null; swallow = Date.now(); if (navigator.vibrate) { try { navigator.vibrate(15); } catch (er) { /* no buzz */ } } enterMulti(l); } }, HOLD);
  });
  list.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) stopHold();
      if (mode !== "swipe" || Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      drag.on = true; try { drag.fg.setPointerCapture(e.pointerId); } catch (er) { /* the mouse may not allow it */ }
    }
    drag.dx = Math.max(-drag.w * 0.92, Math.min(drag.w * 0.92, dx));
    var need = Math.max(80, drag.w * 0.3), armed = Math.abs(drag.dx) >= need;
    drag.li.setAttribute("data-sl-drag", dx > 0 ? "got" : "notgot");
    drag.li.style.setProperty("--sl-p", Math.min(1, Math.abs(drag.dx) / need).toFixed(3)); // how far toward the point of no return: the colour grows with it (SL-D17)
    drag.li.toggleAttribute("data-sl-armed", armed);
    drag.fg.style.setProperty("--dx", drag.dx + "px");
  });
  function release(e, cancel) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null; stopHold();
    if (!d.on) return;
    swallow = Date.now();
    var armed = d.li.hasAttribute("data-sl-armed"), to = d.dx > 0 ? "got" : "notgot", li = d.li;
    if (armed && !cancel && !locked(li) && li.getAttribute("data-state") !== to) {
      // Let go past the line: it carries on out of the page in the colour it was pulled in, then folds away (leave). Reduced motion: it is simply gone.
      li.querySelector(".swfg").style.setProperty("--dx", (to === "got" ? d.w : -d.w) + "px");
      answer(li, to, "swipe");
    } else {
      endDrag(li);
      if (armed && !cancel) answer(li, to);
    }
    flush(li);
  }
  list.addEventListener("pointerup", function (e) { release(e, false); });
  list.addEventListener("pointercancel", function (e) { release(e, true); });
  list.addEventListener("contextmenu", function (e) { if (e.target.closest && e.target.closest(".swfg")) e.preventDefault(); });
  // The tap that ends a long-press or a swipe must not also tick the line.
  list.addEventListener("click", function (e) { if (swallow && Date.now() - swallow < 450) { e.preventDefault(); e.stopPropagation(); swallow = 0; } }, true);

  list.addEventListener("change", function (e) {
    var li = e.target.closest && e.target.closest("li[data-shop-row]");
    if (!li) return;
    if (e.target.name === "got") {
      if (mode === "swipe") {
        if (li.getAttribute("data-state") === "swapped") { e.target.checked = false; det(li).open = true; field(li).focus(); return; } // a tap on a swapped line opens its words
        answer(li, e.target.checked ? "got" : "open");
      } else {
        if (words(li) !== "") { e.target.checked = false; det(li).open = true; field(li).focus(); return; }
        remember(li); paint(li); bar();
      }
    } else if (e.target === field(li)) {
      if (mode === "swipe") finishSwap(li); else { field(li).value = words(li); if (words(li) !== "") det(li).open = false; remember(li); paint(li); bar(); }
    }
  });
  list.addEventListener("input", function (e) {
    var li = e.target.closest && e.target.closest("li[data-shop-row]");
    if (li && mode === "multi" && e.target === field(li)) { paint(li, false); bar(); }
  });
  list.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.closest && e.target.closest(".sl-swap-f") && e.target.tagName === "INPUT") { e.preventDefault(); e.target.blur(); } });
  list.addEventListener("click", function (e) {
    var ok = e.target.closest && e.target.closest("[data-sl-swap-ok]");
    if (ok) { finishSwap(ok.closest("li[data-shop-row]")); return; }
    var nf = e.target.closest && e.target.closest("[data-sl-notgot]");
    if (nf) answer(nf.closest("li[data-shop-row]"), "notgot");
  });
  // Opening "Got something else" puts the keyboard straight on its field. (toggle does not bubble, so it is caught on the way down.)
  list.addEventListener("toggle", function (e) {
    var d = e.target;
    if (!d.matches || !d.matches("details.sl-swap")) return;
    var li = d.closest("li[data-shop-row]");
    if (d.open) { li.querySelector("[data-sl-swap-label]").textContent = "Got something else"; if (!quiet) field(li).focus(); } else { paint(li); flush(li); }
  }, true);

  // ---- the bottom button, undo, also-got
  form.querySelector("[data-sl-wont]").addEventListener("click", function () {
    var open = rows().filter(function (li) { return li.getAttribute("data-state") === "open" && !claimedElsewhere(li); });
    if (!open.length) return;
    open.forEach(function (li) { set(li, "notgot", "you", ""); });
    bar();
    sync("unresolved", {}, function () { open.forEach(function (li) { set(li, "open", "", ""); }); bar(); });
  });
  // "I'll get these" (SL-D21): one request; the server promises every line still open to this link. Undo takes the promise back (the lines go back to the pool).
  form.querySelector("[data-sl-promise]").addEventListener("click", function () {
    if (synced.committed) return;
    synced.committed = true; bar();
    sync("commit", {}, function () { synced.committed = false; bar(); });
  });
  // "I won't do it" (SL-D23): a two-step button, because it is the one thing here Undo cannot take back (the link is dead at once).
  Array.prototype.forEach.call(form.querySelectorAll("[data-sl-refuse-wrap]"), function (wrap) {
    var ask = wrap.querySelector("[data-sl-refuse-ask]"), open = wrap.querySelector("[data-sl-refuse]");
    open.addEventListener("click", function () { ask.hidden = false; open.hidden = true; ask.querySelector("[data-sl-refuse-no]").focus({ preventScroll: false }); });
    ask.querySelector("[data-sl-refuse-no]").addEventListener("click", function () { ask.hidden = true; open.hidden = false; open.focus(); });
    ask.querySelector("[data-sl-refuse-yes]").addEventListener("click", function () {
      rejecting = true; ask.querySelector("[data-sl-refuse-yes]").disabled = true;
      post("reject", {}).then(function () { if (es) es.close(); show("rejected"); }, function () { rejecting = false; ask.querySelector("[data-sl-refuse-yes]").disabled = false; say("That didn't go through. Try again."); });
    });
  });
  undoBtn.addEventListener("click", function () {
    if (mode === "multi") { undoPick(); return; }
    if (undoBtn.disabled) return;
    undoBtn.disabled = true;
    sync("undo", {}, function () { bar(); });
  });
  function addExtra() {
    var t = alsoIn.value.trim().slice(0, MAX);
    if (!t) { alsoIn.focus(); return; }
    alsoIn.value = "";
    if (mode === "multi") { pending.push({ text: t }); history.push({ extra: pending.length - 1 }); drawExtras(); bar(); return; }
    synced.extras = synced.extras.concat([{ id: "x" + Date.now(), text: t }]); drawExtras();
    sync("extra", { text: t }, function () { synced.extras.pop(); drawExtras(); });
  }
  form.querySelector("[data-sl-also-add]").addEventListener("click", addExtra);
  alsoIn.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addExtra(); } });
  extrasEl.addEventListener("click", function (e) {
    var x = e.target.closest && e.target.closest("[data-sl-extra-x]");
    if (!x) return;
    var id = x.getAttribute("data-sl-extra-x");
    if (id.charAt(0) === "p") { pending.splice(Number(id.slice(1)), 1); history = history.filter(function (h) { return h.extra === undefined; }); drawExtras(); bar(); return; }
    synced.extras = synced.extras.filter(function (v) { return String(v.id) !== id; }); drawExtras();
    sync("extra/remove", { id: id }, function () {});
  });

  // ---- multi-select
  function remember(li) {
    var k = keyOf(li), now = { checked: box(li).checked, words: words(li) }, was = shadow[k] || { checked: false, words: "" };
    if (now.checked !== was.checked || now.words !== was.words) history.push({ key: k, was: was });
    shadow[k] = now;
  }
  function undoPick() {
    var h = history.pop();
    if (!h) return;
    if (h.extra !== undefined) { pending.splice(h.extra, 1); drawExtras(); }
    else { var li = rowOf(h.key); box(li).checked = h.was.checked; field(li).value = h.was.words; shadow[h.key] = { checked: h.was.checked, words: h.was.words }; paint(li); }
    bar();
  }
  function enterMulti(seed, keep) {
    if (mode === "multi") return;
    mode = "multi"; root.setAttribute("data-sl-mode", "multi");
    history = []; pending = []; shadow = {};
    rows().forEach(function (li) {
      var L = synced.lines[keyOf(li)] || {};
      if (!keep && !locked(li)) { box(li).checked = L.state === "got"; field(li).value = L.state === "swapped" ? L.words || "" : ""; }
      if (!keep && li === seed && !locked(li) && !words(li)) box(li).checked = true; // the line that was pressed starts ticked
      shadow[keyOf(li)] = { checked: box(li).checked, words: words(li) };
      paint(li);
    });
    form.querySelector("[data-sl-hint-swipe]").hidden = true; form.querySelector("[data-sl-hint-multi]").hidden = false;
    exitBtn.hidden = false;
    drawExtras(); bar();
  }
  function exitMulti(quietly) {
    if (mode !== "multi") return;
    var dropped = history.length > 0;
    mode = "swipe"; root.setAttribute("data-sl-mode", "swipe");
    pending = []; history = []; shadow = {};
    rows().forEach(function (li) { var L = synced.lines[keyOf(li)] || { state: "open" }; set(li, L.state, L.by, L.words, undefined, L.claim); });
    form.querySelector("[data-sl-hint-swipe]").hidden = false; form.querySelector("[data-sl-hint-multi]").hidden = true;
    exitBtn.hidden = true;
    drawExtras(); bar();
    if (dropped && !quietly) say("Picks not sent. Back to swiping.");
  }
  exitBtn.addEventListener("click", function () { exitMulti(false); show("list"); });

  // ---- which view
  function show(view) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-sl-view]"), function (s) { s.hidden = s.getAttribute("data-sl-view") !== view; });
    root.setAttribute("data-sl-state", view);
    window.scrollTo(0, 0);
    var head = root.querySelector('[data-sl-view="' + view + '"] [tabindex="-1"]');
    if (head) head.focus({ preventScroll: true });
  }

  // ---- the batch's confirm step
  function sentence(t) {
    if (t.got + t.swapped === 0) return "Send anyway? It tells the kitchen nothing was bought.";
    var bits = ["Got " + t.got + " of " + t.total];
    if (t.swapped) bits.push(plural(t.swapped, "swap"));
    if (t.notgot) bits.push(t.notgot + " not got");
    return bits.join(" · ") + ".";
  }
  function line(kind, nm, subText) {
    var out = document.createElement("li"), ic = document.createElementNS(SVG, "svg"), p = document.createElementNS(SVG, "path");
    var txt = document.createElement("span"), b = document.createElement("b"), sub = document.createElement("small");
    out.setAttribute("data-sl-line", kind);
    ["width", "height"].forEach(function (a) { ic.setAttribute(a, "22"); });
    ic.setAttribute("viewBox", "0 0 24 24"); ic.setAttribute("fill", "none"); ic.setAttribute("stroke", "currentColor"); ic.setAttribute("stroke-width", "1.8");
    ic.setAttribute("stroke-linecap", "round"); ic.setAttribute("stroke-linejoin", "round"); ic.setAttribute("aria-hidden", "true"); ic.setAttribute("focusable", "false");
    p.setAttribute("d", ICONS[kind]); ic.appendChild(p);
    b.textContent = nm; sub.textContent = subText;
    txt.appendChild(b); txt.appendChild(sub); out.appendChild(ic); out.appendChild(txt);
    return out;
  }
  function summarise() {
    var t = tallyPicks(), none = t.got + t.swapped + pending.length === 0, lines = summary.querySelector("[data-sl-lines]");
    summary.querySelector("[data-sl-sum-title]").textContent = none ? "Nothing ticked" : "Send this?";
    summary.querySelector("[data-sl-sum]").textContent = sentence(t) + (pending.length ? " Also got " + pending.length + "." : "");
    summary.querySelector("[data-sl-confirm]").textContent = none ? "Send anyway" : "Send";
    ["got", "swapped", "notgot"].forEach(function (k) {
      var cell = summary.querySelector('[data-sl-tally="' + k + '"]');
      cell.setAttribute("data-n", String(t[k])); cell.querySelector("b").textContent = String(t[k]);
    });
    lines.textContent = "";
    if (!none || pending.length) {
      rows().forEach(function (li) { if (!locked(li) && pickState(li) === "swapped") lines.appendChild(line("swapped", name(li), "Got instead: " + words(li))); });
      rows().forEach(function (li) { if (!locked(li) && pickState(li) === "open") lines.appendChild(line("notgot", name(li), "Not got")); });
      pending.forEach(function (x) { lines.appendChild(line("also", x.text, "Also got")); });
    }
    return t;
  }

  // ---- sending the batch
  var shownAt = 0, sending = false;
  function send(button) {
    if (sending) return;
    sending = true; button.disabled = true;
    var data = { got: [], also: pending.map(function (x) { return x.text; }), confirm: "1" };
    rows().forEach(function (li) {
      if (locked(li)) return;
      var s = pickState(li);
      if (s === "got") data.got.push(keyOf(li)); else if (s === "swapped") data["swap_" + keyOf(li)] = words(li);
    });
    post("batch", data).then(function (snap) {
      sending = false; button.disabled = false;
      instant = true; // the whole batch comes back at once: every line it answered is simply gone, nothing folds
      exitMulti(true); show("list"); apply(snap); instant = false; say("Sent. Thank you!");
    }, function (err) { sending = false; button.disabled = false; if (!err || err.message !== "taken") say("That didn't send. Your picks are still here. Try again."); });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (mode !== "multi" || !summary.hidden) return;
    rows().forEach(function (li) { paint(li); });
    summarise(); show("summary"); shownAt = Date.now();
  });
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest("[data-sl-back]")) { show("list"); bar(); return; }
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

  window.KitchieShopperLink = { root: root, form: form, list: list, rows: rows, keyOf: keyOf, box: box, words: words, show: show, refresh: refresh, say: say, enterMulti: enterMulti, exitMulti: exitMulti, summarise: summarise, apply: apply };

  // ---- go
  readPage();
  rows().forEach(function (li) { li.setAttribute("data-sl-w", li.getAttribute("data-state") === "swapped" ? words(li) : ""); if (words(li) !== "") det(li).open = false; paint(li); });
  bar();
  // The live stream: every change on any link of this list arrives as a whole snapshot, within about a second (SL-D2, SL-D3, SL-J3). The browser reconnects by itself.
  var es = null;
  if (window.EventSource) {
    es = new EventSource(API + "events");
    es.onmessage = function (e) { try { apply(JSON.parse(e.data)); } catch (err) { /* ignore a bad frame */ } };
  }
  setTimeout(function () { quiet = false; }, 400);
})();
