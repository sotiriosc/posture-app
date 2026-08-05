Read `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md` completely, including all Phase 0, Phase 1, and Phase 2 results and reports.

Execute **Phase 3 only: First-Class Dumbbell Programming**.

The objective is to replace inherited gym-shaped programming for `primaryEquipmentMode="dumbbells"` with a simple, complete, recognizable, progressive dumbbell program that assumes no unconfirmed equipment.

Do not begin band, bodyweight, mixed-home, coaching-catalog completion, questionnaire UI, plan-reveal UI, telemetry, or engine-decomposition work.

Leave `newpromptforpengine.md` untouched.

## 1. Protect completed phases

Preserve:

* all first-class equipment identities,
* order-independent mode resolution,
* explicit capability truth,
* unknown anchors remaining false,
* the Phase 2 gym contract,
* all Phase 2 gym structural corrections,
* gym flagship scores,
* gym role-truth invariants,
* deterministic generation,
* all Phase 0–2 reports,
* and backward compatibility with existing stored program/questionnaire data.

Do not weaken the gym contract to make dumbbell work easier.

Do not overwrite earlier reports.

## 2. Dumbbell mode must receive its own architecture

When:

```ts
primaryEquipmentMode === "dumbbells"
```

the program must use a canonical dumbbell template family.

It must not inherit:

* gym body-part day titles,
* gym cable or machine slot expectations,
* gym vertical-pull requirements that cannot be fulfilled,
* gym accessory counts,
* or gym repair behavior that replaces unavailable gym exercises after generation.

The dumbbell template must be selected before exercise selection. Post-generation repair must not be the primary author of the dumbbell program.

Add focused dumbbell policy under the existing `packages/engine/src/program/` architecture. Do not add another large block of dumbbell branching directly to `program.ts`.

Prefer focused modules equivalent to:

```text
program/dumbbellProgramContract.ts
program/dumbbellTemplates.ts
```

Use repository naming conventions and avoid unnecessary duplicate abstractions.

## 3. Equipment assumptions

A dumbbell-only program may assume:

* dumbbells,
* floor space,
* and a wall where appropriate.

It must not assume:

* bench,
* adjustable bench,
* chair,
* box,
* step,
* cable,
* machine,
* barbell,
* kettlebell,
* pull-up bar,
* resistance band,
* rack,
* high anchor,
* low anchor,
* or another stable support.

An exercise requiring one of those items is legal only when the corresponding capability is explicitly confirmed.

Examples:

* floor press is a valid default;
* bench press is allowed only with confirmed bench capability;
* chest-supported row requires a confirmed bench;
* Bulgarian split squat must not assume a bench or chair;
* step-ups require a confirmed stable step or platform;
* seated or supported exercises must not silently assume furniture;
* a pull-up must not appear unless pull-up-bar capability is confirmed.

Unknown capability means unavailable.

## 4. Canonical dumbbell session family

The flagship three-day dumbbell program should use three recognizable full-body identities.

### Full Body A — Squat, Press and Row

Required primary roles:

* knee-dominant squat pattern,
* horizontal press,
* true horizontal pull.

Required support:

* anti-extension or trunk-stability role,
* purposeful scapular or lower-body reinforcement where volume permits.

Default exercise families should be immediately recognizable and require no unusual setup.

Examples of suitable families include:

* goblet squat,
* dumbbell floor press,
* one-arm dumbbell row performed without an assumed bench,
* dead-bug or other appropriate core stability work.

These examples are not instructions to hardcode the same exercises for every persona.

### Full Body B — Hinge, Overhead and Unilateral

Required primary roles:

* true dumbbell hinge,
* unilateral knee-dominant lower-body pattern,
* vertical press when safe.

Required support:

* horizontal or lat-biased pull,
* anti-rotation or lateral-stability work.

The primary hinge must not be replaced by:

* leg curl,
* bridge primer,
* preparation drill,
* calf exercise,
* carry,
* or unrelated unilateral knee work.

A pain-aware hinge surrogate must retain hip-extension intent and be explicitly classified.

### Full Body C — Single-Leg, Press Variation and Lat Intent

Required primary roles:

* unilateral or single-leg lower-body pattern distinct from Day B where practical,
* horizontal press or push variation distinct from Day A,
* lat-biased dumbbell pulling intent.

Required support:

* posterior-chain reinforcement,
* trunk or scapular reinforcement.

Day C must still be recognizable as a full-body training session. It must not become a collection of corrective or low-load accessory exercises.

## 5. Honest pulling contract

