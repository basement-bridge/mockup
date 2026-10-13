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
  /* Surprise me (decision 94, owner-confirmed heuristics): candidates by kind. 'new' may need shopping (room to shop) and may use the shopping list; 'stock' is on hand. */
  var SUR = [
    { id: 's1', mins: 35, kind: 'new', em: '🍋', t: 'Lemon chicken orzo', miss: [['orzo', '500 g']], have: [['chicken thighs', '600 g'], ['lemon', '2 (on your list)']], useby: [], list: 1, why: 'New to the plan, and the lemons are already on your shopping list.' },
    { id: 's2', mins: 20, kind: 'new', em: '🌿', t: 'Thai basil stir-fry', miss: [['Thai basil', '1 bunch']], have: [['noodles', '1 pack'], ['veg bag', '1 bag']], useby: [], list: 0, why: 'Something you have not had lately; one item to buy.' },
    { id: 's3', mins: 40, kind: 'stock', em: '🥚', t: 'Potato and egg frittata', miss: [], have: [['eggs', '8'], ['potatoes', '4'], ['onion', '2']], useby: [], list: 0, why: 'Late in the week, so it uses what is already in the house.' },
    { id: 's4', mins: 45, kind: 'stock', em: '🍲', t: 'Pantry minestrone', miss: [], have: [['tinned tomatoes', '2 tins'], ['pasta', '200 g'], ['carrots', '3']], useby: [], list: 0, why: 'Late in the week, all on hand.' }
  ];
  /* Total time (Plan UI review 124): ONE figure per meal, minutes; never a prep and cook split. */
  function mins(m) { var n = m.mins; if (!n) return ''; return n < 60 ? n + ' min' : Math.floor(n / 60) + ' h' + (n % 60 ? ' ' + (n % 60) + ' min' : ''); }
  function inMine(m) { return m.who === 'all' || m.who.indexOf('sam') > -1; }
  function match(m, f) { if (f === 'everyone') return true; if (f === 'mine') return inMine(m); return m.who === 'all' || m.who.indexOf(f) > -1; }
  function whoLabel(m) { return m.who === 'all' ? 'Everyone · ' + m.n + ' people' : m.who.map(function (i) { return people.filter(function (p) { return p.id === i; })[0].n; }).join(', ') + ' · ' + m.n + ' ' + (m.n === 1 ? 'person' : 'people'); }
  /* Surprise me (owner-confirmed heuristics, decision 94): timing aware, never a repeat of a recent meal. Returns a copy of a candidate. */
  function surprise(meals, d, today) {
    var di = function (x) { return RIB.map(function (r) { return r.id; }).indexOf(x); }, r = dinfo(d), du = di(d) - di(today), late = r.wk === 0 && r.i % 7 >= 4, kind = (du <= 1 || late) ? 'stock' : 'new';
    var recent = meals.filter(function (x) { return Math.abs(di(x.day) - di(d)) <= 7; }).map(function (x) { return x.t; });
    var c = SUR.filter(function (x) { return x.kind === kind && recent.indexOf(x.t) < 0; })[0] || SUR.filter(function (x) { return recent.indexOf(x.t) < 0; })[0];
    return c ? JSON.parse(JSON.stringify(c)) : null;
  }
  /* Copy last week (owner-stated, decision 99): fills open nights only, never overwrites, acts on the active pill; another member's plan is read only. */
  function copyLast(meals, blocked, view, wk, today) {
    var ids = RIB.map(function (r) { return r.id; }), di = function (x) { return ids.indexOf(x); };
    var src = RIB.filter(function (r) { return r.wk === wk - 1; }), tgt = RIB.filter(function (r) { return r.wk === wk; }), add = [], days = [], n = 0;
    if (view !== 'mine' && view !== 'everyone') return { add: add, days: days, why: 'readonly' };
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
  /* Clear week, two layers (decision 195): from today on, in the selected week and the active person's plan, it removes the planned meals AND this week's overrides of the routine: a one-off Not cooking mark goes (nc), a routine day that was opened goes
     back to Not cooking every week (back). It never touches the routine itself. Past nights are read only. Returns what changed so the message and Undo can say it. */
  function clearWeek2(meals, blocked, view, wk, today) {
    var out = { rm: [], days: [], nc: [], back: [], shared: 0, kept: [], why: '' };
    if (view !== 'mine' && view !== 'everyone') { out.why = 'readonly'; return out; }
    if (wk < 0) { out.why = 'bounds'; return out; }
    RIB.filter(function (r) { return r.wk === wk; }).forEach(function (r) {
      var ms = meals.filter(function (x) { return x.day === r.id && match(x, view); });
      if (r.i < dinfo(today).i) { if (ms.length) out.kept.push(r.id); return; }
      ms.forEach(function (x) { out.rm.push(x.id); if (x.who === 'all' && view === 'mine') out.shared++; });
      var want = routineDefault(r.id, today), cur = blocked[r.id] || null, ch = cur !== want; if (ch) (want ? out.back : out.nc).push(r.id);
      if (ms.length || ch) out.days.push(r.id);
    });
    if (!out.days.length) out.why = 'none';
    return out;
  }
  /* a long ingredient list for the dock demo (?long=1): a real cook sheet can have 20 lines */
  var LONG = [['garlic', '4 cloves'], ['ginger', '1 thumb'], ['cumin', '2 tsp'], ['coriander', '2 tsp'], ['turmeric', '1 tsp'], ['chilli flakes', '1 tsp'], ['stock cube', '2'], ['coconut milk', '1 tin'], ['apple', '1'], ['honey', '1 tbsp'], ['soy sauce', '2 tbsp'], ['peas', '1 cup'], ['sultanas', '1 handful'], ['spring onion', '1 bunch'], ['vegetable oil', '3 tbsp'], ['salt', 'to taste']];
  return { mins: mins, clearWeek: clearWeek, clearWeek2: clearWeek2, routineDefault: routineDefault, baseBlocked: baseBlocked, ROUTINE: ROUTINE, useRange: useRange, LONG: LONG, surprise: surprise, copyLast: copyLast, icons: icons, people: people, DOW: DOW, RIB: RIB, DAYS: DAYS, REL: REL, did: did, dinfo: dinfo, meals: meals, blocked: blocked, tips: tips, SUR: SUR, match: match, inMine: inMine, whoLabel: whoLabel };
})();
