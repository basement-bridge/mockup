# AGENTS.md

Before changing any mockup here, read `DESIGN.md`. It is the design brief for this repo: jobs to be done first, one theme token set, playful tone, one visual family, options before decisions.

Static files, no build. Test by serving the folder (`python3 -m http.server`) and opening `index.html`.

## Performance and regression guard

Speed is a design constraint (`DESIGN.md` section 6). For every mockup screen, say in its notes what the default path loads, what is deferred and why. Load on engagement, not on page load; keep one token set and small per-screen files. Rebase before you push, read `git diff --stat` for anything outside your scope, and never undo an earlier settled improvement. Once a mockup is settled, the built app matches it exactly; a change to a settled mockup is shown here first, never built first.

## Pull request descriptions are working specs

Owner direction, 8 October 2026. A pull request description here is the working spec for what it builds, so it must carry enough detail that nothing is lost:

- The owner's words that asked for it (quoted or closely paraphrased), what the mockup does, and the states and thresholds it uses.
- Every choice the mockup made where the owner was silent, marked **Proposal**.
- Open questions, and what a wrong guess would cost.
- What the default path loads and what is deferred (`DESIGN.md` section 6).

Do not turn a PR into a GitHub issue at PR time. That is too early: the direction is not picked yet. The owner converts PRs into issues once a design direction is chosen and stable, using the PR description as the source. Write it so that conversion loses nothing. Keep `docs/knowledge/` in step with the PR.
