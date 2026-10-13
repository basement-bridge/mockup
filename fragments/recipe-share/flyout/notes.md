# Recipe share: Share in the desktop summary flyout

Mockup only, nothing built. Fragment: `fragments/recipe-share/flyout/index.html`. Live: https://basement-bridge.github.io/mockup/fragments/recipe-share/flyout/index.html. One slice of sharing a recipe. The mobile and desktop placement on the full recipe page (option A) is `../placement` and is not changed here. Fictional data, placeholder links at `https://kitchie.example/s/...`. Screenshots (dark and light, 1280px): `img/`.

## Owner's words (13 October 2026, voice and typed, with two screenshots)

- Mobile sharing: placement option A. Desktop: placement option A on the main page of the fully opened recipe (already built).
- New: in the desktop recipe summary flyout (the lane that opens when a recipe row is clicked: photo banner, title, "20 min · serves 2", close X, HOUSEHOLD SAYS tiles, members row, NOTES, INGREDIENTS with the Stock-unknown chip, the green "Cook now" and "Plan", the centred "Open full recipe" link with its "O" hint, the footer "Esc to close, ? for all shortcuts"), put a Share button "right next to the Open full recipe link". "Use a sensible visual."
- Tapping it "flies out a share panel like this", in the SAME flyout lane the summary uses, not a popup. The panel is the stub from the placement slice (share icon, "Share this recipe", the one-line explanation, link rows with Cancel, a big green "Make another link", "The household sees every link here and can cancel it."), but here with the real content: the manage slice's links list (option A) and the sheet slice's create form (option A; now option C, see the update below).
- Mobile has no summary flyout (a row tap opens the full recipe page), so this slice is desktop only.

## What is drawn

1. **Summary flyout**, as the live UAT screenshot shows it (the photo is a placeholder banner: the mockup has no photos). **Share** sits on the same row as **Open full recipe**: no links, and with 2 links (count badge, accent outline).
2. **Share panel in the same lane**: a drill-in. Header: Back (round, left), share icon and title, the same round close X. The summary stays mounted one step behind (slides 24px left and hides; Back returns to it with its scroll and focus on the Share button).
3. **Links**: the manage option A rows (rename, Copy link, Cancel link with Undo for 5 minutes, ended links with Renew and Remove from view) under the stub's explanation, then **Make another link** and the household line. No links: an empty state and "Make a link".
4. **Make another link**: the sheet option A form (name, 24 hours / 7 days / 30 days with the end date, "Anyone with the link can look", keep-it-as-it-is-today switch, Create link, a "Making the link" moment), then **Link ready** with the link, **Copy link** (becomes Copied) and **Share**, and **Done**, which returns to the list with a toast.
5. **Keys**: S opens Share (summary). Esc goes back one step (cancels a rename first). Cmd or Ctrl plus Esc, or Enter, closes the whole flyout. O is Open full recipe. ? or H opens the shortcuts list, which now has **S, Share this recipe**, marked New, and the panel's keys. The cue switch in that list hides every key chip and hint line.
6. States on the page: summary with no links, with 2 links, panel, panel with no links, renaming, cancelled with undo, make another link, link made, copied, shortcuts. Dark (Kitchie Night) and light (Kitchie Day) both checked, 1280 and 1440px.

## The chosen visual, and why

A compact **secondary pill**: share icon, the word **Share**, a count badge when links are out, and the **S** key-hint box, on the same row as "Open full recipe" and its **O** box. It is placement option A's chip (`shr-chip`, `shr-n`, `kbd`) reused as it is, so the desktop recipe page and the flyout carry the same Share control. Why a pill and not another green button: Cook now and Plan are the two primary actions of the flyout (RB-D2); Share is a secondary action, like Open full recipe, and a pill beside the link keeps that hierarchy. The accent outline and the count are the only cue that links are out, and they are the same cue as on the recipe page.

## One alternative

**Share as a round icon button in the flyout header, left of the close X**, with a small count badge and the S hint under it (the way the Pantry flyout draws its pencil and history icons). It frees the foot and matches Pantry's header icons, but it is not "next to Open full recipe", it is easy to miss without a word, and a three-line title already crowds the header.

## Proposed decisions (the owner was silent; another agent numbers them)

- Share is a secondary pill with icon, word, count and S, beside Open full recipe; never a third green button.
- The share panel drills into the summary's own lane (replaces it, like Pantry's Edit and History, decision 159). No fourth column, no popup, nothing covered.
- Two steps inside the panel (list, then form or link made); Back is one step each time, and from the links it goes to the summary with focus on Share.
- Esc goes back one step in the panel. On the summary, plain Esc still does nothing; closing is Cmd or Ctrl plus Esc (or Enter) or the X, as everywhere on desktop. Rename's Esc cancels the rename first.
- S opens Share only from the summary, only when focus is not in a field.
- The count on the button is the links still working (not cancelled, not ended). Ended links stay in the list, greyed, as in manage.
- The new link's name defaults to "Link N", not the recipe name, because a recipe with links already out would otherwise get two links with one name.
- After Create, the new link is in the list straight away; Done returns to the list and shows the one-line toast from the sheet slice.
- Share on the link-made screen uses the browser's share sheet where there is one, and says so in a toast where there is not (desktop browsers often have none). Copy link is the main action.
- Mobile: no change. A row tap goes to the full recipe page, where the placement slice's Share lives.

## Open questions (and what a wrong guess costs)

