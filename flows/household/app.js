"use strict";
/* Our kitchen: clickable prototype. Static, no build, no backend. Everything is fake data in the browser.
   The pantry mirrors Kitchie's finished list (sort, area tabs, collapsible areas, use one, used up). */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ico = (d, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  search: ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  plus: ico('<path d="M12 5v14M5 12h14"/>'),
  minus: ico('<path d="M6 12h12"/>'),
  x: ico('<path d="M6 6l12 12M18 6L6 18"/>'),
  tick: ico('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  chev: ico('<path d="M9 6l6 6-6 6"/>'),
  down: ico('<path d="M6 9l6 6 6-6"/>'),
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
  drop: '<path d="M12 3c3.5 4.5 6 7.2 6 10.2a6 6 0 0 1-12 0C6 10.200 8.500 7.500 12 3z"/><path d="M9.500 14a2.500 2.500 0 0 0 2 2.300"/>',
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
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
};
const ICON_LIB = Object.keys(RI).filter((k) => !["cap", "tag", "lock", "people", "home", "jar", "cart", "clock"].includes(k)); /* 30 light monoline icons */
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
  { id: "butter", key: "butter", emoji: "🧈", name: "Butter", n: 250, unit: "g", area: "Fridge", spot: "Door", cat: "Dairy and eggs", days: null, upd: 1, recent: false, by: "Arjan" },
  { id: "carrots", key: "carrots", emoji: "🥕", name: "Carrots", n: 1, unit: "bag", area: "Fridge", spot: "Crisper", cat: "Vegetables", days: null, upd: 2, recent: false, by: "Arjan" },
  { id: "cheddar", key: "cheese", emoji: "", name: "Cheddar", n: 200, unit: "g", area: "Fridge", spot: "Top shelf", cat: "Dairy and eggs", days: null, upd: 3, recent: false, by: "Arjan" },
  { id: "eggs", key: "eggs", emoji: "🥚", name: "Eggs", n: 12, unit: "", area: "Fridge", spot: "Door", cat: "Dairy and eggs", days: null, upd: 9, recent: true, by: "Arjan" },
  { id: "milk", key: "milk", emoji: "🥛", name: "Milk", n: 1, unit: "L", area: "Fridge", spot: "Door", cat: "Dairy and eggs", days: 0, upd: 5, recent: false, low: true, by: "Arjan" },
  { id: "paneer", key: "paneer", emoji: "", name: "Paneer", n: 50, unit: "g", area: "Fridge", spot: "Top shelf", cat: "Dairy and eggs", days: 3, upd: 6, recent: false, low: true, by: "Arjan" },
  { id: "spinach", key: "spinach", emoji: "🥬", name: "Spinach", n: 50, unit: "g", area: "Fridge", spot: "Crisper", cat: "Vegetables", days: 1, upd: 10, recent: true, low: true, by: "Arjan" },
  { id: "yoghurt", key: "yoghurt", emoji: "", name: "Greek yoghurt", n: 500, unit: "g", area: "Fridge", spot: "Top shelf", cat: "Dairy and eggs", days: 7, upd: 4, recent: false, by: "Arjan" },
  { id: "rice", key: "rice", emoji: "🍚", name: "Basmati rice", n: 5, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 1, recent: false, by: "Arjan" },
  { id: "brownrice", key: "brownrice", emoji: "🍚", name: "Brown rice", n: 1, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 2, recent: false, by: "Arjan" },
  { id: "jasmine", key: "jasmine", emoji: "🍚", name: "Jasmine rice", n: 1, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 2, recent: false, by: "Arjan" },
  { id: "tomatoes", key: "tomatoes", emoji: "🥫", name: "Chopped tomatoes", n: 4, unit: "tin", area: "Pantry", spot: "Top shelf", cat: "Cans", days: null, upd: 2, recent: false, by: "Arjan" },
  { id: "onion", key: "onion", emoji: "🧅", name: "Onions", n: 6, unit: "", area: "Pantry", spot: "Baskets", cat: "Vegetables", days: null, upd: 3, recent: false, by: "Arjan" },
  { id: "garam", key: "garam", emoji: "", name: "Garam masala", n: 1, unit: "jar", area: "Pantry", spot: "Spice rack", cat: "Seasoning", days: null, upd: 2, recent: false, low: true, by: "Arjan" },
  { id: "choc", key: "choc", emoji: "🍫", name: "Hazelnut chocolates", n: 1, unit: "box", area: "Pantry", spot: "Top shelf", cat: "Snacks", days: 12, upd: 8, recent: true, by: "Arjan" },
  { id: "peas", key: "peas", emoji: "", name: "Frozen peas", n: 1, unit: "bag", area: "Freezer", spot: "Top drawer", cat: "Frozen", days: null, upd: 4, recent: false, by: "Arjan" },
];

