# Training Engine V2 Domain

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Athlete And Input

The foundation avoids a single giant person object. Future engine input composes:

- `AthleteProfile`
- `AssessmentState`
- `PainAndInjuryState`
- `EquipmentCapabilities`
- `TrainingHistory`
- `CurrentTrainingState`

This keeps goals, availability, preferences, assessment, pain, equipment, history, and phase state separately inspectable.

## Assessment

Assessment uses typed `AssessmentSignal` records with:

- signal type;
- source;
- confidence;
- priority;
- region, movement role, muscle, and side where relevant.

Historical weakness is represented separately from current assessment priority.

Assessment-derived alignment is represented separately through `AlignmentPriority` and `AssessmentInfluence`. This lets assessment influence phase intent, session intent, warmup, activation, candidate scoring, prescription, and progression while keeping low-confidence observations from overpowering the program.

## Pain And Injury

The model distinguishes:

- historical injury;
- historical sensitivity;
- current discomfort;
- moderate pain;
- acute/severe pain;
- hard contraindication;
- personal exercise block.

A personal block is not a medical contraindication. Mild discomfort is not automatically a hard exclusion.

## Equipment

Equipment is capability-based. It can distinguish bench type, dumbbell availability and load range, barbell and rack availability, cable availability, machine IDs, band type, anchor height, bodyweight space, pull-up bar, and support surfaces.

The model is intentionally extensible without attempting a complete commercial-gym catalog.

## Phase

Phase is first-class through `PhaseIntent`, `PhaseCapabilityExpectation`, `PhaseProgressionIntent`, `PhaseAdvancementCriterion`, and `PhaseState`.

The foundation includes Phase 1, Phase 2, and Phase 3 representations. Phase changes do not require exercise replacement; the same exercise can continue with a different prescription when productive.

## Session Structure

Sessions use:

1. `warmup`
2. `activation`
3. `main`
4. `accessory`
5. `cooldown`

`PreparationDependency` allows a preparation exercise to reference what it prepares: movement role, body region, assessment signal, range need, main exercise, and session intent.

## History

History distinguishes exercise, session, and program history. Exercise history events include too easy, appropriate challenge, too difficult, failed target, pain response, substitution, personal block, progression success/failure, and plateau.
