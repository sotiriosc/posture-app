# Praxis Training Engine V2 — Authoritative Blueprint

**Status:** Architecture authority
**Purpose:** Ground-up design specification for the Praxis Training Engine V2
**Golden product base:** `8af4934641c46da9abbe77a62881151cca9cbf34`
**Golden branch:** `golden/praxis-stable-base`

---

# 1. Mission

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

---

# 2. Product Context

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

---

# 3. Golden Product Baseline

The trusted Praxis product baseline is:

`8af4934641c46da9abbe77a62881151cca9cbf34`

The corresponding branch is:

`golden/praxis-stable-base`

This baseline has been visually verified against the known-good deployed application.

Engine V2 work must not use current `main` as the assumed product truth.

The golden application must remain stable while V2 is developed independently.

Do not modify the golden application merely to make development easier.

---

# 4. Relationship to the Existing Engine

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
- known progression relationships.

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

---

# 5. Absolute Package Boundary

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

6. Architectural Principle

The engine should reason approximately in this order:

Athlete / Profile
        ↓
Normalize Inputs
        ↓
Interpret Assessment + Training History
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
Contextual Candidate Scoring
        ↓
Whole-Session Composition
        ↓
Whole-Week Composition
        ↓
Sequencing
        ↓
Exercise Prescription
        ↓
Progression / Adaptation
        ↓
Final Validation
        ↓
Program + Decision Trace

This ordering matters.

The engine should determine what the person needs before choosing exercises.

7. Hard Rules vs Intelligence

A fundamental V2 rule is:

Hard gates protect truth and safety. Scoring chooses the best legal option.

Hard eligibility answers:

Can this exercise legitimately be prescribed here?

Scoring answers:

Of the legal options, which is the best choice for this person and this context?

Hard exclusions should be reserved for true constraints such as:

unavailable equipment;
explicit personal block;
true contraindication;
incompatible band setup;
impossible setup;
exercise-role falsehood;
clearly inappropriate movement given an acute pain state;
other genuine safety or truth violations.

Contextual preferences should generally affect ranking rather than legality.

For example:

Beginner does not mean:

machine-only;
bodyweight-only;
easiest possible exercise;
no free weights.

Advanced does not mean:

hardest variation;
highest instability;
most complicated movement.

Experience is one dimension of appropriateness.

8. Domain Model

V2 should use explicit domain types.

At minimum the architecture should support:

Athlete
AthleteProfile
ExperienceLevel
TrainingGoal
TrainingPreferences
TrainingAvailability
Assessment
AssessmentSignal
AssessmentPriority
MovementLimitation
MobilityFinding
StabilityFinding
ControlFinding
AsymmetryFinding
Pain / Injury

These concepts must remain distinct:

historical injury;
historical weakness;
assessment finding;
current discomfort;
moderate pain;
severe/acute pain;
hard contraindication;
personal dislike/block.

Do not collapse them into one generic pain field.

Equipment
EquipmentCapabilities
support availability;
bench availability;
machine availability;
cable availability;
dumbbell availability;
barbell availability;
band type;
band anchor availability;
anchor height/capability where relevant;
bodyweight capability.

Equipment should describe actual capability rather than merely broad labels.

Training State
TrainingPhase
TrainingHistory
ExerciseHistory
SessionHistory
ProgramHistory
ProgressionState
FatigueState where applicable
Programming
WeeklyIntent
SessionIntent
TrainingRole
TrainingSlot
ExercisePrescription
PlannedExercise
PlannedSession
PlannedWeek
PhasePlan
Engine Reasoning
ExerciseCandidate
CandidateScore
ScoreComponent
RejectionReason
SessionEvaluation
WeekEvaluation
DecisionTrace
ValidationResult

Avoid generic string[] fields where a meaningful domain type can exist.

9. Phase Is a First-Class Programming Concept

Phase must not simply be:

a label;
a difficulty value;
a rep-range switch;
a hardcoded exercise blacklist.

Each phase must have explicit intent.

The first production implementation will support three phases.

Their exact public names and final exercise-science definitions may be refined later, but the architecture must represent:

Phase intent

What qualities are we developing?

Movement expectations

What level of control, range, stability and technical competency is expected?

Loading intent

How aggressively should load and effort progress?

Exercise-selection intent

