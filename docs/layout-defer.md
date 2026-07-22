# Layout audit — deferred items (Phase 6b, Commit 3)

Scope: fix z-index / spacing overlaps in the header region across the eleven QA
screens at 1920×1080, 1440×900, 1024×768, and 360×740. No redesign — existing
Tailwind/CSS spacing tokens only.

## Root cause found

The fixed control cluster (`AppMenuClient`: Log in/out, plan chip, Menu) is
pinned **bottom-right on mobile** and **top-right on md+** (`z-[70]`). `.ui-shell`
already reserved *bottom* padding on mobile to clear it, but there was **no
matching top reservation on md+**, so page-heading actions (Edit profile,
Account and billing, and Back buttons on detail screens) rendered underneath the
cluster once horizontal room tightened.

Measured overlaps on the dashboard before the fix:

- 1440×900: plan chip ∩ "Account and billing" (~138px²)
- 1024×768: menu/logout/plan-chip ∩ "Edit profile" / "Account and billing"
  (up to ~660px²)
- 1920×1080 and 360×740: no overlap (wide desktop has horizontal room; mobile
  cluster is bottom-anchored)

## Fix applied (both apps)

`globals.css`: reserve a top band on md+ mirroring the existing mobile bottom
reservation —

```css
@media (min-width: 768px) {
  body .ui-shell { padding-top: 3.75rem; }
}
```

`body .ui-shell` is used (not bare `.ui-shell`) so it beats the per-page
`sm:py-12` utility on source-order ties. This clears the cluster's vertical band
(top:16px + ~36px tall) for every `.ui-shell` page — dashboard and all detail
screens — at a single point, with no per-screen edits and no visual redesign.

## Regression coverage

- `apps/consumer/tests/e2e/headerLayout.spec.ts`
- `apps/gyms/tests/e2e/headerLayout.spec.ts`

Both log in a real Pro user, load the dashboard at all four breakpoints, collect
bounding boxes for the header controls + info pills, and assert zero pairwise
overlaps. Both green after the fix.

## Deferred

**None.** Every observed header overlap was resolved with the single spacing
reservation above; no overlap required a redesign, so nothing is deferred to a
future dedicated design pass. If later QA surfaces an overlap that can't be
fixed with spacing/z-index tokens, record it here with screen, breakpoint, and
why a redesign is required.
