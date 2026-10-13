# Recipe share, placement: where the Share button lives

Slice of recipe sharing (mockup only, nothing built). Page: `fragments/recipe-share/placement/index.html`. Live: https://basement-bridge.github.io/mockup/fragments/recipe-share/placement/index.html

## The owner's words (voice, 13 October 2026)

- A recipe he is happy with can be shared with people outside the household through an expiring signed link, in spirit like the shopping-list link.
- Recipients need no sign-in to view; it works the same if they are signed in. Links are multi-use (not single-use) and they expire. The intent is growth.
- "Find the best place to put a share button" at the top of the recipe. Mock up a couple of ways to share it.
- Links can be renamed. Pending and active links are visible inside the recipe, where they can be cancelled.

Scope of this slice: only where the entry point lives, with a count of active links, and a stub of what it opens. The links panel (rename, cancel) and the create sheet are another slice.

## What it is built on

The frames are the real recipe page (`recipe/detail.html`, one continuous scroll, versions strip above the docked jump row when there are several versions, top row Back / star / History / Edit / More). `phone.js` and `desktop.js` add only the entry point and the stub by script, so nothing of the settled page is copied. Desktop has no recipe tab yet (handoff X13), so `desktop.html` is the Pantry's layout (rail 88px, 736px lane for the column, 400px flyout) with the recipe page widened into the column. Phone uses the recipe sheet (`RCP.sheet`); desktop opens the stub in the flyout lane, in place (DESIGN.md 6a).

Wording follows the shopping-list link (`docs/knowledge/shopper-link.md`): the control says what it does (SL-D1 renamed Share to "Someone else is shopping" because it was only for a hand-off), one line per link ("Opened 6 times · ends in 5 days", then Cancel), and the same link icon. Difference: shopping links need no label (SL-D3); recipe links can be renamed, so each line carries the owner's name for it.

## Options (A is the recommended default)

**A. Icon in the top row (recommended).** Phone: a share icon between Edit and More, with the count of active links as a badge. Desktop: same slot, drawn as a Share pill with the count and a key hint (S).
- Why: it is the top of the recipe; it reads as an action on this recipe like Star, History and Edit; the badge says "this recipe is out there" without opening anything; identical with one version or several; opens in place.
- Trade-off: five controls in a phone top row (fits at 390px because the title is empty there; 360px is tight); an icon alone is easy to miss for a growth feature.

**B. Chip in the title block.** A labelled Share chip joins the time and Serves controls under the title, with the count. Same on phone and desktop (desktop adds the key hint).
- Why: names the action in words, so it is the best for discovery and growth; sits near the thumb.
- Trade-off: scrolls away with the title; not literally the top row; the meta row can wrap on a narrow phone with long portion text.

**C. Quiet: More menu plus a status line.** Share is the first row of the More sheet; a line under the title (Shared with 2 links, see them) appears only when links exist and opens the same panel.
- Why: leaves the top row as settled and adds nothing for recipes that are not shared.
- Trade-off: the first share is hidden behind the three dots, the worst for the stated goal of growth. Shown as the baseline of doing nothing loud.

## Recommendation

A. Add B's word on phone later if testing shows the icon is missed (the badge and the desktop word already help).

## States shown (every option, phone and desktop)

- No links yet: no badge or status line (C shows nothing outside the menu).
- Two active links: badge 2 on the icon or chip; C's status line.
- Recipe with several versions (Egg fried rice: strip docks above the jump row) and with one version (Chickpea curry). The entry does not change with the versions; it belongs to the recipe, not a version (see open question).
- Tapped: the stub (phone sheet, desktop flyout lane) lists the two links by name with Cancel, and Make a link / Make another link. All of that is a stub.

## Proposed decisions (the owner was silent; each is a proposal)

- Share is a recipe action: the entry sits in the top row (icon on phone, labelled pill on desktop), with the count of active links on it.
- The count shows only active links (not expired, not cancelled); nothing shows at zero.
- Tapping the entry opens in place: a bottom sheet on phone, the right flyout lane on desktop (no navigation). Same for the status line (C) and the More row (C).
- Key S opens it on desktop, shown as a key hint like E and the comma; plain Esc closes nothing (Ctrl or Cmd plus Enter closes), as elsewhere. Not on phone.
- Same entry for every household member (as the rest of the recipe actions, R-O5).
- The stub's sentence: "Anyone with a link can read it, with no sign-in. A link works more than once and then expires."
- Active links are listed by their own name (renamable); the household sees and can cancel any link (same as the shopping links).
- Performance: default path is the recipe page plus one small stylesheet and a small script; the stub is built on tap; the desktop host and key handler load at 1024px and up only.

## Open questions

1. Is a link for the recipe or for one version? The entry is on the recipe, but a recipe with versions needs an answer (the version you are looking at, the household's usual, or a choice in the create sheet). Wrong guess: someone shares "With peas" and the recipient sees the Original.
2. The word: "Share", "Share this recipe", or a hand-off wording like the shopping list's rename? (Share fits here because the recipient is outside the household.)
3. Default expiry for a recipe link (the shopping list uses 48 hours; a recipe may need days). The stub shows 5 and 12 days only as sample text.
4. Is the badge enough, or should the Share pill (B) also appear on the phone top row for growth?
5. Should a recipe that has never been cooked or has no keeper version offer sharing at all ("a recipe he is happy with")?
6. Any cap on active links per recipe (shopping has 3)?
7. Does 360px need a different top row (A is tight there)?
