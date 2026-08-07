# Program Quality V2 — Fuzz-Integrity Blind Samples

Uncurated deterministic sample for independent review. Includes every fallback case and full failed-case diagnostics.

Blind total: 50
Fallback total: 0
Failed diagnostics: 0

## Blind samples (10 per mode)

### Blind 1 — gym #0

- Seed: `gym-fuzz-9e37e786`
- Structural key: `gym||Beginner||1||3||General fitness||||gym|bandSetup:none||db-rdl`
- Blocked exercise: db-rdl
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `2977af5f`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, prone-ytw, machine-chest-press, machine-seated-row, machine-lat-pulldown, prone-y-raise, dumbbell-chest-fly, thread-the-needle
  - Day 2: wall-slides, scapular-pushups, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: ankle-mobility, glute-bridges, machine-leg-press, machine-glute-drive, dumbbell-reverse-lunge, plank, db-calf-raise, hamstring-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["gym"],"daysPerWeek":3},"phaseIndex":1,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`

### Blind 2 — gym #1007

- Seed: `gym-fuzz-fa6fd29f`
- Structural key: `gym||Advanced||3||3||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `4c455e4a`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, barbell-bench-press-paused, dumbbell-chest-fly, cable-seated-row, cable-lat-pulldown, dumbbell-rows, dumbbell-rear-delt-fly, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, barbell-strict-press, cable-lateral-raise, cable-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, goblet-squat, db-rdl, dumbbell-reverse-lunge, machine-seated-hamstring-curl, cable-woodchop-standing, db-calf-raise, machine-ab-crunch, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Upper back"],"experience":"Advanced","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 3 — gym #2014

- Seed: `gym-fuzz-56a68e89`
- Structural key: `gym||Intermediate||3||4||Reduce pain||hips||bands,gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `cbe7208b`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, dumbbell-floor-press, dumbbell-arnold-press, machine-chest-press, bodyweight-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, glute-bridges, machine-leg-press, db-rdl, dumbbell-step-up-loaded, pallof-press, band-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-chest-supported-row, cable-lat-pulldown, dumbbell-rows, band-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, glute-bridges, barbell-hip-thrust, barbell-back-squat, db-rdl, standing-calf-raise, farmers-carry, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Hips"],"experience":"Intermediate","equipment":["gym","bands"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 4 — gym #3021

- Seed: `gym-fuzz-b2de35b0`
- Structural key: `gym||Beginner||3||5||Athletic performance||hips,lower back||gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `29650fc0`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, dumbbell-floor-press, dumbbell-shoulder-press, close-grip-pushup, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, glute-bridges, machine-leg-press, db-rdl, side-plank-star, db-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-rows, cable-lat-pulldown, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, glute-bridges, machine-glute-drive, dumbbell-step-up-loaded, side-plank-star, standing-calf-raise, breathing-90-90
  - Day 5: cat-cow, dead-bug, machine-seated-row, dumbbell-shoulder-press, bodyweight-triceps-extension, cable-biceps-curl, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Beginner","equipment":["gym"],"daysPerWeek":5},"phaseIndex":3}`

### Blind 5 — gym #4028

- Seed: `gym-fuzz-f1639bb`
- Structural key: `gym||Advanced||2||3||Improve posture||neck||dumbbells,gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `65150b1c`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, dumbbell-rear-delt-fly, cable-external-rotation-pressout, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, dumbbell-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, goblet-squat, db-rdl, dumbbell-reverse-lunge, machine-seated-hamstring-curl, plank, db-calf-raise, side-plank-star, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Neck"],"experience":"Advanced","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 6 — gym #5035

- Seed: `gym-fuzz-6b4d8ea1`
- Structural key: `gym||Intermediate||2||4||Reduce pain||upper back||bands,gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `ebfb71be`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, db-rdl, machine-leg-press, pallof-press, single-leg-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, band-lat-pulldown, single-arm-band-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, db-rdl, split-squat, band-rdl, standing-calf-raise, farmers-carry, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Upper back"],"experience":"Intermediate","equipment":["gym","bands"],"daysPerWeek":4},"phaseIndex":2}`

### Blind 7 — gym #6042

