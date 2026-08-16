# Praxis Product Goal & Prescription Architecture Ledger

**Status:** `OWNER_ARCHITECTURE_DIRECTION_APPROVED_B3_COMPLETE_FUTURE_WORK_REMAINS`  
**Last verified audit commit:** `3708876ea48dab6f38d641cb67d05da95351245c`  
**Last completed implementation commit:** `0b26b78f67c9f929d106a4c068b1bcdb26401505`  
**PR:** `#86` — must remain open, draft, and unmerged until separately authorized  
**Product authority:** `LEGACY_PRODUCT_OUTPUT_ONLY`  
**V2 application state:** `NOT_ACTIVATED`

## Purpose

This ledger is the single canonical architecture note for Product training-goal vocabulary, goal-to-engine mapping, purpose-specific Prescription, and the staged path to Product activation.

It exists so future work does not have to reconstruct decisions from old prompts, chat messages, reports, or PR history.

Rules:

1. Completed work is recorded under **Completed and Proven**.
2. Approved architecture that has not been implemented remains under **Future Work**.
3. When a task is completed, move it from Future Work to Completed and record:
   - commit SHA;
   - contract/policy version;
   - fingerprints;
   - tests and CAGT evidence;
   - activation state;
   - any intentionally deferred scope.
4. Do not rewrite or delete historical decisions.
5. Do not mark this ledger complete merely because code compiles.
6. Product activation always requires separate owner authorization.

---

# Owner-Approved Architecture Direction

## Layered goal model

Praxis must distinguish the following owners rather than treating one Product label as a universal rep-range selector.

### 1. Outcome goal

What the user ultimately wants to improve.

Initial plain-language Product direction:

- **Get stronger**
- **Build muscle**
- **Improve fitness and stamina**
- **Improve posture and movement**
- **Improve athletic performance** — requires a structured follow-up rather than a silent mapping

Canonical engine goals remain:

- `strength`
- `hypertrophy`
- `general_fitness`
- `conditioning`
- `posture_and_movement_quality`

### 2. Primary and secondary goal priority

The Product should eventually support:

- one primary outcome goal;
- one optional secondary outcome goal.

Primary and secondary priorities must affect weekly responsibility and local exercise purpose without simply combining every possible stimulus or bloating the Week.

Examples:

- strength primary + hypertrophy secondary;
- hypertrophy primary + strength secondary;
- posture/movement primary + strength secondary;
- fitness primary + muscle secondary.

### 3. Programming context

Programming context changes how the goal is pursued but does not replace the outcome goal.

Examples:

- `pain_aware_return`
- return after absence;
- maintain;
- rebuild/familiarize;
- explicit restriction;
- successful re-exposure.

Pain or limitations must eventually be collected separately from the primary outcome goal.

Example:

```text
Primary goal: Get stronger
Context: I have pain or limitations the plan must work around
```

Pain remains non-diagnostic and cannot create a universal corrective circuit.

### 4. Local developmental purpose

The local assignment purpose owns the exercise Prescription.

Examples:

- maximal/general strength development;
- hypertrophy development;
- power development;
- muscular endurance;
- local capacity;
- systemic conditioning;
- technique/skill;
- preparation;
- activation;
- recovery.

A global goal may influence purpose selection and policy applicability, but it must not stamp one universal dose onto every exercise.

### 5. Body-composition intent

Appearance, fat loss, and definition require a separate Product/profile owner.

Possible future structured intent:

- lose body fat;
- build or preserve muscle;
- both.

Resistance training may support body composition, but the engine must not encode fat loss or “definition” as a high-repetition Prescription.

### 6. Nutrition owner

Nutrition and energy-balance support require a separate nutrition owner.

The training engine must not promise:

- localized fat loss;
- body-fat reduction from rep range alone;
- “toning” from short rest;
- a physique outcome without the required broader inputs.

### 7. Constraints and realization truth

The realized Prescription must respect:

- exact equipment;
- load ceiling and increment availability;
- support surfaces;
- range;
- side/laterality;
- skill/familiarity;
- experience;
- Safety;
- response history;
- available time and structural capacity.

A strength goal does not authorize invented heavy equipment or maximal loading.

### 8. Evidence over time

Longitudinal Adaptation remains evidence-led.

Completed evidence may support:

- keep;
- repeat for confirmation;
- hold;
- local Prescription review;
- progression of one legal axis;
- regression of one legal axis;
- replacement review;
- bounded rotation review;
- Week review;
- Phase review;
- Safety review.

No calendar-only progression, automatic replacement, novelty quota, automatic deload, or global regeneration.

---

# Owner-Approved Prescription Resolution Direction

## Selected architecture

Use:

```text
G4 purpose-first resolution
+
G1 fail-closed unsupported-policy guard
```

### G4 — Purpose first

Resolve the local Prescription from:

```text
allocated weekly objective
→ SessionNeed
→ assignment role
→ section
→ exercise knowledge
→ legal dose mode
→ equipment realization
→ experience / familiarity / Safety / response context
→ global outcome goal as bounded context
```

