/* The day rows of option F (Kitchie #757): view model, markup and keys, shared by the standalone page (day-rows.html) and the flyout (pick-f.js).
   A day is { dn, today, off: null | "usual" | "week", meals: [{ name, who: "all" | "me" | "<other person>", notFor: [names] }] }.
   Plan data model used as it is: a household meal is for_whom everyone (notFor is the participants minus those people, 0.110.0), a person's own plan is for_whom member.
   Nothing here is stored. ctx: { who: "all" | person, me, avoid: { who, item } | null, guard: null | "stop" | "warn", offRule: "open" | "refuse" }. */
(function () {
"use strict";
var R = window.PKRows = {};
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function names(a) { return a.map(function (m) { return m.name; }); }
function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
function join(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
function who(m, me) { return m.who === "me" ? me : m.who; }
R.view = function (d, c) {
  var me = c.me, hh = d.meals.filter(function (m) { return m.who === "all"; }), ind = d.meals.filter(function (m) { return m.who !== "all"; });
  var own = d.meals.filter(function (m) { return m.who === "me"; }), others = uniq(ind.filter(function (m) { return m.who !== "me"; }).map(function (m) { return m.who; }));
  var pw = c.who === "all" ? "all" : c.who === me ? "me" : c.who, lines, v = { disabled: false, danger: false, muted: false };
  if (pw === "all") lines = names(hh);
  else { var mine = d.meals.filter(function (m) { return m.who === pw; }); lines = mine.length ? names(mine).map(function (n) { return n + (pw === "me" ? " (yours)" : ""); }) : names(hh.filter(function (m) { return [].concat(m.notFor || []).indexOf(c.who) < 0; })).map(function (n) { return n + " (household)"; }); }
  if (!lines.length) { v.muted = true; lines = [d.off === "usual" ? "Usual day off" : d.off === "week" ? "Off this week only" : "Open"]; }
  /* what picking this row does, in words */
  var cons = "", rn = names(hh.concat(own)).join(" and "), O = join(others);
  if (c.guard === "stop") { cons = "Not for " + c.avoid.who; v.danger = true; v.disabled = true; }
  else if (c.guard === "warn") { cons = c.avoid.who + " has a Hard avoid on " + c.avoid.item + ": asks first"; v.danger = true; }
  else if (d.off && !d.meals.length) {
    if (c.offRule === "refuse") { cons = d.dn + " is off for you. Pick another day."; v.disabled = true; v.refuse = true; }
    else cons = d.off === "usual" ? "Usual day off. Planning it cooks this week only." : "Off this week only. Planning it opens the day.";
  }
  else if (pw === "all") cons = hh.length || own.length ? (others.length ? "Replaces " + rn + " for everyone but " + O + ". " + O + "’s meal stays." : "Replaces " + rn + ".") : (others.length ? "Plans it for everyone but " + O + ". " + O + "’s meal stays." : "Plans it for everyone.");
  else if (pw === "me") cons = own.length ? "Replaces " + names(own).join(" and ") + "." : hh.length ? "Takes you out of " + names(hh).join(" and ") + " and plans yours." : "Plans it for you.";
  else { var jm = d.meals.filter(function (m) { return m.who === pw; }); cons = jm.length ? "Adds a second meal. " + pw + "’s meal stays." : hh.length ? "Takes " + pw + " out of " + names(hh).join(" and ") + " and plans theirs." : "Plans it for " + pw + "."; }
  v.lines = lines; v.cons = cons;
  /* the peek: under Everyone, when anyone has their own plan that night */
  v.peek = pw === "all" && ind.length > 0;
  var full = [{ k: "Household", v: hh.length ? names(hh).join(" and ") + (hh.some(function (m) { return (m.notFor || []).length; }) ? " (without " + join(uniq([].concat.apply([], hh.map(function (m) { return [].concat(m.notFor || []); })))) + ")" : "") : "Open" }];
  uniq(ind.map(function (m) { return who(m, me); })).forEach(function (p) { full.push({ k: p, v: names(ind.filter(function (m) { return who(m, me) === p; })).join(" and ") }); });
  v.full = full;
  v.label = d.dn + ", " + (d.meals.length && pw === "all" ? lines.join(" and ") : lines.join(" and ")) + ". " + cons;
  return v;
};
/* markup: one wrapper per day; the row, the peek (a card slightly visible behind it) and, for the one open day, the full picture */
R.html = function (days, c, open) {
  return '<div class="rows" role="group" aria-label="Day">' + days.map(function (d, i) {
    var v = R.view(d, c), isOpen = open === i && v.peek;
    return '<div class="row-w' + (v.peek ? " has-peek" : "") + (isOpen ? " open" : "") + '" data-w="' + i + '"><button type="button" class="row-d' + (d.today ? " today" : "") + (d.meals.length ? "" : d.off ? " off" : " open") + (v.danger ? " danger" : "") + (v.disabled ? " dis" : "") + '" data-i="' + i + '"' + (v.disabled ? ' aria-disabled="true"' : "") + ' aria-label="' + esc(v.label) + '"><span class="dl">' + esc(d.dn) + '</span><span class="dt">' +
      v.lines.map(function (l) { return '<span class="ln' + (v.muted ? " mu" : "") + '">' + esc(l) + "</span>"; }).join("") + '<small class="cons">' + esc(v.cons) + "</small></span></button>" +
      (v.peek ? '<button type="button" class="peek-b" data-peek="' + i + '" aria-expanded="' + isOpen + '" aria-label="' + (isOpen ? "Hide" : "Show everyone’s plans for") + " " + esc(d.dn) + '"><span>' + (isOpen ? "Hide" : "") + "</span></button>" : "") +
      (isOpen ? '<div class="row-full" role="group" aria-label="' + esc(d.dn) + ', everyone’s plans">' + v.full.map(function (f) { return '<p><b>' + esc(f.k) + "</b>" + esc(f.v) + "</p>"; }).join("") + "</div>" : "") + "</div>";
  }).join("") + "</div>";
};
/* keys on the rows: up and down move, Home and End, Right opens that day's full picture, Left folds it; Enter on a row is the browser's own click */
R.key = function (e, root, o) {
  var rows = [].slice.call(root.querySelectorAll(".row-d")), i = rows.indexOf(document.activeElement); if (i < 0) return false;
  var k = e.key;
  if (k === "ArrowDown") { rows[Math.min(rows.length - 1, i + 1)].focus(); }
  else if (k === "ArrowUp") { rows[Math.max(0, i - 1)].focus(); }
  else if (k === "Home") { rows[0].focus(); } else if (k === "End") { rows[rows.length - 1].focus(); }
  else if (k === "ArrowRight") { if (!root.querySelector('[data-w="' + i + '"] .peek-b')) return false; o.toggle(i, true); }
  else if (k === "ArrowLeft") { if (!root.querySelector('[data-w="' + i + '"].open')) return false; o.toggle(i, false); }
  else return false;
  e.preventDefault(); return true;
};
})();
