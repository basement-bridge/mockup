# Mockup project plan: exceptions and proposals awaiting the owner

This file records, for the mockup repo, anything that breaks a settled rule and needs the owner's call. Kitchie keeps its own `docs/project-plan.md`; `kitchie AGENTS.md:187` says a screen that needs its own layout per width bucket "records the exception in `docs/project-plan.md` and asks the owner", so the entry below is the record on the mockup side and is to be copied into Kitchie's plan only after the owner answers. Nothing here is settled.

## Proposed, awaiting owner

### RDD-X1 Recipe detail page, desktop: width-rule exception and breakpoint (17 October 2026)

- **Status:** proposed, awaiting owner. Not approved, not built.
- **The rule it breaks:** `kitchie AGENTS.md:181` (rail 88px, column 640px plus gutters, side panel 400px, "do not add other desktop widths") and `AGENTS.md:187` ("a screen does not get its own layout per bucket"). Widths are tokens only; no width literal in a rule.
- **Why:** the owner asked to rethink the big-screen layout of the recipe page (Kitchie #830): no scrolling where possible, ingredients as a short wrapping list, the method given the room. A 640px column cannot hold a rail plus a two-column method.
- **Proposal (Claude):** the recipe page uses the space right of the 88px app rail, left-anchored, capped at 105rem (1680px), as a rail (`--rec-rail`, `clamp(21rem, 25vw, 28rem)`) and a method area; the Notes and reactions flyout (400px) pushes the page and never covers it, free space collects to the right. The three widths are tokens (`--rec-rail`, `--rec-max`, `--rec-lane`) in one desktop-only file, not literals in rules.
- **Breakpoint proposal:** the new layout applies from 80rem wide and 700px high. From 64rem to 80rem, and on shorter windows or high browser zoom, today's single-column page stays (a fixed-height page without a scroll fallback fails at zoom above 125% and in find-in-page). Alternative if the owner prefers: design 1024 to 1279 as well.
- **Where it is drawn:** `fragments/recipe-detail-desktop/recommended/` (files `recommended.css` base and `recommended-wide.css` viewport file). Decisions and the other open questions: `fragments/recipe-detail-desktop/notes.md` section 7.
- **Cost of a wrong guess:** a second desktop layout nobody wants, or a layout that breaks at 1024 to 1279.
- **Owner answer:** none yet.
