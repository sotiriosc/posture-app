Read `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md` completely, including all Phase 0–3 results and reports.

Execute **Phase 4 only: First-Class Anchor-Aware Band Programming**.

The objective is to replace inherited gym-shaped programming for `primaryEquipmentMode="bands"` with simple, complete, progressive band programs that use only confirmed band types and anchor capabilities.

Leave `newpromptforpengine.md` untouched.

Do not begin bodyweight, mixed-home programming, catalog-wide coaching completion, plan-reveal UI, telemetry, broad questionnaire redesign, or engine decomposition.

## 1. Protect all completed work

Preserve:

* first-class equipment identities,
* order-independent equipment-mode resolution,
* explicit capability truth,
* unknown anchors remaining false,
* the Phase 2 gym contract and all gym regressions,
* the Phase 3 dumbbell templates and contract,
* honest dumbbell pulling classification,
* no-unconfirmed-bench behavior,
* fixed-weight dumbbell progression,
* all passing deterministic tests,
* all Phase 0–3 reports,
* and backward compatibility with existing stored programs and questionnaire data.

Do not weaken gym or dumbbell contracts to support bands.

Do not overwrite previous reports.

## 2. Audit the current meaning of “bands” before changing behavior

Before implementation, inspect:

* current questionnaire wording,
* current stored equipment values,
* any illustrations or descriptions shown to users,
* equipment normalization,
* current band exercises,
* current band-specific selection branches,
* exercise setup assumptions,
* and existing stored-user compatibility.

Document whether the current product’s “bands” option clearly means:

* long resistance bands,
* mini loop bands,
* either type,
* or an unspecified category.

Do not silently redefine the meaning of a stored selection.

Record this in the Phase 4 report before selecting the migration policy.

## 3. Add the minimum necessary band-setup input

A generic `hasBands` boolean is not sufficient for safe programming.

Add the smallest focused follow-up shown only when bands are selected.

The user must be able to communicate at least:

* mini loop bands only,
* long resistance band without a secure anchor,
* long resistance band with a secure repositionable door or fixed anchor,
* both mini loops and long bands without an anchor,
* both mini loops and long bands with a secure repositionable anchor.

Use concise user-facing wording. Do not expose internal capability terminology.

An acceptable single-question presentation would be equivalent to:

> What band setup do you have?

With options equivalent to:

* Mini loop bands only
* Long resistance band, no anchor
* Long resistance band with a secure door/fixed anchor
* Both types, no anchor
* Both types with a secure door/fixed anchor

Do not add unnecessary questions about brand, resistance colours, exact resistance levels, handles, or accessories during this phase.

## 4. Backward compatibility

Existing users with a stored generic `bands` value must remain valid.

Determine migration behavior from the existing questionnaire semantics:

* If existing product wording clearly promised a long resistance band, legacy `bands` may resolve to long-band capability without an anchor.
* If existing wording did not establish band type, preserve an explicit legacy-unknown setup and request setup confirmation before the next newly generated band program.
* A legacy value must never imply a secure anchor.
* Unknown anchor state remains false.
* Existing stored programs remain viewable and unchanged.
* New generation must not schedule exercises requiring capabilities that have not been confirmed.

Document the exact decision and tests.

Do not silently assign high-, middle-, or low-anchor capability to legacy users.

## 5. Canonical band capability truth

Evolve the existing capability contract rather than creating a competing model.

Represent at least:

* has bands,
* has long resistance band,
* has mini loop bands,
* has secure repositionable anchor,
* high-anchor availability,
* middle-anchor availability,
* low-anchor availability,
* band setup confirmed versus legacy unknown.

A confirmed repositionable door anchor may provide high, middle and low anchor capability only when the UI wording explicitly confirms that the anchor can be safely repositioned.

A generic fixed point must provide only the confirmed height.

Do not infer anchor height from an exercise selection or from the presence of bands.

Unknown means unavailable.

## 6. Exercise setup requirements must be machine-readable

Band exercise eligibility must not rely only on exercise names.

Add or evolve reviewed metadata capable of expressing:

```ts
type BandTypeRequirement =
  | "miniLoop"
  | "longBand"
  | "either";

type BandAnchorRequirement =
  | "none"
  | "high"
  | "middle"
  | "low"
  | "repositionable";
```

Use repository conventions rather than duplicating equivalent existing metadata.

Band exercises should be able to declare:

