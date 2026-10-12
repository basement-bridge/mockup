# History, Option A: search first

Status: mockup for the owner to review (11 Oct 2026). One of four parallel options drawn in one pass so the owner can lock decisions together. Nothing is built in Kitchie or Recipe. Every line marked **Proposal** is a mockup choice where the owner was silent; none is settled. Numbers A1 on are this option's proposals.

Mockup: `history/option-a/` (`index.html` hub, `mobile.html`, `desktop.html`, `history.css`, `history.js`). Serve the repo with `python3 -m http.server` and open `history/option-a/index.html`. Every state opens from a link on that page. Screenshots: `docs/screenshots/history-option-a-*.png` (phone 390 and 360, tablet 768, desktop 1280 and 1440, night and day).

## The owner's words

Owner, voice, 11 October 2026: History should be searchable on mobile and desktop, as separate layouts designed together in one pass so he can lock decisions in one go. It covers both Kitchie (inventory, shopping, plan, cooking, preferences) and Recipe (create, edit, versions, cook, star and vote). Think broadly about what people look for: things they did themselves, things other household members did (and the AI assistants, voice and MCP), specific items or recipes, time ranges, action types, places. Options, not decisions. Nothing built into the real apps.

Standing rules that apply (checked in this repo): jobs first, playful tone, one visual family (`DESIGN.md` 1 to 4); speed, say what loads and what is deferred (6); history is fetched only when asked and never preloaded (`docs/handover/desktop.md` section 1); close is Ctrl or Cmd Esc and plain Esc only clears the search box (`settings-window.md` SW-9; the older desktop notes still say Ctrl/Cmd Enter); Shift+? is the global shortcuts list (`shortcut-cues.md`); every key hint carries `kbd` so the cues switch hides it.

## The job

"I want to find out what happened." Four different jobs hide in that, and the box has to serve all of them without a mode switch:

1. **Who did that?** ("who moved the rice") wants one answer, fast.
2. **What happened to this thing?** ("milk last week") wants a short timeline.
3. **What did that person or assistant do?** ("what did Sam cook", "what did Claude do") wants a list by actor.
4. **Put it back.** Finding a mistake and undoing it is the follow-on from all three.

## What Option A is

One smart box. The person types or says a plain phrase. It is turned into **editable chips** (Who, Did, Item, When, Where, How, In, Showing). The chips are the real filter: tap one to change it from a short list, x to remove it, Backspace on an empty box removes the last. Results are one **grouped timeline** (day headings, newest first) with Kitchie and Recipe entries mixed. Option A is search first, so there is no filter screen to start from; the "pick a filter" buttons exist only for people who prefer not to type (A12).

The parser in `history.js` is a small rule list (not an AI): it understands the words in "Try typing" on the hub page. In the build the same job can be a rules pass first and the member's assistant for anything it does not understand (A15, open question Q-A4).

## Field catalogue (Proposal)

What an entry can say about itself, and what each field is for. "Source" is where the build would read it. I checked the tool schemas available to me (Kitchie `item_history`, Recipe `list_revisions`, `undo_event`, `revert_change`, `react`, `record_usage`); I did not read either repo's code, so "Source" is a best reading, to be confirmed.

