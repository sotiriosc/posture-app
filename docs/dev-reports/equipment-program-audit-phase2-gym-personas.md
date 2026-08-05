# Phase 2 — Flagship Gym Persona Review

Manual-review snapshots for gym-only personas. Phase 0/1 reports were not overwritten.

## Beginner three-day gym / activation

- Id: `gym_3d_beginner_p1`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 79/100
- Hard failures: none
- Coverage gaps: none
- Deferred experience gaps: 42 (demo/cues/progression-link metadata)

### Back + Chest
- Warmup: wall-slides
- Activation: prone-ytw
- Mains:
  - `machine-chest-press` Machine Chest Press | slot=mainPushCompound | source=initial_pick
  - `machine-seated-row` Machine Seated Row | slot=mainPullHorizontal | source=day_intelligence_repair
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | source=initial_pick
- Accessories: prone-y-raise, dumbbell-chest-fly

### Shoulders + Arms
- Warmup: wall-slides
- Activation: scapular-pushups
- Mains:
  - `machine-shoulder-press` Machine Shoulder Press | slot=mainVerticalPushPrimary | source=day_intelligence_repair
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | source=day_intelligence_repair
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=mainShoulderPullPrimary | source=day_intelligence_repair
- Accessories: overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry

### Legs + Abs
- Warmup: ankle-mobility
- Activation: glute-bridges
- Mains:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | source=legality_repair
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | source=legality_repair
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | source=legality_repair
- Accessories: hollow-body-hold, db-calf-raise

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Intermediate three-day gym / activation

- Id: `gym_3d_intermediate_p1`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 75.5/100
- Hard failures: none
- Coverage gaps: none
- Deferred experience gaps: 49 (demo/cues/progression-link metadata)

### Back + Chest
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-bench-press` Dumbbell Bench Press | slot=mainPushCompound | source=initial_pick
  - `machine-pec-deck-press` Machine Pec Deck Fly | slot=mainPushFly | source=initial_pick
  - `dumbbell-rows` Dumbbell Rows | slot=mainPullHorizontal | source=day_intelligence_repair
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | source=initial_pick
- Accessories: machine-reverse-pec-deck, cable-face-pull

### Shoulders + Arms
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPushPrimary | source=day_intelligence_repair
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | source=day_intelligence_repair
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=mainShoulderPullPrimary | source=day_intelligence_repair
  - `cable-lateral-raise` Cable Lateral Raise | slot=mainSecondaryLoadedShoulder | source=day_intelligence_repair
- Accessories: overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry

### Legs + Abs
- Warmup: cat-cow
- Activation: wall-angel-hold
- Mains:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | source=legality_repair
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | source=legality_repair
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | source=legality_repair
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl | slot=mainHamstringIsolation | source=legality_repair
- Accessories: plank, db-calf-raise

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Advanced three-day gym / activation

- Id: `gym_3d_advanced_p1`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 73.5/100
- Hard failures: none
- Coverage gaps: none
- Deferred experience gaps: 53 (demo/cues/progression-link metadata)

### Back + Chest
- Warmup: wall-slides
- Activation: prone-ytw
- Mains:
  - `dumbbell-bench-press` Dumbbell Bench Press | slot=mainPushCompound | source=initial_pick
  - `machine-pec-deck-press` Machine Pec Deck Fly | slot=mainPushFly | source=initial_pick
  - `dumbbell-rows` Dumbbell Rows | slot=mainPullHorizontal | source=day_intelligence_repair
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | source=initial_pick
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row | slot=mainExtraBackLoaded | source=initial_pick
- Accessories: cable-face-pull, cable-straight-arm-pulldown

### Shoulders + Arms
- Warmup: wall-slides
- Activation: scapular-pushups
- Mains:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPushPrimary | source=day_intelligence_repair
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | source=day_intelligence_repair
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=mainShoulderPullPrimary | source=day_intelligence_repair
  - `cable-lateral-raise` Cable Lateral Raise | slot=mainSecondaryLoadedShoulder | source=day_intelligence_repair
- Accessories: overhead-cable-triceps-extension, cable-biceps-curl, dumbbell-triceps-kickback, db-biceps-curl

### Legs + Abs
- Warmup: ankle-mobility
- Activation: dead-bug
- Mains:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | source=legality_repair
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | source=legality_repair
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | source=legality_repair
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl | slot=mainHamstringIsolation | source=legality_repair
- Accessories: hollow-body-hold, db-calf-raise, side-plank-star

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Four-day gym / skill

- Id: `gym_4d_intermediate_p2`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 72.5/100
- Hard failures: none
- Coverage gaps: calvesDays 1/2, bicepsDays 1/2, tricepsDays 1/2
- Deferred experience gaps: 55 (demo/cues/progression-link metadata)

### Upper Push + Scapular Control
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-bench-press` Dumbbell Bench Press | slot=mainPush | source=initial_pick
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPush | source=initial_pick
  - `dumbbell-floor-press` Dumbbell Floor Press | slot=mainPush | source=initial_pick
