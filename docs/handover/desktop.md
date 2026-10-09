# Desktop handover for the building agent

**This is the master reference for the desktop mockup handover.** Start here; the decision record and the PRs sit behind it. Status: **living handover, written 10 October 2026.** The owner said that once the mockups are locked in this must be handed to the building agent with all the notes. Everything below is settled in the mockup unless it is under "Not decided". Mockups stay ahead of the build: show a change here first, never build first (see `AGENTS.md`).

Live mockup: <https://basement-bridge.github.io/mockup/fragments/desktop/pantry.html?sel=butter>. The decision record, in the owner's words and in order, is `docs/knowledge/desktop-layout.md`. Pull requests #37 to #49 in this repo carry the build detail. The Kitchie issues are #402 to #409 and #413; **none is approved for build** until the owner says so.

**Live links are the source of truth** (owner, voice, 10 October 2026: "better than screenshots, the actual link to the mockup along with the hashtags and everything"). Every state below opens from a link; screenshots in `docs/handover/img/` (1440 × 900) are only a quick look. Section 11 lists every link and what each URL option does.

## 1. Rules to follow

- **Mockup and build stay close.** Copy the mockup's markup, CSS and JS first and change only what the real code needs; list each difference in the PR. Tokens only, from `theme.css`.
- **Fetch only when asked (owner, voice, 10 October 2026).** Applies to all desktop work. History is never preloaded: opening the column, and each "show more", is a separate lazy call for that one item only. Nothing refreshes by itself. Default path loads the list and the open item; History, Filters options, Add form and Profile load on engagement.
- **Close with Ctrl or Cmd plus Esc.** Plain Esc takes a browser out of full screen. Every close on desktop (Filters and Sort, History, the item and its edit, Add, the shortcuts list, Profile) uses the modifier; plain Esc only clears the search box. Show the platform's own key in hints (`Ctrl Esc` or `⌘ Esc`).
- Shortcut cues can be switched off (the toggle in the `?` list). Anything that shows a key hint must carry the `kbd` class (or `keep` when it must stay).

## 2. Layout

![Pantry with an open item](img/02-pantry-open-item.png)

- Rail 88px on the left, then the main column (640px with 48px gutters, a 736px lane), then the right lane (400px). The group is left-anchored; the gap between list and panel is always one gutter.
- Desktop is **a hidden-control Device mode of the household flow** (move to the top edge, press the backtick, or Tab to it). Sizes: Phone 390, Tablet 768, Small 1024, Laptop 1280, Wide 1440, Full HD 1920, QHD 2560. `fragments/device.js`.
- A second column (History, or Sort) pushes out to the right of the panel (320px). Below 1240px wide it lays over the right edge instead of narrowing the list.

![Home](img/01-home.png)

## 3. Pantry

- **Header:** no "Pantry" title. Count, Filters and Add on the left; Search on the right, dimmed until clicked or `/`. Focusing Search hides Add.
- **Location and Category pills** on the face: one row by default, a drag bar to show more rows, a corner arrow, and double-click to show everything. Location and Category switch with a pin / tag button (as in Kitchie uat).
- **Counted vs level-only items** (`docs/adr/pantry-item-sheet.md` in Kitchie): the **Use one** button and the `U` key exist only for counted items. Level-only items change by level (rules of levels still apply).
- **Filters in use:** when any filter is picked the pill strip is replaced by removable tiles and "Clear all".
- **Shortcuts:** `?` or `H` list; ↑ ↓ or J K move; Enter or E edit; U use one; D used up; S shopping list; Z undo; N add; F Filters; `/` search; G then H, P, R, S go to a screen; **M back to the main column** (focus returns to the open row, or the column itself, from any panel; the panel stays open; ignored while typing in a box). There is no key for History yet; it opens from the History button on the item panel. (The Profile window has its own `G Y`.)

![Shortcuts list](img/04-shortcuts-help.png)

## 4. Filters (right lane) and Sort (flyout)

![Filters](img/05-filters-open.png)

**Filters is a live panel in the right lane, not a window.** Picks update the centre list as you go. Plain click picks one; Ctrl or Cmd click adds more. Statuses combine with OR, the groups (Status, Location, Category) with AND. The owner chose the old "Option C" controls, moved to the right.

