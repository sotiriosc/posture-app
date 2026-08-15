# Praxis Product Goal & Prescription Architecture Ledger

**Status:** `OWNER_ARCHITECTURE_DIRECTION_APPROVED_IMPLEMENTATION_PENDING`  
**Last verified audit commit:** `3708876ea48dab6f38d641cb67d05da95351245c`  
**Last completed implementation commit:** `50f57a948158583e3bc15d224969365202444163`  
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

`SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_ADMISSION_AUTHORIZATION`

## Chunk B3 — Admit supported goal/purpose policies

At minimum review and implement separately:

- strength;
- hypertrophy;
- general-fitness supported core;
- posture/movement-quality supported core;
- muscular endurance;
- conditioning;
- power;
- hybrid primary/secondary behavior;
- maintain and return/rebuild modes.

Do not admit a policy without evidence, consequences, and owner approval.

## Chunk B4 — Equipment-, experience-, and context-specific realization

Prove:

- full-gym strength;
- machine strength;
- dumbbell-limited strength;
- bodyweight strength;
- band strength;
- beginner calibration;
- advanced specificity;
- pain-aware return;
- unknown prior load;
- time-constrained behavior;
- support/range/side constraints.

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
- return/rebuild policy;
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

- approved purpose policies beyond current strength/hypertrophy;
- Product goal mapping updates;
- Product goal UI;
- primary/secondary goal UI;
- pain/context UI separation;
- training-mode UI;
- body-composition owner;
- nutrition owner;
- power policy;
- conditioning policy;
- muscular-endurance policy;
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
