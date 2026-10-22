/* Mobile Home, compact is the search bar: the brain. DEFERRED: fetched with search.css on the first tap on the bar (home.js), never on page load. Mockup only.
   MOCKED: every sample name, number and sentence. Two things are here:
   1. rank(): the contextual dropdown. A copy in shape of desktop Home search's rank() (fits tonight, needs a shop, pantry, shopping list, left out), itself the shape of
      recipe-ideas/ideas.js rank() and suggest_meals. Not shared with the desktop folder on purpose (it is another agent's file and may change).
   2. surface(): the ONE thing that comes up by itself when the bar is tapped and nothing is typed. NEW (Proposals MS-P1 to MS-P6): the time-of-day window and the idle delay are guesses.
   Everything is a pure function (context in, answer out) so a build can run it where the backend decision says; that decision is not made here. */
(function () {
"use strict";
var MHS = window.MHS = {};
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var LEAF = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/></svg>';

/* ---- context the ranking reads (in the build each line names its source) ---- */
var EAT = ["Sam", "Jo", "Priya"];                                       /* Kitchie: who is eating tonight */
var AVOID = { Priya: { pb: "peanuts" }, Jo: { eggs: "eggs" } };          /* Kitchie food rules, hard avoids only */
var PLANNED = { laksa: "Sun" };                                          /* Kitchie: other nights this week */
var TONIGHT = "traybake";
/* Kitchie stock: key -> [emoji, name, location, quantity, days to use-by or null, running low] */
var PAN = {
  thighs: ["🍗", "Chicken thighs", "Fridge", "600 g", 1, 0], stock: ["🍲", "Chicken stock", "Pantry", "2 cartons", null, 0], chickpeas: ["🫘", "Chickpeas (tin)", "Pantry", "3 tins", null, 0],
  cuc: ["🥒", "Cucumbers", "Fridge", "2", 1, 0], spring: ["🌱", "Spring onions", "Fridge", "1 bunch", 1, 0], spinach: ["🥬", "Spinach", "Fridge", "1 bag", 2, 0],
  limes: ["🍋", "Limes", "Fridge", "1", 6, 1], pb: ["🥜", "Crunchy peanut butter", "Pantry", "a little", null, 1], eggs: ["🥚", "Eggs", "Fridge", "6", 9, 0],
  rice: ["🍚", "Rice", "Pantry", "2 kg", null, 0], lemons: ["🍋", "Lemons", "Fridge", "3", 8, 0], potatoes: ["🥔", "Potatoes", "Pantry", "1.5 kg", null, 0], garlic: ["🧄", "Garlic", "Pantry", "2 heads", null, 0],
  tomatoes: ["🍅", "Tinned tomatoes", "Pantry", "4 tins", null, 0], onions: ["🧅", "Onions", "Pantry", "5", null, 0], cheddar: ["🧀", "Cheddar", "Fridge", "200 g", 12, 0]
};
var LIST = { breast: ["🍗", "Chicken breast", "1 pack"], coriander: ["🌿", "Coriander", "1 bunch"], eggs2: ["🥚", "Eggs", "1 dozen"] };
var MISS = { laksa: "laksa paste", coco: "coconut milk", noodles: "rice noodles", tortillas: "tortillas", coriander: "coriander", avocado: "avocado", feta: "feta" };
var ONLIST = { coriander: 1 };
var REC = {   /* name, emoji, minutes, ingredient keys */
  traybake: ["Lemon chicken traybake", "🍋", 45, ["thighs", "lemons", "potatoes", "garlic"]],
  curry: ["Chickpea and spinach curry", "🍛", 30, ["chickpeas", "spinach", "tomatoes", "onions"]],
  salad: ["Cucumber and spring onion salad", "🥗", 10, ["cuc", "spring", "limes"]],
  cfr: ["Chicken fried rice", "🍚", 20, ["thighs", "rice", "eggs", "spring"]],
  laksa: ["Chicken laksa", "🍜", 35, ["thighs", "laksa", "coco", "noodles"]],
  tacos: ["Lime and coriander tacos", "🌮", 25, ["thighs", "limes", "tortillas", "coriander", "avocado"]],
  satay: ["Chicken satay", "🍢", 30, ["thighs", "pb", "limes", "cuc"]],
  pnood: ["Peanut noodles", "🍜", 15, ["pb", "noodles", "spring"]],
  shak: ["Shakshuka", "🍳", 25, ["eggs", "tomatoes", "onions", "feta"]]
};
var NAME = function (k) { return PAN[k] ? PAN[k][1].replace(/ \(tin\)$/, "").toLowerCase() : MISS[k]; };

/* ---- matching: today's rule (substring, case and accents ignored, plural folded) ---- */
function foldW(w) { return w.length > 3 && /ies$/.test(w) ? w.slice(0, -3) + "y" : w.length > 3 && /[^su]s$/.test(w) ? w.slice(0, -1) : w; }
function fold(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).map(foldW).join(" "); }
function has(text, q) { return fold(text).indexOf(q) > -1; }
function mark(text, raw) {
  var i = text.toLowerCase().indexOf(raw.toLowerCase()); if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<span class="mt">' + esc(text.slice(i, i + raw.length)) + "</span>" + esc(text.slice(i + raw.length));
}
function when(d) { return d <= 0 ? "today" : d === 1 ? "tomorrow" : "in " + d + " days"; }
function list2(a) { return a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0] || ""; }

