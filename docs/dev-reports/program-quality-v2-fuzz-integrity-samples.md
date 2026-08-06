# Program Quality V2 — Fuzz-Integrity Blind Samples

Uncurated deterministic sample for independent review. Includes every fallback case and full failed-case diagnostics.

Blind total: 50
Fallback total: 244
Failed diagnostics: 244

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
- Semantic signature: `e3ec207c`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, barbell-bench-press-paused, dumbbell-chest-fly, cable-seated-row, cable-lat-pulldown, dumbbell-rows, dumbbell-rear-delt-fly, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, barbell-strict-press, cable-lateral-raise, cable-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, db-rdl, dumbbell-bulgarian-split-squat, machine-seated-hamstring-curl, cable-woodchop-standing, db-calf-raise, barbell-rollout, thread-the-needle
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
- Semantic signature: `434e8f84`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, dumbbell-rear-delt-fly, cable-external-rotation-pressout, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, dumbbell-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, db-rdl, dumbbell-reverse-lunge, machine-seated-hamstring-curl, plank, db-calf-raise, side-plank-star, thread-the-needle
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
- Semantic signature: `dd49dbf1`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, dumbbell-floor-press, dumbbell-shoulder-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, glute-bridges, dumbbell-step-up-loaded, barbell-hip-thrust, side-plank-star, single-leg-calf-raise, hip-flexor-stretch
  - Day 3: cat-cow, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, glute-bridges, machine-glute-drive, dumbbell-bulgarian-split-squat, standing-calf-raise, farmers-carry, hip-flexor-stretch
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
- Semantic signature: `f2bfbd70`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, pushup, dumbbell-rows, hollow-body-hold, single-leg-hip-thrust, breathing-90-90
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
- Semantic signature: `4492a67c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, dumbbell-sumo-rdl, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-leg-rdl, single-arm-dumbbell-row, farmers-carry, single-leg-hip-thrust, thread-the-needle
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
- Semantic signature: `231424d9`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, single-leg-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, farmers-carry, thread-the-needle
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
- Semantic signature: `12bf26c5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
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
- Semantic signature: `06bf97f2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, side-plank-star, cossack-squat, thread-the-needle
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
- Semantic signature: `329645fa`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, farmers-carry, thread-the-needle
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
- Semantic signature: `38da37a2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, cossack-squat, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
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
- Semantic signature: `694dad7a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, single-arm-dumbbell-row, db-rdl, single-arm-dumbbell-row, side-plank, bodyweight-good-morning, thread-the-needle
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
- Semantic signature: `0a84f2dd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: cat-cow, dead-bug, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, db-rdl, db-triceps-extension, plank, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, plank, breathing-90-90
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
- Semantic signature: `eced40f6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, breathing-90-90
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
- Semantic signature: `0ae1ba53`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, heels-elevated-squat, pushup, band-pull-apart, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, glute-bridges, single-leg-hip-thrust, split-squat, pike-pushup, bodyweight-triceps-extension, supine-elbow-drive-row, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, close-grip-pushup, band-pull-apart, hollow-body-hold, supine-elbow-drive-row, breathing-90-90
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
- Semantic signature: `2b699f5c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, band-chest-press, split-stance-row, single-leg-hip-thrust, standing-calf-raise, band-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, band-overhead-press, band-row, bodyweight-triceps-extension, supine-elbow-drive-row, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, split-stance-row, band-rdl, marching-brace-hold, supine-elbow-drive-row, thread-the-needle
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
- Semantic signature: `35bd85b8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, band-chest-press, split-stance-row, band-rdl, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, split-squat, pike-pushup, band-row, face-pull, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, split-stance-row, single-leg-glute-bridge-hold, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
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
- Semantic signature: `0fd3e4dd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, heels-elevated-squat, pushup, band-pull-apart, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, band-pull-aparts, single-leg-hip-thrust, split-squat, pike-pushup, towel-biceps-curl-hold, marching-brace-hold, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, split-squat, close-grip-pushup, band-pull-apart, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
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
- Semantic signature: `68557768`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, band-chest-press, split-stance-row, single-leg-hip-thrust, standing-calf-raise, band-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, band-overhead-press, band-row, bodyweight-triceps-extension, supine-elbow-drive-row, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, split-stance-row, single-leg-hip-thrust, side-plank-star, supine-elbow-drive-row, thread-the-needle
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
- Semantic signature: `94e5ec09`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, band-chest-press, split-stance-row, band-rdl, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, split-squat, pike-pushup, band-row, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, split-stance-row, single-leg-glute-bridge-hold, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-band-row, band-front-squat, band-biceps-curl, marching-brace-hold, thread-the-needle
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
- Semantic signature: `e28baa67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, band-pull-apart, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, split-squat, pike-pushup, towel-biceps-curl-hold, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, close-grip-pushup, band-pull-apart, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
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
- Semantic signature: `764cc53f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, band-front-squat, split-stance-band-chest-press, split-stance-row, single-leg-hip-thrust, standing-calf-raise, band-biceps-curl, thread-the-needle
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
- Semantic signature: `c401796f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, band-front-squat, split-stance-band-chest-press, split-stance-row, band-rdl, standing-calf-raise, pallof-press, breathing-90-90
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
- Semantic signature: `d213f8ab`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, pushup, band-pull-apart, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, split-squat, pike-pushup, towel-biceps-curl-hold, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, close-grip-pushup, band-rear-delt-fly, bodyweight-triceps-extension, side-plank, breathing-90-90
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
- Semantic signature: `f16e8032`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, bodyweight-squat, pushup, plank, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, prone-ytw, bodyweight-good-morning, split-squat, pike-pushup, bodyweight-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, cossack-squat, close-grip-pushup, prone-elbow-row, hollow-body-hold, reverse-snow-angel, breathing-90-90
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
- Semantic signature: `55f76115`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, split-squat, towel-biceps-curl-hold, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, cossack-squat, pike-pushup, side-plank, reverse-snow-angel, marching-brace-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, shrimp-squat, close-grip-pushup, prone-elbow-row, single-leg-glute-bridge-hold, hollow-body-hold, marching-brace-hold, reverse-snow-angel, thread-the-needle
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
- Semantic signature: `a159e849`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, wall-pushup, plank, single-leg-glute-bridge-hold, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, bodyweight-good-morning, split-squat, pike-pushup, side-plank, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, cossack-squat, pushup, scap-pullup, single-leg-hip-thrust, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, neutral-grip-pullup, heels-elevated-squat, towel-biceps-curl-hold, marching-brace-hold, thread-the-needle
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
- Semantic signature: `48cd0406`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, pushup, plank, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, dead-bug, bodyweight-good-morning, split-squat, pike-pushup, towel-biceps-curl-hold, marching-brace-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, cossack-squat, close-grip-pushup, prone-elbow-row, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
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
- Semantic signature: `2219a71b`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, split-squat, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, cossack-squat, pike-pushup, side-plank, bodyweight-triceps-extension, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, shrimp-squat, close-grip-pushup, prone-elbow-row, single-leg-glute-bridge-hold, hollow-body-hold, side-plank-star, reverse-snow-angel, thread-the-needle
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
- Semantic signature: `46db64a2`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, wall-pushup, plank, single-leg-glute-bridge-hold, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, bodyweight-good-morning, split-squat, pike-pushup, side-plank, standing-calf-raise, marching-brace-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, cossack-squat, pushup, scap-pullup, single-leg-hip-thrust, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, neutral-grip-pullup, heels-elevated-squat, towel-biceps-curl-hold, marching-brace-hold, thread-the-needle
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
- Semantic signature: `c8b15191`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, pushup, plank, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, bodyweight-good-morning, split-squat, pike-pushup, towel-biceps-curl-hold, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, cossack-squat, close-grip-pushup, prone-elbow-row, bodyweight-triceps-extension, marching-brace-hold, thread-the-needle
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
- Semantic signature: `a1320494`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, split-squat, standing-calf-raise, towel-biceps-curl-hold, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, bodyweight-good-morning, cossack-squat, pike-pushup, side-plank, reverse-snow-angel, hollow-body-hold, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, shrimp-squat, close-grip-pushup, prone-elbow-row, single-leg-hip-thrust, hollow-body-hold, side-plank, reverse-snow-angel, thread-the-needle
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
- Semantic signature: `fabbd631`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, bodyweight-squat, wall-pushup, plank, single-leg-glute-bridge-hold, standing-calf-raise, hollow-body-hold, breathing-90-90
  - Day 2: cat-cow, dead-bug, bodyweight-good-morning, split-squat, pike-pushup, side-plank, standing-calf-raise, plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, cossack-squat, pushup, scap-pullup, single-leg-hip-thrust, bodyweight-triceps-extension, plank, breathing-90-90
  - Day 4: cat-cow, dead-bug, neutral-grip-pullup, heels-elevated-squat, towel-biceps-curl-hold, plank, breathing-90-90
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
- Semantic signature: `4be55423`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, bodyweight-squat, pushup, plank, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-glute-bridge-hold, split-squat, pike-pushup, single-leg-hip-thrust, towel-biceps-curl-hold, breathing-90-90
  - Day 3: cat-cow, dead-bug, cossack-squat, close-grip-pushup, prone-elbow-row, bodyweight-triceps-extension, side-plank, breathing-90-90
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
- Semantic signature: `81258ad1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, breathing-90-90
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
- Semantic signature: `3bb061c9`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, split-stance-row, single-leg-hip-thrust, single-arm-dumbbell-row, side-plank-star, cossack-squat, thread-the-needle
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
- Semantic signature: `7baeff41`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: cat-cow, dead-bug, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-bulgarian-split-squat, dumbbell-chest-fly, single-arm-dumbbell-row, db-rdl, dumbbell-bench-press, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, db-triceps-extension, breathing-90-90
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
- Semantic signature: `1cb6a459`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, split-stance-row, db-triceps-extension, side-plank-star, thread-the-needle
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
- Semantic signature: `25242ca9`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, single-arm-dumbbell-row, farmers-carry, cossack-squat, thread-the-needle
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
- Semantic signature: `2571b081`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, pallof-press, thread-the-needle
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
- Semantic signature: `eca2d08c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, cossack-squat, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-pull-apart, db-triceps-extension, farmers-carry, thread-the-needle
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
- Semantic signature: `e2a0e9d5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
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
- Semantic signature: `5f2e1642`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, band-external-rotation, side-plank, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, standing-calf-raise, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, dumbbell-chest-fly, single-arm-dumbbell-row, single-leg-hip-thrust, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, side-plank, breathing-90-90
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
- Semantic signature: `901d474e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, face-pull, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, face-pull, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`

## Fallback samples (complete set)

### Fallback 1 — gym #68

- Seed: `gym-fuzz-a4f36846`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-a4f36846:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-a4f36846:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-a4f36846 fallback=gym-fuzz-a4f36846:quality-fallback:gym:canonical-gym-template:d4:Advanced:default
- Final program signature: `Upper Push + Scapular Control:cat-cow,dead-bug,dumbbell-floor-press,dumbbell-shoulder-press,dumbbell-bench-press,machine-shoulder-press,db-triceps-extension,machine-chest-press,cable-rear-delt-fly,doorway-pec-stretch|Lower (Squat Emphasis) + Core:cat-cow,dead-bug,dumbbell-step-up-loaded,single-leg-rdl,machine-leg-press,dumbbell-sumo-rdl,contralateral-reach-march,farmers-carry,single-leg-calf-raise,suitcase-carry,breathing-90-90|Upper Pull + Thoracic Posture:cat-cow,dead-bug,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,machine-seated-row,cable-biceps-curl,machine-rear-delt-row,cable-face-pull,doorway-pec-stretch|Lower (Hinge Emphasis) + Carry/Anti-rotation:cat-cow,dead-bug,single-leg-rdl,dumbbell-bulgarian-split-squat,standing-calf-raise,db-rdl,bodyweight-good-morning,suitcase-carry,cossack-squat,farmers-carry,breathing-90-90`
- Semantic signature: `99a34336`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, dumbbell-floor-press, dumbbell-shoulder-press, dumbbell-bench-press, machine-shoulder-press, db-triceps-extension, machine-chest-press, cable-rear-delt-fly, doorway-pec-stretch
  - Day 2: cat-cow, dead-bug, dumbbell-step-up-loaded, single-leg-rdl, machine-leg-press, dumbbell-sumo-rdl, contralateral-reach-march, farmers-carry, single-leg-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, machine-seated-row, cable-biceps-curl, machine-rear-delt-row, cable-face-pull, doorway-pec-stretch
  - Day 4: cat-cow, dead-bug, single-leg-rdl, dumbbell-bulgarian-split-squat, standing-calf-raise, db-rdl, bodyweight-good-morning, suitcase-carry, cossack-squat, farmers-carry, breathing-90-90

### Fallback 2 — gym #408

- Seed: `gym-fuzz-c6a1ad68`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-c6a1ad68:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-c6a1ad68:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-c6a1ad68 fallback=gym-fuzz-c6a1ad68:quality-fallback:gym:canonical-gym-template:d3:Beginner:default
- Final program signature: `Back + Chest:wall-slides,dead-bug,dumbbell-bench-press,dumbbell-rows,machine-lat-pulldown,cable-face-pull,cable-external-rotation,thread-the-needle|Shoulders + Arms:wall-slides,dead-bug,dumbbell-shoulder-press,cable-lateral-raise,cable-rear-delt-fly,overhead-cable-triceps-extension,cable-biceps-curl,suitcase-carry,thread-the-needle|Legs + Abs:cat-cow,glute-bridges,machine-leg-press,dumbbell-bulgarian-split-squat,dumbbell-reverse-lunge,side-plank-star,single-leg-calf-raise,hamstring-stretch`
- Semantic signature: `1d617616`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, dead-bug, dumbbell-bench-press, dumbbell-rows, machine-lat-pulldown, cable-face-pull, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry, thread-the-needle
  - Day 3: cat-cow, glute-bridges, machine-leg-press, dumbbell-bulgarian-split-squat, dumbbell-reverse-lunge, side-plank-star, single-leg-calf-raise, hamstring-stretch

### Fallback 3 — gym #1768

