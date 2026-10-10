# Shopper link: someone else is shopping, and the household's list follows them live

Status: owner direction by voice, 10 October 2026 (the idea), and owner review of the mockup the same day (decisions **SL-D1 to SL-D16**, below), then the owner's live test of the built page on 11 October 2026 (voice; decisions **SL-D17 to SL-D20**, below). Phase one is Kitchie issue `basement-bridge/kitchie#479`; phase two (scan the receipt) is drawn only, deferred, and not built. Lines marked **Judgement call** (SL-J1 to SL-J29) are choices the mockup made where the owner was silent; each is listed in the pull request under "Decisions to review before production". **Owner replies of 10 October 2026 (typed) confirmed SL-J1, SL-J2 and SL-J4 (as built); SL-J3, SL-J11 and SL-J13 are still open; the rest he did not single out** (section "Owner confirmations, 10 October 2026"). **The 11 October 2026 test revised SL-J9 (and part of SL-J8); its new judgement calls are SL-J18 to SL-J29** (section "Owner live test, 11 October 2026"). Lines marked **Proposal** are the earlier proposals (P1 to P9), most of them revised by the review: the section "What the review did to the earlier proposals" says how.

Code: `fragments/shopper-link/` (the fragment page is `index.html`; the pages it frames are the screens themselves). Job file: `jobs-to-be-done/shopping-without-the-app.md`. Live: <https://basement-bridge.github.io/mockup/fragments/shopper-link/>.

Numbering: this feature has its own series, as the recipe tab has R-D and recipe versions V-D. SL-D is an owner decision, SL-J is a judgement call. The next free number is the next one after the highest in this file.

## What the owner said

Owner, by voice, 10 October 2026 (names left out):

- "The intent of the entire thing here is to reduce the friction and not force people to be in the system for them to make use of it." "Find people where they already naturally live." Not everyone in a household will open the app.
- The person who runs the kitchen makes the shopping list and puts it into whatever app the family already uses (Signal, WhatsApp). Whoever shops (a partner, a household assistant who is a real person) is not on the app: "Give me the list, I'm going to get those things in the house. And that's the extent of how engaged they're willing to be."
- The gap: "they bought some of them, they've gone and substituted some of those things, and there's no way for Kitchie to get all of that information back in."
- The idea: "at the time of sharing the shopping list, what if Kitchie could spin off a one-off link where the person who's doing the shopping can [tick it off], then that person is not forced to be in the system. That link is just unique for that person. It expires, let's say, forty-eight hours. That's good enough."
- Phase one: "we can just get that person to tick off what they bought, and make any substitutes that they made decisions on, and if they don't tick it off, we kind of know that. Get a confirmation, of course, but we know that person has now acted on that list either fully or partially."
- "The call to action there needs to be two modes. One is that they just tick off what's on the list and do the substitutes. Let's start with it as an MVP."
- Phase two, not built now: "they can scan the receipt itself. And that receipt scanning needs to be super quick, over WebSocket. The Kitchie server should do image recognition on it [find the best OCR / computer-vision library]. We are not going to use any tokens for this [no AI model]. Then it pushes it back to that person through the same WebSocket. If a certain threshold, 80% of the items that were on the shopping list, are findable in the receipt after OCR, then we say that image was decent enough. If not, they have to rescan it. After maybe one more try, if it's failing, we push them down the path of ticking off what's on the list, by simply saying: hey, it seems like that didn't work out, it might just be easier for you to just clear this based on the list."
- Someone in the room argued that one photo of the receipt is less work than ticking every line. The owner agreed both modes belong, with ticking first. The shopper "may choose neither" and that is accepted.

## What the owner decided (10 October 2026, voice)

- A one-off link is made when the shopping list is shared. It is unique and it expires: 48 hours.
- The person holding it is not forced into the system: no sign-in.
- Phase one is ticking what was bought and saying what was substituted. Lines left unticked are known to be not bought. Acting on the list fully or partially both count.
- Two modes in the end, ticking first. Receipt scanning is phase two: over a WebSocket, read on the Kitchie server, no AI model, good enough at 80% of the list's lines found, one more try, then the fallback message that steers to ticking.
- Choosing neither is accepted.

## Decisions SL-D1 to SL-D16 (owner review of the mockup, 10 October 2026)