### G1 — Fail closed

When no reviewed policy exists for the resolved purpose/context:

```text
return POLICY_REQUIRED or UNSUPPORTED_SCOPE
```

Do not fall through to strength merely because the goal is not hypertrophy.

## Permanent Prescription principles

### Strength

Strength should generally favor:

- sufficiently loadable and stable main work;
- lower repetition ranges where the exercise and equipment make them truthful;
- longer recovery where necessary to preserve force and technique;
- repeated skill exposure;
- legal progression from completed evidence;
- important strength work early in the session.

Strength must not force:

- 3–6 reps for every exercise;
- low reps on mobility, preparation, activation, cuff, breathing, or other unsuitable work;
- barbell-only programs;
- maximal loading for beginners or pain-aware return;
- identical dosing across equipment settings;
- automatic progression.

### Hypertrophy

Hypertrophy should generally favor:

- sufficient developmental volume;
- broad legal repetition ranges;
- sufficient effort;
- enough rest to preserve productive work;
- stable target ownership;
- direct/accessory work only where it adds unique value.

Hypertrophy must not require:

- only 8–12 reps;
- short rest;
- failure;
- slow tempo;
- soreness;
- exercise churn.

### General fitness

General fitness should be expressed through a coherent bundle of weekly and session responsibilities.

It should not have one universal rep range.

### Conditioning and muscular endurance

These must remain distinct:

- muscular endurance: local fatigue resistance;
- systemic conditioning: broader cardiorespiratory/work-capacity demand.

Do not call carries or local capacity complete systemic conditioning without an approved receiver and modality policy.

### Power / explosiveness

Power requires a future explicit developmental purpose before broad Athletic Performance can map to it.

Power is not merely “strength with fewer reps.”

### Posture and movement quality

Posture/movement quality should influence:

- weekly responsibilities;
- movement purposes;
- exercise context;
- execution and progression.

It should not have one universal dose family or create a generic corrective circuit.

### “Toning” / definition

Initial Product decision:

```text
T0 — Do not expose “toning” as a Product goal.
```

Future preferred clarification:

```text
T2 — Ask whether the user primarily means:
- more muscle;
- lower body fat;
- greater endurance;
- a combination.
```

“Toning” must never become:

```text
high reps + short rest
```

---

# Completed and Proven

## A. Engine and infrastructure foundation

- Candidate Intelligence is implemented and tested.
- Session Intent Planner is implemented.
- Session Composer is implemented.
- Prescription design and production compiler are implemented but inactive.
- Final Sequencing is implemented but inactive.
- Post-Prescription Week Validation is implemented but inactive.
- Phase Continuity is implemented but inactive.
- Longitudinal Adaptation is implemented but inactive.
- Outcome Source contracts, append-only revisions, PostgreSQL persistence, and replay are implemented but inactive.
- Production Week Planner, Allocation Composer, materializer, and remaining-Week reallocation are implemented but inactive.
- Adaptation Application Orchestration is implemented but inactive.
- Controlled Product Shadow Integration is implemented, default-off, internal-allowlist-only, and nonauthoritative.

## B. Goal audit

Completed at commit:

`3708876ea48dab6f38d641cb67d05da95351245c`

Proven:

- `strength` is a canonical V2 goal.
- `hypertrophy` is a canonical V2 goal.
- `general_fitness`, `conditioning`, and `posture_and_movement_quality` are canonical goals.
- `pain_aware_return` is a programming context, not an outcome goal.
- Product currently exposes neither Build Strength nor Build Muscle.
- Product Athletic Performance is under-specified.
- Product `trainingIntent=build` means developmental progression, not strength or hypertrophy.
- Current strength and hypertrophy Prescription families are materially distinct.
- Current non-hypertrophy main repetition-set fallthrough to `main_strength` is overbroad and accidental.
- Five goal/context classes and twelve main exercises are affected.
- Short rest is not required for hypertrophy.
- Failure is not universally required.
- No mandatory tempo exists.
- “Toning” is not a distinct resistance-training adaptation.
- Equipment-specific strength realization must remain truthful.
- Warm-up and activation remain dependency-owned.
- Artificial uniqueness count remained zero.
- No Product, production, API, or shadow behavior changed during the audit.

Audit fingerprint:

`0606f9cd19d73e8cf683080c3b71fad1af7eb19d0c873a2361e294cde3be27fb`

## Chunk B1 — Canonical owner-policy contracts

