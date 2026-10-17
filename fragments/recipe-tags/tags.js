/* Recipe tags mockup (Kitchie #834, an idea, not approved for build).
   Reuses the Recipe tab's sample data, icons, sheet and toast (../../recipe/recipe.js). Only the tag parts are new here.
   Sample tag names and which recipe carries which live in this script only (AGENTS.md: mockup-only data stays in the mockup's script).
   Nothing is sent anywhere. The household's tags are kept in this browser (localStorage) so a change on a recipe shows on the list. */
(function () {
  var X = window.RCP, esc = X.esc, ic = X.ic, Q = X.Q;

  /* Proposal RT-P2: a tag can sit in a group. The groups are the four kinds the owner named in #834; "Other" is for a tag with no group. */
  var GROUPS = [["meal", "Meal"], ["occasion", "Occasion"], ["focus", "Focus"], ["cal", "Calories"], ["other", "Other"]];

  /* The household's own tag list (proposal RT-P1: one list per household, reused on every recipe). The owner's four examples are here. */
  var DEF_TAGS = [
    ["Breakfast", "meal"], ["Lunch", "meal"], ["Dinner", "meal"],
    ["Treat", "occasion"], ["Guests", "occasion"],
    ["Protein", "focus"], ["Veggie-heavy", "focus"],
    ["300 cals", "cal"]
  ];
  var DEF_ON = {
    efr: ["Dinner"], cur: ["Dinner", "Protein", "Veggie-heavy"], pas: ["Dinner", "Treat"], sha: ["Breakfast", "Protein"],
    fri: ["Breakfast", "Lunch", "300 cals"], rag: ["Dinner", "Guests"], oml: ["Breakfast", "Protein", "300 cals"]
  };

  var load = function (k, d) { try { var v = X.store.get(k, null); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  var save = function (k, v) { X.store.set(k, JSON.stringify(v)); };
  if (Q.get("reset")) { save("rt-tags", DEF_TAGS); save("rt-on", DEF_ON); save("rt-hidden", {}); }
  var TAGS = load("rt-tags", DEF_TAGS), ON = load("rt-on", DEF_ON), HIDDEN = load("rt-hidden", {});

  var groupOf = function (t) { var f = TAGS.filter(function (x) { return x[0] === t; })[0]; return f ? f[1] : "other"; };
  var tagsOf = function (id) { return (ON[id] || []).slice().sort(function (a, b) { return order(a) - order(b); }); };
  var order = function (t) { for (var i = 0; i < TAGS.length; i++) if (TAGS[i][0] === t) return i; return 999; };
  /* Tags the recipe came with (set by the assistant when it was saved, e.g. Quick, Batch). Shown apart and lighter: proposal RT-P4. */
  var sourceTags = function (r) { return (r.tags || []).filter(function (t) { return !(HIDDEN[r.id] || {})[t]; }); };
  var count = function (t) { return Object.keys(ON).filter(function (id) { return (ON[id] || []).indexOf(t) > -1; }).length; };

  var toggle = function (id, t) {
    var a = ON[id] = (ON[id] || []).slice(), at = a.indexOf(t);
    if (at > -1) a.splice(at, 1); else a.push(t);
    save("rt-on", ON);
    return at < 0;
  };
  var addTag = function (name, g) {
    name = name.replace(/\s+/g, " ").trim();
    if (!name) return null;
    var hit = TAGS.filter(function (x) { return x[0].toLowerCase() === name.toLowerCase(); })[0];
    if (hit) return hit[0]; /* RT-P6: the same word twice is one tag, whatever the case */
    TAGS.push([name, g || "other"]); save("rt-tags", TAGS); return name;
  };
  var hideSource = function (id, t) { (HIDDEN[id] = HIDDEN[id] || {})[t] = 1; save("rt-hidden", HIDDEN); };

  /* The tag icon is new to the Recipe tab; drawn the same way as the others (24 grid, stroke). */
  var tagIc = function (c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>'; };

  /* The tag picker sheet (detail option 1). Taps save at once, in place; there is no Save button (same as the Minimum sheet in Kitchie). */
  var pickSheet = function (r, onChange) {
    var draw = function (s) {
      var mine = ON[r.id] || [];
      s.innerHTML = '<div class="grab"></div><h3>Tags for ' + esc(r.name) + '</h3>' +
        '<p class="hint">Tap to add or remove. Everyone in the household sees the same tags.</p>' +
        GROUPS.map(function (g) {
          var ts = TAGS.filter(function (x) { return x[1] === g[0]; });
          if (!ts.length) return "";
          return '<div class="rtg"><span class="lbl">' + g[1] + '</span><div class="rtchips">' + ts.map(function (x) {
            var on = mine.indexOf(x[0]) > -1;
            return '<button type="button" class="rtc" data-t="' + esc(x[0]) + '" aria-pressed="' + on + '">' + (on ? ic("check", "xs") : "") + esc(x[0]) + '</button>';
          }).join("") + '</div></div>';
        }).join("") +
        '<div class="rtg"><span class="lbl">New tag</span><form class="rtnew" data-new>' +
        '<input class="rtin" name="n" maxlength="24" placeholder="e.g. Kids love it" aria-label="New tag name" autocomplete="off">' +
        '<select class="rtsel" name="g" aria-label="Group">' + GROUPS.map(function (g) { return '<option value="' + g[0] + '"' + (g[0] === "other" ? " selected" : "") + '>' + g[1] + '</option>'; }).join("") + '</select>' +
        '<button type="submit" class="ib acc" aria-label="Add the tag">' + ic("plus") + '</button></form>' +
        '<p class="hint" style="margin-top:6px">A new tag joins the household&rsquo;s list and goes on this recipe.</p></div>' +
        '<button type="button" class="btn ghost" data-close style="width:100%;margin-top:12px">Done</button>';
    };
    X.sheet("", function (s, close) {
      draw(s);
      s.addEventListener("click", function (e) {
        var b = e.target.closest("[data-t]"); if (!b) return;
        var on = toggle(r.id, b.dataset.t); draw(s); onChange && onChange();
        var nb = s.querySelector('[data-t="' + CSS.escape(b.dataset.t) + '"]'); if (nb) nb.focus();
        X.toast((on ? "Tagged " : "Removed ") + b.dataset.t);
      });
      s.addEventListener("submit", function (e) {
        e.preventDefault(); var f = e.target, n = addTag(f.n.value, f.g.value); if (!n) return;
        if ((ON[r.id] || []).indexOf(n) < 0) toggle(r.id, n);
        draw(s); onChange && onChange(); X.toast("Tagged " + n);
        var i = s.querySelector(".rtin"); if (i) i.focus();
      });
      var f = s.querySelector(".rtc"); if (f) f.focus();
    });
  };

  /* The find-by-tags sheet (list option B): grouped, several at once, then Show. */
  var findSheet = function (sel, onApply) {
    var pick = sel.slice();
    var n = function () { return window.RT_FILTER(pick).length; };
    var draw = function (s) {
      s.innerHTML = '<div class="grab"></div><h3>Find by tags</h3>' +
        '<p class="hint">Pick several. Within a group any one matches; across groups, all must.</p>' +
        GROUPS.map(function (g) {
          var ts = TAGS.filter(function (x) { return x[1] === g[0] && count(x[0]); });
          if (!ts.length) return "";
          return '<div class="rtg"><span class="lbl">' + g[1] + '</span><div class="rtchips">' + ts.map(function (x) {
            var on = pick.indexOf(x[0]) > -1;
            return '<button type="button" class="rtc" data-f="' + esc(x[0]) + '" aria-pressed="' + on + '">' + (on ? ic("check", "xs") : "") + esc(x[0]) + '<span class="n">' + count(x[0]) + '</span></button>';
          }).join("") + '</div></div>';
        }).join("") +
        '<div class="act rtact"><button type="button" class="btn ghost sm" data-clear' + (pick.length ? "" : " disabled") + '>Clear</button>' +
        '<button type="button" class="btn" data-apply>' + (pick.length ? "Show " + n() + " recipe" + (n() === 1 ? "" : "s") : "Show all") + '</button></div>';
    };
    X.sheet("", function (s, close) {
      draw(s);
      s.addEventListener("click", function (e) {
        var b = e.target.closest("[data-f]");
        if (b) { var t = b.dataset.f, at = pick.indexOf(t); if (at > -1) pick.splice(at, 1); else pick.push(t); draw(s); var nb = s.querySelector('[data-f="' + CSS.escape(t) + '"]'); if (nb) nb.focus(); return; }
        if (e.target.closest("[data-clear]")) { pick = []; draw(s); return; }
        if (e.target.closest("[data-apply]")) { close(); onApply(pick); }
      });
    });
  };

  window.RT = { GROUPS: GROUPS, TAGS: function () { return TAGS; }, groupOf: groupOf, tagsOf: tagsOf, sourceTags: sourceTags, count: count, toggle: toggle, addTag: addTag, hideSource: hideSource, tagIc: tagIc, pickSheet: pickSheet, findSheet: findSheet };
})();