Source: the owner's consolidated feedback on the fragment (the Claude Docs feedback doc of that date). Each decision says which earlier proposal (P) it revises and which open question (Q) it answers.

**Naming**

- **SL-D1.** "Share" becomes a hand-off wording, for example "Someone else is shopping". It is only for when someone else does the shopping.

**Live updates** (the new thirteenth open question; revises P1 and P3)

- **SL-D2.** When a result comes back on any link, the real shopping list updates immediately for members. It is not gated on a "Done shopping" tap. Revises P1; answers Q1 and Q13.
- **SL-D3.** Other live links for the same list reflect the update in near real time. Two shoppers (for example morning and afternoon) must not double-buy. P3's frozen snapshot becomes a live, shared view across concurrent links. Links need no label: the result's content tells concurrent shoppers apart. Revises P3; answers Q3.
- **SL-D4.** The result card ("Got 9 of 12 · 1 swap · 2 not got") is a notification and summary only, not a gate.

**The shopper's page: two modes**

- **SL-D5.** Default is swipe. Every action syncs instantly with no confirm step. Swipe right is got it, swipe left is didn't find it.
- **SL-D6.** Undo is always visible at the top of the page, because the shopper is the person least familiar with the app.
- **SL-D7.** The bottom button in swipe mode is not "Send". It reads "Won't be able to buy these" and applies only to lines still unresolved; lines already synced are untouched.
- **SL-D8.** Multi-select opens on a long-press on any line. The whole list becomes checkboxes; nothing syncs live; the picks are one batch. The bottom button is the original summary send and confirm: three counts, listing only the lines that are not "got". Revises P4.
- **SL-D9.** Each line has a small "got something else" button: an in-place text edit, 120 characters, that syncs instantly as a swap. Revises P2.
- **SL-D10.** The free-text "also got" box, for things bought that were not on the list, is built now. Answers Q4.

**Pantry behaviour**

- **SL-D11.** Swaps go into the Pantry automatically with the standard add-item matching rules: an existing "fusilli" is topped up when "penne" was swapped for fusilli; otherwise a new item is created. No member hand-add. Answers Q2.

**Link lifecycle**

- **SL-D12.** One link stays usable for its whole validity window however many times it is opened. Each open shows the current state (what is still not bought). A second trip the same day reuses the link. Revises P5; answers Q5.
- **SL-D13.** Validity is 48 hours from sharing; if the link is first opened later, a fresh 48 hours from first open too (effectively whichever gives more time). Answers Q6.
- **SL-D14.** The link goes after the list text in the chat message. Answers Q7.
- **SL-D15.** Cancel is one tap, with no second confirm. Answers Q8.
- **SL-D16.** At most 3 live links per household (P7). A link made but not sent (the share sheet closed without sending) still counts toward the cap, unless the sender withdraws it. Links expire by themselves after their window. Answers Q9.

**Deferred**

- Phase two, the receipt scan (WebSocket image recognition, 80% match, one retry, then the fallback), is out of scope for this round. No changes. It is drawn as Part C on the fragment page and marked deferred.

## Owner live test, 11 October 2026: decisions SL-D17 to SL-D20

Source: the owner's voice feedback after trying the built page (Kitchie's build of this fragment). The mockup is the design contract and the app is rebuilt to match it after this change. Each decision keeps the owner's words as closely as they were relayed.