- **Status:** completed
- **Implementation commit:** `f12db89ba01aadd3abe9633e7f1961c1dd274290`
- **Ledger closure commit:** recorded in Git history / final PR HEAD
- **Contract:** `PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1_LAYERED_PURPOSE_FIRST@1.0.0`
- **Owner approval:** layered goal model and G4 purpose-first + G1 fail-closed direction
- **Production behavior changed:** no
- **Product behavior changed:** no
- **Product Shadow mapping changed:** no
- **Public Product API changed:** no
- **Activation:** not authorized
- **Tests:** owner policy/selection, ledger, mutation, metamorphic, CAGT, report, and activation guards passed 15/15; Product Training Goal audit regressions passed 10/10; complete Training Engine V2 suite passed 1,044/1,044 across 199 files; root Vitest passed 1,016/1,016 across 138 files; Training Engine V2 TypeScript, consumer production, gyms production, scoped ESLint, deterministic report regeneration, and staged diff checks passed
- **CAGT:** architecture-only convergence passed 9/9 scenarios with zero artificial runtime differences; semantic mutations rejected 31/31; metamorphic checks passed 17/17
- **Contract fingerprint:** `d0f65c147de6916ef3429191e1a066786545961dd012841c499a3292a957d749`
- **Ledger pre-closure fingerprint:** `f72a901280feed39a5afced9e5f9b008d75776d01a5a2434e733a31526bd3457`
- **Owner-decision report fingerprint:** `4afdd7c816436d8a96086f85ca51a01e8704ef9fdb86bd89152c7cddc6d6b4ea`
- **Combined B1 architecture-admission fingerprint:** `e379675e791e3dcf326475b463804e99ab2d243556e8ea3a481d53a93668b15e`
- **Remaining limitations:** the current Prescription resolver and five-class non-hypertrophy-to-strength fallthrough remain unchanged and visibly open for Chunk B2
- **Rollback boundary:** remove the inert contracts, generated owner reports, and bounded ledger links without changing runtime behavior
- **Next dependency:** `PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_IMPLEMENTATION_AUTHORIZATION`

## Chunk B2 — Purpose-first goal-specific Prescription resolver

- **Status:** completed and proven
- **Implementation commit:** `50f57a948158583e3bc15d224969365202444163`
- **Ledger closure commit:** recorded in Git history / final PR HEAD
- **Resolver contract:** `PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER@1.0.0`
- **Resolver policy:** `PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_PURPOSE_FIRST_FAIL_CLOSED@1.0.0`
- **Purpose evidence:** `PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT@1.0.0`
- **Compiler:** `PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0`
- **V1.0 disposition:** frozen historical compatibility, not Product activation authority
- **Architecture:** G4 purpose-first + G1 fail-closed; local purpose precedes bounded outcome-goal context; structural role and section validate placement but do not invent physiology
- **Intentional V2 behavior change:** V1.1 returns typed purpose/policy-required states for unsupported or missing purpose instead of falling through to strength
- **Current V1.0 behavior changed:** no; 100/100 supported V1.0/V1.1 golden pairs retained equivalent dose, rest, effort, timing, load, block, and source-event semantics
- **Product behavior changed:** no
- **Product Shadow changed:** no; it remains explicitly pinned to V1.0 and default-off
- **Product mapping changed:** no
- **Product UI changed:** no
- **Activation:** not authorized
- **Numeric Prescription Policy V1 values changed:** no
- **Week/Candidate/Composer decisions changed:** no
- **Lineage:** exact Week objective -> reserved responsibility -> allocated objective -> SessionNeed -> assignment -> Prescription handoff projection, plus an explicit standalone owner source
- **CAGT Registry:** `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@12.0.0`; historical gate order/authorities preserved; Gate 9 future supported authority records V1.1; Product activation remains unauthorized
- **Controlled evidence:** 241/241 scenarios passed; all 45 exercise identities, seven dose modes, five sections, and seven roles covered
- **Fallthrough evidence:** V1.0 replay preserved and all 60 audited V1.1 fallthrough cells failed closed
- **Holdout:** 380/380 passed, including 370 genuine V1.1 compiler calls and 100 V1.0/V1.1 golden pairs; fingerprint `6e9f0ac20879ec3a3a5a7d9d056cad3b2684512fda2660499680e384648f5611`
- **Adversarial evidence:** 50/50 semantic mutations rejected; 16/16 metamorphic invariants and 11/11 material responses passed; zero accepted downstream rescues
- **Stress:** deterministic required-count snapshot, lineage, resolver, role/section, purpose/mode, golden, fail-closed, shared-assignment, multi-goal, equal-primary-conflict, no-rescue, and V1.0 replay loops passed with zero failures; fingerprint `e0880ce355f7004f8489313d5636b27f4703d5622bc591d053330ceac57a2ff7`
- **Tests:** purpose-first contracts/compiler/evidence/CAGT/reports/activation passed 25/25; complete Training Engine V2 suite passed 1,069/1,069 across 206 files; root Vitest passed 1,016/1,016 across 138 files; historical compiler, Prescription Policy V1, Week, Application Orchestration, Product Shadow, Product Goal Architecture, Training Engine V2 TypeScript, consumer production, gyms production, scoped ESLint, deterministic report regeneration, and staged diff checks passed
- **Upstream fingerprints:** Candidate, Planner, Composer, Week, Prescription Policy V1, V1.0 compiler, Sequencing, post-Prescription Week, Gate 14, Phase Continuity, Longitudinal Adaptation, Outcome Source, Orchestration, Product Shadow, Product Goal Audit, and B1 fingerprints remain recorded unchanged in deterministic B2 evidence
- **Ledger pre-closure fingerprint:** `703789a5808b052f328f34277a91358494c941b6930ffbfa18a08fc5ea01b88a`
- **Combined B2 implementation fingerprint:** `535e29b43aebdd761d1a31f74843a52b4331a53dcdafde678775169f1a7e2d1c`
- **Remaining limitations:** B3 purpose-policy gaps remain; Product Shadow is still pinned to V1.0; no Product/UI/activation migration is authorized
- **Rollback boundary:** remove the explicit V1.1 and purpose-resolution APIs, Registry V12 metadata, tests, and reports without changing V1.0 or Product behavior
- **Next dependency:** `SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_ADMISSION_AUTHORIZATION`

