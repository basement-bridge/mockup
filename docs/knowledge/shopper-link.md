# Shopper link: the shopping list, ticked off by someone who is not in the app

Status: owner direction by voice, 10 October 2026. Phase one (tick the list) is Kitchie issue `basement-bridge/kitchie#479`; phase two (scan the receipt) is drawn only and not built. Lines marked **Proposal** are choices the mockup or the issue made where the owner was silent; none is settled. Proposals marked "(issue)" come from kitchie#479, written by an agent on the owner's instruction; the rest are from Claude while drawing, same date.

Code: `fragments/shopper-link/` (the fragment page is `index.html`; the pages it frames are the screens themselves). Job file: `jobs-to-be-done/shopping-without-the-app.md`.

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

## What the owner decided

- A one-off link is made when the shopping list is shared. It is unique and it expires: 48 hours.
- The person holding it is not forced into the system: no sign-in.
- Phase one is ticking what was bought and saying what was substituted, with a confirmation. Lines left unticked are known to be not bought. Acting on the list fully or partially both count.
- Two modes in the end, ticking first. Receipt scanning is phase two: over a WebSocket, read on the Kitchie server, no AI model, good enough at 80% of the list's lines found, one more try, then the fallback message that steers to ticking.
- Choosing neither is accepted.

## What the mockup shows

Member side (signed in, the Shopping screen):

- A Share control that makes the link and hands the phone's share sheet the list text plus the link (copy when there is no share sheet). Three placements are drawn side by side.
- What lands in the chat: the list as Kitchie already writes it, then a line and the link.
- While a link is live, a quiet line: "Link is live", "Ends in 47 hours", Cancel.
- The result: a card with got, swapped and not got. Lines the shopper got are ticked ("in the basket"); a swapped line says "Got instead: ..." and is not ticked; then the existing "Done shopping".

Shopper side (no sign-in, one hand, in a shop):

- The list, one big tick per line (the whole line is the tick), the amount beside the name, a quiet "Got something else" per line that opens one short text field.
- One Send button at the bottom. A confirm step first: "Got 9 of 12 · 1 swap · 2 not got." Nothing ticked is allowed after the same step.
- Sent: a thank-you with the summary. Opening the link again shows it read-only.
- Finished, cancelled, unknown: one neutral page, "That link has finished".

Phase two, mockup only: choose "Snap the receipt"; reading; 80% or more; under 80%, one more photo; second miss, the owner's fallback message.

## Thresholds and limits

| What | Value | Whose |
|---|---|---|
| Link lifetime | 48 hours | Owner |
| Receipt good enough | 80% of the list's lines findable on the receipt | Owner |
| Receipt retries | one more try, then the fallback | Owner |
| Swap text | up to 120 characters | **Proposal** (issue, P8) |
| Lines in a snapshot | up to 200 | **Proposal** (issue, P8) |
| Live links per household | up to 3 | **Proposal** (issue, P7) |

## Proposals

From the issue:

- **Proposal P1.** The shopper's confirm does not change the Pantry by itself. The result comes back to the Shopping screen and a member commits with the existing "Done shopping".
- **Proposal P2.** A swapped line is not ticked. It shows "Got instead: <their words>" and the member decides.
- **Proposal P3.** The link shows a snapshot of the list at share time, not the live list.
- **Proposal P4.** Ticks stay on the shopper's phone until they send: one write per link. Without script the page is one plain form and still works.
- **Proposal P5.** After the confirm the link is finished. Opening it again shows what was sent, read-only, until the 48 hours end.
- **Proposal P6.** No names on the shopper's page: not the household's, not a member's.
- **Proposal P7.** At most 3 live links per household, each cancellable, none labelled with a person.
- **Proposal P8.** Limits: swap text up to 120 characters, 200 lines.
- **Proposal P9.** Where Share lives is proposed in the mockup: a hand-off slot above the list (option A of three).

From the drawing (Claude, 10 October 2026):