const initial = () => ({
  screen: "invite", stack: [], tab: "today", param: null,
  persona: "sam", recipes: true, down: false, expireNext: false,
  pantry: freshPantry(), sheet: null, toast: null,
  members: ["arjan", "sam"], invites: [{ name: "Priya", days: 6 }],
  roles: { arjan: { title: "Pantry Marshal", ic: "shield", desc: "Keeps order on the shelves and the fridge. Knows exactly where the cumin lives." }, sam: null },
  aiTab: "ChatGPT", aiActive: true, bannerGot: false, pending: null, joined: false,
  /* pantry view */
  seenP: 0, seenR: 0, sort: "name", view: "name", shop: [], sel: null, sortOpen: false, recentOnly: false, areaTab: "All", collapsed: {}, search: "", searchOpen: false, draft: { days: null },
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
const isLow = (i) => !!i.low;
const onList = (id) => S.shop.includes(id);
const emo = (i) => i.emoji || emojiOf(i.name) || "🍽️";
const lowText = (i) => `${fmtAmt(i)} left`;
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const reducible = (i) => COUNT_UNITS.includes(i.unit);
const can = (r) => r.ings.filter(([k]) => S.pantry.some((p) => p.key === k));
const me = () => PEOPLE[S.persona];
const pays = () => S.persona === "arjan"; /* the billing contact; never shown as a rank */
const role = (who) => S.roles[who];
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
  S.screen = screen; S.param = param; S.sortOpen = false;
  if (["today", "pantry", "recipes", "shop"].includes(screen)) { S.tab = screen; S.stack = []; }
  if (screen !== "pantry") S.sel = null;
  if (screen === "today") maybePrompt();
  render();
}
function back() {
  const p = S.stack.pop();
  if (p) { S.screen = p.screen; S.param = p.param; S.tab = p.tab; } else { S.screen = "today"; S.tab = "today"; }
  render();
}
function toast(msg) { S.toast = msg; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = null; render(); }, 2600); }

/* ---------- pieces ---------- */
const header = () => `<div class="top"><span>Our kitchen</span><button class="av" data-go="menu" aria-label="Account">${me().initial}</button></div>`;
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

/* ---------- pantry ---------- */
const sorters = {
  name: (a, b) => a.name.localeCompare(b.name),
  area: (a, b) => AREAS.indexOf(a.area) - AREAS.indexOf(b.area) || a.name.localeCompare(b.name),
  spot: (a, b) => a.spot.localeCompare(b.spot) || a.name.localeCompare(b.name),
  amount: (a, b) => b.n - a.n || a.name.localeCompare(b.name),
  useby: (a, b) => (a.days ?? 1e9) - (b.days ?? 1e9) || a.name.localeCompare(b.name),
  updated: (a, b) => b.upd - a.upd,
};
function visibleItems() {
  const q = S.search.trim().toLowerCase();
  return S.pantry.filter((i) => (S.areaTab === "All" || i.area === S.areaTab) && (!q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)) && (!S.recentOnly || i.recent) && (S.view !== "low" || isLow(i)));
}
function rowHtml(i) {
  const hot = i.days !== null && i.days <= 1;
  return `<li class="rowx"><button class="rowlink" data-go="item" data-p="${i.id}"><div class="main"><div class="name">${i.emoji ? `<span aria-hidden="true">${i.emoji}</span> ` : ""}${esc(i.name)}${i.recent ? ` <span class="cue" role="img" aria-label="Added in the last 24 hours">${I.up(17)}</span>` : ""}</div><div class="meta">${esc(fmtAmt(i))} · ${esc(i.spot)} · ${esc(i.cat)}</div></div>${i.days !== null ? `<span class="due ${hot ? "hot" : ""}">${dayLabel(i.days)}</span>` : ""}<span class="chev">${I.chev}</span></button>${reducible(i) ? `<button class="iconbtn" data-act="useone" data-p="${i.id}" aria-label="Use one of ${esc(i.name)}" title="Use one" ${S.down ? "disabled" : ""}>${I.minus}</button>` : ""}<button class="iconbtn ok2" data-act="usedup" data-p="${i.id}" aria-label="Mark ${esc(i.name)} as used up" title="Used up" ${S.down ? "disabled" : ""}>${I.tick}</button></li>`;
}
/* running-low rows: swipe to add to the shopping list, press and hold to pick several */
function lowRowHtml(i) {
  const picked = S.sel && S.sel.includes(i.id);
  return `<li class="rowx swr ${picked ? "sel" : ""}" data-swipe="${i.id}"><div class="swbg" aria-hidden="true"><span>Add to list</span>${riSvg("cart", 20)}</div><div class="swfg"><button class="rowlink" data-act="rowtap" data-p="${i.id}" ${picked ? 'aria-pressed="true"' : ""}>${S.sel ? `<span class="chk" aria-hidden="true">${picked ? I.tick : ""}</span>` : ""}<div class="main"><div class="name">${i.emoji ? `<span aria-hidden="true">${i.emoji}</span> ` : ""}${esc(i.name)}</div><div class="meta">${esc(lowText(i))} · ${esc(i.spot)}</div></div>${onList(i.id) ? '<span class="chip">On your list</span>' : ""}${S.sel ? "" : `<span class="chev">${I.chev}</span>`}</button></div></li>`;
}
function listHtml() {
  const items = visibleItems().sort(S.recentOnly ? sorters.updated : S.view === "useby" ? sorters.useby : sorters.name);
  if (S.view !== "name") {
    if (!items.length) return `<p style="padding:20px 4px">${S.view === "low" ? "Nothing is running low. Nice." : "Nothing matches."}</p>`;
    return `${S.view === "low" ? `<p class="hint">${S.sel ? "Tap to pick more, then add them together." : "Swipe a row to add it to your shopping list. Press and hold to pick several."}</p>` : ""}<ul class="rows">${items.map(S.view === "low" ? lowRowHtml : rowHtml).join("")}</ul>`;
  }
  const groups = AREAS.filter((a) => items.some((i) => i.area === a));
  if (!groups.length) return `<p style="padding:20px 4px">${S.pantry.length ? "Nothing matches." : "Your pantry is empty. Add what you have."}</p>`;
  return groups.map((a) => {
    const its = items.filter((i) => i.area === a); const shut = !!S.collapsed[a]; const nr = its.filter((i) => i.recent).length;
    return `<section class="group ${shut ? "shut" : ""}"><button class="grouphead" data-act="fold" data-p="${a}" aria-expanded="${!shut}"><h2>${a}</h2><span class="ghmeta">${nr ? `<span class="added" role="img" aria-label="${nr} added in the last 24 hours">${I.up(12)}${nr}</span>` : ""}<span class="fold">${I.down}</span></span></button><ul class="rows">${its.map(rowHtml).join("")}</ul></section>`;
  }).join("");
}

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