## Chunk B3 — Supported goal and local-purpose policies

- **Status:** completed and proven
- **Implementation commit:** `0b26b78f67c9f929d106a4c068b1bcdb26401505`
- **Ledger closure commit:** recorded in Git history / final PR HEAD
- **Goal/local-purpose policy:** `SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY@1.0.0`
- **Compatibility policy:** `GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1@1.0.0`
- **Implementation-status projection:** `PRODUCT_GOAL_ARCHITECTURE_IMPLEMENTATION_STATUS@1.0.0`; the B1 owner-decision snapshot and fingerprint remain frozen
- **Resolver policy:** `PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_SUPPORTED_CORE@1.1.0`
- **Numeric Prescription policy:** `PRESCRIPTION_POLICY_V2_PURPOSE_SPECIFIC_SUPPORTED_CORE@2.0.0`
- **Compiler:** `PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.2.0`
- **Purpose contribution:** `PRESCRIPTION_PURPOSE_CONTRIBUTION@1.0.0`
- **Week policy:** `PRODUCTION_WEEK_POLICY_V2_PURPOSE_SPECIFIC_CORE@2.0.0`
- **Week contracts:** Planner, Composer, and Materializer `1.1.0`, explicit-call future-only
- **Gate 13 validator:** `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL@1.1.0`
- **CAGT Registry:** `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@13.0.0`; historical gate order and authority remain unchanged; Gate 1, Gate 9, and Gate 13 record only explicit future-version calls
- **Existing supported core:** every V1 strength, main/accessory hypertrophy, direct, capacity, preparation, activation, recovery, and technique/control numeric rule is retained unchanged by object reference; V1 numeric rule changes: 0
- **Secondary hypertrophy:** admitted through distinct `secondary_hypertrophy`; selected candidate `SH1` is 2 sets, 6-15 repetitions, RIR 2-3, and 90-180 seconds rest; it does not borrow secondary-strength, main-hypertrophy, or accessory-hypertrophy rules
- **Movement quality:** bounded repetition-set quality practice admitted through `movement_quality_main` and `movement_quality_accessory`; selected candidate `MQ1`; quality-limited effort and stop-on-quality-loss are explicit; posture correction, pain reduction, clinical outcome, strength credit, hypertrophy credit, and completed-adaptation claims remain prohibited
- **Local muscular endurance:** bounded repetition-set local endurance admitted through `muscular_endurance_main` and `muscular_endurance_accessory`; selected candidate `ME1`; systemic conditioning, cardio, toning, fat loss, and implicit strength/hypertrophy credit remain prohibited
- **Week family/purpose ownership:** added only `movement_quality` / `movement_quality_development` and `muscular_endurance` / `muscular_endurance_development`; selected frequency candidates `MQF2` and `MEF2`; required 1/2/3, preferred 0/1/2, optional 0/1/1; optional bloat count: 0
- **Purpose propagation:** exact `localPrescriptionPurpose` and authority are retained through weekly priority, objective, reservation, materialization, SessionNeed provenance, purpose evidence, Prescription handoff, V1.2 plan, and Gate 13 contribution lane; existing selection behavior changed: no
- **Goal compatibility:** outcome goals validate explicit local purpose but never create it; general fitness requires an explicit purpose bundle; posture/movement quality has no universal dose; conditioning may observe local endurance/capacity but does not prove systemic scope; pain-aware context modifies requirements but never creates purpose
- **Primary/secondary/cross-goal behavior:** one primary local purpose owns one assignment dose; supporting relationships are trace-only; equal rightful primary conflicts fail closed; blended use cases: 0; duplicate source events: 0; fractional coefficients: 0
- **Purpose-contribution lanes:** eleven closed lanes; exactly one primary lane per block; one source event may expose multiple linked objective views without duplicate dose or completed-performance/adaptation claims
- **Systemic conditioning:** `DEFERRED` as `SYSTEMIC_CONDITIONING_POLICY_REQUIRED`; modality, intensity, pace, interval, duration, recovery, external-load, and Product-input owners are missing; production rules: 0
- **Power:** `DEFERRED` as `POWER_DEVELOPMENT_POLICY_REQUIRED`; per-exercise explosive legality, ballistic/velocity truth, load realization, equipment, and Product follow-up are missing; production rules: 0
- **Maintenance:** `DEFERRED` as `MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED`; prior productive Prescription, population/context, Week frequency/volume, and continuity owners are required; production rules: 0
- **Return/rebuild:** `DEFERRED` to B4 as `RETURN_OR_REBUILD_REALIZATION_POLICY_REQUIRED`; equipment, experience, familiarity, absence duration, pain-aware context, support/range/side, prior load, and starting volume remain unrealized; production rules: 0
- **Toning/body composition/nutrition:** outside local Prescription purpose ownership; toning is not physiology, body composition requires a Product/profile owner, and nutrition requires a nutrition owner
- **Product Shadow:** remains pinned to `PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.0.0`; frozen combined fingerprint `fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c`; migration count: 0; semantic change count: 0; rollout changed: no
- **Product and production invariance:** Product mapping changed: no; Product UI/options changed: no; Questionnaire changed: no; `generateProgram` changed: no; delivered Program changed: no; persistence/database changed: no; Application Orchestration migration count: 0; V2 activation: not authorized
- **Controlled evidence:** 315 scenarios and an 84-case fixed-shell cohort cover admitted/deferred purposes, all 45 exercise identities, seven dose modes, five sections, seven roles, canonical goals, relationship types, constrained horizons, duration truth, and no-rescue cases
- **Locked holdout:** 540 scenarios, including 380 genuine V1.2, 180 Week V2, 180 Gate 13 V1.1, and 120 historical golden cases; fingerprint `58ff0da567011fc82e8e33d5a0284aebd53c9328d1c2953b57514769a4fc2abd`
- **Mutations/metamorphic evidence:** 45/45 semantic mutations rejected; 21/21 metamorphic checks passed; no accepted downstream rescue
- **Stress:** 10,000 goal-purpose, 10,000 Week, 10,000 resolver, 10,000 numeric, 8,000 Compiler V1.2, 5,000 Gate 13 V1.1, 3,000 movement-quality, 3,000 local-endurance, 2,000 secondary-hypertrophy, 2,000 multi-goal, and required 1,000-case candidate/deferred/no-rescue/Shadow loops passed with zero failures and explicit time
- **Tests:** B3 policy/report tests passed 15/15; complete Training Engine V2 suite passed 1,084/1,084 across 208 files; root Vitest passed 1,016/1,016 across 138 files; historical B1/B2, Week V1, Prescription V1, Compiler V1.0/V1.1, Sequencing, Gate 13 V1.0, Gate 14, Phase, Longitudinal, Outcome Source, Orchestration, and Product Shadow regressions passed; Training Engine V2 TypeScript, consumer production, gyms production, scoped ESLint, deterministic reports, and diff checks passed; PostgreSQL jobs exited cleanly and skipped because no local database was configured
- **Fingerprints:** goal-purpose policy `0e17c1387aeb471fce62d884a0b52acc4b546e3d9631311f2f1f286015734991`; compatibility `b9be691d97a310acfff7af9a96e36d4c99a6196afadff9c77c0a614a12767957`; Resolver V1.1 `383e331e697bed3324351e499993d06d2b16ae7f9037c20760b20b284a143299`; Prescription Policy V2 `563f1bdba429403edc8e87963d0b007ed83ab9e75dfe33bd584134126a676177`; Week V2 `52ba9b79772e9cc1f420f608cb428f23c391b9ecce9efaa421922b443a9f7d87`; Registry V13 `7c51269633f86faebb83d0c333dde7935b9317661a8cd2b5d137161fd89d5e5f`
- **Ledger pre-closure fingerprint:** `bdec75c79f6726dab62cda954292db10bfc5ecf1aa3046f2d1cc465792a41868`
- **Combined B3 fingerprint:** `22b6e85c6d8cbe2cfd054cece695da21ba07adc6766bebb81cd1ab45757566b6`
- **Remaining limitations:** B4 realization, Chunk C Product Shadow migration, Product inputs/UI, systemic conditioning, power, maintenance, return/rebuild, body composition, nutrition, owner delivery, and broader activation remain open
- **Rollback boundary:** revert the B3 ledger closure, then remove explicit future-only V1.1/V1.2/V2 APIs, Registry V13 metadata, evidence, reports, and bounded links; V1.0/V1.1 current behavior and Product remain unchanged
- **Next dependency:** `EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_AUTHORIZATION`

