// Behaviour, tap-count and layout check for fragments/settings-areas-overhaul (headless Chromium). Prints PASS or FAIL per check.
// Usage:  python3 -m http.server 8123 &   then   node tools/settings-areas-overhaul-check.mjs
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: every screen of A (flat pages), B (one note) and C (faces) at 390x844 and 360x640, light and dark, Match my phone and +30%: no console error, no sideways scroll, nothing wider than the phone,
// every control at least 44px tall (words in B exempt in width); the behaviour of each control; the seven tap sequences (played, end state checked) and that directions.html prints those numbers;
// the coverage table; no hex colour in areas.css; the knowledge note (SR-P45 to SR-P57, SR-Q52 to SR-Q57), REVIEW-QUEUE and the index tile.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/settings-areas-overhaul/";
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
const SCREENS = { A: ["menu", "front", "household", "household+invite", "you", "prefs", "prefs+hh", "kitchen"], B: ["menu", "front", "note", "note@checks", "note@food", "note@places", "note@assist", "note@rest"], C: ["menu", "front", "household", "household+me", "household+sam", "household+invite", "household+hh", "kitchen"] };
async function ctx(theme, scheme, w, h) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  return c;
}
function track(p) { p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); }); return p; }
async function open(c, o, p = "front", ts = 0) {
  const pg = track(await c.newPage());
  await pg.goto(`${BASE}index.html?o=${o}&p=${encodeURIComponent(p)}&ts=${ts}&bare=1`); await pg.waitForSelector("body[data-ready]"); await pg.waitForTimeout(80);
  return pg;
}
const LAYOUT = () => {
  const ph = document.querySelector(".phone"), R = ph.getBoundingClientRect();
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; if (e.closest("[hidden],[inert]")) return false; return true; };
  const small = [], wide = [];
  for (const e of ph.querySelectorAll("button,input,textarea,[role=switch]")) {
    let t = e; if (e.type === "checkbox") t = e.closest("label") || e; if (e.type === "hidden") continue;
    if (!vis(t)) continue; const r = t.getBoundingClientRect(), tk = t.classList.contains("tk");
    if (r.height < 43.5 || (!tk && r.width < 43.5)) small.push((e.getAttribute("aria-label") || e.textContent || e.className).trim().slice(0, 24) + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  for (const e of ph.querySelectorAll("*")) {
    if (!vis(e) || e.closest(".avrow,.rot,.rtrack")) continue; const r = e.getBoundingClientRect();
    if (r.right > R.right + 1.5 || r.left < R.left - 1.5) wide.push(e.className || e.tagName);
  }
  const bd = ph.querySelector(".bd"), shb = ph.querySelector(".shb");
  return { small, wide: wide.slice(0, 3), sx: document.documentElement.scrollWidth > innerWidth + 1 || bd.scrollWidth > bd.clientWidth + 1 || (shb && shb.scrollWidth > shb.clientWidth + 1) };
};

/* 1. every screen, both widths, light and dark, both text sizes */
for (const [th, sc] of [["kitchie", "dark"], ["kitchie-day", "light"]]) for (const [w, h] of [[390, 844], [360, 640]]) for (const ts of [0, 3]) {
  const c = await ctx(th, sc, w, h); let bad = [], n = 0;
  for (const o of ["A", "B", "C"]) for (const s of SCREENS[o]) {
    const p = await open(c, o, s, ts); n++;
    const L = await p.evaluate(LAYOUT);
    if (p.errs.length || L.sx || L.wide.length || L.small.length) bad.push(`${o} ${s}: ${p.errs.join(";")} ${L.sx ? "scroll-x " : ""}${L.wide.join(",")} ${L.small.join(",")}`);
    await p.close();
  }
  ok(bad.length === 0, `${n} screens ${th} ${w}x${h} text ${ts ? "+30%" : "own"}: no error, no sideways scroll, nothing wider than the phone, controls 44px ${bad.slice(0, 4).join(" | ")}`);
  await c.close();
}

/* 2. behaviour */
const C0 = await ctx("kitchie", "dark", 390, 844);
const txt = (p, s) => p.locator(s).first().innerText();
const has = async (p, s) => (await p.locator(s).count()) > 0;
const vis = (p, s) => p.locator(s).first().isVisible().catch(() => false);
const sw = (p, a) => p.click(`label.sw:has([data-a="${a}"])`);
{ // A household
  const p = await open(C0, "A", "household");
  await p.fill("[data-in=hhname]", "Our place"); ok(await p.inputValue("[data-in=hhname]") === "Our place", "A: household name is a field");
  await p.click('[data-a="open:p:sam"]'); ok(await vis(p, '[data-a="adm:sam"]') && await vis(p, '[data-a="ask:rm:sam"]'), "A: a person opens in place with Admin and Remove");
  await sw(p, "adm:sam"); ok(/Sam is an admin/.test(await txt(p, ".toast")), "A: Admin switch works");
  await p.click('[data-a="open:p:sam"]'); await p.click('[data-a="open:p:sam"]'); await p.click('[data-a="ask:rm:sam"]'); await p.click("[data-a=keep]"); ok(!await has(p, '[data-a="do:rm:sam"]') && await has(p, '[data-a="open:p:sam"]'), "A: Remove asks in place and Keep leaves them");
  await p.click('[data-a="ask:rm:sam"]'); await p.click('[data-a="do:rm:sam"]'); ok(!await has(p, '[data-a="open:p:sam"]'), "A: removing a person removes the row");
  await p.click('[data-a="cancelinv:i1"]'); ok(!await has(p, '[data-a="cancelinv:i1"]'), "A: a pending invite cancels");
  await p.click('[data-a="kind:own"]'); await p.click("[data-a=copy]"); ok(/N3RT/.test(await txt(p, ".link")) && /household of their own/.test(await txt(p, ".link")), "A: the invite has two kinds and one press copies");
  ok(await has(p, "text=History") && !await has(p, "text=Danger"), "A: Household ends with History, no danger zone");
  await p.close();
}
{ // A you
  const p = await open(C0, "A", "you");
  await p.click("[data-a=avopen]"); ok(await p.locator(".avrow button").count() === 13, "A: the picture row opens in place with the initial and twelve pictures");
  await p.click('[data-a="pic:3"]'); ok((await txt(p, ".big-av")).includes("🍄"), "A: choosing a picture shows it");
  await p.fill("[data-in=myname]", "Alexa"); ok(await p.inputValue("[data-in=myname]") === "Alexa", "A: name is a field");
  await p.click('[data-a="open:role"]'); await p.click('[data-a="role:2"]'); ok(/Baker/.test(await txt(p, ".blk .val")), "A: kitchen role chips open in place and set");
  ok(await has(p, "text=Download my data") && await has(p, "text=Install Kitchie") && await has(p, "text=Sign out"), "A: You has data, install and sign out");
  await p.click('[data-a="ask:leave"]'); ok(await p.getAttribute('[data-a="do:leave"]', "aria-disabled") === "true", "A: Leave is disabled until your name is typed");
  await p.fill("#lv", "Alexa"); ok(await p.getAttribute('[data-a="do:leave"]', "aria-disabled") === "false", "A: typing your name enables Leave");
  await p.close();
}
{ // A preferences
  const p = await open(C0, "A", "prefs");
  ok(/Same as household/.test(await txt(p, ".crow")), "A: Mine shows Same as household");
  await sw(p, "tog:ask"); ok(/Yours/.test(await txt(p, ".crow")), "A: changing a switch makes it yours"); await p.click('[data-a="reset:ask"]'); ok(/Same as household/.test(await txt(p, ".crow")), "A: one button goes back to the household's");
  await p.click('[data-a="step:cap:1"]'); ok(await txt(p, ".num b") === "6", "A: stepper adds one");
  await p.dblclick('.crow[data-ctl=cap] .rm'); ok(await txt(p, ".num b") === "5", "A: double tap on the row resets it (DESIGN.md 8)");
  await p.fill("[data-in=qs]", "20:00"); ok(await p.inputValue("[data-in=qs]") === "20:00", "A: quiet hours start is a time in the row");
  await p.click("[data-a=qnone]"); ok(await has(p, "text=No quiet hours") && !await has(p, "[data-in=qs]"), "A: No quiet hours for me");
  await p.click('[data-a="scope:hh"]'); ok(await has(p, "text=Ask to check amounts") && !await has(p, "[data-a=qnone]"), "A: Everyone shows the household's own rows");
  await p.click('[data-a="scope:me"]');
  ok(await has(p, ".fh:has-text('Avoids')") && await has(p, ".fh:has-text('Likes')"), "A: Food is grouped under Avoids and Likes headings");
  ok(await has(p, ".fmark .hard") && await has(p, ".fmark.soft"), "A: Hard has a lock, Soft says Soft; Everyone and Just you are icons");
  ok(!/no reason given/i.test(await txt(p, ".bd")) && await p.locator(".fline").first().evaluate(e => getComputedStyle(e).textOverflow === "ellipsis" && getComputedStyle(e).whiteSpace === "nowrap"), "A: a reason is one quiet line with an ellipsis, none where there is none");
  ok(await p.locator(".flist").evaluateAll(l => l.every(x => x.firstElementChild.classList.contains("fadd-li"))), "A: the add row is first in each group");
  await p.click(".fadd >> nth=0"); ok(/assistant/i.test(await txt(p, ".toast")), "A: Add says what to tell the assistant");
  await p.fill("#note-me", "no spice"); ok(await p.inputValue("#note-me") === "no spice", "A: notes are a text box");
  await p.click('[data-a="open:hm:sam"]'); ok(await has(p, "text=Suggest something for Sam"), "A: a housemate opens in place");
  await p.click('[data-a="open:rules"]'); ok(/2 rules/.test(await txt(p, '[data-a="open:rules"]')), "A: Rules by place opens in place"); await p.click('[data-a="rulerm:0"]'); ok(/1 rule,/.test(await txt(p, '[data-a="open:rules"]')), "A: a rule removes");
  await p.click('[data-a="sheet:rule"]'); ok(await vis(p, ".sheet"), "A: Add a rule is one sheet"); await p.click("[data-a=ruleadd]"); ok(!await vis(p, ".sheet") && /2 rules/.test(await txt(p, '[data-a="open:rules"]')), "A: the rule adds and the sheet closes");
  await p.close();
}
{ // A kitchen
  const p = await open(C0, "A", "kitchen");
  await p.click('[data-a="chipadd:cats"]'); await p.fill("[data-in=chipin]", "Oils"); await p.click("[data-a=chipsave]"); ok(await has(p, ".cp:has-text('Oils')"), "A: a category adds");
  await p.click('[data-a="clear:samples"]'); ok(!await has(p, "[data-a='clear:samples']"), "A: Clear them removes the row");
  await p.click('[data-a="ai:chatgpt"]'); ok(/Connected/.test(await txt(p, '.arow-wrap:has-text("ChatGPT")')), "A: Connect works");
  await p.click('[data-a="open:a:chatgpt"]'); await sw(p, "dflt:chatgpt"); ok(/the default/.test(await txt(p, '.arow-wrap:has-text("ChatGPT")')), "A: default assistant is a switch when two are connected");
  await p.click('[data-a="ask:ai:chatgpt"]'); await p.click('[data-a="do:ai:chatgpt"]'); ok(/Not connected/.test(await txt(p, '.arow-wrap:has-text("ChatGPT")')), "A: Disconnect asks in place and works");
  await p.click('[data-a="link:make"]'); await p.click('[data-a="ask:revoke"]'); ok(await has(p, '[data-a="do:revoke"]'), "A: Revoke asks in place"); await p.click('[data-a="do:revoke"]'); ok(await has(p, '[data-a="link:make"]'), "A: Revoke works");
  await p.close();
}
{ // B
  const p = await open(C0, "B", "note");
  await p.click('[data-a="tk:invite"]'); ok(/K7QX/.test(await txt(p, ".link")), "B: the word Invite someone copies the link in one tap");
  await p.click('[data-a="kind:own"]'); await p.click("[data-a=copy]"); ok(/N3RT/.test(await txt(p, ".link")), "B: the invite kind switches in the drawer");
  await p.click('[data-a="tk:p:me"]'); await p.fill("[data-in=myname]", "Alexa"); ok(await txt(p, "[data-metk]") === "Alexa", "B: your name changes in the sentence as you type");
  await p.click('[data-a="tk:p:sam"]'); await p.click('[data-a="ask:rm:sam"]'); await p.click('[data-a="do:rm:sam"]'); ok(!await has(p, '[data-a="tk:p:sam"]'), "B: remove a person from the drawer");
  await p.click('[data-a="tk:ask"]'); ok(await txt(p, '[data-a="tk:ask"]') === "may not", "B: the word may flips on one tap"); await p.dblclick('[data-a="tk:ask"]'); ok(await txt(p, '[data-a="tk:ask"]') === "may", "B: double tap on the word resets it");
  await p.click('[data-a="tk:q"]'); await p.fill("[data-in=qs]", "20:00"); ok(/8pm/.test(await txt(p, '[data-a="tk:q"]')), "B: a time word opens its time and the sentence follows");
  await p.click('[data-a="tk:cap"]'); await p.click('[data-a="step:cap:1"]'); ok(await txt(p, '[data-a="tk:cap"]') === "6", "B: the number word opens a stepper");
  await p.click('[data-a="tk:scope"]'); await p.click('[data-a="scope:hh"]'); ok(/everyone/.test(await txt(p, '[data-sec=checks]')), "B: the scope word switches to everyone's");
  await p.click('[data-a="scope:me"]');
  await p.click('[data-a="tk:fadd"]'); await p.fill("[data-in=chipin]", "anchovies"); await p.click("[data-a=faddsave]"); ok(await has(p, ".tk:has-text('anchovies')"), "B: Add a word adds a word to the sentence");
  await p.click('.tk:has-text("anchovies")'); await p.click("[data-a^=chip2]"); ok(!await has(p, ".tk:has-text('anchovies')"), "B: a word removes from its drawer");
  await p.click('[data-a="tk:cats"]'); await p.click('[data-a="chipadd:cats"]'); await p.fill("[data-in=chipin]", "Oils"); await p.click("[data-a=chipsave]"); ok(/13 categories/.test(await txt(p, '[data-a="tk:cats"]')), "B: a category adds from the sentence");
  await p.click('[data-a="tk:a:chatgpt"]'); await p.click('[data-a="ai:chatgpt"]'); ok(/Claude and ChatGPT/.test(await txt(p, "[data-sec=assist]")), "B: connect from the sentence");
  await p.click('[data-a="tk:leave"]'); await p.click('[data-a="ask:leave"]'); ok(await vis(p, '[data-a="do:leave"]'), "B: leave asks in place");
  await p.close();
}
{ // C
  const p = await open(C0, "C", "household");
  ok(await p.locator(".face").count() === 5, "C: faces for three people, a pending invite and the plus");
  await p.click('[data-a="sheet:face:sam"]'); ok(await vis(p, ".sheet") && await vis(p, '[data-a="ask:rm:sam"]'), "C: a face opens its sheet in place"); await p.keyboard.press("Escape"); ok(!await vis(p, ".sheet"), "C: Escape closes the sheet");
  await p.click('[data-a="sheet:invite"]'); await p.click("[data-a=copy]"); ok(/K7QX/.test(await txt(p, ".sheet .link")), "C: the plus face copies the link");
  await p.click(".sheet [data-a=shut].pbtn");
  await p.click('[data-a="sheet:face:me"]'); await p.click('.sheet [data-a="step:cap:1"]'); ok(await txt(p, ".sheet .num b") === "6", "C: your sheet changes your own value"); ok(await txt(p, ".crow .num b") === "5", "C: the Household page keeps everyone's value");
  await p.click('.sheet [data-a="ai:chatgpt"]'); ok(/Connected/.test(await txt(p, '.sheet .arow-wrap:has-text("ChatGPT")')), "C: assistants are on your sheet");
  ok(await has(p, ".sheet >> text=Leave Henderson kitchen"), "C: leave is at the foot of your sheet");
  await p.close();
}

/* 3. tap sequences, played */
const JOBS = {
  A: [[['[data-a="go:household"]', "[data-a=copy]"], p => /kitchie\.app\/join/.test(p)], [['[data-a="go:household"]', '[data-a="go:you"]', "[data-in=myname]"], "focus:myname"], [['[data-a="go:prefs"]', "[data-a=qnone]"], p => /No quiet hours/.test(p)], [['[data-a="go:prefs"]', '[data-a="step:cap:1"]'], p => /\b6\b/.test(p)], [['[data-a="go:kitchen"]', '[data-a="ai:chatgpt"]'], p => /ChatGPT\s+Connected/.test(p)], [['[data-a="go:kitchen"]', '[data-a="chipadd:cats"]'], "vis:[data-in=chipin]"], [['[data-a="go:household"]', '[data-a="open:p:sam"]', '[data-a="ask:rm:sam"]', '[data-a="do:rm:sam"]'], "gone:Sam"]],
  B: [[['[data-a="go:note"]', '[data-a="tk:invite"]'], p => /kitchie\.app\/join/.test(p)], [['[data-a="go:note"]', '[data-a="tk:p:me"]', "[data-in=myname]"], "focus:myname"], [['[data-a="go:note"]', '[data-a="tk:q"]', "[data-a=qnone]"], p => /at any hour/.test(p)], [['[data-a="go:note"]', '[data-a="tk:cap"]', '[data-a="step:cap:1"]'], p => /no more than 6 a day/.test(p)], [['[data-a="go:note"]', '[data-a="tk:a:chatgpt"]', '[data-a="ai:chatgpt"]'], p => /Claude and ChatGPT are connected/.test(p)], [['[data-a="go:note"]', '[data-a="tk:cats"]', '[data-a="chipadd:cats"]'], "vis:[data-in=chipin]"], [['[data-a="go:note"]', '[data-a="tk:p:sam"]', '[data-a="ask:rm:sam"]', '[data-a="do:rm:sam"]'], "gone:Sam"]],
  C: [[['[data-a="go:household"]', '[data-a="sheet:invite"]', "[data-a=copy]"], p => /kitchie\.app\/join/.test(p)], [['[data-a="go:household"]', '[data-a="sheet:face:me"]', ".sheet [data-in=myname]"], "focus:myname"], [['[data-a="go:household"]', '[data-a="sheet:face:me"]', ".sheet [data-a=qnone]"], p => /No quiet hours/.test(p)], [['[data-a="go:household"]', '[data-a="sheet:face:me"]', '.sheet [data-a="step:cap:1"]'], p => /\b6\b/.test(p)], [['[data-a="go:household"]', '[data-a="sheet:face:me"]', '.sheet [data-a="ai:chatgpt"]'], p => /ChatGPT\s+Connected/.test(p)], [['[data-a="go:kitchen"]', '[data-a="chipadd:cats"]'], "vis:[data-in=chipin]"], [['[data-a="go:household"]', '[data-a="sheet:face:sam"]', '.sheet [data-a="ask:rm:sam"]', '.sheet [data-a="do:rm:sam"]'], "gone:Sam"]]
};
const played = {};
for (const o of ["A", "B", "C"]) for (let j = 0; j < 7; j++) {
  const [steps, pred] = JOBS[o][j]; const p = await open(C0, o, "front");
  for (const s of steps) await p.click(s);
  const text = await p.locator(".phone").innerText();
  let good;
  if (typeof pred === "function") good = pred(text);
  else if (pred.startsWith("focus:")) good = await p.evaluate(n => document.activeElement && document.activeElement.getAttribute("data-in") === n, pred.slice(6));
  else if (pred.startsWith("vis:")) good = await vis(p, pred.slice(4));
  else good = !(await p.locator("[data-pn=sam],[data-a='tk:p:sam'],[data-a='sheet:face:sam'],[data-a='open:p:sam']").count());
  ok(good, `${o} job ${j + 1} ends where it should after ${steps.length} taps`); played[`${o}-${j + 1}`] = steps.length;
  await p.close();
}

/* 4. directions.html: every screen, the numbers, the coverage */
{
  const html = readFileSync(new URL("../fragments/settings-areas-overhaul/directions.html", import.meta.url), "utf8");
  const printed = Object.fromEntries([...html.matchAll(/data-tap="([ABC]-\d)">(\d+)</g)].map(m => [m[1], +m[2]]));
  const diff = Object.keys(played).filter(k => printed[k] !== played[k]);
  ok(Object.keys(printed).length === 21 && diff.length === 0, `directions.html prints the played tap counts ${diff.join(",")}`);
  const rows = [...html.matchAll(/<tr><td>([^<]+)<\/td><td>[^<]+<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/g)].filter(m => !/Per-tool/.test(m[1]));
  ok(rows.length >= 30 && rows.every(r => r[2].trim() && r[3].trim() && r[4].trim()), `coverage table places ${rows.length} things in all three directions`);
  const c = await ctx("kitchie-day", "light", 1280, 900); const p = track(await c.newPage());
  await p.goto(`${BASE}directions.html`); await p.waitForSelector("body[data-ready]");
  ok(p.errs.length === 0 && await p.locator("#strip-A .phone").count() === 8 && await p.locator("#strip-B .phone").count() === 8 && await p.locator("#strip-C .phone").count() === 8, "directions.html draws 8 playable phones in each direction, no error");
  for (const w of ["360", "390"]) for (const ts of ["0", "3"]) {
    await p.click(`[data-w="${w}"]`); await p.click(`[data-ts="${ts}"]`); await p.waitForTimeout(60);
    const L = await p.evaluate(() => [...document.querySelectorAll(".strip .phone")].map(ph => { const bd = ph.querySelector(".bd"); return bd.scrollWidth > bd.clientWidth + 1 ? 1 : 0; }).reduce((a, b) => a + b, 0));
    ok(L === 0, `directions.html at ${w} wide, text ${ts === "3" ? "+30%" : "own"}: no phone scrolls sideways`);
  }
  await c.close();
  // the first-screen control count the page prints for the busiest page
  const counts = {};
  for (const [o, pg] of [["A", "prefs"], ["B", "note"], ["C", "household"]]) {
    const pp = await open(C0, o, pg);
    counts[o] = await pp.evaluate(() => { const ph = document.querySelector(".phone"), R = ph.querySelector(".bd").getBoundingClientRect(); const seen = new Set(); for (const e of ph.querySelectorAll("button,input,textarea,[role=switch]")) { const t = e.type === "checkbox" ? (e.closest("label") || e) : e, r = t.getBoundingClientRect(); if (r.width > 2 && r.height > 2 && r.top >= R.top - 1 && r.top < R.bottom - 8) seen.add(t); } return seen.size; });
    await pp.close();
  }
  const pc = Object.fromEntries([...html.matchAll(/data-ctrl="([ABC])">(\d+)</g)].map(m => [m[1], +m[2]]));
  ok(["A", "B", "C"].every(o => pc[o] === counts[o]), `directions.html prints the first-screen control counts (played ${JSON.stringify(counts)}, printed ${JSON.stringify(pc)})`);
}

/* 5. files */
{
  const css = readFileSync(new URL("../fragments/settings-areas-overhaul/areas.css", import.meta.url), "utf8");
  ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in areas.css (tokens only)");
  const note = readFileSync(new URL("../docs/knowledge/jobs-to-be-done/settings-redesign.md", import.meta.url), "utf8");
  const miss = []; for (let i = 45; i <= 57; i++) if (!new RegExp("\\*\\*SR-P" + i + "\\.").test(note)) miss.push("P" + i); for (let i = 52; i <= 57; i++) if (!new RegExp("\\*\\*SR-Q" + i + "\\.").test(note)) miss.push("Q" + i);
  ok(miss.length === 0, `the note records SR-P45 to SR-P57 and SR-Q52 to SR-Q57 ${miss.join(",")}`);
  ok(/settings-areas-overhaul/.test(readFileSync(new URL("../REVIEW-QUEUE", import.meta.url), "utf8")), "REVIEW-QUEUE has the line");
  ok(/fragments\/settings-areas-overhaul\//.test(readFileSync(new URL("../index.html", import.meta.url), "utf8")), "the index has the tile");
}
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
