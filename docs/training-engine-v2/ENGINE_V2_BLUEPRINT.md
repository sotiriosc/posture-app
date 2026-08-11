# Praxis Training Engine V2 — Authoritative Blueprint

- **Status:** Architecture authority
- **Purpose:** Ground-up design specification for the Praxis Training Engine V2
- **Golden product base:** `8af4934641c46da9abbe77a62881151cca9cbf34`
- **Golden branch:** `golden/praxis-stable-base`

---

## Contents

- [Mission and boundaries](#1-mission)
- [Reasoning and domain model](#6-architectural-principle)
- [Phase and session doctrine](#9-phase-is-a-first-class-programming-concept)
- [Assessment, pain, mechanics, and selection](#19-assessment-must-influence-the-whole-session)
- [Composition, continuity, and adaptation](#24-avoid-greedy-slot-selection)
- [Determinism, observability, and validation](#33-determinism)
- [Development governance](#37-reference-catalog-strategy)
- [Final principle](#48-final-principle)

## 1. Mission

Praxis Training Engine V2 must be a genuinely intelligent, deterministic, explainable training prescription system.

Its purpose is not simply to generate valid workouts.

Its purpose is to create coherent training programs that:

- match the individual;
- account for assessment findings;
- account for weaknesses and movement limitations;
- account for current pain and injury-related signals;
- respect actual available equipment;
- provide an appropriate training stimulus;
- progress logically over time;
- coordinate exercises within each workout;
- coordinate workouts across each week;
- progress users through multiple phases;
- retain useful exercises long enough for meaningful progression;
- change exercises when there is a real programming reason;
- explain why each important decision was made.

The central question is:

> What training prescription is most appropriate for this person, at this point in their development, given their goals, capabilities, constraints, assessment, training history and current phase?

The engine must never degrade into:

> Pick a generic template and patch it until validation passes.

## 2. Product Context

Praxis is a phased training system.

The first production target is a coherent three-phase progression.

A program is not a collection of independent workouts.

A workout is not a collection of independent exercises.

Praxis uses the session structure:

1. Warm-up
2. Activation
3. Main
4. Accessory
5. Cooldown

These sections must cooperate.

The engine must eventually reason simultaneously across:

1. the individual exercise decision;
2. the current session;
3. the current training week;
4. the current phase;
5. progression across Phase 1 → Phase 2 → Phase 3;
6. the user's longitudinal training history.

## 3. Golden Product Baseline

The trusted Praxis product baseline is:

`8af4934641c46da9abbe77a62881151cca9cbf34`

The corresponding branch is:

`golden/praxis-stable-base`

This baseline has been visually verified against the known-good deployed application.

Engine V2 work must not use current `main` as the assumed product truth.

The golden application must remain stable while V2 is developed independently.

Do not modify the golden application merely to make development easier.

## 4. Relationship to the Existing Engine

The existing engine is valuable, but it is not the architecture for V2.

It contains:

- useful exercise knowledge;
- pain knowledge;
- equipment rules;
- coaching knowledge;
- phase concepts;
- test cases;
- past failure cases;
- fuzz personas;
- program invariants;
- lessons from real debugging.

V2 should preserve knowledge without automatically preserving implementation.

Existing-engine material must be classified as:

### REUSE_AS_DATA

Knowledge that remains fundamentally sound and can be normalized into V2.

Examples may include:

- exercise identity;
- equipment requirements;
- movement classification;
- coaching information;
- same-exercise progression axes and reviewed cross-exercise transition knowledge.

### REIMPLEMENT_FROM_PRINCIPLE

The concept is valid but the existing implementation should not be carried forward.

Examples may include:

- scoring;
- exercise selection;
- sequencing;
- phase progression;
- repair logic.

### KEEP_AS_TEST_ORACLE

Existing behavior or test cases useful for detecting regressions or known failures.

### DO_NOT_PORT

Implementation that conflicts with the new architecture or mixes unrelated responsibilities.

### NEEDS_REVIEW

Knowledge requiring human exercise-science judgment before migration.

No large legacy module should be copied into V2 and then divided into smaller files.

V2 is a new engine.

## 5. Absolute Package Boundary

Engine V2 must initially live independently under:

`packages/training-engine-v2/`

The package must be pure domain and training logic.

It must contain:

- no React;
- no Next.js;
- no UI components;
- no database;
- no localStorage;
- no authentication;
- no Stripe;
- no billing;
- no HTTP requests;
- no analytics;
- no telemetry requirements;
- no account logic;
- no application routing;
- no hidden mutable global state.

Input should be serializable data.

Output should be serializable data.

The long-term public API should resemble:

```ts
generateProgram(input: TrainingEngineInput): TrainingEngineResult
```

## 6. Architectural Principle

The engine should reason approximately in this order:

```text
Athlete / Profile
        ↓
Normalize Inputs
        ↓
Interpret Assessment + Training History at an Explicit Evaluation Time
        ↓
Determine Current Phase Intent
        ↓
Determine Weekly Training Intent
        ↓
Determine Session Intents
        ↓
Determine Required Training Roles
        ↓
Generate Legal Exercise Candidates
        ↓
Normalize Assessment Signals and Establish Truthful Relevance
        ↓
Match Candidate Features and Evaluate Target Fit
        ↓
Trace Task Demand, Capability, and Any Modeled Challenge Fit
        ↓
Contextual Candidate Scoring with Bounded Influence
        ↓
Whole-Session Composition
        ↓
Whole-Week Composition
        ↓
Sequencing
        ↓
Exercise Prescription
        ↓
Same-Exercise Progression / Longitudinal Adaptation
        ↓
Final Validation
        ↓
Program + Decision Trace
```

This ordering matters.

The engine should determine what the person needs before choosing exercises.

Each stage owns a distinct decision. Later stages may compare, compose, prescribe, or adapt the legal possibilities produced upstream, but they may not silently rewrite upstream truth.

## 7. Hard Rules vs Intelligence

A fundamental V2 rule is:

Hard gates protect truth and safety. Scoring chooses the best legal option.

Assessment may reorder legal truth, but it may not create truth.

Hard eligibility answers:

Can this exercise legitimately be prescribed here?

Scoring answers:

Of the legal options, which is the best choice for this person and this context?

Hard exclusions should be reserved for true constraints such as:

- unavailable equipment;
- explicit personal block;
- true contraindication;
- incompatible band setup;
- impossible setup;
- exercise-role falsehood;
- clearly inappropriate movement given an acute pain state;
- other genuine safety or truth violations.

Contextual preferences should generally affect ranking rather than legality.

Training-role truth, requested section truth, movement-role truth, target-muscle truth, equipment truth, personal blocks, and true contraindications must be established explicitly. A score bonus cannot repair a candidate that failed one of those invariants.

For example:

Beginner does not mean:

- machine-only;
- bodyweight-only;
- easiest possible exercise;
- no free weights.

Advanced does not mean:

- hardest variation;
- highest instability;
- most complicated movement.

Experience is one dimension of appropriateness.

## 8. Domain Model

V2 should use explicit domain types.

At minimum the architecture should support:

### Athlete and Assessment

- Athlete
- AthleteProfile
- ExperienceLevel
- TrainingGoal
- TrainingPreferences
- TrainingAvailability
- Assessment
- AssessmentSignal
- AssessmentPriority
- MovementLimitation
- MobilityFinding
- StabilityFinding
- ControlFinding
- AsymmetryFinding

### Pain and Injury

These concepts must remain distinct:

- historical injury;
- historical weakness;
- assessment finding;
- current discomfort;
- moderate pain;
- severe/acute pain;
- hard contraindication;
- personal dislike/block.

Do not collapse them into one generic pain field.

### Equipment

- EquipmentCapabilities
- support availability;
- bench availability;
- machine availability;
- cable availability;
- dumbbell availability;
- barbell availability;
- band type;
- band anchor availability;
- anchor height/capability where relevant;
- bodyweight capability.

Equipment should describe actual capability rather than merely broad labels.

### Training State

- TrainingPhase
- TrainingHistory
- ExerciseHistory
- SessionHistory
- ProgramHistory
- ProgressionState
- FatigueState where applicable
- CandidateEvaluationContext
- Evaluation time (`asOf`) where time-relative evidence is evaluated

### Programming

- WeeklyIntent
- SessionIntent
- TrainingRole
- TrainingSlot
- ExercisePrescription
- PlannedExercise
- PlannedSession
- PlannedWeek
- PhasePlan

### Engine Reasoning

- ExerciseCandidate
- CandidateScore
- ScoreComponent
- RejectionReason
- AssessmentFeatureMatchTrace
- AssessmentFeatureTargetFitTrace
- AssessmentFeatureDevelopmentTrace
- ExerciseTransitionRelationship
- TransitionPurposeEvidenceTrace
- ExerciseTransitionTrace
- SessionEvaluation
- WeekEvaluation
- DecisionTrace
- ValidationResult

Avoid generic string[] fields where a meaningful domain type can exist.

## 9. Phase Is a First-Class Programming Concept

Phase must not simply be:

- a label;
- a difficulty value;
- a rep-range switch;
- a hardcoded exercise blacklist.

Each phase must have explicit intent.

The first production implementation will support three phases.

Their exact public names and final exercise-science definitions may be refined later, but the architecture must represent:

**Phase intent**

What qualities are we developing?

**Movement expectations**

What level of control, range, stability and technical competency is expected?

**Loading intent**

How aggressively should load and effort progress?

**Exercise-selection intent**

What characteristics are preferred at this stage?

**Continuity intent**

Which successful exercises should remain stable?

**Advancement criteria**

What demonstrates readiness for the next phase?

## 10. Phase Progression Must Be Real Progression

Moving from one phase to another must create meaningful development.

Same-exercise progression may occur through:

- load;
- repetitions;
- sets;
- total volume;
- range of motion;
- tempo;
- control;
- proximity to failure;
- reduced assistance;
- reduced external support;
- increased stability demand;
- increased coordination demand;
- technical complexity;
- an explicitly supported same-exercise progression axis;
- different stimulus emphasis through prescription.

Exercise replacement is not same-exercise progression. It is a cross-exercise transition decision with its own reason, reviewed relationship, and structural trade-offs.

A phase change must not automatically cause exercise replacement.

A good exercise may remain across multiple phases while its prescription evolves.

Example:

```text
same exercise
Phase 1 → controlled execution / moderate loading
Phase 2 → stronger progression target / increased loading
Phase 3 → greater hypertrophy stimulus / volume or effort progression
```

Where appropriate.

The exact adaptation model must depend on the exercise and program context.

The default order is:

```text
KEEP a productive legal exercise
↓
PROGRESS its prescription when earned
↓
REPLACE it only when evidence justifies a cross-exercise transition
```

## 11. Result-Oriented Programming

The goal is not to maximize variation.

The goal is productive adaptation.

Programs should provide an appropriate combination of:

- stimulus;
- progressive overload;
- movement practice;
- muscular exposure;
- training frequency;
- volume;
- intensity;
- fatigue management;
- recovery opportunity;
- technical development;
- continuity.

The engine cannot guarantee physiological results because results also depend on factors outside the engine such as:

- adherence;
- nutrition;
- sleep;
- recovery;
- health;
- genetics;
- effort.

But the programming itself should be designed so that consistent adherence provides a rational and progressively challenging stimulus aligned with the user's stated goal.

## 12. Session Structure Is Coherent

Every training day follows:

```text
Warm-up
↓
Activation
↓
Main
↓
Accessory
↓
Cooldown
```

These are not five independent candidate pools.

They form one training argument.

## 13. Warm-Up Purpose

Warm-up exercises should prepare the athlete for today's session.

They may address:

- required joint range;
- movement pattern;
- breathing mechanics;
- positioning;
- relevant mobility;
- tissue preparation;
- movement rehearsal.

Warm-up exercises should preferably have a traceable relationship to:

- today's main patterns;
- assessment priorities;
- relevant pain or limitation signals.

Generic filler should be discouraged.

## 14. Activation Purpose

Activation should improve control or recruitment that meaningfully supports the session.

Potential roles include:

- scapular control;
- serratus engagement;
- trunk control;
- pelvic positioning;
- glute recruitment;
- hip stability;
- rotator-cuff control;
- movement preparation.

Activation should not become arbitrary "corrective exercise" accumulation.

The question should be:

What control or activation work improves this person's ability to perform today's loaded training?

## 15. Main Section Purpose

Main exercises should provide the dominant training stimulus.

Selection must consider:

- session purpose;
- goal;
- movement role;
- muscle priority;
- phase;
- experience;
- assessment;
- pain;
- progression opportunity;
- loadability;
- fatigue cost;
- stability demand;
- weekly context.

Main exercises should not merely be whichever legal exercise has the highest isolated score.

## 16. Accessory Purpose

Accessory exercises should complement the main work.

Useful reasons include:

- additional target-muscle volume;
- movement coverage;
- weak-point emphasis;
- hypertrophy volume;
- unilateral development;
- stability work;
- arm/delt/calf work;
- filling a meaningful weekly gap.

Accessories should avoid pointless duplication.

Example:

If the main work already creates large fatigue for a movement pattern, an accessory should not automatically repeat nearly the same stimulus unless there is a programming reason.

## 17. Cooldown Purpose

Cooldown should be relevant to:

- the session performed;
- relevant range/mobility needs;
- recovery considerations;
- down-regulation where appropriate.

Cooldown should not become a mandatory generic list disconnected from the workout.

## 18. Session Dependency Model

The architecture should support dependencies between sections.

For example:

**Assessment:** right scapular control priority

**Session:** chest / push emphasis

**Warm-up:** thoracic/scapular preparation

**Activation:** serratus/scapular-control exercise

**Main:** pressing movement appropriate to the athlete

**Accessory:** chest/delt/triceps work that complements the main work

**Cooldown:** appropriate shoulder/thoracic recovery work

The engine should eventually be able to explain this chain.

## 19. Assessment Must Influence the Whole Session

Assessment findings must not simply inject a corrective exercise.

### Assessment Input Boundary

Training Engine V2 does not inspect assessment images, pixels, video, landmarks, or raw pose estimates. Image interpretation belongs to the upstream Praxis assessment system. V2 accepts only normalized, serializable assessment signals with explicit source, confidence, priority, severity where provided, and review state.

```text
raw posture photos/images
  -> existing Praxis pose/assessment system
  -> normalized AssessmentState / AssessmentSignal data
  -> Training Engine V2
```

An assessment signal is programming evidence, not a diagnosis. The training engine must not infer a medical diagnosis or invent a precise biomechanical finding from an image, prose description, or missing field.

### Truth Before Influence

Hard training-need truth is established before assessment influence. Requested training role, session section, movement role, target muscle, equipment, personal blocks, and true contraindications remain owned by their explicit contracts.

> Assessment may reorder legal truth, but it may not create truth.

An assessment overlap cannot turn an exercise into a role, movement, section, or muscle-target candidate that it is not. Among legal candidates, relevant assessment evidence may change order through bounded, inspectable influence.

### Target Fit and Challenge Fit

Assessment reasoning must keep these concepts separate:

- **Feature match** describes whether reviewed candidate mechanics express the assessed feature.
- **Feature target fit** describes whether that expression makes a legal candidate a more relevant target for the assessed need.
- **Feature challenge demand** describes how difficult it is to execute that exact feature in that exercise.
- **Feature capability** describes the athlete's estimated capacity for that exact feature.
- **Developmental challenge fit** compares feature challenge demand with feature capability when both are modeled well enough to support the comparison.

Feature expression is not feature difficulty. Target fit is not a dosage recommendation, a safety claim, a capability estimate, or proof that the exercise provides an appropriate challenge.

The settled Candidate Intelligence target-fit doctrine is:

- target fit applies only after hard eligibility has produced a truthful legal candidate;
- it answers what assessment feature the exercise trains, not how hard that feature should be challenged or dosed;
- target fit is assessment-only selection influence;
- it is derived from truthful candidate-feature metadata, signal relevance, confidence, and priority;
- it is independent of assessment severity, generic task demand, athlete capability, movement-role history, phase capability priors, and feature challenge demand;
- the strongest feature target fit for one assessment signal is used rather than summing sibling matches;
- low-expression, unknown, or conflicting feature evidence does not receive positive target-fit influence;
- lack of feature expression is not automatically a punishment, and actual conflict remains a separate concept;
- target fit contributes to assessment fit and does not automatically duplicate into alignment fit;
- generic assessment behavior remains unchanged when no feature-specific signal exists;
- target-fit influence and any developmental challenge influence share one bounded assessment budget, with the trace showing where the influence was received.

Feature challenge demand remains `not_modeled` in the current architecture. Therefore feature demand/capability match remains `not_applicable` and the feature-specific developmental relationship remains neutral. A truthful feature target may still reorder legal candidates; the engine must not fabricate challenge precision to justify that target.

Later prescription and session-composition stages must decide how a selected target belongs in the session and how it is dosed. Candidate target fit alone cannot make that decision.

### Uncertainty Doctrine

Unknown means unknown. It must not silently become easy, safe, preferred, poor, contraindicated, developmentally superior, zero demand, measured evidence, or a confident neutral fact.

- confidence describes trust in an observation;
- severity describes deficit magnitude when supplied;
- priority describes programming importance;
- candidate demand describes the exercise task;
- athlete capability describes the person;
- review status and provenance describe the quality of exercise knowledge.

These dimensions must remain separate in data, scoring, and traces. Conservative defaults and phase/experience priors may support deterministic behavior, but they must be labeled as priors. Missing severity is not feature-specific evidence and must not numerically reduce a feature capability prior. Missing or unreviewed mechanics remain visible as unknown or `needs_review` rather than being inferred from descriptive text.

`needs_review` must remain visibly qualified through matching, influence, traces, and human review. It is not accepted evidence merely because a numeric field exists.

### Whole-Session Influence

They may affect:

- warm-up;
- activation;
- main selection;
- accessory selection;
- range;
- support;
- load;
- order;
- progression speed;
- substitution;
- phase advancement.

Assessment signals need confidence and priority.

Low-confidence assessment findings should not dominate an entire program.

High-confidence and functionally relevant findings may carry more influence.

## 20. Pain and Injury Logic

Pain is not simply another scoring bonus or penalty.

The engine should distinguish between:

**Historical issue**

Relevant context but not necessarily current restriction.

**Mild discomfort**

May affect ranking, support, range or loading.

**Moderate pain**

May strongly redirect movement choice or prescription.

**Severe / acute pain**

May create hard exclusions and may invalidate certain training roles.

**Hard contraindication**

Absolute eligibility failure.

Pain should be able to affect:

- exercise legality;
- candidate ranking;
- support preference;
- range;
- load;
- exercise order;
- progression;
- replacement;
- session structure.

Pain should not simply remove one exercise while the rest of the session remains oblivious.

Pain responsibility is intentionally split:

- upstream assessment or clinical systems own observation and diagnosis; Training Engine V2 does not diagnose;
- hard eligibility owns explicit contraindications, impossible stress exposure, personal blocks, and other true safety failures;
- candidate scoring owns relative pain suitability among otherwise legal exercises;
- prescription owns appropriate changes to load, range, support, tempo, effort, and volume within its validated capabilities;
- session and week composition own ordering, accumulated stress, fatigue interaction, and replacement context;
- progression and transition logic owns whether to keep and adjust an exercise, regress its prescription, or consider a reviewed replacement.

Candidate pain decisions derive from one deterministic, source-aware set of matched facts. A matched fact is unique by pain signal and stress tag, while all structured exercise metadata sources remain visible as provenance. Multiple metadata sources for one matched tag do not automatically represent multiple physiological stress units. Hard eligibility, acute eligibility, warning, suitability, joint cost, assessment context, prescription requirements, and composition requirements retain explicit independent receiver authority over that shared evidence.

No one layer may disguise another layer's responsibility. A pain score cannot override a contraindication, a legal candidate is not automatically an appropriate prescription, and a transition label is not permission to replace an exercise automatically.

Within Candidate Intelligence, the primary semantic owners are:

- **Pain suitability:** direct current-discomfort stress overlap, moderate-pain stress overlap, and historical-sensitivity stress overlap.
- **Joint cost:** modeled joint/stress exposure and accumulation.
- **Stability fit:** exercise stability demand against developmental context.
- **Assessment/demand relationship:** structured developmental support or exposure reasoning when the required evidence exists.

Support mechanics may inform later selection, prescription, and session reasoning, but generic support must not receive an undocumented pain bonus. Pain suitability requires the pain/tolerance evidence owned by that component.

## 21. Exercise Definition Must Be Multi-Dimensional

Do not use one broad "difficulty" field to represent everything.

A normalized ExerciseDefinition should be capable of describing independent characteristics such as:

- exercise identity;
- movement family;
- movement roles;
- primary muscle targets;
- secondary muscle targets;
- equipment requirements;
- setup requirements;
- structured external and body support;
- band and anchor requirements;
- resistance-path type;
- trajectory freedom;
- line-of-pull adjustability;
- laterality;
- machine/setup fit dependency;
- range and joint-control demand;
- trunk-control and scapular-control demand;
- skill demand;
- coordination demand;
- stability demand;
- loadability;
- loading potential;
- local fatigue cost;
- systemic fatigue cost;
- axial loading;
- joint loading tendencies;
- main suitability;
- accessory suitability;
- preparation suitability;
- experience suitability;
- phase suitability;
- pain/risk considerations;
- review status, notes, and provenance for curated mechanics;
- feature-specific scapular expression where reviewed;
- same-exercise progression axes;
- reviewed cross-exercise transition relationships and their structural deltas.

This allows the engine to understand why two exercises that train similar muscles are not interchangeable.

Not every exercise requires every optional mechanics field. Explicit unknown remains valid and preferable to fabricated precision.

Biomechanical behavior must come from structured `ExerciseDefinition` metadata. Runtime logic must not derive support, resistance path, task demand, feature expression, laterality, or other mechanics by sniffing exercise ID, name, summary, labels, equipment text, or coaching cues. Those strings may explain an exercise to humans; they are not executable biomechanics.

Legacy prose may help a reviewer curate structured metadata outside the engine. Unknown or unreviewed metadata must remain explicit in the domain instead of becoming a hidden textual heuristic.

Resistance/path metadata is observational selection knowledge. It describes how resistance is constrained, how freely the athlete can choose a trajectory, whether the line of pull is adjustable, how laterality is organized, and whether fit depends on machine or setup geometry. It does not duplicate support, control demand, loadability, fatigue, or joint stress, and it is not a generic score bonus.

## 22. Exercise Selection Intelligence

Candidate evaluation should be inspectable.

### Decision Responsibility

Each important question should have one primary semantic owner:

- **Eligibility:** is the exercise legal or illegal for this request?
- **Feature target fit:** what normalized assessment quality does the exercise truthfully train?
- **Challenge fit:** is the modeled developmental difficulty appropriate for this athlete?
- **Pain suitability:** does known pain/tolerance state overlap the candidate's modeled stress?
- **Joint cost:** what modeled joint/stress exposure does the candidate add?
- **Phase fit:** how appropriate is the candidate for current phase intent?
- **Continuity:** what evidence supports retaining or reconsidering the current exercise?
- **Same-exercise progression:** what runway and readiness exist to advance prescription while preserving identity?
- **Transition knowledge:** what structurally changes if exercise identity changes?
- **Session optimizer:** do individually strong legal candidates cooperate as a session?

Components may exchange explicit evidence, but they must not independently answer the same question through hidden bonuses. This ownership reduces accidental double counting.

Potential score dimensions include:

- roleFit;
- goalFit;
- muscleTargetFit;
- sessionIntentFit;
- weeklyNeedFit;
- assessmentFit;
- painFit;
- experienceFit;
- phaseFit;
- stabilityFit;
- skillFit;
- progressionValue;
- continuityValue;
- variationValue;
- loadability;
- stimulusValue;
- fatigueCost;
- jointCost;
- equipmentPracticality;
- sessionSynergy;
- weeklyCoverageValue;
- setupCost.

Do not place hundreds of arbitrary constants into one giant scoring function.

Each score component must retain enough structured data to reproduce and audit its effect:

```ts
{
  id,
  family,
  value,
  rawValue,
  unnormalizedWeight,
  weight,
  weightedContribution,
  reason,
  reasonCode,
  source,
  assessmentInfluence?,
  assessmentRelevance?
}
```

The aggregate must expose its method, unrounded value, total weight, and normalization rule. Configured family weights belong in one inspectable scoring configuration, not scattered across components.

Assessment traces must expose signal interpretation, feature matches, feature target fit, feature development/challenge state, overall demand/capability context, relationship, target and developmental influence, final bounded influence, contribution receivers, evidence quality, review status, and provenance where available.

Hard rejection observability must identify the invariant that failed. Section, movement-role, target-muscle, training-role, equipment, prerequisite, block, and contraindication failures must not collapse into one generic message. Presentation layers may summarize traces, but logging or display choices must not change engine behavior.

The engine must be debuggable.

## 23. Example Candidate Reasoning

A future trace might resemble:

**Need:** Horizontal pull for upper-body session.

**Chosen:** Chest-supported dumbbell row.

**Positive factors:**

+ excellent horizontal-pull role fit
+ bench available
+ strong progression potential
+ low lumbar stabilization requirement
+ appropriate skill demand
+ complements today's pressing volume
+ user is progressing successfully on this movement family

**Runner-up:** One-arm dumbbell row

**Why it lost:**

- additional trunk stabilization cost
- greater unilateral setup cost
- current session already contains significant unilateral work

The exact scoring model may differ.

The important requirement is that the decision can be understood.

## 24. Avoid Greedy Slot Selection

V2 should not fundamentally operate like:

```text
pick best squat
pick best push
pick best pull
pick best hinge
discover conflicts
repair conflicts
repair repair
```

The best isolated exercise may create a worse overall session.

Instead:

```text
derive training roles
↓
generate several strong legal candidates per role
↓
construct plausible session combinations
↓
score the complete session
↓
retain strongest candidates
↓
construct plausible weeks
↓
score the complete week
↓
choose the strongest valid program
```

A bounded deterministic search such as beam search is a suitable design direction.

Do not implement a giant optimizer during the foundation phase.

Design interfaces that permit it.

## 25. Whole-Session Evaluation

The optimizer should eventually evaluate:

- role coverage;
- target-muscle coverage;
- redundant patterns;
- redundant exercises;
- fatigue interaction;
- local fatigue;
- systemic fatigue;
- joint-stress concentration;
- movement order;
- preparation relationships;
- equipment transitions;
- unilateral balance;
- assessment-priority coverage;
- progression continuity;
- session duration;
- phase purpose.

A candidate can score highly individually and still be rejected because another combination creates a better session.

## 26. Whole-Week Evaluation

Sessions must cooperate across the week.

The engine should eventually reason about:

- weekly muscle volume;
- movement frequency;
- muscle frequency;
- priority frequency;
- recovery spacing;
- fatigue interference;
- repeated joint stress;
- redundant movement patterns;
- exercise redundancy;
- session distribution;
- progression continuity;
- assessment-priority exposure;
- weakness exposure;
- phase objectives.

A locally excellent workout may be wrong if it makes the week worse.

## 27. Productive Stability vs Novelty

The default assumption should be:

Productive stability is valuable.

An exercise should generally stay when:

- it remains appropriate;
- the user tolerates it;
- it continues to provide progression opportunity;
- it fits the phase;
- it fits the session;
- the broader program remains coherent.

Exercise change requires a reason.

Valid reasons may include:

- pain;
- equipment change;
- explicit user block;
- poor response;
- plateau;
- phase development;
- skill progression;
- fatigue management;
- improved role fit;
- planned variation;
- meaningful adaptation need.

Changing exercises merely to make programs look different is not intelligent programming.

## 28. Variation Should Be Controlled

Variation may exist where several choices are truly comparable.

The system may rotate equivalent accessory movements when:

- training intent remains intact;
- progression continuity is not harmed;
- fatigue does not worsen;
- setup does not become impractical.

Primary movements should generally be more stable than minor accessories.

Random shuffling is prohibited.

Any seeded variation must remain deterministic.

## 29. Selection, Prescription, Progression, and Transition Are Different Decisions

These four concepts must remain separate.

### Selection

Which exercise should be used?

Selection compares legal candidates in the current training context. A candidate ranking is an input to composition, not a finished workout or program.

### Prescription

How should it be performed today?

Examples:

- sets;
- reps;
- time;
- load target;
- RIR/RPE;
- tempo;
- range;
- support;
- rest.

Prescription may adapt a retained exercise without changing its identity.

### Same-Exercise Progression

Which prescription variable should advance next while preserving exercise identity?

Examples:

- more load;
- more reps;
- additional set;
- improved range;
- slower/control-focused execution;
- reduced support;
- higher effort;
- greater stability or coordination demand when the same exercise explicitly supports that axis.

### Cross-Exercise Transition

Should the current exercise be replaced by another exercise, in which direction, and for what reviewed purpose?

A transition must retain source, target, direction, classification, purpose, review status, provenance, and relevant structural deltas such as movement roles, muscles, support, resistance path, demand, loading, equipment, and assessment-feature expression.

Each transition purpose must expose whether it is structurally confirmed, contextual intent, unknown because required metadata is incomplete, or contradicted. Notes may explain contextual intent but must not override normalized structural evidence.

Transition direction may be `progression`, `regression`, or `lateral`. Classification may be `developmental`, `context_dependent`, `questionable`, or `needs_review`.

A transition relationship has no automatic selection effect. It must not:

- replace the current exercise automatically;
- boost the target or penalize the source;
- bypass candidate ranking;
- bypass pain or equipment truth;
- bypass hard eligibility;
- imply that replacement is appropriate now.

A user should be able to progress without changing exercises.

Productive continuity follows `KEEP + PROGRESS` before `REPLACE`. Replacement requires contextual evidence such as pain response, a block, repeated failed progression, plateau, equipment change, insufficient stimulus runway, poor response, explicit preference, or a reviewed developmental intent.

## 30. Training History Is First-Class Input

Future V2 training history should distinguish events such as:

- completed successfully;
- completed easily;
- appropriate challenge;
- completed with excessive difficulty;
- failed target;
- pain occurred;
- exercise substituted;
- exercise blocked;
- workout missed;
- progression succeeded;
- progression failed;
- plateau detected.

The next prescription must eventually respond to that history.

The engine should not simply generate a new week from scratch.

## 31. Exercise Continuity

Exercise history should allow the engine to reason:

- **This exercise is working:** keep it.
- **This exercise is working but too easy:** progress prescription.
- **This exercise has stalled:** evaluate same-exercise progression evidence first, then consider a reviewed transition if replacement is justified.
- **This exercise repeatedly produces pain:** reassess legality and prescription; keep with an appropriate adjustment only when supported, otherwise consider a reviewed regression transition, substitute, or exclude.
- **This exercise became inappropriate after equipment change:** replace it.
- **This movement has been stable through Phase 1 and remains excellent:** continue it into Phase 2 with a stronger prescription.

## 32. Phase Advancement

Phase advancement should ultimately depend on criteria rather than arbitrary calendar expiration alone.

Possible criteria may include:

- sufficient exposure;
- successful session completion;
- movement competency;
- pain stability;
- progression history;
- readiness;
- adherence;
- phase-specific milestones.

The exact phase gates require later exercise-science review.

The architecture must be able to support them now.

A phase should not advance simply because a date changed.

## 33. Determinism

The determinism contract is:

> Same meaningful serialized input produces the same result.

Time-relative decisions must use only explicit serialized input. Candidate Intelligence carries evaluation time through `CandidateRequest.evaluationContext`, whose `CandidateEvaluationContext.asOf` value is the sole clock for history recency.

The pure engine must not call `Date.now()`, use no-argument `new Date()`, use `performance.now()` for decisions, read machine-local time, or read any other hidden wall clock. Parsing a supplied timestamp is allowed.

If `asOf` is absent or unparsable, recency is unknown and timestamped history is traced as `no_recency`. The engine must not invent an evaluation time. A manual lab or production adapter may read the current clock outside the engine and pass the resulting timestamp explicitly.

No Math.random() or unseeded randomness.

When controlled variation exists, it should depend on explicit deterministic state such as:

- program cycle;
- phase;
- week index;
- stable seed.

Program identity itself should not become accidental randomness.

Deterministic fallbacks, tie handling, ordering, and trace generation are part of this contract. Identical requests must yield identical legal candidates, capability traces, score components, rankings, and reasons.

## 34. Explainability

Every important decision must eventually be auditable.

DecisionTrace should support inspection of:

- interpreted athlete state;
- phase intent;
- weekly intent;
- session intent;
- requested role;
- legal candidate count;
- rejected exercises;
- rejection reasons;
- top candidates;
- candidate score components;
- raw values, configured and normalized weights, and weighted contributions;
- assessment feature matches and feature target-fit traces;
- feature challenge/capability state, including explicit `not_modeled` and `not_applicable` values;
- target, developmental, assessment, alignment, and final bounded influence;
- evidence quality, source, review status, and provenance;
- selected exercise;
- why it won;
- relevant session-level effects;
- relevant week-level effects;
- continuity decision;
- same-exercise progression decision;
- cross-exercise transition decision where considered.

Trace output must report behavior, not create it. Changing a CLI formatter, deduplicating a displayed reason, or adding an observability field must not alter legality, scores, ranking, prescription, or transition behavior.

Developer tooling should be able to answer:

Why did this user receive this exercise rather than the alternatives?

without manually reading selection source code.

## 35. Validation

Validation should protect invariants.

Examples:

- no unavailable equipment;
- no hard contraindications;
- no explicit personal blocks;
- valid section structure;
- valid frequency;
- valid exercise roles;
- sensible prescriptions;
- no duplicate accidental slots;
- valid session duration where constrained;
- valid phase state;
- deterministic behavior.

Validation should not become the main generator.

Good architecture should produce good programs before validation.

Validation should catch defects rather than repeatedly reconstruct programs.

## 36. Repair Philosophy

V2 should minimize repair logic.

If repair becomes common, upstream generation is wrong.

Repairs may exist for exceptional situations, but the architecture should prefer:

```text
correct intent
→ correct eligibility
→ good candidates
→ good optimization
→ valid result
```

rather than:

```text
bad generation
→ repair
→ repair again
→ fallback
→ emergency fallback
```

## 37. Reference Catalog Strategy

Do not migrate the full old catalog during foundation.

Start with approximately 20–30 carefully selected exercises covering:

- horizontal push;
- horizontal pull;
- vertical push;
- vertical pull;
- squat;
- hinge;
- unilateral lower;
- hamstrings;
- glutes;
- chest isolation;
- lateral delts;
- rear delts;
- biceps;
- triceps;
- core;
- useful preparation movements.

Include examples using:

- machines;
- cables;
- dumbbells;
- bodyweight;
- bands.

The small catalog exists to test whether the domain can describe meaningful differences.

Do not optimize for completeness yet.

## 38. Golden Persona Strategy

Foundation should contain approximately 12 understandable personas.

Suggested coverage:

- Beginner gym, no pain
- Beginner gym, shoulder concern
- Intermediate gym, muscle gain
- Advanced gym, muscle gain
- Beginner dumbbells + bench
- Intermediate dumbbells
- Dumbbells without bench
- Anchored bands
- Bands without anchor
- Loop bands only
- Bodyweight
- Mixed home

Golden personas should test reasoning truths rather than exact routines.

Examples:

- beginner does not imply machine-only;
- beginner does not imply free-weight-only;
- advanced does not imply hardest exercise;
- pain meaningfully affects ranking;
- equipment truth is absolute;
- unsupported exercise can lose to supported exercise when context warrants;
- continuity can beat novelty;
- locally best candidate may lose when whole-session composition is worse;
- assessment affects preparation and loaded work rather than simply injecting random corrective exercises.

## 39. Testing Philosophy

Early V2 and Candidate Intelligence tests should be small enough to understand.

Focused tests should cover:

- domain invariants;
- exercise-schema validation;
- equipment eligibility;
- pain eligibility;
- personal blocks;
- candidate-score decomposition;
- determinism;
- phase representation;
- session dependency representation;
- decision-trace completeness.

Do not begin with 50,000 fuzz cases.

Test progression should eventually look more like:

```text
12 golden personas
↓
50 deeply inspected personas
↓
hundreds
↓
thousands
↓
large fuzz/property testing
```

Understanding failures is more important than producing impressive test counts early.

### Candidate Intelligence Readiness Gate

Candidate Intelligence is ready to hand off to Session Composer only after explicit human acceptance of all of the following:

- hard eligibility preserves role, section, movement, muscle-target, equipment, block, prerequisite, and contraindication truth with specific structured reasons;
- assessment can reorder legal candidates but cannot manufacture legal relevance;
- feature target fit, feature challenge, task demand, athlete capability, severity, confidence, priority, and uncertainty remain semantically distinct;
- score components, weights, contribution receivers, bounds, ties, and provenance are reproducible from the trace;
- representative Candidate Lab scenarios produce truthful legal pools and directionally coach-like rankings under exercise-science review;
- expected ties remain ties unless the request and structured exercise metadata contain a real differentiating fact;
- deterministic repeatability, explicit evaluation time, and no-hidden-clock constraints are verified;
- ranking behavior is reviewed across pain, equipment, experience, phase, history, continuity, assessment, and generic no-feature scenarios;
- unresolved exercise-science questions are labeled and routed to a human judgment checkpoint;
- the blueprint, supporting architecture docs, source contracts, tests, and review evidence do not contradict one another.

Green builds and tests are necessary evidence, but they are not sufficient for this gate. A large test count does not replace semantic audit, manual Candidate Lab review, and explicit project-owner acceptance. Session Composer must not begin merely because automated checks pass.

## 40. Candidate Ranking Laboratory

Before V2 generates complete production programs, build a ranking laboratory.

An illustrative query may describe an intermediate athlete seeking muscle gain, with full-gym equipment, a truthful horizontal-pull need, the current phase and session intent, and a mild low-back concern.

The lab output should show:

- every exercise considered;
- whether it is legal for the exact requested role, section, movement role, and target muscle;
- distinct structured rejection reasons such as `ROLE_MISMATCH`, `SECTION_MISMATCH`, `MOVEMENT_ROLE_MISMATCH`, and `TARGET_MUSCLE_MISMATCH`;
- each legal candidate's raw score components, weights, weighted contributions, aggregate, assessment traces, uncertainty, and provenance;
- deterministic ordering and explicit ties;
- the contextual fact responsible for each meaningful difference.

Candidate names such as Chest-Supported Dumbbell Row, Machine Row, Seated Cable Row, One-Arm Dumbbell Row, and Band Row are illustrative legal possibilities, not a permanently asserted ranking. Under the current structured inputs, Machine Row and Seated Cable Row may correctly tie. The lab must preserve and explain that tie instead of inventing false precision.

If human review expects two legal rows to differ, the engine needs a real differentiating fact in the request and structured exercise metadata, such as support need, resistance-path requirement, fit dependency, laterality, pain/stress overlap, equipment capability, exercise-specific history, continuity, or phase/session intent. Name, summary, label, and cue differences are not enough.

Candidate ranking remains candidate intelligence. It does not select a complete session, establish weekly coherence, or prescribe dosage.

Human review should ask:

Does this ranking resemble what an excellent coach would prescribe?

If the rankings are poor, do not proceed to full workout generation.

## 41. Development Phases for Engine V2

### V2 Foundation

Build:

- package boundary;
- domain;
- normalized exercise schema;
- equipment model;
- pain/risk model;
- phase model;
- candidate contracts;
- scoring contracts;
- optimizer interfaces;
- prescription interfaces;
- progression interfaces;
- DecisionTrace;
- small exercise catalog;
- golden personas;
- architecture docs.

No production program generation.

### V2 Candidate Intelligence

Implement:

- hard eligibility;
- candidate generation;
- contextual scoring;
- truthful assessment relevance;
- feature matching and target-fit traces;
- demand/capability and explicit uncertainty traces;
- same-exercise progression value and observational transition traces;
- ranking laboratory;
- exercise-science review.

Do not begin Session Composer or complete program optimization until the permanent Candidate Intelligence readiness gate is explicitly accepted.

### V2 Session Composer

Implement:

- session intent;
- warm-up dependencies;
- activation dependencies;
- main selection;
- accessory completion;
- cooldown relevance;
- whole-session optimization.

Verify sessions manually.

### V2 Weekly Composer

Implement:

- split/frequency;
- weekly roles;
- weekly volume;
- recovery spacing;
- fatigue interaction;
- whole-week optimization.

### V2 Prescription and Progression

Implement:

- sets;
- reps;
- effort;
- rest;
- load progression;
- rep progression;
- volume progression;
- range/control progression;
- same-exercise regression where supported;
- plateau handling.

Cross-exercise transition selection remains a separate contextual decision and must not be smuggled into same-exercise progression.

### V2 Phase System

Implement and validate:

- Phase 1;
- Phase 2;
- Phase 3;
- phase intent;
- advancement criteria;
- exercise continuity across phases;
- appropriate same-exercise prescription progression between phases;
- reviewed cross-exercise transitions where replacement is justified.

### V2 Longitudinal Adaptation

Implement:

- session feedback;
- history interpretation;
- pain response;
- missed workouts;
- successful progression;
- failed progression;
- substitution;
- blocking;
- persistent adaptation.

### V2 Large-Scale Validation

Only after behavior is understood:

- broad persona matrices;
- property testing;
- fuzz testing;
- deterministic repeatability;
- longitudinal simulation;
- old-engine failure regression corpus.

### V2 Praxis Integration

Only after V2 itself is trusted:

- define adapter;
- integrate with golden Praxis application;
- preserve UI/product baseline;
- compare V1 and V2;
- test migration;
- test persistence;
- release separately.

## 42. Architecture Documentation

Maintain these files:

```text
docs/training-engine-v2/
  ENGINE_V2_BLUEPRINT.md
  ARCHITECTURE.md
  DOMAIN.md
  SCORING.md
  OPTIMIZER.md
  TESTING.md
  MIGRATION-SOURCES.md
  FINAL_CANDIDATE_INTELLIGENCE_REVIEW.md
```

Document roles are deliberately different:

- `ENGINE_V2_BLUEPRINT.md` is the normative product and architecture authority.
- `ARCHITECTURE.md` is a concise map of package boundaries, stages, modules, and ownership.
- `DOMAIN.md` defines the shared vocabulary and important semantic distinctions.
- `SCORING.md` records the exact settled Candidate Intelligence score and trace contract, including current implementation constants.
- `OPTIMIZER.md` defines future session/week composition boundaries without pretending candidate ranking is a program.
- `TESTING.md` defines verification layers and readiness evidence.
- `MIGRATION-SOURCES.md` classifies legacy knowledge; it does not grant legacy implementation authority.
- review reports record checkpoint evidence, findings, readiness classification, and unresolved work; they are not permanent architecture authority.

The authority hierarchy is:

1. explicit project-owner direction or an approved blueprint amendment;
2. this blueprint;
3. the focused supporting architecture documents above;
4. accepted source contracts and tests as executable evidence of the currently settled implementation;
5. review reports, Candidate Lab output, and historical checkpoints as validation evidence;
6. legacy engine code and legacy prose only in their approved migration classification.

Conflicts must be repaired, not merely documented side by side. Supporting docs cannot silently override this blueprint, implementation cannot silently redefine a semantic contract, and a stale review report cannot override either. When an accepted implementation decision legitimately advances the architecture, synchronize this blueprint and the affected focused documents in the same deliberate documentation pass.

Git history is the amendment history. The blueprint itself remains enduring doctrine rather than a chronological changelog.

## 43. Human Judgment Checkpoints

Do not allow the coding agent to independently settle important exercise-science uncertainty.

Flag areas such as:

- controversial pain restrictions;
- exercise equivalence;
- phase progression;
- appropriate training volume;
- fatigue assumptions;
- exercise ranking that does not clearly have one correct answer;
- assessment interpretation;
- when support should increase/decrease;
- when same-exercise prescription should progress, remain stable, or yield to a reviewed cross-exercise transition.

Report those questions for human review.

## 44. Anti-Patterns

Engine V2 must avoid:

**Template patching**

Start from one generic program and mutate around constraints.

**Machine-only beginners**

Experience becomes an accidental equipment rule.

**Hardest-is-best advanced programming**

Difficulty is mistaken for appropriateness.

**Corrective exercise dumping**

Every assessment finding injects another corrective.

**Random variety**

Exercise rotation exists primarily to make programs appear different.

**Prescription diversity masquerading as program diversity**

Different reps do not mean a different exercise program.

**Score-as-gate**

A gigantic negative score silently behaves like an undocumented exclusion.

**Repair chains**

Bad selection is repeatedly repaired downstream.

**One-dimensional difficulty**

Skill, stability, fatigue and loadability are collapsed into one number.

**False precision**

Unknown or weakly supported evidence is converted into a confident numerical distinction merely to force an order.

**Feature/challenge collapse**

How strongly an exercise expresses a feature is treated as the difficulty of executing that feature.

**Transition-as-progression**

Replacing one exercise with another is treated as though it were the same decision as advancing load, reps, range, tempo, support, stability, coordination, or complexity within one exercise.

**Biomechanics-by-name**

Exercise ID, name, summary, labels, equipment prose, or coaching cues are searched to manufacture support, resistance-path, demand, or feature truth.

**Observability-as-behavior**

CLI formatting, reason deduplication, logging, or trace presentation changes legality, ranking, prescription, or progression.

**Ranking-as-program**

An ordered candidate list is presented as a coherent session or week without composition, sequencing, dosage, and recovery reasoning.

**Target-fit-as-dosage**

Assessment feature target fit is used to infer sets, reps, load, range, effort, safety, or appropriate challenge without a modeled prescription contract.

**UI contamination**

Training logic begins depending on application presentation.

**Storage contamination**

Generation behavior depends directly on persistence implementation.

**Giant functions**

Hundreds of unrelated training rules accumulate in one generator.

**Test-count worship**

Large fuzz counts substitute for human evaluation of actual prescriptions.

## 45. Definition of Smart

A smart Praxis engine is not one that produces the largest number of different routines.

It is one that can repeatedly make defensible decisions.

Given a person and context, it should:

- understand what the training problem is;
- identify what today's session needs to accomplish;
- identify what this week needs to accomplish;
- understand where the person is within their current phase;
- exclude what is genuinely inappropriate;
- rank legal exercises intelligently;
- combine exercises that cooperate;
- prescribe an appropriate dose;
- retain productive movements;
- progress training when earned;
- react meaningfully to pain and performance;
- advance the person toward the next phase;
- explain what it did and why.

## 46. Foundation Stop Condition

The current foundation phase stops when:

- packages/training-engine-v2 exists independently;
- package compiles;
- domain types are coherent;
- phase is first-class;
- ExerciseDefinition is normalized;
- pain and equipment models are explicit;
- hard eligibility contracts exist;
- candidate-score contracts exist;
- optimizer contracts exist;
- session-section dependencies can be represented;
- whole-week reasoning can be represented;
- prescription is separate from selection;
- same-exercise progression is separate from prescription;
- cross-exercise transition is separate from same-exercise progression and has no automatic selection effect;
- Phase 1 → Phase 2 → Phase 3 can be represented;
- longitudinal history can be represented;
- DecisionTrace exists;
- approximately 20–30 reference exercises validate;
- approximately 12 golden personas exist;
- focused tests pass;
- architecture documents exist.

Do not generate production programs during this phase.

Do not connect V2 to Praxis during this phase.

Do not modify the golden product.

## 47. Foundation Review Report

At completion report:

### Repository State

- branch;
- SHA;
- working-tree status.

### Architecture

- files created;
- module structure;
- major domain decisions.

### Legacy Decisions

- REUSE_AS_DATA;
- REIMPLEMENT_FROM_PRINCIPLE;
- KEEP_AS_TEST_ORACLE;
- DO_NOT_PORT;
- NEEDS_REVIEW.

### Exercise-Science Uncertainties

List anything requiring human judgment.

### Testing

- tests executed;
- pass/fail counts;
- known gaps.

### Scope Verification

Explicitly confirm:

- golden app untouched;
- existing engine untouched;
- no UI integration;
- no auth/storage/billing integration;
- no production generator built.

## 48. Final Principle

Praxis V2 should not optimize for:

How many different workouts can we generate?

It should optimize for:

What is the most coherent next training step for this person?

The architecture must preserve this reasoning chain:

```text
person/state
  -> developmental need
  -> legal possibilities
  -> truthful target fit
  -> contextual candidates
  -> coherent session
  -> coherent week
  -> appropriate prescription
  -> observed response
  -> remembered history
  -> next adaptation
```

No downstream stage may fabricate an upstream fact, and no intermediate ranking should be mistaken for the completed chain.

Every workout should make sense by itself.

Every exercise should make sense within that workout.

Every workout should make sense within the week.

Every week should make sense within the phase.

Every phase should move the athlete toward greater capability and toward their stated training goal.

That is the standard for Training Engine V2.