## C. Owner architecture selection

Approved direction:

- modified plain-language V2 Product vocabulary;
- one primary + optional secondary goal;
- pain/limitations as separate context;
- training mode separate from outcome;
- G4 purpose-first resolution;
- G1 fail-closed unsupported-policy behavior;
- T0 initially for toning;
- T2 clarification later;
- body-composition and nutrition as separate owners;
- future explicit power;
- separate muscular endurance and systemic conditioning;
- general strength by default, with future specific-lift goals;
- goal-specific success evidence;
- screenshot-guided, small-chunk Product work;
- no giant activation.

This approval is architectural only. It does not authorize behavior changes.

---

# Future Work

Exact next dependency:

`CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING_V1_AUTHORIZATION`

## Chunk B4 — Equipment-, experience-, and context-specific realization

- **Status:** completed and proven
- **Implementation commit:** `3ccb0151ab36328ef974cf926d7b2cb374ca3431`
- **Ledger closure commit:** recorded in Git history / final PR HEAD
- **Combined status:** `EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1_IMPLEMENTED_NOT_ACTIVATED`
- **Classification:** `EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_READY_FOR_CONTROLLED_PRODUCT_SHADOW_GOAL_MAPPING_AUTHORIZATION`
- **Ontology:** `EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_ONTOLOGY_READY`; all 38 required questions are answered in the deterministic audit
- **Profiles:** `ATHLETE_TRAINING_EXPERIENCE_PROFILE@1.0.0`, `EXERCISE_IDENTITY_FAMILIARITY_PROFILE@1.0.0`, `EXERCISE_REALIZATION_FAMILIARITY_PROFILE@1.0.0`, `ATHLETE_AUTHORED_PROGRAMMING_BRIEF@1.0.0`, `ATHLETE_SPECIALIZATION_PRIORITY_PROFILE@1.0.0`, and `HABITUAL_TRAINING_EXPOSURE_PROFILE@1.0.0`
- **Realization policies:** `EQUIPMENT_LOAD_REALIZATION_PROFILE@1.0.0`, `PROGRESSION_STARTING_POINT_POLICY_V1_EVIDENCE_LED@1.0.0`, `EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1@1.0.0`, `RETURN_OR_REBUILD_REALIZATION_POLICY_V1@1.0.0`, `PROGRESSION_AXIS_REALIZATION_OPTIONS@1.0.0`, `PRESCRIPTION_RAMP_UP_POLICY_V1_CONTEXT_SPECIFIC@1.0.0`, and `ADVANCED_INTENSITY_TECHNIQUE_REQUEST@1.0.0`
- **Production kernels:** `PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.3.0` and `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL@1.2.0`, explicit future-only calls with no default alias or automatic migration
- **CAGT Registry:** `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@14.0.0`; historical gate order and exact authorities remain preserved; Gate 9 and Gate 13 record only explicit future-version authority; production imports CAGT: no
- **Twenty-plus-year experience semantics:** verified lifetime and recent experience are retained as context and never converted into exact load, set count, RIR, volume tolerance, recovery, or technique authority
- **Global versus exact familiarity:** global experience, exercise-identity familiarity, and exact-realization familiarity are separate; exact implement, support, range, side, load, mode, block, purpose, and lineage remain required for exact continuity
- **Empty-engine-history behavior:** empty V2 history remains unknown and does not downgrade an authenticated or coach-reviewed experienced athlete to novice; unknown exact load returns self-selected calibration
- **Freshness:** exact current, recent policy-dependent, historical stale, and unknown are typed; `REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED` remains explicit and no universal day threshold is introduced
- **Athlete-authored programming brief:** strong preference and continuity evidence only; stable legal/tolerated/equipped anchors are preserved; it is not completed Performance, equipment proof, exact dose authority, Safety override, or catalog-expansion authority
- **Specialization:** local priorities are preserved without creating identities, unlimited volume, Safety overrides, or infeasible simultaneous phases
- **Habitual exposure:** material authority comes from completed source events in separate lanes; draft plans create zero completed events; incompatible modes and fractional set equivalents are not summed; proposed changes require reviewed comparison without universal percentages
- **Equipment-load realization:** exact implement, minimum, maximum, increment or available set, mechanism, assistance, support, range, side, and explicit unknowns are represented; a full-gym label proves no machine or increment
- **Equipment semantics:** dumbbell ceilings and increments are visible; Smith and free barbell remain distinct; machines require exact IDs/mechanisms; cable ratios are not inferred; unmeasured bands do not become kilograms or 1RM percentages; bodyweight uses assistance, external load, leverage, range, support, and stability truth; invented variants: 0
- **Starting point:** exact current productive/tolerated load may be retained only when exact equipment capability agrees; reviewed current context may be applied; related or stale history remains non-exact; unknown load returns `SELF_SELECTED_LOAD_CALIBRATION_REQUIRED`; guessed loads: 0
- **Load ceiling:** an insufficient ceiling returns Candidate/Composer recomposition required and never silently changes identity or rescues strength through higher repetitions
- **Return/rebuild:** the bounded B4 mode may preserve identity, select an existing regression variant, calibrate effort, add bounded acclimation, hold progression, and require confirmation; universal load reductions: 0; universal set reductions: 0; deloads applied: 0
- **Progression axes:** legal and currently realizable load, repetition, range, support, lever, tempo, duration, and set options may be exposed; no axis is selected, authorized, or numerically applied; set progression remains Week/Longitudinal-owned
- **Calendar progression:** Week-2 repetitions, Week-3 load, Week-4 intensity, and first-exposure progression mutations are rejected; automatic progression count: 0
- **Ramp-up:** 0-4 context-specific blocks remain within one source event, before developmental work, with zero developmental credit and no guessed exact load; the historical 0-2 behavior remains unchanged
- **Time constraint:** purpose, productive anchors, required rest, and active dependencies are preserved before optional work, redundancy, and setup churn are removed; unresolved over-budget state remains visible
- **Advanced challenge:** `ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE@1.0.0` is sanitized, test-only preference evidence; it records more than 20 years, six resistance opportunities, specialization, stable anchors, daily ritual requests, external posing/walking, unknown equipment/loads/increments/minutes, and 146 observed draft work sets without claiming completed Performance or Product input
- **Challenge findings:** the six-day framework and high volume are neither rejected nor copied without habitual completed exposure, duration, tolerance, and recovery; exact catalog identities: 18; approved same-identity realizations: 7; reviewed alias candidates: 2; identity gaps: 10; ambiguous: 1; fuzzy matches and catalog additions: 0
- **Intensity-technique deferral:** drop sets, rest-pause, partials, isometrics, clusters, and related requests stay typed and return `ADVANCED_INTENSITY_TECHNIQUE_POLICY_REQUIRED`; production technique policies: 0; compiled or flattened techniques: 0
- **Deload boundary:** the challenge's automatic post-Week-4 deload is rejected as `DELOAD_REVIEW_REQUIRES_COMPLETED_AGGREGATE_EVIDENCE`; a coach-authored future preference is not completed evidence or an engine default
- **Controlled evidence:** 460 scenarios and a 120-case fixed-shell cohort cover experience, familiarity, habitual exposure, equipment, starting points, return, time, ramping, progression options, advanced techniques, challenge facts, catalog gaps, and no-rescue behavior
- **Locked holdout:** 720 scenarios, including 500 genuine Compiler V1.3, 240 Gate 13 V1.2, 200 equipment, 200 experience/familiarity, 160 habitual-volume, 140 return/rebuild, 120 challenge, and 180 historical golden cases; all 45 exercise identities, seven dose modes, five sections, all roles, and all equipment kinds are covered; fingerprint `2144ec3668020c8af329d3972d0b4ede146b910a7bd24e7c22d18dfc797bd2ae`
- **Mutations and metamorphic evidence:** 54/54 semantic mutations rejected; 38/38 invariance/material-response checks passed; accepted downstream rescues: 0
- **Stress:** required 10,000-case experience, identity, realization, habitual, equipment, starting-point, and context loops; 8,000 Compiler V1.3; 5,000 Gate 13 V1.2; required 3,000-, 2,000-, and 1,000-case boundary loops all passed with explicit time, no hidden clock, no production randomness, and zero failures
- **Tests:** focused B4 contracts/realization/reports/activation passed 15/15; complete Training Engine V2 suite passed 1,099/1,099 across 211 files; root Vitest passed 1,016/1,016 across 138 files; Training Engine V2 TypeScript, consumer production build, gyms production build, scoped ESLint, deterministic report regeneration, and staged diff checks passed; local PostgreSQL was not configured and remains an upstream CI job
- **Product Shadow:** remains pinned to `PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.0.0`; Compiler V1.3, realization-context, equipment-load V2, starting-point, return/rebuild, ramp-up, and Gate 13 V1.2 imports/calls: 0; frozen fingerprint `fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c`; rollout changed: no
- **Product and production invariance:** Product goal/experience/equipment mappings changed: no; Product UI/options/questionnaire changed: no; `generateProgram` changed: no; delivered Program changed: no; persistence/database changed: no; Application Orchestration migration count: 0; Product output count: 0; V2 activation: not authorized
- **Fingerprints:** Registry V14 `face4e1fbf00aac38a37b05b6d1d9121cce94750d4df03d6fa917dd10eaadf7a`; Compiler V1.3 `d68d3ec9223877a4a31c618a1f26397b05d91f3656d42d5b2f968e031ba7766b`; Gate 13 V1.2 `6bc6ae200fcce846481fab3e9a777224b0a331d3bab6db36a6ea97c9b0c7df30`; challenge `2cbb5c5034534dd04b568a10541add9cb1bb37b10298eccb1ffe11c129237c1d`; stress `33d3827b476dad3a1dbc7605eccd6d4078a9f230bd909401f29bc67b615e724d`; all 23 required upstream fingerprints are recorded unchanged in deterministic B4 evidence
- **Ledger pre-closure fingerprint:** `6ca0c9197a6c7dd9d5925d3796ef7058676625d61559d213b1c431e4fdfd9fa1`
- **Combined B4 implementation fingerprint:** `82b0251049fdf9ceafab06811536e3a1298c5541dad1a08f80b3b2af0ec1999b`; deterministic report-corpus fingerprint `dae04740fb87194d9bd0de8fddf9005e70bbef6e85b940b57ec10ecd94fe7577`
- **Explicit deferrals and limitations:** Chunk C Product Shadow mapping, Product-owned experience/familiarity/equipment/minutes/context/preference inputs, Product UI/activation, unsupported catalog identities, advanced intensity-technique policy, systemic conditioning, power, maintenance, complete external-load receiver behavior, body composition, nutrition, owner delivery, and broader rollout remain open
- **Rollback boundary:** revert the B4 ledger closure, then remove explicit future-only V1.3/V1.2 APIs, realization-context contracts, Registry V14 metadata, tests, generated reports, and bounded integration links; historical kernels and Product remain unchanged
- **Next dependency:** `CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING_V1_AUTHORIZATION`