const screens = {
  invite: () => `<div class="body center">
    <div class="av" style="width:56px;height:56px;font-size:22px">A</div>
    ${S.own ? `<h1>Arjan set you up with a kitchen of your own</h1><p>Keep track of what's in the fridge and pantry. Invite people in whenever you like.</p>` : `<h1>Arjan invited you to Our kitchen</h1><p>Share what's in the fridge and pantry, and cook from it together.</p>`}
    <button class="btn" data-act="signin">Continue with Google</button>
    <p class="small">You'll sign in with Google. We never see your password.</p></div>`,

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

  shop: () => shell(`<div class="body"><h1>Shopping</h1>
    ${S.shop.length
      ? `<ul class="rows">${S.shop.map((id) => S.pantry.find((x) => x.id === id)).filter(Boolean).map((i) => `<li class="rowx"><div class="rowlink" style="cursor:default"><span class="em" aria-hidden="true" style="font-size:26px">${emo(i)}</span><div class="main"><div class="name">${esc(i.name)}</div><div class="meta">${esc(isLow(i) ? lowText(i) : fmtAmt(i))} at home</div></div></div><button class="iconbtn ok2" data-act="shopdone" data-p="${i.id}" aria-label="Got ${esc(i.name)}" title="Got it">${I.tick}</button></li>`).join("")}</ul>`
      : `<div class="card" style="align-items:center;text-align:center;gap:10px;padding:28px 18px"><span class="ric" style="width:64px;height:64px">${riSvg("cart", 32)}</span><b style="font-size:20px">Nothing on the list yet</b><p>Swipe a running-low item to put it here.</p><button class="btn sm" data-act="openlow">See what's running low</button></div>`}
  </div>`),

  pantry: () => header() + downBanner() + `<div class="body tight">
    <div class="pull" id="pull" aria-hidden="true"><span></span></div>
    <div class="phead"><h1>Pantry</h1><button class="icon addbtn" data-sheet="add" aria-label="Add an item" title="Add an item" ${S.down ? "disabled" : ""}>${I.plus}</button></div>
    ${S.searchOpen ? `<div class="searchbar"><input class="field" id="search" placeholder="Search your pantry" value="${esc(S.search)}" autocomplete="off" aria-label="Search your pantry"><button class="icon" data-act="search" aria-label="Close search" title="Close">${I.x}</button></div>` : ""}
    <div class="tools"><div class="seg3" role="radiogroup" aria-label="Show">${[["name", "A to Z"], ["useby", "Use by"], ["low", "Running low"]].map(([k, l]) => `<button role="radio" aria-checked="${S.view === k}" data-act="view" data-p="${k}" class="${S.view === k ? "on" : ""}">${l}</button>`).join("")}</div><button class="tbtn" data-act="recent" aria-pressed="${S.recentOnly}">Recent</button></div>
    <nav class="atabs" aria-label="Area">${["All", ...AREAS].map((a) => `<button data-act="areatab" data-p="${a}" class="${S.areaTab === a ? "on" : ""}">${a}</button>`).join("")}</nav>
    <div id="plist">${listHtml()}</div></div>
    ${S.sel ? `<div class="selbar" role="region" aria-label="Selected items"><button class="btn" data-act="seladd">Add ${S.sel.length} to shopping list</button><button class="icon" data-act="selcancel" aria-label="Cancel selection" title="Cancel">${I.x}</button></div>` : ""}` + bar(),

  item: () => {
    const p = S.pantry.find((x) => x.id === S.param);
    if (!p) return backHeader("Pantry", "") + `<div class="body"><p>That item is gone.</p></div>`;
    const rs = RECIPES.filter((r) => r.ings.some(([k]) => k === p.key));
    return backHeader("Pantry", p.name) + `<div class="body">
      <div><h1 style="font-size:2rem">${p.emoji ? p.emoji + " " : ""}${esc(p.name)}</h1><p style="margin-top:4px">Added by ${esc(p.by)}</p></div>
      <div><span class="lbl">Quantity</span><div class="stepper" style="margin-top:8px"><button data-act="qty" data-p="${p.id}" data-d="-1" aria-label="Less" ${S.down ? "disabled" : ""}>−</button><b>${esc(fmtAmt(p))}</b><button data-act="qty" data-p="${p.id}" data-d="1" aria-label="More" ${S.down ? "disabled" : ""}>+</button></div></div>
      <div><div class="kv"><span>Location</span><span>${esc(p.area)}</span></div><div class="kv"><span>Spot</span><span>${esc(p.spot)}</span></div><div class="kv"><span>Category</span><span>${esc(p.cat)}</span></div><div class="kv"><span>Use by</span><span>${p.days === null ? "Not set" : dayLabel(p.days)}</span></div></div>
      ${S.recipes && rs.length ? `<div style="display:flex;flex-direction:column;gap:10px"><span class="lbl">Cook it tonight</span>${rs.map((r) => `<button class="rc" data-go="recipe" data-p="${r.id}"><span class="ph">${r.emoji}</span><div style="flex:1"><b>${esc(r.name)}</b><p class="small">${can(r).length} of ${r.ings.length} ingredients · ${r.time} min</p></div></button>`).join("")}</div>` : ""}
      ${!S.recipes ? `<button class="card" data-go="upgrade"><b>Know what you can cook</b><p class="small">Recipes uses what's in your pantry.</p></button>` : ""}
      ${onList(p.id) ? `<p class="small">On your shopping list.</p>` : `<button class="btn ghost" data-act="shopadd" data-p="${p.id}">Add to shopping list</button>`}
      <p class="small">Finished with it? Use the tick on the pantry list.</p></div>`;
  },

  recipes: () => shell(`<div class="body"><h1>Recipes</h1><p>Ranked by what you already have.</p>
    <div style="display:flex;flex-direction:column;gap:10px">${[...RECIPES].sort((a, b) => can(b).length / b.ings.length - can(a).length / a.ings.length).map((r) => `<button class="rc" data-go="recipe" data-p="${r.id}"><span class="ph">${r.emoji}</span><div style="flex:1"><b>${esc(r.name)}</b><p class="small">You have ${can(r).length} of ${r.ings.length} · ${r.time} min</p></div></button>`).join("")}</div></div>`),

  recipe: () => {
    const r = RECIPES.find((x) => x.id === S.param); if (!r) return screens.recipes();
    const have = can(r);
    return backHeader("Recipes", r.name) + `<div class="body" style="flex:1">
      <div><h1 style="font-size:2rem">${esc(r.name)}</h1><p style="margin-top:4px">${r.time} min · you have ${have.length} of ${r.ings.length}</p></div>
      <div><span class="lbl">Ingredients</span>${r.ings.map(([k, n, q]) => { const has = S.pantry.some((p) => p.key === k); return `<div class="ing"><span>${esc(n)}, ${esc(q)}</span><span class="${has ? "ok" : "no"}">${has ? "In pantry" : "Missing"}</span></div>`; }).join("")}</div>
      <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px"><button class="btn" data-act="cook" data-p="${r.id}" ${S.down || !have.length ? "disabled" : ""}>Cook this</button><p class="small" style="text-align:center">Cooking takes the used items out of your pantry.</p></div></div>` + bar();
  },

  menu: () => backHeader("Back", "") + `<div class="body">
    <div class="row"><span class="av" style="width:56px;height:56px;font-size:20px">${me().initial}</span><div><b style="font-size:20px">${esc(me().name)}</b><p class="small">${role(S.persona) ? esc(role(S.persona).title) : "Our kitchen"}</p></div></div>
    <div class="menu">
      <button data-go="household">Household <span class="chip">${S.members.length}</span></button>
      <button data-sheet="role">${role(S.persona) ? "Change my kitchen role" : "Pick a kitchen role"}</button>
      <button data-go="ai">AI assistant</button>
      ${pays() ? `<button data-go="${S.recipes ? "household" : "upgrade"}">Plan and billing</button>` : ""}
      <button data-act="signout" class="danger">Sign out</button></div></div>`,

  household: () => backHeader("Back", "Household") + `<div class="body">
    <div><h1 style="font-size:2rem">Our kitchen</h1><p style="margin-top:4px">${S.members.length} members</p></div>
    <div><span class="lbl">Members</span>${S.members.map((w) => `<button class="m" data-sheet="member" data-p="${w}"><span class="avw"><span class="av">${PEOPLE[w].initial}</span>${role(w) ? `<span class="avbadge">${riSvg(role(w).ic, 13)}</span>` : ""}</span><div style="flex:1"><b>${PEOPLE[w].name}</b>${w === S.persona ? ' <span class="chip">You</span>' : ""}${role(w) ? `<p class="small">${esc(role(w).title)}</p>` : ""}</div><span class="chev" style="color:var(--muted)">${I.chev}</span></button>`).join("")}
      ${S.invites.map((i) => `<div class="m"><span class="av" style="border-style:dashed;color:var(--muted)">${esc(i.name[0])}</span><div style="flex:1"><b>${esc(i.name)}</b><p class="small">Invited · link expires in ${i.days} days</p></div><button data-act="revoke" data-p="${esc(i.name)}" class="danger" style="font-size:14px">Cancel</button></div>`).join("")}</div>
    <button class="btn" data-sheet="invite">Invite someone</button>
    <div style="border-top:1px solid var(--border);padding-top:14px"><span class="lbl">Included for this household</span>
      <div class="pillrow" style="margin-top:10px"><span class="chip">Pantry</span>${S.recipes ? '<span class="chip">Recipes</span>' : `<button class="chip add" data-go="upgrade">Add Recipes</button>`}</div></div>
    <button data-act="leave" class="danger" style="text-align:left">Leave this household</button></div>`,

  ai: () => backHeader("Back", "AI assistant") + `<div class="body">
    <div><h2>Your personal link</h2><p style="margin-top:6px">Lets an assistant read and update Our kitchen as you. It sees everything your household has.</p></div>
    <div class="tabs">${["ChatGPT", "Claude", "Other"].map((t) => `<button data-act="aitab" data-p="${t}" class="${S.aiTab === t ? "on" : ""}">${t}</button>`).join("")}</div>
    <div class="field" style="display:flex;align-items:center"><span class="mono">https://kitchen.example/mcp/s9Xk-4tPq-L2vE</span></div>
    <button class="btn" data-act="copy">Copy link</button>
    <div style="display:flex;flex-direction:column;gap:10px;font-size:15px"><div class="row"><b>1</b><span>${S.aiTab === "Claude" ? "In Claude, open Settings, then Connectors." : S.aiTab === "ChatGPT" ? "In ChatGPT, open Settings, then Connectors." : "Open your assistant's connector settings."}</span></div><div class="row"><b>2</b><span>Paste your link and name it Kitchen.</span></div><div class="row"><b>3</b><span>Ask: "What should I cook tonight?"</span></div></div>
    <div style="border-top:1px solid var(--border);padding-top:14px" class="row"><div style="flex:1"><b>${S.aiTab}</b> <span class="chip">${S.aiActive ? "Active" : "Revoked"}</span><p class="small">${S.aiActive ? "Last used 2 hours ago" : "Make a new link to reconnect"}</p></div><button data-act="aitoggle" class="${S.aiActive ? "danger" : "link"}">${S.aiActive ? "Revoke" : "New link"}</button></div>
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
    <div class="acts"><button class="btn" data-act="restart">I have an invite link</button>
      <button class="btn ghost" data-act="askaround">Will ask around :-(</button>
      <button class="btn ghost" data-act="restart">Use a different Google account</button></div></div>`,
};

