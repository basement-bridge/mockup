/* MOCK ONLY, not for the build: a few journal-like changes (who, what, when) and a short Pantry, for the household activity badge (Kitchie #110).
   In the app the server derives the same thing from the journal: activityFor(member) in server/src/store.ts (counts per person since the member's cursor, last 24 hours). */
(function () {
  "use strict";
  // Minutes since midnight today. "Now" is 9:15 am. Negative = yesterday (-320 is 6:40 pm yesterday).
  window.HA_NOW = 555;
  window.HA_ME = "arjan";
  window.HA_PEOPLE = { arjan: "Arjan", sam: "Sam", priya: "Priya", "": "Someone" };
  function rep(group, who, kind, times) { return times.map(function (t) { return { group: group, who: who, kind: kind, at: t }; }); }
  window.HA_EVENTS = [].concat(
    rep("g1", "sam", "added", [485, 486, 489, 491, 492]),      // 8:05 to 8:12 am, one burst: "Sam added 5 items"
    rep("g2", "sam", "used", [492]),                           // 8:12 am: "Sam used up 1 item"
    rep("g3", "priya", "used", [460, 462]),                    // 7:40 am
    rep("g4", "", "added", [422]),                             // 7:02 am, shared AI link: no member, so "Someone"
    rep("g5", "sam", "added", [-320, -318, -316]),             // yesterday 6:40 pm
    rep("x1", "sam", "removed", [510]),                        // deleted an item: not counted (HA-D4)
    rep("x2", "arjan", "added", [500, 501])                    // my own changes: never counted
  );
  // Which groups each scene includes (x1 and x2 are always there, to show they are left out).
  window.HA_SCENES = {
    none: ["x1", "x2"],
    one: ["g4", "x1", "x2"],
    few: ["g2", "g3", "g4", "x1", "x2"],
    many: ["g1", "g2", "g3", "g4", "g5", "x1", "x2"]
  };
  window.HA_ITEMS = [
    ["Fridge", "Butter", "250 g"], ["Fridge", "Carrots", "6"], ["Fridge", "Cheddar", "400 g"], ["Fridge", "Eggs", "10"], ["Fridge", "Milk", "1 litre"],
    ["Pantry", "Rice", "2 kg"], ["Pantry", "Pasta", "3 packs"], ["Pantry", "Tinned tomatoes", "4 cans"], ["Freezer", "Peas", "1 bag"], ["Freezer", "Bread", "1 loaf"]
  ];
})();
