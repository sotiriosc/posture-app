# Exercise Dose-Mode Curation

Canonical `ExerciseDoseMode` vocabulary:

- `repetition_sets`
- `timed_hold`
- `breath_cycles`
- `distance_carry`
- `timed_carry`
- `step_march`
- `step_sets`

## Step-Mode Decision

Decision: `STEP_SETS_IMPLEMENTED_FOR_LOOP_BAND_LATERAL_WALK_AND_SUPINE_HAMSTRING_WALKOUT`.

Reason: `step_march` is explicitly stationary and cannot truthfully represent lateral walking or supine walkout steps. `repetition_sets` cannot silently redefine an individual step as a repetition. `step_sets` supports sets, structured steps, explicit step-count interpretation, laterality/side behavior through the shared dose base, no stationary claim, and no distance/carry credit.

## Family Curation

| Family | Rows | Primary mode |
| --- | --- | --- |
| Breathing | `ninety-ninety-breathing` | `breath_cycles` |
| Timed holds | `forearm-plank`, `forearm-side-plank`, `single-leg-balance-rehearsal` | `timed_hold` |
| Carries | `farmer-carry`, `suitcase-carry` | `distance_carry`; `timed_carry` legal alternate |
| Stationary march | `wall-supported-suitcase-march` | `step_march` |
| Counted steps | `loop-band-lateral-walk`, `supine-hamstring-walkout` | `step_sets` |
| Dynamic repetition rows | Remaining 36 rows | `repetition_sets` |

Mutation results:

- valid `step_sets`: no findings;
- stationary march with distance: `mode_incompatible_dose_field`, `mode_incompatible_stationary_distance`;
- non-stationary march mutation: `invalid_dose_stationary_march_truth`;
- tempo on hold, breath cycles, or carry: `mode_incompatible_dose_field`.

Fingerprint: `7557ef27c29c53b829ff9373c9f454217ec945b735e7cdb5e71332f37251fd3a`.
