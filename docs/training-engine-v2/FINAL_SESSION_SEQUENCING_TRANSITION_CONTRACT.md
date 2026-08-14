# Final Session Sequencing Transition Contract

Generated deterministically from the inactive Final Session Sequencing V1 design lab.

Every consecutive pair has a `SequencingTransitionFact` describing section, dependency, setup, equipment, support, resistance-path, fatigue, explicit timing IDs, unknowns, and provenance.

Setup vocabulary: `same_setup`, `compatible_setup`, `setup_change_required`, `equipment_change_required`, `support_change_required`, `location_change_required`, `unknown`.

`InterExerciseTransitionInstruction` distinguishes setup, recovery, section boundary, and unknown. Targets are exact, range, unknown, or not prescribed. Within-exercise rest is never reused, and each explicit timing fact contributes at most once.
