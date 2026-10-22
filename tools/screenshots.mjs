// Reusable screenshot + layout check script (DESIGN.md section 7).
// Usage:  python3 -m http.server 8123 &   then   node tools/screenshots.mjs [outDir] [--only=substring]
// Needs playwright-core (npm i --no-save playwright-core@1.56.0) and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// The three household variants (mobile, tablet, desktop) are listed separately; --only=household runs all six household entries.
// Captures every screen at 360, 390 (phone), 768 (tablet), 1280 (desktop) in kitchie-day (light) and kitchie (dark),
// and prints automatic checks: sideways scroll, tap targets under 44px, content edge-to-edge on desktop.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:8123/";
const out = process.argv.find((a, i) => i > 1 && !a.startsWith("--")) || "shots";
const only = (process.argv.find(a => a.startsWith("--only=")) || "").slice(7);
const SCREENS = [
  ["index", "index.html"],
  ["draft-recipes", "fragments/draft-recipes/index.html"],
  ["add-amount-or-level", "fragments/add-amount-or-level/index.html"],
  ["add-amount-or-level-a-level", "fragments/add-amount-or-level/add.html#a-level"],
  ["cook-step-ingredients", "fragments/cook-step-ingredients/index.html"],
  ["plan-start-cooking", "fragments/plan-start-cooking/index.html"],
  ["plan-start-cooking-b", "fragments/plan-start-cooking/phone.html?o=b&m=adhoc"],
  ["plan-start-cooking-b-missing", "fragments/plan-start-cooking/phone.html?o=b&m=missing"],
  ["plan-start-cooking-cooking", "fragments/plan-start-cooking/cooking.html?o=b"],
  ["receipt-scan-index", "fragments/receipt-scan/index.html"],
  ["receipt-scan-a-review", "fragments/receipt-scan/a.html?step=review&pre=half"],
  ["receipt-scan-b-review", "fragments/receipt-scan/b.html?step=review&pre=half"],
  ["receipt-scan-c-review", "fragments/receipt-scan/c.html?step=review&pre=half"],
  ["receipt-scan-d-review", "fragments/receipt-scan/d.html?step=review&pre=half"],
  ["household-mobile", "flows/household/mobile/index.html"],
  ["household-tablet", "flows/household/tablet/index.html"],
  ["household-desktop", "flows/household/desktop/index.html"],
  /* third item: a household Controls "Jump to" screen to open before the capture (the flow starts on the invite link) */
  ["household-mobile-pantry", "flows/household/mobile/index.html", "pantry"],
  ["household-tablet-pantry", "flows/household/tablet/index.html", "pantry"],
  ["household-desktop-pantry", "flows/household/desktop/index.html", "pantry"],
  /* fourth item: a Controls button to press after the jump. Desktop only: "Simulate tab focus" plays the refresh animation over the docked search bar (above 1024px; below it the button says so). */
  ["household-desktop-pantry-refresh", "flows/household/desktop/index.html", "pantry", "tabfocus"],
  ["inventory-home", "fragments/inventory-home/index.html"],
  ["item-row-axes", "fragments/item-row-axes/index.html"],
  ["desktop", "fragments/desktop/index.html"],
  ["recipe-browse-full", "fragments/recipe-browse-full/index.html"],
  ["household-activity", "fragments/household-activity/index.html"],
  ["household-activity-bell", "fragments/household-activity/app.html?scene=few"],
  ["household-activity-peek", "fragments/household-activity/app.html?scene=few&open=peek"],
  ["household-activity-desktop", "fragments/household-activity/desktop.html?scene=many&open=peek"],
  ["pantry-search", "fragments/pantry-search/index.html"],
  ["pantry-search-closed", "fragments/pantry-search/app.html"],
  ["pantry-search-open", "fragments/pantry-search/app.html?state=open&q=ch"],
  ["removed-members", "fragments/removed-members/index.html"],
  ["removed-members-phone", "fragments/removed-members/app.html"],
  ["removed-members-remove", "fragments/removed-members/app.html?screen=remove&who=maya&removed=none"],
  ["removed-members-desktop", "fragments/removed-members/desktop.html"],
  ["recipe-tags", "fragments/recipe-tags/index.html"],
  ["recipe-tags-list-a", "fragments/recipe-tags/app.html?screen=list&find=a&sel=Breakfast,Protein&reset=1"],
  ["recipe-tags-detail-sheet", "fragments/recipe-tags/app.html?screen=detail&tagin=row&id=sha&open=tags&reset=1"],
  ["receipt-live", "fragments/receipt-live/index.html"],
  ["desktop-profile", "fragments/desktop-profile/index.html"],
  ["invite-new-household", "fragments/invite-new-household/index.html"],
  ["oauth-consent-kitchie", "fragments/oauth-consent/index.html?p=kitchie"],
  ["oauth-consent-recipe", "fragments/oauth-consent/index.html?p=recipe"],
  ["oauth-consent-long", "fragments/oauth-consent/index.html?p=recipe&a=long"],
  ["oauth-consent-dev", "fragments/oauth-consent/index.html?p=kitchie&dev=1"],
  ["invite-own-modal-empty", "fragments/desktop-profile/index.html?open=invite&inv=empty"],
  ["invite-own-modal-filled", "fragments/desktop-profile/index.html?open=invite&inv=filled"],
  ["invite-own-modal-created", "fragments/desktop-profile/index.html?open=invite&inv=created"],
  ["invite-own-modal-copied", "fragments/desktop-profile/index.html?open=invite&inv=copied"],
  ["invite-own-gutter-never-sent", "fragments/desktop-profile/index.html?open=me"],
  ["invite-own-gutter-my-invites", "fragments/desktop-profile/index.html?open=me&invs=some"],
  ["invite-own-my-invites", "fragments/desktop-profile/index.html?open=invite&inv=list"],
  ["invite-own-my-invites-at-3", "fragments/desktop-profile/index.html?open=invite&inv=limit"],
  ["invite-own-start-landing", "fragments/invite-new-household/start.html?s=landing"],
  ["invite-own-start-household", "fragments/invite-new-household/start.html?s=household"],
  ["invite-own-start-nomessage", "fragments/invite-new-household/start.html?s=landing&msg=none"],
  ["invite-own-start-expired", "fragments/invite-new-household/start.html?s=expired"],
  ["invite-own-start-used", "fragments/invite-new-household/start.html?s=used"],
  ["profile-prefs-dots", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=mine"],
  ["profile-prefs-member-proposals", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=sam"],
  ["profile-prefs-r7-mine", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=mine"],
  ["profile-prefs-r7-household", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=hh"],
  ["profile-prefs-r7-give", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=sam&sel=a:give"],
  ["profile-prefs-r7-maya", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=maya"],
  ["profile-prefs-r7-empty", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=jo"],
  ["profile-prefs-r8-avoid-hard", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=mine&sel=a:f:f1"],
  ["profile-prefs-r8-avoid-soft-household", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=hh&sel=a:f:h1"],
  ["profile-prefs-r8-avoid-as-sam", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=hh&sel=a:f:h2&as=sam"],
  ["profile-prefs-r8-member", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=sam"],
  ["profile-prefs-r8-added", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=mine&as=sam"],
  ["profile-prefs-r7-else", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=else"],
  ["profile-prefs-r7-as-sam", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=arjan&as=sam"],
  ["profile-prefs-r7-picker", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=mine&sel=a:add:me&pq=rice"],
  ["profile-prefs-r7-probe", "fragments/desktop-profile/index.html?open=preferences&pref=a&psub=mine&sel=a:probe&pq=milk"],
  ["profile-prefs-r7-phone-gallery", "fragments/desktop-profile/phone.html"],
  ["profile-ai-list-many", "fragments/desktop-profile/index.html?open=me&ai=many"],
  ["profile-ai-list-states", "fragments/desktop-profile/index.html?open=me&aic=claude:connecting,chatgpt:late"],
  ["profile-ai-claude-off", "fragments/desktop-profile/index.html?open=me&sel=ai:claude&aic=claude:off,chatgpt:on"],
  ["profile-ai-claude-connecting", "fragments/desktop-profile/index.html?open=me&sel=ai:claude&aic=claude:connecting,chatgpt:on"],
  ["profile-ai-claude-connected", "fragments/desktop-profile/index.html?open=me&sel=ai:claude&aic=claude:on,chatgpt:on"],
  ["profile-ai-claude-disconnect", "fragments/desktop-profile/index.html?open=me&sel=ai:claude&aic=claude:on,chatgpt:on&aidc=claude"],
  ["profile-ai-claude-cancelled", "fragments/desktop-profile/index.html?open=me&sel=ai:claude&aic=claude:cancelled,chatgpt:on"],
  ["profile-ai-claude-failed", "fragments/desktop-profile/index.html?open=me&sel=ai:claude&aic=claude:late,chatgpt:on"],
  ["profile-ai-chatgpt-off", "fragments/desktop-profile/index.html?open=me&sel=ai:chatgpt&aic=chatgpt:off,claude:on"],
  ["profile-ai-chatgpt-connecting", "fragments/desktop-profile/index.html?open=me&sel=ai:chatgpt&aic=chatgpt:connecting,claude:on"],
  ["profile-ai-chatgpt-connected", "fragments/desktop-profile/index.html?open=me&sel=ai:chatgpt&aic=chatgpt:on,claude:on"],
  ["profile-ai-chatgpt-cancelled", "fragments/desktop-profile/index.html?open=me&sel=ai:chatgpt&aic=chatgpt:cancelled,claude:on"],
  ["profile-ai-chatgpt-failed", "fragments/desktop-profile/index.html?open=me&sel=ai:chatgpt&aic=chatgpt:late,claude:on"],
  ["profile-ai-gemini-off", "fragments/desktop-profile/index.html?open=me&sel=ai:gemini&aic=claude:on"],
  ["profile-ai-gemini-connecting", "fragments/desktop-profile/index.html?open=me&sel=ai:gemini&aic=gemini:connecting,claude:on"],
  ["item-sheet", "fragments/item-sheet/index.html"],
  ["home-detail-panel", "fragments/home-detail-panel/index.html"],
  ["home-detail-panel-live", "fragments/home-detail-panel/home.html?open=recipe:lime-tacos"],
  ["item-edit-flyout", "fragments/item-edit-flyout/index.html"],
  ["item-edit-flyout-live", "fragments/item-edit-flyout/pantry.html?sel=butter&child=edit"],
  ["item-edit-flyout-level", "fragments/item-edit-flyout/pantry.html?sel=eggs&child=edit&field=level"],
  ["item-edit-flyout-sheet-buy-counted", "fragments/item-edit-flyout/pantry.html?sel=tom"],
  ["item-edit-flyout-sheet-buy-out", "fragments/item-edit-flyout/pantry.html?sel=tom&lv=Out"],
  ["item-edit-flyout-sheet-buy-weighed", "fragments/item-edit-flyout/pantry.html?sel=cheddar"],
  ["item-edit-flyout-sheet-buy-words", "fragments/item-edit-flyout/pantry.html?sel=spinach&lv=Running%20low"],
  ["item-edit-flyout-sheet-plenty", "fragments/item-edit-flyout/pantry.html?sel=eggs"],
  ["item-edit-flyout-add", "fragments/item-edit-flyout/pantry.html?mode=add"],
  ["item-edit-flyout-unit-chips", "fragments/item-edit-flyout/pantry.html?sel=carrots&child=edit&field=qty"],
  ["item-edit-flyout-hand-set", "fragments/item-edit-flyout/pantry.html?sel=milk&child=edit&field=level"],
  ["item-edit-flyout-edit-no-shopping", "fragments/item-edit-flyout/pantry.html?sel=tom&child=edit&field=useby"],
  ["locations-spots", "fragments/locations-spots/index.html"],
  ["mid-cook", "fragments/mid-cook/index.html"],
  ["plan-week", "fragments/plan-week/index.html"],
  ["plan-desktop", "fragments/plan-desktop/index.html"],
  ["plan-hard-avoid-notes", "fragments/plan-hard-avoid/index.html"],
  ["plan-hard-avoid-stop", "fragments/plan-hard-avoid/frame.html?state=stop"],
  ["plan-hard-avoid-warn", "fragments/plan-hard-avoid/frame.html?state=warn"],
  ["plan-hard-avoid-warn2", "fragments/plan-hard-avoid/frame.html?state=warn2"],
  ["plan-hard-avoid-excluded", "fragments/plan-hard-avoid/frame.html?state=excluded"],
  ["plan-hard-avoid-clear", "fragments/plan-hard-avoid/frame.html?state=clear"],
  ["plan-hard-avoid-others", "fragments/plan-hard-avoid/frame.html?state=others"],
  ["plan-hard-avoid-soft", "fragments/plan-hard-avoid/frame.html?state=soft"],
  ["preferences-mine-household", "fragments/preferences-mine-household/index.html"],
  ["pwa-cta", "fragments/pwa-cta/index.html"],
  ["preferences-option-a", "fragments/preferences-option-a/index.html"],
  ["preferences-option-c", "fragments/preferences-option-c/index.html"],
  ["recipe-tab", "recipe/index.html"],
  ["recipe-tab-list", "recipe/list.html"],
  ["recipe-tab-detail", "recipe/detail.html?id=efr"],
  ["recipe-versions", "recipe-versions/index.html"],
  ["recipe-versions-family", "recipe-versions/family.html"],
  ["recipe-versions-version", "recipe-versions/version.html?v=v2"],
  ["recipe-versions-spec", "recipe-versions/spec.html"],
  ["recipe-ideas", "recipe-ideas/index.html"],
  ["recipe-ideas-home", "recipe-ideas/home.html"],
  ["recipe-ideas-all", "recipe-ideas/all.html"],
  ["recipe-photos", "recipe-photos/index.html"],
  ["recipe-photos-recipe", "recipe-photos/recipe.html?id=efr"],
  ["recipe-page", "fragments/recipe-page/index.html"],
  ["recipe-search", "fragments/recipe-search/index.html"],
  ["scan-in", "fragments/scan-in/index.html"],
  ["shopper-link", "fragments/shopper-link/index.html"],
  ["shopper-link-list-fresh", "fragments/shopper-link/list.html?s=fresh"],
  ["shopper-link-list-trim", "fragments/shopper-link/list.html?s=trim"],
  ["shopper-link-list-committed", "fragments/shopper-link/list.html?s=committed"],
  ["shopper-link-list-bailed", "fragments/shopper-link/list.html?s=bailed"],
  ["shopper-link-list-reject-ask", "fragments/shopper-link/list.html?s=reject-ask"],
  ["shopper-link-list-rejected", "fragments/shopper-link/list.html?s=rejected"],
  ["shopper-link-list-claimed-other", "fragments/shopper-link/list.html?s=claimed-other"],
  ["shopper-link-list-notfound-other", "fragments/shopper-link/list.html?s=notfound-other"],
  ["shopper-link-list-committed-all", "fragments/shopper-link/list.html?s=committed-all"],
  ["shopper-link-member-list-states", "fragments/shopper-link/member-list.html?s=states"],
  ["shopper-link-member-list-three", "fragments/shopper-link/member-list.html?s=three"],
  ["shopper-link-member-list-sorting", "fragments/shopper-link/member-list.html?s=sorting"],
  ["shopper-link-member-list-dead", "fragments/shopper-link/member-list.html?s=dead"],
  ["shopper-link-member-list-ended", "fragments/shopper-link/member-list.html?s=ended"],
  ["shopper-link-link-unopened", "fragments/shopper-link/link.html?s=unopened"],
  ["shopper-link-link-active", "fragments/shopper-link/link.html?s=active"],
  ["shopper-link-link-promised", "fragments/shopper-link/link.html?s=promised"],
  ["shopper-link-link-got", "fragments/shopper-link/link.html?s=got"],
  ["shopper-link-link-dead", "fragments/shopper-link/link.html?s=dead"],
  ["use-up", "fragments/use-up/index.html"],
  ["list-language-index", "fragments/list-language/index.html?eager=1"],
  ["list-language-a-pantry", "fragments/list-language/app.html?v=a&s=pantry"],
  ["list-language-b-pantry", "fragments/list-language/app.html?v=b&s=pantry"],
  ["list-language-c-recipes", "fragments/list-language/app.html?v=c&s=recipes"],
  ["list-language-d-home", "fragments/list-language/app.html?v=d&s=home"],
].filter(s => !only || s[0].includes(only));
const WIDTHS = [[360, 800, "phone"], [390, 844, "phone"], [768, 1024, "tablet"], [1280, 900, "desktop"]];
const THEMES = [["kitchie-day", "light"], ["kitchie", "dark"]];

const browser = await chromium.launch();
mkdirSync(out, { recursive: true });
const problems = [];
for (const [name, path, jump, press] of SCREENS) {
  for (const [w, h, bucket] of WIDTHS) {
    for (const [theme, mode] of THEMES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
      await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      if (jump) await page.evaluate(j => document.querySelector(`[data-act=jump][data-p=${j}]`).click(), jump);
      if (press) { await page.evaluate(a => document.querySelector(`[data-act=${a}]`).click(), press); await page.waitForTimeout(600); }
      await page.waitForTimeout(250);
      const r = await page.evaluate(([w]) => {
        const de = document.documentElement;
        const small = [...document.querySelectorAll("a,button,input,select,textarea,[role=button]")].filter(el => {
          const lab = el.closest("label"); const b = (lab && lab !== el ? lab : el).getBoundingClientRect(), cs = getComputedStyle(el);
          return b.width > 0 && b.height > 0 && cs.visibility !== "hidden" && !(el.tagName === "A" && cs.display === "inline") && (b.height < 43.5 || b.width < 43.5);
        }).slice(0, 6).map(el => (el.tagName + "." + (el.className || "").toString().slice(0, 24) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height)));
        const wrap = document.querySelector(".wrap");
        const max = parseFloat(getComputedStyle(de).getPropertyValue("--content-max")) || 100000; return { max, sw: de.scrollWidth, cw: de.clientWidth, theme: de.getAttribute("data-theme"), small, wrapW: wrap ? Math.round(wrap.getBoundingClientRect().width) : null };
      }, [w]);
      const file = `${out}/${name}__${w}-${mode}.png`;
      await page.screenshot({ path: file, fullPage: true });
      const flags = [];
      if (r.sw > r.cw) flags.push(`SIDEWAYS SCROLL ${r.sw}>${r.cw}`);
      if (r.theme !== theme) flags.push(`theme ${r.theme}`);
      if (bucket === "desktop" && r.wrapW && r.wrapW > r.max) flags.push(`wide ${r.wrapW}`);
      if (r.small.length) flags.push(`small targets: ${r.small.join("; ")}`);
      if (flags.length) problems.push(`${name} @${w} ${mode}: ${flags.join(" | ")}`);
      await ctx.close();
    }
  }
}
await browser.close();
console.log(problems.length ? "CHECKS:\n" + problems.join("\n") : "CHECKS: clean");
console.log(`${SCREENS.length * WIDTHS.length * THEMES.length} screenshots in ${out}/`);
