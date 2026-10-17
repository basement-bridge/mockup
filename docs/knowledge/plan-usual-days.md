# Off days: usual days off at two levels, household and person (Kitchie #860)

Status: **mockup only, nothing is built in Kitchie.** Drawn on 17 October 2026, hands-off (the owner asked for no sign-off rounds: every call is either a numbered decision or a **Proposal** with an open question and a recommended answer, for him to review later). Mockup: `fragments/plan-usual-days/` (notes page `index.html`; `desktop.html` and `phone.html` are the live screens). Check: `tools/plan-usual-days-check.mjs` (about 420 checks at 390, 360 and 1280, dark and light). Numbering: decisions are **UD-D1 to UD-D15**, proposals **UD-P1 to UD-P13**.

**Words used throughout (UD-D14):** a day is **open** (cooking possible, drawn unfilled) or **off** (not cooking, drawn filled). **Inherited** is a flag on either value: it came from the household and the person set nothing of their own. It is not a third value. The word is "inherited" everywhere (key, buttons, status lines, tooltips, accessible names, this document); there is no "follows", "same as household" or "pinned".

## What the owner asked (Kitchie #860, voice, 17 Oct 2026, with a screenshot of the desktop Plan "Meal planning" flyout, which is now called **Off days**, UD-D13)

1. A **household level** of usual days off cooking that applies to everyone by default, and keep each person's own setting.
2. **The person wins.** Where a person's own setting disagrees with the household's for a weekday, their own setting wins for them, whether it marks a day off the household has open, or opens a day the household has blocked.
3. **Remove the Categories / Leftovers rename row** from this flyout.
4. **Reuse the pattern from the Home cooking-ideas page work** (its personal-versus-household handling and its flyout layout), and keep consistent with `DESIGN.md`, Kitchie `docs/design-principles.md` and the tokens.
5. Mockup first, then build straight into `uat`; no further sign-off rounds on the mockup, judgment calls recorded as numbered decisions and open questions.

## What exists today (read from Kitchie `uat`, 0.135.0, schema 47)

