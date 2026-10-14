/* Plan UI review: sample data and icons shared by desktop.html and phone.html. No viewport rules here (DESIGN.md section 7).
   Sample data only; the real plan comes from the same service methods the chat tools use (plan_view, plan_update_meal, plan_remove_meal, plan_block_day, plan_reserve, plan_add_missing_to_list). */
window.PUR = (function () {
  var I = function (d, x) { return '<svg viewBox="0 0 24 24" width="' + (x || 16) + '" height="' + (x || 16) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var icons = {
    warn: I('<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v5M12 18v.01"/>'),
    cart: I('<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12h11l2-8H6"/>'),
    mark: I('<path d="M6 3h12v18l-6-4-6 4V3z"/>'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    more: I('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
    left: I('<path d="M15 5l-7 7 7 7"/>'),
    right: I('<path d="M9 5l7 7-7 7"/>'),
    down: I('<path d="M5 9l7 7 7-7"/>'),
    up: I('<path d="M5 15l7-7 7 7"/>'),
    book: I('<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4z"/><path d="M5 16a4 4 0 0 1 4-4h10"/>'),
    bang: I('<path d="M12 6v7M12 17.5v.01"/>'),
    check: I('<path d="M5 12l5 5 9-10"/>'),
    spark: I('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>'),
    copy: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
    cog: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
    undo: I('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
    dice: I('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/>'),
    hand: I('<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 6-5.5 6S7 18 6 15l-1.6-3.3a1.5 1.5 0 0 1 2.6-1.4L8 12"/>'),
    cal: I('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
    moon: I('<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>'),
    swap: I('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
    people: I('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5a3 3 0 0 1 0 6M18 14c2 .7 3 2.8 3 6"/>'),
    /* Clear week (decision 109): an eraser, not a bin. A bin says "delete for good"; the eraser says "wipe the board", and Undo is always there. */
    clear: I('<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'),
    /* Plan UI review 190: view only. An eye in the same line language as the moon, cog and ask-AI glyphs (24 grid, 2 px stroke, round caps); never an emoji. */
    eye: I('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
    /* Plan UI review 215: the open night. An open padlock in the same line language (24 grid, 2 px stroke, round caps), never an emoji. The shackle is lifted off the body and open on the right; it is nothing like the eye (view only). */
    unlock: I('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.6-1.7"/><path d="M12 15.5v1.5"/>'),
    leaf: I('<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>')
  };
  var people = [
    { id: 'sam', n: 'Sam', me: 1 }, { id: 'jane', n: 'Jane' }, { id: 'kit', n: 'Kit' }, { id: 'arlo', n: 'Arlo' },
    { id: 'priya', n: 'Priya' }, { id: 'tom', n: 'Tom' }, { id: 'lee', n: 'Lee' }
  ];
  /* The ribbon range. Desktop keeps three weeks (last, this, next; owner-stated 12 Oct 2026, decision 86). The phone calls useRange(3) before it reads RIB: one week back and, counting this one, four forward
     (owner-stated 13 Oct 2026, decision 197: "four forward, one backward"), so last, this, next, in 2 weeks, in 3 weeks. The array is changed in place, so every function here sees the new range.
     A day id is "d" + the date in October 2026 (d12 = Mon 12 Oct), "n" + the date in November (n02 = Mon 2 Nov). Today in the sample is Tue 13 Oct. */
  var DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], RIB = [];
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dayId(k) { var n = 5 + k; return n <= 31 ? 'd' + pad(n) : 'n' + pad(n - 31); }
  function mkRib(to) { var out = []; for (var k = 0; k < (to + 2) * 7; k++) { var n = 5 + k; out.push({ id: dayId(k), dow: DOW[k % 7], n: n <= 31 ? n : n - 31, mo: n <= 31 ? 'Oct' : 'Nov', i: k, wk: Math.floor(k / 7) - 1, mon: dayId(7 * Math.floor(k / 7)) }); } return out; }
  RIB.push.apply(RIB, mkRib(1));
  function useRange(to) { RIB.length = 0; RIB.push.apply(RIB, mkRib(to)); }
  var SHORT = { mon: 'd12', tue: 'd13', wed: 'd14', thu: 'd15', fri: 'd16', sat: 'd17', sun: 'd18' };
  function did(v, d) { if (!v) return d; if (SHORT[v]) return SHORT[v]; return RIB.some(function (r) { return r.id === v; }) ? v : d; }
  function dinfo(id) { return RIB.filter(function (r) { return r.id === id; })[0]; }
  var DAYS = RIB.filter(function (r) { return r.wk === 0; }).map(function (r) { return [r.id, r.dow, r.n]; });
  var REL = { '-1': 'Last week', '0': 'This week', '1': 'Next week', '2': 'In 2 weeks', '3': 'In 3 weeks' };
  /* who: 'all' or list of ids. miss: missing items. have: on hand. useby: items with a use-by. list: on the shopping list. held: ingredient held. */
  var meals = [
    { id: 'mon-shak', mins: 25, rid: 'sha', day: 'd12', em: '🍳', t: 'Shakshuka', who: 'all', n: 4, src: 'saved', miss: [['feta', '200 g', 1]], have: [['eggs', '8'], ['tinned tomatoes', '2 tins'], ['onion', '2']], useby: [], list: 1, held: 1, note: 'A quick night' },
    { id: 'tue-pasta', mins: 30, rid: 'pas', day: 'd13', em: '🍝', t: 'Mushroom pasta', who: 'all', n: 4, src: 'saved', miss: [], have: [['pasta', '500 g'], ['mushrooms', '400 g'], ['cream', '1 tub']], useby: [['mushrooms', 'Wed 14']], list: 0, held: 0, note: 'Uses the mushrooms before they turn' },
    { id: 'wed-curry', mins: 45, day: 'd14', em: '🍛', t: 'Japanese golden curry', who: 'all', n: 4, src: 'made', miss: [['curry roux', '1 block', 1], ['jasmine rice', '2 cups']], have: [['chicken thighs', '600 g'], ['veg bag', '1 bag'], ['onion', '2'], ['potatoes', '4'], ['carrots', '3']], useby: [['chicken thighs', 'Tue 13']], list: 1, held: 0, note: 'Cooks double: Friday leftovers', makes: 'fri-left' },
    { id: 'thu-salmon', mins: 25, day: 'd15', em: '🐟', t: 'Salmon patties', who: 'all', n: 4, src: 'saved', miss: [['dill', '1 bunch'], ['lemon', '2']], have: [['salmon', '2 tins'], ['eggs', '2'], ['breadcrumbs', '1 cup']], useby: [['salmon', 'Thu 15']], list: 0, held: 0, note: '' },
    { id: 'thu-tuna', mins: 10, day: 'd15', em: '🥗', t: 'Tuna salad', who: ['sam'], n: 1, src: 'saved', miss: [['lemon', '1']], have: [['tuna', '1 tin'], ['lettuce', '1']], useby: [], list: 0, held: 0, note: '' },
    { id: 'fri-left', mins: 5, day: 'd16', em: '♻️', t: 'Leftover chicken curry', who: ['sam'], n: 1, src: 'saved', miss: [], have: [['curry, from Wednesday', '1 serve']], useby: [], list: 0, held: 0, note: 'Reheat; no shopping', left: 'Wed 14', usual: 1 },
    /* last week: past, read-only. Sources for "Copy last week" and for swipe right = copy forward. */
    { id: 'l-mon', mins: 20, rid: 'efr', day: 'd05', em: '🍚', t: 'Egg fried rice', who: 'all', n: 4, src: 'saved', miss: [], have: [['rice', '3 cups'], ['eggs', '4'], ['peas', '1 bag']], useby: [], list: 0, held: 0, note: '' },
    { id: 'l-tue', mins: 30, day: 'd06', em: '🌮', t: 'Taco night', who: 'all', n: 4, src: 'saved', miss: [], have: [['tortillas', '8'], ['mince', '500 g'], ['salsa', '1 jar']], useby: [], list: 0, held: 0, note: '' },
    { id: 'l-wed', mins: 90, day: 'd07', em: '🍗', t: 'Roast chicken', who: 'all', n: 4, src: 'saved', miss: [], have: [['chicken', '1.6 kg'], ['potatoes', '6'], ['carrots', '4']], useby: [], list: 0, held: 0, note: '' },
    { id: 'l-thu', mins: 10, day: 'd08', em: '🍳', t: 'Mushroom omelette', who: ['sam'], n: 1, src: 'saved', miss: [], have: [['eggs', '3'], ['mushrooms', '100 g']], useby: [], list: 0, held: 0, note: '' },
    { id: 'l-thu2', mins: 15, day: 'd08', em: '🍜', t: 'Pad see ew', who: ['jane'], n: 1, src: 'saved', miss: [], have: [['noodles', '1 pack']], useby: [], list: 0, held: 0, note: '' },
    { id: 'l-fri', mins: 40, day: 'd09', em: '🐟', t: 'Fish and chips', who: 'all', n: 4, src: 'saved', miss: [], have: [['fish', '4'], ['potatoes', '6']], useby: [], list: 0, held: 0, note: '' },
    { id: 'l-sun', mins: 35, day: 'd11', em: '🥘', t: 'Roast veg and halloumi', who: 'all', n: 4, src: 'saved', miss: [], have: [['halloumi', '2 blocks'], ['veg bag', '1 bag']], useby: [], list: 0, held: 0, note: '' }
  ];
  /* Not cooking days. d10 last Sat (past), d17 this Sat, d22 and d25 next week (the usual days off). */
  var blocked = { d10: 'once', d17: 'once', d22: 'once', d25: 'usual' };
  var tips = { d14: 'Wednesday is the big cook: leftovers for Friday' };
  /* Surprise me uses the Home cooking-ideas engine (decision 292; kitchie server/src/recipe-tab/ideas.ts rank()). The four meals below are SAMPLE DATA only, with the sample signals the engine reads: last (days since cooked, where known), star,
     ubd (days until the soonest use-by among the on-hand things it uses), mins, miss (what is missing: the count is Recipe's readiness). The shopping list is not a signal (Home gathers it and never scores it), and the week's position is not either. */
  var SUR = [
    { id: 's1', mins: 35, last: 21, ubd: null, em: '🍋', t: 'Lemon chicken orzo', miss: [['orzo', '500 g']], have: [['chicken thighs', '600 g'], ['lemon', '2']], useby: [], list: 0 },
    { id: 's2', mins: 20, last: 40, ubd: null, em: '🌿', t: 'Thai basil stir-fry', miss: [['Thai basil', '1 bunch']], have: [['noodles', '1 pack'], ['veg bag', '1 bag']], useby: [], list: 0 },
    { id: 's3', mins: 40, last: 9, ubd: 2, ubn: 'eggs', em: '🥚', t: 'Potato and egg frittata', miss: [], have: [['eggs', '8'], ['potatoes', '4'], ['onion', '2']], useby: [], list: 0 },
    { id: 's4', mins: 45, last: 3, ubd: null, em: '🍲', t: 'Pantry minestrone', miss: [], have: [['tinned tomatoes', '2 tins'], ['pasta', '200 g'], ['carrots', '3']], useby: [], list: 0 }
  ];
  /* Total time (Plan UI review 124): ONE figure per meal, minutes; never a prep and cook split. */
  function mins(m) { var n = m.mins; if (!n) return ''; return n < 60 ? n + ' min' : Math.floor(n / 60) + ' h' + (n % 60 ? ' ' + (n % 60) + ' min' : ''); }
  /* Plan UI review 208 (owner-stated, 13 Oct 2026): a household meal (who: 'all') may carry NAMED PARTICIPANTS (part: a list of ids). No part = everyone in the household (the default); a part = only those people. A person's own meal (who: a list) is theirs and is not a household meal.
     A named-subset meal shows in the plan of each person named and in Household, not in the plan of someone who is not named (Proposal, 210). Mine means Sam (the signed-in sample person). */
  function inPart(m, id) { return !m.part || m.part.indexOf(id) > -1; }
  function inMine(m) { return m.who === 'all' ? inPart(m, 'sam') : m.who.indexOf('sam') > -1; }
  /* Plan UI review 201 (owner-stated, 13 Oct 2026: "Household"): the person filter option that was "Everyone" is "Household". Its id is 'household' on the phone; 'everyone' is the old id and still means the same (desktop keeps it, and old links work). */
  function isHH(v) { return v === 'household' || v === 'everyone'; }
  function match(m, f) { if (isHH(f)) return true; if (f === 'mine') return inMine(m); return m.who === 'all' ? inPart(m, f) : m.who.indexOf(f) > -1; }
  function pname(i) { return people.filter(function (p) { return p.id === i; })[0].n; }
  /* 209 (Proposal): the audience line of a household meal. Everyone: "Household". Named subset: the names in order, three at most ("Sam, Jane, Priya"), more than three: the first two and "+N" ("Sam, Jane +2"), so it stays one line at 360 wide. The line never carries the servings count (the stepper in the detail does). The desktop call (hh false) keeps its old line. */
  function whoLabel(m, hh) {
    if (m.who === 'all') { if (!hh) return 'Everyone · ' + m.n + ' people'; if (!m.part) return 'Household'; var nm = m.part.map(pname); return nm.length > 3 ? nm.slice(0, 2).join(', ') + ' +' + (nm.length - 2) : nm.join(', '); }
    return m.who.map(pname).join(', ') + ' · ' + m.n + ' ' + (m.n === 1 ? 'person' : 'people');
  }
  function whoFull(m) { return m.who === 'all' && m.part ? 'for ' + m.part.map(pname).join(', ').replace(/, ([^,]*)$/, ' and $1') + ', ' + m.part.length + ' of the household' : ''; }
  /* The phone's copy of the sample meals: the same list plus the participants overlay (208), so the desktop file, which reads P.meals, is not changed: Salmon patties is for Sam, Jane and Priya; Veggie dumplings (Fri 16) is for Jane, Priya and Kit, so it is in Household but not in Mine. */
  function phoneMeals() {
    var o = JSON.parse(JSON.stringify(meals));
    o.forEach(function (m) { if (m.id === 'thu-salmon') { m.part = ['sam', 'jane', 'priya']; m.n = 3; } });
    /* Replan cleanup sample (owner-stated direction, 14 Oct 2026): lemon is on the shopping list for BOTH Thursday meals (2 for Salmon patties, 1 for Tuna salad: one line of 3), and curry roux is on it for Wednesday's curry alone (a single-use line).
       Chicken thighs were bought on Friday for the curry: see phoneBought. Replan takes only the removed meal's own amount off its lines. */
    o.forEach(function (m) { if (m.id === 'thu-salmon' || m.id === 'thu-tuna') { m.miss = m.miss.map(function (x) { return x[0] === 'lemon' ? [x[0], x[1], 1] : x; }); m.list = m.miss.filter(function (x) { return x[2]; }).length; } });
    o.push({ id: 'fri-dump', mins: 30, day: 'd16', em: '🥟', t: 'Veggie dumplings', who: 'all', part: ['jane', 'priya', 'kit'], n: 3, src: 'saved', miss: [['wonton wrappers', '1 pack']], have: [['cabbage', '1/2'], ['spring onion', '1 bunch']], useby: [], list: 0, held: 0, note: '' });
    return o;
  }
  /* Bought items are in Pantry, off the list, and never touched by a replan (owner, 14 Oct 2026). 'for' names the meals the item was bought for. extras: lines added by hand, with no meal behind them. */
  function phoneBought() { return { 'chicken thighs': { day: 'Fri 9 Oct', q: '600 g', 'for': ['wed-curry'] } }; }
  function phoneExtras() { return [{ name: 'milk', q: '2 L' }]; }
  /* Surprise me = the Home engine (decision 292): FILTER (already on the plan from today on in that week; cooked 2 days ago or less), then SCORE (readiness: all in +3, needs 1 +1, needs 2 +0.01, 3 or more -2; use-by within 3 days +3 at 1 day or less else +2;
     last cooked a month +2, 2 weeks +1, 4 days or less -2; star +1; weeknight minutes 30 or less +1, over 60 -2). Only a score above 0 is offered; the pick is the top one. Returns a copy of the meal with why (Home's one line), or null. */
  /* The two layers (decision 292): the person sees one plain sentence (c.why); the technical line (c.prov: reasons and signal names) belongs to the server response and is never drawn. At most two reasons, joined naturally. */
  function human(w) {
    var p = w.filter(function (x) { return x.pts > 0.5 && x.h; }).sort(function (a, b) { return (b.pts + (b.k === 'ready' ? -0.1 : 0)) - (a.pts + (a.k === 'ready' ? -0.1 : 0)); }).slice(0, 2);
    return p.length ? p[0].h + (p[1] ? ', and ' + second(p[1]) : '') + '.' : '';
  }
  function second(x) {
    var l = x.h.charAt(0).toLowerCase() + x.h.slice(1);
    return x.k === 'ready' ? (x.pts >= 3 ? l : 'there is ' + l) : x.k === 'fav' || x.k === 'time' ? 'it is ' + l : x.k === 'rot' ? 'it has ' + l.replace('not cooked', 'not been cooked') : 'it ' + l;
  }
  /* why is pinned to the meal as dropped in: a hand change (moved, people, servings) changes the key and the chip goes */
  function whyKey(m) { return [m.day, m.t, m.n, JSON.stringify(m.who)].join('|'); }
  function surprise(meals, d, today) {
    var r = dinfo(d), wkn = ['Sat', 'Sun'].indexOf(r.dow) < 0, di = function (x) { return RIB.map(function (q) { return q.id; }).indexOf(x); };
    var planned = meals.filter(function (x) { return dinfo(x.day).wk === r.wk && di(x.day) >= di(today); }).map(function (x) { return x.t; }), out = [];
    SUR.forEach(function (x) {
      if (planned.indexOf(x.t) > -1 || (x.last != null && x.last <= 2)) return;
      var n = x.miss.length, w = [], add = function (k, pts, t, h) { w.push({ k: k, pts: pts, t: t, h: h || '' }); };
      if (n === 0) add('ready', 3, 'Everything is in', 'You have everything for it'); else if (n === 1) add('ready', 1, 'Needs 1 thing', 'Only one thing to buy'); else if (n === 2) add('ready', 0.01, 'Needs 2 things'); else add('ready', -2, 'Needs ' + n + ' things');
      if (x.ubd != null && x.ubd <= 3) add('useup', x.ubd <= 1 ? 3 : 2, 'Uses what is due before it goes', 'Uses up your ' + x.ubn + ' before it goes off');
      if (x.last != null) { if (x.last >= 30) add('rot', 2, 'Not had for a month', 'Not cooked in a while'); else if (x.last >= 14) add('rot', 1, 'Not had for ' + Math.round(x.last / 7) + ' weeks', 'Not cooked in a while'); else if (x.last <= 4) add('rot', -2, 'Had ' + x.last + ' days ago'); }
      if (x.star) add('fav', 1, 'A household favourite', 'A favourite');
      if (wkn && x.mins <= 30) add('time', 1, x.mins + ' minutes', 'A quick one for a weeknight'); if (wkn && x.mins > 60) add('time', -2, x.mins + ' minutes, long for a weeknight');
      var sc = w.reduce(function (a, y) { return a + y.pts; }, 0), pos = w.filter(function (y) { return y.pts > 0.5 && y.k !== 'ready'; }).sort(function (a, b) { return b.pts - a.pts; }), rd = w[0],
        a1 = pos[0] ? pos[0].t : rd.t, b1 = n > 0 ? rd.t : pos[0] ? 'all in' : pos[1] ? pos[1].t.toLowerCase() : '';
      out.push({ x: x, sc: sc, n: n, last: x.last == null ? 99 : x.last, line: a1 + (b1 && b1 !== a1 ? ' \u00b7 ' + b1 : ''), hum: human(w) });
    });
    out.sort(function (a, b) { return b.sc - a.sc || a.n - b.n || b.last - a.last; });
    var top = out.filter(function (o) { return o.sc > 0; })[0];
    if (!top) return null;
    var c = JSON.parse(JSON.stringify(top.x)); c.why = top.hum; c.prov = top.line; return c;
  }
  /* Copy last week (owner-stated, decision 99): fills open nights only, never overwrites, acts on the active pill; another member's plan is read only. */
  function copyLast(meals, blocked, view, wk, today) {
    var ids = RIB.map(function (r) { return r.id; }), di = function (x) { return ids.indexOf(x); };
    var src = RIB.filter(function (r) { return r.wk === wk - 1; }), tgt = RIB.filter(function (r) { return r.wk === wk; }), add = [], days = [], n = 0;
    if (view !== 'mine' && !isHH(view)) return { add: add, days: days, why: 'readonly' };
    if (wk < 0 || !src.length) return { add: add, days: days, why: 'bounds' };
    src.forEach(function (r, i) {
      var t = tgt[i].id; if (di(t) < di(today) || blocked[t] || meals.some(function (x) { return x.day === t && match(x, view); })) return;
      var ms = meals.filter(function (x) { return x.day === r.id && match(x, view); }); if (!ms.length) return;
      ms.forEach(function (x) { var c = JSON.parse(JSON.stringify(x)); c.id = 'cp-' + (++n) + '-' + t; c.day = t; c.note = 'Copied from ' + dinfo(r.id).dow + ' ' + dinfo(r.id).n + ' ' + dinfo(r.id).mo; c.held = 0; c.list = 0; c.miss = c.miss.map(function (i) { return [i[0], i[1]]; }); delete c.left; delete c.makes; delete c.usual; add.push(c); }); days.push(t);
    });
    return { add: add, days: days, why: add.length ? '' : 'none' };
  }
  /* Clear week (owner-stated, decision 109): same scope rule as Copy last week. It acts on the active pill's own plan for the selected week; another member's plan is read only; past nights and past weeks are read only,
     so it clears from today on. Meals only by default; mode 'all' (open question) also removes this-week-only Not cooking marks. A usual day off is a rule, not a week entry, so it always stays. */
  function clearWeek(meals, blocked, view, wk, today, mode) {
    var ids = RIB.map(function (r) { return r.id; }), di = function (x) { return ids.indexOf(x); }, out = { rm: [], days: [], nc: [], shared: 0, kept: [], why: '' };
    if (view !== 'mine' && view !== 'everyone') { out.why = 'readonly'; return out; }
    if (wk < 0) { out.why = 'bounds'; return out; }
    RIB.filter(function (r) { return r.wk === wk; }).forEach(function (r) {
      if (di(r.id) < di(today)) { if (meals.some(function (x) { return x.day === r.id && match(x, view); })) out.kept.push(r.id); return; }
      var ms = meals.filter(function (x) { return x.day === r.id && match(x, view); });
      ms.forEach(function (x) { out.rm.push(x.id); if (x.who === 'all' && view === 'mine') out.shared++; });
      var nc = mode === 'all' && blocked[r.id] === 'once'; if (nc) out.nc.push(r.id);
      if (ms.length || nc) out.days.push(r.id);
    });
    if (!out.rm.length && !out.nc.length) out.why = 'none';
    return out;
  }
  /* Two layers (Plan UI review 195, owner-stated 13 Oct 2026; the model is a Proposal). ROUTINE is the person's usual days off, set in Plan settings (UAT: Settings, "Usual days", the stencil; Kitchie plan_block_day usual: true): each week starts with these blocked.
     A one-week override sits on top: a one-off Not cooking mark on any other day, or a routine day opened for this week ("Usual day off, cooking this week" in UAT). Nothing is stored for the override: it is whatever differs from the routine default, so
     blocked[d] is the effective state ('usual' = Not cooking every week, 'once' = Not cooking this week only, none = open or cooking), and the routine default of a day is 'usual' on a routine weekday from today on, none otherwise.
     Sample: Fri and Sun are the usual days off; Fri 16, Sun 18 and Fri 23 are opened for their week (Fri 16 has the leftovers meal), Sun 25 and every Fri and Sun after it are Not cooking, every week. */
  var ROUTINE = { off: ['Fri', 'Sun'], opened: ['d16', 'd18', 'd23'] };
  function routineDefault(d, today) { var r = dinfo(d); return r && r.i >= dinfo(today).i && ROUTINE.off.indexOf(r.dow) > -1 ? 'usual' : null; }
  function baseBlocked(today) { var o = JSON.parse(JSON.stringify(blocked)); RIB.forEach(function (r) { if (!o[r.id] && ROUTINE.opened.indexOf(r.id) < 0 && routineDefault(r.id, today)) o[r.id] = 'usual'; }); return o; }
  /* Clear week acts on the CURRENT FILTER SCOPE (Plan UI review 203, owner-stated 13 Oct 2026: "depending on what is chosen - mine or household. Can't clear the past"). Two layers as before (195): the planned meals, and this week's overrides of the routine; the routine itself is never touched.
     Mine clears my own planned meals and the overrides I made; Household clears the household's planned meals and the overrides the household made. Past days are never cleared (read only): in the current week only today and later days. Another person's plan has no Clear (190).
     Proposal (narrow choice): a shared household meal (who: 'all') shows in Mine but is the household's, so Mine's Clear leaves it and Household's Clear removes it; a meal that is only in someone's own plan (who: a list of ids) is theirs, so Household's Clear leaves it. The two scopes never overlap.
     Overrides carry the scope that made them (owners[d] = 'mine' | 'household'; the routine itself is the person's own, set in Plan settings). Returns what changed so the message and Undo can say it. mode 'visible' (?cs=visible, the other reading) clears every meal the scope shows, shared ones included. */
  var OWNERS = { d16: 'mine', d17: 'household', d18: 'mine', d22: 'mine', d23: 'mine' };
  function baseOwners() { return JSON.parse(JSON.stringify(OWNERS)); }
  function scopeOf(view) { return view === 'mine' ? 'mine' : 'household'; }
  function ownsMeal(x, view) { return view === 'mine' ? (x.who !== 'all' && x.who.indexOf('sam') > -1) : x.who === 'all'; }
  function clearWeek2(meals, blocked, view, wk, today, owners, mode) {
    var sc = scopeOf(view), out = { rm: [], days: [], nc: [], back: [], keep: 0, keepNc: 0, kept: [], scope: sc, why: '' };
    if (view !== 'mine' && !isHH(view)) { out.why = 'readonly'; return out; }
    if (wk < 0) { out.why = 'bounds'; return out; }
    owners = owners || {};
    RIB.filter(function (r) { return r.wk === wk; }).forEach(function (r) {
      var ms = meals.filter(function (x) { return x.day === r.id && match(x, view); });
      if (r.i < dinfo(today).i) { if (ms.length) out.kept.push(r.id); return; }
      var own = ms.filter(function (x) { return mode === 'visible' || ownsMeal(x, view); }), left = ms.length - own.length; out.keep += left;
      own.forEach(function (x) { out.rm.push(x.id); });
      var want = routineDefault(r.id, today), cur = blocked[r.id] || null, ch = cur !== want, mine = (owners[r.id] || 'household') === sc;
      if (ch && !mine) out.keepNc++;
      if (ch && mine && !(want && left)) (want ? out.back : out.nc).push(r.id); else ch = false;
      if (own.length || ch) out.days.push(r.id);
    });
    if (!out.days.length) out.why = 'none';
    return out;
  }
  /* a long ingredient list for the dock demo (?long=1): a real cook sheet can have 20 lines */
  var LONG = [['garlic', '4 cloves'], ['ginger', '1 thumb'], ['cumin', '2 tsp'], ['coriander', '2 tsp'], ['turmeric', '1 tsp'], ['chilli flakes', '1 tsp'], ['stock cube', '2'], ['coconut milk', '1 tin'], ['apple', '1'], ['honey', '1 tbsp'], ['soy sauce', '2 tbsp'], ['peas', '1 cup'], ['sultanas', '1 handful'], ['spring onion', '1 bunch'], ['vegetable oil', '3 tbsp'], ['salt', 'to taste']];
  return { mins: mins, clearWeek: clearWeek, clearWeek2: clearWeek2, baseOwners: baseOwners, scopeOf: scopeOf, isHH: isHH, routineDefault: routineDefault, baseBlocked: baseBlocked, ROUTINE: ROUTINE, useRange: useRange, LONG: LONG, surprise: surprise, whyKey: whyKey, copyLast: copyLast, icons: icons, people: people, DOW: DOW, RIB: RIB, DAYS: DAYS, REL: REL, did: did, dinfo: dinfo, meals: meals, phoneMeals: phoneMeals, phoneBought: phoneBought, phoneExtras: phoneExtras, whoFull: whoFull, blocked: blocked, tips: tips, SUR: SUR, match: match, inMine: inMine, whoLabel: whoLabel };
})();
