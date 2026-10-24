# Preferences, option H final (bottom-sheet editing)

Status: mockup for the owner's review (25 Oct 2026), built into Kitchie `uat` in parallel (phone only; the desktop window and `?win=1` untouched). Source: owner, 25 Oct 2026, "build H" after the nine-option review (`preferences-options`, `jobs-to-be-done/settings-redesign.md`), plus the coordinator's locked decisions and the owner's 07:36 answers. Lines marked **Proposal** are mockup choices where the owner was silent.

Live: `fragments/preferences-h-final/` (`?view=` mine, edit, soft, add, addswap, addlimit, comment, confirm, undo, hh, member; `&w=360`; `&ts=3`; `&bare=1`). Check: `tools/preferences-h-final-check.mjs`. Code: `ph.js`, `ph.css` (the build's class names: `fgroup`, `fh`, `frow`, `fmain`, `fmark`, `fscope`, `fplus`).

## What the owner asked for (decisions)

- **PH-D1. Base H.** The list only reads. Add and Edit open the SAME bottom sheet (what it is, Hard or Soft, who it is for, comment).
- **PH-D2. Swipe a row to remove it, one direction: LEFT** (platform-natural; the same direction Kitchie already uses to take a line off: shopping "left to take it off", Plan "left to replan", receipt rows "left to reject"). Past 72px (the receipt rows' line) it is a removal; short of it the row springs back. Swiping a HARD rule asks in place (the row turns into "Remove this hard stop?" with Remove and Keep); swiping any other rule (Soft, Like, Swap, Limit) removes it at once.
- **PH-D3. After ANY removal a short Undo bar** at the bottom, no prompt. 8 seconds; Undo puts the rule back where it was.
- **PH-D4. The swipe never fights the page.** The row is `touch-action: pan-y`: vertical movement is the page's scroll; a swipe is claimed only when the move is mostly sideways and 12px or more. There is no horizontal rotary on this page. A swipe that springs back does not also open the sheet.
- **PH-D5. A way that is not a gesture:** the sheet's Remove (a Hard rule asks once), and Delete or Backspace on a focused row (same as the swipe). The Undo button is a real 44px button, reachable by Tab.
- **PH-D6. "Reason" is "Comment"** (free text, 200 characters; the owner did not choose between "Comment" and "Reason / comment", so the label is "Comment"). Above the box a checkbox **Share with household**, OFF by default. Unticked: the comment is private. Ticked: household members can read it. The rule itself stays shared as today. One short line under the box says who can read it (it changes a decision).
- **PH-D7. A plus on the right edge of each group header** (Avoids, Likes, Swaps, Limits; 44px square or more) opens the sheet preset to that group. The separate Add rows are gone. Avoids carries the one accent.
- **PH-D8. Hard and Soft are WORDS, not lock glyphs** (owner, 25 Oct 07:36: "I think word"; closes **SR-Q64**, supersedes SR-P73). On the row and in the sheet. Just you is one person and Everyone is two people, unchanged. No new symbols.
- **PH-D9. Exceptions to a rule** ("gluten except soy sauce") are CLOSED: no feature. An exception is said in the Comment text.
- **PH-D10. Option F (swipe through categories) is shortlisted, not built.** Assistant logos stay monograms (not touched here).

## The sheet (one design for Add and Edit)

Title: the rule's words (Edit) or "Add avoid / like / swap / limit" (Add). Close is a 44px X. Fields, top to bottom:

1. **What it is.** Add: a box labelled Food (Avoids, Likes, Limits) or Instead of (Swaps). Edit: it is the title (what a rule says is not edited here; it never was).
2. **Swaps: Use** (the replacement). **Limits: Times a week** (a stepper, 1 to 21). Edit shows the value as a line.
3. **Avoids: Hard | Soft** (two words, one chosen, a tick on the chosen one) with the consequence in two words ("Never suggested." / "Ranked lower."). Hard to Soft asks once; Soft to Hard does not (unchanged).
4. **Who it is for.** Add: Just you | Everyone (a person, two people; Everyone only for an admin). Edit: shown, never a control (moving a rule between the two has no operation today; SR-P78 stands).
5. **Avoids: Share with household, then Comment.** Likes, Swaps and Limits have no comment, as today (a reason exists only for an avoid, Hard or Soft). **Proposal PH-P1.**
6. **Add: the Add button.** Empty name says "Needed", keeps the sheet and focuses the box. **Edit: Remove and Done.** A change saves as it is made (Hard or Soft at once, the comment as you type), as the page already does.

Focus: the sheet opens with focus on its first field (Add) or its Close button (Edit); Tab and Shift Tab stay inside; Esc and Close return focus to the row or plus that opened it. The page behind is inert.

## Privacy of the comment (what the build enforces, server-side)

- A comment is readable by whoever wrote it, by the person whose own rule it is, and by anyone else only when Share with household is ticked. A household rule's private comment is readable by its author alone, so another admin cannot read or overwrite it (the sheet then shows no Comment box for it; try Everyone, peanuts).
- Existing comments stay private. Today another member can read a housemate's reason (the Housemates page and the plan guard both read it); after this change they cannot unless it is shared. That is a visible tightening on those two surfaces. **Flagged for the owner (PH-Q1).**

## Proposals (owner silent; wrong guess cost in brackets)

- **PH-P1.** Comment only where a reason exists today: Avoids (Hard and Soft). [Low: widening it later is one column per kind.]
- **PH-P2.** The row shows the name, Hard or Soft, and who it is for; no second line for an avoid's comment (H's calm row). A Swap and a Limit keep their value on the row ("Swap in X", "At most twice a week"), because the value is the rule. The comment shows in the sheet. [Low.]
- **PH-P3.** Undo lasts 8 seconds and covers the last removal only. [Low.]
- **PH-P4.** Add, in a Soft avoid, creates a dislike; in a Hard avoid, an avoid (the same rule words as today). Adding a rule from the screen is new: until now it was the assistant's alone (food F8). The same limits apply (60 characters, 300 rules a household, admins only for Everyone). [Medium: the owner approved the Add sheet; a write path was needed.]
- **PH-P5.** A category rule (a limit on "Spicy", with attached recipes) keeps its own page editor; it is not in the sheet and not swipeable. [Medium: it is not read-only like the rest; the sheet cannot host the recipe list.]
- **PH-P6.** The mouse can drag a row in this mockup so a reviewer on a desktop browser can try it; the build swipes with touch and pen only. [None.]

## Open questions

- **PH-Q1.** Housemates' and the plan guard's reading of another person's comment is now private unless shared. Intended? [If not: a household-wide default would need a different default for the flag.]
- **PH-Q2.** Should a household rule's comment be readable by all admins by default? Today the author alone reads a private one. [Low.]
- **PH-Q3.** Category rules in the sheet (PH-P5)? [Medium.]

## Jobs, words, accent (DESIGN.md 9)

- **Job:** read what is avoided at a glance; add or change one rule in one place; take one away and take it back.
- **Accent:** the plus on Avoids; the Add button in the sheet. One at a time.
- **Words:** rows carry the name, one word (Hard or Soft) and a person glyph. The first view's words are counted by the page.
- **Warmth (9.10):** the values stay on the rows (Hard, Soft, who, swap and limit values), the household's own words stay the loudest thing on every row.

## What loads

The default path loads nothing new beyond the page's own script. The sheet and its fields are drawn when a row or plus is tapped; the swipe is a few lines in the page script.

## Not tested

A real phone and a screen reader (checked: names, roles, focus order, live regions); Safari; Firefox.