- Seed: `gym-fuzz-4d57a54e`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-4d57a54e:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-4d57a54e:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-4d57a54e fallback=gym-fuzz-4d57a54e:quality-fallback:gym:canonical-gym-template:d4:Intermediate:default
- Final program signature: `Upper Push + Scapular Control:wall-slides,wall-angel-hold,dumbbell-floor-press,machine-shoulder-press,dumbbell-bench-press,db-triceps-extension,cable-rear-delt-fly,thread-the-needle|Lower (Squat Emphasis) + Core:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,single-leg-rdl,machine-leg-press,farmers-carry,single-leg-calf-raise,thread-the-needle|Upper Pull + Thoracic Posture:wall-slides,wall-angel-hold,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,cable-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower (Hinge Emphasis) + Carry/Anti-rotation:cat-cow,wall-angel-hold,single-leg-rdl,dumbbell-bulgarian-split-squat,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `8eacb552`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, single-leg-rdl, machine-leg-press, farmers-carry, single-leg-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-leg-rdl, dumbbell-bulgarian-split-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 4 — gym #2380

- Seed: `gym-fuzz-89f65acb`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-89f65acb:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-89f65acb:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-89f65acb fallback=gym-fuzz-89f65acb:quality-fallback:gym:canonical-gym-template:d3:Intermediate:default
- Final program signature: `Back + Chest:wall-slides,wall-angel-hold,dumbbell-bench-press,dumbbell-chest-fly,dumbbell-rows,machine-lat-pulldown,dumbbell-rear-delt-fly,cable-external-rotation-pressout,thread-the-needle|Shoulders + Arms:wall-slides,wall-angel-hold,machine-shoulder-press,cable-lateral-raise,dumbbell-rear-delt-fly,dumbbell-lateral-raise,db-triceps-extension,cable-biceps-curl,farmers-carry,thread-the-needle|Legs + Abs:cat-cow,wall-angel-hold,machine-leg-press,dumbbell-bulgarian-split-squat,machine-seated-hamstring-curl,dumbbell-reverse-lunge,plank,db-calf-raise,thread-the-needle`
- Semantic signature: `23788268`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, dumbbell-rear-delt-fly, cable-external-rotation-pressout, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, dumbbell-rear-delt-fly, dumbbell-lateral-raise, db-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-bulgarian-split-squat, machine-seated-hamstring-curl, dumbbell-reverse-lunge, plank, db-calf-raise, thread-the-needle

### Fallback 5 — gym #2516

- Seed: `gym-fuzz-976fee2a`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-976fee2a:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-976fee2a:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-976fee2a fallback=gym-fuzz-976fee2a:quality-fallback:gym:canonical-gym-template:d3:Advanced:default
- Final program signature: `Back + Chest:wall-slides,wall-angel-hold,dumbbell-bench-press,dumbbell-chest-fly,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,dumbbell-rear-delt-fly,cable-external-rotation,thread-the-needle|Shoulders + Arms:wall-slides,wall-angel-hold,machine-shoulder-press,cable-lateral-raise,cable-rear-delt-fly,dumbbell-lateral-raise,dumbbell-triceps-kickback,cable-biceps-curl,db-triceps-extension,hammer-curl,thread-the-needle|Legs + Abs:cat-cow,wall-angel-hold,machine-leg-press,dumbbell-reverse-lunge,machine-seated-hamstring-curl,dumbbell-bulgarian-split-squat,hollow-body-hold,db-calf-raise,side-plank-star,thread-the-needle`
- Semantic signature: `af117491`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, dumbbell-rear-delt-fly, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-bulgarian-split-squat, hollow-body-hold, db-calf-raise, side-plank-star, thread-the-needle

### Fallback 6 — gym #4080

- Seed: `gym-fuzz-325adcfb`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-325adcfb:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-325adcfb:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-325adcfb fallback=gym-fuzz-325adcfb:quality-fallback:gym:canonical-gym-template:d3:Beginner:default
- Final program signature: `Back + Chest:wall-slides,wall-angel-hold,dumbbell-bench-press,dumbbell-rows,machine-lat-pulldown,cable-face-pull,machine-pec-deck-press,doorway-pec-stretch|Shoulders + Arms:wall-slides,wall-angel-hold,dumbbell-shoulder-press,cable-lateral-raise,cable-rear-delt-fly,overhead-cable-triceps-extension,cable-biceps-curl,farmers-carry,chin-tucks|Legs + Abs:ankle-mobility,glute-bridges,machine-leg-press,dumbbell-reverse-lunge,dumbbell-bulgarian-split-squat,plank,single-leg-calf-raise,hamstring-stretch`
- Semantic signature: `e5e24851`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-rows, machine-lat-pulldown, cable-face-pull, machine-pec-deck-press, doorway-pec-stretch
  - Day 2: wall-slides, wall-angel-hold, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, chin-tucks
  - Day 3: ankle-mobility, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-bulgarian-split-squat, plank, single-leg-calf-raise, hamstring-stretch

### Fallback 7 — gym #4828

- Seed: `gym-fuzz-7c7203bf`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-7c7203bf:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-7c7203bf:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-7c7203bf fallback=gym-fuzz-7c7203bf:quality-fallback:gym:canonical-gym-template:d5:Intermediate:default
- Final program signature: `Upper Push:wall-slides,wall-angel-hold,dumbbell-floor-press,machine-shoulder-press,dumbbell-bench-press,db-triceps-extension,machine-rear-delt-row,thread-the-needle|Lower Squat:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,single-leg-rdl,machine-leg-press,farmers-carry,single-leg-calf-raise,thread-the-needle|Upper Pull:wall-slides,wall-angel-hold,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,cable-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower Hinge + Posterior Chain:cat-cow,wall-angel-hold,single-leg-rdl,dumbbell-bulgarian-split-squat,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle|Arms + Posture + Conditioning:wall-slides,wall-angel-hold,single-arm-dumbbell-row,machine-shoulder-press,dumbbell-rows,bodyweight-triceps-extension,cable-biceps-curl,thread-the-needle`
- Semantic signature: `c2b2cf0f`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, db-triceps-extension, machine-rear-delt-row, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, single-leg-rdl, machine-leg-press, farmers-carry, single-leg-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-leg-rdl, dumbbell-bulgarian-split-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 5: wall-slides, wall-angel-hold, single-arm-dumbbell-row, machine-shoulder-press, dumbbell-rows, bodyweight-triceps-extension, cable-biceps-curl, thread-the-needle

### Fallback 8 — gym #4879

- Seed: `gym-fuzz-17fbf6f`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-17fbf6f:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-17fbf6f:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-17fbf6f fallback=gym-fuzz-17fbf6f:quality-fallback:gym:canonical-gym-template:d5:Intermediate:default
- Final program signature: `Upper Push:wall-slides,scapular-pushups,dumbbell-floor-press,dumbbell-shoulder-press,dumbbell-bench-press,db-triceps-extension,cable-rear-delt-fly,thread-the-needle|Lower Squat:ankle-mobility,dead-bug,machine-leg-press,db-rdl,split-squat,band-woodchop,standing-calf-raise,breathing-90-90|Upper Pull:wall-slides,band-pull-aparts,dumbbell-rows,machine-lat-pulldown,machine-seated-row,band-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower Hinge + Posterior Chain:ankle-mobility,dead-bug,db-rdl,cossack-squat,band-rdl,standing-calf-raise,farmers-carry,breathing-90-90|Arms + Posture + Conditioning:wall-slides,scapular-pushups,machine-seated-row,dumbbell-shoulder-press,dumbbell-rows,db-triceps-extension,band-biceps-curl,thread-the-needle`
- Semantic signature: `65aab32a`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, scapular-pushups, dumbbell-floor-press, dumbbell-shoulder-press, dumbbell-bench-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: ankle-mobility, dead-bug, machine-leg-press, db-rdl, split-squat, band-woodchop, standing-calf-raise, breathing-90-90
  - Day 3: wall-slides, band-pull-aparts, dumbbell-rows, machine-lat-pulldown, machine-seated-row, band-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: ankle-mobility, dead-bug, db-rdl, cossack-squat, band-rdl, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 5: wall-slides, scapular-pushups, machine-seated-row, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, band-biceps-curl, thread-the-needle

### Fallback 9 — gym #5015

- Seed: `gym-fuzz-ef86ae0`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-ef86ae0:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-ef86ae0:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-ef86ae0 fallback=gym-fuzz-ef86ae0:quality-fallback:gym:canonical-gym-template:d5:Advanced:default
- Final program signature: `Upper Push:wall-slides,wall-angel-hold,dumbbell-floor-press,machine-shoulder-press,dumbbell-bench-press,band-overhead-press,db-triceps-extension,cable-rear-delt-fly,thread-the-needle|Lower Squat:cat-cow,wall-angel-hold,machine-leg-press,db-rdl,cossack-squat,dumbbell-reverse-lunge,pallof-press,band-woodchop,standing-calf-raise,thread-the-needle|Upper Pull:wall-slides,wall-angel-hold,dumbbell-rows,machine-lat-pulldown,machine-seated-row,band-row,band-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower Hinge + Posterior Chain:cat-cow,wall-angel-hold,db-rdl,split-squat,pallof-press,band-rdl,bodyweight-good-morning,band-woodchop,standing-calf-raise,thread-the-needle|Arms + Posture + Conditioning:wall-slides,wall-angel-hold,machine-seated-row,machine-shoulder-press,dumbbell-rows,band-overhead-press,db-triceps-extension,band-biceps-curl,thread-the-needle`
- Semantic signature: `042d2399`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, band-overhead-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, machine-leg-press, db-rdl, cossack-squat, dumbbell-reverse-lunge, pallof-press, band-woodchop, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, machine-seated-row, band-row, band-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, db-rdl, split-squat, pallof-press, band-rdl, bodyweight-good-morning, band-woodchop, standing-calf-raise, thread-the-needle
  - Day 5: wall-slides, wall-angel-hold, machine-seated-row, machine-shoulder-press, dumbbell-rows, band-overhead-press, db-triceps-extension, band-biceps-curl, thread-the-needle

### Fallback 10 — gym #5627

- Seed: `gym-fuzz-4b9704ab`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-4b9704ab:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-4b9704ab:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-4b9704ab fallback=gym-fuzz-4b9704ab:quality-fallback:gym:canonical-gym-template:d4:Advanced:default
- Final program signature: `Upper Push + Scapular Control:wall-slides,wall-angel-hold,dumbbell-floor-press,band-overhead-press,dumbbell-bench-press,machine-shoulder-press,db-triceps-extension,machine-rear-delt-row,thread-the-needle|Lower (Squat Emphasis) + Core:cat-cow,wall-angel-hold,machine-leg-press,db-rdl,cossack-squat,bodyweight-squat,farmers-carry,band-woodchop,standing-calf-raise,thread-the-needle|Upper Pull + Thoracic Posture:wall-slides,wall-angel-hold,dumbbell-rows,band-lat-pulldown-kneeling,single-arm-dumbbell-row,band-row,band-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower (Hinge Emphasis) + Carry/Anti-rotation:cat-cow,wall-angel-hold,db-rdl,split-squat,standing-calf-raise,band-rdl,bodyweight-good-morning,band-woodchop,farmers-carry,thread-the-needle`
- Semantic signature: `7fb13d76`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, band-overhead-press, dumbbell-bench-press, machine-shoulder-press, db-triceps-extension, machine-rear-delt-row, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, machine-leg-press, db-rdl, cossack-squat, bodyweight-squat, farmers-carry, band-woodchop, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, band-lat-pulldown-kneeling, single-arm-dumbbell-row, band-row, band-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, db-rdl, split-squat, standing-calf-raise, band-rdl, bodyweight-good-morning, band-woodchop, farmers-carry, thread-the-needle

### Fallback 11 — gym #6188

- Seed: `gym-fuzz-328ff35`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-328ff35:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-328ff35:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-328ff35 fallback=gym-fuzz-328ff35:quality-fallback:gym:canonical-gym-template:d3:Advanced:default
- Final program signature: `Back + Chest:wall-slides,wall-angel-hold,dumbbell-bench-press,machine-pec-deck-press,machine-seated-row,machine-lat-pulldown,dumbbell-rows,dumbbell-rear-delt-fly,cable-external-rotation,thread-the-needle|Shoulders + Arms:wall-slides,wall-angel-hold,machine-shoulder-press,cable-lateral-raise,cable-rear-delt-fly,dumbbell-lateral-raise,db-triceps-extension,cable-biceps-curl,dumbbell-triceps-kickback,db-biceps-curl,thread-the-needle|Legs + Abs:cat-cow,wall-angel-hold,machine-leg-press,dumbbell-bulgarian-split-squat,machine-seated-hamstring-curl,dumbbell-step-up-loaded,hollow-body-hold,db-calf-raise,side-plank-star,thread-the-needle`
- Semantic signature: `fdbd73ce`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, machine-pec-deck-press, machine-seated-row, machine-lat-pulldown, dumbbell-rows, dumbbell-rear-delt-fly, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, dumbbell-lateral-raise, db-triceps-extension, cable-biceps-curl, dumbbell-triceps-kickback, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-bulgarian-split-squat, machine-seated-hamstring-curl, dumbbell-step-up-loaded, hollow-body-hold, db-calf-raise, side-plank-star, thread-the-needle

### Fallback 12 — gym #6664

- Seed: `gym-fuzz-324f7376`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-324f7376:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-324f7376:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-324f7376 fallback=gym-fuzz-324f7376:quality-fallback:gym:canonical-gym-template:d5:Intermediate:default
- Final program signature: `Upper Push:wall-slides,wall-angel-hold,dumbbell-floor-press,machine-shoulder-press,dumbbell-bench-press,db-triceps-extension,cable-rear-delt-fly,thread-the-needle|Lower Squat:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,single-leg-rdl,machine-leg-press,farmers-carry,single-leg-calf-raise,thread-the-needle|Upper Pull:wall-slides,wall-angel-hold,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,cable-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower Hinge + Posterior Chain:cat-cow,wall-angel-hold,single-leg-rdl,dumbbell-bulgarian-split-squat,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle|Arms + Posture + Conditioning:wall-slides,wall-angel-hold,machine-seated-row,machine-shoulder-press,machine-lat-pulldown,bodyweight-triceps-extension,cable-biceps-curl,thread-the-needle`
- Semantic signature: `1c4e1feb`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, single-leg-rdl, machine-leg-press, farmers-carry, single-leg-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-leg-rdl, dumbbell-bulgarian-split-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 5: wall-slides, wall-angel-hold, machine-seated-row, machine-shoulder-press, machine-lat-pulldown, bodyweight-triceps-extension, cable-biceps-curl, thread-the-needle

### Fallback 13 — gym #7412

- Seed: `gym-fuzz-7c66ae03`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-7c66ae03:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-7c66ae03:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-7c66ae03 fallback=gym-fuzz-7c66ae03:quality-fallback:gym:canonical-gym-template:d4:Advanced:default
- Final program signature: `Upper Push + Scapular Control:wall-slides,wall-angel-hold,dumbbell-floor-press,machine-shoulder-press,dumbbell-bench-press,incline-pushup,db-triceps-extension,cable-rear-delt-fly,thread-the-needle|Lower (Squat Emphasis) + Core:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,single-leg-rdl,machine-leg-press,bodyweight-squat,contralateral-reach-march,farmers-carry,single-leg-calf-raise,thread-the-needle|Upper Pull + Thoracic Posture:wall-slides,prone-ytw,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,machine-seated-row,cable-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower (Hinge Emphasis) + Carry/Anti-rotation:cat-cow,wall-angel-hold,single-leg-rdl,dumbbell-bulgarian-split-squat,standing-calf-raise,db-rdl,bodyweight-good-morning,farmers-carry,cossack-squat,thread-the-needle`
- Semantic signature: `7e20e71a`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, incline-pushup, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, single-leg-rdl, machine-leg-press, bodyweight-squat, contralateral-reach-march, farmers-carry, single-leg-calf-raise, thread-the-needle
  - Day 3: wall-slides, prone-ytw, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, machine-seated-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-leg-rdl, dumbbell-bulgarian-split-squat, standing-calf-raise, db-rdl, bodyweight-good-morning, farmers-carry, cossack-squat, thread-the-needle

### Fallback 14 — gym #7752

- Seed: `gym-fuzz-9e14ef6d`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-9e14ef6d:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-9e14ef6d:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-9e14ef6d fallback=gym-fuzz-9e14ef6d:quality-fallback:gym:canonical-gym-template:d3:Beginner:default
- Final program signature: `Back + Chest:wall-slides,dead-bug,dumbbell-bench-press,dumbbell-rows,machine-lat-pulldown,cable-face-pull,cable-external-rotation,thread-the-needle|Shoulders + Arms:wall-slides,dead-bug,dumbbell-shoulder-press,cable-lateral-raise,cable-rear-delt-fly,overhead-cable-triceps-extension,cable-biceps-curl,farmers-carry,thread-the-needle|Legs + Abs:cat-cow,glute-bridges,machine-leg-press,dumbbell-reverse-lunge,dumbbell-bulgarian-split-squat,side-plank-star,single-leg-calf-raise,hamstring-stretch`
- Semantic signature: `3408e6df`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, dead-bug, dumbbell-bench-press, dumbbell-rows, machine-lat-pulldown, cable-face-pull, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-bulgarian-split-squat, side-plank-star, single-leg-calf-raise, hamstring-stretch

### Fallback 15 — gym #8024

- Seed: `gym-fuzz-b905048c`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-b905048c:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-b905048c:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-b905048c fallback=gym-fuzz-b905048c:quality-fallback:gym:canonical-gym-template:d3:Advanced:default
- Final program signature: `Back + Chest:wall-slides,wall-angel-hold,dumbbell-bench-press,dumbbell-chest-fly,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,dumbbell-rear-delt-fly,cable-external-rotation-pressout,thread-the-needle|Shoulders + Arms:wall-slides,wall-angel-hold,machine-shoulder-press,cable-lateral-raise,dumbbell-rear-delt-fly,dumbbell-lateral-raise,dumbbell-triceps-kickback,cable-biceps-curl,db-triceps-extension,db-biceps-curl,thread-the-needle|Legs + Abs:cat-cow,wall-angel-hold,machine-leg-press,dumbbell-reverse-lunge,machine-seated-hamstring-curl,dumbbell-bulgarian-split-squat,hollow-body-hold,db-calf-raise,side-plank-star,thread-the-needle`
- Semantic signature: `a55e8002`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, dumbbell-rear-delt-fly, cable-external-rotation-pressout, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, dumbbell-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-bulgarian-split-squat, hollow-body-hold, db-calf-raise, side-plank-star, thread-the-needle

### Fallback 16 — gym #8551

- Seed: `gym-fuzz-6d392dd1`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-6d392dd1:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-6d392dd1:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-6d392dd1 fallback=gym-fuzz-6d392dd1:quality-fallback:gym:canonical-gym-template:d5:Intermediate:default
- Final program signature: `Upper Push:wall-slides,dead-bug,dumbbell-floor-press,dumbbell-shoulder-press,dumbbell-bench-press,db-triceps-extension,cable-rear-delt-fly,thread-the-needle|Lower Squat:cat-cow,dead-bug,machine-leg-press,db-rdl,cossack-squat,side-plank-star,standing-calf-raise,thread-the-needle|Upper Pull:wall-slides,dead-bug,dumbbell-rows,machine-lat-pulldown,machine-seated-row,band-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower Hinge + Posterior Chain:cat-cow,dead-bug,db-rdl,split-squat,band-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Arms + Posture + Conditioning:wall-slides,dead-bug,machine-seated-row,dumbbell-shoulder-press,dumbbell-rows,db-triceps-extension,band-biceps-curl,thread-the-needle`
- Semantic signature: `0345e8ba`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, dead-bug, dumbbell-floor-press, dumbbell-shoulder-press, dumbbell-bench-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, dead-bug, machine-leg-press, db-rdl, cossack-squat, side-plank-star, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, dead-bug, dumbbell-rows, machine-lat-pulldown, machine-seated-row, band-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, dead-bug, db-rdl, split-squat, band-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 5: wall-slides, dead-bug, machine-seated-row, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, band-biceps-curl, thread-the-needle

### Fallback 17 — gym #9112

- Seed: `gym-fuzz-24cac903`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery hard failures: #1[gym-fuzz-24cac903:quality-recovery:1]=QUALITY_BLOCKED_EXERCISE_PRESENT; #2[gym-fuzz-24cac903:quality-recovery:2]=QUALITY_BLOCKED_EXERCISE_PRESENT
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Reproducible seeds: base=gym-fuzz-24cac903 fallback=gym-fuzz-24cac903:quality-fallback:gym:canonical-gym-template:d4:Intermediate:default
- Final program signature: `Upper Push + Scapular Control:wall-slides,wall-angel-hold,dumbbell-floor-press,machine-shoulder-press,dumbbell-bench-press,db-triceps-extension,cable-rear-delt-fly,thread-the-needle|Lower (Squat Emphasis) + Core:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,single-leg-rdl,machine-leg-press,farmers-carry,single-leg-calf-raise,thread-the-needle|Upper Pull + Thoracic Posture:wall-slides,wall-angel-hold,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,cable-biceps-curl,machine-rear-delt-row,thread-the-needle|Lower (Hinge Emphasis) + Carry/Anti-rotation:cat-cow,wall-angel-hold,single-leg-rdl,dumbbell-bulgarian-split-squat,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `8eacb552`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, single-leg-rdl, machine-leg-press, farmers-carry, single-leg-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-leg-rdl, dumbbell-bulgarian-split-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 18 — gym #9724

- Seed: `gym-fuzz-6169b984`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-6169b984:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-6169b984:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-6169b984 fallback=gym-fuzz-6169b984:quality-fallback:gym:canonical-gym-template:d3:Intermediate:default
- Final program signature: `Back + Chest:wall-slides,wall-angel-hold,dumbbell-bench-press,dumbbell-chest-fly,dumbbell-rows,machine-lat-pulldown,dumbbell-rear-delt-fly,cable-straight-arm-pulldown,doorway-pec-stretch|Shoulders + Arms:wall-slides,wall-angel-hold,dumbbell-shoulder-press,cable-lateral-raise,cable-rear-delt-fly,cable-upright-row,overhead-cable-triceps-extension,cable-biceps-curl,farmers-carry,chin-tucks|Legs + Abs:ankle-mobility,wall-angel-hold,machine-leg-press,dumbbell-bulgarian-split-squat,machine-seated-hamstring-curl,dumbbell-reverse-lunge,plank,db-calf-raise,hip-flexor-stretch`
- Semantic signature: `0ffcf623`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, dumbbell-rear-delt-fly, cable-straight-arm-pulldown, doorway-pec-stretch
  - Day 2: wall-slides, wall-angel-hold, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, cable-upright-row, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, chin-tucks
  - Day 3: ankle-mobility, wall-angel-hold, machine-leg-press, dumbbell-bulgarian-split-squat, machine-seated-hamstring-curl, dumbbell-reverse-lunge, plank, db-calf-raise, hip-flexor-stretch

### Fallback 19 — gym #9860

- Seed: `gym-fuzz-6ee21017`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery hard failures: #1[gym-fuzz-6ee21017:quality-recovery:1]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH; #2[gym-fuzz-6ee21017:quality-recovery:2]=GYM_REQUIRED_ROLE_WRONG_TRUTH|GYM_REQUIRED_ROLE_WRONG_TRUTH
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Reproducible seeds: base=gym-fuzz-6ee21017 fallback=gym-fuzz-6ee21017:quality-fallback:gym:canonical-gym-template:d3:Advanced:default
- Final program signature: `Back + Chest:wall-slides,wall-angel-hold,dumbbell-bench-press,dumbbell-chest-fly,dumbbell-rows,machine-lat-pulldown,single-arm-dumbbell-row,dumbbell-rear-delt-fly,cable-external-rotation,thread-the-needle|Shoulders + Arms:wall-slides,wall-angel-hold,machine-shoulder-press,cable-lateral-raise,cable-rear-delt-fly,dumbbell-lateral-raise,dumbbell-triceps-kickback,cable-biceps-curl,db-triceps-extension,hammer-curl,thread-the-needle|Legs + Abs:cat-cow,wall-angel-hold,machine-leg-press,dumbbell-bulgarian-split-squat,machine-seated-hamstring-curl,dumbbell-reverse-lunge,plank,db-calf-raise,side-plank-star,thread-the-needle`
- Semantic signature: `1cb5b851`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, dumbbell-rear-delt-fly, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-bulgarian-split-squat, machine-seated-hamstring-curl, dumbbell-reverse-lunge, plank, db-calf-raise, side-plank-star, thread-the-needle

### Fallback 20 — dumbbells #17

- Seed: `db-fuzz-1fe69194`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-1fe69194:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-1fe69194:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-1fe69194 fallback=db-fuzz-1fe69194:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:ankle-mobility,scapular-pushups,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,dumbbell-sumo-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,single-leg-rdl,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:ankle-mobility,scapular-pushups,dumbbell-reverse-lunge,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,suitcase-carry,breathing-90-90|Practice & Restore:cat-cow,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,suitcase-carry,breathing-90-90`
- Semantic signature: `90b52636`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, suitcase-carry, breathing-90-90

### Fallback 21 — dumbbells #153

- Seed: `db-fuzz-2d5f1925`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-2d5f1925:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-2d5f1925:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-2d5f1925 fallback=db-fuzz-2d5f1925:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,db-biceps-curl,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,standing-calf-raise,thread-the-needle`
- Semantic signature: `3ed04dea`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, thread-the-needle

### Fallback 22 — dumbbells #289

- Seed: `db-fuzz-3ad7e055`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-3ad7e055:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-3ad7e055:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-3ad7e055 fallback=db-fuzz-3ad7e055:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,reverse-snow-angel,side-plank,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,db-triceps-extension,side-plank,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-bench-press,single-arm-dumbbell-row,dumbbell-rear-delt-fly,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,single-leg-hip-thrust,standing-calf-raise,side-plank,breathing-90-90`
- Semantic signature: `6282b934`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, dumbbell-rear-delt-fly, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-hip-thrust, standing-calf-raise, side-plank, breathing-90-90

### Fallback 23 — dumbbells #425

- Seed: `db-fuzz-4850c8da`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-4850c8da:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-4850c8da:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-4850c8da fallback=db-fuzz-4850c8da:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,db-rdl,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-step-up-loaded,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank-star,thread-the-needle|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-bench-press,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `5628495c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 24 — dumbbells #561

- Seed: `db-fuzz-55c9735b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-55c9735b:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-55c9735b:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-55c9735b fallback=db-fuzz-55c9735b:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,db-biceps-curl,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,single-leg-rdl,standing-calf-raise,thread-the-needle`
- Semantic signature: `7e824ebd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, single-leg-rdl, standing-calf-raise, thread-the-needle

### Fallback 25 — dumbbells #697

- Seed: `db-fuzz-6341afdb`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-6341afdb:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-6341afdb:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-6341afdb fallback=db-fuzz-6341afdb:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-pullover,db-rdl,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `ba72d8db`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 26 — dumbbells #765

- Seed: `db-fuzz-69fe7660`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-69fe7660:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-69fe7660:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-69fe7660 fallback=db-fuzz-69fe7660:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:ankle-mobility,scapular-pushups,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,glute-bridges,db-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-leg-hip-thrust,standing-calf-raise,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:ankle-mobility,scapular-pushups,split-squat,pushup,dumbbell-rows,db-triceps-extension,hollow-body-hold,breathing-90-90|Practice & Restore:wall-angel-hold,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,breathing-90-90`
- Semantic signature: `ee2b0938`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-leg-hip-thrust, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-rows, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, breathing-90-90

### Fallback 27 — dumbbells #833

- Seed: `db-fuzz-70ba0218`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-70ba0218:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-70ba0218:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-70ba0218 fallback=db-fuzz-70ba0218:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,single-leg-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,db-triceps-extension,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,pike-pushup,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-step-up-loaded,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `1a5b00fc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 28 — dumbbells #901

- Seed: `db-fuzz-7776b2d0`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-7776b2d0:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-7776b2d0:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-7776b2d0 fallback=db-fuzz-7776b2d0:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,standing-calf-raise,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,db-rdl,db-triceps-extension,side-plank,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank,thread-the-needle`
- Semantic signature: `8f3b645a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 29 — dumbbells #969

- Seed: `db-fuzz-7e336699`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-7e336699:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-7e336699:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-7e336699 fallback=db-fuzz-7e336699:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,hip-hinge-drill,db-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-sumo-rdl,db-triceps-extension,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,dumbbell-sumo-rdl,standing-calf-raise,thread-the-needle`
- Semantic signature: `f631ce36`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-sumo-rdl, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, dumbbell-sumo-rdl, standing-calf-raise, thread-the-needle

### Fallback 30 — dumbbells #1037

- Seed: `db-fuzz-84efef41`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-84efef41:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-84efef41:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-84efef41 fallback=db-fuzz-84efef41:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,prone-elbow-row,side-plank,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,split-squat,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,pushup,dumbbell-pullover,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,standing-calf-raise,breathing-90-90|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank,breathing-90-90`
- Semantic signature: `521c01d0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, prone-elbow-row, side-plank, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, breathing-90-90

### Fallback 31 — dumbbells #1105

- Seed: `db-fuzz-8bab3519`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-8bab3519:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-8bab3519:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-8bab3519 fallback=db-fuzz-8bab3519:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,db-biceps-curl,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,wall-angel-hold,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,reverse-snow-angel,farmers-carry,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,single-leg-rdl,db-triceps-extension,side-plank-star,hip-flexor-stretch|Upper Pattern Practice:cat-cow,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,db-rdl,standing-calf-raise,farmers-carry,hip-flexor-stretch`
- Semantic signature: `92888d27`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 2: cat-cow, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, farmers-carry, hip-flexor-stretch
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, hip-flexor-stretch

### Fallback 32 — dumbbells #1173

- Seed: `db-fuzz-926883de`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-926883de:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-926883de:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-926883de fallback=db-fuzz-926883de:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,hip-hinge-drill,db-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-leg-rdl,standing-calf-raise,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,thread-the-needle|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `98026f7e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-leg-rdl, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 33 — dumbbells #1241

- Seed: `db-fuzz-9924fd9e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-9924fd9e:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-9924fd9e:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-9924fd9e fallback=db-fuzz-9924fd9e:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,dumbbell-sumo-rdl,split-squat,pike-pushup,dumbbell-rows,single-leg-rdl,db-triceps-extension,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,pike-pushup,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-step-up-loaded,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `f66d8a7b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 34 — dumbbells #1309

- Seed: `db-fuzz-9fe0285e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-9fe0285e:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-9fe0285e:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-9fe0285e fallback=db-fuzz-9fe0285e:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,back-widow,side-plank-star,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank-star,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,standing-calf-raise,side-plank-star,hip-flexor-stretch|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,hip-flexor-stretch`
- Semantic signature: `f19b8dbe`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, back-widow, side-plank-star, hip-flexor-stretch
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, hip-flexor-stretch

### Fallback 35 — dumbbells #1445

- Seed: `db-fuzz-ad59f09f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-ad59f09f:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-ad59f09f:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-ad59f09f fallback=db-fuzz-ad59f09f:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,farmers-carry,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,thread-the-needle`
- Semantic signature: `db63f79c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 36 — dumbbells #1581

- Seed: `db-fuzz-bad2b91c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-bad2b91c:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-bad2b91c:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-bad2b91c fallback=db-fuzz-bad2b91c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,farmers-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,farmers-carry,breathing-90-90|Practice & Restore:cat-cow,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,breathing-90-90`
- Semantic signature: `5f6d2bbc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, breathing-90-90

### Fallback 37 — dumbbells #1717

- Seed: `db-fuzz-c84a619c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-c84a619c:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-c84a619c:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-c84a619c fallback=db-fuzz-c84a619c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-rdl,dumbbell-chest-fly,suitcase-carry,breathing-90-90|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,breathing-90-90`
- Semantic signature: `1228213e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, breathing-90-90

### Fallback 38 — dumbbells #1853

- Seed: `db-fuzz-d5c39a1d`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-d5c39a1d:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-d5c39a1d:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-d5c39a1d fallback=db-fuzz-d5c39a1d:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,farmers-carry,standing-calf-raise,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,wall-angel-hold,single-leg-glute-bridge-hold,split-squat,dumbbell-shoulder-press,dumbbell-rows,dumbbell-sumo-rdl,farmers-carry,standing-calf-raise,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,single-leg-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,side-plank-star,hip-flexor-stretch|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,hip-flexor-stretch`
- Semantic signature: `a012c047`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, hip-flexor-stretch
  - Day 2: cat-cow, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, dumbbell-sumo-rdl, farmers-carry, standing-calf-raise, hip-flexor-stretch
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, single-leg-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, hip-flexor-stretch

