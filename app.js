"use strict";
/* Our kitchen — clickable prototype. Static, no build, no backend.
   Everything here is fake data; nothing leaves the browser. */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PEOPLE = {
  arjan: { name: "Arjan", initial: "A", role: "Owner" },
  sam: { name: "Sam", initial: "S", role: "Member" },
};

const RECIPES = [
  { id: "saag", name: "Saag paneer", time: 35, ings: [["spinach", "Spinach", "250 g"], ["paneer", "Paneer", "200 g"], ["onion", "Onion", "2"], ["garam", "Garam masala", "2 tsp"], ["cream", "Cream", "100 ml"]] },
  { id: "rice", name: "Egg fried rice", time: 20, ings: [["eggs", "Eggs", "3"], ["rice", "Basmati rice", "300 g"], ["onion", "Onion", "1"]] },
  { id: "omelette", name: "Spinach omelette", time: 10, ings: [["spinach", "Spinach", "100 g"], ["eggs", "Eggs", "3"]] },
  { id: "toastie", name: "Cheese and onion toastie", time: 8, ings: [["cheese", "Cheese", "80 g"], ["onion", "Onion", "1"], ["bread", "Bread", "4 slices"]] },
];

const freshPantry = () => [
  { id: "milk", key: "milk", name: "Milk, 2 L", where: "Fridge", days: 0, by: "Arjan" },
  { id: "spinach", key: "spinach", name: "Spinach", where: "Fridge", days: 1, by: "Arjan" },
  { id: "eggs", key: "eggs", name: "Eggs, 12", where: "Fridge", days: 5, by: "Arjan" },
  { id: "paneer", key: "paneer", name: "Paneer, 200 g", where: "Fridge", days: 3, by: "Arjan" },
  { id: "rice", key: "rice", name: "Basmati rice, 5 kg", where: "Pantry", days: null, by: "Arjan" },
  { id: "onion", key: "onion", name: "Onions", where: "Pantry", days: 12, by: "Arjan" },
  { id: "garam", key: "garam", name: "Garam masala", where: "Pantry", days: null, by: "Arjan" },
];

const initial = () => ({
  screen: "invite", stack: [], tab: "today", param: null,
  persona: "sam", recipes: false, down: false, expireNext: false,
  pantry: freshPantry(), sheet: null, toast: null,
  members: [{ who: "arjan" }, { who: "sam" }], invites: [{ name: "Priya", days: 6 }],
  inviteLink: null, aiTab: "ChatGPT", aiActive: true, bannerGot: false, pwa: true,
  pending: null, joined: false,
});
let S = initial();

const dayLabel = (d) => (d === null ? "No date" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : d + " days");
const can = (r) => r.ings.filter(([k]) => S.pantry.some((p) => p.key === k));
const me = () => PEOPLE[S.persona];
const isOwner = () => S.persona === "arjan";