- Accessories: db-triceps-extension, cable-rear-delt-fly

### Lower (Squat Emphasis) + Core
- Warmup: ankle-mobility
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-step-up-loaded` Dumbbell Step-Up (Loaded) | slot=mainSquat | source=initial_pick
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHinge | source=initial_pick
  - `machine-leg-press` Machine Leg Press | slot=mainSquat | source=initial_pick
- Accessories: side-plank-star, single-leg-calf-raise

### Upper Pull + Thoracic Posture
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-rows` Dumbbell Rows | slot=mainHorizontalPull | source=initial_pick
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainVerticalPull | source=initial_pick
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row | slot=mainExtraBackLoaded | source=uniqueness_swap
- Accessories: cable-biceps-curl, machine-rear-delt-row

### Lower (Hinge Emphasis) + Carry/Anti-rotation
- Warmup: ankle-mobility
- Activation: wall-angel-hold
- Mains:
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHinge | source=initial_pick
  - `split-squat` Split Squat | slot=mainSquat | source=initial_pick
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) | slot=mainHinge | source=initial_pick
- Accessories: side-plank-star, single-leg-hip-thrust

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Five-day gym / growth

- Id: `gym_5d_advanced_p3`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 60/100
- Hard failures: none
- Coverage gaps: calvesDays 1/2
- Deferred experience gaps: 86 (demo/cues/progression-link metadata)

### Upper Push
- Warmup: wall-slides
- Activation: scapular-pushups
- Mains:
  - `dumbbell-incline-press` Dumbbell Incline Press | slot=mainPush | source=initial_pick
  - `dumbbell-arnold-press` Dumbbell Arnold Press | slot=mainVerticalPush | source=initial_pick
  - `dumbbell-floor-press` Dumbbell Floor Press | slot=mainPush | source=initial_pick
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPush | source=initial_pick
- Accessories: close-grip-pushup, machine-chest-press, cable-rear-delt-fly

### Lower Squat
- Warmup: ankle-mobility
- Activation: dead-bug
- Mains:
  - `machine-leg-press` Machine Leg Press | slot=mainSquat | source=initial_pick
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHinge | source=initial_pick
  - `dumbbell-step-up-loaded` Dumbbell Step-Up (Loaded) | slot=mainSquat | source=initial_pick
- Accessories: barbell-rollout, standing-calf-raise, farmers-carry, cossack-squat

### Upper Pull
- Warmup: wall-slides
- Activation: prone-ytw
- Mains:
  - `dumbbell-chest-supported-row` Dumbbell Chest-Supported Row | slot=mainHorizontalPull | source=initial_pick
  - `cable-lat-pulldown` Cable Lat Pulldown | slot=mainVerticalPull | source=initial_pick
  - `dumbbell-rows` Dumbbell Rows | slot=mainExtraBackLoaded | source=initial_pick
  - `barbell-landmine-pulldown` Barbell Landmine Pulldown | slot=mainExtraBackLoaded | source=initial_pick
- Accessories: cable-biceps-curl, machine-rear-delt-row, cable-face-pull

### Lower Hinge + Posterior Chain
- Warmup: ankle-mobility
- Activation: dead-bug
- Mains:
  - `dumbbell-sumo-rdl` Dumbbell Sumo RDL | slot=mainHinge | source=initial_pick
  - `machine-hack-squat` Machine Hack Squat | slot=mainSquat | source=initial_pick
  - `barbell-hip-thrust` Barbell Hip Thrust | slot=mainHinge | source=initial_pick
- Accessories: barbell-rollout, db-rdl, suitcase-carry, machine-glute-drive

