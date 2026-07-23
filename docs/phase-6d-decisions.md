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

## Commit 4 — Progress screen: honest early numbers

**Separating "not enough data" from "actual stable trend."** The old
`difficultyTrendLabel` logic sliced to the 3 most recent difficulty-bearing
entries and, if fewer than 3 existed, hard-returned the literal string
`"Stable performance"` — indistinguishable from a genuinely-computed
"nothing's changing" verdict. Split this into `difficultyDataPoints` (the
full, unsliced list) and `hasEnoughTrendData` (`length >= 3`), so the page
can gate the *card*, not just quietly reuse a real trend label as a
placeholder.

**Statistical floors, one per metric, all in `progress/page.tsx`:**
- Consistency % floor: `completedSessionsCount >= 5` (spec's literal "5
  completed sessions").
- Consistency streak floor: `daysSinceBaseline >= 14` (spec's "2+ full
  weeks"). Used elapsed days since baseline rather than counting completed
  calendar-week buckets — simpler, and equivalent for this purpose: a
  streak metric that's gated by *time elapsed* rather than by whether the
  streak itself is already non-zero, otherwise a real 0-week streak after
  15 days would stay hidden forever for the wrong reason.
- Trend floor: `hasEnoughTrendData` (spec's "3+ sessions with varied
  difficulty logged" — read as 3+ sessions carrying an actual difficulty
  signal, not just 3+ sessions total, since a trend needs difficulty data
  specifically to mean anything).
- Sessions this week: no floor, per spec ("it's a count, not a
  judgment") — always renders the real number.

**Baseline copy.** Added a single `BaselineNotice` sub-component in
`PerformanceOverview` rendering the spec's exact coaching line ("Building
your baseline. Come back after a few sessions and this screen starts
telling your story.") in place of any gated metric's number, so the four
cards' visual weight stays even (same card shape, no numbers, not a
crossed-out zero).

**"Sessions this week" tone (4.b).** Reframed the caption under the
always-visible count from the clinical "Last 7-day window" to a trajectory
sentence keyed on the count: 0 → "Log a session this week to get started.",
1 → the spec's literal "1 session this week — you're building.", N (at or
above the prescribed weekly count) → "N sessions this week — right on
target.", otherwise → "N sessions this week — you're building." The number
itself stays visible above the sentence — spec says never hide it, just
stop grading it.

**Verification note — dev-seed baseline timestamp.** `dev-seed`'s
`seedProgramWithLogs` calls `saveAppState({ activeProgramId })`, which
(pre-existing, unrelated to this pass) stamps `activeProgramBaselineAt` to
"now" whenever a program is (re)activated. The 12-week climber fixture's
actual session history is dated in the past (deterministic Jan 2026
timestamps), so seeding it via dev-seed and immediately loading `/progress`
reads as a brand-new baseline for the streak floor specifically, even
though the fixture's own history is old. This is fixture/dev-tool
behavior, not a bug in the floor logic — real users don't get their
`activeProgramBaselineAt` reset without actually starting a new program.
`progressStatisticalFloors.spec.ts`'s "established user" case back-dates
`activeProgramBaselineAt` in `localStorage` after seeding so the streak
floor is exercised against history that's actually old, matching what a
long-tenured real user's state looks like.

Verified at 390×844 and 360×740 via Playwright screenshots and a new
`progressStatisticalFloors.spec.ts`, which locks: a fresh user sees the
baseline notice on all three gated metrics (consistency %, streak, trend)
and the reframed zero-session copy on the ungated one, while an
established user (12-week climber, backdated baseline) sees real numbers
and zero baseline notices.

## Commit 5 — Session-start screen redundancy

**Which block was "the duplicate."** At session start (`activeIndex === 0`)
the screen rendered two title/phase blocks: a generic, non-sticky "Guided
session" kicker + day-title `<h1>` + phase-name line at the very top of the
page, immediately followed by `SessionProgressHeader`'s full-state render
(phase name / day pill / day-title `<h1>` again / exercise counter /
progress bar) — the exact "PHASE 1: CONTROL & TECHNIQUE / Upper Push +
Scapular Control / Exercise 1 of 9" pattern the spec quotes. Removed the
generic top block, not `SessionProgressHeader`: the header is sticky (so it
functions as *the* top header for the entire session, not just at start),
and it's a strict superset of the removed block's information (day pill,
exercise counter, and progress bar were never in the generic block to
begin with) — the "Guided session" label itself carried zero dynamic
information, so nothing that actually varies per-session was lost.

**Test fallout.** Four unit tests (`sessionTimerEngineConnection`,
`sessionTrackingFlow` ×3, `sessionLoggingCompleteness`,
`sessionPainSwapFlow`) used the literal string "Guided session" purely as a
"has `SessionClient` finished its initial render" signal, not to assert
anything about the redundant block itself. Swapped each to wait on
`getByTestId("session-header-full")` instead — same semantic ("session
content has mounted"), now pointed at the header that's actually staying.

Verified at 390×844 and 360×740 via Playwright screenshots and a new
`sessionStartRedundancy.spec.ts`, which locks: the literal "Guided session"
text is gone, `session-header-full` is visible and still carries the
exercise counter, and the day title string appears exactly once on the
page (not twice).

## Commit 6 — Post-session sentence merge

**Which two sentences were "the same thing twice."** The post-session
summary screen rendered two adjacent cards derived from the exact same
underlying signal (`sessionAdaptationPreview`'s `suggestedAction`, wrapped
by `nextSessionRecommendation`'s `mode`): an "adaptation preview" card
("Next-time preview: keep this pattern steady." + "Preview only; no
workout has been changed.") immediately followed by a "next session
recommendation" card ("For next session: repeat this movement at a steady
pace." + "Recommendation only; your plan has not been changed."). Same
history entries in `ResultsRoutine.tsx`, `progress/page.tsx`, and the
per-day view (`program/[programId]/day/[dayIndex]/page.tsx`) repeated the
pattern. Deleted the adaptation-preview card and its derivation entirely
(component-local `adaptationPreview` variables, the
`formatSessionAdaptationPreviewFromFeedback` import, and the
`data-testid="adaptation-preview"` block) in all four call sites — the
`nextSessionRecommendation` card already carries a strict superset of the
same information (it's derived from the same preview object, then adds
signal-aware reasons/priority on top).

**One merged sentence covering all five recommendation modes, not just
"repeat."** The spec's literal merge example ("Next session: we'll repeat
this movement at a steady pace. Your plan will adjust based on how it
goes.") only covers `mode: "repeat"`. `formatNextSessionRecommendation`
has five modes (`normal`, `repeat`, `reduce`, `simplify`, `recover`), each
previously rendered through the same two-sentence pattern with
mode-specific first clauses. Applied the same "we'll ___. Your plan will
adjust based on how it goes." template to all five modes so no mode
regresses back to a bare, undisclaimed statement — this keeps the single
sentence's built-in tentativeness (per the spec: "the sentence itself now
conveys tentativeness") consistent across every mode, not just the one
the spec happened to quote.

**Disclaimers removed entirely, not reduced to one.** The spec allows
keeping one disclaimer instance "if a legal or product reason requires
it." No such requirement exists in this codebase (no legal/compliance
copy review process referenced anywhere in the plan or decisions logs),
so both trailing disclaimer spans were dropped in favor of the merged
sentence's own "Your plan will adjust based on how it goes." clause,
matching the spec's suggested merge text exactly.

**No new dedicated Playwright spec for this commit.** Every other Commit
in this phase added a `*.spec.ts` because it verified new mobile-specific
*layout* (fixed-band footprint, tap-target sizing, hierarchy/ordering)
that only a real browser at a real viewport can catch. This commit is a
pure text/copy consolidation inside an existing, unchanged `ui-card`
container — no new layout, no new breakpoint-dependent styling, nothing a
viewport-sensitive test would add coverage for beyond what's already
locked. Reaching the post-session summary screen requires completing
every exercise and set of a full program day through the real set-logging
UI (9 exercises for the climber persona), which `sessionTrackingFlow.test.ts`
already does end-to-end against the real `SessionClient` component (not a
shallow render) — it was updated in this commit to assert the exact merged
sentence (`"Next session: we'll repeat this movement at a steady pace."` +
`"Your plan will adjust based on how it goes."`) renders under
`data-testid="next-session-recommendation"`, and that the retired
`adaptation-preview` testid no longer exists. `nextSessionRecommendation.test.ts`
covers the pure-function output for all five modes. Reasoned rather than
screenshot-verified that this reads fine at 390×844/360×740: the merged
sentence renders inside the same `ui-card p-4` container the two old cards
used, at the same `text-sm` size, and is a single sentence rather than the
old sentence-plus-disclaimer pair, so it is strictly shorter and no more
prone to wrapping than what it replaced (which already rendered correctly
at both widths per Commit 5's screenshots of the same screen family). Did
not spin up a throwaway Playwright script to screenshot the literal
post-session screen for this commit, since reaching it requires driving a
full 9-exercise day through the real set-logging UI end-to-end, which
`sessionTrackingFlow.test.ts` already exercises against the real component
tree — the marginal coverage a real-browser screenshot would add over that
is the CSS wrapping question above, addressed by inspection instead.

## Commit 7 — Nav menu logout + usage ordering

**Where "Log out" actually lived before this commit.** It already existed
functionally (`AuthControls`, rendered inside the menu `<aside>` below a
`border-t` divider), so the underlying capability wasn't missing — but it
was a small pill-style `Button` visually separated from the nav list, not
one of the uniform full-width rows the rest of the menu uses. Read the
spec's "Currently unclear where users find this action" as a findability
complaint about visual treatment and position, not a missing feature.
Fix: moved Log out (and, symmetrically, Log in for signed-out users) into
the same `<nav>` list as an actual full-width row sharing the other
items' exact style (`data-testid="nav-menu-logout"` /
`"nav-menu-login"`), so it reads as "the last menu item," not "a
different kind of control below the menu." The desktop-only floating
top-right pill (`AuthControls`, `hidden md:block`, unrelated to the
`<aside>` list) is untouched — it's out of scope (it already reads fine
at md+ where there's no findability complaint on record) and
`headerLayout.spec.ts` still targets it directly by its `Button`-styled
"Log out" text.

**Ordering (7.b) applied exactly as spec-listed, gates unchanged.** Kept
every existing visibility gate (`authEnabled` for Dashboard/Progress,
`authEnabled && authenticated` for Account/Billing + Settings, `isAdmin`
for Admin Settings) — only the array's push order changed, so a
signed-out or free-tier user sees the same subset of links they always
did, just Home moved to the end instead of the start. "Admin Settings"
isn't named in the spec's ordering list (it's an edge case for the one
operator role); kept it directly after "Settings" since both are
account-configuration items, ahead of Help & FAQ/Home — this preserves
its old relative position (after the account-ish items, before the
generic ones) without contradicting any named ordering constraint.

Verified at 390×844 and 360×740 via Playwright screenshots and a new
`navMenuLogoutAndOrdering.spec.ts`, which locks: Log out renders as a
44px-minimum nav row and actually logs the user out (asserted against
`/api/auth/session` afterward, not just a URL change), every named link's
vertical position is strictly increasing in the spec's usage-frequency
order, Log out sits below all of them, and a signed-out session shows Log
in in the same slot with zero Log out elements present.

## Commit 8 — PWA install prompt orchestration

**The bug wasn't missing 8.a logic — it was a missing mount.** `InstallApp`
already existed in the tree with a correct `beforeinstallprompt` handler
that calls `preventDefault()` and stashes the event, plus an
`appinstalled` handler. It was never imported or rendered anywhere in the
app, so its listener never attached — Chrome's native mini-infobar fired
completely uncontested, exactly matching the reported symptom. The actual
8.a fix is one line: mounting `<InstallApp />` in `layout.tsx` alongside
`ServiceWorkerRegister`, so the listener attaches on every page from app
load.

**8.b trigger: exact signal for "first-ever completed session."**
`sessionStore.ts` already fires a `session:completed` `CustomEvent` (and
stamps `session_last_completed_at` in `localStorage`) every time a real
session finishes — `ResultsRoutine.tsx` already listens to it for its own
"session complete" dashboard notice, so this is an established, live
signal rather than something invented for this commit. To detect
specifically the *first* one (not every completion), `InstallApp`
snapshots whether `session_last_completed_at` was already set *before*
this page load, once, on mount; if it wasn't, the next `session:completed`
event during this visit is that user's first ever, so `eligible` flips to
true. Later sessions completing in the same or later visits won't matter
because whichever visit first satisfies "no prior completion" is the one
that offers the prompt, exactly once.

**Held off the session-complete screen itself.** The event fires while
the user is still looking at the "Session complete" summary (before they
click through), which is its own screen with its own primary actions. Per
this phase's guiding principle (fixed elements should never compete for
space with what the user's actually doing), the component tracks
eligibility but withholds rendering while `pathname === "/session"` —
it appears the moment the user navigates off, e.g. back to the dashboard.

**Persistence: 30-day cooldown on dismiss, permanent on install.** "Not
now" writes an ISO timestamp to `localStorage` (`pwa_install_dismissed_at`);
the component treats itself as dismissed if `Date.now()` is within 30
days of that timestamp. `appinstalled` writes a permanent
`pwa_install_installed` flag so a completed install never re-shows the
card after a reload — the pre-existing code only tracked "installed" and
"dismissed" as in-memory component state, meaning a page reload would
have re-shown the card even right after a successful install; fixed as
part of making 8.b's dismissal logic actually durable, which the "don't
re-prompt for 30 days" requirement needs regardless.

**Copy.** Used the spec's literal suggested copy verbatim: "Praxis works
better as an app on your home screen. Install?", with "Install" / "Not
now" buttons, both `min-h-11` (44px minimum, this phase's tap-target
standard).

Verified at 390×844 and 360×740 via Playwright screenshots and a new
`pwaInstallPromptOrchestration.spec.ts`. Real browsers don't reliably
fire `beforeinstallprompt` under Playwright automation, so the tests
dispatch a synthetic event with stubbed `prompt()`/`userChoice` methods
plus a synthetic `session:completed` event — this is exercising Praxis's
own orchestration logic (suppress native banner, gate on first-session
completion, hide on `/session`, persist dismissal), not Chrome's install
eligibility heuristics, which are out of this app's control entirely. The
suite locks: the stashed native event alone (no completed session yet)
does not show the card; completing a session then shows it, off the
session route only, with both buttons meeting the 44px minimum; the card
never renders while `pathname === "/session"` even once eligible; and a
"Not now" dismissal persists a timestamp that suppresses the card across
a reload within the cooldown window.

## Commit 9 — Tap target audit on smaller phones

**Method.** Wrote a throwaway Playwright scan (not committed —
`tap_audit_scan.spec.ts`, run locally against 360×740) that walks every
`button`, `a[href]`, `input[type=checkbox]`, `input[type=radio]`,
`[role=button]`, and `label` on the dashboard, progress, and session
screens (including the session `···` block-menu open) and flags any
whose rendered `getBoundingClientRect()` is under 44px on either axis.
Ran it before touching anything to get a ground-truth list, then again
after each fix to confirm convergence, rather than fixing from the
spec's three named examples alone — the spec's list ("Energy/Confidence
pills," "Set complete checkboxes," "Header nav icons") turned out to be
illustrative, not exhaustive; the scan additionally found the session
screen's `···` exercise-options trigger, the timer's Working/Resting
mode toggle, its Reset link, and the Report pain trigger all under 44px.

**Fixed to literal 44px (`min-h-11` / `min-w-11`):**
- Exercise-options `···` trigger (`SessionClient.tsx`) — was `p-1` around
  bare text (21×32); now `min-h-11 min-w-11` with centered content. Its
  dropdown anchor moved from a hardcoded `top-8` to `top-full` so it
  doesn't overlap the now-taller trigger.
- Completed-set row label (`ExerciseCard.tsx`) — the spec's named
  "~24px" checkbox row (`min-h-6`) now `min-h-11`, matching the
  already-`min-h-11` active-set row it sits above. (The 16×16 checkbox
  *input* itself still reports small in a raw DOM scan; it's nested
  inside the `min-h-11` `<label>`, which is the actual tap surface via
  native label/input association — same accepted pattern as the
  Reps/RPE `<label>` captions above their `min-h-11` inputs, both of
  which the scan also flags as small text but which aren't themselves
  the interactive element.)
- Timer mode toggle, "Working"/"Resting" (`DualModeTimer.tsx`) — was
  `px-4 py-2` text-only (80×32/76×32); added `min-h-11`.
- Timer "Reset" link (`DualModeTimer.tsx`) — was bare underlined text
  (33×16); added `min-h-11 min-w-11` with centered content. This grows
  the compact caption row under the timer face by about 28px; accepted
  because the row has no other height constraint (unlike, say, a
  per-set list where the same growth multiplies by row count).
- "Report pain" trigger (`SessionClient.tsx`) — was a `px-3 py-1` pill
  (87×27); added `min-h-11`. A slightly larger pill next to the "Log
  this set" title is not a layout regression here — the row already
  used `items-center` with room to grow.
- "Open menu" trigger, "View today's plan," "Back to dashboard," and the
  "Movement quality trends" disclosure — already fixed in Commits 3/7 and
  via the shared `Button.tsx` secondary/ghost variants; the audit
  confirms zero remaining violations on `/results` and `/progress`.

**Nothing needed a documented exception.** Every element the spec named,
plus everything the scan additionally found, grew to 44px without
breaking any surrounding layout badly enough to warrant flagging for a
future dedicated redesign — the largest single-row growth (Reset's
caption row, and the block-menu trigger row) is a few tens of pixels on
otherwise-flexible rows, not a fixed-band or per-item-multiplied cost.

Re-ran the scan after all fixes at 360×740: `/results` and `/progress`
report zero violations; `/session` (both closed and with the exercise
options menu open) reports exactly three, all confirmed false
positives — the native checkbox `<input>` (16×16, wrapped by the now
`min-h-11` `<label>`) and the Reps/RPE field `<label>` captions (283×16,
sitting above their own `min-h-11` `<input>` elements) — none of which
is itself the sole interactive surface for its control.

**Unrelated pre-existing test-infra gap found and fixed while running the
full local gate.** `packages/engine/vitest.config.ts`'s alias map (added
for Day 1 of the engine/consumer split) covered `@/lib`, `@/components`,
and `@/app`, but never `@/hooks` — a directory that didn't exist until
Phase 6a's `useUserPlan` hook. Five engine unit test files that import
`AuthControls.tsx` or `useResultsBootstrap.ts` (which both import
`useUserPlan`) have been failing to even resolve since Phase 6a merged,
independent of anything in Phase 6d — confirmed by checking out
`packages/engine/vitest.config.ts` from `origin/main` (identical to this
branch's copy) and reproducing the same failure there. Not caught by
CI's PR gate, which only runs a fixed anchor-test allowlist that doesn't
include these files. Added the missing `@/hooks` alias (mirrors the
existing three) so `npx vitest --run --config
packages/engine/vitest.config.ts` — the actual "full gate" — is green;
zero behavior change, pure test-resolution fix.
