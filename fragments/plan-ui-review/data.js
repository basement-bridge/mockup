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
    check: I('<path d="M5 12l5 5 9-10"/>'),
    spark: I('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>'),
    copy: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
    cog: I('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
    moon: I('<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>'),
    swap: I('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
    people: I('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5a3 3 0 0 1 0 6M18 14c2 .7 3 2.8 3 6"/>'),
    leaf: I('<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>')
  };
  var people = [
    { id: 'sam', n: 'Sam', me: 1 }, { id: 'jane', n: 'Jane' }, { id: 'kit', n: 'Kit' }, { id: 'arlo', n: 'Arlo' },
    { id: 'priya', n: 'Priya' }, { id: 'tom', n: 'Tom' }, { id: 'lee', n: 'Lee' }
  ];
  var DAYS = [['mon', 'Mon', 12], ['tue', 'Tue', 13], ['wed', 'Wed', 14], ['thu', 'Thu', 15], ['fri', 'Fri', 16], ['sat', 'Sat', 17], ['sun', 'Sun', 18]];
  /* who: 'all' or list of ids. miss: missing items. have: on hand. useby: items with a use-by. list: on the shopping list. held: ingredient held. */
  var meals = [
    { id: 'mon-shak', day: 'mon', em: '🍳', t: 'Shakshuka', who: 'all', n: 4, src: 'saved', miss: [['feta', '200 g']], have: [['eggs', '8'], ['tinned tomatoes', '2 tins'], ['onion', '2']], useby: [], list: 1, held: 1, note: 'Quick night: 25 min' },
    { id: 'tue-pasta', day: 'tue', em: '🍝', t: 'Mushroom pasta', who: 'all', n: 4, src: 'saved', miss: [], have: [['pasta', '500 g'], ['mushrooms', '400 g'], ['cream', '1 tub']], useby: [['mushrooms', 'Wed 14']], list: 0, held: 0, note: 'Uses the mushrooms before they turn' },
    { id: 'wed-curry', day: 'wed', em: '🍛', t: 'Japanese golden curry', who: 'all', n: 4, src: 'made', miss: [['curry roux', '1 block'], ['jasmine rice', '2 cups']], have: [['chicken thighs', '600 g'], ['veg bag', '1 bag'], ['onion', '2'], ['potatoes', '4'], ['carrots', '3']], useby: [['chicken thighs', 'Tue 13']], list: 1, held: 0, note: 'Cooks double: Friday leftovers' , makes: 'fri-left'},
    { id: 'thu-salmon', day: 'thu', em: '🐟', t: 'Salmon patties', who: 'all', n: 4, src: 'saved', miss: [['dill', '1 bunch'], ['lemon', '2']], have: [['salmon', '2 tins'], ['eggs', '2'], ['breadcrumbs', '1 cup']], useby: [['salmon', 'Thu 15']], list: 0, held: 0, note: '' },
    { id: 'thu-tuna', day: 'thu', em: '🥗', t: 'Tuna salad', who: ['sam'], n: 1, src: 'saved', miss: [['lemon', '1']], have: [['tuna', '1 tin'], ['lettuce', '1']], useby: [], list: 0, held: 0, note: '' },
    { id: 'fri-left', day: 'fri', em: '♻️', t: 'Leftover chicken curry', who: ['sam'], n: 1, src: 'saved', miss: [], have: [['curry, from Wednesday', '1 serve']], useby: [], list: 0, held: 0, note: 'Reheat; no shopping', left: 'Wed 14', usual: 1 }
  ];
  var blocked = { sat: 'once' };
  var tips = { wed: 'Wednesday is the big cook: leftovers for Friday' };
  function inMine(m) { return m.who === 'all' || m.who.indexOf('sam') > -1; }
  function match(m, f) { if (f === 'everyone') return true; if (f === 'mine') return inMine(m); return m.who === 'all' || m.who.indexOf(f) > -1; }
  function whoLabel(m) { return m.who === 'all' ? 'Everyone · ' + m.n + ' people' : m.who.map(function (i) { return people.filter(function (p) { return p.id === i; })[0].n; }).join(', ') + ' · ' + m.n + ' ' + (m.n === 1 ? 'person' : 'people'); }
  return { icons: icons, people: people, DAYS: DAYS, meals: meals, blocked: blocked, tips: tips, match: match, inMine: inMine, whoLabel: whoLabel };
})();