- Seed: `gym-fuzz-c78552ae`
- Structural key: `gym||Beginner||2||5||Athletic performance||hips||gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `b0e32c71`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, dumbbell-floor-press, dumbbell-shoulder-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, glute-bridges, dumbbell-bulgarian-split-squat, barbell-hip-thrust, side-plank-star, single-leg-calf-raise, hip-flexor-stretch
  - Day 3: cat-cow, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, glute-bridges, machine-glute-drive, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, hip-flexor-stretch
  - Day 5: cat-cow, wall-angel-hold, machine-seated-row, dumbbell-shoulder-press, bodyweight-triceps-extension, cable-biceps-curl, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Hips"],"experience":"Beginner","equipment":["gym"],"daysPerWeek":5},"phaseIndex":2}`

### Blind 8 — gym #7049

- Seed: `gym-fuzz-23bd67d7`
- Structural key: `gym||Advanced||1||3||Improve posture||hips,lower back||bands,gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `0427beec`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, machine-pec-deck-press, machine-seated-row, band-lat-pulldown-neutral-grip, banded-rows-seated, band-rear-delt-fly, band-face-pull-high-anchor, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, cable-lateral-raise, overhead-cable-triceps-extension, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, glute-bridges, machine-leg-press, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, machine-seated-hamstring-curl, pallof-press, db-calf-raise, side-plank-star, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["gym","bands"],"daysPerWeek":3},"phaseIndex":1}`

### Blind 9 — gym #8056

- Seed: `gym-fuzz-7ff48c5d`
- Structural key: `gym||Intermediate||1||4||Reduce pain||neck||gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `dcdf068e`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, db-triceps-extension, machine-rear-delt-row, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, machine-leg-press, db-rdl, split-squat, side-plank, db-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, db-rdl, cossack-squat, back-extension, standing-calf-raise, farmers-carry, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Intermediate","equipment":["gym"],"daysPerWeek":4},"phaseIndex":1}`

### Blind 10 — gym #9063

- Seed: `gym-fuzz-dc2c7ec4`
- Structural key: `gym||Beginner||1||5||Athletic performance||shoulders||dumbbells,gym|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `097b36fb`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, machine-leg-press, db-rdl, side-plank, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, prone-ytw, dumbbell-rows, machine-lat-pulldown, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, db-rdl, split-squat, side-plank, standing-calf-raise, thread-the-needle
  - Day 5: wall-slides, wall-angel-hold, machine-seated-row, machine-shoulder-press, db-triceps-extension, cable-biceps-curl, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["gym","dumbbells"],"daysPerWeek":5},"phaseIndex":1}`

### Blind 11 — dumbbells #0

- Seed: `db-fuzz-9e37e786`
- Structural key: `dumbbells||Beginner||1||3||General fitness||||dumbbells|bandSetup:none||db-rdl`
- Blocked exercise: db-rdl
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `4bb24368`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, farmers-carry, db-triceps-extension, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, dumbbell-rows, pushup, hollow-body-hold, single-leg-hip-thrust, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":3},"phaseIndex":1,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`

### Blind 12 — dumbbells #1007

- Seed: `db-fuzz-fa6fd29f`
- Structural key: `dumbbells||Advanced||3||3||Improve posture||lower back||dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `f34e5922`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, single-arm-dumbbell-row, dumbbell-floor-press, single-leg-hip-thrust, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, dumbbell-sumo-rdl, db-triceps-extension, single-arm-dumbbell-row, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-pullover, single-arm-dumbbell-row, single-leg-rdl, pushup, single-leg-hip-thrust, farmers-carry, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 13 — dumbbells #2014

- Seed: `db-fuzz-56a68e89`
- Structural key: `dumbbells||Intermediate||3||4||Reduce pain||shoulders,upper back||dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `f94bfd17`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-pullover, dumbbell-floor-press, single-leg-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, heels-elevated-squat, farmers-carry, db-biceps-curl, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 14 — dumbbells #3021

- Seed: `db-fuzz-b2de35b0`
- Structural key: `dumbbells||Beginner||3||5||Athletic performance||shoulders||dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `6bdb338b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, farmers-carry, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-rows, dumbbell-floor-press, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, heels-elevated-squat, dumbbell-sumo-rdl, standing-calf-raise, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":3}`

### Blind 15 — dumbbells #4028

