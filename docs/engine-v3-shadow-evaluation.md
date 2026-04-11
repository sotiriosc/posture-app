# Engine V3 Shadow Evaluation

Generated from deterministic snapshot inputs on 2026-04-10T12:00:00.000Z.

## Verdict

**V3 not ready**

- V3 left 16 slot(s) unfilled across the shadow matrix.
- 15 production main exercise(s) still do not map cleanly into the V3 family model.

## Key Signals

- Scenarios evaluated: 12
- Production determinism passes: 12/12
- V3 determinism passes: 12/12
- Production average fill rate: 100.0%
- V3 average fill rate: 97.9%
- Production average family coverage count: 8.8/9
- V3 average family coverage count: 8.8/9
- Production average working complexity: 2.253
- V3 average working complexity: 2.734
- Production average uniqueness score: 0.403
- V3 average uniqueness score: 0.412
- Production equipment-valid scenarios: 12/12
- V3 equipment-valid scenarios: 12/12
- Production optimizer-changed slots: 0
- V3 missing slots: 16

## Scenario Matrix

| Scenario | Prod fill | V3 fill | Prod families | V3 families | Prod complexity | V3 complexity | Prod changed slots | V3 missing slots |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none-beginner-general-none | 100.0% | 100.0% | 9 | 9 | 2.33 | 2.28 | 0 | 0 |
| none-intermediate-general-none | 100.0% | 100.0% | 9 | 9 | 2.28 | 2.77 | 0 | 0 |
| none-advanced-general-none | 100.0% | 100.0% | 9 | 9 | 2.32 | 3.05 | 0 | 0 |
| bands-beginner-general-none | 100.0% | 100.0% | 9 | 9 | 1.82 | 2.02 | 0 | 0 |
| bands-intermediate-general-none | 100.0% | 100.0% | 9 | 9 | 2.02 | 2.68 | 0 | 0 |
| bands-advanced-general-none | 100.0% | 100.0% | 9 | 9 | 1.99 | 3.14 | 0 | 0 |
| gym-beginner-general-none | 100.0% | 100.0% | 9 | 9 | 2.53 | 1.89 | 0 | 0 |
| gym-intermediate-general-none | 100.0% | 100.0% | 9 | 9 | 2.45 | 3.12 | 0 | 0 |
| gym-advanced-general-none | 100.0% | 100.0% | 9 | 9 | 2.64 | 3.89 | 0 | 0 |
| bands-beginner-reduce-pain-lower-back | 100.0% | 100.0% | 9 | 9 | 1.88 | 1.95 | 0 | 0 |
| gym-intermediate-posture-shoulders-neck | 100.0% | 87.3% | 8 | 8 | 2.40 | 3.12 | 0 | 8 |
| none-advanced-athletic-shoulders-neck | 100.0% | 87.3% | 8 | 8 | 2.37 | 2.89 | 0 | 8 |

## Experience Bias

- Current engine / none: measurable=no, beginner stability=0.688, advanced stability=0.679, beginner complexity=2.327, advanced complexity=2.319, pass=no.
  Note: Limited equipment keeps the stable/free-weight contrast too small to treat as a hard pass/fail signal.
- Current engine / bands: measurable=no, beginner stability=0.852, advanced stability=0.812, beginner complexity=1.823, advanced complexity=1.987, pass=no.
  Note: Limited equipment keeps the stable/free-weight contrast too small to treat as a hard pass/fail signal.
- Current engine / gym: measurable=yes, beginner stability=0.644, advanced stability=0.623, beginner complexity=2.530, advanced complexity=2.642, pass=yes.
  Note: Gym scenario shows the expected beginner-to-advanced stability/complexity shift.

- V3 / none: measurable=no, beginner stability=0.699, advanced stability=0.618, beginner complexity=2.283, advanced complexity=3.050, pass=no.
  Note: Limited equipment keeps the stable/free-weight contrast too small to treat as a hard pass/fail signal.
- V3 / bands: measurable=no, beginner stability=0.837, advanced stability=0.617, beginner complexity=2.017, advanced complexity=3.139, pass=no.
  Note: Limited equipment keeps the stable/free-weight contrast too small to treat as a hard pass/fail signal.
