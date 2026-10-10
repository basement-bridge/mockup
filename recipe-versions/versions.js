/* Recipe versions slice: sample family, states and helpers. Sits on top of recipe/recipe.js (RCP: icons, sheet, toast,
   controls, persona) so the two slices stay one family. Sample names live here only (AGENTS.md).
   Model (Proposal, see index.html V-D1 to V-D33):
     family   = what a person calls "the recipe" (one row in the list), named by its usual version
     version  = one way of making it; has a state (suggested, trying, kept, put_away) and a head revision
     revision = one saved edit of a version; immutable; the head moves forward, nothing is overwritten */
(function () {
  var X = window.RCP;
  var V = {};
  /* Options 1 to 6 are locked (owner, typed, 10 Oct 2026): 1 A grouped by state, 2 C a try takes edits in place and a keeper
     asks at save, 3 A ask after every cook of a try, 4 B the assistant may edit a kept version or the usual and a person
     reviews afterwards, 5 A frozen revisions under changeable versions, 6 B a revision stores only its change set (git-like).
     They are no longer switches. V.O stays so the screens read the pick in one place. */
  V.O = { fam: "A", save: "C", cook: "A", ai: "B" };
  V.LOCKED = "Locked (owner, typed, 10 Oct 2026)";

  /* Members and the assistant. An assistant is never a member: it acts for one (on_behalf_of). */
  V.WHO = { sam: ["Sam", "S"], jane: ["Jane", "J"], alex: ["Alex", "A"], priya: ["Priya", "P"], ai_alex: ["Alex's assistant", "✦", "alex"], ai_sam: ["Sam's assistant", "✦", "sam"], ai_priya: ["Priya's assistant", "✦", "priya"], legacy: ["Before versions", "?"] };
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
          { n: 1, by: "jane", when: "20 Sep", kind: "create", why: "Jane: \"kids like the peas, keep that one\"", d: [["add", "Frozen peas 80 g"]] },
          { n: 2, by: "jane", when: "29 Sep", kind: "fix", why: "Peas go in at step 4, not step 5", d: [["chg", "Step 4: …add the peas with the rice", "Step 5: …add the peas"]] },
          { n: 3, by: "ai_alex", when: "this morning", kind: "fix", why: "Alex: \"the peas were a bit sparse, bump them up, and say to thaw them\"", review: "rv1", d: [["chg", "Frozen peas 120 g", "80 g"], ["add", "Step 1: Thaw the peas in a sieve under the tap"]] }
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
    /* Pick 4 B: an assistant saved straight into a kept version (here the usual). The change is live; a person reviews it
       afterwards. Each change in the revision can be kept or reverted on its own (a revert is a new revision).
       One review item per assistant revision on a kept version or the usual. Reviewed by any member (L5). */
    reviews: [{ id: "rv1", target: "v1", rev: 3, by: "ai_alex", client: "Claude", when: "this morning", title: "More peas, thaw them first",
      words: "Alex: \"the peas were a bit sparse, bump them up, and say to thaw them\"", where: "fix",
      changes: [{ id: "c1", d: ["chg", "Frozen peas 120 g", "80 g"], st: null }, { id: "c2", d: ["add", "Step 1: Thaw the peas in a sieve under the tap"], st: null }] }],
    /* A whole new recipe from an assistant is Suggested until a person says yes (V-D22). */
    drafts: [{ id: "fam_dal", name: "Tarka dal", e: "🥣", by: "ai_priya", when: "yesterday", words: "Priya: \"save Mum's dal, she said about a cup of lentils\"", unknown: 2 }]
  };
  /* Each version's head content, resolved (for 2 servings). In the build this is get_resolved_recipe on the head revision. */
  var base = [["Eggs", "3"], ["Basmati rice, cooked and cooled", "300 g"], ["Onion", "1"], ["Spring onions", "2"], ["Soy sauce", "2 tbsp"], ["Oil", "1 tbsp"]];
  var steps = ["Beat the eggs with a pinch of salt.", "Chop the onion and fry it in the oil until soft.", "Push the onion aside, pour in the eggs and stir until just set.", "Tip in the cold rice and break up any lumps. Keep the heat high.", "Splash in the soy sauce, toss in the spring onions and serve."];
  V.CONTENT = {
    v0: { ings: base.map(function (x) { return [x[0], x[1]]; }), steps: steps, chg: {}, bl: { "Basmati rice, cooked and cooled": [2, "sam", "12 Sep"], s3: [3, "ai_sam", "21 Sep"] } },
    v1: { ings: base.concat([["Frozen peas", "120 g"]]), steps: ["Thaw the peas in a sieve under the tap."].concat(steps.slice(0, 3), ["Tip in the cold rice and the peas, break up any lumps. Keep the heat high.", steps[4]]), chg: { "Frozen peas": "80 g" }, rv: { ing: "Frozen peas", step: 0 },
      bl: { "Frozen peas": [3, "ai_alex", "this morning"], s0: [3, "ai_alex", "this morning"], s4: [2, "jane", "29 Sep"] } },
    v2: { ings: base.slice(0, 4).concat([["Soy sauce", "1 tbsp"], ["Oil", "1 tbsp"], ["Frozen peas", "80 g"], ["Garlic cloves", "2"]]), steps: [steps[0], "Chop the onion and fry it in the oil until soft. Add the garlic for the last minute.", steps[2], "Tip in the cold rice and the peas, break up any lumps. Keep the heat high.", steps[4]], chg: { "Soy sauce": "2 tbsp", "Garlic cloves": "added" } },
    v3: { ings: base.slice(0, 4).concat([["Gochujang", "1 tbsp"], ["Oil", "1 tbsp"], ["Kimchi", "120 g"]]), steps: steps, chg: { "Gochujang": "Soy sauce", "Kimchi": "added" } },
    v4: { ings: [["Eggs", "3"], ["Brown rice, cooked and cooled", "300 g"]].concat(base.slice(2)), steps: steps, chg: { "Brown rice, cooked and cooled": "Basmati rice" } }
  };
  V.byId = function (id) { return V.FAM.versions.filter(function (v) { return v.id === id; })[0]; };

  /* Owner's answer 2 (typed, 10 Oct 2026): notes are a field of the version, inherited from the parent and stored as a change
     set only where a version's notes differ (spec 9.4). Each entry is one op on a note block with a stable id:
     add (new block here), update (this version's wording of an inherited block), hide (an inherited block hidden on this
     version and the ones made from it). Notes inherit LIVE (sub-option NA): a note added on a parent later shows on its
     children too, unless a child changed or hid that block. cook = the cook it was written after (P-D29). */
  V.NOTES = {
    v0: [{ op: "add", id: "n1", t: "Day-old rice really is better. Fresh rice goes mushy.", by: "sam", when: "12 Sep" }],
    v1: [{ op: "add", id: "n2", t: "The kids eat the peas if they are the small ones (petits pois).", by: "jane", when: "22 Sep", cook: "22 Sep" }],
    v2: [{ op: "update", id: "n2", t: "The kids eat the peas if they are the small ones. In this one they pick the garlic out, so slice it big.", by: "alex", when: "8 Oct" },
         { op: "add", id: "n3", t: "Garlic burns fast: last minute only.", by: "alex", when: "8 Oct", cook: "8 Oct" }],
    v4: [{ op: "hide", id: "n1", by: "sam", when: "22 Sep" }]
  };
  V.root = function () { return V.FAM.versions.filter(function (v) { return !v.parent; })[0]; };
  V.chain = function (vid) { var c = [], v = V.byId(vid); while (v) { c.unshift(v); v = v.parent ? V.byId(v.parent) : null; } return c; };
  /* Resolve a version's notes: walk from the root down to it, applying each version's note ops. In the build this is
     get_version's notes, served from the head cache. */
  V.notesFor = function (vid) {
    var bl = [];
    V.chain(vid).forEach(function (ver) {
      (V.NOTES[ver.id] || []).forEach(function (o) {
        var b = bl.filter(function (x) { return x.id === o.id; })[0];
        if (o.op === "add") bl.push({ id: o.id, t: o.t, by: o.by, when: o.when, cook: o.cook, origin: ver.id, at: ver.id });
        else if (b && o.op === "update") { b.prev = b.t; b.prevAt = b.at; b.t = o.t; b.by = o.by; b.when = o.when; b.at = ver.id; }
        else if (b && o.op === "hide") { b.hidden = ver.id; }
      });
    });
    return bl;
  };

  /* Owner's answer 5 (typed, 10 Oct 2026): every member has their own reaction to a version; the household's view is DERIVED,
     never a separate vote. ate = who ate it, from the cook log (each cook records who ate). Reactions: liked, no (not for me).
     Skip is no answer and is not stored. The star on a version is your own "liked". */
  V.MEMBERS = ["sam", "jane", "alex", "priya"];
  V.ME = { weeknight: "sam", batch: "priya", improviser: "alex", follower: "jane" }[X.P.persona] || "sam";
  V.ATE = { v0: ["sam", "jane"], v1: ["sam", "jane", "alex"], v2: ["alex", "sam"], v4: ["sam", "priya"] };
  V.REACT = { v0: { sam: "liked", jane: "liked" }, v1: { sam: "liked", jane: "liked", alex: "no" }, v2: { alex: "liked" }, v4: { sam: "no", priya: "no" } };
  /* Household rule (Proposal, a household setting): "most of those who ate it liked it". Favourite when more than half of
     the members who ate it liked it and at least 2 liked (1 in a household of one). "Not for me" is shown by name only to
     the member who gave it; the household sees a count. */
  V.liked = function (vid) {
    var r = V.REACT[vid] || {}, ate = V.ATE[vid] || [];
    var yes = Object.keys(r).filter(function (m) { return r[m] === "liked"; }), no = Object.keys(r).filter(function (m) { return r[m] === "no"; });
    var need = V.MEMBERS.length > 1 ? 2 : 1;
    return { yes: yes, no: no, ate: ate.length, fav: yes.length >= need && yes.length * 2 > ate.length };
  };
  V.names = function (ms) { var n = ms.map(function (m) { return m === V.ME ? "you" : V.WHO[m][0]; }); return n.length > 1 ? n.slice(0, -1).join(", ") + " and " + n[n.length - 1] : n.join(""); };
  V.likedLine = function (vid) {
    var L = V.liked(vid); if (!L.ate) return "";
    return (L.fav ? '<span class="st kept">' + X.ic("star", "xs") + "Household favourite</span> " : "") +
      (L.yes.length ? "Liked by " + X.esc(V.names(L.yes)) : "No likes yet") + " · " + L.yes.length + " of " + L.ate + " who ate it" +
      (L.no.indexOf(V.ME) > -1 ? " · not for you" + (L.no.length > 1 ? " and " + (L.no.length - 1) + " more" : "") : L.no.length ? " · " + L.no.length + " not keen" : "");
  };

  /* Owner's answer 3 (typed, 10 Oct 2026): nothing is ever deleted; every change and every put-away can be undone at any
     time, as a new event or revision (never a rewind). State and pointer events per version, newest last. */
  V.EVENTS = {
    v1: [{ when: "20 Sep", by: "jane", t: "Made our usual" }],
    v4: [{ when: "29 Sep", by: "sam", t: "Put away: Not for us, after one cook", undo: "Bring back" }]
  };
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
  V.kindWord = { create: "Made", fix: "Fixed", adjust: "Adjusted", restore: "Went back", revert: "Undid a change", spin: "Spun off" };
  /* Review after (pick 4 B): what is still unreviewed on a version. */
  V.open = function (vid) { return (V.FAM.reviews || []).filter(function (r) { return r.target === vid && r.changes.some(function (c) { return !c.st; }); }); };
  V.rvBadge = function (vid) { return V.open(vid).length ? '<span class="st rvw">' + X.ic("spark", "xs") + "To review</span>" : ""; };
  V.strip = function (cur) {
    /* L3 (R-O3 = B, varied, locked): no versions row for one version; several make a strip that scrolls sideways, its own row,
       docked at the top above the section jump row. The last item opens the Versions screen (pick 1 A). */
    var act = V.FAM.versions.filter(function (x) { return x.state !== "put_away" && x.state !== "spun"; });
    if (act.length < 2) return "";
    return '<div class="strip vstrip" id="vstrip" role="group" aria-label="Version, ' + act.length + ' versions">' +
      '<span class="vlab" aria-hidden="true">' + X.ic("branch", "s") + act.length + "</span>" +
      act.map(function (x, i) { return (i ? '<span class="sd" aria-hidden="true"></span>' : "") + '<a class="vs" href="version.html?v=' + x.id + '" aria-current="' + (x.id === cur) + '"' + (V.FAM.usual === x.id ? ' aria-label="' + X.esc(x.name) + ', our usual"' : "") + ">" + X.esc(x.name) + (V.FAM.usual === x.id ? ' <span aria-hidden="true">★</span>' : "") + (V.open(x.id).length ? ' <span class="dotrv" aria-label="has a change to review"></span>' : "") + "</a>"; }).join("") +
      '<span class="sd" aria-hidden="true"></span><a class="vs more" href="family.html?v=' + cur + '">All versions' + X.ic("chev", "xs") + "</a></div>";
  };
  V.links = function () {
    return '<h4>Versions slice</h4><p><a href="index.html">Overview and decisions</a> · <a href="family.html">Versions</a> · <a href="version.html?v=v2">Trying</a> · <a href="version.html?v=v1">Our usual (to review)</a> · <a href="change.html?v=v1">Change a keeper</a> · <a href="change.html?v=v2">Change a try</a> · <a href="history.html?v=v1">History</a> · <a href="after-cook.html?v=v2">After a cook</a> · <a href="after-cook.html?v=v1">Cooked before review</a> · <a href="suggestions.html">To review</a> · <a href="spec.html">Backend spec</a> · <a href="spec.html#storage">Revision storage</a> · <a href="spec.html#authoring">Assistant tools</a></p>';
  };
  V.controls = function () {
    X.controls(
      "<h4>Versions options: locked</h4><p>" + V.LOCKED + ": 1 A grouped by state · 2 C a try takes edits in place, a keeper asks at save · 3 A ask after every cook · 4 B the assistant edits, a person reviews after · 5 A frozen revisions · 6 B changes only. Not chosen: 1 B tree; 2 A, B; 3 B, C; 4 A, C; 5 B, C; 6 A.</p>" +
      "<h4>Open items answered: locked</h4><p>" + V.LOCKED + ": Not for us puts away at once, with undo · notes inherited per version, changes only · no hard delete, undo any time · dismissed drafts only in that member's assistant history · reactions per member, the household's derived · R-V1 approved.</p>" +
      V.links());
  };
  window.VER = V;
})();
