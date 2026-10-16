/* Cook-time confirm mockup (Kitchie #788). Mock data only: nothing here talks to Kitchie.
   One proposal function (propose) feeds every version and both surfaces. The versions differ in WHAT is asked; confidence decides HOW (screen vs chat). */
(function () {
  "use strict";
  var FILL = { plenty: 3, some: 2, low: 1, out: 0 }, LV = { plenty: "Plenty", some: "Some", low: "Low", out: "Out" };
  var BANDW = { high: "Sure", mid: "Likely", low: "Not sure" };
  var TITLE = "Creamy chicken and potato bake";
  /* The recipe side is precise (use). The tracking shape is what varies. */
  var BASE = [
    { id: "potato", name: "Potatoes", shape: "count", level: "some", qty: 2, unit: "", par: 6, use: 1 },
    { id: "butter", name: "Butter", shape: "measure", level: "plenty", qty: 250, unit: "g", par: 500, use: 30 },
    { id: "chicken", name: "Chicken thighs", shape: "override", level: "low", qty: 800, unit: "g", par: 1000, use: 600, pinned: true },
    { id: "milk", name: "Milk", shape: "level", level: "low", useTxt: "200 ml" },
    { id: "oil", name: "Olive oil", shape: "level", level: "some", useTxt: "2 tbsp" },
    { id: "garlic", name: "Garlic", shape: "level", level: "plenty", useTxt: "3 cloves" },
    { id: "paprika", name: "Paprika", shape: "level", level: "some", useTxt: "1 tsp" }
  ];
  var SOON = [{ id: "spinach", name: "Spinach", note: "use by tomorrow", level: "some" }, { id: "cream", name: "Cream", note: "use by Friday", level: "some" }];
  var SHAPEW = { count: "counted", measure: "measured", override: "measured, level pinned by you", level: "level only" };
  var VERS = {
    A: { name: "Every line", sub: "ask about all", d: "Every ingredient used gets its own proposal line. Override any line, then one confirm. Lines Kitchie is unsure of need an answer first." },
    B: { name: "Low only", sub: "ask about low", d: "Only items already low are put to you as questions. Everything else sits in one folded list with the direction cue, and goes in on the same confirm. Nothing is written without that tap." },
    C: { name: "Did anything run out?", sub: "one question", d: "One catch-all question. Everything else is left exactly as it was, which is cheap and also lets amounts drift." },
    D: { name: "Quiet tracking", sub: "ask later", d: "Nothing at cook time. Kitchie counts cooks per item since the level was last confirmed, and asks one question once a threshold trips. Use the controls to see it." }
  };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function band(c) { return c >= 0.8 ? "high" : c >= 0.5 ? "mid" : "low"; }
  function u(it) { return it.unit ? " " + it.unit : ""; }

  /* ---- the one proposal ---- */
  function propose(it) {
    var p = { id: it.id, name: it.name, shape: it.shape, level: it.level, kind: "leave", change: false, heading: "steady", used: it.useTxt || (it.use + u(it)), from: null, to: null };
    if (it.extra) {
      p.kind = "ask"; p.conf = 0.3; p.q = "How much went in?"; p.why = "Not in the recipe, so there is nothing to work out from."; p.opts = [["out", "All of it"], ["some", "Some left"]]; p.used = "not in recipe";
    } else if (it.shape === "count" || it.shape === "measure") {
      var after = it.qty - it.use;
      if (after <= 0) { p.kind = "ask"; p.conf = 0.5; p.q = "That uses all of it. Finished?"; p.why = "The sum reaches zero, so I would rather ask."; p.opts = [["out", "Finished"], ["some", "Some left"]]; p.heading = "out"; }
      else {
        p.kind = "reduce"; p.after = after; p.change = true; p.conf = it.shape === "count" ? 0.95 : 0.85;
        p.from = it.qty + u(it); p.to = after + u(it);
        p.why = it.shape === "count" ? "Counted: " + it.qty + " minus " + it.use + "." : "Recipe asks for " + it.use + u(it) + " (the recipe amount, not weighed).";
        var f = after / it.par; p.heading = f < 0.1 ? "out" : f < 0.25 ? "low" : "steady";
      }
    } else if (it.shape === "override") {
      p.kind = "ask"; p.conf = 0.55; p.heading = "out"; p.opts = [["low", "Still low"], ["out", "Finished"]];
      p.q = "You pinned this at low. About " + (it.qty - it.use) + u(it) + " left by the recipe. Still low?"; p.why = "I will not move a level you set. The amount is only arithmetic.";
    } else if (it.level === "low") {
      p.kind = "ask"; p.conf = 0.35; p.heading = "out"; p.opts = [["some", "Some left"], ["low", "Still low"], ["out", "Out"]];
      p.q = "Probably out?"; p.why = "Marked low before this cook, and a cook only makes that likelier.";
    } else {
      p.conf = it.level === "plenty" ? 0.9 : 0.85; p.why = it.level === "plenty" ? "Plenty stays plenty after one use." : "Some is safe to assume is still there.";
    }
    p.band = band(p.conf);
    return p;
  }
  function headOf(p, ch) {
    if (ch === undefined) return p.kind === "ask" ? null : p.kind === "reduce" ? p.from + " → " + p.to : "Stays " + LV[p.level];
    if (typeof ch === "object") return (p.from || "") + " → " + ch.qty + (p.to ? p.to.replace(/^[\d.]+/, "") : "");
    return ch === p.level ? "Stays " + LV[ch] : LV[p.level] + " → " + LV[ch];
  }
  function writeOf(p, ch) {
    if (ch === undefined) return p.kind === "reduce" ? { id: p.id, qty: p.after } : null;
    if (typeof ch === "object") return { id: p.id, qty: ch.qty };
    return ch === p.level && !p.extra ? null : { id: p.id, level: ch };
  }

  /* ---- small pieces ---- */
  function pips(level, heading) {
    var f = FILL[level], t = heading === "out" ? 0 : heading === "low" ? Math.min(f, 1) : f, h = "";
    h += '<span class="lv" data-l="' + level + '" data-h="' + heading + '" role="img" aria-label="' + LV[level] + (heading !== "steady" ? ", heading toward " + heading : "") + '">';
    for (var i = 0; i < 3; i++) h += '<i class="' + (i < t ? "on" : i < f ? "ghost" : "") + '"></i>';
    if (heading !== "steady") h += '<b class="arr" aria-hidden="true">' + (heading === "out" ? "↘↘" : "↘") + "</b>";
    return h + "</span>";
  }
  function hd(h) { return h === "steady" ? "" : '<em class="hd ' + h + '">heading to ' + h + "</em>"; }
  function conf(p) { return '<span class="cf" data-b="' + p.band + '" title="Confidence ' + p.conf + '"><s><i></i><i></i><i></i></s>' + BANDW[p.band] + "</span>"; }
  function chips(opts, cur, attr) {
    return '<div class="chips">' + opts.map(function (o) { return '<button type="button" class="cp" ' + attr + '="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>";
  }

  /* ---- phone shell (app surface) ---- */
  function Phone(host, ver) {
    var ph = { ver: ver, items: clone(BASE), sel: {}, open: {}, addOpen: false, done: false, outs: {}, written: [], counts: { potato: 0, butter: 1, chicken: 1, milk: 2, oil: 2, garlic: 0, paprika: 1 }, mode: "flat", answered: [], cooks: 1 };
    var el = document.createElement("div"); el.className = "phone"; el.dataset.ver = ver; el.setAttribute("aria-label", "Version " + ver); host.appendChild(el); ph.el = el;
    el.addEventListener("click", function (e) { click(ph, e); });
    el.addEventListener("toggle", function (e) { if (e.target.tagName === "DETAILS") ph.det = e.target.open; }, true);
    el.addEventListener("change", function (e) { if (e.target.matches("[data-mode]")) { ph.mode = e.target.value; render(ph); } });
    render(ph); return ph;
  }
  function P(ph) { return ph.items.map(propose); }
  function find(ph, id) { for (var i = 0; i < ph.items.length; i++) if (ph.items[i].id === id) return ph.items[i]; }
  function pend(ps, ph) { return ps.filter(function (p) { return p.kind === "ask" && ph.sel[p.id] === undefined; }); }
  function writes(ps, ph) { return ps.map(function (p) { return writeOf(p, ph.sel[p.id]); }).filter(Boolean); }
  function wtxt(w) { var it = BASE.concat(SOON.map(function (s) { return { id: s.id, name: s.name, unit: "" }; })).filter(function (b) { return b.id === w.id; })[0]; var n = it ? it.name : w.id; return n + (w.level ? " → " + LV[w.level] : " → " + w.qty + (it && it.unit ? " " + it.unit : "")); }

  function lineHtml(ph, p, compact) {
    var ch = ph.sel[p.id], open = ph.open[p.id], need = p.kind === "ask" && ch === undefined, h = headOf(p, ch), ed = "";
    if (open) {
      if (p.shape === "count" || p.shape === "measure") {
        var cur = typeof ch === "object" ? ch.qty : p.after !== undefined ? p.after : 0, stp = p.shape === "count" ? 1 : 10;
        ed = '<div class="ed"><div class="step"><button type="button" class="cp" data-q="' + p.id + '" data-d="-' + stp + '" aria-label="Less">−</button><b>' + cur + (find(ph, p.id).unit ? " " + find(ph, p.id).unit : "") + '</b><button type="button" class="cp" data-q="' + p.id + '" data-d="' + stp + '" aria-label="More">+</button></div>' + chips([["out", "Used up"]], ch, "data-pick") + "</div>";
      } else ed = '<div class="ed">' + chips([["plenty", "Plenty"], ["some", "Some"], ["low", "Low"], ["out", "Out"]], ch === undefined ? (p.kind === "ask" ? null : p.level) : ch, "data-pick") + "</div>";
    }
    var main = need ? '<div class="prop">' + esc(p.q) + "</div>" + chips(p.opts, undefined, "data-pick") : '<div class="prop">' + esc(h) + "</div>";
    var meta = compact && !open ? "" : '<div class="meta">' + conf(p) + '<span class="why">' + esc(p.why) + "</span></div>";
    return '<li class="ln" data-id="' + p.id + '" data-kind="' + p.kind + '" data-band="' + p.band + '" data-need="' + need + '"><div class="row1"><span class="nm">' + esc(p.name) + '</span><span class="used">used ' + esc(p.used) + "</span>" + pips(p.level, p.heading) + "</div>" + main +
      '<div class="meta">' + (ch !== undefined && !need ? '<span class="tagu">you set this</span>' : "") + hd(p.heading) + '<button type="button" class="lk" data-open="' + p.id + '" aria-expanded="' + !!open + '">' + (open ? "Done" : need ? "Other" : "Change") + "</button></div>" + (compact && !open ? "" : meta) + ed + "</li>";
  }
  function addHtml(ph) {
    if (!ph.addOpen) return '<button type="button" class="add" data-add="open">＋ Something else went in</button>';
    var have = ph.items.filter(function (i) { return i.extra; }).map(function (i) { return i.id; });
    return '<div class="addp"><h4>Something else went in?</h4><p>Not in the recipe. Like grabbing something on a shop. Nothing is saved until you confirm.</p><div class="chips">' + SOON.filter(function (s) { return have.indexOf(s.id) < 0; }).map(function (s) { return '<button type="button" class="cp" data-extra="' + s.id + '">' + esc(s.name) + " · " + esc(s.note) + "</button>"; }).join("") + '</div><input id="x' + ph.ver + '" placeholder="Something else" aria-label="Something else"><button type="button" class="cp" data-extra="free">Add</button><button type="button" class="lk" data-add="close">Close</button></div>';
  }
  function doneHtml(ph, note) {
    return '<div class="done" role="status"><h4>Saved to your pantry</h4>' + (ph.written.length ? "<ul>" + ph.written.map(function (w) { return "<li>" + esc(wtxt(w)) + "</li>"; }).join("") + "</ul>" : '<p class="quiet">Nothing needed changing.</p>') + (note || "") + '<button type="button" class="cp" data-undo="1">Undo</button></div>';
  }
  function frame(ph, inner, bar) {
    return '<div class="top"><span>Cooked it</span><small>' + esc(TITLE) + '</small></div><div class="body">' + inner + "</div>" + (bar || "");
  }

  function render(ph) {
    var ps = P(ph), v = ph.ver, html = "", bar = "";
    if (v === "A" || v === "B") {
      if (ph.done) html = doneHtml(ph);
      else {
        var need = pend(ps, ph), w = writes(ps, ph);
        if (v === "A") html = '<p class="lead">Nothing is saved until you confirm. Check any line, change what is wrong.</p><ul class="lns">' + ps.map(function (p) { return lineHtml(ph, p, false); }).join("") + "</ul>" + addHtml(ph);
        else {
          var low = ps.filter(function (p) { return p.kind === "ask"; }), rest = ps.filter(function (p) { return p.kind !== "ask"; });
          html = '<p class="lead">' + (low.length === 1 ? "One needs" : low.length + " need") + " you. The rest only goes in when you confirm.</p>" + '<p class="sec3">Needs you (' + low.length + ')</p><ul class="lns">' + low.map(function (p) { return lineHtml(ph, p, false); }).join("") + '</ul><details class="quiet"' + (ph.det || Object.keys(ph.open).length ? " open" : "") + "><summary>Also going in (" + rest.length + ")</summary><ul class=\"lns\">" + rest.map(function (p) { return lineHtml(ph, p, true); }).join("") + "</ul></details>" + addHtml(ph);
        }
        bar = '<div class="bar"><button type="button" class="go" data-confirm="1"' + (need.length ? " disabled" : "") + ">" + (need.length ? "Answer " + need.length + " to confirm" : w.length ? "Confirm " + w.length + " change" + (w.length > 1 ? "s" : "") : "Done, nothing to change") + '</button><span class="hint">Nothing is written before this tap.</span></div>';
      }
    } else if (v === "C") {
      var outs = Object.keys(ph.outs);
      if (ph.done) html = doneHtml(ph, '<details class="quiet"><summary>Left exactly as it was</summary><p>' + ph.items.filter(function (i) { return !ph.outs[i.id]; }).map(function (i) { return esc(i.name) + (i.qty !== undefined ? " (still " + i.qty + u(i) + ")" : " (" + LV[i.level] + ")"); }).join(", ") + ". Amounts are not reduced, so they drift upward.</p></details>");
      else html = '<div class="q"><h4>Did anything run out?</h4><div class="chips">' + ph.items.map(function (i) { return '<button type="button" class="cp" data-out="' + i.id + '" aria-pressed="' + !!ph.outs[i.id] + '">' + esc(i.name) + "</button>"; }).join("") + "</div></div>" + addHtml(ph) + '<p class="quiet">Everything else stays as it is.</p>';
      if (!ph.done) bar = '<div class="bar"><button type="button" class="go" data-confirm="1">' + (outs.length ? "Mark " + outs.length + " as out" : "Nothing ran out") + "</button></div>";
    } else {
      var thr = function (it) { return ph.mode === "flat" ? 3 : it.shape === "level" ? (it.level === "low" ? 2 : 3) : it.shape === "override" ? 2 : it.shape === "count" ? 4 : 5; };
      var due = ph.items.filter(function (i) { return ph.counts[i.id] >= thr(i) && ph.answered.indexOf(i.id) < 0; }).sort(function (a, b) { return ph.counts[b.id] / thr(b) - ph.counts[a.id] / thr(a); });
      var top = due[0], q = "";
      if (top) q = '<div class="q" data-q-item="' + top.id + '"><h4>' + esc(top.name) + ": used in " + ph.counts[top.id] + " cooks since you last confirmed. Still about right?</h4>" + chips([["same", "Still about right"], ["low", "It's low"], ["out", "Out"]], undefined, "data-ans") + (due.length > 1 ? '<span class="quiet">' + (due.length - 1) + " more waiting. Only one is asked at a time.</span>" : "") + "</div>";
      html = '<p class="lead">Cooked and logged. Nothing to confirm right now.</p>' + q + '<div class="mock"><span class="lbl">Mockup only: what Kitchie is counting</span><table class="trk"><tr><th>Item</th><th>Level</th><th class="n">Cooks</th><th class="n">Asks at</th></tr>' + ph.items.map(function (i) {
        var r = ph.counts[i.id] / thr(i), h = r >= 0.66 ? (i.level === "low" ? "out" : "low") : "steady";
        return "<tr><td>" + esc(i.name) + "</td><td>" + pips(i.level, h) + '</td><td class="n">' + ph.counts[i.id] + '</td><td class="n">' + thr(i) + "</td></tr>";
      }).join("") + '</table><label class="lbl" for="m' + ph.ver + '">When to ask (open question)</label><select id="m' + ph.ver + '" data-mode="1"><option value="flat"' + (ph.mode === "flat" ? " selected" : "") + '>Flat: 3 cooks</option><option value="shape"' + (ph.mode === "shape" ? " selected" : "") + '>By shape: low 2, level 3, counted 4, measured 5, pinned 2</option></select><button type="button" class="cp" data-cook="1">Cook this again</button></div>' + (ph.written.length ? '<p class="quiet">Last answer: ' + esc(ph.written.map(wtxt).join(", ")) + "</p>" : "") + addHtml(ph);
    }
    ph.el.innerHTML = frame(ph, html, bar);
    ph.el.dataset.written = JSON.stringify(ph.written); ph.el.dataset.done = ph.done ? "1" : "0"; ph.el.dataset.pending = String(v === "A" || v === "B" ? pend(ps, ph).length : 0);
    ph.el.dataset.due = v === "D" ? String(ph.items.filter(function (i) { return ph.counts[i.id] >= (ph.mode === "flat" ? 3 : i.shape === "level" ? (i.level === "low" ? 2 : 3) : i.shape === "override" ? 2 : i.shape === "count" ? 4 : 5) && ph.answered.indexOf(i.id) < 0; }).length) : "0";
  }

  function click(ph, e) {
    var t = e.target.closest("button"); if (!t) return; var d = t.dataset, it;
    if (d.pick !== undefined) {
      var li = t.closest(".ln"), id = li.dataset.id; ph.sel[id] = d.pick;
    } else if (d.q) {
      var p = propose(find(ph, d.q)), cur = typeof ph.sel[d.q] === "object" ? ph.sel[d.q].qty : p.after !== undefined ? p.after : 0;
      ph.sel[d.q] = { qty: Math.max(0, cur + parseInt(d.d, 10)) };
    } else if (d.open) { ph.open[d.open] = !ph.open[d.open]; if (!ph.open[d.open]) delete ph.open[d.open]; }
    else if (d.add) ph.addOpen = d.add === "open";
    else if (d.extra) {
      var s = SOON.filter(function (x) { return x.id === d.extra; })[0], nm;
      if (d.extra === "free") { var inp = ph.el.querySelector("input"); nm = (inp && inp.value || "").trim(); if (!nm) return; s = { id: "x-" + nm.toLowerCase().replace(/\W+/g, "-"), name: nm, level: "some" }; }
      ph.items.push({ id: s.id, name: s.name, shape: "level", level: s.level, extra: true }); ph.counts[s.id] = 1; ph.addOpen = false;
    } else if (d.out) { if (ph.outs[d.out]) delete ph.outs[d.out]; else ph.outs[d.out] = 1; }
    else if (d.confirm) {
      if (ph.ver === "C") ph.written = Object.keys(ph.outs).map(function (k) { return { id: k, level: "out" }; });
      else ph.written = writes(P(ph), ph);
      ph.done = true;
    } else if (d.undo) { ph.done = false; ph.written = []; ph.sel = {}; ph.outs = {}; }
    else if (d.cook) { ph.cooks++; ph.items.forEach(function (i) { ph.counts[i.id] = (ph.counts[i.id] || 0) + 1; }); }
    else if (d.ans) {
      var qi = ph.el.querySelector("[data-q-item]").dataset.qItem, w = d.ans === "same" ? null : { id: qi, level: d.ans };
      ph.answered.push(qi); ph.counts[qi] = 0; ph.written = w ? [w] : [{ id: qi, level: find(ph, qi).level }]; if (w) find(ph, qi).level = d.ans;
      ph.answered = ph.answered.filter(function (x) { return x !== qi; });
    }
    render(ph);
  }

  /* ---- chat surface: same proposals, rendered by confidence ---- */
  function Chat(host, ver) {
    var el = document.createElement("div"); el.className = "phone"; el.dataset.ver = ver; el.dataset.surface = "chat"; host.appendChild(el);
    var st = { w: [], log: [], chips: null, i: 0, over: false }, sv = {};
    function bub(c, h) { st.log.push('<div class="bub ' + c + '">' + h + "</div>"); }
    function sep(t) { st.log.push('<div class="sep">' + t + "</div>"); }
    function draw() {
      el.innerHTML = '<div class="top"><span>Assistant</span><small>chat, no screen</small></div><div class="body"><div class="chat">' + st.log.join("") + "</div></div>" + (st.chips ? '<div class="cchips">' + st.chips.map(function (c, k) { return '<button type="button" class="cp" data-c="' + k + '">' + esc(c[0]) + "</button>"; }).join("") + "</div>" : "");
      el.dataset.written = JSON.stringify(st.w); el.dataset.done = st.over ? "1" : "0";
    }
    function ask(h, cs) { bub("a", h); st.chips = cs; draw(); }
    function user(t) { bub("u", esc(t)); st.chips = null; }
    function save(msg) {
      bub("a", "Saved: " + (st.w.length ? st.w.map(function (w) { return esc(wtxt(w)); }).join(", ") : "nothing needed changing") + ". " + (msg || "")); st.over = true;
      st.chips = [["Undo", function () { user("Undo"); st.w = []; bub("a", "Undone. Nothing changed."); draw(); }]]; draw();
    }
    function improv(next) {
      ask("Did anything go in that wasn't in the recipe?", [
        ["Spinach, it was about to go", function () { user("Spinach, it was about to go"); ask("All of the spinach?", [["All of it", function () { user("All of it"); st.w.push({ id: "spinach", level: "out" }); next(); }], ["Some left", function () { user("Some left"); next(); }]]); }],
        ["No", function () { user("No"); next(); }]
      ]);
    }
    sv.A = function () {
      ask('Logged the cook. Here is everything I would change. Nothing is saved until you say so:<ol><li>Potatoes 2 → 1 <span class="sm">sure</span></li><li>Butter 250 → 220 g <span class="sm">likely</span></li><li>Chicken thighs: you pinned low, about 200 g left. Still low? <span class="sm">not sure</span></li><li>Milk: probably out? <span class="sm">not sure</span></li><li>Olive oil stays some</li><li>Garlic stays plenty</li><li>Paprika stays some</li></ol>', [
        ["Fine. Milk is out, chicken still low", function () { user("Fine. Milk is out, chicken still low"); st.w = [{ id: "potato", qty: 1 }, { id: "butter", qty: 220 }, { id: "milk", level: "out" }]; improv(save); }],
        ["Milk still low, chicken finished", function () { user("Milk still low, chicken finished"); st.w = [{ id: "potato", qty: 1 }, { id: "butter", qty: 220 }, { id: "chicken", level: "out" }]; improv(save); }]
      ]);
    };
    sv.B = function () {
      ask("Logged. Potatoes go 2 → 1 and the butter to about 220 g; the rest stays as it is. Two I am not sure of. Milk looks nearly out: any left?", [
        ["Some left", function () { user("Some left"); q2(); }], ["Still low", function () { user("Still low"); q2(); }], ["Out", function () { user("Out"); st.w.push({ id: "milk", level: "out" }); q2(); }]
      ]);
      function q2() { st.w.unshift({ id: "potato", qty: 1 }, { id: "butter", qty: 220 }); ask("And the chicken: pinned low, about 200 g left. Still low?", [["Still low", function () { user("Still low"); improv(save); }], ["Finished", function () { user("Finished"); st.w.push({ id: "chicken", level: "out" }); improv(save); }]]); }
    };
    sv.C = function () {
      ask("Logged the cook. Did anything run out?", [["Nothing", function () { user("Nothing"); improv(save); }], ["The milk", function () { user("The milk"); st.w.push({ id: "milk", level: "out" }); improv(save); }], ["The chicken", function () { user("The chicken"); st.w.push({ id: "chicken", level: "out" }); improv(save); }]]);
    };
    sv.D = function () {
      bub("a", "Logged the cook."); sep("Three cooks later, mentioning milk");
      bub("u", "Do we need milk for the weekend?");
      ask("Possibly. Milk has been in 3 cooks since you last confirmed it. Still about right?", [["Still some", function () { user("Still some"); st.w = [{ id: "milk", level: "some" }]; save("Count reset."); }], ["It's low", function () { user("It's low"); st.w = [{ id: "milk", level: "low" }]; save("Count reset."); }], ["Out", function () { user("Out"); st.w = [{ id: "milk", level: "out" }]; save("Count reset."); }]]);
    };
    bub("u", "That turned out well, all cooked."); sv[ver](); 
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-c]"); if (!b || !st.chips) return; var c = st.chips[+b.dataset.c]; c[1](); draw(); });
    return { el: el };
  }

  /* ---- page ---- */
  var state = { ver: "A", surface: "app", cmp: false }, stage, phones = [];
  function vdescribe() { document.getElementById("vdesc").textContent = state.cmp ? "All four side by side. Same cook, same pantry, same proposals." : VERS[state.ver].d; }
  function pressed() {
    document.querySelectorAll(".sw[data-ver]").forEach(function (b) { b.setAttribute("aria-pressed", String(!state.cmp && b.dataset.ver === state.ver)); });
    document.querySelectorAll("[data-surface]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.surface === state.surface)); });
    var c = document.getElementById("cmp"); c.setAttribute("aria-pressed", String(state.cmp));
  }
  function contract() {
    var chat = state.surface === "chat", out = { cook: TITLE, surface: chat ? "assistant (MCP)" : "in-app", lines: BASE.map(function (b) {
      var p = propose(b), l = { item: b.name.toLowerCase(), shape: b.shape, current: b.qty !== undefined ? b.qty + u(b) + " (" + b.level + ")" : b.level, proposed: p.kind === "ask" ? null : p.kind === "reduce" ? p.to : "unchanged", confidence: p.conf, band: p.band, heading: p.heading, reason: p.why };
      if (chat) l.say = p.band === "high" ? "mention" : "ask"; return l;
    }) };
    if (!chat) out.note = "The screen shows every line; band decides emphasis. No 'say' hint: it is not talking."; else out.note = "Kitchie returns a band and a reason, not prose. The assistant decides how chatty to be. Confirmation must come from the person.";
    document.getElementById("contract").textContent = JSON.stringify(out, null, 1);
    document.getElementById("ctitle").textContent = chat ? "What the assistant receives (read-only, before any write)" : "What the in-app screen receives (same call)";
  }
  function build() {
    stage.innerHTML = ""; phones = []; stage.className = "stage" + (state.cmp ? " cmp" : "");
    (state.cmp ? ["A", "B", "C", "D"] : [state.ver]).forEach(function (v) {
      var cell = document.createElement("div"); cell.className = "cell"; cell.innerHTML = "<h3>" + v + ". " + esc(VERS[v].name) + "</h3>"; stage.appendChild(cell);
      phones.push(state.surface === "chat" ? Chat(cell, v) : Phone(cell, v));
    });
    vdescribe(); pressed(); contract();
  }
  window.CookConfirm = { propose: propose, BASE: BASE, state: state };
  document.addEventListener("DOMContentLoaded", function () {
    stage = document.getElementById("stage");
    document.getElementById("vsw").innerHTML = Object.keys(VERS).map(function (k) { return '<button type="button" class="sw" data-ver="' + k + '" aria-pressed="false">' + k + ". " + esc(VERS[k].name) + "</button>"; }).join("");
    document.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.ver && b.classList.contains("sw")) { state.ver = b.dataset.ver; state.cmp = false; build(); }
      else if (b.dataset.surface) { state.surface = b.dataset.surface; build(); }
      else if (b.id === "cmp") { state.cmp = !state.cmp; build(); }
      else if (b.id === "reset") build();
    });
    document.getElementById("legend").innerHTML = [["plenty", "steady", "Steady", "Nothing to watch."], ["some", "low", "Heading to low", "Dashed pips are what is about to be lost."], ["low", "out", "Likely out", "Low and heading to out. This is what prompts."], ["low", "steady", "Low, steady", "Low but not moving."], ["out", "steady", "Out", "Confirmed out."]].map(function (r) { return "<div>" + pips(r[0], r[1]) + "<span><b>" + r[2] + ".</b> " + r[3] + "</span></div>"; }).join("");
    build();
  });
})();