**Status** (exactly three; the owner removed "On your list" and "No use-by set"). Each row: check circle, label, a sub-line ("in 1 week · 4 items"), a number key (1 to 3).

| Status | Window | Default |
|---|---|---|
| Running low | none (on or off) | n/a |
| Expiring soon | 3 days, 1 week, 2 weeks, 1 month | 1 week |
| Recently added | 24 hours, 3 days, 5 days, last week | 3 days |

- **Window control** is a single pill `‹ 1 wk ›` (left and right angle arrows), not plus and minus buttons. Keys: `Shift <` and `Shift >` step the status row you are on (or the last one used). The key is **not** drawn on the pill (the row is crowded); it is only in the `?` list. Clear resets the windows to the defaults.
- A status with no items gets the dashed look, like zero-count pills (the owner likes it and wants it kept).

![Statuses and the pill](img/06-filters-statuses-and-chevron-pill.png)

**Location and Category** are pills with icons (Location) or ticks (Category) and counts. Zero count is dim and dashed. Both sit in a **curtain**: one row by default, a grip under it to drag down, a corner arrow, double-click to show all. Opened, it grows to fit but **never past five lines**; beyond five it scrolls inside. Arrow keys resize and Enter toggles when the grip has focus.

![Curtain open](img/07-filters-curtain-expanded.png)
![Picked, with tiles](img/08-filters-picked-with-tiles.png)

**Sort is a flyout** (the owner tried a tab, then chose this). A "Sort" row at the top of Filters shows the current sort and pushes a second panel to the right. Choices: As listed, Name A to Z, Use-by soonest, Category, plus a direction button. **Both panels end in a round tick instead of "Done".** The tick on Sort closes only Sort; the tick on Filters closes both. `Ctrl/Cmd Esc` closes Sort first, then Filters. "Use last filters" and "Clear" sit in the Filters footer.

![Sort flyout](img/09-sort-flyout.png)
![1280 laptop with both flyouts](img/12-laptop-1280-two-flyouts.png)

## 5. History

![History column](img/03-history-column.png)

- A column on the right of the item panel, closed with the x or `Ctrl/Cmd Esc`. **This item only**, real history only, never sample rows and never project history.
- Not shown by default. When shown: the last **3 days that have entries** (quiet days are skipped), then **5 more days** per "show more".
- Long values are cut with an ellipsis and carry the full text as a tooltip.
- Kitchie source: journal-based history (`store.getHistory(id)`, MCP `item_history`). Requirement: lazy, on demand (section 1).

## 6. Add item: three options (owner has not chosen)

A: side panel in the right lane with every field. B: quick-add bar ("2 kg chicken thighs in the freezer") with the other fields behind "More fields". C: a centred window. My recommendation: B with A behind "More fields". Enter adds; Shift Enter adds and starts another; `Ctrl/Cmd Esc` cancels; new items default to Unplaced and count as "recently added".

![Option A](img/10-add-form-option-a.png)
![Option B](img/10-add-form-option-b.png)
![Option C](img/10-add-form-option-c.png)

## 7. Profile

Option B only: a true modal window (scrim covers everything, page behind inert, focus trapped and returned). Sections: Profile, Settings, History, Household, My data, each with a `G` then letter key. Source: `fragments/desktop-profile/`, exposed as `window.KProfile`.

![Profile](img/11-profile-window.png)

## 8. How the mockup differs from Kitchie `uat` today

Found by reading `uat` (read only; nothing was changed there).

- **Status keys already match** (`low`, `soon`, `recent`, in `server/src/assets/list.js` `STATUS`). The mockup's windows differ: Recently added has 24 hours, 3 days, **5 days**, last week with default **3 days**; `uat` has 24 hours, 3 days, last week with default **24 hours**.
- **Running low** in `uat` is the shopping list's own "low" marker. In the mockup it is derived from an item's level and minimum. The owner wants **Level** to replace it (see below).
- **Sort** in `uat`: Name, Use by, Added with a direction. The mockup: As listed, Name, Use-by, Category plus a direction. Align when the Sort flyout is built.
- **Levels** are defined once, in `server/src/stock.ts` (`LEVELS`: plenty, some, low, out). The item sheet words them Plenty, Some, Running low, Out (`server/src/assets/item-sheet.js`).
- **Not in the mockup yet and not built in the app:** everything in this document. The desktop layout from `docs/knowledge/desktop-layout.md` is built in Kitchie v0.49.0 and v0.49.1 (merged to `uat` only).