/* ---------- navigation ---------- */
function go(screen, param = null, opts = {}) {
  if (!opts.replace) S.stack.push({ screen: S.screen, param: S.param, tab: S.tab });
  S.screen = screen; S.param = param;
  if (["today", "pantry", "recipes"].includes(screen)) { S.tab = screen; S.stack = []; }
  render();
}
function back() {
  const p = S.stack.pop();
  if (p) { S.screen = p.screen; S.param = p.param; S.tab = p.tab; } else go("today", null, { replace: true });
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

/* ---------- screens ---------- */
const screens = {
  invite: () => `<div class="body center">
    <div class="av" style="width:56px;height:56px;font-size:22px">A</div>
    <h1>Arjan invited you to Our kitchen</h1>
    <p>Share what's in the fridge and pantry, and cook from it together.</p>
    <button class="btn" data-act="signin">Continue with Google</button>
    <p class="small">You'll sign in with Google. We never see your password.</p></div>`,

  welcome: () => header() + `<div class="body" style="padding-top:28px">
    <div><h1>You're in, ${esc(me().name)}.</h1><p style="margin-top:8px">Our kitchen &middot; ${S.members.length} members</p></div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="row"><span class="dot"></span><span>Everything Arjan has added is already here</span></div>
      <div class="row"><span class="dot"></span><span>${S.recipes ? "Pantry, and recipes you can cook from it" : "Your pantry, shared with the household"}</span></div>
      <div class="row"><span class="dot"></span><span>Changes show up for everyone</span></div></div>
    <button class="btn" data-go="today" data-first="1">Open our kitchen</button>
    <div class="card dash"><b>Keep it one tap away</b><p class="small">Add it to your home screen. It opens straight to your kitchen, already signed in.</p><button data-sheet="pwa" style="color:var(--mint);font-weight:700;text-align:left">Show me how</button></div></div>`,

  today: () => {
    const soon = S.pantry.filter((p) => p.days !== null && p.days <= 1).sort((a, b) => a.days - b.days);
    const cook = RECIPES.filter((r) => can(r).length >= r.ings.length - 1).slice(0, 3);
    const first = !S.bannerGot && S.persona === "sam" && S.joined;
    return shell(`<div class="body">
      ${first ? `<div class="banner" style="margin:0"><span>Shared with Arjan</span><button class="lnk" data-act="gotit">Got it</button></div>` : ""}
      <div><h1>Good morning, ${esc(me().name)}.</h1><p style="margin-top:6px">${S.recipes ? "Use these up, and here's what they make." : "Here's what to use up."}</p></div>
      <div class="card"><span class="big">${soon.length} to use soon</span>${soon.length ? soon.map((p) => `<button class="li" data-go="item" data-p="${p.id}"><span>${esc(p.name)}</span><span class="chip ${p.days === 0 ? "warn" : ""}">${dayLabel(p.days)}</span></button>`).join("") : "<p>Nothing is about to expire.</p>"}</div>
      ${S.recipes
        ? `<div class="card"><span class="big">${cook.length} you can cook now</span>${cook.map((r) => `<button class="li" data-go="recipe" data-p="${r.id}"><span>${esc(r.name)}</span><span class="sub" style="margin:0">${r.time} min</span></button>`).join("")}</div>`
        : `<button class="card" data-go="upgrade"><b>Know what you can cook</b><p class="small">Recipes uses what's in your pantry. Add it to your kitchen.</p></button>`}
    </div>`);
  },

  pantry: () => shell(`<div class="body">
    <div class="row" style="justify-content:space-between"><h2>Pantry</h2><button class="btn sm" data-sheet="add" ${S.down ? "disabled" : ""}>${S.down ? "Unavailable" : "Add item"}</button></div>
    ${S.down ? '<p class="small">Adding is temporarily unavailable.</p>' : ""}
    <div>${S.pantry.length ? S.pantry.map((p) => `<button class="li" data-go="item" data-p="${p.id}"><span>${esc(p.name)}<span class="sub">${esc(p.where)} &middot; added by ${esc(p.by)}</span></span><span class="chip ${p.days === 0 ? "warn" : ""}">${dayLabel(p.days)}</span></button>`).join("") : "<p>Your pantry is empty. Add what you have.</p>"}</div></div>`),

  item: () => {
    const p = S.pantry.find((x) => x.id === S.param);
    if (!p) return shell(`<div class="body"><p>That item is gone.</p></div>`);
    const rs = RECIPES.filter((r) => r.ings.some(([k]) => k === p.key));
    return backHeader("Pantry", p.name.split(",")[0]) + `<div class="body">
      <div><h1>${esc(p.name)}</h1><p style="margin-top:4px">${esc(p.where)} &middot; added by ${esc(p.by)}</p></div>
      <div class="row"><span class="chip ${p.days === 0 ? "warn" : ""}">${p.days === null ? "No date" : "Use by " + dayLabel(p.days).toLowerCase()}</span></div>
      ${S.recipes && rs.length ? `<div style="display:flex;flex-direction:column;gap:10px"><span class="lbl">Cook it tonight</span>${rs.map((r) => `<button class="rc" data-go="recipe" data-p="${r.id}"><span class="ph"></span><div style="flex:1"><b>${esc(r.name)}</b><p class="small">${can(r).length} of ${r.ings.length} ingredients &middot; ${r.time} min</p></div></button>`).join("")}</div>` : ""}
      ${!S.recipes ? `<button class="card" data-go="upgrade"><b>Know what you can cook</b><p class="small">Recipes uses what's in your pantry.</p></button>` : ""}
      <button class="btn ghost" data-act="used" data-p="${p.id}" ${S.down ? "disabled" : ""}>Mark as used</button></div>`;
  },

  recipes: () => shell(`<div class="body"><h2>Recipes</h2><p>Ranked by what you already have.</p>
    <div style="display:flex;flex-direction:column;gap:10px">${[...RECIPES].sort((a, b) => can(b).length / b.ings.length - can(a).length / a.ings.length).map((r) => `<button class="rc" data-go="recipe" data-p="${r.id}"><span class="ph"></span><div style="flex:1"><b>${esc(r.name)}</b><p class="small">You have ${can(r).length} of ${r.ings.length} &middot; ${r.time} min</p></div></button>`).join("")}</div></div>`),

  recipe: () => {
    const r = RECIPES.find((x) => x.id === S.param); if (!r) return back();
    const have = can(r);
    return backHeader("Recipes", r.name) + `<div class="body" style="flex:1">
      <div><h1>${esc(r.name)}</h1><p style="margin-top:4px">${r.time} min &middot; you have ${have.length} of ${r.ings.length}</p></div>
      <div><span class="lbl">Ingredients</span>${r.ings.map(([k, n, q]) => `<div class="ing"><span>${esc(n)}, ${esc(q)}</span><span class="${S.pantry.some((p) => p.key === k) ? "ok" : "no"}">${S.pantry.some((p) => p.key === k) ? "In pantry" : "Missing"}</span></div>`).join("")}</div>
      <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px"><button class="btn" data-act="cook" data-p="${r.id}" ${S.down || !have.length ? "disabled" : ""}>Cook this</button><p class="small" style="text-align:center">Cooking takes the used items out of your pantry.</p></div></div>` + bar();
  },

  menu: () => backHeader("Back", "") + `<div class="body">
    <div class="row"><span class="av" style="width:56px;height:56px;font-size:20px">${me().initial}</span><div><b style="font-size:20px">${esc(me().name)}</b><p class="small">${esc(me().role)} &middot; Our kitchen</p></div></div>
    <div class="menu">
      <button data-go="household">Household <span class="chip">${S.members.length}</span></button>
      <button data-go="ai">AI assistant</button>
      ${isOwner() ? `<button data-go="${S.recipes ? "household" : "upgrade"}">Plan and billing</button>` : ""}
      <button data-act="signout" style="color:var(--red)">Sign out</button></div></div>`,

  household: () => backHeader("Back", "Household") + `<div class="body">
    <div><h1>Our kitchen</h1><p style="margin-top:4px">${S.members.length} members</p></div>
    <div><span class="lbl">Members</span>${S.members.map((m) => `<div class="m"><span class="av">${PEOPLE[m.who].initial}</span><div style="flex:1"><b>${PEOPLE[m.who].name}</b>${m.who === S.persona ? ' <span class="chip">You</span>' : ""}<p class="small">${PEOPLE[m.who].role}</p></div></div>`).join("")}
      ${S.invites.map((i) => `<div class="m"><span class="av" style="background:var(--surface);border:1px dashed #3a5348;color:var(--muted)">${esc(i.name[0])}</span><div style="flex:1"><b>${esc(i.name)}</b><p class="small">Invited &middot; link expires in ${i.days} days</p></div>${isOwner() ? `<button data-act="revoke" data-p="${esc(i.name)}" style="color:var(--red);font-size:14px">Cancel</button>` : ""}</div>`).join("")}</div>
    <button class="btn" data-sheet="invite">Invite someone</button>
    <div style="border-top:1px solid var(--line);padding-top:14px"><span class="lbl">Included for this household</span>
      <div class="row" style="margin-top:10px;flex-wrap:wrap"><span class="chip">Pantry</span>${S.recipes ? '<span class="chip">Recipes</span>' : `<button class="chip add" data-go="upgrade">Add Recipes</button>`}</div></div>
    <button data-act="leave" style="color:var(--red);font-weight:600;text-align:left">Leave this household</button></div>`,

  ai: () => backHeader("Back", "AI assistant") + `<div class="body">
    <div><h2>Your personal link</h2><p style="margin-top:6px">Lets an assistant read and update Our kitchen as you. It sees everything your household has.</p></div>
    <div class="tabs">${["ChatGPT", "Claude", "Other"].map((t) => `<button data-act="aitab" data-p="${t}" class="${S.aiTab === t ? "on" : ""}">${t}</button>`).join("")}</div>
    <div class="field" style="display:flex;align-items:center"><span class="mono">https://kitchen.example/mcp/s9Xk-4tPq-L2vE</span></div>
    <button class="btn" data-act="copy">Copy link</button>
    <div style="display:flex;flex-direction:column;gap:10px;font-size:15px"><div class="row"><b>1</b><span>${S.aiTab === "Claude" ? "In Claude, open Settings, then Connectors." : S.aiTab === "ChatGPT" ? "In ChatGPT, open Settings, then Connectors." : "Open your assistant's connector settings."}</span></div><div class="row"><b>2</b><span>Paste your link and name it Kitchen.</span></div><div class="row"><b>3</b><span>Ask: "What should I cook tonight?"</span></div></div>
    <div style="border-top:1px solid var(--line);padding-top:14px" class="row"><div style="flex:1"><b>${S.aiTab}</b> <span class="chip">${S.aiActive ? "Active" : "Revoked"}</span><p class="small">${S.aiActive ? "Last used 2 hours ago" : "Make a new link to reconnect"}</p></div><button data-act="aitoggle" style="color:${S.aiActive ? "var(--red)" : "var(--mint)"};font-weight:600">${S.aiActive ? "Revoke" : "New link"}</button></div>
    <p class="small">Anyone with this link can act as you. Revoking it stops it at once.</p></div>`,

  upgrade: () => backHeader("Back", "Add to your kitchen") + (isOwner()
    ? `<div class="body"><div><h1>Recipes</h1><p style="margin-top:6px">Cook from what's already in your pantry.</p></div>
        <div style="display:flex;flex-direction:column;gap:12px"><div class="row"><span class="dot"></span>See what you can cook right now</div><div class="row"><span class="dot"></span>Use up items before they expire</div><div class="row"><span class="dot"></span>Cooking takes items out of your pantry</div><div class="row"><span class="dot"></span>Everyone in Our kitchen gets it</div></div>
        <div class="card"><b style="font-size:20px">$4.99 a month</b><p class="small">For the whole household. Cancel any time. (Example price.)</p></div>
        <button class="btn" data-go="checkout">Continue to payment</button><p class="small" style="text-align:center">You'll pay on a secure page, then come straight back.</p></div>`
    : `<div class="body"><div><h1>Recipes</h1><p style="margin-top:6px">Cook from what's already in your pantry.</p></div>
        <div class="card"><b>Arjan manages this household's plan</b><p class="small">Only an owner can add Recipes. We can let them know you'd like it.</p></div>
        <button class="btn" data-act="ask">Ask Arjan to add it</button><button class="btn ghost" data-act="back">Not now</button></div>`),

  checkout: () => `<div class="top"><button class="back" data-act="back">&lsaquo; Cancel</button><span class="ttl">Secure payment</span><span style="width:64px"></span></div>
    <div class="body"><div class="card"><span class="lbl">Prototype payment page</span><b style="font-size:20px">Recipes for Our kitchen</b><p>$4.99 a month</p></div>
    <p class="small">This stands in for a hosted checkout page. No card is taken.</p><button class="btn" data-act="pay">Pay $4.99</button></div>`,

  notmember: () => `<div class="body center"><h1>This Google account isn't in a household yet</h1>
    <p>You're signed in as <b style="color:var(--text)">j.smith@example.com</b>. To join one, ask a household owner to send you an invite link.</p>
    <button class="btn" data-act="restart">I have an invite link</button><button class="btn ghost" data-act="restart">Use a different Google account</button></div>`,
};

/* ---------- sheets ---------- */
function sheetHtml() {
  const sh = S.sheet; if (!sh) return "";
  if (sh === "pwa") return `<div class="sheet-dim" data-act="closesheet"><div class="sheet" data-stop="1"><h2 style="font-size:22px">Add to home screen</h2><p>On iPhone: tap Share, then Add to Home Screen.<br>On Android: tap the menu, then Add to Home screen.</p><button class="btn" data-act="closesheet">Done</button></div></div>`;
  if (sh === "add") return `<div class="sheet-dim" data-act="closesheet"><div class="sheet" data-stop="1"><h2 style="font-size:22px">Add item</h2>
    <input class="field" id="f-name" placeholder="Name" autocomplete="off"><select class="field" id="f-where"><option>Fridge</option><option>Pantry</option><option>Freezer</option></select>
    <select class="field" id="f-days"><option value="">No date</option><option value="1">Tomorrow</option><option value="3">In 3 days</option><option value="7">In a week</option></select>
    <button class="btn" data-act="additem">Save</button></div></div>`;
  if (sh === "invite") return `<div class="sheet-dim" data-act="closesheet"><div class="sheet" data-stop="1"><h2 style="font-size:22px">Invite someone</h2><p>Send this link. They sign in with Google and join Our kitchen.</p>
    <div class="field" style="display:flex;align-items:center"><span class="mono">https://kitchen.example/join/k7Q2-m9xA-0pR4</span></div>
    <button class="btn" data-act="copyinvite">Copy link</button><p class="small">Works once and expires in 7 days. You can cancel it from Household.</p></div></div>`;
  if (sh === "expired") return `<div class="sheet-dim"><div class="sheet mid" data-stop="1"><h2 style="font-size:22px">Sign in again to save</h2><p>Your sign-in ended. What you typed is kept, and you'll come straight back.</p><button class="btn" data-act="resume">Continue with Google</button></div></div>`;
  return "";
}

/* ---------- panel ---------- */
function panelHtml() {
  const sw = (k, label) => `<label><span>${label}</span><button class="sw ${S[k] ? "on" : ""}" data-ctl="${k}" aria-pressed="${S[k]}"></button></label>`;
  return `<div class="grp"><h3>You are</h3><label><span>Signed in as</span><select data-ctl="persona"><option value="sam" ${S.persona === "sam" ? "selected" : ""}>Sam (member)</option><option value="arjan" ${S.persona === "arjan" ? "selected" : ""}>Arjan (owner)</option></select></label></div>
  <div class="grp"><h3>Household</h3>${sw("recipes", "Has Recipes")}${sw("down", "Platform is down")}${sw("expireNext", "Sign-in ends on next save")}</div>
  <div class="grp"><h3>Jump to</h3><button class="pb" data-act="restart">Invite link opens</button><button class="pb" data-act="jump" data-p="today">Today</button><button class="pb" data-act="jump" data-p="household">Household</button><button class="pb" data-act="jump" data-p="notmember">Not a member</button><button class="pb" data-act="reset">Reset everything</button></div>
  <p class="small" style="color:var(--muted)">Fake data. Nothing leaves your browser.</p>`;
}

/* ---------- render ---------- */
function render() {
  const phone = document.getElementById("phone");
  const sc = screens[S.screen] || screens.today;
  phone.innerHTML = sc() + sheetHtml() + (S.toast ? `<div class="toast">${esc(S.toast)}</div>` : "");
  const panel = document.getElementById("panel");
  if (!panel.dataset.ready || S.panelDirty) { panel.innerHTML = panelHtml(); panel.dataset.ready = "1"; S.panelDirty = false; }
}

/* ---------- actions ---------- */
const acts = {
  back, closesheet() { S.sheet = null; render(); },
  signin() { S.joined = true; go("welcome", null, { replace: true }); },
  gotit() { S.bannerGot = true; render(); },
  retry() { toast(S.down ? "Still reconnecting" : "Back online"); },
  used(p) { if (S.down) return; S.pantry = S.pantry.filter((x) => x.id !== p); S.stack.pop(); go("pantry", null, { replace: true }); toast("Marked as used"); },
  cook(id) {
    if (S.down) return;
    const r = RECIPES.find((x) => x.id === id); const keys = can(r).map(([k]) => k);
    const before = S.pantry.length; S.pantry = S.pantry.filter((p) => !keys.includes(p.key));
    go("pantry"); toast(`Used ${before - S.pantry.length} items. Enjoy.`);
  },
  additem() {
    const name = document.getElementById("f-name").value.trim(); if (!name) return;
    S.pending = { name, where: document.getElementById("f-where").value, days: document.getElementById("f-days").value };
    if (S.expireNext) { S.expireNext = false; S.panelDirty = true; S.sheet = "expired"; render(); } else commitAdd();
  },
  resume() { S.sheet = null; commitAdd(); },
  copy() { toast("Link copied"); }, copyinvite() { toast("Invite link copied"); },
  revoke(name) { S.invites = S.invites.filter((i) => i.name !== name); render(); toast("Invite cancelled"); },
  leave() { toast("You'd leave Our kitchen here"); },
  aitab(t) { S.aiTab = t; S.aiActive = true; render(); }, aitoggle() { S.aiActive = !S.aiActive; render(); },
  ask() { toast("Sent to Arjan"); S.stack.pop(); go("today", null, { replace: true }); },
  pay() { S.recipes = true; S.panelDirty = true; S.stack = []; go("recipes", null, { replace: true }); toast("Recipes added for Our kitchen"); },
  signout() { S = Object.assign(initial(), { persona: S.persona, recipes: S.recipes, down: S.down }); S.panelDirty = true; render(); },
  restart() { S = Object.assign(initial(), { persona: S.persona, recipes: S.recipes, down: S.down }); S.panelDirty = true; render(); },
  reset() { S = initial(); S.panelDirty = true; render(); },
  jump(p) { S.joined = S.joined || p !== "notmember"; S.stack = []; go(p, null, { replace: true }); },
};
function commitAdd() {
  const x = S.pending; if (!x) return; S.pending = null;
  S.sheet = null;
  S.pantry.unshift({ id: "n" + Date.now(), key: x.name.toLowerCase().split(/[ ,]/)[0], name: x.name, where: x.where, days: x.days === "" ? null : Number(x.days), by: me().name });
  render(); toast("Added " + x.name);
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-act],[data-go],[data-sheet],[data-ctl],[data-stop]"); if (!t) return;
  if (t.dataset.stop && !t.dataset.act && !t.dataset.go) return;
  if (t.dataset.ctl) {
    const k = t.dataset.ctl;
    if (k === "persona") return; // handled on change
    S[k] = !S[k]; S.panelDirty = true;
    render(); return;
  }
  if (t.dataset.sheet) { S.sheet = t.dataset.sheet; render(); return; }
  if (t.dataset.act) { e.stopPropagation(); (acts[t.dataset.act] || (() => {}))(t.dataset.p); return; }
  if (t.dataset.go) {
    if (t.dataset.go === "item" || t.dataset.go === "recipe") return go(t.dataset.go, t.dataset.p);
    return go(t.dataset.go);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.dataset && e.target.dataset.ctl === "persona") { S.persona = e.target.value; S.panelDirty = true; render(); }
});
document.getElementById("gear").addEventListener("click", () => document.getElementById("panel").classList.toggle("open"));
render();
