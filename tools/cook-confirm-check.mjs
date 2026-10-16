// Behaviour check for the cook-time confirm mockup (fragments/cook-confirm), Kitchie #788.
// Proves: nothing is written before the confirm tap in any version; A shows every line and gates on low-confidence answers;
// B surfaces only the ask lines and the folded lines still go in on the same confirm; C writes only what is marked out;
// D asks nothing at cook time and one question once a threshold trips; the chat surface reaches a save in every version;
// something-else-went-in works; the direction cue is on every line; no network beyond the page itself.
// Usage:  python3 -m http.server 8231 &   then   node tools/cook-confirm-check.mjs   (needs playwright-core; BASE=url to override)
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8231/fragments/cook-confirm/index.html";
let fails = 0;
const ok = (n, c, x) => { if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } else if (process.env.V) console.log("ok  ", n); };
const browser = await chromium.launch();
const p = await (await browser.newContext({ viewport: { width: 420, height: 1000 } })).newPage();
p.on("pageerror", e => { fails++; console.log("pageerror", e.message); });
const reqs = []; p.on("request", r => reqs.push(r.url()));
await p.goto(BASE);
ok("only page, css, script, theme and shared files load", reqs.every(u => /cook-confirm|theme|shared|localhost/.test(u)) && reqs.length < 12, reqs);
const W = async () => JSON.parse(await p.getAttribute(".phone", "data-written"));
// A
ok("A shows 7 lines", await p.locator(".phone .ln").count() === 7);
ok("A: every line has a direction cue", await p.locator(".phone .ln .lv").count() === 7);
ok("A: potatoes head toward low even though the arithmetic is clean", await p.locator('.ln[data-id="potato"] .lv').getAttribute("data-h") === "low");
ok("A: confirm is gated by 2 answers", (await p.textContent(".go")).includes("Answer 2") && await p.locator(".go").isDisabled());
ok("A: nothing written yet", (await W()).length === 0);
await p.click('.ln[data-id="milk"] [data-pick="out"]');
await p.click('.ln[data-id="chicken"] [data-pick="low"]');
ok("A: confirm enabled after both answers, 3 changes (potatoes, butter, milk)", (await p.textContent(".go")).includes("Confirm 3 changes"), await p.textContent(".go"));
ok("A: still nothing written before the tap", (await W()).length === 0);
await p.click('.ln[data-id="potato"] .lk');
await p.click('.ln[data-id="potato"] [data-q][data-d="1"]');
await p.click('.ln[data-id="potato"] .lk');
ok("A: override on a clean-arithmetic line shows 'you set this'", await p.locator('.ln[data-id="potato"] .tagu').count() === 1);
await p.click(".go");
const wa = await W();
ok("A: confirm writes potatoes 2 (overridden), butter 220, milk out; chicken stays", wa.length === 3 && wa.find(w => w.id === "potato").qty === 2 && wa.find(w => w.id === "butter").qty === 220 && wa.find(w => w.id === "milk").level === "out", wa);
await p.click("[data-undo]");
ok("A: undo clears", (await W()).length === 0);
// something else
await p.click('[data-add="open"]'); await p.click('[data-extra="spinach"]');
ok("A: spinach added as an ask line, not in the recipe", await p.locator('.ln[data-id="spinach"][data-kind="ask"]').count() === 1);
// B
await p.click('.sw[data-ver="B"]');
ok("B: 2 surfaced, 5 folded", await p.locator(".phone > .body > .lns > .ln").count() === 2 && await p.locator(".phone details .ln").count() === 5);
await p.click('.ln[data-id="milk"] [data-pick="some"]'); await p.click('.ln[data-id="chicken"] [data-pick="out"]');
ok("B: nothing written before confirm", (await W()).length === 0);
await p.click(".go");
const wb = await W();
ok("B: folded lines go in on the same confirm (potatoes, butter, milk some, chicken out)", wb.length === 4 && wb.some(w => w.id === "potato" && w.qty === 1) && wb.some(w => w.id === "chicken" && w.level === "out"), wb);
// C
await p.click('.sw[data-ver="C"]');
ok("C: one question, 7 chips", await p.locator(".q h4").textContent() === "Did anything run out?" && await p.locator("[data-out]").count() === 7);
ok("C: default button is 'Nothing ran out'", (await p.textContent(".go")).includes("Nothing ran out"));
await p.click('[data-out="milk"]'); await p.click(".go");
const wc = await W();
ok("C: only milk written", wc.length === 1 && wc[0].id === "milk" && wc[0].level === "out", wc);
ok("C: says everything else is left as it was", await p.locator("details.quiet").count() === 1);
// D
await p.click('.sw[data-ver="D"]');
ok("D: no question at cook time", await p.locator(".q").count() === 0 && (await p.getAttribute(".phone", "data-due")) === "0");
await p.click("[data-cook]");
ok("D: a second cook trips milk (flat 3): one question only", await p.locator(".q").count() === 1 && (await p.textContent(".q h4")).startsWith("Milk"), await p.textContent(".phone"));
ok("D: other due items are waiting, not asked", (await p.textContent(".q")).includes("more waiting"));
await p.click('[data-ans="low"]');
ok("D: answering resets the count and writes one level", (await W()).length === 1 && (await W())[0].level === "low");
await p.selectOption("[data-mode]", "shape");
ok("D: by-shape threshold asks again at once", await p.locator(".q").count() === 1);
// chat
await p.click('[data-surface="chat"]');
for (const v of ["A", "B", "C", "D"]) {
  await p.click(`.sw[data-ver="${v}"]`);
  for (let i = 0; i < 6 && !(await p.getAttribute(".phone", "data-done") === "1"); i++) await p.locator(".cchips .cp").first().click();
  ok(`chat ${v}: reaches a save`, (await p.getAttribute(".phone", "data-done")) === "1");
  ok(`chat ${v}: asks no more than 3 questions`, await p.locator(".bub.u").count() <= 5, await p.locator(".bub.u").count());
}
await p.click('.sw[data-ver="B"]');
await p.locator(".cchips .cp").nth(2).click(); await p.locator(".cchips .cp").first().click();
ok("chat B: improvised question appears before save", (await p.textContent(".phone")).includes("wasn't in the recipe"));
await p.locator(".cchips .cp").first().click(); await p.locator(".cchips .cp").first().click();
ok("chat B: spinach captured as out, nothing saved before the end", (await W()).some(w => w.id === "spinach"), await W());
ok("chat contract has say hints: milk asks, potatoes mention", await p.evaluate(() => { const c = JSON.parse(document.getElementById("contract").textContent); return c.lines.find(l => l.item === "milk").say === "ask" && c.lines.find(l => l.item === "potatoes").say === "mention"; }));
await p.click('[data-surface="app"]');
ok("app contract has no say hint", await p.evaluate(() => !JSON.parse(document.getElementById("contract").textContent).lines[0].say));
ok("legend shows 5 cue states", await p.locator("#legend .lv").count() === 5);
await p.click("#cmp");
ok("compare shows 4 phones", await p.locator(".phone").count() === 4);
await browser.close();
console.log(fails ? fails + " FAILED" : "all ok");
process.exit(fails ? 1 : 0);