## 9. Not decided (ask the owner; do not guess)

1. **Level filter (not final, not built).** The owner said "rather than Running low... we should simply say Level", with options drawn from the real config (not invented), and that it must change in UAT and prod too. Real list: Out, Running low (`low`), Some, Plenty. Open: pick one level or several; where the row sits; Recently added default (3 days or the real app's 24 hours). Not built in the mockup yet.
2. **Which Add form option** (A, B or C).
3. **Which of issues #402 to #409 and #413 are released for build.**
4. **Next desktop screens to draw:** Recipes, Shopping (only Home and Pantry exist).
5. **Scenario controls on desktop.** The household flow's scenario controls (persona, invite, household, jump to) do not load at desktop sizes, because desktop opens its own page. Proposed fix: share the same state and Controls panel, carried in the URL. Not built.
6. **"Same number of rows" elsewhere.** The owner asked for a similar row limit "elsewhere"; the Category curtain already has it. Other places not named.
7. **The "focus" shortcut.** M is my proposal for the main column; the owner said it needs its own single key and left the letter to me.

## 10. File map (mockup)

- `fragments/desktop/desktop.js`, `desktop.css`: the Pantry and Home screens (state, Filters, Sort, History, Add, shortcuts).
- `fragments/desktop-profile/`: the Profile window.
- `fragments/device.js`: the hidden Device control. `flows/household/`: the phone flow.
- `docs/knowledge/desktop-layout.md`: decision record. `docs/handover/`: this file and its pictures.
- To regenerate pictures, serve the folder (`python3 -m http.server`) and use Playwright at 1440 × 900.

## 11. Live links (open the real mockup in any state)

Base: `https://basement-bridge.github.io/mockup/fragments/desktop/`. Add `&vp=1280` (or 1024, 1440, 1920, 2560) to see it in a window of that exact size; phone and tablet sizes open the household flow.

| State | Link |
|---|---|
| Home | `home.html` |
| Pantry, item open | `pantry.html?sel=butter` |
| History column | `pantry.html?sel=butter&hist=1` |
| Filters, clean | `pantry.html?filters=1` |
| Filters, location and category curtains open | `pantry.html?filters=1&curtain=1` |
| Filters, Expiring soon (2 weeks) and Recently added (5 days) | `pantry.html?filters=1&st=soon,recent&soonwin=2&recentwin=2` |
| Filters in use plus the Sort flyout | `pantry.html?filters=1&st=low&loc=Pantry&sortby=name&panel=sort` |
| Shortcuts list | `pantry.html?help=1` |
| Profile window | `pantry.html?profile=1` |
| Add form A, side panel | `pantry.html?add=a&open=add` |
| Add form B, quick-add bar | `pantry.html?add=b&open=add` |
| Add form C, window | `pantry.html?add=c&open=add` |
| Laptop size, both flyouts | `pantry.html?filters=1&panel=sort&vp=1280` |

URL options on `pantry.html` (all optional, they combine):

- `sel=<id>`: the open item (ids: butter, carrots, cheddar, eggs, yog, milk, paneer, spinach, rice, tom, onion, garam, peas, ice). `hist=1` opens its History.
- `filters=1`: open Filters. `st=low,soon,recent`: statuses on. `soonwin=0..3` and `recentwin=0..3`: window index (see the table in section 4). `loc=Pantry,Fridge`, `cat=Cans`: pills picked. `sortby=name|useby|cat`. `panel=sort`: open the Sort flyout. `curtain=1`: open both curtains. `pre=1`: the older preset (Expiring soon, Dairy and eggs, Use-by soonest).
- `help=1`, `profile=1`: the shortcuts list, the Profile window. `add=a|b|c&open=add`: the Add form option.
- `vp=<width>`: show the page in a frame of that size.

The page also writes the open item back into its own address (`sel=`), so copying the address bar shares the open item.