### Fallback 39 — dumbbells #1989

- Seed: `db-fuzz-e33b16dd`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-e33b16dd:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-e33b16dd:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-e33b16dd fallback=db-fuzz-e33b16dd:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,db-biceps-curl,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,standing-calf-raise,thread-the-needle`
- Semantic signature: `8a244548`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, thread-the-needle

### Fallback 40 — dumbbells #2125

- Seed: `db-fuzz-f0b46b5a`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-f0b46b5a:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-f0b46b5a:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-f0b46b5a fallback=db-fuzz-f0b46b5a:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-pullover,db-rdl,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `80da265f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 41 — dumbbells #2261

- Seed: `db-fuzz-fe2dbfdb`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-fe2dbfdb:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-fe2dbfdb:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-fe2dbfdb fallback=db-fuzz-fe2dbfdb:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:ankle-mobility,scapular-pushups,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,db-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,db-rdl,reverse-snow-angel,farmers-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:ankle-mobility,scapular-pushups,dumbbell-step-up-loaded,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,hollow-body-hold,breathing-90-90|Upper Pattern Practice:wall-slides,scapular-pushups,dumbbell-bench-press,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:ankle-mobility,glute-bridges,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,farmers-carry,standing-calf-raise,breathing-90-90`
- Semantic signature: `a7c6389a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-bench-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, breathing-90-90

### Fallback 42 — dumbbells #2397

- Seed: `db-fuzz-ba5ec5b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-ba5ec5b:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-ba5ec5b:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-ba5ec5b fallback=db-fuzz-ba5ec5b:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,hip-hinge-drill,db-rdl,dumbbell-reverse-lunge,pike-pushup,cossack-squat,db-triceps-extension,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,single-leg-rdl,standing-calf-raise,thread-the-needle`
- Semantic signature: `52a5bb0c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, cossack-squat, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-rdl, standing-calf-raise, thread-the-needle

### Fallback 43 — dumbbells #2533

- Seed: `db-fuzz-191e9718`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-191e9718:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-191e9718:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-191e9718 fallback=db-fuzz-191e9718:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,reverse-snow-angel,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,db-triceps-extension,side-plank-star,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-hip-thrust,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `e84ef7a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-hip-thrust, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 44 — dumbbells #2601

- Seed: `db-fuzz-1fdafed0`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-1fdafed0:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-1fdafed0:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-1fdafed0 fallback=db-fuzz-1fdafed0:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,glute-bridges,db-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,standing-calf-raise,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `5c38f215`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 45 — dumbbells #2669

- Seed: `db-fuzz-26971299`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-26971299:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-26971299:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-26971299 fallback=db-fuzz-26971299:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,db-rdl,reverse-snow-angel,farmers-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank-star,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,pike-pushup,back-widow,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,breathing-90-90`
- Semantic signature: `7fc3ff6a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, back-widow, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, breathing-90-90

### Fallback 46 — dumbbells #2737

- Seed: `db-fuzz-2d53aa41`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-2d53aa41:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-2d53aa41:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-2d53aa41 fallback=db-fuzz-2d53aa41:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,side-plank,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,standing-calf-raise,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,single-arm-dumbbell-row,db-rdl,db-triceps-extension,side-plank,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank,thread-the-needle`
- Semantic signature: `cc7c809f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, side-plank, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, single-arm-dumbbell-row, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 47 — dumbbells #2805

- Seed: `db-fuzz-340fee19`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-340fee19:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-340fee19:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-340fee19 fallback=db-fuzz-340fee19:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,glute-bridges,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,standing-calf-raise,db-triceps-extension,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-bench-press,single-arm-dumbbell-row,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-glute-bridge-hold,seated-lat-sweep-pulse,breathing-90-90`
- Semantic signature: `c7f3bb98`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-triceps-extension, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, seated-lat-sweep-pulse, breathing-90-90

### Fallback 48 — dumbbells #2873

- Seed: `db-fuzz-3acc17d6`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-3acc17d6:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-3acc17d6:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-3acc17d6 fallback=db-fuzz-3acc17d6:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank,thread-the-needle`
- Semantic signature: `7680b1d4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 49 — dumbbells #2941

- Seed: `db-fuzz-4188c196`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-4188c196:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-4188c196:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-4188c196 fallback=db-fuzz-4188c196:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:ankle-mobility,scapular-pushups,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,dumbbell-sumo-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,reverse-snow-angel,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:ankle-mobility,scapular-pushups,split-squat,pushup,dumbbell-pullover,single-leg-rdl,db-triceps-extension,suitcase-carry,breathing-90-90|Upper Pattern Practice:wall-slides,scapular-pushups,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:ankle-mobility,hip-hinge-drill,bodyweight-squat,db-rdl,standing-calf-raise,suitcase-carry,breathing-90-90`
- Semantic signature: `bd1ecfb5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, hip-hinge-drill, bodyweight-squat, db-rdl, standing-calf-raise, suitcase-carry, breathing-90-90

### Fallback 50 — dumbbells #3009

- Seed: `db-fuzz-48449b66`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-48449b66:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-48449b66:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-48449b66 fallback=db-fuzz-48449b66:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Practice & Restore:wall-angel-hold,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `4addd58c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 51 — dumbbells #3077

- Seed: `db-fuzz-4f016927`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-4f016927:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-4f016927:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-4f016927 fallback=db-fuzz-4f016927:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,dumbbell-sumo-rdl,split-squat,pike-pushup,dumbbell-rows,single-leg-rdl,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `2adb1a2a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 52 — dumbbells #3145

- Seed: `db-fuzz-55bd2c97`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-55bd2c97:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-55bd2c97:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-55bd2c97 fallback=db-fuzz-55bd2c97:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-pullover,db-rdl,db-triceps-extension,farmers-carry,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,reverse-snow-angel,db-biceps-curl,thread-the-needle`
- Semantic signature: `2f2babd6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, reverse-snow-angel, db-biceps-curl, thread-the-needle

### Fallback 53 — dumbbells #3281

- Seed: `db-fuzz-63367c04`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-63367c04:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-63367c04:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-63367c04 fallback=db-fuzz-63367c04:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,farmers-carry,standing-calf-raise,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-glute-bridge-hold,split-squat,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,single-arm-dumbbell-row,dumbbell-chest-fly,side-plank-star,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,thread-the-needle`
- Semantic signature: `b13d12f8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-chest-fly, side-plank-star, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 54 — dumbbells #3417

- Seed: `db-fuzz-70aeb594`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-70aeb594:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-70aeb594:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-70aeb594 fallback=db-fuzz-70aeb594:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `461af602`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 55 — dumbbells #3553

- Seed: `db-fuzz-7e271565`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-7e271565:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-7e271565:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-7e271565 fallback=db-fuzz-7e271565:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,back-widow,side-plank-star,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank-star,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-rdl,db-triceps-extension,standing-calf-raise,breathing-90-90|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank-star,breathing-90-90`
- Semantic signature: `486e7077`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, back-widow, side-plank-star, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, breathing-90-90

### Fallback 56 — dumbbells #3689

- Seed: `db-fuzz-8ba09aea`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-8ba09aea:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-8ba09aea:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-8ba09aea fallback=db-fuzz-8ba09aea:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:ankle-mobility,scapular-pushups,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,dumbbell-sumo-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,single-leg-rdl,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:ankle-mobility,scapular-pushups,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,suitcase-carry,breathing-90-90|Practice & Restore:cat-cow,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,breathing-90-90`
- Semantic signature: `eb1ef360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, breathing-90-90

### Fallback 57 — dumbbells #3825

- Seed: `db-fuzz-99182e4a`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-99182e4a:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-99182e4a:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-99182e4a fallback=db-fuzz-99182e4a:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,farmers-carry,thread-the-needle`
- Semantic signature: `8bd08001`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, thread-the-needle

### Fallback 58 — dumbbells #3961

- Seed: `db-fuzz-a691fbcb`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-a691fbcb:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-a691fbcb:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-a691fbcb fallback=db-fuzz-a691fbcb:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,reverse-snow-angel,side-plank,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,db-triceps-extension,side-plank,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,prone-elbow-row,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,single-leg-hip-thrust,standing-calf-raise,side-plank,breathing-90-90`
- Semantic signature: `73a5c631`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, prone-elbow-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-hip-thrust, standing-calf-raise, side-plank, breathing-90-90

### Fallback 59 — dumbbells #4097

- Seed: `db-fuzz-b40ab768`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-b40ab768:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-b40ab768:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-b40ab768 fallback=db-fuzz-b40ab768:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,db-rdl,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank-star,thread-the-needle|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `8f02f9b6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 60 — dumbbells #4233

- Seed: `db-fuzz-c18268e8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-c18268e8:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-c18268e8:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-c18268e8 fallback=db-fuzz-c18268e8:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,glute-bridges,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,standing-calf-raise,db-triceps-extension,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,hip-flexor-stretch|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-bench-press,single-arm-dumbbell-row,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-glute-bridge-hold,seated-lat-sweep-pulse,hip-flexor-stretch`
- Semantic signature: `aa5747aa`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-triceps-extension, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, seated-lat-sweep-pulse, hip-flexor-stretch

### Fallback 61 — dumbbells #4369

- Seed: `db-fuzz-cefb8189`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-cefb8189:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-cefb8189:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-cefb8189 fallback=db-fuzz-cefb8189:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,db-rdl,dumbbell-chest-fly,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `1802d05b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 62 — dumbbells #4437

- Seed: `db-fuzz-d5b777c1`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-d5b777c1:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-d5b777c1:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-d5b777c1 fallback=db-fuzz-d5b777c1:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:ankle-mobility,scapular-pushups,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,glute-bridges,db-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-leg-hip-thrust,standing-calf-raise,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:ankle-mobility,scapular-pushups,split-squat,pushup,dumbbell-rows,db-triceps-extension,hollow-body-hold,breathing-90-90|Practice & Restore:wall-angel-hold,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,breathing-90-90`
- Semantic signature: `ee2b0938`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-leg-hip-thrust, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-rows, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, breathing-90-90

### Fallback 63 — dumbbells #4505

- Seed: `db-fuzz-dc732909`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-dc732909:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-dc732909:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-dc732909 fallback=db-fuzz-dc732909:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,single-leg-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `85bedd4f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 64 — dumbbells #4573

- Seed: `db-fuzz-e330ab4e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-e330ab4e:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-e330ab4e:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-e330ab4e fallback=db-fuzz-e330ab4e:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,standing-calf-raise,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-pullover,db-rdl,db-triceps-extension,side-plank,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank,thread-the-needle`
- Semantic signature: `0aec3558`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 65 — dumbbells #4641

- Seed: `db-fuzz-e9ec726e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-e9ec726e:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-e9ec726e:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-e9ec726e fallback=db-fuzz-e9ec726e:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,hip-hinge-drill,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,db-triceps-extension,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,suitcase-carry,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-bench-press,single-arm-dumbbell-row,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,single-leg-glute-bridge-hold,standing-calf-raise,breathing-90-90`
- Semantic signature: `4bd78d9e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-glute-bridge-hold, standing-calf-raise, breathing-90-90

### Fallback 66 — dumbbells #4709

- Seed: `db-fuzz-f0a81e2e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-f0a81e2e:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-f0a81e2e:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-f0a81e2e fallback=db-fuzz-f0a81e2e:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-rear-delt-fly,farmers-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,split-squat,dumbbell-shoulder-press,dumbbell-rows,farmers-carry,standing-calf-raise,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-step-up-loaded,pushup,dumbbell-pullover,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,standing-calf-raise,breathing-90-90|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank-star,breathing-90-90`
- Semantic signature: `5d0d790a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-rear-delt-fly, farmers-carry, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, breathing-90-90

### Fallback 67 — dumbbells #4777

- Seed: `db-fuzz-f765b6ef`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-f765b6ef:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-f765b6ef:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-f765b6ef fallback=db-fuzz-f765b6ef:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,db-biceps-curl,standing-calf-raise,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,wall-angel-hold,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,db-triceps-extension,farmers-carry,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,single-leg-rdl,dumbbell-chest-fly,side-plank-star,hip-flexor-stretch|Upper Pattern Practice:cat-cow,wall-angel-hold,dumbbell-bench-press,single-arm-dumbbell-row,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,db-rdl,standing-calf-raise,farmers-carry,hip-flexor-stretch`
- Semantic signature: `53f23fa2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, db-biceps-curl, standing-calf-raise, hip-flexor-stretch
  - Day 2: cat-cow, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, farmers-carry, hip-flexor-stretch
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, hip-flexor-stretch

### Fallback 68 — dumbbells #4845

- Seed: `db-fuzz-fe216aaf`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-fe216aaf:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-fe216aaf:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-fe216aaf fallback=db-fuzz-fe216aaf:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,standing-calf-raise,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,hip-hinge-drill,db-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,farmers-carry,standing-calf-raise,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,dumbbell-chest-fly,side-plank-star,thread-the-needle|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d7342717`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, side-plank-star, thread-the-needle
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 69 — dumbbells #4913

- Seed: `db-fuzz-4dde34f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-4dde34f:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-4dde34f:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-4dde34f fallback=db-fuzz-4dde34f:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,dumbbell-sumo-rdl,split-squat,pike-pushup,dumbbell-rows,single-leg-rdl,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `90df6ea0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 70 — dumbbells #4981

- Seed: `db-fuzz-b9a310c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-b9a310c:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-b9a310c:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-b9a310c fallback=db-fuzz-b9a310c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,back-widow,side-plank-star,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank-star,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,db-triceps-extension,standing-calf-raise,hip-flexor-stretch|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank-star,hip-flexor-stretch`
- Semantic signature: `9ca38176`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, back-widow, side-plank-star, hip-flexor-stretch
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, standing-calf-raise, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, hip-flexor-stretch

### Fallback 71 — dumbbells #5117

- Seed: `db-fuzz-1912f98c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-1912f98c:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-1912f98c:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-1912f98c fallback=db-fuzz-1912f98c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,farmers-carry,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,thread-the-needle`
- Semantic signature: `472b5788`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 72 — dumbbells #5253

- Seed: `db-fuzz-268ba02d`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-268ba02d:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-268ba02d:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-268ba02d fallback=db-fuzz-268ba02d:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,db-triceps-extension,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,farmers-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,dumbbell-chest-fly,farmers-carry,breathing-90-90|Practice & Restore:cat-cow,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,breathing-90-90`
- Semantic signature: `1005e515`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-triceps-extension, breathing-90-90
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, farmers-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, breathing-90-90

### Fallback 73 — dumbbells #5389

- Seed: `db-fuzz-340418aa`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-340418aa:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-340418aa:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-340418aa fallback=db-fuzz-340418aa:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-rdl,db-triceps-extension,suitcase-carry,breathing-90-90|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,suitcase-carry,breathing-90-90`
- Semantic signature: `d8590870`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, suitcase-carry, breathing-90-90

### Fallback 74 — dumbbells #5525

- Seed: `db-fuzz-417c93ca`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-417c93ca:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-417c93ca:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-417c93ca fallback=db-fuzz-417c93ca:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,dumbbell-sumo-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,single-leg-rdl,farmers-carry,standing-calf-raise,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank-star,thread-the-needle|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank-star,thread-the-needle`
- Semantic signature: `f55f5464`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, thread-the-needle

### Fallback 75 — dumbbells #5661

- Seed: `db-fuzz-4ef5364b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-4ef5364b:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-4ef5364b:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-4ef5364b fallback=db-fuzz-4ef5364b:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,db-biceps-curl,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,standing-calf-raise,thread-the-needle`
- Semantic signature: `6a9d5f61`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, thread-the-needle

### Fallback 76 — dumbbells #5797

- Seed: `db-fuzz-5c6e42a8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-5c6e42a8:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-5c6e42a8:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-5c6e42a8 fallback=db-fuzz-5c6e42a8:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,db-rdl,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `b2c68dce`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 77 — dumbbells #5933

- Seed: `db-fuzz-69e6ad28`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-69e6ad28:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-69e6ad28:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-69e6ad28 fallback=db-fuzz-69e6ad28:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,db-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,reverse-snow-angel,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,side-plank,thread-the-needle`
- Semantic signature: `eb569b27`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, reverse-snow-angel, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 78 — dumbbells #6069

- Seed: `db-fuzz-775f1d89`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-775f1d89:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-775f1d89:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-775f1d89 fallback=db-fuzz-775f1d89:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,hip-hinge-drill,db-rdl,dumbbell-reverse-lunge,pike-pushup,cossack-squat,db-biceps-curl,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,single-leg-rdl,standing-calf-raise,thread-the-needle`
- Semantic signature: `9e197581`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, cossack-squat, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-rdl, standing-calf-raise, thread-the-needle

### Fallback 79 — dumbbells #6205

- Seed: `db-fuzz-84d89406`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-84d89406:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-84d89406:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-84d89406 fallback=db-fuzz-84d89406:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,db-triceps-extension,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,dumbbell-chest-fly,side-plank-star,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-bench-press,single-arm-dumbbell-row,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-hip-thrust,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `604d777f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, dumbbell-chest-fly, side-plank-star, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-hip-thrust, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 80 — dumbbells #6273

- Seed: `db-fuzz-8b94e876`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-8b94e876:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-8b94e876:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-8b94e876 fallback=db-fuzz-8b94e876:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,glute-bridges,db-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,standing-calf-raise,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `5c38f215`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 81 — dumbbells #6341

- Seed: `db-fuzz-925024b6`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-925024b6:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-925024b6:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-925024b6 fallback=db-fuzz-925024b6:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `d534edb8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 82 — dumbbells #6409

- Seed: `db-fuzz-990d90e7`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-990d90e7:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-990d90e7:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-990d90e7 fallback=db-fuzz-990d90e7:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,side-plank-star,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,single-arm-dumbbell-row,single-leg-hip-thrust,db-triceps-extension,side-plank-star,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank-star,thread-the-needle`
- Semantic signature: `2bf95b24`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, single-arm-dumbbell-row, single-leg-hip-thrust, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, thread-the-needle

### Fallback 83 — dumbbells #6477

- Seed: `db-fuzz-9fc9c327`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-9fc9c327:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-9fc9c327:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-9fc9c327 fallback=db-fuzz-9fc9c327:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,glute-bridges,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,back-widow,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-glute-bridge-hold,seated-lat-sweep-pulse,breathing-90-90`
- Semantic signature: `5e67eea5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, back-widow, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, seated-lat-sweep-pulse, breathing-90-90

### Fallback 84 — dumbbells #6545

- Seed: `db-fuzz-a6850977`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-a6850977:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-a6850977:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-a6850977 fallback=db-fuzz-a6850977:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank,thread-the-needle`
- Semantic signature: `a529f2a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 85 — dumbbells #6613

- Seed: `db-fuzz-ad42afb4`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-ad42afb4:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-ad42afb4:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-ad42afb4 fallback=db-fuzz-ad42afb4:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:ankle-mobility,scapular-pushups,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,dumbbell-sumo-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,db-triceps-extension,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:ankle-mobility,scapular-pushups,split-squat,pushup,dumbbell-pullover,single-leg-rdl,dumbbell-chest-fly,suitcase-carry,breathing-90-90|Upper Pattern Practice:wall-slides,scapular-pushups,dumbbell-bench-press,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:ankle-mobility,hip-hinge-drill,bodyweight-squat,db-rdl,standing-calf-raise,suitcase-carry,breathing-90-90`
- Semantic signature: `5a91c846`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-bench-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, hip-hinge-drill, bodyweight-squat, db-rdl, standing-calf-raise, suitcase-carry, breathing-90-90

### Fallback 86 — dumbbells #6681

- Seed: `db-fuzz-b3fee604`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-b3fee604:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-b3fee604:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-b3fee604 fallback=db-fuzz-b3fee604:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,db-triceps-extension,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,dumbbell-chest-fly,farmers-carry,thread-the-needle|Practice & Restore:wall-angel-hold,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `8b798e99`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-triceps-extension, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 87 — dumbbells #6749

- Seed: `db-fuzz-baba1244`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-baba1244:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-baba1244:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-baba1244 fallback=db-fuzz-baba1244:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,dumbbell-sumo-rdl,split-squat,pike-pushup,dumbbell-rows,single-leg-rdl,db-triceps-extension,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,pike-pushup,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-step-up-loaded,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `15fda875`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 88 — dumbbells #6817

- Seed: `db-fuzz-c1763d74`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-c1763d74:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-c1763d74:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-c1763d74 fallback=db-fuzz-c1763d74:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,side-plank-star,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank-star,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,db-triceps-extension,side-plank-star,breathing-90-90|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank-star,breathing-90-90`
- Semantic signature: `41587525`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, side-plank-star, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, breathing-90-90

### Fallback 89 — dumbbells #6953

- Seed: `db-fuzz-ceef6ce5`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-ceef6ce5:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-ceef6ce5:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-ceef6ce5 fallback=db-fuzz-ceef6ce5:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-glute-bridge-hold,split-squat,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,pushup,dumbbell-pullover,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,side-plank-star,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank-star,thread-the-needle`
- Semantic signature: `5c618687`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, thread-the-needle

### Fallback 90 — dumbbells #7089

- Seed: `db-fuzz-dc68947a`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-dc68947a:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-dc68947a:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-dc68947a fallback=db-fuzz-dc68947a:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,db-triceps-extension,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,dumbbell-chest-fly,farmers-carry,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `e81e3f8b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-triceps-extension, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 91 — dumbbells #7225

- Seed: `db-fuzz-e9e007fa`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-e9e007fa:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-e9e007fa:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-e9e007fa fallback=db-fuzz-e9e007fa:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,dumbbell-sumo-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,single-leg-rdl,dumbbell-chest-fly,farmers-carry,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,thread-the-needle`
- Semantic signature: `b007d6ed`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 92 — dumbbells #7361

- Seed: `db-fuzz-f759637b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-f759637b:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-f759637b:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-f759637b fallback=db-fuzz-f759637b:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:ankle-mobility,scapular-pushups,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,dumbbell-sumo-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,single-leg-rdl,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:ankle-mobility,scapular-pushups,dumbbell-reverse-lunge,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,suitcase-carry,breathing-90-90|Practice & Restore:cat-cow,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,suitcase-carry,breathing-90-90`
- Semantic signature: `90b52636`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, suitcase-carry, breathing-90-90

### Fallback 93 — dumbbells #7497

- Seed: `db-fuzz-4d23ef8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-4d23ef8:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-4d23ef8:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-4d23ef8 fallback=db-fuzz-4d23ef8:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,farmers-carry,thread-the-needle`
- Semantic signature: `5673edd6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, thread-the-needle

### Fallback 94 — dumbbells #7633

