/* Sample data for this mockup only (the repo is public: invented meals, no real household). Runs after the Home sample data and before Home's script.
   One calendar, today is Wednesday 14 October 2026 (the owner's screenshot had Mon and Tue greyed). Day n is days since Monday 12 October, so n 0 and 1 are past.
   Params: ?pick=a|b|c|d|e  ?avoid=mango (Jo has a Hard avoid on mango, the recipe has mango)  ?today=busy (today already has a meal)  ?replace=0 (Home card adds a second meal, never replaces) */
(function () {
  var Q = new URLSearchParams(location.search), D = window.HDP_DATA;
  var P = window.PKD = {
    todayN: 2, MAXN: 35, GRIDN: 28, rid: "mandarin-bowl",
    me: "Sam", people: ["Sam", "Jo"],
    replace: Q.get("replace") !== "0", /* the desktop Home card replaces your own meal on the picked day (owner, 12 Oct 2026) */
    avoid: Q.get("avoid") === "mango" ? { who: "Jo", item: "mango" } : null,
    /* who: all = the household, me = Sam's own, Jo = Jo's. Thursday is the usual day off (n % 7 === 3), not a meal. */
    meals: {
      0: [{ name: "Shakshuka", who: "all" }], 1: [{ name: "Egg fried rice", who: "all" }],
      4: [{ name: "Salmon patties", who: "me" }], 5: [{ name: "Veg stir-fry", who: "all" }], 6: [{ name: "Chilli noodles", who: "Jo" }],
      7: [{ name: "Prawn curry", who: "all", notFor: ["Jo"] }, { name: "Cheese toastie", who: "Jo" }], 9: [{ name: "Leftovers curry", who: "me" }], 12: [{ name: "Pizza night", who: "all" }],
      15: [{ name: "Lamb tagine", who: "all" }], 18: [{ name: "Fish tacos", who: "me" }], 21: [{ name: "Lentil soup", who: "all" }],
      23: [{ name: "Roast chicken", who: "all" }], 30: [{ name: "Dal and rice", who: "all" }]
    }
  };
  if (Q.get("today") === "busy") P.meals[2] = [{ name: "Chicken curry", who: "all" }];
  /* the idea the pane shows: Mandarin Mango Yogurt Bowl, all in stock */
  D.ideas.unshift({ id: "mandarin-bowl", fit: "Everything is in and it takes ten minutes. A light one for a day with little time.", name: "Mandarin Mango Yogurt Bowl", emoji: "🥭", mins: 10, serves: 2, why: "quick, everything is in", lines: [
    { n: "Greek yogurt", need: "300 g", have: "500 g", s: "have" }, { n: "Mandarins", need: "3", have: "6", s: "have" }, { n: "Mango", need: "1", have: "2", s: "have" },
    { n: "Honey", need: "2 tbsp", have: "1 jar", s: "have" }, { n: "Granola", need: "100 g", have: "1 bag", s: "have" }], uses: [] });
  /* Owner rule, 16 Oct 2026 (voice): when the primary card is the meal already planned for tonight it has NO Plan button (the plan is made), on the card and in the pane.
     ?night=planned draws that state (the bowl is planned for tonight as Sam's own meal); the default is nothing planned for tonight, so the primary card has Plan. Other ideas always keep Plan. */
  var bowl = D.ideas[0];
  if (Q.get("night") === "planned") {
    P.night = "planned"; D.ideas.shift();
    D.plannedLead = { id: bowl.id, planned: true, name: bowl.name, emoji: bowl.emoji, mins: bowl.mins, serves: bowl.serves, why: "on the plan, nothing to decide", fit: bowl.fit, lines: bowl.lines, uses: [] };
    P.meals[2] = [{ name: bowl.name, who: "me", hold: true }];
    var pl = new URLSearchParams(location.search); pl.set("lead", "planned"); if (!pl.get("open") || /^recipe:mandarin/.test(pl.get("open"))) pl.set("open", "meal:" + bowl.id);
    try { history.replaceState(null, "", location.pathname + "?" + pl.toString() + location.hash); } catch (e) {}
    /* Home draws "Planned for today" with its sample date and a Plan button; this host fixes the date and drops the button, every time Home redraws the card */
    var ideas = document.getElementById("ideas");
    if (ideas) new MutationObserver(function () {
      /* the card's Plan is gone; in its place Start cooking (owner, 16 Oct 2026; visual only here) */
      var b = ideas.querySelector('.lead [data-act="planlink"]');
      if (b) { b.setAttribute("data-act", "startcook"); b.textContent = window.PK_COOKING ? "Cooking now" : "Start cooking"; b.className = "btn sm pri"; if (window.PK_COOKING) b.disabled = true; }
      var k = ideas.querySelector(".k.planned"); if (k && /Mon 12/.test(k.textContent)) k.innerHTML = k.innerHTML.replace("Mon 12", "Wed 14");
    }).observe(ideas, { childList: true, subtree: true });
  }
  /* Home's own "This week" lane reads from the same calendar, rolling from today */
  var DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  P.dn = DN; P.mo = MO;
  P.syncHome = function () {
    D.planned = {};
    for (var i = 0; i < 7; i++) {
      var n = P.todayN + i, a = (P.meals[n] || []).map(function (m) { return { name: m.name, who: m.who === "all" ? "" : m.who === "me" ? "me" : "jo" }; });
      if (a.length) D.planned[i] = a;
    }
  };
  D.today = "Wed 14 Oct";
  D.days = [];
  for (var i = 0; i < 7; i++) { var d = new Date(2026, 9, 12 + P.todayN + i); D.days.push(DN[(P.todayN + i) % 7] + " " + d.getDate()); }
  P.syncHome();
  /* open on the idea, with the week drawn; keep any other params */
  var p = new URLSearchParams(location.search), ch = false;
  if (!p.get("open")) { p.set("open", (P.night === "planned" ? "meal:" : "recipe:") + "mandarin-bowl"); ch = true; }
  if (!p.get("week")) { p.set("week", "planned"); ch = true; }
  if (ch) { try { history.replaceState(null, "", location.pathname + "?" + p.toString() + location.hash); } catch (e) {} }
})();