## Chunk C — Extend Controlled Product Shadow mapping

Default off.

Add shadow-only mappings for the selected vocabulary.

No user-visible output.

No Product mutation.

No V2 outcome attribution.

## Chunk D — Run goal-specific shadow evidence

Run same-shell cohorts for:

- strength;
- hypertrophy;
- general fitness;
- posture/movement quality;
- pain-aware context;
- primary + secondary goals;
- equipment settings;
- time constraints;
- experience;
- relevant and irrelevant pain.

Measure rightful differences and justified convergence.

## Chunk E — Screenshot-guided Product design

Owner supplies the current Product screen.

Review only one surface at a time.

For each surface:

- capture current state;
- identify exact fields and mappings;
- design the minimum change;
- preserve rollback;
- test mobile/desktop/accessibility;
- verify no unrelated UI or behavior changed.

## Chunk F — Add one inactive Product option

- Behind an explicit inactive feature control.
- No ordinary-user rollout.
- No automatic mapping.
- No general activation.
- Product screenshot review required first.

## Chunk G — Controlled owner-account delivery

Separate authorization.

- owner/internal account only;
- explicit confirmation;
- monitoring;
- legacy fallback;
- rollback;
- no broad rollout.

## Chunk H — Broader Product activation

Separate authorization only after:

- shadow evidence;
- Product-owned missing inputs;
- full contracts;
- monitoring;
- rollback;
- support;
- privacy/legal review;
- user communication;
- final end-to-end validation.

## Future extension lanes

These remain visible so they are not forgotten:

- explicit power/explosiveness purpose;
- specific-lift strength goals;
- muscular endurance versus systemic conditioning;
- body-composition intent;
- nutrition integration;
- maintenance policy;
- return/rebuild Week/Longitudinal and Product-input integration;
- wearable/cardio evidence;
- goal-specific success measures;
- sport-specific preparation;
- Product follow-up for Athletic Performance;
- Product follow-up for tone/definition;
- Product availability/minutes;
- exact equipment capability collection;
- canonical Knowledge Layer explanations;
- Coaching Rail and Praxis Library presentation.

---

# Explicitly Not Complete Yet

The following remain incomplete until implemented, verified, and separately authorized:

- Controlled Product Shadow goal and realization mapping (Chunk C);
- Product goal mapping updates;
- Product goal UI;
- primary/secondary goal UI;
- pain/context UI separation;
- training-mode UI;
- body-composition owner;
- nutrition owner;
- power policy;
- conditioning policy;
- systemic-conditioning receiver and modality policy;
- Product Shadow evidence for the new mappings;
- owner-account V2 delivery;
- general Product activation.