- Seed: `db-fuzz-124af278`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-124af278:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-124af278:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-124af278 fallback=db-fuzz-124af278:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,reverse-snow-angel,farmers-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,db-triceps-extension,side-plank-star,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-bench-press,single-arm-dumbbell-row,dumbbell-rear-delt-fly,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-hip-thrust,farmers-carry,standing-calf-raise,breathing-90-90`
- Semantic signature: `200e2ebd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, dumbbell-rear-delt-fly, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-hip-thrust, farmers-carry, standing-calf-raise, breathing-90-90

### Fallback 95 — dumbbells #7769

- Seed: `db-fuzz-1fc399f9`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-1fc399f9:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-1fc399f9:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-1fc399f9 fallback=db-fuzz-1fc399f9:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,db-rdl,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-step-up-loaded,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank-star,thread-the-needle|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-bench-press,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `5628495c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 96 — dumbbells #7905

- Seed: `db-fuzz-2d3c017e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-2d3c017e:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-2d3c017e:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-2d3c017e fallback=db-fuzz-2d3c017e:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,glute-bridges,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,standing-calf-raise,db-biceps-curl,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,hip-flexor-stretch|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,back-widow,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-glute-bridge-hold,seated-lat-sweep-pulse,hip-flexor-stretch`
- Semantic signature: `f7c29ffb`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, back-widow, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, seated-lat-sweep-pulse, hip-flexor-stretch

### Fallback 97 — dumbbells #8041

- Seed: `db-fuzz-3ab4e8fe`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-3ab4e8fe:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-3ab4e8fe:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-3ab4e8fe fallback=db-fuzz-3ab4e8fe:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,db-rdl,dumbbell-chest-fly,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-bench-press,single-arm-dumbbell-row,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `7b26eefa`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 98 — dumbbells #8109

- Seed: `db-fuzz-4171643f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-4171643f:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-4171643f:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-4171643f fallback=db-fuzz-4171643f:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,side-plank,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank,thread-the-needle|Practice & Restore:wall-angel-hold,prone-ytw,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `b4df9d02`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, side-plank, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 99 — dumbbells #8177

- Seed: `db-fuzz-482d307f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-482d307f:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-482d307f:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-482d307f fallback=db-fuzz-482d307f:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,single-leg-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,db-triceps-extension,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,pike-pushup,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-step-up-loaded,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `1a5b00fc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 100 — dumbbells #8245

- Seed: `db-fuzz-4ee985bf`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-4ee985bf:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-4ee985bf:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-4ee985bf fallback=db-fuzz-4ee985bf:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,standing-calf-raise,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,db-rdl,db-triceps-extension,side-plank,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank,thread-the-needle`
- Semantic signature: `8f3b645a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 101 — dumbbells #8313

- Seed: `db-fuzz-55a64bfc`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-55a64bfc:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-55a64bfc:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-55a64bfc fallback=db-fuzz-55a64bfc:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,hip-hinge-drill,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,db-biceps-curl,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,suitcase-carry,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,single-leg-glute-bridge-hold,standing-calf-raise,breathing-90-90`
- Semantic signature: `2998ef06`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-glute-bridge-hold, standing-calf-raise, breathing-90-90

### Fallback 102 — dumbbells #8381

- Seed: `db-fuzz-5c622d3c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-5c622d3c:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-5c622d3c:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-5c622d3c fallback=db-fuzz-5c622d3c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,prone-elbow-row,farmers-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,split-squat,dumbbell-shoulder-press,dumbbell-rows,farmers-carry,standing-calf-raise,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,pushup,dumbbell-pullover,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,standing-calf-raise,breathing-90-90|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,side-plank-star,breathing-90-90`
- Semantic signature: `d256397f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, prone-elbow-row, farmers-carry, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, breathing-90-90

### Fallback 103 — dumbbells #8449

- Seed: `db-fuzz-631ea77c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-631ea77c:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-631ea77c:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-631ea77c fallback=db-fuzz-631ea77c:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,dumbbell-sumo-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-rdl,db-triceps-extension,side-plank-star,thread-the-needle|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `aaf88a64`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 104 — dumbbells #8517

- Seed: `db-fuzz-69db7ebd`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-69db7ebd:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-69db7ebd:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-69db7ebd fallback=db-fuzz-69db7ebd:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,db-triceps-extension,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,dumbbell-chest-fly,farmers-carry,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `eeaa26a2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-triceps-extension, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 105 — dumbbells #8585

- Seed: `db-fuzz-70971afd`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-70971afd:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-70971afd:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-70971afd fallback=db-fuzz-70971afd:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,dumbbell-sumo-rdl,split-squat,pike-pushup,dumbbell-rows,single-leg-rdl,db-triceps-extension,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,farmers-carry,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,pike-pushup,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-step-up-loaded,standing-calf-raise,farmers-carry,thread-the-needle`
- Semantic signature: `f66d8a7b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 106 — dumbbells #8653

- Seed: `db-fuzz-7753ca3d`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-7753ca3d:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-7753ca3d:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-7753ca3d fallback=db-fuzz-7753ca3d:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,back-widow,side-plank-star,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,side-plank-star,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,standing-calf-raise,side-plank-star,hip-flexor-stretch|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,hip-flexor-stretch`
- Semantic signature: `f19b8dbe`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, back-widow, side-plank-star, hip-flexor-stretch
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, hip-flexor-stretch

### Fallback 107 — dumbbells #8789

- Seed: `db-fuzz-84cce7ba`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-84cce7ba:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-84cce7ba:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-84cce7ba fallback=db-fuzz-84cce7ba:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,db-rdl,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,farmers-carry,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,farmers-carry,thread-the-needle`
- Semantic signature: `b62f3b6e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, farmers-carry, thread-the-needle

### Fallback 108 — dumbbells #8925

- Seed: `db-fuzz-92459b3b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-92459b3b:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-92459b3b:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-92459b3b fallback=db-fuzz-92459b3b:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-rows,db-triceps-extension,farmers-carry,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `461af602`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 109 — dumbbells #9061

- Seed: `db-fuzz-9fbd303b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-9fbd303b:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-9fbd303b:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-9fbd303b fallback=db-fuzz-9fbd303b:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,standing-calf-raise,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-pullover,single-leg-rdl,dumbbell-chest-fly,suitcase-carry,breathing-90-90|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,breathing-90-90`
- Semantic signature: `1228213e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, breathing-90-90

### Fallback 110 — dumbbells #9197

- Seed: `db-fuzz-ad36f8b8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-ad36f8b8:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-ad36f8b8:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-ad36f8b8 fallback=db-fuzz-ad36f8b8:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,farmers-carry,standing-calf-raise,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,dumbbell-sumo-rdl,split-squat,dumbbell-shoulder-press,dumbbell-rows,single-leg-rdl,farmers-carry,standing-calf-raise,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-bulgarian-split-squat,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,dumbbell-chest-fly,side-plank-star,thread-the-needle|Practice & Restore:cat-cow,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,db-triceps-extension,thread-the-needle`
- Semantic signature: `07d1ceac`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, side-plank-star, thread-the-needle
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 111 — dumbbells #9333

- Seed: `db-fuzz-baae4138`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-baae4138:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-baae4138:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-baae4138 fallback=db-fuzz-baae4138:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,glute-bridges,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,db-biceps-curl,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-glute-bridge-hold,standing-calf-raise,thread-the-needle`
- Semantic signature: `964dc0e1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, standing-calf-raise, thread-the-needle

### Fallback 112 — dumbbells #9469

- Seed: `db-fuzz-c82769b9`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-c82769b9:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-c82769b9:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-c82769b9 fallback=db-fuzz-c82769b9:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,pushup,single-arm-dumbbell-row,db-rdl,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,db-rdl,dumbbell-reverse-lunge,pike-pushup,dumbbell-rows,reverse-snow-angel,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,dumbbell-floor-press,dumbbell-pullover,db-rdl,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `80da265f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 113 — dumbbells #9605

- Seed: `db-fuzz-d5a09206`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-d5a09206:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-d5a09206:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-d5a09206 fallback=db-fuzz-d5a09206:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,incline-pushup,single-arm-dumbbell-row,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,prone-ytw,db-rdl,split-squat,pike-pushup,dumbbell-rows,db-rdl,reverse-snow-angel,side-plank,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,pushup,dumbbell-pullover,db-rdl,single-arm-dumbbell-row,db-triceps-extension,side-plank,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,pike-pushup,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,bodyweight-squat,db-rdl,dumbbell-reverse-lunge,standing-calf-raise,side-plank,thread-the-needle`
- Semantic signature: `1bbebd9a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, reverse-snow-angel, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 114 — dumbbells #9741

- Seed: `db-fuzz-e3180eb6`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-e3180eb6:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-e3180eb6:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-e3180eb6 fallback=db-fuzz-e3180eb6:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,hip-hinge-drill,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,db-biceps-curl,suitcase-carry,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,suitcase-carry,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,bodyweight-squat,single-leg-glute-bridge-hold,standing-calf-raise,breathing-90-90`
- Semantic signature: `3b4ac0b2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-glute-bridge-hold, standing-calf-raise, breathing-90-90

### Fallback 115 — dumbbells #9877

- Seed: `db-fuzz-f0916327`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-f0916327:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-f0916327:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-f0916327 fallback=db-fuzz-f0916327:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-glute-bridge-hold,dumbbell-reverse-lunge,dumbbell-shoulder-press,dumbbell-rows,reverse-snow-angel,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,split-squat,pushup,dumbbell-pullover,single-leg-hip-thrust,db-triceps-extension,side-plank-star,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,bodyweight-squat,single-leg-hip-thrust,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `e84ef7a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-hip-thrust, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 116 — dumbbells #9945

- Seed: `db-fuzz-f74d11f7`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery hard failures: #1[db-fuzz-f74d11f7:quality-recovery:1]=DUMBBELL_PREP_AS_MAIN; #2[db-fuzz-f74d11f7:quality-recovery:2]=DUMBBELL_PREP_AS_MAIN
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Reproducible seeds: base=db-fuzz-f74d11f7 fallback=db-fuzz-f74d11f7:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,heels-elevated-squat,dumbbell-floor-press,single-arm-dumbbell-row,standing-calf-raise,farmers-carry,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,glute-bridges,db-rdl,dumbbell-reverse-lunge,dumbbell-shoulder-press,standing-calf-raise,side-plank-star,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,split-squat,pushup,dumbbell-rows,db-triceps-extension,side-plank-star,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,bodyweight-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `5c38f215`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 117 — mixedHome #90

- Seed: `mh-fuzz-3db87c53`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-3db87c53:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-3db87c53:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-3db87c53 fallback=mh-fuzz-3db87c53:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 118 — mixedHome #117

- Seed: `mh-fuzz-ed92fa04`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-ed92fa04:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-ed92fa04:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-ed92fa04 fallback=mh-fuzz-ed92fa04:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 119 — mixedHome #144

- Seed: `mh-fuzz-9d6b702a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-9d6b702a:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-9d6b702a:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-9d6b702a fallback=mh-fuzz-9d6b702a:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 120 — mixedHome #263

- Seed: `mh-fuzz-293557bd`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-293557bd:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-293557bd:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-293557bd fallback=mh-fuzz-293557bd:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `99686835`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 121 — mixedHome #266

- Seed: `mh-fuzz-3dbe840`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-3dbe840:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-3dbe840:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-3dbe840 fallback=mh-fuzz-3dbe840:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 122 — mixedHome #269

- Seed: `mh-fuzz-de82862c`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-de82862c:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-de82862c:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-de82862c fallback=mh-fuzz-de82862c:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `e01adf14`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 123 — mixedHome #290

- Seed: `mh-fuzz-d90f8d3c`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-d90f8d3c:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-d90f8d3c:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-d90f8d3c fallback=mh-fuzz-d90f8d3c:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 124 — mixedHome #293

- Seed: `mh-fuzz-b3b572f3`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-b3b572f3:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-b3b572f3:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-b3b572f3 fallback=mh-fuzz-b3b572f3:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 125 — mixedHome #296

- Seed: `mh-fuzz-8e5ca005`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-8e5ca005:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-8e5ca005:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-8e5ca005 fallback=mh-fuzz-8e5ca005:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 126 — mixedHome #317

- Seed: `mh-fuzz-88e9a137`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-88e9a137:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-88e9a137:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-88e9a137 fallback=mh-fuzz-88e9a137:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `3300607d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 127 — mixedHome #320

- Seed: `mh-fuzz-638ff57e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-638ff57e:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-638ff57e:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-638ff57e fallback=mh-fuzz-638ff57e:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 128 — mixedHome #323

- Seed: `mh-fuzz-3e363a32`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-3e363a32:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-3e363a32:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-3e363a32 fallback=mh-fuzz-3e363a32:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 129 — mixedHome #495

- Seed: `mh-fuzz-8b7b4d8b`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-8b7b4d8b:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-8b7b4d8b:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-8b7b4d8b fallback=mh-fuzz-8b7b4d8b:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `9f56ef71`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 130 — mixedHome #498

- Seed: `mh-fuzz-66225221`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-66225221:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-66225221:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-66225221 fallback=mh-fuzz-66225221:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `e2484360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 131 — mixedHome #501

- Seed: `mh-fuzz-40c8e1de`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-40c8e1de:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-40c8e1de:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-40c8e1de fallback=mh-fuzz-40c8e1de:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `e316bd5c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 132 — mixedHome #522

- Seed: `mh-fuzz-3b55a7ce`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-3b55a7ce:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-3b55a7ce:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-3b55a7ce fallback=mh-fuzz-3b55a7ce:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 133 — mixedHome #544

- Seed: `mh-fuzz-d41ac5cb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-d41ac5cb:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-d41ac5cb:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-d41ac5cb fallback=mh-fuzz-d41ac5cb:quality-fallback:mixedHome:canonical-mixed-home-lane:d3:Intermediate:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,single-leg-rdl,db-biceps-curl,standing-calf-raise,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,dumbbell-reverse-lunge,pike-pushup,single-arm-dumbbell-row,face-pull,db-triceps-extension,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-rdl,farmers-carry,cossack-squat,thread-the-needle`
- Semantic signature: `8e21fab8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-rdl, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, face-pull, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-rdl, farmers-carry, cossack-squat, thread-the-needle

### Fallback 134 — mixedHome #549

- Seed: `mh-fuzz-eb2f9969`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-eb2f9969:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-eb2f9969:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-eb2f9969 fallback=mh-fuzz-eb2f9969:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 135 — mixedHome #587

- Seed: `mh-fuzz-676be5e7`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-676be5e7:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-676be5e7:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-676be5e7 fallback=mh-fuzz-676be5e7:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `e90ab5ad`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 136 — mixedHome #593

- Seed: `mh-fuzz-1cb8400a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-1cb8400a:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-1cb8400a:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-1cb8400a fallback=mh-fuzz-1cb8400a:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `007b2928`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 137 — mixedHome #614

- Seed: `mh-fuzz-17454f72`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-17454f72:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-17454f72:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-17454f72 fallback=mh-fuzz-17454f72:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `4e0b5161`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 138 — mixedHome #617

- Seed: `mh-fuzz-f1eb34a1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f1eb34a1:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f1eb34a1:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f1eb34a1 fallback=mh-fuzz-f1eb34a1:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `938158a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 139 — mixedHome #620

- Seed: `mh-fuzz-cc92fecf`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-cc92fecf:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-cc92fecf:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-cc92fecf fallback=mh-fuzz-cc92fecf:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f81becec`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 140 — mixedHome #641

- Seed: `mh-fuzz-c71feafd`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-c71feafd:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-c71feafd:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-c71feafd fallback=mh-fuzz-c71feafd:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `b40d479b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 141 — mixedHome #647

- Seed: `mh-fuzz-7c6c7464`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-7c6c7464:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-7c6c7464:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-7c6c7464 fallback=mh-fuzz-7c6c7464:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `8be73c67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 142 — mixedHome #2207

- Seed: `mh-fuzz-9e7908d9`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-9e7908d9:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-9e7908d9:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-9e7908d9 fallback=mh-fuzz-9e7908d9:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `3752909d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 143 — mixedHome #2210

- Seed: `mh-fuzz-79207a93`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-79207a93:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-79207a93:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-79207a93 fallback=mh-fuzz-79207a93:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 144 — mixedHome #2213

- Seed: `mh-fuzz-53c62300`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-53c62300:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-53c62300:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-53c62300 fallback=mh-fuzz-53c62300:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `e01adf14`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 145 — mixedHome #2234

- Seed: `mh-fuzz-4e532218`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-4e532218:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-4e532218:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-4e532218 fallback=mh-fuzz-4e532218:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 146 — mixedHome #2237

- Seed: `mh-fuzz-28f9f1a7`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-28f9f1a7:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-28f9f1a7:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-28f9f1a7 fallback=mh-fuzz-28f9f1a7:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 147 — mixedHome #2240

- Seed: `mh-fuzz-3a045d1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-3a045d1:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-3a045d1:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-3a045d1 fallback=mh-fuzz-3a045d1:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 148 — mixedHome #2264

- Seed: `mh-fuzz-d8d377da`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-d8d377da:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-d8d377da:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-d8d377da fallback=mh-fuzz-d8d377da:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 149 — mixedHome #2267

- Seed: `mh-fuzz-b37aaf66`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-b37aaf66:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-b37aaf66:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-b37aaf66 fallback=mh-fuzz-b37aaf66:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 150 — mixedHome #2439

- Seed: `mh-fuzz-bfdfb7`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-bfdfb7:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-bfdfb7:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-bfdfb7 fallback=mh-fuzz-bfdfb7:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `9f56ef71`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 151 — mixedHome #2442

- Seed: `mh-fuzz-db66977d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-db66977d:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-db66977d:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-db66977d fallback=mh-fuzz-db66977d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `e2484360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 152 — mixedHome #2445

- Seed: `mh-fuzz-b60c0f22`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-b60c0f22:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-b60c0f22:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-b60c0f22 fallback=mh-fuzz-b60c0f22:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `e316bd5c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 153 — mixedHome #2466

- Seed: `mh-fuzz-b099042a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-b099042a:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-b099042a:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-b099042a fallback=mh-fuzz-b099042a:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 154 — mixedHome #2493

- Seed: `mh-fuzz-6073ea2d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-6073ea2d:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-6073ea2d:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-6073ea2d fallback=mh-fuzz-6073ea2d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 155 — mixedHome #2531

- Seed: `mh-fuzz-dcaf460b`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-dcaf460b:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-dcaf460b:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-dcaf460b fallback=mh-fuzz-dcaf460b:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `e90ab5ad`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 156 — mixedHome #2537

- Seed: `mh-fuzz-91fce536`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-91fce536:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-91fce536:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-91fce536 fallback=mh-fuzz-91fce536:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `007b2928`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 157 — mixedHome #2558

- Seed: `mh-fuzz-8c89fcc6`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-8c89fcc6:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-8c89fcc6:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-8c89fcc6 fallback=mh-fuzz-8c89fcc6:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `4e0b5161`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 158 — mixedHome #2561

- Seed: `mh-fuzz-672fba4d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-672fba4d:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-672fba4d:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-672fba4d fallback=mh-fuzz-672fba4d:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `938158a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 159 — mixedHome #2564

- Seed: `mh-fuzz-41d60ba3`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-41d60ba3:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-41d60ba3:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-41d60ba3 fallback=mh-fuzz-41d60ba3:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f81becec`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 160 — mixedHome #2585

- Seed: `mh-fuzz-3c637999`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-3c637999:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-3c637999:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-3c637999 fallback=mh-fuzz-3c637999:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `b40d479b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 161 — mixedHome #2591

- Seed: `mh-fuzz-f1b0d190`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f1b0d190:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f1b0d190:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f1b0d190 fallback=mh-fuzz-f1b0d190:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `8be73c67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 162 — mixedHome #2682

- Seed: `mh-fuzz-2f684d63`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-2f684d63:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-2f684d63:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-2f684d63 fallback=mh-fuzz-2f684d63:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 163 — mixedHome #2709

- Seed: `mh-fuzz-df42e8f4`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-df42e8f4:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-df42e8f4:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-df42e8f4 fallback=mh-fuzz-df42e8f4:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 164 — mixedHome #2736

- Seed: `mh-fuzz-8f1c827d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-8f1c827d:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-8f1c827d:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-8f1c827d fallback=mh-fuzz-8f1c827d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 165 — mixedHome #2855

- Seed: `mh-fuzz-1ae5844d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-1ae5844d:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-1ae5844d:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-1ae5844d fallback=mh-fuzz-1ae5844d:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `99686835`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 166 — mixedHome #2858

- Seed: `mh-fuzz-f58cfe37`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f58cfe37:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f58cfe37:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f58cfe37 fallback=mh-fuzz-f58cfe37:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 167 — mixedHome #2861

- Seed: `mh-fuzz-d032a8fc`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-d032a8fc:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-d032a8fc:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-d032a8fc fallback=mh-fuzz-d032a8fc:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `e01adf14`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 168 — mixedHome #2882

- Seed: `mh-fuzz-cabfbeec`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-cabfbeec:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-cabfbeec:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-cabfbeec fallback=mh-fuzz-cabfbeec:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 169 — mixedHome #2885

- Seed: `mh-fuzz-a5654403`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-a5654403:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-a5654403:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-a5654403 fallback=mh-fuzz-a5654403:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 170 — mixedHome #2888

- Seed: `mh-fuzz-800cce75`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-800cce75:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-800cce75:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-800cce75 fallback=mh-fuzz-800cce75:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 171 — mixedHome #2909

- Seed: `mh-fuzz-7a993367`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-7a993367:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-7a993367:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-7a993367 fallback=mh-fuzz-7a993367:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `3300607d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 172 — mixedHome #2912

- Seed: `mh-fuzz-553fe22e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-553fe22e:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-553fe22e:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-553fe22e fallback=mh-fuzz-553fe22e:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 173 — mixedHome #2915

- Seed: `mh-fuzz-2fe60bc2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-2fe60bc2:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-2fe60bc2:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-2fe60bc2 fallback=mh-fuzz-2fe60bc2:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 174 — mixedHome #4383

- Seed: `mh-fuzz-76038123`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-76038123:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-76038123:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-76038123 fallback=mh-fuzz-76038123:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `c8c33eb6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 175 — mixedHome #4410

- Seed: `mh-fuzz-25dde916`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-25dde916:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-25dde916:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-25dde916 fallback=mh-fuzz-25dde916:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d8262349`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 176 — mixedHome #4475

- Seed: `mh-fuzz-51f3e34f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-51f3e34f:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-51f3e34f:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-51f3e34f fallback=mh-fuzz-51f3e34f:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-step-up-loaded,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `cbde4aa4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 177 — mixedHome #4481

- Seed: `mh-fuzz-7408ba2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-7408ba2:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-7408ba2:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-7408ba2 fallback=mh-fuzz-7408ba2:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-bulgarian-split-squat,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,db-triceps-extension,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,dumbbell-bench-press,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `614542df`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, db-triceps-extension, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 178 — mixedHome #4502

- Seed: `mh-fuzz-1cd89aa`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-1cd89aa:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-1cd89aa:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-1cd89aa fallback=mh-fuzz-1cd89aa:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-step-up-loaded,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `85b88790`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 179 — mixedHome #4529

- Seed: `mh-fuzz-b1a7efb5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-b1a7efb5:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-b1a7efb5:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-b1a7efb5 fallback=mh-fuzz-b1a7efb5:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-step-up-loaded,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `ea176c52`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 180 — mixedHome #4532