- Seed: `db-fuzz-f1639bb`
- Structural key: `dumbbells||Advanced||2||3||Improve posture||hips||dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `869b7ab4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-pullover, single-arm-dumbbell-row, single-leg-hip-thrust, pushup, cossack-squat, side-plank-star, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 16 — dumbbells #5035

- Seed: `db-fuzz-6b4d8ea1`
- Structural key: `dumbbells||Intermediate||2||4||Reduce pain||neck||dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `260953ea`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, single-arm-dumbbell-row, pushup, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-pullover, dumbbell-floor-press, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, heels-elevated-squat, farmers-carry, db-biceps-curl, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2}`

### Blind 17 — dumbbells #6042

- Seed: `db-fuzz-c78552ae`
- Structural key: `dumbbells||Beginner||2||5||Athletic performance||upper back||dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `fcf2b9ba`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, single-arm-dumbbell-row, pushup, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, cossack-squat, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-rows, dumbbell-floor-press, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, heels-elevated-squat, single-leg-rdl, standing-calf-raise, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Upper back"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":2}`

### Blind 18 — dumbbells #7049

- Seed: `db-fuzz-23bd67d7`
- Structural key: `dumbbells||Advanced||1||3||Improve posture||shoulders,upper back||bench,dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `4f522e74`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, single-arm-dumbbell-row, incline-pushup, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, side-plank, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, single-arm-dumbbell-row, single-arm-dumbbell-row, db-rdl, pushup, bodyweight-good-morning, side-plank, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":3},"phaseIndex":1}`

### Blind 19 — dumbbells #8056

- Seed: `db-fuzz-7ff48c5d`
- Structural key: `dumbbells||Intermediate||1||4||Reduce pain||||bench,dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `1059b04b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, single-arm-dumbbell-row, dumbbell-floor-press, db-rdl, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: cat-cow, dead-bug, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, dumbbell-pullover, pushup, db-rdl, db-triceps-extension, plank, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, plank, db-biceps-curl, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":[],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":1}`

### Blind 20 — dumbbells #9063

- Seed: `db-fuzz-dc2c7ec4`
- Structural key: `dumbbells||Beginner||1||5||Athletic performance||lower back||bench,dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `bf3c778c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, single-arm-dumbbell-row, dumbbell-floor-press, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, side-plank, db-biceps-curl, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, dumbbell-rows, pushup, db-triceps-extension, side-plank, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, heels-elevated-squat, single-leg-glute-bridge-hold, standing-calf-raise, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Beginner","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":1}`

### Blind 21 — bands #0

- Seed: `band-fuzz-9e37e786`
- Structural key: `bands||Beginner||1||3||General fitness||||bands|bandSetup:none||db-rdl`
- Blocked exercise: db-rdl
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `fc7124b3`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, heels-elevated-squat, band-pull-apart, pushup, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, glute-bridges, single-leg-hip-thrust, split-squat, pike-pushup, supine-elbow-drive-row, bodyweight-triceps-extension, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, close-grip-pushup, band-pull-apart, supine-elbow-drive-row, hollow-body-hold, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["bands"],"daysPerWeek":3},"phaseIndex":1,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`

### Blind 22 — bands #1007

- Seed: `band-fuzz-fa6fd29f`
- Structural key: `bands||Advanced||3||3||Improve posture||lower back||bands|both_no_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `25463858`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, band-chest-press, split-stance-row, single-leg-hip-thrust, band-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, band-overhead-press, band-row, supine-elbow-drive-row, bodyweight-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, split-stance-row, band-rdl, supine-elbow-drive-row, marching-brace-hold, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands"],"daysPerWeek":3,"bandSetup":"both_no_anchor"},"phaseIndex":3}`

### Blind 23 — bands #2014

- Seed: `band-fuzz-56a68e89`
- Structural key: `bands||Intermediate||3||4||Reduce pain||shoulders,upper back||bands|long_no_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `9ea9dcf8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, band-chest-press, split-stance-row, band-rdl, marching-brace-hold, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, split-squat, pike-pushup, band-row, standing-calf-raise, face-pull, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, split-stance-row, pushup, single-leg-glute-bridge-hold, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-band-row, band-front-squat, face-pull, band-biceps-curl, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Intermediate","equipment":["bands"],"daysPerWeek":4,"bandSetup":"long_no_anchor"},"phaseIndex":3}`

