# Home, Compact view: what it is for and whether to keep it (desktop)

Mockup: `fragments/compact-home-options/` (options A to F in four states, notes, open questions). Live: <https://basement-bridge.github.io/mockup/fragments/compact-home-options/>. Builds on [home-detail-panel.md](home-detail-panel.md) (decisions 133 and 290, which define Compact), `fragments/desktop-home/` (the chosen Dashboard and Compact directions) and `recipe-ideas/` (the Cooking ideas pane, whose empty state this view shares). **Status: owner ask 22 Oct 2026; six options drawn; every decision below is a Proposal (CH-P) or an open question (CH-Q); nothing is decided and nothing is built.** Series CH so the numbers do not clash with 133 to 292 or the other series.

## Job

Same as Home: decide what to cook now and act on it. Compact is the ask-first version: one answer, no side panel, no This week (133). The owner, typed, 22 Oct 2026: "give me some solid options for the compact view of the dashboard by understanding what is actually happening here, because I have moved on a lot on the non-compact version. I'm considering whether this is really worth having, but tell me whether that design could be improved with some of the ideas ... mockups as per the process."

## How we know the person is in this job

They are on Home at 1024px or wider and chose Compact view with the toggle (remembered per browser, desktop only). Phone and tablet Home are unchanged.

## What leads

The answer to "What are we eating?": tonight's planned meal, else the top idea, with Make it and Plan. When nothing fits, the answer is the closest things to cooking and what each is missing, not a sentence and one button.

## What this job does not need

No This week, no stack of going-off and running-low rows, no detail panel (133). A recipe result may open the recipe flyout (290). No Surprise me (it belongs to the Plan; it never hands off to an AI, decision 292). Ask AI is the only hand-off and appears only when nothing fits.

## What is actually happening (from the owner's screenshot of the empty state)

1. A dead end: one Plan ahead button, lower half empty. The phone pane's empty state also has the freezer meal and Ask your assistant; Compact has neither.
2. One sentence, two causes: "three or more things you do not have" (a shop fixes it) joined to "left out for someone eating" (a shop cannot).
3. The pills ("2 running low", "Nothing planned today") look like information and are the most actionable things; with no panel in Compact they can only link away.
4. The chips do nothing you can see: above the answer, one idea or none to re-rank.
5. The rule has a floor: a recipe fits with at most two things missing, so a near-miss when nothing fits is missing at least three. "Missing 2" can appear on rows that fit, not as a near-miss.
6. Compact shows one idea; that is its value and also why it has the least to act on.

## Mockup

| Piece | What it shows |
|---|---|
| `index.html` | The findings above, a state switch (Normal with fits, Tonight planned, Nothing fits, Nothing fits because of exclusions) and seven framed desktop-width views (Today, A to F), a table of the options, an honest read on keeping Compact, proposals, open questions, what loads |
| `compact.css` | The styles a build lifts: desktop-home's class names, plus `.empt .rsn .rg .nrow .lens .gp .tray .rblock .lk .dense` |
| `mock.js` | Sample data (invented) and one render path; an option is a set of flags (`near strip split lens eco dash`) |
| `tools/compact-home-options-check.mjs` | 72 checks: every option in every state in a dark and a light theme, the behaviour of A to F, no scroll in E, no hex colour |

## Options

- **Today.** As in the screenshot, for comparison.
- **A Near-misses.** When nothing fits, the freezer meal (if any) then the closest three: "Missing 3: x, y, z", one-tap Add to the list (toggles to On the list).
- **B Actionable status strip.** Pills are buttons: going off and running low open a popover tray (Add to list per item, Add both); Plan tonight is prefilled with the top near-miss when there is no lead; Plan ahead is the last pill and leaves the empty card.
- **C Split the reason.** "n recipes need 3 or more things" (a shop fixes it) apart from "n recipes left out for Priya and Jo" (shopping cannot), each "blocked for Priya (peanut butter)", and a Change who is eating link.
- **D Chips as a lens.** Below the answer, with counts, re-rank (never hide), single choice, dim and dashed at zero. Needs a lead and two more rows.
- **E Recommended if Compact stays: A + B + C + D.** One column, no scroll in a 1280 by 680 window in any state (content 440 to 605px). One dashed "n left out" chip ends the lens row when something is blocked. Ask AI only when nothing fits.
- **F Retire Compact.** The Dashboard with no toggle; Settings > Compact rows (exists for Pantry rows) also tightens Home rows. A and C are drawn inside its ideas card. Dashboard needs 703 to 860px (scrolls in the 680 window), 678 to 739px with Compact rows.

## Decisions

None confirmed. Proposals (the owner was silent), each with the cost of a wrong guess on the page and in the PR:

- **CH-P1** Near-misses: nothing blocks them, three or more missing; fewest missing, then quickest; at most three.
- **CH-P2** The freezer meal leads the nothing-fits answer (as on the phone pane).
- **CH-P3** "Add n to list" adds exactly that recipe's missing things; second tap takes them off; no confirmation.
- **CH-P4** The Plan tonight pill exists only when there is no lead.
- **CH-P5** Plan tonight on a near-miss plans it and adds its missing things to the list, with an Undo.
- **CH-P6** Plan ahead is the strip's last pill, always; the empty card keeps no buttons.
- **CH-P7** Going off opens a read-only tray; running low opens Add to list per item and Add both; a zero count drops the pill.
- **CH-P8** Chips are a single-choice lens that re-ranks and never hides; counts over what is shown; zero is dim and dashed.
- **CH-P9** In E, blocked recipes are not rows; a "n left out" chip opens who and what.
- **CH-P10** Ask AI is a quiet link in E when nothing fits; Surprise me is not on Home.
- **CH-P11** F is the Dashboard as it stands with Compact rows on; extending Compact rows to Home is mine; the Dashboard's empty state gets A and C.
- **CH-P12** Frames are 1280 by 680 so what shows without scrolling can be judged.

## Open questions

- **CH-Q1** Is "three or more missing does not fit" the real threshold? (Copy and one number.)
- **CH-Q2** Keep or retire Compact? Recommendation: retire (F) unless the owner uses it; if kept, build E. A and C go into the shared ideas pane either way.
- **CH-Q3** Does Plan tonight belong on a recipe that needs shopping, or only add to the list?
- **CH-Q4** Running-low tray as a popover (drawn) or the flyout lane?
- **CH-Q5** Is leaving someone out for a night allowed from a food-rules block? (A preferences decision.)

## For the implementation

- Copy `compact.css` and the markup `mock.js` writes first; list each difference in the PR (AGENTS.md). One render path with flags.
- Near-misses need a stock match for every recipe, not only the top idea (Recipe `what_am_i_missing`). Load it only when the answer is empty, one call; the trays read the items Home already has; nothing is fetched by the page on load.
- A and C also apply to the Dashboard's ideas card and to the phone pane's empty state; build them once in the shared ideas component.
- Check: `node tools/compact-home-options-check.mjs`.
