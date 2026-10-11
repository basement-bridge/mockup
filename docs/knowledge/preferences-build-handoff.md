# Preferences: build handoff

Status: **written 10 October 2026 (Sydney) for the build agents.** Option B is the chosen direction (D15). The owner has not yet confirmed the mockup; the confirmation window is in section 7. This file collects what is agreed, what is still open (with a **build default**), the architecture to build to, the slices, and the process rules. It adds no new owner decisions: every build default is a proposal for the owner to review after the build.

Who reads this: any agent that builds the preferences feature in `kitchie`, `recipe` or `platform`. Start at section 5 (slices) and section 6 (rules), use section 3 when you hit an open question, and read section 4 before touching shared code. Each app repo's own `AGENTS.md` and `docs/project-plan.md` still come first; where this file and an `AGENTS.md` disagree, **`AGENTS.md` wins** and the difference is listed in section 8.

How it was made: read-only checks on 10 October 2026 of this repo (`main` at f7281e1 when started), `kitchie` (`uat` 17510a0, `main` 236bbff), `recipe` (`uat` 290808f, `main` 5cec532) and `platform` (`uat` ae50838, `main` 409f44f), plus the claude.ai Project docs "ways of working" and "platform context". Code facts below are as of those commits. Re-check the file you are about to change; other agents are merging all the time.

## Contents

1. Status and sources
2. Decision index (what is locked)
3. Open questions and build defaults
4. Architecture
5. Build slices (parallel), hotspots, issue titles
6. Process rules for the build
7. Confirmation window
8. Inconsistencies found
9. 11 Oct owner changes (desktop Settings window, row and line removals)

---

## 1. Status and sources

**Direction.** Option B (Mine and Household as two tabs; sources App, then Household, then You) is chosen (D15). Option A is kept for reference only. Option C (propose for another member) builds on B: its owner decisions D1 to D4 and D9 to D14 are locked, the screen as a whole is still "awaiting approval" on the mockup index (see section 8, I-9).

**Source of truth, in order of authority.**

| # | File (this repo) | What it holds | Status |
|---|---|---|---|
| 1 | `docs/knowledge/preferences-principles.md` | Principles P1 to P6, known tensions | Owner's rules, not proposals |
| 2 | `docs/knowledge/user-preferences/option-b-mine-and-household.md` | Data-model facts (fact F1 to F10), D5 to D8 (D5, D8 superseded), D15 to D24, D25 to D30, Q-R1 to Q-R9, Q-V1 to Q-V6, B-P1 to B-P9, code changes per decision | Decisions locked; B-P and Q open |
| 3 | `docs/knowledge/user-preferences/food-preferences.md` | Food F1 to F14 (decided), JSON shape, operations, substitutions, Q-F1 to Q-F23 | F decided; shape and Q proposed |
| 4 | `docs/knowledge/user-preferences/option-c-propose-for-another-member.md` | C-D1 to C-D4, D5 to D14, what the code needs, states, C-P1 to C-P7, C-Q6 to C-Q13 | D locked; rest proposed |
| 5 | `fragments/preferences-mine-household/` (`index.html`, `mine-household.css`, `mine-household.js`, `mine-household-600.css`, `mine-household-1024.css`) | The screen to build. URL options open every state (the "States to look at" list on its page) | Chosen look |
| 6 | `fragments/preferences-option-c/` (`option-c.css`, `option-c.js`, 600 and 1024 files) | Propose, pending, next-login notice, review screens | Awaiting approval; not redrawn for D16 to D24 |
| 7 | `docs/knowledge/preferences-option-a.md`, `fragments/preferences-option-a/` | Same facts as B, other layout | Reference only |
| 8 | `docs/knowledge/user-preferences/boundary-contract.md`, `evidence-grading.md` | The AI tool contract (as built: Kitchie R26, `CONTRACT_VERSION` "1.0") and evidence grading | Binding for `get_context` and `give_feedback` |
| 9 | `docs/knowledge/README.md`, `AGENTS.md`, `DESIGN.md` | Closed-vocabulary rule, mockup-and-build-stay-close, performance | Binding |

