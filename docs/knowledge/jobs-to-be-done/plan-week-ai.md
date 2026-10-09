# Planning the week, AI-led

Status: decisions by the owner, by voice, 9 October 2026, applied to the mockup first. The built Kitchie screens follow the mockup once it is settled. Mockup: `fragments/plan-week-ai/`. Earlier, broader job file: [plan-week.md](plan-week.md).

## Decisions (owner, 9 October 2026, voice)

1. **Week limits.** Scrolling back stops at last week (nothing earlier is reachable). Planning ahead stops four weeks out from the current week.
2. **Week header gestures.** On the "Week of ..." header, a long-press jumps back to the current week and a tap steps forward one week. The left/right arrows stay alongside it.
3. **Not cooking, look.** Keep "Not cooking" (the moon was dropped later: decision 24). Remove the diagonal-slash fill; it was distracting.
4. **Blocking from the grid is one week only.** No "just this week or every Wednesday" choice on the grid. Repeating days are a Settings matter (the usual-days stencil).
5. **Open your assistant must open the app.** *Superseded by decision 17.* (First said as a working deep link into the person's chosen assistant app.)
6. **Moving a meal is drag only.** "Move to another day" and the day picker are gone from the meal sheet, on desktop and on touch alike, with no button fallback.
7. **Three meal-source states, labelled apart.** (a) An unmodified saved recipe: tap through to that recipe. (b) A saved recipe the assistant changed: labelled **Modified by assistant**; the substitution is locked to that plan entry, so on cook day the substitute is what is held, shown and shopped for. (c) A recipe invented on the fly with nothing saved behind it: labelled **Made up by your assistant**. **7(b) needs follow-up build work** (the entry carries its own ingredient list).
8. **Card meta line.** Just who and how many: "Everyone · 4 people". No "sized by your assistant" or "planned by you".
9. **Hold.** In the meal sheet the full-width "Reserve for Tuesday" button becomes a small **Hold** button to the right of the On hand heading. The on-hand items and their quantities are indented a little.
10. **Quantities follow the people count.** On-hand and missing quantities scale with the people count on the card. For assistant-made and modified entries the stored ingredient list must be per person (quantity per person) so it can scale later. **Data-model follow-up for the build**, not only a UI change.
11. **Missing ingredients.** No Substitute button. A plain hint line under the list: "Talk to your assistant about substitutes" (not tappable; the person is usually already talking to their assistant). Each missing item gets a small icon-only shopping-cart button, styled like Hold, to add just that item to the shopping list.
12. **Remove.** "Remove from the day" becomes "Remove"; the sheet already shows which meal and day.
13. **Swipe on a meal card.** Swipe left = Remove (the day stays open for replanning). Swipe right = Remove and mark the day Not cooking. Two different outcomes.
14. **Empty days carry no copy.** The permanent "speak to your assistant to lock something in" text is gone; the dashed outline is enough.
15. **Idle nudge.** After a stretch of doing nothing on a week with an empty day, a "curtain" drops and says **Plan with your AI assistant.** Never right when the plan opens. The owner's number: about five seconds.
16. **Copy last week is an icon.** A small persistent icon beside the settings cog, not a button in the main view. Pressing it again after it was applied clears what it copied.
17. **The assistant runs inside Kitchie.** "Open your assistant" is not an external deep link to a separate chat app; it is driven from inside Kitchie as an in-app agent. Supersedes decision 5. Architecture note for the build.
18. **View switch order.** Left to right: Mine, Everyone, then the named other person (Jane in the sample). Replaces Mine, Jane, Everyone.
19. **Nudge anchors below the switch.** The curtain drops from just under the Mine / Everyone / person row, not from the top of the screen.
20. **The curtain pushes the grid down.** It makes room for itself instead of covering the week.
21. **No jitter on the way out.** When the curtain lifts, the grid does not move back up with it; the space settles later.
22. **Modern Copy last week icon.** The old clipboard emoji is replaced with a clean line icon.

23. **Tap an empty night to mark it Not cooking.** On a night with no meal, a plain tap on the dashed slot sets Not cooking for this week; no menu needed. The three dots stay only on nights that already have a meal, where the swipe-right gesture also stays as it is.
24. **No moon.** The blocked night shows just the words "Not cooking", no icon. The swipe-right tint reads "Not cooking".
25. **Swipe left is Replan.** The word on the swipe-left tint is "Replan" instead of "Remove"; the effect is unchanged (meal removed, night stays open). Open: should Replan also open the assistant?
26. **Source labels only in the detail.** "Modified by assistant" and "Made up by your assistant" leave the card face and show only in the meal sheet.
27. **Symbolic pills.** Card pills are an icon plus a number: missing (warning icon), on the shopping list (cart), held (bookmark). Same theme colours; full words in the accessible labels and the sheet.

28. **Item and quantity are one pair.** In On hand and Missing the quantity sits right after the item name, same line and baseline; no fixed column. The vertical misalignment is fixed.
29. **Substitute hint under the Missing heading.** "Talk to your assistant about substitutes" sits directly under the heading, above the list.
30. **A substitution shows where the item is.** On a modified meal the substitute is the item on the row (on hand or missing); what it replaced follows in brackets with a strike-through, e.g. carrots (~~mushrooms~~). Replaces the "mushrooms → carrots" line. Still locked to the plan entry (decision 7b).

(17 to 30: owner, by voice, 9 October 2026, later the same day.)

## Follow-up work beyond the mockup

These touch the real Kitchie backend and app, not only the screens.

- **Decision 5 is superseded by 17.** No deep-link fix. Decision 17 is an architecture question for the build: the assistant is an in-app agent driven from inside Kitchie.
- **Decision 7(b).** A modified plan entry carries its own locked ingredient list; reservation and the shopping list read that list, not the recipe's.
- **Decision 10.** Assistant-made and modified ingredient lists are stored per person so quantities scale when the people count changes.

## Proposals (not the owner's words)

Marked on the fragment page: arrows and a small week label in the header, idle time of five seconds and once per visit, swipe distance, a people stepper in the meal sheet, "Held" as the state word for Hold, indent on Missing items too, Copy last week clearing only untouched copied cards.

## Open questions

- Drag is the only way to move a meal, so someone who cannot drag has no way to move one. The owner chose it; revisit for accessibility.
- Can last week still be planned into or edited? Drawn: yes.
- Does a hold move with a moved meal? Drawn: yes; removing releases it.
