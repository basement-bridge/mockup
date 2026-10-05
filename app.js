"use strict";
/* Our kitchen: clickable prototype. Static, no build, no backend. Everything is fake data in the browser.
   The pantry mirrors Kitchie's finished list (sort, area tabs, collapsible areas, use one, used up). */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ico = (d, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  search: ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  plus: ico('<path d="M12 5v14M5 12h14"/>'),
  minus: ico('<path d="M6 12h12"/>'),
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

const ROLE_PRESETS = [
  { icon: "🧑‍🍳", title: "Head Chef", desc: "Decides what's for dinner. Overrules everyone, mostly with garlic." },
  { icon: "🥄", title: "Chief Stirring Officer", desc: "Always near the pot. Never far from a wooden spoon." },
  { icon: "🛒", title: "Supply Runner", desc: "Knows every aisle. Comes back with the wrong brand, but with love." },
  { icon: "🦊", title: "Chief Procurement Officer", desc: "Negotiates with the supermarket. Loses to the special offers." },
  { icon: "🐙", title: "Kitchen Captain", desc: "Shops, cooks and tidies up. Please check they've eaten." },
  { icon: "🦉", title: "Full Stack Cook", desc: "Front of house, back of house, and the washing up." },
  { icon: "🔪", title: "Chief Chopping Officer", desc: "Onions fear them. Uniform pieces optional, enthusiasm not." },
  { icon: "🦈", title: "Knife Hand", desc: "Quick, tidy, and slightly terrifying near a courgette." },
  { icon: "🦔", title: "Pantry Marshal", desc: "Keeps order on the shelves. Knows exactly where the cumin lives." },
  { icon: "🐧", title: "Keeper of the Fridge", desc: "Guardian of the leftovers. Nothing expires on their watch." },
];

/* 28 light, funny icons. Plain emoji: zero bytes to ship and they follow the phone's own style. */
const ICONS = ["🧑‍🍳", "🥄", "🛒", "🦊", "🐙", "🦉", "🔪", "🦈", "🦔", "🐧", "🐸", "🦆", "🐝", "🐌", "🐢", "🐻", "🦖", "🐷", "🐔", "🦁", "🧀", "🥑", "🍳", "🌶️", "🥐", "🍕", "🧂", "🫖"];
const NAMES = ["Arjan", "Priya", "Tom", "Mei"];

const RECIPES = [
  { id: "saag", emoji: "🥬", name: "Saag paneer", time: 35, ings: [["spinach", "Spinach", "250 g"], ["paneer", "Paneer", "200 g"], ["onion", "Onion", "2"], ["garam", "Garam masala", "2 tsp"], ["cream", "Cream", "100 ml"]] },
  { id: "rice", emoji: "🍚", name: "Egg fried rice", time: 20, ings: [["eggs", "Eggs", "3"], ["rice", "Basmati rice", "300 g"], ["onion", "Onion", "1"]] },
  { id: "omelette", emoji: "🍳", name: "Spinach omelette", time: 10, ings: [["spinach", "Spinach", "100 g"], ["eggs", "Eggs", "3"]] },
  { id: "toastie", emoji: "🥪", name: "Cheese and onion toastie", time: 8, ings: [["cheese", "Cheese", "80 g"], ["onion", "Onion", "1"], ["bread", "Bread", "4 slices"]] },
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
  { id: "milk", key: "milk", emoji: "🥛", name: "Milk", n: 2, unit: "L", area: "Fridge", spot: "Door", cat: "Dairy and eggs", days: 0, upd: 5, recent: false, by: "Arjan" },
  { id: "paneer", key: "paneer", emoji: "", name: "Paneer", n: 200, unit: "g", area: "Fridge", spot: "Top shelf", cat: "Dairy and eggs", days: 3, upd: 6, recent: false, by: "Arjan" },
  { id: "spinach", key: "spinach", emoji: "🥬", name: "Spinach", n: 250, unit: "g", area: "Fridge", spot: "Crisper", cat: "Vegetables", days: 1, upd: 10, recent: true, by: "Arjan" },
  { id: "yoghurt", key: "yoghurt", emoji: "", name: "Greek yoghurt", n: 500, unit: "g", area: "Fridge", spot: "Top shelf", cat: "Dairy and eggs", days: 7, upd: 4, recent: false, by: "Arjan" },
  { id: "rice", key: "rice", emoji: "🍚", name: "Basmati rice", n: 5, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 1, recent: false, by: "Arjan" },
  { id: "brownrice", key: "brownrice", emoji: "🍚", name: "Brown rice", n: 1, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 2, recent: false, by: "Arjan" },
  { id: "jasmine", key: "jasmine", emoji: "🍚", name: "Jasmine rice", n: 1, unit: "kg", area: "Pantry", spot: "Bottom shelf", cat: "Dry goods", days: null, upd: 2, recent: false, by: "Arjan" },
  { id: "tomatoes", key: "tomatoes", emoji: "🥫", name: "Chopped tomatoes", n: 4, unit: "tin", area: "Pantry", spot: "Top shelf", cat: "Cans", days: null, upd: 2, recent: false, by: "Arjan" },
  { id: "onion", key: "onion", emoji: "🧅", name: "Onions", n: 6, unit: "", area: "Pantry", spot: "Baskets", cat: "Vegetables", days: null, upd: 3, recent: false, by: "Arjan" },
  { id: "garam", key: "garam", emoji: "", name: "Garam masala", n: 1, unit: "jar", area: "Pantry", spot: "Spice rack", cat: "Seasoning", days: null, upd: 2, recent: false, by: "Arjan" },
  { id: "choc", key: "choc", emoji: "🍫", name: "Hazelnut chocolates", n: 1, unit: "box", area: "Pantry", spot: "Top shelf", cat: "Snacks", days: 12, upd: 8, recent: true, by: "Arjan" },
  { id: "peas", key: "peas", emoji: "", name: "Frozen peas", n: 1, unit: "bag", area: "Freezer", spot: "Top drawer", cat: "Frozen", days: null, upd: 4, recent: false, by: "Arjan" },
];

const initial = () => ({
  screen: "invite", stack: [], tab: "today", param: null,
  persona: "sam", recipes: false, down: false, expireNext: false,
  pantry: freshPantry(), sheet: null, toast: null,
  members: ["arjan", "sam"], invites: [{ name: "Priya", days: 6 }],
  roles: { arjan: { icon: "🦔", title: "Pantry Marshal", desc: "Keeps order on the shelves. Knows exactly where the cumin lives." }, sam: null },
  aiTab: "ChatGPT", aiActive: true, bannerGot: false, pending: null, joined: false,
  /* pantry view */
  sort: "name", sortOpen: false, recentOnly: false, areaTab: "All", collapsed: {}, search: "", searchOpen: false, draft: { days: null },
  memberWho: null, existing: 1, own: false, rdraft: null, iconPick: false,
  /* install prompt: nothing until 1 hour of use, then 1, 2, 1 across three weeks, then never */
  usageMin: 0, week: 0, pwa: { startWeek: null, shown: {}, done: false }, pwaCard: false,
});
let S = initial();

/* ---------- helpers ---------- */
const dayLabel = (d) => (d === null ? "" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : "in " + d + " days");
const fmtAmt = (i) => { const n = Math.round(i.n * 100) / 100; return String(n) + (i.unit ? " " + i.unit : ""); };
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
  if (["today", "pantry", "recipes"].includes(screen)) { S.tab = screen; S.stack = []; }
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
const bar = () => `<nav class="bar">
  <button data-go="today" class="${S.tab === "today" ? "on" : ""}">Today</button>
  <button data-go="pantry" class="${S.tab === "pantry" ? "on" : ""}">Pantry</button>
  <button data-go="${S.recipes ? "recipes" : "upgrade"}" class="${S.tab === "recipes" ? "on" : ""}">Recipes${S.recipes ? "" : ' <span class="chip add">Add</span>'}</button>
</nav>`;
const downBanner = () => S.down ? `<div class="banner warn"><b>Showing your saved list</b><span>Updated 3 minutes ago. We're reconnecting. Changes will work again shortly.</span><button class="lnk" data-act="retry">Try again</button></div>` : "";
const shell = (inner) => header() + downBanner() + inner + bar();
const roleChip = (who) => role(who) ? `<span class="chip">${esc(role(who).title)}</span>` : "";

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
  return S.pantry.filter((i) => (S.areaTab === "All" || i.area === S.areaTab) && (!q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)) && (!S.recentOnly || i.recent));
}
function rowHtml(i) {
  const hot = i.days !== null && i.days <= 1;
  return `<li class="rowx"><button class="rowlink" data-go="item" data-p="${i.id}"><div class="main"><div class="name">${i.emoji ? `<span aria-hidden="true">${i.emoji}</span> ` : ""}${esc(i.name)}${i.recent ? ` <span class="cue" role="img" aria-label="Added in the last 24 hours">${I.up(17)}</span>` : ""}</div><div class="meta">${esc(fmtAmt(i))} · ${esc(i.spot)} · ${esc(i.cat)}</div></div>${i.days !== null ? `<span class="due ${hot ? "hot" : ""}">${dayLabel(i.days)}</span>` : ""}<span class="chev">${I.chev}</span></button>${reducible(i) ? `<button class="iconbtn" data-act="useone" data-p="${i.id}" aria-label="Use one of ${esc(i.name)}" title="Use one" ${S.down ? "disabled" : ""}>${I.minus}</button>` : ""}<button class="iconbtn ok2" data-act="usedup" data-p="${i.id}" aria-label="Mark ${esc(i.name)} as used up" title="Used up" ${S.down ? "disabled" : ""}>${I.tick}</button></li>`;
}
function listHtml() {
  const items = visibleItems().sort(S.recentOnly ? sorters.updated : sorters[S.sort]);
  const groups = AREAS.filter((a) => items.some((i) => i.area === a));
  if (!groups.length) return `<p style="padding:20px 4px">${S.pantry.length ? "Nothing matches." : "Your pantry is empty. Add what you have."}</p>`;
  return groups.map((a) => {
    const its = items.filter((i) => i.area === a); const shut = !!S.collapsed[a]; const nr = its.filter((i) => i.recent).length;
    return `<section class="group ${shut ? "shut" : ""}"><button class="grouphead" data-act="fold" data-p="${a}" aria-expanded="${!shut}"><h2>${a}</h2><span class="ghmeta">${nr ? `<span class="added" role="img" aria-label="${nr} added in the last 24 hours">${I.up(12)}${nr}</span>` : ""}<span class="fold">${I.down}</span></span></button><ul class="rows">${its.map(rowHtml).join("")}</ul></section>`;
  }).join("");
}

