/* Recipe versions slice: sample family, states and helpers. Sits on top of recipe/recipe.js (RCP: icons, sheet, toast,
   controls, persona) so the two slices stay one family. Sample names live here only (AGENTS.md).
   Model (Proposal, see index.html V-D1 to V-D30):
     family   = what a person calls "the recipe" (one row in the list), named by its usual version
     version  = one way of making it; has a state (suggested, trying, kept, put_away) and a head revision
     revision = one saved edit of a version; immutable; the head moves forward, nothing is overwritten */
(function () {
  var X = window.RCP;
  var V = {};
  V.opt = function (k, d) { var q = X.Q.get(k); if (q) { X.store.set(k, q); return q; } return X.store.get(k, d); };
  V.O = {
    fam: V.opt("vfam", "A"),     /* family screen: A grouped by state, B tree by parent */
    save: V.opt("vsave", "C"),   /* where a change goes: A ask at save, B ask first, C trying edits in place, kept asks */
    cook: V.opt("vcook", "A"),   /* promote after a cook: A ask every cook, B ask from the 2nd cook, C never ask */
    ai: V.opt("vai", "A")        /* assistant on a kept version: A always a suggestion, B edit then review, C trusted per member */
  };

  /* Members and the assistant. An assistant is never a member: it acts for one (on_behalf_of). */
  V.WHO = { sam: ["Sam", "S"], jane: ["Jane", "J"], alex: ["Alex", "A"], priya: ["Priya", "P"], ai_alex: ["Alex's assistant", "✦", "alex"], ai_sam: ["Sam's assistant", "✦", "sam"], legacy: ["Before versions", "?"] };
  V.isAI = function (w) { return /^ai_/.test(w); };

  /* Egg fried rice family. Revisions list what changed, in the R-D20 diff shape: [kind, text, was]. */
  V.FAM = {
    id: "fam_efr", name: "Egg fried rice", e: "🍚", usual: "v1",
    versions: [
      { id: "v0", name: "Original", parent: null, state: "kept", by: "sam", when: "3 Sep", cooked: 2, star: 0,
        revs: [
          { n: 1, by: "sam", when: "3 Sep", kind: "create", why: "Typed in from our notes", d: [["add", "6 ingredients, 5 steps"]] },
          { n: 2, by: "sam", when: "12 Sep", kind: "fix", why: "Rice was per pot, not per person", d: [["chg", "Basmati rice 150 g", "300 g"]] },
          { n: 3, by: "ai_sam", when: "21 Sep", kind: "fix", why: "Sam: \"say cold rice in step 4, people keep using hot\"", d: [["chg", "Step 4: Tip in the cold rice…", "Tip in the rice…"]] }
        ] },
      { id: "v1", name: "With peas", parent: "v0", state: "kept", by: "jane", when: "20 Sep", cooked: 4, star: 1,
        revs: [
          { n: 1, by: "jane", when: "20 Sep", kind: "create", why: "Jane: \"kids like the peas, keep that one\"", d: [["add", "Frozen peas 40 g"]] },
          { n: 2, by: "jane", when: "29 Sep", kind: "fix", why: "Peas go in at step 4, not step 5", d: [["chg", "Step 4: …add the peas with the rice", "Step 5: …add the peas"]] }
        ] },
      { id: "v2", name: "Less soy, more garlic", parent: "v1", state: "trying", by: "ai_alex", when: "5 Oct", cooked: 1, star: 0,
        revs: [
          { n: 1, by: "ai_alex", when: "5 Oct", kind: "create", why: "Alex: \"save this, less salty\"", d: [["chg", "Soy sauce ½ tbsp", "1 tbsp"], ["add", "Garlic 1 clove"]] },
          { n: 2, by: "alex", when: "8 Oct", kind: "adjust", why: "After cooking: garlic burnt, add it later", d: [["chg", "Step 2: …add the garlic for the last minute", "…fry onion and garlic"]] }
        ] },
      { id: "v3", name: "Kimchi fried rice", parent: "v1", state: "spun", by: "alex", when: "1 Oct", cooked: 0, star: 0, spunTo: "Kimchi fried rice",
        revs: [{ n: 1, by: "alex", when: "1 Oct", kind: "spin", why: "Alex: \"this is its own dish now\"", d: [["add", "Kimchi 60 g"], ["chg", "Soy sauce → gochujang", "Soy sauce"]] }] },
      { id: "v4", name: "Brown rice", parent: "v0", state: "put_away", by: "sam", when: "22 Sep", cooked: 1, star: 0, awayWhy: "Not for us, after one cook (29 Sep)",
        revs: [{ n: 1, by: "sam", when: "22 Sep", kind: "create", why: "Sam: \"try brown rice\"", d: [["chg", "Brown rice 150 g", "Basmati rice 150 g"]] }] }
    ],
    /* An assistant change to a kept version waits for a person (V-D21). */
    sugg: [{ id: "sg1", target: "v1", by: "ai_alex", when: "this morning", title: "More peas, thaw them first",
      words: "Alex: \"the peas were a bit sparse, can you bump them up\"",
      d: [["chg", "Frozen peas 60 g", "40 g"], ["add", "Step 1: Thaw the peas in a sieve under the tap"]] }]
  };
  /* Each version's head content, resolved (for 2 servings). In the build this is get_resolved_recipe on the head revision. */
  var base = [["Eggs", "3"], ["Basmati rice, cooked and cooled", "300 g"], ["Onion", "1"], ["Spring onions", "2"], ["Soy sauce", "2 tbsp"], ["Oil", "1 tbsp"]];
  var steps = ["Beat the eggs with a pinch of salt.", "Chop the onion and fry it in the oil until soft.", "Push the onion aside, pour in the eggs and stir until just set.", "Tip in the cold rice and break up any lumps. Keep the heat high.", "Splash in the soy sauce, toss in the spring onions and serve."];
  V.CONTENT = {
    v0: { ings: base.map(function (x) { return [x[0], x[1]]; }), steps: steps, chg: {} },
    v1: { ings: base.concat([["Frozen peas", "80 g"]]), steps: steps.slice(0, 3).concat(["Tip in the cold rice and the peas, break up any lumps. Keep the heat high.", steps[4]]), chg: { "Frozen peas": "added" } },
    v2: { ings: base.slice(0, 4).concat([["Soy sauce", "1 tbsp"], ["Oil", "1 tbsp"], ["Frozen peas", "80 g"], ["Garlic cloves", "2"]]), steps: [steps[0], "Chop the onion and fry it in the oil until soft. Add the garlic for the last minute.", steps[2], "Tip in the cold rice and the peas, break up any lumps. Keep the heat high.", steps[4]], chg: { "Soy sauce": "2 tbsp", "Garlic cloves": "added" } },
    v3: { ings: base.slice(0, 4).concat([["Gochujang", "1 tbsp"], ["Oil", "1 tbsp"], ["Kimchi", "120 g"]]), steps: steps, chg: { "Gochujang": "Soy sauce", "Kimchi": "added" } },
    v4: { ings: [["Eggs", "3"], ["Brown rice, cooked and cooled", "300 g"]].concat(base.slice(2)), steps: steps, chg: { "Brown rice, cooked and cooled": "Basmati rice" } }
  };
  V.byId = function (id) { return V.FAM.versions.filter(function (v) { return v.id === id; })[0]; };
  V.head = function (v) { return v.revs[v.revs.length - 1]; };

  V.STATE = {
    suggested: ["Suggested", "ai", "spark", "Your assistant made it. Nobody has said yes yet: it stays out of lists, plans and ideas."],
    trying: ["Trying", "trying", "flame", "On the list and plannable. Changes save straight into it. After a cook we ask how it was."],
    kept: ["Kept", "kept", "check", "A keeper. A change asks: fix this one, or save a new version."],
    put_away: ["Put away", "away", "x", "Hidden from lists, plans and ideas. Kept in full; bring it back any time."],
    spun: ["Spun off", "mut", "branch", "Became its own recipe. The link back stays."]
  };
  V.pill = function (s) { var x = V.STATE[s]; return '<span class="st ' + x[1] + '">' + X.ic(x[2], "xs") + x[0] + "</span>"; };
  V.usual = '<span class="st usual">' + X.ic("star", "xs") + "Our usual</span>";
  V.av = function (w) { var p = V.WHO[w] || V.WHO.legacy; return '<span class="vav' + (V.isAI(w) ? " ai" : "") + '" aria-hidden="true">' + p[1] + "</span>"; };
  V.who = function (w) { return X.esc((V.WHO[w] || V.WHO.legacy)[0]); };
  V.diff = function (d) {
    return '<ul class="df">' + d.map(function (r) {
      var sym = r[0] === "add" ? "+" : r[0] === "rm" ? "−" : "~";
      return '<li class="' + r[0] + '"><span class="sym" aria-hidden="true">' + sym + '</span><span>' + X.esc(r[1]) + (r[2] ? ' <s>(' + X.esc(r[2]) + ")</s>" : "") + "</span></li>";
    }).join("") + "</ul>";
  };
  V.kindWord = { create: "Made", fix: "Fixed", adjust: "Adjusted", restore: "Went back", spin: "Spun off" };
  V.links = function () {
    return '<h4>Versions slice</h4><p><a href="index.html">Overview and decisions</a> · <a href="family.html">Family</a> · <a href="version.html?v=v2">Trying</a> · <a href="version.html?v=v1">Kept</a> · <a href="change.html?v=v1">Change</a> · <a href="history.html?v=v0">History</a> · <a href="after-cook.html?v=v2">After a cook</a> · <a href="suggestions.html">Suggestions</a> · <a href="spec.html">Backend spec</a></p>';
  };
  V.seg = function (k, cur, opts) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-set="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>"; };
  V.controls = function () {
    X.controls(
      "<h4>Family screen (V option 1)</h4>" + V.seg("vfam", V.O.fam, [["A", "A By state"], ["B", "B Family tree"]]) +
      "<h4>Where a change goes (V option 2)</h4>" + V.seg("vsave", V.O.save, [["A", "A Ask at save"], ["B", "B Ask first"], ["C", "C By state"]]) +
      "<h4>After a cook (V option 3)</h4>" + V.seg("vcook", V.O.cook, [["A", "A Every cook"], ["B", "B From 2nd cook"], ["C", "C Never ask"]]) +
      "<h4>Assistant on a kept version (V option 4)</h4>" + V.seg("vai", V.O.ai, [["A", "A Suggest only"], ["B", "B Edit, review after"], ["C", "C Trusted per member"]]) +
      V.links());
  };
  window.VER = V;
})();
