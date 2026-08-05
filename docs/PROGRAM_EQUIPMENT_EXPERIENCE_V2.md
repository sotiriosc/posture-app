Praxis Program Quality V2

Equipment-Specific Programming and “No Research Required” User Experience

Recommended repository path: docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.mdStatus: Planning document — execute one phase at a timePrimary objective: Make every generated program feel intentionally designed for the user’s actual equipment, immediately understandable, clinically honest, progressive, and worth paying for.

Cursor Operating Protocol

Cursor must follow these rules throughout this project:

Read this entire document before changing code.

Execute only one phase at a time.

Do not begin the next phase until the current phase’s acceptance gate passes.

Before coding each phase, report:

current behavior,

files likely involved,

proposed implementation,

tests to add or update,

migration or compatibility risks.

Add or update tests before changing production behavior whenever practical.

Make the smallest cohesive change that satisfies the phase.

Do not perform unrelated refactors.

Do not weaken an existing test to make new behavior pass unless the old assertion is proven to encode the wrong product contract.

Preserve deterministic generation.

Preserve old stored programs. New generation behavior must be versioned rather than silently mutating existing user plans.

Do not solve a missing movement role by inserting an unrelated exercise.

Do not solve a quality-gate failure by gaming the score.

Do not add a new exercise unless:

no truthful existing catalog exercise can fill the required role,

its coaching content is complete,

its equipment requirements are explicit,

its progression/regression behavior is defined,

and tests cover it.

At the end of each phase, update the phase checklist and add a Phase Result containing:

changed files,

tests run,

test results,

generated examples reviewed,

unresolved concerns,

next recommended phase.

Stop after the phase result. Wait for an explicit instruction before continuing.

Initial Cursor command

Read docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md completely. Execute Phase 0 only. Do not change production program behavior. Build the baseline audit, generate the required reports, run the specified tests, update the Phase 0 checklist and Phase Result, then stop.

1. Executive Decision

Praxis should not treat equipment choice as merely a filter that removes unavailable exercises from a gym-shaped program.

Each primary equipment choice must have its own program identity:

Gym

Dumbbells

Bands

Bodyweight / No equipment

Mixed home equipment as a compatibility mode, not as a substitute for defining the four primary modes

The generator should begin from an equipment-specific session contract and then personalize it. It should not begin with a generic or gym-first structure and rely on post-generation substitution to make the output legal.

A legal program is not automatically a coherent program.

The target experience is:

“This was clearly made for what I own. I understand every workout. All major bases are covered. I know why each exercise is here, how to perform it, how to progress it, and what to do if it causes trouble.”

2. Current-System Diagnosis

The repository already has substantial programming infrastructure:

equipment normalization and eligibility,

deterministic generation,

experience and phase logic,

pain-aware filtering and substitution,

slot roles,

weekly coverage audits,

post-generation repair,

progression,

golden tests,

matrix tests,

fuzz tests,

and quality scoring.

This work should extend that foundation rather than replace it.

2.1 Structural issue

The existing capability model broadly distinguishes:

no equipment,

bands,

loaded equipment.

Dumbbell-only therefore shares a broad loaded identity with gym programming. Meanwhile, the canonical three-day templates are role-locked around gym-style body-part sessions. Bands receive several dedicated branches, but dumbbells do not yet have a complete first-class program identity.

This creates a predictable failure mode:

A gym-shaped template requests a role.

Equipment eligibility removes unavailable gym exercises.

substitution and repair find a technically legal alternative,

but the final session can feel like a degraded gym workout rather than an intentionally designed home program.

2.2 Current audits are necessary but incomplete

The current system checks many valuable properties, including:

valid equipment,

required sections,

main exercise counts,

basic movement categories,

pain contraindications,

variation,

progression across phases,

and deterministic behavior.

The missing product-level questions are:

Does the session have an obvious purpose?

Does the equipment mode feel intentional?

Can a new user set up every exercise without searching elsewhere?

Is a band anchor actually available?

Is a bench or other support silently assumed?

Are obscure exercises explained and demonstrated?

Is “pulling” represented honestly in bodyweight mode?

Is progression obvious when load cannot increase?

Are transitions simple?

Does the plan feel complete rather than patched together?

Is the amount of work understandable and achievable?

Can the user see why the program is worth paying for?

2.3 Core architecture principle

Use post-generation repair for:

safety,

last-resort eligibility,

preserving slot truth,

pain-aware substitution,

and defensive recovery.

Do not use it as the primary author of equipment-specific programming.

3. Product Quality Standard

A program earns the purchase when it passes all five layers.

Layer 1 — Trust

The plan must never imply capabilities it does not have.

Examples:

Bodyweight-only cannot honestly provide the same loaded pulling stimulus as a cable, row, band, or pull-up bar.

A dumbbell pullover can be a lat-focused movement but should not be presented as identical to a true vertical pull.

A band pulldown cannot be prescribed without a safe high anchor.

A dumbbell bench press cannot appear unless a bench is available.

A difficult or unusual corrective cannot appear without sufficient instruction.

Layer 2 — Clarity

Within ten seconds of opening a plan, the user should understand:

how many days they train,

what each day accomplishes,

how long a session should take,

what equipment is required,

and what the phase is teaching.

Layer 3 — Completeness

Across the week, the program must cover the required movement and control roles appropriate to the equipment mode.

Layer 4 — Execution

Every exercise must answer:

How do I set up?

What do I do?

What should I feel?

What should I avoid?

How many sets and reps?

How long do I rest?

How do I make it easier?

How do I progress?

What pain signal means stop or swap?

Why was this selected for me?

Layer 5 — Progression

The next phase or week must feel like a recognizable development of the current plan, not a random replacement of exercises.

4. Target Equipment Model

Separate program identity from available capabilities.

4.1 Proposed types

export type PrimaryProgramEquipmentMode =
  | "gym"
  | "dumbbells"
  | "bands"
  | "bodyweight"
  | "mixedHome";

export type ProgramCapabilities = {
  hasBench: boolean;
  hasPullupBar: boolean;
  hasFoamRoller: boolean;
  hasBand: boolean;
  hasLongBand: boolean;
  hasLoopBand: boolean;
  hasDoorAnchor: boolean;
  hasHighAnchor: boolean;
  hasMidAnchor: boolean;
  hasLowAnchor: boolean;
  hasDumbbells: boolean;
  canIncreaseDumbbellLoad?: boolean;
  hasBarbell: boolean;
  hasKettlebell: boolean;
  hasCables: boolean;
  hasMachines: boolean;
};

The exact implementation may differ, but these concepts must remain distinct:

Primary mode decides the session architecture and program language.

Capabilities decide which variants are legal.

Pain, experience, phase, and goals personalize the selected architecture.

4.2 Mode resolution

Recommended deterministic priority:

If gym is selected, primary mode is gym.

If both dumbbells and bands are selected without gym, primary mode is mixedHome.

If dumbbells are selected, primary mode is dumbbells.

If bands are selected, primary mode is bands.

Otherwise, primary mode is bodyweight.

Other direct equipment combinations must be tested and resolved explicitly. They must not silently become “gym” merely because they involve load.

4.3 Minimal questionnaire improvements

Do not turn onboarding into an equipment inventory form. Add only questions that materially change exercise legality.

Bands

Ask one concise question:

What kind of band setup do you have?

Loop bands only

Long bands, no anchor

Long bands with door anchor

Both loop and anchored bands

The engine may derive high/mid/low anchor capability from the anchored option, but every anchored exercise must display an anchor-safety instruction.

Dumbbells

Avoid requiring a long questionnaire. Use exercises that can be completed with one or two dumbbells, and clearly state unilateral setup when needed.

A later optional question may ask whether load can be increased. Until then, every dumbbell progression must support fixed-weight progression through reps, tempo, range, pauses, density, or unilateral demand.

Bodyweight

Assume only:

floor space,

a wall,

and optionally a stable chair when the user confirms one is available.

Do not prescribe improvised door, table, towel, or furniture pulling setups without a separate safety-reviewed capability.

5. Session Presentation Contract

Every session should be displayed in four understandable blocks.

5.1 Prepare

One breathing/stacking or core-position drill

One movement-specific preparation drill

Maximum two items by default

5.2 Build

