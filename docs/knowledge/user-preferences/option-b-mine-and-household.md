# Preferences: what the code records at person and household level, and Option B (Mine and Household)

Status: mockup awaiting the owner's approval (10 Oct 2026). Option B itself and B-P1 to B-P7 are not decided. The exception is D5 to D8 below, which the owner locked later on 10 October 2026 (voice) and which the mockup follows. Mockup: `fragments/preferences-mine-household/` (`index.html`, `mine-household.css`, `mine-household.js`, and the viewport files `mine-household-600.css`, `mine-household-1024.css`). Written next to the other agent's Option A; the two options are drawn from the same facts.

Source: the owner believes preferences are recorded at the person (member) level as well as the household level. This was checked in the code on the default branches of `basement-bridge/recipe`, `kitchie` and `platform` (read only, 10 Oct 2026).

## The owner's belief, checked

- **True for Kitchie.** Stock-check settings and notes live at both levels. Food statements live at both levels. Several things are person only.
- **Not true for Recipe.** Stars, votes and usage are one record per recipe or variation, with no member on it. They are household-wide.
- **Not applicable to Platform.** Platform stores no preferences.
- "Person overrides household" is true only for the stock-check settings. Notes and food statements are added together. Many things have one scope only.

## Data-model facts

F1. **Recipe** (`server/src/preferences.ts`, `schema.ts`, `mcp.ts`). A preference is `starred` (true or false), `vote` (-1, 0 or 1), `times_used` and `last_used`, keyed by (recipe or variation, id). The table has no household column and no member column: the household comes from the recipe's own row (plan Q32). One record per recipe per household. MCP tools `set_preference` (starred and vote) and `record_usage`; each write is re-checked live against platform. The session carries the person (`subject`) but nothing uses it for preferences. No web screen reads or writes them.

F2. **Kitchie stock-check settings** (`store.ts` `stock_prefs`, `stock.ts`). Keys and values: `enabled` on or off; `proactivity` quiet, normal or helpful; `quiet_start` and `quiet_end` as HH:MM; `daily_cap` 0 to 20 in the store (the web form takes 1 to 10; D7 makes both 1 to 20, default 2); `tz_offset_minutes` -720 to 840. Stored at scope `household` or `member`. The value in force is resolved key by key: built-in default, then the household's, then the member's own (`dialsFor`), and the store says which one each came from (`dial_sources`). Clearing a value deletes the row, so the next level down applies.

F3. **Notes** (`notes` table). A household note and a member note, up to 600 characters, kept as data and never read as an instruction. Both are read; neither replaces the other. A member's note is private: another member's is never read.

F4. **Who can change what.** A member changes their own (web Stock checks page, MCP `stock_settings`, personal link only; the shared link refuses). **Today** a household-wide setting or note needs the household owner, who is the longest-standing member (`isHouseholdOwner`; the next-longest takes over if the owner leaves). A non-owner sees a read-only list on the web and gets a 403 on a write. **D5 removes this: any member may write them.** The MCP tool cannot write household settings at all. In platform mode `isOwner` is `false` when Kitchie's own sign-in is off (`app.ts`); I read that as nobody being owner there. Not confirmed by running it. Platform keeps its own `households.owner_member_id` (the creator, schema 5, Kitchie issue #322); Kitchie does not read it.

F5. **Stops and snoozes** (`stock_stops`). Per member for an area, a category or everything. A stop on one item covers every member. The type says `member_id` null means the household, but `addStop` always records the setter.

F6. **Food statements** (`context.ts`, `context-mcp.ts`: `get_context`, `give_feedback`; personal link only; no web page). Statement is likes, dislikes, avoids, usually, fact or stop ("never suggest"). Avoids carry `severity` hard or soft and `reason` safety or other. Optional meal time and day type. Each is for `me` or `household` (member_id null). They are added together: `get_context` returns the member's own plus the household's, or the household's only when asked for the household. Avoidances are always returned. Nothing checks for the owner when a member says something for the household, or retires a household statement (and D8 keeps it so). A safety avoidance is not removed or weakened until the person confirms once. A stop retires a like of the same scope only.

F7. **Person only:** My assistant (claude, chatgpt, gemini, other, none; `stock_prefs` key `assistant`), kitchen role (icon, title, tagline), name and picture, the plan's usual days off and blocked dates (only the member edits their own).

F8. **Household only:** household name, categories, locations and spots, starter items, and entitlement (platform decision D4).

F9. **Device only:** theme (cookie), item name size, emoji, motion and the display switches (browser storage). They do not follow the person to another phone, except the theme and emoji cookies the server reads for first paint.

F10. **Platform** stores no preferences. Its session token has `sub`, `household`, `products`, `iat`, `exp` and an optional `name`.

## Locked owner decisions (voice, 10 October 2026)