/* ---------- role editor (shared by Welcome and the role sheet) ---------- */
function roleEditor(ctx) {
  const d = S.rdraft, w = ctx === "welcome";
  return `<div class="pillrow">${ROLE_PRESETS.map((r, i) => `<button class="pill ${d && d.pi === i ? "on" : ""}" data-act="rolepick" data-p="${i}">${r.icon} ${esc(r.title)}</button>`).join("")}</div>
  ${d ? `<div class="card"><div class="row"><button class="icon" style="font-size:26px;width:56px;height:56px" data-act="roleicons" aria-label="Change icon">${d.icon}</button><input class="field plain" id="r-title" value="${esc(d.title)}" maxlength="32" aria-label="Role name" autocomplete="off"></div><textarea class="field plain" id="r-desc" maxlength="120" aria-label="Tagline">${esc(d.desc)}</textarea><p class="small">Tap the icon, the name or the tagline to change it.</p>${S.iconPick ? `<div class="pillrow">${ICONS.map((ic) => `<button class="pill" style="font-size:20px;padding:6px 10px" data-act="iconchoose" data-p="${ic}" aria-label="Use ${ic}">${ic}</button>`).join("")}</div>` : ""}</div>` : ""}
  <button class="btn" data-act="roleconfirm" data-p="${ctx}">${w ? "See your kitchen" : "Save"}</button>
  <button class="link" data-act="rolelater" data-p="${ctx}" style="color:var(--muted);font-weight:600;text-align:center;width:100%">${w ? "Later" : "Not now"}</button>`;
}
const roleLine = (who) => role(who) ? `${role(who).icon} ${esc(role(who).title)}` : "";

