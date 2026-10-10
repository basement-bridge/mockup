# Preferences build: readiness for a production decision

Status: **written 11 October 2026 (Sydney) by the K17 agent** (handoff section 5.5, K17), after the other slices were merged to `uat`. This is a report of what was checked, not a decision: promoting to production, tags and every reserved item stay with the owner. It carries no secrets and no real household data (this repo is public); the checks that touched the deployed UAT were read-only and are described, not quoted.

Sources: the build handoff (`preferences-build-handoff.md`), the review list (kitchie issue #497, restructured by this slice), each repo's `AGENTS.md` and `docs/project-plan.md`, and the code of `kitchie`, `platform` and `recipe` at the commits named below.

## 1. Verdict

**Ready for the owner's production decision, with four things to decide first (section 7). Not ready to tag without them.**

- The built part is solid where it could be tested: every suite passes, the whole mockup-parity set passes as one run, the three repos fit together on the real wire, and the data moves from the production schema to the new one without loss.
- **K10 (food rule tools and the planner check, contract 1.1) was not built when this report was written; it is now built and merged into `uat` (11 October 2026, kitchie issue #557, PR #558, merge df57feb).** Kitchie's own AI contract is "1.1", additive: `give_feedback` and `get_context` carry caps, substitutions, categories, ends and recipes; there is a new read-only `check_food_rules`; `plan_meal` and `plan_update_meal` refuse an avoid and ask at a weekly limit (`override_limit`). Household writes go through the K1 check with the offer to record as their own. Local checks only (typecheck, 2,218 tests, credential scan); CI did not start (billing). The owner still has to accept contract 1.1 and the planner behaviour (kitchie#497, "Needs owner"). The text below was written before it and is left as it was.
- **Platform has to be released before, or with, Kitchie** for household admins to work in production (7.2). Without it nothing breaks, but nobody can change a household setting in platform mode.
- Nothing was run on a real phone, and no one signed in to the deployed UAT screens (section 5).

## 2. What shipped

Twenty-five of the twenty-six slices were on `uat` when this was written; K10 was the one that was not (there was no issue, branch or pull request for it). K10 has since landed (see the first bullet). The count in the task ("26 merged") was wrong on that one.

| Repo | Slices | Schema | Where it stands on 11 October 2026 |
|---|---|---|---|
| platform | PL1 to PL4, then the two flags removed | 5 to 6 (tables `household_admins`, `household_admin_events`, both empty on creation) | `main` has PL1 to PL4 behind two flags that default off; `uat` has the flag removal (platform #69), so the admin and assistant-name fields are on out of the box. Not tagged: the production pin is `v0.1.5` (schema 5). |
| recipe | RC1, RC2, then the flag removed | none (stays 5) | In `main` and tagged `v1.1.4`: `GET /capability/titles` is on out of the box. |
| kitchie | K0 to K9, K11 to K16 (K10 not built when written; merged since, PR #558) | 30 to 34 | `main` and `uat` carry the same code at 0.71.5 (the owner promoted `uat` to `main` at 02:35 on 11 October, pull request #554). Not tagged: the production pin is `v0.67.1` (schema 30). |

What the owner gets, in his words from the handoff: a Preferences page with Mine and Household tabs; stock-check dials (quiet hours including None, a daily limit of 1 to 20, a time zone from the browser); rules by place with a "what applies to this item" probe; a household admin role (the founding member grants and revokes; household settings need an admin); Members and admins view; notes side by side; Kitchen role and My assistant in the profile; food rules as one service with `evaluate()`; the Food card (avoid, like, dislike, end dates, limits with recipes attached by reference, substitutions); live recipe titles from Recipe; counting of recent meals for limits; propose a preference for another member, with a banner at the next sign-in; and the mockup-to-build parity check.

**No feature flag and no new environment variable came from this build.** The three flags the build started with (`KITCHIE_PREFERENCES`, `PLATFORM_HOUSEHOLD_ADMINS`, `PLATFORM_AI_CLIENT_NAMES`, plus `RECIPE_CAPABILITY_TITLES`) are gone from the code and from `compose.yaml`; `main` of platform still names two of them until `uat` is promoted. The variables that do differ between the production tags and the branches (`KITCHIE_LIVE_*`, `ENVIRONMENT_SLUG`, `PLATFORM_TOKEN_NAME_CLAIM`) belong to other work and have defaults.

## 3. Decisions the agents took

All are listed with their reasons on #497 (the owner's review list at the top, the full entries below it). The ones with a visible effect on people:

- The founding member (the longest-standing) is an admin by right; only they grant and revoke; a household always keeps one admin (Q-R1, Q-R2). The chip says "Household admin" where the mockup says "Admin" (D30 wins).
- Soft avoids: K9 turned only those with the reason "other" into dislikes; a soft avoid with no reason stays an avoid, because Kitchie reads an unsaid reason as safety. This is stricter than the handoff default.
- "Stop remembering this" on a safety avoid asks once more, not twice (I-8; the mockup footnote still says twice).
- The suggestion on a limit ("these recipes seem to match") is computed from plan cards and cooking sessions, not written by the assistant: storing one would have needed a schema change.
- Quiet hours default to 22:00 to 06:00 and the daily limit to 3 (K2's own note calls this a behaviour change for every household), because the flag that kept the old defaults was removed. A household's own stored values are kept. See risk 8.2.
- Where the handoff was silent the code fails closed: a Platform that cannot answer means the write is refused with "try again", never allowed; a missing `admin` field means not an admin.
- Both notes are read by `stock_brief` and `stock_settings`, not `get_context` (that is K10's, with the contract bump; K10 is merged and did not add the notes to `get_context`, kept as a listed default on kitchie#497).

## 4. What was checked, and how

Everything here was run on clean clones of `uat` on 10 and 11 October 2026, on a 2-core sandbox with Node 22.22 and headless Chromium. Numbers are from the runs.

**Suites.**
- Kitchie unit: 2,191 tests, all pass, after the fixes in 6 (before: 2,184 tests, 1 failure, the known platform-people one). `tsc --noEmit` clean, credential scan clean, compose check passes.
- Platform: 993 tests, all pass. Recipe: 644 tests, all pass.
- Kitchie browser suite (`npm run test:browser`, 603 tests): 544 pass, 59 fail before the fixes. 4 were the Settings screens test (a stale list of allowed requests and a stale theme count, both fixed). **The other 55 are older than the build:** the same files were run on the production tag `v0.67.1` and fail the same way (bottom bar, item sheet taps and header, Use by sheet, themes, landing page, welcome page status line, Recipes screen), except two (item sheet header typography, light), whose dark twins fail there too; a bisect of the light one points at the event registry work (#481, 0.68.4), which is older than the build and not part of it. No preferences browser test fails: `preferences-*`, `platform-people`, `members-view`, shopper link, plan-week all pass. They are listed on #497.

**Mockup parity (K16).** The whole set, `node scripts/ui-parity.mjs`, now passes as one run: 55 states, markup against the pinned mockup snapshots and pictures at 360, 390, 768, 1024 and 1280, light and dark, with the listed differences only. Before this slice a full run failed (K6 and K13b each built their own Arjan, Jo and Sam on the run's one app, so the founding member was whoever came first; K4 and K7 then saw six members). Fixed in 6.

**Seams, against the code and not the reports.** A throwaway test (not committed; it runs the real servers in one process behind a `fetch` that plays the shared edge) exercised 15 cases, all pass:
1. Kitchie to Platform `GET /api/member`: `admin_ids` (founding member first), `me_is_admin`, `owner_id`, `ai_clients` absent when none; Kitchie's strict reader accepts the real answer.
2. `GET /api/entitlement?product=`: `admin` is read for a session token and for an assistant (OAuth) token (I-20).
3. Grant and revoke over the wire: ok, no-op, and every refusal reads as the port says (not the founding member, not a member, the founding member, the last admin).
4. Members page and Household tab for the founding member, an admin and a member; grant and revoke show at once.
5. The household gate on the Preferences page: a household write needs an admin (member refused, admin accepted); a member's own hours are ungated.
6. Kitchie to Recipe `GET /capability/titles` with the production wiring (https URL from the platform origin and the product path, Platform bearer): found, a variation's own title, missing, another household's recipe reads as missing, 401 without a token.
7. The page draws live titles from the real Recipe; a Recipe that is down reads as "unavailable", never "not found".
8. Old routes in platform mode: `/settings/stock-checks` redirects to Preferences, the old POST routes and `/stock/*` still answer, the household one is still gated.
9. A crawl of every page reachable from Home and Settings (three levels) for the founding member, an admin and a member: no 5xx.
10. to 14. The UAT list of handoff 4.6 on the real code: None for quiet hours is a member's own and the household cannot set it; the rule probe for milk follows the most specific place; a like with an end date lapses and an avoid never does; a proposal shows its banner at the next sign-in and not before, and the proposer sees "Waiting for Sam" and never the outcome; the assistant row follows what is linked (none, one, two).
15. The assistant over `/mcp` with an assistant token: a household-level `give_feedback` is refused for a member and accepted for an admin; a personal one is accepted for both.

**Migrations.** A schema-30 database was built with the production code (every old statement type, dials with `proactivity`, notes, items, a plan card, fake members), then opened with the `uat` code:
- 30 to 34 in one open: no row lost, ids and rowids kept, `context_claims` rebuilt once, the backfills (K9's food rules, K2's proactivity to a whole-kitchen rule) did what handoff 4.6 says, and a second and third open change nothing.
- Staged (30 to 33 with the code of pull request #517, then 34 with `uat`) ends the same as direct.
- Platform 5 to 6: rows kept, two new empty tables, the founding member still the owner, idempotent.
- Older code refuses a newer database (v0.67.1 on schema 34 exits 1 without writing to it; so does platform v0.1.5 on schema 6).

**The deployed UAT, read-only.** The Kitchie UAT and Recipe UAT assistant tools were reachable. Reading `stock_settings`, `stock_brief` and `get_context` showed the new answers in the live UAT (the dials with their source per key, both notes, claims written from the preference form, `contract_version` "1.0", which is right while K10 is unbuilt), and Recipe UAT listed recipes. Nothing was written to UAT.

## 5. What was not checked

- **No signed-in browsing of the deployed UAT screens** (the Preferences page, Members, Food card, banner), and nothing on a real phone. The agent has no UAT sign-in and none was asked for. The same screens were seen in headless Chromium against the real server (the parity check and the browser tests), at 360 and 390 px, light and dark. The manual list is in 7.5.
- **Platform and Recipe as deployed in UAT** were not called: both need a Platform bearer. The seam cases above are the evidence for the pairing, run on the code, not on the deployed pair. Whether the deployed UAT Platform already runs the flag-free `uat` (platform #69) was not confirmed.
- **CI**: the GitHub Actions jobs do not start on any of these repos (billing: "recent account payments have failed or your spending limit needs to be increased"). Every pull request carries local results only.
- **The production-like deploy path**: no deploy, tag or infra change was made or tried. How `main` of Kitchie reaches production (auto-deploy or a pin to a tag through the infra repository) was read from the runbooks, not tested.
- **Load**: no load test. The design adds no request on load (closed rows load no editor code); that rests on the slices' own tests.
- K10, because it does not exist.

## 6. Defects found and fixed

- **`platform-people.test.ts` "Get started: a member of one day sees Link your AI"** failed on every run: the fake member's `joined_at` was computed from a fixed clock of 8 October, so by 10 October the member was no longer "one day old" for the code that reads the real clock. A test defect, not a product one. Fixed.
- **Settings screens browser test** (4 of 8 failing): the test's list of allowed requests did not include `app-version.js` (the app-tier signal, on every signed-in page since #481) and `desktop.css`, and it expected six theme tiles where there are ten. A stale test, not a product defect. Fixed.
- **Parity harness** (above). Fixed: K6 and K13b use the shared world; Recipe is one fake in the run's app, down unless a state brings it up.
- **K10 was never built** and nobody had said so: the status "26 slices merged" was wrong. Found by reading the code against the slice list. Reported, not built (it changes the tool contract, which is reserved).
- Nothing else was found by the seam, migration, crawl and old-route checks. No defect was found in the preferences code itself.

Pull request: kitchie #555 (`fix/k17-test-drift` into `uat`, merged by the agent under rule 1: tests, the harness, the one version bump to 0.72.0 and the plan rows; CI did not start, billing). https://github.com/basement-bridge/kitchie/pull/555

## 7. Owner decisions needed before production

1. **K10 (built since, kitchie PR #558; the question now is whether to accept contract 1.1).** Build it before production, or release without it? Without it: limits and substitutions are saved and shown on the page but the assistant does not see them (`get_context` withholds them on purpose) and the planner does not check them; likes and dislikes cannot be kept for good or stopped from chat. K10 also changes the tool contract (1.1) and the golden tool snapshot, which an agent may not take on alone.
2. **Release order.** Platform first (promote `uat` to `main`, tag, deploy: this is what makes admins work and removes the two flags), then Recipe (`v1.1.4` already carries the titles route), then Kitchie. If Kitchie goes before Platform, platform-mode households cannot change household settings until Platform follows (they could not before either, but the page now says "only household admins can change this"). The tags and the infra pins are the owner's.
3. **Snapshot before Kitchie's migration** (ADR amendment 4). Schema 30 to 34 is one-way: older code refuses the new database, so rollback means restoring the deploy-time backup (`scripts/rollback.sh`) and losing what was written since. Platform 5 to 6 is additive.
4. **The defaults in section 3 that change what people see**, above all: quiet hours 22:00 to 06:00 and a daily limit of 3 for every household that has not set its own; the K9 reading of soft avoids; "ask once" for a safety avoid; and the Waiting-for-Sam line (the most privacy-sensitive default; it shows person, thing and proposer, never the words or the reason).
5. **A manual pass on UAT** by the owner or a person with a sign-in, on a real phone (checklist in section 9).
6. **Readings of the owner's authority that he should confirm** (K1 changes who may write household settings, which `AGENTS.md` lists as a security change; the compose edits in Platform; Recipe's "owner approves on the issue"; the Kitchie contract's additive `proposed` field in `get_context`). They are listed at the top of #497.
7. **CI billing.** Until the GitHub account is fixed no change in these repos has had CI.
8. **The 55 older browser failures.** Fix, or retire the stale tests? They hide any real regression in those files (the bottom bar, item sheet and themes) from the browser suite.

## 8. Risks and rollback

1. **Migration is one-way** (7.3). The K9 backfill keeps the old value in `migrated_from`; the K2 backfill keeps the old `stock_prefs` row. Neither is deleted, but nothing reads them back.
2. **A visible change for every household on release:** the dials' defaults and ranges (quiet hours 22:00 to 06:00 including None, a limit up to 20, up to 20 due checks instead of 10), the old Stock checks page redirecting to Preferences, the profile menu changes, and `kitchie_zone` (a cookie with a time zone name, set on every page, read only for a signed-in member).
3. **Platform not ready or unreachable:** Kitchie fails closed (writes refused with "try again"; reads show nothing guessed). Recipe not reachable: titles read "not available right now"; nothing is taken out because of it.
4. **Platform `main` still carries the two flags** (default off) until `uat` is promoted; promoting Kitchie alone leaves admins unavailable (7.2).
5. **Edge cases around ordering:** the schema numbers are not in the order the handoff reserved (32 shopper link, 33 K9, 34 K2); the migration test covers direct and staged paths.
6. **Rollback:** Kitchie, restore the backup taken at deploy and re-pin the previous tag; Platform, the two new tables are additive and unused by v0.1.5, but v0.1.5 refuses a schema-6 database, so the same applies (restore); Recipe has no schema change (re-pin `v1.1.3`).
7. **Still outstanding on #497** (kept there): K4's removal of the old stock-check routes after nothing links to them, K8's assistant-name mapping, the cooked-meal log for exact limits, and the others in "Refactor later".

## 9. Manual checklist for UAT (handoff 4.6)

Sign in on a phone as each of: the founding member, an admin, a plain member.
- Household tab: the founding member sees Grant and Revoke; an admin sees the list without controls; a member sees who is an admin, read-only, with "Only household admins can change this." Grant and revoke show at once.
- Stock level checks: set quiet hours to None for yourself; try to give the household None (refused); change a household default as an admin; as a member see it read-only.
- Rules by place: open the milk probe; add a rule for the Freezer and for Milk; the more specific place wins; your own rule beats the household's at the same place.
- Food: add an avoid, a like with an end date, a limit with a recipe attached; the title shows live from Recipe; take the Recipe down (or use an unknown id) and see "Title not available right now", not "not found"; a like with an end date lapses on its own after that date.
- Propose a preference for another member; the other member sees the banner at the next sign-in and not before; the proposer sees "Waiting for" and never the outcome.
- Profile: My assistant follows what is linked (none, one, two).
- Old links: `/settings/stock-checks` lands on Preferences; the old shopping and stock pages still open.
- Look for: sideways scroll, targets under 44 px, text clipped at 360 px and in dark.

## 10. What promotion carries, per repo

Counted on 11 October 2026 from the remote branches and tags. "Prod pin" is the release tag production runs; a new tag from `main` carries everything since that tag, not only the preferences work.

| | prod pin | `main` since the pin | `uat` not yet on `main` | schema | environment and compose | dependencies |
|---|---|---|---|---|---|---|
| kitchie | `v0.67.1` | 70 commits: all of the preferences code that is built, the shopper link and the realtime event registry; version 0.71.5 (the owner promoted `uat` on 11 October, #554) | #555 only (tests, parity harness, version 0.72.0, plan rows) | 30 to 34 | none from preferences. Five `KITCHIE_LIVE_*` switches from the event registry, all with defaults (`LIVE_APP` and `LIVE_PLAN` on, the other three off), and the app-tier headers. | none (`package.json` differs by version only) |
| platform | `v0.1.5` | 16 commits: PL1 to PL4 behind two flags that default off, the environment slug (`ENVIRONMENT_SLUG`, empty means production, so the cookie keeps its name), and `PLATFORM_TOKEN_NAME_CLAIM` (empty means off) | 1 commit: the two flags removed (`compose.yaml` two lines, `.env.example`, `scripts/check-compose.sh`, code and tests, plan rows) | 5 to 6 | after promotion no preferences variable remains; the two other variables above default to off or production | none |
| recipe | `v1.1.3` (`v1.1.4` is tagged) | 7 commits, all on `main` and in `v1.1.4`: telemetry vocabulary, the optional `name` claim, `GET /capability/titles` (always on), the cookie slug fix | 2 commits that are not preferences work (a wording change of the immutability rule, RT-R0b; a blob storage port, RT-R6 part); not examined here | none (stays 5) | none | none (`package.json` differs by version only) |

Rollback notes: Kitchie and Platform cannot be rolled back across their schema bump without restoring the backup taken at deploy (older code refuses the newer database, tested); Recipe can be re-pinned freely. The Platform tables added by schema 6 are empty until a household uses them. Production data was not touched by any check in this report.

No pull request to `main` was opened or merged by this slice, no tag was made and nothing was deployed.