* required band type,
* required anchor height,
* whether self-anchoring under the feet is valid,
* whether the band is secured around the feet,
* whether a stable external support is required,
* and whether the exercise is safe without a fixed anchor.

Do not attempt catalog-wide coaching completion in this phase. Only add the minimum setup metadata needed for legal band selection and safe anchor truth.

## 7. Create a canonical band program contract

Add focused modules under the existing program architecture, equivalent to:

```text
packages/engine/src/program/bandTemplates.ts
packages/engine/src/program/bandProgramContract.ts
```

Follow existing naming conventions.

Do not add another large band-policy section directly to `program.ts`.

The band contract should define:

* session identities,
* required roles,
* capability-dependent roles,
* honest unavailable roles,
* experience-based volume,
* anchor-change limits,
* equipment eligibility,
* pain-aware allowances,
* progression expectations,
* and structural hard failures.

Band templates must be selected before exercise selection. Repair must not be the primary author of the band program.

## 8. Canonical three-day band architecture

Use recognizable full-body A/B/C sessions.

The exact exercises may vary by phase, experience, pain and capability, but the session identities must remain stable.

### Full Body A — Squat, Press and Row

Required purposes:

* knee-dominant lower-body work,
* horizontal push,
* true horizontal pulling when the available band setup supports it,
* trunk stability,
* purposeful scapular or lower-body reinforcement.

Suitable families may include:

* band squat variations,
* anchored chest press when middle-anchor capability exists,
* alternative honest push variation without an anchor,
* seated or standing band rows using valid confirmed setup,
* appropriate core stability.

Do not hardcode one completed workout for all personas.

### Full Body B — Hinge, Overhead and Unilateral

Required purposes:

* true hinge or truthful hip-extension pattern,
* vertical push when safe,
* unilateral knee-dominant lower-body work,
* pulling or scapular reinforcement,
* anti-rotation or lateral stability where capability allows.

A primary hinge cannot be replaced by:

* hamstring curl only,
* preparation drill,
* calf exercise,
* carry,
* pulse,
* or unrelated unilateral knee work.

### Full Body C — Single-Leg, Push Variation and Lat Intent

Required purposes:

* unilateral or single-leg lower-body pattern,
* push variation distinct from Day A where practical,
* lat-biased pulling intent,
* posterior-chain reinforcement,
* trunk or scapular reinforcement.

When high-anchor capability exists, Day C may include a true band vertical pull.

Without high-anchor capability, the program must use an honestly classified alternative and report that true vertical pulling is unavailable.

The day must remain a recognizable full-body training session rather than a corrective cluster.

## 9. Three supported setup lanes

The band contract must explicitly support different environments.

### Lane A — Long band with secure repositionable anchor

May use:

* high-anchor vertical pulling,
* middle-anchor pressing and rowing,
* low-anchor patterns,
* self-anchored patterns,
* and mini-loop exercises when mini loops are also confirmed.

Required:

* true vertical pull exposure where safe and appropriate,
* anchor-height grouping,
* no more than two anchor-height changes per session,
* clear anchor requirement on each anchored exercise.

### Lane B — Long band without an anchor

May use:

* band-under-foot patterns,
* safe self-anchored pressing,
* safe rows around the feet where valid,
* hinges,
* squats,
* overhead pressing,
* unilateral work,
* and anchor-free core work.

Must not use:

* pulldowns,
* anchored chest presses,
* anchored rows,
* face pulls requiring a fixed point,
* Pallof presses requiring an anchor,
* or any exercise requiring unconfirmed high, middle or low attachment.

A true vertical pull is unavailable in this lane and must be reported honestly.

### Lane C — Mini loop only

A mini loop alone cannot be treated as equivalent to a long resistance band.

The program should use an honest **Loop Band + Bodyweight** full-body structure while retaining `primaryEquipmentMode="bands"`.

It may include:

* loop-band lower-body resistance,
* lateral hip work,
* selected shoulder/scapular work,
* bodyweight pushing,
* bodyweight lower-body work,
* and trunk training.

It must not schedule:

* long-band rows,
* band pulldowns,
* long-band presses,
* band hinges requiring a long band,
* or anchored anti-rotation work.

It must not claim that mini loops provide complete loaded upper-body pulling.

Emit a clear capability limitation for missing meaningful upper-body pulling rather than falsifying coverage.

The later bodyweight phase may improve shared bodyweight foundations, but Phase 4 must provide a truthful and usable loop-only program now.

## 10. Anchor-change simplicity

Band workouts can become frustrating when the user repeatedly moves a door anchor.