| Field | What it holds | What it is for | Source (to confirm) |
|---|---|---|---|
| **Who** | The household member, a shopper-link guest, or the system | "what did Sam do", "my changes" | Kitchie journal `by`; Recipe revision author |
| **Domain** | Kitchie or Recipe | The small badge on the avatar; the "In" chip | which store the entry came from |
| **Area** | Kitchie: Pantry, Shopping, Plan, Cooking, Preferences. Recipe: Create, Versions, Cook, Stars, Votes | Narrow to one screen's worth | derived from action |
| **Action** | A closed vocabulary: added, used, used up, moved, changed, removed, listed, unlisted, bought, planned, cooked, starred, unstarred, voted, created, edited, put away, preference set, checked, undone | "what did Sam cook"; the Did chip. Chips group them (Used = used + used up) so people do not need the exact verb | journal action; revision kind; state event |
| **Subject** | The item, recipe or version name (plus its id behind the name) | "milk", "rice"; Item chip. Matched on words, ignoring a trailing s | item or recipe |
| **When** | Exact time stored, shown as day group and clock time | Time ranges: today, yesterday, this week, last week, past 7 days, this month, last month, all time, "since Thursday", "on Mondays" | timestamp |
| **Where / spot** | The location or spot involved (before or after for a move) | "fridge since Thursday" | item location fields |
| **Source (how)** | App, item sheet, voice, assistant (which one, for whom), assistant link, import, shopper link, automatic | "what did Claude do", "by voice". The shown name is "Claude, for Priya": the person who linked it, so a household member is accountable | journal `source`; Recipe `channel` and `client` |
| **Said or worked out** | Whether the person said it or the assistant concluded it | Trust. Kitchie marks `by: user` only when the person said it and `model_inference` otherwise. Shown in the detail, not in the list | journal `by` |
| **Amount** | Quantity, level, minimum, amount used in a cook | "what used milk", the before and after line | journal before and after |
| **Before and after** | The field that changed, old and new value | The one-line change under the sentence ("Level: Some to Out") | journal before and after; Recipe diff rows |
| **Note or their words** | A free note, or the person's own words (`user_intent` in Recipe) | Context ("Sam: keep that one, less oil") | note; `user_intent` |
| **Linked entries** | A cook produces two entries (Kitchie consumption, Recipe usage) with one shared id | Show one row with the second one as a sub-line (A6) | needs a shared cook id (Q-A6) |
| **Undo state** | can undo, undone (by whom, when), cannot undo (with the reason), changed since | The Undo button and the reason text (A9) | derived from later entries on the same field |
| **Batch** | A change made for every item at once | Collapse into one row, "12 items" | Kitchie `change_for_all_items` (`batch` is set on the entry) |
| **Revision number** | Recipe version revision n | "Open revision 4" link in the detail | Recipe revisions |
| **Visibility** | Who may see the entry | "No" votes must not show a name (below) | Recipe `react` |

Privacy found in the tool text: Recipe `react` says names of people who said "no" are never shown to others. History must not break that: a "no" vote appears only to the person who made it (or not at all). The sample shows liked votes only. This is stated as A10 and question Q-A5.

Fields thought about and deliberately left out of the mockup: device, IP, app version (support, not people), item photos, nutrition figures, price. Cheap to add as fields if wanted.

## Proposals

**A1. One box, chips as the real filter.** Typing shows an "Understood as" preview and live results; Enter locks the phrase into chips and clears the box. Each chip edits (tap) or removes (x). A wrong guess by the parser is one tap to fix, which is the point of chips.

**A2. Questions get a quick answer.** A "who" question puts one answer card on top (Sam moved rice to Pantry, Thu 8 Oct, 6:12 pm, with "n earlier" if more) above the timeline, so job 1 does not need reading a list.

**A3. One grouped timeline for both apps.** Day headings (Today, Yesterday, Sat 3 Oct), newest first, quiet days skipped (as the item History column does today). A row is: avatar, a sentence, one change line, a quiet meta line (time, how, app and area). No separate Kitchie and Recipe tabs; the "In" chip filters if wanted.

**A4. Who is the avatar, which app is the corner badge.** The avatar shows the person's initial (you in the accent colour), a mic for voice, a spark for an assistant, a link for the shopper link, a gear for automatic. A small jar (Kitchie) or pot (Recipe) badge sits on the corner, the same icons the rail uses. The sentence says "You" for the viewer, "Claude" for an assistant, and the meta line says "Claude, for Priya".

**A5. Words for time.** Weeks start Monday. "Last week" is the previous Monday to Sunday (28 Sep to 4 Oct on the sample date), and the chip says so with the dates. "Past 7 days" is the rolling alternative, one tap in the chip. Zero results for a time chip offers "Search all time".

**A6. A cook is one row.** Cooking in Kitchie and "cooked" in Recipe are one event to the person. The row reads "You cooked Egg fried rice" with a second line "Recipe: Cooked Our usual version, 1 more time". Needs a shared id (Q-A6).

