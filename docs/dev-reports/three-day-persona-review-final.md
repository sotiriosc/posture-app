# 3-Day Persona Review

Deterministic manual-review output for key 3-day profiles.

## Beginner / 3 days / gym / no pain - Phase 1

- Goal: General fitness
- Experience: Beginner
- Equipment: gym
- Pain areas: none
- Phase: Phase 1: Control & Technique
- Main layout signature: Back + Chest=[mainPushCompound:machine-chest-press>mainPullHorizontal:machine-seated-row>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:machine-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:machine-reverse-pec-deck] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - none

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
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-bulgarian-split-squat]
- Coverage warnings / audit hints:
  - none

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
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-bulgarian-split-squat` Dumbbell Bulgarian Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- PASS: Day 3 unilateral lower is not always step-up family - bulgarian_split_squat
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPullHorizontal:cable-seated-row>mainPullVertical:cable-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:machine-hack-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge]
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
  - `machine-hack-squat` Machine Hack Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPushFly:machine-pec-deck-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:machine-reverse-pec-deck>mainSecondaryLoadedShoulder:cable-lateral-raise] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge>mainHamstringIsolation:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - none

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
  - `cable-straight-arm-pulldown` Cable Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainSecondaryLoadedShoulder lane=push source=day_intelligence_repair)
- Accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `cable-biceps-curl` Cable Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainHamstringIsolation lane=hinge source=legality_repair)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - machine-reverse-pec-deck:rear_delt_support, cable-straight-arm-pulldown:back_width
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPushFly:dumbbell-chest-fly>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly>mainSecondaryLoadedShoulder:cable-upright-row] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge>mainHamstringIsolation:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - none

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
  - `cable-straight-arm-pulldown` Cable Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
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
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Wall Angel Hold
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainHamstringIsolation lane=hinge source=legality_repair)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, cable-straight-arm-pulldown:back_width
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - cable-upright-row
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
- PASS: Core does not always pick side-plank family - hollow-body-hold:anti_extension
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
- Main layout signature: Back + Chest=[mainPushCompound:barbell-bench-press-paused>mainPushFly:dumbbell-chest-fly>mainPullHorizontal:cable-seated-row>mainPullVertical:cable-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly>mainSecondaryLoadedShoulder:cable-upright-row] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-bulgarian-split-squat>mainHamstringIsolation:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - none

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
  - `cable-straight-arm-pulldown` Cable Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
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
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-bulgarian-split-squat` Dumbbell Bulgarian Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainHamstringIsolation lane=hinge source=legality_repair)
- Accessory:
  - `cable-woodchop-standing` Cable Woodchop (Standing) (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, cable-straight-arm-pulldown:back_width
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPushFly:machine-pec-deck-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown>mainExtraBackLoaded:single-arm-dumbbell-row] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:machine-reverse-pec-deck>mainSecondaryLoadedShoulder:cable-lateral-raise] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge>mainHamstringIsolation:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - none

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
  - `cable-straight-arm-pulldown` Cable Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `cable-lateral-raise` Cable Lateral Raise (slot=mainSecondaryLoadedShoulder lane=push source=day_intelligence_repair)
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
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainHamstringIsolation lane=hinge source=legality_repair)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
  - `side-plank-star` Side Plank Star (slot=accessorycore lane=core source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - machine-reverse-pec-deck:rear_delt_support, cable-straight-arm-pulldown:back_width
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPushFly:dumbbell-chest-fly>mainPullHorizontal:dumbbell-rows>mainPullVertical:machine-lat-pulldown>mainExtraBackLoaded:single-arm-dumbbell-row] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly>mainSecondaryLoadedShoulder:cable-upright-row] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-bulgarian-split-squat>mainHamstringIsolation:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - none

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
  - `cable-straight-arm-pulldown` Cable Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
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
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Wall Angel Hold
- Main:
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-bulgarian-split-squat` Dumbbell Bulgarian Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainHamstringIsolation lane=hinge source=legality_repair)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
  - `side-plank-star` Side Plank Star (slot=accessorycore lane=core source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, cable-straight-arm-pulldown:back_width
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - cable-upright-row
- PASS: Day 3 unilateral lower is not always step-up family - bulgarian_split_squat
- PASS: Core does not always pick side-plank family - plank:anti_extension, side-plank-star:lateral_stability
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
- Main layout signature: Back + Chest=[mainPushCompound:barbell-bench-press-paused>mainPushFly:dumbbell-chest-fly>mainPullHorizontal:cable-seated-row>mainPullVertical:cable-lat-pulldown>mainExtraBackLoaded:barbell-landmine-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly>mainSecondaryLoadedShoulder:cable-upright-row] | Legs + Abs=[mainSquatPrimary:machine-hack-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge>mainHamstringIsolation:machine-seated-hamstring-curl]
- Coverage warnings / audit hints:
  - none

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
  - `cable-straight-arm-pulldown` Cable Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
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
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `machine-hack-squat` Machine Hack Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl (slot=mainHamstringIsolation lane=hinge source=legality_repair)
- Accessory:
  - `cable-woodchop-standing` Cable Woodchop (Standing) (slot=accessorycore lane=core source=initial_pick)
  - `db-calf-raise` Dumbbell Calf Raise (slot=accessorylower lane=lower source=initial_pick)
  - `machine-ab-crunch` Machine Ab Crunch (slot=accessorycore lane=core source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - dumbbell-rear-delt-fly:rear_delt_support, cable-straight-arm-pulldown:back_width
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
- Main layout signature: Back + Chest=[mainPushCompound:machine-chest-press>mainPullHorizontal:machine-seated-row>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:machine-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderPullPrimary:machine-reverse-pec-deck] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:single-leg-glute-bridge-hold>mainUnilateralLowerLoaded:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - none

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
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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

## Beginner / 3 days / gym / lower back pain - Phase 2

- Goal: Reduce pain
- Experience: Beginner
- Equipment: gym
- Pain areas: lower back
- Phase: Phase 2: Hypertrophy & Capacity
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPullHorizontal:machine-seated-row>mainPullVertical:machine-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:machine-leg-press>mainHingePrimary:barbell-hip-thrust>mainUnilateralLowerLoaded:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - none

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
  - `machine-leg-press` Machine Leg Press (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `barbell-hip-thrust` Barbell Hip Thrust (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-bench-press>mainPullHorizontal:machine-seated-row>mainPullVertical:machine-assisted-pullup] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:cable-lateral-raise>mainShoulderPullPrimary:cable-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:machine-hack-squat>mainHingePrimary:barbell-hip-thrust>mainUnilateralLowerLoaded:dumbbell-bulgarian-split-squat]
- Coverage warnings / audit hints:
  - none

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
  - `machine-hack-squat` Machine Hack Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `barbell-hip-thrust` Barbell Hip Thrust (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-bulgarian-split-squat` Dumbbell Bulgarian Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- PASS: Day 3 unilateral lower is not always step-up family - bulgarian_split_squat
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:seated-lat-sweep-pulse] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:prone-swimmer] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=uniqueness_swap)
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
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:prone-swimmer] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPullHorizontal:dumbbell-rows>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:prone-swimmer] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPushSecondary:archer-pushup>mainPullHorizontal:dumbbell-rows>mainPullVertical:dumbbell-pullover] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:prone-swimmer>mainSecondaryLoadedShoulder:prone-t-raise] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:split-squat>mainSecondarySquat:cossack-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=initial_pick)
  - `archer-pushup` Archer Push-Up (slot=mainPushSecondary lane=push source=uniqueness_swap)
  - `dumbbell-rows` Dumbbell Rows (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `dumbbell-pullover` Dumbbell Pullover (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `prone-swimmer` Prone Swimmer (slot=accessoryback lane=back source=day_intelligence_repair)
  - `dumbbell-row-iso-hold` Dumbbell Row Iso Hold (slot=accessoryback lane=back source=uniqueness_swap)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `cossack-squat` Cossack Squat (slot=mainSecondarySquat lane=squat source=initial_pick)
- Accessory:
  - `plank` Plank (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, dumbbell-row-iso-hold:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat, lateral_lunge_cossack
- PASS: Core does not always pick side-plank family - plank:anti_extension
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPushSecondary:archer-pushup>mainPullHorizontal:dumbbell-rows>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:reverse-snow-angel>mainSecondaryLoadedShoulder:prone-t-raise] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge>mainSecondarySquat:cossack-squat]
- Coverage warnings / audit hints:
  - none

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
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Wall Angel Hold
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `cossack-squat` Cossack Squat (slot=mainSecondarySquat lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPushSecondary:archer-pushup>mainPullHorizontal:dumbbell-rows>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:prone-swimmer>mainSecondaryLoadedShoulder:prone-t-raise] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge>mainSecondarySquat:split-squat]
- Coverage warnings / audit hints:
  - none

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
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainSecondaryLoadedShoulder lane=pull source=day_intelligence_repair)
- Accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `split-squat` Split Squat (slot=mainSecondarySquat lane=squat source=legality_repair)
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
- PASS: Day 3 unilateral lower is not always step-up family - reverse_lunge, split_squat
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPullHorizontal:single-arm-dumbbell-row>mainPullVertical:seated-lat-sweep-pulse] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:reverse-snow-angel] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:single-leg-glute-bridge-hold>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row (slot=mainPullHorizontal lane=pull source=legality_repair)
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
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `hammer-curl` Hammer Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-carry` Suitcase Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPullHorizontal:single-arm-dumbbell-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:reverse-snow-angel] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:single-leg-hip-thrust>mainUnilateralLowerLoaded:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row (slot=mainPullHorizontal lane=pull source=legality_repair)
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
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:dumbbell-floor-press>mainPullHorizontal:single-arm-dumbbell-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:dumbbell-shoulder-press>mainLateralDeltPrimary:dumbbell-lateral-raise>mainShoulderStructuralPrimary:reverse-snow-angel] | Legs + Abs=[mainSquatPrimary:goblet-squat>mainHingePrimary:db-rdl>mainUnilateralLowerLoaded:dumbbell-reverse-lunge]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `dumbbell-floor-press` Dumbbell Floor Press (slot=mainPushCompound lane=push source=day_intelligence_repair)
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row (slot=mainPullHorizontal lane=pull source=legality_repair)
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
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `db-biceps-curl` Dumbbell Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `farmers-carry` Farmer's Carry (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `goblet-squat` Goblet Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `db-rdl` Dumbbell Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:band-rdl>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Band Pull-Aparts
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorycore lane=core source=initial_pick)
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
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown-kneeling] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:band-rdl>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
- Accessory:
  - `band-woodchop` Band Woodchop (slot=accessorycore lane=core source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-chest-fly:chest_isolation
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=true
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - band-woodchop:anti_rotation
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
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPullHorizontal:split-stance-row>mainPullVertical:standing-band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:band-rdl>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Band Pull-Aparts
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorycore lane=core source=initial_pick)
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
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPushFly:band-chest-fly>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly>mainSecondaryLoadedShoulder:prone-t-raise] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:band-rdl>mainUnilateralLowerLoaded:split-squat>mainSecondarySquat:cossack-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Band Pull-Aparts
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `band-chest-fly` Band Chest Fly (slot=mainPushFly lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `band-lat-pulldown` Band Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-straight-arm-pulldown` Band Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `band-overhead-press` Band Overhead Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=legality_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainSecondaryLoadedShoulder lane=pull source=legality_repair)
- Accessory:
  - `band-overhead-triceps-extension` Band Overhead Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `cossack-squat` Cossack Squat (slot=mainSecondarySquat lane=squat source=initial_pick)