- Seed: `mh-fuzz-8c4d4768`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-8c4d4768:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-8c4d4768:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-8c4d4768 fallback=mh-fuzz-8c4d4768:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,hip-flexor-stretch|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-bulgarian-split-squat,dumbbell-shoulder-press,single-arm-dumbbell-row,db-triceps-extension,standing-calf-raise,hip-flexor-stretch|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-step-up-loaded,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,dumbbell-bench-press,side-plank-star,hip-flexor-stretch|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,face-pull,side-plank-star,hip-flexor-stretch`
- Semantic signature: `99ba1014`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, face-pull, side-plank-star, hip-flexor-stretch

### Fallback 181 — mixedHome #4626

- Seed: `mh-fuzz-a4acde8f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-a4acde8f:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-a4acde8f:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-a4acde8f fallback=mh-fuzz-a4acde8f:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 182 — mixedHome #4653

- Seed: `mh-fuzz-54861b48`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-54861b48:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-54861b48:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-54861b48 fallback=mh-fuzz-54861b48:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 183 — mixedHome #4680

- Seed: `mh-fuzz-4602119`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-4602119:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-4602119:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-4602119 fallback=mh-fuzz-4602119:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 184 — mixedHome #4799

- Seed: `mh-fuzz-902926e9`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-902926e9:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-902926e9:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-902926e9 fallback=mh-fuzz-902926e9:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `3752909d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 185 — mixedHome #4802

- Seed: `mh-fuzz-6ad04903`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-6ad04903:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-6ad04903:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-6ad04903 fallback=mh-fuzz-6ad04903:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 186 — mixedHome #4805

- Seed: `mh-fuzz-4576d590`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-4576d590:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-4576d590:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-4576d590 fallback=mh-fuzz-4576d590:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `e01adf14`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 187 — mixedHome #4826

- Seed: `mh-fuzz-4003cc68`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-4003cc68:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-4003cc68:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-4003cc68 fallback=mh-fuzz-4003cc68:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 188 — mixedHome #4829

- Seed: `mh-fuzz-1aa9e3d7`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-1aa9e3d7:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-1aa9e3d7:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-1aa9e3d7 fallback=mh-fuzz-1aa9e3d7:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 189 — mixedHome #4832

- Seed: `mh-fuzz-f55093c1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f55093c1:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f55093c1:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f55093c1 fallback=mh-fuzz-f55093c1:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 190 — mixedHome #4853

- Seed: `mh-fuzz-efdd8dcb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-efdd8dcb:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-efdd8dcb:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-efdd8dcb fallback=mh-fuzz-efdd8dcb:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `4b919b15`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 191 — mixedHome #4856

- Seed: `mh-fuzz-ca8305aa`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-ca8305aa:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-ca8305aa:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-ca8305aa fallback=mh-fuzz-ca8305aa:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 192 — mixedHome #4859

- Seed: `mh-fuzz-a52a9916`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-a52a9916:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-a52a9916:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-a52a9916 fallback=mh-fuzz-a52a9916:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 193 — mixedHome #5031

- Seed: `mh-fuzz-f26f0d47`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f26f0d47:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f26f0d47:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f26f0d47 fallback=mh-fuzz-f26f0d47:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `9f56ef71`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 194 — mixedHome #5034

- Seed: `mh-fuzz-cd16a12d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-cd16a12d:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-cd16a12d:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-cd16a12d fallback=mh-fuzz-cd16a12d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `e2484360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 195 — mixedHome #5037

- Seed: `mh-fuzz-a7bc7ef2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-a7bc7ef2:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-a7bc7ef2:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-a7bc7ef2 fallback=mh-fuzz-a7bc7ef2:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `e316bd5c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 196 — mixedHome #5058

- Seed: `mh-fuzz-a249769a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-a249769a:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-a249769a:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-a249769a fallback=mh-fuzz-a249769a:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 197 — mixedHome #5085

- Seed: `mh-fuzz-5223f85d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-5223f85d:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-5223f85d:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-5223f85d fallback=mh-fuzz-5223f85d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 198 — mixedHome #6052

- Seed: `mh-fuzz-f5b0a3a5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f5b0a3a5:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f5b0a3a5:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f5b0a3a5 fallback=mh-fuzz-f5b0a3a5:quality-fallback:mixedHome:canonical-mixed-home-lane:d3:Intermediate:"loop_only"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,single-leg-rdl,db-biceps-curl,standing-calf-raise,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,dumbbell-reverse-lunge,pike-pushup,single-arm-dumbbell-row,band-rear-delt-fly,db-triceps-extension,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-pull-apart,single-leg-rdl,farmers-carry,cossack-squat,thread-the-needle`
- Semantic signature: `b0bc6af1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-rdl, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, band-rear-delt-fly, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-pull-apart, single-leg-rdl, farmers-carry, cossack-squat, thread-the-needle

### Fallback 199 — mixedHome #6570

- Seed: `mh-fuzz-19f08bcb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-19f08bcb:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-19f08bcb:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-19f08bcb fallback=mh-fuzz-19f08bcb:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 200 — mixedHome #6597

- Seed: `mh-fuzz-c9caae2c`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-c9caae2c:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-c9caae2c:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-c9caae2c fallback=mh-fuzz-c9caae2c:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 201 — mixedHome #6624

- Seed: `mh-fuzz-79a44435`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-79a44435:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-79a44435:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-79a44435 fallback=mh-fuzz-79a44435:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 202 — mixedHome #6664

- Seed: `mh-fuzz-324f7376`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-324f7376:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-324f7376:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-324f7376 fallback=mh-fuzz-324f7376:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Intermediate:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,single-leg-rdl,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-rdl,dumbbell-reverse-lunge,pike-pushup,single-arm-dumbbell-row,face-pull,farmers-carry,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-rdl,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,pushup,single-arm-dumbbell-row,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,dead-bug,goblet-squat,single-leg-rdl,farmers-carry,standing-calf-raise,thread-the-needle`
- Semantic signature: `2d1000a6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, face-pull, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-rdl, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, goblet-squat, single-leg-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 203 — mixedHome #6743

- Seed: `mh-fuzz-56dcbb5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-56dcbb5:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-56dcbb5:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-56dcbb5 fallback=mh-fuzz-56dcbb5:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `3752909d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 204 — mixedHome #6746

- Seed: `mh-fuzz-e014dbff`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-e014dbff:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-e014dbff:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-e014dbff fallback=mh-fuzz-e014dbff:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 205 — mixedHome #6770

- Seed: `mh-fuzz-b54711c4`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-b54711c4:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-b54711c4:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-b54711c4 fallback=mh-fuzz-b54711c4:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 206 — mixedHome #6773

- Seed: `mh-fuzz-8fee9e78`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-8fee9e78:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-8fee9e78:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-8fee9e78 fallback=mh-fuzz-8fee9e78:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 207 — mixedHome #6776

- Seed: `mh-fuzz-6a94143d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-6a94143d:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-6a94143d:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-6a94143d fallback=mh-fuzz-6a94143d:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 208 — mixedHome #6797

- Seed: `mh-fuzz-65211f0f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-65211f0f:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-65211f0f:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-65211f0f fallback=mh-fuzz-65211f0f:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `4b919b15`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 209 — mixedHome #6800

- Seed: `mh-fuzz-3fc7d886`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-3fc7d886:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-3fc7d886:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-3fc7d886 fallback=mh-fuzz-3fc7d886:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 210 — mixedHome #6803

- Seed: `mh-fuzz-1a6e4e3a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-1a6e4e3a:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-1a6e4e3a:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-1a6e4e3a fallback=mh-fuzz-1a6e4e3a:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 211 — mixedHome #6975

- Seed: `mh-fuzz-67b470f4`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-67b470f4:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-67b470f4:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-67b470f4 fallback=mh-fuzz-67b470f4:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `c8c33eb6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 212 — mixedHome #7002

- Seed: `mh-fuzz-178dfb66`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-178dfb66:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-178dfb66:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-178dfb66 fallback=mh-fuzz-178dfb66:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d8262349`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 213 — mixedHome #7029

- Seed: `mh-fuzz-c76705f1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-c76705f1:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-c76705f1:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-c76705f1 fallback=mh-fuzz-c76705f1:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,incline-pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d8262349`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 214 — mixedHome #7067

- Seed: `mh-fuzz-43a3917f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-43a3917f:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-43a3917f:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-43a3917f fallback=mh-fuzz-43a3917f:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `e90ab5ad`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 215 — mixedHome #7073

- Seed: `mh-fuzz-f8f055f2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f8f055f2:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f8f055f2:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f8f055f2 fallback=mh-fuzz-f8f055f2:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `007b2928`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 216 — mixedHome #7094

- Seed: `mh-fuzz-f37d5bfa`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f37d5bfa:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f37d5bfa:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f37d5bfa fallback=mh-fuzz-f37d5bfa:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `4e0b5161`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 217 — mixedHome #7097

- Seed: `mh-fuzz-ce24dbbe`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-ce24dbbe:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-ce24dbbe:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-ce24dbbe fallback=mh-fuzz-ce24dbbe:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `938158a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 218 — mixedHome #7100

- Seed: `mh-fuzz-a8ca2a67`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-a8ca2a67:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-a8ca2a67:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-a8ca2a67 fallback=mh-fuzz-a8ca2a67:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f81becec`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 219 — mixedHome #7121

- Seed: `mh-fuzz-a357dd65`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-a357dd65:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-a357dd65:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-a357dd65 fallback=mh-fuzz-a357dd65:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `b40d479b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 220 — mixedHome #7127

- Seed: `mh-fuzz-58a400fc`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-58a400fc:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-58a400fc:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-58a400fc fallback=mh-fuzz-58a400fc:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `8be73c67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 221 — mixedHome #7218

- Seed: `mh-fuzz-965c0c1f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-965c0c1f:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-965c0c1f:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-965c0c1f fallback=mh-fuzz-965c0c1f:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 222 — mixedHome #7245

- Seed: `mh-fuzz-463629d8`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-463629d8:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-463629d8:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-463629d8 fallback=mh-fuzz-463629d8:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 223 — mixedHome #7272

- Seed: `mh-fuzz-f610b389`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f610b389:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f610b389:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f610b389 fallback=mh-fuzz-f610b389:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"both_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 224 — mixedHome #8919

- Seed: `mh-fuzz-dcf8f3a0`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-dcf8f3a0:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-dcf8f3a0:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-dcf8f3a0 fallback=mh-fuzz-dcf8f3a0:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `9f56ef71`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 225 — mixedHome #8922

- Seed: `mh-fuzz-b79e2bf5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-b79e2bf5:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-b79e2bf5:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-b79e2bf5 fallback=mh-fuzz-b79e2bf5:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,pallof-press,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,pallof-press,thread-the-needle|Practice & Restore:cat-cow,wall-angel-hold,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `e2484360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 226 — mixedHome #8946

- Seed: `mh-fuzz-8cd289d1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-8cd289d1:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-8cd289d1:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-8cd289d1 fallback=mh-fuzz-8cd289d1:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 227 — mixedHome #8973

- Seed: `mh-fuzz-3cabe605`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-3cabe605:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-3cabe605:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-3cabe605 fallback=mh-fuzz-3cabe605:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 228 — mixedHome #9011

- Seed: `mh-fuzz-b8e75213`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-b8e75213:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-b8e75213:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-b8e75213 fallback=mh-fuzz-b8e75213:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `e90ab5ad`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 229 — mixedHome #9017

- Seed: `mh-fuzz-6e34ab2e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-6e34ab2e:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-6e34ab2e:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-6e34ab2e fallback=mh-fuzz-6e34ab2e:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `007b2928`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 230 — mixedHome #9038

- Seed: `mh-fuzz-68c1a85e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-68c1a85e:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-68c1a85e:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-68c1a85e fallback=mh-fuzz-68c1a85e:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `4e0b5161`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 231 — mixedHome #9041

- Seed: `mh-fuzz-43686eda`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-43686eda:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-43686eda:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-43686eda fallback=mh-fuzz-43686eda:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `938158a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 232 — mixedHome #9044

- Seed: `mh-fuzz-1e0e84cb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-1e0e84cb:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-1e0e84cb:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-1e0e84cb fallback=mh-fuzz-1e0e84cb:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `f81becec`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 233 — mixedHome #9065

- Seed: `mh-fuzz-189b8ed1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-189b8ed1:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-189b8ed1:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-189b8ed1 fallback=mh-fuzz-189b8ed1:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `b40d479b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 234 — mixedHome #9071

- Seed: `mh-fuzz-cde8bd98`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-cde8bd98:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-cde8bd98:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-cde8bd98 fallback=mh-fuzz-cde8bd98:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-reverse-lunge,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,glute-bridges,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `8be73c67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 235 — mixedHome #9162

- Seed: `mh-fuzz-ba0b9fb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-ba0b9fb:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-ba0b9fb:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-ba0b9fb fallback=mh-fuzz-ba0b9fb:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 236 — mixedHome #9189

- Seed: `mh-fuzz-bb7a337c`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-bb7a337c:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-bb7a337c:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-bb7a337c fallback=mh-fuzz-bb7a337c:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,band-pull-aparts,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,band-pull-aparts,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,band-pull-aparts,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 237 — mixedHome #9216

- Seed: `mh-fuzz-6b5436e5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-6b5436e5:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-6b5436e5:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-6b5436e5 fallback=mh-fuzz-6b5436e5:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,pushup,single-arm-dumbbell-row,standing-calf-raise,band-woodchop,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,db-rdl,dumbbell-reverse-lunge,pike-pushup,standing-calf-raise,band-woodchop,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-floor-press,band-lat-pulldown,db-triceps-extension,band-woodchop,thread-the-needle|Practice & Restore:wall-angel-hold,dead-bug,single-arm-dumbbell-row,goblet-squat,db-biceps-curl,thread-the-needle`
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 238 — mixedHome #9335

- Seed: `mh-fuzz-f71d19e5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-f71d19e5:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-f71d19e5:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-f71d19e5 fallback=mh-fuzz-f71d19e5:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-step-up-loaded,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-reverse-lunge,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `7245d834`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 239 — mixedHome #9338

- Seed: `mh-fuzz-d1c48dcf`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-d1c48dcf:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-d1c48dcf:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-d1c48dcf fallback=mh-fuzz-d1c48dcf:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-bulgarian-split-squat,dumbbell-shoulder-press,single-arm-dumbbell-row,db-triceps-extension,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,dumbbell-bench-press,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `c9955335`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 240 — mixedHome #9341

- Seed: `mh-fuzz-ac6a6574`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-ac6a6574:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-ac6a6574:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-ac6a6574 fallback=mh-fuzz-ac6a6574:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,wall-angel-hold,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,thread-the-needle|Full Body B — Hinge, Overhead and Unilateral:wall-slides,wall-angel-hold,single-leg-hip-thrust,dumbbell-bulgarian-split-squat,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,db-triceps-extension,pallof-press,thread-the-needle|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,wall-angel-hold,dumbbell-step-up-loaded,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,dumbbell-bench-press,pallof-press,thread-the-needle|Upper Pattern Practice:wall-slides,wall-angel-hold,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,thread-the-needle`
- Semantic signature: `4a0eb7af`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, db-triceps-extension, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 241 — mixedHome #9362

