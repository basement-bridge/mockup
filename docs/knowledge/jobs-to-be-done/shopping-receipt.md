# Shopping receipt scan: no double-add, quantity reconciliation

Status: **three options drawn 16 October 2026 (Kitchie #797); SR-1 to SR-6 are the owner's, SR-7 to SR-15, SR-17 to SR-19 and SR-24 to SR-27 are proposals awaiting the owner.** Mockup: `fragments/shopping-receipt/index.html` (options `a.html`, `b.html`, `c.html`). Check: `tools/shopping-receipt-check.mjs`.

## Job

A shopping trip is open (the whole list is not yet confirmed). The person ticks rows by hand, swipes some as Bought, may press Done shopping, and scans the receipt. They want the receipt to finish the job without adding anything twice and without a wrong quantity going in unseen.

Owner, voice, 16 October 2026: while a trip is open a person must be able both to tick rows and scan a receipt. Nothing already accounted for (only ticked, swiped/Bought, or finished by Done shopping) may be added to the Pantry a second time; such rows show as "Already in your Pantry", default not added again, with choices: same item (the receipt amount fixes a blind swipe amount, e.g. 1 to 1.204 kg), keep the Pantry's, or another one, add again. Quantity as in the Pantry receipt-add: the real receipt quantity is shown, can fill a blank list amount or correct a different one, with a unit pill; a bare number against an exact-unit item (kg) asks for the unit; never silently overriding, the person sees and confirms the number. Repeated receipt lines for one list item are combined (2 x 500 g = 1000 g). "This is one area I want the mockup to be available." Gaps 5 and 6 (parser, shopper link) are out of scope.

## How we know the person is in this job

They scan a receipt from Shopping while the list is open. Not inferred.

## What leads

What is already in the Pantry and what amount will go in. Rows that need a number or a unit come before anything that is certain.

## What this job does not need

Price, store, photo, matching to Pantry items by name (that is the Pantry scan, receipt-scan.md), the parser fixes (gap 5), the shopper link (gap 6).

## Mockup

Three options on one sample trip (milk ticked and matching; eggs with a blank list amount; rice ticked, 1 kg to 2 kg; chicken with a bare 2 against kg; yoghurt on two lines; plain flour on two lines in g and kg (500 g + 1 kg = 1.5 kg); bananas swiped as 1 with 1.204 kg on the receipt; butter swiped and matching; tuna through Done shopping, 2 against 3 tin; smoked salmon not on the list).

- **A, Receipt order, receipt wins.** Flat list in print order, stepper prefilled with the receipt number, "List said X" link to go back, changed amounts flagged.
- **B, List order, both on show.** Two chips, List and Receipt; where they differ nothing is preselected.
- **C, Only what needs you.** Conflicts on top; agreed rows, off-list lines that auto-add and Already-in-your-Pantry rows in folds.

States (glyph, word, colour): Matches your list, Fills a blank, Changed from X / List and receipt differ, Needs a unit, Confirmed, Already in your Pantry, Not on your list.

## Decisions (series SR, separate from RS and SD)

| # | Decision | Status |
|---|---|---|
| SR-1 | Tick by hand and scan a receipt both work while the list is open. | Owner |
| SR-2 | Nothing already accounted for on this trip is added a second time. | Owner |
| SR-3 | "Already in your Pantry", default not added again; Same item, Keep Pantry's, Another one. | Owner |
| SR-4 | Same item uses the receipt amount to fix a blind swipe amount. | Owner |
| SR-5 | Receipt quantity shown; fills a blank or corrects a different list amount; unit pill; bare number against an exact unit asks; never silent. | Owner |
| SR-6 | Repeated receipt lines for one list item are combined, sum shown. | Owner |
| SR-7 | A ticked row is not "Already in your Pantry": a tick is a browser flag, nothing is in the Pantry; the scan buys it once and drops the tick (as today). | Proposal |
| SR-8 | Same item replaces the Pantry amount (unit included); hidden when the amounts agree. | Proposal |
| SR-9 | Another one adds a second record with the receipt amount, editable. | Proposal |
| SR-10 | A, B and C as above. | Proposal |
| SR-11 | A blank list amount is not a conflict; receipt number preselected, shown as "Fills a blank". | Proposal |
| SR-12 | Unit pills offer the item's family (kg/g, L/mL, tin/pack); kg and g convert the number; no pill for countables. | Proposal |
| SR-13 | A needs-a-unit row has no unit chosen and Add stays off until one is. | Proposal |
| SR-14 | One Add bar: "Adds N, fixes M, K not added again", disabled with "N to answer". | Proposal |
| SR-15 | C's folds show count and outcome; expanded rows keep the same controls. | Proposal |
| SR-16 | A receipt line not on the list is added to the Pantry as bought, once; Leave out is the explicit alternative; the Add bar counts it. Owner, voice, 16 Oct: "if it's not on the list, why are we asking to leave it out? That should be added, isn't it?" Replaces the earlier proposal (default Leave out) and changes the original #797 draft (active confirm for unmatched lines). Amount editable. | Owner |
| SR-17 | After Add: summary and Undo toast; the list stays. | Proposal |
| SR-18 | Glyph, word and colour per state, existing tokens only. | Proposal |
| SR-19 | Combined lines tagged "2 lines combined" with the sum; no keep-separate here. | Proposal |
| SR-20 | A typeable numeric box (decimal keyboard) beside the stepper and unit pills in every option, for when neither the list's nor the receipt's figure is right. | Owner |
| SR-21 | Same-item receipt lines in mixed units combine through known unit relationships (g minor of kg, mL of L, 1000:1): 500 g + 1 kg = 1.5 kg. | Owner |
| SR-22 | Unit relationships become a first-class app concept: a later unit switch (g to kg) converts quantity and minimum, not relabel. Separate Kitchie issue, number to follow; not in this mockup. | Owner |
| SR-23 | Option C: auto-adding off-list lines sit in the "nothing to decide" fold with agreed and already-in-Pantry rows, count and outcome in the fold text, Leave out on each row when open, counted in the Add bar. Owner, voice, 16 Oct: "we should do that, and you give them the option to leave them out". Non-food lines (bag fee, discount) still go to "Not added" with their reason. A and B keep them under "Not on your list", default Add. | Owner |
| SR-24 | Typed number shows "Edited by you", counts as answered, never silently replaced; decimal comma accepted; invalid entry ignored; picking List or Receipt later replaces it. | Proposal |
| SR-25 | A combined mixed-unit row is expressed in the unit the Pantry holds the item in and says which; shows the working ("500 g + 1 kg = 1.5 kg"), a "2 lines combined" tag and "Changed from 1 kg, now 1.5 kg". | Proposal |
| SR-26 | Only known relationships combine (kg/g, L/mL); unrelated units (tin and kg) stay separate. | Proposal |
| SR-27 | An off-list line's amount is editable while set to Add, hidden when left out. | Proposal |

## Open questions

1. Does a tick count as already accounted for (SR-7)? Cost of a wrong guess: copy only, since a tick puts nothing in the Pantry.
2. Same item: replace or top up (SR-8)? Wrong guess miscounts the Pantry.
3. Which option leads?
4. Unit relationships as a first-class app concept (owner): a later unit switch must convert quantity and minimum, not relabel. Separate issue, number to follow. Lines in unrelated units (tin and kg) are not combined (SR-26): is that right?
5. A tick on another device, or the shopper link's answers, may be invisible to the scan; the build lane is guarded if the receipt commit changes.
6. Non-food lines (bag fee, discount) are not drawn in the sample; they stay "Not added" with a reason.
7. A receipt line with no number and a blank list (gap 2) is not drawn.

## For the implementation

Class names follow the Pantry's and the receipt-scan fragment's (`.hd .btn .rows .row .rmain .nm .mt .tag .toast`); new names are `sr-*`. Sample data stays in `sr-data.js`; `sr-core.js` draws from it. Size rules are only in `phone.css` and `desktop.css`. Build gaps 1 to 4 once an option is chosen: the server commit must treat bought and finished rows as already in the Pantry, accept a "same item" amount fix and "another one", and take receipt quantity with a unit. Default path loads about 6 KB of CSS and 14 KB of script per option page; nothing is fetched on engagement.