- **Where does Share live when the full recipe page is open?** There it is placement option A on the page; the flyout is closed. Should the shared-links count also show on the recipe row in the list? A wrong guess costs one more line on every row.
- **Plain Esc on the summary.** Kept as "does nothing" for consistency; the owner's wording "Esc or Cmd Esc closes/back" could also mean Esc closes the summary. A wrong guess costs a muscle-memory clash with the Pantry's flyout.
- **Does the desktop link-made screen need a Share button at all?** The sheet slice leaves it out on desktop (no share sheet). It is drawn because the owner listed it; it is cheap to drop.
- **The photo.** The banner is a placeholder; the summary's real banner (and what it shows for a recipe with no photo) belongs to the recipe-browse-full slice.
- **Header crowding.** The panel's header has Back, icon, title and X; at 400px it fits "Share this recipe" with room, but not a longer title. A wrong guess costs a wrapped title.

## Differences from the earlier slices (list for the build)

- **Summary flyout** (`recipe-browse-full`): markup and `rb-*` classes copied (`rb-fly`, `rb-fh`, `rb-ft`, `rb-x`, `rb-fb`, `rb-ff`, `rb-btn`, `rb-open`, `rb-ing`...). Changed: the banner (`fl-banner`) replaces the emoji tile, to match the UAT screenshot; Household says shows 1x and today, a members row and one note as in the screenshot; the Stock-unknown chip replaces All in; the foot's centred link became a row (`fl-ofrow`) holding the link and the Share chip; the lane now holds two flyouts (`fl-sum`, `fl-share`) switched by `data-layer` on `rb-lane`. The list column is a stand-in with one live row.
- **Share chip** (`placement/share.css`): `shr-chip`, `shr-n` and `kbd` copied as they are; only the chip's fill is `--bg` instead of `--surface` because it sits on the flyout's surface.
- **Links list** (`manage`): `rs-*` rows, rename form, Undo line and empty state copied; the row background is `--bg` (the lane is `--surface`), and the empty-state text is the manage option B one. The rows, their logic and the 5 minute Undo are unchanged. The page-level frames, options B and C, and the "Ends soon" state are not drawn here.
- **Create form** (`sheet`): `sh-*` copied, `btn`, `field` and `sw2` scoped under `.fl-frame` instead of loading `recipe.css`. Changed: the name defaults to "Link N"; the custom date, version radios, error box and options B and C are not drawn; the title is "Make a link" and "Your link" (the stub says "Share this recipe" for the list).
- **Stub** (`placement`): replaced. Its "STUB" tag is gone; the stub's wording is kept as it was (the intro line, "Make another link", "The household sees every link here and can cancel it.").
- **Shortcuts list** (`item-edit-flyout`, `desktop`): the `kb` list is copied and drawn inside the frame instead of over the page; rows for S and the panel's keys added.

## Update 13 October 2026: the create form is the sheet's option C, with an optional invite

### Owner's words (13 October 2026)

- The create-link sheet is option C: it shares "the usual" version by default, a version choice only when the recipe has other versions. The sender can optionally include an invite (single-purpose: only the first person to activate the link claims it; it sets up a new household, never joins one; it respects the member's maximum-invites limit). The count lives in the usual place of the existing invite functionality; no new allowance UI. The share panel is the links view (manage option B), and the panel and the sheet read as one flow.

### What changed

- **Make a link** is now the sheet's C form: Link name ("Link N", as before), Which version (only when the recipe has other versions; this recipe has one, so the default drawing has none, and the "Form, versions" state shows it with The usual preselected), Link works for, **Include an invite** (off by default), one line of what they see, Create link. The pinned switch and the custom date are gone (see `../sheet/notes.md`).
- **Links list** now carries manage's invite parts: the allowance card above the list ("2 of 3 invites left. Cancel a link and its unused invite comes back."), and a quiet invite line on a row ("Invite waiting", "Invite claimed Sun 11 Oct", "Invite ended with the link"). The allowance is derived from the rows (waiting plus claimed), as in manage.
- **Link made** shows an invite line under the link when one was included; the new row in the list carries "Invite waiting"; Done's toast adds "Its invite is waiting for the first person to use it."
- **New states** in the strip: Make a link, Invite on, Invite limit (3 of 3 in use: switch disabled with its reason), Form with versions, Link made, Made with invite, Copied, Error (nothing made, no invite used; Try again). `?fail=1` makes the first Create fail live.
- Copied: `sh-inv`, `sh-cnt`, `sh-invm`, `sh-err` from the sheet; `rs-allow` and `rs-inv` from manage (the card's background is `--bg` here because the lane is `--surface`).

### Proposed decisions (unnumbered; the owner was silent)

- Same proposals as the sheet: invite off by default; one helper line; the switch disabled at the limit with a one-line reason; the count always visible; no pinned control; a version row only with 2 or more versions.
- The allowance card shows whenever the list does, even at "3 of 3", so the limit is known before Make another link. It is not repeated in the form (the form shows only the count beside the switch).
- Cancelling a link whose invite is waiting returns it to the allowance at once (the card moves live); a claimed invite stays spent. Same as manage.
- A new link with an invite appears in the list with "Invite waiting" straight away.

### Open questions

- The same as the sheet's (does the link follow the usual; off by default; add an invite later; per member or per household). The flyout adds none of its own.
- Cost of a wrong guess on the allowance card showing at "3 of 3" with nothing out: one extra line in the panel for members who never share an invite.

## What the default path loads and what is deferred (DESIGN.md section 6)

Default path: `theme.css`, `shared.css`, `flyout.css`, `flyout.js`, no images, no network. Deferred: `desktop.css` and `desktop.js` (the window, the lane and the keys) are fetched only at 1024px and up; under 1024px nothing but a one-line "desktop only" note is drawn. The share panel is drawn with the summary in the mockup so a screenshot is steady; in the build it should load on the first Share press, not with the summary. Nothing reloads the page (section 6a).
