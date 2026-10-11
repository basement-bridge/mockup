"use strict";
/* Our kitchen: clickable prototype. Static, no build, no backend. Everything is fake data in the browser.
   The pantry mirrors Kitchie's finished list (sort, area tabs, collapsible areas, use one, used up). */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ico = (d, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  search: ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  pencil: ico('<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/>', 16),
  plus: ico('<path d="M12 5v14M5 12h14"/>'),
  minus: ico('<path d="M6 12h12"/>'),
  x: ico('<path d="M6 6l12 12M18 6L6 18"/>'),
  tick: ico('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  chev: ico('<path d="M9 6l6 6-6 6"/>'),
  down: ico('<path d="M6 9l6 6 6-6"/>'),
  alert: (s) => ico('<circle cx="12" cy="12" r="9"/><path d="M12 7.500v5M12 16v.5"/>', s),
  cart: ico('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2"/>'),
  list: ico('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
  up: (s) => ico('<path d="M12 20V5M5.5 11.5L12 5l6.5 6.5"/>', s).replace('stroke-width="1.8"', 'stroke-width="3"'),
};
/* a small, lightweight saucepan that peeks out to say hello */
const POT = `<svg width="74" height="74" viewBox="0 0 74 74" aria-hidden="true"><path d="M26 18c-3-4 3-7 0-12M37 18c-3-4 3-7 0-12M48 18c-3-4 3-7 0-12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".55"/><ellipse cx="37" cy="26" rx="22" ry="5" fill="var(--accent)"/><rect x="15" y="26" width="44" height="30" rx="9" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.4"/><circle cx="29" cy="39" r="2.6" fill="currentColor"/><circle cx="45" cy="39" r="2.6" fill="currentColor"/><path d="M30 47c3 4 11 4 14 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M59 34h9M15 34H6" stroke="var(--accent)" stroke-width="3.2" stroke-linecap="round"/></svg>`;

const PEOPLE = { arjan: { name: "Arjan", initial: "A" }, sam: { name: "Sam", initial: "S" } };

const RI = {
  chef: '<path d="M7 14a4 4 0 0 1-1-7.7 4.5 4.5 0 0 1 8.6-1.3 4 4 0 0 1 3.4 5.5A4 4 0 0 1 17 14v5H7z"/><path d="M7 17h10"/>',
  pot: '<path d="M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M3 11h18M15 3l-3 8"/>',
  basket: '<path d="M4 9h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z"/><path d="M8 9l3-5M16 9l-3-5"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  cap: '<path d="M4 15h16M6 15c0-5 2.5-8 6-8s6 3 6 8"/><path d="M5 15c0 2 3 3 7 3s7-1 7-3"/><circle cx="12" cy="11" r="1.2"/>',
  stack: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>',
  onion: '<path d="M12 3c1 3 6 5 6 10a6 6 0 0 1-12 0c0-5 5-7 6-10z"/><path d="M9.5 9c-1 3-1 6 .5 9M14.5 9c1 3 1 6-.5 9"/>',
  knife: '<path d="M4 20L16 8c2-2 4-3 4-3s-1 3-3 5L9 18z"/><path d="M4 20l3-3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9.5 10.5h5V16h-5zM10 8.5h4"/>',
  fridge: '<rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M6 10h12M9 6v2M9 13v3"/>',
  battery: '<rect x="2.5" y="7" width="16" height="10" rx="2.8"/><path d="M21 10.5v3"/><path d="M6 10.5v3M9.5 10.5v3"/>',
  drop: '<path d="M12 3c3.5 4.5 6 7.2 6 10.2a6 6 0 0 1-12 0C6 10.200 8.500 7.500 12 3z"/><path d="M9.500 14a2.500 2.500 0 0 0 2 2.300"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.500"/><path d="M3 7l9 6 9-6"/>',
  spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
  flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-6 1-9z"/>',
  fox: '<path d="M4 4l5 4h6l5-4v8c0 5-3.5 8-8 8s-8-3-8-8z"/><path d="M11 16h2"/><circle cx="9" cy="12" r=".6"/><circle cx="15" cy="12" r=".6"/>',
  octopus: '<path d="M5 12a7 7 0 0 1 14 0v3"/><path d="M5 12v3c0 2-1 3-2 3M9 15v4M12 15v5M15 15v4M19 15c0 2 1 3 2 3"/><circle cx="9.5" cy="11" r=".6"/><circle cx="14.5" cy="11" r=".6"/>',
  owl: '<path d="M6 4l3 2h6l3-2v10a6 6 0 0 1-12 0z"/><circle cx="9.500" cy="10" r="2"/><circle cx="14.500" cy="10" r="2"/><path d="M12 12.500l-1 2h2z"/>',
  shark: '<path d="M3 19h18M6 19c1-8 5-12 9-14-1 4 0 9 3 14"/><path d="M8 14c2 1 4 1 6 0"/>',
  hedgehog: '<path d="M3 17c0-7 4-11 10-11s8 5 8 11z"/><path d="M6 11l-1-3M10 8l-.5-3M14 8l.5-3M18 11l1-3"/><circle cx="17" cy="14" r=".6"/>',
  penguin: '<path d="M12 3c-3 0-4 3-4 6 0 4-2 6-2 9 0 2 2 3 6 3s6-1 6-3c0-3-2-5-2-9 0-3-1-6-4-6z"/><path d="M10 9.500h4l-2 2z"/><circle cx="10.500" cy="7" r=".6"/><circle cx="13.500" cy="7" r=".6"/>',
  frog: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M4 12c0 5 3.500 8 8 8s8-3 8-8c0-1-1-2-2-2H6c-1 0-2 1-2 2z"/><path d="M9 15c2 1.500 4 1.500 6 0"/>',
  duck: '<path d="M7 9a4 4 0 0 1 8 0v1h5l-2 2v1c0 4-3 7-7 7s-7-3-7-7c0-2 1-4 3-4z"/><circle cx="10.500" cy="8.500" r=".6"/>',
  bee: '<ellipse cx="12" cy="14" rx="6" ry="5"/><path d="M6.500 12h11M6.500 16h11M9 9c-2-3-2-5-1-5M15 9c2-3 2-5 1-5"/>',
  snail: '<path d="M3 19h16c2 0 3-1 3-3M14 19a6 6 0 1 0-6-6"/><circle cx="14" cy="13" r="2"/><path d="M4 19c0-2 1-4 3-5M5 14l-1-3M8 13l.5-3"/>',
  turtle: '<path d="M4 15a8 7 0 0 1 16 0z"/><path d="M8 15v-4M12 15V9M16 15v-4M4 15l-2 2M20 15l2 2M10 18v2M14 18v2"/>',
  bear: '<circle cx="7" cy="6" r="2.200"/><circle cx="17" cy="6" r="2.200"/><circle cx="12" cy="13" r="8"/><circle cx="9.500" cy="11.500" r=".6"/><circle cx="14.500" cy="11.500" r=".6"/><path d="M11 15h2"/>',
  pig: '<path d="M5 8l3 1.500M19 8l-3 1.500"/><circle cx="12" cy="13" r="8"/><ellipse cx="12" cy="14.500" rx="3" ry="2.200"/><circle cx="9" cy="10.500" r=".6"/><circle cx="15" cy="10.500" r=".6"/>',
  hen: '<path d="M13 3c1 0 2 1 2 2.500-1 0-1 1 0 1.500l-2 2c3 0 6 2 6 6 0 3-3 5-7 5s-7-2-7-5c0-2 1-3 3-4z"/><circle cx="14" cy="6" r=".5"/>',
  cat: '<path d="M5 4l4 3h6l4-3v9c0 4-3 7-7 7s-7-3-7-7z"/><circle cx="9.500" cy="12" r=".6"/><circle cx="14.500" cy="12" r=".6"/><path d="M11 15l1 1 1-1M2 14l4 1M22 14l-4 1"/>',
  whale: '<path d="M3 13c0 4 4 7 9 7s9-3 9-7c0-2-1-3-3-3h-3c0-2-1-4-3-5 0 2-1 3-3 3-3 0-6 2-6 5z"/><path d="M18 8c1-1 2-1 3-1"/>',
  people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19c0-3.500 2.700-6 6-6s6 2.500 6 6M15.500 14c3 0 5.500 2 5.500 5"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2.500"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  home: '<path d="M4 11l8-7 8 7v8.500a1.500 1.500 0 0 1-1.500 1.500h-3.500v-6h-6v6H5.500A1.500 1.500 0 0 1 4 19.500z"/>',
  jar: '<rect x="6" y="4" width="12" height="3.500" rx="1.500"/><path d="M7 7.500h10a2 2 0 0 1 2 2V18a2.500 2.500 0 0 1-2.500 2.500h-9A2.500 2.500 0 0 1 5 18V9.500a2 2 0 0 1 2-2z"/><circle cx="12" cy="14" r="2.200"/>',
  cart: '<circle cx="9" cy="20" r="1.500"/><circle cx="18" cy="20" r="1.500"/><path d="M3 4h2.500l2.200 10.200a1 1 0 0 0 1 .8h8.800a1 1 0 0 0 1-.8L20 8H6.200"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.500V12l3 2"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/>',
  yy: '<circle cx="12" cy="12" r="9"/><path d="M12 3a4.500 4.500 0 0 1 0 9 4.500 4.500 0 0 0 0 9"/><circle cx="12" cy="7.500" r="1.100" fill="currentColor" stroke="none"/><circle cx="12" cy="16.500" r="1.100" stroke-width="1.200"/>',
  funnel: '<path d="M4 5h16l-6 7.500V19l-4-2v-4.500z"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
};
const ICON_LIB = Object.keys(RI).filter((k) => !["cap", "tag", "lock", "people", "home", "jar", "cart", "clock", "yy", "funnel", "mic"].includes(k)); /* 30 light monoline icons */
const NAMES = ["Arjan", "Priya", "Tom", "Mei"];
const riSvg = (k, s = 26) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${RI[k] || RI.spark}</svg>`;
const roleIc = (r, size = 44) => r ? `<span class="ric" style="width:${size}px;height:${size}px">${riSvg(r.ic, Math.round(size * .55))}</span>` : "";

const ROLE_PRESETS = [
  { title: "Head Chef", ic: "chef", desc: "Decides what's for dinner. Overrules everyone, mostly with garlic." },
  { title: "Supply Runner", ic: "basket", desc: "Knows every aisle. Comes back with the wrong brand, but with love." },
  { title: "Full Stack Cook", ic: "stack", desc: "Front of house, back of house, and the washing up." },
  { title: "Knife Hand", ic: "knife", desc: "Quick, tidy, and slightly terrifying near a courgette." },
  { title: "Pantry Marshal", ic: "shield", desc: "Keeps order on the shelves and the fridge. Knows exactly where the cumin lives." },
  { title: "Sink General", ic: "drop", desc: "Commands the washing up. Has never lost a sponge in battle." },
];

const RECIPES = [
  { id: "saag", emoji: "🥬", name: "Saag paneer", time: 35, ings: [["spinach", "Spinach", "250 g"], ["paneer", "Paneer", "200 g"], ["onion", "Onion", "2"], ["garam", "Garam masala", "2 tsp"], ["cream", "Cream", "100 ml"]] },
  { id: "rice", emoji: "🍚", name: "Egg fried rice", time: 20, ings: [["eggs", "Eggs", "3"], ["rice", "Basmati rice", "300 g"], ["onion", "Onion", "1"]] },
  { new: true, id: "omelette", emoji: "🍳", name: "Spinach omelette", time: 10, ings: [["spinach", "Spinach", "100 g"], ["eggs", "Eggs", "3"]] },
  { new: true, id: "toastie", emoji: "🥪", name: "Cheese and onion toastie", time: 8, ings: [["cheese", "Cheese", "80 g"], ["onion", "Onion", "1"], ["bread", "Bread", "4 slices"]] },
];

const AREAS = ["Fridge", "Pantry", "Freezer"];
const COUNT_UNITS = ["", "pack", "tin", "jar", "bottle", "bag", "box", "carton", "bunch", "roll"];
const STEP = { g: 50, mL: 50, kg: 0.5, L: 0.5 };
const CATEGORIES = ["Dairy and eggs", "Vegetables", "Fruits", "Meat", "Dry goods", "Cans", "Seasoning", "Snacks", "Frozen", "Other"];
const SORTS = [["name", "Name A to Z"], ["area", "Area"], ["spot", "Spot"], ["amount", "Amount"], ["useby", "Use by"], ["updated", "Updated"]];

/* n and unit are stored separately so "use one" and the stepper can work on counts */
const freshPantry = () => [
  { id: "butter", key: "butter", emoji: "🧈", name: "Butter", n: 250, unit: "g", area: "Fridge", spot: "Door", cat: "Dairy and eggs", days: null, upd: 1, recent: false, by: "Arjan", min: 0, est: true },
  { id: "carrots", key: "carrots", emoji: "🥕", name: "Carrots", n: 1, unit: "bag", area: "Fridge", spot: "Crisper", cat: "Vegetables", days: null, upd: 2, recent: false, by: "Arjan", min: 0, est: false },
  { id: "cheddar", key: "cheese", emoji: "", name: "Cheddar", n: 200, unit: "g", area: "Fridge", spot: "Top shelf", cat: "Dairy and eggs", days: null, upd: 3, recent: false, by: "Arjan", min: 0, est: false },
  { id: "eggs", key: "eggs", emoji: "🥚", name: "Eggs", n: 12, unit: "", area: "Fridge", spot: "Door", cat: "Dairy and eggs", days: null, upd: 9, recent: true, by: "Arjan", min: 0, est: false },
  { id: "milk", key: "milk", emoji: "🥛", name: "Milk", n: 1, unit: "L", area: "Fridge", spot: "Door", cat: "Dairy and eggs", days: 0, upd: 5, recent: false, low: true, by: "Arjan", min: 1, est: false },
  { id: "paneer", key: "paneer", emoji: "", name: "Paneer", n: 50, unit: "g", area: "Fridge", spot: "Top shelf", cat: "Dairy and eggs", days: 3, upd: 6, recent: false, low: true, by: "Arjan", min: 0, est: false },
  { id: "spinach", key: "spinach", emoji: "🥬", name: "Spinach", n: 50, unit: "g", area: "Fridge", spot: "Crisper", cat: "Vegetables", days: 1, upd: 10, recent: true, low: true, by: "Arjan", min: 0, est: false },
  { id: "yoghurt", key: "yoghurt", emoji: "", name: "Greek yoghurt", n: 500, unit: "g", area: "Fridge", spot: "Top shelf", cat: "Dairy and eggs", days: 7, upd: 4, recent: false, by: "Arjan", min: 0, est: false },
  { id: "rice", key: "rice", emoji: "🍚", name: "Basmati rice", n: 5, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 1, recent: false, by: "Arjan", min: 0, est: false },
  { id: "brownrice", key: "brownrice", emoji: "🍚", name: "Brown rice", n: 1, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 2, recent: false, by: "Arjan", min: 0, est: false },
  { id: "jasmine", key: "jasmine", emoji: "🍚", name: "Jasmine rice", n: 1, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 2, recent: false, by: "Arjan", min: 0, est: false },
  { id: "tomatoes", key: "tomatoes", emoji: "🥫", name: "Chopped tomatoes", n: 4, unit: "tin", area: "Pantry", spot: "Top shelf", cat: "Cans", days: null, upd: 2, recent: false, by: "Arjan", min: 0, est: false },
  { id: "onion", key: "onion", emoji: "🧅", name: "Onions", n: 6, unit: "", area: "Pantry", spot: "Baskets", cat: "Vegetables", days: null, upd: 3, recent: false, by: "Arjan", min: 0, est: false },
  { id: "garam", key: "garam", emoji: "", name: "Garam masala", n: 1, unit: "jar", area: "Pantry", spot: "Spice rack", cat: "Seasoning", days: null, upd: 2, recent: false, low: true, by: "Arjan", min: 0, est: false },
  { id: "choc", key: "choc", emoji: "🍫", name: "Hazelnut chocolates", n: 1, unit: "box", area: "Pantry", spot: "Top shelf", cat: "Snacks", days: 12, upd: 8, recent: true, by: "Arjan", min: 0, est: false },
  { id: "peas", key: "peas", emoji: "", name: "Frozen peas", n: 1, unit: "bag", area: "Freezer", spot: "Top drawer", cat: "Frozen", days: null, upd: 4, recent: false, by: "Arjan", min: 0, est: false },
];

const noEd = () => ({ open: null, err: null, saved: null, picking: false }); /* item detail: which field editor is open, its error, its Saved line */
const initial = () => ({
  screen: "invite", stack: [], tab: "today", param: null,
  persona: "sam", recipes: true, down: false, expireNext: false,
  pantry: freshPantry(), sheet: null, isheet: null, toast: null, ed: noEd(), usedLog: [],
  members: ["arjan", "sam"], invites: [{ code: "482913", hours: 20 }], codeState: "ok", codeTyped: "", codeMsg: null,
  roles: { arjan: { title: "Pantry Marshal", ic: "shield", desc: "Keeps order on the shelves and the fridge. Knows exactly where the cumin lives." }, sam: null },
  cfg: { size: "normal", emoji: true, motion: false, spot: true, amount: true, useby: true, activity: true, compact: false }, stockChecks: true,
  day: 1, aiDone: false, inviteDone: false, cvOpt: "A", aiTab: "ChatGPT", aiLink: false, founder: "arjan", admins: [], avatars: {}, bannerGot: false, pending: null, joined: false,
  /* pantry view */
  rmode: "loc", order: { loc: [...AREAS], cat: [...CATEGORIES] }, fa: null, fd: null, flast: null, fTab: "filters", seenP: 0, seenR: 0, view: "name", shop: ["milk", "carrots", "butter"], slx: { milk: { by: "arjan", want: "2 litres", tick: false }, carrots: { by: "sam", want: "", tick: false }, butter: { by: "arjan", want: "", tick: false } }, wantFor: null, sel: null, areaTab: "All", collapsed: {}, search: "", searchOpen: false, draft: { days: null },
  memberWho: null, existing: 1, own: false, rdraft: null, iconPick: false,
  /* install prompt: nothing until 1 hour of use, then 1, 2, 1 across three weeks, then never */
  usageMin: 0, week: 0, pwa: { startWeek: null, shown: {}, done: false }, pwaCard: false,
});
let S = initial();

/* ---------- helpers ---------- */
const dayLabel = (d) => (d === null ? "" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : "in " + d + " days");
const fmtAmt = (i) => { const n = Math.round(i.n * 100) / 100; return String(n) + (i.unit ? " " + i.unit : ""); };
const newCount = (tab) => Math.max(0, (tab === "pantry" ? S.pantry.filter((i) => i.recent).length : RECIPES.filter((r) => r.new).length) - (tab === "pantry" ? S.seenP : S.seenR));
const nbadge = (tab) => newCount(tab) ? `<i class="badge" aria-label="${newCount(tab)} new">${newCount(tab)}</i>` : "";
const OUT = { butter: 20, carrots: 10, cheddar: 15, eggs: 9, milk: 2, paneer: 5, spinach: 3, yoghurt: 8, rice: 60, brownrice: 40, jasmine: 40, tomatoes: 30, onion: 25, garam: 6, choc: 30, peas: 11 };
const outDays = (i) => OUT[i.id] ?? 30;
const agoH = (i) => (i.recent ? 26 - i.upd * 2 : 30 + (10 - i.upd) * 24);
const isLow = (i) => outDays(i) <= 7;
const onList = (id) => S.shop.includes(id);
const sx = (id) => S.slx[id] || (S.slx[id] = { by: S.persona, want: "", tick: false });
const initials = (who) => { const w = (PEOPLE[who] ? PEOPLE[who].name : who).trim().split(/\s+/); return (w.length > 1 ? w[0][0] + w[w.length - 1][0] : w[0][0]).toUpperCase(); };
const addToList = (id) => { if (!onList(id)) { S.shop.push(id); S.slx[id] = { by: S.persona, want: "", tick: false }; } };
/* five hand-drawn scribbles; one is picked per item from its id, so a ticked list never looks stamped out */
const SCRIBBLES = ["M2 8 C20 3 40 11 60 5 S90 9 98 4", "M2 5 L98 9 M4 9 L96 4 M2 7 L98 6", "M1 7 C15 2 25 12 40 6 S70 2 99 8", "M2 4 C30 10 50 2 98 7 M3 9 C40 3 70 11 97 5", "M2 6 L10 3 L18 9 L28 3 L38 9 L50 3 L62 9 L74 3 L86 9 L98 5"];
const scrib = (id) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return SCRIBBLES[h % SCRIBBLES.length]; };
const emo = (i) => i.emoji || emojiOf(i.name) || "🍽️";
const lowText = (i) => `${fmtAmt(i)} left`;
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const reducible = (i) => COUNT_UNITS.includes(i.unit);
const can = (r) => r.ings.filter(([k]) => S.pantry.some((p) => p.key === k));
const me = () => PEOPLE[S.persona];
const avt = (w, sz = 20) => { const a = S.avatars[w]; return a && a.startsWith("ri:") ? riSvg(a.slice(3), sz) : a || PEOPLE[w].initial; }; /* a picture is one of the role icons ("ri:key"), or the initial */
const starIc = ico('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>', 14);
const founderChip = (w) => (S.founder === w ? `<span class="chip fchip">${starIc}Founding member</span>` : "");
const pays = () => S.persona === "arjan"; /* the billing contact; never shown as a rank */
const role = (who) => S.roles[who];
const isAdmin = (w) => w === S.founder || S.admins.includes(w); /* the founding member is always an admin; only they grant or revoke */
const emojiOf = (n) => { const m = { milk: "🥛", egg: "🥚", rice: "🍚", bread: "🍞", cheese: "🧀", tomato: "🍅", apple: "🍎", banana: "🍌", butter: "🧈", onion: "🧅", carrot: "🥕", pasta: "🍝", chicken: "🍗", fish: "🐟" }; const k = Object.keys(m).find((x) => n.toLowerCase().includes(x)); return k ? m[k] : ""; };

/* ---------- install prompt rules ---------- */
const PWA_PER_WEEK = [1, 2, 1];
function pwaStatus() {
  const p = S.pwa;
  if (p.done) return "Added to a home screen. Never shown again.";
  if (S.usageMin < 60) return `Waiting for 1 hour of use (${S.usageMin} min so far). Nothing shown.`;
  const w = S.week - p.startWeek;
  if (w >= PWA_PER_WEEK.length) return "Past week 3. Never shown again.";
  return `Week ${w + 1} of 3: shown ${p.shown[S.week] || 0} of ${PWA_PER_WEEK[w]} this week.`;
}
function maybePrompt() {
  const p = S.pwa; S.pwaCard = false;
  if (p.done || S.usageMin < 60) return;
  if (p.startWeek === null) p.startWeek = S.week;
  const w = S.week - p.startWeek;
  if (w < 0 || w >= PWA_PER_WEEK.length) return;
  if ((p.shown[S.week] || 0) >= PWA_PER_WEEK[w]) return;
  p.shown[S.week] = (p.shown[S.week] || 0) + 1; S.pwaCard = true;
}

/* ---------- navigation ---------- */
function go(screen, param = null, opts = {}) {
  if (!opts.replace) S.stack.push({ screen: S.screen, param: S.param, tab: S.tab });
  S.screen = screen; S.param = param; S.ed = noEd(); S.isheet = null;
  if (["today", "pantry", "recipes", "shop"].includes(screen)) { S.tab = screen; S.stack = []; }
  if (screen !== "pantry") S.sel = null;
  if (screen === "today") maybePrompt();
  render();
}
function back() {
  const p = S.stack.pop();
  if (p) { S.screen = p.screen; S.param = p.param; S.tab = p.tab; } else { S.screen = "today"; S.tab = "today"; }
  S.ed = noEd(); render();
}
let undoFn = null; /* set while a toast offers Undo */
function toast(msg, undo) { S.toast = msg; undoFn = undo || null; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = null; undoFn = null; render(); }, undo ? 6000 : 2600); }

/* ---------- advanced filters ---------- */
const ROT = {
  low: { label: "Running low", opts: [["in 3 days", 3], ["in 1 week", 7], ["in 2 weeks", 14]], def: 1, test: (i, v) => outDays(i) <= v },
  soon: { label: "Expiring soon", opts: [["in 3 days", 3], ["in 1 week", 7], ["in 2 weeks", 14], ["in 1 month", 30]], def: 1, test: (i, v) => i.days !== null && i.days <= v },
  recent: { label: "Recently added", opts: [["last 24 hours", 24], ["last 3 days", 72], ["last week", 168]], def: 0, test: (i, v) => agoH(i) <= v },
};
const dirNull = (a, b, f) => (a.days === null && b.days === null ? 0 : a.days === null ? 1 : b.days === null ? -1 : f(a.days, b.days));
const SORTK = {
  name: { label: "Name", dirs: ["A to Z", "Z to A"], cmp: (a, b, d) => (d ? -1 : 1) * a.name.localeCompare(b.name) },
  useby: { label: "Use by", dirs: ["Soonest first", "Latest first"], cmp: (a, b, d) => dirNull(a, b, (x, y) => (d ? y - x : x - y)) || a.name.localeCompare(b.name) },
  added: { label: "Added", dirs: ["Newest first", "Oldest first"], cmp: (a, b, d) => (d ? -1 : 1) * (agoH(a) - agoH(b)) },
};
const EM = { Fridge: "❄️", Pantry: "🫙", Freezer: "🧊", "Dairy and eggs": "🥛", Vegetables: "🥦", Fruits: "🍎", Meat: "🍗", "Dry goods": "🌾", Cans: "🥫", Seasoning: "🧂", Snacks: "🍫", Frozen: "🥶", Other: "🍽️" };
const clone = (o) => JSON.parse(JSON.stringify(o));
const blankF = () => ({ st: { low: { on: false, i: ROT.low.def }, soon: { on: false, i: ROT.soon.def }, recent: { on: false, i: ROT.recent.def } }, locs: [], cats: [], key: "name", dir: 0 });
const fCount = (f) => Object.values(f.st).filter((x) => x.on).length + f.locs.length + f.cats.length;
const fActive = (f) => fCount(f) > 0 || f.key !== "name" || f.dir !== 0;
function matchF(f, i) {
  const on = Object.keys(f.st).filter((k) => f.st[k].on);
  if (on.length && !on.some((k) => ROT[k].test(i, ROT[k].opts[f.st[k].i][1]))) return false;
  if (f.locs.length && !f.locs.includes(i.area)) return false;
  if (f.cats.length && !f.cats.includes(i.cat)) return false;
  return true;
}
const fItems = (f) => S.pantry.filter((i) => matchF(f, i));
const fShowText = (f) => { const n = fItems(f).length; return n === 0 ? "No items match" : `Show ${n} ${n === 1 ? "item" : "items"}`; };
const fSummary = (f) => [...Object.keys(f.st).filter((k) => f.st[k].on).map((k) => ROT[k].label), ...f.locs, ...f.cats, ...(f.key !== "name" || f.dir ? [`${SORTK[f.key].label}, ${SORTK[f.key].dirs[f.dir].toLowerCase()}`] : [])].join(" · ");
function refreshSheet() {
  const f = S.fd; if (!f) return;
  document.querySelectorAll("[data-fchip]").forEach((el) => { const [t, v] = el.dataset.fchip.split("|"); const on = f[t].includes(v); el.classList.toggle("on", on); el.setAttribute("aria-pressed", on); el.querySelector(".mi").innerHTML = on ? I.tick : (EM[v] || ""); });
  document.querySelectorAll(".strow").forEach((r) => { const k = r.dataset.fk, st = f.st[k]; r.classList.toggle("on", st.on); r.querySelector(".stt").setAttribute("aria-checked", st.on); r.querySelector(".dotc").innerHTML = st.on ? I.tick : ""; const drag = ro && ro.moved && ro.k === k; r.classList.toggle("drag", !!drag); r.querySelector(".lbl2").textContent = drag ? ROT[k].opts[st.i][0] : ROT[k].label; r.querySelector(".rv").textContent = ROT[k].opts[st.i][0]; });
  const b = document.getElementById("fshow"); if (b) { b.textContent = fShowText(f); b.disabled = fItems(f).length === 0; }
}

/* ---------- pieces ---------- */
const header = () => `<div class="top"><span>Our kitchen</span><button class="av" data-go="menu" aria-label="Account">${avt(S.persona)}</button></div>`;
const backHeader = (label, title) => `<div class="top"><button class="back" data-act="back">&lsaquo; ${esc(label)}</button><span class="ttl">${esc(title || "")}</span><span style="width:64px"></span></div>`;
const bar = () => `<nav class="bar" aria-label="Main">
  <button data-go="today" class="${S.tab === "today" ? "on" : ""}">${riSvg("home", 24)}<span>Home</span></button>
  <button data-go="pantry" class="${S.tab === "pantry" ? "on" : ""}">${riSvg("jar", 24)}<span>Pantry</span>${nbadge("pantry")}</button>
  <button data-go="${S.recipes ? "recipes" : "upgrade"}" class="${S.tab === "recipes" ? "on" : ""}">${riSvg("chef", 24)}<span>Recipes${S.recipes ? "" : ' <i class="chip add">Add</i>'}</span>${S.recipes ? nbadge("recipes") : ""}</button>
  <button data-go="shop" class="${S.tab === "shop" ? "on" : ""}">${riSvg("cart", 24)}<span>Shopping</span>${S.shop.length ? `<i class="badge" aria-label="${S.shop.length} on the list">${S.shop.length}</i>` : ""}</button>
</nav>`;
const downBanner = () => S.down ? `<div class="banner warn"><b>Showing your saved list</b><span>Updated 3 minutes ago. We're reconnecting. Changes will work again shortly.</span><button class="lnk" data-act="retry">Try again</button></div>` : "";
const shell = (inner) => header() + downBanner() + inner + bar();
const roleChip = (who) => role(who) ? `<span class="chip rchip">${riSvg(role(who).ic, 14)}${esc(role(who).title)}</span>` : "";

/* ---------- item detail ----------
   Read first: every field is a plain row, and tapping a row opens that field's editor under it. Edits autosave (no Save button).
   Default path (screen open): only these read rows, built from state already in memory. Nothing else is rendered or fetched.
   Deferred to the first tap of a field: its editor (markup, option lists, emoji set, unit list, date picker) lives in fields/<file>.js,
   fetched once on that first tap and cached. The used-up confirm is built only when opened. README: "Item detail". */
const ITEM_FIELDS = {}; /* each fields/*.js adds { html(p), set: { op(p, value) -> patch | error text } } for its keys */
const FIELD_FILE = { name: "name", qty: "amounts", min: "amounts", level: "flags", loc: "place", spot: "place", cat: "category", useby: "useby" };
const fieldLoads = new Map();
function loadField(k) {
  const f = FIELD_FILE[k];
  if (!fieldLoads.has(f)) fieldLoads.set(f, new Promise((ok, no) => { const s = document.createElement("script"); s.src = `fields/${f}.js`; s.onload = ok; s.onerror = () => { fieldLoads.delete(f); s.remove(); no(); }; document.head.append(s); }));
  return fieldLoads.get(f);
}
/* Out is amount zero, always. A counted item's level is derived from its quantity (a stored label is ignored); a level-only item's level is the label it was given. */
const level = (p) => (p.n <= 0 ? "Out" : p.lvl && !reducible(p) ? p.lvl : p.min && p.n <= p.min ? "Running low" : p.min && p.n <= p.min * 2 ? "Some" : "Plenty");
const VAL = {
  name: (p) => esc(p.name),
  qty: (p) => esc(fmtAmt(p)),
  level: (p) => `<span class="chip ${level(p) === "Plenty" ? "" : "warn"}">${level(p)}</span>${p.est ? ' <span class="chip">Estimated</span>' : ""}`,
  loc: (p) => esc(p.area),
  spot: (p) => esc(p.spot),
  cat: (p) => esc(p.cat),
  useby: (p) => (p.days === null ? "Not set" : dayLabel(p.days)),
  min: (p) => (p.min ? esc(fmtAmt({ n: p.min, unit: p.unit })) : "Not set"),
};
const savedLine = () => `<p class="fstat" role="status">${I.tick}<span>Saved</span></p>`;
const fld = (k, p, inner, label) => {
  const open = S.ed.open === k, err = S.ed.err && S.ed.err.key === k;
  return `<div class="fld${open ? " open" : ""}${err ? " bad" : ""}" data-fld="${k}"><button class="frow" data-act="edit" data-p="${k}" aria-expanded="${open}" ${label ? `aria-label="${esc(label)}"` : ""}>${inner}<span class="chev" aria-hidden="true">${I.chev}</span></button>${open && ITEM_FIELDS[k] ? `<div class="fedit">${ITEM_FIELDS[k].html(p)}</div>` : ""}${err ? `<p class="ferr" role="alert">${I.alert(18)}<span>${esc(S.ed.err.msg)}</span><button class="link" data-act="fretry">Try again</button></p>` : ""}${S.ed.saved === k ? savedLine() : ""}</div>`;
};
/* option pills shared by the editors */
const opts = (k, op, items, cur, aria) => `<div class="opts" role="radiogroup" aria-label="${aria}">${items.map(([v, label]) => `<button class="opt${v === cur ? " on" : ""}" role="radio" aria-checked="${v === cur}" data-act="fset" data-p="${k}|${op}|${esc(v)}">${label}</button>`).join("")}</div>`;
const stepper = (k, p, val) => `<div class="stepper"><button data-act="fset" data-p="${k}|step|-1" aria-label="Less">${I.minus}</button><b>${val}</b><button data-act="fset" data-p="${k}|step|1" aria-label="More">${I.plus}</button></div>`;
const curItem = () => S.pantry.find((x) => x.id === (S.sheet === "item" && S.isheet ? S.isheet.id : S.param)); /* the item sheet edits the same way the full screen does */
function save(k, patch, quiet) {
  const p = curItem(); if (!p) return;
  if (S.down) { S.ed.err = { key: k, msg: "Not saved. We can't reach the platform.", retry: patch }; S.ed.saved = null; render(); return; }
  Object.assign(p, patch, { upd: 200 }); S.ed.err = null; S.ed.saved = k;
  if (quiet) { /* typed input: update in place so a click on the next control is not lost to a re-render */
    document.querySelectorAll(`[data-fv="${k}"]`).forEach((el) => { el.innerHTML = VAL[k](p); });
    const ttl = document.querySelector(".top .ttl"); if (ttl) ttl.textContent = p.name;
    document.querySelectorAll(".fstat,.ferr").forEach((el) => el.remove());
    const f = document.querySelector(`[data-fld="${k}"]`); if (f) { f.classList.remove("bad"); f.insertAdjacentHTML("beforeend", savedLine()); }
  } else render();
  clearTimeout(save.t); save.t = setTimeout(() => { S.ed.saved = null; document.querySelectorAll(".fstat").forEach((el) => el.remove()); }, 2200);
}
const recentUsed = () => S.usedLog.filter((t) => Date.now() - t < 5 * 60 * 1000).length;
function markUsedUp(id) {
  const i = S.pantry.find((x) => x.id === id); if (!i) return;
  const was = { n: i.n, upd: i.upd }; i.was = i.n; i.n = 0; S.usedLog.push(Date.now()); render();
  toast(i.name + " used up. It's marked Out", () => { i.n = was.n; i.upd = was.upd; S.usedLog.pop(); render(); toast(i.name + " is back"); });
}

/* ---------- pantry ---------- */
const sorters = {
  name: (a, b) => a.name.localeCompare(b.name),
  useby: (a, b) => (a.days ?? 1e9) - (b.days ?? 1e9) || a.name.localeCompare(b.name),
};
function visibleItems() {
  const q = S.search.trim().toLowerCase();
  /* Default view hides what is gone: level Out or quantity zero (kitchie #329). Search and filters still reach them. */
  return S.pantry.filter((i) => (q || level(i) !== "Out") && (S.areaTab === "All" || (S.rmode === "cat" ? i.cat : i.area) === S.areaTab) && (!q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)));
}
function rowHtml(i) {
  const hot = i.days !== null && i.days <= 1, c = S.cfg, out = i.n <= 0, cnt = reducible(i);
  const meta = [i.area, c.amount ? (out ? "Out" : fmtAmt(i)) : null, c.spot ? i.spot : null, i.cat].filter((x) => x !== null && x !== "").map(esc).join(" · ");
  /* swipe left a little = use one (counted) or used up (level only); left a lot = used up; right = shopping list. Nothing is deleted. */
  const bg = `<div class="swbg three" aria-hidden="true"><span class="r">${riSvg("cart", 20)}Add to list</span><span class="l l1">${cnt ? `${I.minus}Use one` : `${I.tick}Used up`}</span><span class="l l2">${I.tick}Used up</span></div>`;
  return `<li class="rowx swr pswipe ${out ? "isout" : ""}" data-swipe="${i.id}" data-sw="pantry" data-kind="${cnt ? "count" : "level"}">${bg}<div class="swfg"><button class="rowlink" data-act="isheet" data-p="${i.id}" aria-haspopup="dialog"><div class="main"><div class="name">${i.emoji && c.emoji ? `<span aria-hidden="true">${i.emoji}</span> ` : ""}${esc(i.name)}${i.recent ? ` <span class="cue" role="img" aria-label="Added in the last 24 hours">${I.up(17)}</span>` : ""}</div><div class="meta">${meta}</div></div>${i.days !== null && c.useby && !out ? `<span class="due ${hot ? "hot" : ""}">${i.days >= 2 ? `Use within<br>${i.days} days` : dayLabel(i.days)}</span>` : ""}</button></div></li>`;
}
/* running-low rows: swipe to add to the shopping list, press and hold to pick several */
function lowRowHtml(i) {
  const picked = S.sel && S.sel.includes(i.id);
  return `<li class="rowx swr ${picked ? "sel" : ""}" data-swipe="${i.id}"><div class="swbg" aria-hidden="true"><span>Add to list</span>${riSvg("cart", 20)}</div><div class="swfg"><button class="rowlink" data-act="rowtap" data-p="${i.id}" ${picked ? 'aria-pressed="true"' : ""}>${S.sel ? `<span class="chk" aria-hidden="true">${picked ? I.tick : ""}</span>` : ""}<div class="main"><div class="name">${i.emoji ? `<span aria-hidden="true">${i.emoji}</span> ` : ""}${esc(i.name)}</div><div class="meta">${esc(lowText(i))} · ${esc(i.spot)}</div></div>${onList(i.id) ? '<span class="chip">On your list</span>' : ""}${S.sel ? "" : `<span class="chev">${I.chev}</span>`}</button></div></li>`;
}
/* shopping rows: tick = in the basket (visual only), swipe right = bought now, swipe left = remove. Tap = how much, in your own words. */
function shopRowHtml(i) {
  const x = sx(i.id), other = x.by !== S.persona && PEOPLE[x.by];
  const home = `${esc(i.n <= 0 ? "None" : fmtAmt(i))} left at home`;
  return `<li class="rowx swr shoprow ${x.tick ? "inbag" : ""}" data-swipe="${i.id}" data-sw="shop"><div class="swbg two" aria-hidden="true"><span class="l">${I.tick}Bought</span><span class="r">Remove${I.x}</span></div><div class="swfg">
    <button class="tick" data-act="shoptick" data-p="${i.id}" role="checkbox" aria-checked="${x.tick}" aria-label="In the basket: ${esc(i.name)}"><span aria-hidden="true">${x.tick ? I.tick : ""}</span></button>
    <button class="rowlink" data-act="shopwant" data-p="${i.id}" aria-label="${esc(i.name)}. ${x.want ? "Want " + esc(x.want) + ". " : ""}${home}. Tap to set how much"><span class="em" aria-hidden="true" style="font-size:26px">${emo(i)}</span><div class="main"><div class="name"><span class="nm">${esc(i.name)}${x.tick ? `<svg class="scr" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path d="${scrib(i.id)}" pathLength="1"/></svg>` : ""}</span>${x.want ? ` <b class="want">${esc(x.want)}</b>` : ""}</div><div class="meta">${home}</div></div>${other ? `<span class="by" aria-label="Added by ${esc(other.name)}"><span class="avw">${role(x.by) ? `<span class="byic" aria-hidden="true">${riSvg(role(x.by).ic, 26)}</span>` : ""}<span class="bi">${initials(x.by)}</span></span></span>` : ""}</button></div></li>`;
}
function ribbonHtml() {
  const m = S.rmode, loc = m === "loc";
  return `<div class="ribbon ${S.rflip ? "flip" : ""}"><button class="rmode" data-act="rmode" aria-label="Showing ${loc ? "locations" : "categories"}. Switch to ${loc ? "categories" : "locations"}" title="Switch between location and category"><span class="yy">${riSvg("yy", 22)}</span><span class="cap">${loc ? "Location" : "Category"}</span></button>
    <div class="rscroll" id="rscroll" role="group" aria-label="${loc ? "Location" : "Category"}">${["All", ...S.order[m]].map((v) => `<button class="rc2 ${S.areaTab === v ? "on" : ""}" data-act="areatab" data-p="${esc(v)}" ${v === "All" ? "" : `data-chip="${esc(v)}"`}><span>${esc(v)}</span></button>`).join("")}</div></div>`;
}
function listHtml() {
  if (S.fa) {
    const q = S.search.trim().toLowerCase();
    const k = SORTK[S.fa.key]; const items = fItems(S.fa).filter((i) => !q || i.name.toLowerCase().includes(q)).sort((a, b) => k.cmp(a, b, S.fa.dir));
    const low = S.fa.st.low.on, onlyLow = low && !S.fa.st.soon.on && !S.fa.st.recent.on && !S.fa.locs.length && !S.fa.cats.length; /* with Running low on, rows swipe to the shopping list and press-and-hold picks several */
    return items.length ? `${low ? `<p class="hint">${S.sel ? "Tap to pick more, then add them together." : "Swipe a row to add it to your shopping list. Press and hold to pick several."}</p>` : ""}<ul class="rows">${items.map(low ? lowRowHtml : rowHtml).join("")}</ul>` : `<p style="padding:20px 4px">${onlyLow ? "Nothing is running low. Nice." : "Nothing matches these filters."}</p>`;
  }
  const q0 = S.search.trim(), items = visibleItems().sort(sorters.name); /* no filters or sort chosen: A to Z, grouped */
  const gk = S.rmode === "cat" ? "cat" : "area";
  const groups = S.order[S.rmode].filter((a) => items.some((i) => i[gk] === a));
  if (!groups.length) return `<p style="padding:20px 4px">${!S.pantry.length ? "Your pantry is empty. Add what you have." : q0 ? "Nothing matches." : "Nothing in stock here. Search or use Filters to find what is out."}</p>`;
  return groups.map((a) => {
    const its = items.filter((i) => i[gk] === a); const shut = !!S.collapsed[a]; const nr = its.filter((i) => i.recent).length;
    return `<section class="group ${shut ? "shut" : ""}"><button class="grouphead" data-act="fold" data-p="${esc(a)}" data-fold="1" aria-expanded="${!shut}"><h2>${esc(a)}${shut ? `<small>${its.length}</small>` : ""}</h2><span class="ghmeta">${nr ? `<span class="added" role="img" aria-label="${nr} added in the last 24 hours">${I.up(12)}${nr}</span>` : ""}<span class="fold">${I.down}</span></span></button><ul class="rows">${its.map(rowHtml).join("")}</ul></section>`;
  }).join("");
}

/* quirky refresh scenes: a different one each time, drawn in theme tokens */
const RF = [
  ["Stirring the pot. Gently.", `<svg viewBox="0 0 120 80" aria-hidden="true"><g class="rf-b"><circle cx="46" cy="40" r="3"/><circle cx="62" cy="44" r="2.5"/><circle cx="72" cy="38" r="3.5"/></g><path class="rf-p" d="M28 48h64v10c0 10-9 16-32 16s-32-6-32-16z"/><path class="rf-ph" d="M28 54h-7a4 4 0 0 0 0 8h7M92 54h7a4 4 0 0 1 0 8h-7"/><g class="rf-spoon"><path d="M60 52L84 14"/><circle cx="85" cy="12" r="5"/></g></svg>`],
  ["Toast is thinking about it", `<svg viewBox="0 0 120 80" aria-hidden="true"><g class="rf-t1"><path d="M38 40a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8v12H38z"/></g><g class="rf-t2"><path d="M62 40a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8v12H62z"/></g><rect class="rf-p" x="28" y="48" width="64" height="26" rx="8"/><rect class="rf-slot" x="40" y="52" width="40" height="5" rx="2.5"/><circle class="rf-dot" cx="82" cy="66" r="3"/></svg>`],
  ["Juggling veg. Don't tell the carrots", `<svg viewBox="0 0 120 80" aria-hidden="true"><circle class="rf-j j1" cx="60" cy="40" r="9"/><circle class="rf-j j2" cx="60" cy="40" r="9"/><circle class="rf-j j3" cx="60" cy="40" r="9"/><path class="rf-hand" d="M24 70c8-8 16-8 22 0M74 70c6-8 14-8 22 0"/></svg>`],
  ["Kettle's on. Obviously.", `<svg viewBox="0 0 120 80" aria-hidden="true"><g class="rf-steam"><path d="M40 28c-4-6 4-10 0-16"/><path d="M52 24c-4-6 4-10 0-16"/><path d="M64 28c-4-6 4-10 0-16"/></g><g class="rf-kettle"><path class="rf-p" d="M30 46a22 22 0 0 1 44 0v18a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6z"/><path class="rf-ph" d="M74 48c14-2 18 4 14 12M30 50l-10-8"/><circle class="rf-lid" cx="52" cy="26" r="4"/></g></svg>`],
  ["Egg is feeling fragile", `<svg viewBox="0 0 120 80" aria-hidden="true"><g class="rf-egg"><path class="rf-e" d="M60 8c14 0 22 20 22 34a22 22 0 0 1-44 0C38 28 46 8 60 8z"/><circle class="rf-eye" cx="52" cy="40" r="2.5"/><circle class="rf-eye" cx="68" cy="40" r="2.5"/><path class="rf-ph" d="M54 50c4 4 8 4 12 0"/></g><path class="rf-p2" d="M22 74h76"/></svg>`],
  ["Timer's ticking. Nearly ready", `<svg viewBox="0 0 120 80" aria-hidden="true"><path class="rf-ph" d="M52 10h16M60 10v8"/><circle class="rf-e" cx="60" cy="46" r="26"/><g class="rf-hand2"><path class="rf-ph" d="M60 46V28"/></g><circle class="rf-eye" cx="60" cy="46" r="3"/></svg>`],
];
let lastRF = -1;
const refreshHtml = (r) => `<div class="rf">${reducedMotion() ? "" : r[1]}<span>${r[0]}</span></div>`;
const reducedMotion = () => S.cfg.motion || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
/* ---------- screens ---------- */
const KITCHEN_SCENE = `<svg class="scene" viewBox="0 0 360 150" role="img" aria-label="A friendly kitchen: a pot on the stove, a plant and jars on a shelf"><g class="sh"><rect x="8" y="104" width="124" height="7" rx="3"/><rect x="236" y="112" width="116" height="7" rx="3"/><rect x="0" y="144" width="360" height="3" rx="1.5"/></g>
<g class="plant"><path class="lf" d="M38 78c-8-8-9-18-5-24 8 3 11 14 5 24zM44 76c0-10 5-18 12-22 3 8-1 17-12 22z"/><rect class="pt" x="32" y="80" width="22" height="22" rx="4"/></g>
<g><rect class="jar j1" x="70" y="84" width="16" height="20" rx="4"/><rect class="jar j2" x="90" y="80" width="16" height="24" rx="4"/><rect class="jar j3" x="110" y="70" width="18" height="34" rx="5"/></g>
<g class="steam"><path d="M156 52c-4-6 4-10 0-16"/><path d="M180 48c-4-6 4-10 0-16"/><path d="M204 52c-4-6 4-10 0-16"/></g>
<g class="pot"><g class="lid"><path d="M146 80c8-12 60-12 68 0z"/><circle cx="180" cy="64" r="3.5"/></g><path class="body" d="M146 82h68v38c0 14-10 24-34 24s-34-10-34-24z"/><path class="hd" d="M146 94h-8a5 5 0 0 0 0 10h8M214 94h8a5 5 0 0 1 0 10h-8"/></g>
<g class="hearts"><path class="h1" d="M236 62c-5-5-11 1-6 6l6 5 6-5c5-5-1-11-6-6z"/><path class="h2" d="M252 44c-4-4-9 1-5 5l5 4 5-4c4-4-1-9-5-5z"/></g>
<g class="pan"><rect x="264" y="92" width="52" height="20" rx="4"/><rect x="258" y="88" width="64" height="5" rx="2.5"/></g>
<g class="cups"><rect x="262" y="74" width="12" height="14" rx="3"/><rect x="280" y="78" width="14" height="10" rx="3"/></g></svg>`;


/* role editor, shared by Welcome and the role sheet: icon tiles first, then icon, name and tagline all tap-to-edit */
function roleEditor(ctx) {
  const d = S.rdraft, w = ctx === "welcome", sz = w ? 40 : 52;
  return `<div class="rgrid ${S.iconPick ? "hide" : ""}">${ROLE_PRESETS.map((r, i) => `<button class="rtile ${d && d.pi === i ? "on" : ""}" data-act="rolepick" data-p="${i}" aria-pressed="${!!(d && d.pi === i)}">${roleIc(r, sz)}<b>${esc(r.title)}</b><span class="tg">${esc(r.desc)}</span></button>`).join("")}</div>
  ${d ? `<div class="card"><div class="row"><button type="button" class="ric" style="width:56px;height:56px" data-act="roleicons" aria-label="Change icon" aria-expanded="${S.iconPick}">${riSvg(d.ic, 30)}</button><input class="field" id="r-title" value="${esc(d.title)}" maxlength="32" aria-label="Role name" autocomplete="off"></div><input class="field" id="r-desc" value="${esc(d.desc)}" maxlength="80" aria-label="Tagline" autocomplete="off">${S.iconPick ? `<div class="irow" role="radiogroup" aria-label="Icon">${ICON_LIB.map((k) => `<button type="button" class="ipick ${d.ic === k ? "on" : ""}" data-act="iconchoose" data-p="${k}" role="radio" aria-checked="${d.ic === k}" aria-label="${k}">${riSvg(k, 22)}</button>`).join("")}</div>` : ""}</div>` : ""}
  <div class="acts"><button class="btn" data-act="roleconfirm" data-p="${ctx}">${w ? "Take me to the kitchen" : "Save"}</button>
  <button class="btn ghost" data-act="rolelater" data-p="${ctx}">${w ? "Later" : "Not now"}</button></div>`;
}

const INVITE_SCENE = `<svg class="scene env" viewBox="0 0 240 150" role="img" aria-label="An invite letter arriving in an envelope"><g class="sparks"><path class="s1" d="M40 58l4-9 4 9 9 4-9 4-4 9-4-9-9-4z"/><path class="s2" d="M196 40l3-7 3 7 7 3-7 3-3 7-3-7-7-3z"/><circle class="s3" cx="206" cy="92" r="4"/><circle class="s4" cx="30" cy="104" r="3"/><path class="s5" d="M60 24l5 12M120 12v12M176 22l-6 12M214 64l-12 4"/></g>
<g class="letter"><rect x="70" y="8" width="100" height="96" rx="8"/><g class="lp" transform="translate(0,-66)"><path d="M98 78h44v12c0 8-6 13-22 13s-22-5-22-13z"/><path d="M92 82h-5a3 3 0 0 0 0 6h5M148 82h5a3 3 0 0 1 0 6h-5"/><path d="M96 74c8-8 40-8 48 0z"/></g></g>
<path class="back" d="M52 70l68-30 68 30v62a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z"/><path class="flap" d="M52 74l68 44 68-44v58a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z"/><path class="fold" d="M52 132l50-36M188 132l-50-36"/></svg>`;

/* Invite codes (owner, 8 Oct 2026): six digits, shown as 482 913. One neutral message for wrong, used, expired or locked-out; the lockout is the only one that says "try later". */
const fmtCode = (c) => String(c).replace(/(\d{3})(\d{3})/, "$1 $2");
const CODE_WRONG = "That code didn't work. It may have been used, have expired, or be typed wrong. Ask for a new one.";
const CODE_LOCKED = "Too many tries. Please wait 15 minutes, then try again.";

const screens = {
  /* Typing the code in: for someone who was given the digits rather than a link. */
  entercode: () => `<div class="body center">
    <h1>Enter your invite code</h1><p>Six digits from the person who invited you.</p>
    <input class="field codein" id="codein" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" maxlength="7" placeholder="000 000" value="${esc(S.codeTyped)}" aria-label="Invite code" aria-invalid="${S.codeState === "wrong"}">
    ${S.codeState === "wrong" ? `<p class="ferr center-t" role="alert">${I.alert(18)}<span>${CODE_WRONG}</span></p>` : ""}
    ${S.codeState === "locked" ? `<p class="ferr center-t" role="alert">${I.alert(18)}<span>${CODE_LOCKED}</span></p>` : ""}
    <button class="btn" data-act="usecode" ${S.codeState === "locked" ? "disabled" : ""}>Continue</button>
    <p class="small">Next you sign in with Google. A code works once.</p></div>`,

  invite: () => `<div class="body center">
    <div class="av" style="width:56px;height:56px;font-size:22px">A</div>
    ${S.own ? `<h1>Arjan set you up with a kitchen of your own</h1><p>Keep track of what's in the fridge and pantry. Invite people in whenever you like.</p>` : `<h1>Arjan invited you to Our kitchen</h1><p>Share what's in the fridge and pantry, and cook from it together.</p>`}
    <div class="codechip" aria-label="Your invite code">${riSvg("lock", 14)}<span>Invite code</span><b class="mono">${fmtCode(S.code || "482913")}</b></div>
    ${S.codeState === "wrong" ? `<p class="ferr center-t" role="alert">${I.alert(18)}<span>${CODE_WRONG}</span></p>` : ""}
    ${S.codeState === "locked" ? `<p class="ferr center-t" role="alert">${I.alert(18)}<span>${CODE_LOCKED}</span></p>` : ""}
    <button class="btn" data-act="signin" ${S.codeState === "locked" ? "disabled" : ""}>Continue with Google</button>
    <p class="small">You'll sign in with Google. We never see your password.</p>
    <button class="link" data-act="othercode">Use a different code</button></div>`,

  welcome: () => {
    const names = NAMES.slice(0, S.existing);
    const who = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : `${names[0]}, ${names[1]} and the rest`;
    const perks = [["fridge", "Tame the pantry", ""], ["pot", "Plan & cook together", "t2"], ["basket", "Never run out of stuff", "t3"]];
    const anim = S.anim; S.anim = false;
    return header() + `<div class="body fit ${S.rdraft ? "editing" : ""} ${anim ? "anim" : ""} ${S.iconPick ? "picking" : ""}">
      <div class="hero">${KITCHEN_SCENE}
      <div class="hello"><h1>${S.own ? `Your very own kitchen, ${esc(me().name)}.` : `Welcome, ${esc(me().name)}.`}</h1>
      <p>${S.own ? "Arjan thought you'd like one. Zero peer pressure." : `${esc(who)} will be thrilled to see you!`}</p></div>
      <ul class="wl">${perks.map(([ic, t, c]) => `<li><span class="ric ${c}" style="width:40px;height:40px">${riSvg(ic, 22)}</span><span>${t}</span></li>`).join("")}</ul></div>
      <h2 class="pickh">Pick a role you like playing</h2>
      ${roleEditor("welcome")}</div>`;
  },

  today: () => {
    const soon = S.pantry.filter((p) => p.days !== null && p.days <= 3).sort((a, b) => a.days - b.days);
    const low = S.pantry.filter(isLow);
    const ideas = [...RECIPES].sort((a, b) => can(b).length / b.ings.length - can(a).length / a.ings.length);
    const first = !S.bannerGot && S.persona === "sam" && S.joined && !S.own;
    return shell(`<div class="body">
      ${first ? `<div class="banner" style="margin:0"><span>Shared with Arjan</span><button class="lnk" data-act="gotit">Got it</button></div>` : ""}
      <h1 style="font-size:2rem">${greeting()}, ${esc(me().name)}.</h1>
      ${S.pwaCard ? `<div class="card dash"><div class="pwa"><span style="color:var(--fg)">${POT}</span><div><b style="font-size:17px">Open your kitchen straight away</b><p class="small" style="margin-top:2px">No browser, no faff. Just tap and you're in.</p></div></div><div class="row" style="gap:18px"><button class="btn sm" data-sheet="pwa">Add it now</button><button class="link" data-act="pwano" style="color:var(--muted);font-weight:600">Not now</button></div></div>` : ""}
      <section class="card tile" role="button" tabindex="0" data-act="openuse" aria-label="On the way out. View all">
        <div class="th"><span class="ric" style="width:36px;height:36px">${riSvg("clock", 20)}</span><h2>On the way out</h2><span class="va">View all</span></div>
        ${soon.length ? `<div class="chips3">${soon.slice(0, 3).map((p) => `<div class="mini"><span class="em" aria-hidden="true">${emo(p)}</span><b>${esc(p.name)}</b><span>${dayLabel(p.days)}</span></div>`).join("")}</div>` : "<p>Nothing is about to expire.</p>"}</section>
      <section class="card tile" role="button" tabindex="0" data-act="openlow" aria-label="Running low. View all">
        <div class="th"><span class="ric t3" style="width:36px;height:36px">${riSvg("basket", 20)}</span><h2>Running low</h2><span class="va">View all</span></div>
        ${low.length ? low.slice(0, 3).map((p) => `<div class="lrow"><span class="em" aria-hidden="true">${emo(p)}</span><div><b>${esc(p.name)}</b><span>${esc(lowText(p))}</span></div>${onList(p.id) ? '<span class="chip">On your list</span>' : `<button class="pillbtn" data-act="shopadd" data-p="${p.id}" aria-label="Add ${esc(p.name)} to shopping list">Add</button>`}</div>`).join("") : "<p>Nothing is running low.</p>"}</section>
      ${S.recipes
        ? `<section class="card tile3"><div class="th"><span class="ric t2" style="width:36px;height:36px">${riSvg("chef", 20)}</span><h2>Cooking ideas for you</h2><button class="va" data-go="recipes">See all</button></div>
            <div class="snap" id="snap">${ideas.map((r) => `<button class="idea" data-go="recipe" data-p="${r.id}"><span class="ph big" aria-hidden="true">${r.emoji}</span><div style="flex:1;min-width:0"><b>${esc(r.name)}</b><p class="small" style="margin-top:2px">Uses ${r.ings.slice(0, 3).map(([, n]) => esc(n.toLowerCase())).join(", ")}${r.ings.length > 3 ? ` +${r.ings.length - 3} more` : ""}</p><p class="small" style="margin-top:6px">${r.time} min · you have ${can(r).length} of ${r.ings.length}</p></div><span class="chev" style="color:var(--muted)">${I.chev}</span></button>`).join("")}</div>
            <div class="dots" aria-hidden="true">${ideas.map((_, n) => `<i class="${n ? "" : "on"}"></i>`).join("")}</div></section>`
        : `<button class="card" data-go="upgrade"><b>Know what you can cook</b><p class="small">Recipes uses what's in your pantry. Add it to your kitchen.</p></button>`}
    </div>`);
  },

  shop: () => {
    const items = S.shop.map((id) => S.pantry.find((x) => x.id === id)).filter(Boolean);
    const ticked = items.filter((i) => sx(i.id).tick).length;
    return shell(`<div class="body tight"><h1 class="vh">Shopping</h1>
    ${items.length
      ? `<p class="hint">Tick as you drop things in the basket. Swipe right when you've bought it, left to take it off.</p><ul class="rows">${items.map(shopRowHtml).join("")}</ul>`
      : `<div class="card" style="align-items:center;text-align:center;gap:10px;padding:28px 18px"><span class="ric" style="width:64px;height:64px">${riSvg("cart", 32)}</span><b style="font-size:20px">Nothing on the list yet</b><p>Swipe a running-low item to put it here.</p><button class="btn sm" data-act="openlow">See what's running low</button></div>`}
  </div>${ticked ? `<div class="selbar" role="region" aria-label="Basket"><button class="btn" data-act="shopfinish">Done shopping · ${ticked} in the basket</button></div>` : ""}`);
  },

  pantry: () => header() + downBanner() + `<div class="body tight">
    <div class="prow" id="prow" data-state="${S.refresh ? "anim" : S.searchOpen ? "search" : "rest"}"><h1 class="vh">Pantry</h1>
      <div class="pl pl-msg" id="pmsg" ${S.refresh ? 'role="status"' : 'aria-hidden="true"'}>${S.refresh ? refreshHtml(S.refresh) : ""}</div>
      <div class="pl pl-search"><button class="link cancel" data-act="searchcancel">Cancel</button><div class="spill"><input class="field" id="search" placeholder="Search your pantry" value="${esc(S.search)}" autocomplete="off" aria-label="Search your pantry"><button class="icon" data-act="mic" aria-label="Search by voice" title="Voice">${riSvg("mic", 22)}</button><span class="mg" aria-hidden="true">${I.search}</span></div></div>
      <div class="pl pl-front"><p class="count" aria-live="polite">${S.fa || S.search.trim() ? S.pantry.length : S.pantry.filter((i) => level(i) !== "Out").length} items</p><div class="pact">${S.fa ? "" : `<button class="tbtn" data-sheet="filters" aria-label="Filters">${riSvg("funnel", 18)}<span>Filters</span></button>`}<button class="icon addbtn" data-sheet="add" aria-label="Add an item" title="Add an item" ${S.down ? "disabled" : ""}>${I.plus}</button></div></div>
    </div>
    ${S.fa
      ? cvHtml()
      : ribbonHtml()}
    <div id="plist">${listHtml()}</div></div>
    ${S.sel ? `<div class="selbar" role="region" aria-label="Selected items"><button class="btn" data-act="seladd">Add ${S.sel.length} to shopping list</button><button class="icon" data-act="selcancel" aria-label="Cancel selection" title="Cancel">${I.x}</button></div>` : ""}` + bar(),

  item: () => {
    const p = S.pantry.find((x) => x.id === S.param);
    if (!p) return backHeader("Pantry", "") + `<div class="body"><p>That item is gone.</p></div>`;
    const rs = RECIPES.filter((r) => r.ings.some(([k]) => k === p.key));
    const row = (k, ic, label) => fld(k, p, `<span class="ric" style="width:34px;height:34px">${riSvg(ic, 18)}</span><span class="fl">${label}</span><span class="fv" data-fv="${k}">${VAL[k](p)}</span>`);
    return backHeader("Pantry", p.name) + downBanner() + `<div class="body">
      <div class="flist">
        ${fld("name", p, `<span class="ph" aria-hidden="true">${emo(p)}</span><span class="idt"><b data-fv="name">${VAL.name(p)}</b><span class="small">Added by ${esc(p.by)}</span></span>`, `Name and emoji: ${p.name}`)}
        ${row("qty", "stack", "Quantity")}${row("level", "battery", "Level")}${row("loc", "fridge", "Location")}${row("spot", "jar", "Spot")}${row("cat", "basket", "Category")}${row("useby", "clock", "Use by")}${row("min", "shield", "Minimum")}
      </div>
      ${S.recipes && rs.length ? `<div style="display:flex;flex-direction:column;gap:10px"><span class="lbl">Cook it tonight</span>${rs.map((r) => `<button class="rc" data-go="recipe" data-p="${r.id}"><span class="ph">${r.emoji}</span><div style="flex:1"><b>${esc(r.name)}</b><p class="small">${can(r).length} of ${r.ings.length} ingredients · ${r.time} min</p></div></button>`).join("")}</div>` : ""}
      ${!S.recipes ? `<button class="card" data-go="upgrade"><b>Know what you can cook</b><p class="small">Recipes uses what's in your pantry.</p></button>` : ""}
      ${onList(p.id) ? `<p class="small">On your shopping list.</p>` : `<button class="btn ghost" data-act="shopadd" data-p="${p.id}">Add to shopping list</button>`}
      <button class="btn ghost danger" data-act="usedask">${I.tick}<span>Mark as used up</span></button></div>`;
  },

  recipes: () => shell(`<div class="body"><h1 class="vh">Recipes</h1><p class="count">Ranked by what you already have</p>
    <div style="display:flex;flex-direction:column;gap:10px">${[...RECIPES].sort((a, b) => can(b).length / b.ings.length - can(a).length / a.ings.length).map((r) => `<button class="rc" data-go="recipe" data-p="${r.id}"><span class="ph">${r.emoji}</span><div style="flex:1"><b>${esc(r.name)}</b><p class="small">You have ${can(r).length} of ${r.ings.length} · ${r.time} min</p></div></button>`).join("")}</div></div>`),

  recipe: () => {
    const r = RECIPES.find((x) => x.id === S.param); if (!r) return screens.recipes();
    const have = can(r);
    return backHeader("Recipes", r.name) + `<div class="body" style="flex:1">
      <div><h1 style="font-size:2rem">${esc(r.name)}</h1><p style="margin-top:4px">${r.time} min · you have ${have.length} of ${r.ings.length}</p></div>
      <div><span class="lbl">Ingredients</span>${r.ings.map(([k, n, q]) => { const has = S.pantry.some((p) => p.key === k); return `<div class="ing"><span>${esc(n)}, ${esc(q)}</span><span class="${has ? "ok" : "no"}">${has ? "In pantry" : "Missing"}</span></div>`; }).join("")}</div>
      <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px"><button class="btn" data-act="cook" data-p="${r.id}" ${S.down || !have.length ? "disabled" : ""}>Cook this</button><p class="small" style="text-align:center">Cooking takes the used items out of your pantry.</p></div></div>` + bar();
  },

  /* Profile menu, grouped by job (Settings holds the App list; Preferences is its own section, after Settings; People, Connect, My data here). A "Get started" strip is timed by how long you have been a member: AI link for the first 2 days, Invite for the first 5; each drops off when done and both settle into their segments afterwards. */
  menu: () => {
    const strip = [];
    if (S.day <= 2 && !S.aiDone) strip.push(["ai", "link", "Link your AI", "go"]);
    if (S.day <= 5 && !S.inviteDone) strip.push(["invite", "mail", "Invite someone", "sheet"]);
    const seg = (t, rows) => `<div><span class="lbl">${t}</span><div class="menu card">${rows}</div></div>`;
    return backHeader("Back", "") + `<div class="body">
    <div class="row"><span class="av" style="width:56px;height:56px;font-size:20px">${avt(S.persona, 30)}</span><div><b style="font-size:20px">${esc(me().name)}</b><p class="small">${role(S.persona) ? esc(role(S.persona).title) : "Our kitchen"}</p></div></div>
    ${strip.length ? `<div><span class="lbl">Get started</span><div class="menu card">${strip.map(([t, ic, l, k]) => `<button data-${k === "go" ? "go" : "sheet"}="${t}"><span class="row" style="gap:10px">${riSvg(ic, 20)}${l}</span><span class="chev" style="color:var(--muted)">${I.chev}</span></button>`).join("")}</div></div>` : ""}
    ${seg("App", `<button data-go="settings">Settings</button><button data-act="proto" data-p="History">History</button><button data-go="looks">Looks <span class="chev" style="color:var(--muted)">${I.chev}</span></button><span class="lbl sub">Kitchen setup</span><button data-go="cats">Categories <span class="chev" style="color:var(--muted)">${I.chev}</span></button><button data-act="proto" data-p="Locations and spots">Locations and spots <span class="chev" style="color:var(--muted)">${I.chev}</span></button><button data-sheet="pwa">Install <span class="chev" style="color:var(--muted)">${I.chev}</span></button>`)}
    ${seg("Preferences", `<button data-act="proto" data-p="Preferences">Preferences</button>`)}
    ${seg("People", `<button data-go="me">Me <span class="chip">${esc(me().name)}</span></button><button data-go="household">Household <span class="chip">${S.members.length}</span></button>${pays() ? `<button data-go="${S.recipes ? "household" : "upgrade"}">Plan and billing</button>` : ""}`)}
    ${seg("My data", `<button data-act="proto" data-p="Download inventory CSV">Download inventory CSV</button>`)}
    <button data-act="signout" class="danger" style="text-align:left;min-height:48px">Sign out</button>
    <div class="srow plain"><span class="small">Prototype: member for</span><div class="seg2" role="radiogroup" aria-label="Member for">${[[1, "Day 1"], [3, "Day 3"], [6, "Day 6"]].map(([d, l]) => `<button role="radio" aria-checked="${S.day === d}" class="${S.day === d ? "on" : ""}" data-act="day" data-p="${d}">${l}</button>`).join("")}</div></div></div>`;
  },

  /* Settings (owner, 11 Oct 2026 (2)): the list is the App group. Looks (the theme and display screen), Categories, Locations and spots, flat. Stock checks is no longer a row (Preferences took its place, and is its own top-level section of the profile menu). Plan the week stays off the list. */
  settings: () => {
    const left = S.pantry.filter((i) => i.starter).length;
    return backHeader("Back", "Settings") + `<div class="body">
      <span class="lbl">App</span><div class="menu card">
        <button data-go="looks">Looks <span class="chev" style="color:var(--muted)">${I.chev}</span></button>
        <span class="lbl sub">Kitchen setup</span>
        <button data-go="cats">Categories <span class="chev" style="color:var(--muted)">${I.chev}</span></button>
        <button data-act="proto" data-p="Locations and spots">Locations and spots <span class="chev" style="color:var(--muted)">${I.chev}</span></button></div>
      <p class="small">Categories and Locations and spots are the household's, not just this device's.</p>
      ${left ? `<div><h2 style="font-size:1.1rem">Sample items</h2><p class="small" style="margin-top:4px">${left} sample item${left === 1 ? "" : "s"} left. They count toward nothing until you change one.</p><button class="btn ghost" data-act="proto" data-p="Clear sample items" style="margin-top:8px">Clear sample items</button></div>` : ""}
      <button class="btn ghost" data-act="back">Back to Kitchie</button>
      <button data-act="signout" class="danger" style="text-align:left;min-height:48px">Sign out</button></div>`;
  },

  /* Looks: the existing theme and display screen (was the Look group on Settings, then "Look and display"). Mirrors Kitchie's browser-only display settings. */
  looks: () => {
    const c = S.cfg, sw = (k, l) => `<button class="srow" role="switch" aria-checked="${c[k]}" data-act="cfg" data-p="${k}"><span>${l}</span><span class="swt" aria-hidden="true"></span></button>`;
    return backHeader("Back", "Looks") + `<div class="body">
      <p class="small">These stay on this device. Only your theme and the emoji setting also travel with you, so pages open in the right colours.</p>
      <div class="card sgroup"><span class="lbl">Theme</span><div class="tgrid swatches" role="group" aria-label="Theme">${window.themeHtml ? window.themeHtml(["kitchie", "kitchie-day", "marmalade", "blueberry", "herb"], true) : ""}</div><p class="small" data-theme-name>${window.themeName ? esc(window.themeName()) : ""}</p>
        <div class="srow plain"><span>Item name size</span><div class="seg2" role="radiogroup" aria-label="Item name size">${[["small", "Small"], ["normal", "Normal"], ["large", "Large"]].map(([k, l]) => `<button role="radio" aria-checked="${c.size === k}" class="${c.size === k ? "on" : ""}" data-act="cfgsize" data-p="${k}">${l}</button>`).join("")}</div></div>
        ${sw("emoji", "Show emoji")}${sw("motion", "Reduce motion")}${sw("spot", "Show the spot")}${sw("amount", "Show the amount")}${sw("useby", "Show the use-by date")}${sw("activity", "Show household activity")}${sw("compact", "Compact rows")}
        <button class="btn ghost" data-act="cfgreset">Reset to defaults</button></div></div>`;
  },

  stock: () => backHeader("Settings", "Stock checks") + `<div class="body">
    <p>Stock checks ask "still about right?" about an item, only when you are already looking at it. Turning them off stops every question on the web and in chat. Estimates already stored stay, so the shopping list can still use them.</p>
    <div class="card sgroup"><button class="srow" role="switch" aria-checked="${S.stockChecks}" data-act="stocktoggle"><span>Ask me to check amounts</span><span class="swt" aria-hidden="true"></span></button></div>
    <p class="small">Keeping it off is fine. We will check back less and less often. Some of this is the household's: only household admins can change the shared settings.</p></div>`,

  cats: () => backHeader("Back", "Categories") + `<div class="body">
    <p>Rename a category for every item at once. This is the household's, not just this device's.</p>
    <div class="menu card">${S.order.cat.map((c) => `<button data-act="proto" data-p="Rename ${esc(c)}">${EM[c] || ""} ${esc(c)} <span class="small">Rename</span></button>`).join("")}</div></div>`,

  /* People, part one: Me (name, picture, my AI links). Spec: docs/knowledge/people-settings.md */
  me: () => backHeader("Back", "Me") + `<div class="body">
    <div class="row" style="gap:14px"><button class="avbig" data-sheet="avatar" aria-label="Change your picture"><span class="av" style="width:72px;height:72px;font-size:30px">${avt(S.persona, 40)}</span><span class="avedit" aria-hidden="true">${I.pencil}</span></button><p class="small">Tap the picture to change it</p></div>
    <div><span class="lbl">Name</span><div class="row" style="gap:8px"><input class="field" id="myname" value="${esc(me().name)}" maxlength="24" autocomplete="off" aria-label="Your name" style="flex:1"></div></div>
    <div><span class="lbl">Kitchen role</span><button class="m" data-sheet="role"><div style="flex:1"><b>${role(S.persona) ? esc(role(S.persona).title) : "Pick a kitchen role"}</b><p class="small">Only you can change yours</p></div><span class="chev" style="color:var(--muted)">${I.chev}</span></button></div>
    <div><span class="lbl">AI assistants</span><div class="m"><button class="rowbtn" data-act="linkopen" aria-label="Open your AI assistant link" style="flex:1;display:flex;align-items:center;gap:10px;text-align:left;min-height:44px"><div style="flex:1"><b>Your link</b> <span class="chip">${S.aiLink ? "Active" : "Not linked"}</span><p class="small">${S.aiLink ? "Works in ChatGPT, Claude or any assistant" : "Tap to get your link"}</p></div><span class="chev" style="color:var(--muted)">${I.chev}</span></button>${S.aiLink ? '<button class="danger" data-sheet="airevoke" aria-label="Revoke your AI link" style="min-height:44px;padding:0 8px">Revoke</button>' : ""}</div>
      <p class="small" style="margin-top:8px">One personal link. It acts as you and sees everything your household has. Revoking it stops every assistant at once.</p></div>
    <div><span class="lbl">Other households</span><button class="m" data-sheet="invite2"><div style="flex:1"><b>Invite someone to a different household</b><p class="small">They start their own new household</p></div><span class="chev" style="color:var(--muted)">${I.chev}</span></button></div></div>`,

  /* People, part two: Household (members, pending invites, leave). Anyone can remove anyone and anyone can cancel an invite (owner, 8 Oct 2026). */
  household: () => backHeader("Back", "Household") + `<div class="body">
    <div><h1 style="font-size:2rem">Our kitchen</h1><p style="margin-top:4px">${S.members.length} member${S.members.length === 1 ? "" : "s"}</p></div>
    <div><span class="lbl">Members</span>${S.members.map((w) => { const fo = S.founder === w, ad = isAdmin(w), canG = S.persona === S.founder && !fo; return `<div class="m"><button class="rowbtn" data-sheet="member" data-p="${w}" aria-label="${esc(PEOPLE[w].name)}, ${fo ? "founding member" : ad ? "admin" : "member"}" style="flex:1;display:flex;align-items:center;gap:10px;text-align:left;min-height:44px"><span class="avw"><span class="av">${avt(w)}</span>${role(w) ? `<span class="avbadge">${riSvg(role(w).ic, 13)}</span>` : ""}</span><div style="flex:1"><b>${esc(PEOPLE[w].name)}</b>${w === S.persona ? ' <span class="chip">You</span>' : ""} ${founderChip(w)}${fo ? "" : ` <span class="chip">${ad ? "Admin" : "Member"}</span>`}<p class="small">${role(w) ? esc(role(w).title) + " \u00b7 " : ""}${fo ? "Always an admin" : ad ? "Can change household settings" : "Can change their own preferences"}</p></div></button>${canG ? `<button data-act="${ad ? "revokeadmin" : "grantadmin"}" data-p="${w}" class="${ad ? "danger" : "link"}" aria-label="${ad ? "Remove " + esc(PEOPLE[w].name) + " as admin" : "Make " + esc(PEOPLE[w].name) + " an admin"}" style="font-size:14px;min-height:44px;padding:0 8px">${ad ? "Remove admin" : "Make admin"}</button>` : ""}</div>`; }).join("")}
      ${S.invites.map((i) => `<div class="m"><span class="av" style="border-style:dashed;color:var(--muted)">${riSvg("mail", 16)}</span><div style="flex:1"><b class="mono codeb">${fmtCode(i.code)}</b><p class="small">${i.own ? "Own household" : "Join Our kitchen"} \u00b7 expires in ${i.hours} hours \u00b7 works once</p></div><button data-act="copycode" data-p="${esc(i.code)}" class="link" aria-label="Copy code ${fmtCode(i.code)}" style="font-size:14px;min-height:44px;padding:0 8px">Copy</button><button data-act="revoke" data-p="${esc(i.code)}" class="danger" aria-label="Cancel code ${fmtCode(i.code)}" style="font-size:14px;min-height:44px;padding:0 8px">Cancel</button></div>`).join("")}</div>
    <button class="btn" data-sheet="invite" ${S.invites.length >= 3 ? "disabled" : ""}>Invite someone</button>${S.invites.length >= 3 ? `<p class="small">You have 3 unused codes, the most there can be. Cancel one or wait for one to be used or expire.</p>` : ""}
    <div class="dz"><span class="lbl danger">Danger zone</span><p class="small">Leave Our kitchen. You lose access until someone invites you back.</p><button class="btn ghost danger" data-act="leavestart">Leave household</button></div></div>`,

  ai: () => backHeader("Back", "AI assistant") + `<div class="body">
    <div><h2>Your personal link</h2><p style="margin-top:6px">Lets an assistant read and update Our kitchen as you. It sees everything your household has.</p></div>
    <span class="lbl">How to connect</span><div class="tabs">${["ChatGPT", "Claude", "Other"].map((t) => `<button data-act="aitab" data-p="${t}" class="${S.aiTab === t ? "on" : ""}">${t}</button>`).join("")}</div>
    <div class="field" style="display:flex;align-items:center"><span class="mono">https://kitchen.example/mcp/s9Xk-4tPq-L2vE</span></div>
    <button class="btn" data-act="copy">${S.aiLink ? "Copy link again" : "Copy link"}</button>
    <div style="display:flex;flex-direction:column;gap:10px;font-size:15px"><div class="row"><b>1</b><span>${S.aiTab === "Claude" ? "In Claude, open Settings, then Connectors." : S.aiTab === "ChatGPT" ? "In ChatGPT, open Settings, then Connectors." : "Open your assistant's connector settings."}</span></div><div class="row"><b>2</b><span>Paste your link and name it Kitchen.</span></div><div class="row"><b>3</b><span>Ask: "What should I cook tonight?"</span></div></div>
    <div style="border-top:1px solid var(--border);padding-top:14px" class="row"><div style="flex:1"><b>Your link</b> <span class="chip">${S.aiLink ? "Active" : "Not linked"}</span><p class="small">${S.aiLink ? "Linked. Revoke it any time" : "Copy the link above to connect it"}</p></div>${S.aiLink ? '<button data-sheet="airevoke" class="danger" style="min-height:44px;padding:0 8px">Revoke</button>' : ""}</div>
    <p class="small">Anyone with this link can act as you. Revoking it stops it at once.</p></div>`,

  upgrade: () => backHeader("Back", "Add to your kitchen") + (pays()
    ? `<div class="body"><div><h1>Recipes</h1><p style="margin-top:6px">Cook from what's already in your pantry.</p></div>
        <div style="display:flex;flex-direction:column;gap:12px"><div class="row"><span class="dot"></span>See what you can cook right now</div><div class="row"><span class="dot"></span>Use up items before they expire</div><div class="row"><span class="dot"></span>Cooking takes items out of your pantry</div><div class="row"><span class="dot"></span>Everyone in Our kitchen gets it</div></div>
        <div class="card"><b style="font-size:20px">$4.99 a month</b><p class="small">For the whole household. Cancel any time. (Example price.)</p></div>
        <button class="btn" data-go="checkout">Continue to payment</button><p class="small" style="text-align:center">You'll pay on a secure page, then come straight back.</p></div>`
    : `<div class="body"><div><h1>Recipes</h1><p style="margin-top:6px">Cook from what's already in your pantry.</p></div>
        <div class="card"><b>Arjan looks after the plan</b><p class="small">We can let them know you'd like Recipes for Our kitchen.</p></div>
        <button class="btn" data-act="ask">Ask Arjan to add it</button><button class="btn ghost" data-act="back">Not now</button></div>`),

  checkout: () => `<div class="top"><button class="back" data-act="back">&lsaquo; Cancel</button><span class="ttl">Secure payment</span><span style="width:64px"></span></div>
    <div class="body"><div class="card"><span class="lbl">Prototype payment page</span><b style="font-size:20px">Recipes for Our kitchen</b><p>$4.99 a month</p></div>
    <p class="small">This stands in for a hosted checkout page. No card is taken.</p><button class="btn" data-act="pay">Pay $4.99</button></div>`,

  notmember: () => `<div class="body fit nm">
    <div class="hero">${INVITE_SCENE}</div>
    <div class="hello"><span class="pill">${riSvg("lock", 14)}By invite only</span>
      <h1>Good kitchens start with an invite.</h1>
      <p>You're signed in as <b style="color:var(--fg)">j.smith@example.com</b>, which isn't in a household yet.</p></div>
    <div class="acts"><button class="btn" data-act="entercode">I have an invite code</button>
      <button class="btn ghost" data-act="askaround">Will ask around :-(</button>
      <button class="btn ghost" data-act="restart">Use a different Google account</button></div></div>`,
};

/* ---------- sheets ---------- */
/* ---------- item sheet (tile grid, owner's choice from fragments/item-sheet) ----------
   Tap a pantry row: a half-height sheet rises above the tab bar. Six tiles (five for level-only items), each showing its value;
   tap one and its editor takes over the sheet with a back arrow. Editors are the same fields/*.js files as the full item screen,
   fetched on the first tap of a tile (nothing extra loads when the sheet opens). "All fields" opens the full item screen.
   Counted = the unit is a count (reducible); anything weighed or measured is level-only. Used up = amount 0, shows Out, Undo toast. */
const TILE_FIELDS = { amount: ["qty"], level: [], min: ["min"], where: ["loc", "spot"], useby: ["useby"], cat: ["cat"] };
const TILE_TITLE = { amount: "Amount", level: "Level", min: "Minimum", where: "Where", useby: "Use by", cat: "Category" };
/* level icon: a BATTERY (owner, 11 Oct 2026, replaces the drop everywhere the level is drawn; item-edit-flyout decision 94). Four cells: Plenty 4 filled (green), Some 2 (amber), Running low 1 (red), Out none (black).
   No level word is drawn; the name is screen-reader text only (.sr-only). Same markup and classes as fragments/item-edit-flyout (IEF.battery), so the build copies one icon. */
const LEVELS = { Plenty: [4, "plenty"], Some: [2, "some"], "Running low": [1, "low"], Out: [0, "out"] };
function levelBattery(l, width = 38) {
  const [n, k] = LEVELS[l];
  let cells = ""; for (let i = 0; i < n; i++) cells += `<rect x="${4 + i * 6}" y="5" width="5.2" height="10" rx="1.2" fill="currentColor" stroke="none"/>`;
  return `<svg class="bat lv-${k}" width="${width}" height="${Math.round(width * 20 / 34)}" viewBox="0 0 34 20" aria-hidden="true" focusable="false"><rect x="1" y="2" width="29" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M31.4 7.5h.8a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-.8z" fill="currentColor" stroke="none"/>${cells}</svg>`;
}
const srOnly = (t) => `<span class="sr-only">${esc(t)}</span>`;
function itemSheetHtml() {
  const s = S.isheet, p = s && S.pantry.find((x) => x.id === s.id); if (!p) return "";
  const cnt = reducible(p), out = p.n <= 0, v = s.view, lv = level(p), err = S.ed.err;
  const close = `<button class="icon sclose" data-act="closesheet" aria-label="Close" title="Close">${I.x}</button>`;
  const errHtml = err ? `<p class="ferr" role="alert">${I.alert(18)}<span>${esc(err.msg)}</span>${err.retry ? '<button class="link" data-act="fretry">Try again</button>' : ""}</p>` : "";
  const grab = '<span class="grab" data-grab aria-hidden="true"></span>';
  let body;
  if (v === "tiles") {
    /* a tile with data is filled and shows its value; a tile with none is dashed and offers a quiet prompt, and tapping it is how you fill it */
    const tile = (k, ic, val, label, prompt, sr) => val === null
      ? `<button class="tl empty" data-act="itile" data-p="${k}">${I.plus.replace('width="22" height="22"', 'width="20" height="20"')}<span>${prompt}</span></button>`
      : `<button class="tl" data-act="itile" data-p="${k}" ${sr ? `aria-label="${esc(sr)}"` : ""}>${ic}${val === "" ? "" : `<b>${val}</b>`}${label ? `<span>${label}</span>` : ""}</button>`;
    const hasQty = typeof p.n === "number" && !Number.isNaN(p.n) && (cnt || ["g", "mL", "kg", "L"].includes(p.unit));
    const spot = p.spot && p.spot !== "Anywhere" ? esc(p.spot) : "";
    const place = p.area ? `<span class="small shw">${`<b>${esc(p.area)}</b>`}${spot ? " · " + spot : ""}</span>` : "";
    const more = `<button class="icon smore" data-act="itile" data-p="all" aria-label="All fields" title="All fields">${I.list}</button>`;
    const head = `<div class="shead"><span class="ph" aria-hidden="true">${emo(p)}</span><div class="sid"><b>${esc(p.name)}</b>${hasQty ? `<span class="small shq">${out ? "Out" : esc(fmtAmt(p))}</span>` : ""}${place}</div>${more}</div>`;
    /* the Level tile is the battery; on a counted item it opens the quantity stepper, on a level-only item it opens the level choices */
    const first = tile(cnt ? "amount" : "level", levelBattery(lv, 38), "", srOnly((cnt ? "Quantity and level, " : "Level, ") + lv), "");
    const minTile = tile("min", typeof I.down === "string" ? I.down.replace('width="22" height="22"', 'width="20" height="20"') : riSvg("alert", 20), p.min > 0 ? esc(fmtAmt({ n: p.min, unit: p.unit })) : null, "Minimum", "Add minimum");
    const tiles = `<div class="tiles4">${first}${tile("useby", riSvg("clock", 20), p.days === null ? null : esc(dayLabel(p.days)), "Use by", "Add use-by")}${minTile}${tile("cat", riSvg("basket", 20), p.cat ? esc(p.cat) : null, "", "Add category")}</div>`;
    const acts2 = `<div class="sacts">${out ? `<button class="btn ghost" disabled>${I.tick}<span>&nbsp;Marked Out</span></button>` : `<button class="btn ghost" data-act="sheetused">${I.tick}<span>&nbsp;Used up</span></button>`}${onList(p.id) ? `<button class="btn ghost" disabled>${I.tick}<span>&nbsp;On your list</span></button>` : `<button class="btn" data-act="sheetshop">${riSvg("cart", 20)}<span>&nbsp;Add to shopping</span></button>`}</div>`;
    body = head + errHtml + tiles + acts2;
  } else {
    const hd = `<div class="shead"><button class="icon" data-act="itile" data-p="tiles" aria-label="Back to ${esc(p.name)}" title="Back">${I.chev.replace("<svg", '<svg style="transform:scaleX(-1)"')}</button><div class="sid"><b>${TILE_TITLE[v]}</b><span class="small">${esc(p.name)}</span></div>${close}</div>`;
    let ed = "";
    if (v === "level") {
      ed = `<div class="opts lvpick" role="radiogroup" aria-label="Level">${Object.keys(LEVELS).reverse().map((l) => `<button class="opt${l === lv ? " on" : ""}" role="radio" aria-checked="${l === lv}" data-act="lvl" data-p="${l}">${levelBattery(l, 35)}${srOnly(l)}</button>`).join("")}</div><p class="small">The battery empties as it runs down. An empty battery means none left. Nothing is deleted: it stays in the pantry.</p>`;
    } else if (v === "amount") ed = ITEM_FIELDS.qty.html(p);
    else if (v === "where") ed = TILE_FIELDS.where.map((k) => `<span class="lbl">${k === "loc" ? "Location" : "Spot"}</span>${ITEM_FIELDS[k].html(p)}`).join("");
    else ed = ITEM_FIELDS[TILE_FIELDS[v][0]].html(p);
    body = hd + `<div class="sedit">${ed}</div>${errHtml}${S.ed.saved ? savedLine() : ""}`;
  }
  return `<div class="sheet-dim isheet" data-act="closesheet"><div class="sheet half${s.fresh ? " rise" : ""}" data-stop="1" role="dialog" aria-modal="true" aria-label="${esc(p.name)}">${grab}${body}</div></div>`;
}
function sheetHtml() {
  const sh = S.sheet; if (!sh) return "";
  if (sh === "item") return itemSheetHtml();
  const wrap = (inner, mid, dismiss) => `<div class="sheet-dim" ${mid && !dismiss ? "" : 'data-act="closesheet"'}><div class="sheet ${mid ? "mid" : ""}" data-stop="1">${inner}</div></div>`;
  if (sh === "filters" && S.fd) {
    const f = S.fd, tab = S.fTab;
    const chips = (t, vals) => `<div class="twoRow" data-two="${t}">${vals.map((v) => { const on = f[t].includes(v); return `<button class="mc ${on ? "on" : ""}" data-act="fpick" data-p="${t}|${esc(v)}" data-fchip="${t}|${esc(v)}" aria-pressed="${on}"><span class="mi" aria-hidden="true">${on ? I.tick : EM[v] || ""}</span><span>${esc(v)}</span></button>`; }).join("")}</div>`;
    const srow = (k) => { const st = f.st[k]; return `<div class="strow ${st.on ? "on" : ""}" data-fk="${k}"><button class="stt" data-act="fst" data-p="${k}" role="checkbox" aria-checked="${st.on}"><span class="dotc" aria-hidden="true">${st.on ? I.tick : ""}</span><span class="lbl2">${ROT[k].label}</span></button><button class="rot" data-rot="${k}" aria-label="${ROT[k].label}: ${ROT[k].opts[st.i][0]}. Drag up or down, or tap, to change"><span class="rv">${ROT[k].opts[st.i][0]}</span><span class="rar" aria-hidden="true"><i>▴</i><i>▾</i></span></button></div>`; };
    const body = tab === "filters"
      ? `<h3 class="fh">Status</h3><div class="strows">${Object.keys(ROT).map(srow).join("")}</div><h3 class="fh">Location</h3>${chips("locs", S.order.loc)}<h3 class="fh">Category</h3>${chips("cats", S.order.cat)}`
      : sortTab(f);
    return `<div class="sheet-dim" data-act="closesheet"><div class="sheet tall" data-stop="1" role="dialog" aria-label="Filters and sorting">
      <div class="fhead"><div class="ftabs" role="tablist"><button role="tab" aria-selected="${tab === "filters"}" class="${tab === "filters" ? "on" : ""}" data-act="ftab" data-p="filters">Filters</button><button role="tab" aria-selected="${tab === "sort"}" class="${tab === "sort" ? "on" : ""}" data-act="ftab" data-p="sort">Sort</button></div><button class="icon" data-act="closesheet" aria-label="Close" title="Close">${I.x}</button></div>
      <div class="fbody">${body}</div>
      <div class="ffoot"><div class="flinks"><button class="link" data-act="fclear">Clear</button><button class="link" data-act="fuselast" ${S.flast ? "" : "disabled"}>Use last filters</button></div><button class="btn" id="fshow" data-act="fshow" ${fItems(f).length === 0 ? "disabled" : ""}>${fShowText(f)}</button></div></div></div>`;
  }
  if (sh === "pwa") return wrap(`<h2>Install Kitchie</h2><p>Add it to your home screen, or again if you removed it. You can do this as often as you like.</p><p>On iPhone: tap Share, then Add to Home Screen.<br>On Android: tap the menu, then Add to Home screen.</p><button class="btn" data-act="pwadone">Done, I've installed it</button><button class="btn ghost" data-act="closesheet">Not now</button>`);
  if (sh === "add") return wrap(`<h2>Add item</h2>
    <input class="field" id="f-name" placeholder="Name" autocomplete="off"><input class="field" id="f-amt" placeholder="Amount (e.g. 2, 500 g, 1 bag)" autocomplete="off">
    <select class="field" id="f-area">${AREAS.map((a) => `<option>${a}</option>`).join("")}</select><input class="field" id="f-spot" placeholder="Spot (optional)" autocomplete="off">
    <select class="field" id="f-cat">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select>
    <span class="lbl">Use by</span><div class="pillrow">${[[null, "Not set"], [3, "+3 days"], [5, "+5 days"], [7, "+1 week"]].map(([d, l]) => `<button class="pill ${S.draft.days === d ? "on" : ""}" data-act="useby" data-p="${d}">${l}</button>`).join("")}</div>
    <button class="btn" data-act="additem">Save</button>`);
  if (sh === "want" && S.wantFor) {
    const p = S.pantry.find((q) => q.id === S.wantFor.id); if (!p) return "";
    const buy = S.wantFor.buy;
    return wrap(`<h2>${buy ? `How much did you buy?` : `How much ${esc(p.name)}?`}</h2><p>Your own words. One kilo, a packet, two bunches.</p>
      <input class="field" id="wantin" value="${esc(S.wantFor.text)}" placeholder="${buy ? "For example: 1 packet" : "Optional"}" autocomplete="off" aria-label="How much">
      <button class="btn" data-act="wantsave">${buy ? "Bought it" : "Save"}</button>`, true, true);
  }
  if (sh === "usedup") {
    const p = curItem(); if (!p) return "";
    const n = recentUsed(), err = S.ed.err && S.ed.err.key === "used";
    return wrap(`<h2>${esc(p.name)} is all gone?</h2>
      ${n >= 2 ? `<p class="guard" role="alert">${I.alert(20)}<span>You've used up ${n} items in the last 5 minutes. Is this one really finished?</span></p>` : ""}
      ${err ? `<p class="ferr" role="alert">${I.alert(18)}<span>${esc(S.ed.err.msg)}</span></p>` : ""}
      <button class="btn" data-act="usedconfirm">${err ? "Try again" : "Yes, used up"}</button><button class="btn ghost" data-act="closesheet">Keep it</button>`, true);
  }
  if (sh === "airevoke") return wrap(`<h2>Revoke your AI link?</h2><p>Every assistant using it loses access at once. You can make a new link any time.</p>
    <button class="btn" data-act="closesheet">Keep it</button><button class="btn ghost danger" data-act="airevoke">Yes, revoke it</button>`);
  if (sh === "invite" || sh === "invite2") {
    const own = sh === "invite2"; const c = own ? "906254" : "482913";
    return wrap(`<h2>${own ? "Invite to start a new household" : "Invite someone"}</h2><p>${own ? "They create their own household. They don't join Our kitchen." : "Share this code. They sign in with Google and join Our kitchen. Anyone in the household can make one."}</p>
    <div class="codebig" aria-label="Invite code ${fmtCode(c)}"><b class="mono">${fmtCode(c)}</b></div>
    <div class="row" style="gap:8px"><button class="btn" data-act="copycode" data-p="${c}">Copy code</button><button class="btn ghost" data-act="copyinvite">Copy link</button></div>
    <p class="small">Works once and expires in 24 hours. Up to 3 unused codes at a time. ${own ? "" : "It can be cancelled from Household."}</p>`);
  }
  if (sh === "expired") return wrap(`<h2>Sign in again to save</h2><p>Your sign-in ended. What you typed is kept, and you'll come straight back.</p><button class="btn" data-act="resume">Continue with Google</button>`, true);
  if (sh === "role") return wrap(`<h2>Your kitchen role</h2><p>Optional. It sits beside your name.</p>${roleEditor("sheet")}`);
  if (sh === "member") {
    const w = S.memberWho, r = role(w), self = w === S.persona;
    return wrap(`<div class="row"><span class="av" style="width:56px;height:56px;font-size:20px">${avt(w, 30)}</span><div><b style="font-size:20px">${esc(PEOPLE[w].name)}</b>${self ? ' <span class="chip">You</span>' : ""} ${founderChip(w)}${S.founder === w ? "" : ` <span class="chip">${isAdmin(w) ? "Admin" : "Member"}</span>`}</div></div>
      ${r ? `<div class="row" style="gap:14px">${roleIc(r, 56)}<div><b style="font-size:17px">${esc(r.title)}</b>${r.desc ? `<p style="margin-top:4px">${esc(r.desc)}</p>` : ""}</div></div>` : `<p>${self ? "You haven't picked a kitchen role." : PEOPLE[w].name + " hasn't picked a kitchen role."}</p>`}
      ${self ? `<button class="btn" data-sheet="role">${r ? "Change role" : "Pick a role"}</button>` : S.founder === w ? `<p class="small">The founding member can't be removed.</p>` : `<button class="btn ghost danger" data-act="removestart">Remove ${esc(PEOPLE[w].name)} from household</button>`}<button class="btn ghost" data-act="closesheet">Close</button>`);
  }
  if (sh === "removing") { const w = S.memberWho; return wrap(`<h2>Remove ${esc(PEOPLE[w].name)}?</h2><p>${esc(PEOPLE[w].name)} loses access to Our kitchen. What ${esc(PEOPLE[w].name)} added stays. Anyone in the household can invite them back.</p><button class="btn alert" data-act="removeconfirm">Remove ${esc(PEOPLE[w].name)}</button><button class="btn ghost" data-act="closesheet">Keep ${esc(PEOPLE[w].name)}</button>`, true); }
  if (sh === "leave") return wrap(`<h2>Leave Our kitchen?</h2>${S.members.length === 1 ? `<p><b>You are the last member.</b> If you leave, nobody is left to invite you back, so you can't get back in. The household can't be rejoined.</p>` : `<p>You lose access to its pantry, shopping and recipes. Nothing is deleted: the others keep everything. Someone has to invite you back to rejoin.</p>`}
    <label class="small" for="leavename">Type <b>${esc(me().name)}</b> to confirm</label><input class="field" id="leavename" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(me().name)}" aria-label="Type your name to confirm">
    <button class="btn alert" id="leavego" data-act="leaveconfirm" disabled>Leave household</button><button class="btn ghost" data-act="closesheet">Stay</button>`, true);
  if (sh === "avatar") return wrap(`<h2>Your picture</h2><p>Pick one. It shows beside your name.</p><div class="avgrid">${[""].concat(ICON_LIB.map((k) => "ri:" + k)).map((a) => `<button class="avopt" data-act="setavatar" data-p="${a}" aria-label="${a ? "Picture " + a.slice(3) : "Your initial"}" title="${a ? a.slice(3) : "Your initial"}" aria-pressed="${(S.avatars[S.persona] || "") === a}">${a ? riSvg(a.slice(3), 28) : PEOPLE[S.persona].initial}</button>`).join("")}</div><button class="btn ghost" data-act="closesheet">Close</button>`);
  return "";
}

/* ---------- panel ---------- */
function panelHtml() {
  const sw = (k, label) => `<label><span>${label}</span><button class="sw ${S[k] ? "on" : ""}" data-ctl="${k}" aria-pressed="${S[k]}"></button></label>`;
  return `<div class="grp"><h3>Who you are</h3><label><span>Signed in as</span><select data-ctl="persona"><option value="sam" ${S.persona === "sam" ? "selected" : ""}>Sam</option><option value="arjan" ${S.persona === "arjan" ? "selected" : ""}>Arjan (looks after the plan)</option></select></label></div>
  <div class="grp"><h3>Theme</h3><div class="tgrid">${(window.themeWarm&&window.themeWarm(),window.themeHtml())}</div></div>
  <div class="grp"><h3>Invite</h3>${sw("own", "Starting their own kitchen")}<label><span>People already in</span><select data-ctl="existing">${[1, 2, 3].map((n) => `<option value="${n}" ${S.existing === n ? "selected" : ""}>${n === 3 ? "3 or more" : n}</option>`).join("")}</select></label><label><span>Code entry shows</span><select data-ctl="codeState">${[["ok", "Fine"], ["wrong", "Wrong, used or expired"], ["locked", "Locked out"]].map(([v, l]) => `<option value="${v}" ${S.codeState === v ? "selected" : ""}>${l}</option>`).join("")}</select></label><p class="st">Changes the welcome words. Use "Invite link opens" to replay.</p></div>
  <div class="grp"><h3>Household</h3>${sw("recipes", "Has Recipes")}${sw("down", "Platform is down")}${sw("expireNext", "Sign-in ends on next save")}</div>
  <div class="grp"><h3>Home-screen prompt</h3><div class="st" id="pwa-st">${esc(pwaStatus())}</div><button class="pb" data-act="usage">Add 30 min of use</button><button class="pb" data-act="week">Move on a week</button><p class="st">Nothing until 1 hour of use. Then once, twice, once over three weeks. Then never. Shows on Today.</p></div>
  <div class="grp"><h3>Jump to</h3><button class="pb" data-act="restart">Invite link opens</button><button class="pb" data-act="jump" data-p="today">Home</button><button class="pb" data-act="jump" data-p="pantry">Pantry</button><button class="pb" data-act="jump" data-p="household">Household</button><button class="pb" data-act="jump" data-p="notmember">Not a member</button><button class="pb" data-act="jump" data-p="entercode">Enter a code</button><button class="pb" data-act="reset">Reset everything</button></div>
  <p class="st">Fake data. Nothing leaves your browser.</p>`;
}

/* ---------- render ---------- */
let lastScreen = null;
/* Quantity words, in the person's own language: on Save, a quantity that is exactly "amount unit" has the unit written in its standard short form (2 litres -> 2 L).
   Anything else is kept exactly as typed; nothing is forced on people. */
const UNITS = [
  ["mL", /^(ml|mls|millilit(?:er|re)s?)$/], ["L", /^(l|lt|ltr|ltrs|lit(?:er|re)s?|let(?:ter|re)s?)$/],
  ["kg", /^(kg|kgs|kilos?|kilograms?|kilogrammes?)$/], ["g", /^(g|gm|gms|grams?|grammes?)$/],
  ["lb", /^(lb|lbs|pounds?)$/], ["oz", /^(oz|ounces?)$/],
];
function tidyQty(text) {
  const t = String(text).trim(); if (!t) return t;
  const m = t.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+|\d*\s?[½¼¾]|a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|quarter)\s*(.+)$/i); if (!m) return t;
  let u = m[2].trim().toLowerCase().replace(/\.$/, "");
  if (/^(?:[a-z] ){2,}[a-z]$/.test(u)) u = u.replace(/ /g, ""); /* "L I T R E S" */
  for (const [short, re] of UNITS) if (re.test(u)) return `${m[1]} ${short}`;
  return t;
}
/* Custom view strip, three layouts to choose between (prototype switch under it). Every pill is remove-only: it drops that one condition from the live view and
   leaves the remembered last filters alone. To add something back the person opens the Filters sheet. */
const cvPills = (f) => [
  ...Object.keys(f.st).filter((k) => f.st[k].on).map((k) => ["st|" + k, ROT[k].label]),
  ...f.locs.map((v) => ["loc|" + v, v]), ...f.cats.map((v) => ["cat|" + v, v]),
  ...(f.key !== "name" || f.dir ? [["sort|", `${SORTK[f.key].label}: ${SORTK[f.key].dirs[f.dir]}`]] : []),
];
const cvPill = ([p, l]) => `<button class="cvp" data-act="cvrm" data-p="${esc(p)}" aria-label="Remove ${esc(l)}"><span>${esc(l)}</span><span class="cvx" aria-hidden="true">${I.x}</span></button>`;
const cvHtml = () => {
  const o = S.cvOpt || "A", f = S.fa, n = fItems(f).length, pills = `<div class="cvscroll" role="group" aria-label="Active filters">${cvPills(f).map(cvPill).join("")}</div>`;
  const sw = `<div class="srow plain"><span class="small">Prototype: strip</span><div class="seg2" role="radiogroup" aria-label="Strip layout">${["A", "B", "C"].map((x) => `<button role="radio" aria-checked="${o === x}" class="${o === x ? "on" : ""}" data-act="cvopt" data-p="${x}">${x}</button>`).join("")}</div></div>`;
  if (o === "B") return `<div class="cview col" role="status"><div class="cvtop"><span class="cvi">${riSvg("funnel", 20)}</span><div class="cvt"><b>Custom view</b><span>${n} item${n === 1 ? "" : "s"}</span></div><button class="link" data-sheet="filters">Edit</button><button class="icon" data-act="cvclear" aria-label="Clear custom view" title="Clear">${I.x}</button></div>${pills}</div>${sw}`;
  if (o === "C") return `<div class="cview one" role="status"><button class="cvfun" data-sheet="filters" aria-label="Edit filters. ${n} item${n === 1 ? "" : "s"}">${riSvg("funnel", 18)}<b>${n}</b></button>${pills}<button class="icon" data-act="cvclear" aria-label="Clear custom view" title="Clear">${I.x}</button></div>${sw}`;
  return `<div class="cview one" role="status"><span class="cvi">${riSvg("funnel", 20)}</span>${pills}<button class="link" data-sheet="filters">Edit</button></div><p class="small cvn">${n} item${n === 1 ? "" : "s"}</p>${sw}`;
};
/* Sort tab (owner chose option B, 6 October 2026): the sort keys as one row, and a single button that flips the order. */
const sortTab = (f) => `<h3 class="fh">Sort by</h3><div class="seg2 wide" role="radiogroup" aria-label="Sort by">${Object.entries(SORTK).map(([k, v]) => `<button role="radio" aria-checked="${f.key === k}" class="${f.key === k ? "on" : ""}" data-act="fsort" data-p="${k}">${v.label}</button>`).join("")}</div><button class="flip" data-act="fdir" data-p="${f.dir ? 0 : 1}" aria-label="Order: ${SORTK[f.key].dirs[f.dir]}. Tap to flip"><span>${SORTK[f.key].dirs[f.dir]}</span><span aria-hidden="true">⇅</span></button>`;
/* a chip row is one line when everything fits on it, and two scrolling lines only when it does not */
function fitRows() { document.querySelectorAll(".twoRow").forEach((g) => { g.style.gridTemplateRows = "auto"; if (g.scrollWidth > g.clientWidth + 1) g.style.gridTemplateRows = "repeat(2,auto)"; }); }
function render() {
  const phone = document.getElementById("phone");
  const prev = phone.querySelector(".body"); const top = prev && lastScreen === S.screen ? prev.scrollTop : 0;
  if (S.screen === "pantry") S.seenP = S.pantry.filter((i) => i.recent).length;
  if (S.screen === "recipes") S.seenR = RECIPES.filter((r) => r.new).length;
  const sc = screens[S.screen] || screens.today;
  phone.innerHTML = sc() + sheetHtml() + (S.toast ? `<div class="toast ${S.sheet === "item" ? "abovesheet" : ""}" role="status"><span>${esc(S.toast)}</span>${undoFn ? '<button class="tact" data-act="undo">Undo</button>' : ""}</div>` : "");
  document.body.classList.toggle("isheet-open", S.sheet === "item"); phone.dataset.size = S.cfg.size; phone.dataset.motion = S.cfg.motion ? "reduce" : ""; phone.classList.toggle("compact", S.cfg.compact);
  const nb = phone.querySelector(".body"); if (nb && top) nb.scrollTop = top;
  lastScreen = S.screen; if (S.isheet) S.isheet.fresh = false;
  const panel = document.getElementById("panel");
  if (!panel.dataset.ready || S.panelDirty) { panel.innerHTML = panelHtml(); panel.dataset.ready = "1"; S.panelDirty = false; }
  else { const st = document.getElementById("pwa-st"); if (st) st.textContent = pwaStatus(); }
  fitRows();
  const s = document.getElementById("search"); if (s && S.searchFocus) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
}
const refreshPanel = () => { S.panelDirty = true; };

/* ---------- actions ---------- */
function commitAdd() {
  const x = S.pending; if (!x) return; S.pending = null; S.sheet = null;
  S.pantry.unshift({ id: "n" + Date.now(), key: x.name.toLowerCase().split(/[ ,]/)[0], emoji: emojiOf(x.name), name: x.name, n: x.n, unit: x.unit, area: x.area, spot: x.spot || "Anywhere", cat: x.cat, days: x.days, upd: 100 + S.pantry.length, recent: true, by: me().name, min: 0, est: false });
  render(); toast("Added " + x.name);
}
function parseAmt(t) {
  const m = String(t).trim().match(/^([\d.,/]+)?\s*(.*)$/); let n = m && m[1] ? Number(m[1].replace(",", ".")) : 1; if (!isFinite(n)) n = 1;
  let u = (m && m[2] ? m[2] : "").trim(); const known = ["g", "kg", "mL", "L", ...COUNT_UNITS.filter(Boolean)]; const hit = known.find((k) => k.toLowerCase() === u.toLowerCase()); return { n, unit: hit || "" };
}

const acts = {
  back, closesheet() { S.sheet = null; S.isheet = null; render(); },
  signin() { S.joined = true; S.rdraft = null; S.iconPick = false; if (S.own) { S.pantry = []; S.members = [S.persona]; S.invites = []; S.roles = {}; } go("welcome", null, { replace: true }); },
  gotit() { S.bannerGot = true; render(); },
  retry() { toast(S.down ? "Still reconnecting" : "Back online"); },
  fold(a) { S.collapsed[a] = !S.collapsed[a]; render(); },
  areatab(a) { S.areaTab = a; render(); },
  mic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast("Voice search isn't available in this browser"); return; }
    const r = new SR(); r.lang = "en-AU"; r.onresult = (e) => { S.search = e.results[0][0].transcript; S.searchFocus = true; render(); S.searchFocus = false; }; r.onerror = () => toast("Couldn't hear that. Try again"); r.start(); toast("Listening…");
  },
  searchcancel() { closeSearch(); },
  useone(id) {
    if (S.down) return; const i = S.pantry.find((x) => x.id === id); if (!i) return;
    if (!reducible(i) || i.n <= 1) { markUsedUp(id); return; }
    const was = { n: i.n, upd: i.upd }; i.n -= 1; i.upd = 200; render();
    toast(`${i.name}: ${fmtAmt(i)} left`, () => { i.n = was.n; i.upd = was.upd; render(); });
  },
  usedup(id) { if (S.down) return; markUsedUp(id); },
  isheet(id) { S.ed = noEd(); S.sheet = "item"; S.isheet = { id, view: "tiles", fresh: true }; render(); const t = document.querySelector(".sheet.half .tl"); if (t) t.focus({ preventScroll: true }); },
  itile(k) {
    const s = S.isheet; if (!s) return;
    if (k === "all") { const id = s.id; S.sheet = null; S.isheet = null; go("item", id); return; }
    const files = k === "tiles" ? [] : TILE_FIELDS[k];
    const open = () => { S.ed = noEd(); s.view = k; render(); const b = document.querySelector(".sheet.half .shead .icon"); if (b) b.focus({ preventScroll: true }); };
    Promise.all(files.map(loadField)).then(open).catch(() => { S.ed = { ...noEd(), err: { key: k, msg: "Couldn't open this. Check your connection." } }; render(); });
  },
  sheetused() { const s = S.isheet; if (!s) return; if (S.down) { S.ed.err = { key: "used", msg: "Not saved. We can't reach the platform." }; render(); return; } S.sheet = null; S.isheet = null; markUsedUp(s.id); },
  sheetshop() { const s = S.isheet; if (!s) return; S.sheet = null; S.isheet = null; acts.shopadd(s.id); },
  lvl(l) {
    const p = curItem(); if (!p) return;
    if (l === "Out") { if (p.n > 0) acts.sheetused(); return; }
    if (!LEVELS[l]) return;
    save("level", { lvl: l, n: p.n > 0 ? p.n : (p.was || STEP[p.unit] || 1) });
  },
  usedask() { S.ed = noEd(); S.sheet = "usedup"; render(); },
  usedconfirm() {
    if (S.down) { S.ed.err = { key: "used", msg: "Not saved. We can't reach the platform." }; render(); return; }
    const id = S.param; S.sheet = null; back(); markUsedUp(id);
  },
  undo() { const f = undoFn; undoFn = null; clearTimeout(toast.t); S.toast = null; if (f) f(); },
  edit(k) {
    const reopen = () => { const b = document.querySelector(`[data-act=edit][data-p=${k}]`); if (b) b.focus(); };
    if (S.ed.open === k) { S.ed = noEd(); render(); reopen(); return; }
    loadField(k).then(() => { S.ed = { ...noEd(), open: k }; render(); reopen(); })
      .catch(() => { S.ed = { ...noEd(), err: { key: k, msg: "Couldn't open this. Check your connection." } }; render(); });
  },
  fset(v, quiet) {
    const [k, op, ...rest] = v.split("|"), p = curItem(); if (!p) return;
    if (S.sheet === "item" && v === "qty|step|-1" && reducible(p) && !S.down) { const id = p.id; if (p.n <= 1) { S.sheet = null; S.isheet = null; } acts.useone(id); return; } /* same as the left swipe: one off, the last one is used up with an Undo toast */
    const out = ITEM_FIELDS[k].set[op](p, rest.join("|"));
    if (typeof out === "string") { S.ed.err = { key: k, msg: out }; S.ed.saved = null; render(); } else save(k, out, quiet === true);
    const again = [...document.querySelectorAll("[data-act=fset]")].find((el) => el.dataset.p === v); if (again && !quiet) again.focus();
  },
  fretry() { const e = S.ed.err; if (!e) return; if (e.retry) save(e.key, e.retry); else acts.edit(e.key); },
  picker() { S.ed.picking = !S.ed.picking; render(); },
  cook(id) {
    if (S.down) return;
    const r = RECIPES.find((x) => x.id === id); const keys = can(r).map(([k]) => k);
    const before = S.pantry.length; S.pantry = S.pantry.filter((p) => !keys.includes(p.key));
    go("pantry"); toast(`Used ${before - S.pantry.length} items. Enjoy.`);
  },
  useby(d) { S.draft.days = d === "null" ? null : Number(d); const keep = ["f-name", "f-amt", "f-area", "f-spot", "f-cat"].map((k) => { const e = document.getElementById(k); return [k, e ? e.value : ""]; }); render(); keep.forEach(([k, v]) => { const e = document.getElementById(k); if (e) e.value = v; }); },
  additem() {
    const name = document.getElementById("f-name").value.trim(); if (!name) return;
    const a = parseAmt(document.getElementById("f-amt").value || "1");
    S.pending = { name, n: a.n, unit: a.unit, area: document.getElementById("f-area").value, spot: document.getElementById("f-spot").value.trim(), cat: document.getElementById("f-cat").value, days: S.draft.days };
    if (S.expireNext) { S.expireNext = false; refreshPanel(); S.sheet = "expired"; render(); } else commitAdd();
  },
  resume() { S.sheet = null; commitAdd(); },
  rmode() { S.rmode = S.rmode === "loc" ? "cat" : "loc"; S.areaTab = "All"; S.rflip = true; render(); S.rflip = false; },
  ftab(t) { S.fTab = t; render(); },
  fst(k) { S.fd.st[k].on = !S.fd.st[k].on; refreshSheet(); },
  fpick(v) { const [t, val] = v.split("|"); const a = S.fd[t], n = a.indexOf(val); if (n < 0) a.push(val); else a.splice(n, 1); refreshSheet(); },
  fclear() { S.fd = blankF(); render(); },
  fuselast() { if (S.flast) { S.fd = clone(S.flast); render(); } },
  fsort(k) { S.fd.key = k; S.fd.dir = 0; render(); },
  fdir(n) { S.fd.dir = Number(n); render(); },
  fshow() { const f = S.fd; S.fa = fActive(f) ? clone(f) : null; if (S.fa) S.flast = clone(f); S.sheet = null; S.fd = null; render(); },
  cvclear() { S.fa = null; render(); },
  cvopt(o) { S.cvOpt = o; render(); },
  cvrm(p) { const [t, v] = p.split("|"), f = S.fa; if (!f) return; if (t === "st") f.st[v].on = false; else if (t === "loc") f.locs = f.locs.filter((x) => x !== v); else if (t === "cat") f.cats = f.cats.filter((x) => x !== v); else { f.key = "name"; f.dir = 0; } if (!fSummary(f)) S.fa = null; render(); },
  openuse() { S.areaTab = "All"; const f = blankF(); f.key = "useby"; S.fa = f; S.flast = clone(f); go("pantry"); },
  openlow() { S.areaTab = "All"; const f = blankF(); f.st.low.on = true; S.fa = f; S.flast = clone(f); go("pantry"); },
  shopadd(id) { const i = S.pantry.find((x) => x.id === id); if (!i) return; addToList(id); toast(i.name + " added to your shopping list"); },
  shopdone(id) { S.shop = S.shop.filter((x) => x !== id); render(); },
  shoptick(id) { const x = sx(id); x.tick = !x.tick; render(); },
  shopwant(id) { const x = sx(id); S.wantFor = { id, text: x.want, buy: false }; S.sheet = "want"; render(); setTimeout(() => { const f = document.getElementById("wantin"); if (f) f.focus(); }); },
  shoprm(id) { const i = S.pantry.find((q) => q.id === id), was = S.slx[id]; S.shop = S.shop.filter((x) => x !== id); delete S.slx[id]; toast((i ? i.name : "Item") + " taken off your list", () => { S.shop.push(id); S.slx[id] = was; render(); }); },
  shopbuy(id) { const x = sx(id); if (!x.want.trim()) { S.wantFor = { id, text: "", buy: true }; S.sheet = "want"; render(); setTimeout(() => { const f = document.getElementById("wantin"); if (f) f.focus(); }); return; } commitBought([id]); },
  wantsave() { const w = S.wantFor; if (!w) return; const t = (document.getElementById("wantin") || {}).value || ""; S.wantFor = null; S.sheet = null; sx(w.id).want = tidyQty(t); if (w.buy) { if (!t.trim()) { render(); return; } commitBought([w.id]); } else render(); },
  shopfinish() { const ids = S.shop.filter((id) => sx(id).tick); if (ids.length) commitBought(ids); },
  rowtap(id) { if (S.sel) { S.sel = S.sel.includes(id) ? S.sel.filter((x) => x !== id) : [...S.sel, id]; if (!S.sel.length) S.sel = null; render(); } else go("item", id); },
  selstart(id) { S.sel = [id]; render(); },
  selcancel() { S.sel = null; render(); },
  seladd() { const n = S.sel.length; S.sel.forEach((id) => addToList(id)); S.sel = null; toast(n + (n === 1 ? " item" : " items") + " added to your shopping list"); },
  copykitchen() { toast("Kitchen list copied"); },
  copy() { S.aiDone = true; S.aiLink = true; toast("Link copied"); }, copyinvite() { S.inviteDone = true; toast("Invite link copied"); }, day(d) { S.day = +d; render(); },
  revoke(code) { S.invites = S.invites.filter((i) => i.code !== code); render(); toast("Code cancelled"); },
  copycode(code) { S.inviteDone = true; toast("Code " + fmtCode(code) + " copied"); },
  entercode() { go("entercode"); },
  othercode() { go("entercode", null, { replace: true }); },
  usecode() { const d = S.codeTyped.replace(/\D/g, ""); if (S.codeState === "locked") return render(); if (d.length !== 6) { S.codeState = "wrong"; return render(); } S.code = d; S.codeState = "ok"; go("invite", null, { replace: true }); },
  copyinvite2() { toast("Invite link copied"); },
  setavatar(a) { if (a) S.avatars[S.persona] = a; else delete S.avatars[S.persona]; S.sheet = null; render(); toast("Picture changed"); },
  grantadmin(w) { S.admins.push(w); render(); toast(PEOPLE[w].name + " is now an admin"); },
  revokeadmin(w) { S.admins = S.admins.filter((x) => x !== w); render(); toast(PEOPLE[w].name + " is no longer an admin"); },
  removestart() { S.sheet = "removing"; render(); },
  removeconfirm() { const w = S.memberWho, n = PEOPLE[w].name; S.members = S.members.filter((x) => x !== w); S.admins = S.admins.filter((x) => x !== w); S.sheet = null; render(); toast(n + " removed"); },
  leavestart() { S.sheet = "leave"; render(); },
  leaveconfirm() { const v = document.getElementById("leavename"); if (!v || v.value.trim().toLowerCase() !== me().name.toLowerCase()) return; S.members = S.members.filter((x) => x !== S.persona); S.sheet = null; S.stack = []; go("notmember", null, { replace: true }); toast("You left Our kitchen"); },
  aitab(t) { S.aiTab = t; render(); }, airevoke() { S.aiLink = false; S.sheet = null; render(); toast("Link revoked. No assistant can use it now"); },
  linkopen() { go("ai"); },
  ask() { toast("Sent to Arjan"); S.stack.pop(); go("today", null, { replace: true }); },
  pay() { S.recipes = true; refreshPanel(); S.stack = []; go("recipes", null, { replace: true }); toast("Recipes added for Our kitchen"); },
  rolepick(i) { S.anim = !S.rdraft; const r = ROLE_PRESETS[Number(i)]; S.rdraft = { pi: Number(i), ic: r.ic, title: r.title, desc: r.desc }; S.iconPick = false; render(); },
  roleicons() { S.iconPick = !S.iconPick; render(); },
  iconchoose(k) { if (S.rdraft) S.rdraft.ic = k; S.iconPick = false; render(); },
  roleconfirm(ctx) {
    const d = S.rdraft; if (d && d.title.trim()) S.roles[S.persona] = { ic: d.ic, title: d.title.trim(), desc: d.desc.trim() };
    S.rdraft = null; S.iconPick = false; S.sheet = null; refreshPanel();
    if (ctx === "welcome") go("today", null, { replace: true }); else { render(); toast("Role saved"); }
  },
  rolelater(ctx) { S.rdraft = null; S.iconPick = false; S.sheet = null; if (ctx === "welcome") go("today", null, { replace: true }); else render(); },
  pwano() { S.pwaCard = false; render(); },
  pwadone() { S.pwa.done = true; S.pwaCard = false; S.sheet = null; render(); toast("Added. See you on the home screen."); },
  usage() { S.usageMin += 30; render(); },
  cfg(k) { S.cfg[k] = !S.cfg[k]; render(); },
  cfgsize(v) { S.cfg.size = v; render(); },
  cfgreset() { S.cfg = initial().cfg; render(); toast("Display settings back to defaults."); },
  stocktoggle() { S.stockChecks = !S.stockChecks; render(); },
  proto(l) { toast(`${l}: not in this prototype.`); },
  week() { S.week += 1; render(); },
  signout() { const k = { day: S.day, cfg: S.cfg, persona: S.persona, recipes: S.recipes, down: S.down, own: S.own, existing: S.existing, usageMin: S.usageMin, week: S.week, pwa: S.pwa }; S = Object.assign(initial(), k); refreshPanel(); render(); },
  restart() { const k = { persona: S.persona, recipes: S.recipes, down: S.down, own: S.own, existing: S.existing }; S = Object.assign(initial(), k); refreshPanel(); render(); },
  reset() { S = initial(); refreshPanel(); render(); },
  askaround() { toast("No rush. The kitchen will keep."); },
  jump(p) { S.joined = S.joined || p !== "notmember"; S.stack = []; go(p, null, { replace: true }); },
};

/* bought: the amount goes into Pantry (the leading number in what you wrote, else 1) and the item leaves the list */
function commitBought(ids) {
  const names = [];
  ids.forEach((id) => { const p = S.pantry.find((q) => q.id === id), x = sx(id); if (p) { const m = /^\s*(\d+(?:\.\d+)?)/.exec(x.want || ""); p.n = (p.n > 0 ? p.n : 0) + (m ? Number(m[1]) : 1); p.recent = true; names.push(p.name); } S.shop = S.shop.filter((q) => q !== id); delete S.slx[id]; });
  toast(names.length === 1 ? names[0] + " is in your pantry" : names.length + " items are in your pantry");
}
let lastGesture = 0;
document.addEventListener("click", (e) => {
  if (Date.now() - lastGesture < 450 && e.target.closest(".swr,.body.tight,.grouphead")) { e.stopPropagation(); return; }
  const t = e.target.closest("[data-act],[data-go],[data-sheet],[data-ctl],[data-stop]"); if (!t) return;
  if (t.dataset.stop && !t.dataset.act && !t.dataset.go && !t.dataset.sheet) return;
  if (t.dataset.ctl) { const k = t.dataset.ctl; if (k === "persona" || k === "existing" || k === "codeState") return; S[k] = !S[k]; refreshPanel(); render(); return; }
  if (t.dataset.sheet) {
    if (t.dataset.sheet === "member") S.memberWho = t.dataset.p;
    if (t.dataset.sheet === "add") S.draft = { days: null };
    if (t.dataset.sheet === "filters") { S.fd = S.fa ? clone(S.fa) : blankF(); S.fTab = "filters"; }
    if (t.dataset.sheet === "role") { const r = role(S.persona); S.rdraft = r ? { pi: -1, ic: r.ic, title: r.title, desc: r.desc } : null; S.iconPick = false; }
    S.sheet = t.dataset.sheet; render(); return;
  }
  if (t.dataset.act) { if (t.disabled) return; e.stopPropagation(); (acts[t.dataset.act] || (() => {}))(t.dataset.p, t.dataset.d); return; }
  if (t.dataset.go) { S.sheet = null; return go(t.dataset.go, ["item", "recipe"].includes(t.dataset.go) ? t.dataset.p : null); }
});
document.addEventListener("change", (e) => { const fin = e.target.dataset && e.target.dataset.fin; if (fin) { acts.fset(fin + "|" + e.target.value, e.target.type === "text"); return; } const c = e.target.dataset && e.target.dataset.ctl; if (e.target.id === "myname") { if (!e.target.value.trim()) e.target.value = me().name; S.nameDirty = false; return; } if (c === "persona") { S.persona = e.target.value; refreshPanel(); render(); } if (c === "existing") { S.existing = Number(e.target.value); render(); }  if (c === "codeState") { S.codeState = e.target.value; render(); } });
document.addEventListener("input", (e) => { if (e.target.id === "codein") { const d = e.target.value.replace(/\D/g, "").slice(0, 6); S.codeTyped = d.length > 3 ? d.slice(0, 3) + " " + d.slice(3) : d; e.target.value = S.codeTyped; } if (e.target.id === "r-title" && S.rdraft) S.rdraft.title = e.target.value; if (e.target.id === "r-desc" && S.rdraft) S.rdraft.desc = e.target.value; if (e.target.id === "search") { S.search = e.target.value; document.getElementById("plist").innerHTML = listHtml(); }
  if (e.target.id === "myname") { const v = e.target.value.trim().slice(0, 24); if (v && v !== me().name) { PEOPLE[S.persona].name = v; PEOPLE[S.persona].initial = initials(S.persona); const big = document.querySelector(".avbig .av"); if (big && !S.avatars[S.persona]) big.textContent = PEOPLE[S.persona].initial; S.nameDirty = true; } } /* saves as you type: no Save button */
  if (e.target.id === "leavename") document.getElementById("leavego").disabled = e.target.value.trim().toLowerCase() !== me().name.toLowerCase(); });
/* swipe a running-low row to add it; press and hold to start picking several */
let g = null; const DEEP = 190; /* px: past this a left swipe means used up, not use one */
document.addEventListener("pointerdown", (e) => {
  const row = e.target.closest("[data-swipe]"); if (!row || e.button > 0) return;
  g = { id: row.dataset.swipe, row, fg: row.querySelector(".swfg"), x: e.clientX, y: e.clientY, dx: 0, swiping: false, long: false };
  g.shop = row.dataset.sw === "shop";
  g.pan = row.dataset.sw === "pantry"; g.kind = row.dataset.kind;
  if (!g.shop && !g.pan) g.timer = setTimeout(() => { if (g && !g.swiping) { g.long = true; lastGesture = Date.now(); if (navigator.vibrate) navigator.vibrate(15); acts.selstart(g.id); } }, 480);
});
document.addEventListener("pointermove", (e) => {
  if (!g || g.long) return;
  const dx = e.clientX - g.x, dy = e.clientY - g.y;
  if (!g.swiping) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { clearTimeout(g.timer); g = null; return; }
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { g.swiping = true; clearTimeout(g.timer); g.row.classList.add("drag"); }
    else return;
  }
  g.dx = dx; g.fg.style.transform = `translateX(${dx}px)`;
  g.row.classList.toggle("armed", Math.abs(dx) > 90); g.row.classList.toggle("rt", dx > 0);
  if (g.pan) { const deep = dx < -DEEP && g.kind === "count"; if (deep !== g.row.classList.contains("deep")) { g.row.classList.toggle("deep", deep); if (navigator.vibrate) navigator.vibrate(10); } }
});
const endGesture = () => {
  if (!g) return; clearTimeout(g.timer); const x = g; g = null;
  if (!x.swiping) return;
  lastGesture = Date.now(); x.row.classList.remove("drag");
  if (x.pan && Math.abs(x.dx) > 90) {
    x.fg.style.transform = `translateX(${x.dx > 0 ? 110 : -110}%)`;
    setTimeout(() => { x.fg.style.transform = ""; x.row.classList.remove("armed", "deep"); (x.dx > 0 ? acts.shopadd : x.dx < -DEEP ? acts.usedup : acts.useone)(x.id); }, 160);
  } else if (Math.abs(x.dx) > 90) { x.fg.style.transform = `translateX(${x.dx > 0 ? 110 : -110}%)`; setTimeout(() => (x.shop ? (x.dx > 0 ? acts.shopbuy : acts.shoprm) : acts.shopadd)(x.id), 160); }
  else { x.fg.style.transform = ""; x.row.classList.remove("armed"); }
};
document.addEventListener("pointerup", endGesture); document.addEventListener("pointercancel", endGesture);
document.addEventListener("contextmenu", (e) => { if (e.target.closest("[data-swipe]")) e.preventDefault(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && S.sheet === "item" && S.isheet) { if (S.isheet.view !== "tiles") acts.itile("tiles"); else acts.closesheet(); return; } const t = e.target; if ((e.key === "Enter" || e.key === " ") && t.matches && t.matches('[role=button][data-act]')) { e.preventDefault(); t.click(); } });
document.addEventListener("scroll", (e) => { const sn = e.target; if (sn.id !== "snap") return; const n = Math.round(sn.scrollLeft / sn.clientWidth); sn.parentElement.querySelectorAll(".dots i").forEach((d, k) => d.classList.toggle("on", k === n)); }, true);
/* pull down at the top of Pantry: a shallow pull opens search, a deep pull refreshes. Mouse and touch. */
/* Pantry top row: pull down for search (first threshold), keep pulling for refresh (second). Spec: docs/knowledge/pantry-pull-row.md */
const PULL_SEARCH = 70, PULL_REFRESH = 170, REFRESH_MS = 2400, REFRESH_MS_REDUCED = 1600; let pl = null, refreshTimer = null;
const rowState = () => (S.refresh ? "anim" : S.searchOpen ? "search" : "rest");
function setRow(row, st) { row.dataset.state = st; row.classList.remove("peek"); if (st !== "search") row.classList.remove("lock"); const f = row.querySelector(".pl-front"); f.style.transition = ""; f.style.transform = ""; f.style.opacity = ""; const sp = row.querySelector(".spill"), cn = row.querySelector(".pl-search .cancel"); if (sp) { sp.style.transition = ""; sp.style.width = ""; } if (cn) { cn.style.transition = ""; cn.style.opacity = ""; } }
/* While the finger is down between 8 and 70 px the hide follows it: Filters and Add slide away and fade, the magnifier opens into the field and Cancel fades in, all in step with the pull. At 70 px they are exactly where the locked state puts them, so the lock does not jump. */
function pullFollow(row, dy) {
  const f = row.querySelector(".pl-front"), sp = row.querySelector(".spill"), cn = row.querySelector(".pl-search .cancel");
  if (reducedMotion()) { f.style.transition = "none"; f.style.transform = `translateY(${Math.round(Math.min(dy / PULL_SEARCH, 1) * 22)}px)`; return; }
  const p = Math.max(0, Math.min(1, (dy - 8) / (PULL_SEARCH - 8))), e = p * p * (3 - 2 * p);
  f.style.transition = "none"; f.style.transform = `translateY(${e * 100}%)`; f.style.opacity = String(1 - e);
  sp.style.transition = "none"; sp.style.width = `calc(48px + (100% - 132px) * ${e})`;
  cn.style.transition = "none"; cn.style.opacity = String(e);
}
function openSearch(row) { S.searchOpen = true; setRow(row, "search"); const s = document.getElementById("search"); if (s) s.focus({ preventScroll: true }); }
function closeSearch() {
  S.searchOpen = false; S.search = ""; const row = document.getElementById("prow"); if (!row) return; const s = document.getElementById("search"); if (s) { s.value = ""; s.blur(); }
  setRow(row, S.refresh ? "anim" : "rest"); const l = document.getElementById("plist"); if (l) l.innerHTML = listHtml();
}
function pullStart(target, x, y) {
  const b = target.closest && target.closest(".body.tight"); if (!b || S.screen !== "pantry" || S.sheet || S.refresh || S.searchOpen || b.scrollTop > 0 || target.closest("input")) return; /* search open: no pull at all, so a refresh can never start while it is held open */
  pl = { x, y, dy: 0, b, row: b.querySelector("#prow"), st: null };
}
function pullMove(x, y, e) {
  if (!pl) return; if (pl.b.scrollTop > 0) { pullCancel(); return; }
  const dy = y - pl.y;
  if (dy <= 8) { if (pl.dy) { pl.dy = 0; pullShow("base"); } return; }
  if (!pl.dy && Math.abs(x - pl.x) > dy) { pl = null; return; } /* a sideways drag is not a pull */
  if (e && e.cancelable) e.preventDefault();
  pl.dy = dy; pullShow(dy >= PULL_REFRESH ? "let" : dy >= PULL_SEARCH ? "search" : "peek", dy);
}
/* shows the state under the finger without committing it */
function pullShow(st, dy) {
  const row = pl.row, f = row.querySelector(".pl-front"), msg = row.querySelector("#pmsg");
  if (st === "base") { pl.st = null; setRow(row, rowState()); msg.setAttribute("aria-hidden", "true"); return; }
  if (st === "peek") { row.classList.remove("lock"); row.dataset.state = rowState(); if (rowState() === "rest") { row.classList.add("peek"); pullFollow(row, dy); } pl.st = "peek"; return; }
  if (pl.st === st) return; pl.st = st; setRow(row, st);
  if (st === "search") { row.classList.remove("lock"); void row.offsetWidth; row.classList.add("lock"); if (navigator.vibrate) navigator.vibrate(10); } /* locked in: the magnifier has opened into the field (ring and pop, a short buzz where the device has one) */
  if (st === "let") { msg.innerHTML = `<div class="rf"><span>Let go to refresh</span></div>`; msg.removeAttribute("aria-hidden"); }
}
function pullCancel() { if (!pl) return; const x = pl; pl = null; setRow(x.row, rowState()); }
function pullEnd() {
  if (!pl) return; const x = pl; pl = null; const row = x.row;
  if (x.dy > 8) lastGesture = Date.now();
  if (x.dy >= PULL_REFRESH) {
    let n; do { n = Math.floor(Math.random() * RF.length); } while (n === lastRF); lastRF = n;
    S.refresh = RF[n]; const msg = row.querySelector("#pmsg"); msg.innerHTML = refreshHtml(S.refresh); msg.setAttribute("role", "status"); setRow(row, "anim"); row.dataset.scene = n;
    clearTimeout(refreshTimer); refreshTimer = setTimeout(() => { refreshTimer = null; S.refresh = null; const r = document.getElementById("prow"); if (r) { setRow(r, "rest"); delete r.dataset.scene; } toast("Up to date"); }, reducedMotion() ? REFRESH_MS_REDUCED : REFRESH_MS);
  } else if (x.dy >= PULL_SEARCH) openSearch(row);
  else setRow(row, rowState());
}
document.addEventListener("pointerdown", (e) => { if (e.pointerType !== "touch" && e.button === 0 && !e.target.closest("[data-swipe]")) pullStart(e.target, e.clientX, e.clientY); });
document.addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") pullMove(e.clientX, e.clientY); });
document.addEventListener("pointerup", (e) => { if (e.pointerType !== "touch") pullEnd(); });
document.addEventListener("pointercancel", (e) => { if (e.pointerType !== "touch") pullCancel(); });
/* touch: the browser would otherwise take the drag for its own scroll or bounce, so handle it here */
document.addEventListener("touchstart", (e) => { if (e.touches.length === 1 && !e.target.closest("[data-swipe]")) pullStart(e.target, e.touches[0].clientX, e.touches[0].clientY); else pullCancel(); }, { passive: true });
document.addEventListener("touchmove", (e) => pullMove(e.touches[0].clientX, e.touches[0].clientY, e), { passive: false });
document.addEventListener("touchend", pullEnd); document.addEventListener("touchcancel", pullCancel);
/* press and hold a group header: collapsed opens everything, open closes everything */
let fh = null;
document.addEventListener("pointerdown", (e) => {
  const h = e.target.closest("[data-fold]"); if (!h || e.button > 0) return;
  fh = { h, x: e.clientY, t: setTimeout(() => {
    const names = [...document.querySelectorAll("[data-fold]")].map((b) => b.dataset.p);
    const open = h.getAttribute("aria-expanded") === "true";
    names.forEach((n) => (S.collapsed[n] = open));
    lastGesture = Date.now(); fh = null; if (navigator.vibrate) navigator.vibrate(15); render();
  }, 450) };
});
document.addEventListener("pointermove", (e) => { if (fh && Math.abs(e.clientY - fh.x) > 8) { clearTimeout(fh.t); fh = null; } });
const endFh = () => { if (fh) { clearTimeout(fh.t); fh = null; } };
document.addEventListener("pointerup", endFh); document.addEventListener("pointercancel", endFh);
/* ribbon: press and hold a chip, then drag it sideways to put what matters first */
let rd = null;
document.addEventListener("pointerdown", (e) => {
  const c = e.target.closest(".rc2[data-chip]"); if (!c || e.button > 0) return;
  rd = { chip: c, sc: c.parentElement, x: e.clientX, y: e.clientY, active: false };
  rd.timer = setTimeout(() => { if (!rd) return; rd.active = true; rd.grab = rd.x - rd.chip.getBoundingClientRect().left; rd.chip.classList.add("lift"); rd.chip.style.pointerEvents = "none"; if (navigator.vibrate) navigator.vibrate(12); }, 380);
});
document.addEventListener("pointermove", (e) => {
  if (!rd) return;
  if (!rd.active) { if (Math.hypot(e.clientX - rd.x, e.clientY - rd.y) > 8) { clearTimeout(rd.timer); rd = null; } return; }
  const ch = rd.chip, sc = rd.sc, x = e.clientX;
  ch.style.transform = "none"; const cx = x - rd.grab + ch.offsetWidth / 2;
  for (const sib of sc.querySelectorAll(".rc2[data-chip]")) {
    if (sib === ch) continue; const r = sib.getBoundingClientRect(), mid = r.left + r.width / 2;
    const after = ch.compareDocumentPosition(sib) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (after && cx > mid) { sib.after(ch); break; } if (!after && cx < mid) { sib.before(ch); break; }
  }
  const nat = ch.getBoundingClientRect().left; ch.style.transform = `translateX(${x - rd.grab - nat}px)`;
  const sr = sc.getBoundingClientRect(); if (x > sr.right - 36) sc.scrollLeft += 10; else if (x < sr.left + 36) sc.scrollLeft -= 10;
});
const endRd = () => {
  if (!rd) return; clearTimeout(rd.timer); const x = rd; rd = null; if (!x.active) return;
  lastGesture = Date.now(); S.order[S.rmode] = [...x.sc.querySelectorAll(".rc2[data-chip]")].map((c) => c.dataset.chip); render();
};
document.addEventListener("pointerup", endRd); document.addEventListener("pointercancel", endRd);
document.addEventListener("touchmove", (e) => { if (rd && rd.active && e.cancelable) e.preventDefault(); }, { passive: false });
document.addEventListener("contextmenu", (e) => { if (e.target.closest(".rc2")) e.preventDefault(); });
/* status rotary: drag up or down on the value, scroll over it, or tap to step through the options */
let ro = null;
const rotStep = (k, i) => { const n = ROT[k].opts.length, st = S.fd.st[k]; i = Math.max(0, Math.min(n - 1, i)); if (i !== st.i || !st.on) { st.i = i; st.on = true; refreshSheet(); if (navigator.vibrate) navigator.vibrate(6); } };
document.addEventListener("pointerdown", (e) => { const r = e.target.closest("[data-rot]"); if (!r || e.button > 0 || !S.fd) return; ro = { k: r.dataset.rot, y: e.clientY, base: S.fd.st[r.dataset.rot].i, moved: false }; });
document.addEventListener("pointermove", (e) => { if (!ro) return; const dy = ro.y - e.clientY; if (Math.abs(dy) > 6 && !ro.moved) { ro.moved = true; refreshSheet(); } if (ro.moved) rotStep(ro.k, ro.base + Math.round(dy / 20)); });
const endRo = () => { if (!ro) return; const x = ro; ro = null; lastGesture = Date.now(); if (!x.moved) { const n = ROT[x.k].opts.length; rotStep(x.k, (S.fd.st[x.k].i + 1) % n); } else refreshSheet(); };
document.addEventListener("pointerup", endRo); document.addEventListener("pointercancel", endRo);
document.addEventListener("wheel", (e) => { const r = e.target.closest("[data-rot]"); if (!r || !S.fd) return; e.preventDefault(); const k = r.dataset.rot; rotStep(k, S.fd.st[k].i + (e.deltaY > 0 ? 1 : -1)); }, { passive: false });
document.getElementById("gear").addEventListener("click", () => document.getElementById("panel").classList.toggle("open"));
render();

/* drag the grab handle down to close the item sheet (Proposal: drag up does nothing; "All fields" is the way to the full screen) */
let sd = null;
document.addEventListener("pointerdown", (e) => { const h = e.target.closest && e.target.closest("[data-grab]"); if (!h) return; const sh = h.closest(".sheet"); sd = { y: e.clientY, sh, dy: 0 }; sh.style.transition = "none"; try { h.setPointerCapture(e.pointerId); } catch (x) {} });
document.addEventListener("pointermove", (e) => { if (!sd) return; sd.dy = Math.max(0, e.clientY - sd.y); sd.sh.style.transform = `translateY(${sd.dy}px)`; });
const endDrag = () => { if (!sd) return; const x = sd; sd = null; x.sh.style.transition = "transform .2s"; if (x.dy > 90) { x.sh.style.transform = "translateY(100%)"; setTimeout(() => acts.closesheet(), 180); } else x.sh.style.transform = ""; };
document.addEventListener("pointerup", endDrag); document.addEventListener("pointercancel", endDrag);