Numbered D5 to D14 across options A, B and C in the order the owner gave them (D1 to D4 are Option C's C-D1 to C-D4). The four that apply to this option are D5 to D8; D9 to D14 are Option C's. D5 and D8 were revised by the owner after they were first stated; only the revised versions are recorded here.

- **D5** Household-level settings and edits: **any** household member may edit them. There is no "owner" concept, no tenure gate and no restriction. The owner explicitly **deferred** any earn-your-way, tenure-based gating to a later decision. That is deliberate, not forgotten: it is not built into the mockup or the notes. Settles old Q2 (who is the owner in platform mode): there is no owner.
- **D6** Quiet hours: any member may personally override the household's quiet hours down to **none** for themselves. No restriction. Partly answers the "lockable" question below: quiet hours are not lockable.
- **D7** Most suggestions per day: **1 to 20**, default **2**, in the web form (was 1 to 10) and in chat (was 0 to 20). Settles old Q5.
- **D8** Household-level food claims are open to **any** member, consistent with D5. Person-level food statements stay unrestricted. Settles old Q3.

Meta-pattern (the owner's): person level, the person edits freely, no gate; household level, also no gate for now (any member), with a tenure / earn-your-way gate explicitly deferred. See `../preferences-principles.md` P2.

### What D5 to D8 imply for the model and the code (not built)

- **Kitchie form and chat:** Most suggestions per day is 1 to 20 in both (was 1 to 10 in the form, 0 to 20 in the store and chat); the built-in default is 2 (was 3).
- **Kitchie household writes:** remove the household-owner check (`isHouseholdOwner`, the 403) from household stock settings and the household note. Any member writes them. No tenure check is added.
- **Quiet hours:** a member's explicit "none" must be stored as a value that overrides the household's (today "none" clears the member's value, so the household's applies), and `dial_sources` must report it as the member's own.
- **Household food claims:** unchanged, open to any member.
- **Platform:** `owner_member_id` is not needed for preferences.

## Open questions (for the owner)

Old questions Q2, Q3 and Q5 are settled by D5, D8 and D7 and are removed. The others keep their numbers (Q1, Q4, Q6, Q7), so nothing is renumbered.

- (Q1) **Recipe stars and votes are household-wide.** If the owner wants a star or vote per person, Recipe's data needs a member on the record, and a rule for what the household-level value means then. A wrong guess costs a schema change in Recipe (owner approval).
- (Q4) **Should anything be lockable by the household** so a member cannot override it? The model has no lock. (Quiet hours are decided: a member may set none for themselves, D6. Nothing else is decided.)
- (Q6) **No operation moves a food statement between Just you and Everyone.** It is said again for the other scope.
- (Q7) **Where the screen lives:** Settings > Preferences next to Stock checks, or in place of it.

## Option B: Mine and Household as two sections (awaiting approval)

What it draws. One Preferences screen with two tabs.

- **Mine.** Stock checks (the five settings), notes (your note, and the household note read beside it), food (your statements and the household's, chips Just you and Everyone), assistant and kitchen role (Only you), not asking about, and a device row. Each stock row shows the value in force, a chip (Yours, Household or Built-in), and for an overridden row what the household says. Choosing Same as household clears the override.
- **Household.** The same five rows as defaults, the household note, food for everyone, and the household-only items (name, categories, locations and spots, Recipe stars and votes, chip Household only). Any member edits (D5), and a line says so. There is no read-only state.

States drawn: inherited from household, overridden by person (quiet hours can be overridden to none, D6), built-in, household only, and empty (nothing set yet).

Proposals (the owner did not say these; a wrong guess costs a redraw):

- B-P1. Two tabs, Mine first.
- B-P2. Rows save as you choose, with no Save button (Kitchie's page has Save buttons today).
- B-P3. Chip words: Yours, Household, Built-in, Only you, Everyone, Household only, This device.
- B-P4. (Superseded by D5.) "Founding member" (People mockup) for what Kitchie's page calls household owner. The Household tab has no owner, so the word is not used there. Number kept.
- B-P5. A web list of food statements with Stop remembering this (no web page exists today).
- B-P6. Never show how many members override a household value (the code cannot say, and another member's choices stay theirs).
- B-P7. A new control, the source chip and preference row, is added to the shared styles if Option B is picked.

Numbering: these are B-P labels, not decision numbers. Owner decisions are D1, D2, ... across options A, B and C (D5 to D14 on 10 October 2026, see above). B-P numbers are not renumbered.

Performance (DESIGN.md section 6): default path is the page, `mine-household.css` (about 11 KB), `mine-household.js` (about 34 KB), no images, no requests, nothing stored. `mine-household-600.css` (tablet and up) and `mine-household-1024.css` (desktop) are separate files applied by a media attribute, so phone code is never mixed with them. Editors are drawn when a row is tapped.

Mockup and build stay close: the screen reuses Kitchie's `.sp`, `.mtop`, `.mbody`, `.card`, `.sgroup`, `.seg2`, `dl.facts`, `ul.stops` rules as they are in `sub-screen.ts` and `layout.ts`; only `.prow`, `.pbtn`, `.src`, `.popt`, `.ped`, `.frow` and `.empty` are new.