### Blind 24 — bands #3021

- Seed: `band-fuzz-b2de35b0`
- Structural key: `bands||Beginner||3||5||Athletic performance||shoulders||bands|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `c97da829`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, heels-elevated-squat, band-pull-apart, pushup, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, band-pull-aparts, single-leg-hip-thrust, split-squat, pike-pushup, marching-brace-hold, towel-biceps-curl-hold, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, split-squat, close-grip-pushup, band-pull-apart, marching-brace-hold, bodyweight-triceps-extension, thread-the-needle
  - Day 4: wall-slides, band-pull-aparts, pushup, band-pull-apart, bodyweight-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, heels-elevated-squat, single-leg-glute-bridge-hold, standing-calf-raise, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["bands"],"daysPerWeek":5},"phaseIndex":3}`

### Blind 25 — bands #4028

- Seed: `band-fuzz-f1639bb`
- Structural key: `bands||Advanced||2||3||Improve posture||hips||bands|both_no_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `de6c08c8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, split-stance-row, band-chest-press, single-leg-hip-thrust, standing-calf-raise, band-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, band-overhead-press, band-row, supine-elbow-drive-row, bodyweight-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, split-stance-row, single-leg-hip-thrust, supine-elbow-drive-row, side-plank-star, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Advanced","equipment":["bands"],"daysPerWeek":3,"bandSetup":"both_no_anchor"},"phaseIndex":2}`

### Blind 26 — bands #5035

- Seed: `band-fuzz-6b4d8ea1`
- Structural key: `bands||Intermediate||2||4||Reduce pain||neck||bands|long_no_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `891648e9`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, split-stance-row, band-chest-press, band-rdl, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, split-squat, pike-pushup, band-row, marching-brace-hold, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, split-stance-row, single-leg-glute-bridge-hold, marching-brace-hold, bodyweight-triceps-extension, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-band-row, band-front-squat, marching-brace-hold, band-biceps-curl, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Intermediate","equipment":["bands"],"daysPerWeek":4,"bandSetup":"long_no_anchor"},"phaseIndex":2}`

### Blind 27 — bands #6042

- Seed: `band-fuzz-c78552ae`
- Structural key: `bands||Beginner||2||5||Athletic performance||upper back||bands|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `6bcd39c3`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, band-pull-apart, pushup, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, split-squat, pike-pushup, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, close-grip-pushup, band-pull-apart, marching-brace-hold, bodyweight-triceps-extension, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, band-pull-apart, bodyweight-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, heels-elevated-squat, single-leg-glute-bridge-hold, side-plank, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Upper back"],"experience":"Beginner","equipment":["bands"],"daysPerWeek":5},"phaseIndex":2}`

### Blind 28 — bands #7049

- Seed: `band-fuzz-23bd67d7`
- Structural key: `bands||Advanced||1||3||Improve posture||shoulders,upper back||bands|both_with_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `13a3fd4f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, split-stance-row, split-stance-band-chest-press, single-leg-hip-thrust, standing-calf-raise, band-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, pike-pushup, band-row, band-triceps-pressdown, supine-elbow-drive-row, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, band-lat-pulldown, single-leg-hip-thrust, band-woodchop, supine-elbow-drive-row, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Advanced","equipment":["bands"],"daysPerWeek":3,"bandSetup":"both_with_anchor"},"phaseIndex":1}`

### Blind 29 — bands #8056