---

# Architecture Completion Rules

A Future Work item may move to Completed only when its note records:

- exact commit SHA;
- exact contract/policy version;
- owner approval;
- production/shadow/activation state;
- tests;
- CAGT result;
- fingerprints;
- observed behavior;
- remaining limitations;
- rollback boundary;
- next dependency.

A deferred item may leave Future Work only when the owner explicitly records:

- `DEFERRED`,
- reason,
- rightful future owner,
- activation consequence.

A rejected item may leave Future Work only when the owner explicitly records:

- `REJECTED`,
- reason,
- evidence,
- replacement architecture where applicable.

---

# Final Completion Note

**Current state:** `INCOMPLETE_FUTURE_WORK_REMAINS`

Do not mark this architecture complete until every Future Work item has been:

1. implemented and verified;
2. explicitly deferred by the owner with a recorded reason and future owner; or
3. explicitly rejected by the owner with a recorded reason.

When all tasks are met, replace the current-state line above with:

```text
COMPLETED
```

and append the following final ledger:

```text
Completion date:
Final commit SHA:
Final PR / merge commit:
Final contract and policy versions:
Final production fingerprints:
Final Product vocabulary:
Final engine mapping:
Final supported goal/purpose matrix:
Final Product activation scope:
Final shadow and owner-account evidence:
Final tests and CAGT evidence:
Final monitoring and rollback state:
Intentionally deferred work:
Rejected work and reasons:
Known limitations:
Next architecture domain:
```

The final completion note must not say “complete” while any unsupported goal is
silently falling through, any Product label is ambiguously mapped, any required
policy is missing, or any activation dependency remains unresolved.