### Arms + Posture + Conditioning
- Warmup: wall-slides
- Activation: prone-ytw
- Mains:
  - `machine-seated-row` Machine Seated Row | slot=mainHorizontalPull | source=day_intelligence_repair
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPush | source=initial_pick
  - `barbell-landmine-pulldown` Barbell Landmine Pulldown | slot=mainExtraBackLoaded | source=initial_pick
  - `dumbbell-arnold-press` Dumbbell Arnold Press | slot=mainVerticalPush | source=initial_pick
- Accessories: machine-rear-delt-row, bodyweight-triceps-extension, cable-biceps-curl

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Shoulder-pain gym / activation

- Id: `gym_3d_shoulder_pain_p1`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 79/100
- Hard failures: none
- Coverage gaps: none
- Deferred experience gaps: 42 (demo/cues/progression-link metadata)

### Back + Chest
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `machine-chest-press` Machine Chest Press | slot=mainPushCompound | source=initial_pick
  - `machine-seated-row` Machine Seated Row | slot=mainPullHorizontal | source=day_intelligence_repair
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | source=initial_pick
- Accessories: cable-face-pull, dumbbell-chest-fly

### Shoulders + Arms
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `machine-shoulder-press` Machine Shoulder Press | slot=mainVerticalPushPrimary | source=day_intelligence_repair
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | source=day_intelligence_repair
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=mainShoulderPullPrimary | source=day_intelligence_repair
- Accessories: dumbbell-triceps-kickback, cable-biceps-curl, farmers-carry

### Legs + Abs
- Warmup: cat-cow
- Activation: wall-angel-hold
- Mains:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | source=legality_repair
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | source=legality_repair
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | source=legality_repair
- Accessories: plank, db-calf-raise

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Low-back-pain gym / activation

- Id: `gym_3d_low_back_pain_p1`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 79.5/100
- Hard failures: none
- Coverage gaps: none
- Deferred experience gaps: 41 (demo/cues/progression-link metadata)

### Back + Chest
- Warmup: cat-cow
- Activation: dead-bug
- Mains:
  - `machine-chest-press` Machine Chest Press | slot=mainPushCompound | source=initial_pick
  - `machine-seated-row` Machine Seated Row | slot=mainPullHorizontal | source=day_intelligence_repair
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | source=initial_pick
- Accessories: cable-face-pull, dumbbell-chest-fly

### Shoulders + Arms
- Warmup: cat-cow
- Activation: dead-bug
- Mains:
  - `machine-shoulder-press` Machine Shoulder Press | slot=mainVerticalPushPrimary | source=day_intelligence_repair
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | source=day_intelligence_repair
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=mainShoulderPullPrimary | source=day_intelligence_repair
- Accessories: overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry

### Legs + Abs
- Warmup: cat-cow
- Activation: glute-bridges
- Mains:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | source=legality_repair
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold | slot=mainHingePrimary | source=legality_repair
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | source=legality_repair
- Accessories: plank, db-calf-raise

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Beginner three-day gym / skill

- Id: `gym_3d_beginner_p2`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 78.5/100
- Hard failures: none
- Coverage gaps: none
- Deferred experience gaps: 43 (demo/cues/progression-link metadata)