- Seed: `band-fuzz-7ff48c5d`
- Structural key: `bands||Intermediate||1||4||Reduce pain||||bands|long_with_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `b522d67f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, band-front-squat, split-stance-row, split-stance-band-chest-press, band-rdl, standing-calf-raise, pallof-press, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, split-squat, band-overhead-press, band-row, standing-calf-raise, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, heels-elevated-squat, pushup, band-lat-pulldown, single-leg-glute-bridge-hold, band-triceps-pressdown, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-band-row, band-front-squat, band-biceps-curl, pallof-press, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":[],"experience":"Intermediate","equipment":["bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`

### Blind 30 — bands #9063

- Seed: `band-fuzz-dc2c7ec4`
- Structural key: `bands||Beginner||1||5||Athletic performance||lower back||bands|loop_only||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `96b75499`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, pushup, band-pull-apart, towel-biceps-curl-hold, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, split-squat, pike-pushup, side-plank, towel-biceps-curl-hold, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, close-grip-pushup, band-rear-delt-fly, side-plank, bodyweight-triceps-extension, breathing-90-90
  - Day 4: wall-slides, dead-bug, pushup, band-pull-apart, bodyweight-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, heels-elevated-squat, single-leg-hip-thrust, standing-calf-raise, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Beginner","equipment":["bands"],"daysPerWeek":5,"bandSetup":"loop_only"},"phaseIndex":1}`

### Blind 31 — bodyweight #0

- Seed: `bw-fuzz-9e37e786`
- Structural key: `bodyweight||Beginner||1||3||General fitness||||none|bandSetup:none||db-rdl`
- Blocked exercise: db-rdl
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `6b58d4be`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, bodyweight-squat, plank, pushup, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, prone-ytw, bodyweight-good-morning, split-squat, pike-pushup, hollow-body-hold, bodyweight-triceps-extension, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, cossack-squat, prone-elbow-row, close-grip-pushup, hollow-body-hold, reverse-snow-angel, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["none"],"daysPerWeek":3},"phaseIndex":1,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`

### Blind 32 — bodyweight #1007

- Seed: `bw-fuzz-fa6fd29f`
- Structural key: `bodyweight||Advanced||3||3||Improve posture||lower back||bench,none|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `918035cf`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, plank, pushup, single-leg-glute-bridge-hold, split-squat, towel-biceps-curl-hold, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, cossack-squat, pike-pushup, side-plank, marching-brace-hold, reverse-snow-angel, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, shrimp-squat, close-grip-pushup, prone-elbow-row, single-leg-glute-bridge-hold, hollow-body-hold, reverse-snow-angel, marching-brace-hold, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["none","bench"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 33 — bodyweight #2014

- Seed: `bw-fuzz-56a68e89`
- Structural key: `bodyweight||Intermediate||3||4||Reduce pain||shoulders,upper back||none,pullup_bar|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `642a6ecf`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, plank, wall-pushup, single-leg-glute-bridge-hold, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, bodyweight-good-morning, split-squat, pike-pushup, side-plank, marching-brace-hold, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, cossack-squat, scap-pullup, pushup, single-leg-hip-thrust, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, neutral-grip-pullup, heels-elevated-squat, marching-brace-hold, towel-biceps-curl-hold, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Intermediate","equipment":["none","pullup_bar"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 34 — bodyweight #3021

- Seed: `bw-fuzz-b2de35b0`
- Structural key: `bodyweight||Beginner||3||5||Athletic performance||shoulders||none|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `60ca385a`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, plank, pushup, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, dead-bug, bodyweight-good-morning, split-squat, pike-pushup, marching-brace-hold, towel-biceps-curl-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, cossack-squat, close-grip-pushup, prone-elbow-row, marching-brace-hold, bodyweight-triceps-extension, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, back-widow, bodyweight-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, heels-elevated-squat, single-leg-glute-bridge-hold, standing-calf-raise, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["none"],"daysPerWeek":5},"phaseIndex":3}`

### Blind 35 — bodyweight #4028

- Seed: `bw-fuzz-f1639bb`
- Structural key: `bodyweight||Advanced||2||3||Improve posture||hips||bench,none|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `40e5319d`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, split-squat, towel-biceps-curl-hold, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, cossack-squat, pike-pushup, side-plank, side-plank-star, bodyweight-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, shrimp-squat, hollow-body-hold, close-grip-pushup, single-leg-glute-bridge-hold, prone-elbow-row, reverse-snow-angel, side-plank-star, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Advanced","equipment":["none","bench"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 36 — bodyweight #5035

- Seed: `bw-fuzz-6b4d8ea1`
- Structural key: `bodyweight||Intermediate||2||4||Reduce pain||neck||none,pullup_bar|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `19f02886`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, wall-pushup, plank, single-leg-glute-bridge-hold, marching-brace-hold, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, bodyweight-good-morning, split-squat, pike-pushup, side-plank, marching-brace-hold, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, cossack-squat, scap-pullup, pushup, single-leg-hip-thrust, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, neutral-grip-pullup, heels-elevated-squat, marching-brace-hold, towel-biceps-curl-hold, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Intermediate","equipment":["none","pullup_bar"],"daysPerWeek":4},"phaseIndex":2}`

