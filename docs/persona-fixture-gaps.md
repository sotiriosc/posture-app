# Persona Fixture Gaps

When the dev-only "Seed persona" tool (`/dev-seed` in both apps) was built, each
requested persona was mapped to the golden-anchor coverage that would define it.
The rule was strict: a persona is only seedable if the golden anchors already
build a **complete seedable state** for it (questionnaire + program + logs +
assessment history + any ladder / feedback / phase-gating state the persona's
story implies). Where they don't, we **do not fabricate** the missing state —
we log it here.

A gap in this file is not a bug in the tool. It is a signal that our golden
coverage checks a *narrow property* of a persona rather than assembling that
persona's full, renderable state. Closing a gap means authoring the missing
golden anchor first, then extracting it into
`packages/engine/tests/fixtures/personas.ts` — never hand-writing state in the
seed page.

Legend: **Seedable** = fully extracted, button enabled. **Gap** = button
disabled in the tool, tooltip points here.

---

## Consumer (`apps/consumer/dev-seed`)

### ✅ Empty new user — Seedable (no golden coverage needed)
Trivial by definition: wipe IndexedDB and redirect. This is the clean initial
state a fresh signup produces; there is nothing to extract.

### ✅ 12-week climber — Seedable
Source: `buildTwelveWeekClimberProgram()` + `buildTwelveWeekClimberLogs()`
(extracted from the Phase 5 golden anchor). Covers all three headline features:
4 rung climbs (2 hinge, 2 horizontal_push), 1 focus-tag retirement
(forward_head cleared), 1 early phase transition (activation → skill), plus 12
sessions of consistency and a provenance footer.

**Documented characteristic (not a fabricated gap):** the golden fixture is
*projection-scoped*. `program.week` is empty and no questionnaire is attached,
because the Phase 5 anchor built this persona solely to assert the
results-screen projection. It renders `/results/view` completely; the session
and day views would be empty. This is a property of the golden fixture, faithfully
preserved — not invented.

### ⛔ Cleared-forward-head — Gap
- **Requested story:** a retired focus tag shown with quiet celebration copy,
  *without* the surrounding climb history.
- **What the anchors build:** the Phase 4 "cleared-forward-head" anchor exercises
  `computeFocusTagLifecycleUpdate` over baseline + 2 clear retest snapshots and
  asserts `retiredAt` is set — a *lifecycle-computation* assertion, not a
  seedable program.
- **What's missing:** a standalone `Program` (+ logs) whose only projection
  feature is the retired tag. The only full program carrying a retired
  forward_head is the 12-week climber, which bundles it with 4 climbs and a
  phase transition — so it cannot represent a *clean* cleared-only persona.
- **To close:** author a Phase 4/5 golden anchor that projects a retired-tag-only
  program, then extract it. (The celebration copy is already visible today via
  the enabled 12-week climber.)

### ⛔ 60-year-old maintainer — Gap
- **Requested story:** maintain intent, advancement criteria met but held, with
  a phase-transition ("keep maintaining?") prompt visible on the results screen.
- **What the anchors build:** three *disjoint facets*, never assembled —
  (1) Phase 3.3 `computeLadderState`/`computeMaintainPrompts` assertions on a
  hand-built held `LadderState`; (2) a Phase 3W `generateWeeklyProgram(... maintain,
  currentLadderState)` program used only to check warmup non-emptiness;
  (3) Phase 3.5 `computeReadinessVerdict` phase-gating inputs.
- **What's missing:** a single coherent persona binding questionnaire + program +
  logs (proving criteria met) + the held ladder state + a pending maintain prompt
  into one seedable object. Stitching the three facets together would be
  fabrication.
- **To close:** author one maintainer golden anchor that builds and asserts the
  *assembled* state, then extract it.

### ⛔ Forward-head assessment — Gap (partially reproducible)
- **Requested story:** an active focus tag on the results screen, corrective
  slots biased, primer picks visible.
- **What the anchors build:** the Phase 3W "forward_head assessment" anchor calls
  `generateWeeklyProgram(..., poseAnalysis: { headForwardOffset: 0.12 })` and
  asserts wall-slides / scap-cars are injected into every day's warmup — a
  *day-view / warmup-injection* property. This program (biased slots + primers)
  is genuinely reproducible and deterministic.
- **What's missing:** the results-screen story needs `assessmentHistory` +
  `focusTagLifecycle` with an **active** (non-retired) forward_head so
  `projectResults` surfaces it in `activeTags`; the anchor never builds that, and
  there are no logs. The biasing lives in the day view, not `/results/view`
  (where all consumer seeds land).
- **To close:** extend the forward-head anchor to build assessmentHistory +
  active focusTagLifecycle (+ logs), then extract it.

### ⛔ Sacrifice pending retest — Gap
- **Requested story:** two exercises awaiting a retest-queue prompt on the
  results screen.
- **What the anchors build:** the Phase 3.2 feedback-contract anchors call
  `computeFlaggedExercises` / `applyFeedbackContractAction` / `applyAutoSacrifice`
  for a **single** exercise and assert the returned summary is `deferred` and
  lands in `sacrificedByPattern` — function-level assertions on one exercise.
- **What's missing:** a seedable program plus a `feedbackSummaryByExercise` /
  prefs state carrying **two** deferred exercises queued for retest, which the
  results screen would render. The anchors never build a two-exercise retest
  queue as a whole.
- **To close:** author a golden anchor that assembles a two-exercise
  pending-retest state and asserts the results-screen queue, then extract it.

---

## Gyms (`apps/gyms/dev-seed`)

### ✅ Single member drill-in (12-week climber, operator side) — Seedable
The operator drill-in resolves the locally-seeded active program (same engine
surface as the consumer results screen). Seeding
`buildTwelveWeekClimberProgram()` + logs and opening a member detail page shows
the climber's projection with operator framing.

### ⛔ Populated roster (5 members, varied projections) — Gap
- **What exists:** `apps/gyms/src/lib/gymSaas/memberProgressData.ts` ships a
  **static app demo roster** (`demoMemberRoster`, currently **4** members) — this
  is product demo data, not a golden-anchor fixture, and the roster page always
  renders it. There is no golden anchor defining "5 members with varied
  projections."
- **What's missing:** a golden-anchor fixture set of member projections. Seeding
  "5 varied" would mean inventing member data.
- **Note:** the roster is already visible at `/gym-admin/members` from the app's
  own demo data; the dev-seed tool does not (and should not) fabricate a
  different roster.

### ⛔ Empty roster (new gym, no members) — Gap
- **What's missing:** the roster page maps the static `demoMemberRoster`
  unconditionally; there is no empty-state path to trigger, and no golden anchor
  for it.
- **To close:** add an operator empty-state (and a golden anchor for it) before
  it can be seeded.
