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

**Compressing "About to record."** The six-field grid (Load, Reps/set, RPE,
Sets, Timer, Feedback) collapsed to one caption line, e.g. "Bodyweight ·
target 8 reps · 2 sets · RPE 8 (1/2 logged)". Kept RPE and a sets-progress
count in the line (the spec's own example — "Bodyweight · target 8 reps · 2
sets" — didn't show RPE, but an existing unit test asserted the RPE preview
value renders somewhere in this panel as the user types it, and that's
genuinely useful feedback, so it stayed, just folded into the one line
rather than getting its own grid cell). The now-redundant standalone "Load:
Bodyweight" paragraph (a leftover from the pre-compression bodyweight
branch) was also removed — the caption already states the load type, so
that second line would have defeated the "one caption line" goal.

**Reps/RPE as the two large fields.** Restructured into a `grid-cols-2` row,
each field `min-h-11` with `text-lg` — noticeably bigger than the rest of
the panel's controls, matching "two large input fields (Reps, RPE)." Weight
(only present for weighted exercises — not named in the spec's bodyweight
example but functionally required) keeps its existing compact row above
this grid; removing it was out of scope (no engine/feature changes) and it
isn't one of the "two" fields the spec is calling out for weighted work
specifically.

**What was *not* removed.** The spec's "That's it" reads aggressively, but
removing the sets-count stepper or the "Report pain" trigger would be a
feature regression, not a mobile-polish pass — and an existing unit test
(`sessionTrackingFlow.test.ts`) exercises the pain-report flow from this
exact panel. Interpreted "one caption line + two fields + Next" as the
*primary* set-logging path, not a mandate to delete secondary controls that
have their own reason to exist. Only the parts the spec explicitly named
(the summary grid, and Exit/Back) were touched.

**Exit session / Back tucked behind "...".** Replaced the two always-visible
buttons with a single `···` trigger (top-right of the exercise counter row,
mirroring the existing per-exercise block-menu pattern already used
elsewhere on this screen) that opens a small dropdown with both actions.
`trackDropoff("exit_button")` still fires on Exit exactly as before.

Verified at 390×844 and 360×740 via Playwright screenshots and a new
`logSetScreenCompression.spec.ts`, which locks: one summary line containing
"target"/"RPE", both fields ≥44px tall, and Exit/Back hidden until the
"..." trigger is tapped.

## Commit 3 — Dashboard hierarchy + honest-locked-state

**Pill hierarchy above the fold (3.a).** The dashboard header used to put
four equal-weight elements in the same row/band: the greeting, an "Edit
profile" pill-button, an "Account and billing" pill-button, a "Built from
your movement profile" pill, and the "Plan: Pro/Free" pill — five things
competing for the same visual weight above the fold on phone. Kept exactly
two things at that weight: the page title/greeting, and a small `PlanBadge`
(already existed, already synced to the same `useUserPlan` source as the
nav's Pro chip — Phase 6a's duplicate-truth-source fix already covers this,
confirmed no regression). Demoted "Built from your movement profile" from a
bordered pill to a plain caption line under the greeting (it's context, not
an action). Moved "Edit profile" / "Account and billing" into a new
`DashboardProfileMenu` client component — a `···` trigger (44px tap target)
that opens a small dropdown with both as links. This mirrors the same
"···"-menu pattern Commit 2 used for Exit/Back on the log-set screen, so
the mobile-polish pass now has one consistent idiom for "secondary actions
that don't need to be always-visible."

`headerLayout.spec.ts`'s existing overlap regression test skips any entry
it can't find or that isn't visible (`collectBoxes` continues past
zero-count/hidden locators), so hiding Edit profile/Account and billing
behind the new trigger doesn't break that test — it now simply has fewer
elements to check for overlap, which is a strictly safer state, not a
weaker assertion.

**Locked-card visual weight (3.b).** Replaced the full-width, uppercase
"LOCKED" badge with a small inline lock icon (🔒, `aria-label="Locked"`)
directly after the card title, and dimmed the card body copy to
`text-slate-500` when locked. No behavioral change — `locked`/`lockReason`
props and the `aria-disabled` attribute are untouched, only the visual
treatment changed from "badge that reads louder than the title" to "small
aspirational marker."

**Card ordering by availability (3.c).** Reordered the six-card array in
`ResultsRoutine.tsx` from [Today, Week, Progress, Insights, History,
Billing] to [Today, Week, Billing, Progress, Insights, History] — the three
always-unlocked cards now come first, the three locked-until-earned cards
come last. Pure reorder of a literal array; no test or other code depended
on the old positions (grepped for `dashboardModes` usage and any test
referencing card order or the old "Locked" text — none found).

**Verification note — shared login rate limit under fast sequential local
runs.** `apps/consumer/src/app/api/auth/login/route.ts` rate-limits to 10
attempts per 60s per IP, keyed by `x-forwarded-for` (falls back to the
literal string `"unknown"` locally, so every Playwright test run from the
same machine shares one bucket). Running the *entire* local e2e suite
back-to-back with real logins (`dashboardHierarchyAndLockedState`,
`headerLayout`, `logSetScreenCompression`, `navRoutesReachable`,
`sessionBottomBarConsolidation`, `sessionNextButtonPinned`,
`stripeSessionPersistence` — 10 real `POST /api/auth/login` calls total)
occasionally trips this limit on whichever test runs last within the
window; that test passes cleanly in isolation or in a fresh window. This is
pre-existing infra behavior (the rate limit itself predates Phase 6d) and
is orthogonal to this pass — the repo's actual PR-gate CI
(`.github/workflows/ci.yml`) runs lint + specific vitest anchors + both app
builds only; it does not run Playwright at all, so this has no CI impact.
Documenting rather than "fixing" a rate limiter that's working as designed.

Verified at 390×844 and 360×740 via Playwright screenshots and a new
`dashboardHierarchyAndLockedState.spec.ts`, which locks: Edit
profile/Account and billing hidden until the "···" trigger is tapped (and
that trigger meets the 44px minimum), no literal "LOCKED" text anywhere,
at least one `aria-label="Locked"` icon present on a fresh (all-locked)
persona, and DOM order placing Today/Week/Billing before
Progress/Insights/History on a fully-unlocked (12-week climber) persona.
