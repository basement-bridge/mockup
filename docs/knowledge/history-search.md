# History search and filters, on the canonical event model

Owner (voice, 18 Oct 2026; typed 23 Oct 2026: get it built): the point of the History work is a canonical model. The search and filter mockup uses only fields that model guarantees, respects the template system (no invented fields; result detail defers to the kind's template), and every choice it needs is an owner question, not a quiet pick. Model and the numbered questions Q1 to Q10: `history-event-model.md`. Mockup: `history/search/` (`mobile.html`, `desktop.html`, or `index.html` responsive: phone under 1024px, rail + column + lane from 1024px). Checks: `tools/history-search-check.mjs` (448 checks; run with the server and `SHOTS=dir`). Screenshots: `docs/screenshots/history-search-*.png`.

**Revision 2, 23 Oct 2026 (owner, voice, 23 Oct 2026).** The first version (mockup PR #280) was a proposal on every question. The owner has now decided most of them; this revision applies his decisions. He typed that the Pantry change below is a separate enhancement elsewhere, and that this mockup must stand on its own and survive without it.

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

## Decisions log (owner, voice, 23 Oct 2026)

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
| - | Visual language: a quiet filter component, consistent with the existing tokens. Applying that pattern to Pantry is a separate enhancement (tracked as a mockup issue); this mockup does not depend on it and no Pantry mockup is changed. | **Decided** (owner, typed, 23 Oct 2026) |

## Proposals (the owner was silent; marked in the mockup)

- **S-P3. Filter choices come from the registry** (`/api/history/kinds`, designed, not built; Q4): drawn as Pantry, Shopping and Recipes (the last two hypothetical: neither emits History yet and their kind names are placeholders; their rows are generic until a template exists). The labels belong to the producing product.
- **S-P6. The detail is the lane on desktop, a sheet on phone.**
- **S-P8. Topic has a finer step for an area with several kinds**, so "removed" can be picked after "Pantry" (the model's `kind`); the owner said a single Topic filter mapping to area or kind, so this is one filter in two steps, not two filters.
- **S-P9. Stand-in templates**: Kitchie's "wording today" column written as templates in `model.js`; Kitchie authors the real ones.
- **S-P10. Date windows are Today, Last 7 days, Last 30 days** (the first version's); there is no Yesterday or custom range (the API has `to`, so a range is possible later). Off reads Anytime.
- **S-P11. Three tabs in a two-person household** (My activity, the other person, Others) so that Others is reachable without losing the person tab; with more people, My activity and Others.
- **S-P12. The catch-up lists who made changes as links without numbers** ("By Sam, you, Others"). "Others" in that sentence means no member or a former member; the Others tab is wider (see open points).

## Open points and what a wrong guess costs

- **Press and hold** on the rotary (above): not in Pantry; build only if the owner wants it, and then in both places.
- **Q2, Q7, Q9** are undecided and still drawn as above. Q2 wrong guess: with one choice a person cannot see "Sam or Priya" together (Others covers the common case); lists is a Platform contract change. Q9: a household spanning zones sees different day cuts.
- **Overlap of Sam and Others** in a two-person household: `actor=others` is "everyone but me" (the owner chose option a), so Sam's changes are in both tabs. Option b (`actor=none`, only no-member and former) would remove the overlap but is a new parameter. Wrong guess costs a little confusion, no data.
- **The word for a null actor.** "Someone" is used; the model doc asked whether it should say more (a shopping link). Owner has not said.
- **Topic labels** ("Pantry", "Shopping", "Recipes") come from the registry the products publish, not from Platform or this mockup.

## What the default path loads and what waits (`DESIGN.md` section 6, 6a)

Loads: the page, `theme.css`, `shared.css`, `option-d.css` (shared classes; 19 KB), `search.css` (about 5 KB), `model.js` (about 13 KB, the stand-in for Platform; the build replaces it with the calls) and `search.js` (about 27 KB). One feed call for the open tab: the catch-up's three days, or the newest day. Waits: the other tabs; older days (one per call, only when the end of the list scrolls into view); the filter choices (registry call on opening the filter); a template (fetched on first sight of a kind, cached); the detail (rendered from the row already loaded, no new request; the template link is only followed on tap). The rotary needs no call of its own: a step re-requests the newest day only. Everything lands in place: tabs, filter, days and the detail swap content without navigation. Phone and desktop share one script (CSS-first, DESIGN.md 7); the lane exists only from 1024px.