What characteristics are preferred at this stage?

Continuity intent

Which successful exercises should remain stable?

Advancement criteria

What demonstrates readiness for the next phase?

10. Phase Progression Must Be Real Progression

Moving from one phase to another must create meaningful development.

Progression may occur through:

load;
repetitions;
sets;
total volume;
range of motion;
tempo;
control;
proximity to failure;
reduced assistance;
reduced external support;
increased stability demand;
increased coordination demand;
technical complexity;
exercise progression;
different stimulus emphasis.

Exercise replacement is only one form of progression.

A phase change must not automatically cause exercise replacement.

A good exercise may remain across multiple phases while its prescription evolves.

Example:

same exercise
Phase 1 → controlled execution / moderate loading
Phase 2 → stronger progression target / increased loading
Phase 3 → greater hypertrophy stimulus / volume or effort progression

Where appropriate.

The exact adaptation model must depend on the exercise and program context.

11. Result-Oriented Programming

The goal is not to maximize variation.

The goal is productive adaptation.

Programs should provide an appropriate combination of:

stimulus;
progressive overload;
movement practice;
muscular exposure;
training frequency;
volume;
intensity;
fatigue management;
recovery opportunity;
technical development;
continuity.

The engine cannot guarantee physiological results because results also depend on factors outside the engine such as:

adherence;
nutrition;
sleep;
recovery;
health;
genetics;
effort.

But the programming itself should be designed so that consistent adherence provides a rational and progressively challenging stimulus aligned with the user's stated goal.

12. Session Structure Is Coherent

Every training day follows:

Warm-up
↓
Activation
↓
Main
↓
Accessory
↓
Cooldown

These are not five independent candidate pools.

They form one training argument.

13. Warm-Up Purpose

Warm-up exercises should prepare the athlete for today's session.

They may address:

required joint range;
movement pattern;
breathing mechanics;
positioning;
relevant mobility;
tissue preparation;
movement rehearsal.

Warm-up exercises should preferably have a traceable relationship to:

today's main patterns;
assessment priorities;
relevant pain or limitation signals.

Generic filler should be discouraged.

14. Activation Purpose

Activation should improve control or recruitment that meaningfully supports the session.

Potential roles include:

scapular control;
serratus engagement;
trunk control;
pelvic positioning;
glute recruitment;
hip stability;
rotator-cuff control;
movement preparation.

Activation should not become arbitrary "corrective exercise" accumulation.

The question should be:

What control or activation work improves this person's ability to perform today's loaded training?

15. Main Section Purpose

Main exercises should provide the dominant training stimulus.

Selection must consider:

session purpose;
goal;
movement role;
muscle priority;
phase;
experience;
assessment;
pain;
progression opportunity;
loadability;
fatigue cost;
stability demand;
weekly context.

Main exercises should not merely be whichever legal exercise has the highest isolated score.

16. Accessory Purpose

Accessory exercises should complement the main work.

Useful reasons include:

additional target-muscle volume;
movement coverage;
weak-point emphasis;
hypertrophy volume;
unilateral development;
stability work;
arm/delt/calf work;
filling a meaningful weekly gap.

Accessories should avoid pointless duplication.

Example:

If the main work already creates large fatigue for a movement pattern, an accessory should not automatically repeat nearly the same stimulus unless there is a programming reason.

17. Cooldown Purpose

Cooldown should be relevant to:

the session performed;
relevant range/mobility needs;
recovery considerations;
down-regulation where appropriate.

Cooldown should not become a mandatory generic list disconnected from the workout.

18. Session Dependency Model

The architecture should support dependencies between sections.

For example:

Assessment:
right scapular control priority

Session:
chest / push emphasis

Warm-up:
thoracic/scapular preparation

Activation:
serratus/scapular-control exercise

Main:
pressing movement appropriate to the athlete

Accessory:
chest/delt/triceps work that complements the main work

Cooldown:
appropriate shoulder/thoracic recovery work

The engine should eventually be able to explain this chain.

19. Assessment Must Influence the Whole Session

Assessment findings must not simply inject a corrective exercise.

They may affect:

warm-up;
activation;
main selection;
accessory selection;
range;
support;
load;
order;
progression speed;
substitution;
phase advancement.

Assessment signals need confidence and priority.

