# Pantry top row: pull for search, pull further to refresh

Status: mockup for the owner to review (7 Oct 2026). Not built in Kitchie. Source: owner's voice spec and answers of 7 Oct 2026. Lines marked **Proposal** are choices the mockup made where the spec was silent; the owner has not approved them.

Code: `flows/household/app.js` (search for `PULL_SEARCH`, `prow`), `flows/household/{mobile,tablet,desktop}/styles.css` (`.prow`).

> Desktop (above 1024px, mock only, 9 Oct 2026): the tucked search is replaced by a permanent docked search bar and a tab regaining focus plays the refresh animation over the bar. See "Desktop pantry" at the end of this file and DESIGN.md section 7.

## The row

One row at the top of Pantry, fixed height 56px (it never changes height, so the list never jumps). Three layers share it:

| Layer | Contents | Shown in state |
|---|---|---|
| front | item count at left, Filters button and Add (plus) button at right | rest |
| search | magnifier (under Filters and Add at rest), search field and microphone that open leftwards from it, Cancel at the left | search |
| message | "Let go to refresh", then the refresh animation and its text | let, anim |

Filters opens the existing filter sheet, unchanged. While a custom view is active the Filters button is absent (the strip's Edit replaces it), as before.

## States and thresholds

Distances are finger (or pointer) travel downward from where the gesture started, in CSS px.

| State | When | What the row shows |
|---|---|---|
| rest | default | Filters + Add |
| peek | 8 to 70 px | the front layer follows the finger down by up to 22 px, the magnifier peeks out from under Add |
| search | 70 px or more (first threshold, the lock-in) | front slides down out of the row like a curtain; the magnifier that was underneath opens leftwards into the search field; lock-in cue (below) |
| let | 170 px or more (second threshold) | the search bar slides back up, the row reads "Let go to refresh" |
| anim | released at 170 px or more | one refresh animation plus its text, 2400 ms (1600 ms reduced motion), then back to Filters + Add, toast "Up to date" (kept, owner) |

Everything above is live while the finger is down, in both directions, within one continuous drag from rest: dragging back above 170 px brings the search bar back down, dragging back above 70 px returns the row to rest.

Search and refresh are mutually exclusive (owner): a pull that starts while the search bar is open does nothing at all, so a refresh can never start while search is open. Refresh is reached only by one continuous drag from rest, passing through the search curtain.

Release rules:
- Below 70 px: nothing happens, row returns to where it was.
- 70 to 170 px: the search bar stays open and its field is focused (focus happens on release, because phones only open the keyboard from a touch end). Filters and Add stay hidden until Cancel.
- 170 px or more: the refresh animation plays (see below), then the row settles.

Slide timing: 320 ms, ease `cubic-bezier(.2,.8,.2,1)`. Reduced motion: no slide, layers switch instantly.

## Shallow pull: the magnifier opens into the search field

Owner's voice spec, 7 Oct 2026. At rest the Filters and Add buttons sit over a magnifier. A shallow pull slides them away, the magnifier is revealed at the right edge and opens leftwards into the text field (320 ms, same easing as the curtain). The field takes the width between Cancel (left) and the magnifier (right); the microphone sits inside the field beside the magnifier.

Lock-in cue at 70 px: the field's border turns accent, the magnifier turns accent and pops (scale 1.3 and back), the field flashes an accent tint that fades, and devices that support it give a 10 ms buzz. Dragging back under 70 px closes the field again and clears the cue. Reduced motion: no slide, no pop or flash, the accent border alone marks the lock.

- **Proposal:** Cancel appears at the left (where the item count was), so the magnifier never moves from under Add.
- **Proposal:** the cursor goes into the field on release, not the instant the threshold is passed.

## Cancel and closing search

- Only the Cancel button closes the search bar (owner). Tapping or scrolling the list does not. Cancel clears the query, the front layer slides back up, the list shows all items again, Filters and Add return.
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
- A refresh is already playing, a sheet is open, or the search bar is open: no pull.
- Refresh is drag-only (owner): there is no button, key or wheel way to trigger it.
- Both touch and mouse/pointer drag work. Touch uses touch events with `preventDefault` on the drag so the browser's own bounce or pull-to-refresh does not fire.

## Desktop previews

Mouse drag works like touch (pointer events, same thresholds). Nothing else is added: the wheel, "/" and Escape extras I had added were not in the earlier mockup and have been removed.

## Proposals (not from the owner)

- **Proposal:** the six scenes keep the five that already existed in the mockup and add the timer.
- **Proposal:** thresholds 70 and 170 px were the mockup's existing values, kept as is.

## Resolved (owner, 7 Oct 2026)

- No non-gesture way to refresh: drag-only stays.
- The "Up to date" toast stays after a refresh.
- Return to search or Filters after a refresh: does not apply, search and refresh are mutually exclusive. After a refresh the row returns to Filters + Add.
- Only Cancel closes the search bar; tapping or scrolling the list does not.

## Desktop pantry (owner, voice, 9 Oct 2026)

Mock in `flows/household/desktop/` only. Not built in Kitchie. Full spec and proposals: DESIGN.md section 7, "Desktop pantry: docked search and refresh on tab focus". Summary:

- Above 1024px the row is `[ search bar ] [ Filters ] [ + ]`, the search bar always visible. No pull gesture, no tucked magnifier. Phone and tablet keep everything above.
- The tab regaining focus plays the same refresh scene over the search bar (the bar dims, Filters and Add stay), 2400 ms, then "Up to date". A typed query survives. Triggered in the mock by a real tab focus or Controls > "Simulate tab focus".
- **Proposal:** item count hidden visually on desktop (room), no mic in the bar, repeat focus refreshes within 10 s ignored.