- **SL-D17. The drag reads at a glance, without reading words.** Dragging a row toward "couldn't find" showed a text tag that was hard to read mid-swipe; he wants to understand the drag without reading. The agreed design: as the row is dragged its background colour grows with the drag, **green toward the right (got it), red toward the left (couldn't find)**, with an icon; the words stay but are secondary. The existing **checkmark** for "got it" is, in his words, "actually fantastic": kept exactly. The existing "couldn't find" emoji or icon "is fine": kept, and not replaced with a cross. Not colour alone: the icon and the words stay, and once letting go would answer the line an outline and a solid colour say so. Contrast passes WCAG AA in light and dark; reduced motion has its own path; the keyboard path (the tick, and the hidden "Couldn't find" button on focus) and the no-script path are unchanged. Revises the plain reveal of SL-D5.
- **SL-D18. Answered lines leave the shopper's list.** Once a line is got (or swapped) or "couldn't find", it drops out of the shopper's own list, so that only what is still left to do is shown, at the top. He does not want a trail of done items ("don't need that"). Nothing is lost: the action is already on the server, the always-visible Undo (SL-D6) brings the last one back, and reopening the link later shows only what is left. When nothing is left the page shows a calm "All done" that still makes clear the household has the answers; nothing bought is not an error. In multi-select (SL-D8) nothing syncs live, so nothing vanishes until the batch is sent. The swap, the "also got" list and the extras behave as they did. **Revises SL-J9** (a second visit drew still-to-get lines first, then the done lines) and the drawing of a locked row for answered lines (SL-J4's rule is unchanged).
- **SL-D19. No control suggests "delete" unless it really removes something.** He saw a plus and a minus on the shopper page and said "minus sounds like I'm deleting it". Every plus, minus, cross and similar control on the shopper page, and on the member's hand-off and result cards, was reviewed, redrawn and relabelled where needed so each icon says what it does. The list of what changed and what was kept, with the reasons, is SL-J25 and SL-J26. Which control he meant was not clear from the relay, so the likeliest were changed and the rest are listed.
- **SL-D20. Not a change.** "Won't be able to buy these" and "No sign-in needed. This link works for another 48 hours." stay as they are.

## Judgement calls SL-J1 to SL-J17 (ours; the owner did not say)

Each lists what was chosen, the other way, and what a wrong guess costs. They are repeated in the pull request under "Decisions to review before production".

