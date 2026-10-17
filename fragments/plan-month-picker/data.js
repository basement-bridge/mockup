/* Sample data for this mockup only (the repo is public: invented meals, no real household). Runs after the Home sample data and before Home's script.
   One calendar. Day n is days since Monday 12 October 2026 (n 0), so a date is n and a weekday is n mod 7. Today is Saturday 17 October 2026 (n 5) unless ?today=YYYY-MM-DD says otherwise.
   The plan window is the real server's (kitchie docs/plan-week-api.md, "Week window"): from the Monday of today's week to the Sunday of the week four weeks ahead, so five week columns (35 days).
   Params: ?scenario=typical|empty|full   ?today=2026-10-14   ?avoid=mango (Jo has a Hard avoid on mango; the marks show only when the recipe in context has mango: the default Mandarin Mango Yogurt Bowl does)   ?recipe=clear (the recipe in context is the Cucumber and spring onion salad, no mango: no marks even with the avoid on)   ?replace=0 (the Home card adds a second meal, never replaces) */
(function () {
  var Q = new URLSearchParams(location.search), D = window.HDP_DATA;
  var E0 = Date.UTC(2026, 9, 12);
  function nOf(iso) { var p = String(iso).split("-"); return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - E0) / 86400000); }
  var todayN = /^\d{4}-\d{2}-\d{2}$/.test(Q.get("today") || "") ? nOf(Q.get("today")) : 5;
  todayN = Math.max(0, Math.min(40, todayN));
  var winStart = Math.floor(todayN / 7) * 7; /* the Monday of today's week (current_start) */
  var P = window.PKD = {
    todayN: todayN, winStart: winStart, WEEKS: 5, GRIDN: 35, lastN: winStart + 34, /* last_start + 6: four weeks ahead, to the Sunday */
    rid: Q.get("recipe") === "clear" ? "cuke-salad" : "mandarin-bowl", me: "Sam", people: ["Sam", "Jo"], scenario: /^(typical|empty|full)$/.test(Q.get("scenario") || "") ? Q.get("scenario") : "typical",
    replace: Q.get("replace") !== "0", /* the desktop Home card replaces your own meal on the picked day (owner, 12 Oct 2026) */
    avoid: Q.get("avoid") === "mango" ? { who: "Jo", item: "mango" } : null,
    /* a day off is PER PERSON (owner, voice, 17 Oct 2026): the month shows it only for the person the Who pill selects, and under Everyone it shows none. Sam: Thursday every week (usual), and Sat 7 Nov this week only. Jo: Tue 20 Oct this week only. */
    offs: { Sam: { usual: 3, week: { 26: 1 } }, Jo: { week: { 8: 1 } } },
    meals: {}
  };
  /* who: all = the household, me = Sam's own, Jo = Jo's. */
  var typical = {
    0: [{ name: "Shakshuka", who: "all" }], 1: [{ name: "Egg fried rice", who: "all" }], 4: [{ name: "Salmon patties", who: "me" }],
    5: [{ name: "Veg stir-fry", who: "all" }], 6: [{ name: "Chilli noodles", who: "Jo" }],
    7: [{ name: "Prawn curry", who: "all", notFor: ["Jo"] }, { name: "Cheese toastie", who: "Jo" }], /* a stacked night: the household plan without Jo, and Jo's own */
    9: [{ name: "Leftovers curry", who: "me" }], 12: [{ name: "Pizza night", who: "all" }],
    15: [{ name: "Lamb tagine", who: "all" }], 18: [{ name: "Fish tacos", who: "me" }], 21: [{ name: "Lentil soup", who: "all" }],
    23: [{ name: "Roast chicken", who: "all" }, { name: "Garlic bread", who: "me" }], 30: [{ name: "Dal and rice", who: "all" }],
    31: [{ name: "Chicken pie", who: "all" }] /* Thu 12 Nov: a usual day off that is being cooked this week */
  };
  if (P.scenario === "typical") P.meals = typical;
  if (P.scenario === "full") { /* a mostly full stretch: every night has a meal but two; replacing is still allowed */
    var names = ["Shakshuka", "Egg fried rice", "Tacos", "Pasta bake", "Stir-fry", "Curry", "Soup", "Burgers", "Fish pie", "Pizza night", "Risotto", "Dumplings"], k = 0;
    for (var n = 0; n < 35; n++) {
      if (n === 11 || n === 13) continue; /* open: Fri 23 Oct and Sun 25 Oct */
      P.meals[n] = [{ name: names[k++ % names.length], who: n % 5 === 2 ? "me" : "all" }];
    }
    P.meals[7] = typical[7]; P.meals[5] = typical[5]; P.meals[6] = typical[6];
  }
  /* the idea the pane shows: Mandarin Mango Yogurt Bowl, all in stock */
  D.ideas.unshift({ id: "mandarin-bowl", fit: "Everything is in and it takes ten minutes. A light one for a day with little time.", name: "Mandarin Mango Yogurt Bowl", emoji: "🥭", mins: 10, serves: 2, why: "quick, everything is in", lines: [
    { n: "Greek yogurt", need: "300 g", have: "500 g", s: "have" }, { n: "Mandarins", need: "3", have: "6", s: "have" }, { n: "Mango", need: "1", have: "2", s: "have" },
    { n: "Honey", need: "2 tbsp", have: "1 jar", s: "have" }, { n: "Granola", need: "100 g", have: "1 bag", s: "have" }], uses: [] });
  /* Home's own "This week" lane reads from the same calendar, rolling from today */
  var DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DF = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], MF = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  P.dn = DN; P.mo = MO; P.df = DF; P.mf = MF;
  P.syncHome = function () {
    D.planned = {};
    for (var i = 0; i < 7; i++) {
      var n = P.todayN + i, a = (P.meals[n] || []).map(function (m) { return { name: m.name, who: m.who === "all" ? "" : m.who === "me" ? "me" : "jo" }; });
      if (a.length) D.planned[i] = a;
    }
  };
  var td = new Date(E0 + todayN * 86400000);
  D.today = DN[todayN % 7] + " " + td.getUTCDate() + " " + MO[td.getUTCMonth()];
  D.days = [];
  for (var i = 0; i < 7; i++) { var d = new Date(E0 + (todayN + i) * 86400000); D.days.push(DN[(todayN + i) % 7] + " " + d.getUTCDate()); }
  P.syncHome();
  /* open on the idea, with the week drawn; keep any other params */
  var p = new URLSearchParams(location.search), ch = false;
  if (!p.get("open")) { p.set("open", "recipe:" + P.rid); ch = true; }
  if (!p.get("week")) { p.set("week", "planned"); ch = true; }
  if (ch) { try { history.replaceState(null, "", location.pathname + "?" + p.toString() + location.hash); } catch (e) {} }
})();