**Precedence when notes disagree.** (1) A numbered owner decision, with the later number winning when it says it supersedes (D25 to D28 over D5 and D8; D20 over D7's default). (2) The principles. (3) The Option B fragment for look and behaviour. (4) Proposals in the notes. (5) Options A and C. Whatever you decide on the way goes on the review list (section 6, rule 9).

**Not sources.** An untracked `fragments/preferences-scope/` exists in the shared `/home/claude/mockup` checkout. It is another agent's unlanded work and is not part of this handoff; if it lands on `main`, the note for D21 is the place it joins. Open pull requests #26, #31 and #32 in this repo are human-authored ("do not merge"); stay away from them.

---

## 2. Decision index

One line per decision with a pointer. "B" means `user-preferences/option-b-mine-and-household.md`, "C" means `user-preferences/option-c-propose-for-another-member.md`, "Food" means `user-preferences/food-preferences.md`, "Principles" means `preferences-principles.md`.

### 2.1 Principles (owner, voice, 10 Oct 2026)

| ID | Rule in one line | Where |
|---|---|---|
| P1 | Subject control: only the subject finalises anything about them at person level; others propose. | Principles |
| P2 | Gating by level: person level ungated for everyone; household level needs a binary household admin; finer roles and tenure gates are deferred. One check, called by screen, routes and tools. | Principles (rewritten after D25 to D30) |
| P3 | Propose is not finalise: store who proposed, when, and the acknowledgment state; never present a proposal in the subject's voice. | Principles |
| P4 | Safety first: safety-sensitive data takes effect at once and counts as fully reliable while pending; pending changes the label, never the use. | Principles |
| P5 | Acknowledgment on the subject's terms: passive notice at next login, no expiry, no escalation, nothing visible earlier, the proposer is never told the outcome. | Principles |
| P6 | Forward-looking changes: accept, edit or reject apply from then on; plans and history already made are not rewritten. | Principles |

### 2.2 Owner decisions D1 to D30

| ID | Decision in one line | Where |
|---|---|---|
| D1 (C-D1) | Any household member can propose a preference on behalf of another member. | C, "What the owner said" |
| D2 (C-D2) | The proposal is written directly on the subject's own person-level record, tagged "proposed by", pending the subject's acknowledgment; never staged at household level. | C |
| D3 (C-D3) | A proposal takes effect immediately for recipe building and planning. | C |
| D4 (C-D4) | The subject gets a courtesy notice queued for their next login: accept as is, edit, or reject their own record. | C |
| D5 | **SUPERSEDED by D25 to D28.** Household-level edits open to any member; no owner, no tenure gate (tenure gating deferred). | B, A, C |
| D6 | Any member may override the household's quiet hours down to **none** for themselves; quiet hours are not lockable. | B, A |
| D7 | Most suggestions per day: 1 to 20 in the web form and in chat; default 2. **Default revised to 3 by D20; the range stands.** | B, A |
| D8 | **SUPERSEDED by D28.** Household-level food claims open to any member. | B, A, C |
| D9 | Any household member may propose for another member, no restriction (the proposer comes from the personal link; a shared link cannot propose). | C |
| D10 | A later reject or edit does not change meals or plans already made; it affects planning going forward only. | C |
| D11 | The proposer is never told the subject's decision. No outcome line, no event. | C |
| D12 | Pending proposals never expire or escalate. | C |
| D13 | The subject sees nothing about a pending proposal before their next-login notice (no badge, no preview; reading taken: the assistant does not announce it either). | C |
| D14 | While pending, a proposal is treated as fully reliable at once (for example allergy-safe filtering), labelled as proposed. | C |
| D15 | Option B is the chosen direction; A kept for reference; C builds on B. | B, "Voice review" |
| D16 | Sources are App, then Household, then You; the last one set wins. Chips say App, Household, You. An opened row says "Same as household (value)" or "Same as app default (value)", with the chain shown under it. | B |
| D17 | "Stock checks" is renamed "Stock level checks"; the stopped-items list moves into the group. | B |
| D18 | No time zone setting. Stock level checks use the account or device time zone; the zone is inferred, not a preference. | B |
| D19 | Quiet hours: app default 10pm to 6am; the household may set its own; a person may set their own, including **None** (a value meaning no quiet hours for them). | B |
| D20 | Daily cap on prompts: 1 to 20, **default 3** (revises D7's default). | B |
| D21 | Level (quiet, normal, helpful) and how often are set by place (whole kitchen, category, location with optional spot, category in a location, item); **most specific scope wins**; the global "how proactive" dial is removed. System defaults stand; no numbers invented. | B |
| D22 | "Ask me to check amounts" is on by default. | B |
| D23 | The household note and the personal note coexist side by side with no override; both visible, both read. | B |
| D24 | Kitchen role and My assistant leave Preferences and live in the profile. Kitchen role stays a free, self-editable label. One linked assistant is used automatically; if more than one is linked the person must choose a default. | B |
| D25 | A household admin role, binary (admin or not). Only admins change household-level things; the rule is blanket so the role can evolve. Supersedes D5 and D8. Finer roles and tenure gating stay deferred. | B |
| D26 | The founding member (who first set the household up) is an admin by default. | B |
| D27 | The founding member can grant admin to other members, per person, and revoke it (reading: founding member alone, Q-R1). | B |
| D28 | Only admins change household settings (stock-level defaults), household-level food claims and rules, household notes, the household quiet-hours default, "and the like". Non-admins may not. | B |
| D29 | Personal preferences are ungated for everyone, including a member's own quiet hours set to none. Proposing for another member (D9) is unchanged. | B |
| D30 | "Kitchen role" is a free label and grants nothing; the words "Household admin", "Founding member", "Member" are used for the role. | B |

D15 to D24 were numbered from a block reserved for the 10 October voice review; other numbers in that block belong to other work and are recorded with it.

### 2.3 Food decisions F1 to F14 (cite as "food F3"; not the data-model facts F1 to F10 in B)

| ID | Decision in one line |
|---|---|
| food F1 | Two levels feed the planning AI per person: ingredient ("avoid peanuts") and recipe or category ("spicy"). They are not headings; a row is just a rule. |
| food F2 | **Avoid is permanent**: no end date, a hard exclusion. "Never suggest" is the same thing and is **dropped** as a separate category. |
| food F3 | Likes and dislikes are soft weighting (a dislike is not an exclusion) and take an **optional end date**; with none they stand for good; they lapse to neutral by themselves. |
| food F4 | A frequency rule is a new kind ("no more than twice a week"), checked against recent meals. |
| food F5 | A category holds three things: the rule (avoid, like, dislike or cap), a free-text note of what the person said, and attached recipes. |
| food F6 | Recipes are attached **by reference**; titles are pulled live from Recipe and never copied. |
| food F7 | The AI offers matching existing recipes when a category is created ("attach these?"); it asks, it does not attach on its own. |
| food F8 | The time window comes from natural phrasing ("for the next two weeks"), not from date fields in the UI. |
| food F9 | The category is a check Kitchie consults before suggesting a recipe, not a list to browse. |
| food F10 | One service, two surfaces: chat tools and the UI call the same service methods. |
| food F11 | "Usually" becomes **substitutions**: when ingredient X is in a recipe, swap in Y or do Z to it, optional reason. No new category beside avoid, like, dislike, cap. |
| food F12 | Same two tiers as other food rules: household and person; the person's overrides the household's. |
| food F13 | A substitution has no end date. |
| food F14 | The owner's three examples are captured: frozen food blanched; gluten pasta swapped to sourdough bread; white bread to sourdough or seeded sourdough. |

### 2.4 C-series and other numbered labels

| Label | Meaning | Locked? |
|---|---|---|
| C-D1 to C-D4 | The owner's own words on Option C; same as D1 to D4 above. | Yes |
| C-P1 to C-P7 | The Option C mockup's own proposals (chip words, pending first, three answers as rows, "Not sure" strictness, standing row "Added for you", Household tab says proposals never appear there, planning stand-in flags earlier meals). | No, proposals |
| C-Q1 to C-Q5, C-Q10 | Settled by D9 to D14. | Yes (as D9 to D14) |
| C-Q6 to C-Q9, C-Q11 to C-Q13 | Seven open questions. | Open, section 3 |
| A-1 to A-10, B-P1 to B-P9 | Option A and B mockup proposals (B-P4 returned by D26; B-P3 sources superseded by D16; A-6 returned by D28). | No, proposals; B's are what is drawn |
| fact F1 to F10 | Data-model facts in B (what the code holds). | Facts |

### 2.5 Other decisions that bind this build

| Source | Decision |
|---|---|
| Mockup `README.md`, Kitchie ADR `closed-vocabulary-for-ai` (owner, 5 Oct) | Closed vocabulary where logic acts, free text elsewhere; surface every decision-critical value explicitly to the AI. |
| Boundary contract v1 (Kitchie R26, issue #236) | The AI is a sensor: it reports what the person said; stated and corrected feedback only; safety limits are never inferred. |
| Owner standing rule (7 Oct) | The chat tools (MCP) and the UI call the same service methods. |
| Owner standing rule (9 and 10 Oct), mockup `AGENTS.md`, Kitchie `AGENTS.md` | The built screen matches its mockup exactly (markup, classes, tokens, look); differences are listed in the PR. Viewport-specific code lives in its own file. |
| Platform D2, D4, D8, D11, D12 | Hard contract-version match; entitlement per household; cutover only on the owner's instruction; products verify the token locally; reads trust the token, **writes re-check live**. |
| Kitchie `AGENTS.md` | Agents merge their own PRs into `uat` under conditions; never `main`, never tags; schema and security changes are reserved decisions (see 8, I-1). |

### 2.6 Points the owner agreed in the 10 October voice sessions: checked against the notes

All eleven are already recorded in the notes, so no extra line is added. Where each lives:

| Agreed point | Recorded as |
|---|---|
| Avoid is permanent, undated, a hard exclusion; "never suggest" dropped | food F2 |
| Likes and dislikes have optional end dates | food F3 |
| Household and personal notes coexist with no override | D23 |
| The global "how proactive" dial is removed; quiet, normal, helpful and frequency are set per scope | D21 |
| Daily cap 1 to 20, default 3 | D7 (range) and D20 (default 3) |
| Checks default on | D22 |
| Quiet hours app default 10pm to 6am; "None" means off | D19 |
| Time zone is inferred | D18 |
| Kitchen role and My assistant live in the profile; one assistant automatic, several need a default | D24 |
| Household name is configuration, not a preference (still open) | Q-V1 |
| Recipes in categories are attached by reference with live titles | food F5 and F6 |

---

## 3. Open questions and build defaults

**Read this first.** Everything in the "Build default" column is **a build default pending owner review, not a decision.** Agents take it so work does not stop, record it on the review list (section 6, rule 9), and keep it cheap to change (one place, no migration that cannot be undone). Rule of thumb used here: where the mockup draws a reading, the default is that reading; otherwise the safer, more reversible choice; safety (avoid, allergy) always wins.

### 3.1 Option B and A questions

| ID | Open question | Build default (pending owner review) | Where it bites if wrong |
|---|---|---|---|
| Q1 | Recipe stars and votes are household-wide; give them a person level? | No. Recipe unchanged. | Recipe schema change |
| Q4 | Should anything be lockable by the household so a member cannot override it? | No lock field anywhere. | A new column and a resolver rule |
| Q6 | No operation moves a food statement between Just you and Everyone. | None built. Say it again for the other scope (today's behaviour). | One new service operation |
| Q7 | Where the screen lives. | New route for Preferences under Settings; `/settings/stock-checks` stays and redirects to it (links, tests and tool text keep working). **11 Oct 2026:** on desktop it is its own section of the Settings window, right after Settings, and the route opens inside that window (section 9). | Route name |
| A-open 1 | Quiet start and end are two keys: one preference or two? | Keep two stored keys, always written as a pair by one operation; a lone start or end is refused. | Validation and chat tool |
| A-open 2 | A person cannot switch off a household avoid for themselves. | Intended. Food is added together; no override. | A resolver rule (safety makes this the safe side) |
| A-open 3 | Household-wide stops (the table allows `member_id` null, nothing writes it). | Not built. | A new write path |

### 3.2 Household admin role (Q-R)

| ID | Open question | Build default (pending owner review) | Where it bites if wrong |
|---|---|---|---|
| Q-R1 | Do admins have exactly the founding member's rights? | As drawn: grant and revoke are the founding member's alone. Admins make every other household-level write. Removing members stays as it is today (Platform: owner only). | Platform rule and Members view |
| Q-R2 | Last admin; founding member leaves. | The founding member cannot step down or be removed. A household always keeps at least one admin (a revoke that would leave none is refused). If the founding member leaves, the successor is the longest-standing remaining member (Platform's `householdOwnerId` fallback), and they are an admin at once. | Locked-out household; decide before cutover |
| Q-R3 | What does a non-admin see? | The household value read-only with "Only household admins can change this." (as drawn). | Redraw |
| Q-R4 | Who can see who is an admin? | Every member (as drawn). | Redraw and one filter |
| Q-R5 | Household values set before roles arrive. | They stay; from now on only admins change them. No notice. Founding member is an admin (implicit), so nobody is locked out. | A notice screen |
| Q-R6 | Does the household quiet-hours default need an admin? | Yes (it is household level, D28). A member's own quiet hours, including none, stay ungated. | One check |
| Q-R7 | Where is the role stored; which source wins when Kitchie's own sign-in and Platform differ? | **Platform stores it** when Kitchie runs in platform mode (membership is Platform's). Kitchie's own `members` table holds it only in standalone mode. The two modes cannot run together (Kitchie refuses `KITCHIE_PLATFORM=on` with `KITCHIE_AUTH=on`), so they never disagree in one deployment. | Schema location |
| Q-R8 | Do Recipe stars and votes count as household-level things? | No gate (as drawn). | A Recipe check |
| Q-R9 | A household-level safety claim now needs an admin. | Stays admin-only. A non-admin who says it to the assistant gets a plain refusal naming who can record it, and may record it as their **own** avoid (person level, ungated). No household proposal path is built (P3: do not invent one). | P4 tension; owner call |

### 3.3 Voice review (Q-V)

| ID | Open question | Build default (pending owner review) | Where it bites if wrong |
|---|---|---|---|
| Q-V1 | Household name: leave Preferences? | Not touched. Today's rename on the Household page stays as it is; the Preferences screen shows only the household-only row the mockup draws, linking there. In platform mode the name is Platform's. | One row |
| Q-V2 | A person's broad rule against the household's narrow one. | As drawn: the narrower place first; at the same place You beats Household. | Resolver order |
| Q-V3 | Category against location when both set the same key. | The resolver returns a tie flag and applies the **quieter** level and the **longer** interval, so nobody is nagged more than either rule asked. The "What applies to an item" line keeps the mockup's "not decided" wording. | One comparator; copy |
| Q-V4 | Notes that disagree. | Not built. Both notes shown and read side by side; no conflict detection. | A feature |
| Q-V5 | May the household set None for quiet hours? | No. The household sets hours only (as drawn). | Validation |
| Q-V6 | What "per day" counts. | Keep per read of due checks (no new storage). Raise the per-read ceiling `DUE_CHECKS_MAX` from 10 to 20 so every value in 1 to 20 has an effect. The helper text stays as the mockup has it. A true per-day counter is a follow-up. | Counter table; copy |

### 3.4 Food (Q-F), including substitutions

| ID | Open question | Build default (pending owner review) | Where it bites if wrong |
|---|---|---|---|
| Q-F1 | Soft avoids; avoid reason. | A soft avoid migrates to a **dislike**; `reason` (safety, other) stays on avoid; an old `stop` becomes an avoid with reason other. Migration keeps the original statement in a `migrated_from` column so it is reversible. | Migration |
| Q-F2 | Does a cap take an end date? "Only once"? | No end date on a cap. "Just this once" is applied by the AI to that plan only and stores nothing. | A column and a rule |
| Q-F3 | What is counted, over what time. | Meals planned or cooked, per person eating, in a rolling 7-day window (every 7-day window that contains the candidate date), per recipe attached to the category or, for an ingredient cap, recipes whose ingredient words match. Meals for everyone count against each person's cap. `per` is `week` only in v1. | Counting function |
| Q-F4 | Whose rules apply to a shared meal? | Every person eating plus the household's. A like for one and a dislike for another cancel to no effect. | evaluate() |
| Q-F5 | Like and dislike strength. | Up or down only. A like never outweighs an avoid. | A weight column |
| Q-F6 | Can the UI create a category? | No. The assistant creates it; the screen changes the cap, takes recipes out, clears an end, stops it. No duration choices. | UI |
| Q-F7 | Is a dismissed suggestion remembered? | No (the mockup just clears the offer). | A small list |
| Q-F8 | Attached recipe disabled or missing. | Disabled: stays attached and keeps counting. Missing: shown as "Recipe not found in Recipe", can be taken out. Recipe unreachable: shown as unavailable and **never** read as missing. | Client |
| Q-F9 | Where the recent-meals history lives (usage and recency for caps). | **Kitchie**: `plan_entries` (planned) and `cooking_sessions` (cooked), counted once per (date, recipe). Recipe changes nothing: its `times_used` and `last_used` are household aggregates with no person and no date history a tool can read. See 4.3. | A Recipe tool |
| Q-F10 | Old "usually" statements; "fact". | An existing habit becomes a **like** with its meal time or day type; "fact" unchanged. Option C's proposable list drops "usually" (see I-9). | Migration |
| Q-F11 | Show a line for ended rules? | Yes, as drawn ("Ended on its own and back to neutral: ..."). | Remove a line |
| Q-F12 | Who may make a household category or rule? | Household admins only (D28). Person-level ungated. | One check |
| Q-F13 | Can a swap be partial? | No. Whole ingredient; no amounts stored. | A column |
| Q-F14 | More than one replacement. | A list; any is acceptable and the first is preferred. | One field |
| Q-F15 | Do rules chain? | No. One pass. | Resolver |
| Q-F16 | How wide is a trigger? | Kitchie stores the words; the AI decides whether an ingredient line is one of them. | Misses until a review list exists |
| Q-F17 | Conflict order for substitutions. | Person over household, then the narrower trigger, then the most recently said; swaps before instructions. | Resolver |
| Q-F18 | Do cooking instructions belong in the same shape? | Yes: `instruction` on the same record. | A field and a row word |
| Q-F19 | Explain a swap every time? | One short line each time, naming whose rule it was. "Not this time" stores nothing. Lives in tool descriptions, not code. | Tool text |
| Q-F20 | Swaps and avoids. | Avoid wins and a swap never lifts one; the avoid check runs before and after the swap. Likes, dislikes and caps are checked on the adjusted recipe. | evaluate() |
| Q-F21 | Meals for more than one person. | A shared dish follows the household's rules and every eater's avoids; a rule only some eaters have is mentioned, not applied, unless the meal is for that person alone. | evaluate() |
| Q-F22 | Keeping a swapped result. | A rule firing never creates a Recipe variation; only an explicit "keep this version" does (Recipe's own rule). | None |
| Q-F23 | Reason as text. | `why` is display text, free, at most 80 characters, never read by logic. | A closed list |

### 3.5 Option C (propose for another member)

| ID | Open question | Build default (pending owner review) | Where it bites if wrong |
|---|---|---|---|
| C-Q6 | Who sees a pending record? | As drawn: the proposer and every other member see a read-only line (person, thing, who proposed, "Waiting for X"); the subject sees nothing before the next-login notice (D13). This is the most privacy-sensitive default; review it first. | Privacy of a list |
| C-Q7 | Can the proposer change or take back while pending? | Take back only (retires the pending row). | One operation |
| C-Q8 | The subject already has a conflicting record. | A proposal never retires the subject's own record. Both stand; the stricter is used (avoid beats like). | evaluate() |
| C-Q9 | Which statements can be proposed? | Avoid, dislike, like. Not substitution, cap or category in v1; not "fact". | Validation; screen choice list |
| C-Q11 | Attribution after an edit. | Stays ("proposed by Arjan, changed by you"). | Display |
| C-Q12 | Does a safety avoidance ask twice? | One confirmation (Kitchie's confirm-once rule). The mockup copy says "ask twice" in one place: see I-8. | Copy |
| C-Q13 | Where does the entry live? | Mine, Food, "Add something for a housemate". | Redraw |

### 3.6 Principle tensions with no drawn answer

| Tension | Build default (pending owner review) |
|---|---|
| P2 and P3: may a non-admin propose a household change? | No path built. |
| P2 and P4: household safety claim needs an admin. | As Q-R9. |
| P4 and P5: a proposal can stay in force indefinitely. | Accepted (D12). No timer, no reminder, no ageing label. |

---

## 4. Architecture considerations

### 4.1 Where each kind of preference lives

| Kind | Data model | Home | Resolution | Who writes (UI and MCP, same service) |
|---|---|---|---|---|
| Stock-level dials: on/off, quiet hours, most per day | Existing `stock_prefs (scope, scope_id, key, value)`; scope `household` or `member`. Keys after the build: `enabled`, `quiet_start`, `quiet_end`, `quiet_off` (a member's explicit None), `daily_cap`. `proactivity` and `tz_offset_minutes` leave `DIAL_KEYS` (old rows become inert, nothing is deleted). | Kitchie | **Per key: App, then Household, then You** (`dialsFor`); `dial_sources` says which. Clearing a value deletes the row, so the next level applies. | Person: self, ungated. Household: admin only. |
| Level and how often, by place (D21) | **New** `stock_rules`: household or member owner; scope kind `all`, `category`, `location` (optional spot), `category_in_location`, `item`; the keys that name the scope; `level` and `every_days`, each optional; `updated_at`, `updated_by`. | Kitchie | One pure resolver beside `checkDue`, run **per key** (level, frequency) on one item: rules that apply, rank `all` 1, `category` 2, `location` 2 (+1 with a spot), `category_in_location` 3, `item` 4; at equal rank You beats Household; narrower place beats the person's broader rule (Q-V2); equal rank of different kinds is a tie (Q-V3 default: quieter, longer). Nothing set: App default (level normal; frequency left to the app). A **stop always wins** and is checked first; "quiet" means do not raise a due check. | Person: own rules. Household: admin. |
| Stops and snoozes | Existing `stock_stops`. Unchanged (D17 moves the list into the Stock level checks group on screen only). | Kitchie | A stop on one item covers every member. | The person |
| Notes (600 characters) | Existing `notes (scope, scope_id, text)`. Unchanged. | Kitchie | **Both read**, no override (D23); another member's personal note is never read. | Person: own. Household note: admin. |
| Food rules: avoid, like, dislike, category with a cap, substitution | `context_claims` gains: `rule`, `kind` (ingredient, category), `ends_on`, `cap_max`, `cap_per`, `swap_json`, `instruction`, `why`, `migrated_from`; **new** `food_rule_recipes (rule_id, recipe_kind, recipe_id, attached_at, attached_by)` with **no title column**. Evidence tables stay append-only. | Kitchie | Person's own plus the household's, **added together** (not an override). Substitutions: person over household for the same trigger. Avoid always wins. Lapse on read when `ends_on` has passed; a sweep marks `lapsed` so history stays. | Person: own. Household: admin. |
| Proposals (Option C) | Same table: a proposal is a person-level claim on the **subject's** `member_id`, plus `proposed_by`, `proposed_at`, `ack_state` (null, `pending`, `accepted`, `edited`), `ack_at`, `noticed_at`. Reject = retire (evidence row `retired`). | Kitchie | In force from the moment it is written (D3, D14); `pending` changes the label only. | Any member proposes (D9); only the subject answers. |
| Household roles | Platform: **new** `household_admins (household_id, member_id, granted_by, granted_at)` and append-only `household_admin_events`. The **founding member** is not stored: it is Platform's existing `householdOwnerId` (the creator, else the longest-standing member), and is an admin implicitly. Kitchie standalone mode: `members.role`. | Platform (platform mode); Kitchie `AuthStore` (standalone) | Admin set = founding member plus granted rows. Binary. | Founding member only (Q-R1 default). |
| Kitchen role, My assistant (D24) | Existing `member_roles` and `stock_prefs` key `assistant`. Moves to the Me page; the assistant row becomes **derived** from what is linked. | Kitchie (Platform supplies the linked client names) | None linked: no app link (the plan button copies the message). One linked: that app. More than one: the stored default, which must be one of them. | Person |
| Recipe stars and votes | Existing Recipe `preferences`. Unchanged (Q1, Q-R8). | Recipe | Household-wide. | Anyone in the household |
| Device only (theme, name size, emoji, motion) | Cookie and browser storage. Unchanged. | Browser | n/a | The device |

**Why these homes.**
- Stock checks, notes, stops, food claims and the plan are Kitchie's, and so are the MCP tools that act on them. The planner, `get_context` and `dueChecks` already live there, so the resolvers go there too.
- Roles are about **membership**, which Platform owns once Kitchie runs in platform mode (production does; Kitchie's own member tables are not used then). Kitchie must not become a second source of truth for who is in a household or who founded it.
- Recipe stores no per-person preference and must stay independent of Kitchie ("Recipe MCP never duplicates inventory; reasoning belongs to the caller"). It only answers "what is this recipe called, is it active".
- `packages/contract` is a hard-matched wire contract. Nothing here needs it to change (4.5).

### 4.2 Platform (`platform`)

**Roles, not tokens.**
- Add schema 6: `household_admins` and `household_admin_events` (append-only, with triggers, like `entitlement_grants` and `assistant_tokens`). Additive and idempotent; the stamp is written last.
- Founding member = `store.householdOwnerId(household)`. No backfill: every existing household already has one (the `owner_member_id`, else the longest-standing member). A household made by `PLATFORM_OWNER` bootstrap or the migration counts the same way.
- Store methods: `isAdmin`, `adminIds`, `grantAdmin(actor, target)`, `revokeAdmin(actor, target)`. Refused: actor is not the founding member; target not in the actor's household; target is the founding member (no-op for grant, refused for revoke); a revoke that would leave no admin. Each change writes an event row (who, whom, when).
- API on the existing member route, no new path: `GET /api/member` gains optional `admin_ids` (includes the founding member) and `me_is_admin`; `POST /api/member` accepts `{"grant_admin": id}` or `{"revoke_admin": id}` beside `remove` and `name`, with the same bearer-only rule and the shared rate limiter. The live write check `GET /api/entitlement?product=...` gains an optional `admin` boolean for the token's own member, so a product holding **any** valid token (session, assistant, OAuth) can ask "may this caller change household values" at write time. All additive; an old reader ignores them. All behind `PLATFORM_HOUSEHOLD_ADMINS=on|off` (default off), as `PLATFORM_TOKEN_NAME_CLAIM` is.
- **Why not a session claim.** The claim set is closed (`strictObject`); a new claim is a token-surface change that needs the owner's recorded approval and a contract number bump in all three repos; and a token snapshot lags a revoke, while D12 wants writes checked live. Recording `admin` on the live write check keeps D11 (local verification) and D12 intact.
- **Why not only `GET /api/member`.** It requires a Platform **session** row, so Kitchie's MCP, which holds an assistant or OAuth token, cannot call it. The entitlement check already accepts every token type and revocation (see I-20).
- Platform must answer "cannot reach" as unavailable (D3), never as "not an admin". A product treats an absent `admin` field as **not admin** (fail closed).
- Platform approval gate: `docs/project-plan.md` section 6 records no approval for this surface. Slice PL1 adds the row quoting the owner's direction (D25 to D30) in the same way the member-removal row does ("owner to confirm in review"). Nothing in PL2 or PL3 merges before PL1.
- Linked assistant names (D24): `GET /api/member` gains optional `ai_clients`, a bounded list of the **names** of active OAuth grants (`oauth_grants.client_name`), never ids or tokens; pasted-in assistant tokens carry no client name and count as "another assistant". Kitchie's strict reader must accept it as a bounded list.
- Time zone and everything else in Platform: unchanged.

### 4.3 Kitchie (`kitchie`)

**Service layer, one code path.**
- New code lives in a new folder `server/src/preferences/` (build default; the repo is flat today) with one module per concern: `roles.ts` (port and the one check), `dials.ts`, `stock-rules.ts`, `food-rules.ts`, `proposals.ts`, `member-zone.ts`, `recipe-titles.ts`, plus the web and MCP adapters. `InventoryStore` only hands these modules its database, as `plan.ts` and `context.ts` already do. `store.ts` is 4,000 lines and the busiest file: do not add logic to it.
- Keep the existing pattern for authority: the web layer and the MCP handler resolve the caller's role **once**, then pass `Authority { isAdmin }` into the store method, which refuses without it (defence in depth; it replaces `Authority { isOwner }`). The role lookup is async in platform mode (a live Platform call), the store is synchronous, so the lookup stays in the adapters, in **one function** (`householdWriteAllowed`) that every household write calls.
- Household writes today: `setStockPref` and `setNote` with `scope: "household"`; `give_feedback` with `who: "household"` and retire of a household claim (currently ungated); new rules, categories, caps and substitutions at household level; grant and revoke. **All** go through that function. A table-driven test lists every web route and MCP tool that can write a household-scope row and asserts a non-admin is refused (no back door); a second test greps the store for household-scope writes that do not take an `Authority`.
- UI and MCP call the same methods: each operation in the food proposal's tables (`create`, `attach`, `detach`, `setCap`, `setEnd`, `clearEnd`, `expire`, `retire`, `evaluate`, `substitutionsFor`) is one service method; the web route and the tool are thin. A test spies the service from both surfaces.
- AI contract: closed vocabulary where logic acts (rule kind, severity, reason), free text for the person's words. `get_context` and `give_feedback` change **additively**: `CONTRACT_VERSION` "1.0" goes to "1.1"; old connectors keep working (`usually` is still accepted on input and mapped per Q-F10). `do_not_suggest` (the old stops) is empty after the migration because stops became avoids.
- `check_food_rules` is a new read-only tool; `stock_settings` gains set, list and remove for rules. **MCP tools are not feature-flagged** (ADR `issue-driven-delivery`, amendment 3: no flags on `/mcp` until it is authenticated); MCP additions reach UAT on merge and prod only when the owner promotes.
- Planner: `plan_meal` and `plan_update_meal` call `evaluate` before accepting a recipe, so exclusion no longer rests on the AI remembering to call `get_context`. Effects: `exclude` (avoid), `down` and `up` (dislike, like), `cap_reached`. A swap is applied on the plan entry (`replaced` already exists) and never edits a Recipe recipe.

**Food data and the CHECK problem.**
- `context_claims` has SQL `CHECK` lists on `statement`, `about_type` and `status`. SQLite cannot widen a CHECK, so the new values (new statements for cap and substitution, `category`, `lapsed`) need a **one-time table rebuild** (create, copy with the same ids, drop, rename, recreate indexes) in one transaction in K0's migration. Evidence tables reference claim ids by value only, so they are untouched. This is the riskiest migration in the build: test it on a schema-30 fixture, run it twice, and keep `migrated_from` so every changed row is reversible. If the migration agent judges the rebuild too risky, the fallback is a new `food_rules` table with the same columns and a one-time copy; record the choice on the review list.
- `plan_entries` gains a nullable `how_json` (per-meal cooking instructions for substitutions, food F14). It is the only column added to an existing non-food table; it goes in K0's migration so the plan area is touched once.

**Usage and recency for frequency caps (Q-F9).**
- Kitchie counts. Planned meals are in `plan_entries` (date, `recipe_id`, `for_kind` everyone or member, `ingredients_json`); cooked meals are `cooking_sessions` (`recipe_id`, `started_at`, `ended_at`). A meal planned and then cooked counts once per (date, recipe).
- Rule for "no more than N per week": a candidate on date D is `cap_reached` if **any** rolling 7-day window containing D would hold more than N matching meals including the candidate. A meal for everyone counts against every person's cap; a meal for one member counts for that member only.
- Recipe is not asked. Its `times_used` and `last_used` are one household aggregate per recipe, with no person and no history a tool can read by date; adding that would be a Recipe schema change that the cap does not need.

**Proposals and the next-login notice (Option C).**
- A proposal is written on the subject's own row with `proposed_by`, `proposed_at`, `ack_state = pending`. It is read as in force from then on (D3, D14) and labelled `source: "proposed"` for the AI (so the assistant never says the subject told it). Accept clears the flag; edit is a `corrected` replacement and keeps the attribution; reject retires the row. None touches plans already made (D10).
- **No queue table.** The "queue queued for next login" is a query over the signed-in subject's pending rows. `noticed_at` is null until the subject's first screen after sign-in; until then nothing shows anywhere (D13) and `get_context` marks the claim "not yet noticed" so the assistant applies it without announcing it. At that first screen the banner (Review, Later) shows and `noticed_at` is set. "Later" keeps the flag. The standing row "Added for you" appears only after `noticed_at`. A sign-in is a Kitchie session (standalone) or a new Platform token `iat` (platform mode), so the banner returns once per sign-in while rows are pending.
- Nothing goes back to the proposer (D11): no event, no outcome row. The proposer's "Waiting for Sam" line is a query over pending rows they proposed and simply stops being listed. There is no timer, no age label, no reminder (D12, P5). The household-events table must **not** be reused: it hides events about the viewer and deletes after 60 days.
- A shared link has no member to name, so it cannot propose (mechanical, not a restriction; D9).

**Time zone inference (D18).**
- The browser's IANA zone is sent as a cookie set by the existing small script (no new request on load), validated server-side against the platform's known zone names, and stored per member as last seen (`member_zone`, K0 DDL). `localDate`, `inQuietHours` and `checkDue` get the zone's offset **at that moment**, so summer time is right (the old fixed offset was wrong for half the year).
- Fallback for a member who only uses chat: their last zone seen; then (build default) the household's most recent zone from any member; then UTC. With the new 10pm to 6am default, a UTC fallback would put a Sydney household's quiet hours in the middle of the day, so the household fallback matters. Existing `tz_offset_minutes` rows are used only until a zone has been seen.

**Notes, quiet hours, cap (small rules).**
- "Quiet hours: None" is a stored override (`quiet_off`) that beats the household's; today None clears the member's row, so the household's applies (D6 needs the change). `dial_sources` reports it as the member's own.
- The web form accepts 1 to 20; chat accepts 1 to 20 (was 0 to 20). A stored 0 is read as "no checks" and not rewritten.
- The standalone page route `/settings/stock-checks` redirects to Preferences; the old form routes stay until the new page ships (the redirect lands in the page slice, not before).

### 4.4 Recipe (`recipe`)

- One change: a read-only capability so Kitchie can draw live titles (food F6). Shape (build default, mirrors Kitchie's own `/capability/inventory` and Recipe's `cross/inventory.ts` client): `GET <recipe base>/capability/titles?ref=recipe:<id>&ref=variation:<id>` with the caller's Platform bearer; at most 50 refs; answer `{ items: [{ kind, id, title, status }], missing: [{ kind, id }] }`; household scoped to the **token's** household only (never a parameter); strict ids; size, time and rate caps; no recipe body, no nutrition. Behind `RECIPE_CAPABILITY_TITLES=on|off` (default off).
- Recipe stays immutable: a title changes only through a new variation, so "live" matters mainly for status (disabled) and for variations. Disabled stays attached and keeps counting (Q-F8).
- Platform mode takes **only** Platform tokens, only the token's household; pre-existing rows live under `hh_default` in standalone mode. Both paths are tested. Unreachable is answered as unavailable and never as missing.
- Stars, votes, usage: no change. No new schema (Recipe is at schema 5). Recipe's MCP tool list is unchanged (its tool-list snapshot test must stay green).
- Process: Recipe's `AGENTS.md` says building starts only after the owner approves it on the issue. RC1 therefore quotes the owner's direction on its issue (see 8, I-3) before any code.

### 4.5 `packages/contract` and the version rules

- **No change by default.** Session claims stay `{sub, household, products, iat, exp, name?}`; the manifest shape stays; no new claim, no `role`, no new manifest field. Roles ride on the live write check and `/api/member`, which are not part of the contract package.
- **If a contract shape ever has to change** (a claim, a manifest field), it is a contract number change: `contractMatches` is a hard equality, so Platform, Kitchie (`PLATFORM_CONTRACT`) and Recipe must move together or the product is "not served" (silent, plus an admin note). That needs the owner's approval for the token/session surface and is **not** in any slice here. Do not add tolerant ranges.
- **Cached nav.** A client that cached nav under one deploy version reloads when the served `version` differs (`cacheDecision`). Kitchie's manifest `version` is its package version, so every merged PR that bumps it makes cached clients reload once. That is expected in UAT. Nav entries do not change (Preferences sits inside Settings), so no nav is invalidated by this feature.
- Kitchie's own `APP_CONTRACT` (forced reload of open pages, default 1) is not bumped: the old stock-checks route redirects, so an open old page keeps working. Bump only for a reply shape an open page cannot cope with.

### 4.6 Cross-cutting

**Migration and backfill of existing data.**

| Existing data | Target | Rule |
|---|---|---|
| `stock_prefs` `enabled`, `quiet_start`, `quiet_end`, `daily_cap` (household and member) | Same rows | Kept. Reads tolerate a stored `daily_cap` of 0 as "no checks"; not rewritten. |
| `stock_prefs` `proactivity` (household and member) | A whole-kitchen `stock_rules` row of the same owner with that `level`; the key leaves `DIAL_KEYS` | Schema 32 backfill, idempotent (skip if a whole-kitchen rule of that owner exists). Today nothing reads `proactivity`, so no behaviour changes. |
| `stock_prefs` `tz_offset_minutes` | Used until a zone name has been seen, then ignored | Never deleted. |
| App default quiet hours | 22:00 to 06:00 (was none) | A behaviour change for every member who never set quiet hours (D19). On the review list. |
| `notes` | Unchanged | |
| `stock_stops` | Unchanged | |
| `context_claims`: `stop` | `avoids`, reason other | Schema 33 backfill; `migrated_from` keeps the old value. |
| `context_claims`: soft avoid | `dislike` (Q-F1) | Same; reversible. |
| `context_claims`: `usually` | `likes` keeping meal time and day type (Q-F10) | Same; reversible. |
| `context_claims`: everything else | Unchanged; new columns null; `rule` derived from `statement` | |
| Members, founding member, admins | Platform: none (founding derived; no admin rows). Kitchie standalone: `members.role` defaults to `member`; founding derived from the earliest `created_at` | Seed rule (B, "Proposal"): the current longest-standing member is the founding member and admin; everyone else is a member. |
| `stock_prefs` key `assistant` and cookie `kitchie_assistant` | Kept as the stored default; the Me row is derived from linked clients | Until a person with two linked assistants chooses, the plan button copies the message. |

- **Ids must match.** Kitchie scopes data by the household and member ids in the Platform token, and the production cutover kept Kitchie's ids ("same ids"). New tables store the id the caller presents; **no backfill mints or remaps an id**. A read-only orphan report (rows whose member id is not in the household) belongs in the backfill slice's PR as evidence.
- Every migration step is `IF NOT EXISTS` or column-checked, idempotent, stamped last, and a newer database is refused (`SchemaTooNewError`). Therefore **rolling UAT code back below a migration needs the data rolled back with it**; say so in the PR.
- Never touch the data of a real household in a test or a script. UAT only; fixtures use obviously fake ids.

**Feature flags and rollout (UAT only, nothing live).**
- A merge into `uat` reaches UAT only. Production is pinned to a tag the owner cuts from `main`; agents never merge into `main`, never tag, never deploy. So "nothing live" holds by process; flags add a second guard for behaviour that changes existing households.
- Proposed flags (names are build defaults; strict `on` or `off`, default **off**, a bad value stops the start like `KITCHIE_PLATFORM`): `KITCHIE_PREFERENCES` (the new Preferences page, the admin gate, the new rule kinds in `evaluate`, the migrations' visible effects); `PLATFORM_HOUSEHOLD_ADMINS`; `RECIPE_CAPABILITY_TITLES`. Names go in `.env.example` (names only, never values). Additive migrations (new tables and columns) run regardless of the flag so a flag flip needs no schema step.
- The UAT environment values live in infra and are the owner's to set. **Owner action, listed once:** set the three flags in the UAT environment, after a data snapshot (ADR amendment 4: snapshot before any flag is activated). Until then the build ships dark. The review list notes whether each flag is on.
- Not flagged: MCP tools (see 4.3), and docs.

**Test strategy.**
- Unit: dial chain with `quiet_off`; rule resolver (rank, tie, You over Household, stop first); cap windows including the any-window rule and Sydney week boundaries; lapse on read; substitution resolution (person over household, narrower trigger, swap then instruction, no chains, avoid after swap); admin rules (grant, revoke, last admin, founding); zone offsets across the 2026 and 2027 daylight-saving changes.
- Port contract suites: one shared suite per port run against **every** adapter and the fake (Platform's rule): `HouseholdRoles` (fake, standalone, platform-http), Platform's admin store, the Recipe titles client against fixtures generated from Recipe's real output (as Kitchie's `recipe-fragments` fixtures are).
- Integration: temporary SQLite at the schema-30 fixture, migrate, assert, migrate again, assert unchanged; newer-schema refusal; web routes (403 for a non-admin, same-origin, rate limit, strict fields); MCP tools (personal link only, shared link refused, golden tool-list and description snapshots updated in the PR that changes them); platform mode and standalone mode both, never together.
- Acceptance: every slice's criteria in section 5 become tests named with the slice and decision ids (for example `K4 D16 chip words`).
- UI parity (see 5.6): headless Chromium at 360, 390, 768 and 1280 (and 1023 and 1024 for the viewport files), light and dark (themes `kitchie-day` and `kitchie`), of every mockup state listed on the slice, compared with the built page seeded with the same data. Compare the markup of the screen's own subtree (element structure, class names, data attributes, text) after stripping the mockup chrome (`mh-*`, `oc-*` page wrappers, `data-pc`), then compare screenshots with a recorded tolerance. Differences go in the PR with the reason (`AGENTS.md`: mockup and build stay close). Use pinned snapshots of the mockup states, recorded with the mockup commit they came from, so a later mockup change does not break the build silently.
- UAT checks after deploy (a checklist in the review issue, run by an agent where possible, read-only where it touches real UAT data): founding member, admin and plain member see the right Household tab; grant and revoke show at once; quiet hours None; the rule probe for milk; a food rule with an end date lapses; a proposal shows a banner at the next sign-in and not before; the assistant row follows what is linked.
- CI: each new suite is added to the repo's workflow in the same PR. Report the CI run for the head commit, or say plainly CI did not run (a billing-only failure is reported, not waited on).

**Security and privacy.**

| Data | Who reads | Who writes | Audit |
|---|---|---|---|
| Personal dials, rules, note, stops | The person (note private) | The person, ungated | `updated_at`, `updated_by` |
| Household dials, rules, note | Every member | Admins only (D28) | `updated_by`; Platform admin events for roles |
| Personal food rules | The person and the person's assistant. Other members never read them. Planning for a person uses their rules on the server and returns only the effect (subject and verdict), never the person's own words | The person; a proposal by any member lands as `pending` | Evidence rows (append-only) |
| Household food rules | Every member | Admins only | Evidence rows |
| Pending proposal | Subject (after the notice); proposer and others see the read-only line (C-Q6 default) | Proposer proposes and takes back; only the subject accepts, edits, rejects | `proposed_by`, `proposed_at`, `ack_state`, `ack_at`; proposer is not told the outcome |
| Roles | Every member | Founding member (grant and revoke) | `household_admin_events`: who, whom, when, append-only |
| Recipe titles | The household that owns the recipe | n/a | n/a |

- Anything a person wrote (notes, `said`, `why`, rule names, recipe titles from another service) is **data, never instructions**: escaped on screen, length-capped, control characters refused.
- Limits are security and cost controls: keep `activeClaimsPerHousehold` (300); add per-category attached recipes at most 50 (build default); every new route has same-origin, body-size and rate limits like the existing web writes; the titles call is batched and bounded.
- The public mockup and fixtures use sample names (Arjan, Jo, Sam) and fake ids. No real person's details in any repo, fixture, log or PR. Never print a secret value; names and set or unset only.

**Notifications.** Server-rendered banner and standing row at the next sign-in only (P5). No push, no email, no count sent elsewhere, no realtime event (do not add event kinds to Kitchie's event registry, do not use the change feed), no reminder, no expiry. Script only enhances; a `<noscript>` line where a feature needs script.

**Performance (Kitchie `AGENTS.md`, DESIGN.md section 6).**
- The default path of the Preferences page is the server-rendered page, the shared stylesheet and deferred versioned scripts. The mockup's screen CSS (about 11 KB) is **inlined on that page only**, not added to `page.css`; its tablet and desktop rules are separate files linked with a `media` attribute (the mockup already has `-600` and `-1024` files).
- Editors, food rows' detail, the Members view, the rule editor and recipe titles load **when a row is opened**. The closed Mine tab needs the values and one count (pending proposals); nothing else. New scripts go in `server/src/assets/` and, in **one** line each, into the `ASSET_FILES` table. Do not remove a lazy-load, cache header or fingerprint.
- The notes in this repo give 40 KB and 49 KB for `mine-household.js`; the file is 74 KB now (see I-7). Re-measure and state real numbers in each PR; most of the mockup script is sample data and the "View as" controls and is not for the build.

**Risks and constraints from the repos' `AGENTS.md` (each is a rule in force, not a suggestion).**

| Rule | Effect on this build |
|---|---|
| Platform D8: cutover of Kitchie sign-in, households and members into Platform only on the owner's explicit instruction | No slice moves members, ids or households. Backfills run inside each app's own database only. |
| Kitchie refuses `KITCHIE_PLATFORM=on` with `KITCHIE_AUTH=on` | The roles port has two adapters chosen by mode; tests run each mode alone. Never enable both. |
| Recipe platform mode takes only Platform tokens and only the token's household | The titles capability and its Kitchie client are tested with Platform tokens; no static-token path. |
| Platform: do not modify other repositories from platform work | Each repo's slices are separate PRs by separate agents. Platform's needs from Kitchie are written in Platform's plan, not done there. |
| Platform: sign-in, session and token surfaces need recorded owner approval | No token or claim change in this build. The roles surface gets its approval row in PL1. |
| Platform: no module-level default for an undecided question | Platform code takes open numbers as parameters. Kitchie and Recipe are not bound by this rule but should not hide an open question in a constant either. |
| Platform: nothing stacked on an unmerged branch | Always branch from `uat`. |
| Reserved decisions (schema, security, paid service) are excluded from agent self-merge in all three repos | See 8, I-1. This build is mostly schema and security. |
| Kitchie: no new dependency without approval; lockfile committed; CSP `style-src` not widened; layout tokens test (no width literals) | New CSS uses tokens only; viewport rules in their own file. |
| Kitchie: PRs state what ran where (local, headless browser, CI) and what was not confirmed on a phone | Applies to every UI slice. |
| Config-shape wording | Strings and tests say "Only the household owner can change..." (`web-stock.ts`, `store.ts`, `stock-check-web.test.ts`) | The words change to "Only household admins can change this." (D30) in K1; any outside check matching the old string is for the owner to update (I-17). |
| Recipe: hosted-screens fetch makes Kitchie's server the rate-limit client for every household | Titles are fetched in one batch per draw, request-scoped memo only (no stored titles, food F6). |

---

## 5. Build slices (maximum parallelism)

**How to read this.** A slice is one pull request by one agent, into `uat` of one repo. Slices in different repos never wait on each other's merge: each is built against the **agreed interface** written here, with a fake or fixture on the other side, and the real pairing is checked in the UAT checks (slice K17). "Depends" means "cannot merge before"; "can start" means all of the slice's inputs are in this file. Every slice ends with: local checks run and reported, the credential scan, a line in the repo's plan, and an entry on the review list (rule 9).

### 5.1 Waves

| Wave | Slices that can start | Waits for |
|---|---|---|
| 0, at once | PL1, PL2, PL4, RC1, K0, K11, K16 | Nothing |
| 1 | K1, K2, K3, K8, K9, K12, PL3, RC2 | K0 (Kitchie); PL2 (PL3, interface fake meanwhile); RC1 (RC2) |
| 2 | K4, K6, K10, K14 | K1 and K2 (K4); K1 (K6); K9 and K11 (K10); K9 (K14) |
| 3 | K5, K7, K13a, K13b, K13c, K15 | K3 and K4 (K5); K4 (K7, K13a, K13b, K13c, K15); K9, K12 (food UI); K14 (K15) |
| 4 | K17 | Everything else merged to `uat` |

Twenty-six slices: Platform 4 (PL1 to PL4), Recipe 2 (RC1, RC2), Kitchie 20 (K0 to K17, with K13 in three parts). Up to seven start at once; up to eight more start the moment K0 lands. If an agent can start a slice earlier by working against a fake, it should (the interface is written below) and say so in the PR.

### 5.2 Shared interfaces (agree once, build in parallel)

These are the seams. Change one only by updating this section in the same PR and telling the other slices' PRs.

| Seam | Shape |
|---|---|
| `HouseholdRoles` port (Kitchie, K1) | `adminIds(householdId): Promise<{ foundingId: string; adminIds: string[] } \| "unavailable">`; `isAdmin(householdId, memberId): Promise<boolean \| "unavailable">`; `grant(actorId, targetId)`, `revoke(actorId, targetId)` returning `{ ok: true } \| { ok: false; reason: "not_founding" \| "not_member" \| "is_founding" \| "last_admin" \| "unavailable" }`. Adapters: fake (tests), standalone (`members.role`), platform-http (below). |
| Platform member route (PL3) | `GET /api/member` adds `admin_ids: string[]` and `me_is_admin: boolean`; `POST /api/member` adds `{"grant_admin": "<member id>"}` and `{"revoke_admin": "<member id>"}`; bearer only, same-origin, rate limited; errors use the existing `{error}` shape. `GET /api/entitlement?product=...` adds `admin: boolean` for the token's member. All behind `PLATFORM_HOUSEHOLD_ADMINS`. |
| Platform assistants (PL4) | `GET /api/member` adds `ai_clients: string[]` (names of active OAuth grants, at most 10, each at most 60 characters, no ids). |
| Titles capability (RC2) | `GET /capability/titles?ref=recipe:<id>&ref=variation:<id>` (at most 50 refs), Platform bearer, household from the token: `{ items: [{ kind, id, title, status }], missing: [{ kind, id }] }`. |
| Rule record (K3) | `stock_rules`: `id, owner_kind (household\|member), owner_id, scope_kind (all\|category\|location\|category_in_location\|item), category, location_id, spot_id, item_id, level (quiet\|normal\|helpful\|null), every_days (1..365\|null), updated_at, updated_by`. Resolver: `resolveForItem(item, rules, now) -> { level, every_days, level_from, every_from, tie }`. |
| Food rule operations (K9) | Exactly the table in the food note: `create, attach, detach, setCap, setEnd, clearEnd, expire, retire, evaluate, substitutionsFor`; `evaluate(subjects[], recipe) -> { effect: exclude\|down\|up\|cap_reached\|none, because: [...], swaps: [...] }`. |
| Proposal operations (K14) | `propose(proposer, subject, claim)`, `takeBack(proposer, id)`, `accept(subject, id)`, `edit(subject, id, claim)`, `reject(subject, id)`, `pendingFor(subject)`, `waitingBy(proposer)`, `markNoticed(subject)`. |
| Preferences registry (K0) | `server/src/preferences/index.ts` exports `registerPreferenceRoutes(app, deps)` and `registerPreferenceTools(server, deps)` with **one named line per slice** (`registerRoles`, `registerDials`, `registerRules`, `registerFoodRules`, `registerProposals`, `registerMemberZone`, `registerRecipeTitles`, `registerProfileAssistant`). Each slice edits only its own line. |
| Migration numbers (Kitchie) | Reserved: **31** = K0 (all new DDL, the CHECK rebuild, `plan_entries.how_json`, `members.role`, `member_zone`); **32** = K2 (`proactivity` backfill); **33** = K9 (food backfill). A migration that is already merged is never renumbered. If a slice needs another, it takes the next free number at merge time and updates its own test. |
| Platform migration number | **6** = PL2. |

### 5.3 Platform slices

**PL1. Plan and approval row (docs).**
- Depends: nothing. Mockup: none.
- Accept: `docs/project-plan.md` records the household admin role (D25 to D30) as a surface: what is added (table, member route fields, entitlement field), that the session claim set does **not** change, the flag, and the owner's direction quoted with its date (10 October 2026). It lists "owner to confirm in review". No code.
- Touches: `docs/project-plan.md` (append a row; keep both sides on conflict).
- Issue: `Platform: record the household admin role surface (D25 to D30)`.

**PL2. Household admins in the store (schema 6).**
- Depends: nothing (PL1 should merge first but does not block).
- Accept: schema 6 creates `household_admins` and append-only `household_admin_events` (triggers refuse update and delete); additive, idempotent, stamped last; a database newer than the code is refused. Store methods `isAdmin`, `adminIds`, `grantAdmin`, `revokeAdmin` enforce: only the founding member (`householdOwnerId`) grants or revokes; target must be a member of the actor's household; the founding member is always an admin and cannot be revoked; a revoke that leaves no admin is refused; the founding member who leaves is replaced by the longest-standing remaining member at once (Q-R2 default). Every change writes an event. Contract suite over the in-memory fake and the SQLite store.
- Touches: `packages/store/src/schema.ts`, `store.ts` (new methods in a new file `admins.ts`, one line in `store.ts`).
- Issue: `Platform: store household admins with an append-only change log (schema 6)`.

**PL3. Admin fields on the member and entitlement routes.**
- Depends: PL2 (build against the fake until it lands).
- Accept: with `PLATFORM_HOUSEHOLD_ADMINS=on`, the shapes in 5.2; with it off, responses are byte-identical to today (test). Grant and revoke refuse with the right status and the existing error shape; rate limit shared with member removal; a product token with no session can read `admin` on the entitlement check. The cached-nav and token tests stay green; **no change** to `packages/contract` (test asserts the claim set).
- Touches: `apps/portal/src/server.ts` (one new handler file, one line in the router).
- Issue: `Platform: expose household admins on /api/member and /api/entitlement (flagged)`.

**PL4. Linked assistant names on the member route.**
- Depends: nothing. Mockup: Profile, `?as=sam&tab=mine&to=profile-demo` (one linked) and `?as=arjan&...` (two linked).
- Accept: `ai_clients` as in 5.2, from active OAuth grants only (revoked and expired excluded); no ids, no tokens in any response or log; absent when the flag is off.
- Touches: `apps/portal/src/server.ts` (separate helper file; one line).
- Issue: `Platform: list the names of linked assistants on /api/member`.

### 5.4 Recipe slices

**RC1. Record the owner's direction on the issue (docs).**
- Depends: nothing.
- Accept: a GitHub issue "Live recipe titles for Kitchie's food categories" quotes the owner's 10 October 2026 direction (food F5 and F6), states the capability shape and flag, and says building starts under Recipe's rule "Building starts only after the owner approves it on the issue" **on the strength of the owner's instruction of 10 October that development proceed**; a line in `docs/project-plan.md`.
- Issue: `Recipe: live titles for Kitchie food categories (capability, read-only)`.

**RC2. Titles capability.**
- Depends: RC1. Mockup: Food states `?as=sam&tab=mine&open=me:c9` (attached recipes with titles), `...open=me:c8` (household).
- Accept: shape in 5.2; Platform tokens only, household from the token; flag `RECIPE_CAPABILITY_TITLES` off by default (route absent when off); unknown refs in `missing`; disabled recipes returned with `status: "disabled"`; more than 50 refs refused; no body or nutrition in the answer; Recipe's MCP tool-list snapshot unchanged; cross-household test (a token of household A cannot read B's titles).
- Touches: a new `capability/titles.ts`; one line in the server's route table.
- Issue: `Recipe: GET /capability/titles for Kitchie (flagged, read-only)`.

### 5.5 Kitchie slices

**K0. Foundation: migration 31, registry, flags.**
- Depends: nothing. Mockup: none (no screen).
- Accept: schema 31 as listed in 4.3 and 4.6 (new tables `stock_rules`, `food_rule_recipes`, `member_zone`; `context_claims` rebuilt with widened CHECKs and the new columns; `plan_entries.how_json`; `members.role`), run twice with identical results, on a schema-30 fixture with realistic rows (including each old statement type), evidence rows intact; newer-schema refusal still works. `preferences/index.ts` registry with the named lines and no behaviour. The flag `KITCHIE_PREFERENCES` read strictly (`on` or `off`; anything else stops the start). `Authority` gains `isAdmin` beside `isOwner` (old field kept until K1 removes it). No UI, no tool change. Merge this first and fast: small, additive, and everyone waits on it.
- Touches: `store.ts` (migration only), new `preferences/` folder, `.env.example` (names only), one line in `app.ts`.
- Issue: `Kitchie: preferences foundation (schema 31, registry, flag)`.

**K1. Household roles: port, adapters, the one check.**
- Depends: K0. Platform pairing with PL3 (fake until then).
- Accept: `HouseholdRoles` port, three adapters, shared contract suite; `householdWriteAllowed` used by **every** household-scope write (list in 4.3); the "no back door" tests; platform-http treats unreachable as unavailable (writes refused with a retry message, never allowed) and an absent `admin` field as not admin; standalone seeds the earliest member as founding and admin; `Authority.isOwner` and `isHouseholdOwner` removed; copy "Only household admins can change this." wherever "household owner" was shown (web and tool text). Behind `KITCHIE_PREFERENCES`: when off, today's owner rule stands.
- Mockup: Household read-only states `?as=sam&tab=hh&open=hh:quiet` and `...hh:note`.
- Touches: `preferences/roles*.ts`, `platform-member.ts` (extend), `auth-store.ts` (role column use), `web-stock.ts` and `stock-mcp.ts` (the gate call only).
- Issue: `Kitchie: household admin check for every household-level write`.

**K2. Dials: quiet hours, daily limit, time zone inferred.**
- Depends: K0.
- Accept: D19 (default 22:00 to 06:00; member "None" via `quiet_off`, shown as the member's own in `dial_sources`; household cannot set None, Q-V5); D20, D22 (default 3, 1 to 20 in web and chat, `DUE_CHECKS_MAX` 20, on by default); D18 (zone cookie validated, `member_zone`, offsets by date, daylight saving tested for Sydney across 5 April and 4 October 2026 and 3 October 2027; fallback chain in 4.3); `proactivity` and `tz_offset_minutes` leave `DIAL_KEYS`; migration 32. Old pages keep working until K4 ships. Behind `KITCHIE_PREFERENCES`.
- Mockup: `?as=sam&tab=mine&open=me:quiet`, `...open=me:daily_cap`, `...open=me:enabled`.
- Touches: `stock.ts` (dial keys and defaults), `preferences/dials.ts`, `preferences/member-zone.ts`, one cookie script line.
- Issue: `Kitchie: stock level check dials (quiet hours incl. none, daily limit 1 to 20, inferred time zone)`.

**K3. Level and how often by place: resolver, store, tool.**
- Depends: K0 (resolver and store can start now; hooking into `checkDue` waits for K2's merge).
- Accept: the resolver in 4.1 as a pure function with a table test of every scope pair, You over Household at equal rank, the Q-V2 and Q-V3 defaults, stop first, nothing-set returns the app default with `*_from: "app"`; store ops `set`, `remove`, `list` per owner, bounded (at most 50 rules per owner, build default); `stock_settings` gains `rule_set`, `rule_list`, `rule_remove` and a read-only `what_applies(item)` (the "What applies to an item" probe); household rules need the admin check (K1; use the port, fake in tests); `dueChecks` and `checkDue` use the resolver. The old `proactivity` dial is not read anywhere.
- Mockup: `?as=sam&tab=mine&open=me:rule:ru2`, `...ru3`, `...open=me:probe`, `...open=me:all`.
- Touches: `preferences/stock-rules.ts` (new), `stock.ts` (call site), `stock-mcp.ts` (tool schema), golden tool snapshot.
- Issue: `Kitchie: level and how-often rules by place with most-specific-wins resolver`.

**K4. Preferences page: Mine and Household tabs, stock level checks group.**
- Depends: K1, K2 (values and role). K16 helpful, not blocking.
- Accept: **(11 Oct 2026, section 9) no On this device block, no profile lines, household-only rows on the Household tab only, and on desktop the page opens inside the Settings window.** The page matches `preferences-mine-household` states for: tab bar and focus order; rows with App, Household, You chips (D16); an opened row with "Same as household (value)" or "Same as app default (value)" and the chain line (D16); quiet hours None for me; daily limit helper text; the stopped-items list inside the group (D17), name "Stock level checks"; Household tab as editors for an admin and as read-only rows with "Only household admins can change this." for a member; "Nothing set yet" state (`?data=empty`); old route `/settings/stock-checks` redirects; server-rendered, script optional (a `<noscript>` line only where needed); closed rows load no editor code. Screenshots at 360, 390, 768, 1280 light and dark, markup parity (5.6). Page route and nav entry sit inside Settings, no new top-level nav item (manifest nav unchanged).
- Touches: new `preferences/web-page.ts`, `server/src/assets/preferences.css` (inlined on this page only), `preferences-600.css`, `preferences-1024.css`, `preferences.js` (the generic row and editor code only); one line each in `ASSET_FILES`; the redirect in `web-stock.ts`.
- Issue: `Kitchie: Preferences page (Mine and Household tabs, Stock level checks)`.

**K5. Rules by place: list, editor, probe.**
- Depends: K3, K4.
- Accept: states `?as=sam&tab=mine&open=me:rule:ru2`, `...ru3`, `...open=me:probe` (the line "What applies to an item" including the tie wording), `...open=me:all`; add, edit, remove a rule; scope picker (whole kitchen, category, location with optional spot, category in a location, item); admin-only on the Household tab; the editor is its own file, loaded on first open. Screenshots and parity as K4.
- Touches: `preferences-rules.js`, `preferences-rules.css` (own files), `ASSET_FILES` lines, route file `preferences/web-rules.ts`.
- Issue: `Kitchie: Preferences rules by place editor and "what applies" probe`.

**K6. Members and admins view; grant and revoke.**
- Depends: K1 (and PL3 for the real pairing).
- Accept: states `?as=arjan&view=members` (founding member can grant and revoke), `?as=jo&view=members` (an admin sees the list, no controls), `?as=sam&view=members` (a member sees who is an admin, read-only); words "Founding member", "Household admin", "Member" (D30); the view loads when opened (member list fetched then); grant and revoke use `HouseholdRoles`; refusals show plain text (last admin, not founding); Kitchen role label is nowhere on this view.
- Touches: `preferences/web-members.ts`, `preferences-members.js` and `.css`, `ASSET_FILES` lines.
- Issue: `Kitchie: Members and admins view with grant and revoke`.

**K7. Notes side by side.**
- Depends: K4.
- Accept: state `?as=sam&tab=mine&open=me:note` (both notes, chips You and Household, 600 characters, personal note private; **11 Oct 2026: the Household chip on Mine is a button that opens the household note on the Household tab, with no "Open in Household" link and no "Read next to yours, not instead of it." line; "Both notes are read. Neither replaces the other." stays**); household note read-only for a non-admin (`...hh:note`); both read by `get_context` and the planner (already true; test it). No change to storage.
- Touches: `preferences-notes.js` (own file), one `ASSET_FILES` line.
- Issue: `Kitchie: Preferences notes (personal and household side by side)`.

**K8. Profile: Kitchen role and My assistant.**
- Depends: K0 (PL4 for the real pairing).
- Accept: states `...to=profile-demo` for one linked assistant (used automatically, no default row) and two linked (must choose a default; the plan button copies the message until one is chosen); Kitchen role stays a free, self-editable label that grants nothing; both rows removed from Preferences (K4 already does not draw them); the cookie `kitchie_assistant` and `assistant` pref keep working.
- Touches: the profile page file (find it with the People/Me page; do not touch Preferences files), `preferences/profile-assistant.ts`.
- Issue: `Kitchie: move Kitchen role and My assistant to the profile (D24)`.

**K9. Food rules: model, service, evaluate, backfill.**
- Depends: K0. K11 for caps (use a stub counter until it lands).
- Accept: the operations of the food note as service methods; `evaluate` with the Q-F4, Q-F5, Q-F15, Q-F17, Q-F20, Q-F21 defaults; avoid always wins; lapse on read for likes and dislikes; migration 33 per the table in 4.6, idempotent and reversible through `migrated_from`; evidence append-only; limits (300 active, 50 attached per category); the CHECK-rebuild risk handled as K0 chose; no title column anywhere. Tests from the three examples (food F14): frozen food blanched, gluten pasta to sourdough bread, white bread to sourdough or seeded sourdough.
- Mockup: data shapes behind `me:c1`, `c9`, `c10`, `c12`, `c13`, `c14`, `hh:c8`.
- Touches: `preferences/food-rules.ts`, `context.ts` (call sites only), migration 33 in `store.ts`.
- Issue: `Kitchie: food rules (avoid, like, dislike, cap, substitution) as one service with evaluate()`.

**K10. Food rules on the chat side and the planner.**
- Depends: K9, K11.
- Accept: `give_feedback` and `get_context` additive (`CONTRACT_VERSION` "1.1", old inputs still accepted), new `check_food_rules`, `plan_meal` and `plan_update_meal` call `evaluate`; household-level writes through the K1 check; a non-admin asking for a household safety claim gets a plain refusal and an offer to record it as their own (Q-R9); the UI-and-MCP parity spy test; tool descriptions carry the wording rules (Q-F19, closed vocabulary where logic acts); golden snapshots regenerated. MCP additions are not flagged (4.3).
- Touches: `stock-mcp.ts` and `plan-mcp` (tool schemas only; logic in `preferences/`), golden snapshot.
- Issue: `Kitchie: food rule tools and planner check (contract 1.1)`.

**K11. Recent-meals counting for caps.**
- Depends: nothing but the K0 branch for types (pure function).
- Accept: `countMeals(subjects, matcher, window, now)` over `plan_entries` and `cooking_sessions` per 4.3, rolling 7-day window rule, once per (date, recipe), a meal for everyone counts for each person, Sydney week edges, ingredient matcher by words. Pure; no schema.
- Touches: `preferences/meal-counts.ts` only.
- Issue: `Kitchie: count recent meals for food frequency caps`.

**K12. Live recipe titles client.**
- Depends: K0; RC2 for the real pairing (fixtures meanwhile).
- Accept: batch fetch (at most 50), request-scoped memo only, no stored titles, bounded timeout; unreachable returns "unavailable" and is never shown as missing; disabled and missing displayed as Q-F8 says; fixtures generated from Recipe's real output; works in standalone and platform mode (Platform tokens only in the latter).
- Touches: `preferences/recipe-titles.ts`; reuses the existing Recipe client wiring.
- Issue: `Kitchie: fetch live recipe titles for food categories`.

**K13a. Food rows: avoid, like, dislike, end dates.**
- Depends: K4, K9 (K12 not needed).
- Accept: states `?as=sam&tab=mine&open=me:c1` (avoid, no end), `...c10` (dislike that ends on its own), "Ended on its own and back to neutral" lines (Q-F11); add via the assistant, edit and clear end in the UI; household food on the Household tab (admin editor, member read-only); screenshots and parity.
- Touches: `preferences-food.js`, `.css` (own files), `web-food.ts`, `ASSET_FILES` lines.
- Issue: `Kitchie: Preferences food rows (avoid, like, dislike, end dates)`.

**K13b. Food categories with limits and attached recipes.**
- Depends: K4, K9, K12 (K11 for the count).
- Accept: states `...open=me:c9` (category with a limit and a suggestion to attach), `...hh:c8` (household category: admin and read-only); change the cap, take recipes out, clear an end, stop the rule; no create-category control (Q-F6); suggestion "attach these?" offers matching recipes and never attaches by itself.
- Touches: `preferences-categories.js`, `.css`, `web-categories.ts`, `ASSET_FILES` lines.
- Issue: `Kitchie: Preferences food categories (limits, attached recipes with live titles)`.

**K13c. Substitutions.**
- Depends: K4, K9.
- Accept: states `?as=arjan&tab=mine&open=me:c13` (a swap), `?as=sam&tab=mine&open=me:c12` (a cooking instruction), `?as=arjan&tab=mine&open=me:c14` (yours over the household's), `?as=sam&tab=mine&data=nosubs` (none yet); the Q-F17 order; no end date (food F13).
- Touches: `preferences-subs.js`, `.css`, `web-subs.ts`, `ASSET_FILES` lines.
- Issue: `Kitchie: Preferences substitutions (swap or cooking instruction)`.

**K14. Proposals: model, service, notice query.**
- Depends: K9 (claim shape).
- Accept: operations in 5.2; in force at once and labelled `proposed`; take back; accept, edit, reject apply from then on only (P6, D10); `pendingFor`, `waitingBy`, `markNoticed`; nothing visible to the subject before first screen after sign-in (D13, test through web and `get_context`: the claim applies but is marked "not yet noticed"); proposer gets no event and no outcome (D11); no expiry job exists (test: no timer code path); a shared link cannot propose; attribution stays after an edit (C-Q11).
- Touches: `preferences/proposals.ts`, `context.ts` (label only), tool schema (K10 owns the golden snapshot; coordinate, see 5.7).
- Issue: `Kitchie: propose a preference for another member (data and service)`.

**K15. Option C screens.**
- Depends: K4, K14.
- Accept: the states of `fragments/preferences-option-c/` (propose, pending, next-login banner with Review and Later, review accept/edit/reject, standing row "Added for you", the proposer's read-only "Waiting for" line) drawn in Option B's layout; where Option C's fragment still shows wording from before D16 to D24 (see I-10), follow Option B's fragment and list each difference in the PR.
- Touches: `preferences-propose.js`, `.css` (own files), `web-propose.ts`.
- Issue: `Kitchie: Option C screens (propose, pending, next-login notice, review)`.

**K16. UI parity harness.**
- Depends: nothing. Can start at once.
- Accept: a script in `scripts/` that serves pinned snapshots of the mockup states (copied under `test/fixtures/mockup/` with the mockup commit sha in a file) and the built page seeded with the same data, takes headless screenshots at 360, 390, 768, 1024 and 1280, light and dark, compares the subtree markup (5.6) and writes a report. Mirrors `tools/screenshots.mjs` in the mockup repo. No new dependency (use what the repo already has for browser tests).
- Touches: `scripts/ui-parity.*`, `test/fixtures/mockup/`.
- Issue: `Kitchie: mockup-to-build parity check for Preferences screens`.

**K17. UAT checks, review list, version, docs.**
- Depends: all other merged to `uat`.
- Accept: runs the UAT checklist in 4.6 and posts the result; assembles the review list issue (rule 9) from the slices' entries; bumps the package version once (the only slice that does); updates `docs/project-plan.md` and ADR notes; confirms the three flags and their state; lists owner actions (set flags in UAT, snapshot before enabling).
- Issue: `Kitchie: Preferences build, UAT checks and review list`.

### 5.6 Mockup parity method (K4, K5, K6, K7, K13a to c, K15)

- For each state a slice lists, record a pinned snapshot of the mockup screen subtree (everything inside `#app`) with the mockup commit sha, and compare to the build's subtree: same element order, same class names, same `data-*`, same text. Ignore only the mockup's own wrappers (`mh-*` page chrome, jump bar, notes column, "View as" controls, `data-pc` hooks).
- Compare screenshots at 360, 390, 768, 1280, light (`kitchie-day`) and dark (`kitchie`); fail over a recorded pixel tolerance; open differences listed in the PR with the reason.
- Viewport-specific rules live only in the `-600` and `-1024` files, applied by `media` attribute (the layout-tokens test forbids width literals elsewhere).
- If the mockup and the owner's words disagree, the owner's words win and the PR says so; do not edit the mockup (this repo) from a build slice.

### 5.7 Merge-conflict hotspots and how to avoid them

| Hotspot | Slices that touch it | Avoidance |
|---|---|---|
| Kitchie `store.ts` (4,164 lines; migration list, `SCHEMA_VERSION`) | K0, K2, K9 | Numbers 31, 32, 33 reserved. Each migration is one function appended after the last; all DDL is in K0 so later migrations are data-only. No logic added to the file. On conflict keep both functions in number order; never renumber a merged one. |
| Kitchie `app.ts` (`ASSET_FILES` at about line 273; route registration) | K0, K4, K5, K6, K7, K13a to c, K15 | One `ASSET_FILES` line per file, kept alphabetical; one registry line per slice in `preferences/index.ts` (K0). Conflict: keep both lines, run the asset-version test. |
| Tool list and golden snapshots (`stock-mcp.ts`, plan tools) | K3, K10, K14 | Snapshot files are generated: on conflict regenerate, do not hand-merge. K10 owns the `get_context` and `give_feedback` change; K14 only adds its own tool in its own schema file. |
| `context.ts` | K2, K3, K9, K14 | New logic in new files; edits limited to call sites and one label; keep each edit small and in its own commit. |
| `web-stock.ts` | K1, K4 | K1 touches the gate call only; K4 touches the redirect only. |
| Client assets | K4 vs the rest | `preferences.js` holds only the generic row and editor code (K4). Every later screen has its own `preferences-<name>.js` and `.css`. No slice edits another slice's asset file. |
| Golden CSS / layout-tokens test | All UI slices | Tokens only, no width literals; run the test before pushing. |
| `package.json`, lockfile, version | K17 only | No new dependency without the owner. Only K17 bumps the version. |
| Kitchie `docs/project-plan.md`, `AGENTS.md` | All | Plan: append a bullet in your slice's own dated entry; conflicts keep both sides. **Never edit `AGENTS.md`.** |
| Platform `apps/portal/src/server.ts` | PL3, PL4 | Each handler in its own file; one router line each. |
| Platform `schema.ts` | PL2 only | Only PL2 touches it. |
| Recipe server route table | RC2 only | One line. |
| Mockup `docs/knowledge` | This file only | Follow-ups to this file go as small docs commits to `main` after `git fetch` and rebase. |

General: small commits; run `git fetch` and merge the base before opening a PR and again before merging; when two slices both want the same line, the one that merges second reconciles and says so in its PR.

### 5.8 Suggested GitHub issue titles (also listed per slice above)

| Repo | Issues (title, in slice order) |
|---|---|
| `platform` | PL1 Record the household admin role surface (D25 to D30); PL2 Store household admins with an append-only change log (schema 6); PL3 Expose household admins on /api/member and /api/entitlement (flagged); PL4 List the names of linked assistants on /api/member |
| `recipe` | RC1 Live titles for Kitchie food categories (capability, read-only); RC2 GET /capability/titles for Kitchie (flagged, read-only) |
| `kitchie` | K0 Preferences foundation (schema 31, registry, flag); K1 Household admin check for every household-level write; K2 Stock level check dials; K3 Level and how-often rules by place; K4 Preferences page (Mine and Household); K5 Rules by place editor and probe; K6 Members and admins view; K7 Notes side by side; K8 Move Kitchen role and My assistant to the profile; K9 Food rules as one service with evaluate(); K10 Food rule tools and planner check; K11 Count recent meals for caps; K12 Fetch live recipe titles; K13a Food rows; K13b Food categories; K13c Substitutions; K14 Propose for another member (data and service); K15 Option C screens; K16 Mockup-to-build parity check; K17 UAT checks and review list; plus one tracking issue "Preferences build: things to check afterwards" (rule 9) |
| `mockup` | None required. Optional, for the owner: redraw Option C for D16 to D24 (I-10) |

---

## 6. Process rules for the build

Recorded as the owner and the repositories state them. Where this file paraphrases, the quoted source wins.

1. **Agents merge their own pull requests into `uat`, without asking** (owner, by voice, 8 October 2026: "all the changes go straight into UAT; it's only the main that I have to do a tag"). Conditions: the pull request is agent-authored (every commit has the agent `Co-Authored-By` trailer); the repository's own checks pass locally and the pull request says plainly which checks ran where (local run, headless browser, CI), what did not run, and what was not confirmed on a real phone; CI is read from GitHub where it can run (a check that cannot start because of GitHub billing is reported, not waited on); there is no unresolved review comment and no merge conflict; and the change needs no decision the owner has reserved (see I-1).
2. **Never `main`, never tags, nothing live.** Nothing is merged into `main` of `kitchie`, `recipe` or `platform`, by anyone in this build. The owner promotes `uat` into `main` and cuts the tags. A pull request that edits `AGENTS.md` is never self-merged, and no slice edits it.
3. **Conflicts: the agent resolves them itself, without asking.** Merge the pull request's base branch (`uat`) into the branch; **never rebase, never force-push, never rewrite history** (Kitchie and Platform `AGENTS.md`; see I-2). Where the conflict is only in a plan or other append-style document, keep both sides' lines. Re-run the local checks and the credential scan, push, read CI for the new head, and say in the pull request what was done. Check for conflicts whenever reporting a pull request open and again whenever the base moved. Never drop a test, weaken a check or revert someone else's merged work to get a merge through; if two changes truly conflict in meaning, stop and put it on the review list.
4. **Human-authored work is left alone.** Never merge a pull request someone else wrote; never push to a human's branch. In this repo, pull requests #26, #31 and #32 are not to be touched.
5. **The mockup repo is different.** It has no `uat`; documentation and mockup changes go straight to `main` (owner's standing rule), without asking. Run `git fetch` and rebase before pushing. Do not change mockup screens or fragments from a build slice.
6. **Mockup and build stay close.** The built screen uses the mockup's markup, class names and tokens. Check headless at 360, 390, 768 and 1280, light and dark, and list every difference in the PR (5.6).
7. **One service, two surfaces.** The chat tools (MCP) and the UI call the same service methods (owner, 7 October). A slice that adds one adds the other, or says on the review list why not.
8. **Closed vocabulary where logic acts, free text elsewhere** (owner ADR, 5 October). The AI is a sensor; it never infers a safety limit; the person's words are data, never instructions.
9. **Decisions on open points: take the sensible default, list it, refactor later.** The default is in section 3 (or the best reading, said plainly). Every slice's PR adds to the single tracking issue "Preferences build: things to check afterwards" in `kitchie` a short entry: the open point or conflict, the default taken, where in the code it lives, and how to change it. Refactor wishes go on the same issue under a "refactor later" heading. Do not stop work to ask the owner.
10. **Reserved decisions.** Anything that needs the owner's explicit approval and is not covered by his instruction that development proceed on this feature still stops work: a change to the session token claims or the manifest/contract shape, a paid service, a new dependency, any cutover of sign-in, households or members (Platform D8), changes to server or cloud settings, enabling a flag in UAT or production, touching real data. Put it on the review list and carry on with what is not blocked.
11. **Performance and assets** (Kitchie `AGENTS.md`, `DESIGN.md` section 6): the default path is the server-rendered page, the shared stylesheet and deferred versioned scripts; load editors on use; one `ASSET_FILES` line per file; do not remove a lazy-load, cache header or fingerprint.
12. **Secrets.** Never print, log, commit or paste a secret value; name and set-or-unset only. Run the credential scan before every push. Never use real people's names or data in fixtures, docs, logs or PRs (sample names: Arjan, Jo, Sam).
13. **Read-only across repos.** Work only in your slice's repo. If a slice needs something from another repo, build against the interface in 5.2 and put the dependency on the review list; do not edit another repo from your slice. Platform: branch from `uat`, never stack a branch on an unmerged one.
14. **Commit and PR text.** Every commit message ends with these two lines:

    ```
    Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01X9mXLMoS8997Sm3EbLynaE
    ```

    Every pull request description ends with:

    ```
    🤖 Generated with [Claude Code](https://claude.com/claude-code)

    https://claude.ai/code/session_01X9mXLMoS8997Sm3EbLynaE
    ```

    (A later agent session uses its own session link in the same two places.)
15. **Parallel agents.** Many agents work at the same time, all the time. Before editing a shared file, read the current version from `uat`; do not rely on this file's line numbers. If another slice has already added the thing you need, use it.

---

## 7. Confirmation window

**Owner's instruction (10 October 2026, 18:19 Sydney).** Everything agreed is recorded in this repo; development starts soon; the owner confirms the mockup after the push; if he does not confirm within 30 minutes of the last push, building starts without waiting.

Window opens at 2026-10-10 08:13 UTC (10 October 2026, 19:13 AEDT (UTC+1100)); closes 30 minutes later. If the owner has not confirmed the mockup by then, building starts without waiting and deploys to UAT.

How it works:
- "Last push" means the last commit this handoff work pushed to the mockup repo's `main`. The time above is that push, to the minute; the exact time is in the git history of this file.
- Confirmation means a message from the owner that says the mockup is confirmed (or names a change). Silence is not confirmation; it is the trigger for the default.
- A change the owner asks for inside the window goes into the mockup first (straight to `main`, as above) and **restarts nothing** unless he says so: build slices that do not touch the changed screen keep going.
- Building deploys to `uat` only (rule 2). Nothing in this window touches `main`, tags or anything live.

---

## 8. Inconsistencies found

Contradictions are listed here and **not fixed**, except the stale-wording fixes in I-6, which are edits to consolidated notes. Each item says what to do in the build.

| ID | Inconsistency | Build treatment |
|---|---|---|
| I-1 | The three app repos reserve schema and security changes from agent self-merge ("the change needs no decision the owner has reserved (a schema or security change, a paid service...)"). This feature is largely schema (Kitchie 31 to 33, Platform 6) and a role/security surface. The owner's instruction is that agents merge into `uat` and development proceeds. | Read as: the owner's instruction of 10 October covers **this feature's** schema and role changes, inside `uat`. Not covered: contract or claim changes, new dependencies, cutover, flags in UAT or production, anything live. Recorded as a risk; the owner may want to say so in each repo's plan (PL1, RC1 and K0 do). |
| I-2 | Kitchie `AGENTS.md` says in one place "Rebase on the latest target first" (regression guard) and in another "merges `main` into the branch (never rebase, never force-push)". Platform says merge the base. The mockup repo's rule is `git fetch` and rebase before pushing to `main`. | Build repos: merge the base in, never rebase a pushed branch. Mockup repo: rebase before pushing, as the owner's standing rule says. Kitchie's "Rebase" line is read as applying before a branch is pushed. |
| I-3 | Recipe `AGENTS.md`: "Building starts only after the owner approves it on the issue." The owner said building proceeds. | RC1 records the owner's 10 October instruction on the issue; RC2 starts after RC1 merges. |
| I-4 | Platform `AGENTS.md` has two different statements: agents merge their own pull requests into `uat` (section on merging), and "The owner still approves every merge" in the conflict paragraph. | Treated as the first, matching the other two repos and the owner's 8 October decision. Flag for the owner to tidy. |
| I-5 | Platform's pre-production relaxation (D16: agent-authored builds without per-surface approval) "lapses at the first real sign-in, household, data or route a real person uses". The project notes describe production Kitchie moving onto Platform sign-in, so the relaxation may already have lapsed (not checked against the live deployment). | PL1 to PL4 are additive and flagged off, and need no relaxation if the owner's 10 October instruction counts as approval. Check at the review. |
| I-6 | Stale wording: several consolidated notes still said the Most suggestions per day default is 2 (D7), but D20 makes it 3 and the code already is 3 (`DEFAULT_DIALS.daily_cap`). | **Fixed in this commit** (wording only): option B (two places), Option A, Option C (two places) and the index line in `docs/knowledge/README.md` now say 3, citing D20. D7's own line still records 2 as history; the mockup fragment `index.html` still has the old D7 wording in its notes and was **not** changed (no mockup edits). |
| I-7 | Option B's notes say `mine-household.js` is "about 49 KB"; Option C's note said 40 KB. The file is about 74 KB (and `option-c.js` about 45 KB). | Almost all of it is sample data and the "View as" controls; the build's script is separate and measured in each PR. Do not copy the mockup script. |
| I-8 | C-Q12 and the Option C copy say a safety avoidance "asks twice" in one place; the notes say Kitchie's confirm-once rule applies. | One confirmation (3.5). Copy to follow the rule. |
| I-9 | Option C is "awaiting approval" on the mockup index although D1 to D4 and D9 to D14 are locked; Options A and C still show "usually" and "never suggest" as categories, which food F2 and F11 dropped. | Build D-locked behaviour; treat the screens as Option B's layout (K15). "Usually" becomes like (Q-F10), "never suggest" becomes avoid (Q-F2). |
| I-10 | The Option C fragment was not redrawn for D16 to D24 (chips, "Stock level checks", per-place rules, admin role). | K15 follows Option B's fragment where they differ and lists the differences. Optional mockup redraw for the owner. |
| I-11 | `proactivity` is stored and editable but nothing reads it; D21 removes the dial. | Backfilled to a whole-kitchen rule (4.6) so the stored intent is kept; behaviour changes only when K3 reads rules. |
| I-12 | Platform mode has no owner or admin concept: "Only the household owner can change..." relies on Kitchie's own member table, which platform mode does not use (Kitchie issue #420, as the project notes record it). | PL2 and K1 give Platform the role; until K1 lands behind the flag, platform-mode households have no household writer (today's bug stays). |
| I-13 | D6 and D19 say a member may set quiet hours to **None**; the code clears the member's row on None, so the household's hours apply instead. | `quiet_off` stored override in K2. |
| I-14 | D7 says the chat range is 1 to 20; the store and chat accept 0 to 20 and the form takes 1 to 10. | Range 1 to 20 everywhere (K2); a stored 0 reads as "no checks". |
| I-15 | The per-read ceiling `DUE_CHECKS_MAX` is 10, so a limit of 11 to 20 has no effect. | Raised to 20 (K2, Q-V6). |
| I-16 | D18 says the zone is inferred; the code stores a fixed minute offset, which is wrong for half the year in Sydney. | IANA zone name per member (K2). |
| I-17 | Words differ: Kitchie's `web-stock.ts`, `store.ts` and `stock-check-web.test.ts` say "Only the household owner can change..."; D30 says "Household admin", "Founding member". | New copy uses D30's words and the tests move with them (K1). Any outside check that matches the old string (for example a governance rule) is not visible from here and is for the owner to update. |
| I-18 | Boundary contract v1 documents the statement `usually`, and Kitchie's `get_context` returns `do_not_suggest` (stops); the food decisions drop both. | Contract 1.1 is additive (4.3); old inputs mapped (Q-F10); update `boundary-contract.md` in a later docs commit once K10 is built (not done here). |
| I-19 | Role names collide: "Kitchen role" (a label in `member_roles`) versus the household admin role; code has `isHouseholdOwner` and "owner" in Platform (`owner_member_id`). | Keep the data names (they are internal); user-facing words follow D30. The Kitchen role grants nothing. |
| I-20 | The Platform member route requires a Platform **session**; Kitchie's chat tools hold assistant or OAuth tokens, so they cannot ask who is an admin there. | The live write check (`/api/entitlement`) carries `admin`; this is why PL3 adds it there (4.2). |
| I-21 | `docs/knowledge/README.md` says Option B and the food notes are "awaiting approval" while the owner chose B (D15) and decided food F1 to F14. | Treated as chosen and decided (section 1). Wording left as is. |

**Top risks.** (1) The `context_claims` table rebuild in schema 31 (CHECK widening) is the riskiest migration; the fallback is a new table. (2) Reserved-decision wording (I-1, I-3, I-4, I-5) could stop a merge; the owner's instruction is read as covering this feature in `uat`. (3) The admin role needs the Platform side (PL2 to PL3); until it lands, Kitchie in platform mode has no household writer. (4) C-Q6 (who sees a pending record) is the most privacy-sensitive default; review it first. (5) Production households get a behaviour change from the 22:00 to 06:00 default; keep the flag off until the owner has seen UAT.

## 9. 11 Oct owner changes

Owner direction, 11 October 2026 (change request to the Preferences mockups, desktop and mobile). Drawn in `fragments/preferences-mine-household` (Option B), `fragments/preferences-option-c` and `fragments/desktop-profile` (the Settings window); Option A is kept for reference and was not redrawn. Where this section and an older line above disagree, this section wins. Each item marks what the owner said and what is a **Proposal**.

| # | Change | Build note |
|---|---|---|
| 1 | **Preferences is its own section in the desktop Settings window.** It sits in the left list right after Settings. Section keys renumber 1 to 6 (Profile 1, Settings 2, Preferences 3, History 4, Household 5, My data 6); the footer reads "1 to 6 jump to a section". Opening Preferences, the `/settings/preferences` address included, stays inside the window on desktop: no separate full-page layout. Mobile keeps Settings > Kitchen > Preferences. | Kitchie `server/src/assets/profile.js`: add a `preferences` entry to `SECTIONS` and `ORDER` between `settings` and `history` (path `/settings/preferences`), renumber `key`, change `FOOT` from "1 to 5" to "1 to 6"; the shortcuts list follows `ORDER`. A direct visit to `/settings/preferences` at 1024px and wider opens the window on that section; below 1024px it is the phone page. Update `desktop-profile.test.ts` and `browser/desktop-profile.browser.ts` (they assert five sections and "1 to 5"). The Preferences page still renders on its own at phone width, with the Settings back link. |
| 2 | **"Plan the week" leaves the Settings > Kitchen list.** | Kitchie `app.ts` (`renderSettingsPage`, the Kitchen menu): remove the `${base}/plan` row. Plan the week is still reached from **Plan** in the bottom bar on a phone and in the left rail on desktop (`bottom-nav.ts`), and by `/plan`. **Proposal:** the Kitchen list becomes Preferences, Categories, Locations and spots (Preferences in the row Stock checks had, since `/settings/stock-checks` redirects to it); whether a Stock checks row stays beside Preferences is open. |
| 3 | **Household note row on Mine.** Remove the "Open in Household" link and the line "Read next to yours, not instead of it." The **Household** chip is the tap target and goes to the household notes on the Household tab. Keep "Both notes are read. Neither replaces the other." | The chip is a real button (44px high, chevron, accessible name "Household note, open it in the Household tab"). It selects the Household tab and focuses the household note row. A member who is not an admin lands on the read-only note. Rule rows from the household on Mine still have their own "Open in Household" link: the owner named the note row only. **Open:** the same chip treatment for those rows? |
| 4 | **Remove the whole "On this device" block** (Look and display, and its footnote). | It is in Settings already. No data or route change. |
| 5 | **Three lines removed from Mine:** "See Recipe stars and votes under Household"; "Your kitchen role and your assistant are part of your profile, not preferences."; "Open your profile". | Copy only. Kitchen role and My assistant stay on the profile (D24); the profile states are unchanged. |
| 6 | **Household-only rows show only under the Household tab:** Members and admins, Household name, Categories, Locations and spots, Recipe stars and votes, and every "Household only" chip. | Mine renders none of them. The Household tab keeps its group "Only the household has these". |

**Owner silent (Proposal; a wrong guess costs a redraw):** the number keys inside the window (the built window already uses them; the mockup keeps its G-then-letter pairs for the page, with no letter for Preferences); the window loading Preferences in a frame only when first shown (a mockup detail); the rows listed in item 2; the window's Settings section still lists Stock checks and Categories under Kitchen.

**Check list for the builder.** Open Preferences from the window at 1280px: no page layout behind it, Preferences selected, the footer says "1 to 6"; press 3 from another section; press the Household chip on the note as Sam (read-only note) and as Arjan (editable); Mine has no household-only rows; the phone page has no On this device block and keeps the Settings back link; Settings > Kitchen has no Plan the week; Plan still opens from the bottom bar and the rail.

### 11 Oct (2): Settings groups and Preferences on mobile

Owner, voice, 11 Oct 2026, second note. Drawn in `flows/household/app.js` (profile menu, Settings, new Looks screen), `fragments/desktop-profile/profile.js`, `fragments/preferences-mine-household` and `fragments/locations-spots`.

Real labels found first (live `kitchie/server/src/app.ts`, `renderSettingsPage`): **Look** (the theme and display card), **On this phone** (the Install Kitchie row, shown only where installing is possible) and **Kitchen** (Stock checks, Plan the week, Categories, Locations and spots). "Look and display" was the removed On this device row, not a current label.

| # | Change | Build note |
|---|---|---|
| 1 | **Rename the Kitchen group to App.** | `app.ts`: the `<span class="lbl">Kitchen</span>` over the household menu. The footnote reads "Categories and Locations and spots are the household's, not just this device's." |
| 2 | **App is the profile menu group (`/menu`, was "Look and kitchen") and holds Looks first, then Categories, Locations and spots**, flat; the group holds Settings, History, Looks, Categories, Locations and spots in that order (Kitchie PR #586); Settings and History stay where they were. Kitchie has Looks at `/settings/looks` (PR #585). Earlier wording follows: App holds Looks, Categories, Locations and spots, flat (no subgroup; three rows). Looks is the existing theme and display card, now its own screen. | Looks becomes a row that opens the card (today the card sits inline above the list). Stock checks and Plan the week have no row (Plan is in the bottom bar; Stock checks moved into Preferences). Install row ("On this phone") is untouched and not drawn in the mockup. |
| 3 | **Preferences is a top-level section of the mobile profile menu**, after the Settings section and before People, not under Settings or App. Same as the desktop gutter section (mockup 587d6d4). | Profile menu gets a "Preferences" group with one row. The screen's back link goes to the profile menu. `/settings/preferences` address unchanged. |

Closes the "Stock checks beside Preferences" question from section 9 as no row. Not decided: the install row's label, and whether Preferences on phone wants a badge.
