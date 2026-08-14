# Production Prescription Rest Placement

Generated deterministically from the production Prescription Compiler kernel.

Rest is represented by `PrescriptionRestInstruction` with placement, target, block relation, and provenance. V1 projection:

- `betweenSets`: `{"preparationActivationSeconds":[15,45],"mainStrengthSeconds":[180,300],"secondaryStrengthSeconds":[90,180],"mainHypertrophySeconds":[90,180],"accessoryDirectSeconds":[60,120],"specialModeSeconds":[60,120]}`
- `betweenPreparatoryBlocksSeconds`: `[15,45]`
- `beforeDevelopmentalBlockSeconds`: `[60,180]`
- `betweenRoundsSeconds`: `[30,60]`
- `betweenTripsSeconds`: `[60,180]`
- `betweenSides`: `"only_when_exercise_knowledge_or_explicit_requirement_requires_it"`
- `afterFinalBlock`: `"not_prescribed"`
- `interExerciseTransition`: `"SEQUENCING_OWNED"`
- `setupTime`: `"SEQUENCING_OWNED"`

No rest is attached after the final block, setup and transitions are not invented, and intervals are not duplicated at event and block levels.