Low-confidence assessment findings should not dominate an entire program.

High-confidence and functionally relevant findings may carry more influence.

20. Pain and Injury Logic

Pain is not simply another scoring bonus or penalty.

The engine should distinguish between:

Historical issue

Relevant context but not necessarily current restriction.

Mild discomfort

May affect ranking, support, range or loading.

Moderate pain

May strongly redirect movement choice or prescription.

Severe / acute pain

May create hard exclusions and may invalidate certain training roles.

Hard contraindication

Absolute eligibility failure.

Pain should be able to affect:

exercise legality;
candidate ranking;
support preference;
range;
load;
exercise order;
progression;
replacement;
session structure.

Pain should not simply remove one exercise while the rest of the session remains oblivious.

21. Exercise Definition Must Be Multi-Dimensional

Do not use one broad "difficulty" field to represent everything.

A normalized ExerciseDefinition should be capable of describing independent characteristics such as:

exercise identity;
movement family;
movement roles;
primary muscle targets;
secondary muscle targets;
equipment requirements;
setup requirements;
support requirements;
band requirements;
anchor requirements;
unilateral/bilateral;
supported/unsupported;
range requirements;
skill demand;
coordination demand;
stability demand;
loadability;
loading potential;
progression potential;
local fatigue cost;
systemic fatigue cost;
axial loading;
joint loading tendencies;
main suitability;
accessory suitability;
preparation suitability;
experience suitability;
phase suitability;
pain/risk considerations;
progression relationships;
regression relationships.

This allows the engine to understand why two exercises that train similar muscles are not interchangeable.

22. Exercise Selection Intelligence

Candidate evaluation should be inspectable.

Potential score dimensions include:

roleFit;
goalFit;
muscleTargetFit;
sessionIntentFit;
weeklyNeedFit;
assessmentFit;
painFit;
experienceFit;
phaseFit;
stabilityFit;
skillFit;
progressionValue;
continuityValue;
variationValue;
loadability;
stimulusValue;
fatigueCost;
jointCost;
equipmentPracticality;
sessionSynergy;
weeklyCoverageValue;
setupCost.

Do not place hundreds of arbitrary constants into one giant scoring function.

Each score component should preferably retain:

{
  value,
  reason,
  source
}

The engine must be debuggable.

23. Example Candidate Reasoning

A future trace might resemble:

Need:
Horizontal pull for upper-body session.

Chosen:
Chest-supported dumbbell row.

Positive factors:
+ excellent horizontal-pull role fit
+ bench available
+ strong progression potential
+ low lumbar stabilization requirement
+ appropriate skill demand
+ complements today's pressing volume
+ user is progressing successfully on this movement family

Runner-up:
One-arm dumbbell row

Why it lost:
- additional trunk stabilization cost
- greater unilateral setup cost
- current session already contains significant unilateral work

The exact scoring model may differ.

The important requirement is that the decision can be understood.

24. Avoid Greedy Slot Selection

V2 should not fundamentally operate like:

pick best squat
pick best push
pick best pull
pick best hinge
discover conflicts
repair conflicts
repair repair

The best isolated exercise may create a worse overall session.

Instead:

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

A bounded deterministic search such as beam search is a suitable design direction.

Do not implement a giant optimizer during the foundation phase.

Design interfaces that permit it.

25. Whole-Session Evaluation

The optimizer should eventually evaluate:

role coverage;
target-muscle coverage;
redundant patterns;
redundant exercises;
fatigue interaction;
local fatigue;
systemic fatigue;
joint-stress concentration;
movement order;
preparation relationships;
equipment transitions;
unilateral balance;
assessment-priority coverage;
progression continuity;
session duration;
phase purpose.

A candidate can score highly individually and still be rejected because another combination creates a better session.

26. Whole-Week Evaluation

Sessions must cooperate across the week.

The engine should eventually reason about:

weekly muscle volume;
movement frequency;
muscle frequency;
priority frequency;
recovery spacing;
fatigue interference;
repeated joint stress;
redundant movement patterns;
exercise redundancy;
session distribution;
progression continuity;
assessment-priority exposure;
weakness exposure;
phase objectives.

A locally excellent workout may be wrong if it makes the week worse.

27. Productive Stability vs Novelty

The default assumption should be:

Productive stability is valuable.

An exercise should generally stay when:

it remains appropriate;
the user tolerates it;
it continues to provide progression opportunity;
it fits the phase;
it fits the session;
the broader program remains coherent.

Exercise change requires a reason.

Valid reasons may include:

pain;
equipment change;
explicit user block;
poor response;
plateau;
phase development;
skill progression;
fatigue management;
improved role fit;
planned variation;
meaningful adaptation need.

Changing exercises merely to make programs look different is not intelligent programming.

28. Variation Should Be Controlled

Variation may exist where several choices are truly comparable.

The system may rotate equivalent accessory movements when:

training intent remains intact;
progression continuity is not harmed;
fatigue does not worsen;
setup does not become impractical.

Primary movements should generally be more stable than minor accessories.

Random shuffling is prohibited.

Any seeded variation must remain deterministic.

29. Selection, Prescription and Progression Are Different Decisions

These three concepts must remain separate.

Selection

Which exercise should be used?

Prescription

How should it be performed today?

Examples:

sets;
reps;
time;
load target;
RIR/RPE;
tempo;
range;
support;
rest.
Progression

What should change next?

Examples:

more load;
more reps;
additional set;
improved range;
slower/control-focused execution;
reduced support;
higher effort;
more difficult variation.

A user should be able to progress without changing exercises.

30. Training History Is First-Class Input

Future V2 training history should distinguish events such as:

completed successfully;
completed easily;
appropriate challenge;
completed with excessive difficulty;
failed target;
pain occurred;
exercise substituted;
exercise blocked;
workout missed;
progression succeeded;
progression failed;
plateau detected.

The next prescription must eventually respond to that history.

The engine should not simply generate a new week from scratch.

31. Exercise Continuity

Exercise history should allow the engine to reason:

This exercise is working.
Keep it.

This exercise is working but too easy.
Progress prescription.

This exercise has stalled.
Evaluate progression or replacement.

This exercise repeatedly produces pain.
Regress, substitute or exclude.

This exercise became inappropriate after equipment change.
Replace.

This movement has been stable through Phase 1 and remains excellent.
Continue it into Phase 2 with a stronger prescription.
32. Phase Advancement

Phase advancement should ultimately depend on criteria rather than arbitrary calendar expiration alone.

Possible criteria may include:

sufficient exposure;
successful session completion;
movement competency;
pain stability;
progression history;
readiness;
adherence;
phase-specific milestones.

The exact phase gates require later exercise-science review.

The architecture must be able to support them now.

A phase should not advance simply because a date changed.

33. Determinism

Same meaningful input should produce the same result.

No Math.random() or unseeded randomness.

When controlled variation exists, it should depend on explicit deterministic state such as:

program cycle;
phase;
week index;
stable seed.

Program identity itself should not become accidental randomness.

34. Explainability

Every important decision must eventually be auditable.

DecisionTrace should support inspection of:

interpreted athlete state;
phase intent;
weekly intent;
session intent;
requested role;
legal candidate count;
rejected exercises;
rejection reasons;
top candidates;
candidate score components;
selected exercise;
why it won;
relevant session-level effects;
relevant week-level effects;
continuity decision;
progression decision.

Developer tooling should be able to answer:

Why did this user receive this exercise rather than the alternatives?

without manually reading selection source code.

35. Validation

Validation should protect invariants.

Examples:

no unavailable equipment;
no hard contraindications;
no explicit personal blocks;
valid section structure;
valid frequency;
valid exercise roles;
sensible prescriptions;
no duplicate accidental slots;
valid session duration where constrained;
valid phase state;
deterministic behavior.

Validation should not become the main generator.

Good architecture should produce good programs before validation.

Validation should catch defects rather than repeatedly reconstruct programs.

36. Repair Philosophy

V2 should minimize repair logic.

If repair becomes common, upstream generation is wrong.

Repairs may exist for exceptional situations, but the architecture should prefer:

correct intent
→ correct eligibility
→ good candidates
→ good optimization
→ valid result

rather than:

bad generation
→ repair
→ repair again
→ fallback
→ emergency fallback
37. Reference Catalog Strategy

Do not migrate the full old catalog during foundation.

Start with approximately 20–30 carefully selected exercises covering:

horizontal push;
horizontal pull;
vertical push;
vertical pull;
squat;
hinge;
unilateral lower;
hamstrings;
glutes;
chest isolation;
lateral delts;
rear delts;
biceps;
triceps;
core;
useful preparation movements.

Include examples using:

machines;
cables;
dumbbells;
bodyweight;
bands.

The small catalog exists to test whether the domain can describe meaningful differences.

Do not optimize for completeness yet.

38. Golden Persona Strategy

Foundation should contain approximately 12 understandable personas.

Suggested coverage:

Beginner gym, no pain
Beginner gym, shoulder concern
Intermediate gym, muscle gain
Advanced gym, muscle gain
Beginner dumbbells + bench
Intermediate dumbbells
Dumbbells without bench
Anchored bands
Bands without anchor
Loop bands only
Bodyweight
Mixed home

Golden personas should test reasoning truths rather than exact routines.

Examples:

beginner does not imply machine-only;
beginner does not imply free-weight-only;
advanced does not imply hardest exercise;
pain meaningfully affects ranking;
equipment truth is absolute;
unsupported exercise can lose to supported exercise when context warrants;
continuity can beat novelty;
locally best candidate may lose when whole-session composition is worse;
assessment affects preparation and loaded work rather than simply injecting random corrective exercises.
39. Testing Philosophy

Early V2 tests should be small enough to understand.

Foundation tests should focus on:

domain invariants;
exercise-schema validation;
equipment eligibility;
pain eligibility;
personal blocks;
candidate-score decomposition;
determinism;
phase representation;
session dependency representation;
decision-trace completeness.

Do not begin with 50,000 fuzz cases.

Test progression should eventually look more like:

12 golden personas
↓
50 deeply inspected personas
↓
hundreds
↓
thousands
↓
large fuzz/property testing

Understanding failures is more important than producing impressive test counts early.

40. Candidate Ranking Laboratory

Before V2 generates complete production programs, build a ranking laboratory.

Example query:

Athlete:
Intermediate

Goal:
Muscle gain

Equipment:
Full gym

Need:
Horizontal pull

Context:
Mild low-back concern

Phase:
Current phase

Session:
Upper-body pull/chest context

Output should show:

1. Chest-supported row
2. Cable row
3. Machine row
4. One-arm dumbbell row
...

with reasons.

Human review should ask:

Does this ranking resemble what an excellent coach would prescribe?

If the rankings are poor, do not proceed to full workout generation.

41. Development Phases for Engine V2
V2 Foundation

Build:

package boundary;
domain;
normalized exercise schema;
equipment model;
pain/risk model;
phase model;
candidate contracts;
scoring contracts;
optimizer interfaces;
prescription interfaces;
progression interfaces;
DecisionTrace;
small exercise catalog;
golden personas;
architecture docs.

No production program generation.

V2 Candidate Intelligence

Implement:

hard eligibility;
candidate generation;
contextual scoring;
ranking laboratory;
exercise-science review.

Do not build complete program optimization until rankings are excellent.

V2 Session Composer

Implement:

session intent;
warm-up dependencies;
activation dependencies;
main selection;
accessory completion;
cooldown relevance;
whole-session optimization.

Verify sessions manually.

V2 Weekly Composer

Implement:

split/frequency;
weekly roles;
weekly volume;
recovery spacing;
fatigue interaction;
whole-week optimization.
V2 Prescription and Progression

Implement:

sets;
reps;
effort;
rest;
load progression;
rep progression;
volume progression;
range/control progression;
regression;
plateau handling.
V2 Phase System

Implement and validate:

Phase 1;
Phase 2;
Phase 3;
phase intent;
advancement criteria;
exercise continuity across phases;
appropriate exercise progression between phases.
V2 Longitudinal Adaptation

Implement:

session feedback;
history interpretation;
pain response;
missed workouts;
successful progression;
failed progression;
substitution;
blocking;
persistent adaptation.
V2 Large-Scale Validation

Only after behavior is understood:

broad persona matrices;
property testing;
fuzz testing;
deterministic repeatability;
longitudinal simulation;
old-engine failure regression corpus.
V2 Praxis Integration

Only after V2 itself is trusted:

define adapter;
integrate with golden Praxis application;
preserve UI/product baseline;
compare V1 and V2;
test migration;
test persistence;
release separately.
42. Architecture Documentation

