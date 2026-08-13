# Exercise Prescription Knowledge Contract

`ExerciseDefinition.prescriptionKnowledge` is production metadata for mechanical Prescription capability. It is not public educational copy and does not contain numeric prescription defaults.

## Profile Fields

Each profile contains:

- reviewed dose-mode annotations;
- primary dose mode and legal alternate dose modes;
- timing model;
- repetition-tempo capability;
- total-duration capability;
- breathing-cadence capability;
- locomotor/march/step-cadence capability;
- legal timing progression axes;
- constraints;
- review status;
- provenance;
- explicit unknowns;
- identity boundary;
- response-sensitive timing modification notes.

## Current 45-Row Status

All 45 production rows have one canonical profile. Validation requires one primary dose-mode annotation, canonical dose-mode vocabulary, profile/exercise ID agreement, provenance, explicit timing model, and legal timing-axis values.

Dose-mode counts:

| Primary mode | Count |
| --- | ---: |
| `repetition_sets` | 36 |
| `timed_hold` | 3 |
| `breath_cycles` | 1 |
| `distance_carry` | 2 |
| `step_march` | 1 |
| `step_sets` | 2 |

Timing-model counts:

| Timing model | Count |
| --- | ---: |
| `dynamic_repetition` | 36 |
| `isometric_hold` | 3 |
| `breathing_cycle` | 1 |
| `locomotor_trip` | 2 |
| `stationary_march` | 1 |
| `counted_steps` | 2 |

Fingerprint: `f240da336d309036d53932944d74519e985cf46ba537cc2b62c96f963fb0369a`.