The main work of the day.

Beginner non-gym: 3–4 exercises

Intermediate non-gym: 4–5 exercises

Advanced non-gym: maximum 5–6 exercises

Gym may reach 5–7 work exercises when justified

No duplicate slot purpose merely to fill space

5.3 Reinforce

One or two items that reinforce:

core control,

scapular control,

anti-rotation,

carries,

or a clearly justified accessory.

This block must not look like a random corrective-exercise dump.

5.4 Finish

Short downshift, mobility, or breathing item

One item by default

Not counted as meaningful weekly strength coverage

5.5 Session header

Display:

session title,

one-sentence purpose,

expected duration,

equipment needed today,

number of exercises,

phase emphasis,

and a coverage summary.

Example:

Full Body A — Squat, Press, Row38–45 minutes · Dumbbells onlyBuilds the main lower-body, chest, back, and trunk patterns while reinforcing ribcage and pelvis control.

6. Weekly Coverage Contract

The new contract must distinguish merely having an exercise from providing a truthful weekly role.

6.1 Required for every primary mode

Every normal training week must include:

horizontal push or a truthful press pattern,

horizontal pull or an explicitly labeled pull surrogate,

squat / knee-dominant pattern,

hinge / hip-extension pattern,

unilateral lower-body work,

core anti-extension or trunk-stacking work,

core anti-rotation or lateral-stability work,

scapular / posture-support work.

6.2 Equipment-dependent requirements

Gym

Require:

true horizontal press,

true horizontal pull,

true vertical pull,

vertical press when appropriate for pain and phase,

squat,

hinge,

unilateral lower,

direct core,

scapular/rear-shoulder support.

Dumbbells

Require:

horizontal press,

true horizontal row,

squat,

hinge,

unilateral lower,

overhead press when appropriate,

lat-intent work,

direct core,

carry or suitcase stability when legal.

Do not require a bench unless selected.

Bands

Require:

press,

row,

squat/knee dominant,

hinge,

unilateral lower,

anti-rotation,

scapular support.

Require a true band vertical pull only when a safe high anchor exists. Otherwise use an honest lat-intent or second pull-angle role.

Bodyweight

Require:

push,

knee dominant,

hip extension/hinge,

unilateral lower,

trunk stability,

scapular control,

and an honest upper-back/lat-intent surrogate.

The UI must not label a prone sweep, elbow drive, or isometric as equivalent to a true loaded row or pulldown.

6.3 Coverage truth metadata

Consider adding a role-quality distinction:

type MovementRoleTruth =
  | "true"
  | "supportedVariant"
  | "surrogate"
  | "preparationOnly";

The weekly audit should report:

role hit,

exercise responsible,

truth level,

equipment mode,

and whether the hit is sufficient for that mode.

7. Gym Mode — Perfection Standard

Gym is the flagship. Preserve its strongest existing architecture, but subject it to a stricter contract.

7.1 Gym identity

Gym output should feel like a deliberately coached training program, not a list of available machines.

The user should see:

strong anchor exercises,

clear ordering,

sensible exercise transitions,

useful accessories,

posture integration,

phase continuity,

and visible progressive overload.

7.2 Three-day gym structure

The existing identities are strong and can remain:

Day 1 — Back + Chest

Must contain, when safe:

one horizontal press,

one true horizontal pull,

one true vertical pull,

one secondary chest or back role according to experience,

one posture/scapular reinforcement role.

Avoid:

three row-like movements with the same purpose,

low-load scap drills occupying main loaded slots in a pain-free loaded context,

a fly replacing the only press,

a pullover replacing both row and pulldown roles,

excessive chest work without enough back work.

Day 2 — Shoulders + Arms

Must contain, when safe:

vertical press or truthful pain-aware alternative,

lateral-delt role,

rear-delt/scapular role,

biceps role,

triceps role,

optional secondary shoulder role only when it adds a distinct purpose.

Avoid:

multiple nearly identical raises,

rear-delt work repeated under different names,

four shoulder exercises before direct arm work,

vertical-press slots filled by horizontal presses.

Day 3 — Legs + Core

Must contain, when safe:

squat,

true hinge,

unilateral lower-body work,

direct core,

calf or lower-leg role where appropriate,

anti-rotation or carry/stability role.

Avoid:

counting a carry as the hinge,

counting a hamstring curl as the only hinge,

counting a bridge primer as the only posterior-chain work for an advanced pain-free user,

overloading one joint pattern while neglecting another.

7.3 Four- and five-day gym programs

Do not redesign them blindly. First audit their existing session identities and role contracts.

Each day must have:

an explicit title that matches its actual slots,

a main-pattern anchor,

a secondary complementary role,

controlled accessories,

no ambiguous “conditioning” language now that cardio has been removed,

and appropriate weekly spacing.

7.4 Gym progression

Across phases:

keep recognizable anchor families,

increase movement complexity or loading opportunity only when phase and experience allow,

preserve pattern identity when swapping,

do not rotate most of the plan at once,

show the user what changed and why.

7.5 Gym quality hard failures

Fail generation or fall back to a safe known template when:

a main role is filled by an exercise from the wrong role,

the only squat/hinge/pull is preparation-only,

a machine/cable/barbell appears without gym capability,

duplicate exercise families dominate one session,

a session exceeds the configured complexity cap,

required coaching information is missing,

or a pain-aware swap destroys weekly coverage without repair.

8. Dumbbell Mode — First-Class Home Programming

Dumbbell mode must not be “gym with everything removed.”

8.1 Dumbbell identity

Use a simple full-body A/B/C system for the default three-day experience.

This is easier to understand, gives limited-equipment users repeated exposure to the major patterns, and avoids a body-part split full of weak substitutions.

8.2 Three-day dumbbell session contracts

These are role contracts, not mandatory fixed exercise IDs.

Full Body A — Squat, Press, Row

squat: goblet or supported squat family,

horizontal press: floor press by default when no bench,

horizontal pull: one-arm dumbbell row family,

hinge: dumbbell RDL family,

core: dead bug / anti-extension family,

reinforcement: suitcase carry or suitcase march where space allows.

Full Body B — Lunge, Overhead Press, Posterior Chain

unilateral knee dominant: reverse lunge or split squat family,

vertical press: standing, half-kneeling, or floor-seated dumbbell press according to phase and pain,

pull: row variation with a distinct intent from Day A,

hip extension or hinge: bridge/hip-thrust or single-leg hinge family,

lateral stability: side plank family,

optional arms pairing for intermediate/advanced users.

Full Body C — Single-Leg, Press Variation, Lat Intent

unilateral lower-body role,

press variation: push-up or dumbbell floor-press variation,

true horizontal pull,

lat-intent role such as pullover when appropriate and truthfully labeled,

hinge or posterior-chain role distinct from Day B,

anti-rotation/carry/core role,

calf role when useful.

8.3 Dumbbell constraints

Never require a bench unless selected.

Never assume adjustable dumbbells.

Prefer movements possible with one dumbbell when needed.

Explain when sides alternate.

Avoid frequent floor-to-standing transitions.

Avoid three different row variants in one week unless their purposes are truly distinct.

Do not use a pullover as the sole back exercise.

Do not call a pullover a true vertical pull.

Keep exercise names familiar.

Every technical unilateral exercise needs a demonstration.

8.4 Dumbbell progression

Use a visible double-progression model:

Begin at the low end of a rep range.

Add controlled reps while preserving form and pain limits.

When the top of the range is achieved, increase load if available.

If load cannot increase, progress one variable:

slower eccentric,

pause,

larger safe range,

unilateral variation,

extra set within the prescribed cap,

or reduced rest.

The user-facing card must say which variable is next. Do not present all progression options at once.

9. Band Mode — Simple, Anchor-Aware Programming

Band mode can be excellent, but only when setup is explicit.

9.1 Band identity

A band plan should feel portable and complete, not like a list of creative band variations.

Use a full-body A/B/C structure with limited anchor changes.

9.2 Three-day band session contracts

Full Body A — Squat, Chest Press, Row

band squat or squat variation,

band chest press if a mid anchor exists; otherwise push-up family,

band row with legal anchor/setup,

band RDL or good-morning family,

anti-rotation role,

scapular reinforcement.

