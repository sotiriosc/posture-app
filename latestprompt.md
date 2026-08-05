Read `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md` completely, including all Phase 0–4 results and reports.

Execute **Phase 5 only: First-Class Bodyweight Programming**.

The objective is to replace inherited gym-shaped programming for `primaryEquipmentMode="bodyweight"` with simple, honest, progressive full-body programs that assume only the floor and a wall unless another support capability is explicitly confirmed.

Leave `newpromptforpengine.md` untouched.

Do not begin mixed-home programming, catalog-wide coaching completion, plan-reveal UI, telemetry, engine decomposition, food tracking, wearables, or knowledge-portal work.

## 1. Protect all completed phases

Preserve:

- first-class equipment identities,
- order-independent equipment-mode resolution,
- explicit capability truth,
- unknown capabilities remaining false,
- the Phase 2 gym contract,
- the Phase 3 dumbbell contract and templates,
- the Phase 4 band contract, setup lanes, questionnaire behavior and anchor truth,
- honest pulling classifications,
- deterministic output,
- all Phase 0–4 reports,
- restored original Phase 3 10k artifacts,
- successful Phase 4 flagship and fuzz results,
- and backward compatibility with stored programs and questionnaire data.

Do not overwrite earlier reports.

Do not weaken gym, dumbbell or band contracts to make bodyweight mode pass.

The two aborted background jobs are not failures and must not be recorded as program regressions. Record only the completed successful audit results.

## 2. Bodyweight mode must receive its own architecture

When:

```ts
primaryEquipmentMode === "bodyweight"

```

the generator must use a canonical bodyweight template family.

It must not inherit:

- gym body-part titles,
- loaded gym slot expectations,
- dumbbell exercise assumptions,
- band or anchor assumptions,
- furniture assumptions,
- or post-generation repair behavior that strips unavailable equipment from another program.

The bodyweight template must be selected before exercise selection.

Repair must not be the primary author of the program.

Add focused modules under the existing program architecture, equivalent to:

```text
packages/engine/src/program/bodyweightTemplates.ts
packages/engine/src/program/bodyweightProgramContract.ts

```

Use repository naming conventions and avoid duplicate abstractions.

## 3. Default environment truth

A bodyweight-only program may assume:

- floor space,
- a wall,
- the user’s body,
- and normal standing room.

It must not assume:

- chair,
- couch,
- bench,
- table,
- countertop,
- stairs,
- step,
- box,
- doorway,
- pull-up bar,
- suspension straps,
- bands,
- dumbbells,
- kettlebells,
- machines,
- cables,
- barbell,
- rack,
- foam roller,
- sliders,
- towels used as sliders,
- or another person.

An exercise requiring a support surface or object is legal only when that capability is explicitly confirmed.

Unknown means unavailable.

Do not infer that every user has a safe chair, countertop, sturdy table or suitable doorway.

## 4. Minimal support-capability policy

Before adding new questionnaire fields, audit whether current questionnaire or equipment settings already capture any of:

- pull-up bar,
- stable chair or bench,
- sturdy countertop or elevated surface,
- safe step or stairs,
- suspension trainer.

Do not add a broad home-equipment questionnaire in this phase.

Only add a focused support input if the program cannot be truthful without it.

Preferred policy:

- floor and wall are the default bodyweight environment;
- confirmed pull-up bar may unlock true vertical pulling;
- confirmed stable elevated surface may unlock incline push-ups or supported split-squat variations;
- confirmed support must be explicit and safety-qualified;
- no support may be inferred from exercise history or previous generated programs.

If no questionnaire addition is necessary for a complete floor-and-wall program, do not add one.

## 5. Canonical three-day bodyweight architecture

Create recognizable Full Body A/B/C sessions.

The exact exercises may vary by phase, experience, pain, progression state and confirmed support, but the session identities must remain stable.

### Full Body A — Squat, Push and Trunk

Required purposes:

- knee-dominant lower-body pattern,
- horizontal push pattern,
- trunk anti-extension or bracing pattern,
- purposeful scapular or posterior-chain reinforcement.

Suitable recognizable families may include:

- bodyweight squat,
- wall squat progression,
- floor push-up progression,
- incline push-up only with confirmed elevated support,
- dead bug,
- plank progression,
- glute bridge,
- scapular push-up.

Do not hardcode one completed workout for every persona.

### Full Body B — Hinge, Single-Leg and Shoulder

Required purposes:

- true bodyweight hinge pattern or truthful hip-extension pattern,
- unilateral lower-body pattern,
- vertical-push or overhead-strength intent where safe,
- trunk or lateral-stability role,
- scapular reinforcement.

The hinge role cannot be replaced by:

- hamstring curl only,
- preparation drill,
- calf exercise,
- unrelated balance work,
- pulse,
- march,
- or core drill.

Suitable families may include:

- hip hinge patterning progressed toward loaded-tension bodyweight hinge variations,
- glute bridge or single-leg bridge where truthful,
- split squat or reverse lunge without assumed support,
- pike push-up progression,
- wall-supported overhead progression,
- side plank.

A bridge may satisfy hip-extension intent where the contract explicitly permits it, but preparation-only bridge primers must not satisfy the only primary hinge role for advanced pain-free users.

### Full Body C — Single-Leg, Push Variation and Back Intent

Required purposes:

- unilateral lower-body pattern distinct from Day B where practical,
- push variation distinct from Day A,
- honest back and scapular-strength intent,
- posterior-chain reinforcement,
- trunk stability.

Bodyweight without a pull-up bar does not provide a complete true loaded pulling environment.

Therefore Day C must:

- include honest scapular, upper-back or posterior-shoulder strength work,
- avoid calling a reach, pulse, sweep, wall slide or posture drill a true pull,
- preserve clear capability limitation,
- and remain a recognizable full-body training session.

When a pull-up bar is confirmed, the template may include true vertical pulling while retaining `primaryEquipmentMode="bodyweight"`.

## 6. Honest pulling contract

This is the central truth requirement for bodyweight mode.

Without a pull-up bar, suspension trainer or another explicitly confirmed pulling setup:

- do not claim a true vertical pull;
- do not claim a true horizontal pull when external resistance or a valid body-pulling setup is absent;
- do not label prone arm movements, wall slides, scapular retractions, pulses, sweeps, Y/T/W movements or mobility drills as true loaded pulls;
- do not fill `mainPullVertical` or `mainPullHorizontal` slots with preparation work;
- do not falsify weekly coverage.

Use explicit classification equivalent to:

```ts
type MovementRoleTruth =
  | "true"
  | "supportedVariant"
  | "surrogate"
  | "preparationOnly";

```

A bodyweight program without pulling equipment should report:

- scapular and upper-back support is trained,
- true loaded pulling is unavailable in the confirmed setup,
- and the program remains honest about that limitation.

This capability limitation must not make the program unusable. It should produce the best complete bodyweight program possible without pretending that every movement role is equally available.

When a pull-up bar is confirmed:

- pull-ups, assisted variations using confirmed capability, hangs, scapular pull-ups and appropriate progressions may be used according to role truth;
- a dead hang or scapular pull-up cannot automatically satisfy every true pulling role;
- preparation work cannot replace the only meaningful pull.

## 7. Exercise familiarity and simplicity

Bodyweight mode is especially vulnerable to obscure corrective clusters.

The defining exercises of a session should be recognizable.

Avoid building main sessions around:

- unnamed pulses,
- sweeps,
- complicated prone arm combinations,
- highly specific corrective sequences,
- multi-step crawling patterns,
- unclear mobility-strength hybrids,
- or exercises whose purpose cannot be understood from their title.

Corrective and posture exercises may appear in Prepare or Reinforce when justified.

They must not dominate the Build section.

For each main exercise, the user should be able to understand:

- the basic position,
- the primary action,
- and the training purpose.

Complete coaching details remain Phase 6 work, but the selected movement itself must be understandable.

## 8. Experience-based complexity

Excluding warmup and finish work:

### Beginner

- three primary anchors,
- one or two support exercises,
- no more than five Build/Reinforce exercises,
- stable, familiar positions,
- minimal unilateral complexity,
- no advanced balance drill replacing basic strength work.

### Intermediate

- three or four primary anchors,
- up to two support exercises,
- no more than six Build/Reinforce exercises,
- one justified progression or secondary pattern,
- controlled unilateral and stability demands.

### Advanced

- four or five primary or secondary anchors,
- up to two support exercises,
- no more than seven Build/Reinforce exercises,
- advanced difficulty should come from leverage, range, tempo, pauses, unilateral demand or harder variations,
- not from obscure choreography.

Do not add exercise count merely to compensate for missing equipment.

## 9. Bodyweight progression ladders

Bodyweight progression must be explicit and useful.

Support progression through:

1. repetition progression,
2. longer duration where appropriate,
3. slower eccentric tempo,
4. pauses,
5. increased range of motion,
6. reduced assistance,
7. longer lever position,
8. more demanding leverage,
9. unilateral progression,
10. increased sets within recovery limits,
11. harder movement variation.

Use one progression variable at a time.

Examples of family continuity may include:

### Squat

- supported or partial squat where required,
- bodyweight squat,
- tempo squat,
- pause squat,
- split squat,
- more demanding unilateral variation where appropriate.

### Push

- wall push-up,
- confirmed-surface incline push-up,
- knee or modified push-up where catalog policy supports it,
- floor push-up,
- tempo or pause push-up,
- harder leverage or unilateral-bias variation.

Do not assume an elevated surface unless confirmed.

### Hinge or hip extension

- hip-hinge patterning,
- glute bridge,
- bridge progression,
- single-leg hip-extension variation,
- longer-lever or tempo progression.

The progression must preserve role truth.

### Vertical push

- wall-supported pattern,
- pike position progression,
- pike push-up,
- elevated pike only with confirmed support,
- wall handstand progression only when safe and appropriate.

### Core

- dead bug,
- plank,
- longer-lever plank,
- controlled dynamic anti-extension,
- unilateral or anti-rotation progression.

Do not create a separate progression engine. Integrate with the existing phase, ladder, variation and progression systems.

## 10. Phase continuity

Across activation, skill and growth:

- preserve recognizable movement families,
- preserve Full Body A/B/C identities,
- progress leverage, range, tempo, duration, control or unilateral demand,
- avoid replacing most exercises at once,
- avoid using obscure variations merely to create novelty,
- retain honest pulling classification,
- and document anchor-family changes.

Add semantic assertions against excessive movement-family churn.

A later phase should feel like a harder or more capable version of the same program.

## 11. Pain-aware bodyweight programming

Test at minimum:

- shoulder pain,
- upper-back or scapular concern,
- low-back pain,
- hip pain,
- and knee pain where supported.

Pain adaptation must:

- remove or alter contraindicated work;
- preserve full-body session identity;
- retain meaningful lower-body, push, trunk and posterior-chain purpose where safe;
- retain a truthful hinge or hip-extension role where safe;
- avoid turning the whole session into breathing and mobility drills;
- avoid introducing unconfirmed support;
- avoid introducing equipment from another mode;
- preserve the upper-back versus low-back distinction;
- and issue an explicit unresolved warning when a required role cannot safely be fulfilled.

Do not invent diagnoses or expand medical claims.

## 12. Warmup and session flow

Each bodyweight session should follow a coherent sequence equivalent to:

1. Prepare
2. Build
3. Reinforce
4. Finish

Required principles:

- warmup prepares the actual main patterns;
- recognizable strength work occurs before small corrective work;
- floor and standing transitions are controlled;
- exercises using similar positions are grouped where practical;
- no repeated standing → floor → standing → floor sequence without reason;
- core and posture reinforcement support the day’s primary patterns;
- preparation work cannot satisfy primary strength roles;
- finish work remains brief.

Report estimated position transitions:

- standing,
- kneeling,
- quadruped,
- prone,
- supine,
- side-lying,
- wall-supported.

Do not optimise transitions at the expense of safe exercise ordering, but flag unnecessarily chaotic sessions.

## 13. Supported frequencies

Audit every bodyweight frequency currently supported.

### Three days

Use Full Body A/B/C.

### Two days, if supported

Use two balanced full-body sessions and rotate omitted emphasis across weeks or phases.

Do not permanently exclude one major pattern.

### Four and five days

Do not revert to gym body-part titles.

Extend the A/B/C architecture deliberately.

Additional sessions should:

- distribute pattern stress,
- avoid repeating identical sessions,
- avoid heavy exposure to the same demanding pattern on consecutive days,
- remain shorter or appropriately lower-volume where needed,
- preserve weekly squat, hinge or hip extension, unilateral, push, trunk and scapular-support coverage,
- preserve honest pulling limitations,
- and avoid filling extra days with random corrective exercises.

Document the higher-frequency rotation before implementation.

Do not create five arbitrary sessions solely for unique titles.

## 14. Structural hard failures

Use stable reason codes equivalent to:

- `BODYWEIGHT_GYM_TEMPLATE_INHERITANCE`
- `BODYWEIGHT_ILLEGAL_EQUIPMENT`
- `BODYWEIGHT_UNCONFIRMED_SUPPORT`
- `BODYWEIGHT_FALSE_VERTICAL_PULL`
- `BODYWEIGHT_FALSE_HORIZONTAL_PULL`
- `BODYWEIGHT_PREP_AS_MAIN`
- `BODYWEIGHT_MISSING_SQUAT`
- `BODYWEIGHT_MISSING_HINGE_OR_HIP_EXTENSION`
- `BODYWEIGHT_MISSING_UNILATERAL`
- `BODYWEIGHT_MISSING_PUSH`
- `BODYWEIGHT_MISSING_TRUNK`
- `BODYWEIGHT_DAY_IDENTITY_MISMATCH`
- `BODYWEIGHT_CORRECTIVE_CLUSTER`
- `BODYWEIGHT_DUPLICATE_FAMILY`
- `BODYWEIGHT_EXCESS_COMPLEXITY`
- `BODYWEIGHT_EXCESS_POSITION_TRANSITIONS`
- `BODYWEIGHT_MISSING_WEEKLY_ROLE`
- `BODYWEIGHT_EXCESSIVE_PHASE_CHURN`
- `BODYWEIGHT_NONDETERMINISTIC_OUTPUT`

Use existing reason-code conventions where available.

Each failure must include:

- persona,
- confirmed support capabilities,
- phase,
- frequency,
- day and slot,
- exercise where applicable,
- expected role,
- actual role,
- required capability,
- role-truth classification,
- and baseline comparison.

## 15. Honest capability limitations

Some bodyweight environments cannot provide complete true pulling.

The audit must distinguish:

- structural program failure,
- honest capability limitation,
- deferred coaching gap.

An honest limitation is not a hard failure when:

- the engine correctly identifies the unavailable role,
- no exercise falsely satisfies it,
- the rest of the program remains complete within available capability,
- and the user-facing presentation model can communicate it later.

Do not reduce structural scores merely because impossible equipment capabilities are absent.

Do fail the program when it hides or falsifies the limitation.

## 16. Audit-first implementation

Use this sequence:

### Step A — Baseline bodyweight audit

Record current bodyweight failures:

- gym-shaped titles,
- equipment leakage,
- furniture assumptions,
- false pulling roles,
- missing squat, hinge, unilateral, push or trunk roles,
- preparation drills in main slots,
- obscure corrective clusters,
- excessive transitions,
- progression gaps,
- and phase churn.

### Step B — Canonical contract and templates

Create the bodyweight contract and A/B/C templates before changing selection.

### Step C — Root policy changes

Correct template resolution, eligibility, selection, scoring, substitution or repair at the narrowest proper ownership point.

Do not use a final post-generation swap list as the primary implementation.

Do not hardcode completed persona workouts.

### Step D — Comparison audit

Produce initial-versus-final counts by stable reason code.

Do not overwrite Phase 0–4 reports.

## 17. Tests

Add focused semantic tests covering:

- primary bodyweight mode routing,
- no gym-template inheritance,
- Full Body A/B/C identities,
- Beginner, Intermediate and Advanced structures,
- every supported day frequency,
- activation, skill and growth phases,
- floor-and-wall-only legality,
- no assumed chair,
- no assumed countertop,
- no assumed step,
- no assumed doorway,
- no assumed pull-up bar,
- no equipment leakage,
- true squat role,
- truthful hinge or hip-extension role,
- unilateral lower-body coverage,
- push coverage,
- trunk coverage,
- honest pulling limitations,
- true vertical pulling only with confirmed capability,
- no prone or scapular drill satisfying true pulling,
- no preparation exercise satisfying a main role,
- corrective-cluster limits,
- position-transition limits,
- bodyweight progression ladders,
- representative pain adaptations,
- phase continuity,
- deterministic repeat generation,
- gym regression,
- dumbbell regression,
- band regression,
- and mixed-home identity preservation.

Do not rely only on full snapshots.

Assert semantic roles, capabilities and movement-family continuity.

Review intentional golden changes individually.

## 18. Fuzz validation

Run at least 10,000 deterministic bodyweight-focused cases across:

- experience,
- phase,
- supported frequency,
- goal,
- pain combinations,
- variation seeds,
- confirmed and unconfirmed support capabilities,
- pull-up bar confirmed and unconfirmed where representable,
- legacy stored equipment values,
- and reordered equipment selections.

Report separately:

- gym-template inheritance,
- illegal equipment,
- unconfirmed support,
- false vertical pull,
- false horizontal pull,
- missing squat,
- missing hinge or hip extension,
- missing unilateral,
- missing push,
- missing trunk,
- preparation-as-main,
- corrective-cluster excess,
- duplicate-family excess,
- complexity excess,
- position-transition excess,
- weekly coverage,
- honest capability limitations,
- phase churn,
- exceptions,
- identity collapse,
- and deterministic mismatches.

Required zero outcomes:

- zero gym-template inheritance,
- zero illegal equipment,
- zero unconfirmed support,
- zero false pulling satisfaction,
- zero preparation-only main-role satisfaction,
- zero identity collapse,
- zero nondeterministic output.

## 19. Quality scoring

Produce separate scores for:

1. structural bodyweight-program quality,
2. capability honesty,
3. deferred coaching completeness.

Structural dimensions should include:

- equipment and support truth,
- role truth,
- full-body identity,
- weekly coverage appropriate to capability,
- session simplicity,
- progression quality,
- pain preservation,
- phase continuity,
- position-flow coherence,
- and exercise familiarity.

Acceptance targets:

- every flagship bodyweight persona scores at least 95/100 structurally;
- floor-and-wall-only personas pass without hidden support assumptions;
- pull-limited personas pass an honest constrained contract without false pulling claims;
- zero confirmed structural hard failures;
- zero gym-shaped bodyweight titles;
- all required 10,000-case zero outcomes pass;
- no gym regression;
- no dumbbell regression;
- no band regression;
- no equipment-identity regression;
- and no new unrelated failure.

Do not weaken the contract if the target cannot be reached. Report remaining failures honestly.

## 20. Reports and manual review

Create Phase 5 reports without overwriting prior phases:

- Markdown summary,
- machine-readable JSON,
- flagship persona review,
- initial-versus-final failure comparison,
- and 10,000-case fuzz summary.

Manually inspect at least:

- Beginner three-day floor-and-wall bodyweight,
- Intermediate three-day bodyweight,
- Advanced three-day bodyweight,
- four-day bodyweight,
- five-day bodyweight,
- no-support bodyweight,
- confirmed pull-up-bar bodyweight where representable,
- shoulder-pain bodyweight,
- low-back-pain bodyweight,
- knee-pain bodyweight,
- activation phase,
- skill phase,
- and growth phase.

For each flagship plan answer:

- Is the day identity truthful?
- Does it look deliberately built for bodyweight?
- Can every exercise be performed with confirmed support?
- Are the main exercises recognizable?
- Is pulling represented honestly?
- Is the squat role truthful?
- Is the hinge or hip-extension role truthful?
- Is the session simple to follow?
- Are position transitions reasonable?
- Is progression clear through leverage, range, tempo or variation?
- Does pain adaptation retain a meaningful workout?
- Does the next phase feel like progression?

## 21. Required validation

Run:

```bash
npm run audit:equipment-program
npm run audit:gym-program
npm run audit:dumbbell-program
npm run audit:band-program
npm run audit:bodyweight-program
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

If `audit:bodyweight-program` does not exist, add it.

Run focused bodyweight-contract, support-capability and fuzz tests.

Compare failures with Phase 0–4:

- Phase 5 bodyweight failures must be corrected or explicitly reported;
- completed Phase 3 and Phase 4 audits must remain intact;
- restored Phase 3 original 10k reports must not be rewritten;
- precisely coded out-of-gate gym failures may remain documented;
- no failure may be suppressed;
- no new gym, dumbbell or band failure is permitted;
- and no unrelated regression is allowed.

## 22. Phase Result

Update only the Phase 5 checklist and append a Phase 5 result containing:

- files changed,
- canonical bodyweight contract and template locations,
- default environment assumptions,
- confirmed-support policy,
- supported-frequency policy,
- initial hard-failure inventory,
- root causes,
- fixes made,
- intentional generated-program changes,
- individual golden changes and rationale,
- pulling-truth results,
- equipment and support-truth results,
- bodyweight progression behavior,
- pain-case results,
- position-transition results,
- phase-continuity results,
- flagship scores,
- 10,000-case fuzz results,
- gym, dumbbell and band regression results,
- deferred coaching-completeness gaps,
- all command results,
- unchanged baseline failures,
- and the exact recommended starting point for Phase 5B Mixed Home.

Stop after Phase 5.

Do not begin mixed-home programming, coaching-catalog completion, quality-gate enforcement, presentation-contract work, plan-reveal UI, telemetry, release work, nutrition, wearables, knowledge-portal work, or engine decomposition.