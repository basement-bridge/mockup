# Shopper link: someone else is shopping, and the household's list follows them live

Status: owner direction by voice, 10 October 2026 (the idea), and owner review of the mockup the same day (decisions **SL-D1 to SL-D16**, below). Phase one is Kitchie issue `basement-bridge/kitchie#479`; phase two (scan the receipt) is drawn only, deferred, and not built. Lines marked **Judgement call** (SL-J1 on) are choices the mockup made where the owner was silent; none is settled and each is listed in the pull request under "Decisions to review before production". Lines marked **Proposal** are the earlier proposals (P1 to P9), most of them revised by the review: the section "What the review did to the earlier proposals" says how.

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

## Judgement calls SL-J1 to SL-J17 (ours; the owner did not say)

Each lists what was chosen, the other way, and what a wrong guess costs. They are repeated in the pull request under "Decisions to review before production".

- **SL-J1. Where the hand-off control lives: option A, a slot above the list** (Q10; the fragment's favourite of the three, the other two stay on the page). Cost: the wrong one is rebuilt; A moves the list down one row for households that never hand over.
- **SL-J2. A got line also reaches the Pantry by itself**, at the amount on the list (1 where the list gave none), with the effect of a member's "Done shopping". SL-D2 says the list is not gated on that tap and SL-D11 names swaps only; leaving gots to wait would leave the Pantry half-updated. Other way: got lines wait, ticked, for "Done shopping". Cost: if gots should wait, the Pantry gains stock a shopper only claimed (undoable per item in History); if they should not, the household pays one tap per shop. The largest call here.
- **SL-J3. How "live" travels.** One server-sent-events stream per open page, each event the whole state, the browser reconnecting itself; a polling fallback is the build's to add. Cost: a different transport changes server code only.
- **SL-J4. Two links, one line.** A line answered "got" on one link is locked on the others ("Someone else got this", nobody named, P6 stands); a "not found" or a swap can still be answered by the other shopper; a refused write answers 409 and the page corrects itself. Cost: a wrong "got" is only undone by the shopper who made it or a member.
- **SL-J5. Swipe is not the only way.** A tap on the tick is "got it" (again is back to open), and each line has a hidden "Couldn't find" button that appears on keyboard focus. Cost: none visible.
- **SL-J6. Undo takes back this link's own latest action**, one step at a time; a whole "Won't be able to buy these" or a batch Send is one step; it says what it would undo; in multi-select it takes back the last pick; disabled, not hidden, when there is nothing to take back.
- **SL-J7. "Won't be able to buy these" has no confirm and no count on the button** (SL-D5 says no confirm step; Undo is the safety). A quiet outline button, because it closes every open line. The bar leaves when no line is open. Cost: an accidental tap closes the rest until Undo.
- **SL-J8. Multi-select details.** The pressed line starts ticked; the list starts from the current synced answers; lines another link got are locked and ticked; "Back to swiping" drops the unsent picks and says so; sending returns to the list in swipe mode with the link still live; unticked lines become "not got" at Send. Cost: a shopper who backs out loses the picks.
- **SL-J9. A second visit puts "still to get" first** (open and not-found lines), then "bought already", drawn by the server for that visit and not re-sorted while the page is open. A line not found last time can be swiped to got. The status reads "3 to go · 2 not found".
- **SL-J10. "Also got" is free text only** (120 characters, no amount field), read by the Pantry's add-item matching; the shopper can remove their own; it shows on the member's screen after the list.
- **SL-J11. The live list is the real list** (SL-D3 retires the snapshot): lines a member adds while a link is out appear on the open page, removed ones disappear unless already answered. Line keys are stable ids, not places in a snapshot; the 200-line cap (P8) stands. Not drawn: the mockup's list is fixed at 12.
- **SL-J12. The member's card** reads "Shopping is coming in" with a live dot until no line is open, then "The shop is back"; counts and the first three lines; one card per link; Dismiss; no link named. The hand-off control no longer steps aside while a result is waiting (it did when a result was a gate); it still steps aside at 3 links.
- **SL-J13. "Opened" means the page ran**, not that the address was fetched: the first live-stream connection starts the fresh 48 hours, because chat apps fetch links to draw a preview. The member's line says "Not opened yet" or "Opened 3 hours ago" with the hours left.
- **SL-J14. Made, not sent?** The page tells the server the share sheet was closed (the share answer carries the link's id), so the line can say so and offer Withdraw. It never withdraws by itself; it still counts toward the 3.
- **SL-J15. No script is multi-select.** The server-drawn page is the checkbox form with one Send; swiping and live need script.
- **SL-J16. Phase two is untouched** and still says "Tick the list"; a good read arrives as a batch, which is what multi-select is. Q11 and Q12 stay with it.
- **SL-J17. The numbering.** SL-D and SL-J are this feature's own series (other series: plan 1 to 62, preferences D1 to D30 and F1 to F14, recipe tab R-D1 to R-D28, recipe versions V-D).

## What the mockup shows

Member side (signed in, the Shopping screen):

- The control "Someone else is shopping" in a slot above the list (SL-D1, SL-J1; options B and C stay on the page for comparison). It makes the link and hands the phone's share sheet the list text, then the link (SL-D14); copy when there is no share sheet.
- What lands in the chat: the list as Kitchie already writes it, then a line and the link.
- One quiet line per link out, at most 3, with a one-tap Cancel (SL-D15): "Not opened yet" or "Opened 3 hours ago", the hours left, and for a link made but not sent "Made, not sent?" with Withdraw (SL-D16). At 3 the control steps aside and says why.
- As the shopper answers, the real list changes with no member tap (SL-D2): bought lines crossed out and "Got · in the Pantry"; a swapped line "Got instead: fusilli, same size" with what the Pantry did ("Topped up your fusilli" or "Added to the Pantry as new", SL-D11); a line not found says "Couldn't find" and stays. "Also got" lines show after the list.
- One card per link (SL-D4): the three counts and which lines. A notification with Dismiss, not a button.

Shopper side (no sign-in, one hand, in a shop):

- Swipe mode (SL-D5): swipe right is got it, left is couldn't find it, a tap on the tick is got it. Each action is one request. A sticky bar at the top has Undo and where the list stands (SL-D6). A small "Got something else" button under each line opens one text field in place (SL-D9). An "Also got" box after the list (SL-D10). The bottom button is "Won't be able to buy these" (SL-D7).
- Multi-select (SL-D8): a long-press on a line; checkboxes, nothing syncs; Undo and "Back to swiping" at the top; Send at the bottom with the counts; then the confirm step ("Got 9 of 12 · 1 swap · 2 not got", only the non-got lines listed, plus any also-got).
- A line another link got is done and locked here, with "Someone else got this" (SL-D3, SL-J4). Opening the link again shows the current state, still to get first (SL-D12, SL-J9).
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
10. Which of the three placements? **Not answered by the owner. Judgement call: A (SL-J1).**
11. Phase two: is a line that is not on the receipt "not got" or "not read"? **Deferred with phase two.**
12. Phase two: is the photo kept? **Deferred with phase two. Nothing assumes it is kept.**
13. New: should a result on any link update the real list at once, rather than wait for a member's "Done shopping"? **Answered: yes (SL-D2), and other links see it in near real time (SL-D3).**

Still open for production, from the judgement calls: SL-J2 (do gots reach the Pantry by themselves), SL-J3 (transport), SL-J11 (lines added while a link is out), SL-J13 (what counts as opened).

## For the implementation

- The requests (kitchie#479 revised; all form-encoded `POST` to `<base>/list/<token>/...`, no cookie, no session; a `404` is the one neutral answer for a finished link; every answer is the whole state):
  - `line`: `key`, `state` (`got`, `notgot`, `open`), `swap` (text, up to 120 characters; if not empty the line is swapped and the swap wins). One swipe, tap or saved swap is one request. `409` with the current state if the line is already `got` on another link.
  - `extra` (`text`) and `extra/remove` (`id`).
  - `unresolved`: every line still `open` becomes `notgot`; other lines are untouched.
  - `undo`: takes back this link's latest action; a whole `unresolved` or `batch` is one action.
  - `batch`: `got` (repeated), `swap_<key>`, `also` (repeated), `confirm=1`. Lines not named are `notgot`; lines already `got` on another link are skipped. Without `confirm` the server answers the confirm page. This is also what the no-script form posts.
  - `GET events`: server-sent events, each event the whole state `{ rev, lines: { <key>: { state, words, by } }, extras, last, hours }`. `by` is `you`, `other` or empty, never a name.
- `GET <base>/list/<token>` draws the page with `data-state`, `data-by` and swap words already on each line, so it is right before the script runs; on a second visit still-to-get lines come first (SL-J9).
- Member side: `POST shopping/share` answers `{ link, url, text, expires_at }`; `POST shopping/share/unsent` (`link`) marks a link whose sheet was closed; `shopping/share/cancel` is Cancel and Withdraw; `shopping/share/dismiss` hides a card. The Shopping screen follows the same live feed while a link is out.
- Pantry rules are server-side: a got line adds its listed amount (SL-J2); a swap and an also-got go through the same add-item matching as a hand-added item (SL-D11).
- The pages in `fragments/shopper-link/` are written to be lifted: `list.html`, `summary.html`, `sent.html`, `finished.html`, `shopper.css`, `shopper.js` for the shopper; the `sl-` blocks in `member.html` and `member-result.html`, `member.css`, `member.js` for the Shopping screen. `kitchie.css` is rules the app already has; `mock.js` stands in for the server, its stream and the second shopper. Neither is for the build.
- List rows reuse the Shopping screen's names (`ul.rows.shop`, `li.shoprow`, `.swrow`, `.swfg`, `.swbg`, `.tick`, `.rlink`). The one difference: the shopper's tick is `label.tick` around a real checkbox, because the app's `button.tick[role=checkbox]` needs script.
- What loads and what is deferred is on the fragment page (DESIGN.md section 6). In short: the shopper's page is the page, one stylesheet and one deferred script; the receipt code, the camera input and the WebSocket load nothing until that mode is chosen.
