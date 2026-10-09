# AGENTS.md

Before changing any mockup here, read `DESIGN.md`. It is the design brief for this repo: jobs to be done first, one theme token set, playful tone, one visual family, options before decisions.

Static files, no build. Test by serving the folder (`python3 -m http.server`) and opening `index.html`.

## Performance and regression guard

Speed is a design constraint (`DESIGN.md` section 6). For every mockup screen, say in its notes what the default path loads, what is deferred and why. Load on engagement, not on page load; keep one token set and small per-screen files. Rebase before you push, read `git diff --stat` for anything outside your scope, and never undo an earlier settled improvement. Once a mockup is settled, the built app matches it exactly; a change to a settled mockup is shown here first, never built first.

## Merging: mockups go straight to main

Owner direction, 9 October 2026 (by voice, restated in chat the same day: "push to main... never wait for me to push mockups in the main"). A pull request in this repo is not part of the approval or governance process. When the work is done and checked, the agent merges it into `main` itself: no `uat` step, no waiting for the owner, no asking first. Rebase on the latest `main` and resolve any conflicts before merging, and never drop someone else's merged work to do it. The pull request description is still the working spec (next section), and open questions stay open in it; merging does not settle them. This rule is for this repo only: Kitchie, Recipe, platform and infra keep their own rules (Kitchie pull requests go to `uat`).

## Mockup and build stay close

Owner direction, 9 October 2026 (chat): the mockup and the build should share HTML, CSS and JavaScript that are very close, where possible. So write a mockup screen as the build will have it: the same element structure, the same class names and data attributes the app uses (or will use), the same theme tokens, and CSS and JS that can be lifted into the app with as few changes as possible. Plain names that exist only for the mockup's sample data stay in the mockup's own script, never in the stylesheet. When a screen is built, the builder copies the mockup's CSS and markup first and changes only what the real code needs; each difference is listed in the pull request. If the app's markup is already fixed, match it in the mockup instead of inventing a new one. Where this cannot be done, say why in the mockup's notes.

## Pull request descriptions are working specs

Owner direction, 8 October 2026. A pull request description here is the working spec for what it builds, so it must carry enough detail that nothing is lost:

- The owner's words that asked for it (quoted or closely paraphrased), what the mockup does, and the states and thresholds it uses.
- Every choice the mockup made where the owner was silent, marked **Proposal**.
- Open questions, and what a wrong guess would cost.
- What the default path loads and what is deferred (`DESIGN.md` section 6).

Do not turn a PR into a GitHub issue at PR time. That is too early: the direction is not picked yet. The owner converts PRs into issues once a design direction is chosen and stable, using the PR description as the source. Write it so that conversion loses nothing. Keep `docs/knowledge/` in step with the PR.