Dumbbells alone do not provide a true vertical pull.

Therefore:

* do not label a dumbbell pullover as a true vertical pull;
* do not label a lat sweep, pulse, reach, or scapular drill as a true vertical pull;
* do not fill a `mainPullVertical` slot with a surrogate;
* do not claim complete true vertical-pull coverage when the capability does not exist.

The dumbbell contract should require:

* true horizontal pulling,
* meaningful lat-biased pulling intent,
* scapular support,
* and honest reporting that a true vertical pull is unavailable unless a pull-up bar or another valid capability is confirmed.

A dumbbell pullover may be:

* a lat-biased accessory,
* a supported surrogate,
* or secondary chest/lat work,

but it may not be the only meaningful back exercise and may not satisfy true vertical pulling.

Where a pull-up bar is explicitly confirmed, the program may use a true vertical pull while retaining `primaryEquipmentMode="dumbbells"`.

## 6. Experience-based simplicity

The dumbbell experience must feel simpler than the gym experience—not cheaper or incomplete.

Excluding warmup and finish work, use explicit complexity caps.

Recommended contract:

### Beginner

* three primary anchors,
* one or two purposeful support exercises,
* no more than five total Build/Reinforce exercises,
* minimal setup changes,
* common movement families,
* no advanced stability exercise replacing a basic strength role.

### Intermediate

* three or four primary anchors,
* up to two purposeful support exercises,
* no more than six total Build/Reinforce exercises,
* one justified secondary pattern or distinct variation.

### Advanced

* four or five primary/secondary anchors,
* up to two purposeful support exercises,
* no more than seven total Build/Reinforce exercises,
* additional volume must have a clear role,
* no volume added merely to imitate a gym session.

Do not increase complexity through obscure exercises, redundant variations, or unnecessary floor-to-standing transitions.

The audit should report:

* exercise count,
* setup transitions,
* unilateral complexity,
* support requirements,
* and repeated movement families.

## 7. Session flow

Each dumbbell session should present a coherent sequence equivalent to:

1. Prepare
2. Build
3. Reinforce
4. Finish

Required ordering principles:

* warmup prepares the actual primary patterns;
* demanding compound movements occur before small accessories;
* exercises using similar setup should be grouped where practical;
* repeated floor-to-standing transitions should be minimized;
* core or posture reinforcement should support the day;
* preparation drills cannot satisfy primary strength roles;
* the finish should be brief and purposeful.

Do not perform a broad UI redesign during this phase. Establish correct generated structure and metadata using existing presentation capabilities.

## 8. Supported training frequencies

Audit every dumbbell day frequency the product currently supports.

### Three days

Use the flagship A/B/C architecture.

### Two days, when supported

Use two balanced full-body sessions and rotate the omitted emphasis across program weeks or phases so no major pattern is permanently neglected.

Do not simply discard Day C forever.

### Four and five days

Do not revert to gym body-part splits.

Use the A/B/C full-body template family as the foundation and create deliberate frequency extensions.

The fourth and fifth sessions must:

* have a truthful identity,
* remain lower or appropriately distributed in per-session volume,
* avoid repeating an identical session in the same week,
* avoid training the same demanding pattern heavily on consecutive days,
* preserve weekly push, pull, squat, hinge, unilateral, core and scapular coverage,
* and remain appropriate for recovery.

Before implementing higher-frequency policy:

* audit current supported scheduling,
* document the proposed rotation,
* document weekly pattern exposure,
* and demonstrate why the additional sessions are not redundant.

Do not create five arbitrary unique workouts merely to avoid repeating a title.

Where the product supports only three-, four-, and five-day schedules, test those exact frequencies and do not invent unsupported public options.

## 9. Progression with fixed or limited dumbbells

Do not assume the user owns adjustable dumbbells or can always increase load.

Dumbbell progression must support:

1. rep progression within a prescribed range,
2. load progression when available,
3. controlled tempo,
4. pauses,
5. increased range of motion where safe,
6. unilateral progression,
7. additional sets within experience and recovery caps,
8. progression to a more demanding movement variation.

Use double progression as the default loaded model where appropriate:

* first add clean repetitions within the range;
* then increase weight when possible;
* if weight cannot increase, use one approved demand variable;
* do not increase several demand variables simultaneously.

Every generated main exercise should have one canonical progression path or target available to the engine.

User-facing progression-card completeness may remain part of the later coaching phase, but actual generated dumbbell progression must be coherent now.

Do not redesign the entire progression engine. Integrate with existing phase, ladder, variation and progression systems.

