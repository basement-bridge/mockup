# Sharing a recipe outside the household: handover

**Status, 13 October 2026:** mockup only, four slices drawn and merged (placement #161, manage #162, recipient #163, sheet #164) and tied together by a hub page. Nothing is built in Kitchie, Recipe or platform. Decisions 206 to 253: 206, 209, 243, 247, 248, 250, 252 and 253 are **confirmed** (13 October 2026), the rest **proposed**. Later the same day the owner confirmed the create sheet as option C and an optional single-claim invite that sets up a new household (section 4a). A fifth slice, the Share button in the desktop recipe summary flyout (`fragments/recipe-share/flyout/`), was added the same day. This file is the place to start; the job note holds the wording.

Read `AGENTS.md` and `DESIGN.md` in this repo first. Style follows `docs/handover/plan-desktop.md`.

## 1. The ask, in the owner's words

Owner, voice, 13 October 2026, kept close to what was said:

- Share a recipe he is happy with **outside the household**, like the **shopping-list link**: an **expiring signed URL**.
- **No sign-in needed** to view, and the **same if signed in**.
- **Multi-use, not single-use, but it expires.**
- The intent is **growth hacking**.
- A **share button at the top of the recipe**, with a couple of placement options.
- **Pending URLs visible inside the recipe**, where they can be **cancelled**.
- Links can be **renamed**, like the shopping link.

The repo for this is `mockup` (basement-bridge/mockup), not `kitchie`.

## 2. Where everything lives

| What | Where |
|---|---|
| Hub: the four slices, the recommended path | `fragments/recipe-share/index.html` (live, not checked from the sandbox: https://basement-bridge.github.io/mockup/fragments/recipe-share/index.html) |
| Placement: where the Share button lives | `fragments/recipe-share/placement/` (`index.html`, `phone.html`, `desktop.html`, `notes.md`), PR #161 |
| Manage: see, rename, cancel links | `fragments/recipe-share/manage/` (`index.html`, `notes.md`), PR #162 |
| Recipient: the public page | `fragments/recipe-share/recipient/` (`index.html`, `page.html`, `notes.md`), PR #163 |
| Summary flyout (desktop) | `fragments/recipe-share/flyout/` (Share next to Open full recipe, drill-in in the same lane) |
| Create sheet | `fragments/recipe-share/sheet/` (`index.html`, `screen.html?o=a|b|c`, `notes.md`), PR #164 |
| Job note: owner's words, decisions 206 to 242, open questions | `docs/knowledge/jobs-to-be-done/recipe-share.md` |
| This handover | `docs/handover/recipe-share.md` |
| The pages it builds on | `recipe/` (the recipe page), `recipe-photos/` (Undo pattern, P-D17), `fragments/shopper-link/` and `docs/knowledge/shopper-link.md` (the link it is modelled on, SL-D1 to SL-D20) |

Each slice's `notes.md` is its own full spec: options, states, default path and deferred loading, files. The hub PR is the one that added the hub, the job note, this file and the index entries; check the PR list for its number.

## 3. The slices and their options

Option A is recommended in every slice except the create sheet, where the owner confirmed C. The other options stay drawn.

| Slice | A (recommended) | B | C |
|---|---|---|---|
| Placement | Icon in the top row with a count; labelled pill and key S on desktop | Chip under the title | More menu row plus a status line |
| Create sheet | One screen: name, 24 hours / 7 days / 30 days (7 default), pinned switch (no longer recommended) | The link is made on open; name and expiry are rows to change | **Confirmed (247):** preview, version list shown only when other versions exist, usual by default; plus the invite opt-in (248) |
| Manage | A Shared section after Photos, chip in the jump row | Panel from the Share button | Card above the ingredients |
| Recipient | Quiet top strip, then one card after the last note | Slim bottom bar after about 35% scroll | Banner above the recipe |

## 4. Decided versus proposed

**Decided by the owner:** the seven points in section 1, plus the picks of 13 October 2026 (voice and typed):

- Mobile sharing is placement A: share icon in the top row with an active-links badge (decision 206).
- Desktop sharing is placement A on the main page of the fully opened recipe: Share pill with the S key hint (206, 209).
- The desktop summary flyout (click a row in the Recipes list) gets a Share button next to "Open full recipe", opening the share panel as a drill-in in the same lane. Desktop only, since mobile has no summary flyout (243).

**Proposed, not confirmed:** everything else in decisions 206 to 253, including the recommended option in the manage and recipient slices (the owner has not said whether "A" covered them, see question 1) and the flyout button's visual, S shortcut and back behaviour (244 to 246). They were filled in by the design agents where the owner was silent. Grouped: entry and placement (206 to 210), creating a link (211 to 220), seeing and managing links (221 to 229), the recipient's page (230 to 239), and cross-cutting (240 to 242: the recommended path, entitlement, loading).

Two of the proposals come from the integration brief rather than a slice: that a link is a Recipe entitlement concern with no per-feature flag (241), and the recommended path itself (240).

## 4a. Invite on a share link (owner, 13 October 2026)

Confirmed:

- The sender may optionally attach an **invite** to a share link, by an opt-in click (248).
- An invite is **single-purpose**: if the link is passed around, only the **first person to activate it claims the invite** (250).
- An invite sets up a **new household**; it never joins an existing one (252).
- Sending an invite respects the member's **maximum-invites limit** (253). Where the limit lives and its value are unknown; do not invent them.

Proposed: the switch defaults off (249); later openers of the link still read the recipe (251).

**Platform and trust.** The invite touches Platform: households, entitlements and member limits all belong there (see `platform-context` and Kitchie issue #127), not in Recipe or Kitchie. Whatever proves an invite or its claim must **reuse the trust mechanism already in place between Platform and the products, with no new token type just for this feature** (standing rule). What that mechanism is, and how a signed share URL relates to it, must be read from the real services, not guessed here.

## 5. What to ask Arjan

In rough order of what a wrong guess costs. Detail and cost are in the job note's open questions.

1. **Did "A" also mean the links list and recipient page?** Placement A and sheet C are confirmed; those two stay proposed until he says. (O12)
1b. **Invite questions** (O14 to O20): where the maximum-invites limit lives and its value; whether the invite switch defaults off (proposed); what happens to an unclaimed invite when the link expires or is cancelled; what a signed-in person without a household can do; what the new household starts with; whether the shared recipe is copied into it; abuse limits on claiming. Also whether sheet C keeps the pinned radios and the date chip (O13).
1a. **Look at the flyout slice** (`fragments/recipe-share/flyout/`): the button's look and wording, S key, and how Back works. (244 to 246)
2. **Where does the link list live?** The Share icon opens a small list (placement) while manage recommends a section in the page. Both, with the icon scrolling to the section when links exist? (O3)
3. **Pinned or following by default** (decision 216, drawn pinned; open again under sheet C, O13). The version question is answered for the default: the usual, with a choice only when others exist (247). (O4)
4. **Default and longest expiry.** 7 days drawn; 24 hours and 30 days offered. (O6)
5. **The default name,** recipe title or date or "For ...", and its length (60 or 40). (O2)
6. **Esc on the desktop flyout:** Pantry's rule (Ctrl or Cmd Enter) or Esc as the create sheet draws it. (O1)
7. **Cap on links** and whether **Renew keeps the same URL.** (O7, O8)
8. **Does the recipient see the sender's first name?** (O9)
9. **Who may share:** any recipe, or only one with a settled version? (O10)
10. **How growth is measured** without a cookie banner on a no-sign-in page. Nothing is measured in the mockup.

## 6. What is NOT decided or built

- Nothing is built. No Kitchie, Recipe or platform issue is approved for this. Whether an issue exists is unknown to this file.
- Unknown, to be answered by reading the real services, not guessed: how a signed URL is made and verified, where links and their counts are stored, which service serves the public page, how opens are counted without link-preview crawlers, how a banner is fetched through a signed link, and whether the existing shopping-link code can be reused. The slices use fictional data and placeholder links at `kitchie.example`.
- No data model, API or tool names are proposed here on purpose. The invite adds nothing to that: no limit value, no claim endpoint, no token.
- Measuring the invitation, and any sender notice when a recipient asks for a new link, are not designed.

## 7. How to build it later

This is a proposal for slicing, not a plan the owner agreed. Only start after the owner picks options and answers section 5.

1. Settle the answers in the job note first. If a pick changes anything, **draw it in the mockup first**; a settled mockup is never changed by building first.
2. **Kitchie `uat` only. Never `main`, never tags.** Kitchie pull requests go to `uat`; read Kitchie's own `AGENTS.md`. The owner deploys.
3. **The built app matches the mockup exactly:** copy the mockup's markup and CSS first, change only what the real code needs, list each difference in the PR. Class names are the app's: the manage row (`rs-row`, `rs-name`, `rs-left`, `rs-stats`, `rs-acts`, `rs-undo`) and the create sheet (`sh-*`) are meant to be lifted. Sample data stays in the mockup scripts.
4. **Chat tools and the UI call the same service methods** (owner standing rule, 7 October 2026): create, list, rename, cancel, renew, remove from view. The UI never reimplements them.
5. **A link is a Recipe entitlement concern, no per-feature flag.** Whoever has Recipes has sharing; the recipient's page needs no entitlement, and a signed-in viewer without Recipes gets no invitation and no hint (decision 234).
6. **Load on engagement:** the create sheet and links list load when tapped, the desktop host and key only from 1024px, the recipient page loads words first, then step photos, then the banner. Default path per slice is in its `notes.md`.
7. **Do it in place, not a refresh** (DESIGN.md 6a): create, rename, cancel, renew, Save and Ask for a new link all change the page where it is.
8. **Screenshots first:** headless captures at 360, 390, 768 and 1280 in light (`kitchie-day`) and dark (`kitchie`) before asking the owner to look (`tools/screenshots.mjs`, DESIGN.md 7).
9. A suggested order: the recipient's page and signed-link check first (it is the risky unknown), then create and list, then the Share entry and the Shared section.

## 8. Rules from this repo that apply

- Mockups go straight to mockup `main` (owner, 9 October 2026); a PR here is not an approval step. This is for the mockup repo only.
- The PR description is the working spec: owner's words, proposals marked **Proposal**, open questions, what the default path loads. Do not turn a PR into an issue at PR time; the owner converts PRs into issues once a direction is chosen.
- One token set (`theme.css`); no raw colours in page CSS. Check in one light and one dark theme.
- The repo is public: no secrets, no real people's details.

## 9. Process notes for the next human

- Branch from `origin/main`, rebase before you push, read `git diff --stat` for anything outside your scope, merge your own PR (squash) into mockup `main`. Never touch `uat`, Kitchie code or tags from this repo.
- `gh pr create` can fail from Claude Code sessions (GraphQL 403). Create the PR with REST: `gh api repos/basement-bridge/mockup/pulls --input <json>` (JSON with `title`, `head`, `base`, `body`). Merge with `gh api -X PUT repos/basement-bridge/mockup/pulls/N/merge -f merge_method=squash`.
- Decision numbers here (206 to 253) continued the highest in the job notes at the time (205, Plan UI review). Other branches may take numbers too; check the highest before adding more, and renumber the proposals here if they clash.
- The Pages URL was not verified from the sandbox; open it once and fix this file if it differs.

## 10. Links to every related durable thing

- Job note: [`docs/knowledge/jobs-to-be-done/recipe-share.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/recipe-share.md).
- Hub: [source](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/index.html), [live](https://basement-bridge.github.io/mockup/fragments/recipe-share/index.html).
- Slice notes: [placement](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/placement/notes.md), [sheet](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/sheet/notes.md), [manage](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/manage/notes.md), [recipient](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/recipient/notes.md).
- The link it is modelled on: [`docs/knowledge/shopper-link.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/shopper-link.md).
- Recipe tab decisions it sits inside: [`docs/knowledge/jobs-to-be-done/recipe-tab.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/recipe-tab.md) and [`recipe-tab-handoff.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/recipe-tab-handoff.md).
- Rules: [`AGENTS.md`](https://github.com/basement-bridge/mockup/blob/main/AGENTS.md), [`DESIGN.md`](https://github.com/basement-bridge/mockup/blob/main/DESIGN.md). Learnings applied: 1 (start from the job), 2 (one token set), 4 (one visual family), 5 (options before decisions), 6 (load only what is needed now), 6a (in place), 7 (form factors).