/* ---------- sheets ---------- */
function sheetHtml() {
  const sh = S.sheet; if (!sh) return "";
  const wrap = (inner, mid) => `<div class="sheet-dim" ${mid ? "" : 'data-act="closesheet"'}><div class="sheet ${mid ? "mid" : ""}" data-stop="1">${inner}</div></div>`;
  if (sh === "pwa") return wrap(`<h2>Add it to your home screen</h2><p>On iPhone: tap Share, then Add to Home Screen.<br>On Android: tap the menu, then Add to Home screen.</p><button class="btn" data-act="pwadone">Done, I've added it</button><button class="btn ghost" data-act="closesheet">Not now</button>`);
  if (sh === "add") return wrap(`<h2>Add item</h2>
    <input class="field" id="f-name" placeholder="Name" autocomplete="off"><input class="field" id="f-amt" placeholder="Amount (e.g. 2, 500 g, 1 bag)" autocomplete="off">
    <select class="field" id="f-area">${AREAS.map((a) => `<option>${a}</option>`).join("")}</select><input class="field" id="f-spot" placeholder="Spot (optional)" autocomplete="off">
    <select class="field" id="f-cat">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select>
    <span class="lbl">Use by</span><div class="pillrow">${[[null, "Not set"], [3, "+3 days"], [5, "+5 days"], [7, "+1 week"]].map(([d, l]) => `<button class="pill ${S.draft.days === d ? "on" : ""}" data-act="useby" data-p="${d}">${l}</button>`).join("")}</div>
    <button class="btn" data-act="additem">Save</button>`);
  if (sh === "invite") return wrap(`<h2>Invite someone</h2><p>Send this link. They sign in with Google and join Our kitchen. Anyone in the household can send one.</p>
    <div class="field" style="display:flex;align-items:center"><span class="mono">https://kitchen.example/join/k7Q2-m9xA-0pR4</span></div>
    <button class="btn" data-act="copyinvite">Copy link</button><p class="small">Works once and expires in 7 days. It can be cancelled from Household.</p>`);
  if (sh === "expired") return wrap(`<h2>Sign in again to save</h2><p>Your sign-in ended. What you typed is kept, and you'll come straight back.</p><button class="btn" data-act="resume">Continue with Google</button>`, true);
  if (sh === "role") return wrap(`<h2>Your kitchen role</h2><p>Optional. It sits beside your name.</p>${roleEditor("sheet")}`);
  if (sh === "member") {
    const w = S.memberWho, r = role(w), self = w === S.persona;
    return wrap(`<div class="row"><span class="av" style="width:56px;height:56px;font-size:20px">${PEOPLE[w].initial}</span><div><b style="font-size:20px">${PEOPLE[w].name}</b>${self ? ' <span class="chip">You</span>' : ""}</div></div>
      ${r ? `<div class="row" style="gap:14px">${roleIc(r, 56)}<div><b style="font-size:17px">${esc(r.title)}</b>${r.desc ? `<p style="margin-top:4px">${esc(r.desc)}</p>` : ""}</div></div>` : `<p>${self ? "You haven't picked a kitchen role." : PEOPLE[w].name + " hasn't picked a kitchen role."}</p>`}
      ${self ? `<button class="btn" data-sheet="role">${r ? "Change role" : "Pick a role"}</button>` : ""}<button class="btn ghost" data-act="closesheet">Close</button>`);
  }
  return "";
}