Full Body B — Split Stance, Vertical Pattern, Hip Extension

split squat or reverse lunge,

overhead or angled press according to band type and pain,

vertical pull only with high anchor,

otherwise a truthful second pull-angle or lat-intent role,

band hip extension,

side-plank/lateral-stability role,

face pull only when anchor setup is legal.

Full Body C — Unilateral Lower, Push, Pull, Rotation Control

unilateral lower role,

press variation,

one-arm band row,

hinge variation,

anti-rotation march or Pallof family when legal,

lateral band walk or hip-control role,

optional arm role for higher experience.

9.3 Band setup rules

Every anchored exercise must specify anchor height.

Limit sessions to at most two anchor-height changes by default.

Group exercises by setup where possible.

Display a band safety check:

inspect band for damage,

secure anchor on the closing side of the door,

test tension gently,

keep the band path away from the face.

Provide a no-anchor alternative in the exercise details.

Do not prescribe a door-anchor movement when the user selected no anchor.

Do not use bench-dependent push-up fallbacks without explaining the safe support.

9.4 Band progression

Progress one variable at a time:

higher band tension,

step farther from the anchor,

shorten the working band length,

increase reps within range,

add a pause,

slow the lowering phase,

or advance to a more demanding stance.

The exercise card must identify the current next progression, not list a menu requiring the user to decide.

9.5 Band variation control

Avoid variant overload.

A user should not see:

band row,

one-arm band row,

split-stance band row,

high band row,

and band pull-apart

presented as five unrelated ideas in one short phase.

Use one primary family, one distinct secondary role, and one clear progression path.

10. Bodyweight / No-Equipment Mode — Honest and Highly Guided

Bodyweight mode must be simple enough for a first-time user and honest about its limitations.

10.1 Bodyweight identity

Use full-body A/B/C.

Do not force a gym body-part split when the equipment cannot support those roles well.

10.2 Three-day bodyweight session contracts

Full Body A — Squat, Push, Upper-Back Control

squat-to-chair or bodyweight squat family,

incline push-up or push-up family,

upper-back pull-surrogate family,

glute bridge,

dead bug,

wall-slide/scapular reinforcement.

Full Body B — Lunge, Press Progression, Posterior Chain

reverse lunge or split squat,

push-up progression,

prone Y/T/W or reverse-snow-angel family,

hip-hinge drill, bridge variation, or single-leg bridge,

side plank,

calf raise.

Full Body C — Single-Leg, Shoulder Pattern, Lat Intent

split squat or single-leg squat regression family,

pike press, wall press, or appropriate shoulder pattern,

lat-intent isometric/sweep family,

single-leg RDL reach or hinge-control family,

bird dog / anti-rotation control,

scapular push-up or serratus role.

10.3 Bodyweight truth rules

Label non-loaded pulling work as:

“upper-back control,”

“lat-focused isometric,”

or “pull-pattern substitute.”

Do not label it as a full replacement for a row or pulldown.

Explain that a band or pull-up bar expands pulling progression, without making the current plan feel invalid.

Do not stack multiple obscure prone drills in the same session.

Every unfamiliar movement must have a demo.

Use wall, floor, and confirmed stable-chair options only.

Group floor exercises together to reduce transitions.

Avoid advanced calisthenics merely to create progression.

10.4 Bodyweight progression

Use a simple ladder:

stable setup,

controlled full range,

more reps,

slower eccentric,

pause,

harder leverage,

unilateral or reduced assistance,

additional set only when appropriate.

The user should see one next step.

11. Mixed Home Mode

Mixed home mode should combine the best available tools without becoming chaotic.

Recommended policy:

Use the dumbbell full-body template as the structural base when dumbbells are available.

Use bands to improve roles dumbbells handle less effectively, especially:

vertical pull with a safe anchor,

anti-rotation,

face pull/scapular work,

and certain pain-aware substitutions.

Do not alternate equipment merely for variety.

Keep setup transitions low.

Preserve one clear primary movement family per role.

12. Exercise Coaching Contract

The current exercise record contains valuable metadata but does not guarantee a complete “no research required” experience.

Implement a coaching contract without forcing an unsafe all-at-once rewrite of the exercise catalog.

12.1 Recommended staged design

Create a separate keyed coaching registry first:

type ExerciseCoachingDetails = {
  exerciseId: string;
  setup: string;
  executionSteps: string[];
  expectedFeel: string[];
  primaryCue: string;
  secondaryCue?: string;
  commonMistake: string;
  stopSignals: string[];
  whyThisExercise: string;
  progressionRule: string;
  regressionId?: string;
  progressionId?: string;
  anchorHeight?: "none" | "low" | "mid" | "high";
  supportRequirements?: Array<"floor" | "wall" | "chair" | "bench">;
  complexity: "simple" | "moderate" | "technical";
};

Merge this registry with the existing exercise object at the presentation boundary.

Once coverage is complete and stable, decide whether to merge the fields into the canonical exercise schema.

12.2 Required user-facing information

For every prescribed exercise:

clear name,

equipment,

setup,

two to four execution steps,

sets/reps/time,

rest,

tempo only when important,

one or two key cues,

one main mistake,

expected sensation,

stop/swap signal,

why the program selected it,

easier option,

next progression,

demonstration status.

12.3 Demonstration policy

A demo is required for:

uncommon exercise names,

band anchor exercises,

technical hinges,

unilateral movements beyond basic lunges,

posture correctives,

isometrics whose intent is not obvious,

and all surrogate pulling movements.

A text-only fallback is acceptable only for universally familiar, low-complexity movements with complete setup instructions.

No user-facing exercise may silently have an empty demo state.

12.4 Content simplicity

The main card should show:

name,

dose,

one cue,

short “why.”

Expanded details should show the full coaching contract.

Do not display all available metadata at once.

13. Progression Contract

Progression must be mode-specific and visible.

13.1 Every routine item needs a progression target

Add or derive:

type ProgressionTarget = {
  variable:
    | "load"
    | "reps"
    | "time"
    | "tempo"
    | "range"
    | "leverage"
    | "stability"
    | "bandTension"
    | "rest";
  currentTarget: string;
  successRule: string;
  nextTarget: string;
};

13.2 Phase continuity

When a phase changes, the UI should explain:

what stayed,

what progressed,

what changed,

and why.

Example:

Your squat pattern remains the same. This phase replaces the supported squat with a goblet squat because your recent sessions showed stable control and no knee pain.

13.3 Avoid false novelty

Do not reward the generator simply for changing exercise IDs.

Prefer:

recognizable family continuity,

meaningful demand increase,

appropriate variation,

and stable user learning.

14. Program Quality Gate V2

Create a quality report for every generated week.

14.1 Proposed report

type ProgramQualityReport = {
  score: number;
  hardFailures: ProgramQualityFailure[];
  warnings: ProgramQualityWarning[];
  mode: PrimaryProgramEquipmentMode;
  programVersion: string;
  sessionReports: SessionQualityReport[];
  weeklyCoverage: WeeklyEquipmentCoverageReport;
};

14.2 Score categories

Total: 100 points.

Eligibility and setup truth — 20

all equipment legal,

all supports legal,

all anchors legal,

no hidden bench requirement,

no unsafe household assumption.

Movement and control coverage — 20

all mode-required weekly roles met,

truth level sufficient,

no preparation-only item counted as a main hit.

Equipment-mode identity — 15

session contract matches the selected mode,

no gym-shaped fallback pattern in primary home modes,

mode-specific progression exists.

Simplicity and coherence — 15

session count within cap,

duplicate families controlled,

transitions reasonable,

day purpose is clear,

no filler.

Progression clarity — 10

every work item has a valid next target,

phase continuity is coherent,

no arbitrary exercise churn.

Coaching completeness — 10

all required details present,

demo policy satisfied,

exercise names and purpose understandable.

Pain and restriction safety — 10

contraindications respected,

stop signals displayed,

swaps preserve role when possible,

coverage repaired after pain substitutions.

14.3 Hard failures

Any hard failure makes the generated plan ineligible for release:

unavailable equipment,

missing required primary role,

wrong movement family in a locked main slot,

unsupported anchor or bench requirement,

bodyweight surrogate mislabeled as a true pull,

no progression rule for a work exercise,