### Blind 37 — bodyweight #6042

- Seed: `bw-fuzz-c78552ae`
- Structural key: `bodyweight||Beginner||2||5||Athletic performance||upper back||none|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `10473da1`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, pushup, plank, towel-biceps-curl-hold, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, bodyweight-good-morning, split-squat, pike-pushup, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, cossack-squat, prone-elbow-row, close-grip-pushup, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, back-widow, bodyweight-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, heels-elevated-squat, single-leg-glute-bridge-hold, side-plank, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Upper back"],"experience":"Beginner","equipment":["none"],"daysPerWeek":5},"phaseIndex":2}`

### Blind 38 — bodyweight #7049

- Seed: `bw-fuzz-23bd67d7`
- Structural key: `bodyweight||Advanced||1||3||Improve posture||shoulders,upper back||foam_roller|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `b45b9f18`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, plank, pushup, single-leg-glute-bridge-hold, split-squat, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, bodyweight-good-morning, cossack-squat, pike-pushup, side-plank, hollow-body-hold, reverse-snow-angel, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, shrimp-squat, hollow-body-hold, close-grip-pushup, single-leg-hip-thrust, prone-elbow-row, side-plank, reverse-snow-angel, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Advanced","equipment":["foam_roller"],"daysPerWeek":3},"phaseIndex":1}`

### Blind 39 — bodyweight #8056

- Seed: `bw-fuzz-7ff48c5d`
- Structural key: `bodyweight||Intermediate||1||4||Reduce pain||||pullup_bar|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `8ae52359`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, bodyweight-squat, plank, wall-pushup, single-leg-glute-bridge-hold, standing-calf-raise, hollow-body-hold, breathing-90-90
  - Day 2: cat-cow, dead-bug, bodyweight-good-morning, split-squat, pike-pushup, side-plank, plank, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, cossack-squat, scap-pullup, pushup, single-leg-hip-thrust, bodyweight-triceps-extension, plank, breathing-90-90
  - Day 4: cat-cow, dead-bug, neutral-grip-pullup, heels-elevated-squat, plank, towel-biceps-curl-hold, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":[],"experience":"Intermediate","equipment":["pullup_bar"],"daysPerWeek":4},"phaseIndex":1}`

### Blind 40 — bodyweight #9063

- Seed: `bw-fuzz-dc2c7ec4`
- Structural key: `bodyweight||Beginner||1||5||Athletic performance||lower back|||bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `daf4c21d`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, bodyweight-squat, plank, pushup, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-glute-bridge-hold, split-squat, pike-pushup, towel-biceps-curl-hold, single-leg-hip-thrust, breathing-90-90
  - Day 3: cat-cow, dead-bug, cossack-squat, prone-elbow-row, close-grip-pushup, bodyweight-triceps-extension, side-plank, breathing-90-90
  - Day 4: wall-slides, dead-bug, pushup, back-widow, bodyweight-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, heels-elevated-squat, single-leg-hip-thrust, standing-calf-raise, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Beginner","equipment":[],"daysPerWeek":5},"phaseIndex":1}`

### Blind 41 — mixedHome #0

- Seed: `mh-fuzz-9e37e786`
- Structural key: `mixedHome||Beginner||1||3||General fitness||||bands,dumbbells|long_with_anchor||db-rdl`
- Blocked exercise: db-rdl
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `50d7db73`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, single-arm-dumbbell-row, dumbbell-floor-press, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, farmers-carry, db-triceps-extension, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, band-woodchop, band-rdl, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":3,"bandSetup":"long_with_anchor"},"phaseIndex":1,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`

### Blind 42 — mixedHome #1007

- Seed: `mh-fuzz-fa6fd29f`
- Structural key: `mixedHome||Advanced||3||3||Improve posture||hips||bands,dumbbells,pullup_bar|long_no_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `e5d885f1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, farmers-carry, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, split-stance-row, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-floor-press, cossack-squat, side-plank-star, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":3,"bandSetup":"long_no_anchor"},"phaseIndex":3}`

