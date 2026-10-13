# Recipe share links: manage (seeing, renaming, cancelling)

Mockup only, nothing built. Fragment: `fragments/recipe-share/manage/index.html`. Live: https://basement-bridge.github.io/mockup/fragments/recipe-share/manage/index.html. One slice of sharing a recipe; the Share button, the create sheet and the recipient's page are other slices. Fictional data, placeholder links at `https://kitchie.example/s/...`.

## Owner's words (voice, 13 October 2026)

- A recipe he is happy with can be shared with people outside the household through an expiring signed link, "in spirit like the shopping-list link".
- "Somewhere in the recipe there should be information about the pending URLs that people can go and cancel."
- Links can be renamed, like the shopping link.
- Recipients need no sign-in; links are multi-use (not single-use) and they expire.
- The intent is growth, so showing that a link is being used (opens count, last opened) is useful.

## What is reused

- Shopping link (`docs/knowledge/shopper-link.md`): a link line with its countdown and Cancel (SL-D12 multi-use, SL-D15 cancel in one tap), Withdraw wording, the live-link row in `fragments/shopper-link/member.css` (`sl-live`).
- Recipe photos (`recipe-photos`, P-D17): remove is hidden at once, Undo for 5 minutes, then gone. Cancel uses the same pattern and wording ("Undo for 5:00, then ..."), so no confirm dialog.
- Recipe page (`recipe/`, `recipe-photos/recipe.html`): the continuous scroll and the R-O2 jump row. Pantry item panel lane for the desktop panel (DESIGN.md section 7).
- SL-D19: no icon that suggests delete unless it deletes. The rename "Keep" button is a word, not a cross; the close button only closes.

## What is drawn (all three options)

A row per link: **name** (tap it, or the pencil, to rename in place), **expiry countdown** ("6 days left", "9 h left", "45 min left"), **opens count and last opened** ("4 opens · last 2 h ago", "Not opened yet"), **Copy link**, **Cancel link**. Active links first, ended ones last.

- Rename: inline, Enter or Save keeps it, Escape or Keep leaves it, 40 characters, an empty name keeps the old one.
- Cancel: one tap, no confirm. The row becomes an Undo line with a live 5 minute clock, then it stays cancelled and leaves the list. Nothing is hard deleted.
- Ending soon: under 24 hours, the row gets the accent border and the countdown turns accent.
- Ended: greyed, dashed, "Ended 2 days ago". **Renew** gives the same link another 7 days (the already-sent message works again). **Remove from view** hides it, with the same Undo.
- Empty, 3 active, ends soon, one expired, cancelled with undo: all switchable on the page, phone and desktop, all three options.

Every control earns its place: no expand/detail, no URL text (Copy covers it), no bulk actions, no sort, no extend-by-days picker (Renew has one fixed answer).

## Options

**A. A Shared section in the scroll (recommended).** After Photos, with a "Shared 3" chip in the jump row. Both appear only when there is something to show.
- Rationale: it is "somewhere in the recipe", costs the cooking job nothing (end of page, absent for most recipes), needs no new container on either form factor.
- Trade-off: the way in is a scroll or the chip; nothing at the top says links are out apart from the chip count. Empty state is absence, nothing to design.

**B. A panel from the Share button.** The button carries a count badge; it opens a bottom sheet on phone and a side panel on desktop, with "New link" and the list.
- Rationale: nothing on the page, one door for making and managing, the only option with a real empty state.
- Trade-off: one tap deeper, the information is not in the recipe until opened (weakest reading of the owner's "in the recipe"); on desktop the panel uses the lane the column was using; it ties this slice to wherever the Share button ends up.

**C. A card in the recipe's details.** Between title block and ingredients: "Shared outside the household, 3 links out", opening in place.
- Rationale: always seen, so a link about to end is noticed.
- Trade-off: it pushes Ingredients down in the cooking job even closed, for a rarely used feature (DESIGN.md section 1).

**Recommendation: A.** If the integration agent's Share button has no room for a badge or sheet, A needs nothing from it. A and B combine well: the Share button could scroll to the section when links exist (not drawn).

## Proposed decisions (unnumbered; the integration agent numbers them)

- **Proposal:** a link is managed where the recipe is, by any household member (not only its maker), like the shopping link.
- **Proposal:** cancel is one tap with Undo for 5 minutes (P-D17 pattern), not a confirm. Undo puts the same link back; after 5 minutes it stays cancelled. A recipient who opens a cancelled link sees the recipient slice's "no longer available" page.
- **Proposal:** ended links stay in the list, greyed, until renewed or removed from view; removal is a hide, not a delete, with the same 5 minute Undo.
- **Proposal:** Renew gives the same link 7 days from now. "Ends soon" is under 24 hours.
- **Proposal:** the name is for the household only; recipients never see it. A link made without a name is called by its date ("Link, 13 Oct"), set by the create slice.
- **Proposal:** "opens" counts visits to the recipe page by a person, not link-preview fetchers (WhatsApp, Signal crawlers). Last opened is shown in words, exact times on hover/title only for the end time.
- **Proposal:** option A shows the section and chip only while a listed link exists; the empty state is absence.
- **Proposal:** no cap on links per recipe is drawn (the shopping list caps at 3, SL-D16).

## Open questions

1. Where does the Share button sit, and does it scroll to the section (A), open the panel (B), or neither? Depends on the other slice. A wrong guess costs a rework of B only.
2. Default expiry for a recipe link (7 days drawn for Renew; the shopping link is 48 hours). Recipes are evergreen, so longer seems right; owner to say. Wrong guess: one constant.
3. Should there be a cap per recipe or per household, as the shopping list has (3)? Not drawn.
4. Does Renew keep the same URL (drawn) or make a new one? Same URL means old messages work again; a new one is safer if the link leaked.
5. Are opens counted only by distinct visitors or every open? Drawn: every open, previews excluded.
6. Should the household see who opened (they have no sign-in, so only counts)? Not drawn, and not possible without sign-in.
7. History: should cancelled and removed links be searchable in the History feature (area history-feature)? Not drawn.

## Default path and deferred (DESIGN.md section 6)

Default path: `theme.css`, `shared.css`, `manage.css`, `manage.js`; no images, no network, one 1 second timer only while an Undo line shows. Deferred: only the form factor on screen loads its own `phone.css` + `phone.js` or `desktop.css` + `desktop.js`, on first show (section 7: viewport-specific code in its own file). Cancel, rename, renew and undo change the row in place, no reload (section 6a). In the build the list would come with the recipe page's own read of the recipe's links, no extra request.

## Files

`index.html` (page and controls), `manage.css` and `manage.js` (list, rows, interactions, states), `phone.css` / `phone.js`, `desktop.css` / `desktop.js` (the drawings of A, B and C). The row and its classes (`rs-row`, `rs-name`, `rs-left`, `rs-stats`, `rs-acts`, `rs-undo`) are what a build lifts; the frame classes only draw a recipe page around it.