/* ---------- panel ---------- */
function panelHtml() {
  const sw = (k, label) => `<label><span>${label}</span><button class="sw ${S[k] ? "on" : ""}" data-ctl="${k}" aria-pressed="${S[k]}"></button></label>`;
  return `<div class="grp"><h3>Who you are</h3><label><span>Signed in as</span><select data-ctl="persona"><option value="sam" ${S.persona === "sam" ? "selected" : ""}>Sam</option><option value="arjan" ${S.persona === "arjan" ? "selected" : ""}>Arjan (looks after the plan)</option></select></label></div>
  <div class="grp"><h3>Theme</h3><div class="tgrid">${window.themeHtml()}</div></div>
  <div class="grp"><h3>Invite</h3>${sw("own", "Starting their own kitchen")}<label><span>People already in</span><select data-ctl="existing">${[1, 2, 3].map((n) => `<option value="${n}" ${S.existing === n ? "selected" : ""}>${n === 3 ? "3 or more" : n}</option>`).join("")}</select></label><p class="st">Changes the welcome words. Use "Invite link opens" to replay.</p></div>
  <div class="grp"><h3>Household</h3>${sw("recipes", "Has Recipes")}${sw("down", "Platform is down")}${sw("expireNext", "Sign-in ends on next save")}</div>
  <div class="grp"><h3>Home-screen prompt</h3><div class="st" id="pwa-st">${esc(pwaStatus())}</div><button class="pb" data-act="usage">Add 30 min of use</button><button class="pb" data-act="week">Move on a week</button><p class="st">Nothing until 1 hour of use. Then once, twice, once over three weeks. Then never. Shows on Today.</p></div>
  <div class="grp"><h3>Jump to</h3><button class="pb" data-act="restart">Invite link opens</button><button class="pb" data-act="jump" data-p="today">Home</button><button class="pb" data-act="jump" data-p="pantry">Pantry</button><button class="pb" data-act="jump" data-p="household">Household</button><button class="pb" data-act="jump" data-p="notmember">Not a member</button><button class="pb" data-act="reset">Reset everything</button></div>
  <p class="st">Fake data. Nothing leaves your browser.</p>`;
}