## 10. Phase continuity

Across activation, skill and growth phases:

* maintain recognizable movement families;
* progress execution, range, loading opportunity or movement demand;
* avoid replacing most exercises at once;
* preserve the full-body A/B/C identities;
* retain honest pulling classification;
* and document anchor-family changes.

Add semantic assertions against excessive anchor churn.

A phase should feel like the next step of the same program, not a random new collection of exercises.

## 11. Pain-aware dumbbell programming

Test at minimum:

* shoulder pain,
* upper-back/scapular concern,
* low-back pain,
* hip pain,
* and knee pain where supported.

Pain adaptations must:

* remove or modify contraindicated work;
* preserve full-body session identity;
* retain a meaningful lower-body, push, pull and trunk training purpose where safe;
* keep a true hinge or truthful hip-extension surrogate where safe;
* avoid replacing most of the workout with preparation drills;
* never introduce unconfirmed support equipment;
* and emit an explicit unresolved warning when a required role cannot be fulfilled safely.

Do not invent clinical diagnoses or new medical claims.

Protect the corrected Phase 2 distinction between upper-back and low-back pain.

## 12. Exercise familiarity and no-research standard

Prefer familiar exercise families that can be understood through Praxis’s eventual embedded instruction.

Avoid making the core program depend on obscure exercises such as:

* unnamed pulses,
* sweeps,
* highly specific prone combinations,
* complex multi-step transitions,
* or exercises whose purpose cannot be understood from their title.

An obscure or corrective drill may appear when justified, but not as the defining anchor of a dumbbell session.

For each flagship persona, manually review:

* whether the exercise names are understandable,
* whether the setup is possible,
* whether an outside web search would be required,
* and whether the workout looks like a complete training session.

Missing full coaching-card metadata must remain visible in `deferredExperienceGaps`, but should not automatically fail an otherwise structurally valid Phase 3 program.

## 13. Dumbbell structural hard failures

Add stable reason codes for at least:

* `DUMBBELL_GYM_TEMPLATE_INHERITANCE`
* `DUMBBELL_FALSE_VERTICAL_PULL`
* `DUMBBELL_MISSING_HORIZONTAL_PULL`
* `DUMBBELL_MISSING_TRUE_HINGE`
* `DUMBBELL_UNCONFIRMED_BENCH`
* `DUMBBELL_UNCONFIRMED_SUPPORT`
* `DUMBBELL_ILLEGAL_EQUIPMENT`
* `DUMBBELL_PREP_AS_MAIN`
* `DUMBBELL_DAY_IDENTITY_MISMATCH`
* `DUMBBELL_DUPLICATE_FAMILY`
* `DUMBBELL_EXCESS_COMPLEXITY`
* `DUMBBELL_MISSING_WEEKLY_ROLE`
* `DUMBBELL_EXCESSIVE_PHASE_CHURN`
* `DUMBBELL_NONDETERMINISTIC_OUTPUT`

Use repository reason-code conventions where they already exist.

Every failure should include:

* persona,
* phase,
* day frequency,
* day and slot,
* exercise where applicable,
* expected role,
* actual role,
* required capability,
* confirmed capabilities,
* and baseline comparison.

## 14. Audit-first implementation

Use this sequence:

### Step A — Baseline dumbbell audit

Using the Phase 0 and Phase 1 reports, record current dumbbell failures:

* gym-shaped titles,
* gym template inheritance,
* false vertical pulls,
* illegal assumptions,
* role gaps,
* session complexity,
* and progression issues.

### Step B — Canonical contract and templates

Create the dumbbell contract and template family before changing selection.

### Step C — Root policy changes

Correct template resolution, candidate selection, scoring, substitutions or repair at the narrowest proper ownership point.

Do not use a final post-generation swap list as the main implementation.

Do not hardcode persona-specific completed workouts.

### Step D — Comparison audit

Produce before-and-after counts by stable reason code.

Do not overwrite Phase 0–2 reports.

## 15. Tests

Add focused semantic tests for:

* primary dumbbell mode routing,
* no gym template inheritance,
* Full Body A/B/C identities,
* Beginner, Intermediate and Advanced structures,
* all supported day frequencies,
* activation, skill and growth phases,
* true horizontal pulling,
* honest absence or presence of true vertical pulling,
* pullover not satisfying true vertical pull,
* true dumbbell hinge,
* no curl-only hinge,
* no preparation exercise satisfying a main role,
* no unconfirmed bench,
* no unconfirmed chair, box, step or support,
* no cable, machine, barbell, band or kettlebell leakage,
* fixed-weight progression,
* duplicate-family limits,
* setup-transition limits,
* representative pain adaptations,
* phase continuity,
* deterministic repeat generation,
* gym contract preservation,
* band/bodyweight/mixed-home identity preservation.