For each session:

* group exercises by anchor height,
* use no more than two anchor-height changes,
* avoid high → low → high sequences,
* avoid alternating anchored and non-anchored setups without purpose,
* keep exercises using the same setup adjacent where training order permits,
* and report the number and sequence of anchor setups.

Recommended interpretation:

* starting without an anchor does not count as an anchor-height change;
* moving from middle to high counts as one;
* returning from high to middle counts as another;
* removing the band from the anchor may count as a setup transition but not a new height.

Define the counting rule canonically and test it.

Do not compromise safe exercise ordering merely to reach zero transitions. The goal is coherent setup grouping, not arbitrary optimisation.

## 11. Door-anchor safety boundary

Anchored band exercises must include the minimum safety truth needed for this phase.

At minimum, the system must know and eventually present:

* the required anchor height,
* that the anchor must be secure,
* that the door must not be able to open toward the user,
* that the band and anchor should be inspected for damage,
* and that the user should stop if the anchor shifts or the band is damaged.

Do not complete every coaching card yet.

However, an anchored band exercise must not be considered “no research required” unless the workout can identify:

* where the band attaches,
* the required height,
* and the basic secure-anchor warning.

Do not infer that every door is suitable.

## 12. Honest pulling truth

Use explicit role truth.

Required rules:

* high-anchor pulldown may satisfy true vertical pulling;
* middle-anchor row may satisfy true horizontal pulling;
* a straight-arm pulldown may provide lat-biased intent but must not automatically replace every true pulling role;
* pull-aparts, face pulls, sweeps, pulses and scapular drills cannot satisfy the only meaningful back-strength role;
* no-anchor band work cannot claim true fixed-anchor vertical pulling;
* loop-only work cannot claim full loaded upper-body pulling;
* preparation and posture drills cannot occupy required main pulling slots.

Where capability prevents a true role, preserve honest classification and return a limitation rather than a false pass.

## 13. Experience-based simplicity

Excluding warmup and finish work:

### Beginner

* three primary anchors,
* one or two support exercises,
* no more than five Build/Reinforce exercises,
* no more than one anchor-height change where practical,
* familiar exercise families,
* no complex band choreography.

### Intermediate

* three or four primary anchors,
* up to two support exercises,
* no more than six Build/Reinforce exercises,
* no more than two anchor-height changes,
* one justified secondary pattern.

### Advanced

* four or five primary/secondary anchors,
* up to two support exercises,
* no more than seven Build/Reinforce exercises,
* additional volume must have a clear role,
* anchor complexity must remain controlled.

Do not make advanced programming feel advanced merely by adding setup complexity.

## 14. Supported frequencies

Audit every band frequency currently supported.

### Three days

Use Full Body A/B/C.

### Two days, if supported

Use two balanced full-body sessions and rotate the omitted emphasis so no major pattern is permanently absent.

### Four and five days

Do not revert to gym body-part titles.

Extend the A/B/C family deliberately:

* distribute pattern stress,
* avoid consecutive heavy exposure to the same pattern,
* avoid identical repeated sessions,
* keep session volume controlled,
* preserve weekly squat, hinge, unilateral, push, pull or honest limitation, trunk and scapular work,
* and minimise weekly anchor complexity.

Document the higher-frequency rotation before implementing it.

Do not create five arbitrary workouts simply to make every title unique.

## 15. Band progression

Band progression must not depend only on “use a heavier colour.”

Support progression through:

1. repetitions within a range,
2. stronger band where known and available,
3. shortening the working band length safely,
4. increased distance from a fixed anchor,
5. controlled tempo,
6. pauses,
7. range of motion,
8. unilateral progression,
9. additional sets within recovery limits,
10. a harder movement variation.

Every main exercise should use one progression target at a time.

Do not advise unsafe over-stretching.

Do not infer resistance from colour because band colours are not standardised between manufacturers.

Integrate with the existing progression, phase, ladder and variation systems rather than creating a separate band progression engine.

## 16. Phase continuity

Across activation, skill and growth:

* preserve recognizable movement families,
* preserve A/B/C identities,
* progress band tension opportunity, execution, range, stability or movement demand,
* avoid changing most anchors simultaneously,
* avoid changing anchor setup merely to create novelty,
* retain honest pulling classifications,
* and document anchor-family changes.

Add semantic assertions against excessive anchor churn and excessive movement-family churn.

## 17. Pain-aware band programming

Test at minimum:

* shoulder pain,
* upper-back/scapular concern,
* low-back pain,
* hip pain,
* and knee pain where supported.

Pain adaptation must:

* preserve the session’s full-body identity;
* remove contraindicated work;
* retain meaningful push, lower-body, pulling or honest pulling limitation, and trunk purpose where safe;
* retain a true hinge or truthful hip-extension surrogate where safe;
* avoid replacing the session with preparation drills;
* avoid adding an unconfirmed anchor;
* avoid adding an unconfirmed band type;
* and issue an explicit unresolved warning when a role cannot be fulfilled safely.

Protect the corrected distinction between upper-back and low-back pain.

Do not introduce new medical claims.

## 18. Band structural hard failures

Use stable reason codes equivalent to:

* `BAND_GYM_TEMPLATE_INHERITANCE`
* `BAND_UNCONFIRMED_TYPE`
* `BAND_UNCONFIRMED_ANCHOR`
* `BAND_ANCHOR_HEIGHT_MISMATCH`
* `BAND_LOOP_ONLY_LONG_BAND_EXERCISE`
* `BAND_FALSE_VERTICAL_PULL`
* `BAND_MISSING_HORIZONTAL_PULL`
* `BAND_MISSING_TRUE_HINGE`
* `BAND_ILLEGAL_EQUIPMENT`
* `BAND_UNCONFIRMED_SUPPORT`
* `BAND_PREP_AS_MAIN`
* `BAND_DAY_IDENTITY_MISMATCH`
* `BAND_EXCESS_ANCHOR_CHANGES`
* `BAND_DUPLICATE_FAMILY`
* `BAND_EXCESS_COMPLEXITY`
* `BAND_MISSING_WEEKLY_ROLE`
* `BAND_EXCESSIVE_PHASE_CHURN`
* `BAND_NONDETERMINISTIC_OUTPUT`

Use existing reason-code conventions when available.

Each failure must include:

* persona,
* setup lane,
* phase,
* frequency,
* day and slot,
* exercise where applicable,
* expected role,
* actual role,
* required band type,
* required anchor height,
* confirmed capabilities,
* and baseline comparison.

## 19. Audit-first implementation

Use this sequence:

### Step A — Baseline audit

Record existing band failures by setup lane:

* gym-shaped templates,
* unconfirmed anchor use,
* incorrect anchor height,
* false vertical pull,
* long-band exercise in loop-only plans,
* illegal equipment,
* missing roles,
* excessive setup changes,
* and progression issues.

### Step B — Capability and questionnaire truth

Implement the minimal band setup input and backward-compatible capability derivation.

### Step C — Contract and templates

Create the canonical band contract and A/B/C templates.

### Step D — Root policy corrections

Correct template resolution, eligibility, selection, scoring, substitution or repair at the narrowest proper ownership point.

Do not use final post-generation replacement lists as the main implementation.

Do not hardcode completed persona workouts.

### Step E — Comparison audit

Produce before-and-after counts by stable reason code.

Do not overwrite previous phase reports.

## 20. Tests

Add focused semantic tests covering:

* all band setup options,
* legacy stored band values,
* unknown setup,
* long band with anchor,
* long band without anchor,
* mini loop only,
* both band types,
* unknown anchors remaining false,
* correct high/middle/low anchor eligibility,
* no gym-template inheritance,
* Full Body A/B/C identities,
* every supported experience and frequency,
* every supported phase,
* true vertical pull only with confirmed high anchor,
* true horizontal pull truth,
* no false pulldown,
* no long-band exercise for loop-only users,
* no unconfirmed anchor,
* no unconfirmed furniture or support,
* true hinge,
* no preparation drill satisfying a main role,
* anchor-change limits,
* setup grouping,
* band progression,
* pain adaptations,
* phase continuity,
* deterministic repeat generation,
* gym regression,
* dumbbell regression,
* and bodyweight/mixed-home identity preservation.

Do not rely only on snapshots. Assert semantic role and capability truth.

Review intentional golden changes individually.

## 21. Fuzz validation

Run at least 10,000 deterministic band-focused cases across:

* band setup lane,
* experience,
* phase,
* supported frequency,
* goal,
* pain combinations,
* variation seeds,
* confirmed and unconfirmed anchor states,
* legacy stored band values,
* and reordered equipment selections.

Report separately:

* gym-template inheritance,
* unconfirmed band type,
* unconfirmed anchor,
* anchor-height mismatch,
* loop-only leakage,
* illegal equipment,
* false vertical pull,
* missing horizontal pull,
* missing hinge,
* day-identity mismatch,
* excessive anchor changes,
* duplicate-family excess,
* complexity excess,
* weekly coverage or honest capability limitation,
* phase churn,
* exceptions,
* identity collapse,
* and deterministic mismatches.

Required zero outcomes:

* zero gym-template inheritance,
* zero illegal equipment,
* zero unconfirmed anchor use,
* zero anchor-height mismatch,
* zero long-band leakage into loop-only plans,
* zero false vertical-pull satisfaction,
* zero identity collapse,
* zero nondeterministic output.

## 22. Quality scoring

Produce separate scores for:

1. structural band-program quality,
2. capability honesty,
3. deferred coaching completeness.

Structural dimensions should include:

* band-type truth,
* anchor truth,
* role truth,
* full-body identity,
* weekly coverage appropriate to capability,
* session simplicity,
* anchor-change coherence,
* progression,
* pain preservation,
* phase continuity,
* and exercise familiarity.

Acceptance targets:

* every long-band flagship persona scores at least 95/100 structurally;
* every loop-only flagship persona passes its honest constrained contract without false pulling claims;
* zero confirmed structural hard failures;
* zero gym-shaped band titles;
* zero unconfirmed anchor assumptions;
* zero illegal band-type assumptions;
* no false vertical-pull claims;
* all required 10,000-case zero outcomes pass;
* no gym regression;
* no dumbbell regression;
* no equipment-identity regression;
* and no new unrelated failure.

Do not weaken the contract if a target cannot be reached safely. Report remaining failures honestly.

## 23. Reports and manual review

Create Phase 4 reports without overwriting prior phases:

* Markdown summary,
* machine-readable JSON,
* flagship persona review,
* initial-versus-final failure comparison,
* questionnaire/capability migration decision,
* and 10,000-case fuzz summary.

Manually inspect at least:

* Beginner three-day long band with anchor,
* Intermediate three-day long band with anchor,
* Advanced three-day long band with anchor,
* long band without anchor,
* mini loop only,
* both band types with anchor,
* four-day bands,
* five-day bands,
* shoulder-pain bands,
* low-back-pain bands,
* activation phase,
* skill phase,
* and growth phase.

For each flagship plan answer:

* Is the day identity truthful?
* Does it look deliberately built for the confirmed band setup?
* Can every exercise be performed with confirmed equipment?
* Is every anchor requirement clear?
* Are anchor changes controlled?
* Is pulling represented honestly?
* Is the hinge truthful?
* Is the session easy to set up and follow?
* Is progression possible without relying on colour names?
* Does pain adaptation retain a meaningful workout?
* Does the next phase feel like progression?

## 24. Required validation

Run:

```bash
npm run audit:equipment-program
npm run audit:gym-program
npm run audit:dumbbell-program
npm run audit:band-program
npm run audit:catalog
npm run audit:program-contract
npm run audit:coverage-matrix
npm run audit:phase-matrix
npm run test:golden
npm run test:critical
npm run test:full
npm run build
npm run lint
```

If `audit:band-program` does not exist, add it.

Run focused band-contract, capability-migration, questionnaire and fuzz tests.

Compare failures with Phase 0–3:

* Phase 4 band failures must be corrected or explicitly reported;
* existing precisely coded out-of-gate failures may remain documented;
* no failure may be suppressed;
* no new gym or dumbbell failure is permitted;
* and no unrelated regression is allowed.

## 25. Phase Result

Update only the Phase 4 checklist and append a Phase 4 result containing:

* files changed,
* current and new questionnaire semantics,
* legacy migration policy,
* canonical band capability fields,
* canonical band contract and template locations,
* setup-lane definitions,
* supported-frequency policy,
* initial hard-failure inventory,
* root causes,
* fixes made,
* intentional generated-program changes,
* individual golden changes and rationale,
* anchor-truth results,
* anchor-transition results,
* pulling-truth results,
* loop-only behavior,
* band progression behavior,
* pain-case results,
* phase-continuity results,
* flagship scores,
* 10,000-case fuzz results,
* gym and dumbbell regression results,
* deferred coaching-completeness gaps,
* all command results,
* unchanged baseline failures,
* and the exact recommended starting point for Phase 5.

Stop after Phase 4.

Do not begin first-class bodyweight templates, mixed-home programming, broad coaching-catalog completion, plan-reveal UI, telemetry, or engine decomposition.