/* ---------- render ---------- */
let lastScreen = null;
function render() {
  const phone = document.getElementById("phone");
  const prev = phone.querySelector(".body"); const top = prev && lastScreen === S.screen ? prev.scrollTop : 0;
  if (S.screen === "pantry") S.seenP = S.pantry.filter((i) => i.recent).length;
  if (S.screen === "recipes") S.seenR = RECIPES.filter((r) => r.new).length;
  const sc = screens[S.screen] || screens.today;
  phone.innerHTML = sc() + sheetHtml() + (S.toast ? `<div class="toast">${esc(S.toast)}</div>` : "");
  const nb = phone.querySelector(".body"); if (nb && top) nb.scrollTop = top;
  lastScreen = S.screen;
  const panel = document.getElementById("panel");
  if (!panel.dataset.ready || S.panelDirty) { panel.innerHTML = panelHtml(); panel.dataset.ready = "1"; S.panelDirty = false; }
  else { const st = document.getElementById("pwa-st"); if (st) st.textContent = pwaStatus(); }
  const s = document.getElementById("search"); if (s && S.searchFocus) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
}
const refreshPanel = () => { S.panelDirty = true; };

/* ---------- actions ---------- */
function commitAdd() {
  const x = S.pending; if (!x) return; S.pending = null; S.sheet = null;
  S.pantry.unshift({ id: "n" + Date.now(), key: x.name.toLowerCase().split(/[ ,]/)[0], emoji: emojiOf(x.name), name: x.name, n: x.n, unit: x.unit, area: x.area, spot: x.spot || "Anywhere", cat: x.cat, days: x.days, upd: 100 + S.pantry.length, recent: true, by: me().name });
  render(); toast("Added " + x.name);
}
function parseAmt(t) {
  const m = String(t).trim().match(/^([\d.,/]+)?\s*(.*)$/); let n = m && m[1] ? Number(m[1].replace(",", ".")) : 1; if (!isFinite(n)) n = 1;
  let u = (m && m[2] ? m[2] : "").trim(); const known = ["g", "kg", "mL", "L", ...COUNT_UNITS.filter(Boolean)]; const hit = known.find((k) => k.toLowerCase() === u.toLowerCase()); return { n, unit: hit || "" };
}

