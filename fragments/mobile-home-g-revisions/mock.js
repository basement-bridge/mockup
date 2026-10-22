/* Mobile Home G, revisions: the mockup's own page script. Switches (phone height, data, the Running low rule, which option), four phone frames, and a report of what sits above and below the fold,
   MEASURED from the drawn frame. Nothing here is for the build: the build lifts revisions.css and the markup/plan in revisions.js. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var MR = window.MR, I = MR.I;
  var HS = [["short", "Short", "600"], ["medium", "Medium", "740"], ["tall", "Tall", "844"]];
  var DS = [["calm", "Nothing urgent"], ["today", "One expires today"], ["expired", "Expired and several"], ["empty", "Nothing at all"], ["low", "Only running low"]];
  var LR = [["1", "Zero outranks (proposed)"], ["0", "Never outranks"]];
  var OPTS = [
    { id: "a", name: "A. Promote", sub: "The urgent section moves up into slot 2 as an open, tinted card. Other ideas follow as rows and fall below the fold when the card needs the room." },
    { id: "b", name: "B. Strip on the hero", sub: "A one-line strip is fused to the hero card. Tap and it opens in place; it opens by itself only if two other ideas still fit above the fold." },
    { id: "c", name: "C. Fit to the height", sub: "Every part is a chevron section. They open in priority order until the phone's height is spent; the urgent one always opens." },
    { id: "d", name: "D. Badge, nothing moves", sub: "Fixed order. A word badge on the chevron says what is urgent; only the top urgent one opens, and only if it fits whole." }
  ];
  var NAMES = { hero: "Cooking ideas", oi: "Other ideas", soon: "On the way out", low: "Running low" };
  var Q = new URLSearchParams(location.search);
  var pick = function (v, list, d) { return list.some(function (x) { return x[0] === v; }) ? v : d; };
  var S = { h: pick(Q.get("h"), HS, "medium"), data: pick(Q.get("d"), DS, "today"), lr: pick(Q.get("lr"), LR, "1"), opt: ["a", "b", "c", "d"].indexOf(Q.get("opt")) >= 0 ? Q.get("opt") : "all" };
  var PLANS = {};

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
    var label = function (s) {
      var k = s.dataset.sec, t = NAMES[k], st = s.classList.contains("fold") ? (s.dataset.open === "true" ? " (open)" : " (closed)") : "";
      if (k === "soon" && s.dataset.open === "true") { var n = $$(".ur", s).length, tot = MR.DATA[S.data].soon.length; st = " (open, " + n + " of " + tot + ")"; }
      return t + st;
    };
    var P = PLANS[fig.dataset.frame], rep = $(".rep", fig);
    rep.innerHTML = "<p><b>Slot 2:</b> " + (P.slot2 ? NAMES[P.slot2] + (P.slot2 === "low" ? " (something is out)" : " (" + P.f.urgent.length + " urgent)") : "Other ideas (nothing urgent)") + ".</p>" +
      "<p><b>Above the fold:</b> " + (up.map(label).join(", ") || "nothing") + (pk.length ? ". <b>Peeking:</b> " + pk.map(label).join(", ") : "") + ".</p>" +
      "<p><b>Below the fold:</b> " + (dn.map(label).join(", ") || "nothing") + ".</p>";
  }
  function draw() {
    var opts = OPTS.filter(function (o) { return S.opt === "all" || S.opt === o.id; });
    $("#frames").innerHTML = opts.map(frameHtml).join("");
    PLANS = {};
    opts.forEach(function (o) {
      var fig = $(".fr[data-frame=" + o.id + "]"), body = $(".pbody", fig), c = { h: S.h, data: S.data, lr: S.lr === "1" }, P = (PLANS[o.id] = MR.plan(o.id, c));
      body.innerHTML = MR.html("h-" + o.id, P);
      fig.addEventListener("click", function (e) {
        var tg = e.target.closest(".tog"); if (tg) { MR.toggle(tg, P); return measure(fig); }
        if (e.target.closest("[data-stub]")) { e.preventDefault(); toast(fig, "A mock: this would open."); }
      });
      measure(fig);
    });
    document.body.dataset.ready = "";
    setTimeout(function () { document.body.dataset.ready = S.h + "." + S.data + "." + S.lr + "." + S.opt; }, 60);
  }
  function url() { try { history.replaceState(null, "", "?h=" + S.h + "&d=" + S.data + "&lr=" + S.lr + "&opt=" + S.opt); } catch (e) {} }
  function sw(label, key, list, show) {
    return '<span class="lbl">' + label + "</span>" + list.map(function (t) { return '<button type="button" data-' + key + '="' + t[0] + '" aria-pressed="' + (S[key] === t[0]) + '">' + t[1] + (show && t[2] ? " <small>" + t[2] + "</small>" : "") + "</button>"; }).join("");
  }
  function drawSwitch() {
    $("#stateSw").innerHTML = sw("Phone height", "h", HS, 1) + sw("Data", "data", DS) + sw("Running low", "lr", LR) + sw("Show", "opt", [["all", "All four"], ["a", "A"], ["b", "B"], ["c", "C"], ["d", "D"]]);
  }
  document.addEventListener("DOMContentLoaded", function () {
    drawSwitch(); draw();
    $("#stateSw").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      ["h", "data", "lr", "opt"].forEach(function (k) { if (b.dataset[k] != null) S[k] = b.dataset[k]; });
      drawSwitch(); url(); draw();
    });
  });
})();