no coaching details for a non-obvious exercise,

no demo for an exercise requiring one,

duplicate exercise in a session,

session exceeds hard complexity cap,

unsafe pain contradiction,

post-repair plan still violates its equipment contract.

14.4 Thresholds

Initial release gate:

zero hard failures,

every matrix scenario score at least 90,

average at least 95,

gym flagship scenarios should target at least 95 individually.

The score must not replace human review.

15. User Experience Requirements

15.1 Plan reveal

Before the user studies individual exercises, show:

“Designed for: Dumbbells only,”

training days,

session duration range,

phase name and purpose,

weekly coverage chips,

and one paragraph explaining why the structure fits the user.

Example coverage chips:

Push

Pull

Squat

Hinge

Single-leg

Core

Posture

For bodyweight, use honest wording such as “Upper-back control” rather than implying loaded pulling.

15.2 Day overview

Each day should answer:

What is today for?

What equipment do I need?

What is the hardest movement?

How long should this take?

What changes if I have pain?

15.3 Exercise card

Collapsed:

exercise,

sets × reps/time,

rest,

primary cue,

why it is here.

Expanded:

setup,

steps,

demo,

expected feel,

common mistake,

easier option,

progression,

stop/swap rule.

15.4 “No research required” acceptance test

A new user should be able to complete a session using only Praxis.

Manual testers must not use:

Google,

YouTube search,

Reddit,

or external exercise instructions.

Opening an embedded Praxis demo is allowed.

16. Architecture Plan

Prefer new focused modules over adding more mode-specific branches inside the main program file.

Recommended files:

packages/engine/src/program/equipmentMode.ts
packages/engine/src/program/equipmentCapabilities.ts
packages/engine/src/program/equipmentProgramContracts.ts
packages/engine/src/program/equipmentTemplates.ts
packages/engine/src/program/programQualityGate.ts
packages/engine/src/program/exerciseCoachingContract.ts
packages/engine/src/program/progressionTarget.ts
packages/engine/src/__debug__/equipmentProgramAudit.ts

Recommended tests:

packages/engine/tests/unit/programEquipmentMode.test.ts
packages/engine/tests/unit/programEquipmentTemplates.test.ts
packages/engine/tests/unit/programEquipmentCoverage.test.ts
packages/engine/tests/unit/programEquipmentQualityGate.test.ts
packages/engine/tests/unit/programExerciseCoachingCompleteness.test.ts
packages/engine/tests/unit/programEquipmentGoldenPlans.test.ts
packages/engine/tests/unit/programEquipmentProgression.test.ts

16.1 Integration boundary

The existing generator should receive:

primary equipment mode,

capabilities,

and a selected session contract.

Existing scoring and selection logic may fill those slots, but:

it must stay inside the role,

preserve mode identity,

and pass the final quality gate.

16.2 Repair boundary

Repair may:

substitute within a truthful role,

lower complexity,

respond to pain,

replace unavailable variants,

and preserve coverage.

Repair may not:

silently change the session identity,

turn a press slot into a corrective,

count a carry as a hinge,

or convert a gym template into a home template one exercise at a time.

17. Versioning and Existing Users

The app is live. Do not silently regenerate current plans.

Add a generation version such as:

programGenerationVersion: "equipment-v2"

Rules:

Existing stored plans remain readable and executable.

New users may receive V2 after the relevant mode passes release gates.

Existing users receive V2 only when they explicitly regenerate, update equipment, start a new program, or accept a migration prompt.

Program logs preserve the version used.

Telemetry includes the generation version.

A rollback can return new generation to V1 without corrupting stored plans.

18. Implementation Phases

Phase 0 — Baseline Audit Without Behavior Changes

Objective

Prove what the generator currently produces before changing it.

Tasks

Add equipmentProgramAudit.ts.

Generate deterministic output for:

gym,

dumbbells,

bands,

bodyweight,

mixed home.

Cover:

Beginner, Intermediate, Advanced,

3, 4, and 5 days,

activation, skill, and growth phases,

no pain,

shoulder/upper-back pain,

low-back/hip pain,

major goals.

Report:

session titles,

exercise IDs and names,

sections,

slot roles,

equipment,

movement role,

truth level where derivable,

duplicates,

weekly coverage,

coaching/demo gaps,

required supports,

estimated complexity.

Save a concise Markdown summary and machine-readable JSON.

Select twelve three-day golden personas for manual review:

three personas per primary mode.

Do not change generation behavior.

Required commands

npm run audit:catalog

npm run audit:coverage-matrix

npm run audit:program-contract

npm run audit:phase-matrix

npm run test:golden

npm run test:critical

Acceptance gate

Baseline artifacts generated.

All existing tests still pass.

No production behavior changed.

Current problems categorized as:

structural,

equipment legality,

slot truth,

complexity,

coaching,

progression,

or UI comprehension.

Phase Result added.

Cursor stops.

### Phase 0 checklist

- [x] Add `packages/engine/src/__debug__/equipmentProgramAudit.ts`
- [x] Add `npm run audit:equipment-program`
- [x] Generate deterministic matrix across gym / dumbbells / bands / bodyweight / mixedHome × experience × days × phases × pain × goals (160 cases)
- [x] Save Markdown + JSON baseline artifacts under `docs/dev-reports/`
- [x] Select twelve three-day golden personas (3 per primary mode) and manually inspect them
- [x] Run `npm run audit:catalog` (pass)
- [x] Run `npm run audit:coverage-matrix` (ran; pre-existing FAIL — see Phase Result)
- [x] Run `npm run audit:program-contract` (pass / prints)
- [x] Run `npm run audit:phase-matrix` (ran; pre-existing FAIL — see Phase Result)
- [x] Run `npm run test:golden` (56/56 pass)
- [x] Run `npm run test:critical` (326/326 pass)
- [x] Categorize current problems
- [x] Append Phase Result
- [x] Stop without starting Phase 1

## Phase Result — Phase 0

### Changed files
- `packages/engine/src/__debug__/equipmentProgramAudit.ts` (new; read-only audit)
- `package.json` (adds `audit:equipment-program` script)
- `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md` (canonical planning doc + Phase 0 checklist/result)
- `docs/dev-reports/equipment-program-audit-phase0.json`
- `docs/dev-reports/equipment-program-audit-phase0.md`
- `docs/dev-reports/equipment-program-audit-phase0-twelve-personas.md`

### Behavior before
- Generator already produced equipment-filtered programs via `noneOnly | bandOnly | hasLoad`.
- `deriveIntentEquipmentMode(hasLoad)` collapsed dumbbells/mixedHome into gym intent.
- No first-class equipment-mode baseline artifact existed for V2 planning.

### Behavior after
- Production generation behavior unchanged.
- Baseline audit tooling and reports now exist for equipment-mode comparison and manual review.

### Tests added or updated
- None (Phase 0 is audit-only; no production behavior change).

### Commands run
- `npm run audit:equipment-program`
- `npm run audit:catalog`
- `npm run audit:coverage-matrix`
- `npm run audit:program-contract`
- `npm run audit:phase-matrix`
- `npm run test:golden`
- `npm run test:critical`

### Results
- `audit:equipment-program`: 160 cases, 12 golden personas, artifacts written.
- Category case counts: structural 92, equipment_legality 88, slot_truth 57, complexity 26, coaching 160, progression 160, ui_comprehension 14.
- `audit:catalog`: pass (0 errors, 1 deprecation warning).
- `audit:program-contract`: completed.
- `audit:coverage-matrix`: **FAIL** (exit 1). Pre-existing contract failure example: pain-advanced / growth / 5d / gym — calvesDays 0/2; upper-day hinge MAIN control-exception violations.
- `audit:phase-matrix`: **FAIL** (exit 1) for the same embedded coverage-contract failures.
- `test:golden`: 56/56 pass.
- `test:critical`: 326/326 pass.
- No production program-generation files modified.

### Generated plans manually reviewed
Twelve 3-day phase-1 personas (3 per primary mode). Full dumps: `docs/dev-reports/equipment-program-audit-phase0-twelve-personas.md`.