**A7. Phone: full-screen search.** Back arrow, the box (with a mic), chips under it. The empty box shows Recent (each forgettable with an x), six suggested questions written the way people say them, and "Or pick a filter" buttons. A tapped row opens a bottom sheet with the entry's fields and Undo. Entry: the Settings History row opens it; a magnifier on Home does the same (Q-A2).

**A8. Desktop: command bar plus a page.** Ctrl or Cmd K opens a command bar over whatever screen is up (the screen behind is inert and dimmed, left-aligned with the main column like the shortcuts list). Enter on a row opens a 300px detail pane inside the bar. Shift Enter, or the link in the footer, opens the same search as the full **History page**: a title, the box and chips, the timeline in the 640px column, and a right panel that shows facet counts ("Narrow it down": Who, How, Where it happened, each with live counts and a dashed zero) until a row is picked, then that row's details. G then Y opens the page from anywhere (Profile already uses G Y for its History section; Q-A3).

**A9. Undo where the data allows.** Undo is a new entry, never a rewind (Recipe's rule: "undo is saved as a new revision", the History only grows). The row shows Undo only where it is safe. The detail says exactly what it will do ("Puts the milk back at Some. Saved as a new entry"). States: can undo; Undone (struck through, "Undone by Priya, Sat 2:10 pm", a Do it again); cannot undo, with the reason (changed again since, the shopping trip is finished, automatic, a check). Z undoes the focused row, matching the Z undo already in Pantry. What the tool lists suggest: Recipe has `undo_event` (state changes, fails with `stale_base` if the value moved on), `revert_change` and `restore_revision`; Kitchie lists `correct_item` but I saw no undo tool, so Kitchie undo would be a corrective write of the old value (Q-A7).

**A10. People who said no are not named.** A "no" vote is never listed by name to others. Liked votes and stars are listed.

**A11. Detail values are search links.** In the detail, each value (who, what, did, where, how, app) has a quiet plus: tap it to add that value as a chip ("more like this").

**A12. Filters stay reachable without typing.** "Or pick a filter" (phone) and the facet panel (desktop page) add chips from a list. Same chips, same state, so Option A is not typing-only (voice and keyboard people are first, taps are never second).

**A13. Voice.** The mic in the box takes the spoken question and fills the same chips. Mockup shows a toast only. The member's own assistant could also be asked, and then answers in History's terms (Q-A4).

**A14. States.** Start (recents, suggestions), live typing (preview and live count, announced politely), results, zero results (a playful line, tips: widen the time, drop the item, any person, any action), loading (skeleton rows, no spinner, still under reduced motion), nothing yet (a new household: "Nothing has happened here yet. Add milk or cook something and it lands in History"). Loading and empty are reachable from the hub by link.

**A15. Parser is rules first.** The mockup parses with a short word list. The build starts there (instant, offline, free), and anything it cannot place stays as an Item chip so the person can see and fix it. Not an AI call per keystroke.

**A16. Keys (shortcut-cues.md).** In the bar and page: Ctrl or Cmd K open (anywhere), `/` focus the box on the page, Up and Down move through rows (Down from the box, Up from the first row back to it), Enter opens details, Z undo the focused row, Shift Enter open as a page, Esc clears the draft (then the open picker), Backspace on an empty box removes the last chip, Ctrl or Cmd Esc closes the bar, G then Y opens the page. All hints are `kbd`, so the cue switch hides them, and Shift+? lists them. None fires while typing except the box's own. J and K are not used: they are letters in a search box.

**A17. Visual family.** Same tokens and controls as the rest: round 44px close, pills for chips, check-style rows, the item History's dot-less list restyled as day groups (A3; the item column's own timeline dots stay as they are because that column is per item). Touch targets are 44px on the phone; chips are 36px high on desktop where a pointer is the norm.

## Open questions (and what a wrong guess costs)

