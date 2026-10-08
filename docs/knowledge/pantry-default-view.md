# Pantry default view: grouped by area, Out and zero hidden

Status: mockup for the owner to review (8 Oct 2026). Source: owner's decision by voice, 8 October 2026, recorded in Kitchie issue #329. Lines marked **Proposal** are choices the mockup made where the owner was silent.

Code: `flows/household/app.js` (`visibleItems`, `listHtml`, the `.count` in the `pantry` screen).

## What the owner decided

1. **Grouped by area.** The default Pantry opens on sections by location (Fridge, Pantry, Freezer and so on), A to Z within each. Not a flat "Use by" list. The mockup already did this; nothing changes.
2. **Hide what is gone.** On the default screen, items at level **Out** or with **quantity zero** are not shown. They stay reachable through the filter and search.
3. **Use by** stays available as a sort and a filter ("Expiring soon"); it is just not the default.

## Rule the mockup uses

- Hidden means `level(item) === "Out"`, which is true when the quantity is zero or less, or when a level-only item is set to Out. One test for both.
- The rule applies to the default screen only: no search text and no filters or sort chosen. This includes the Location/Category tabs (the area tabs narrow the default view, so they keep the rule).
- **Search shows Out items.** Any search text lifts the rule, so a used-up item can be found by name and brought back.
- **Filters and sort show Out items.** Choosing any filter or sort leaves the grouped default, and the rule is not applied there (the custom view lists everything that matches). Out items appear under, for example, Running low or a chosen location.

## Proposals (owner silent)

- **Proposal: the item count** at the top left of Pantry counts what the default screen shows (Out items left out). With search or filters on, it counts every item, as before. A wrong guess costs a count that disagrees with another screen by the number of Out items.
- **Proposal: empty message.** If everything is Out, the default screen says "Nothing in stock here. Search or use Filters to find what is out." rather than "Nothing matches."
- **Proposal: no dedicated "Out" filter row.** Out items are reachable with search or any filter. If the owner wants a one-tap "Out" status in the filter sheet, that is a new filter and needs his say.
- **Proposal: the rule is not user-switchable** (no setting to show Out items by default).

## Open questions

- Should the area tab counts or group headers say how many Out items are hidden? Not added. A wrong guess costs nothing now; adding it later is additive.
- The seed data has no Out item. Mark one "Used up" (swipe, or the item sheet) to see it leave the default list; Undo in the toast brings it back.

## Performance (DESIGN.md section 6)

No change to what loads. The rule is one extra comparison in the existing list render; no new file, request or script. Default path loads what it did before; the filter sheet is still drawn on engagement.