### Blind 43 — mixedHome #2014

- Seed: `mh-fuzz-56a68e89`
- Structural key: `mixedHome||Intermediate||3||4||Reduce pain||||bands,bench,dumbbells|loop_only||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `d16d12df`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, suitcase-carry, standing-calf-raise, breathing-90-90
  - Day 2: cat-cow, dead-bug, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, suitcase-carry, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-bulgarian-split-squat, dumbbell-chest-fly, single-arm-dumbbell-row, db-rdl, suitcase-carry, dumbbell-bench-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, goblet-squat, db-triceps-extension, db-biceps-curl, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":[],"experience":"Intermediate","equipment":["dumbbells","bands","bench"],"daysPerWeek":4,"bandSetup":"loop_only"},"phaseIndex":3}`

### Blind 44 — mixedHome #3021

- Seed: `mh-fuzz-b2de35b0`
- Structural key: `mixedHome||Beginner||3||5||Athletic performance||knees||bands,dumbbells,pullup_bar|both_no_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `cb2165a7`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, single-arm-dumbbell-row, dumbbell-floor-press, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, split-stance-row, dumbbell-floor-press, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, db-rdl, farmers-carry, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Knees"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_no_anchor"},"phaseIndex":3}`

### Blind 45 — mixedHome #4028

- Seed: `mh-fuzz-f1639bb`
- Structural key: `mixedHome||Advanced||2||3||Improve posture||shoulders||bands,dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `678394f9`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, single-arm-dumbbell-row, pushup, db-rdl, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, db-rdl, farmers-carry, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, single-arm-dumbbell-row, cossack-squat, farmers-carry, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 46 — mixedHome #5035

- Seed: `mh-fuzz-6b4d8ea1`
- Structural key: `mixedHome||Intermediate||2||4||Reduce pain||shoulders,upper back||bands,dumbbells|long_with_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `916924f1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, single-arm-dumbbell-row, pushup, db-rdl, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-rdl, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, pallof-press, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Intermediate","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":2}`

### Blind 47 — mixedHome #6042

- Seed: `mh-fuzz-c78552ae`
- Structural key: `mixedHome||Beginner||2||5||Athletic performance||upper back||bands,dumbbells,pullup_bar|loop_only||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `37546f62`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, cossack-squat, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-pull-apart, farmers-carry, db-triceps-extension, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, db-rdl, standing-calf-raise, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Upper back"],"experience":"Beginner","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"loop_only"},"phaseIndex":2}`

### Blind 48 — mixedHome #7049

- Seed: `mh-fuzz-23bd67d7`
- Structural key: `mixedHome||Advanced||1||3||Improve posture||hips,lower back||bands,dumbbells,pullup_bar|both_with_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `69023101`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 3: cat-cow, glute-bridges, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, pallof-press, split-squat, thread-the-needle
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":3,"bandSetup":"both_with_anchor"},"phaseIndex":1}`

### Blind 49 — mixedHome #8056

- Seed: `mh-fuzz-7ff48c5d`
- Structural key: `mixedHome||Intermediate||1||4||Reduce pain||lower back||bands,bench,dumbbells|bandSetup:none||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `0fb1cdd0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, side-plank, band-external-rotation, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, side-plank, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, single-arm-dumbbell-row, dumbbell-chest-fly, single-leg-hip-thrust, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, goblet-squat, side-plank, db-biceps-curl, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Intermediate","equipment":["dumbbells","bands","bench"],"daysPerWeek":4},"phaseIndex":1}`

### Blind 50 — mixedHome #9063

- Seed: `mh-fuzz-dc2c7ec4`
- Structural key: `mixedHome||Beginner||1||5||Athletic performance||hips,lower back||bands,dumbbells,pullup_bar|long_with_anchor||blocks:none`
- Blocked exercise: none
- Recovery: false
- Fallback: false
- Final outcome: initialPass / usable_program
- Quality verdict: pass
- Semantic signature: `3bac04c6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, single-arm-dumbbell-row, dumbbell-floor-press, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, face-pull, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, face-pull, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`

## Fallback samples (complete set)

None in this run.

## Failed-case diagnostics

None in this run.