Do not rely only on full-program snapshots. Assert roles, capabilities and semantic invariants.

Review intentional golden changes individually.

## 16. Fuzz validation

Run at least 10,000 deterministic dumbbell-focused cases across:

* experience,
* phase,
* supported frequency,
* goal,
* pain combinations,
* variation seeds,
* bench confirmed and unconfirmed where representable,
* pull-up bar confirmed and unconfirmed where representable,
* and relevant legacy equipment selections.

Report separately:

* gym-template inheritance,
* illegal equipment,
* unconfirmed support,
* false vertical-pull truth,
* missing horizontal pull,
* missing hinge,
* day-identity mismatch,
* duplicate-family excess,
* complexity excess,
* weekly coverage,
* phase churn,
* exceptions,
* identity collapse,
* and deterministic-repeat mismatches.

Required fuzz outcomes:

* zero illegal equipment,
* zero unconfirmed support assumptions,
* zero gym-template inheritance,
* zero false vertical-pull satisfaction,
* zero identity collapse,
* zero nondeterministic output.

## 17. Quality scoring

Produce a structural dumbbell-programming score separate from deferred coaching completeness.

Structural dimensions should include:

* equipment truth,
* role truth,
* weekly movement coverage,
* full-body day identity,
* session simplicity,
* progression,
* pain preservation,
* phase continuity,
* and exercise familiarity.

Acceptance target:

* every flagship dumbbell persona scores at least 95/100 structurally;
* zero confirmed structural hard failures;
* no gym-shaped day titles for dumbbell mode;
* no illegal or unconfirmed equipment assumptions;
* no false vertical-pull claims;
* 10,000 fuzz cases meet all required zero-failure outcomes;
* no gym contract regression;
* no equipment identity regression;
* and no new unrelated failure.

Do not weaken the contract if the target is not reached. Report remaining failures honestly.

## 18. Reports

Create Phase 3 reports without overwriting prior phases:

* Markdown summary,
* machine-readable JSON,
* flagship persona review,
* initial-versus-final failure comparison,
* and 10,000-case fuzz summary.

Manually inspect at least:

* Beginner three-day dumbbells,
* Intermediate three-day dumbbells,
* Advanced three-day dumbbells,
* four-day dumbbells,
* five-day dumbbells,
* no-bench dumbbells,
* confirmed-bench dumbbells where representable,
* shoulder-pain dumbbells,
* low-back-pain dumbbells,
* activation phase,
* skill phase,
* and growth phase.

For each flagship plan answer:

* Is the day identity truthful?
* Does it look deliberately designed for dumbbells?
* Can every exercise be performed with confirmed equipment?
* Are the main exercises recognizable?
* Is pulling represented honestly?
* Is the hinge truthful?
* Is the session simple to follow?
* Is progression possible with fixed dumbbells?
* Does pain adaptation retain a meaningful workout?
* Does the next phase feel like progression?

## 19. Required validation

Run:

```bash
npm run audit:equipment-program
npm run audit:gym-program
npm run audit:dumbbell-program
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

If `audit:dumbbell-program` does not yet exist, add it as the focused Phase 3 audit command.

Compare all known matrix failures with Phase 0–2:

* Phase 3 dumbbell failures must be corrected or explicitly reported;
* pre-existing unrelated failures may remain documented;
* no failure may be suppressed;
* no new gym failure is permitted;
* and no unrelated regression is allowed.

## 20. Phase Result

Update only the Phase 3 checklist and append a Phase 3 result containing:

* files changed,
* canonical dumbbell contract and template locations,
* supported-frequency policy,
* initial hard-failure inventory,
* root causes,
* fixes made,
* intentional generated-program changes,
* individual golden changes and rationale,
* equipment-assumption results,
* pulling-truth results,
* fixed-weight progression behavior,
* pain-case results,
* phase-continuity results,
* flagship structural scores,
* 10,000-case fuzz results,
* gym regression results,
* deferred coaching-completeness gaps,
* all command results,
* unchanged baseline failures,
* and the exact recommended starting point for Phase 4.

Stop after Phase 3.

Do not begin band templates, anchor questionnaire work, mixed-home programming, bodyweight templates, coaching-catalog completion, plan-reveal UI, telemetry, or engine decomposition.
