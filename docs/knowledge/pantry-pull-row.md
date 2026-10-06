# Pantry top row: pull for search, pull further to refresh

Status: mockup for the owner to review (7 Oct 2026). Not built in Kitchie. Source: owner's voice spec of 7 Oct 2026. Lines marked **Proposal** are choices the mockup made where the spec was silent; the owner has not approved them.

Code: `flows/household/app.js` (search for `PULL_SEARCH`, `prow`), `flows/household/styles.css` (`.prow`).

## The row

One row at the top of Pantry, fixed height 56px (it never changes height, so the list never jumps). Three layers share it:

| Layer | Contents | Shown in state |
|---|---|---|
| front | item count at left, Filters button and Add (plus) button at right | rest |
| search | search field, microphone button, Cancel button | search |
| message | "Let go to refresh", then the refresh animation and its text | let, anim |

Filters opens the existing filter sheet, unchanged. While a custom view is active the Filters button is absent (the strip's Edit replaces it), as before.

## States and thresholds

Distances are finger (or pointer) travel downward from where the gesture started, in CSS px.

| State | When | What the row shows |
|---|---|---|
| rest | default | Filters + Add |
| peek | 8 to 70 px | the front layer follows the finger down by up to 22 px, nothing else changes |
| search | 70 px or more (first threshold) | front slides down out of the row like a curtain, revealing the search bar |
| let | 170 px or more (second threshold) | the search bar slides back up, the row reads "Let go to refresh" |
| anim | released at 170 px or more | one refresh animation plus its text, 2400 ms (1600 ms reduced motion), then back to rest, toast "Up to date" |

Everything above is live while the finger is down, in both directions: dragging back above 170 px brings the search bar back down, dragging back above 70 px returns the row to rest (or to search, if it was already open).

Release rules:
- Below 70 px: nothing happens, row returns to where it was.
- 70 to 170 px: the search bar stays open and its field is focused. Filters and Add stay hidden until Cancel.
- 170 px or more: the refresh animation plays (see below), then the row settles.

Slide timing: 320 ms, ease `cubic-bezier(.2,.8,.2,1)`. Reduced motion: no slide, layers switch instantly.

## Cancel and closing search

- Cancel: clears the query, closes the bar (the front layer slides back up), the list shows all items again, Filters and Add return.
- Desktop: Escape does the same. "/" opens search from anywhere on Pantry and focuses the field.
- The mic button uses the browser's voice recognition where available (unchanged).

## Refresh animations

Six scenes, each an inline SVG drawn in theme tokens only (colours follow the theme), looping while shown, with its own text. One is picked at random per refresh and never the same one twice in a row. No brands.

1. Pot with a stirring spoon: "Stirring the pot. Gently."
2. Toaster with two slices popping: "Toast is thinking about it"
3. Three veg being juggled: "Juggling veg. Don't tell the carrots"
4. Kettle with steam: "Kettle's on. Obviously."
5. Egg with a face: "Egg is feeling fragile"
6. Kitchen timer, hand going round: "Timer's ticking. Nearly ready"

Reduced motion (the OS setting, or Settings > Reduce motion): the text only, no drawing, for 1600 ms.

The refresh is fake in the mockup. In Kitchie it ends when the real reload finishes; keep a minimum of the animation time so it does not flash.

## When no gesture happens

- The list is not scrolled to the very top when the finger goes down: no gesture, the list scrolls normally. If the list scrolls during a gesture, the gesture is dropped.
- The first move is mostly sideways (row swipes, ribbon, chips): not a pull.
- A second finger, a touch that starts on a swipeable row, or one that starts in the search field: no pull.
- A refresh is already playing, or a sheet is open: no pull.
- Both touch and mouse/pointer drag work. Touch uses touch events with `preventDefault` on the drag so the browser's own bounce or pull-to-refresh does not fire.

## Proposals (not from the owner)

- Desktop previews: a mouse drag works like touch. **Proposal:** wheel or trackpad scroll up while at the top counts as a pull with the same px thresholds (released when the wheel is quiet for 220 ms), plus the "/" and Escape keys, so search is reachable without a gesture.
- **Proposal:** if search was already open when a refresh is pulled, the row returns to the search bar afterwards (query kept), not to Filters + Add.
- **Proposal:** the six scenes keep the five that already existed in the mockup and add the timer.
- **Proposal:** thresholds 70 and 170 px were the mockup's existing values, kept as is.

## Open questions

- Is there a non-gesture way to refresh for keyboard and screen-reader users? None is designed yet.
- Should "Up to date" toast stay after the animation, or is the row settling enough?
- Should Cancel also dismiss on tapping the list or scrolling it?