/* ---------- screens ---------- */
const screens = {
  invite: () => `<div class="body center">
    <div class="av" style="width:56px;height:56px;font-size:22px">A</div>
    ${S.own ? `<h1>Arjan set you up with a kitchen of your own</h1><p>Keep track of what's in the fridge and pantry. Invite people in whenever you like.</p>` : `<h1>Arjan invited you to Our kitchen</h1><p>Share what's in the fridge and pantry, and cook from it together.</p>`}
    <button class="btn" data-act="signin">Continue with Google</button>
    <p class="small">You'll sign in with Google. We never see your password.</p></div>`,

  welcome: () => {
    const names = NAMES.slice(0, S.existing);
    const who = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : `${names[0]}, ${names[1]} and the rest`;
    return header() + `<div class="body" style="padding-top:28px">
      ${S.own
        ? `<div><h1>Your very own kitchen, ${esc(me().name)}.</h1><p style="margin-top:8px">Arjan thought you'd like one. Zero peer pressure.</p></div><p>It's empty and a little echoey. Fill it with whatever you like, including fourteen kinds of rice.</p>`
        : `<div><h1>You're in, ${esc(me().name)}.</h1><p style="margin-top:8px">${esc(who)} would be thrilled to have you in their kitchen.</p></div><p>Kitchens are messy places. We'd like to make this one a bit more organised.</p>`}
      <b>No pressure. Pick a role you like playing, or do it later.</b>
      ${roleEditor("welcome")}</div>`;
  },

  today: () => {
    const soon = S.pantry.filter((p) => p.days !== null && p.days <= 3).sort((a, b) => a.days - b.days);
    const cook = RECIPES.filter((r) => can(r).length >= r.ings.length - 1).slice(0, 3);
    const first = !S.bannerGot && S.persona === "sam" && S.joined && !S.own;
    return shell(`<div class="body">
      ${first ? `<div class="banner" style="margin:0"><span>Shared with Arjan</span><button class="lnk" data-act="gotit">Got it</button></div>` : ""}
      <div><h1 style="font-size:2rem">Good morning, ${esc(me().name)}.</h1><p style="margin-top:6px">${S.recipes ? "Use these up, and here's what they make." : "Here's what to use up."}</p></div>
      ${S.pwaCard ? `<div class="card dash"><div class="pwa"><span style="color:var(--fg)">${POT}</span><div><b style="font-size:17px">Open your kitchen straight away</b><p class="small" style="margin-top:2px">No browser, no faff. Just tap and you're in.</p></div></div><div class="row" style="gap:18px"><button class="btn sm" data-sheet="pwa">Add it now</button><button class="link" data-act="pwano" style="color:var(--muted);font-weight:600">Not now</button></div></div>` : ""}
      <div class="card"><span class="big">${soon.length} to use soon</span>${soon.length ? soon.map((p) => `<button class="li" data-go="item" data-p="${p.id}"><span>${esc(p.name)}</span><span class="chip ${p.days <= 1 ? "warn" : ""}">${dayLabel(p.days)}</span></button>`).join("") : "<p>Nothing is about to expire.</p>"}</div>
      ${S.recipes
        ? `<div class="card"><span class="big">${cook.length} you can cook now</span>${cook.map((r) => `<button class="li" data-go="recipe" data-p="${r.id}"><span>${esc(r.name)}</span><span class="sub" style="margin:0">${r.time} min</span></button>`).join("")}</div>`
        : `<button class="card" data-go="upgrade"><b>Know what you can cook</b><p class="small">Recipes uses what's in your pantry. Add it to your kitchen.</p></button>`}
    </div>`);
  },

  pantry: () => header() + downBanner() + `<div class="body tight">
    <div class="phead"><h1>Pantry</h1><button class="icon" data-act="search" aria-label="Search" aria-expanded="${S.searchOpen}">${I.search}</button></div>
    ${S.searchOpen ? `<div class="searchbar"><input class="field" id="search" placeholder="Search your pantry" value="${esc(S.search)}" autocomplete="off"></div>` : ""}
    <div class="tools"><button class="tbtn sortbtn" data-act="sortopen" aria-label="Sort">${SORTS.find((s) => s[0] === S.sort)[1]}</button><button class="tbtn" data-act="recent" aria-pressed="${S.recentOnly}">Recent</button>
      ${S.sortOpen ? `<div class="sortpanel" role="menu">${SORTS.map(([k, l]) => `<button role="menuitemcheckbox" aria-checked="${S.sort === k}" data-act="sort" data-p="${k}">${l}</button>`).join("")}</div>` : ""}</div>
    <nav class="atabs" aria-label="Area">${["All", ...AREAS].map((a) => `<button data-act="areatab" data-p="${a}" class="${S.areaTab === a ? "on" : ""}">${a}</button>`).join("")}</nav>
    <div id="plist">${listHtml()}</div></div>
    <nav class="dock" aria-label="Add and share"><button class="icon" data-sheet="add" aria-label="Add an item" title="Add an item" ${S.down ? "disabled" : ""}>${I.plus}</button><button class="icon" data-act="copyshop" aria-label="Copy shopping list" title="Copy shopping list">${I.cart}</button><button class="icon" data-act="copykitchen" aria-label="Copy kitchen list" title="Copy kitchen list">${I.list}</button></nav>` + bar(),

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
    <div class="row"><span class="av" style="width:56px;height:56px;font-size:24px">${role(S.persona) ? role(S.persona).icon : me().initial}</span><div><b style="font-size:20px">${esc(me().name)}</b><p class="small">${role(S.persona) ? esc(role(S.persona).title) : "Our kitchen"}</p></div></div>
    <div class="menu">
      <button data-go="household">Household <span class="chip">${S.members.length}</span></button>
      <button data-sheet="role">${role(S.persona) ? "Change my kitchen role" : "Pick a kitchen role"}</button>
      <button data-go="ai">AI assistant</button>
      ${pays() ? `<button data-go="${S.recipes ? "household" : "upgrade"}">Plan and billing</button>` : ""}
      <button data-act="signout" class="danger">Sign out</button></div></div>`,

  household: () => backHeader("Back", "Household") + `<div class="body">
    <div><h1 style="font-size:2rem">Our kitchen</h1><p style="margin-top:4px">${S.members.length} members</p></div>
    <div><span class="lbl">Members</span>${S.members.map((w) => `<button class="m" data-sheet="member" data-p="${w}"><span class="av" style="font-size:20px">${role(w) ? role(w).icon : PEOPLE[w].initial}</span><div style="flex:1"><b>${PEOPLE[w].name}</b>${w === S.persona ? ' <span class="chip">You</span>' : ""}${role(w) ? `<p class="small">${esc(role(w).title)}</p>` : ""}</div><span class="chev" style="color:var(--muted)">${I.chev}</span></button>`).join("")}
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

  notmember: () => `<div class="body center"><h1 style="font-size:2rem">This Google account isn't in a household yet</h1>
    <p>You're signed in as <b style="color:var(--fg)">j.smith@example.com</b>. To join one, ask someone in the household to send you an invite link.</p>
    <button class="btn" data-act="restart">I have an invite link</button><button class="btn ghost" data-act="restart">Use a different Google account</button></div>`,
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
  if (sh === "role") return wrap(`<h2>Your kitchen role</h2><p>Optional. Shown next to your name in the household list.</p>${roleEditor("sheet")}`);
  if (sh === "member") {
    const w = S.memberWho, r = role(w), self = w === S.persona;
    return wrap(`<div class="row"><span class="av" style="width:56px;height:56px;font-size:26px">${r ? r.icon : PEOPLE[w].initial}</span><div><b style="font-size:20px">${PEOPLE[w].name}</b>${self ? ' <span class="chip">You</span>' : ""}</div></div>
      ${r ? `<div><b style="font-size:17px">${esc(r.title)}</b><p style="margin-top:4px">${esc(r.desc)}</p></div>` : `<p>${self ? "You haven't picked a kitchen role." : PEOPLE[w].name + " hasn't picked a kitchen role."}</p>`}
      ${self ? `<button class="btn" data-sheet="role">${r ? "Change role" : "Pick a role"}</button>` : ""}<button class="btn ghost" data-act="closesheet">Close</button>`);
  }
  return "";
}

/* ---------- panel ---------- */
function panelHtml() {
  const sw = (k, label) => `<label><span>${label}</span><button class="sw ${S[k] ? "on" : ""}" data-ctl="${k}" aria-pressed="${S[k]}"></button></label>`;
  return `<div class="grp"><h3>Who you are</h3><label><span>Signed in as</span><select data-ctl="persona"><option value="sam" ${S.persona === "sam" ? "selected" : ""}>Sam</option><option value="arjan" ${S.persona === "arjan" ? "selected" : ""}>Arjan (looks after the plan)</option></select></label></div>
  <div class="grp"><h3>Invite</h3>${sw("own", "Starting their own kitchen")}<label><span>People already in</span><select data-ctl="existing">${[1, 2, 3].map((n) => `<option value="${n}" ${S.existing === n ? "selected" : ""}>${n === 3 ? "3 or more" : n}</option>`).join("")}</select></label><p class="st">Changes the welcome words. Use "Invite link opens" to replay.</p></div>
  <div class="grp"><h3>Household</h3>${sw("recipes", "Has Recipes")}${sw("down", "Platform is down")}${sw("expireNext", "Sign-in ends on next save")}</div>
  <div class="grp"><h3>Home-screen prompt</h3><div class="st" id="pwa-st">${esc(pwaStatus())}</div><button class="pb" data-act="usage">Add 30 min of use</button><button class="pb" data-act="week">Move on a week</button><p class="st">Nothing until 1 hour of use. Then once, twice, once over three weeks. Then never. Shows on Today.</p></div>
  <div class="grp"><h3>Jump to</h3><button class="pb" data-act="restart">Invite link opens</button><button class="pb" data-act="jump" data-p="today">Today</button><button class="pb" data-act="jump" data-p="pantry">Pantry</button><button class="pb" data-act="jump" data-p="household">Household</button><button class="pb" data-act="jump" data-p="notmember">Not a member</button><button class="pb" data-act="reset">Reset everything</button></div>
  <p class="st">Fake data. Nothing leaves your browser.</p>`;
}

/* ---------- render ---------- */
let lastScreen = null;
function render() {
  const phone = document.getElementById("phone");
  const prev = phone.querySelector(".body"); const top = prev && lastScreen === S.screen ? prev.scrollTop : 0;
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
  copyshop() { toast("Shopping list copied"); }, copykitchen() { toast("Kitchen list copied"); },
  copy() { toast("Link copied"); }, copyinvite() { toast("Invite link copied"); },
  revoke(name) { S.invites = S.invites.filter((i) => i.name !== name); render(); toast("Invite cancelled"); },
  leave() { toast("You'd leave Our kitchen here"); },
  aitab(t) { S.aiTab = t; S.aiActive = true; render(); }, aitoggle() { S.aiActive = !S.aiActive; render(); },
  ask() { toast("Sent to Arjan"); S.stack.pop(); go("today", null, { replace: true }); },
  pay() { S.recipes = true; refreshPanel(); S.stack = []; go("recipes", null, { replace: true }); toast("Recipes added for Our kitchen"); },
  rolepick(i) { const r = ROLE_PRESETS[Number(i)]; S.rdraft = { pi: Number(i), icon: r.icon, title: r.title, desc: r.desc }; S.iconPick = false; render(); },
  roleicons() { S.iconPick = !S.iconPick; render(); },
  iconchoose(ic) { if (S.rdraft) S.rdraft.icon = ic; S.iconPick = false; render(); },
  roleconfirm(ctx) {
    const d = S.rdraft; if (d && d.title.trim()) S.roles[S.persona] = { icon: d.icon, title: d.title.trim(), desc: d.desc.trim() };
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
  jump(p) { S.joined = S.joined || p !== "notmember"; S.stack = []; go(p, null, { replace: true }); },
};

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-act],[data-go],[data-sheet],[data-ctl],[data-stop]"); if (!t) return;
  if (t.dataset.stop && !t.dataset.act && !t.dataset.go && !t.dataset.sheet) return;
  if (t.dataset.ctl) { const k = t.dataset.ctl; if (k === "persona" || k === "existing") return; S[k] = !S[k]; refreshPanel(); render(); return; }
  if (t.dataset.sheet) {
    if (t.dataset.sheet === "member") S.memberWho = t.dataset.p;
    if (t.dataset.sheet === "add") S.draft = { days: null };
    if (t.dataset.sheet === "role") { const r = role(S.persona); S.rdraft = r ? { pi: -1, icon: r.icon, title: r.title, desc: r.desc } : null; S.iconPick = false; }
    S.sheet = t.dataset.sheet; render(); return;
  }
  if (t.dataset.act) { if (t.disabled) return; e.stopPropagation(); (acts[t.dataset.act] || (() => {}))(t.dataset.p, t.dataset.d); return; }
  if (t.dataset.go) { S.sheet = null; return go(t.dataset.go, ["item", "recipe"].includes(t.dataset.go) ? t.dataset.p : null); }
});
document.addEventListener("change", (e) => { const c = e.target.dataset && e.target.dataset.ctl; if (c === "persona") { S.persona = e.target.value; refreshPanel(); render(); } if (c === "existing") { S.existing = Number(e.target.value); render(); } });
document.addEventListener("input", (e) => { if (e.target.id === "r-title" && S.rdraft) S.rdraft.title = e.target.value; if (e.target.id === "r-desc" && S.rdraft) S.rdraft.desc = e.target.value; if (e.target.id === "search") { S.search = e.target.value; document.getElementById("plist").innerHTML = listHtml(); } });
document.getElementById("gear").addEventListener("click", () => document.getElementById("panel").classList.toggle("open"));
render();
