# Shopping, on desktop

Status: owner ask, typed, 15 October 2026. Mockup drafted (`fragments/desktop-shopping/`); Kitchie issue `basement-bridge/kitchie#775`. Everything below the owner's words is a **Proposal** until he reviews it (decisions SD-1 to SD-12).

## Job

The same as the phone's: see what to get, tick it as it goes in the basket, take it off when it is bought, and hand the list to someone else when they are the one going ([shopping-without-the-app.md](shopping-without-the-app.md)). On a wide screen the person is also at a keyboard and a pointer, and the screen should look like the rest of the desktop app.

The owner (typed, 15 Oct 2026): "the shopping [screen] on the desktop needs to be design aligned with overall design language of the app, using the governance approach, deal with this." His screenshot (UAT, dark): a narrow column with a large empty area on its right, a dashed "Is someone else shopping?" card, a hint line and plain rows with emoji (grapes for a sambar powder blend, an ice-cream cup for Cendol, a plate and cutlery for three more).

## How we know the person is in this job

They opened the signed-in member's Shopping screen on a window 64rem (1024px) or wider. Pantry's desktop rules apply ([../desktop-layout.md](../desktop-layout.md)).

## What leads

The list, with a count at the top ("8 to get") like the Pantry's "8 items". Each line: the tick, a picture tile, the name, the amount in the accent, what is left at home. On hover or on the current line, Bought and Remove with their key caps. In the panel lane, the hand-off: "Is someone else shopping?", the links that are out, the "still needs sorting" nudge, and a keys line.

## What this job does not need

No title (the rail says where you are), no new actions, no new data. No picture that is not the item's: a line with no emoji shows nothing in its picture slot. The panel is absent when it has nothing to hold.

## Mockup

`fragments/desktop-shopping/index.html` (decisions, open questions) and `shopping.html` (states: `?s=links|handoff|sorting|empty`, `?cur=3`, `?o=b`, `?vp=1024|1280|1440|1920|2560`). Option A (hand-off in the panel) recommended; option B (card stays in the column) drawn, not chosen. `frame.css` is the app's own frame; `desktop-shopping.css` is what the build lifts.

## Decisions (Proposals)

- **SD-1** Frame: rail 88, column 640 plus 48px gutters, panel 400, one left-anchored group (no new widths).
- **SD-2** Header band: a 1.5rem count "N to get", the same number as the rail's badge, absent at 0.
- **SD-3** Panel content: the hand-off slot (card, links, nudge), same markup, same live patching; absent when the slot is empty.
- **SD-4** Keys line at the foot of the hand-off: J K move, D bought, S off the list, E amount, ? all keys (the keys of issue #594).
- **SD-5** Hover fill; the current line stays #594's fill and bar and loses the doubled focus ring.
- **SD-6** Bought and Remove as the Pantry's hover buttons with key caps, the row's own forms; no touch "more" button at desktop width; tick and swipe unchanged.
- **SD-7** Picture tile 40px / 22px glyph (Home's tile scaled); no-picture line keeps an empty slot, no plate. Alternatives: dashed tile, collapsed slot.
- **SD-8** Hint line kept.
- **SD-9** Everything else unchanged.
- **SD-10** Phone and tablet untouched.
- **SD-11** Nothing new on load: one block in `desktop.css`, the count follows the badge in `desktop-shopping.js`.
- **SD-12** Option B drawn, not chosen.

## Open questions

1. Hand-off in the panel (recommended), or a line's Pantry item there (new behaviour)? A wrong guess costs one move of CSS and markup.
2. The empty picture slot on desktop only, or the plate gone on the phone too (the design principles: one decision for every form factor unless the owner says otherwise)?
3. Keep the touch hint on desktop, or replace it with the keys?
4. Emoji that do not match an item (grapes, ice cream) are stored data, not the matcher: Kitchie issue #776, evidence only.

## For the implementation

- Copy `desktop-shopping.css` into `server/src/desktop-css/shopping.ts` (`body:has(nav.bar)` is `${HAS_RAIL}`, drop the `@media` wrapper: `desktop-layout.ts` adds it); the one phone-side rule (`.dh-s{display:none}`) goes in `SHOPPING_CSS`.
- Markup the page adds: `<div class="shop-hd dh-s" id="shop-hd"><span class="count" id="shop-count">N to get</span></div>` before the hand-off slot, and `np` on a picture span that shows the fallback. The mockup's `mock.js` draws every other element as the server does.
- The count follows the rail badge (`desktop-shopping.js`), which `shopping.js` already keeps equal to the lines on the list.
