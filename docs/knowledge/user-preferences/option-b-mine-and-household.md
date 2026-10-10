# Preferences: what the code records at person and household level, and Option B (Mine and Household)

Status: mockup awaiting the owner's approval (10 Oct 2026). Option B itself and B-P1 to B-P7 are not decided. The exceptions are the decisions the owner locked later on 10 October 2026 (voice): D5 to D8, and then, in a later session that day, D25 to D30 (the household admin role), which **supersede D5 and D8** and which the mockup follows. Mockup: `fragments/preferences-mine-household/` (`index.html`, `mine-household.css`, `mine-household.js`, and the viewport files `mine-household-600.css`, `mine-household-1024.css`). Written next to the other agent's Option A; the two options are drawn from the same facts.

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

F4. **Who can change what.** A member changes their own (web Stock checks page, MCP `stock_settings`, personal link only; the shared link refuses). **Today** a household-wide setting or note needs the household owner, who is the longest-standing member (`isHouseholdOwner`; the next-longest takes over if the owner leaves). A non-owner sees a read-only list on the web and gets a 403 on a write. **D5 removed this (any member may write them), and D5 is now superseded: D28 says only household admins may, so the owner check is replaced by an admin check.** The MCP tool cannot write household settings at all. In platform mode `isOwner` is `false` when Kitchie's own sign-in is off (`app.ts`); I read that as nobody being owner there. Not confirmed by running it. Platform keeps its own `households.owner_member_id` (the creator, schema 5, Kitchie issue #322; nullable: null for older and seeded households). In platform mode Kitchie reads it as `ownerId` from platform's member call (`platform-member.ts`), and only that owner may remove other members there. In Kitchie's own sign-in mode the founding member is derived (`isHouseholdOwner`, the earliest `created_at`; the next-longest takes over if they leave; they cannot be removed). Neither source is a stored role. **Kitchie has no role column and platform's session token has no role claim** (`sub`, `household`, `products`, `iat`, `exp`, optional `name`).

F5. **Stops and snoozes** (`stock_stops`). Per member for an area, a category or everything. A stop on one item covers every member. The type says `member_id` null means the household, but `addStop` always records the setter.

F6. **Food statements** (`context.ts`, `context-mcp.ts`: `get_context`, `give_feedback`; personal link only; no web page). Statement is likes, dislikes, avoids, usually, fact or stop ("never suggest"). Avoids carry `severity` hard or soft and `reason` safety or other. Optional meal time and day type. Each is for `me` or `household` (member_id null). They are added together: `get_context` returns the member's own plus the household's, or the household's only when asked for the household. Avoidances are always returned. Nothing checks for the owner when a member says something for the household, or retires a household statement (and D8 keeps it so). A safety avoidance is not removed or weakened until the person confirms once. A stop retires a like of the same scope only.

F7. **Person only:** My assistant (claude, chatgpt, gemini, other, none; `stock_prefs` key `assistant`), kitchen role (icon, title, tagline), name and picture, the plan's usual days off and blocked dates (only the member edits their own).

F8. **Household only:** household name, categories, locations and spots, starter items, and entitlement (platform decision D4).

F9. **Device only:** theme (cookie), item name size, emoji, motion and the display switches (browser storage). They do not follow the person to another phone, except the theme and emoji cookies the server reads for first paint.

F10. **Platform** stores no preferences. Its session token has `sub`, `household`, `products`, `iat`, `exp` and an optional `name`.

## Locked owner decisions (voice, 10 October 2026)