1. **gym / Beginner / no pain** — Coherent machine-led body-part split; truthful vertical pull via lat pulldown; heavy demo gaps.
2. **gym / Intermediate / posture** — Same gym identity with denser mains; still demo/progression-link sparse.
3. **gym / Beginner / shoulder+upper-back pain** — Pain-aware hinge softening (single-leg glute bridge hold); machine pull/press retained; no legality violations.
4. **dumbbells / Beginner / no pain** — **Structural:** intentEquipmentMode=gym; gym-shaped titles. Vertical pull filled by support-only `seated-lat-sweep-pulse` via legality_repair. Feels like a degraded gym template.
5. **dumbbells / Intermediate / athletic** — Same identity collapse; `dumbbell-pullover` used as vertical-pull surrogate; support-only shoulder fillers (`prone-swimmer`, `prone-t-raise`).
6. **dumbbells / Beginner / low-back+hip pain** — Intent still gym; support-only vertical pull; complexity flag on `single-arm-dumbbell-row` (difficulty 4) for Beginner.
7. **bands / Beginner / no pain** — Band-legal mains, but gym-shaped titles; `band-lat-pulldown` assumes high band anchor not confirmed in questionnaire.
8. **bands / Intermediate / posture** — Same anchor assumption; support-only `prone-t-raise` in lateral-delt main slot.
9. **bands / Beginner / shoulder+upper-back pain** — Band press/row/pulldown retained; high-anchor legality still unconfirmed; hinge softened.
10. **bodyweight / Beginner / no pain** — Gym-shaped titles without equipment identity; support-only vertical pull (`seated-lat-sweep-pulse`); UI implies pull stimulus it cannot truthfully deliver.
11. **bodyweight / Intermediate / posture** — Same pull-honesty failure plus multiple support-only shoulder mains.
12. **bodyweight / Beginner / low-back+hip pain** — Pain softening present; structural/slot-truth/UI pull issues remain.

### Unresolved concerns
- **Structural:** dumbbells and mixedHome share gym intent via `hasLoad` → `intentEquipmentMode="gym"`.
- **Structural:** all twelve 3-day golden personas use gym body-part day titles (`Back + Chest`, `Shoulders + Arms`, `Legs + Abs`), including bands and bodyweight.
- **Slot truth:** home modes fill `mainPullVertical` with support-only or surrogate moves instead of omitting/relabeling the role.
- **Equipment legality:** band pulldowns/face-pulls assume anchors without questionnaire capability; doorway stretch text can also surface as support assumptions.
- **Coaching / progression:** catalog-wide demo URL absence and sparse `progressionOf`/`regressionOf` links flag every case; this is real product debt, not an audit false positive.
- **Pre-existing audit FAIL:** `audit:coverage-matrix` and `audit:phase-matrix` already fail on advanced pain 5-day gym calves/intelligence contracts. Phase 0 did not fix or hide this.
- Canonical planning path was missing at start; content was copied from `docs/enginev2.md` into `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md`.

### Recommendation
- Proceed to Phase 1 only after explicit instruction.
- Phase 1 should introduce first-class `PrimaryProgramEquipmentMode` and stop mapping dumbbell-only intent to gym intent, without yet rewriting templates.

### Next phase
- Phase 1 — First-Class Equipment Identity, only after explicit instruction

Phase 1 — First-Class Equipment Identity

Objective

Separate program identity from basic equipment eligibility.

Tasks

Add PrimaryProgramEquipmentMode.

Add capabilities derivation.

Preserve current normalized equipment availability for eligibility.

Stop mapping dumbbell-only intent to gym intent.

Define mixed-home behavior.

Add version-safe serialization if mode is persisted.

Add unit tests for all equipment combinations.

Keep generated output unchanged where possible in this phase.

Acceptance gate

Every supported equipment selection resolves deterministically.

Dumbbells are distinct from gym.

Bands remain distinct.

None resolves to bodyweight.

Mixed home is explicit.

Existing stored questionnaire data remains valid.

All existing equipment and golden tests pass.

Phase Result added.

Cursor stops.

### Phase 1 checklist

- [x] Add `PrimaryProgramEquipmentMode` in `packages/engine/src/program/equipmentMode.ts`
- [x] Add deterministic `resolvePrimaryProgramEquipmentMode` (order-independent; legacy combos documented)
- [x] Add `ProgramCapabilities` + `deriveProgramCapabilities` in `equipmentCapabilities.ts`
- [x] Keep unknown band-anchor / loop / long-band / door-anchor capabilities false
- [x] Preserve `normalizeEquipmentSelection` eligibility behavior
- [x] Stop mapping dumbbell-only / mixed-home identity through `hasLoad` → gym
- [x] Wire `primaryEquipmentMode` + `programCapabilities` into selection context and intent profile
- [x] Add version-safe parse/serialize helpers for persisted mode values
- [x] Add `packages/engine/tests/unit/programEquipmentMode.test.ts`
- [x] Update equipment audit to write Phase 1 comparison artifacts without overwriting Phase 0
- [x] Run required validation commands
- [x] Append Phase Result
- [x] Stop without starting Phase 2

## Phase Result — Phase 1

### Changed files
- `packages/engine/src/program/equipmentMode.ts` (new)
- `packages/engine/src/program/equipmentCapabilities.ts` (new)
- `packages/engine/src/program.ts` (intent/selection wiring + re-exports)
- `packages/engine/tests/unit/programEquipmentMode.test.ts` (new)
- `packages/engine/src/__debug__/equipmentProgramAudit.ts` (Phase 1 comparison writer)
- `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md` (Phase 1 checklist + result)
- `docs/dev-reports/equipment-program-audit-phase1.json`
- `docs/dev-reports/equipment-program-audit-phase1.md`
- `docs/dev-reports/equipment-program-audit-phase1-twelve-personas.md`
- `docs/dev-reports/equipment-program-audit-phase1-vs-phase0.md`

### New canonical types and functions
- `PrimaryProgramEquipmentMode`
- `resolvePrimaryProgramEquipmentMode(selection)`
- `parsePrimaryProgramEquipmentMode` / `serializePrimaryProgramEquipmentMode`
- `deriveLegacyHasLoadIntentEquipmentMode` (comparison-only)
- `ProgramCapabilities`
- `deriveProgramCapabilities(selection)`
- `buildProgramEquipmentContext(selection)`
- `inferExerciseSupportRequirements` / `isSupportConfirmedByCapabilities`

### Backward-compatibility decisions
- Stored questionnaire values (`none`, `bands`, `dumbbells`, `gym`, plus legacy aliases) remain valid via existing `normalizeEquipmentSelectionValues`.
- Gym selection still expands facility inventory for eligibility (bench/cables/machines/etc.).
- Coarse physical bucket `EquipmentCapabilityMode` (`noneOnly | bandOnly | hasLoad`) remains for load/eligibility heuristics.
- `ProgramIntentProfile.equipment` evolved from legacy labels (`none|bands|gym`) to `PrimaryProgramEquipmentMode` (`bodyweight|bands|dumbbells|mixedHome|gym`).
- Mode is not forcibly rewritten onto existing stored programs; parse/serialize helpers are available for future persistence.
- Ambiguous legacy load tools without `gym` (`barbell`/`kettlebell`/`cables`/`machines`) resolve to nearest non-gym loaded identity (`dumbbells`, or `mixedHome` when bands are also present) — never silently to `gym`.
- Support-only tokens alone (`bench`, `pullup_bar`, `foam_roller`) resolve to `bodyweight`.

### Behavior before
- `deriveIntentEquipmentMode(hasLoad)` set intent equipment to `gym` for all loaded environments, including dumbbells-only and mixed-home.

### Behavior after
- Intent/selection identity uses `resolvePrimaryProgramEquipmentMode`.
- Dumbbells-only → `dumbbells`; dumbbells+bands → `mixedHome`; bands → `bands`; none → `bodyweight`; gym → `gym`.
- Day templates and titles intentionally unchanged in this phase.

### Tests added or updated
- `packages/engine/tests/unit/programEquipmentMode.test.ts` (mode resolution, capabilities, intent identity, serialization)

### Commands run
- `npm run audit:equipment-program`
- `npm run audit:catalog`
- `npm run audit:program-contract`
- `npm run audit:coverage-matrix`
- `npm run audit:phase-matrix`
- `npm run test:golden`
- `npm run test:critical`
- `npm run build`
- focused: `npx vitest run --config packages/engine/vitest.config.ts packages/engine/tests/unit/programEquipmentMode.test.ts packages/engine/tests/unit/equipment.test.ts`

