# Phase 6d — Mobile Polish Pass: decisions log

Branch: `phase-6d-mobile-polish`. Every falsified approach and every judgment
call made where the spec left room for interpretation gets a line here.
Scope is consumer app only per the spec's "What is NOT in this pass" (no
gyms mobile audit).

## Commit 1 — Session screen bar consolidation

**"Session-start" vs "active-exercise" header state.** The spec refers to
"Screen 6" (session-start, full header) and "Screen 7" (active-exercise,
collapsed header) as if they were distinct routes. In the actual code
they're the same `SessionClient` render for every exercise in the day —
there's no separate "start" screen. Interpreted "session-start" as
`activeIndex === 0` (the very first exercise of the day, nothing worked yet)
and "active-exercise" as `activeIndex > 0`. This is the natural reading given
the QA screenshots: Screen 6 was captured on exercise 1, Screen 7 on a later
exercise. `SessionProgressHeader` now takes a `compact` prop; the full header
(day pill, title, progress bar) renders only at `activeIndex === 0`, and
collapses everywhere else to one caption line: `Exercise N/total · Day D ·
Phase P` (no progress bar — the exercise counter already communicates
progress).

**FOCUS card swipe-through-cues.** Spec says "confirm implementation, wire it
if not working." Traced the existing code: `tips` cycles via a 12s
`setInterval`, `tipIndex` drives both the displayed cue and the dot
indicators, and the card's border/glow tone changes per cue category
(breathe/move/posture/relax). This already works correctly — verified by
reading the cycle timer and dot-sync logic, not just visual inspection.
No code change made for this bullet; documenting as verified rather than
silently doing nothing.

**Set tracking — one active set at a time.** `ExerciseCard` used to render
every set's full tappable row simultaneously. Now: sets before the first
incomplete one collapse to a tiny single-line "✓ Set N complete" row; the
first incomplete set (or the last set, if all are done) gets the full-size
tappable row; sets after that are not rendered at all until reached. This
required updating two tests that queried all set checkboxes as a static
list at once (`sessionLoggingCompleteness.test.ts`,
`sessionTrackingFlow.test.ts` — the sequential-click one already worked
because each click causes a re-render before the next query).

**Bottom bar consolidation.** Previously three independent fixed/floating
elements stacked on mobile: a full-width "Next →" bar, a separately-floating
Guide ("i") button (bottom-left), and AppMenuClient's separately-floating
"Menu" pill (bottom-right). Replaced with one `md:hidden` fixed bar:
`[i] [Next →] [Menu]`, each `flex-1` (equal width), each `min-h-11` (44px).
Next is visually primary via color/weight, not by dominating the row's
width the way the old full-bleed button did.

Implementation note: `OnboardingInfoButton` and `AppMenuClient` are global,
route-agnostic components (each renders its own floating trigger anywhere
it's mounted). Rather than restructure them into route-aware components,
gave each an escape hatch: `hideTriggerBelowMd` prop (Onboarding) / an
internal `pathname === "/session"` check (AppMenuClient) hides *their own*
floating trigger below the `md` breakpoint only, and each now listens for a
window `CustomEvent` (`praxis:open-onboarding-guide`,
`praxis:open-app-menu`) so the new bar's buttons can open the exact same
panel without duplicating any panel/nav logic. Desktop is unaffected — both
components' own floating triggers still render at `md+`, and the new bar is
`md:hidden`.

**Fixed-band footprint acceptance test.** Added
`sessionBottomBarConsolidation.spec.ts`, which measures every top-level
`position: fixed` / `position: sticky` element's rendered height at
390×844 once past the first exercise (collapsed-header state) and asserts
the sum is ≤ 40% of viewport height. Also asserts the three-button bar's
tap targets, ordering, and that the old floating Guide trigger is not
independently visible on phone.

Verified visually at 390×844 and 360×740 via Playwright screenshots before
committing (both breakpoints render the collapsed header + three-button bar
correctly; no clipping or overlap at the narrower SE width).

## Commit 2 — Log-set screen compression

See below (added when Commit 2 lands).
