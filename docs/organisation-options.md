# How to organise the mockup repo, and how to keep it private: options

Status: **proposal, 18 October 2026. Nothing here is decided and nothing has been moved, renamed, deleted or changed in visibility.** Written from the owner's voice feedback (18 Oct): the mockup repo is now core software-factory infrastructure with many fragments, it is hard to navigate on GitHub, and its content is IP that should be private by default.

Illustrative landing page for the recommended option (static mock, real fragment names, illustrative statuses): [`fragments/_proposals/organisation/index.html`](../fragments/_proposals/organisation/index.html) (live: https://basement-bridge.github.io/mockup/fragments/_proposals/organisation/index.html).

Governance item: see the foot of this file.

## 1. What is actually there (measured 18 Oct 2026, `main` at `dda13c0`)

| Measure | Number |
|---|---|
| Tracked files / commits | 1,757 / 439 (254 commits in the last 7 days; commit authors: Claude 223, neotechmonk 210) |
| Top-level folders | 11 (`fragments`, `flows`, `docs`, `history`, `recipe`, `recipe-ideas`, `recipe-photos`, `recipe-versions`, `tools`, `themes`, plus root files) |
| Fragment folders under `fragments/` | 55 (+ `device.js`); all 55 have an `index.html` and all 55 appear in the root `index.html` |
| Files under `fragments/` | 1,106 (570 of them images); largest: `recipe-detail-desktop` 359, `plan-ui-review` 237, `receipt-scan` 59, `recipe-share` 50, `plan-desktop` 47 |
| Fragments that are a single `index.html` | 15 |
| Nested option/sub-folders | `option-a..e`, `recommended`, `inline-edit`, `plan-cook-overlay`, `engine`, `sheet`, `flyout`, and so on; 262 files in `img/` folders |
| Root `index.html` | 354 lines, 79 links, 61 fragment tiles, 1 flow tile, free-text status line per tile ("Open: ...", "Decided", "Locked", "Confirmed") |
| Status labels | none structured. 41 tiles start "Open", about 9 say Decided / Locked / Confirmed; "superseded" appears 3 times in prose. Nothing says built, in UAT, rejected |
| Notes convention | only 14 fragments have `notes.md` (+5 `NOTES.md`, 1 `review.md`). Most notes live elsewhere: `docs/knowledge/` (64 files) and `docs/handover/` (7). No `decisions.md` or `owner-decisions.md` exists in the repo; decisions live in issue/PR text and the memory/handover docs |
| Per-feature hubs | exist only for big features (`docs/handover/desktop.md` is the master for desktop); no hub for the other ~45 |
| Viewport-specific files | by folder (`flows/household/{mobile,tablet,desktop}`) and by prefix (`desktop-*`, `plan-desktop`, `plan-week`); no rule |
| Links already out there | the root README and index still say `platform-mockup` (old name). URLs to `basement-bridge.github.io/mockup/...`: 29 files in this repo; 28 Kitchie and 1 Recipe issue/PR bodies (first 600 issues scanned per repo; comments not scanned); 1 Kitchie file and 2 governance files. Search across other repos' comments is not available from the sandbox, so the true number is higher |
| Visibility today | **mockup is public** (Pages enabled, 0 forks). Kitchie, Recipe, platform, infra and governance are private |

Naming inconsistencies seen: `desktop`, `desktop-home`, `desktop-profile`, `desktop-shopping`, `plan-desktop` (viewport as prefix, suffix or noun); `preferences-option-a/-c` and `preferences-mine-household` (options split into sibling folders instead of nested); `notes.md` vs `NOTES.md`; `recipe`, `recipe-ideas`, `recipe-photos`, `recipe-versions` at top level beside `fragments/recipe-*`; `make-it` and `make-it-flow`; `history/` top level vs `household-activity` fragment. Nothing says which product area a fragment belongs to or what happened to it afterwards.

Stale or superseded candidates (from tile text, to be confirmed by the owner, not by me): `make-it` vs `make-it-flow`, `plan-week` / `plan-week-ai` (single files, early), `recipe-page` and `recipe-list-ideas` (single files, replaced by `recipe-detail-desktop` and `recipe-browse-full`), `preferences-option-a` and `-c` (a choice was made), `inventory-home`, `item-sheet`, `item-row-axes` (early single-file explorations). A manifest would record these as explicit states instead of guesses.

AGENTS.md rules that constrain any option: push straight to `main`, no PRs as approval; rebase before every push and read `git diff --stat` for anything outside scope; never undo settled work; a settled mockup is changed here first; one shared `theme.css`/`shared.css`/`theme.js` (relative paths from every page, so moving a folder changes its `../` depth); notes must say what loads by default; claims go through governance `tools/pickup-guard.sh` / `claim.sh`; update in place rather than adding copies. Many agents push concurrently, so any option that rewrites many paths in one commit will conflict with live work.

## 2. The status model every option needs (new owner requirement)

Per fragment the page must show what happened afterwards, not just draft/decided. Proposed single lifecycle, one value per fragment:

| Status | Meaning | Derived or recorded |
|---|---|---|
| `draft` | being designed, not yet shown | recorded (manifest) |
| `awaiting-review` | shown, owner has not decided | recorded; this is the "other active work" set used by the privacy window |
| `decided` | owner picked a direction, nothing built | recorded, cites the decision (issue comment / handover line) |
| `in-build` | linked issue has a live claim | derived from the issue's `factory-state` (`status: in-progress`) |
| `in-uat` | built and merged into `uat`, awaiting promotion | derived: linked issue `factory-state` `status: built` |
| `in-production` | released to `main`/prod | derived: `status: done` and issue closed (or Kitchie release PR merged) |
| `rejected` | reviewed and explicitly turned down or ignored | recorded, must cite the owner's words and date; distinct from the next row |
| `superseded` | replaced by another fragment | recorded, `superseded_by:` points at the replacement |
| `abandoned` | never reviewed, went quiet | derived: `draft`/`awaiting-review` and no commit or issue activity for N days; shown as "unreviewed", never as "rejected" |

Rule of thumb: delivery states (`in-build`, `in-uat`, `in-production`) are **derived** from the Kitchie issue card (`factory-state`) so nobody hand-types them and they cannot drift; judgement states (`decided`, `rejected`, `superseded`) are **recorded** with a citation. The generator or lint reports a mismatch (e.g. manifest says `decided` but the issue says `done`). Limitation: this needs read access to the Kitchie/Recipe issues from wherever the generator runs, and a fragment must record its issue number; where a fragment has no issue yet the status is recorded only.

## 3. Organisation options

### A. Keep the structure; add a generated landing page and a manifest

- **What changes:** nothing moves. Add `fragments.json` (one entry per fragment: path, title, product area, kitchie issue(s), viewport, status for recorded states, decision citation, `superseded_by`), plus a generator that writes `index.html` sections (by product area, filter by status) and a decisions view. A lint fails if a fragment folder has no manifest entry or an entry points nowhere.
- **Migration cost:** low. One-off: back-fill 55 entries (about half a day of agent work, owner confirms the stale list). Root `index.html` is replaced by generated output (a change to an existing file, so needs the owner's go-ahead; the proposal itself touches nothing).
- **Link breakage:** none. All paths stay.
- **Agents in the factory:** AGENTS.md rule: "every new or changed fragment adds or updates its entry in `fragments.json` in the same push; run `tools/manifest-lint`; never hand-edit the generated index." Governance: the same lint added as a cross-repo check, plus the delivery-status derivation.
- **Effort:** S to M. **Weakness:** folder tree on GitHub is still messy; the landing page is the only navigation.

### B. Group by product area, leave stubs at old paths

- **What changes:** `fragments/<area>/<fragment>/` (pantry, plan, recipe, shopping, receipts, household, platform/auth). Each old path keeps a tiny redirect `index.html` (meta refresh + link).
- **Migration cost:** high. About 1,100 files move; every relative `../theme.css` and `../../shared.css` reference changes depth (or is rewritten to root-absolute). 55 stubs. Collides with agents pushing to the same paths during the move.
- **Link breakage:** old Pages URLs keep working through stubs, but only `index.html` paths; deep links to images, `notes.md`, `option-b/index.html` and `github.com/.../blob/main/fragments/x` links all break unless every file gets a stub (not realistic). 29 + 28 + 1 + 3 known references.
- **Agents:** AGENTS.md rule "new fragments are created under their area folder"; a lint that rejects top-level fragment folders.
- **Effort:** L. **Weakness:** area is a judgement (receipts is pantry and shopping), so folders get moved again; stubs are permanent debt.

### C. Key by Kitchie issue number

- **What changes:** `fragments/k-838-generic-snapshots/` style names, a generated index by issue.
- **Migration cost:** high and partly impossible: many fragments predate an issue (the owner converts PRs to issues only once a direction is stable, per AGENTS.md), some serve several issues, and exploratory work has no number.
- **Link breakage:** same as B.
- **Agents:** rule "name the folder from the issue"; conflicts with the rule that an issue is created late.
- **Effort:** L. **Weakness:** wrong key for a design repo where the unit is the question, not the ticket. Not recommended; kept so the choice is explicit.

### D. Manifest as the single source, generated site, search/filter, decision feed

- **What changes:** A with more: front-matter or `fragments.json` is the only source of truth; a generator produces (1) the landing page with search and filters (area, status, issue, viewport), (2) a "latest decisions" feed and changelog from decision citations and commit history, (3) per-area hubs, (4) the status derivation from factory cards. Optionally later: move toward B once the manifest exists, because the manifest makes stubs/redirects generatable.
- **Migration cost:** medium. Same back-fill as A, plus the generator, the decisions feed (needs a consistent decision-line convention: `Decision: <date> <owner words> -> <fragment>`), and a scheduled run (GitHub Actions is off for billing, so generation runs from the agent push step or a scheduled task).
- **Link breakage:** none for A-style (no moves).
- **Agents:** AGENTS.md: manifest entry required, decision line required for each owner decision, generator run before push; governance: a "fragment index current" check in the same family as `checks/config-shape`.
- **Effort:** M to L. **Weakness:** more machinery; a generator that breaks blocks every agent's push unless the lint is advisory at first.

## 4. Recommendation (advice, not a decision)

**Start with A, designed so it grows into D.** Gives the owner what he asked for (an index with product area, status and issue, and the new delivery states) at no link-breakage risk and no collision with concurrent agents. Treat the manifest schema in the illustrative page as the contract; add the decision feed (D) once there is a decision-line convention. Revisit B only if, after A, the GitHub folder tree is still the pain point, and then generate the stubs from the manifest. Do not do C.

The illustrative page shows this: grouped by product area, a status filter with the new delivery states, linked issue, "latest decisions", and a "needs your review" strip that doubles as the privacy-window check below.

## 5. Privacy: private by default, open only while a live mockup is being reviewed

Owner requirement (voice, 18 Oct, as corrected): the repo's content is IP; it is **private by default**, opens only for the time he needs to review a live mockup, and locks back as soon as the reviewed work has been built into **UAT** (not production), **unless other mockup work is still awaiting his review**, in which case it stays open until that is also done.

### 5.1 What I could and could not verify

- Verified: `basement-bridge/mockup` is `public`, `has_pages: true`, 0 forks; Kitchie, Recipe, platform, infra and governance are `private`.
- Not verifiable from this sandbox: the **organisation's plan** (the `orgs/basement-bridge` endpoint is blocked) and the Pages settings endpoint (`/pages` returned 403 via the proxy). I also cannot test the live Pages URLs (403 from the sandbox). The owner can read the plan under Organization settings > Billing and plans.
- From GitHub's documented behaviour (check before relying): Pages from a **private** repo needs a paid plan (Pro, Team, Enterprise Cloud); on Free, a repo that becomes private is unpublished. On Pro/Team a private repo's Pages site is **still public on the internet**; only **Enterprise Cloud** offers access control that limits a Pages site to org members. So "private repo + Pages" is either unavailable (Free) or does not protect anything (Pro/Team) unless the org is on Enterprise Cloud.

### 5.2 Which link styles survive a private repo

| Link style | Public | Private |
|---|---|---|
| `basement-bridge.github.io/mockup/...` (what issues and docs use) | works for anyone | 404 on Free; public-anyway on Pro/Team; members-only on Enterprise Cloud |
| `github.com/basement-bridge/mockup/blob/main/...` (docs, notes, this proposal) | works for anyone | works for him while signed in as an org member, 404 for others |
| `raw.githubusercontent.com/...` | works | needs a token; breaks as a link |
| html previewers (e.g. htmlpreview) | work | do not work |
| Agent sandbox access | proxy 403 on Pages either way | git clone/push still works; it never needed Pages |

Known references that depend on the Pages style: 28 Kitchie + 1 Recipe issue/PR bodies, 29 files inside the mockup repo, 3 other files (plus unscanned comments). Under any private pattern those links are dead while locked, so they must be rewritten once to the new stable URL (a link-rewrite is a separate guarded task, not part of this proposal).

### 5.3 Patterns

**(a) Toggle visibility (and Pages) for a review window.** A script `tools/review-window.sh open|close|status` run by the owner or by an agent on his explicit instruction; `close` also unpublishes Pages. Auto-close via a scheduled task with a maximum time-to-live (for example 48 hours) that closes unless the check below says other work is awaiting review.
- Opening from the chat/voice interface: he says "open the window for #xyz"; the agent confirms the plan, flips it, replies with the live link. He opens it in his own browser.
- Risks: anything public even briefly can be cloned, mirrored, cached by a CDN, indexed by search engines, archived (Wayback) or scraped; **full git history is exposed, not only current files**, and the repo has been public until now (assume already copied; private-by-default is hygiene going forward, it does not un-publish the past). Forks created while public stay public and detach when the source goes private (0 forks today; re-check at each close). Pages unpublish after a visibility change can lag minutes and CDN caches linger. Org setting to restrict visibility changes might need to be turned off for the script to work.
- Scrub before every open: screenshots with real household names, emails in commit metadata, any token-looking strings, copy that names unreleased commercial plans, `docs/knowledge/` and `docs/handover/` (owner decisions, strategy). A cheap pre-open check can scan for these and refuse to open on a hit.
- Cost: no new infrastructure. Effort S. Only works if the plan allows what he needs (5.1), and the whole repo flips, not just the fragment under review.

**(b) Host mockups privately behind auth on the existing UAT server.** A static route under the UAT host (https://43-134-239-163.sslip.io, shared Caddy; per the infra repo, routes are `edge/routes/<app>.caddy` files and each addition is an infra change) such as `/mockup/`, protected by basic auth or a signed-link cookie. A deploy step (rsync of the repo's static files from `main`) runs from the agent's push step or a scheduled task; GitHub Actions is off for billing. The repo is private all the time; Pages is turned off.
- Opening from voice/chat: nothing to open; the stable link always works for him (sign-in once per device). For a non-member reviewer, the agent issues a time-limited token link on his instruction.
- Link breakage: one rewrite of existing Pages URLs to the new base, then stable; old Pages links die when Pages is disabled.
- Risks: the mockup then shares a host and Caddy with UAT, so a bad route file can affect UAT (infra change = guarded lane); static-only, no backend; password handling and the sslip.io hostname (a plain IP-derived name, no real domain) are weak points. No history exposure at all.
- Cost: no new vendor cost; effort M (route file in infra, deploy script, auth, link rewrite). It removes the toggling problem rather than managing it.

**(c) Private repo + artifacts or a token-gated host.** Keep the repo private; for each review, publish the fragment (HTML plus its shared CSS/JS) as a private Claude Artifact or push it to a token-gated static host (Cloudflare Pages with Access, Netlify password, or similar). Links are per-review and expire.
- Opening from voice/chat: the agent publishes and replies with the link; he is already signed in on claude.ai. No visibility toggle.
- Risks: not the live repo (a copy: can drift), relative links across fragments break, one more vendor if a third-party host is used; artifacts size limits.
- Cost: S per review, no infra; lower fidelity for the flows with many fragments and shared theme files.

**(d) Variant:** self-hosted preview per branch is not an option here (no PRs by design); a private fork or second private repo for work-in-progress and a public repo for only settled screens is possible but contradicts "IP private by default" and doubles pushes. Not recommended.

### 5.4 The window rule: lock when reviewed work is in UAT, unless other work still awaits review

Window state is a **set of reasons**, not a timer. Each reason is a fragment (or issue) the owner needs a live link for.

- **Add a reason:** the owner (or an agent on his instruction) asks for a live review of X. Window opens if closed.
- **Remove a reason:** X's linked issue reaches `status: built` (in UAT), or the owner marks X `rejected`/`superseded`, or he says "done reviewing X".
- **Other active work awaiting review** is computed, not remembered, from the manifest and the delivery states: any fragment with `status: awaiting-review` (or `draft` with a live link requested), plus any open Kitchie/Recipe issue or mockup PR that links a mockup URL and whose `factory-state` is not `built`/`done` and that is not `needs decision`-parked with no review requested. The check `tools/review-window.sh status` prints the remaining reasons and `lock-eligible: yes/no`. `abandoned`/unreviewed items do not hold the window open.
- **Overlap:** if a new review is requested while the last blocker is about to land, the new reason joins the set before the lock, so the window never closes and reopens in between. If the lock already ran, reopening is a fresh explicit instruction.
- **Who flips the switch:** opening is always an explicit instruction from him at the time (guarded step: the agent states what will become public, runs the scrub check, then acts). Closing is the safe direction: either (i) also explicit, or (ii) a **standing instruction he approves once** and that is recorded in AGENTS.md/governance: "the agent may close the window when `status` says lock-eligible, and always after a maximum of N hours; it never opens". Only (ii) needs the owner's approval to be written down; I recommend it because a missed close is the real risk. Agents must not change visibility on any other basis.
- Under pattern (b) none of this is needed: the repo stays private and there is no window.

### 5.5 Recommendation on privacy (advice, not a decision)

1. **Short term:** confirm the org plan. If it is Free or Pro/Team, do not rely on "private repo + Pages". Until a pattern is chosen the repo stays as it is; I changed nothing.
2. **Preferred end state: (b)**, with (c) for ad hoc external sharing. It makes private-by-default true all the time, needs no visibility flips (so no window logic or agent-flips-visibility risk), and keeps live links stable for the voice workflow. Cost is one infra route and a one-off link rewrite, which is a guarded, owner-approved change.
3. **If he wants the window approach first, (a)** with the set-of-reasons rule, the pre-open scrub check, the maximum TTL, an explicit-open-only rule and, if he agrees, the standing close instruction. Assume the existing history has already been public.

## 6. What each option adds to AGENTS.md / governance

- A: "fragment entry in `fragments.json` with every new or changed fragment; lint before push; generated index is never hand-edited."
- B: A plus "new fragments live under their product area; old paths keep stubs."
- C: "folder named from the Kitchie issue."
- D: A plus the decision-line convention and the generator and derived-status check in governance.
- Privacy: "repo visibility and Pages settings are changed only on the owner's explicit instruction at the time (or the standing close rule if he approves it); every open runs the scrub check; every close reports what remained open and why."

Governance item: https://github.com/basement-bridge/governance/issues/63 (enhancement, lane guarded, readiness not-ready; no `approved for build`).