/* ---- 1. the typed ranking (same groups and order as desktop) ---- */
function rank(raw, planned) {
  var q = fold(raw.trim()), out = { plan: [], fits: [], pantry: [], shop: [], list: [], out: [] };
  Object.keys(REC).forEach(function (id) {
    var r = REC[id], byName = has(r[0], q), ing = r[3].filter(function (k) { return has(NAME(k), q); })[0];
    if (!byName && !ing) return;
    var miss = r[3].filter(function (k) { return !PAN[k]; }), hold = [];
    EAT.forEach(function (w) { r[3].forEach(function (k) { if (AVOID[w] && AVOID[w][k]) hold.push([w, AVOID[w][k]]); }); });
    var off = r[3].filter(function (k) { return PAN[k] && PAN[k][4] != null && PAN[k][4] <= 2; });
    var o = { id: id, r: r, miss: miss, off: off, byName: byName, ing: ing, hold: hold, plan: PLANNED[id] };
    if (hold.length) out.out.push(o);
    else if (planned && id === TONIGHT) out.plan.push(o);
    else if (miss.length <= 2) out.fits.push(o);
    else out.shop.push(o);
  });
  var soon = function (o) { return o.off.length ? Math.min.apply(null, o.off.map(function (k) { return PAN[k][4]; })) : 99; };
  out.fits.sort(function (a, b) { return soon(a) - soon(b) || +b.byName - +a.byName || a.miss.length - b.miss.length || a.r[2] - b.r[2]; });
  out.shop.sort(function (a, b) { return a.miss.length - b.miss.length || a.r[2] - b.r[2]; });
  Object.keys(PAN).forEach(function (k) {
    if (!has(PAN[k][1], q)) return; var p = PAN[k];
    out.pantry.push({ id: k, p: p, key: p[4] != null ? p[4] : p[5] ? 50 : 99 });
  });
  out.pantry.sort(function (a, b) { return a.key - b.key; });
  Object.keys(LIST).forEach(function (k) { if (has(LIST[k][1], q)) out.list.push({ id: k, l: LIST[k] }); });
  return out;
}
var GROUPS = [["plan", "On tonight's plan", 1], ["fits", "Fits tonight", 2], ["pantry", "In your pantry", 2], ["shop", "Needs a shop", 1], ["list", "On your shopping list", 1], ["out", "Left out for who is eating", 1]];
var MAXROWS = 6;   /* Proposal MS-P9: desktop shows 8; a phone with the keyboard up has room for about 5 */
function pick(out, planned) {
  var take = {}, used = 0;
  GROUPS.forEach(function (g) { take[g[0]] = 0; if (out[g[0]].length) { take[g[0]] = 1; used++; } });
  GROUPS.forEach(function (g) { while (used < MAXROWS && take[g[0]] < Math.min(g[2], out[g[0]].length)) { take[g[0]]++; used++; } });
  return GROUPS.filter(function (g) { return take[g[0]]; }).map(function (g) {
    return { k: g[0], name: g[0] === "fits" && planned ? "If plans change" : g[1], total: out[g[0]].length, rows: out[g[0]].slice(0, take[g[0]]) };
  });
}
function row(g, o, raw, n, planned) {
  var e, name, sub, rk = "", cls = "", kind = "recipe", id = o.id, x = "";
  if (g === "plan" || g === "fits" || g === "shop" || g === "out") {
    var r = o.r; e = r[1]; name = mark(r[0], raw);
    var missTxt = o.miss.length ? o.miss.map(function (k) { return NAME(k) + (ONLIST[k] ? " (on your list)" : ""); }).join(", ") : "";
    if (g === "plan") { sub = "Planned for tonight &middot; " + r[2] + " min"; rk = "On the plan"; cls = "ok"; }
    else if (g === "out") { sub = list2(o.hold.map(function (h) { return h[0] + " avoids " + h[1]; })) + " &middot; can still be opened"; rk = "Left out"; x = " out"; }
    else if (g === "shop") { sub = missTxt + " &middot; " + r[2] + " min"; rk = "Missing " + o.miss.length; cls = "hot"; }
    else {
      var oo = o.off.slice().sort(function (a, b) { return PAN[a][4] - PAN[b][4]; })[0], why = o.off.length ? "uses the " + NAME(oo) + " going off " + when(PAN[oo][4]) : !o.byName && o.ing ? "has " + NAME(o.ing) : "";
      sub = (o.miss.length ? "needs " + missTxt : why || "everything is in") + " &middot; " + r[2] + " min"; rk = o.miss.length ? "Missing " + o.miss.length : "All in"; cls = o.miss.length ? "hot" : "ok";
      if (o.miss.length && why) sub = why + " &middot; needs " + missTxt;
    }
    if (o.plan && g !== "plan") sub += " &middot; planned " + o.plan;
  } else if (g === "pantry") {
    var p = o.p; kind = "item"; e = p[0]; name = mark(p[1], raw); var d = p[4];
    rk = d != null && d <= 3 ? "Use by " + when(d) : p[5] ? "Running low" : p[3]; cls = (d != null && d <= 2) || p[5] ? "hot" : "";
    sub = p[2] + " &middot; " + p[3] + (planned && o.id === "thighs" ? " &middot; in tonight's traybake" : "");
  } else { kind = "list"; e = "🛒"; var l = o.l; name = mark(l[1], raw); sub = "Shopping &middot; " + l[2]; rk = "On the list"; }
  return '<button type="button" class="i' + x + '" role="option" id="' + n.pre + n.i + '" data-kind="' + kind + '" data-id="' + id + '" data-g="' + g + '" aria-selected="false" tabindex="-1"><span class="e" aria-hidden="true">' + e + '</span><span class="t"><b>' + name + "</b><small>" + sub + '</small></span><span class="rk ' + cls + '">' + rk + "</span></button>";
}

