# Locations and spots: managing them in Settings > App (called Kitchen until 11 Oct 2026)

Status: design options for the owner to review (8 Oct 2026). Not built in Kitchie and not in `flows/household/` yet. Lines marked **Proposal** are mockup choices where the owner was silent; none is settled.

Code: `fragments/locations-spots/index.html` (all three options, one shared model).

## What the owner asked for

"Under Kitchen in Settings you have categories. We should also have something for locations and spots. Remember location and spot have a parent-child. I would think about what's the best way to tackle that." (owner, voice, 8 Oct 2026). A request for design options, not a build.

From the existing app (not new): renaming a category updates every item at once (Settings > Kitchen > Categories, `cats` screen in `flows/household/app.js`, a flat list). Locations are the three areas Fridge, Pantry, Freezer; spots are the shelf-level places such as Door, Crisper, Top shelf. Items already carry an area and a spot.

## The three options

Same item rules under all three; they differ in the management surface.

1. **The tree.** One screen, each location a card with its spots nested under it, a three-dots menu on every row (rename, add a spot, move to another location, move up or down, remove or merge). Suits people who want the whole kitchen in view. Longest screen, busiest rows.
2. **Drill in.** A list of locations like Categories; tap one to see its spots; tapping a row opens a form (name, and for a spot a "Lives in" field). Reorder is a mode with up and down buttons. Suits phone-first use and big households. Spots are a tap away; moving is a form field.
3. **Pick, then act.** Cards holding spots as chips; tap one to select it and a bottom action bar offers Rename, Move, Earlier, Later, Remove. Playful and compact; dense with many spots and the bar covers the bottom.

Each has an empty state (no locations: "No places yet"; a location with no spots: "No spots yet, items just go in X") and a confirm step for removal.

## What happens to items

- **Owner:** renaming a location or spot updates every item stored there at once, like categories.
- **Proposal:** the id stays, so anything that names the place (filters, the scan-in shelf, item sheet) follows the rename.
- **Proposal:** remove and merge are one action, "Move items to...". The person picks an existing spot (or "no spot, just the location"); picking an existing spot is a merge. Nothing is pre-selected and the destructive button stays off until a pick is made. Its label states the count and destination ("Move 4 items to Fridge, Crisper and remove Door").
- **Proposal:** a spot or location holding nothing gets one plain confirm, no destination.
- **Proposal:** moving a spot to another location carries its items. Blocked if that location already has a spot with the same name.
- **Proposal:** removing a location moves its items to another location. Its spots are kept as spots there (same names merge) by default, or dropped, in which case items land with no spot. The last location cannot be removed.
- **Proposal:** every change shows an Undo toast; reorder uses buttons, not drag.
- **Proposal:** items may sit in a location with no spot ("Not in a spot"), shown read-only.
- **Proposal:** names are unique within a parent (two spots called Door in different locations are fine). Max 24 characters, as in people settings.
- **Proposal:** entry is one new row, "Locations and spots", under App next to Categories; the household's, not per device.

## Open questions (and the cost of a wrong guess)

- Can a spot belong to two locations? Mockup assumes one parent. Wrong guess: a real model with shared spots breaks the move and merge rules.
- Can items sit in a location with no spot? Mockup says yes. Wrong guess: either forced junk spots or blocked adds.
- Does the real Kitchie model allow renaming a location, and does a rename update items by id or by name? Not checked. Wrong guess: a rename that leaves items orphaned.
- Word: code and the flow say "area"; the owner says "location". Which does the person see?
- Keep or drop spots by default when a location is removed?
- Who may change these: anyone in the household or only the owner?
- Which option leads, or one for small households and one for large ones?

## Performance (DESIGN.md section 6)

Default path: the page, shared theme, one inline script, no images. In the real app the screen needs names and item counts only (a location's spots load when opened in option 2). Rename, move and remove sheets and the destination picker are built on tap. Other themes load on choice.