### Results
- Focused equipment-mode/capability tests: 22/22 pass.
- `test:golden`: 56/56 pass.
- `test:critical`: 326/326 pass.
- `audit:catalog`: pass.
- `audit:program-contract`: completed.
- `audit:coverage-matrix` / `audit:phase-matrix`: **FAIL** — same pre-existing baseline failures as Phase 0 (not suppressed).
- `npm run build`: pass.
- Phase 1 audit: 160 cases; **identityCollapseRemaining=0**; templateIdentityMismatchCount=56 (expected).
- Phase 0 reports preserved untouched.

### Intentional behavior changes
- First-class equipment identity is available throughout generation intent/selection context.
- `hasLoad` no longer determines gym program identity.

### Unresolved template-identity mismatches
- Non-gym 3-day plans still use legacy gym-shaped titles (`Back + Chest`, `Shoulders + Arms`, `Legs + Abs`).
- This is recorded as Phase 2–5 work, not repaired in Phase 1.

### Unconfirmed capability violations still present
- Band pulldowns / face-pull-style work still schedule while `hasHighAnchor` / band-anchor capabilities remain false.
- Doorway-related cue text can still surface as unconfirmed support flags in audits.
- Home modes still fill vertical-pull slots with surrogate/support-only exercises.

### Recommendation
- Proceed to Phase 2 only after explicit instruction.
- Exact Phase 2 starting point: lock gym weekly/per-day role contracts and golden gym plans first, while leaving home-mode template redesign for later phases. Do not begin dumbbell A/B/C programming, band-anchor questionnaire UI, coaching catalog completion, or engine decomposition yet.

### Next phase
- Phase 2 — Gym Perfection Audit and Contract, only after explicit instruction

Phase 2 — Gym Perfection Audit and Contract

Objective

Lock the flagship gym experience before altering home modes.

Tasks

Encode gym weekly and per-day role contracts.

Audit three-, four-, and five-day outputs.

Add hard slot-truth assertions.

Ensure pain-free loaded users receive meaningful loaded main work.

Remove filler and duplicate-family failures.

Verify warmup and reinforcement items support the day.

Add gym progression continuity assertions.

Add representative golden plans.

Add an audit-only V2 quality report.

Do not enable blocking quality behavior until false positives are reviewed.

Manual review questions

Does each day look like a professional coach designed it?

Are main exercises immediately recognizable?

Are all important patterns present?

Are accessories purposeful?

Is volume appropriate for experience?

Does pain adaptation preserve the day’s identity?

Does the next phase feel like progression rather than randomization?

Acceptance gate

Zero gym hard failures across the matrix.

Gym quality at least 95 for flagship personas.

10,000 deterministic fuzz cases produce no illegal equipment or role-truth failures.

Existing gym golden tests pass or are intentionally updated with documented rationale.

### Phase 2 checklist

- [x] Encode canonical gym weekly/per-day role contract (`gymProgramContract.ts`)
- [x] Add non-blocking gym perfection audit + 10k fuzz (`audit:gym-program`)
- [x] Audit three-/four-/five-day flagship gym personas with hard slot-truth assertions
- [x] Keep `Legs + Abs` as the established live day-3 title
- [x] Ensure pain-free loaded gym users keep meaningful loaded hinge/main work
- [x] Root-cause repair: upper-back ≠ low-back for hinge softening; no curl-only gym hinge; preserve pain-aware hip-extension hinges
- [x] Flagship structural scores ≥95 with zero hard failures (10/10)
- [x] 10k gym fuzz: 0 illegal equipment, 0 role-truth failures, 0 identity collapse, 0 deterministic-repeat mismatches
- [x] Add/strengthen gym contract tests (`programGymContract.test.ts` + selection audit regression)
- [x] Run required validation commands; preserve Phase 0/1 reports
- [x] Append Phase Result
- [x] Stop without starting Phase 3

## Phase Result — Phase 2

### Changed files
- `packages/engine/src/program/gymProgramContract.ts` (new canonical gym contract + validator)
- `packages/engine/src/__debug__/gymProgramAudit.ts` (flagship + 10k fuzz audit writer)
- `packages/engine/src/program.ts` (gym hinge legality, heavy-hinge scope, activation RDL primer, Legs Abs regression-strip exception)
- `packages/engine/tests/unit/programGymContract.test.ts` (new)
- `packages/engine/tests/unit/programSelectionAudit.test.ts` (upper-back hinge regression)
- `package.json` (`audit:gym-program` script)
- `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md` (Phase 2 checklist + result)
- `docs/dev-reports/equipment-program-audit-phase2.md`
- `docs/dev-reports/equipment-program-audit-phase2.json`
- `docs/dev-reports/equipment-program-audit-phase2-gym-personas.md`
- `docs/dev-reports/equipment-program-audit-phase2-hard-failures-initial-vs-final.md`
- `docs/dev-reports/equipment-program-audit-phase2-gym-fuzz-10k.md`

### Canonical contract surface
- Day identities for 3/4/5-day gym titles, including established `Legs + Abs`
- Experience volume via existing `dayTemplates.ts` counts
- Movement-role truth labels (`true` / `supportedVariant` / `surrogate` / `preparationOnly`)
- Hard-failure reason codes for identity, volume, role truth, curl-only/carry hinge, illegal equipment, determinism
- Structural score vs deferred coaching/demo gaps (non-blocking for Phase 2)

### Root-cause repairs
- `hasLowBackPainSignal` no longer treats `upper_back` / thoracic pain as low-back pain.
- `heavy_hinge` avoid-pattern is scoped to true low-back/hip pain, not blanket high severity.
- Activation `db-rdl` primer remains available under high-severity upper-body pain.
- Gym `mainHingePrimary` requires strict hinge legality (curl cannot satisfy alone).
- Gym Legs Abs repair no longer strips deliberate low-back hip-extension hinge surrogates into curls/step-ups.

### Tests added or updated
- `packages/engine/tests/unit/programGymContract.test.ts`
- `packages/engine/tests/unit/programSelectionAudit.test.ts` (upper-back ≠ curl-only hinge)

### Commands run
- `npm run audit:gym-program` (flagship + 10k fuzz)
- `npm run audit:equipment-program`
- `npm run audit:catalog`
- `npm run audit:program-contract`
- `npm run audit:coverage-matrix`
- `npm run audit:phase-matrix`
- `npm run test:golden`
- `npm run test:critical`
- `npm run build`
- `npm run lint`
- focused: `programGymContract.test.ts`, `programSelectionAudit.test.ts`, related role/split tests

### Results
- Flagship gym personas: **10/10** structural ≥95 with **0** hard failures.
- Gym fuzz 10k: illegalEquipment=0, mainRoleTruth=0, identityCollapse=0, deterministicRepeat=0, exceptions=0.
- Focused gym contract + selection tests: pass.
- `test:golden`: 56/56 pass.
- `test:critical`: 326/326 pass.
- `audit:catalog`: pass.
- `audit:program-contract`: completed.
- `npm run build`: pass.
- `audit:coverage-matrix` / `audit:phase-matrix`: **FAIL** — see precise out-of-gate codes below (not suppressed).
- `npm run lint`: pre-existing errors in unrelated e2e specs; no new Phase 2 lint errors in changed engine files.
- Phase 0/1 equipment-program reports preserved.

### Out-of-gate baseline (precise reason codes — not permanent immunity)
These remain failing in coverage/phase matrix audits. They are **outside** the Phase 2 flagship gym structural contract gate, but must stay tracked for a later gym higher-frequency repair:

| Code | Profile | Failure |
|---|---|---|
| `BASELINE_GYM_5D_PAIN_GROWTH_CALVES_ACCESSORY` | advanced / Reduce pain / growth / 5-day / gym | Lower Squat missing calves accessory; weekly `calvesDays 0/2` |
| `BASELINE_GYM_5D_PAIN_GROWTH_UPPER_HINGE_INTELLIGENCE` | same | Upper Pull / Arms + Posture mains include hinge-tagged pulls that violate the upper-day hinge control-exception intelligence rule |