const acts = {
  back, closesheet() { S.sheet = null; render(); },
  signin() { S.joined = true; S.rdraft = null; S.iconPick = false; if (S.own) { S.pantry = []; S.members = [S.persona]; S.invites = []; S.roles = {}; } go("welcome", null, { replace: true }); },
  gotit() { S.bannerGot = true; render(); },
  retry() { toast(S.down ? "Still reconnecting" : "Back online"); },
  fold(a) { S.collapsed[a] = !S.collapsed[a]; render(); },
  areatab(a) { S.areaTab = a; render(); },
  sortopen() { S.sortOpen = !S.sortOpen; render(); },
  sort(k) { S.sort = k; S.recentOnly = false; S.sortOpen = false; render(); },
  recent() { S.recentOnly = !S.recentOnly; S.sortOpen = false; render(); },
  search() { S.searchOpen = !S.searchOpen; S.searchFocus = S.searchOpen; if (!S.searchOpen) S.search = ""; render(); S.searchFocus = false; },
  useone(id) {
    if (S.down) return; const i = S.pantry.find((x) => x.id === id); if (!i) return;
    i.n -= 1; if (i.n <= 0) { S.pantry = S.pantry.filter((x) => x !== i); render(); toast(i.name + " used up"); } else { i.upd = 200; render(); }
  },
  usedup(id) { if (S.down) return; const i = S.pantry.find((x) => x.id === id); S.pantry = S.pantry.filter((x) => x.id !== id); render(); toast((i ? i.name : "Item") + " marked as used up"); },
  qty(id, d) { if (S.down) return; const i = S.pantry.find((x) => x.id === id); if (!i) return; const st = STEP[i.unit] || 1; i.n = Math.max(0, Math.round((i.n + Number(d) * st) * 100) / 100); i.upd = 200; render(); },
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
  view(k) { S.view = k; S.sel = null; S.recentOnly = false; render(); },
  openuse() { S.view = "useby"; S.areaTab = "All"; S.recentOnly = false; go("pantry"); },
  openlow() { S.view = "low"; S.areaTab = "All"; S.recentOnly = false; go("pantry"); },
  shopadd(id) { const i = S.pantry.find((x) => x.id === id); if (!i) return; if (!onList(id)) S.shop.push(id); toast(i.name + " added to your shopping list"); },
  shopdone(id) { S.shop = S.shop.filter((x) => x !== id); render(); },
  rowtap(id) { if (S.sel) { S.sel = S.sel.includes(id) ? S.sel.filter((x) => x !== id) : [...S.sel, id]; if (!S.sel.length) S.sel = null; render(); } else go("item", id); },
  selstart(id) { S.sel = [id]; render(); },
  selcancel() { S.sel = null; render(); },
  seladd() { const n = S.sel.length; S.sel.forEach((id) => { if (!onList(id)) S.shop.push(id); }); S.sel = null; toast(n + (n === 1 ? " item" : " items") + " added to your shopping list"); },
  copyshop() { toast("Shopping list copied"); }, copykitchen() { toast("Kitchen list copied"); },
  copy() { toast("Link copied"); }, copyinvite() { toast("Invite link copied"); },
  revoke(name) { S.invites = S.invites.filter((i) => i.name !== name); render(); toast("Invite cancelled"); },
  leave() { toast("You'd leave Our kitchen here"); },
  aitab(t) { S.aiTab = t; S.aiActive = true; render(); }, aitoggle() { S.aiActive = !S.aiActive; render(); },
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
  week() { S.week += 1; render(); },
  signout() { const k = { persona: S.persona, recipes: S.recipes, down: S.down, own: S.own, existing: S.existing, usageMin: S.usageMin, week: S.week, pwa: S.pwa }; S = Object.assign(initial(), k); refreshPanel(); render(); },
  restart() { const k = { persona: S.persona, recipes: S.recipes, down: S.down, own: S.own, existing: S.existing }; S = Object.assign(initial(), k); refreshPanel(); render(); },
  reset() { S = initial(); refreshPanel(); render(); },
  askaround() { toast("No rush. The kitchen will keep."); },
  jump(p) { S.joined = S.joined || p !== "notmember"; S.stack = []; go(p, null, { replace: true }); },
};

