/* MOCK ONLY (fragments/pantry-row-actions, Kitchie #866): stands in for swipe.js's act() and shop() and the undo bar. In the app this is the ONE code path:
   every option here, the keys U D S Z and the item panel all call KitchieSwipe.act(li, "one" | "all") and KitchieSwipe.shop(li) (server/src/assets/swipe.js), so a row button,
   a menu entry, a bar button and a key do exactly what the phone swipe does, with the same Undo bar. Nothing below is for the build. */
(function () {
  "use strict";
  var P = window.PRA = window.PRA || {};
  var S = P.state = { items: window.PRA_ITEMS.map(function (i) { return Object.assign({}, i); }), shop: { count: window.PRA_SHOP.count, on: Object.assign({}, window.PRA_SHOP.on) }, usedAt: [], down: false, last: null, guard: "confirm" };
  var timer = 0;
  P.item = function (id) { return S.items.filter(function (i) { return i.id === id; })[0]; };
  P.counted = function (i) { return i.kind === 1 && !i.out; };
  P.label = function (i) { return i.name.toLowerCase(); };
  P.left = function (i) { return i.kind === 1 ? i.n + (i.unit ? " " + i.unit : "") : i.amt; };

  var bar = function () { return document.getElementById("undo-bar"); };
  P.say = function (text, undo, extra) {
    var b = bar(); if (!b) return;
    b.innerHTML = "";
    var t = document.createElement("span"); t.id = "undo-text"; t.textContent = text; b.appendChild(t);
    (extra || []).forEach(function (x) { var k = document.createElement("button"); k.type = "button"; k.className = "ubtn"; k.textContent = x.label; k.addEventListener("click", x.fn); b.appendChild(k); });
    if (undo) { var u = document.createElement("button"); u.type = "button"; u.id = "undo-button"; u.className = "ubtn"; u.innerHTML = 'Undo <kbd class="kbd">Z</kbd>'; u.addEventListener("click", P.undo); b.appendChild(u); }
    b.hidden = false; clearTimeout(timer);
    timer = setTimeout(function () { b.hidden = true; }, (undo || (extra && extra.length)) ? 5000 : 3000);
  };
  P.undo = function () {
    var l = S.last; if (!l) return false;
    S.last = null; l.restore(); P.say("Undone", false); P.changed(); return true;
  };
  P.changed = function () { if (P.render) P.render(); if (P.afterChange) P.afterChange(); };

  /* kind: "one" | "all" | "shop"; ids: one id or an array (the bulk bar of option C). Returns what happened, for the check. */
  P.do = function (kind, ids, opts) {
    ids = [].concat(ids); opts = opts || {};
    if (S.down) { P.say("Changes will work again shortly.", false); return { result: "down" }; }
    var snaps = ids.map(function (id) { var it0 = P.item(id); return Object.assign({}, it0, { out: !!it0.out }); });
    var wasShop = { count: S.shop.count, on: Object.assign({}, S.shop.on) }, wasUsed = S.usedAt.slice();
    var restore = function () { snaps.forEach(function (s) { Object.assign(P.item(s.id), s); }); S.shop = wasShop; S.usedAt = wasUsed; };
    var done = [], said = "", usedNow = 0, skipped = 0;
    var now = Date.now(), recent = S.usedAt.filter(function (t) { return now - t < 5 * 60 * 1000; }).length;
    for (var n = 0; n < ids.length; n++) {
      var it = P.item(ids[n]); if (!it) continue;
      var nm = P.label(it);
      if (kind === "shop") {
        if (S.shop.on[it.id]) { if (ids.length === 1) { P.say(it.name + " is already on your list", false); return { result: "already", id: it.id }; } skipped++; continue; }
        S.shop.on[it.id] = true; S.shop.count++; done.push(it.id); said = nm + " added to your list";
      } else if (it.out) { skipped++; continue; }
      else if (kind === "one" && P.counted(it) && it.n > 1) { it.n--; done.push(it.id); said = nm + ": " + P.left(it) + " left"; }
      else if (kind === "one" && !P.counted(it)) { if (ids.length === 1) { P.say(it.name + " is not counted, so there is no Use one. Change its level instead.", false); return { result: "notcounted", id: it.id }; } skipped++; continue; }
      else {
        /* used up (also the last of a counted item). The removal guardrail (store.ts REMOVAL_GUARD): the third used-up inside 5 minutes answers 409 and changes nothing. */
        if (!opts.confirmed && !opts.batch && recent + usedNow >= 2) {
          restore();
          if (S.guard === "today") { P.say("Several items were used up just now. Open the item to confirm.", false); return { result: "409", id: it.id }; }
          var again = ids.slice();
          P.say("Several items were used up just now. Use up " + (again.length === 1 ? it.name.toLowerCase() : again.length + " items") + " anyway?", false, [{ label: "Use up", fn: function () { P.do("all", again, { confirmed: true }); } }, { label: "Not now", fn: function () { var b = bar(); b.hidden = true; } }]);
          return { result: "409", id: it.id };
        }
        it.out = true; usedNow++; if (!opts.batch) S.usedAt.push(Date.now()); done.push(it.id); said = nm + " used up";
      }
    }
    if (!done.length) { P.say(kind === "shop" ? "Already on your list" : "Nothing to change", false); return { result: "none" }; }
    /* opts.batch (the decided view, several rows picked): the whole batch counts as ONE deliberate used-up for the third-in-five-minutes guardrail (open question DA-Q4, recommended position), and the sentence names how many were done. */
    if (opts.batch && usedNow) S.usedAt.push(Date.now());
    if (ids.length > 1) said = done.length + (done.length === 1 ? " item" : " items") + (kind === "shop" ? " added to your list" : kind === "one" ? " used one of" : " used up") + (skipped ? ", " + skipped + (kind === "shop" ? " already on it" : kind === "one" ? " not counted" : " already out") : "");
    S.last = { restore: restore };
    P.say(said, true); P.changed();
    return { result: kind, ids: done };
  };
})();
