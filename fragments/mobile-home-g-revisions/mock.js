/* Mobile Home G, revisions, round 2: the mockup's own page script. Switches (phone height, data, the countdown window, drag-to-reveal on or off, the simulated trip away and back),
   three phone frames, and a report of what sits above and below the fold, MEASURED from the drawn frame. Nothing here is for the build: the build lifts revisions.css and the markup/plan/gesture/session in revisions.js. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var MR = window.MR, I = MR.I;
  var HS = [["short", "Short", "600"], ["medium", "Medium", "740"], ["tall", "Tall", "844"]];
  var DS = [["calm", "Nothing urgent"], ["window", "Expiring in hours"], ["neglect", "Ignored for days"], ["today", "One goes off today"], ["expired", "Expired and several"], ["heroexp", "Hero uses expired"], ["lowride", "Running low rides on a plan"], ["onlylow", "Only running low"], ["empty", "Nothing at all"]];
  var HV = [["idea", "Idea"], ["photo", "Idea with photo"], ["planned", "Planned today (long name)"], ["plannedphoto", "Planned with photo"]];
  /* the sample photo: a drawn plate on a plain ground (no hex colours; the page draws it, there is no image file to load) */
  MR.photo = "'data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><rect width="72" height="72" fill="rgb(176,120,64)"/><circle cx="36" cy="36" r="27" fill="rgb(244,238,226)"/><circle cx="36" cy="36" r="19" fill="rgb(214,150,60)"/><circle cx="30" cy="31" r="5" fill="rgb(96,150,80)"/><circle cx="42" cy="40" r="6" fill="rgb(180,70,50)"/></svg>') + "'";
  var DG = [["1", "Drag up to reveal: on"], ["0", "Tap only"]];
  var OPTS = [
    { id: "a", name: "A. Tinted card", sub: "An urgent section is tinted and carries a word badge; it always opens. The order and the opening rule are the same in all three." },
    { id: "b", name: "B. Strip on the hero", sub: "The top urgent section is a one-line strip fused to the hero. It opens in place only if the height allows; one line still names what is urgent." },
    { id: "c", name: "C. Plain chevrons", sub: "Three equal chevron sections in urgency order. Urgency is the order, the word badge and the default open; nothing is tinted." }
  ];
  var NAMES = { hero: "Cooking ideas", oi: "More ideas", soon: "On the way out", low: "Running low" };
  var Q = new URLSearchParams(location.search);
  var pick = function (v, list, d) { return list.some(function (x) { return x[0] === v; }) ? v : d; };
  var S = { h: pick(Q.get("h"), HS, "medium"), data: pick(Q.get("d"), DS, "expired"), n: Math.max(0, Math.min(48, +Q.get("n") || MR.C.WIN)), dg: pick(Q.get("dg"), DG, "1"), hv: pick(Q.get("hv"), HV, "idea"), opt: ["a", "b", "c"].indexOf(Q.get("opt")) >= 0 ? Q.get("opt") : "all" };
  var PLANS = {}, sess = MR.session(MR.C.GAP), SIM = { t: 0 };

  function barHtml() {
    var tabs = [["Home", I.chef], ["Pantry", I.jar], ["Recipes", I.note], ["Shopping", I.cart]];
    return '<nav class="bar" aria-label="Main">' + tabs.map(function (t) { return '<a href="#" data-stub' + (t[0] === "Home" ? ' class="on" aria-current="page"' : "") + ">" + t[1] + "<span>" + t[0] + "</span></a>"; }).join("") + "</nav>";
  }
  function frameHtml(o) {
    return '<figure class="fr" data-frame="' + o.id + '"><figcaption><b>' + esc(o.name) + "</b><span>" + esc(o.sub) + '</span></figcaption><div class="pf" style="height:' + MR.HEIGHTS[S.h] + 'px"><div class="pbody"></div>' + barHtml() + '<div class="toast" hidden role="status"></div></div><div class="rep" aria-live="polite"></div></figure>';
  }
  function toast(fig, text) { var t = $(".toast", fig); t.textContent = text; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(function () { t.hidden = true; }, 1800); }

  /* measure the drawn frame: which section is wholly above the fold, which only peeks, which is below */
  function measure(fig) {
    var body = $(".pbody", fig), br = body.getBoundingClientRect(), V = body.clientHeight, up = [], pk = [], dn = [];
    $$("[data-sec]", body).forEach(function (s) {
      var r = s.getBoundingClientRect(), top = r.top - br.top + body.scrollTop, bot = r.bottom - br.top + body.scrollTop, v = bot <= V + 0.5 ? "above" : top < V - 8 ? "peek" : "below";
      s.dataset.view = v; (v === "above" ? up : v === "peek" ? pk : dn).push(s);
    });
    var label = function (s) { var k = s.dataset.sec, st = s.classList.contains("fold") ? (s.dataset.open === "true" ? " (open)" : " (closed)") : ""; return NAMES[k] + st; };
    var P = PLANS[fig.dataset.frame], f = P.f, rep = $(".rep", fig);
    rep.innerHTML = "<p><b>Ranking:</b> " + f.rank.map(function (k) { return NAMES[k] + " " + f.score[k] + (f.urgent(k) ? " (urgent)" : ""); }).join(", ") + ". Cooking ideas is always first.</p>" +
      "<p><b>Above the fold:</b> " + (up.map(label).join(", ") || "nothing") + (pk.length ? ". <b>Peeking:</b> " + pk.map(label).join(", ") : "") + ".</p>" +
      "<p><b>Below the fold:</b> " + (dn.map(label).join(", ") || "nothing") + ".</p>";
  }
  function draw() {
    var opts = OPTS.filter(function (o) { return S.opt === "all" || S.opt === o.id; });
    $("#frames").innerHTML = opts.map(frameHtml).join("");
    PLANS = {};
    opts.forEach(function (o) {
      var fig = $(".fr[data-frame=" + o.id + "]"), body = $(".pbody", fig), c = { h: S.h, data: S.data, n: S.n, drag: S.dg === "1", hv: S.hv }, P = (PLANS[o.id] = MR.plan(o.id, c));
      body.innerHTML = MR.html("h-" + o.id, P, sess.get(o.id));
      fig.addEventListener("click", function (e) {
        var tg = e.target.closest(".tog"); if (tg) { MR.toggle(tg, P); return; }
        if (e.target.closest("[data-stub]")) { e.preventDefault(); toast(fig, "A mock: this would open."); }
      });
      fig.addEventListener("mr-change", function (e) { sess.set(o.id, e.detail.sec, e.detail.on); });
      fig.addEventListener("mr-settled", function () { measure(fig); });
      MR.bindDrag(body, { enabled: function () { return S.dg === "1"; }, plan: function () { return P; } });
      measure(fig);
    });
    document.body.dataset.ready = "";
    setTimeout(function () { document.body.dataset.ready = [S.h, S.data, S.n, S.dg, S.opt, S.hv, SIM.t].join("."); }, 60);
  }
  function url() { try { history.replaceState(null, "", "?h=" + S.h + "&d=" + S.data + "&n=" + S.n + "&dg=" + S.dg + "&opt=" + S.opt + "&hv=" + S.hv); } catch (e) {} }
  function sw(label, key, list, show) {
    return '<span class="lbl">' + label + "</span>" + list.map(function (t) { return '<button type="button" data-' + key + '="' + t[0] + '" aria-pressed="' + (S[key] === t[0]) + '">' + t[1] + (show && t[2] ? " <small>" + t[2] + "</small>" : "") + "</button>"; }).join("");
  }
  function drawSwitch() {
    $("#stateSw").innerHTML = sw("Phone height", "h", HS, 1) + sw("Data", "data", DS) + sw("Show", "opt", [["all", "All three"], ["a", "A"], ["b", "B"], ["c", "C"]]) + sw("Hero", "hv", HV);
    $("#dragSw").innerHTML = sw("Gesture", "dg", DG);
  }
  function winOut() { $("#winOut").textContent = S.n + " h"; $("#win").value = S.n; }
  function msg(t) { $("#sessMsg").textContent = t; }
  function away(min) {
    var had = sess.count(), gap = +$("#gap").value || MR.C.GAP; sess.setGap(gap);
    sess.leave(SIM.t); SIM.t += min; var reset = sess.enter(SIM.t);
    draw();
    msg("Away " + min + " min (reset after " + gap + " min). " + (reset ? "Forgotten: " + had + " manual open or close choice" + (had === 1 ? "" : "s") + " dropped, defaults recomputed." : "Kept: " + had + " manual open or close choice" + (had === 1 ? "" : "s") + " restored.") + " Sitting clock +" + SIM.t + " min.");
  }
  function rescenario() { sess.reset(); SIM.t = 0; msg("Pick a state, open or close something, then simulate leaving."); }
  document.addEventListener("DOMContentLoaded", function () {
    drawSwitch(); winOut(); draw(); rescenario();
    $("#stateSw").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      ["h", "data", "opt", "hv"].forEach(function (k) { if (b.dataset[k] != null) S[k] = b.dataset[k]; });
      drawSwitch(); url(); rescenario(); draw();
    });
    $("#dragSw").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; S.dg = b.dataset.dg; drawSwitch(); url();
      $$(".home.mr").forEach(function (h) { h.dataset.drag = S.dg === "1" ? "on" : "off"; });
    });
    $("#win").addEventListener("input", function () { S.n = +this.value; winOut(); url(); rescenario(); draw(); });
    $("#gap").addEventListener("change", function () { sess.setGap(+this.value || MR.C.GAP); });
    $("#away1").addEventListener("click", function () { away(1); });
    $("#away45").addEventListener("click", function () { away(45); });
  });
})();
