# History: the Others picker and card wording (Kitchie #1103)

**Status: drawn 24 October 2026, owner review pending, nothing built.** Mockup `fragments/history-others-picker/` (markup and class names as `server/src/history-screen.ts`; CSS is the lifted `history-phone.css` plus about 20 appended lines).

## What the owner said (voice with a screenshot, 23 and 24 October 2026, closely paraphrased)
Drop People so the top is Mine and Others. Others reveals a dropdown of the other members, each with an initial in a circle, the name underlined, and a number in a circle for their changes (example: Matilda, M, 5), with a way to select or deselect each. The underline is a hyperlink with a function, as in Kitchie today. The card heading is Recent changes (bell kept) and its line is "72 changes: 71 by you, 1 by Sleepy Gecko". Answers (24 Oct): the dropdown is closed by default; unticking the last person reticks everybody; pressing a name leaves only that person ticked; the card wording stays in the same issue.

## What the code does today (read from `uat`, not run)
The People segment is a details dropdown whose rows are links that narrow to one person (`person=<id>`). The same names are links in the catch-up line and on each person group, all meaning "only this person" (H12). The Settings window underlines links on hover.

## What the mockup draws
1. Closed (default), 2. open with everyone ticked, 3. one person after pressing a name (closed, person bar with the way back), 4. Mine. Each row is: tick box, avatar and name (link), count.

## Proposals (owner was silent)
Everyone starts ticked; a tick keeps the dropdown open while a name closes it; the dropdown is drawn even with one other member; the person bar names several people when several are ticked; the Others count follows the ticked people; the name is underlined at rest on a phone.

## Open questions
Tap area split between tick and name; underline at rest versus hover only on desktop; the card line when people are ticked.

## Loads
One small CSS file and one small script, nothing on page load beyond them. No data, route, security or cost change.

## Decisions, owner, voice, 25 October 2026 (kitchie #1103, edge cases 1 to 5)
1. Starting state: everyone ticked, nothing narrowed.
2. One other member: still show the dropdown, tick on, name link works.
3. **No memory.** Ticks live only on the open page; a refresh returns to everyone ticked; no person ids in the page address; loading older days carries the current ticks quietly. **Revisit if** refreshing mid-review proves annoying (the owner may have made a poor decision here).
4. "Back to the full catch-up" keeps its wording when several people are shown.
5. Card line keeps today's form minus the date; with several people it lists their names.

Redrawn 25 Oct 2026: `fragments/history-others-picker/` now shows closed, open, one member, several ticked with the Back link (A) and without it (B), and a name pressed both ways, with Aroha added as a third member. **Owner to pick A or B** (recommend A only for the name-press case); then record the pick here and on #1103.

Design review (separate agent, 25 Oct 2026): Pass with changes, applied: the Others trigger, Mine tab and Back link are now 44px (were 40, 40 and 36 in the lifted `history-phone.css`; **the build must make the same change**), the person bar is shortened to names and count so it no longer repeats the card line, the Mine-tab count is computed. Not rendered at +30% text. Not seen on a phone.

## Owner's notes after reviewing the mockup, voice, 25 October 2026 (kitchie #1103), closely paraphrased
- **Frame 2 (open, everyone ticked) is the pick.**
- **Drop the Recent changes card.** The dropdown already shows each person and count, so the card repeats it. Done in every frame; `picker.html#open-card` keeps one comparison frame.
- **Frame 3 (one other member) preferred**, but it shows only one other person. What matters is that the name link works for every other user; it does (dropdown name and each day's group name show only that person).
- **Ticking Matilda, or Matilda and Aroha:** the owner cannot answer yet; stays open.
- **Back link A or B, and name pressed with or without the link:** hard to choose; **undecided, both kept**.
- **History over more than today:** every frame now draws Today, Yesterday and the day before (sample rows; Mine shows a few rows under the real per-day count).

## Open after these notes
1. Where do "Mark as caught up" (tick) and "Leave the catch-up" (X) live now the card is gone, or are they dropped? They were on the card. **Proposal:** keep them in the header row beside the History title. Not drawn; a wrong guess changes how catch-up works.
2. The 25 Oct card wording ("72 changes: 71 by you, 1 by ...") has no home without the card. The person bar still names who is shown and the count.
3. Two people ticked (Matilda and Aroha): the screen's wording; owner cannot answer yet.
4. Back link A or B (frames 4 and 5, name pressed).
5. How many days the first load shows before "Load older" (drawn: three).

Not run: +30% text, a real phone. Design review of this revision not repeated.
