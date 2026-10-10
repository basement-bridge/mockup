# Preferences: what the code records at person and household level, and Option B (Mine and Household)

Status: mockup awaiting the owner's approval (10 Oct 2026). Nothing here is decided. Mockup: `fragments/preferences-mine-household/` (`index.html`, `mine-household.css`, `mine-household.js`, and the viewport files `mine-household-600.css`, `mine-household-1024.css`). Written next to the other agent's Option A; the two options are drawn from the same facts.

Source: the owner believes preferences are recorded at the person (member) level as well as the household level. This was checked in the code on the default branches of `basement-bridge/recipe`, `kitchie` and `platform` (read only, 10 Oct 2026).

## The owner's belief, checked

- **True for Kitchie.** Stock-check settings and notes live at both levels. Food statements live at both levels. Several things are person only.
- **Not true for Recipe.** Stars, votes and usage are one record per recipe or variation, with no member on it. They are household-wide.
- **Not applicable to Platform.** Platform stores no preferences.
- "Person overrides household" is true only for the stock-check settings. Notes and food statements are added together. Many things have one scope only.

## Data-model facts

F1. **Recipe** (`server/src/preferences.ts`, `schema.ts`, `mcp.ts`). A preference is `starred` (true or false), `vote` (-1, 0 or 1), `times_used` and `last_used`, keyed by (recipe or variation, id). The table has no household column and no member column: the household comes from the recipe's own row (plan Q32). One record per recipe per household. MCP tools `set_preference` (starred and vote) and `record_usage`; each write is re-checked live against platform. The session carries the person (`subject`) but nothing uses it for preferences. No web screen reads or writes them.

F2. **Kitchie stock-check settings** (`store.ts` `stock_prefs`, `stock.ts`). Keys and values: `enabled` on or off; `proactivity` quiet, normal or helpful; `quiet_start` and `quiet_end` as HH:MM; `daily_cap` 0 to 20 (the web form takes 1 to 10); `tz_offset_minutes` -720 to 840. Stored at scope `household` or `member`. The value in force is resolved key by key: built-in default, then the household's, then the member's own (`dialsFor`), and the store says which one each came from (`dial_sources`). Clearing a value deletes the row, so the next level down applies.

F3. **Notes** (`notes` table). A household note and a member note, up to 600 characters, kept as data and never read as an instruction. Both are read; neither replaces the other. A member's note is private: another member's is never read.

F4. **Who can change what.** A member changes their own (web Stock checks page, MCP `stock_settings`, personal link only; the shared link refuses). A household-wide setting or note needs the household owner, who is the longest-standing member (`isHouseholdOwner`; the next-longest takes over if the owner leaves). A non-owner sees a read-only list on the web and gets a 403 on a write. The MCP tool cannot write household settings at all. In platform mode `isOwner` is `false` when Kitchie's own sign-in is off (`app.ts`); I read that as nobody being owner there. Not confirmed by running it. Platform keeps its own `households.owner_member_id` (the creator, schema 5, Kitchie issue #322); Kitchie does not read it.

F5. **Stops and snoozes** (`stock_stops`). Per member for an area, a category or everything. A stop on one item covers every member. The type says `member_id` null means the household, but `addStop` always records the setter.

F6. **Food statements** (`context.ts`, `context-mcp.ts`: `get_context`, `give_feedback`; personal link only; no web page). Statement is likes, dislikes, avoids, usually, fact or stop ("never suggest"). Avoids carry `severity` hard or soft and `reason` safety or other. Optional meal time and day type. Each is for `me` or `household` (member_id null). They are added together: `get_context` returns the member's own plus the household's, or the household's only when asked for the household. Avoidances are always returned. Nothing checks for the owner when a member says something for the household, or retires a household statement. A safety avoidance is not removed or weakened until the person confirms once. A stop retires a like of the same scope only.

F7. **Person only:** My assistant (claude, chatgpt, gemini, other, none; `stock_prefs` key `assistant`), kitchen role (icon, title, tagline), name and picture, the plan's usual days off and blocked dates (only the member edits their own).

F8. **Household only:** household name, categories, locations and spots, starter items, and entitlement (platform decision D4).

F9. **Device only:** theme (cookie), item name size, emoji, motion and the display switches (browser storage). They do not follow the person to another phone, except the theme and emoji cookies the server reads for first paint.

F10. **Platform** stores no preferences. Its session token has `sub`, `household`, `products`, `iat`, `exp` and an optional `name`.

## Open questions (for the owner; none is decided)

1. **Recipe stars and votes are household-wide.** If the owner wants a star or vote per person, Recipe's data needs a member on the record, and a rule for what the household-level value means then. A wrong guess costs a schema change in Recipe (owner approval).
2. **Who is the owner in platform mode?** Kitchie's longest-standing member, platform's creator, or something else. Today Kitchie appears to treat nobody as owner there.
3. **Should household food statements need the owner, as household settings do?**
4. **Should anything be lockable by the household** so a member cannot override it? The model has no lock.
5. **Most suggestions per day:** 0 to 20 in the store, 1 to 10 in the form.
6. **No operation moves a food statement between Just you and Everyone.** It is said again for the other scope.
7. **Where the screen lives:** Settings > Preferences next to Stock checks, or in place of it.

## Option B: Mine and Household as two sections (awaiting approval)

What it draws. One Preferences screen with two tabs.

- **Mine.** Stock checks (the five settings), notes (your note, and the household note read beside it), food (your statements and the household's, chips Just you and Everyone), assistant and kitchen role (Only you), not asking about, and a device row. Each stock row shows the value in force, a chip (Yours, Household or Built-in), and for an overridden row what the household says. Choosing Same as household clears the override.
- **Household.** The same five rows as defaults, the household note, food for everyone, and the household-only items (name, categories, locations and spots, Recipe stars and votes, chip Household only). The founding member edits. Everyone else sees a read-only list, with the line saying who can change it.

States drawn: inherited from household, overridden by person, built-in, household only, empty (nothing set yet), and read-only (the one read-only rule the code has: non-owner on household stock settings).

Proposals (the owner did not say these; a wrong guess costs a redraw):

- B-P1. Two tabs, Mine first.
- B-P2. Rows save as you choose, with no Save button (Kitchie's page has Save buttons today).
- B-P3. Chip words: Yours, Household, Built-in, Only you, Everyone, Household only, This device.
- B-P4. "Founding member" (People mockup) for what Kitchie's page calls household owner.
- B-P5. A web list of food statements with Stop remembering this (no web page exists today).
- B-P6. Never show how many members override a household value (the code cannot say, and another member's choices stay theirs).
- B-P7. A new control, the source chip and preference row, is added to the shared styles if Option B is picked.

Numbering: these are B-P labels, not decision numbers, because the owner has decided nothing. Decision numbers continue after the other option's if and when the owner decides.

Performance (DESIGN.md section 6): default path is the page, `mine-household.css` (about 11 KB), `mine-household.js` (about 34 KB), no images, no requests, nothing stored. `mine-household-600.css` (tablet and up) and `mine-household-1024.css` (desktop) are separate files applied by a media attribute, so phone code is never mixed with them. Editors are drawn when a row is tapped.

Mockup and build stay close: the screen reuses Kitchie's `.sp`, `.mtop`, `.mbody`, `.card`, `.sgroup`, `.seg2`, `dl.facts`, `ul.stops` rules as they are in `sub-screen.ts` and `layout.ts`; only `.prow`, `.pbtn`, `.src`, `.popt`, `.ped`, `.frow` and `.empty` are new.
