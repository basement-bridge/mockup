# Preferences: person and household, option A (one list with a scope switch)

Status: mockup drafted 10 October 2026, **awaiting the owner's approval**. Option A, A-1 to A-10 and the open questions are not owner decisions. The exception is D5 to D8 below, which the owner **locked** later on 10 October 2026 (voice) and which the mockup now follows. Not built in Kitchie or Recipe. Mockup: `fragments/preferences-option-a/` (option B is drawn separately and is not described here).

Numbering: owner decisions are numbered D1, D2, ... across options A, B and C in the order the owner makes them. D1 to D4 are Option C's C-D1 to C-D4 (kept under those labels). The owner's ten locked decisions of 10 October 2026 are D5 to D14; the four that apply to this option are D5 to D8, and D9 to D14 are Option C's (see `user-preferences/option-c-propose-for-another-member.md`). A-1 to A-10 stay proposals and are not renumbered.

## What the owner believes

That preferences are recorded at the person (member) level as well as the household level. Relayed 10 October 2026; checked against the code below.

## What the model holds (read from the code, 10 October 2026)

Sources: Kitchie `main` 9d1049c (`server/src/store.ts`, `web-stock.ts`, `stock-mcp.ts`, `context.ts`, `assistant-setting.ts`, `plan.ts`), Recipe `main` 5cec532 (`server/src/preferences.ts`, `schema.ts`, `mcp.ts`, `session/token.ts`), platform `main` 409f44f (`packages/contract/src/token.ts`, `packages/store/src/schema.ts`).

**The belief is right for Kitchie, not for Recipe, and platform keeps nothing.**

| Preference | Kept | Level | How the levels combine | Who can change | Surfaces |
|---|---|---|---|---|---|
| Stock-check settings: `enabled` (on/off), `proactivity` (quiet, normal, helpful), `quiet_start` and `quiet_end` (HH:MM), `daily_cap` (D7: 1 to 20, default 2; it was 1 to 10 in the form and 0 to 20 in the store and chat), `tz_offset_minutes` (-720 to 840) | Kitchie `stock_prefs (scope, scope_id, key, value)`, scope `household` or `member` | Both | **Override**, key by key: built-in default, then household, then the member's own. Clearing a key falls back one level. `dial_sources` reports default, household or member | Member: own. Household: **today** the household owner only (longest-standing member); others get "Only the household owner can change a household-wide setting. Nothing was changed." **Decided D5: any member; that check goes** | Settings > Stock checks (switch, "Your settings", "Household settings"; **today** a non-owner sees the household values read-only, which D5 removes). Chat `stock_settings`: own settings only, personal link only |
| Notes (600 characters, data not instructions) | Kitchie `notes (scope, scope_id, text)` | Both | **Both read**, no override. A member's note is read for that member only | Same as above | Same forms; chat `stock_settings` set_note (own) |
| Stops and snoozes (item, area, category, all) | Kitchie `stock_stops (household_id, member_id, ...)` | Person (a stop on one item covers every member) | n/a | The member | Not asking about list, Stop asking on a check, chat |
| Food likes, dislikes, avoids, usually, fact (avoid has severity hard or soft, reason safety or other) | Kitchie `context_claims`; empty `member_id` = household | Both | **Added together**. `get_context` for "me" = own + household; for "household" = household only. Another member's are never read | Through the assistant only (`give_feedback`, who = me or household). No owner check for household claims (kept, D8) | Chat only; no web page |
| My assistant (Claude, ChatGPT, Gemini, another, none) | Kitchie `stock_prefs`, scope `member`, key `assistant`, mirrored in a cookie | Person only | n/a | The member | Settings card; no chat tool |
| Recipe starred and vote (-1, 0, 1), times used, last used | Recipe `preferences (target_kind, target_id, ...)`; household only through the recipe row | **Household only**; no member column, the token's `sub` is not stored with it | n/a | Anyone in a household with Recipe enabled; no owner rule; each write re-checks entitlement live | Chat only (`set_preference`, `record_usage`); Recipe web pages do not show or set them |
| Usual days off cooking and blocked days | Kitchie `plan_stencil`, `plan_blocks` (member) | Person | n/a | The member | Already mocked in `fragments/plan-week-ai/` |
| Theme, item name size, seven display switches | A cookie and this browser | This device | n/a | The device | Settings; not in the data model |

Platform stores no preference. Its session token carries `sub`, `household`, `products`, `iat`, `exp` (no role, no owner); entitlement is household-level (plan D4).

## Option A

One list. Each row shows the value in force for the viewer and a chip for where it comes from (Built-in default, From household, Your choice, with what it overrides). Opening a row shows a You / Household switch. The row styles differ where the model differs: override rows, "Both are read" (notes), "Added together" (food), "Household only" (Recipe stars), and a struck-out Household half for My assistant. There is no read-only state: under D5 any member can edit the Household side, which carries a line saying so. Quiet hours on You have a "None" choice (D6).

