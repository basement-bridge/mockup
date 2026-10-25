# Home cards: choose which show, and move them (kitchie #1238)

Status: **drawn for the owner to choose; nothing built, nothing decided.** Phone only. Mockup: `fragments/home-widgets/` (`?way=a|b|c`, `&state=`, `&theme=`, `&big=1` for text +30%, `&w=360`). Design review by a separate agent: **not yet done** (the author does not review it). Baseline: kitchie `origin/uat` at `cd7fdb6`; `mobile-home.css` is copied unchanged next to the page, so the cards are the app's own.

## Owner's words (25 Oct 2026, voice and chat)
Can Home be edited, to select or deselect cards or put them in order? "I don't know that I love seeing the recipe recommendations at the top." Raise it like moving widgets on a phone.

## Job
See first the card that matters to me; drop the ones I never use. One quick change, then Home looks after itself.

## What Home has today (read in UAT)
Greeting row (not a card), then three cards: Cooking ideas (the hero, with More ideas inside it), On the way out, Running low. A card with nothing in it is not drawn (Empty is absent). Order today: fixed.

## The saved shape (Proposal, device only)
`{v:1, order:[ids], hidden:[ids]}` in browser storage on the phone, key `kitchie.home.cards`, every access guarded. Never sent to the server (design-principles "Preferences are client-side"). A second phone starts at the default. No schema, no tool, no server change.

## Options
| | What | Against DESIGN.md |
|---|---|---|
| **A Hold a card** | Hold a card 480 ms: every card folds to a one-line band, the held one lifts; drag to move; drop on **Hide** to hide. Hidden cards: a quiet "1 hidden" chip at the foot (absent at 0) opens the list in B. Keyboard: Alt+Up/Down, or Move up, Move down, Hide buttons that show on focus. Undo bar 5 s. | Follows 8 and 9.6 (long hold moves, no edit mode). Same fold-then-drag as Pantry D-3. Adds one chip only when something is hidden. |
| **B Home cards list** | Settings, Looks, **Home cards** (value "3 of 3"). A sheet: a switch per card, hold a row to move it, Reset when something differs, "This phone only". Double tap a row puts that card back. Nothing added to Home. | Follows 8, 9.4 (switch), 9.5 (one place in Settings; search finds it). Slowest to reach. |
| **C Edit mode** | Edit button in the greeting row; every card shrinks to a preview with a grip and a switch; Done, Reset. | **Conflicts with 9.6** ("no edit mode, pencil or reorder button"). Drawn only because the issue says "like phone widgets". |

**Recommendation (for the owner to change): A for moving and hiding, with B's list as where hidden cards and Reset live.** A alone cannot reset or bring back a card without B; B alone is slow. C only if the owner overrules 9.6 in writing.

## Edge cases from the issue: Proposals
1. **Urgent card hidden.** Hiding On the way out is allowed. When something is past its use-by (red minus, same threshold as the red mark) or due today, one slim red row stays: "On the way out  −2D · 1", tap opens it. Nothing shows otherwise. Alternative: hide fully. Cost of a wrong guess: food wasted unseen vs. a row the person said they did not want.
2. **New card in a later release.** Goes in its default place: right after the card that precedes it by default, in the person's own order; marked "New" in the list until the list is opened once. Never forced to the top. Alternative: at the end. Drawn with an example card "This week" (not in the app).
3. **Empty cards stay absent** even when placed or ranked first (`state=empty`). The list shows them as "Empty now" so a choice can be made ahead. Nothing is stored about emptiness.
4. **Reset.** Inside B's sheet (Reset, shown only when something differs; toast "Back to default" with Undo) and C's edit bar; per card by double tap on its row. Nothing added to Home. Hold-and-move and hide each also give an Undo.
5. **Phone only.** Desktop Home (rail and side panel) is not drawn. **Open:** same preference or none on desktop.
6. **Device only.** Said once in the list ("This phone only"), because it changes a decision (a second phone starts at default).
7. **No Recipe.** Cooking ideas is not listed (`state=norecipe`).

## Presentation choices (DESIGN.md 9.4)
On or off = switch (label.sw, same markup as settings-flat). Order = drag with a line showing where it lands; a held card gets size and shadow, not a second accent. State: eye-off glyph plus count, grip, "New" with a dot, red row has an alert glyph and a minus: never colour alone. Words: Home cards, Hide, Reset, Done, Edit, "1 hidden", "This phone only", "Empty now", "New".

## Loads: default path and deferred (DESIGN.md 6)
Default Home path is unchanged: no new request, no new script for a person who never customises. The build reads one small key at draw time to order and hide the cards (server draws the default order; the order script runs once, with the device's day, like mobile-home.js). **Deferred until used:** the drag code (loaded on the first hold), the sheet and its markup (first tap of the chip or the Settings row), the Undo wiring. The mock page itself loads `theme.css`, the copied `mobile-home.css`, `hw.css`, `hw.js` (about 25 KB together, no images).

## Checked and not checked
Checked in headless Chromium with mouse events: hold at 480 ms folds (not before), a drag before 480 ms scrolls and does not fold, reorder, drop on Hide, chip, switch, Reset, double-tap, keyboard buttons, Undo, new-card place; light and dark; 390 and 360; +30% with no sideways scroll. **Not checked: a real phone** (feel of the hold, buzz, touch scrolling while folded), VoiceOver and TalkBack, reduced motion, the 44 px targets measured by script (sized by rule only), the build's storage code.

## Questions for the owner
1. Which option, or A with B's list? 2. Urgent card hidden: slim red row (proposed) or hidden fully? 3. New card: after its default neighbour (proposed) or at the end? 4. Desktop Home too? 5. Is Home cards under Looks right?
