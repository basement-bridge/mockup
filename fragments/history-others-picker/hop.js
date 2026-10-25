/* History: Others picker (kitchie#1103). Plain state in, markup out, class names as the build has them (history-screen.ts). Sample data only; names are the owner's example. */
(function () {
  var IC = { user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5"/>', users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.5-3 2.7-4.6 5.5-4.6s5 1.6 5.5 4.6"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14.6c2.4 0 4 1.2 4.5 3.9"/>', lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"/>', bell: '<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>' };
  var svg = function (n, c) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (c ? ' class="' + c + '"' : "") + ">" + IC[n] + "</svg>"; };
  var CHEV = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 10l5 5 5-5"/></svg>';
  var ME = { id: "me", name: "You", n: 71 };
  var OTHERS = [{ id: "sg", name: "Sleepy Gecko", n: 1, days: [["Marked the oat milk as used up"], [], []] }, { id: "ma", name: "Matilda", n: 5, days: [["Added 2 jars of tahini", "Used 1 of the eggs"], ["Moved the rice to the cupboard", "Added a note to the lentils"], ["Marked the spinach as used up"]] }, { id: "ar", name: "Aroha", n: 2, days: [[], ["Added a bag of oats"], ["Moved the butter to the fridge door"]] }];
  var DAYS = [["Today", "Sun 25 Oct"], ["Yesterday", "Sat 24 Oct"], ["Friday", "23 Oct"]]; /* History over three days (owner, 25 Oct 2026) */
  var MINE = { id: "me", name: "You", n: 71, days: [["Added 3 tins of tomatoes", "Marked the milk as used up"], ["Added a pack of pasta", "Used 2 of the eggs"], ["Moved the flour to the cupboard"]], counts: [24, 31, 16] }; /* a few sample rows per day under the real count */
  var H0 = location.hash.slice(1), NOLINK = /-nolink/.test(H0), CARD = /-card/.test(H0), H1 = H0.replace(/-(nolink|card)/g, ""); /* -card draws the Recent changes card again, for comparison only */
  if (H1 === "one" || H1 === "one-open") OTHERS = OTHERS.slice(0, 1); /* one other member: nothing to narrow, dropdown still drawn */
  var ALL = OTHERS.map(function (p) { return p.id; });
  var h = H1;
  var S = { tab: h === "mine" ? "mine" : "other", open: h === "open" || h === "one-open", ticked: h === "matilda" ? ["ma"] : h === "several" ? ["ma", "ar"] : ALL.slice() };
  var narrowed = function () { return S.ticked.length < ALL.length; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ini = function (n) { return n.charAt(0).toUpperCase(); };
  var shown = function () { return OTHERS.filter(function (p) { return S.ticked.indexOf(p.id) > -1; }); };

  function tabs() {
    var mine = '<a role="tab" href="#mine" data-tab="mine" aria-selected="' + (S.tab === "mine") + '">' + svg("user", "sm") + 'Mine <span class="c">' + ME.n + "</span></a>";
    if (S.tab === "mine") return mine + '<a role="tab" href="#other" data-tab="other" aria-selected="false">' + svg("users", "sm") + 'Others <span class="c">' + OTHERS.reduce(function (a, p) { return a + p.n; }, 0) + '</span></a>';
    var rows = OTHERS.map(function (p) {
      var on = S.ticked.indexOf(p.id) > -1;
      return '<div class="hx-row"><button type="button" class="tick" role="checkbox" data-tick="' + p.id + '" aria-checked="' + on + '" aria-label="Show ' + esc(p.name) + '’s changes"></button>' +
        '<a class="pname" href="#" data-only="' + p.id + '" aria-label="Show only ' + esc(p.name) + '’s changes"><span class="av sm" aria-hidden="true">' + ini(p.name) + '</span><span class="nm">' + esc(p.name) + '</span></a><span class="c">' + p.n + "</span></div>";
    }).join("");
    var n = shown().reduce(function (a, p) { return a + p.n; }, 0);
    return mine + '<details class="hx-people"' + (S.open ? " open" : "") + (narrowed() ? " data-on" : "") + '><summary role="tab" aria-selected="true" aria-haspopup="menu" aria-label="Others. ' + (narrowed() ? "Showing " + S.ticked.length + " of " + ALL.length + ". " : "") + 'Pick people">' + svg("users", "sm") + 'Others <span class="c">' + n + "</span>" + CHEV + '</summary><div class="hx-menu" role="menu" aria-label="People">' + rows + "</div></details>";
  }
  function card() {
    if (!CARD) return ""; /* owner, 25 Oct 2026: the Recent changes card is extraneous now the dropdown shows each person and count */
    if (S.tab === "mine") return '<section class="catch" aria-label="Recent changes"><div class="chead"><h2>' + svg("bell") + 'Recent changes</h2></div><p class="sum">71 changes: 71 by you</p></section>';
    var total = 71 + OTHERS.reduce(function (a, p) { return a + p.n; }, 0);
    var parts = ["71 by you"].concat(OTHERS.map(function (p) { return p.n + ' by <a class="plink2" href="#" data-only="' + p.id + '">' + esc(p.name) + "</a>"; }));
    return '<section class="catch" aria-label="Recent changes"><div class="chead"><h2>' + svg("bell") + 'Recent changes</h2><span class="ib" aria-label="Mark as caught up">' + svg("check") + '</span><span class="ib" aria-label="Leave the catch-up">' + svg("x") + '</span></div><p class="sum">' + (narrowed() ? total + " changes in all, shown below for " + shown().map(function (p) { return esc(p.name); }).join(", ") : total + " changes: " + parts.join(", ")) + "</p></section>";
  }
  function pbar() {
    if (S.tab !== "other" || !narrowed()) return "";
    var ps = shown(), nm = ps.map(function (p) { return p.name; }).join(", "), n = ps.reduce(function (a, p) { return a + p.n; }, 0);
    return '<div class="pbar"><span class="av sm" aria-hidden="true">' + ini(ps[0].name) + '</span><span class="pt"><b>' + esc(nm) + "</b> · " + n + '</span>' + (NOLINK ? "" : '<a class="lnk2" href="#" data-all>Back to the full catch-up</a>') + "</div>";
  }
  function feed() {
    var ps = S.tab === "mine" ? [MINE] : shown();
    return DAYS.map(function (d, di) {
      var groups = ps.filter(function (p) { return p.days[di].length; });
      if (!groups.length) return "";
      return '<section class="day"><div class="lbl">' + (d[0] ? d[0] + " " : "") + "<small>" + d[1] + "</small></div>" + groups.map(function (p) {
        var cnt = p.counts ? p.counts[di] : p.days[di].length;
        return '<div class="pg"><div class="who"><a class="plink" href="#"' + (p.id === "me" ? "" : ' data-only="' + p.id + '"') + '><span class="av' + (p.id === "me" ? " me" : "") + '" aria-hidden="true">' + ini(p.name) + "</span><span><b>" + esc(p.name) + "</b><br>" + cnt + (cnt === 1 ? " thing" : " things") + "</span></a></div>" +
          p.days[di].map(function (t, i) { return '<div class="ev"><div class="tx">' + esc(t) + '<div class="meta"><span>Pantry · Kitchie</span></div></div><time>' + (di === 0 ? "9:" + (10 + i * 7) + " am" : di === 1 ? "6:" + (10 + i * 12) + " pm" : "11:" + (20 + i * 9) + " am") + "</time></div>"; }).join("") + "</div>";
      }).join("") + "</section>";
    }).join("");
  }
  function draw() {
    document.getElementById("tabs").innerHTML = tabs();
    document.getElementById("scope").innerHTML = svg("lock", "sm") + "<span>You see <b>what the household did</b>. Personal changes of others stay private.</span>";
    document.getElementById("card").innerHTML = card();
    document.getElementById("pbar").innerHTML = pbar();
    document.getElementById("feed").innerHTML = feed();
    var d = document.querySelector(".hx-people");
    if (d) d.addEventListener("toggle", function () { S.open = d.open; });
    document.getElementById("hint").textContent = S.tab === "mine" ? "Mine: your own changes. Others is a plain tab here; the dropdown is drawn once Others is on." : S.open ? "Open: tick or untick people (several at once), or press a name to see only that person." : narrowed() ? ("Narrowed: only the ticked people are shown, with " + (NOLINK ? "no shortcut: tick people in the dropdown to get back." : "the way back to everyone.")) : "Closed (the default): nothing narrowed, so everyone’s changes show. Press Others to open the list.";
  }
  document.addEventListener("click", function (ev) {
    var d = document.querySelector(".hx-people[open]");
    if (d && !ev.target.closest(".hx-people")) { d.removeAttribute("open"); S.open = false; }
    var t = ev.target.closest("[data-tab],[data-tick],[data-only],[data-all]");
    if (!t) return;
    ev.preventDefault();
    if (t.dataset.tab) { S.tab = t.dataset.tab; S.open = false; }
    else if (t.hasAttribute("data-all")) { S.ticked = ALL.slice(); S.open = false; }
    else if (t.dataset.only) { S.ticked = [t.dataset.only]; S.open = false; S.tab = "other"; } /* a name leaves only that person ticked; the page reloads closed */
    else if (t.dataset.tick) {
      var id = t.dataset.tick, i = S.ticked.indexOf(id);
      if (i > -1) S.ticked.splice(i, 1); else S.ticked.push(id);
      if (S.ticked.length === 0) S.ticked = ALL.slice(); /* unticking the last one reticks everybody */
      S.open = true; /* ticking is a toggle, not a navigation: the picker stays open */
    }
    draw();
  });
  draw();
})();