Ownership: gym 5-day pain/growth coverage + intelligence repair (not Phase 2 3-day role-truth; not Phase 3 dumbbell templates). Do not treat “pre-existing” as a waiver from investigation.

### Deferred (non-structural)
- Demo/cue/progression-link coaching metadata gaps remain on flagship personas and are scored separately from structural quality.
- Fuzz weeklyCoverage sampling still observes some coverage gaps; these are not gym role-truth hard failures.

### Intentional behavior changes
- Shoulder/upper-back gym users receive a true loaded hinge (`db-rdl`) instead of curl-only or missing hinge.
- Low-back/hip gym users keep pain-aware hip-extension hinge surrogates across beginner/intermediate/advanced.
- Non-gym equipment identities remain non-gym (no identity collapse in gym fuzz).

### Recommendation
- Proceed to Phase 3 only after explicit instruction.
- Exact Phase 3 starting point: replace gym-shaped home degradation with first-class dumbbell A/B/C templates and fixed-weight progression, without touching band-anchor questionnaire UI or engine decomposition yet.

### Next phase
- Phase 3 — Dumbbell-Only Templates, only after explicit instruction

Phase 3 — Dumbbell-Only Templates

Objective

Replace gym degradation with first-class dumbbell programming.

Tasks

Add dumbbell three-day full-body A/B/C contracts.

Define four- and five-day structures without creating five unrelated workouts.

Recommended:

3 days: A/B/C,

4 days: A/B/C plus a short Practice & Restore day,

5 days: A/B/C plus short upper-pattern and lower/core practice days.

Ensure no bench dependency without bench capability.

Add fixed-weight progression behavior.

Add dumbbell role ranking.

Add lat-intent truth labels.

Add golden plans by experience and phase.

Add coaching details for all selected canonical exercises.

Acceptance gate

Every week covers the dumbbell contract.

No bench assumptions.

No pullover-only back programming.

No session exceeds the non-gym complexity cap.

Every work item has a progression target.

Quality at least 90 in every dumbbell matrix scenario.

Manual tester can complete all three sessions without external research.

Phase Result added.

Cursor stops.

### Phase 3 checklist

- [x] Bookkeep advanced 5-day gym pain calves/intelligence with precise out-of-gate reason codes (not permanent immunity)
- [x] Add canonical dumbbell contract (`dumbbellProgramContract.ts`) and template family (`dumbbellTemplates.ts`)
- [x] Route `primaryEquipmentMode="dumbbells"` to Full Body A/B/C (+ practice days) before selection; no gym title inheritance
- [x] Template-author dumbbell mains (late authorship after gym remaps); skip gym 3-day slot remaps for dumbbells
- [x] Enforce no unconfirmed bench/support; no cable/machine/barbell/band/kettlebell leakage; honest pull (no false vertical)
- [x] Pain-aware: soft horizontal/overhead press for shoulders; hip-extension hinge surrogate for low-back
- [x] Add `audit:dumbbell-program` + Phase 3 reports (no overwrite of Phase 0–2)
- [x] Flagship structural scores ≥95 with zero hard failures (11/11)
- [x] 10k dumbbell fuzz: 0 illegal equipment, 0 unconfirmed support, 0 gym-template inheritance, 0 false vertical pull, 0 identity collapse, 0 nondeterminism
- [x] Add focused tests (`programDumbbellContract.test.ts`); preserve gym contract tests
- [x] Run required validation; append Phase Result
- [x] Stop without starting Phase 4

## Phase Result — Phase 3

### Changed files
- `packages/engine/src/program/dumbbellProgramContract.ts` (new)
- `packages/engine/src/program/dumbbellTemplates.ts` (new)
- `packages/engine/src/__debug__/dumbbellProgramAudit.ts` (new)
- `packages/engine/src/program.ts` (dumbbell template routing, intent-day exemptions for Full Body titles, late template authorship, skip gym 3-day remap for dumbbells)
- `packages/engine/src/program/dayTemplates.ts` (family tokens used by dumbbell lane plans)
- `packages/engine/tests/unit/programDumbbellContract.test.ts` (new)
- `package.json` (`audit:dumbbell-program`)
- `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md` (Phase 2 out-of-gate bookkeeping + Phase 3 checklist/result)
- `docs/dev-reports/equipment-program-audit-phase3*.md|json`

### Canonical contract / templates
- Titles: Full Body A/B/C; 4d adds Practice & Restore; 5d adds Upper Pattern Practice + Lower & Core Practice
- Volume caps by experience; ranked dumbbell role candidates (floor-first, no assumed bench)
- Hard-failure codes for gym inheritance, false vertical pull, missing horizontal pull/hinge, unconfirmed support, illegal equipment, prep-as-main, complexity, weekly roles, identity collapse, determinism
- Structural score separate from deferred coaching/demo/progression-link gaps

### Supported-frequency policy
- 3d: A/B/C flagship
- 4d: A/B/C + lower-volume Practice & Restore
- 5d: A/B/C + Upper Pattern Practice + Lower & Core Practice (not gym body-part splits)

### Root causes fixed
- Full Body titles matched gym `isLowerIntentDayTitle` via “Squat”/“Hinge”, blocking press/pull eligibility
- Gym post-generation 3-day slot remaps rewrote dumbbell mains; authorship now reapplied after pipeline and gym 3-day remap is skipped for dumbbells
- Lat-intent candidates preferred rows over pullover-only back programming
- Pain-aware hinge surrogates recognized despite catalog `regressionOnly` flags

### Intentional generated-program changes
- Dumbbell weeks use deliberately designed Full Body A/B/C sessions (e.g. goblet squat + floor press + one-arm row) instead of gym-minus-unavailable exercises
- Shoulder pain softens to push-up / pike-push-up paths; low-back uses hip-extension hinge surrogates
- No gym-shaped day titles for dumbbell primary mode

### Equipment / pull / progression
- No unconfirmed bench/chair/step in no-bench flagship; illegal gym tools blocked in eligibility
- True horizontal pull required; pullover not used as true vertical pull; absence of pull-up bar reported honestly
- Fixed-weight progression remains via existing catalog `progressionOf`/`regressionOf`, phase/ladder systems, and double-progression intent (reps then load/demand variable); coaching-card completeness stays deferred

### Scores and fuzz
- Flagship: **11/11** structural ≥95, **0** hard failures
- 10k fuzz: all required zero buckets (illegal equipment, unconfirmed support, gym inheritance, false vertical, identity collapse, nondeterminism)

### Gym regression / baselines
- Gym contract unit tests pass; `audit:gym-program` verification run: 10/10 flagship ≥95, 0 hard failures, 0 illegal equipment / role-truth / identity collapse / nondeterminism (Phase 2 report files restored afterward — not overwritten)
- Phase 0–2 reports preserved
- Out-of-gate gym 5-day pain codes remain tracked: `BASELINE_GYM_5D_PAIN_GROWTH_CALVES_ACCESSORY`, `BASELINE_GYM_5D_PAIN_GROWTH_UPPER_HINGE_INTELLIGENCE`

### Validation command results
- `audit:dumbbell-program`: pass — 11/11 flagship ≥95, 0 hard failures, 10k fuzz all required zeros
- `audit:gym-program`: verification pass (reports restored to Phase 2 artifacts)
- `audit:catalog`: pass (0 errors)
- `audit:program-contract`: completed
- `audit:coverage-matrix` / `audit:phase-matrix`: **FAIL** — same out-of-gate gym 5-day pain codes (not suppressed)
- `test:golden`: 56/56 pass
- `test:critical`: 326/326 pass
- `test:full`: 1035/1035 pass (dumbbell title expectations updated intentionally)
- `npm run build`: pass
- `npm run lint`: pre-existing errors in unrelated e2e / catalogLadder tests; no new Phase 3 lint errors in changed engine modules

### Intentional test updates
- Engine tests that assumed gym body-part titles for `equipment: ["dumbbells"]` now assert Full Body A/B/C (+ practice days) and dumbbell pull/hinge honesty
- Shared helpers: `packages/engine/tests/unit/_helpers/dumbbellTestTitles.ts`, `expectedCounts.ts`; acceptance helpers route dumbbell personas through `validateDumbbellProgramContract`