- **SL-J1. Where the hand-off control lives: option A, a slot above the list. Confirmed by the owner, 10 October 2026 (typed: "OK").** (Q10; the fragment's favourite of the three, the other two stay on the page). Cost: the wrong one is rebuilt; A moves the list down one row for households that never hand over.
- **SL-J2. A got line also reaches the Pantry by itself. Confirmed by the owner, 10 October 2026 (typed: "OK").** at the amount on the list (1 where the list gave none), with the effect of a member's "Done shopping". SL-D2 says the list is not gated on that tap and SL-D11 names swaps only; leaving gots to wait would leave the Pantry half-updated. Other way: got lines wait, ticked, for "Done shopping". Cost: if gots should wait, the Pantry gains stock a shopper only claimed (undoable per item in History); if they should not, the household pays one tap per shop. The largest call here.
- **SL-J3. How "live" travels.** One server-sent-events stream per open page, each event the whole state, the browser reconnecting itself; a polling fallback is the build's to add. Cost: a different transport changes server code only.
- **SL-J4. Two links, one line. Confirmed by the owner, 10 October 2026, as built: a line answered "got" or swapped on one link is locked on the others; "didn't find" does not lock.** A locked line reads "Someone else got this" (nobody named, P6 stands); a refused write answers 409 and the page corrects itself. *Changed from the first text of this call, which let the other shopper still answer a swap:* the build locks a swapped line too, and his words are the build's rule. The fragment's `mock.js` and notes were brought to match on 11 October 2026 (SL-J29). Cost: a wrong "got" is only undone by the shopper who made it or a member.
- **SL-J5. Swipe is not the only way.** A tap on the tick is "got it" (again is back to open), and each line has a hidden "Couldn't find" button that appears on keyboard focus. Cost: none visible.
- **SL-J6. Undo takes back this link's own latest action**, one step at a time; a whole "Won't be able to buy these" or a batch Send is one step; it says what it would undo; in multi-select it takes back the last pick; disabled, not hidden, when there is nothing to take back.
- **SL-J7. "Won't be able to buy these" has no confirm and no count on the button** (SL-D5 says no confirm step; Undo is the safety). A quiet outline button, because it closes every open line. The bar leaves when no line is open. Cost: an accidental tap closes the rest until Undo.
- **SL-J8. Multi-select details.** The pressed line starts ticked; the list starts from the current synced answers (*revised by the owner's SL-D18, 11 October 2026: lines already answered have left the list and stay out of sight, see SL-J23*); lines another link got are locked and ticked; "Back to swiping" drops the unsent picks and says so; sending returns to the list in swipe mode with the link still live; unticked lines become "not got" at Send. Cost: a shopper who backs out loses the picks.
- **SL-J9. *Revised by the owner, 11 October 2026 (SL-D18). A second visit shows only what is left.*** It used to put "still to get" first (open and not-found lines), then "bought already", with a status of "3 to go · 2 not found"; a line not found last time could be swiped to got. Now every answered line, found or not, is off the list, there are no dividers, and the status reads "3 to go". What that costs, and the other way, is SL-J21.
- **SL-J10. "Also got" is free text only** (120 characters, no amount field), read by the Pantry's add-item matching; the shopper can remove their own; it shows on the member's screen after the list.
- **SL-J11. The live list is the real list** (SL-D3 retires the snapshot): lines a member adds while a link is out appear on the open page, removed ones disappear unless already answered. Line keys are stable ids, not places in a snapshot; the 200-line cap (P8) stands. Not drawn: the mockup's list is fixed at 12.
- **SL-J12. The member's card** reads "Shopping is coming in" with a live dot until no line is open, then "The shop is back"; counts and the first three lines; one card per link; Dismiss; no link named. The hand-off control no longer steps aside while a result is waiting (it did when a result was a gate); it still steps aside at 3 links.
- **SL-J13. "Opened" means the page ran**, not that the address was fetched: the first live-stream connection starts the fresh 48 hours, because chat apps fetch links to draw a preview. The member's line says "Not opened yet" or "Opened 3 hours ago" with the hours left.
- **SL-J14. Made, not sent?** The page tells the server the share sheet was closed (the share answer carries the link's id), so the line can say so and offer Withdraw. It never withdraws by itself; it still counts toward the 3.
- **SL-J15. No script is multi-select.** The server-drawn page is the checkbox form with one Send; swiping and live need script.
- **SL-J16. Phase two is untouched** and still says "Tick the list"; a good read arrives as a batch, which is what multi-select is. Q11 and Q12 stay with it.
- **SL-J17. The numbering.** SL-D and SL-J are this feature's own series; D17 to D20 and J18 to J29 are the live test of 11 October 2026 (other series: plan 1 to 62, preferences D1 to D30 and F1 to F14, recipe tab R-D1 to R-D28, recipe versions V-D).

### Judgement calls SL-J18 to SL-J29 (the live test of 11 October 2026; ours)

- **SL-J18. How the drag colour is drawn (SL-D17).** The colour is on the reveal under the row, so it fills the strip the row has slid off. It starts at 16% as soon as a drag begins and grows to 42% as the line is pulled to the point where letting go answers it (the unchanged threshold: a third of the line or 80 px, whichever is more). The script gives the row `--sl-p` (0 to 1) and `data-sl-armed`; the stylesheet does the colour. Past the point the strip turns solid, the words take the on-colour, an inset outline shows and the icon grows. Green is `--cue` (Kitchie's `--added`); red is `--danger`; the solid is each mixed 78% with `--fg`. The words are `--fg`, .85rem, weight 600 (not `--muted`: it fails on the tint). Checked: words on the tint 5.2:1 or better in all ten themes, on the solid 5.4:1 or better in all ten; in the two palette themes (Kitchie night, Kitchie day) words on the tint are 5.2 and 7.4 (green) and 6.0 and 6.4 (red) at the peak, and on the solid 11.0 and 6.7 (green) and 9.5 and 8.4 (red). Reduced motion: no transitions and no icon growth; the colour still follows the finger (that is the finger, not an animation). Other way: solid from the first pixel, or a gradient. Cost: a few lines of CSS.
- **SL-J19. How a line leaves (SL-D18).** It holds a beat so the answer is seen (0.14 s after a swipe, which has already carried the row out in its colour; 0.45 s after a tap or a button; 1.6 s when another shopper got it), then folds away in 0.22 s and the rest move up. Reduced motion: no hold and no folding, it is gone at once. Keyboard focus on a leaving line moves to the next line, else the one before, else the end card. The status bar is a live region and says how many are left. The server draws every line and marks the answered ones `data-sl-gone` (hidden by the stylesheet), so a visit is right before the script runs and Undo only takes the mark off. Cost: the hidden lines are still in the page (about 2 KB each).
- **SL-J20. A line another shopper got or swapped leaves too (SL-D18, SL-J4).** It says "Someone else got this" and a message names it ("Someone else just got Spinach.") for 1.6 s, then leaves like any answered line, so the list shows only what this shopper can still do. Unless the shopper is dragging it or typing a swap on it: then it stays, locked, with what they typed kept, until they let go or finish. A line another link could **not** find stays on this shopper's list: it is still to do here (SL-J4: "didn't find" does not lock). Other way: keep the line, locked, all the time (the first drawing). Cost: a shopper who looks away can miss why a line went.
- **SL-J21. Lines not found do not come back on a second visit (SL-D18, revising SL-J9).** Taken literally, "couldn't find" is answered, so it leaves and is not shown again. What is lost: on a second trip the shopper can no longer swipe a not-found line to got. They can say it under "Also got", or Undo if it was the last answer, and the member sees "Couldn't find" and can add the line again. Other way: a collapsed "Couldn't find earlier (2)" line at the bottom, closed by default (it would be a trail again, which he did not want). Cost: found-it-later has no clean path for the shopper; one drawn line if he wants it.
- **SL-J22. Undo of a line that left.** The line comes back in its own place with a short fade, a message says so ("Bread is back on your list.", or "5 lines are back on your list." after "Won't be able to buy these"), and the page scrolls to it if it is off screen. A sync that fails also brings the line back, with the existing "That didn't sync. Try again."
- **SL-J23. Multi-select with lines that have left (SL-D18, SL-D8; revises part of SL-J8).** A long-press shows checkboxes for what is left; answered lines stay out of sight, their answers go in the batch as they were (the page holds their fields, so `batch` is unchanged). Nothing vanishes until Send: a line another shopper got stays in view, locked, and leaves when the batch is sent or on "Back to swiping". The counts on the Send button and in the confirm are for the whole list, so the three still add up to the list, and the confirm's list of lines that are not "got" still includes lines not found earlier. After Send every line it answered is gone at once (no folding) and the page says All done. Other way: count and list only this batch. Cost: on a half-answered list the counts can look bigger than what is on screen.
- **SL-J24. The end state (SL-D18).** A calm card in the Shopping screen's own empty-state style: a tick, "All done. Thank you!", "The household has your answers and their list is up to date. You can close this page.", and a line about Undo and about opening the link again. If nothing was bought on this link (every line not found or taken by another shopper, and no also-got) it says "Nothing was bought on this link, and that's fine. The household has your answers.": **nothing bought is not an error**. The status bar reads "All done"; "Won't be able to buy these" and the hint go; Undo and "Also got" stay. The card appears after the last line has finished leaving. The server draws it unhidden when no line is open. Cost: copy.
- **SL-J25. The controls redrawn (SL-D19).** It was not certain which controls he meant, so every plus, minus, cross and look-alike was reviewed and the ones that could read as add or delete were changed. **Changed:** (1) the also-got button was a plus with "Add"; it is the tick with "Got it too", the page's own word for "I have it" (screen-reader name "Tell the household you also got this"); (2) the plus in front of each extra (the shopper's list, the confirm step's list, the member's "Also got" rows on the result card) is a shopping bag, the same bag as the hand-off control: it came home; (3) the cross that removes an extra is a bin, with "Remove" as tooltip and "Remove 2 cans of sparkling water" as its name: it really removes, so it may look like it; (4) the dash inside a not-found line's tick box is gone, because such a line now leaves the list. **Reviewed and kept:** the per-line "Got something else" (two arrows say replace, and the words say the rest), the hidden keyboard-only "Couldn't find <name>" (words only), Undo (a turned-back arrow), "Back to swiping", Cancel, Withdraw and Dismiss (words only), the member's hand-off control (a bag and a chevron). If he meant a control not in the changed list, the cost is one icon.
- **SL-J26. The one minus left (SL-D17, SL-D19).** The swipe-left reveal and the confirm step's "Not got" lines keep the dash, because he said the existing "couldn't find" icon is fine and the instruction was to keep it, not to swap it for a cross. It is not a control; it always sits beside "Couldn't find" or "Not got", and the answer leaves with Undo one tap away. It is drawn plain, not in a red circle (a red circle with a minus is the usual look of delete on phones). If this is the minus he meant: it is one glyph (`#sl-i-dash`) and one line in `shopper.js`; a question mark or a magnifier would do.
- **SL-J27. The status line says only what is left** ("5 to go", then "All done"), with no "· 2 not found" (SL-D18: no trail of what is finished).
- **SL-J28. What the server draws (SL-D18).** Every line in the list's own order, with `data-state`, `data-by`, the swap words and, for each answered line, `data-sl-gone`; the end card unhidden when no line is open (and no Send bar). `batch` needs no change: a hidden line's tick or swap field is still in the form. With no script the page is the same form with the answered lines hidden.
- **SL-J29. The pretend server follows SL-J4 as confirmed** (`mock.js`): a line another link swapped is locked as well as one it got, and it draws the page as the real server would, with the answered lines already gone. Nothing for the build.

## What the mockup shows

Member side (signed in, the Shopping screen; unchanged by the 11 October test except the bag on the "Also got" rows):

- The control "Someone else is shopping" in a slot above the list (SL-D1, SL-J1; options B and C stay on the page for comparison). It makes the link and hands the phone's share sheet the list text, then the link (SL-D14); copy when there is no share sheet.
- What lands in the chat: the list as Kitchie already writes it, then a line and the link.
- One quiet line per link out, at most 3, with a one-tap Cancel (SL-D15): "Not opened yet" or "Opened 3 hours ago", the hours left, and for a link made but not sent "Made, not sent?" with Withdraw (SL-D16). At 3 the control steps aside and says why.
- As the shopper answers, the real list changes with no member tap (SL-D2): bought lines crossed out and "Got · in the Pantry"; a swapped line "Got instead: fusilli, same size" with what the Pantry did ("Topped up your fusilli" or "Added to the Pantry as new", SL-D11); a line not found says "Couldn't find" and stays. "Also got" lines show after the list.
- One card per link (SL-D4): the three counts and which lines. A notification with Dismiss, not a button.

Shopper side (no sign-in, one hand, in a shop):

- Swipe mode (SL-D5): swipe right is got it, left is couldn't find it, a tap on the tick is got it. As the row is dragged its colour grows, green to the right and red to the left, with the tick or the dash and smaller words, and turns solid with an outline once letting go will answer it (SL-D17). The answered line then leaves the list and the rest move up (SL-D18). Each action is one request. A sticky bar at the top has Undo and where the list stands ("5 to go", SL-D6). A small "Got something else" button under each line opens one text field in place (SL-D9). An "Also got" box after the list (SL-D10): the tick with "Got it too", a bag in front of each line, a bin to remove it (SL-D19). The bottom button is "Won't be able to buy these" (SL-D7).
- Multi-select (SL-D8): a long-press on a line; checkboxes, nothing syncs; Undo and "Back to swiping" at the top; Send at the bottom with the counts; then the confirm step ("Got 9 of 12 · 1 swap · 2 not got", only the non-got lines listed, plus any also-got).
- A line another link got or swapped says "Someone else got this" for a moment and then leaves too (SL-D3, SL-J4, SL-J20). Opening the link again shows only what is left (SL-D12, SL-D18). When nothing is left the page says "All done. Thank you!", and says plainly when nothing was bought that this is fine (SL-J24).
- "Sent" (no script) offers the way back to the list. "That link has finished": one neutral page for ended, cancelled, withdrawn and unknown links.

Phase two, mockup only and deferred: choose "Snap the receipt"; reading; 80% or more; under 80%, one more photo; second miss, the owner's fallback message.

## Thresholds and limits

| What | Value | Whose |
|---|---|---|
| Link window | 48 hours from sharing; a fresh 48 hours from first open if that is later | Owner (SL-D13) |
| Receipt good enough (phase two) | 80% of the list's lines findable on the receipt | Owner |
| Receipt retries (phase two) | one more try, then the fallback | Owner |
| Live links per household | up to 3, counting links never sent | Owner (P7, SL-D16) |
| Swap and also-got text | up to 120 characters | Proposal P8, kept (SL-D9 names 120) |
| Lines on the page | up to 200 | Proposal P8 |
| Long-press to multi-select | 550 ms, no movement over 8 px | Judgement call (SL-J8) |
| Swipe commits | past 80 px or 30% of the line, whichever is more | Judgement call (SL-J5) |
| Drag colour | tint 16% at the first pixel, growing to 42% at the commit point, solid beyond it | Judgement call (SL-J18) |
| A line leaves | holds 0.14 s (swipe), 0.45 s (tap), 1.6 s (another shopper), folds in 0.22 s; reduced motion: gone at once | Judgement call (SL-J19, SL-J20) |
| Live update delay | within about a second | Owner says "near real time" (SL-D3) |

## What the review did to the earlier proposals

- **P1** (the shopper's confirm does not change the Pantry; a member presses Done shopping): revised by SL-D2 (and SL-J2).
- **P2** (a swapped line is not ticked and the member decides): a swap is still not ticked and says "Got instead"; the member no longer decides (SL-D9, SL-D11).
- **P3** (a snapshot at share time): revised by SL-D3 and SL-J11.
- **P4** (ticks stay on the phone until Send, one write per link): revised by SL-D5 and SL-D8. Swipe syncs every action; only multi-select is held until Send.
- **P5** (after the confirm the link is finished): revised by SL-D12.
- **P6** (no names on the shopper's page): stands.
- **P7** (3 live links, each cancellable, none labelled): stands, with unsent links and Withdraw (SL-D16).
- **P8** (120 characters, 200 lines): stands.
- **P9** (where Share lives): now SL-J1.
- Drawing proposals that stand: the whole line is a real checkbox (works with no script) with a plain strike-through; a swap takes the tick off and tapping a swapped line opens its words again; the shopper is told how long the link has left; one neutral "That link has finished" page; a half-second double-tap guard on the confirm step's Send.
- Drawing proposals changed: "If Send cannot reach Kitchie, the ticks stay on the phone" becomes "That didn't sync. Try again.", with the line returning to what it was; "Sent and the link opened again are one page" is dropped, because a link opened again shows the list.

## Open questions, answered

The twelve before the review, in order, and the thirteenth.

1. Should the shopper's confirm put the items into the Pantry straight away, with no member tap? **Answered: yes, as they go (SL-D2); the amounts are SL-J2.**
2. What should a swap do to the Pantry? **Answered: it goes in by itself with the standard add-item matching (SL-D11).**
3. Should a link be labelled for a person? **Answered: no; the content tells concurrent shoppers apart (SL-D3).**
4. Things bought that were not on the list: a free-text "also got" box, or wait for the receipt phase? **Answered: the box, built now (SL-D10).**
5. Should a finished link be reopenable for a second shop the same day? **Answered: yes; one link stays usable and shows the current state (SL-D12).**
6. 48 hours from sharing or from first opening? **Answered: from sharing, plus a fresh 48 from first open if that gives more (SL-D13).**
7. The link before or after the list in the chat text? **Answered: after (SL-D14).**
8. Does Cancel need a second tap? **Answered: no (SL-D15).**
9. The share sheet closed without sending: the link already counts toward the 3. **Answered: it still counts unless the sender withdraws it (SL-D16); SL-J14 lets the line say so.**
10. Which of the three placements? **Not answered in the review; answered on 10 October 2026 by his typed reply: option A is OK (SL-J1).**
11. Phase two: is a line that is not on the receipt "not got" or "not read"? **Deferred with phase two.**
12. Phase two: is the photo kept? **Deferred with phase two. Nothing assumes it is kept.**
13. New: should a result on any link update the real list at once, rather than wait for a member's "Done shopping"? **Answered: yes (SL-D2), and other links see it in near real time (SL-D3).**

Still open for production, from the judgement calls: SL-J3 (transport), SL-J11 (lines added while a link is out), SL-J13 (what counts as opened). SL-J2 (do gots reach the Pantry by themselves) is answered: yes, confirmed 10 October 2026.

## Owner confirmations, 10 October 2026

The owner replied by typed message to the list of decisions to review before production (the pull requests that built this in `basement-bridge/kitchie`, #519 server and #538 screens, with this mockup as PR #71). In his order:

1. The Pantry gets "got" lines automatically (SL-J2): **OK, confirmed.**
2. Live writes by someone who is not signed in: **OK "so long as it's only that link that can be accessed without signing in".** This is a **condition**, not a loose end. It was checked against the Kitchie code on 11 October 2026 and is met for everything the shopper link adds; the record and its three plainly-said exceptions that are not the link's are in Kitchie's `docs/adr/shopper-link.md`, section "Owner review, 10 October 2026, and the condition".
3. Hand-off placement option A (SL-J1): **OK, confirmed.**
4. Locking: a line got or swapped on one link locks on the others, "didn't find" does not lock (SL-J4): **correct, confirmed as built** (see the changed text of SL-J4).
5. Phase-one link data dropped, not migrated: **OK** (a build decision: the phase-one build was never merged into `uat`).
6. The listed gaps between the build and the mockup (Kitchie PR #538, "Listed differences"): **OK.** Nothing in the mockup changes for them.
7. Version 0.71.0: **OK.**

**Still open, not decided by him:** SL-J3 (server-sent events as the transport), SL-J11 (the live list is the real list, lines added while a link is out), SL-J13 ("opened" means the page ran). The judgement calls he did not single out (SL-J5 to SL-J10, SL-J12, SL-J14 to SL-J17) are neither confirmed nor reopened.

## For the implementation

- The requests (kitchie#479 revised; all form-encoded `POST` to `<base>/list/<token>/...`, no cookie, no session; a `404` is the one neutral answer for a finished link; every answer is the whole state):
  - `line`: `key`, `state` (`got`, `notgot`, `open`), `swap` (text, up to 120 characters; if not empty the line is swapped and the swap wins). One swipe, tap or saved swap is one request. `409` with the current state if the line is already `got` or swapped on another link (SL-J4). `state=open` brings an answered line back to the list (Undo, SL-D18).
  - `extra` (`text`) and `extra/remove` (`id`).
  - `unresolved`: every line still `open` becomes `notgot`; other lines are untouched.
  - `undo`: takes back this link's latest action; a whole `unresolved` or `batch` is one action.
  - `batch`: `got` (repeated), `swap_<key>`, `also` (repeated), `confirm=1`. Lines not named are `notgot`; lines already `got` on another link are skipped. Without `confirm` the server answers the confirm page. This is also what the no-script form posts.
  - `GET events`: server-sent events, each event the whole state `{ rev, lines: { <key>: { state, words, by } }, extras, last, hours }`. `by` is `you`, `other` or empty, never a name.
- `GET <base>/list/<token>` draws the page with `data-state`, `data-by` and swap words already on each line, so it is right before the script runs. Every line is drawn and each answered line carries `data-sl-gone` (hidden by `shopper.css`), so a visit shows only what is left (SL-D18, SL-J28); when no line is open the end card is drawn unhidden and the Send bar is left out. A line another link could not find is not answered for this shopper and is drawn open (SL-J20).
- Member side: `POST shopping/share` answers `{ link, url, text, expires_at }`; `POST shopping/share/unsent` (`link`) marks a link whose sheet was closed; `shopping/share/cancel` is Cancel and Withdraw; `shopping/share/dismiss` hides a card. The Shopping screen follows the same live feed while a link is out.
- Pantry rules are server-side: a got line adds its listed amount (SL-J2); a swap and an also-got go through the same add-item matching as a hand-added item (SL-D11).
- The drag colour is the stylesheet's (`--sl-p` and `data-sl-armed` on the row, SL-J18); the leaving is `data-sl-leaving` then `data-sl-gone`, and `data-sl-back` on the way back (SL-J19, SL-J22). The script and the stylesheet are written together: lift both.
- The pages in `fragments/shopper-link/` are written to be lifted: `list.html`, `summary.html`, `sent.html`, `finished.html`, `shopper.css`, `shopper.js` for the shopper; the `sl-` blocks in `member.html` and `member-result.html`, `member.css`, `member.js` for the Shopping screen. `kitchie.css` is rules the app already has; `mock.js` stands in for the server, its stream and the second shopper. Neither is for the build.
- List rows reuse the Shopping screen's names (`ul.rows.shop`, `li.shoprow`, `.swrow`, `.swfg`, `.swbg`, `.tick`, `.rlink`). The one difference: the shopper's tick is `label.tick` around a real checkbox, because the app's `button.tick[role=checkbox]` needs script.
- What loads and what is deferred is on the fragment page (DESIGN.md section 6). In short: the shopper's page is the page, one stylesheet and one deferred script; the receipt code, the camera input and the WebSocket load nothing until that mode is chosen.
