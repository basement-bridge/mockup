# Beads export schema: `claimed_by`

Owner decision, 19 October 2026: **Beads is the binding claim store.** The GitHub issue
`factory-state` block is the **mirror**, written by `governance/tools/claim.sh`. This
file is the schema note for that claim field. It does not invent claims.

## Field

| Key | Type | When present |
| --- | --- | --- |
| `claimed_by` | string, an `https://` session URL | only while a live claim exists |

- **Unclaimed:** omit the key, or set it to JSON `null`. Do **not** write an empty
  string, a placeholder, or a made-up session URL.
- **Do not rewrite history.** `.beads/issues.jsonl` is an export of the local Dolt
  store (`bd export` / `export.auto`). Existing rows that have no claim stay as they
  are. Do not add empty `claimed_by` keys to historical rows. On 19 October 2026 the
  Kitchie export had 106 rows and none carried `claimed_by`. That count is Kitchie's.
  A new store starts empty. Do not copy another repo's issue rows in.
- **Where it sits in the export.** Beads stores custom fields as issue metadata.
  After a claim, a row looks like:

  ```json
  {"id":"kit-aaa","title":"Kitchie #838: …","status":"in_progress","metadata":{"claimed_by":"https://example.com/sessions/…"}}
  ```

  A future Beads version may promote `claimed_by` to a top-level key. Readers must
  accept either `.claimed_by` or `.metadata.claimed_by` (a non-empty string wins;
  `null` and omission mean unclaimed). Governance `checks/beads-freshness` uses
  that rule.

## Who writes it

`governance/tools/claim.sh` (via `tools/lib/beads.sh`), when `bd` is on `PATH` and a
Beads issue matches the GitHub issue:

- `claim` → `bd update <id> --claim --set-metadata claimed_by=<session-url>`
- `touch` → `bd update <id> --set-metadata claimed_by=<session-url>`
- `release` → `bd update <id> --status <mapped> --unset-metadata claimed_by`

If `bd` is missing, the GitHub mirror is still written and the tool prints
`beads: skipped (reason)` without failing. That skip is a **gap** (pin `bd` in the
agent image: governance `docs/factory/agent-environment-limits.md` §1a), not a
change to the rule that Beads is binding.

The `--set-metadata` / `--unset-metadata` flags and status names are **unverified
against the pinned `bd` v1.3.1**; only the fake in governance `tools/testlib/fake-bd.sh`
has been run. If real `bd` differs, fix the three small functions in
`tools/lib/beads.sh`.

## Coverage

Each registered repository has its own `.beads/` store. The owner, typed
21 October 2026, asked for beads in every repo, governance-owned, so a later
repo gets it too. The 19 October 2026 choice of one workspace (Kitchie's copy of
this note said this directory was the one factory store, and that other repos do
not run `bd init`) is superseded for store location. The `claimed_by` field above
is unchanged.

The list of repositories is governance `checks/beads-store/repos.txt`. Adding a
repository is one line there. That line does not create the GitHub repository,
and no GitHub App creates one from the list. Detail: governance
`docs/factory/beads.md`.

This store does not include agent hooks, a `CLAUDE.md` rewrite, or git hooks.