- V3 / gym: measurable=yes, beginner stability=0.865, advanced stability=0.456, beginner complexity=1.889, advanced complexity=3.894, pass=yes.
  Note: Gym scenario shows the expected beginner-to-advanced stability/complexity shift.

## Catalog Gaps

- Total exercises mapped: 188/217 (86.6%)
- Unmapped main exercises: band-biceps-curl, band-lateral-raise, band-triceps-pressdown, bodyweight-triceps-extension, cable-biceps-curl, cable-lateral-raise, db-biceps-curl, dumbbell-lateral-raise, dumbbell-triceps-kickback, hammer-curl, prone-t-raise, self-resisted-biceps-curl, self-resisted-triceps-extension, single-arm-band-biceps-curl, towel-biceps-curl-hold
- Sparse slot pairs (<3 advanced/gym candidates): main/vert_pull=1, accessory/vert_push=1, prep/vert_push=1, main/vert_push=1, prep/vert_pull=2

## Where V3 Looks Stronger

- V3 was deterministic across the full shadow matrix.
- V3 respected questionnaire equipment limits in every evaluated scenario.
- V3 showed the intended beginner-vs-advanced stability/complexity bias in the gym comparison.
- V3 maintained at least as much 3-week family coverage as the current engine.

## Where Current Engine Is Safer

- The current engine stayed deterministic across the full shadow matrix.
- The current engine preserved full equipment validity across all evaluated scenarios.
- The current engine still looks safer because it never left explicit slots unfilled while V3 did.

## Scenario Notes

- none-beginner-general-none: No equipment / Beginner / General fitness / No pain
  - Current engine emitted 14 exercise(s) that the V3 family mapper cannot classify.
- none-intermediate-general-none: No equipment / Intermediate / General fitness / No pain
  - Current engine emitted 12 exercise(s) that the V3 family mapper cannot classify.
- none-advanced-general-none: No equipment / Advanced / General fitness / No pain
  - Current engine emitted 13 exercise(s) that the V3 family mapper cannot classify.
- bands-beginner-general-none: Bands / Beginner / General fitness / No pain
  - Current engine emitted 14 exercise(s) that the V3 family mapper cannot classify.
- bands-intermediate-general-none: Bands / Intermediate / General fitness / No pain
  - Current engine emitted 12 exercise(s) that the V3 family mapper cannot classify.
- bands-advanced-general-none: Bands / Advanced / General fitness / No pain
  - Current engine emitted 16 exercise(s) that the V3 family mapper cannot classify.
- gym-beginner-general-none: Gym / Beginner / General fitness / No pain
  - Current engine emitted 12 exercise(s) that the V3 family mapper cannot classify.
- gym-intermediate-general-none: Gym / Intermediate / General fitness / No pain
  - Current engine emitted 10 exercise(s) that the V3 family mapper cannot classify.
- gym-advanced-general-none: Gym / Advanced / General fitness / No pain
  - Current engine emitted 13 exercise(s) that the V3 family mapper cannot classify.
- bands-beginner-reduce-pain-lower-back: Bands / Beginner / Reduce pain / Lower back
  - Current engine emitted 7 exercise(s) that the V3 family mapper cannot classify.
- gym-intermediate-posture-shoulders-neck: Gym / Intermediate / Improve posture / Shoulders + Neck
  - V3 left 8 slot(s) unfilled in the 3-week block.
  - V3 missed family coverage for vert_push.
  - Current engine emitted 8 exercise(s) that the V3 family mapper cannot classify.
- none-advanced-athletic-shoulders-neck: No equipment / Advanced / Athletic performance / Shoulders + Neck
  - V3 left 8 slot(s) unfilled in the 3-week block.
  - V3 missed family coverage for vert_push.
  - Current engine emitted 8 exercise(s) that the V3 family mapper cannot classify.

## Required Before Adoption

- Close V3 slot-coverage gaps so all scheduled 3-day slots fill under the evaluated pain/equipment scenarios.
- Improve V3 catalog mapping for remaining production main exercises so shadow reports are not losing signal.
- Add goal-aware and phase-aware policy before any production trial, because V3 currently ignores those live engine dimensions.
- Add real pain/repair handling instead of the current prototype capability flags.
- Extend the curriculum beyond the current 3-day-only schedule before any broader rollout.

## Recommendation

Next step: **continue V3 prototyping**