States drawn: inherited from household, overridden by the person (over the household, and over the built-in default when the household set nothing; quiet hours can be overridden to none), built-in default, household only, person only, both read, added together, empty ("Nothing set"), and the Recipes group absent when the household has no Recipe.

### Proposals (not owner decisions)

- **A-1** One list grouped by topic, not by owner of the value.
- **A-2** Closed row: value in force plus a source chip; a personal choice names what it overrides. Words carry meaning, colour backs it up.
- **A-3** The You / Household switch is inside the open row (one open at a time), You first.
- **A-4** On You the first choice is "Same as household (value)" (clears the person's value); on Household it is "Built-in default (value)". Mirrors the Stock checks form.
- **A-5** A pick saves at once ("Saved"); no Save button. The store already writes one key at a time; today's forms have a Save button.
- **A-6** (superseded by D5) Read-only for a non-owner on the Household side, with a lock line. It drew the model's one read-only state. The owner decided there is no owner and no gate, so the mockup draws the Household side editable by any member, with a line that says so. Number kept so nothing is renumbered.
- **A-7** Non-overriding rows get their own chip and one plain line; the switch never promises an override the model lacks.
- **A-8** Food claims and Recipe stars are shown, not edited here (assistant only; set on each recipe).
- **A-9** The Recipes group is hidden for a household without Recipe (platform D6).
- **A-10** One layout at every width: a Settings sub-screen keeps the phone column on desktop (DESIGN.md section 7, household-flow frame). No viewport-specific file.

## Locked owner decisions (voice, 10 October 2026)

Recorded as given. D5 and D8 were revised by the owner after they were first stated; only the revised versions are recorded.

- **D5** Household-level settings and edits: **any** household member may edit them. There is no "owner" concept, no tenure gate and no restriction. The owner explicitly **deferred** any earn-your-way, tenure-based gating to a later decision. That is deliberate, not forgotten: nothing in the mockup or the notes builds it in, and when the owner decides it, it is a new decision. (An earlier statement of an owner / two-week rule was withdrawn in the same session.)
- **D6** Quiet hours: any member may personally override the household's quiet hours down to **none** for themselves. No restriction. Settles the open question "a person cannot override household quiet hours with none".
- **D7** Most suggestions per day (the stock-check prompts per day): range **1 to 20**, default **2**. The web form (was 1 to 10) and the chat / assistant surface (was 0 to 20) both use this range. Settles the open question on 1 to 10 against 0 to 20.
- **D8** Household-level food claims (for example "we don't eat pork") are open to **any** member, consistent with D5. Person-level food statements stay unrestricted as before. Settles the part of the food question that asked whether a household claim should need the owner. What stays open is only whether a person can switch off a household avoid for themselves (see below).

Meta-pattern (the owner's): at the person level the person edits freely, with no gate; at the household level there is also, for now, no gate (any member), with a tenure / earn-your-way gate explicitly deferred. See `preferences-principles.md` P2.

### What D5 to D8 imply for the model and the code (not built)

- **Kitchie, Stock checks form:** Most suggestions per day takes 1 to 20 (was 1 to 10); the built-in default becomes 2 (was 3).
- **Kitchie, chat `stock_settings`:** the same range, 1 to 20 (was 0 to 20), default 2. 0 is no longer accepted.
- **Kitchie, household writes:** remove the household-owner check (`isHouseholdOwner`, the 403 and its message) from household stock settings and the household note, in the web page and anywhere else it applies. Any member of the household may write them. Do not add a tenure or two-week check.
- **Kitchie, quiet hours:** today "none" clears the member's value, so the household's applies. D6 needs a member's explicit "none" stored as a value that overrides the household's (for example a distinct stored value), and `dialsFor` / `dial_sources` must report it as the member's own choice.
- **Household food claims:** unchanged, open to any member (D8). Nothing to build.
- **Platform:** its `owner_member_id` (the creator) stays what it is, but Kitchie no longer needs to read it for preferences, so the "which owner applies in platform mode" question is moot.

## Open questions

Questions that D5 to D8 settled are removed (the owner definition, quiet hours to none, the range of Most suggestions per day, whether a non-owner sees household values, and whether a household food claim needs the owner). The rest are still open.

- Quiet start and end are two keys that chat can set separately; the form needs both. One preference or two?
- One person cannot switch off a household avoid for themselves (food is added together, with no override). Intended? Who may record a household claim is decided (D8).
- Should Recipe stars and votes get a person level? Wrong guess: a Recipe schema change later.
- Does Preferences replace Settings > Stock checks (same data) or sit above it?
- Household-wide stops: the table allows them, nothing writes them. Needed?
- Which option leads, A or B?

## What the default path loads

The page, shared theme and stylesheet, `a.css` (about 10 KB) and `a.js` (about 22 KB uncompressed). No images. In the real app a closed row needs only the values (two small reads, one per level); editors, note text, food claims and Recipe counts load when a row is opened, and Recipe is asked only for a household that has it.
