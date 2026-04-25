# 3-Day Persona Review

Deterministic manual-review output for key 3-day profiles.

## Beginner / 3 days / gym / no pain - Phase 1

- Goal: General fitness
- Experience: Beginner
- Equipment: gym
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:machine-chest-press>mainPullHorizontal:machine-seated-row>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:machine-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:machine-reverse-pec-deck] | Legs + Abs=[mainFinal:machine-leg-press>mainHingePrimary:db-rdl>mainFinal:dumbbell-step-up-loaded]
- Coverage warnings / audit hints:
  - [violation] Program role legality: Legs + Abs main legality replaced machine-seated-hamstring-curl with db-rdl.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Program role legality: Legs + Abs main legality replaced machine-seated-hamstring-curl with db-rdl.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `machine-chest-press` Machine Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `machine-seated-row` Machine Seated Row (slot=mainPullHorizontal lane=pull source=day_intelligence_repair)
  - `machine-lat-pulldown` Machine Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `prone-y-raise` Prone Y Raise (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-chest-fly` Dumbbell Chest Fly (slot=accessorychest lane=chest source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `machine-shoulder-press` Machine Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-step-up-loaded` Dumbbell Step-Up (Loaded) (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - prone-y-raise:rear_delt_support, dumbbell-chest-fly:chest_isolation
- PASS: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=true, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- REVIEW: Day 3 unilateral lower is not always step-up family - step_up
- PASS: Core does not always pick side-plank family - plank:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / gym / no pain - Phase 2

- Goal: General fitness
- Experience: Beginner
- Equipment: gym
- Pain areas: none
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly] | Legs + Abs=[mainFinal:machine-leg-press>mainFinal:db-rdl>mainFinal:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-bench-press` Dumbbell Bench Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `machine-lat-pulldown` Machine Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `dumbbell-rear-delt-fly` Dumbbell Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `machine-pec-deck-press` Machine Pec Deck Fly (slot=accessorychest lane=chest source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, machine-pec-deck-press:chest_isolation
- PASS: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=true, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - hollow-body-hold:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / gym / no pain - Phase 3

- Goal: General fitness
- Experience: Beginner
- Equipment: gym
- Pain areas: none
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPullHorizontal:cable-seated-row>mainPullVertical:cable-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly] | Legs + Abs=[mainFinal:machine-hack-squat>mainFinal:db-rdl>mainFinal:dumbbell-bulgarian-split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-bench-press` Dumbbell Bench Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `cable-seated-row` Cable Seated Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `cable-lat-pulldown` Cable Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `machine-pec-deck-press` Machine Pec Deck Fly (slot=accessorychest lane=chest source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `machine-hack-squat` Machine Hack Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-bulgarian-split-squat` Dumbbell Bulgarian Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `cable-woodchop-standing` Cable Woodchop (Standing) (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - cable-rear-delt-fly:rear_delt_support, machine-pec-deck-press:chest_isolation
- PASS: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=true, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - bulgarian_split_squat
- PASS: Core does not always pick side-plank family - cable-woodchop-standing:anti_rotation
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / gym / no pain - Phase 1

- Goal: General fitness
- Experience: Intermediate
- Equipment: gym
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPushFly:machine-pec-deck-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:machine-reverse-pec-deck>mainSecondaryLoadedShoulder:dumbbell-rear-delt-fly] | Legs + Abs=[mainFinal:machine-leg-press>mainFinal:db-rdl>mainFinal:dumbbell-step-up-loaded>mainFinal:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - [violation] Legs + Abs: Contract repair produced duplicate exercise IDs on Legs + Abs.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.
  - [coach] Shoulders + Arms secondary shoulder role is rear-delt saturated.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-bench-press` Dumbbell Bench Press (slot=mainPushCompound lane=push source=initial_pick)
  - `machine-pec-deck-press` Machine Pec Deck Fly (slot=mainPushFly lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=day_intelligence_repair)
  - `machine-lat-pulldown` Machine Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck (slot=accessoryback lane=back source=day_intelligence_repair)
  - `cable-face-pull` Cable Face Pull (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `dumbbell-rear-delt-fly` Dumbbell Rear Delt Fly (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-step-up-loaded` Dumbbell Step-Up (Loaded) (slot=mainFinal lane=squat source=initial_pick)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainFinal lane=hinge source=initial_pick)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- REVIEW: Day 1 accessories are not both rear/scap support unless justified - machine-reverse-pec-deck:rear_delt_support, cable-face-pull:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- REVIEW: Day 2 does not over-stack rear-delt family - rearDeltMains=2
- PASS: Upright row appears only in safe profiles - none
- REVIEW: Day 3 unilateral lower is not always step-up family - step_up
- PASS: Core does not always pick side-plank family - hollow-body-hold:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / gym / no pain - Phase 2

- Goal: General fitness
- Experience: Intermediate
- Equipment: gym
- Pain areas: none
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPushFly:dumbbell-chest-fly>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly>mainSecondaryLoadedShoulder:cable-upright-row] | Legs + Abs=[mainFinal:machine-leg-press>mainFinal:db-rdl>mainFinal:dumbbell-bulgarian-split-squat>mainFinal:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - [violation] Legs + Abs: Contract repair produced duplicate exercise IDs on Legs + Abs.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-bench-press` Dumbbell Bench Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-chest-fly` Dumbbell Chest Fly (slot=mainPushFly lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `machine-lat-pulldown` Machine Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `dumbbell-rear-delt-fly` Dumbbell Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `cable-external-rotation` Cable External Rotation (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `cable-upright-row` Cable Upright Row (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Wall Angel Hold
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-bulgarian-split-squat` Dumbbell Bulgarian Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainFinal lane=hinge source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- REVIEW: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, cable-external-rotation:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - cable-upright-row
- PASS: Day 3 unilateral lower is not always step-up family - bulgarian_split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / gym / no pain - Phase 3

- Goal: General fitness
- Experience: Intermediate
- Equipment: gym
- Pain areas: none
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:barbell-bench-press-paused>mainPushFly:dumbbell-chest-fly>mainPullHorizontal:cable-seated-row>mainPullVertical:cable-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly>mainSecondaryLoadedShoulder:cable-upright-row] | Legs + Abs=[mainFinal:machine-hack-squat>mainFinal:db-rdl>mainFinal:dumbbell-bulgarian-split-squat>mainSecondaryLowerLoaded:dumbbell-sumo-rdl]
- Coverage warnings / audit hints:
  - [violation] Program role legality: Legs + Abs main legality replaced machine-seated-hamstring-curl with dumbbell-sumo-rdl.
  - [violation] Program role legality: Legs + Abs main legality replaced machine-seated-hamstring-curl with dumbbell-sumo-rdl.
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `barbell-bench-press-paused` Barbell Bench Press (Paused) (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-chest-fly` Dumbbell Chest Fly (slot=mainPushFly lane=push source=initial_pick)
  - `cable-seated-row` Cable Seated Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `cable-lat-pulldown` Cable Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `dumbbell-rear-delt-fly` Dumbbell Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `cable-external-rotation` Cable External Rotation (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `cable-upright-row` Cable Upright Row (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `machine-hack-squat` Machine Hack Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-bulgarian-split-squat` Dumbbell Bulgarian Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `dumbbell-sumo-rdl` Dumbbell Sumo RDL (slot=mainSecondaryLowerLoaded lane=hinge source=legality_repair)
- Accessory:
  - `cable-woodchop-standing` Cable Woodchop (Standing) (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- REVIEW: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, cable-external-rotation:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - cable-upright-row
- PASS: Day 3 unilateral lower is not always step-up family - bulgarian_split_squat
- PASS: Core does not always pick side-plank family - cable-woodchop-standing:anti_rotation
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Advanced / 3 days / gym / no pain - Phase 1

- Goal: General fitness
- Experience: Advanced
- Equipment: gym
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPushFly:machine-pec-deck-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown>mainExtraBackLoaded:single-arm-dumbbell-row] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:machine-reverse-pec-deck>mainSecondaryLoadedShoulder:dumbbell-rear-delt-fly] | Legs + Abs=[mainFinal:machine-leg-press>mainFinal:db-rdl>mainFinal:dumbbell-step-up-loaded>mainFinal:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - [violation] Legs + Abs: Contract repair produced duplicate exercise IDs on Legs + Abs.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.
  - [coach] Shoulders + Arms secondary shoulder role is rear-delt saturated.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-bench-press` Dumbbell Bench Press (slot=mainPushCompound lane=push source=initial_pick)
  - `machine-pec-deck-press` Machine Pec Deck Fly (slot=mainPushFly lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=day_intelligence_repair)
  - `machine-lat-pulldown` Machine Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row (slot=mainExtraBackLoaded lane=pull source=initial_pick)
- Accessory:
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck (slot=accessoryback lane=back source=day_intelligence_repair)
  - `cable-face-pull` Cable Face Pull (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `dumbbell-rear-delt-fly` Dumbbell Rear Delt Fly (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-step-up-loaded` Dumbbell Step-Up (Loaded) (slot=mainFinal lane=squat source=initial_pick)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainFinal lane=hinge source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
  - `side-plank-star` Side Plank Star (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- REVIEW: Day 1 accessories are not both rear/scap support unless justified - machine-reverse-pec-deck:rear_delt_support, cable-face-pull:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- REVIEW: Day 2 does not over-stack rear-delt family - rearDeltMains=2
- PASS: Upright row appears only in safe profiles - none
- REVIEW: Day 3 unilateral lower is not always step-up family - step_up
- PASS: Core does not always pick side-plank family - plank:anti_extension, side-plank-star:lateral_stability
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Advanced / 3 days / gym / no pain - Phase 2

- Goal: General fitness
- Experience: Advanced
- Equipment: gym
- Pain areas: none
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPushFly:dumbbell-chest-fly>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown>mainExtraBackLoaded:single-arm-dumbbell-row] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly>mainSecondaryLoadedShoulder:cable-upright-row] | Legs + Abs=[mainFinal:machine-leg-press>mainFinal:db-rdl>mainFinal:dumbbell-reverse-lunge>mainFinal:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - [violation] Legs + Abs: Contract repair produced duplicate exercise IDs on Legs + Abs.
  - [violation] Program role legality: Back + Chest main legality replaced supine-lat-pulldown-isometric with single-arm-dumbbell-row.
  - [violation] Program role legality: Back + Chest main legality replaced supine-lat-pulldown-isometric with single-arm-dumbbell-row.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-bench-press` Dumbbell Bench Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-chest-fly` Dumbbell Chest Fly (slot=mainPushFly lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `machine-lat-pulldown` Machine Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row (slot=mainExtraBackLoaded lane=pull source=legality_repair)
- Accessory:
  - `dumbbell-rear-delt-fly` Dumbbell Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `cable-external-rotation` Cable External Rotation (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `cable-upright-row` Cable Upright Row (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `db-triceps-extension` Dumbbell Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Wall Angel Hold
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainFinal lane=hinge source=initial_pick)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
  - `side-plank-star` Side Plank Star (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- REVIEW: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, cable-external-rotation:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - cable-upright-row
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - hollow-body-hold:anti_extension, side-plank-star:lateral_stability
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Advanced / 3 days / gym / no pain - Phase 3

- Goal: General fitness
- Experience: Advanced
- Equipment: gym
- Pain areas: none
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:barbell-bench-press-paused>mainPushFly:dumbbell-chest-fly>mainPullHorizontal:cable-seated-row>mainPullVertical:cable-lat-pulldown>mainExtraBackLoaded:barbell-landmine-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly>mainSecondaryLoadedShoulder:cable-upright-row] | Legs + Abs=[mainFinal:machine-hack-squat>mainFinal:db-rdl>mainFinal:dumbbell-reverse-lunge>mainSecondaryLowerLoaded:dumbbell-sumo-rdl]
- Coverage warnings / audit hints:
  - [violation] Program role legality: Back + Chest main legality replaced supine-lat-pulldown-isometric with barbell-landmine-pulldown.
  - [violation] Program role legality: Legs + Abs main legality replaced machine-seated-hamstring-curl with dumbbell-sumo-rdl.
  - [violation] Program role legality: Back + Chest main legality replaced supine-lat-pulldown-isometric with barbell-landmine-pulldown.
  - [violation] Program role legality: Legs + Abs main legality replaced machine-seated-hamstring-curl with dumbbell-sumo-rdl.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `barbell-bench-press-paused` Barbell Bench Press (Paused) (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-chest-fly` Dumbbell Chest Fly (slot=mainPushFly lane=push source=initial_pick)
  - `cable-seated-row` Cable Seated Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `cable-lat-pulldown` Cable Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
  - `barbell-landmine-pulldown` Barbell Landmine Pulldown (slot=mainExtraBackLoaded lane=pull source=legality_repair)
- Accessory:
  - `dumbbell-rear-delt-fly` Dumbbell Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `cable-external-rotation` Cable External Rotation (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `cable-upright-row` Cable Upright Row (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `db-triceps-extension` Dumbbell Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `machine-hack-squat` Machine Hack Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
  - `dumbbell-sumo-rdl` Dumbbell Sumo RDL (slot=mainSecondaryLowerLoaded lane=hinge source=legality_repair)
- Accessory:
  - `cable-woodchop-standing` Cable Woodchop (Standing) (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
  - `machine-ab-crunch` Machine Ab Crunch (slot=accessorycore lane=core source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- REVIEW: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, cable-external-rotation:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - cable-upright-row
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - cable-woodchop-standing:anti_rotation, machine-ab-crunch:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / gym / lower back pain - Phase 1

- Goal: Reduce pain
- Experience: Beginner
- Equipment: gym
- Pain areas: lower back
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:machine-chest-press>mainPullHorizontal:machine-seated-row>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:machine-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:machine-reverse-pec-deck] | Legs + Abs=[mainFinal:machine-leg-press>mainFinal:machine-seated-hamstring-curl>mainFinal:dumbbell-step-up-loaded]
- Coverage warnings / audit hints:
  - [violation] Program role legality: Back + Chest accessory legality replaced prone-y-raise with dumbbell-chest-fly.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [missing] Legs + Abs: Could not satisfy "main hinge pattern" on Legs + Abs (0/1).
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [missing] Legs + Abs: Contract repair could not find eligible main for "main hinge pattern".
  - [violation] Program role legality: Back + Chest accessory legality replaced prone-y-raise with dumbbell-chest-fly.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `machine-chest-press` Machine Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `machine-seated-row` Machine Seated Row (slot=mainPullHorizontal lane=pull source=day_intelligence_repair)
  - `machine-lat-pulldown` Machine Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `cable-face-pull` Cable Face Pull (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-chest-fly` Dumbbell Chest Fly (slot=accessorychest lane=chest source=legality_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `machine-shoulder-press` Machine Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-step-up-loaded` Dumbbell Step-Up (Loaded) (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - cable-face-pull:rear_delt_support, dumbbell-chest-fly:chest_isolation
- PASS: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=true, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- REVIEW: Day 3 unilateral lower is not always step-up family - step_up
- PASS: Core does not always pick side-plank family - plank:anti_extension
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / gym / lower back pain - Phase 2

- Goal: Reduce pain
- Experience: Beginner
- Equipment: gym
- Pain areas: lower back
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPullHorizontal:machine-seated-row>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly] | Legs + Abs=[mainFinal:machine-leg-press>mainFinal:barbell-hip-thrust>mainFinal:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - [violation] Program role legality: Back + Chest accessory legality replaced dumbbell-rear-delt-fly with dumbbell-chest-fly.
  - [violation] Program role legality: Back + Chest accessory legality replaced dumbbell-rear-delt-fly with dumbbell-chest-fly.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-bench-press` Dumbbell Bench Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `machine-seated-row` Machine Seated Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `machine-lat-pulldown` Machine Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `cable-face-pull` Cable Face Pull (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-chest-fly` Dumbbell Chest Fly (slot=accessorychest lane=chest source=legality_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `barbell-hip-thrust` Barbell Hip Thrust (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - cable-face-pull:rear_delt_support, dumbbell-chest-fly:chest_isolation
- PASS: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=true, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - plank:anti_extension
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / gym / lower back pain - Phase 3

- Goal: Reduce pain
- Experience: Beginner
- Equipment: gym
- Pain areas: lower back
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPullHorizontal:machine-seated-row>mainPullVertical:machine-assisted-pullup] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly] | Legs + Abs=[mainFinal:machine-leg-press>mainFinal:barbell-hip-thrust>mainFinal:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - [violation] Program role legality: Back + Chest accessory legality replaced dumbbell-rear-delt-fly with dumbbell-chest-fly.
  - [violation] Program role legality: Back + Chest accessory legality replaced dumbbell-rear-delt-fly with dumbbell-chest-fly.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-bench-press` Dumbbell Bench Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `machine-seated-row` Machine Seated Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `machine-assisted-pullup` Machine Assisted Pull-Up (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `cable-face-pull` Cable Face Pull (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-chest-fly` Dumbbell Chest Fly (slot=accessorychest lane=chest source=legality_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `cable-rear-delt-fly` Cable Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainFinal lane=squat source=initial_pick)
  - `barbell-hip-thrust` Barbell Hip Thrust (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `cable-woodchop-standing` Cable Woodchop (Standing) (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - cable-face-pull:rear_delt_support, dumbbell-chest-fly:chest_isolation
- PASS: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=true, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - cable-woodchop-standing:anti_rotation
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / dumbbells / no pain - Phase 1

- Goal: General fitness
- Experience: Beginner
- Equipment: dumbbells
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPull:dumbbell-rows>mainPullVertical:seated-lat-sweep-pulse] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralSecondary:prone-swimmer] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:db-rdl>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with single-arm-dumbbell-row.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with single-arm-dumbbell-row.
  - [violation] Back + Chest: Back + Chest final main integrity replaced single-arm-dumbbell-row with seated-lat-sweep-pulse.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPull lane=pull source=coverage_repair)
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse (slot=mainPullVertical lane=pull source=legality_repair)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-pullover` Dumbbell Pullover (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, dumbbell-pullover:pullover_serratus
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - hollow-body-hold:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / dumbbells / no pain - Phase 2

- Goal: General fitness
- Experience: Beginner
- Equipment: dumbbells
- Pain areas: none
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPull:dumbbell-rows>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralSecondary:prone-swimmer] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:db-rdl>mainFinal:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest accessory slot debug relabeled dumbbell-pullover as pull.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPull lane=pull source=coverage_repair)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `reverse-snow-angel` Reverse Snow Angels (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-pullover` Dumbbell Pullover (slot=accessorypull lane=pull source=legality_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - reverse-snow-angel:rear_delt_support, dumbbell-pullover:pullover_serratus
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - hollow-body-hold:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / dumbbells / no pain - Phase 3

- Goal: General fitness
- Experience: Beginner
- Equipment: dumbbells
- Pain areas: none
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPull:dumbbell-rows>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralSecondary:dumbbell-arnold-press] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:db-rdl>mainFinal:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest accessory slot debug relabeled dumbbell-pullover as pull.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPull lane=pull source=coverage_repair)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-pullover` Dumbbell Pullover (slot=accessorypull lane=pull source=legality_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `dumbbell-arnold-press` Dumbbell Arnold Press (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, dumbbell-pullover:pullover_serratus
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - plank:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / dumbbells / no pain - Phase 1

- Goal: General fitness
- Experience: Intermediate
- Equipment: dumbbells
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPushSecondary:archer-pushup>mainPullHorizontal:dumbbell-rows>mainPullSupport:single-arm-dumbbell-row] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:prone-swimmer>mainSecondaryLoadedShoulder:reverse-snow-angel] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:db-rdl>mainFinal:split-squat>mainFinal:db-calf-raise]
- Coverage warnings / audit hints:
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=false,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=false,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced dumbbell-row-iso-hold with single-arm-dumbbell-row.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=false,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=false,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced dumbbell-row-iso-hold with single-arm-dumbbell-row.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `archer-pushup` Archer Push-Up (slot=mainPushSecondary lane=push source=uniqueness_swap)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row (slot=mainPullSupport lane=pull source=legality_repair)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-pullover` Dumbbell Pullover (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=mainFinal lane=n/a source=initial_pick)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- REVIEW: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=false
- PASS: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, dumbbell-pullover:pullover_serratus
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - hollow-body-hold:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / dumbbells / no pain - Phase 2

- Goal: General fitness
- Experience: Intermediate
- Equipment: dumbbells
- Pain areas: none
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPushSecondary:archer-pushup>mainPullHorizontal:dumbbell-rows>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:prone-swimmer>mainSecondaryLoadedShoulder:reverse-snow-angel] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:db-rdl>mainFinal:dumbbell-reverse-lunge>mainSquat:cossack-squat]
- Coverage warnings / audit hints:
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Legs + Abs: Legs + Abs final main integrity relabeled cossack-squat from hinge to squat.
  - [violation] Legs + Abs: Legs + Abs final main integrity relabeled cossack-squat from hinge to squat.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `archer-pushup` Archer Push-Up (slot=mainPushSecondary lane=push source=uniqueness_swap)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `reverse-snow-angel` Reverse Snow Angels (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-pullover` Dumbbell Pullover (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Wall Angel Hold
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
  - `cossack-squat` Cossack Squat (slot=mainSquat lane=squat source=legality_repair)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - reverse-snow-angel:rear_delt_support, dumbbell-pullover:pullover_serratus
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge, lateral_lunge_cossack
- PASS: Core does not always pick side-plank family - plank:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / dumbbells / no pain - Phase 3

- Goal: General fitness
- Experience: Intermediate
- Equipment: dumbbells
- Pain areas: none
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPushSecondary:archer-pushup>mainPullHorizontal:dumbbell-rows>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:dumbbell-arnold-press>mainSecondaryLoadedShoulder:prone-swimmer] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:db-rdl>mainFinal:dumbbell-reverse-lunge>mainFinal:dumbbell-sumo-rdl]
- Coverage warnings / audit hints:
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Program role legality: Legs + Abs main legality replaced heels-elevated-squat with dumbbell-sumo-rdl.
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=true.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `archer-pushup` Archer Push-Up (slot=mainPushSecondary lane=push source=uniqueness_swap)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-pullover` Dumbbell Pullover (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `dumbbell-arnold-press` Dumbbell Arnold Press (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
  - `dumbbell-sumo-rdl` Dumbbell Sumo RDL (slot=mainFinal lane=hinge source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, dumbbell-pullover:pullover_serratus
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - plank:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / dumbbells / lower back pain - Phase 1

- Goal: Reduce pain
- Experience: Beginner
- Equipment: dumbbells
- Pain areas: lower back
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPull:dumbbell-rows>mainPullVertical:seated-lat-sweep-pulse] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralSecondary:reverse-snow-angel] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:single-leg-glute-bridge-hold>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with dumbbell-rows.
  - [violation] Program role legality: Back + Chest main legality replaced prone-elbow-row with single-arm-dumbbell-row.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [missing] Legs + Abs: Could not satisfy "main hinge pattern" on Legs + Abs (0/1).
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [missing] Legs + Abs: Contract repair could not find eligible main for "main hinge pattern".
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with dumbbell-rows.
  - [violation] Program role legality: Back + Chest main legality replaced prone-elbow-row with single-arm-dumbbell-row.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [violation] Back + Chest: Back + Chest final main integrity replaced single-arm-dumbbell-row with seated-lat-sweep-pulse.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPull lane=pull source=legality_repair)
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse (slot=mainPullVertical lane=pull source=legality_repair)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `back-widow` Back Widow Pulls (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, back-widow:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / dumbbells / lower back pain - Phase 2

- Goal: Reduce pain
- Experience: Beginner
- Equipment: dumbbells
- Pain areas: lower back
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPull:single-arm-dumbbell-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralSecondary:reverse-snow-angel] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:single-leg-hip-thrust>mainFinal:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with single-arm-dumbbell-row.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with single-arm-dumbbell-row.
  - [violation] Back + Chest: Back + Chest accessory slot debug relabeled dumbbell-pullover as pull.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row (slot=mainPull lane=pull source=legality_repair)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `reverse-snow-angel` Reverse Snow Angels (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-pullover` Dumbbell Pullover (slot=accessorypull lane=pull source=legality_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - reverse-snow-angel:rear_delt_support, dumbbell-pullover:pullover_serratus
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - plank:anti_extension
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / dumbbells / lower back pain - Phase 3

- Goal: Reduce pain
- Experience: Beginner
- Equipment: dumbbells
- Pain areas: lower back
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPull:single-arm-dumbbell-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralSecondary:dumbbell-arnold-press] | Legs + Abs=[mainFinal:goblet-squat>mainFinal:db-rdl>mainFinal:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with single-arm-dumbbell-row.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with single-arm-dumbbell-row.
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest accessory slot debug relabeled dumbbell-pullover as pull.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row (slot=mainPull lane=pull source=legality_repair)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-pullover` Dumbbell Pullover (slot=accessorypull lane=pull source=legality_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `dumbbell-arnold-press` Dumbbell Arnold Press (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainFinal lane=squat source=initial_pick)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, dumbbell-pullover:pullover_serratus
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - plank:anti_extension
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / bands / no pain - Phase 1

- Goal: General fitness
- Experience: Beginner
- Equipment: bands
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPull:split-stance-row>mainPullVertical:band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainFinal:band-front-squat>mainFinal:band-rdl>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Band Pull-Aparts
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPull lane=pull source=coverage_repair)
  - `band-lat-pulldown` Band Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-chest-fly` Band Chest Fly (slot=accessorychest lane=chest source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `band-overhead-press` Band Overhead Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=legality_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `band-biceps-curl` Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `band-rdl` Band Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorypush lane=push source=initial_pick)
  - `band-calf-raise` Band Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-chest-fly:chest_isolation
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - pallof-press:anti_rotation
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / bands / no pain - Phase 2

- Goal: General fitness
- Experience: Beginner
- Equipment: bands
- Pain areas: none
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:band-chest-press>mainPullHorizontal:single-arm-band-row>mainPullVertical:band-lat-pulldown-kneeling] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainFinal:band-front-squat>mainHingePrimary:band-rdl>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced split-stance-band-chest-press with single-arm-band-row.
  - [violation] Program role legality: Back + Chest main legality replaced split-stance-row with archer-pushup.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [violation] Program role legality: Legs + Abs main legality replaced single-leg-rdl with band-rdl.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced split-stance-band-chest-press with single-arm-band-row.
  - [violation] Program role legality: Back + Chest main legality replaced split-stance-row with archer-pushup.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [violation] Program role legality: Legs + Abs main legality replaced single-leg-rdl with band-rdl.
  - [violation] Back + Chest: Back + Chest final main integrity replaced single-arm-band-row with band-chest-press.
  - [violation] Back + Chest: Back + Chest final main integrity replaced archer-pushup with single-arm-band-row.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `band-chest-press` Band Chest Press (slot=mainPushCompound lane=push source=legality_repair)
  - `single-arm-band-row` Single-Arm Band Row (slot=mainPullHorizontal lane=pull source=legality_repair)
  - `band-lat-pulldown-kneeling` Band Lat Pulldown (Kneeling) (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-chest-fly` Band Chest Fly (slot=accessorychest lane=chest source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `band-overhead-press` Band Overhead Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=legality_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorypush lane=push source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-chest-fly:chest_isolation
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - pallof-press:anti_rotation
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / bands / no pain - Phase 3

- Goal: General fitness
- Experience: Beginner
- Equipment: bands
- Pain areas: none
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:band-chest-press>mainPullHorizontal:band-row>mainPullVertical:standing-band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainFinal:band-front-squat>mainHingePrimary:band-rdl>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced split-stance-band-chest-press with band-lat-pulldown.
  - [violation] Program role legality: Back + Chest main legality replaced split-stance-row with archer-pushup.
  - [violation] Program role legality: Legs + Abs main legality replaced single-leg-rdl with band-rdl.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced split-stance-band-chest-press with band-lat-pulldown.
  - [violation] Program role legality: Back + Chest main legality replaced split-stance-row with archer-pushup.
  - [violation] Program role legality: Legs + Abs main legality replaced back-extension with band-rdl.
  - [violation] Back + Chest: Back + Chest final main integrity replaced band-lat-pulldown with band-chest-press.
  - [violation] Back + Chest: Back + Chest final main integrity replaced archer-pushup with band-row.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Band Pull-Aparts
- Main:
  - `band-chest-press` Band Chest Press (slot=mainPushCompound lane=push source=legality_repair)
  - `band-row` Band Row (slot=mainPullHorizontal lane=pull source=legality_repair)
  - `standing-band-lat-pulldown` Standing Band Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-chest-fly` Band Chest Fly (slot=accessorychest lane=chest source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `band-biceps-curl` Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorypush lane=push source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-chest-fly:chest_isolation
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - pallof-press:anti_rotation
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / bands / no pain - Phase 1

- Goal: General fitness
- Experience: Intermediate
- Equipment: bands
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPushFly:band-chest-fly>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly>mainShoulderStructuralSecondary:prone-swimmer] | Legs + Abs=[mainFinal:band-front-squat>mainFinal:band-rdl>mainFinal:split-squat>mainFinal:band-calf-raise]
- Coverage warnings / audit hints:
  - [violation] Program role legality: Back + Chest main legality replaced band-chest-fly with archer-pushup.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Program role legality: Back + Chest main legality replaced band-chest-fly with archer-pushup.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [violation] Back + Chest: Back + Chest final main integrity replaced archer-pushup with band-chest-fly.
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Band Pull-Aparts
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `band-chest-fly` Band Chest Fly (slot=mainPushFly lane=push source=legality_repair)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `band-lat-pulldown` Band Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-face-pull-high-anchor` Band Face Pull (High Anchor) (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `band-overhead-press` Band Overhead Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=legality_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `band-overhead-triceps-extension` Band Overhead Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `band-rdl` Band Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `band-calf-raise` Band Calf Raise (slot=mainFinal lane=n/a source=initial_pick)
- Accessory:
  - `band-woodchop` Band Woodchop (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-face-pull-high-anchor:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - band-woodchop:anti_rotation
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / bands / no pain - Phase 2

- Goal: General fitness
- Experience: Intermediate
- Equipment: bands
- Pain areas: none
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPushFly:band-chest-fly>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly>mainShoulderStructuralSecondary:prone-swimmer] | Legs + Abs=[mainFinal:band-front-squat>mainHingePrimary:band-rdl>mainFinal:split-squat>mainSquat:cossack-squat]
- Coverage warnings / audit hints:
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced band-chest-fly with archer-pushup.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [violation] Program role legality: Legs + Abs main legality replaced single-leg-hip-thrust with band-rdl.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced band-chest-fly with archer-pushup.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [violation] Program role legality: Legs + Abs main legality replaced single-leg-rdl with band-rdl.
  - [violation] Back + Chest: Back + Chest final main integrity replaced archer-pushup with band-chest-fly.
  - [violation] Legs + Abs: Legs + Abs final main integrity relabeled cossack-squat from hinge to squat.
  - [violation] Legs + Abs: Legs + Abs final main integrity relabeled cossack-squat from hinge to squat.
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `band-chest-fly` Band Chest Fly (slot=mainPushFly lane=push source=legality_repair)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `band-lat-pulldown` Band Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-face-pull-high-anchor` Band Face Pull (High Anchor) (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `band-overhead-press` Band Overhead Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=legality_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `band-triceps-pressdown` Band Triceps Pressdown (slot=accessorypush lane=push source=day_intelligence_repair)
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Wall Angel Hold
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `cossack-squat` Cossack Squat (slot=mainSquat lane=squat source=legality_repair)
- Accessory:
  - `band-woodchop` Band Woodchop (slot=accessorycore lane=core source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-face-pull-high-anchor:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat, lateral_lunge_cossack
- PASS: Core does not always pick side-plank family - band-woodchop:anti_rotation
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Intermediate / 3 days / bands / no pain - Phase 3

- Goal: General fitness
- Experience: Intermediate
- Equipment: bands
- Pain areas: none
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPushFly:band-chest-fly>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly>mainShoulderStructuralSecondary:prone-swimmer] | Legs + Abs=[mainFinal:band-front-squat>mainFinal:single-leg-rdl>mainFinal:split-squat>mainFinal:band-rdl]
- Coverage warnings / audit hints:
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced band-chest-fly with archer-pushup.
  - [violation] Program role legality: Legs + Abs main legality replaced single-leg-rdl with band-rdl.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=true,pullBias=true,advanced=true,rowAngles=true,isolation=true,tier=true,ladder=false.
  - [violation] Program role legality: Back + Chest main legality replaced band-chest-fly with archer-pushup.
  - [violation] Back + Chest: Back + Chest final main integrity replaced archer-pushup with band-chest-fly.
  - [coach] Back + Chest accessories are saturated with rear-delt/scap support.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Band Pull-Aparts
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `band-chest-fly` Band Chest Fly (slot=mainPushFly lane=push source=legality_repair)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `band-lat-pulldown` Band Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-face-pull-high-anchor` Band Face Pull (High Anchor) (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `band-triceps-pressdown` Band Triceps Pressdown (slot=accessorypush lane=push source=day_intelligence_repair)
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `band-rdl` Band Romanian Deadlift (slot=mainFinal lane=hinge source=initial_pick)
- Accessory:
  - `band-woodchop` Band Woodchop (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-face-pull-high-anchor:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - band-woodchop:anti_rotation
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / bands / lower back pain - Phase 1

- Goal: Reduce pain
- Experience: Beginner
- Equipment: bands
- Pain areas: lower back
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:band-chest-press>mainPull:split-stance-row>mainPullVertical:band-lat-pulldown-neutral-grip] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainFinal:band-front-squat>mainFinal:single-leg-glute-bridge-hold>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Program role legality: Back + Chest accessory legality replaced band-rear-delt-fly with band-chest-fly.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [missing] Legs + Abs: Could not satisfy "main hinge pattern" on Legs + Abs (0/1).
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [missing] Legs + Abs: Contract repair could not find eligible main for "main hinge pattern".
  - [violation] Program role legality: Back + Chest accessory legality replaced band-rear-delt-fly with band-chest-fly.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-chest-press` Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPull lane=pull source=coverage_repair)
  - `band-lat-pulldown-neutral-grip` Band Lat Pulldown (Neutral Grip) (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `face-pull` Face Pull (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-chest-fly` Band Chest Fly (slot=accessorychest lane=chest source=legality_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-overhead-press` Band Overhead Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=legality_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorypush lane=push source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - face-pull:rear_delt_support, band-chest-fly:chest_isolation
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - pallof-press:anti_rotation
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / bands / lower back pain - Phase 2

- Goal: Reduce pain
- Experience: Beginner
- Equipment: bands
- Pain areas: lower back
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPull:split-stance-row>mainPullVertical:band-lat-pulldown-neutral-grip] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainFinal:band-front-squat>mainFinal:single-leg-hip-thrust>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Program role legality: Back + Chest accessory legality replaced band-rear-delt-fly with band-chest-fly.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Program role legality: Back + Chest accessory legality replaced band-rear-delt-fly with band-chest-fly.
  - [violation] Program role legality: Shoulders + Arms main legality replaced prone-t-raise with band-lateral-raise.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPull lane=pull source=coverage_repair)
  - `band-lat-pulldown-neutral-grip` Band Lat Pulldown (Neutral Grip) (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `face-pull` Face Pull (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-chest-fly` Band Chest Fly (slot=accessorychest lane=chest source=legality_repair)
- Cooldown: Banded Lat Stretch

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-overhead-press` Band Overhead Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=legality_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorypush lane=push source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - face-pull:rear_delt_support, band-chest-fly:chest_isolation
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - pallof-press:anti_rotation
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / bands / lower back pain - Phase 3

- Goal: Reduce pain
- Experience: Beginner
- Equipment: bands
- Pain areas: lower back
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:band-chest-press>mainPull:banded-rows-seated>mainPullVertical:band-lat-pulldown-neutral-grip] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainFinal:band-front-squat>mainHingePrimary:band-rdl>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Program role legality: Back + Chest accessory legality replaced band-rear-delt-fly with band-chest-fly.
  - [violation] Program role legality: Legs + Abs main legality replaced single-leg-rdl with band-rdl.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Program role legality: Back + Chest accessory legality replaced band-rear-delt-fly with band-chest-fly.
  - [violation] Program role legality: Legs + Abs main legality replaced single-leg-rdl with band-rdl.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-chest-press` Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `banded-rows-seated` Seated Band Row (slot=mainPull lane=pull source=coverage_repair)
  - `band-lat-pulldown-neutral-grip` Band Lat Pulldown (Neutral Grip) (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `face-pull` Face Pull (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-chest-fly` Band Chest Fly (slot=accessorychest lane=chest source=legality_repair)
- Cooldown: Banded Lat Stretch

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `band-biceps-curl` Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-front-squat` Band Front Squat (slot=mainFinal lane=squat source=initial_pick)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorypush lane=push source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - face-pull:rear_delt_support, band-chest-fly:chest_isolation
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - pallof-press:anti_rotation
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / none / no pain - Phase 1

- Goal: General fitness
- Experience: Beginner
- Equipment: none
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPull:pushup>mainPullHorizontal:supine-elbow-drive-row>mainPullVertical:seated-lat-sweep-pulse] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralSecondary:prone-swimmer] | Legs + Abs=[mainFinal:heels-elevated-squat>mainFinal:back-extension-hold>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with archer-pushup.
  - [violation] Program role legality: Back + Chest main legality replaced prone-elbow-row with supine-elbow-drive-row.
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [missing] Legs + Abs: Could not satisfy "main hinge pattern" on Legs + Abs (0/1).
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [missing] Legs + Abs: Contract repair could not find eligible main for "main hinge pattern".
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with archer-pushup.
  - [violation] Program role legality: Back + Chest main legality replaced prone-elbow-row with supine-elbow-drive-row.
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [violation] Back + Chest: Back + Chest final main integrity relabeled archer-pushup from pull to push.
  - [violation] Back + Chest: Back + Chest final main integrity replaced supine-elbow-drive-row with seated-lat-sweep-pulse.
  - [violation] Back + Chest: Back + Chest final main integrity replaced archer-pushup with supine-elbow-drive-row.
  - [coach] Legs + Abs primary hinge should be checked for lower-back pain safety.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `pushup` Push-Up (slot=mainPull lane=pull source=coverage_repair)
  - `supine-elbow-drive-row` Supine Elbow Drive Row (slot=mainPullHorizontal lane=pull source=legality_repair)
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse (slot=mainPullVertical lane=pull source=legality_repair)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `back-widow` Back Widow Pulls (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainFinal lane=squat source=initial_pick)
  - `back-extension-hold` Back Extension Hold (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, back-widow:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / none / no pain - Phase 2

- Goal: General fitness
- Experience: Beginner
- Equipment: none
- Pain areas: none
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:countertop-pushup>mainPullHorizontal:supine-elbow-drive-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralSecondary:prone-swimmer] | Legs + Abs=[mainFinal:split-squat>mainFinal:single-leg-hip-thrust>mainFinal:heels-elevated-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with archer-pushup.
  - [violation] Program role legality: Back + Chest main legality replaced pushup with supine-elbow-drive-row.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with archer-pushup.
  - [violation] Program role legality: Back + Chest main legality replaced pushup with supine-elbow-drive-row.
  - [violation] Back + Chest: Back + Chest final main integrity replaced supine-elbow-drive-row with countertop-pushup.
  - [violation] Back + Chest: Back + Chest final main integrity replaced archer-pushup with supine-elbow-drive-row.
  - [violation] Back + Chest: Back + Chest accessory slot debug relabeled back-widow as pull.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `countertop-pushup` Countertop Push-Up (slot=mainPushCompound lane=push source=legality_repair)
  - `supine-elbow-drive-row` Supine Elbow Drive Row (slot=mainPullHorizontal lane=pull source=legality_repair)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `reverse-snow-angel` Reverse Snow Angels (slot=accessoryback lane=back source=day_intelligence_repair)
  - `back-widow` Back Widow Pulls (slot=accessorypull lane=pull source=legality_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainFinal lane=hinge source=initial_pick)
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - reverse-snow-angel:rear_delt_support, back-widow:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / none / no pain - Phase 3

- Goal: General fitness
- Experience: Beginner
- Equipment: none
- Pain areas: none
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPushCompound:countertop-pushup>mainPullHorizontal:supine-elbow-drive-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralSecondary:prone-swimmer] | Legs + Abs=[mainFinal:heels-elevated-squat>mainFinal:single-leg-rdl>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with archer-pushup.
  - [violation] Program role legality: Back + Chest main legality replaced pushup with supine-elbow-drive-row.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [missing] Legs + Abs: Could not satisfy "main hinge pattern" on Legs + Abs (0/1).
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [missing] Legs + Abs: Contract repair could not find eligible main for "main hinge pattern".
  - [violation] Program role legality: Back + Chest main legality replaced supine-elbow-drive-row with archer-pushup.
  - [violation] Program role legality: Back + Chest main legality replaced pushup with supine-elbow-drive-row.
  - [violation] Back + Chest: Back + Chest final main integrity replaced supine-elbow-drive-row with countertop-pushup.
  - [violation] Back + Chest: Back + Chest final main integrity replaced archer-pushup with supine-elbow-drive-row.
  - [violation] Back + Chest: Back + Chest accessory slot debug relabeled back-widow as pull.

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `countertop-pushup` Countertop Push-Up (slot=mainPushCompound lane=push source=legality_repair)
  - `supine-elbow-drive-row` Supine Elbow Drive Row (slot=mainPullHorizontal lane=pull source=legality_repair)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `back-widow` Back Widow Pulls (slot=accessorypull lane=pull source=legality_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `towel-biceps-curl-hold` Towel Biceps Curl Hold (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) (slot=mainFinal lane=hinge source=initial_pick)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, back-widow:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension
- INFO: Lower-back pain does not use back-extension/back-extension-hold as main hinge - not a lower-back pain profile
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / none / lower back pain - Phase 1

- Goal: Reduce pain
- Experience: Beginner
- Equipment: none
- Pain areas: lower back
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPull:pushup>mainPushSecondary:supine-elbow-drive-row>mainPullVertical:seated-lat-sweep-pulse] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralSecondary:reverse-snow-angel] | Legs + Abs=[mainFinal:heels-elevated-squat>mainHingePrimary:single-leg-hip-thrust>mainFinal:split-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest main intelligence still imperfect after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [violation] Back + Chest: Back + Chest main intelligence validation failed after repair: anchors=false,pullBias=true,advanced=true,rowAngles=false,isolation=true,tier=true,ladder=true.
  - [missing] Legs + Abs: Missing "main hinge pattern" on Legs + Abs after repair.
  - [violation] Back + Chest: Back + Chest final main integrity replaced prone-elbow-row with seated-lat-sweep-pulse.
  - [violation] Legs + Abs: Legs + Abs final main integrity replaced single-leg-glute-bridge-hold with single-leg-hip-thrust.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pushup` Push-Up (slot=mainPull lane=pull source=coverage_repair)
  - `supine-elbow-drive-row` Supine Elbow Drive Row (slot=mainPushSecondary lane=push source=uniqueness_swap)
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse (slot=mainPullVertical lane=pull source=legality_repair)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `back-widow` Back Widow Pulls (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, back-widow:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / none / lower back pain - Phase 2

- Goal: Reduce pain
- Experience: Beginner
- Equipment: none
- Pain areas: lower back
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPull:pushup>mainPushSecondary:prone-elbow-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralSecondary:reverse-snow-angel] | Legs + Abs=[mainFinal:split-squat>mainFinal:single-leg-hip-thrust>mainFinal:heels-elevated-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest accessory slot debug relabeled back-widow as pull.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pushup` Push-Up (slot=mainPull lane=pull source=coverage_repair)
  - `prone-elbow-row` Prone Elbow Row (slot=mainPushSecondary lane=push source=uniqueness_swap)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `reverse-snow-angel` Reverse Snow Angels (slot=accessoryback lane=back source=day_intelligence_repair)
  - `back-widow` Back Widow Pulls (slot=accessorypull lane=pull source=legality_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `towel-biceps-curl-hold` Towel Biceps Curl Hold (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainFinal lane=hinge source=initial_pick)
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - reverse-snow-angel:rear_delt_support, back-widow:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

## Beginner / 3 days / none / lower back pain - Phase 3

- Goal: Reduce pain
- Experience: Beginner
- Equipment: none
- Pain areas: lower back
- Phase: Phase 3: Strength Focus
- Main layout signature: Back + Chest=[mainPull:pushup>mainPushSecondary:prone-elbow-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralSecondary:reverse-snow-angel] | Legs + Abs=[mainFinal:split-squat>mainFinal:single-leg-rdl>mainFinal:heels-elevated-squat]
- Coverage warnings / audit hints:
  - [missing] Back + Chest: Could not satisfy "main pull pattern" on Back + Chest (1/2).
  - [missing] Back + Chest: Missing "main pull pattern" on Back + Chest after repair.
  - [coverage] Legs + Abs: Carry coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry coverage target not met (got 0, expected 1).
  - [coverage] Legs + Abs: Carry fallback coverage missing: no accessory slot can be replaced on Legs + Abs.
  - [coverage] Shoulders + Arms: Carry fallback coverage missing: no accessory slot can be replaced on Shoulders + Arms.
  - [coverage] Back + Chest: Carry fallback coverage missing: no accessory slot can be replaced on Back + Chest.
  - [coverage] week: Carry fallback coverage target not met (got 0, expected 1).
  - [violation] Back + Chest: Back + Chest accessory slot debug relabeled back-widow as pull.

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pushup` Push-Up (slot=mainPull lane=pull source=coverage_repair)
  - `prone-elbow-row` Prone Elbow Row (slot=mainPushSecondary lane=push source=uniqueness_swap)
  - `supine-lat-pulldown-isometric` Supine Lat Pulldown Isometric (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `back-widow` Back Widow Pulls (slot=accessorypull lane=pull source=legality_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralSecondary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `split-squat` Split Squat (slot=mainFinal lane=squat source=initial_pick)
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) (slot=mainFinal lane=hinge source=initial_pick)
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainFinal lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, back-widow:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension
- PASS: Lower-back pain does not use back-extension/back-extension-hold as main hinge - none
- PASS: Equipment requirements are respected - all selected exercises eligible
- PASS: No fake chest isolation from rear-delt movements - none
- PASS: Cooldown matches day identity - all cooldowns are in day-aware preference lists

