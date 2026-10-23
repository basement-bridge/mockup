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