- **Q-A1. Calendar week or rolling seven days for "last week"?** Drawn: Monday to Sunday, shown on the chip. A wrong guess means "milk last week" misses Thursday's milk when asked on a Sunday; the chip shows the dates, so the person sees it. Cost: one default value.
- **Q-A2. Where does the phone get in?** Drawn: Settings History row, plus a magnifier on Home. Wrong guess: a person looks on the rail or tab bar and does not find it. Cost: one entry point, no data.
- **Q-A3. Is Ctrl or Cmd K right, and may G Y mean the page?** K is the common command-bar key but browsers use it for their own search bar in some cases (the page can take it). G Y matches the Profile window. A wrong guess costs one keybinding, but a late change breaks muscle memory.
- **Q-A4. Rules, an assistant, or both to read the phrase?** Drawn: rules. If the owner wants any sentence to work ("what did I cook before the weekend that Sam liked") the build needs an assistant call, which costs money, latency and a privacy decision (the household's history goes to a model). Wrong guess either way is a rewrite of the parser behind the same chips.
- **Q-A5. Who may see whose entries?** Everyone in the household sees everything now, except "no" votes. If preferences entries (someone else's dislikes) or a proposal for another member should be private, History must hide them. A wrong guess leaks a preference line, which the preference principles treat as a real harm. Needs the owner.
- **Q-A6. Is there a shared id between a Kitchie cook and a Recipe usage?** If not, A6 needs one added, or the two rows stay separate and the mix looks doubled. Cost: a small change in two repos.
- **Q-A7. Which changes can really be undone, and who may undo another person's?** Drawn: anyone in the household may undo, with the stale check. Kitchie has no undo tool in the list I saw, and an undo of an assistant's change on a kept version "opens a review" in Recipe. Wrong guess: an Undo that fails or overwrites a later change.
- **Q-A8. How far back, and for how long is it kept?** The sample goes back about three weeks. Retention affects "all time" and zero-result wording.
- **Q-A9. Should the command bar also search things (pantry items, recipes) as most command bars do?** Drawn: History only. If it also finds items, the bar turns into a global search and needs its own option.
- **Q-A10. Does the item History column keep its own `,` view?** Drawn: yes, it stays (one item, lazy). Its "See all history for this" would open the page with an Item chip.
- **Q-A11. Shopper-link guests as people.** Drawn: a guest shows as "Jo (shopper link)". Do guests appear in the Who list at all?

## What the default path loads and what is deferred (`DESIGN.md` section 6)

- **Default path.** Opening the phone screen or pressing Ctrl or Cmd K loads `history.css` and `history.js` (about 47 KB together before compression, both cacheable) and draws recents and suggestions from memory. **No History request is made.** Recent searches are local to the device.
- **Fetched on the first keystroke or tap on a suggestion.** One page of results (about 30 entries) for the chips as they stand, debounced about 250 ms, cancelled by the next keystroke. "Show more" (scroll) fetches 30 more. The count line and the quick answer come from the same response.
- **Deferred.** The detail pane or sheet is built only when a row is opened (the fields are in the row's data, so no second request). Facet counts on the desktop page are one aggregate call made after the list has drawn, and not at all in the bar. The mic (speech) loads on first press. Other themes load only when picked (`theme.js`).
- **Why this is reasonable.** Most opens are "look and leave". The cost of drawing the start screen is nil, and the search is paid for only when someone asks. Nothing refreshes by itself.
- **Per entry cost.** The sentence is composed on the client from the fields, so the server sends data and not copy.

## Differences from what exists

- The item History column (desktop item panel, `,`) stays as is (Q-A10).
- The Profile window History section (`fragments/desktop-profile/`) today lists a few events with All, Mine, Sam toggles. This option would replace that list with the search page or embed it; the toggles become the Who chip (Q-A3 and A8).
- The recipe versions History (`recipe-versions/history.html`) lists one version's revisions with Undo this change and Go back to this. Option A reuses its wording and its rule that an undo is a new entry. Its per-version list stays; History search is across everything.
- The sample uses the household's example names (Priya, Sam, Jo). No real person is in the data.

## Not drawn

Export, saved searches, notifications, per-entry comments, bulk undo, and the tablet (600 to 1023) as its own layout: tablet is the phone screen in its 390px frame centred, as the household flow does (`DESIGN.md` section 7).