- Seed: `mh-fuzz-a6f76254`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-a6f76254:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-a6f76254:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-a6f76254 fallback=mh-fuzz-a6f76254:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:cat-cow,dead-bug,single-leg-hip-thrust,dumbbell-step-up-loaded,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:cat-cow,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,face-pull,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `7c5c99e8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 242 — mixedHome #9389

- Seed: `mh-fuzz-56d1cc9f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-56d1cc9f:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-56d1cc9f:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-56d1cc9f fallback=mh-fuzz-56d1cc9f:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-step-up-loaded,dumbbell-shoulder-press,single-arm-dumbbell-row,face-pull,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-reverse-lunge,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-triceps-extension,db-biceps-curl,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `e14b8bd4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 243 — mixedHome #9392

- Seed: `mh-fuzz-31783619`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-31783619:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-31783619:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-31783619 fallback=mh-fuzz-31783619:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-bulgarian-split-squat,dumbbell-shoulder-press,single-arm-dumbbell-row,db-triceps-extension,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-step-up-loaded,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,dumbbell-bench-press,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `9816b247`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 244 — mixedHome #9395

- Seed: `mh-fuzz-c1e786a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Triage: fallbackFailedSafely
- Final outcome: safeGenerationFailure / safe_generation_error
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery hard failures: #1[mh-fuzz-c1e786a:quality-recovery:1]=MIXED_HOME_RANDOM_EQUIPMENT_MIX; #2[mh-fuzz-c1e786a:quality-recovery:2]=MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Reproducible seeds: base=mh-fuzz-c1e786a fallback=mh-fuzz-c1e786a:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:"long_with_anchor"
- Final program signature: `Full Body A — Squat, Press and Row:cat-cow,dead-bug,goblet-squat,dumbbell-floor-press,single-arm-dumbbell-row,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,db-biceps-curl,breathing-90-90|Full Body B — Hinge, Overhead and Unilateral:wall-slides,dead-bug,single-leg-hip-thrust,dumbbell-bulgarian-split-squat,dumbbell-shoulder-press,single-arm-dumbbell-row,dumbbell-sumo-rdl,db-triceps-extension,pallof-press,breathing-90-90|Full Body C — Single-Leg, Press Variation and Lat Intent:cat-cow,dead-bug,dumbbell-step-up-loaded,dumbbell-chest-fly,band-lat-pulldown,single-leg-hip-thrust,single-arm-dumbbell-row,dumbbell-bench-press,pallof-press,breathing-90-90|Upper Pattern Practice:wall-slides,dead-bug,dumbbell-floor-press,single-arm-dumbbell-row,dumbbell-shoulder-press,db-biceps-curl,db-triceps-extension,thread-the-needle|Lower & Core Practice:cat-cow,hip-hinge-drill,goblet-squat,single-leg-hip-thrust,dumbbell-reverse-lunge,standing-calf-raise,pallof-press,breathing-90-90`
- Semantic signature: `303bcdb5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, db-triceps-extension, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90


## Failed-case diagnostics

### Failed 1 — gym #68

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":[],"experience":"Advanced","equipment":["gym"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-a4f36846:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-a4f36846:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-a4f36846","recovery":["gym-fuzz-a4f36846:quality-recovery:1","gym-fuzz-a4f36846:quality-recovery:2"],"fallback":"gym-fuzz-a4f36846:quality-fallback:gym:canonical-gym-template:d4:Advanced:default"}

### Failed 2 — gym #408

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Knees"],"experience":"Beginner","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-c6a1ad68:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-c6a1ad68:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-c6a1ad68","recovery":["gym-fuzz-c6a1ad68:quality-recovery:1","gym-fuzz-c6a1ad68:quality-recovery:2"],"fallback":"gym-fuzz-c6a1ad68:quality-fallback:gym:canonical-gym-template:d3:Beginner:default"}

### Failed 3 — gym #1768

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Intermediate","equipment":["gym","dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-4d57a54e:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-4d57a54e:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-4d57a54e","recovery":["gym-fuzz-4d57a54e:quality-recovery:1","gym-fuzz-4d57a54e:quality-recovery:2"],"fallback":"gym-fuzz-4d57a54e:quality-fallback:gym:canonical-gym-template:d4:Intermediate:default"}

### Failed 4 — gym #2380

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Neck"],"experience":"Intermediate","equipment":["gym"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-89f65acb:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-89f65acb:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-89f65acb","recovery":["gym-fuzz-89f65acb:quality-recovery:1","gym-fuzz-89f65acb:quality-recovery:2"],"fallback":"gym-fuzz-89f65acb:quality-fallback:gym:canonical-gym-template:d3:Intermediate:default"}

### Failed 5 — gym #2516

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Advanced","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-976fee2a:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-976fee2a:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-976fee2a","recovery":["gym-fuzz-976fee2a:quality-recovery:1","gym-fuzz-976fee2a:quality-recovery:2"],"fallback":"gym-fuzz-976fee2a:quality-fallback:gym:canonical-gym-template:d3:Advanced:default"}

### Failed 6 — gym #4080

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":[],"experience":"Beginner","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-325adcfb:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-325adcfb:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-325adcfb","recovery":["gym-fuzz-325adcfb:quality-recovery:1","gym-fuzz-325adcfb:quality-recovery:2"],"fallback":"gym-fuzz-325adcfb:quality-fallback:gym:canonical-gym-template:d3:Beginner:default"}

### Failed 7 — gym #4828

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Intermediate","equipment":["gym","dumbbells"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-7c7203bf:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-7c7203bf:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-7c7203bf","recovery":["gym-fuzz-7c7203bf:quality-recovery:1","gym-fuzz-7c7203bf:quality-recovery:2"],"fallback":"gym-fuzz-7c7203bf:quality-fallback:gym:canonical-gym-template:d5:Intermediate:default"}

### Failed 8 — gym #4879

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["gym","bands"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"band-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: band-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-17fbf6f:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-17fbf6f:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-17fbf6f","recovery":["gym-fuzz-17fbf6f:quality-recovery:1","gym-fuzz-17fbf6f:quality-recovery:2"],"fallback":"gym-fuzz-17fbf6f:quality-fallback:gym:canonical-gym-template:d5:Intermediate:default"}

### Failed 9 — gym #5015

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Advanced","equipment":["gym","bands"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"band-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: band-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-ef86ae0:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-ef86ae0:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-ef86ae0","recovery":["gym-fuzz-ef86ae0:quality-recovery:1","gym-fuzz-ef86ae0:quality-recovery:2"],"fallback":"gym-fuzz-ef86ae0:quality-fallback:gym:canonical-gym-template:d5:Advanced:default"}

### Failed 10 — gym #5627

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Neck"],"experience":"Advanced","equipment":["gym","bands"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"band-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: band-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-4b9704ab:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-4b9704ab:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-4b9704ab","recovery":["gym-fuzz-4b9704ab:quality-recovery:1","gym-fuzz-4b9704ab:quality-recovery:2"],"fallback":"gym-fuzz-4b9704ab:quality-fallback:gym:canonical-gym-template:d4:Advanced:default"}

### Failed 11 — gym #6188

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Advanced","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-328ff35:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-328ff35:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-328ff35","recovery":["gym-fuzz-328ff35:quality-recovery:1","gym-fuzz-328ff35:quality-recovery:2"],"fallback":"gym-fuzz-328ff35:quality-fallback:gym:canonical-gym-template:d3:Advanced:default"}

### Failed 12 — gym #6664

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Upper back"],"experience":"Intermediate","equipment":["gym"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-324f7376:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-324f7376:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-324f7376","recovery":["gym-fuzz-324f7376:quality-recovery:1","gym-fuzz-324f7376:quality-recovery:2"],"fallback":"gym-fuzz-324f7376:quality-fallback:gym:canonical-gym-template:d5:Intermediate:default"}

### Failed 13 — gym #7412

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders"],"experience":"Advanced","equipment":["gym"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-7c66ae03:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-7c66ae03:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-7c66ae03","recovery":["gym-fuzz-7c66ae03:quality-recovery:1","gym-fuzz-7c66ae03:quality-recovery:2"],"fallback":"gym-fuzz-7c66ae03:quality-fallback:gym:canonical-gym-template:d4:Advanced:default"}

### Failed 14 — gym #7752

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Knees"],"experience":"Beginner","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-9e14ef6d:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-9e14ef6d:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-9e14ef6d","recovery":["gym-fuzz-9e14ef6d:quality-recovery:1","gym-fuzz-9e14ef6d:quality-recovery:2"],"fallback":"gym-fuzz-9e14ef6d:quality-fallback:gym:canonical-gym-template:d3:Beginner:default"}

### Failed 15 — gym #8024

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Neck"],"experience":"Advanced","equipment":["gym"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-b905048c:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-b905048c:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-b905048c","recovery":["gym-fuzz-b905048c:quality-recovery:1","gym-fuzz-b905048c:quality-recovery:2"],"fallback":"gym-fuzz-b905048c:quality-fallback:gym:canonical-gym-template:d3:Advanced:default"}

### Failed 16 — gym #8551

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Knees"],"experience":"Intermediate","equipment":["gym","bands"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"band-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: band-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-6d392dd1:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-6d392dd1:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-6d392dd1","recovery":["gym-fuzz-6d392dd1:quality-recovery:1","gym-fuzz-6d392dd1:quality-recovery:2"],"fallback":"gym-fuzz-6d392dd1:quality-fallback:gym:canonical-gym-template:d5:Intermediate:default"}

### Failed 17 — gym #9112

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Upper back"],"experience":"Intermediate","equipment":["gym","dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Recovery: [{"attempt":1,"seed":"gym-fuzz-24cac903:quality-recovery:1","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]},{"attempt":2,"seed":"gym-fuzz-24cac903:quality-recovery:2","codes":["QUALITY_BLOCKED_EXERCISE_PRESENT"]}]
- Fallback hard failures: QUALITY_BLOCKED_EXERCISE_PRESENT
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-24cac903","recovery":["gym-fuzz-24cac903:quality-recovery:1","gym-fuzz-24cac903:quality-recovery:2"],"fallback":"gym-fuzz-24cac903:quality-fallback:gym:canonical-gym-template:d4:Intermediate:default"}

### Failed 18 — gym #9724

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-6169b984:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-6169b984:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-6169b984","recovery":["gym-fuzz-6169b984:quality-recovery:1","gym-fuzz-6169b984:quality-recovery:2"],"fallback":"gym-fuzz-6169b984:quality-fallback:gym:canonical-gym-template:d3:Intermediate:default"}

### Failed 19 — gym #9860

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Advanced","equipment":["gym","dumbbells"],"daysPerWeek":3},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Recovery: [{"attempt":1,"seed":"gym-fuzz-6ee21017:quality-recovery:1","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]},{"attempt":2,"seed":"gym-fuzz-6ee21017:quality-recovery:2","codes":["GYM_REQUIRED_ROLE_WRONG_TRUTH","GYM_REQUIRED_ROLE_WRONG_TRUTH"]}]
- Fallback hard failures: GYM_REQUIRED_ROLE_WRONG_TRUTH, GYM_REQUIRED_ROLE_WRONG_TRUTH
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"gym-fuzz-6ee21017","recovery":["gym-fuzz-6ee21017:quality-recovery:1","gym-fuzz-6ee21017:quality-recovery:2"],"fallback":"gym-fuzz-6ee21017:quality-fallback:gym:canonical-gym-template:d3:Advanced:default"}

### Failed 20 — dumbbells #17

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-1fe69194:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-1fe69194:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-1fe69194","recovery":["db-fuzz-1fe69194:quality-recovery:1","db-fuzz-1fe69194:quality-recovery:2"],"fallback":"db-fuzz-1fe69194:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 21 — dumbbells #153

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-2d5f1925:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-2d5f1925:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-2d5f1925","recovery":["db-fuzz-2d5f1925:quality-recovery:1","db-fuzz-2d5f1925:quality-recovery:2"],"fallback":"db-fuzz-2d5f1925:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 22 — dumbbells #289

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-3ad7e055:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-3ad7e055:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-3ad7e055","recovery":["db-fuzz-3ad7e055:quality-recovery:1","db-fuzz-3ad7e055:quality-recovery:2"],"fallback":"db-fuzz-3ad7e055:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 23 — dumbbells #425

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Knees"],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-4850c8da:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-4850c8da:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-4850c8da","recovery":["db-fuzz-4850c8da:quality-recovery:1","db-fuzz-4850c8da:quality-recovery:2"],"fallback":"db-fuzz-4850c8da:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 24 — dumbbells #561

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-55c9735b:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-55c9735b:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-55c9735b","recovery":["db-fuzz-55c9735b:quality-recovery:1","db-fuzz-55c9735b:quality-recovery:2"],"fallback":"db-fuzz-55c9735b:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 25 — dumbbells #697

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Neck"],"experience":"Intermediate","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-6341afdb:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-6341afdb:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-6341afdb","recovery":["db-fuzz-6341afdb:quality-recovery:1","db-fuzz-6341afdb:quality-recovery:2"],"fallback":"db-fuzz-6341afdb:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 26 — dumbbells #765

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-69fe7660:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-69fe7660:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-69fe7660","recovery":["db-fuzz-69fe7660:quality-recovery:1","db-fuzz-69fe7660:quality-recovery:2"],"fallback":"db-fuzz-69fe7660:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 27 — dumbbells #833

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders"],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-70ba0218:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-70ba0218:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-70ba0218","recovery":["db-fuzz-70ba0218:quality-recovery:1","db-fuzz-70ba0218:quality-recovery:2"],"fallback":"db-fuzz-70ba0218:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 28 — dumbbells #901

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Upper back"],"experience":"Intermediate","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-7776b2d0:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-7776b2d0:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-7776b2d0","recovery":["db-fuzz-7776b2d0:quality-recovery:1","db-fuzz-7776b2d0:quality-recovery:2"],"fallback":"db-fuzz-7776b2d0:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 29 — dumbbells #969

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Upper back"],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-7e336699:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-7e336699:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-7e336699","recovery":["db-fuzz-7e336699:quality-recovery:1","db-fuzz-7e336699:quality-recovery:2"],"fallback":"db-fuzz-7e336699:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 30 — dumbbells #1037

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-84efef41:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-84efef41:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-84efef41","recovery":["db-fuzz-84efef41:quality-recovery:1","db-fuzz-84efef41:quality-recovery:2"],"fallback":"db-fuzz-84efef41:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 31 — dumbbells #1105

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Hips"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-8bab3519:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-8bab3519:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-8bab3519","recovery":["db-fuzz-8bab3519:quality-recovery:1","db-fuzz-8bab3519:quality-recovery:2"],"fallback":"db-fuzz-8bab3519:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 32 — dumbbells #1173

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Knees"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-926883de:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-926883de:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-926883de","recovery":["db-fuzz-926883de:quality-recovery:1","db-fuzz-926883de:quality-recovery:2"],"fallback":"db-fuzz-926883de:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 33 — dumbbells #1241

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-9924fd9e:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-9924fd9e:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-9924fd9e","recovery":["db-fuzz-9924fd9e:quality-recovery:1","db-fuzz-9924fd9e:quality-recovery:2"],"fallback":"db-fuzz-9924fd9e:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 34 — dumbbells #1309

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Lower back","Hips"],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-9fe0285e:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-9fe0285e:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-9fe0285e","recovery":["db-fuzz-9fe0285e:quality-recovery:1","db-fuzz-9fe0285e:quality-recovery:2"],"fallback":"db-fuzz-9fe0285e:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 35 — dumbbells #1445

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Neck"],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-ad59f09f:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-ad59f09f:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-ad59f09f","recovery":["db-fuzz-ad59f09f:quality-recovery:1","db-fuzz-ad59f09f:quality-recovery:2"],"fallback":"db-fuzz-ad59f09f:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 36 — dumbbells #1581

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-bad2b91c:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-bad2b91c:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-bad2b91c","recovery":["db-fuzz-bad2b91c:quality-recovery:1","db-fuzz-bad2b91c:quality-recovery:2"],"fallback":"db-fuzz-bad2b91c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 37 — dumbbells #1717

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Intermediate","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-c84a619c:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-c84a619c:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-c84a619c","recovery":["db-fuzz-c84a619c:quality-recovery:1","db-fuzz-c84a619c:quality-recovery:2"],"fallback":"db-fuzz-c84a619c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 38 — dumbbells #1853

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Hips"],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-d5c39a1d:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-d5c39a1d:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-d5c39a1d","recovery":["db-fuzz-d5c39a1d:quality-recovery:1","db-fuzz-d5c39a1d:quality-recovery:2"],"fallback":"db-fuzz-d5c39a1d:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 39 — dumbbells #1989

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-e33b16dd:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-e33b16dd:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-e33b16dd","recovery":["db-fuzz-e33b16dd:quality-recovery:1","db-fuzz-e33b16dd:quality-recovery:2"],"fallback":"db-fuzz-e33b16dd:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 40 — dumbbells #2125

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-f0b46b5a:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-f0b46b5a:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-f0b46b5a","recovery":["db-fuzz-f0b46b5a:quality-recovery:1","db-fuzz-f0b46b5a:quality-recovery:2"],"fallback":"db-fuzz-f0b46b5a:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 41 — dumbbells #2261

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":[],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-fe2dbfdb:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-fe2dbfdb:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-fe2dbfdb","recovery":["db-fuzz-fe2dbfdb:quality-recovery:1","db-fuzz-fe2dbfdb:quality-recovery:2"],"fallback":"db-fuzz-fe2dbfdb:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 42 — dumbbells #2397

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Upper back"],"experience":"Beginner","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-ba5ec5b:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-ba5ec5b:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-ba5ec5b","recovery":["db-fuzz-ba5ec5b:quality-recovery:1","db-fuzz-ba5ec5b:quality-recovery:2"],"fallback":"db-fuzz-ba5ec5b:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 43 — dumbbells #2533

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Intermediate","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-191e9718:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-191e9718:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-191e9718","recovery":["db-fuzz-191e9718:quality-recovery:1","db-fuzz-191e9718:quality-recovery:2"],"fallback":"db-fuzz-191e9718:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 44 — dumbbells #2601

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Knees"],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-1fdafed0:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-1fdafed0:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-1fdafed0","recovery":["db-fuzz-1fdafed0:quality-recovery:1","db-fuzz-1fdafed0:quality-recovery:2"],"fallback":"db-fuzz-1fdafed0:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 45 — dumbbells #2669

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Knees"],"experience":"Advanced","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-26971299:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-26971299:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-26971299","recovery":["db-fuzz-26971299:quality-recovery:1","db-fuzz-26971299:quality-recovery:2"],"fallback":"db-fuzz-26971299:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 46 — dumbbells #2737

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Intermediate","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-2d53aa41:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-2d53aa41:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-2d53aa41","recovery":["db-fuzz-2d53aa41:quality-recovery:1","db-fuzz-2d53aa41:quality-recovery:2"],"fallback":"db-fuzz-2d53aa41:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 47 — dumbbells #2805

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-340fee19:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-340fee19:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-340fee19","recovery":["db-fuzz-340fee19:quality-recovery:1","db-fuzz-340fee19:quality-recovery:2"],"fallback":"db-fuzz-340fee19:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 48 — dumbbells #2873

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-3acc17d6:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-3acc17d6:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-3acc17d6","recovery":["db-fuzz-3acc17d6:quality-recovery:1","db-fuzz-3acc17d6:quality-recovery:2"],"fallback":"db-fuzz-3acc17d6:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 49 — dumbbells #2941

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-4188c196:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-4188c196:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-4188c196","recovery":["db-fuzz-4188c196:quality-recovery:1","db-fuzz-4188c196:quality-recovery:2"],"fallback":"db-fuzz-4188c196:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 50 — dumbbells #3009

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-48449b66:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-48449b66:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-48449b66","recovery":["db-fuzz-48449b66:quality-recovery:1","db-fuzz-48449b66:quality-recovery:2"],"fallback":"db-fuzz-48449b66:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 51 — dumbbells #3077

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-4f016927:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-4f016927:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-4f016927","recovery":["db-fuzz-4f016927:quality-recovery:1","db-fuzz-4f016927:quality-recovery:2"],"fallback":"db-fuzz-4f016927:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 52 — dumbbells #3145

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Upper back"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-55bd2c97:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-55bd2c97:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-55bd2c97","recovery":["db-fuzz-55bd2c97:quality-recovery:1","db-fuzz-55bd2c97:quality-recovery:2"],"fallback":"db-fuzz-55bd2c97:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 53 — dumbbells #3281

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-63367c04:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-63367c04:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-63367c04","recovery":["db-fuzz-63367c04:quality-recovery:1","db-fuzz-63367c04:quality-recovery:2"],"fallback":"db-fuzz-63367c04:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 54 — dumbbells #3417

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-70aeb594:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-70aeb594:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-70aeb594","recovery":["db-fuzz-70aeb594:quality-recovery:1","db-fuzz-70aeb594:quality-recovery:2"],"fallback":"db-fuzz-70aeb594:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 55 — dumbbells #3553

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Intermediate","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-7e271565:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-7e271565:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-7e271565","recovery":["db-fuzz-7e271565:quality-recovery:1","db-fuzz-7e271565:quality-recovery:2"],"fallback":"db-fuzz-7e271565:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 56 — dumbbells #3689

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-8ba09aea:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-8ba09aea:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-8ba09aea","recovery":["db-fuzz-8ba09aea:quality-recovery:1","db-fuzz-8ba09aea:quality-recovery:2"],"fallback":"db-fuzz-8ba09aea:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 57 — dumbbells #3825

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Upper back"],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-99182e4a:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-99182e4a:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-99182e4a","recovery":["db-fuzz-99182e4a:quality-recovery:1","db-fuzz-99182e4a:quality-recovery:2"],"fallback":"db-fuzz-99182e4a:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 58 — dumbbells #3961

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-a691fbcb:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-a691fbcb:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-a691fbcb","recovery":["db-fuzz-a691fbcb:quality-recovery:1","db-fuzz-a691fbcb:quality-recovery:2"],"fallback":"db-fuzz-a691fbcb:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 59 — dumbbells #4097

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Knees"],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-b40ab768:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-b40ab768:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-b40ab768","recovery":["db-fuzz-b40ab768:quality-recovery:1","db-fuzz-b40ab768:quality-recovery:2"],"fallback":"db-fuzz-b40ab768:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 60 — dumbbells #4233

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Lower back","Hips"],"experience":"Beginner","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-c18268e8:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-c18268e8:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-c18268e8","recovery":["db-fuzz-c18268e8:quality-recovery:1","db-fuzz-c18268e8:quality-recovery:2"],"fallback":"db-fuzz-c18268e8:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 61 — dumbbells #4369

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Neck"],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-cefb8189:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-cefb8189:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-cefb8189","recovery":["db-fuzz-cefb8189:quality-recovery:1","db-fuzz-cefb8189:quality-recovery:2"],"fallback":"db-fuzz-cefb8189:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 62 — dumbbells #4437

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-d5b777c1:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-d5b777c1:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-d5b777c1","recovery":["db-fuzz-d5b777c1:quality-recovery:1","db-fuzz-d5b777c1:quality-recovery:2"],"fallback":"db-fuzz-d5b777c1:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 63 — dumbbells #4505

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders"],"experience":"Advanced","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-dc732909:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-dc732909:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-dc732909","recovery":["db-fuzz-dc732909:quality-recovery:1","db-fuzz-dc732909:quality-recovery:2"],"fallback":"db-fuzz-dc732909:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 64 — dumbbells #4573

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Upper back"],"experience":"Intermediate","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-e330ab4e:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-e330ab4e:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-e330ab4e","recovery":["db-fuzz-e330ab4e:quality-recovery:1","db-fuzz-e330ab4e:quality-recovery:2"],"fallback":"db-fuzz-e330ab4e:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 65 — dumbbells #4641

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-e9ec726e:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-e9ec726e:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-e9ec726e","recovery":["db-fuzz-e9ec726e:quality-recovery:1","db-fuzz-e9ec726e:quality-recovery:2"],"fallback":"db-fuzz-e9ec726e:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 66 — dumbbells #4709

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Hips"],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-f0a81e2e:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-f0a81e2e:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-f0a81e2e","recovery":["db-fuzz-f0a81e2e:quality-recovery:1","db-fuzz-f0a81e2e:quality-recovery:2"],"fallback":"db-fuzz-f0a81e2e:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 67 — dumbbells #4777

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Hips"],"experience":"Intermediate","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-f765b6ef:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-f765b6ef:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-f765b6ef","recovery":["db-fuzz-f765b6ef:quality-recovery:1","db-fuzz-f765b6ef:quality-recovery:2"],"fallback":"db-fuzz-f765b6ef:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 68 — dumbbells #4845

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Knees"],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-fe216aaf:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-fe216aaf:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-fe216aaf","recovery":["db-fuzz-fe216aaf:quality-recovery:1","db-fuzz-fe216aaf:quality-recovery:2"],"fallback":"db-fuzz-fe216aaf:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 69 — dumbbells #4913

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-4dde34f:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-4dde34f:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-4dde34f","recovery":["db-fuzz-4dde34f:quality-recovery:1","db-fuzz-4dde34f:quality-recovery:2"],"fallback":"db-fuzz-4dde34f:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 70 — dumbbells #4981

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Lower back","Hips"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-b9a310c:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-b9a310c:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-b9a310c","recovery":["db-fuzz-b9a310c:quality-recovery:1","db-fuzz-b9a310c:quality-recovery:2"],"fallback":"db-fuzz-b9a310c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 71 — dumbbells #5117

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":[],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-1912f98c:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-1912f98c:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-1912f98c","recovery":["db-fuzz-1912f98c:quality-recovery:1","db-fuzz-1912f98c:quality-recovery:2"],"fallback":"db-fuzz-1912f98c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 72 — dumbbells #5253

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-268ba02d:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-268ba02d:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-268ba02d","recovery":["db-fuzz-268ba02d:quality-recovery:1","db-fuzz-268ba02d:quality-recovery:2"],"fallback":"db-fuzz-268ba02d:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 73 — dumbbells #5389

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Intermediate","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-340418aa:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-340418aa:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-340418aa","recovery":["db-fuzz-340418aa:quality-recovery:1","db-fuzz-340418aa:quality-recovery:2"],"fallback":"db-fuzz-340418aa:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 74 — dumbbells #5525

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Knees"],"experience":"Advanced","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-417c93ca:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-417c93ca:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-417c93ca","recovery":["db-fuzz-417c93ca:quality-recovery:1","db-fuzz-417c93ca:quality-recovery:2"],"fallback":"db-fuzz-417c93ca:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 75 — dumbbells #5661

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-4ef5364b:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-4ef5364b:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-4ef5364b","recovery":["db-fuzz-4ef5364b:quality-recovery:1","db-fuzz-4ef5364b:quality-recovery:2"],"fallback":"db-fuzz-4ef5364b:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 76 — dumbbells #5797

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Intermediate","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-5c6e42a8:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-5c6e42a8:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-5c6e42a8","recovery":["db-fuzz-5c6e42a8:quality-recovery:1","db-fuzz-5c6e42a8:quality-recovery:2"],"fallback":"db-fuzz-5c6e42a8:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 77 — dumbbells #5933

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-69e6ad28:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-69e6ad28:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-69e6ad28","recovery":["db-fuzz-69e6ad28:quality-recovery:1","db-fuzz-69e6ad28:quality-recovery:2"],"fallback":"db-fuzz-69e6ad28:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 78 — dumbbells #6069

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Upper back"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-775f1d89:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-775f1d89:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-775f1d89","recovery":["db-fuzz-775f1d89:quality-recovery:1","db-fuzz-775f1d89:quality-recovery:2"],"fallback":"db-fuzz-775f1d89:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 79 — dumbbells #6205

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-84d89406:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-84d89406:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-84d89406","recovery":["db-fuzz-84d89406:quality-recovery:1","db-fuzz-84d89406:quality-recovery:2"],"fallback":"db-fuzz-84d89406:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 80 — dumbbells #6273

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Knees"],"experience":"Beginner","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-8b94e876:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-8b94e876:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-8b94e876","recovery":["db-fuzz-8b94e876:quality-recovery:1","db-fuzz-8b94e876:quality-recovery:2"],"fallback":"db-fuzz-8b94e876:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 81 — dumbbells #6341

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Advanced","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-925024b6:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-925024b6:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-925024b6","recovery":["db-fuzz-925024b6:quality-recovery:1","db-fuzz-925024b6:quality-recovery:2"],"fallback":"db-fuzz-925024b6:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 82 — dumbbells #6409

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Intermediate","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-990d90e7:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-990d90e7:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-990d90e7","recovery":["db-fuzz-990d90e7:quality-recovery:1","db-fuzz-990d90e7:quality-recovery:2"],"fallback":"db-fuzz-990d90e7:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 83 — dumbbells #6477

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-9fc9c327:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-9fc9c327:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-9fc9c327","recovery":["db-fuzz-9fc9c327:quality-recovery:1","db-fuzz-9fc9c327:quality-recovery:2"],"fallback":"db-fuzz-9fc9c327:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 84 — dumbbells #6545

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Advanced","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-a6850977:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-a6850977:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-a6850977","recovery":["db-fuzz-a6850977:quality-recovery:1","db-fuzz-a6850977:quality-recovery:2"],"fallback":"db-fuzz-a6850977:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 85 — dumbbells #6613

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-ad42afb4:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-ad42afb4:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-ad42afb4","recovery":["db-fuzz-ad42afb4:quality-recovery:1","db-fuzz-ad42afb4:quality-recovery:2"],"fallback":"db-fuzz-ad42afb4:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 86 — dumbbells #6681

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-b3fee604:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-b3fee604:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-b3fee604","recovery":["db-fuzz-b3fee604:quality-recovery:1","db-fuzz-b3fee604:quality-recovery:2"],"fallback":"db-fuzz-b3fee604:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 87 — dumbbells #6749

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Upper back"],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-baba1244:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-baba1244:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-baba1244","recovery":["db-fuzz-baba1244:quality-recovery:1","db-fuzz-baba1244:quality-recovery:2"],"fallback":"db-fuzz-baba1244:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 88 — dumbbells #6817

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Lower back"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-c1763d74:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-c1763d74:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-c1763d74","recovery":["db-fuzz-c1763d74:quality-recovery:1","db-fuzz-c1763d74:quality-recovery:2"],"fallback":"db-fuzz-c1763d74:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 89 — dumbbells #6953

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-ceef6ce5:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-ceef6ce5:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-ceef6ce5","recovery":["db-fuzz-ceef6ce5:quality-recovery:1","db-fuzz-ceef6ce5:quality-recovery:2"],"fallback":"db-fuzz-ceef6ce5:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 90 — dumbbells #7089

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-dc68947a:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-dc68947a:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-dc68947a","recovery":["db-fuzz-dc68947a:quality-recovery:1","db-fuzz-dc68947a:quality-recovery:2"],"fallback":"db-fuzz-dc68947a:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 91 — dumbbells #7225

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Neck"],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-e9e007fa:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-e9e007fa:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-e9e007fa","recovery":["db-fuzz-e9e007fa:quality-recovery:1","db-fuzz-e9e007fa:quality-recovery:2"],"fallback":"db-fuzz-e9e007fa:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 92 — dumbbells #7361

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-f759637b:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-f759637b:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-f759637b","recovery":["db-fuzz-f759637b:quality-recovery:1","db-fuzz-f759637b:quality-recovery:2"],"fallback":"db-fuzz-f759637b:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 93 — dumbbells #7497

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Upper back"],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-4d23ef8:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-4d23ef8:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-4d23ef8","recovery":["db-fuzz-4d23ef8:quality-recovery:1","db-fuzz-4d23ef8:quality-recovery:2"],"fallback":"db-fuzz-4d23ef8:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 94 — dumbbells #7633

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Hips"],"experience":"Intermediate","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-124af278:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-124af278:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-124af278","recovery":["db-fuzz-124af278:quality-recovery:1","db-fuzz-124af278:quality-recovery:2"],"fallback":"db-fuzz-124af278:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 95 — dumbbells #7769

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Knees"],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-1fc399f9:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-1fc399f9:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-1fc399f9","recovery":["db-fuzz-1fc399f9:quality-recovery:1","db-fuzz-1fc399f9:quality-recovery:2"],"fallback":"db-fuzz-1fc399f9:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 96 — dumbbells #7905

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Lower back","Hips"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-2d3c017e:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-2d3c017e:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-2d3c017e","recovery":["db-fuzz-2d3c017e:quality-recovery:1","db-fuzz-2d3c017e:quality-recovery:2"],"fallback":"db-fuzz-2d3c017e:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 97 — dumbbells #8041

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":[],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-3ab4e8fe:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-3ab4e8fe:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-3ab4e8fe","recovery":["db-fuzz-3ab4e8fe:quality-recovery:1","db-fuzz-3ab4e8fe:quality-recovery:2"],"fallback":"db-fuzz-3ab4e8fe:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 98 — dumbbells #8109

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-4171643f:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-4171643f:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-4171643f","recovery":["db-fuzz-4171643f:quality-recovery:1","db-fuzz-4171643f:quality-recovery:2"],"fallback":"db-fuzz-4171643f:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 99 — dumbbells #8177

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders"],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-482d307f:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-482d307f:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-482d307f","recovery":["db-fuzz-482d307f:quality-recovery:1","db-fuzz-482d307f:quality-recovery:2"],"fallback":"db-fuzz-482d307f:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 100 — dumbbells #8245

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Upper back"],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-4ee985bf:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-4ee985bf:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-4ee985bf","recovery":["db-fuzz-4ee985bf:quality-recovery:1","db-fuzz-4ee985bf:quality-recovery:2"],"fallback":"db-fuzz-4ee985bf:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 101 — dumbbells #8313

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-55a64bfc:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-55a64bfc:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-55a64bfc","recovery":["db-fuzz-55a64bfc:quality-recovery:1","db-fuzz-55a64bfc:quality-recovery:2"],"fallback":"db-fuzz-55a64bfc:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 102 — dumbbells #8381

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Hips"],"experience":"Advanced","equipment":["dumbbells","pullup_bar"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-5c622d3c:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-5c622d3c:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-5c622d3c","recovery":["db-fuzz-5c622d3c:quality-recovery:1","db-fuzz-5c622d3c:quality-recovery:2"],"fallback":"db-fuzz-5c622d3c:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 103 — dumbbells #8449

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Knees"],"experience":"Intermediate","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-631ea77c:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-631ea77c:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-631ea77c","recovery":["db-fuzz-631ea77c:quality-recovery:1","db-fuzz-631ea77c:quality-recovery:2"],"fallback":"db-fuzz-631ea77c:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 104 — dumbbells #8517

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-69db7ebd:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-69db7ebd:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-69db7ebd","recovery":["db-fuzz-69db7ebd:quality-recovery:1","db-fuzz-69db7ebd:quality-recovery:2"],"fallback":"db-fuzz-69db7ebd:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 105 — dumbbells #8585

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders","Upper back"],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-70971afd:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-70971afd:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-70971afd","recovery":["db-fuzz-70971afd:quality-recovery:1","db-fuzz-70971afd:quality-recovery:2"],"fallback":"db-fuzz-70971afd:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 106 — dumbbells #8653

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Lower back","Hips"],"experience":"Intermediate","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-7753ca3d:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-7753ca3d:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-7753ca3d","recovery":["db-fuzz-7753ca3d:quality-recovery:1","db-fuzz-7753ca3d:quality-recovery:2"],"fallback":"db-fuzz-7753ca3d:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 107 — dumbbells #8789

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":[],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-84cce7ba:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-84cce7ba:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-84cce7ba","recovery":["db-fuzz-84cce7ba:quality-recovery:1","db-fuzz-84cce7ba:quality-recovery:2"],"fallback":"db-fuzz-84cce7ba:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 108 — dumbbells #8925

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Upper back"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-92459b3b:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-92459b3b:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-92459b3b","recovery":["db-fuzz-92459b3b:quality-recovery:1","db-fuzz-92459b3b:quality-recovery:2"],"fallback":"db-fuzz-92459b3b:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 109 — dumbbells #9061

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Intermediate","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-9fbd303b:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-9fbd303b:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-9fbd303b","recovery":["db-fuzz-9fbd303b:quality-recovery:1","db-fuzz-9fbd303b:quality-recovery:2"],"fallback":"db-fuzz-9fbd303b:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Intermediate:default"}

### Failed 110 — dumbbells #9197

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Knees"],"experience":"Advanced","equipment":["dumbbells","bench"],"daysPerWeek":4},"phaseIndex":3,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-ad36f8b8:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-ad36f8b8:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-ad36f8b8","recovery":["db-fuzz-ad36f8b8:quality-recovery:1","db-fuzz-ad36f8b8:quality-recovery:2"],"fallback":"db-fuzz-ad36f8b8:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Advanced:default"}

### Failed 111 — dumbbells #9333

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Beginner","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-baae4138:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-baae4138:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-baae4138","recovery":["db-fuzz-baae4138:quality-recovery:1","db-fuzz-baae4138:quality-recovery:2"],"fallback":"db-fuzz-baae4138:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 112 — dumbbells #9469

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Neck"],"experience":"Intermediate","equipment":["dumbbells","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-c82769b9:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-c82769b9:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-c82769b9","recovery":["db-fuzz-c82769b9:quality-recovery:1","db-fuzz-c82769b9:quality-recovery:2"],"fallback":"db-fuzz-c82769b9:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 113 — dumbbells #9605

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Advanced","equipment":["dumbbells","bench","pullup_bar"],"daysPerWeek":5},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-d5a09206:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-d5a09206:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-d5a09206","recovery":["db-fuzz-d5a09206:quality-recovery:1","db-fuzz-d5a09206:quality-recovery:2"],"fallback":"db-fuzz-d5a09206:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Advanced:default"}

### Failed 114 — dumbbells #9741

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Lower back"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-e3180eb6:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-e3180eb6:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-e3180eb6","recovery":["db-fuzz-e3180eb6:quality-recovery:1","db-fuzz-e3180eb6:quality-recovery:2"],"fallback":"db-fuzz-e3180eb6:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Beginner:default"}

### Failed 115 — dumbbells #9877

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Hips"],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":2,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-f0916327:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-f0916327:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-f0916327","recovery":["db-fuzz-f0916327:quality-recovery:1","db-fuzz-f0916327:quality-recovery:2"],"fallback":"db-fuzz-f0916327:quality-fallback:dumbbells:canonical-dumbbell-abc:d5:Intermediate:default"}

### Failed 116 — dumbbells #9945

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Knees"],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":1,"blockedExerciseIds":{"goblet-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: goblet-squat
- Initial hard failures: DUMBBELL_PREP_AS_MAIN
- Recovery: [{"attempt":1,"seed":"db-fuzz-f74d11f7:quality-recovery:1","codes":["DUMBBELL_PREP_AS_MAIN"]},{"attempt":2,"seed":"db-fuzz-f74d11f7:quality-recovery:2","codes":["DUMBBELL_PREP_AS_MAIN"]}]
- Fallback hard failures: DUMBBELL_PREP_AS_MAIN
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"db-fuzz-f74d11f7","recovery":["db-fuzz-f74d11f7:quality-recovery:1","db-fuzz-f74d11f7:quality-recovery:2"],"fallback":"db-fuzz-f74d11f7:quality-fallback:dumbbells:canonical-dumbbell-abc:d4:Beginner:default"}

### Failed 117 — mixedHome #90

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-3db87c53:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-3db87c53:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-3db87c53","recovery":["mh-fuzz-3db87c53:quality-recovery:1","mh-fuzz-3db87c53:quality-recovery:2"],"fallback":"mh-fuzz-3db87c53:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 118 — mixedHome #117

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-ed92fa04:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-ed92fa04:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-ed92fa04","recovery":["mh-fuzz-ed92fa04:quality-recovery:1","mh-fuzz-ed92fa04:quality-recovery:2"],"fallback":"mh-fuzz-ed92fa04:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 119 — mixedHome #144

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-9d6b702a:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-9d6b702a:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-9d6b702a","recovery":["mh-fuzz-9d6b702a:quality-recovery:1","mh-fuzz-9d6b702a:quality-recovery:2"],"fallback":"mh-fuzz-9d6b702a:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 120 — mixedHome #263

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-293557bd:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-293557bd:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-293557bd","recovery":["mh-fuzz-293557bd:quality-recovery:1","mh-fuzz-293557bd:quality-recovery:2"],"fallback":"mh-fuzz-293557bd:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 121 — mixedHome #266

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-3dbe840:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-3dbe840:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-3dbe840","recovery":["mh-fuzz-3dbe840:quality-recovery:1","mh-fuzz-3dbe840:quality-recovery:2"],"fallback":"mh-fuzz-3dbe840:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 122 — mixedHome #269

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-de82862c:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-de82862c:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-de82862c","recovery":["mh-fuzz-de82862c:quality-recovery:1","mh-fuzz-de82862c:quality-recovery:2"],"fallback":"mh-fuzz-de82862c:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 123 — mixedHome #290

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-d90f8d3c:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-d90f8d3c:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-d90f8d3c","recovery":["mh-fuzz-d90f8d3c:quality-recovery:1","mh-fuzz-d90f8d3c:quality-recovery:2"],"fallback":"mh-fuzz-d90f8d3c:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 124 — mixedHome #293

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-b3b572f3:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-b3b572f3:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-b3b572f3","recovery":["mh-fuzz-b3b572f3:quality-recovery:1","mh-fuzz-b3b572f3:quality-recovery:2"],"fallback":"mh-fuzz-b3b572f3:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 125 — mixedHome #296

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-8e5ca005:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-8e5ca005:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-8e5ca005","recovery":["mh-fuzz-8e5ca005:quality-recovery:1","mh-fuzz-8e5ca005:quality-recovery:2"],"fallback":"mh-fuzz-8e5ca005:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 126 — mixedHome #317

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-88e9a137:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-88e9a137:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-88e9a137","recovery":["mh-fuzz-88e9a137:quality-recovery:1","mh-fuzz-88e9a137:quality-recovery:2"],"fallback":"mh-fuzz-88e9a137:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 127 — mixedHome #320

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-638ff57e:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-638ff57e:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-638ff57e","recovery":["mh-fuzz-638ff57e:quality-recovery:1","mh-fuzz-638ff57e:quality-recovery:2"],"fallback":"mh-fuzz-638ff57e:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 128 — mixedHome #323

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3,"blockedExerciseIds":{"band-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: band-rdl
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-3e363a32:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-3e363a32:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-3e363a32","recovery":["mh-fuzz-3e363a32:quality-recovery:1","mh-fuzz-3e363a32:quality-recovery:2"],"fallback":"mh-fuzz-3e363a32:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 129 — mixedHome #495

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-8b7b4d8b:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-8b7b4d8b:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-8b7b4d8b","recovery":["mh-fuzz-8b7b4d8b:quality-recovery:1","mh-fuzz-8b7b4d8b:quality-recovery:2"],"fallback":"mh-fuzz-8b7b4d8b:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 130 — mixedHome #498

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-66225221:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-66225221:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-66225221","recovery":["mh-fuzz-66225221:quality-recovery:1","mh-fuzz-66225221:quality-recovery:2"],"fallback":"mh-fuzz-66225221:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 131 — mixedHome #501

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-40c8e1de:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-40c8e1de:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-40c8e1de","recovery":["mh-fuzz-40c8e1de:quality-recovery:1","mh-fuzz-40c8e1de:quality-recovery:2"],"fallback":"mh-fuzz-40c8e1de:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 132 — mixedHome #522

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-3b55a7ce:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-3b55a7ce:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-3b55a7ce","recovery":["mh-fuzz-3b55a7ce:quality-recovery:1","mh-fuzz-3b55a7ce:quality-recovery:2"],"fallback":"mh-fuzz-3b55a7ce:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 133 — mixedHome #544

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders","Upper back"],"experience":"Intermediate","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":3,"bandSetup":"long_with_anchor"},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-d41ac5cb:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-d41ac5cb:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-d41ac5cb","recovery":["mh-fuzz-d41ac5cb:quality-recovery:1","mh-fuzz-d41ac5cb:quality-recovery:2"],"fallback":"mh-fuzz-d41ac5cb:quality-fallback:mixedHome:canonical-mixed-home-lane:d3:Intermediate:\"long_with_anchor\""}

### Failed 134 — mixedHome #549

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-eb2f9969:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-eb2f9969:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-eb2f9969","recovery":["mh-fuzz-eb2f9969:quality-recovery:1","mh-fuzz-eb2f9969:quality-recovery:2"],"fallback":"mh-fuzz-eb2f9969:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 135 — mixedHome #587

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-676be5e7:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-676be5e7:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-676be5e7","recovery":["mh-fuzz-676be5e7:quality-recovery:1","mh-fuzz-676be5e7:quality-recovery:2"],"fallback":"mh-fuzz-676be5e7:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 136 — mixedHome #593

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-1cb8400a:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-1cb8400a:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-1cb8400a","recovery":["mh-fuzz-1cb8400a:quality-recovery:1","mh-fuzz-1cb8400a:quality-recovery:2"],"fallback":"mh-fuzz-1cb8400a:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 137 — mixedHome #614

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-17454f72:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-17454f72:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-17454f72","recovery":["mh-fuzz-17454f72:quality-recovery:1","mh-fuzz-17454f72:quality-recovery:2"],"fallback":"mh-fuzz-17454f72:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 138 — mixedHome #617

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f1eb34a1:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f1eb34a1:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f1eb34a1","recovery":["mh-fuzz-f1eb34a1:quality-recovery:1","mh-fuzz-f1eb34a1:quality-recovery:2"],"fallback":"mh-fuzz-f1eb34a1:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 139 — mixedHome #620

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-cc92fecf:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-cc92fecf:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-cc92fecf","recovery":["mh-fuzz-cc92fecf:quality-recovery:1","mh-fuzz-cc92fecf:quality-recovery:2"],"fallback":"mh-fuzz-cc92fecf:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 140 — mixedHome #641

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-c71feafd:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-c71feafd:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-c71feafd","recovery":["mh-fuzz-c71feafd:quality-recovery:1","mh-fuzz-c71feafd:quality-recovery:2"],"fallback":"mh-fuzz-c71feafd:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 141 — mixedHome #647

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-7c6c7464:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-7c6c7464:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-7c6c7464","recovery":["mh-fuzz-7c6c7464:quality-recovery:1","mh-fuzz-7c6c7464:quality-recovery:2"],"fallback":"mh-fuzz-7c6c7464:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 142 — mixedHome #2207

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-9e7908d9:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-9e7908d9:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-9e7908d9","recovery":["mh-fuzz-9e7908d9:quality-recovery:1","mh-fuzz-9e7908d9:quality-recovery:2"],"fallback":"mh-fuzz-9e7908d9:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 143 — mixedHome #2210

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2,"blockedExerciseIds":{"bodyweight-squat":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: bodyweight-squat
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-79207a93:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-79207a93:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-79207a93","recovery":["mh-fuzz-79207a93:quality-recovery:1","mh-fuzz-79207a93:quality-recovery:2"],"fallback":"mh-fuzz-79207a93:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 144 — mixedHome #2213

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-53c62300:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-53c62300:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-53c62300","recovery":["mh-fuzz-53c62300:quality-recovery:1","mh-fuzz-53c62300:quality-recovery:2"],"fallback":"mh-fuzz-53c62300:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 145 — mixedHome #2234

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-4e532218:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-4e532218:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-4e532218","recovery":["mh-fuzz-4e532218:quality-recovery:1","mh-fuzz-4e532218:quality-recovery:2"],"fallback":"mh-fuzz-4e532218:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 146 — mixedHome #2237

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-28f9f1a7:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-28f9f1a7:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-28f9f1a7","recovery":["mh-fuzz-28f9f1a7:quality-recovery:1","mh-fuzz-28f9f1a7:quality-recovery:2"],"fallback":"mh-fuzz-28f9f1a7:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 147 — mixedHome #2240

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-3a045d1:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-3a045d1:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-3a045d1","recovery":["mh-fuzz-3a045d1:quality-recovery:1","mh-fuzz-3a045d1:quality-recovery:2"],"fallback":"mh-fuzz-3a045d1:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 148 — mixedHome #2264

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-d8d377da:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-d8d377da:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-d8d377da","recovery":["mh-fuzz-d8d377da:quality-recovery:1","mh-fuzz-d8d377da:quality-recovery:2"],"fallback":"mh-fuzz-d8d377da:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 149 — mixedHome #2267

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-b37aaf66:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-b37aaf66:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-b37aaf66","recovery":["mh-fuzz-b37aaf66:quality-recovery:1","mh-fuzz-b37aaf66:quality-recovery:2"],"fallback":"mh-fuzz-b37aaf66:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 150 — mixedHome #2439

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-bfdfb7:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-bfdfb7:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-bfdfb7","recovery":["mh-fuzz-bfdfb7:quality-recovery:1","mh-fuzz-bfdfb7:quality-recovery:2"],"fallback":"mh-fuzz-bfdfb7:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 151 — mixedHome #2442

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-db66977d:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-db66977d:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-db66977d","recovery":["mh-fuzz-db66977d:quality-recovery:1","mh-fuzz-db66977d:quality-recovery:2"],"fallback":"mh-fuzz-db66977d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 152 — mixedHome #2445

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-b60c0f22:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-b60c0f22:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-b60c0f22","recovery":["mh-fuzz-b60c0f22:quality-recovery:1","mh-fuzz-b60c0f22:quality-recovery:2"],"fallback":"mh-fuzz-b60c0f22:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 153 — mixedHome #2466

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-b099042a:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-b099042a:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-b099042a","recovery":["mh-fuzz-b099042a:quality-recovery:1","mh-fuzz-b099042a:quality-recovery:2"],"fallback":"mh-fuzz-b099042a:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 154 — mixedHome #2493

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-6073ea2d:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-6073ea2d:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-6073ea2d","recovery":["mh-fuzz-6073ea2d:quality-recovery:1","mh-fuzz-6073ea2d:quality-recovery:2"],"fallback":"mh-fuzz-6073ea2d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 155 — mixedHome #2531

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-dcaf460b:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-dcaf460b:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-dcaf460b","recovery":["mh-fuzz-dcaf460b:quality-recovery:1","mh-fuzz-dcaf460b:quality-recovery:2"],"fallback":"mh-fuzz-dcaf460b:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 156 — mixedHome #2537

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-91fce536:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-91fce536:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-91fce536","recovery":["mh-fuzz-91fce536:quality-recovery:1","mh-fuzz-91fce536:quality-recovery:2"],"fallback":"mh-fuzz-91fce536:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 157 — mixedHome #2558

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-8c89fcc6:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-8c89fcc6:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-8c89fcc6","recovery":["mh-fuzz-8c89fcc6:quality-recovery:1","mh-fuzz-8c89fcc6:quality-recovery:2"],"fallback":"mh-fuzz-8c89fcc6:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 158 — mixedHome #2561

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-672fba4d:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-672fba4d:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-672fba4d","recovery":["mh-fuzz-672fba4d:quality-recovery:1","mh-fuzz-672fba4d:quality-recovery:2"],"fallback":"mh-fuzz-672fba4d:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 159 — mixedHome #2564

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-41d60ba3:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-41d60ba3:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-41d60ba3","recovery":["mh-fuzz-41d60ba3:quality-recovery:1","mh-fuzz-41d60ba3:quality-recovery:2"],"fallback":"mh-fuzz-41d60ba3:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 160 — mixedHome #2585

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-3c637999:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-3c637999:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-3c637999","recovery":["mh-fuzz-3c637999:quality-recovery:1","mh-fuzz-3c637999:quality-recovery:2"],"fallback":"mh-fuzz-3c637999:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 161 — mixedHome #2591

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f1b0d190:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f1b0d190:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f1b0d190","recovery":["mh-fuzz-f1b0d190:quality-recovery:1","mh-fuzz-f1b0d190:quality-recovery:2"],"fallback":"mh-fuzz-f1b0d190:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 162 — mixedHome #2682

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["bands","dumbbells"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-2f684d63:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-2f684d63:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-2f684d63","recovery":["mh-fuzz-2f684d63:quality-recovery:1","mh-fuzz-2f684d63:quality-recovery:2"],"fallback":"mh-fuzz-2f684d63:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 163 — mixedHome #2709

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders"],"experience":"Beginner","equipment":["bands","dumbbells"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-df42e8f4:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-df42e8f4:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-df42e8f4","recovery":["mh-fuzz-df42e8f4:quality-recovery:1","mh-fuzz-df42e8f4:quality-recovery:2"],"fallback":"mh-fuzz-df42e8f4:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 164 — mixedHome #2736

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Beginner","equipment":["bands","dumbbells"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-8f1c827d:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-8f1c827d:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-8f1c827d","recovery":["mh-fuzz-8f1c827d:quality-recovery:1","mh-fuzz-8f1c827d:quality-recovery:2"],"fallback":"mh-fuzz-8f1c827d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 165 — mixedHome #2855

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-1ae5844d:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-1ae5844d:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-1ae5844d","recovery":["mh-fuzz-1ae5844d:quality-recovery:1","mh-fuzz-1ae5844d:quality-recovery:2"],"fallback":"mh-fuzz-1ae5844d:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 166 — mixedHome #2858

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f58cfe37:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f58cfe37:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f58cfe37","recovery":["mh-fuzz-f58cfe37:quality-recovery:1","mh-fuzz-f58cfe37:quality-recovery:2"],"fallback":"mh-fuzz-f58cfe37:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 167 — mixedHome #2861

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-d032a8fc:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-d032a8fc:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-d032a8fc","recovery":["mh-fuzz-d032a8fc:quality-recovery:1","mh-fuzz-d032a8fc:quality-recovery:2"],"fallback":"mh-fuzz-d032a8fc:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 168 — mixedHome #2882

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-cabfbeec:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-cabfbeec:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-cabfbeec","recovery":["mh-fuzz-cabfbeec:quality-recovery:1","mh-fuzz-cabfbeec:quality-recovery:2"],"fallback":"mh-fuzz-cabfbeec:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 169 — mixedHome #2885

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-a5654403:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-a5654403:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-a5654403","recovery":["mh-fuzz-a5654403:quality-recovery:1","mh-fuzz-a5654403:quality-recovery:2"],"fallback":"mh-fuzz-a5654403:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 170 — mixedHome #2888

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-800cce75:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-800cce75:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-800cce75","recovery":["mh-fuzz-800cce75:quality-recovery:1","mh-fuzz-800cce75:quality-recovery:2"],"fallback":"mh-fuzz-800cce75:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 171 — mixedHome #2909

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-7a993367:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-7a993367:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-7a993367","recovery":["mh-fuzz-7a993367:quality-recovery:1","mh-fuzz-7a993367:quality-recovery:2"],"fallback":"mh-fuzz-7a993367:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 172 — mixedHome #2912

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-553fe22e:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-553fe22e:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-553fe22e","recovery":["mh-fuzz-553fe22e:quality-recovery:1","mh-fuzz-553fe22e:quality-recovery:2"],"fallback":"mh-fuzz-553fe22e:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 173 — mixedHome #2915

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-2fe60bc2:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-2fe60bc2:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-2fe60bc2","recovery":["mh-fuzz-2fe60bc2:quality-recovery:1","mh-fuzz-2fe60bc2:quality-recovery:2"],"fallback":"mh-fuzz-2fe60bc2:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 174 — mixedHome #4383

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","bench"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-76038123:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-76038123:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-76038123","recovery":["mh-fuzz-76038123:quality-recovery:1","mh-fuzz-76038123:quality-recovery:2"],"fallback":"mh-fuzz-76038123:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 175 — mixedHome #4410

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","bench"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-25dde916:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-25dde916:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-25dde916","recovery":["mh-fuzz-25dde916:quality-recovery:1","mh-fuzz-25dde916:quality-recovery:2"],"fallback":"mh-fuzz-25dde916:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 176 — mixedHome #4475

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-51f3e34f:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-51f3e34f:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-51f3e34f","recovery":["mh-fuzz-51f3e34f:quality-recovery:1","mh-fuzz-51f3e34f:quality-recovery:2"],"fallback":"mh-fuzz-51f3e34f:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 177 — mixedHome #4481

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-7408ba2:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-7408ba2:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-7408ba2","recovery":["mh-fuzz-7408ba2:quality-recovery:1","mh-fuzz-7408ba2:quality-recovery:2"],"fallback":"mh-fuzz-7408ba2:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 178 — mixedHome #4502

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-1cd89aa:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-1cd89aa:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-1cd89aa","recovery":["mh-fuzz-1cd89aa:quality-recovery:1","mh-fuzz-1cd89aa:quality-recovery:2"],"fallback":"mh-fuzz-1cd89aa:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 179 — mixedHome #4529

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-b1a7efb5:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-b1a7efb5:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-b1a7efb5","recovery":["mh-fuzz-b1a7efb5:quality-recovery:1","mh-fuzz-b1a7efb5:quality-recovery:2"],"fallback":"mh-fuzz-b1a7efb5:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 180 — mixedHome #4532

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-8c4d4768:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-8c4d4768:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-8c4d4768","recovery":["mh-fuzz-8c4d4768:quality-recovery:1","mh-fuzz-8c4d4768:quality-recovery:2"],"fallback":"mh-fuzz-8c4d4768:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 181 — mixedHome #4626

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-a4acde8f:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-a4acde8f:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-a4acde8f","recovery":["mh-fuzz-a4acde8f:quality-recovery:1","mh-fuzz-a4acde8f:quality-recovery:2"],"fallback":"mh-fuzz-a4acde8f:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 182 — mixedHome #4653

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders"],"experience":"Beginner","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-54861b48:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-54861b48:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-54861b48","recovery":["mh-fuzz-54861b48:quality-recovery:1","mh-fuzz-54861b48:quality-recovery:2"],"fallback":"mh-fuzz-54861b48:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 183 — mixedHome #4680

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Beginner","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-4602119:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-4602119:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-4602119","recovery":["mh-fuzz-4602119:quality-recovery:1","mh-fuzz-4602119:quality-recovery:2"],"fallback":"mh-fuzz-4602119:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 184 — mixedHome #4799

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-902926e9:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-902926e9:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-902926e9","recovery":["mh-fuzz-902926e9:quality-recovery:1","mh-fuzz-902926e9:quality-recovery:2"],"fallback":"mh-fuzz-902926e9:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 185 — mixedHome #4802

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-6ad04903:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-6ad04903:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-6ad04903","recovery":["mh-fuzz-6ad04903:quality-recovery:1","mh-fuzz-6ad04903:quality-recovery:2"],"fallback":"mh-fuzz-6ad04903:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 186 — mixedHome #4805

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-4576d590:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-4576d590:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-4576d590","recovery":["mh-fuzz-4576d590:quality-recovery:1","mh-fuzz-4576d590:quality-recovery:2"],"fallback":"mh-fuzz-4576d590:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 187 — mixedHome #4826

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-4003cc68:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-4003cc68:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-4003cc68","recovery":["mh-fuzz-4003cc68:quality-recovery:1","mh-fuzz-4003cc68:quality-recovery:2"],"fallback":"mh-fuzz-4003cc68:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 188 — mixedHome #4829

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-1aa9e3d7:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-1aa9e3d7:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-1aa9e3d7","recovery":["mh-fuzz-1aa9e3d7:quality-recovery:1","mh-fuzz-1aa9e3d7:quality-recovery:2"],"fallback":"mh-fuzz-1aa9e3d7:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 189 — mixedHome #4832

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f55093c1:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f55093c1:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f55093c1","recovery":["mh-fuzz-f55093c1:quality-recovery:1","mh-fuzz-f55093c1:quality-recovery:2"],"fallback":"mh-fuzz-f55093c1:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 190 — mixedHome #4853

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-efdd8dcb:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-efdd8dcb:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-efdd8dcb","recovery":["mh-fuzz-efdd8dcb:quality-recovery:1","mh-fuzz-efdd8dcb:quality-recovery:2"],"fallback":"mh-fuzz-efdd8dcb:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 191 — mixedHome #4856

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-ca8305aa:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-ca8305aa:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-ca8305aa","recovery":["mh-fuzz-ca8305aa:quality-recovery:1","mh-fuzz-ca8305aa:quality-recovery:2"],"fallback":"mh-fuzz-ca8305aa:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 192 — mixedHome #4859

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-a52a9916:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-a52a9916:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-a52a9916","recovery":["mh-fuzz-a52a9916:quality-recovery:1","mh-fuzz-a52a9916:quality-recovery:2"],"fallback":"mh-fuzz-a52a9916:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 193 — mixedHome #5031

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f26f0d47:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f26f0d47:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f26f0d47","recovery":["mh-fuzz-f26f0d47:quality-recovery:1","mh-fuzz-f26f0d47:quality-recovery:2"],"fallback":"mh-fuzz-f26f0d47:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 194 — mixedHome #5034

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-cd16a12d:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-cd16a12d:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-cd16a12d","recovery":["mh-fuzz-cd16a12d:quality-recovery:1","mh-fuzz-cd16a12d:quality-recovery:2"],"fallback":"mh-fuzz-cd16a12d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 195 — mixedHome #5037

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-a7bc7ef2:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-a7bc7ef2:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-a7bc7ef2","recovery":["mh-fuzz-a7bc7ef2:quality-recovery:1","mh-fuzz-a7bc7ef2:quality-recovery:2"],"fallback":"mh-fuzz-a7bc7ef2:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 196 — mixedHome #5058

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-a249769a:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-a249769a:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-a249769a","recovery":["mh-fuzz-a249769a:quality-recovery:1","mh-fuzz-a249769a:quality-recovery:2"],"fallback":"mh-fuzz-a249769a:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 197 — mixedHome #5085

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-5223f85d:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-5223f85d:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-5223f85d","recovery":["mh-fuzz-5223f85d:quality-recovery:1","mh-fuzz-5223f85d:quality-recovery:2"],"fallback":"mh-fuzz-5223f85d:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 198 — mixedHome #6052

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Upper back"],"experience":"Intermediate","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":3,"bandSetup":"loop_only"},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f5b0a3a5:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f5b0a3a5:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f5b0a3a5","recovery":["mh-fuzz-f5b0a3a5:quality-recovery:1","mh-fuzz-f5b0a3a5:quality-recovery:2"],"fallback":"mh-fuzz-f5b0a3a5:quality-fallback:mixedHome:canonical-mixed-home-lane:d3:Intermediate:\"loop_only\""}

### Failed 199 — mixedHome #6570

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-19f08bcb:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-19f08bcb:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-19f08bcb","recovery":["mh-fuzz-19f08bcb:quality-recovery:1","mh-fuzz-19f08bcb:quality-recovery:2"],"fallback":"mh-fuzz-19f08bcb:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 200 — mixedHome #6597

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-c9caae2c:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-c9caae2c:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-c9caae2c","recovery":["mh-fuzz-c9caae2c:quality-recovery:1","mh-fuzz-c9caae2c:quality-recovery:2"],"fallback":"mh-fuzz-c9caae2c:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 201 — mixedHome #6624

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-79a44435:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-79a44435:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-79a44435","recovery":["mh-fuzz-79a44435:quality-recovery:1","mh-fuzz-79a44435:quality-recovery:2"],"fallback":"mh-fuzz-79a44435:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 202 — mixedHome #6664

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Upper back"],"experience":"Intermediate","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-324f7376:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-324f7376:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-324f7376","recovery":["mh-fuzz-324f7376:quality-recovery:1","mh-fuzz-324f7376:quality-recovery:2"],"fallback":"mh-fuzz-324f7376:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Intermediate:\"both_with_anchor\""}

### Failed 203 — mixedHome #6743

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-56dcbb5:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-56dcbb5:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-56dcbb5","recovery":["mh-fuzz-56dcbb5:quality-recovery:1","mh-fuzz-56dcbb5:quality-recovery:2"],"fallback":"mh-fuzz-56dcbb5:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 204 — mixedHome #6746

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-e014dbff:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-e014dbff:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-e014dbff","recovery":["mh-fuzz-e014dbff:quality-recovery:1","mh-fuzz-e014dbff:quality-recovery:2"],"fallback":"mh-fuzz-e014dbff:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 205 — mixedHome #6770

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-b54711c4:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-b54711c4:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-b54711c4","recovery":["mh-fuzz-b54711c4:quality-recovery:1","mh-fuzz-b54711c4:quality-recovery:2"],"fallback":"mh-fuzz-b54711c4:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 206 — mixedHome #6773

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-8fee9e78:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-8fee9e78:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-8fee9e78","recovery":["mh-fuzz-8fee9e78:quality-recovery:1","mh-fuzz-8fee9e78:quality-recovery:2"],"fallback":"mh-fuzz-8fee9e78:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 207 — mixedHome #6776

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-6a94143d:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-6a94143d:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-6a94143d","recovery":["mh-fuzz-6a94143d:quality-recovery:1","mh-fuzz-6a94143d:quality-recovery:2"],"fallback":"mh-fuzz-6a94143d:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 208 — mixedHome #6797

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-65211f0f:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-65211f0f:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-65211f0f","recovery":["mh-fuzz-65211f0f:quality-recovery:1","mh-fuzz-65211f0f:quality-recovery:2"],"fallback":"mh-fuzz-65211f0f:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 209 — mixedHome #6800

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-3fc7d886:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-3fc7d886:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-3fc7d886","recovery":["mh-fuzz-3fc7d886:quality-recovery:1","mh-fuzz-3fc7d886:quality-recovery:2"],"fallback":"mh-fuzz-3fc7d886:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 210 — mixedHome #6803

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-1a6e4e3a:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-1a6e4e3a:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-1a6e4e3a","recovery":["mh-fuzz-1a6e4e3a:quality-recovery:1","mh-fuzz-1a6e4e3a:quality-recovery:2"],"fallback":"mh-fuzz-1a6e4e3a:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 211 — mixedHome #6975

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","bench"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-67b470f4:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-67b470f4:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-67b470f4","recovery":["mh-fuzz-67b470f4:quality-recovery:1","mh-fuzz-67b470f4:quality-recovery:2"],"fallback":"mh-fuzz-67b470f4:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 212 — mixedHome #7002

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","bench"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-178dfb66:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-178dfb66:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-178dfb66","recovery":["mh-fuzz-178dfb66:quality-recovery:1","mh-fuzz-178dfb66:quality-recovery:2"],"fallback":"mh-fuzz-178dfb66:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 213 — mixedHome #7029

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["dumbbells","bands","bench"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-c76705f1:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-c76705f1:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-c76705f1","recovery":["mh-fuzz-c76705f1:quality-recovery:1","mh-fuzz-c76705f1:quality-recovery:2"],"fallback":"mh-fuzz-c76705f1:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 214 — mixedHome #7067

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-43a3917f:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-43a3917f:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-43a3917f","recovery":["mh-fuzz-43a3917f:quality-recovery:1","mh-fuzz-43a3917f:quality-recovery:2"],"fallback":"mh-fuzz-43a3917f:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 215 — mixedHome #7073

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f8f055f2:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f8f055f2:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f8f055f2","recovery":["mh-fuzz-f8f055f2:quality-recovery:1","mh-fuzz-f8f055f2:quality-recovery:2"],"fallback":"mh-fuzz-f8f055f2:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 216 — mixedHome #7094

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f37d5bfa:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f37d5bfa:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f37d5bfa","recovery":["mh-fuzz-f37d5bfa:quality-recovery:1","mh-fuzz-f37d5bfa:quality-recovery:2"],"fallback":"mh-fuzz-f37d5bfa:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 217 — mixedHome #7097

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-ce24dbbe:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-ce24dbbe:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-ce24dbbe","recovery":["mh-fuzz-ce24dbbe:quality-recovery:1","mh-fuzz-ce24dbbe:quality-recovery:2"],"fallback":"mh-fuzz-ce24dbbe:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 218 — mixedHome #7100

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-a8ca2a67:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-a8ca2a67:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-a8ca2a67","recovery":["mh-fuzz-a8ca2a67:quality-recovery:1","mh-fuzz-a8ca2a67:quality-recovery:2"],"fallback":"mh-fuzz-a8ca2a67:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 219 — mixedHome #7121

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-a357dd65:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-a357dd65:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-a357dd65","recovery":["mh-fuzz-a357dd65:quality-recovery:1","mh-fuzz-a357dd65:quality-recovery:2"],"fallback":"mh-fuzz-a357dd65:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 220 — mixedHome #7127

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":5,"bandSetup":"both_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-58a400fc:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-58a400fc:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-58a400fc","recovery":["mh-fuzz-58a400fc:quality-recovery:1","mh-fuzz-58a400fc:quality-recovery:2"],"fallback":"mh-fuzz-58a400fc:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"both_with_anchor\""}

### Failed 221 — mixedHome #7218

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-965c0c1f:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-965c0c1f:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-965c0c1f","recovery":["mh-fuzz-965c0c1f:quality-recovery:1","mh-fuzz-965c0c1f:quality-recovery:2"],"fallback":"mh-fuzz-965c0c1f:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 222 — mixedHome #7245

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders"],"experience":"Beginner","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-463629d8:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-463629d8:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-463629d8","recovery":["mh-fuzz-463629d8:quality-recovery:1","mh-fuzz-463629d8:quality-recovery:2"],"fallback":"mh-fuzz-463629d8:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 223 — mixedHome #7272

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Beginner","equipment":["pullup_bar","bands","dumbbells"],"daysPerWeek":4,"bandSetup":"both_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f610b389:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f610b389:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f610b389","recovery":["mh-fuzz-f610b389:quality-recovery:1","mh-fuzz-f610b389:quality-recovery:2"],"fallback":"mh-fuzz-f610b389:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"both_with_anchor\""}

### Failed 224 — mixedHome #8919

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["bands","dumbbells"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-dcf8f3a0:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-dcf8f3a0:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-dcf8f3a0","recovery":["mh-fuzz-dcf8f3a0:quality-recovery:1","mh-fuzz-dcf8f3a0:quality-recovery:2"],"fallback":"mh-fuzz-dcf8f3a0:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 225 — mixedHome #8922

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["bands","dumbbells"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-b79e2bf5:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-b79e2bf5:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-b79e2bf5","recovery":["mh-fuzz-b79e2bf5:quality-recovery:1","mh-fuzz-b79e2bf5:quality-recovery:2"],"fallback":"mh-fuzz-b79e2bf5:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 226 — mixedHome #8946

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["bands","dumbbells"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-8cd289d1:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-8cd289d1:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-8cd289d1","recovery":["mh-fuzz-8cd289d1:quality-recovery:1","mh-fuzz-8cd289d1:quality-recovery:2"],"fallback":"mh-fuzz-8cd289d1:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 227 — mixedHome #8973

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders","Upper back"],"experience":"Beginner","equipment":["bands","dumbbells"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-3cabe605:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-3cabe605:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-3cabe605","recovery":["mh-fuzz-3cabe605:quality-recovery:1","mh-fuzz-3cabe605:quality-recovery:2"],"fallback":"mh-fuzz-3cabe605:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 228 — mixedHome #9011

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-b8e75213:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-b8e75213:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-b8e75213","recovery":["mh-fuzz-b8e75213:quality-recovery:1","mh-fuzz-b8e75213:quality-recovery:2"],"fallback":"mh-fuzz-b8e75213:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 229 — mixedHome #9017

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-6e34ab2e:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-6e34ab2e:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-6e34ab2e","recovery":["mh-fuzz-6e34ab2e:quality-recovery:1","mh-fuzz-6e34ab2e:quality-recovery:2"],"fallback":"mh-fuzz-6e34ab2e:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 230 — mixedHome #9038

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-68c1a85e:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-68c1a85e:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-68c1a85e","recovery":["mh-fuzz-68c1a85e:quality-recovery:1","mh-fuzz-68c1a85e:quality-recovery:2"],"fallback":"mh-fuzz-68c1a85e:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 231 — mixedHome #9041

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-43686eda:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-43686eda:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-43686eda","recovery":["mh-fuzz-43686eda:quality-recovery:1","mh-fuzz-43686eda:quality-recovery:2"],"fallback":"mh-fuzz-43686eda:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 232 — mixedHome #9044

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`
- Blocked exercise: db-rdl
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-1e0e84cb:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-1e0e84cb:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-1e0e84cb","recovery":["mh-fuzz-1e0e84cb:quality-recovery:1","mh-fuzz-1e0e84cb:quality-recovery:2"],"fallback":"mh-fuzz-1e0e84cb:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 233 — mixedHome #9065

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-189b8ed1:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-189b8ed1:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-189b8ed1","recovery":["mh-fuzz-189b8ed1:quality-recovery:1","mh-fuzz-189b8ed1:quality-recovery:2"],"fallback":"mh-fuzz-189b8ed1:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 234 — mixedHome #9071

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back","Hips"],"experience":"Advanced","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-cde8bd98:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-cde8bd98:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-cde8bd98","recovery":["mh-fuzz-cde8bd98:quality-recovery:1","mh-fuzz-cde8bd98:quality-recovery:2"],"fallback":"mh-fuzz-cde8bd98:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 235 — mixedHome #9162

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-ba0b9fb:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-ba0b9fb:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-ba0b9fb","recovery":["mh-fuzz-ba0b9fb:quality-recovery:1","mh-fuzz-ba0b9fb:quality-recovery:2"],"fallback":"mh-fuzz-ba0b9fb:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 236 — mixedHome #9189