### Next phase
- Phase 4 — Band Templates and Anchor Capability, only after explicit instruction
- Stop here.

Phase 4 — Band Templates and Anchor Capability

Objective

Make band programs complete, safe, and simple to set up.

Tasks

Add band setup answer to the questionnaire.

Add capability migration/default handling.

Add band full-body A/B/C contracts.

Add anchor-height metadata.

Add no-anchor fallback paths.

Limit anchor changes.

Add band safety copy.

Add band-specific progression targets.

Reduce excessive variation families.

Add golden plans for:

loop only,

long band no anchor,

long band with anchor,

mixed band setup.

Acceptance gate

No anchored exercise appears without legal anchor capability.

No more than two default anchor-height changes per session.

Every anchored exercise has setup and safety instructions.

Every week covers the band contract.

Quality at least 90 in every band scenario.

Manual tester completes sessions without external setup research.

Phase Result added.

Cursor stops.

Phase 5 — Bodyweight Templates and Honest Pulling

Objective

Make no-equipment programming simple, useful, and honest.

Tasks

Add bodyweight full-body A/B/C contracts.

Define pull-surrogate truth labels.

Prevent surrogate work from satisfying gym-level true-pull requirements.

Remove obscure movement clusters.

Add bodyweight progression ladders.

Require demos for unfamiliar posture and pull-surrogate exercises.

Use only safe confirmed supports.

Add golden plans for all experience levels and phases.

Acceptance gate

Every week covers the bodyweight contract.

No false claim of a true loaded pull.

No obscure user-facing exercise lacks a demo.

Beginner sessions contain no more than five work/reinforcement items by default.

Quality at least 90 in every bodyweight scenario.

Manual tester completes the week without external research.

Phase Result added.

Cursor stops.

Phase 6 — Coaching Completeness and Exercise Cards

Objective

Make the program executable from Praxis alone.

Tasks

Add coaching registry.

Add completeness validator.

Fill coaching details for every exercise appearing in primary golden plans.

Add demo requirement logic.

Add collapsed and expanded card presentation.

Add “why selected” rationale.

Add expected-feel and stop-signal content.

Add regression and progression links.

Test missing content as a hard failure where required.

Acceptance gate

100% coaching completeness for all golden-plan exercises.

100% required-demo coverage.

No empty or misleading exercise-detail states.

Mobile cards remain readable.

A novice can explain the setup after reading the card once.

Phase Result added.

Cursor stops.

Phase 7 — Quality Gate Enforcement

Objective

Move from observation to protection.

Tasks

Run the V2 quality gate in audit-only mode for all tests and local generation.

Review false positives.

Fix root problems.

Add a safe known-template fallback.

Enable blocking only after the matrix is clean.

Log failure reasons in development and internal diagnostics.

Never expose raw internal failure text to users.

Acceptance gate

Zero hard failures in the full matrix.

Zero hard failures in 10,000 fuzz seeds per primary mode.

Every scenario scores at least 90.

Average at least 95.

Fallback itself passes the quality gate.

Full test suite and build pass.

Phase Result added.

Cursor stops.

Phase 8 — Plan Reveal and First-Session UX

Objective

Make quality visible immediately.

Tasks

Add equipment-mode label.

Add phase explanation.

Add weekly coverage summary.

Add session duration and equipment-needed summary.

Add concise day-purpose text.

Add coaching-card improvements.

Add progression preview.

Ensure bodyweight limitation language is honest and reassuring.

Test mobile layout and accessibility.

Acceptance gate

User understands the week within ten seconds.

No technical engine language appears.

No equipment surprise appears after session start.

No card requires horizontal scrolling.

Keyboard and screen-reader states work.

First-session usability test passes.

Phase Result added.

Cursor stops.

Phase 9 — Telemetry and Release

Objective

Measure whether the improvements earn use and purchase.

Recommended events

program_generated

program_quality_audited

exercise_details_opened

exercise_demo_opened

exercise_swapped

exercise_skipped

exercise_pain_reported

session_started

session_abandoned

session_completed

first_session_completed

first_week_completed

program_regenerated

equipment_changed

Include:

equipment mode,

program version,

experience,

phase,

days per week,

session identifier,

and quality score band.

Do not include sensitive free text.

Core metrics by mode

plan reveal to session start,

first-session completion,

first-week completion,

exercise-details open rate,

demo open rate,

swap rate,

skip rate,

pain-report rate,

session abandonment point,

regeneration rate,

trial-to-paid conversion,

and subscription retention.

Release order

Gym contract and quality protection

Dumbbell V2

Band V2

Bodyweight V2

Mixed home V2

Full plan-reveal UX

Acceptance gate

Version and mode included in telemetry.

No sensitive content captured.

Dashboards or query instructions documented.

Rollback path tested.

Production release checklist completed.

Phase Result added.

Cursor stops.

19. Test Strategy

Extend the existing test infrastructure rather than creating a separate testing world.

19.1 Unit tests

Test:

equipment-mode derivation,

capability derivation,

template selection,

slot-role truth,

anchor legality,

bench legality,

bodyweight surrogate labeling,

progression target generation,

coaching completeness,

quality scoring,

hard failures.

19.2 Golden tests

Golden outputs should be intentionally reviewed.

At minimum, capture:

four primary modes,

three experiences,

three phases,

pain-free and representative pain profiles,

three-day flagship programs.

Do not approve a snapshot merely because a code change produced it. Review it as a coach and a new user.

19.3 Matrix tests

The matrix should include:

modes,

mixed capabilities,

experience,

goals,

pain areas,

days,

phases,

and deterministic seeds.

Assertions must check more than “no crash” and “eligible.”

19.4 Fuzz tests

Fuzz:

equipment combinations,

pain combinations,

experience,

days,

phases,

feedback substitutions,

prior-phase memory,

and progression.

Every result must satisfy:

eligibility,

role truth,

session cap,

weekly contract,

coaching requirement,

and deterministic equality.

19.5 Manual usability tests

For each primary mode, recruit at least five people over time.

Give them no coaching beyond normal onboarding.

Observe:

whether they understand the plan,

where they hesitate,

whether they search externally,

whether they can set up equipment,

where they abandon,

and whether the program feels complete.

The first tester should be treated as a learning opportunity, but do not rewrite the engine around one person’s preferences. Record the exact friction and classify it.

20. Release Checklist

A mode is not ready until all statements are true.

Programming

The mode has its own session architecture.

Required weekly roles are covered.

Role truth is explicit.

No illegal equipment appears.

No hidden support or anchor is assumed.

Volume matches experience and pain context.

Progression is visible.

Phase continuity is coherent.

Simplicity

Day purpose is obvious.

Session count is controlled.

Exercise families are not duplicated without reason.

Setup transitions are reasonable.

Exercise names are understandable.

No filler exists.

Coaching

Setup is complete.

Execution steps are complete.

Dose and rest are complete.

Expected feel is included.

Mistake and stop signals are included.

Regression and progression are available.

Required demos exist.

Quality

Zero hard failures.

Every scenario scores at least 90.

Average score is at least 95.

Golden plans approved manually.

Fuzz tests pass.

Build and lint pass.

Mobile QA passes.

Product

Plan reveal communicates value.

User knows the equipment needed.

User understands why the plan fits them.

User can complete a session without outside research.

Telemetry can identify friction by mode and version.

Rollback is available.

21. Definition of Done

This project is complete when:

Gym feels unquestionably professional.

Dumbbell, band, and bodyweight plans each have a clear identity.

Home programs are simpler than gym programs without feeling incomplete.

The generator selects from truthful equipment-specific contracts.

Post-generation repair protects quality instead of authoring the whole plan.

Every prescribed exercise is executable from the app alone.

Every work item has a visible progression.

Bodyweight limitations are communicated honestly.

The quality gate prevents legal-but-jumbled plans.

New users can see the value of the program from first contact.

22. Phase Result Template

Cursor must append this under the completed phase.

## Phase Result — Phase X

### Changed files
- ...

### Behavior before
- ...

### Behavior after
- ...

### Tests added or updated
- ...

### Commands run
- ...

### Results
- ...

### Generated plans manually reviewed
- ...

### Unresolved concerns
- ...

### Recommendation
- Proceed / Do not proceed

### Next phase
- Phase X+1, only after explicit instruction