- **Proposal.** The hand-off slot holds, in turn, Share, the live-link lines and the result card. Share steps aside while 3 links are live and while a result is waiting.
- **Proposal.** In the shared text the link line comes after the list: "Tick off what you got, no sign-in needed. Works for 48 hours:" and the link on its own line.
- **Proposal.** On the shopper's page the whole line is the tick (a real checkbox, so it works with no script) and a ticked name is struck through with a plain line, not the app's hand-drawn stroke.
- **Proposal.** A swap takes the tick off (the form contract: if both arrive, the swap wins). Once said, the line folds back to "Got instead: ...". Tapping a swapped line opens its words again.
- **Proposal.** The confirm step lists only the lines that are not a plain "got", and ignores a second tap for half a second so a double tap cannot skip it.
- **Proposal.** If Send cannot reach Kitchie, the ticks stay on the phone and the page says so.
- **Proposal.** "Sent" and "the link opened again" are one page.
- **Proposal.** The shopper is told how long the link has left, and is not shown what is left at home.
- **Proposal.** On the member's side a line the shopper did not get says "Not got"; the result card has Dismiss; Cancel is one tap.
- **Proposal (phase two).** A good read does not send by itself: the lines found arrive ticked, the rest say "Not on the receipt", and the shopper presses Send as usual. The socket opens when the mode is chosen. After the second miss the receipt button goes away for that link. Message shapes are in `fragments/shopper-link/receipt.js`.

## Open questions (and the cost of a wrong guess)

The first six are the issue's, in its words. The cost lines after the first are our reading, not the owner's.

1. Should the shopper's confirm put the items into the Pantry straight away, with no member tap? That is the lowest-friction loop, and it means a person who is not signed in changes stock. Proposal P1 says no for now. Wrong guess costs: P1 costs the household one tap per shop; the other way lets anyone holding a link within 48 hours add stock (undoable per item in History).
2. What should a swap do to the Pantry: add the swapped thing as a new item, or leave it to the member (P2)? As drawn the member adds it by hand; the other way the Pantry gains items named in an outsider's free text.
3. Should a link be labelled for a person ("for the weekend shop", a name), given "that link is just unique for that person"? Unlabelled, two live links can only be told apart by the hours left; labelled, sharing gains a question and a name is stored against a public page.
4. Things bought that were not on the list: a free-text "also got" box, or wait for the receipt phase? Without it extras never reach Kitchie in phase one; with it there is one more thing to type in a shop.
5. Should a finished link be reopenable for a second shop the same day? As drawn a second trip needs a new share; the other way a result can change after the household acted on it.
6. 48 hours from sharing (built) or from first opening? From sharing, a list sent on Friday night for a Sunday shop has finished; from opening, an unopened link has no end unless capped.
7. From the drawing: the link before or after the list in the chat text? After, a long list can hide the link behind the chat app's "read more"; before, the list is pushed down.
8. From the drawing: does Cancel need a second tap? One slip ends a link someone may be shopping with.
9. From the drawing: the share sheet closed without sending. The link already exists and counts toward the 3; cancelling it automatically needs the share answer to say which link it made.
10. From the drawing: which of the three Share placements.
11. Phase two: is a line that is not on the receipt "not got" or "not read"? A swap looks like a miss.
12. Phase two: is the photo kept? A receipt shows a shop, a time and part of a card number.

## For the implementation

- The form contract (kitchie#479): `GET <base>/list/<token>`, and the same address takes the `POST`. Fields: `got` (repeated, value is the line key `l0`, `l1`, ...), `swap_<key>` (text, only meaningful when not empty), `confirm` (`1`). A `POST` without `confirm=1` answers the summary page. If both `got` and `swap_<key>` arrive for a key, the swap wins.
- The pages in `fragments/shopper-link/` are written to be lifted: `list.html`, `summary.html`, `sent.html`, `finished.html`, `shopper.css`, `shopper.js` for the shopper; the `sl-` blocks in `member.html` and `member-result.html`, `member.css`, `member.js` for the Shopping screen. `kitchie.css` is rules the app already has; `mock.js` stands in for the server. Neither is for the build.
- List rows reuse the Shopping screen's names. The one difference: the shopper's tick is `label.tick` around a real checkbox, because the app's `button.tick[role=checkbox]` needs script.
- What loads and what is deferred is on the fragment page (DESIGN.md section 6). In short: the shopper's page is the page, one stylesheet and one deferred script; the receipt code, the camera input and the WebSocket load nothing until that mode is chosen.