let lastGesture = 0;
document.addEventListener("click", (e) => {
  if (Date.now() - lastGesture < 450 && e.target.closest(".swr,.body.tight")) { e.stopPropagation(); return; }
  const t = e.target.closest("[data-act],[data-go],[data-sheet],[data-ctl],[data-stop]"); if (!t) return;
  if (t.dataset.stop && !t.dataset.act && !t.dataset.go && !t.dataset.sheet) return;
  if (t.dataset.ctl) { const k = t.dataset.ctl; if (k === "persona" || k === "existing") return; S[k] = !S[k]; refreshPanel(); render(); return; }
  if (t.dataset.sheet) {
    if (t.dataset.sheet === "member") S.memberWho = t.dataset.p;
    if (t.dataset.sheet === "add") S.draft = { days: null };
    if (t.dataset.sheet === "role") { const r = role(S.persona); S.rdraft = r ? { pi: -1, ic: r.ic, title: r.title, desc: r.desc } : null; S.iconPick = false; }
    S.sheet = t.dataset.sheet; render(); return;
  }
  if (t.dataset.act) { if (t.disabled) return; e.stopPropagation(); (acts[t.dataset.act] || (() => {}))(t.dataset.p, t.dataset.d); return; }
  if (t.dataset.go) { S.sheet = null; return go(t.dataset.go, ["item", "recipe"].includes(t.dataset.go) ? t.dataset.p : null); }
});
document.addEventListener("change", (e) => { const c = e.target.dataset && e.target.dataset.ctl; if (c === "persona") { S.persona = e.target.value; refreshPanel(); render(); } if (c === "existing") { S.existing = Number(e.target.value); render(); } });
document.addEventListener("input", (e) => { if (e.target.id === "r-title" && S.rdraft) S.rdraft.title = e.target.value; if (e.target.id === "r-desc" && S.rdraft) S.rdraft.desc = e.target.value; if (e.target.id === "search") { S.search = e.target.value; document.getElementById("plist").innerHTML = listHtml(); } });
/* swipe a running-low row to add it; press and hold to start picking several */
let g = null;
document.addEventListener("pointerdown", (e) => {
  const row = e.target.closest("[data-swipe]"); if (!row || e.button > 0) return;
  g = { id: row.dataset.swipe, row, fg: row.querySelector(".swfg"), x: e.clientX, y: e.clientY, dx: 0, swiping: false, long: false };
  g.timer = setTimeout(() => { if (g && !g.swiping) { g.long = true; lastGesture = Date.now(); if (navigator.vibrate) navigator.vibrate(15); acts.selstart(g.id); } }, 480);
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
});
const endGesture = () => {
  if (!g) return; clearTimeout(g.timer); const x = g; g = null;
  if (!x.swiping) return;
  lastGesture = Date.now(); x.row.classList.remove("drag");
  if (Math.abs(x.dx) > 90) { x.fg.style.transform = `translateX(${x.dx > 0 ? 110 : -110}%)`; setTimeout(() => acts.shopadd(x.id), 160); }
  else { x.fg.style.transform = ""; x.row.classList.remove("armed"); }
};
document.addEventListener("pointerup", endGesture); document.addEventListener("pointercancel", endGesture);
document.addEventListener("contextmenu", (e) => { if (e.target.closest("[data-swipe]")) e.preventDefault(); });
document.addEventListener("keydown", (e) => { const t = e.target; if ((e.key === "Enter" || e.key === " ") && t.matches && t.matches('[role=button][data-act]')) { e.preventDefault(); t.click(); } });
document.addEventListener("scroll", (e) => { const sn = e.target; if (sn.id !== "snap") return; const n = Math.round(sn.scrollLeft / sn.clientWidth); sn.parentElement.querySelectorAll(".dots i").forEach((d, k) => d.classList.toggle("on", k === n)); }, true);
/* pull down at the top of Pantry: a shallow pull opens search, a deep pull refreshes. Mouse and touch. */
const PULL_SHALLOW = 70, PULL_DEEP = 170; let pl = null;
function pullStart(target, y) {
  const b = target.closest && target.closest(".body.tight"); if (!b || S.screen !== "pantry" || b.scrollTop > 0 || target.closest("input")) return;
  pl = { y, dy: 0, b, el: b.querySelector("#pull") };
}
function pullMove(y, e) {
  if (!pl) return; const dy = y - pl.y;
  if (dy <= 8) { if (pl.dy) { pl.dy = 0; pl.el.style.height = "0px"; } return; }
  if (e && e.cancelable) e.preventDefault();
  pl.dy = dy; pl.el.style.height = Math.min(dy * 0.5, 96) + "px";
  pl.el.firstElementChild.textContent = dy >= PULL_DEEP ? "Let go to refresh" : dy >= PULL_SHALLOW ? "Let go to search. Pull further to refresh" : "Pull to search";
}
function pullEnd() {
  if (!pl) return; const x = pl; pl = null; x.el.style.height = "0px";
  if (x.dy > 8) lastGesture = Date.now();
  if (x.dy >= PULL_DEEP) { toast("Refreshing…"); setTimeout(() => toast("Up to date"), 900); }
  else if (x.dy >= PULL_SHALLOW && !S.searchOpen) acts.search();
}
document.addEventListener("pointerdown", (e) => { if (e.pointerType !== "touch" && e.button === 0 && !e.target.closest("[data-swipe]")) pullStart(e.target, e.clientY); });
document.addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") pullMove(e.clientY); });
document.addEventListener("pointerup", (e) => { if (e.pointerType !== "touch") pullEnd(); });
document.addEventListener("pointercancel", (e) => { if (e.pointerType !== "touch") pullEnd(); });
/* touch: the browser would otherwise take the drag for its own scroll or bounce, so handle it here */
document.addEventListener("touchstart", (e) => { if (e.touches.length === 1 && !e.target.closest("[data-swipe]")) pullStart(e.target, e.touches[0].clientY); }, { passive: true });
document.addEventListener("touchmove", (e) => pullMove(e.touches[0].clientY, e), { passive: false });
document.addEventListener("touchend", pullEnd); document.addEventListener("touchcancel", pullEnd);
document.getElementById("gear").addEventListener("click", () => document.getElementById("panel").classList.toggle("open"));
render();