Numbered D5 to D14 across options A, B and C in the order the owner gave them (D1 to D4 are Option C's C-D1 to C-D4). The four that apply to this option are D5 to D8; D9 to D14 are Option C's. D5 and D8 were revised by the owner after they were first stated; only the revised versions are recorded here.

- **D5** *SUPERSEDED 10 Oct 2026 by D25 to D28.* Household-level settings and edits: **any** household member may edit them. There is no "owner" concept, no tenure gate and no restriction. The owner explicitly **deferred** any earn-your-way, tenure-based gating to a later decision. That is deliberate, not forgotten: it is not built into the mockup or the notes. Settles old Q2 (who is the owner in platform mode): there is no owner. *Superseded because the owner, in a later voice session the same day, introduced the household admin role: household-level edits are now admin only. The text above is kept as given. Old Q2 is open again in a new form: the founding member (D26) is the creator in platform mode, and how the two modes agree is Q-R7 below.*
- **D6** Quiet hours: any member may personally override the household's quiet hours down to **none** for themselves. No restriction. Partly answers the "lockable" question below: quiet hours are not lockable.
- **D7** Most suggestions per day: **1 to 20**, default **2**, in the web form (was 1 to 10) and in chat (was 0 to 20). Settles old Q5.
- **D8** *SUPERSEDED 10 Oct 2026 by D28.* Household-level food claims are open to **any** member, consistent with D5. Person-level food statements stay unrestricted. Settles old Q3. *Superseded for the same reason as D5: only admins record or retire household-level food claims now. Person-level statements stay unrestricted (D29).*

Meta-pattern (the owner's): person level, the person edits freely, no gate. Household level was first "also no gate for now (any member)" with a tenure / earn-your-way gate deferred; the later session replaced that with a binary household admin role (D25 to D30, next section). The tenure gate is still deferred. See `../preferences-principles.md` P2.

### What D5 to D8 implied for the model and the code (not built; the household write rules are now replaced by D25 to D30, see the next section)

- **Kitchie form and chat:** Most suggestions per day is 1 to 20 in both (was 1 to 10 in the form, 0 to 20 in the store and chat); the built-in default is 2 (was 3).
- **Kitchie household writes:** ~~remove the household-owner check (`isHouseholdOwner`, the 403) from household stock settings and the household note; any member writes them~~ superseded: the owner check is replaced by an admin check (D28). No tenure check is added.
- **Quiet hours:** a member's explicit "none" must be stored as a value that overrides the household's (today "none" clears the member's value, so the household's applies), and `dial_sources` must report it as the member's own.
- **Household food claims:** ~~unchanged, open to any member~~ superseded: only admins record or retire them (D28).
- **Platform:** ~~`owner_member_id` is not needed for preferences~~ superseded: it is the natural source of the founding member (D26), see the next section.


## Household admin role (owner, voice, 10 October 2026, later session): D25 to D30

The first time roles are introduced. Recorded as given. D25 to D30 are numbered from the block reserved for this work (D15 to D24 are other decisions of that day and are recorded elsewhere). **They supersede D5 and D8**, which stay in the section above with their text and history. The owner's wording is the first line of each; anything after it is a reading and is marked.

- **D25** A **household admin** role, binary for now: a member is an admin or is not. Only admins may change household-level things. This is the first role in the product. The owner wants the rule **blanket**, so the role can evolve. *Supersedes D5 and D8.* Tenure and earn-your-way gating, and any finer role, stay **deferred** (not decided, not forgotten, not built in).
- **D26** The **founding member**, the person who first set up the household, is an admin **by default**.
- **D27** The founding member decides whether anyone else is an admin: they can **grant admin to other members, per person, and revoke it**. *Reading (the owner's direction names only the founding member): the mockup gives the grant and revoke controls to the founding member alone; whether admins share them is Q-R1.*
- **D28** **Only admins** may change household-level things: household settings (the stock-check defaults), household-level food claims and rules, household notes, the household quiet-hours default, and the like. **Non-admins may not.** *Reading: "and the like" also covers the household's categories, locations and spots and the household name, which are drawn as household only (not drawn in this option); Recipe stars and votes are not named and the mockup does not change them (Q-R8).*
- **D29** **Personal preferences are ungated for everyone**, whatever their role, including overriding the household's quiet hours down to **none** for themselves (D6 stands). **Proposing** a preference for another member (Option C, D9) is **unchanged**: any member may propose. Roles gate only household-level values. A proposal is written on the subject's own record (C-D2), so it is never a household-level write.
- **D30** **Kitchen role is separate.** "Kitchen role" (a free personal profile field, for example cook or shopper) stays a free, self-editable label and does not grant anything; the other work moves it to the profile. The screens and notes use different words so the two are not confused: **Household admin** (and **Admin**, **Founding member**, **Member**) for the role, **Kitchen role** for the label.

"Household notes are editable by any member, no owner gate" (a relayed note) predates D25 and is superseded: household notes are admin-editable.

### What the mockup draws (Option B first, then A and C)

- **Household tab, a member who is not an admin:** every household value is read-only. A line at the top, "Only household admins can change this. You can still change everything on Mine.", and the same reason inside each opened row, with who the admins are and a link to Members and admins. Closed rows still show the value and its chip. The stock-check defaults, the household note, the household's food rules and the category's attached recipes are read-only. Hidden controls are not enough: the writes behind them also refuse (the mockup's single check, `isAdmin`).
- **Household tab, an admin or the founding member:** editable as before; the top line says which they are.
- **Mine, for everyone:** unchanged and fully editable, including quiet hours to none. The household's rows on Mine (food, the household note) open read-only for a member who is not an admin.
- **Members and admins** (new, a row under "Only the household has these"): one row per member, a chip (Founding member, Admin, Member), one line on what that means, and for the founding member only a Make admin or Remove admin button per person. The founding member's own row has no button (always an admin). A member who is not the founding member sees the same list without buttons and the line "Only the founding member can make someone an admin, or take it back." A change shows at once with a line ("Sam is now a household admin."); there is no confirmation step (**Proposal**).
- **Option A:** a "Your role" control on the page stands in for who is looking; on the Household side of a row a non-admin sees the value and the line. A has no Members view.
- **Option C:** the Household tab's food rows, and the Everyone rows on Mine, are read-only for a member who is not an admin. Proposing is unchanged for every role.
- The sample household: Arjan (founding member), Jo (admin, granted by Arjan), Sam (member).

States drawn in B: founding member, an admin, a plain member (Sam), on the Household tab and in Members and admins; read-only stock row, note and food rule.

### What the decisions imply for the model and the code (not built)

- **Roles on household members.** Kitchie `members` has no role. Add a role on the member (admin or not) as the one stored fact, and keep it binary (D25). In platform mode membership is platform's, so which service stores the role is open (Q-R7).
- **Founding member flag.** Today the founding member is derived, not stored: Kitchie's `isHouseholdOwner` is the longest-standing member, and platform has `households.owner_member_id` (the creator; null for older and seeded households). D26 needs the founding member to be an admin by default: either read the same derived value or store a flag set once when the household is created (platform already does), and decide what happens when they leave (Q-R2). Seed rule for existing households (**Proposal**): the current longest-standing member becomes founding member and admin, everyone else is a member.
- **Admin grant and revoke.** Two operations, `grant_admin(member)` and `revoke_admin(member)`, both refused unless the caller is the founding member (reading of D27), both refused on the founding member as target (they stay admin), refused for a target outside the household, and recorded with who and when (**Proposal**: like `member_removals`, so the change can be answered for later). One service behind them; the web page and any chat tool call the same methods (as the food rework already requires, food F10).
- **Gating household writes in the UI and in MCP.** One check, "may this member change household-level values", in the service layer, called by every household write: the web stock-settings household form and household note (replacing `isHouseholdOwner`, the 403 message becomes "Only household admins can change this. Nothing was changed."), household food claims through `give_feedback` with `who: household` and the new web Food card (today any member can write or retire one; that check is new), and any future household write, including the MCP `stock_settings` tool if it ever writes household values. UI and MCP call the same service methods, so a hidden control is never the only guard. The UI reads the same check to draw read-only.
- **Personal writes ask for nothing.** No role check on a member's own settings, note, food statements, assistant or stops, and none on a proposal for another member (it is written on the subject's own record). A member's explicit quiet hours of none still needs to be stored as an override of the household's (D6, above).
- **Session and token.** Platform's session token carries no role. If a Recipe write is ever gated (Q-R8), either the token gets a role claim or Recipe asks platform live, as it already does for entitlement.
- **Open ends in today's code.** Kitchie's remove-member refuses the founding member and lets any member remove others; platform's remove call is owner only. Whether removing members becomes admin-only is Q-R1.

### Open questions on the role (for the owner)

Numbered Q-R so the earlier Q1 to Q7 are not renumbered. The mockup draws the reading given.

- **Q-R1** Do admins have exactly the founding member's rights, or does the founding member keep exclusive rights (granting and revoking admin, removing members)? *Drawn: grant and revoke are the founding member's alone; removing members is not changed.* A wrong guess costs a redraw of the Members view and a different rule in the service.
- **Q-R2** Can the last admin be removed or step down? What happens to admin if the founding member leaves (the next-longest member becomes founding member today)? *Drawn: the founding member cannot step down and cannot be removed; nothing is drawn for them leaving.* A wrong guess can leave a household with nobody who may change it, so decide before building.
- **Q-R3** What does a non-admin see? *Drawn: the household value, read-only, with "Only household admins can change this." The alternative is hiding household rows from non-admins.* They already affect the non-admin's own results, so seeing them seemed right.
- **Q-R4** Who can see who is an admin? *Drawn: every member (the list, and the reason line names the admins).* The alternative is admins only.
- **Q-R5** Household values already set when roles arrive. *Drawn: they stay as they are, now changed by admins only.* Do existing households need a notice, or an admin chosen before anything is locked?
- **Q-R6** Does the household quiet-hours default need an admin? *Drawn: yes, as the owner listed it with the household-level things; the member's own quiet hours, including none, stay ungated (D6, D29).* The question is on the owner's list, so confirm.
- **Q-R7** (raised by this change, not by the owner) Where is the role stored and which owner wins when Kitchie's own sign-in and platform disagree about who the founding member is? A wrong guess costs a schema change in Kitchie or platform.
- **Q-R8** (raised by this change) Do Recipe stars and votes count as household-level things? They are household-wide and any member sets them today. *Drawn: unchanged, no gate.*
- **Q-R9** (raised by this change) A household-level safety claim (a household allergy) now needs an admin to record it. Should a non-admin be able to say it, taking effect at once under P4, or propose it for an admin to confirm? Principles P2 and P3 list this as an unsettled tension; no option draws a household proposal.

## Open questions (for the owner)

Old questions Q2, Q3 and Q5 are settled by D5, D8 and D7 and are removed (D5 and D8 are now superseded; their open ends are Q-R1 to Q-R9 above). The others keep their numbers (Q1, Q4, Q6, Q7), so nothing is renumbered.

- (Q1) **Recipe stars and votes are household-wide.** If the owner wants a star or vote per person, Recipe's data needs a member on the record, and a rule for what the household-level value means then. A wrong guess costs a schema change in Recipe (owner approval).
- (Q4) **Should anything be lockable by the household** so a member cannot override it? The model has no lock. (Quiet hours are decided: a member may set none for themselves, D6. Nothing else is decided.)
- (Q6) **No operation moves a food statement between Just you and Everyone.** It is said again for the other scope.
- (Q7) **Where the screen lives:** Settings > Preferences next to Stock checks, or in place of it.

## Food statements: the 10 October 2026 rework, today's model and what would change

Owner direction (voice, 10 October 2026) on how food preferences are shaped, with Option B chosen as the direction. The statements are recorded as **decided food F1 to F10**, and the shape, operations and open questions (Q-F1 on) are in [`food-preferences.md`](food-preferences.md). Those labels are a separate series from the data-model facts F1 to F10 above, so cite them as "food F3". Only Option B's mockup changed; Option A keeps the old statement words.

Model facts today (Kitchie `context.ts`, read only, 10 October 2026), in addition to F6 above:

- A claim is one row of `context_claims`: statement (likes, dislikes, avoids, usually, fact, stop), a subject kept as words and matched by words, `about_type` (item, ingredient, recipe, cuisine, other), `severity` and `reason` on avoids only, the person's own words, status active or retired.
- **No end date, no frequency rule, no recipe attached.** Nothing lapses. The planner does not read claims; the AI is trusted to call `get_context`. Recipe holds no per-person food statement and its recipes never change in place (only status), so a title can be asked for live by recipe id.
- "Never suggest" exists today as the `stop` statement (a `rejected` item with `stop: true`).

What the owner's direction would change in code (not built): drop `stop` (it becomes an avoid, reason other); add a rule kind (avoid, like, dislike, cap), an end date on likes and dislikes, a cap, a category with attached recipe references and no stored titles; one service behind the port so the chat tools and the web routes share it; have the planner call an `evaluate` check; add the web Food card drawn in this option. Recipe changes nothing unless Q-F9 is answered the other way. Full list in `food-preferences.md`.

What the mockup now draws in the Food card: a row per rule with the word Avoids, Limit, Substitution, Likes or Dislikes (the old "Usually" is now Substitution: when an ingredient is in a recipe, swap in another or do something to it, with an optional reason, household and person tiers, no end date; decided food F11 to F14, shape proposed in [`food-preferences.md`](food-preferences.md), section "Proposal: substitutions"); an end shown as "Until 24 Oct" with a Keep it for good button and no date field; a category (Spicy: at most twice a week) with the person's words, the cap, the assistant's suggestion of matching recipes ("these recipes seem to match, attach them?") and the attached recipes with titles read from Recipe; and the household's own category (Deep-fried). "Never suggest" is gone from the screen.

## Option B: Mine and Household as two sections (awaiting approval)

What it draws. One Preferences screen with two tabs.

- **Mine.** Stock checks (the five settings), notes (your note, and the household note read beside it), food (your statements and the household's, chips Just you and Everyone), assistant and kitchen role (Only you), not asking about, and a device row. Each stock row shows the value in force, a chip (Yours, Household or Built-in), and for an overridden row what the household says. Choosing Same as household clears the override.
- **Household.** The same five rows as defaults, the household note, food for everyone, and the household-only items (Members and admins, name, categories, locations and spots, Recipe stars and votes, chip Household only). Household admins edit (D28); a member who is not an admin sees the same rows read-only with "Only household admins can change this." (this replaced D5's "any member edits" line and its no-read-only-state rule).

States drawn: inherited from household, overridden by person (quiet hours can be overridden to none, D6, for every role), built-in, household only, empty (nothing set yet), and, new, the household read-only for a member who is not an admin, and Members and admins as the founding member, as an admin and as a member.

Proposals (the owner did not say these; a wrong guess costs a redraw):

- B-P1. Two tabs, Mine first.
- B-P2. Rows save as you choose, with no Save button (Kitchie's page has Save buttons today).
- B-P3. Chip words: Yours, Household, Built-in, Only you, Everyone, Household only, This device.
- B-P4. (Superseded by D5, then returned by D26.) "Founding member" (People mockup) for what Kitchie's page calls household owner. D5 removed the owner concept so the word was not used; D26 makes the founding member the default admin, so the word is back, in Members and admins. Number kept.
- B-P5. A web list of food statements with Stop remembering this (no web page exists today).
- B-P6. Never show how many members override a household value (the code cannot say, and another member's choices stay theirs).
- B-P7. A new control, the source chip and preference row, is added to the shared styles if Option B is picked.
- B-P8. Members and admins is a row under "Only the household has these" that opens a small view (one row per member, chip Founding member, Admin or Member, and for the founding member a Make admin or Remove admin button), reached from the Household tab and from the read-only reason line. No new classes: it reuses the stops list, the chip and the sub-screen frame. A change shows a line and needs no confirmation.
- B-P9. A non-admin sees household rows read-only and the reason names the admins ("Admins: Arjan and Jo").

Numbering: these are B-P labels, not decision numbers. Owner decisions are D1, D2, ... across options A, B and C (D5 to D14 on 10 October 2026, see above). B-P numbers are not renumbered.

Performance (DESIGN.md section 6): default path is the page, `mine-household.css` (about 11 KB), `mine-household.js` (about 49 KB, roughly 8 KB of it the role check, the read-only rows and the Members and admins view), no images, no requests, nothing stored. Members and admins is drawn only when opened; in the real app its member list is fetched then, and the role check (one boolean for the viewer) is read once with the household values, so a member who is not an admin loads no editor code for them. `mine-household-600.css` (tablet and up) and `mine-household-1024.css` (desktop) are separate files applied by a media attribute, so phone code is never mixed with them. Editors are drawn when a row is tapped.

Mockup and build stay close: the screen reuses Kitchie's `.sp`, `.mtop`, `.mbody`, `.card`, `.sgroup`, `.seg2`, `dl.facts`, `ul.stops` rules as they are in `sub-screen.ts` and `layout.ts`; only `.prow`, `.pbtn`, `.src`, `.popt`, `.ped`, `.frow` and `.empty` are new.