/* ---- 2. the one thing that comes up by itself (NEW) ----
   Windows (Proposals MS-P1, MS-P2, see home.js): morning before 11:00 and after dinner from 20:00 are the cut-offs recipe-ideas/ideas.js already uses ("morning" and "Ideas for tomorrow");
   cooking time 16:30 to 19:59 and mid-day 11:00 to 16:29 are NEW. The window is chosen from the device clock, local time.
   The rule is a short ladder, first match wins, and ONE card comes out; it is never a list.
   cooking time   : tonight's planned meal; else the best idea that fits tonight; else the freezer meal. Running low and going off NEVER lead here (owner).
   morning        : what goes off today or tomorrow, with the recipe that uses it (tonight open); tonight's meal if planned; the freezer meal to take out if nothing fits.
   mid-day        : the idea for tonight (open); the one thing running low (planned, the shopping window); the freezer meal (nothing fits).
   after dinner   : tomorrow, as ideas.js does after 8pm: the idea, tomorrow's planned meal, or an honest nothing fits. */
/* the window itself (windowAt) lives in home.js, on the default path, because the greeting needs it before the bar is tapped */
var FREEZE = { e: "❄️", t: "Beef curry, in the freezer", n: "3 portions" };
function surface(time, next) {
  var T = REC.traybake, C = REC.curry, ASK = ["Ask your assistant", 0];
  if (time === "cook") {
    if (next === "planned") return { k: "Planned for tonight", e: T[1], t: T[0], why: "Everything is in &middot; " + T[2] + " min", acts: [["Make it", 1], ["Open", 0]], say: "Tonight is planned: " + T[0] };
    if (next === "nofit") return { k: "Nothing fits tonight", e: FREEZE.e, t: FREEZE.t, why: "Nothing in the pantry fits. " + FREEZE.n + " in the freezer", acts: [["Make it", 1], ASK], say: "Nothing fits tonight. Freezer: beef curry" };
    return { k: "Fits tonight", e: T[1], t: T[0], why: "Uses the chicken thighs going off tomorrow &middot; all in &middot; " + T[2] + " min", acts: [["Make it", 1], ["Plan", 0]], say: "Fits tonight: " + T[0] };
  }
  if (time === "morning") {
    if (next === "planned") return { k: "Tonight", e: T[1], t: T[0], why: "Planned &middot; uses the chicken thighs going off tomorrow", acts: [["Open", 1]], say: "Tonight is planned: " + T[0] };
    if (next === "nofit") return { k: "Nothing fits tonight", e: FREEZE.e, t: FREEZE.t, why: "Take it out this morning for tonight", acts: [["Plan tonight", 1], ASK], say: "Nothing fits tonight. Take the beef curry out of the freezer" };
    return { k: "Going off tomorrow", e: PAN.thighs[0], t: "Chicken thighs", why: T[0] + " uses them &middot; all in &middot; " + T[2] + " min", acts: [["Plan tonight", 1], ["Open", 0]], say: "Chicken thighs go off tomorrow. " + T[0] + " uses them" };
  }
  if (time === "midday") {
    if (next === "planned") return { k: "Running low", e: PAN.limes[0], t: "Limes, 1 left", why: "Tonight's traybake does not need them", acts: [["Add to list", 1], ["Not now", 0]], say: "Running low: limes, 1 left" };
    if (next === "nofit") return { k: "Nothing fits tonight", e: FREEZE.e, t: FREEZE.t, why: "Take it out now to thaw for tonight", acts: [["Plan tonight", 1], ASK], say: "Nothing fits tonight. Freezer: beef curry" };
    return { k: "Tonight", e: C[1], t: C[0], why: "All in &middot; " + C[2] + " min &middot; uses the spinach going off " + when(PAN.spinach[4]), acts: [["Plan tonight", 1], ["Open", 0]], say: "Idea for tonight: " + C[0] };
  }
  /* after dinner: tomorrow */
  if (next === "planned") return { k: "Planned for tomorrow", e: C[1], t: C[0], why: "All in &middot; " + C[2] + " min", acts: [["Open", 1]], say: "Tomorrow is planned: " + C[0] };
  if (next === "nofit") return { k: "Nothing fits tomorrow", e: "💬", t: "Nothing fits yet", why: "Your assistant can suggest something from what is in", acts: [ASK], say: "Nothing fits tomorrow yet" };
  return { k: "For tomorrow", e: C[1], t: C[0], why: "Uses the spinach before it goes &middot; all in &middot; " + C[2] + " min", acts: [["Plan tomorrow", 1], ["Open", 0]], say: "Idea for tomorrow: " + C[0] };
}
function surfaceHtml(s) {
  return '<section class="sg in" aria-label="Right now"><div class="idl"><button type="button" class="top2" data-act="open"><span class="ph" aria-hidden="true">' + s.e + '</span><span class="t"><span class="k">' + esc(s.k) + "</span><b>" + esc(s.t) + '</b><span class="why">' + LEAF + s.why + '</span></span></button><div class="acts">' +
    s.acts.map(function (a) { return '<button type="button" class="btn' + (a[1] ? "" : " ghost") + '" data-act="' + esc(a[0]) + '">' + esc(a[0]) + "</button>"; }).join("") + "</div></div></section>";
}