### Back + Chest
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-bench-press` Dumbbell Bench Press | slot=mainPushCompound | source=initial_pick
  - `dumbbell-rows` Dumbbell Rows | slot=mainPullHorizontal | source=initial_pick
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | source=initial_pick
- Accessories: dumbbell-rear-delt-fly, machine-pec-deck-press

### Shoulders + Arms
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPushPrimary | source=day_intelligence_repair
  - `cable-lateral-raise` Cable Lateral Raise | slot=mainLateralDeltPrimary | source=day_intelligence_repair
  - `cable-rear-delt-fly` Cable Rear Delt Fly | slot=mainShoulderPullPrimary | source=day_intelligence_repair
- Accessories: overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry

### Legs + Abs
- Warmup: ankle-mobility
- Activation: glute-bridges
- Mains:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | source=legality_repair
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | source=legality_repair
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | source=legality_repair
- Accessories: hollow-body-hold, db-calf-raise

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Beginner three-day gym / growth

- Id: `gym_3d_beginner_p3`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 79/100
- Hard failures: none
- Coverage gaps: none
- Deferred experience gaps: 42 (demo/cues/progression-link metadata)

### Back + Chest
- Warmup: wall-slides
- Activation: prone-ytw
- Mains:
  - `dumbbell-bench-press` Dumbbell Bench Press | slot=mainPushCompound | source=day_intelligence_repair
  - `cable-seated-row` Cable Seated Row | slot=mainPullHorizontal | source=initial_pick
  - `cable-lat-pulldown` Cable Lat Pulldown | slot=mainPullVertical | source=initial_pick
- Accessories: cable-rear-delt-fly, machine-pec-deck-press

### Shoulders + Arms
- Warmup: wall-slides
- Activation: scapular-pushups
- Mains:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPushPrimary | source=day_intelligence_repair
  - `cable-lateral-raise` Cable Lateral Raise | slot=mainLateralDeltPrimary | source=day_intelligence_repair
  - `cable-rear-delt-fly` Cable Rear Delt Fly | slot=mainShoulderPullPrimary | source=day_intelligence_repair
- Accessories: overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry

### Legs + Abs
- Warmup: ankle-mobility
- Activation: glute-bridges
- Mains:
  - `machine-hack-squat` Machine Hack Squat | slot=mainSquatPrimary | source=legality_repair
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | source=legality_repair
  - `dumbbell-bulgarian-split-squat` Dumbbell Bulgarian Split Squat | slot=mainUnilateralLowerLoaded | source=legality_repair
- Accessories: cable-woodchop-standing, db-calf-raise

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?

## Five-day advanced pain gym / growth (baseline hotspot)

- Id: `gym_5d_pain_advanced_p3`
- Primary mode: gym
- Structural score: 100/100
- Full-experience score (includes deferred coaching gaps): 60.5/100
- Hard failures: none
- Coverage gaps: calvesDays 0/2
- Deferred experience gaps: 79 (demo/cues/progression-link metadata)

### Upper Push
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-floor-press` Dumbbell Floor Press | slot=mainPush | source=initial_pick
  - `dumbbell-arnold-press` Dumbbell Arnold Press | slot=mainVerticalPush | source=initial_pick
  - `machine-chest-press` Machine Chest Press | slot=mainPush | source=uniqueness_swap
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPush | source=initial_pick
- Accessories: close-grip-pushup, machine-rear-delt-row

### Lower Squat
- Warmup: cat-cow
- Activation: wall-angel-hold
- Mains:
  - `machine-leg-press` Machine Leg Press | slot=mainSquat | source=initial_pick
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHinge | source=initial_pick
  - `dumbbell-step-up-loaded` Dumbbell Step-Up (Loaded) | slot=mainSquat | source=initial_pick
- Accessories: contralateral-reach-march, barbell-hip-thrust, farmers-carry

### Upper Pull
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `dumbbell-rows` Dumbbell Rows | slot=mainHorizontalPull | source=initial_pick
  - `cable-lat-pulldown` Cable Lat Pulldown | slot=mainVerticalPull | source=initial_pick
  - `barbell-bent-over-row` Barbell Bent-Over Row | slot=mainExtraBackLoaded | source=eligibility_swap
  - `cable-seated-row` Cable Seated Row | slot=mainExtraBackLoaded | source=initial_pick
- Accessories: cable-biceps-curl, machine-rear-delt-row

### Lower Hinge + Posterior Chain
- Warmup: cat-cow
- Activation: wall-angel-hold
- Mains:
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHinge | source=day_intelligence_repair
  - `machine-hack-squat` Machine Hack Squat | slot=mainSquat | source=initial_pick
  - `barbell-hip-thrust` Barbell Hip Thrust | slot=mainHingeSurrogate | source=initial_pick
- Accessories: contralateral-reach-march, machine-glute-drive, farmers-carry

### Arms + Posture + Conditioning
- Warmup: wall-slides
- Activation: wall-angel-hold
- Mains:
  - `barbell-bent-over-row` Barbell Bent-Over Row | slot=mainHorizontalPull | source=eligibility_swap
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPush | source=initial_pick
  - `dumbbell-rows` Dumbbell Rows | slot=mainExtraBackLoaded | source=uniqueness_swap
  - `dumbbell-arnold-press` Dumbbell Arnold Press | slot=mainVerticalPush | source=initial_pick
- Accessories: bodyweight-triceps-extension, cable-biceps-curl

### Manual review checklist
- Day title matches workout?
- Main exercises immediately recognizable?
- Every required main role truthful?
- Exercise order logical?
- Accessories purposeful?
- Volume appropriate?
- Pain adaptation preserves identity (if pain case)?
- Next phase looks like progression rather than randomization?
