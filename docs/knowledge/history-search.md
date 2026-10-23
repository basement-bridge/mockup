# History search and filters, on the canonical event model

Owner (voice, 18 Oct 2026; typed 23 Oct 2026: get it built): the point of the History work is a canonical model. The search and filter mockup uses only fields that model guarantees, respects the template system (no invented fields; result detail defers to the kind's template), and every choice it needs is an owner question, not a quiet pick. Model and the numbered questions Q1 to Q10: `history-event-model.md`. Mockup: `history/search/` (`mobile.html`, `desktop.html`, or `index.html` responsive: phone under 1024px, rail + column + lane from 1024px). Checks: `tools/history-search-check.mjs` (1,060 checks; run with the server and `SHOTS=dir`). Screenshots: `docs/screenshots/history-search-*.png`.

**Revision 2, 23 Oct 2026 (owner, voice, 23 Oct 2026).** The first version (mockup PR #280) was a proposal on every question. The owner has now decided most of them; this revision applies his decisions. He typed that the Pantry change below is a separate enhancement elsewhere, and that this mockup must stand on its own and survive without it.

**Revision 3, 24 Oct 2026 (owner, voice, 24 Oct 2026): alternatives to the cascading filter. Status: for owner choice.** He found the cascade (pick a person, then a topic, then a date, and the list keeps reshuffling) clunky and asked to see different ways. Revision 2's design stays as baseline **A: Cascade**; three more ways are added beside it in the Preview switch, **B: Sentence**, **C: Quick answers**, **D: Tap to filter**. Nothing was deleted, nothing was decided for him. **Defaults (owner, 24 Oct 2026, "sensible defaults for all mobile and desktop"):** with no `?way=` the page opens on **D: Tap to filter** on phone and desktop (the designer's recommendation); the cascade is `?way=cascade`. This is a mockup default only, not an owner choice among A to D. Every rule from 23 Oct still holds (below).

## Filter patterns A to D (revision 3, for owner choice)

Open any of them on the one page with `?way=`: A is the default (no parameter), `?way=sentence` (B), `?way=quick` (C), `?way=tap` (D). They combine with the other parameters (`view=list`, `tab=`, `as=`, `household=more`, `search=text`, `choices=several`, ...). Preview switch: "Filter pattern (owner, 24 Oct)". B, C and D have no filter sheet and no desktop filter panel; the X on the catch-up opens the recent list with the pattern's line. The tabs, the catch-up, the rows, the detail and the Others rules are exactly as in A (the owner said another change to how mine and others are shown is in progress elsewhere; the tabs are untouched here).

| | Pattern | What the screen shows | What one tap does |
|---|---|---|---|
| A | **Cascade** (baseline, revision 2) | One muted line (Anytime · All topics) opening a short sheet (lane on desktop) with the Date rotary row and Topic chips, then a finer kind row. | Each pick re-draws the list; the choices stack. |
| B | **Sentence** | One line, "You · anything · anytime". The line is the filter state. No panel. | Tap a word: a short sheet (phone) or small popover (desktop) with only that part. Who = the three tab values; What = Anything, Pantry, Shopping, Recipes, then that area's kinds; When = Pantry's Date row (toggle, rotary). The X clears every part at once (the tab stays). |
| C | **Quick answers** | A strip of five ready-made chips: Mine today, Removed this week, Moved this week, By Sam (two-person households), By others; a read-only line under it saying what is on. No panel. | Tap a chip: it sets the parts it names (Who, What, When). A second chip is added over the first (a later When replaces an earlier one); tapping a chip that is on clears just its parts; the X clears what the chips set. |
| D | **Tap to filter** (designer's pick) | The list itself carries the controls: a row has the line (opens the change), small underlined handles for its topic, kind and thing, a person button on the avatar where it narrows, and each day label is a button. A line at the top shows what is on; each part is a pill that clears with one tap. | Tap a handle: the list narrows, the page scrolls to the line, a toast says what happened with Undo. As the list narrows, a handle that is already on disappears from the rows. |

**Every control is one real model filter** (checked: `tools/history-search-check.mjs` reads the query the screen would send after each tap, and it may use only `actor`, `actorNot`, `product`, `area`, `kind`, `entityType`, `entityId`, `from`, `to`, `since`). Mapping:

- Who (B word, C person chips, D person tap) = `actor` (me, the other person's id, or an id; `actorNot` for Others). It is the tab. Tabs are unchanged, so the sentence's first word shows the tab ("You", "Sam", "Others"); a list is always someone's, so **"Anyone" never appears** in the list. See the first open point.
- What (B, C chips, D handles) = `area`, or `kind` (whose first segment is the area).
- When = `from` (Today, Last 7 days, Last 30 days: Pantry's rotary, unchanged: tap, drag, wheel, no press and hold, no "Anytime" step), or **one day = `from` and `to`** (D day label only).
- The thing (D item name) = `entity_type` + `entity_id`, sent with the `product` the API requires (never shown).
- No keyword, no counts, no product filter, no touches/affects filter, in any pattern. Free text stays the Preview B-search (`?search=text`, same label) and works together with B, C or D.

### D in detail (the designer's pick, drawn most carefully)

- **A row is separate 44px targets, not one big button.** The line (who, what changed) still opens the change; under it small underlined handles; the time is plain text. Rows are about half as tall again as A's (two 44px lines instead of one block); as the list narrows, handles that are already on disappear, so rows get shorter again.
- **What can be tapped:** the topic ("Pantry"), the kind ("Moved"; only where the area has several kinds, as in A), the thing ("Basmati rice"), the avatar (a person) and the day label ("Yesterday Sat 17 Oct").
- **Person tap exists only where it narrows.** In My activity or Sam's tab every row is already that person's, so the avatar is plain. In Others, a named member's avatar is a button: with two people it opens Sam's tab; with more people it narrows Others to that person (`actor=<id>`, a pill with an X). **"Someone" and "A former member" are never buttons:** there is no single person to filter by (`actor=none` would be a new parameter, the option b of Q5).
- **The thing, and what the model guarantees.** `entity.type` and `entity.id` are on every row, but `entity.id` can be null (Kitchie leaves it out for `bulk_changed`: "no single thing"), so such a row has **no** handle (the sample has one: Sam, Sat 17 Oct, 8:00 am, Bulk changed). The handle filters by the id, never the name (names are not guaranteed and are not filters). The handle's text is the template's own entity link text (so it reads "Basmati rice"); a row with no template says "This recipe". The `product` goes with it because the API wants it. The mockup says this on its D note.
- **One tap, then a clear result.** Tapping scrolls to the top (where the line is), the toast says what was filtered ("Showing only Moved in Pantry") with **Undo**, which restores the whole previous state.
- **Date in D.** A day label narrows to that day. For "roughly a week ago" the line's "anytime" opens Pantry's rotary (the same row as A); once a date is on, its pill opens the rotary and its X clears it. Stepping the rotary while a day is on goes back to the remembered window.
- **The line.** "You · anything · anytime" with a hint ("Tap a name, a topic or a day in the list to narrow it.") that goes away once something is on. Only the parts that are on are pills; the first word is the tab and is not clearable.
- **Catch-up.** Rows in the catch-up carry the same handles; tapping one leaves the catch-up (not marked caught up) and shows the list with the line.

### Designer's recommendation: D

Why: the two jobs. (1) Catch up: nothing changes; the catch-up opens first in every pattern. (2) Who did that and when, "often knowing only roughly when and what": D starts from the thing on the screen ("the milk row" is in front of you), so you tap the kind or the item and see only that, then the day it happened; you never have to know the vocabulary of a filter first. Nothing stacks, nothing cascades; one tap, one visible result, one tap to undo. B is the clearest statement of state but still asks you to name each part; C is fastest for the questions it anticipates and a dead end for any other. D can be paired with B's line (it already is), and C's chips could be added to D's empty line later. Costs of D: rows are taller (about half again); person tap does little while the tabs split whose; tap handles are small text, so they rely on the 44px target and an underline to be discovered; "Tap a name..." hint is the only teaching.

### What the owner must choose

1. A, B, C or D (or D with C's chips on its empty line). Status: **for owner choice**; nothing is decided for him.
2. Whether to keep the tabs once a pattern is chosen. B, C and D all read "who" from the tabs, so "Anyone" cannot exist while the tabs are there; D's person tap and the item tap ("everyone's changes to the milk") are most useful when one list can show everyone. This is the territory of the parallel change to the mine and others tabs, so it was not touched.
3. D's day label: narrows to one day (`from` and `to`). OK, or only the Today / 7 / 30 windows?
4. C's chip list (five chips as drawn).

## What stays decided (revision 2, all patterns)

No keyword box by default (free text is the Preview B-search); no counts anywhere; no product filter; no touches/affects filter; events with no member and former members stay under Others ("Someone", "A former member"); one combined feed; Date is the Pantry rotary and keeps its real behaviour; single choice per group (Q2) stays undecided and reachable with `?choices=several`; the time zone is the device's (undecided).


This **revises option D** (`history-option-d.md`), keeping its locked structure (H1 to H15) except where the decisions below overrule it.

## The two jobs (owner, voice, 23 Oct 2026)

1. **Catch up:** "what changed since I was last here". That is the entry, unchanged: three calendar days with activity at most.
2. **Who did that, and when**, after something looks wrong (the milk vanished). The person often knows only roughly when and what, so **Topic and Date must carry this job**, and the tab says whose. The screen is kept quiet: one muted line on a phone, no big filter block, no counts, no badges.

## What the screen is

- **Entry (H4, H6, H8):** "Since you were last here", three calendar days with activity at most, tick (marks caught up) and X (leaves, does not mark it). **No counts:** the card says since when, and lists who made changes ("By Sam, you, Others") as links; a person opens that person's changes (`actor`), with a way back.
- **Tabs (person tabs):** My activity (`actor=me`), the other person when the household has two (`actor=<id>`), and **Others** (`actor=others`). With more people there is no per-person tab: My activity and Others. No counts on a tab.
- **Others (Q5, decided):** everyone who is not you, **and** events with no member (a shopper link, a shared assistant link, the system; read "Someone"), **and** past events by a member who has since been removed (read **"A former member"**; members are erased after a week and History is anonymised, so the name is gone). Nothing is hidden. In a two-person household the Sam tab and Others overlap on Sam's changes, because `actor=others` means "not me" (see open points).
- **After the X (H7a, H8, H15):** recent history, one calendar day with activity per load (`days=1&tz=`), newest first, quiet days skipped, no ceiling, no button. The filter is one quiet component: on a phone, one muted line under the tabs (Anytime · All topics, a clear X when something is on) that opens a short bottom sheet; on desktop the same body in the lane. The list updates as you pick.
- **Date (the Pantry rotary, see below):** a status row, toggle on the left, rotary on the right, windows Today, Last 7 days, Last 30 days; off reads Anytime. Sets `from`.
- **Topic (single):** the registry's areas, one combined feed across Pantry, Shopping and Recipes (area = first part of `kind`). Choosing an area with several kinds shows a finer row for that area ("In Pantry": Added, Removed, Moved...), which sets `kind`. This is how "the milk vanished" is found: Pantry, Removed, around then.
- **Removed from the filter:** the App (product) control (product stays on the event and is shown on the detail; it is only sent, hidden, with the in-context entity link because the API requires it), the Touches (`affects`) filter and the "Touches you" mark, the "N changes" summary, tab counts and the filter-button badge.
- **A row:** the skeleton the event always has (who, when, topic) plus the kind's template output (`HM.render`). No template published, or the evaluation fails: the generic row "Sam made a change in Recipe". Template being fetched: skeleton row. Platform down: shown as down, never as empty.
- **Open a result (H5):** a bottom sheet on phone, the lane on desktop. Content: who, when and app from the skeleton, then the template's output including its `detail` lines, and a link only where the template defines one to a route the product registered. A generic row opens a generic detail.
- **Preview control (mockup only):** **Search (Q1): A, filters only (default), or B, free text over the days loaded**; **Choices per group (Q2, undecided): one at a time (shown) or several (lists)**; person, household size, catch-up or recent, last visit, template registry, mockup notes.

## The Date rotary, and what Pantry actually does (verified in the code)

Source: Pantry's Filters sheet, `flows/household/app.js` ("status rotary", `srow`, `rotStep`) and `flows/household/*/styles.css` (`.strow .stt .dotc .rot .rar`); described in `README.md`. The History Date row copies the markup, class names and rules, so the build can use the app's own.

What exists in Pantry, and so here: each status is one long pill with a checkbox on the left (tap it or the name to turn the status on or off); the rotary on the right is plain text with up and down arrows; **drag up or down on it, scroll the wheel over it, or tap it to step through the windows** (a tap past the last wraps to the first, and a tap turns the status on); while dragging, the pill's label shows the window value live, and on release the label returns to the name while the rotary keeps the value; a light vibration ticks on each step where the device allows it.

**Press and hold on the rotary is not in Pantry** (pointerdown, move, up and wheel only; there is no timer on the rotary, and Pantry's press-and-hold is only on running-low rows and chips). Pantry also has no "Anytime" option: a status is off or on at a window. The owner believed a hold on "Anytime" opens the rotary directly. **Not invented here** (owner's rule: replicate what exists, flag it). The tap behaviour is built, and the History Date row shows "Anytime" when off. Question for the owner: should a press-and-hold open the rotary (or a picker) directly? If yes it belongs in Pantry too, so it should be one shared change.

Two small differences from Pantry, both marked: the first tap on an **off** row turns it on at its remembered window (Pantry's tap always advances, which would skip a window when the row is off); arrow keys and Enter also step it (Pantry's rotary is pointer-only). Time zone: the device's, undecided.

## Decisions log (owner, voice, 23 Oct 2026; revision 3 rows 24 Oct 2026)

Numbering follows `history-event-model.md` section 7. The owner's own voice list ran one behind it after Q3 (his Q4 is the document's Q5, his Q5 is Q6, his Q6 is Q9); the mapping is stated so nothing is applied to the wrong question.

| # | Decision | Status |
|---|---|---|
| Q1 | No keyword search box in the default design. Preview keeps A (default, element-based filtering only) and B (a free-text search variant, labelled honestly as searching the loaded days only: S1, client-side over rendered text). Both selectable on the one page (`?search=text`). | **Decided** (owner, voice, 23 Oct 2026) |
| Q2 | One choice per filter group is what is shown. The lists alternative (several topics at once, which needs Platform to accept a list per parameter) stays reachable in Preview (`?choices=several`) and is marked undecided. | **Undecided** (owner, voice, 23 Oct 2026) |
| Q3 | No counts anywhere: no "N changes", no tab counts, no badges, no day counts. | **Decided** (owner, voice, 23 Oct 2026) |
| Q5 (his Q4) | Events with no member are shown under Others, never hidden. A removed member's past events read "A former member" under Others. | **Decided** (owner, voice, 23 Oct 2026); needs a Platform doc change |
| Q6 (his Q5) | Kitchie does not record who an event affects, for now. The Touches filter and the "Touches you" mark are removed; the mockup does not read `affects`. | **Decided** (owner, voice, 23 Oct 2026) |
| - | The product (app) filter is removed as a user-facing control: one combined feed across Pantry, Shopping and Recipe. Product stays on the event, just not a filter. | **Decided** (owner, voice, 23 Oct 2026) |
| - | A single Topic filter (the model's area, or kind), the person tabs, and a Date filter. | **Decided** (owner, voice, 23 Oct 2026) |
| - | Date uses the same rotary row as Pantry's Filters sheet, same look and feel. The existing three-day catch-up stays. | **Decided** (owner, voice, 23 Oct 2026) |
| Q9 (his Q6) | The time zone is the device's. | **Undecided** (owner, voice, 23 Oct 2026) |
| Q7 | Whether ADR 0003's template design is confirmed. | **Undecided** (owner, voice, 23 Oct 2026) |
| R3 | Show alternatives to the cascading filter, switchable beside it. Agreed to see three: B Sentence, C Quick answers, D Tap to filter. A (the cascade) stays as the baseline in the Preview switch (`?way=`). | **Asked for** (owner, voice, 24 Oct 2026); which one to keep is **for owner choice** |
| R3 | Designer's recommendation: D, Tap to filter. Not chosen by the owner. | **For owner choice** |
| - | Visual language: a quiet filter component, consistent with the existing tokens. Applying that pattern to Pantry is a separate enhancement (tracked as a mockup issue); this mockup does not depend on it and no Pantry mockup is changed. | **Decided** (owner, typed, 23 Oct 2026) |

## Proposals (the owner was silent; marked in the mockup)

- **S-P3. Filter choices come from the registry** (`/api/history/kinds`, designed, not built; Q4): drawn as Pantry, Shopping and Recipes (the last two hypothetical: neither emits History yet and their kind names are placeholders; their rows are generic until a template exists). The labels belong to the producing product.
- **S-P6. The detail is the lane on desktop, a sheet on phone.**
- **S-P8. Topic has a finer step for an area with several kinds**, so "removed" can be picked after "Pantry" (the model's `kind`); the owner said a single Topic filter mapping to area or kind, so this is one filter in two steps, not two filters.
- **S-P9. Stand-in templates**: Kitchie's "wording today" column written as templates in `model.js`; Kitchie authors the real ones.
- **S-P10. Date windows are Today, Last 7 days, Last 30 days** (the first version's); there is no Yesterday or custom range (the API has `to`, so a range is possible later). Off reads Anytime.
- **S-P11. Three tabs in a two-person household** (My activity, the other person, Others) so that Others is reachable without losing the person tab; with more people, My activity and Others.
- **S-P12. The catch-up lists who made changes as links without numbers** ("By Sam, you, Others"). "Others" in that sentence means no member or a former member; the Others tab is wider (see open points).

- **S-P13. Chips in C** are Mine today, Removed this week, Moved this week, By Sam, By others: five, chosen for the two jobs ("Removed" and "Moved" answer "the milk vanished" and "where did it go"). Each is built only from `actor`, `kind` and `from`. A chip that does not name a person keeps the current tab, so "Removed this week" under My activity is mine only.
- **S-P14. D's day label** sets one calendar day (`from` and `to`); the Date rotary has no such value in Pantry, so the rotary reads the day while it is on and a tap goes back to the remembered window.
- **S-P15. D's Undo** (a toast, 6 seconds) and the scroll to the top after a tap; D hides a handle that is already on.
- **S-P16. The sample gained one row** (Sam, Sat 17 Oct, 8:00 am, `pantry.bulk_changed`, `entity.id` null) to show a kind with no thing to filter by. It is before the Saturday 5:30 pm catch-up cut, so the catch-up is unchanged.

## Open points and what a wrong guess costs

- **"Anyone".** The owner described the sentence as "Anyone · anything · anytime". With the tabs left alone, every list is one person's (You, Sam, Others), so the first word is the tab's value and "Anyone" never shows. If the tabs go, "Anyone" is `actor` left out and D's person and item taps get much more useful. Wrong guess costs: building a person word that duplicates the tabs.
- **Item filter under a tab.** Tapping "Milk" in My activity shows only my milk changes; to see who removed it you must also look in Sam's tab or Others. Same cause.
- **Parallel work on mine and others.** Checked `origin/main` on 24 Oct: nothing after PR #290 touches `history/` or the tabs, and there are no open PRs in mockup, kitchie or platform. If that work lands, the tab bar is the only place to reconcile (B's Who picker and D's person tap read the same state).

- **Press and hold** on the rotary (above): not in Pantry; build only if the owner wants it, and then in both places.
- **Q2, Q7, Q9** are undecided and still drawn as above. Q2 wrong guess: with one choice a person cannot see "Sam or Priya" together (Others covers the common case); lists is a Platform contract change. Q9: a household spanning zones sees different day cuts.
- **Overlap of Sam and Others** in a two-person household: `actor=others` is "everyone but me" (the owner chose option a), so Sam's changes are in both tabs. Option b (`actor=none`, only no-member and former) would remove the overlap but is a new parameter. Wrong guess costs a little confusion, no data.
- **The word for a null actor.** "Someone" is used; the model doc asked whether it should say more (a shopping link). Owner has not said.
- **Topic labels** ("Pantry", "Shopping", "Recipes") come from the registry the products publish, not from Platform or this mockup.

## What the default path loads and what waits (`DESIGN.md` section 6, 6a)

Loads: the page, `theme.css`, `shared.css`, `option-d.css` (shared classes; 19 KB), `search.css` (about 5 KB), `model.js` (about 13 KB, the stand-in for Platform; the build replaces it with the calls) and `search.js` (about 27 KB). One feed call for the open tab: the catch-up's three days, or the newest day. Waits: the other tabs; older days (one per call, only when the end of the list scrolls into view); the filter choices (registry call on opening the filter); a template (fetched on first sight of a kind, cached); the detail (rendered from the row already loaded, no new request; the template link is only followed on tap). The rotary needs no call of its own: a step re-requests the newest day only. Everything lands in place: tabs, filter, days and the detail swap content without navigation. Phone and desktop share one script (CSS-first, DESIGN.md 7); the lane exists only from 1024px.