- The flyout is `settings()` in `server/src/assets/plan-sheet.js`: the title "Meal planning" (to become **Off days**), the sentence "Usual days off cooking. Each week starts with these blocked. Repeating days are set only here; the grid changes one week at a time.", one row of seven weekday buttons per person ("You (Sam)", then "Jane · only Jane can change" read-only), then a CATEGORIES section with a locked "Leftovers" and a Rename button. It is a bottom sheet (`.pw-sheet`) on phone and desktop alike; the settings cog in the Plan header opens it (to become a moon, UD-D15; `plan.phone.js`, `plan.desktop.js` fetch `plan-sheet.js` on first press). The desktop Plan mockup (`fragments/plan-desktop`) draws it as a centred window.
- `plan_stencil (household_id, member_id, weekday)` holds a member's usual days off and can only say off. `plan_blocks (household_id, member_id, date, blocked)` holds one date: blocked (a night out) or cooking (a usual day lifted for that week). A date is blocked when its override says so, else when its weekday is in the stencil (`plan.ts` `isBlocked`, `blockedRange`, `cookingRange`, `setBlock`).
- A personal "open" on a weekday the household blocks has **no place to live** in that model: absence of a row means "nothing said", so "inherited" and "open" would be the same bytes. See Build impact.
- The Home cooking-ideas **Plan it** flyout (Kitchie #757 option F, `desktop-plan-flyout.js` and `.css`, mockup `fragments/plan-day-picker`) is the pattern reused: a right-hand flyout in the lane that slides in over the lane's content, a header with title, one-line sub and an X, small caps section labels, **Who it is for** with Everyone first and then each person, and read-only rows for what is not yours. The personal-versus-household handling reused is the Preferences one (`fragments/preferences-mine-household`, `preferences-principles.md`): the value in force with where it comes from, a first choice (here **"Inherited from the household (value)"**) that drops the person's own value, household things editable by household admins only and read-only for everyone else with one line.

## The design

One flyout, one script, two containers: a **right-hand lane flyout on desktop** (1024px and up, UD-P1) and the **bottom sheet on a phone** (and tablet) it has always been. Inside:

1. Title **Off days** (UD-D13), the existing sentence unchanged, an X on desktop (the phone keeps Done at the foot).
2. **HOUSEHOLD · EVERYONE'S DEFAULT**: seven weekday chips (filled = not cooking), then one line ("Off every Tue and Fri. Everyone inherits this unless they set their own.") and, when anyone's own setting disagrees with it, one more ("Different for you (Fri open, Sun off) and Jane (Wed off)."). Editable by household admins; for a member who is not an admin the same row is read-only with "Only household admins can change this." Tapping a day changes it at once and a status line says who inherits it and whose own setting stays.
3. **YOU (SAM)**: seven chips that show the **effective result** (what you get on that weekday) and where it comes from. Tapping a day opens its **three choices** in place under the row: **Inherited from the household (off)**, **Off every Friday**, **Open every Friday**. One line says what is your own ("Your own: Fri open, Sun off. The rest is inherited from the household.") and an **Inherit all** link clears them all (with Undo).
4. **JANE · ONLY JANE CAN CHANGE** and everyone else: the same chips, read-only, reading the same way (you can see what Jane's own setting is and what she inherits).
5. A four-item key under the rows (only when something is set): the four looks of a chip.

### How a chip is drawn (UD-P3)

Two things are drawn, and they never share a signal. The **value** is the fill: **filled = off, unfilled = open**, on every row, as the days have always read. The **flags** sit on top: a **dashed ring inside the chip = inherited**, a **dot = set by the person**. The household row's chips carry no flag (they are the source). A person's chip is one of four:

| Look | Value | Flag | Fill | Mark |
|---|---|---|---|---|
| Filled, dashed ring inside | **Off, inherited** | inherited | accent | dashed ring |
| Filled, a dot | **Off, set by the person** | own | accent | a dot |
| Unfilled, dashed ring inside | **Open, inherited** | inherited | plain | dashed ring |
| Unfilled, a dot | **Open, set by the person** (opens a household-off day: the person wins) | own | plain | accent dot |

The key under the rows reads the same words: "Off, inherited", "Off, set by the person", "Open, set by the person", "Open, inherited". The ring and the dot are shapes, not colours, so the flag reads without colour, and the fill is the same one the grid has always used. Each chip's accessible name says both ("Friday, open, set by you"; "Tuesday, not cooking, inherited from the household"). Because there is no tint, an inherited-off day and an own-off day are the same fill with a different mark; the previous draft's tint and the 2px accent ring are gone.

### What the person sees, and what wins

Effective result for a person on a weekday, highest first (UD-D1): a one-week change for that date (`plan_blocks`), then the person's own setting for the weekday, then the household's, else open. Examples drawn in the default sample (Tue and Fri are the household's days off): Sam inherits Tue (off, inherited: "Every week, usual day off (inherited)"); Sam opened Fri himself (a plain open night, no tip); Sam is off Sun by his own setting ("Every week, usual day off"); Jane is off Wed by her own setting.

## Decisions (UD-D, stated or following from the owner's words, his standing rules, or the code)

- **UD-D1. The order of precedence is one-week change, then the person's own weekday setting, then the household's.** The person wins in both directions (owner, #860). The one-week override still beats everything, exactly as the code does today.
- **UD-D2. A day is open or off; "inherited" is a flag on either value, and the stored model does not change.** A person has three possible stored states per weekday: nothing (the day is inherited from the household), own off, own open. The effective value is open or off; the flag says whether it was inherited or set by the person. Today's personal list is exactly "own off"; no existing setting changes meaning, nothing is rewritten, and a household with no household days behaves exactly as today. Adopting the open/off plus inherited wording forced no change to the stored model, the precedence (UD-D1) or the build impact below; only words, the chip drawing and the tile subtitle changed.
- **UD-D3. Only household admins change the household row** (owner's standing rule P2, D25 to D28: household things are admin-only; read-only for everyone else with one line, never hidden). The line is the owner's own: "Only household admins can change this." The existing rule for personal rows stays: only that person can change it ("only Jane can change"). Another person's row is visible and read-only, and shows inherited versus own in the same way.
- **UD-D4. The household row is called "Household"** (the owner's word in Plan UI review 201: "Household", not "Everyone") and comes first, above You.
- **UD-D5. The Categories section and its Leftovers rename row are gone from this flyout, on phone and desktop** (one sheet). Nothing is removed from the server: `GET/PATCH /api/plan/categories` and the rename stay. Where it is reached from now is UD-P9.
- **UD-D6. The household never writes a person's own setting.** Changing a household day changes what everyone who inherits it gets; nobody's own choice is edited (owner's standing P1, subject control, and P6, forward-looking changes).
- **UD-D7. Edits save as you tap, as today.** No Save button. The phone sheet keeps Done, the desktop flyout the X.
- **UD-D8. A personal "open" on a household-off weekday is a permanent personal choice and reads in the week as a plain open night.** The tip "Usual day off, cooking this week" stays for what it means today: a usual day lifted for one week only.
- **UD-D9. One markup, one script, the same class names for phone and desktop; only the container differs** (`.ud-*` classes; `usual.css` shared, `lane.css` desktop only, `sheet.css` phone only). DESIGN.md section 7 and the owner's standing rule of 10 October (viewport-specific code in its own file).
- **UD-D10. A removed member has no row.** Their settings never touch anyone else's; restoring them inside the week brings their own settings back (RM-D1); they are erased with them after the week.
- **UD-D11. Keyboard.** S opens the flyout (the Plan's existing key; its help-list line becomes "Off days"), left and right arrows move along a row, Enter opens a day's choices, the first Escape closes the choices and the second the flyout.
- **UD-D12. The Plan header gets no badge** (only the trigger itself changes, UD-D15). Whether a night is blocked by the household or by the person is shown on the night's tile, not in the header (UD-P7).

- **UD-D13. The flyout is titled "Off days"** (owner, 17 Oct 2026, replacing "Meal planning"). The exact text is **Off days**, on phone and desktop, in the dialog variant (`desktop.html?c=dialog`), the page title bar ("Off days on a phone", "Off days on desktop"), the page headings, and the dialog's accessible name (`aria-labelledby` the heading). Entry points that open it use the same name: the trigger's accessible name and tooltip are "Off days" and "Off days (S)", and the keyboard help line is "Off days". The sentence under the title keeps today's copy ("Usual days off cooking. ..."). Where the old title survives: the older `fragments/plan-desktop` and `fragments/plan-week-ai` settings sheets and the Plan UI review headers now say "Off days" too (see Build impact for the real code).
- **UD-D14. One vocabulary: open, off, inherited.** A day is **open** (unfilled) or **off** (filled). **Inherited** is a flag on either, meaning it came from the household and the person set nothing; it is never a third value. Used in the key, the buttons ("Inherit all", the choice "Inherited from the household (off)"), status lines ("Inherited by: Sam and Priya."), hints, tooltips, accessible names, the week tile ("Every week, usual day off (inherited)") and this document. The stored model is unchanged (UD-D2).
- **UD-D15. The trigger is a moon, not the settings cog** (owner, 17 Oct 2026), on phone and desktop, in the Plan header. It is the repo's existing moon (`ic.moon`, the Plan UI review icon set: 24 grid, 2px round stroke, path `M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z`), so no new glyph. Its accessible name is "Off days", its tooltip "Off days (S)". Dark and light both use `currentColor`.

## Proposals (the owner was silent; each has the open question, the recommendation and what a wrong guess costs)

- **UD-P1. On desktop Off days is a right-hand lane flyout (the Home Plan it flyout's shape), not the bottom sheet or a centred window.** Q: do you want that shape? **Recommend yes**: you asked to reuse the flyout layout. A wrong guess costs a container swap only, the content is identical; `desktop.html?c=dialog` draws the same content as the centred window the Plan desktop mockup has today. The phone and tablet keep the sheet.
- **UD-P2. A person changes a day with two taps: the day, then one of three choices.** Q: or one tap that cycles? **Recommend the three choices**: a cycle hides the third state and silently pins a day. A wrong guess costs one extra tap on the most common edit. With nobody to inherit from (a household of one, no household days) a tap is a plain on and off, as today.
- **UD-P3. Filled/unfilled for the value, a dashed inner ring for inherited, a dot for set by the person, and the key (table above).** Q: is "ring = inherited, dot = set" readable at a glance, and is a ring-in-the-chip enough on a 34px-high chip? **Recommend as drawn**: the fill never changes meaning, so the two flags cannot be mistaken for the value. A wrong guess costs a restyle of one block of CSS (tokens only).
- **UD-P4. A household chip changes at once, with no confirm; a status line says who inherits it and whose own setting stays** ("Wednesdays are off for the household. Inherited by: you and Priya. Own setting stays: Jane."). Q: should changing the household's day ask first, since it changes everyone's default? **Recommend no confirm**: the person always wins, so the worst case is a default someone overrides, and it is one tap to put back.
- **UD-P5. A person's own setting that equals the household's is kept as their own (a dot, no ring).** Choosing "Off every Friday" while the household has Friday off stays the person's own, so it holds if the household later opens Friday. Q: or should it collapse to inherited? **Recommend keep**: it is what the person chose, and the dot shows it. A wrong guess costs a day that does not move when the household's does; "Inherited from the household" per day and **Inherit all** for every day undo it.
- **UD-P6. "Inherit all" clears every own day at once, no confirm, with Undo in the status line.** Q: ask first? **Recommend no confirm, with Undo** (the Plan's undo habit).
- **UD-P7. A week tile that is off by inheritance reads "Every week, usual day off (inherited)";** one the person set keeps "Every week, usual day off". The first is a new string (the existing phrase plus the flag word). The Household view's own tiles say "Every week, usual day off" (they are the source, not inherited). Q: add it, or keep the one wording for both? **Recommend add it**: without it a person sees a night blocked that they never set and cannot tell why. A wrong guess costs one string.
- **UD-P8. The Household view of the Plan shows the household's days off as Not cooking.** Today the Household view draws the viewer's own marks, which would leave a household with Fridays off looking open on its own tab. Outside this flyout. Q: yes? **Recommend yes, as slice 2.**
- **UD-P9. Where the Leftovers rename goes.** Not drawn (the owner asked only for its removal here). Options: (a) a protected row "Leftovers (planning)" in Settings, Categories; (b) the Household page; (c) nowhere until asked (the server feature stays). **Recommend (a), household admins only**, because the name is household-wide and the owner's P2 makes household names admin-only. This **collides with today's code** (any member can rename: `PATCH /api/plan/categories/leftovers`, no admin check), so (a) as admin-only is a behaviour change to be confirmed.
- **UD-P10. The Household row is hidden for a household of one with no household days, and shown whenever household days exist** (for example after a member was removed, so the remaining person can see and change what applies to them). Q: always show it? **Recommend as drawn**: with one member the row is noise, and the flyout then equals today's.
- **UD-P11. The plan event for a usual-day change says whose it is** ("Changed the household's usual days off to Tue, Fri" versus the person's). Q: should other members be told (Household activity, Kitchie #110)? **Recommend the wording only**; whether it notifies follows #110's own decision.
- **UD-P12. The line "Different for you (Fri open, Sun off) and Jane (Wed off)" on the household row** (capped at three names, then "and N more"). It makes the person-wins effect visible to the admin who sets the default. Q: keep? **Recommend keep.** A wrong guess costs a line.
- **UD-P13. The moon is also the Plan's "Not cooking" glyph; the header trigger and the tile glyph are the same shape.** The owner asked for a moon on the trigger (UD-D15), so it is drawn. The overlap: on the phone the "Not cooking" tiles, labels and week-header counts already use the moon (`plan.phone.js` lines 56, 66, 123, 143), and the desktop tile does too (`plan.desktop.js` 135, 546). Q: keep the same moon, or tell them apart (for example a moon with a small star, or a filled moon on the trigger)? **Recommend the plain moon as asked**: the trigger is a button in the header with the accessible name and tooltip "Off days", the tile glyph sits inside a tile that says "Not cooking", and the two mean the same thing (a night off). A wrong guess costs one icon swap in two files (the trigger icon is the only change).

## States drawn (`?data=` on both pages; `?as=member` for a non-admin)

| State | Link | What it shows |
|---|---|---|
| Typical (default) | `desktop.html` | Household off Tue, Fri. Sam inherits Tue, opened Fri, is off Sun. Jane is off Wed. Priya inherits everything. |
| Nothing set | `?data=empty` | Household row says "No household days off yet. Tap the days nobody usually cooks." No key, no "Nothing set" on other people's rows (empty is absent), the week is all open. |
| A person sets every day | `?data=everyday` | "Your own on every day. Nothing is inherited." Inherit all clears all; Undo. |
| One member | `?data=solo` | No Household row, no key: the flyout is today's. |
| One member, household days left | `?data=solohh` | The Household row stays so the person can see and change what applies to them. |
| A member removed | `?data=removed` | Jane has no row and no strip entry; nobody else's days change. |
| A member, not an admin | `?as=member` | Household row read-only with "Only household admins can change this." Their own row stays editable. |

## The week grid and the Plan header

The grid reads the **effective** result, so it needs no new idea: a night blocked by the household or by the person is a Not cooking tile; one the person opened is a plain open night. The only addition is the tile's second line (UD-P7). The one-week lift (tap a Not cooking tile to cook this week) is unchanged and still beats everything. Someone else's plan in the strip shows their effective result, view only. The header has no change (UD-D12).

## Build impact (for the build agent)

**Verdict: a no-database-migration encoding exists, but I recommend against it; a schema change (48) is the right shape, and it is small.**

### Why a stencil row cannot hold it
`plan_stencil` rows say "off"; no row says nothing. A household layer needs a second set of weekdays, and a person's "open" on a household-off weekday needs a third place, because "inherited" and "open" would both be "no row". Whole-set override (a non-empty personal list replaces the household's) does not work: a person with no days off who wants Friday open has an empty list, which is the same as "inherited".

### The no-DDL encoding, exactly, and its risks
Rows in the existing tables under values that are not member ids: household days as `plan_stencil` rows with a reserved `member_id` (say `"~household"`), and a personal "open" as `plan_stencil` rows with `member_id = "<member>~open"` (`memberIdOf` accepts any string up to 100 characters, so nothing validates against it). It needs no DDL and no version bump. Risks:

- `planWeek` builds its `members` list from `SELECT DISTINCT member_id FROM plan_stencil` (`plan.ts` about line 1212): both reserved ids would appear as people in the Plan strip, so that read must filter them, and so must every future reader.
- Nothing erases rows keyed by `"<member>~open"` when a member is removed (the removed-members erase works by member id), so personal choices would be left behind after the erase the owner promised.
- The schema stays 47, so **older code runs against the new rows**: after a rollback the phantom people appear and the household days silently stop applying (a household that relied on Fridays off starts planning Fridays). Every earlier bump in `store.ts` (27, 28, 31, 45, 47) takes a version for exactly this reason, even when no DDL changes (27 is JSON in an existing column).
- It overloads a column whose meaning is a person, and the contract tests and fixtures (`server/test/fixtures/schema30.sql`) would have to learn the exception.

### The smallest schema change: schema 48, two new tables, additive, nothing rewritten
Same pattern as 29, 31 and 45 (new tables only, idempotent `CREATE TABLE IF NOT EXISTS`, code older than 48 refuses to start so code and data roll back together):

```sql
CREATE TABLE IF NOT EXISTS plan_household_stencil (
  household_id TEXT NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  PRIMARY KEY (household_id, weekday)
);
CREATE TABLE IF NOT EXISTS plan_stencil_open (
  household_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  PRIMARY KEY (household_id, member_id, weekday)
);
```
`plan_stencil` is unchanged and keeps meaning "this person's own off". No data copy, no backfill: with both tables empty every household behaves exactly as today. A weekday must never be in both `plan_stencil` and `plan_stencil_open` for one member: `setStencil` writes both in one transaction, and a read treats off as winning if both ever exist. Why two tables and not a column on `plan_stencil`: an extra column on the table old code reads would make old code treat "open" rows as "off" (the opposite of the truth); new tables are simply ignored by it. The version is **48**; **#838's Option 2 also needs 48** (only that option, which the owner has not picked), and the factory flow allows one schema change at a time, so whichever is built first takes 48 and the other takes 49. The schema slice is a **guarded lane** change (risk package, the owner merges the schema slice). Risk package line: what could silently change is the blocked nights of every member who has not set their own, once an admin sets household days; until then nothing changes.

### Files that change (Kitchie)
**Server (guarded slice):**
- `server/src/store.ts`: `SCHEMA_VERSION` 47 to 48 and its comment block; `planStencil` / `planSetStencil` (about lines 4237 to 4243) and the event summary.
- `server/src/plan.ts`: the two tables in the plan migration (after `plan_list_links`); one function `usualOff(member, weekday)` (personal off, else personal open, else household) used where `stencilSet` is used today: `isBlocked` (about 576), `blockedRange` (581), `cookingRange` (593), `setBlock` (628 to 650, including the `offer`: unblocking a household-derived usual day offers a personal "open", a new kind `open_usual`; `remove_usual` stays for a person's own off), `stencil` / `setStencil` (654 to 674), `addEntry` and `moveEntry` (910 to 912, 1017), `planWeek` (1212 to 1226). `planWeek` also returns `household_stencil` and `stencil_open` (per member); **keep `stencils[member]` as the effective usual-off weekdays**, so a client that only draws the grid still reads it correctly. Do not add the new tables to the `known` members query.
- `server/src/web-plan-api.ts` (about lines 208 to 218): `GET /api/plan/stencil?scope=household` and `PUT /api/plan/stencil` with `{scope: "household", weekdays}`, behind **`householdWriteAllowed`, the one function every household write calls** (the web layer and any future MCP tool call the same `planSetStencil`; the standing chat-and-UI parity rule). The personal `PUT` gets an optional `open` list (absent leaves the person's open days alone, except days now in `weekdays`). `GET` of a person returns `{member_id, weekdays, open}` and the household list, so one read draws the flyout; the week read already carries every member's rows, so the flyout can draw from it with no extra requests. A refused household write is a new 403 code (a `PlanCode`, `PLAN_STATUS`, the table in `docs/plan-week-api.md`).
- `server/src/inventory-port.ts`, `server/src/event-registry.ts` (the `stencil` kind wording, UD-P11), `server/src/plan-mcp.ts` only if a tool surfaces `offer`.
**Page code (routine slice, `server/src/assets/*`, after the schema slice is merged):**
- `plan-sheet.js` `settings()` (about lines 134 to 176): drop the Categories block, the rename state and handlers (`renaming`, `rn`, `rn-save`, `P.api.categories()` there), add the Household row and the three-choice strip; the row builders become shared between the sheet and the desktop lane. `P.api.renameLeftovers` and `P.api.categories` stay defined for UD-P9.
- `plan.js` (`api.stencil` / `setStencil` 124 to 125, `inStencil` 243), `plan.phone-data.js` (api 163 to 166, `d.stencils[o.me]` at 208, `stencilEdit` 353 to 360: today it adds or removes the weekday in the person's list, which cannot open a household day, so it must write the personal "open"), `plan.phone.js` and `plan.desktop.js` (`settingsShim.toggleUsual`, about 374 and 357; the desktop trigger opens the **lane flyout** instead of the sheet, UD-P1).
- New files, so no other viewport downloads them: `plan-usual.css` (the shared `.ud-*` rules, from `usual.css`), `plan-usual.lane.css` (desktop, from `lane.css`), the sheet rules (from `sheet.css`) with the phone. Copy the mockup's markup and CSS first and list each difference in the PR. The sheet's own CSS lives inline in `web-plan.ts` (deny-listed), so new rules go in the new asset files.
- Docs: `docs/plan-week-api.md` (the stencil section, the `blocked` and `offer` notes), `docs/project-plan.md`.
**Tests:** `server/test/plan.test.ts`, `plan-api.test.ts`, `plan-fake.ts` and `plan-parity.test.ts` (the fake must mirror), `plan-events.test.ts`, a schema-47 fixture beside `schema30.sql` for the migration, and the browser journeys that open the settings sheet (`plan-phone.browser.ts`, `plan-desktop*.browser.ts`, `plan-week.browser.ts`).

### The title and the trigger (UD-D13, UD-D15): where the real code says "Meal planning" and draws the cog
Read from Kitchie `uat` (read-only), commit `6c07619`. The build changes each of these; none was touched here.
- **Title:** `server/src/assets/plan-sheet.js:139` (`<h2>Meal planning</h2>`) becomes `<h2>Off days</h2>`; the same file's `show("", "Usual days", ...)` at line 153 (the sheet's accessible name) becomes "Off days".
- **Cog trigger, the sheet's opener (phone code path in `plan.js`):** `server/src/assets/plan.js:275` (`ICOG`, the cog SVG) is replaced by the moon, and line 369 (`<button class="pw-ib" data-act="stencil" aria-label="Settings, usual days" title="Settings, usual days">`) becomes `aria-label="Off days" title="Off days"`.
- **Desktop:** `server/src/assets/plan.desktop.js:50` (`cog:` in the icon table) is replaced by the existing `moon` at line 54 (`M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z`, already used at 135 and 546), so no new glyph is needed there; line 186 (`aria-label="Settings, usual days" data-tip="Usual days" data-fk="hdr:cog"`) becomes `aria-label="Off days" data-tip="Off days (S)" data-fk="hdr:offdays"` (browser journeys that press `hdr:cog` must follow). The keyboard help list also has the "S" entry; its text becomes "Off days".
- **Phone:** `server/src/assets/plan.phone.js:211` (the header cog, "Plan settings"), `:361` (a comment) and `:684` (`if (d.cog !== undefined) return openSettings();`); `server/src/assets/plan.phone-data.js:33` (`cog: I(...)`). The phone already has a moon (`plan.phone.js` lines 56, 66, 123, 143: the Not cooking labels and counts), so reuse it. The cog stays defined only if something else needs it; otherwise remove it.
- **Other wording that points at it:** the toasts "Usual days are set in Settings." (`plan.js:470`, `plan.desktop.js:669`) should say "Usual days are set in Off days." (UD-D13); that is the only prose entry point besides the trigger. The mockups were changed the same way: `fragments/plan-usual-days` (the page, the heading, the titles), `fragments/plan-desktop/plan.js` (the header button, the help line, the dialog title), `fragments/plan-week-ai/index.html` (the sheet and its trigger), `fragments/plan-ui-review/phone.js` and `desktop.js` (the header button's icon and name).

### Performance (DESIGN.md section 6)
Mockup default path: the page, `theme.css`, `shared.css`, three small stylesheets and two scripts (the flyout script is about 16 KB, the stand-in page's about 9 KB); the screenshots in the notes page are lazy and load nothing for the flyout pages. In the build nothing is added to the Plan page load: `plan-sheet.js` and the new CSS load on the first press of the trigger, as today, and the week read the Plan already makes carries everyone's rows, so the flyout asks for nothing more.

### Test data (the owner's standing rule on test and seed data)
Seeds need the real shapes: a household with household days and no own settings; a person who opens a household day; a person who sets every day; a household of one with household days left; a removed member with own settings. Say plainly what was only reasoned and not run.

## Open items, in one place
UD-P1 to UD-P13 above. The one with a **collision** with today's code is UD-P9 (admin-only rename). The one that needs the owner's eye first is UD-P1 (the desktop container), because it changes where the Off days flyout lands. UD-P13 (the moon is also the Not cooking glyph) is the one the owner may want to see in a screenshot.