- Accessory:
  - `band-woodchop` Band Woodchop (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: 90/90 Breathing

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-straight-arm-pulldown:back_width
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat, lateral_lunge_cossack
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
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPushFly:band-chest-fly>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly>mainSecondaryLoadedShoulder:prone-t-raise] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:band-rdl>mainUnilateralLowerLoaded:split-squat>mainSecondarySquat:cossack-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `band-chest-fly` Band Chest Fly (slot=mainPushFly lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `band-lat-pulldown` Band Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-straight-arm-pulldown` Band Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `band-overhead-press` Band Overhead Press (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=legality_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainSecondaryLoadedShoulder lane=pull source=legality_repair)
- Accessory:
  - `band-triceps-pressdown` Band Triceps Pressdown (slot=accessorypush lane=push source=day_intelligence_repair)
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Wall Angel Hold
- Main:
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `band-rdl` Band Romanian Deadlift (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `cossack-squat` Cossack Squat (slot=mainSecondarySquat lane=squat source=legality_repair)
- Accessory:
  - `band-woodchop` Band Woodchop (slot=accessorycore lane=core source=initial_pick)
  - `single-leg-calf-raise` Single-Leg Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-straight-arm-pulldown:back_width
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
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPushFly:band-chest-fly>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly>mainSecondaryLoadedShoulder:prone-t-raise] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:single-leg-rdl>mainUnilateralLowerLoaded:split-squat>mainSecondaryHinge:band-rdl]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Band Pull-Aparts
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `band-chest-fly` Band Chest Fly (slot=mainPushFly lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
  - `band-lat-pulldown` Band Lat Pulldown (slot=mainPullVertical lane=pull source=initial_pick)
- Accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=accessoryback lane=back source=day_intelligence_repair)
  - `band-straight-arm-pulldown` Band Straight-Arm Pulldown (slot=accessoryback lane=back source=day_intelligence_repair)
- Cooldown: Doorway Pec Stretch

### Shoulders + Arms
- Warm-up: Wall Slides
- Corrective: Scapular Push-Ups
- Main:
  - `pike-pushup` Pike Push-Up (slot=mainVerticalPushPrimary lane=verticalPush source=day_intelligence_repair)
  - `band-lateral-raise` Band Lateral Raise (slot=mainLateralDeltPrimary lane=push source=day_intelligence_repair)
  - `band-rear-delt-fly` Band Rear Delt Fly (slot=mainShoulderPullPrimary lane=pull source=day_intelligence_repair)
  - `prone-t-raise` Prone T Raise (slot=mainSecondaryLoadedShoulder lane=pull source=legality_repair)
- Accessory:
  - `band-triceps-pressdown` Band Triceps Pressdown (slot=accessorypush lane=push source=day_intelligence_repair)
  - `band-biceps-curl` Band Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `band-suitcase-march` Band Suitcase March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Dead Bug
- Main:
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
  - `band-rdl` Band Romanian Deadlift (slot=mainSecondaryHinge lane=hinge source=legality_repair)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorycore lane=core source=initial_pick)
  - `band-calf-raise` Band Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hip Flexor Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- PASS: Day 1 accessories are not both rear/scap support unless justified - band-rear-delt-fly:rear_delt_support, band-straight-arm-pulldown:back_width
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=1
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - pallof-press:anti_rotation
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
- Main layout signature: Back + Chest=[mainPushCompound:band-chest-press>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown-neutral-grip] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:single-leg-glute-bridge-hold>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-chest-press` Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorycore lane=core source=initial_pick)
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
- Main layout signature: Back + Chest=[mainPushCompound:split-stance-band-chest-press>mainPullHorizontal:split-stance-row>mainPullVertical:band-lat-pulldown-neutral-grip] | Shoulders + Arms=[mainVerticalPushPrimary:band-overhead-press>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:single-leg-hip-thrust>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `split-stance-row` Split Stance Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorycore lane=core source=initial_pick)
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
- Main layout signature: Back + Chest=[mainPushCompound:band-chest-press>mainPullHorizontal:banded-rows-seated>mainPullVertical:band-lat-pulldown-neutral-grip] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:band-lateral-raise>mainShoulderPullPrimary:band-rear-delt-fly] | Legs + Abs=[mainSquatPrimary:band-front-squat>mainHingePrimary:single-leg-rdl>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `band-chest-press` Band Chest Press (slot=mainPushCompound lane=push source=initial_pick)
  - `banded-rows-seated` Seated Band Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `band-front-squat` Band Front Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
- Accessory:
  - `pallof-press` Pallof Press (slot=accessorycore lane=core source=initial_pick)
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
- Main layout signature: Back + Chest=[mainPushCompound:pushup>mainPullHorizontal:supine-elbow-drive-row>mainPullVertical:seated-lat-sweep-pulse] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralPrimary:prone-swimmer] | Legs + Abs=[mainSquatPrimary:heels-elevated-squat>mainHingePrimary:single-leg-hip-thrust>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `pushup` Push-Up (slot=mainPushCompound lane=push source=initial_pick)
  - `supine-elbow-drive-row` Supine Elbow Drive Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:pushup>mainPullHorizontal:supine-elbow-drive-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralPrimary:prone-swimmer] | Legs + Abs=[mainSquatPrimary:split-squat>mainHingePrimary:single-leg-rdl>mainSecondarySquat:heels-elevated-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Wall Angel Hold
- Main:
  - `pushup` Push-Up (slot=mainPushCompound lane=push source=initial_pick)
  - `supine-elbow-drive-row` Supine Elbow Drive Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Chin Tucks

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `split-squat` Split Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainSecondarySquat lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:pushup>mainPullHorizontal:supine-elbow-drive-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralPrimary:prone-swimmer] | Legs + Abs=[mainSquatPrimary:split-squat>mainHingePrimary:single-leg-rdl>mainSecondarySquat:heels-elevated-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Wall Slides
- Corrective: Prone Y-T-W Raises
- Main:
  - `pushup` Push-Up (slot=mainPushCompound lane=push source=initial_pick)
  - `supine-elbow-drive-row` Supine Elbow Drive Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `prone-swimmer` Prone Swimmer (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Ankle Mobility Rocks
- Corrective: Glute Bridges
- Main:
  - `split-squat` Split Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainSecondarySquat lane=squat source=legality_repair)
- Accessory:
  - `hollow-body-hold` Hollow Body Hold (slot=accessorycore lane=core source=initial_pick)
  - `standing-calf-raise` Standing Calf Raise (slot=accessorylower lane=lower source=initial_pick)
- Cooldown: Hamstring Stretch

### Issue Checklist
- PASS: Day 1 has push + horizontal pull + vertical pull or surrogate - push=true, horizontalPull=true, verticalOrSurrogate=true
- INFO: Day 1 accessories are not both rear/scap support unless justified - prone-swimmer:rear_delt_support, back-widow:rear_delt_support
- INFO: Day 1 has truthful chest isolation when chest deficit and context justify it - contextJustified=false, accessoryChestIsolation=false
- PASS: Day 2 does not over-stack rear-delt family - rearDeltMains=0
- PASS: Upright row appears only in safe profiles - none
- PASS: Day 3 unilateral lower is not always step-up family - split_squat
- PASS: Core does not always pick side-plank family - hollow-body-hold:anti_extension
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
- Main layout signature: Back + Chest=[mainPushCompound:pushup>mainPullHorizontal:supine-elbow-drive-row>mainPullVertical:seated-lat-sweep-pulse] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralPrimary:reverse-snow-angel] | Legs + Abs=[mainSquatPrimary:heels-elevated-squat>mainHingePrimary:single-leg-glute-bridge-hold>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pushup` Push-Up (slot=mainPushCompound lane=push source=initial_pick)
  - `supine-elbow-drive-row` Supine Elbow Drive Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:pushup>mainPullHorizontal:prone-elbow-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralPrimary:reverse-snow-angel] | Legs + Abs=[mainSquatPrimary:split-squat>mainHingePrimary:single-leg-hip-thrust>mainSecondarySquat:heels-elevated-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pushup` Push-Up (slot=mainPushCompound lane=push source=initial_pick)
  - `prone-elbow-row` Prone Elbow Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `split-squat` Split Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-hip-thrust` Single-Leg Hip Thrust (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainSecondarySquat lane=squat source=legality_repair)
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
- Main layout signature: Back + Chest=[mainPushCompound:pushup>mainPullHorizontal:prone-elbow-row>mainPullVertical:supine-lat-pulldown-isometric] | Shoulders + Arms=[mainVerticalPushPrimary:pike-pushup>mainLateralDeltPrimary:prone-t-raise>mainShoulderStructuralPrimary:reverse-snow-angel] | Legs + Abs=[mainSquatPrimary:heels-elevated-squat>mainHingePrimary:single-leg-rdl>mainUnilateralLowerLoaded:split-squat]
- Coverage warnings / audit hints:
  - none

### Back + Chest
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `pushup` Push-Up (slot=mainPushCompound lane=push source=initial_pick)
  - `prone-elbow-row` Prone Elbow Row (slot=mainPullHorizontal lane=pull source=initial_pick)
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
  - `reverse-snow-angel` Reverse Snow Angels (slot=mainShoulderStructuralPrimary lane=pull source=day_intelligence_repair)
- Accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension (slot=accessorypush lane=push source=day_intelligence_repair)
  - `towel-biceps-curl-hold` Towel Biceps Curl Hold (slot=accessorypull lane=pull source=day_intelligence_repair)
  - `suitcase-hold-march` Suitcase Hold March (slot=accessorycore lane=core source=day_intelligence_repair)
- Cooldown: Thread-the-Needle

### Legs + Abs
- Warm-up: Cat-Cow Flow
- Corrective: Dead Bug
- Main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat (slot=mainSquatPrimary lane=squat source=legality_repair)
  - `single-leg-rdl` Single-Leg RDL (Bodyweight) (slot=mainHingePrimary lane=hinge source=legality_repair)
  - `split-squat` Split Squat (slot=mainUnilateralLowerLoaded lane=squat source=legality_repair)
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