Maintain these files:

docs/training-engine-v2/
  ENGINE_V2_BLUEPRINT.md
  ARCHITECTURE.md
  DOMAIN.md
  SCORING.md
  OPTIMIZER.md
  TESTING.md
  MIGRATION-SOURCES.md

ENGINE_V2_BLUEPRINT.md is authoritative.

If another architecture document conflicts with this file, the blueprint wins unless explicitly amended by the project owner.

43. Human Judgment Checkpoints

Do not allow the coding agent to independently settle important exercise-science uncertainty.

Flag areas such as:

controversial pain restrictions;
exercise equivalence;
phase progression;
appropriate training volume;
fatigue assumptions;
exercise ranking that does not clearly have one correct answer;
assessment interpretation;
when support should increase/decrease;
when a movement should progress versus remain stable.

Report those questions for human review.

44. Anti-Patterns

Engine V2 must avoid:

Template patching

Start from one generic program and mutate around constraints.

Machine-only beginners

Experience becomes an accidental equipment rule.

Hardest-is-best advanced programming

Difficulty is mistaken for appropriateness.

Corrective exercise dumping

Every assessment finding injects another corrective.

Random variety

Exercise rotation exists primarily to make programs appear different.

Prescription diversity masquerading as program diversity

Different reps do not mean a different exercise program.

Score-as-gate

A gigantic negative score silently behaves like an undocumented exclusion.

Repair chains

Bad selection is repeatedly repaired downstream.

One-dimensional difficulty

Skill, stability, fatigue and loadability are collapsed into one number.

UI contamination

Training logic begins depending on application presentation.

Storage contamination

Generation behavior depends directly on persistence implementation.

Giant functions

Hundreds of unrelated training rules accumulate in one generator.

Test-count worship

Large fuzz counts substitute for human evaluation of actual prescriptions.

45. Definition of Smart

A smart Praxis engine is not one that produces the largest number of different routines.

It is one that can repeatedly make defensible decisions.

Given a person and context, it should:

understand what the training problem is;
identify what today's session needs to accomplish;
identify what this week needs to accomplish;
understand where the person is within their current phase;
exclude what is genuinely inappropriate;
rank legal exercises intelligently;
combine exercises that cooperate;
prescribe an appropriate dose;
retain productive movements;
progress training when earned;
react meaningfully to pain and performance;
advance the person toward the next phase;
explain what it did and why.
46. Foundation Stop Condition

The current foundation phase stops when:

packages/training-engine-v2 exists independently;
package compiles;
domain types are coherent;
phase is first-class;
ExerciseDefinition is normalized;
pain and equipment models are explicit;
hard eligibility contracts exist;
candidate-score contracts exist;
optimizer contracts exist;
session-section dependencies can be represented;
whole-week reasoning can be represented;
prescription is separate from selection;
progression is separate from prescription;
Phase 1 → Phase 2 → Phase 3 can be represented;
longitudinal history can be represented;
DecisionTrace exists;
approximately 20–30 reference exercises validate;
approximately 12 golden personas exist;
focused tests pass;
architecture documents exist.

Do not generate production programs during this phase.

Do not connect V2 to Praxis during this phase.

Do not modify the golden product.

47. Foundation Review Report

At completion report:

Repository state
branch;
SHA;
working-tree status.
Architecture
files created;
module structure;
major domain decisions.
Legacy decisions
REUSE_AS_DATA;
REIMPLEMENT_FROM_PRINCIPLE;
KEEP_AS_TEST_ORACLE;
DO_NOT_PORT;
NEEDS_REVIEW.
Exercise-science uncertainties

List anything requiring human judgment.

Testing
tests executed;
pass/fail counts;
known gaps.
Scope verification

Explicitly confirm:

golden app untouched;
existing engine untouched;
no UI integration;
no auth/storage/billing integration;
no production generator built.
48. Final Principle

Praxis V2 should not optimize for:

How many different workouts can we generate?

It should optimize for:

What is the most coherent next training step for this person?

Every workout should make sense by itself.

Every exercise should make sense within that workout.

Every workout should make sense within the week.

Every week should make sense within the phase.

Every phase should move the athlete toward greater capability and toward their stated training goal.

That is the standard for Training Engine V2.
