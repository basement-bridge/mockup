# Inline edit: edit the recipe where it is shown

Desktop recipe detail page, Kitchie issue #892 (follows #830, PR #843). Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/inline-edit/index.html
Status: **recommended, awaiting owner review.** Nothing is built; Kitchie code is untouched. The phone edit flow is unchanged.
Switcher: the "Demo" button in the stand-in rail (or key `` ` ``). Query: `?edit=1` (open in edit mode), `&choose=fix|both` (answer the keeper question), `&r=typical|short|long|empty|notes|nocooked`, `&ver=trying` (edit a Trying version), `&tab=ing|notes|cooked|pho`, `&lane=1|h`, `&banner=none`, `&theme=dark|light`.
Nothing is saved: a reload starts again. Check: `tools/inline-edit-check.mjs` (144 checks).

## The owner's words (voice, 17 October 2026)

Clicking Edit on desktop opens the mobile edit form; there is no desktop edit view. He wants a proper desktop edit experience, edited **inline, in place on the recipe page**: "I prefer mostly inline edits rather than big fat 1990s forms". Use sensible judgement on the details. It is not a bug in the old sense: no desktop edit view ever existed (Kitchie #892 is an enhancement). Mockup first.

## What it is

The page is the Recommended layout (`../recommended/`, its stylesheets and sample data are reused as they are). **Edit mode is a state of that page**, not another screen: the same hero, rail and method, with every value turned into click-to-edit. Press **E** or the Edit chip in the hero; press E or Done to leave.

- **Hero:** title, Serves, total time, version name (pencil beside the version chip). The banner shrinks to a slim band while editing (it is decoration then, and the strip needs the height). Plan it and Make it are dimmed (finish editing first).
- **Ingredients:** amount, unit and name are three click-to-edit values per row; drag handle, remove (x); a quick-add line pinned under the list (type `2 tbsp soy sauce`, Enter) and a Group button. Groups (the long sample) are headings that are rows like any other: rename, move, remove. Amounts are shown **as written**, not scaled by the Serves stepper.
- **Method:** step text (a growing box), step time (beside the number), step photo (Add photo chip, x to remove), drag handle, remove; quick-add line and Group heading pinned under the steps; Ctrl+Enter on a step saves it and opens a new one right below.
- **Notes:** your notes are click-to-edit (a multi-line box, Enter is a new line, Ctrl+Enter saves) with a remove x; notes inherited from the parent version are locked ("Comes from Original. Change it there."); Add a note is an inline composer and also works outside edit mode.
- **Edit strip** (edit mode only, between hero and body): "Editing <version>", where the changes go, the saved state, Undo last, Done.
- **History flyout:** each change lands at once with who, what, its revision, and an Undo; undone rows are struck through.

## Design decisions (all Proposal: the owner was silent beyond "mostly inline, sensible judgement")

**D1. How edit mode is entered.** Considered: (a) an Edit button switches the whole page to edit mode (a form in place); (b) click-to-edit per field, always on; (c) both. **Recommended (c):** reading stays clean; Edit (or E, or a section pencil, which also opens that section's first field) reveals the affordances (a soft tint and baseline under every editable value, an accent ring on hover) and every value is then one click, or Enter on it, from a field in place. Always-on click-to-edit (b) was rejected: the page is also the page you cook from, and a stray tap on a step would open a box. The existing section pencils and E keep their meaning (edit this).

**D2. Save and cancel.** Considered: (a) explicit Save for the whole page (what the phone form does); (b) autosave per field. **Recommended (b):** a field is saved when it loses focus or on Enter; the strip says "Saved" (a green flash on the value, then "All changes saved, N changes"); a toast carries **Undo** for 7 seconds; **Ctrl+Z** undoes the last change when no field is open; and every change stays undoable on its own from the History flyout. Esc cancels the open field. Nothing is lost by closing the tab, and there is no Save button to forget. Cost: many small writes (see open question 1).

**D3. The keeper question.** The existing rule: a try edits in place; a keeper asks where changes go (fix this one, keep both, different dish). With no Save there is no moment to ask, so it is asked **once, when Edit is switched on for a keeper**: the strip shows the three choices, values are dimmed and a click on one explains ("Choose where your changes go first"). *Fix this one* writes into this version as the next revision. *Keep both* starts a new version (a try, named "<name>, edited", From <this one>) at the first change, and the rest edit that in place; the original stays as it is. *Different dish* only explains here (it starts its own recipe; not drawn). A Trying version, and a brand-new recipe, edit in place and are never asked.

**D4. What an edit does to versions, revisions and History.** Same model as the phone form, nothing new. One editing session (Edit on to Done) on one version is **one revision**; each saved field is a change inside it with its own Undo. History lists changes newest first with the revision number ("rev 4"). Keep both adds a "started <new version> from <parent>" row, the new version appears in the version menu as Trying with "From <parent>", and the lineage chain in History ends at it. Renaming the version renames it in the menu, strip, chain and rows. Undoing a change does not delete a version that was started. Removing anything is a change that History can undo; nothing is hard-deleted. Step photo changes can be undone for 5 minutes (the phone rule P6), the others for the session and from History.

**D5. Validation** (inline, in the field, never a dialog; the field stays open with a red message, Esc reverts):

| Field | Rule | Message |
|---|---|---|
| Name | required, 80 characters | "Give the recipe a name." |
| Serves | whole number 1 to 99 | "Serves needs a whole number from 1 to 99." (changing it does not rescale amounts) |
| Total time | empty, minutes, or `1 h 30` / `1:30`, up to 24 h | "Use minutes (45) or hours and minutes (1 h 30), up to 24 hours." |
| Version name | required, 60, not another version's name | "Another version already has that name." |
| Amount | empty (unknown), `2`, `1.5`, `1/2`, `1 1/2`, a half sign | "Use a number like 2, 1.5 or 1/2, or leave it empty." |
| Unit | free text up to 12, suggestions (g, tbsp, tin) | none |
| Ingredient name | required, 80 | "Name the ingredient." |
| Step | required, 400 | "Write the step, or remove it." |
| Step time | empty (no timer) or 1 to 1440 minutes | "Use whole minutes from 1 to 1440." |
| Group name | required, 40 | "Name the group, or remove it." |
| Note | required, 4,000 (counts near the limit) | "A note needs some words. Use Remove to take it off." |

A blank row that is left empty (a new step or group) is dropped silently, not reported.

**D6. Keyboard.**

| Key | Does |
|---|---|
| E | edit mode on or off (not in a field) |
| Enter on a value | opens its field; in a field, Enter saves (steps: Shift+Enter is a line break; notes: Enter is a line break, Ctrl+Enter saves) |
| Esc | cancels the open field (and a blank new row) |
| Tab / Shift+Tab | saves and opens the next / previous value in reading order: amount, unit, name, next row; stops at the last |
| Ctrl+Enter on a step or an ingredient name | saves and opens a new blank one right below |
| Up / Down on a drag handle | moves the row (focus stays on the handle); also drag with the mouse |
| Ctrl+Z | undoes the last change (outside a field) |
| 1 to 4, N, S, comma | unchanged, and quiet while a field is open |

**D7. Reorder.** A grip on every ingredient, step and group heading: drag it (a line shows where it lands) or use the arrow keys on it. A group heading is a row like any other, so moving it moves the boundary. Chosen over a Reorder mode (the phone form's pattern) because on desktop the handle can stay visible.

**D8. Empty states.** Read mode: "No ingredients yet. Press E to add them." Edit mode: the same box with the quick-add line focused-ready ("Type the first one below, for example 2 tbsp soy sauce"). No steps, no notes ("No notes yet" plus Add a note) and no time ("Add time", a dashed pill) are covered. A new recipe is a Trying version.

**D9. Quantities while editing** are the written amounts (for the recipe's own Serves), the pane label says "as written for 2". Edit mode resets the Serves stepper to the recipe's own number so the number on screen is the number that is saved; the stepper is back after Done. New ingredients have no pantry state until saved (a dotted dot).

**D10. Photos.** Step photos are added and removed in place (up to 10 a version, the phone limit; the button reads "10 of 10"). The mockup adds a sample photo; the real chooser and the crop and rotate sheet are the existing photo sheet. The banner and the gallery stay there too (not redrawn).

**D11. Notes.** Inherited notes are read-only here (change them in the version that owns them). Add a note is not an edit of the recipe, so it works in read mode too.

**D12. Below 80rem wide or 700px high** the page stacks and the build keeps today's edit panel; E explains it. Inline edit is drawn for the wide layout only (the same viewport file rule as `../recommended/`).

## Layout names added to the build's vocabulary

`.ed` (an editable value; `data-ed="<kind>:<id>[:<field>]"`), `.edw` + `.edin` + `.edmsg` (the open field and its message), `.estrip` (+ `.es-t .es-q .es-w .es-s .seg`), `.grip`, `.rm`, `.addrow`, `.mfoot`, `.addph`, `.pwrap .phx`, `.composer`, `.hundo`, `.tundo`, rows `.ing-e .stp-e .n-e`, `[data-row][data-list]` (drag targets), `[data-edit]` and `[data-gated]` on `.rtab`. Files: `inline-edit.css` (all edit components), `inline-edit-wide.css` (viewport file, `media="(min-width:1280px) and (min-height:700px)"`), `inline-edit.js`. Read-mode markup is the Recommended page's, rebuilt from a model in one script (the mockup draws everything from sample data in script; the build keeps its server-rendered page).

## What the default path loads and what is deferred (DESIGN.md section 6)

Read mode loads what the Recommended page loads. In the build the edit layer is its own script and stylesheet, fetched on the first Edit (or E), at 80rem and 700px and up only, like `recipes-edit-desktop.js`; a phone never carries it. The mockup is one 67 KB script (21 KB gzip) because it also draws the page. Photos: no new request at page load; step photo add reuses the existing sheet.

## What could only be reasoned, not verified

- How each commit maps to the Recipe client: today one Save sends the whole change set with a base revision (`stale_base` opens the stale sheet, `recipes-edit.js:586`). Per-field writes mean a stale answer can arrive mid-typing; the mockup does not draw it. Proposal: on `stale_base` keep the field open, show "Someone changed this. Reload to see it" with the value kept.
- Whether a session can be one revision when each change is written at once (open question 1).
- Tab order cost: every value is a tab stop, so a long recipe has ~100. Proposal for the build: one tab stop per row with arrow keys inside (a roving index); the mockup keeps plain Tab so the flow can be judged.
- The keeper question was drawn from the phone mockup (`recipe/edit.js`), not from the built sheet's exact wording.
- Screen reader behaviour (announcements on commit and error) was reasoned: the strip status and the toast are live regions, errors are `role` alert in the field's description; not tested with one.

## Tested (Playwright, Chromium, `tools/inline-edit-check.mjs`)

1280x720, 1440x900 and 1920x1080, typical, short, long and empty, read and edit, and with the Notes flyout and the History flyout open: the document never scrolls, nothing overflows sideways in the rail, the method, the hero or the strip, and the console is clean. Behaviour: the keeper gate, every field's save, cancel and error, Tab and Shift+Tab flow, quick add parsing, remove with Undo, keyboard and mouse reorder, step text, line breaks, times, photos, notes, Keep both and the version menu and History, empty states, keys quiet in a field, the narrow-window message. Screenshots in `screenshots/` (dark, plus one light).

## Owner decisions (voice, 18 October 2026; locked until he overrides)

1. **The keeper question appears at Done, not when Edit is switched on.** His words: it "must NOT appear when edit mode is switched on", it "appears later, at save/finish time". Drawn: entering edit asks nothing; the strip says "Kept in this session. You choose where it goes when you press Done"; the status reads "Kept", not "Saved", until then. Done with changes opens a dialog: Fix this recipe (preselected), Keep both versions, It is a different dish (explains only). Enter saves; Esc or Back to editing keeps editing. Done with no changes, and a Trying version, ask nothing. Per-field autosave stays coherent with one revision per session: every change is held in the session's open revision with its own Undo, and Done decides which version that revision lands on (Keep both re-labels the session's changes as revision 1 of the new version).
2. **E is the GLOBAL toggle** (owner-confirmed): every text field on the page becomes editable at once; no photo editing is implied. E again leaves everything.
3. **Each section's pencil is a SCOPED edit**: that one section only, the rest stays read-only. A pencil never turns on global mode and E is never confined to a section. Chosen for mixing (Claude's call within his rule): while global is on no pencils are drawn; E while a section is scoped takes over and the session continues; **only one scoped section is open at a time** (a second pencil moves editing there). A section returns to read-only by its Done (in the pencil's place), by Esc when no field is open (Esc first only closes the open field), by the strip's Done, or by E. Enter and blur save the field and leave the section open. The hero has no pencil (its title, serves, time and version are edited in global mode).
4. **The pencil trails its section.** His words: "I want the pencil at the end of it", and "the same for method, six steps, I want it to be at the end of it". It sits after the last ingredient, the last step and beside Add a note, not in the heading row (the other reading, heading-row right end, was superseded). The foot rows are pinned outside the scroll regions, so a long section never pushes the pencil out of view.
5. **Photos has no pencil; it has an Add button** beside its label and count ("Photos 7  [+ Add]"). Keyboard reachable; shows "Uploading photo…" then "Added a photo to Photos" with Undo. Works outside edit mode, like adding a note. Banner and gallery management stays in the existing photo sheet.
6. **Step photos are edited on the step, in place**, in global mode and in the Method pencil mode, never in read mode: a photo shows an X (remove, Undo toast, 5 minutes) and Replace; a step without one shows Add photo.

## Decisions under delegation (19 Oct 2026: owner asked Claude to use best judgment)

**Decided by Claude under delegation, owner may override.**

1. **One revision per editing session** (Edit on to Done), each saved field a change with its own Undo. Why: the existing rule in `recipe/edit.js` is "every save is one revision with per-change undo". Alternative: every field its own revision.
2. **Inline replaces the right-lane edit panel on desktop at 80rem x 700px and up.** The panel stays below that size. Why: the 17 Oct direction is newer than E-O5 (12 Oct). Alternative: keep both everywhere.
(The keeper question, formerly decision 3, and the E key, formerly decision 4, are now owner-decided above.)

## Still open for the owner (4, 5, 7; the decisions above stand unless he overrides)

1. **One revision per session, or per change?** Recommended: per session (Edit on to Done), with per-change undo in History, so History does not fill with one-word revisions. Alternative: every saved field is its own revision. Wrong guess: either a noisy History or a revision that is only complete when you press Done (close the tab mid-session and you have a half-finished revision; the changes themselves are still saved).
2. **Does inline editing replace the right-lane edit panel on desktop** (E-O5, 12 October)? Recommended: yes at 80rem and 700px and up; the panel stays below that, for the assistant hand-off and for banner and gallery photos. Wrong guess: two edit experiences to keep in step.
3. **Where the keeper question sits.** Recommended: once, when Edit is switched on. Alternative: at the first change, as a small sheet. Wrong guess: a gate before you can type (minor friction) or an interruption mid-flow.
4. **Banner and gallery photos** stay in the existing photo sheet. Accept?
5. **Inherited notes read-only.** Accept, or allow editing them (which would mean the parent's note changes for everyone)?
6. **The E key** toggles edit mode (today E opens the panel). Esc cancels the open field only; it does not leave edit mode. Accept?
7. **Tab stops.** Plain Tab through every value (as drawn) or one stop per row with arrows?