- Input: `{"questionnaire":{"goals":"General fitness","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-bb7a337c:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-bb7a337c:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-bb7a337c","recovery":["mh-fuzz-bb7a337c:quality-recovery:1","mh-fuzz-bb7a337c:quality-recovery:2"],"fallback":"mh-fuzz-bb7a337c:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 237 — mixedHome #9216

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Shoulders"],"experience":"Beginner","equipment":["dumbbells","bands","pullup_bar"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-6b5436e5:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-6b5436e5:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-6b5436e5","recovery":["mh-fuzz-6b5436e5:quality-recovery:1","mh-fuzz-6b5436e5:quality-recovery:2"],"fallback":"mh-fuzz-6b5436e5:quality-fallback:mixedHome:canonical-mixed-home-lane:d4:Beginner:\"long_with_anchor\""}

### Failed 238 — mixedHome #9335

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-f71d19e5:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-f71d19e5:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-f71d19e5","recovery":["mh-fuzz-f71d19e5:quality-recovery:1","mh-fuzz-f71d19e5:quality-recovery:2"],"fallback":"mh-fuzz-f71d19e5:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 239 — mixedHome #9338

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-d1c48dcf:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-d1c48dcf:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-d1c48dcf","recovery":["mh-fuzz-d1c48dcf:quality-recovery:1","mh-fuzz-d1c48dcf:quality-recovery:2"],"fallback":"mh-fuzz-d1c48dcf:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 240 — mixedHome #9341

- Input: `{"questionnaire":{"goals":"Improve posture","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-ac6a6574:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-ac6a6574:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-ac6a6574","recovery":["mh-fuzz-ac6a6574:quality-recovery:1","mh-fuzz-ac6a6574:quality-recovery:2"],"fallback":"mh-fuzz-ac6a6574:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 241 — mixedHome #9362

- Input: `{"questionnaire":{"goals":"Reduce pain","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-a6f76254:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-a6f76254:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-a6f76254","recovery":["mh-fuzz-a6f76254:quality-recovery:1","mh-fuzz-a6f76254:quality-recovery:2"],"fallback":"mh-fuzz-a6f76254:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 242 — mixedHome #9389

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-56d1cc9f:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-56d1cc9f:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-56d1cc9f","recovery":["mh-fuzz-56d1cc9f:quality-recovery:1","mh-fuzz-56d1cc9f:quality-recovery:2"],"fallback":"mh-fuzz-56d1cc9f:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 243 — mixedHome #9392

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":2}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-31783619:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-31783619:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-31783619","recovery":["mh-fuzz-31783619:quality-recovery:1","mh-fuzz-31783619:quality-recovery:2"],"fallback":"mh-fuzz-31783619:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}

### Failed 244 — mixedHome #9395

- Input: `{"questionnaire":{"goals":"Athletic performance","painAreas":["Lower back"],"experience":"Advanced","equipment":["dumbbells","bands","bench"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":3}`
- Blocked exercise: none
- Initial hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Recovery: [{"attempt":1,"seed":"mh-fuzz-c1e786a:quality-recovery:1","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]},{"attempt":2,"seed":"mh-fuzz-c1e786a:quality-recovery:2","codes":["MIXED_HOME_RANDOM_EQUIPMENT_MIX"]}]
- Fallback hard failures: MIXED_HOME_RANDOM_EQUIPMENT_MIX
- Final user-facing outcome: safe_generation_error
- Reproducible seeds: {"base":"mh-fuzz-c1e786a","recovery":["mh-fuzz-c1e786a:quality-recovery:1","mh-fuzz-c1e786a:quality-recovery:2"],"fallback":"mh-fuzz-c1e786a:quality-fallback:mixedHome:canonical-mixed-home-lane:d5:Advanced:\"long_with_anchor\""}