/* ---- the live bits, driven by home.js ----
   H = { el, ctx(): {time, next}, opts: {idleMs, trigger}, say(text), toast(text), phase, timer }
   States of the bar: rest -> tapped (nothing yet) -> surfaced (one card, idle) -> typing (the dropdown, from 2 characters). */
function q(H, s) { return H.el.querySelector(s); }
function setRegion(H, kind, html) {   /* kind: "sg" | "sres" | null; only one region is ever on screen */
  var sg = q(H, ".sg-host"), sr = q(H, ".sres");
  sg.hidden = kind !== "sg"; sr.hidden = kind !== "sres";
  if (kind === "sg") sg.innerHTML = html; if (kind === "sres") sr.innerHTML = html;
  if (!kind) { sg.innerHTML = ""; sr.innerHTML = ""; }
}
MHS.surface = surface; MHS.rank = rank; MHS.REC = REC; MHS.PAN = PAN;

MHS.showSurface = function (H) {
  var c = H.ctx(), s = surface(c.time, c.next);
  setRegion(H, "sg", surfaceHtml(s)); H.phase = "surfaced"; H.el.dataset.phase = "surfaced";
  if (!H.announced) { H.announced = true; H.say("Suggestion. " + s.say); }   /* once per tap on the bar, polite, focus never moves (MS-P4) */
};
MHS.tapped = function (H) {              /* the bar was tapped: wait, do nothing visible, then surface */
  clearTimeout(H.timer); H.phase = "tapped"; H.el.dataset.phase = "tapped"; H.announced = false; setRegion(H, null);
  if (q(H, "input").value.trim().length) return MHS.typed(H);
  if (H.opts.trigger === "focus") MHS.showSurface(H);
  else H.timer = setTimeout(function () { if (!q(H, "input").value.trim().length && H.el.dataset.mode === "search") MHS.showSurface(H); }, H.opts.idleMs);
};
MHS.typed = function (H) {               /* any change to the field */
  clearTimeout(H.timer);
  var input = q(H, "input"), raw = input.value.trim();
  if (!raw) return MHS.tapped(H);        /* emptied: back to waiting, then the one card again */
  if (raw.length < 2) { H.phase = "typing1"; H.el.dataset.phase = "typing1"; setRegion(H, null); input.setAttribute("aria-expanded", "false"); return; }
  var c = H.ctx(), pl = c.next === "planned" && c.time !== "after", gs = pick(rank(raw, pl), pl), n = 0, h = "";
  var pre = H.el.id + "-r";
  h += '<div class="ctx">Ranked for tonight &middot; ' + list2(EAT) + " eating" + (pl ? " &middot; tonight is planned" : "") + "</div>";
  if (!gs.length) {
    h += '<div class="empt"><b>Nothing matches &ldquo;' + esc(raw) + '&rdquo;</b> in recipes, pantry, shopping or the plan.</div>' +
      '<button type="button" class="i" role="option" id="' + pre + '0" data-kind="addlist" data-id="' + esc(raw) + '" aria-selected="false" tabindex="-1"><span class="e" aria-hidden="true">🛒</span><span class="t"><b>Add &ldquo;' + esc(raw) + '&rdquo; to the shopping list</b><small>Same as the Pantry search when nothing is found</small></span></button>';
    n = 1;
  } else gs.forEach(function (g) {
    h += '<div class="g" role="presentation">' + g.name + (g.total > g.rows.length ? " <i>" + g.rows.length + " of " + g.total + "</i>" : "") + "</div>";
    g.rows.forEach(function (o) { h += row(g.k, o, raw, { pre: pre, i: n++ }, pl); });
  });
  setRegion(H, "sres", h); H.phase = "typing"; H.el.dataset.phase = "typing"; H.count = n; H.active = Math.min(H.active || 0, n - 1);
  if (H.lastQ !== raw) H.active = 0; H.lastQ = raw;
  input.setAttribute("aria-expanded", "true"); MHS.mark(H);
  clearTimeout(H.liveT); H.liveT = setTimeout(function () { H.say(n + (n === 1 ? " result" : " results")); }, 600);
};
MHS.mark = function (H) {
  var input = q(H, "input"), rows = H.el.querySelectorAll(".sres .i");
  rows.forEach(function (r, i) { r.setAttribute("aria-selected", i === H.active); if (i === H.active) input.setAttribute("aria-activedescendant", r.id); });
};
MHS.reset = function (H) {               /* the bar gave the screen back */
  clearTimeout(H.timer); clearTimeout(H.liveT); H.phase = "rest"; H.el.dataset.phase = "rest"; H.announced = false; H.lastQ = null;
  var input = q(H, "input"); input.removeAttribute("aria-activedescendant"); input.setAttribute("aria-expanded", "false"); setRegion(H, null);
};
MHS.move = function (H, d) { if (!H.count) return; H.active = (H.active + d + H.count) % H.count; MHS.mark(H); var r = H.el.querySelectorAll(".sres .i")[H.active]; if (r && r.scrollIntoView) r.scrollIntoView({ block: "nearest" }); };
MHS.choose = function (H, i) {
  var r = H.el.querySelectorAll(".sres .i")[i]; if (!r) return; var d = r.dataset;
  if (d.kind === "addlist") H.toast("Added “" + d.id + "” to the shopping list. Undo");
  else if (d.kind === "list") H.toast("Opens Shopping with " + d.id.replace("eggs2", "eggs") + " in view (a Proposal).");
  else if (d.kind === "item") H.toast("A mock: this would open the item.");
  else H.toast("A mock: this would open the recipe.");
};
MHS.ready = true;
})();
