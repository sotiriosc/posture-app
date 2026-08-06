# Program Quality V2 — Fuzz-Integrity Blind Samples

Uncurated deterministic sample for independent review. Includes every fallback case.

Blind total: 50
Fallback total: 288

## Blind samples (10 per mode)

### Blind 1 — gym #0

- Seed: `gym-fuzz-9e37e786`
- Structural key: `gym||Beginner||1||3||General fitness||||gym|bandSetup:none||db-rdl`
- Recovery: true
- Fallback: true (mode-template-fallback:gym:canonical-gym-template)
- Quality verdict: fail
- Semantic signature: `7768303d`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, prone-ytw, machine-chest-press, machine-seated-row, machine-lat-pulldown, prone-y-raise, dumbbell-chest-fly, thread-the-needle
  - Day 2: wall-slides, scapular-pushups, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: ankle-mobility, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-step-up-loaded, plank, db-calf-raise, hamstring-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["gym"],"daysPerWeek":3},"phaseIndex":1,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`

### Blind 2 — gym #1007

- Seed: `gym-fuzz-fa6fd29f`
- Structural key: `gym||Advanced||3||3||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: true
- Fallback: true (mode-template-fallback:dumbbells:canonical-dumbbell-abc)
- Quality verdict: fail
- Semantic signature: `e325f8b5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, pushup, dumbbell-rows, hollow-body-hold, single-leg-hip-thrust, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":3},"phaseIndex":1,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`

### Blind 12 — dumbbells #1007

- Seed: `db-fuzz-fa6fd29f`
- Structural key: `dumbbells||Advanced||3||3||Improve posture||lower back||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `015e0570`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, band-woodchop, band-rdl, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":3,"bandSetup":"long_with_anchor"},"phaseIndex":1,"blockedExerciseIds":{"db-rdl":{"reason":"personal_preference","blockedAt":{"phase":"skill","sessionCount":3}}}}`

### Blind 42 — mixedHome #1007

- Seed: `mh-fuzz-fa6fd29f`
- Structural key: `mixedHome||Advanced||3||3||Improve posture||hips||bands,dumbbells,pullup_bar|long_no_anchor||blocks:none`
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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
- Recovery: false
- Fallback: false
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

### Fallback 1 — gym #0

- Seed: `gym-fuzz-9e37e786`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `7768303d`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, prone-ytw, machine-chest-press, machine-seated-row, machine-lat-pulldown, prone-y-raise, dumbbell-chest-fly, thread-the-needle
  - Day 2: wall-slides, scapular-pushups, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: ankle-mobility, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-step-up-loaded, plank, db-calf-raise, hamstring-stretch

### Fallback 2 — gym #136

- Seed: `gym-fuzz-abb0b409`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `0714be6b`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, machine-pec-deck-press, machine-seated-row, machine-lat-pulldown, machine-reverse-pec-deck, cable-face-pull, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, cable-lateral-raise, db-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-step-up-loaded, hollow-body-hold, db-calf-raise, thread-the-needle

### Fallback 3 — gym #408

- Seed: `gym-fuzz-c6a1ad68`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `1d617616`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, dead-bug, dumbbell-bench-press, dumbbell-rows, machine-lat-pulldown, cable-face-pull, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-bulgarian-split-squat, side-plank-star, single-leg-calf-raise, hamstring-stretch

### Fallback 4 — gym #884

- Seed: `gym-fuzz-f5c74522`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `b4ef7e5d`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, scapular-pushups, dumbbell-floor-press, dumbbell-shoulder-press, dumbbell-bench-press, machine-shoulder-press, db-triceps-extension, machine-chest-press, cable-rear-delt-fly, thread-the-needle
  - Day 2: ankle-mobility, dead-bug, dumbbell-reverse-lunge, back-extension-hold, split-squat, heels-elevated-squat, hollow-body-hold, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: wall-slides, prone-ytw, dumbbell-rows, machine-lat-pulldown, machine-seated-row, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, cable-face-pull, thread-the-needle
  - Day 4: ankle-mobility, dead-bug, machine-seated-hamstring-curl, dumbbell-reverse-lunge, back-extension-hold, back-extension, standing-calf-raise, single-leg-hip-thrust, suitcase-carry, breathing-90-90
  - Day 5: wall-slides, prone-ytw, machine-seated-row, dumbbell-shoulder-press, dumbbell-rows, machine-shoulder-press, machine-rear-delt-row, db-triceps-extension, cable-biceps-curl, thread-the-needle

### Fallback 5 — gym #1836

- Seed: `gym-fuzz-54146f09`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `e81a4cd6`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, machine-chest-press, machine-seated-row, machine-lat-pulldown, prone-y-raise, dumbbell-chest-fly, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, dumbbell-triceps-kickback, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, dumbbell-step-up-loaded, hollow-body-hold, db-calf-raise, thread-the-needle

### Fallback 6 — gym #2380

- Seed: `gym-fuzz-89f65acb`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `23788268`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, dumbbell-rear-delt-fly, cable-external-rotation-pressout, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, dumbbell-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-bulgarian-split-squat, hollow-body-hold, db-calf-raise, thread-the-needle

### Fallback 7 — gym #2516

- Seed: `gym-fuzz-976fee2a`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `af117491`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, dumbbell-rear-delt-fly, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-bulgarian-split-squat, hollow-body-hold, db-calf-raise, side-plank-star, thread-the-needle

### Fallback 8 — gym #3332

- Seed: `gym-fuzz-e843b536`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `063e9126`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, incline-pushup, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, back-extension-hold, cossack-squat, back-extension, side-plank, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, prone-ytw, dumbbell-rows, machine-lat-pulldown, machine-seated-row, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, machine-seated-hamstring-curl, dumbbell-reverse-lunge, back-extension, back-extension-hold, side-plank, standing-calf-raise, thread-the-needle

### Fallback 9 — gym #3672

- Seed: `gym-fuzz-9f0f579`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `5c2a0d64`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, dead-bug, machine-chest-press, machine-seated-row, machine-lat-pulldown, prone-y-raise, machine-reverse-pec-deck, thread-the-needle
  - Day 2: wall-slides, dead-bug, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry, thread-the-needle
  - Day 3: cat-cow, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-step-up-loaded, plank, db-calf-raise, hamstring-stretch

### Fallback 10 — gym #4080

- Seed: `gym-fuzz-325adcfb`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `e5e24851`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-rows, machine-lat-pulldown, cable-face-pull, machine-pec-deck-press, doorway-pec-stretch
  - Day 2: wall-slides, wall-angel-hold, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, chin-tucks
  - Day 3: ankle-mobility, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-bulgarian-split-squat, hollow-body-hold, single-leg-calf-raise, hamstring-stretch

### Fallback 11 — gym #4556

- Seed: `gym-fuzz-6181523c`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `1a20f1f9`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, incline-pushup, machine-shoulder-press, dumbbell-bench-press, dumbbell-floor-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, back-extension-hold, cossack-squat, heels-elevated-squat, side-plank, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, machine-seated-row, machine-lat-pulldown, dumbbell-rows, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, machine-seated-hamstring-curl, dumbbell-reverse-lunge, back-extension-hold, back-extension, side-plank, standing-calf-raise, thread-the-needle
  - Day 5: wall-slides, wall-angel-hold, machine-seated-row, machine-shoulder-press, dumbbell-rows, dumbbell-bench-press, db-triceps-extension, cable-biceps-curl, thread-the-needle

### Fallback 12 — gym #6188

- Seed: `gym-fuzz-328ff35`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `fdbd73ce`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, machine-pec-deck-press, machine-seated-row, machine-lat-pulldown, dumbbell-rows, dumbbell-rear-delt-fly, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, hammer-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-bulgarian-split-squat, plank, db-calf-raise, side-plank-star, thread-the-needle

### Fallback 13 — gym #7004

- Seed: `gym-fuzz-53fcb3b1`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `40dfdd81`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, incline-pushup, machine-shoulder-press, dumbbell-floor-press, dumbbell-bench-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, back-extension-hold, cossack-squat, back-extension, side-plank, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, machine-seated-row, machine-lat-pulldown, dumbbell-rows, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, machine-seated-hamstring-curl, dumbbell-reverse-lunge, back-extension, back-extension-hold, side-plank, standing-calf-raise, thread-the-needle

### Fallback 14 — gym #7344

- Seed: `gym-fuzz-75aa0acb`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `e65c3ec8`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, prone-ytw, machine-chest-press, machine-seated-row, machine-lat-pulldown, prone-y-raise, dumbbell-chest-fly, thread-the-needle
  - Day 2: wall-slides, scapular-pushups, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry, thread-the-needle
  - Day 3: ankle-mobility, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-step-up-loaded, hollow-body-hold, db-calf-raise, hamstring-stretch

### Fallback 15 — gym #7480

- Seed: `gym-fuzz-8323a64a`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `ba0b24f6`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, machine-pec-deck-press, machine-seated-row, machine-lat-pulldown, machine-reverse-pec-deck, cable-face-pull, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, dumbbell-lateral-raise, machine-reverse-pec-deck, cable-lateral-raise, db-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-step-up-loaded, plank, db-calf-raise, thread-the-needle

### Fallback 16 — gym #7752

- Seed: `gym-fuzz-9e14ef6d`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `3408e6df`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, dead-bug, dumbbell-bench-press, dumbbell-rows, machine-lat-pulldown, cable-face-pull, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, glute-bridges, machine-leg-press, dumbbell-reverse-lunge, dumbbell-bulgarian-split-squat, side-plank-star, single-leg-calf-raise, hamstring-stretch

### Fallback 17 — gym #8024

- Seed: `gym-fuzz-b905048c`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `a55e8002`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, dumbbell-rear-delt-fly, cable-external-rotation-pressout, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, dumbbell-rear-delt-fly, dumbbell-lateral-raise, db-triceps-extension, cable-biceps-curl, dumbbell-triceps-kickback, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-bulgarian-split-squat, machine-seated-hamstring-curl, dumbbell-reverse-lunge, plank, db-calf-raise, side-plank-star, thread-the-needle

### Fallback 18 — gym #8228

- Seed: `gym-fuzz-cd3a7baf`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `ca732cce`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, incline-pushup, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, back-extension-hold, cossack-squat, heels-elevated-squat, side-plank, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, prone-ytw, dumbbell-rows, machine-lat-pulldown, machine-seated-row, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, machine-seated-hamstring-curl, dumbbell-reverse-lunge, back-extension-hold, back-extension, side-plank, standing-calf-raise, thread-the-needle
  - Day 5: wall-slides, wall-angel-hold, dumbbell-rows, machine-shoulder-press, machine-seated-row, dumbbell-bench-press, db-triceps-extension, cable-biceps-curl, thread-the-needle

### Fallback 19 — gym #8840

- Seed: `gym-fuzz-9d9a860`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `1c09a338`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, machine-shoulder-press, dumbbell-bench-press, incline-pushup, db-triceps-extension, machine-rear-delt-row, thread-the-needle
  - Day 2: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, back-extension-hold, cossack-squat, back-extension, side-plank, standing-calf-raise, thread-the-needle
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, machine-seated-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, machine-seated-hamstring-curl, dumbbell-reverse-lunge, back-extension, back-extension-hold, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 20 — gym #9724

- Seed: `gym-fuzz-6169b984`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `0ffcf623`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, dumbbell-rear-delt-fly, cable-straight-arm-pulldown, doorway-pec-stretch
  - Day 2: wall-slides, wall-angel-hold, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, cable-upright-row, overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry, chin-tucks
  - Day 3: ankle-mobility, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-bulgarian-split-squat, plank, db-calf-raise, hip-flexor-stretch

### Fallback 21 — gym #9860

- Seed: `gym-fuzz-6ee21017`
- Strategy: mode-template-fallback:gym:canonical-gym-template
- Semantic signature: `1cb5b851`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, single-arm-dumbbell-row, dumbbell-rear-delt-fly, cable-external-rotation, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, machine-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, dumbbell-lateral-raise, dumbbell-triceps-kickback, cable-biceps-curl, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, machine-leg-press, dumbbell-reverse-lunge, machine-seated-hamstring-curl, dumbbell-bulgarian-split-squat, plank, db-calf-raise, side-plank-star, thread-the-needle

### Fallback 22 — dumbbells #0

- Seed: `db-fuzz-9e37e786`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `e325f8b5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, pushup, dumbbell-rows, hollow-body-hold, single-leg-hip-thrust, breathing-90-90

### Fallback 23 — dumbbells #17

- Seed: `db-fuzz-1fe69194`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `90b52636`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, suitcase-carry, breathing-90-90

### Fallback 24 — dumbbells #136

- Seed: `db-fuzz-abb0b409`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `61398b27`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, side-plank, cossack-squat, thread-the-needle

### Fallback 25 — dumbbells #153

- Seed: `db-fuzz-2d5f1925`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `3ed04dea`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, thread-the-needle

### Fallback 26 — dumbbells #289

- Seed: `db-fuzz-3ad7e055`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `6282b934`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, dumbbell-rear-delt-fly, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-hip-thrust, standing-calf-raise, side-plank, breathing-90-90

### Fallback 27 — dumbbells #425

- Seed: `db-fuzz-4850c8da`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5628495c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 28 — dumbbells #561

- Seed: `db-fuzz-55c9735b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `7e824ebd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, single-leg-rdl, standing-calf-raise, thread-the-needle

### Fallback 29 — dumbbells #697

- Seed: `db-fuzz-6341afdb`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `ba72d8db`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 30 — dumbbells #748

- Seed: `db-fuzz-e84fe292`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `2cf02d60`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, hollow-body-hold, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-bench-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, heels-elevated-squat, standing-calf-raise, hollow-body-hold, breathing-90-90

### Fallback 31 — dumbbells #765

- Seed: `db-fuzz-69fe7660`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `ee2b0938`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-leg-hip-thrust, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-rows, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, breathing-90-90

### Fallback 32 — dumbbells #833

- Seed: `db-fuzz-70ba0218`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `1a5b00fc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 33 — dumbbells #884

- Seed: `db-fuzz-f5c74522`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `1c59f9bd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, split-squat, pike-pushup, dumbbell-rows, reverse-snow-angel, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, dumbbell-pullover, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, heels-elevated-squat, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 34 — dumbbells #901

- Seed: `db-fuzz-7776b2d0`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `8f3b645a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 35 — dumbbells #969

- Seed: `db-fuzz-7e336699`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `f631ce36`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-sumo-rdl, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, dumbbell-sumo-rdl, standing-calf-raise, thread-the-needle

### Fallback 36 — dumbbells #1037

- Seed: `db-fuzz-84efef41`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `521c01d0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, prone-elbow-row, side-plank, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, breathing-90-90

### Fallback 37 — dumbbells #1105

- Seed: `db-fuzz-8bab3519`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `92888d27`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 2: cat-cow, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, farmers-carry, hip-flexor-stretch
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, hip-flexor-stretch

### Fallback 38 — dumbbells #1173

- Seed: `db-fuzz-926883de`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `98026f7e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-leg-rdl, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 39 — dumbbells #1224

- Seed: `db-fuzz-1775588c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `53201bd8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, bodyweight-triceps-extension, thread-the-needle

### Fallback 40 — dumbbells #1241

- Seed: `db-fuzz-9924fd9e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `f66d8a7b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 41 — dumbbells #1309

- Seed: `db-fuzz-9fe0285e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `f19b8dbe`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, back-widow, side-plank-star, hip-flexor-stretch
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, hip-flexor-stretch

### Fallback 42 — dumbbells #1445

- Seed: `db-fuzz-ad59f09f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `db63f79c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 43 — dumbbells #1496

- Seed: `db-fuzz-3266ae6f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `4e72efda`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-arm-dumbbell-row, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, hollow-body-hold, breathing-90-90

### Fallback 44 — dumbbells #1581

- Seed: `db-fuzz-bad2b91c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5f6d2bbc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, breathing-90-90

### Fallback 45 — dumbbells #1717

- Seed: `db-fuzz-c84a619c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `1228213e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, breathing-90-90

### Fallback 46 — dumbbells #1853

- Seed: `db-fuzz-d5c39a1d`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `a012c047`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, hip-flexor-stretch
  - Day 2: cat-cow, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, dumbbell-sumo-rdl, farmers-carry, standing-calf-raise, hip-flexor-stretch
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, single-leg-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, hip-flexor-stretch

### Fallback 47 — dumbbells #1972

- Seed: `db-fuzz-618c80a9`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `4f625353`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, single-arm-dumbbell-row, side-plank, cossack-squat, thread-the-needle

### Fallback 48 — dumbbells #1989

- Seed: `db-fuzz-e33b16dd`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `8a244548`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, thread-the-needle

### Fallback 49 — dumbbells #2108

- Seed: `db-fuzz-6f05e828`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `a5c20e2e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, split-squat, pike-pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, single-arm-dumbbell-row, side-plank, cossack-squat, thread-the-needle

### Fallback 50 — dumbbells #2125

- Seed: `db-fuzz-f0b46b5a`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `80da265f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 51 — dumbbells #2261

- Seed: `db-fuzz-fe2dbfdb`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `a7c6389a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-bench-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, breathing-90-90

### Fallback 52 — dumbbells #2397

- Seed: `db-fuzz-ba5ec5b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `52a5bb0c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, cossack-squat, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-rdl, standing-calf-raise, thread-the-needle

### Fallback 53 — dumbbells #2533

- Seed: `db-fuzz-191e9718`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `e84ef7a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-hip-thrust, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 54 — dumbbells #2601

- Seed: `db-fuzz-1fdafed0`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5c38f215`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 55 — dumbbells #2669

- Seed: `db-fuzz-26971299`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `7fc3ff6a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, back-widow, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, breathing-90-90

### Fallback 56 — dumbbells #2720

- Seed: `db-fuzz-aba4d9f5`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `b50133b1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, split-squat, pike-pushup, dumbbell-rows, reverse-snow-angel, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, single-arm-dumbbell-row, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, heels-elevated-squat, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 57 — dumbbells #2737

- Seed: `db-fuzz-2d53aa41`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `cc7c809f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, side-plank, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, single-arm-dumbbell-row, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 58 — dumbbells #2805

- Seed: `db-fuzz-340fee19`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `c7f3bb98`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-triceps-extension, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, seated-lat-sweep-pulse, breathing-90-90

### Fallback 59 — dumbbells #2873

- Seed: `db-fuzz-3acc17d6`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `7680b1d4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 60 — dumbbells #2941

- Seed: `db-fuzz-4188c196`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `bd1ecfb5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, hip-hinge-drill, bodyweight-squat, db-rdl, standing-calf-raise, suitcase-carry, breathing-90-90

### Fallback 61 — dumbbells #3009

- Seed: `db-fuzz-48449b66`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `4addd58c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 62 — dumbbells #3060

- Seed: `db-fuzz-cd52dc37`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `0bd5b6fa`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, bodyweight-triceps-extension, thread-the-needle

### Fallback 63 — dumbbells #3077

- Seed: `db-fuzz-4f016927`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `2adb1a2a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 64 — dumbbells #3145

- Seed: `db-fuzz-55bd2c97`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `2f2babd6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, reverse-snow-angel, db-biceps-curl, thread-the-needle

### Fallback 65 — dumbbells #3281

- Seed: `db-fuzz-63367c04`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `b13d12f8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-chest-fly, side-plank-star, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 66 — dumbbells #3332

- Seed: `db-fuzz-e843b536`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `19bf31d4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, pushup, dumbbell-pullover, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, side-plank-star, thread-the-needle

### Fallback 67 — dumbbells #3417

- Seed: `db-fuzz-70aeb594`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `461af602`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 68 — dumbbells #3553

- Seed: `db-fuzz-7e271565`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `486e7077`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, back-widow, side-plank-star, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, breathing-90-90

### Fallback 69 — dumbbells #3672

- Seed: `db-fuzz-9f0f579`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `e325f8b5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, pushup, dumbbell-rows, hollow-body-hold, single-leg-hip-thrust, breathing-90-90

### Fallback 70 — dumbbells #3689

- Seed: `db-fuzz-8ba09aea`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `eb1ef360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, breathing-90-90

### Fallback 71 — dumbbells #3808

- Seed: `db-fuzz-1769b5f8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5e171be7`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, side-plank, cossack-squat, thread-the-needle

### Fallback 72 — dumbbells #3825

- Seed: `db-fuzz-99182e4a`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `8bd08001`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, thread-the-needle

### Fallback 73 — dumbbells #3961

- Seed: `db-fuzz-a691fbcb`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `73a5c631`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, side-plank, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, prone-elbow-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-hip-thrust, standing-calf-raise, side-plank, breathing-90-90

### Fallback 74 — dumbbells #4097

- Seed: `db-fuzz-b40ab768`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `8f02f9b6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 75 — dumbbells #4233

- Seed: `db-fuzz-c18268e8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `aa5747aa`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-triceps-extension, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, seated-lat-sweep-pulse, hip-flexor-stretch

### Fallback 76 — dumbbells #4369

- Seed: `db-fuzz-cefb8189`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `1802d05b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 77 — dumbbells #4420

- Seed: `db-fuzz-5408d9bd`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `468d5188`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, hollow-body-hold, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, heels-elevated-squat, standing-calf-raise, hollow-body-hold, breathing-90-90

### Fallback 78 — dumbbells #4437

- Seed: `db-fuzz-d5b777c1`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `ee2b0938`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-leg-hip-thrust, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-rows, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, breathing-90-90

### Fallback 79 — dumbbells #4505

- Seed: `db-fuzz-dc732909`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `85bedd4f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 80 — dumbbells #4556

- Seed: `db-fuzz-6181523c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `b37bec8a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, split-squat, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, heels-elevated-squat, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 81 — dumbbells #4573

- Seed: `db-fuzz-e330ab4e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `0aec3558`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 82 — dumbbells #4641

- Seed: `db-fuzz-e9ec726e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `4bd78d9e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-glute-bridge-hold, standing-calf-raise, breathing-90-90

### Fallback 83 — dumbbells #4709

- Seed: `db-fuzz-f0a81e2e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5d0d790a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-rear-delt-fly, farmers-carry, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, breathing-90-90

### Fallback 84 — dumbbells #4777

- Seed: `db-fuzz-f765b6ef`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `53f23fa2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, db-biceps-curl, standing-calf-raise, hip-flexor-stretch
  - Day 2: cat-cow, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, farmers-carry, hip-flexor-stretch
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, hip-flexor-stretch

### Fallback 85 — dumbbells #4845

- Seed: `db-fuzz-fe216aaf`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `d7342717`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, side-plank-star, thread-the-needle
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 86 — dumbbells #4896

- Seed: `db-fuzz-832e51ff`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `be15264a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, bodyweight-triceps-extension, thread-the-needle

### Fallback 87 — dumbbells #4913

- Seed: `db-fuzz-4dde34f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `90df6ea0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 88 — dumbbells #4981

- Seed: `db-fuzz-b9a310c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `9ca38176`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, back-widow, side-plank-star, hip-flexor-stretch
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, standing-calf-raise, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, hip-flexor-stretch

### Fallback 89 — dumbbells #5032

- Seed: `db-fuzz-90a7e87e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `22bfe80e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 90 — dumbbells #5117

- Seed: `db-fuzz-1912f98c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `472b5788`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 91 — dumbbells #5168

- Seed: `db-fuzz-9e2080c1`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `2d3012de`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-step-up-loaded, pushup, dumbbell-pullover, single-arm-dumbbell-row, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, hollow-body-hold, breathing-90-90

### Fallback 92 — dumbbells #5253

- Seed: `db-fuzz-268ba02d`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `1005e515`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-triceps-extension, breathing-90-90
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, farmers-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, breathing-90-90

### Fallback 93 — dumbbells #5389

- Seed: `db-fuzz-340418aa`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `d8590870`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, suitcase-carry, breathing-90-90

### Fallback 94 — dumbbells #5508

- Seed: `db-fuzz-bfcd0238`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `3c3c008b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, glute-bridges, split-squat, pushup, dumbbell-rows, side-plank-star, single-leg-hip-thrust, thread-the-needle

### Fallback 95 — dumbbells #5525

- Seed: `db-fuzz-417c93ca`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `f55f5464`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, thread-the-needle

### Fallback 96 — dumbbells #5644

- Seed: `db-fuzz-cd46aebb`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `0a5ca84b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, dumbbell-rear-delt-fly, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, single-arm-dumbbell-row, side-plank, standing-calf-raise, thread-the-needle

### Fallback 97 — dumbbells #5661

- Seed: `db-fuzz-4ef5364b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `6a9d5f61`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, thread-the-needle

### Fallback 98 — dumbbells #5780

- Seed: `db-fuzz-dabfd0ba`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `17d57cb2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, split-squat, pike-pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, dumbbell-pullover, single-arm-dumbbell-row, side-plank, cossack-squat, thread-the-needle

### Fallback 99 — dumbbells #5797

- Seed: `db-fuzz-5c6e42a8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `b2c68dce`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 100 — dumbbells #5933

- Seed: `db-fuzz-69e6ad28`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `eb569b27`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, reverse-snow-angel, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 101 — dumbbells #6069

- Seed: `db-fuzz-775f1d89`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `9e197581`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, pike-pushup, cossack-squat, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-rdl, standing-calf-raise, thread-the-needle

### Fallback 102 — dumbbells #6205

- Seed: `db-fuzz-84d89406`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `604d777f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, dumbbell-chest-fly, side-plank-star, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-hip-thrust, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 103 — dumbbells #6256

- Seed: `db-fuzz-9e546c4`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `64fa066d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, side-plank-star, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, heels-elevated-squat, standing-calf-raise, side-plank-star, thread-the-needle

### Fallback 104 — dumbbells #6273

- Seed: `db-fuzz-8b94e876`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5c38f215`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 105 — dumbbells #6341

- Seed: `db-fuzz-925024b6`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `d534edb8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 106 — dumbbells #6392

- Seed: `db-fuzz-175de274`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `0b0b7c04`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, split-squat, pike-pushup, dumbbell-rows, reverse-snow-angel, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, single-arm-dumbbell-row, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, heels-elevated-squat, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 107 — dumbbells #6409

- Seed: `db-fuzz-990d90e7`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `2bf95b24`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, single-arm-dumbbell-row, single-leg-hip-thrust, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, thread-the-needle

### Fallback 108 — dumbbells #6477

- Seed: `db-fuzz-9fc9c327`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5e67eea5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, back-widow, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, seated-lat-sweep-pulse, breathing-90-90

### Fallback 109 — dumbbells #6545

- Seed: `db-fuzz-a6850977`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `a529f2a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 110 — dumbbells #6613

- Seed: `db-fuzz-ad42afb4`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5a91c846`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-bench-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, hip-hinge-drill, bodyweight-squat, db-rdl, standing-calf-raise, suitcase-carry, breathing-90-90

### Fallback 111 — dumbbells #6681

- Seed: `db-fuzz-b3fee604`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `8b798e99`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-triceps-extension, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 112 — dumbbells #6732

- Seed: `db-fuzz-390bad36`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `0369690a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, bodyweight-triceps-extension, thread-the-needle

### Fallback 113 — dumbbells #6749

- Seed: `db-fuzz-baba1244`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `15fda875`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 114 — dumbbells #6817

- Seed: `db-fuzz-c1763d74`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `41587525`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, side-plank-star, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, breathing-90-90

### Fallback 115 — dumbbells #6953

- Seed: `db-fuzz-ceef6ce5`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5c618687`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, thread-the-needle

### Fallback 116 — dumbbells #7004

- Seed: `db-fuzz-53fcb3b1`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `e08f0f56`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, side-plank-star, thread-the-needle

### Fallback 117 — dumbbells #7089

- Seed: `db-fuzz-dc68947a`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `e81e3f8b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-triceps-extension, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 118 — dumbbells #7225

- Seed: `db-fuzz-e9e007fa`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `b007d6ed`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 119 — dumbbells #7344

- Seed: `db-fuzz-75aa0acb`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `e325f8b5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, pushup, dumbbell-rows, hollow-body-hold, single-leg-hip-thrust, breathing-90-90

### Fallback 120 — dumbbells #7361

- Seed: `db-fuzz-f759637b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `90b52636`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, suitcase-carry, breathing-90-90

### Fallback 121 — dumbbells #7480

- Seed: `db-fuzz-8323a64a`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `8502f707`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, side-plank, cossack-squat, thread-the-needle

### Fallback 122 — dumbbells #7497

- Seed: `db-fuzz-4d23ef8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5673edd6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, thread-the-needle

### Fallback 123 — dumbbells #7633

- Seed: `db-fuzz-124af278`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `200e2ebd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, farmers-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, dumbbell-rear-delt-fly, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-hip-thrust, farmers-carry, standing-calf-raise, breathing-90-90

### Fallback 124 — dumbbells #7769

- Seed: `db-fuzz-1fc399f9`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5628495c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-bench-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 125 — dumbbells #7905

- Seed: `db-fuzz-2d3c017e`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `f7c29ffb`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 2: cat-cow, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, back-widow, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, seated-lat-sweep-pulse, hip-flexor-stretch

### Fallback 126 — dumbbells #7956

- Seed: `db-fuzz-b249d8cc`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `89c7bbeb`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, heels-elevated-squat, farmers-carry, thread-the-needle

### Fallback 127 — dumbbells #8041

- Seed: `db-fuzz-3ab4e8fe`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `7b26eefa`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-bench-press, single-arm-dumbbell-row, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 128 — dumbbells #8092

- Seed: `db-fuzz-bfc2af4f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `2cf02d60`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, hollow-body-hold, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-bench-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, heels-elevated-squat, standing-calf-raise, hollow-body-hold, breathing-90-90

### Fallback 129 — dumbbells #8109

- Seed: `db-fuzz-4171643f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `b4df9d02`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, side-plank, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 130 — dumbbells #8177

- Seed: `db-fuzz-482d307f`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `1a5b00fc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, single-leg-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 131 — dumbbells #8228

- Seed: `db-fuzz-cd3a7baf`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `7490b94b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, split-squat, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, dumbbell-pullover, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, heels-elevated-squat, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 132 — dumbbells #8245

- Seed: `db-fuzz-4ee985bf`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `8f3b645a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 133 — dumbbells #8313

- Seed: `db-fuzz-55a64bfc`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `2998ef06`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-glute-bridge-hold, standing-calf-raise, breathing-90-90

### Fallback 134 — dumbbells #8381

- Seed: `db-fuzz-5c622d3c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `d256397f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, prone-elbow-row, farmers-carry, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, split-squat, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, side-plank-star, breathing-90-90

### Fallback 135 — dumbbells #8449

- Seed: `db-fuzz-631ea77c`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `aaf88a64`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 136 — dumbbells #8517

- Seed: `db-fuzz-69db7ebd`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `eeaa26a2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-triceps-extension, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 137 — dumbbells #8568

- Seed: `db-fuzz-eee8bb41`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `53201bd8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, bodyweight-triceps-extension, thread-the-needle

### Fallback 138 — dumbbells #8585

- Seed: `db-fuzz-70971afd`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `f66d8a7b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-sumo-rdl, split-squat, pike-pushup, dumbbell-rows, single-leg-rdl, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, farmers-carry, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-step-up-loaded, standing-calf-raise, farmers-carry, thread-the-needle

### Fallback 139 — dumbbells #8653

- Seed: `db-fuzz-7753ca3d`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `f19b8dbe`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, back-widow, side-plank-star, hip-flexor-stretch
  - Day 2: cat-cow, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, hip-flexor-stretch

### Fallback 140 — dumbbells #8704

- Seed: `db-fuzz-fc6007d1`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `89fc97dd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, heels-elevated-squat, bodyweight-triceps-extension, db-biceps-curl, thread-the-needle

### Fallback 141 — dumbbells #8789

- Seed: `db-fuzz-84cce7ba`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `b62f3b6e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, farmers-carry, thread-the-needle

### Fallback 142 — dumbbells #8840

- Seed: `db-fuzz-9d9a860`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `19272771`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle
  - Day 2: wall-slides, prone-ytw, split-squat, pike-pushup, dumbbell-rows, standing-calf-raise, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, side-plank, thread-the-needle

### Fallback 143 — dumbbells #8925

- Seed: `db-fuzz-92459b3b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `461af602`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 144 — dumbbells #9061

- Seed: `db-fuzz-9fbd303b`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `1228213e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, dumbbell-chest-fly, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, breathing-90-90

### Fallback 145 — dumbbells #9180

- Seed: `db-fuzz-2b876b4a`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `3c3c008b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, glute-bridges, split-squat, pushup, dumbbell-rows, side-plank-star, single-leg-hip-thrust, thread-the-needle

### Fallback 146 — dumbbells #9197

- Seed: `db-fuzz-ad36f8b8`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `07d1ceac`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, farmers-carry, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, dead-bug, dumbbell-bulgarian-split-squat, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, dumbbell-chest-fly, side-plank-star, thread-the-needle
  - Day 4: cat-cow, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, db-triceps-extension, thread-the-needle

### Fallback 147 — dumbbells #9333

- Seed: `db-fuzz-baae4138`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `964dc0e1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, glute-bridges, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-glute-bridge-hold, standing-calf-raise, thread-the-needle

### Fallback 148 — dumbbells #9452

- Seed: `db-fuzz-4678caa5`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `a5c20e2e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, split-squat, pike-pushup, dumbbell-rows, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, dumbbell-pullover, single-arm-dumbbell-row, side-plank, cossack-squat, thread-the-needle

### Fallback 149 — dumbbells #9469

- Seed: `db-fuzz-c82769b9`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `80da265f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, pushup, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, pike-pushup, dumbbell-rows, reverse-snow-angel, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, dumbbell-floor-press, dumbbell-pullover, db-rdl, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 150 — dumbbells #9605

- Seed: `db-fuzz-d5a09206`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `1bbebd9a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, incline-pushup, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, prone-ytw, db-rdl, split-squat, pike-pushup, dumbbell-rows, db-rdl, reverse-snow-angel, side-plank, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, side-plank, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, bodyweight-squat, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, side-plank, thread-the-needle

### Fallback 151 — dumbbells #9741

- Seed: `db-fuzz-e3180eb6`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `3b4ac0b2`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-biceps-curl, suitcase-carry, breathing-90-90
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, bodyweight-squat, single-leg-glute-bridge-hold, standing-calf-raise, breathing-90-90

### Fallback 152 — dumbbells #9877

- Seed: `db-fuzz-f0916327`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `e84ef7a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, side-plank-star, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, split-squat, pushup, dumbbell-pullover, single-leg-hip-thrust, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, bodyweight-squat, single-leg-hip-thrust, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 153 — dumbbells #9928

- Seed: `db-fuzz-759ea467`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `a93c45c1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, farmers-carry, side-plank-star, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-pullover, db-triceps-extension, farmers-carry, thread-the-needle
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, heels-elevated-squat, standing-calf-raise, side-plank-star, thread-the-needle

### Fallback 154 — dumbbells #9945

- Seed: `db-fuzz-f74d11f7`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `5c38f215`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, thread-the-needle
  - Day 2: wall-slides, glute-bridges, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, side-plank-star, thread-the-needle
  - Day 3: cat-cow, dead-bug, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, thread-the-needle

### Fallback 155 — mixedHome #90

- Seed: `mh-fuzz-3db87c53`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 156 — mixedHome #117

- Seed: `mh-fuzz-ed92fa04`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 157 — mixedHome #136

- Seed: `mh-fuzz-abb0b409`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `4a8372fd`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, face-pull, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, band-woodchop, cossack-squat, thread-the-needle

### Fallback 158 — mixedHome #144

- Seed: `mh-fuzz-9d6b702a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 159 — mixedHome #263

- Seed: `mh-fuzz-293557bd`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `99686835`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 160 — mixedHome #266

- Seed: `mh-fuzz-3dbe840`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 161 — mixedHome #269

- Seed: `mh-fuzz-de82862c`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e01adf14`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 162 — mixedHome #290

- Seed: `mh-fuzz-d90f8d3c`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 163 — mixedHome #293

- Seed: `mh-fuzz-b3b572f3`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 164 — mixedHome #296

- Seed: `mh-fuzz-8e5ca005`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 165 — mixedHome #317

- Seed: `mh-fuzz-88e9a137`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3300607d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 166 — mixedHome #320

- Seed: `mh-fuzz-638ff57e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 167 — mixedHome #323

- Seed: `mh-fuzz-3e363a32`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 168 — mixedHome #495

- Seed: `mh-fuzz-8b7b4d8b`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `9f56ef71`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 169 — mixedHome #498

- Seed: `mh-fuzz-66225221`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e2484360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 170 — mixedHome #501

- Seed: `mh-fuzz-40c8e1de`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e316bd5c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 171 — mixedHome #522

- Seed: `mh-fuzz-3b55a7ce`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 172 — mixedHome #544

- Seed: `mh-fuzz-d41ac5cb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `8e21fab8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-rdl, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, face-pull, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-rdl, farmers-carry, cossack-squat, thread-the-needle

### Fallback 173 — mixedHome #549

- Seed: `mh-fuzz-eb2f9969`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 174 — mixedHome #587

- Seed: `mh-fuzz-676be5e7`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e90ab5ad`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 175 — mixedHome #593

- Seed: `mh-fuzz-1cb8400a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `007b2928`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 176 — mixedHome #614

- Seed: `mh-fuzz-17454f72`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `4e0b5161`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 177 — mixedHome #617

- Seed: `mh-fuzz-f1eb34a1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `938158a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 178 — mixedHome #620

- Seed: `mh-fuzz-cc92fecf`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f81becec`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 179 — mixedHome #641

- Seed: `mh-fuzz-c71feafd`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `b40d479b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 180 — mixedHome #647

- Seed: `mh-fuzz-7c6c7464`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `8be73c67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 181 — mixedHome #2207

- Seed: `mh-fuzz-9e7908d9`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3752909d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 182 — mixedHome #2210

- Seed: `mh-fuzz-79207a93`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 183 — mixedHome #2213

- Seed: `mh-fuzz-53c62300`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e01adf14`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 184 — mixedHome #2234

- Seed: `mh-fuzz-4e532218`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 185 — mixedHome #2237

- Seed: `mh-fuzz-28f9f1a7`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 186 — mixedHome #2240

- Seed: `mh-fuzz-3a045d1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 187 — mixedHome #2264

- Seed: `mh-fuzz-d8d377da`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 188 — mixedHome #2267

- Seed: `mh-fuzz-b37aaf66`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 189 — mixedHome #2439

- Seed: `mh-fuzz-bfdfb7`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `9f56ef71`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 190 — mixedHome #2442

- Seed: `mh-fuzz-db66977d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e2484360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 191 — mixedHome #2445

- Seed: `mh-fuzz-b60c0f22`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e316bd5c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 192 — mixedHome #2448

- Seed: `mh-fuzz-90b3b6f2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `0416201c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, pike-pushup, db-biceps-curl, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, dead-bug, goblet-squat, single-leg-hip-thrust, standing-calf-raise, thread-the-needle

### Fallback 193 — mixedHome #2466

- Seed: `mh-fuzz-b099042a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 194 — mixedHome #2493

- Seed: `mh-fuzz-6073ea2d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 195 — mixedHome #2531

- Seed: `mh-fuzz-dcaf460b`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e90ab5ad`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 196 — mixedHome #2537

- Seed: `mh-fuzz-91fce536`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `007b2928`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 197 — mixedHome #2558

- Seed: `mh-fuzz-8c89fcc6`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `4e0b5161`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 198 — mixedHome #2561

- Seed: `mh-fuzz-672fba4d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `938158a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 199 — mixedHome #2564

- Seed: `mh-fuzz-41d60ba3`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f81becec`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 200 — mixedHome #2585

- Seed: `mh-fuzz-3c637999`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `b40d479b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 201 — mixedHome #2591

- Seed: `mh-fuzz-f1b0d190`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `8be73c67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 202 — mixedHome #2682

- Seed: `mh-fuzz-2f684d63`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 203 — mixedHome #2709

- Seed: `mh-fuzz-df42e8f4`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 204 — mixedHome #2720

- Seed: `mh-fuzz-aba4d9f5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `2a663983`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, band-pull-aparts, single-leg-hip-thrust, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, face-pull, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-slides, band-pull-aparts, pushup, single-arm-dumbbell-row, pike-pushup, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, band-woodchop, thread-the-needle

### Fallback 205 — mixedHome #2736

- Seed: `mh-fuzz-8f1c827d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 206 — mixedHome #2855

- Seed: `mh-fuzz-1ae5844d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `99686835`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 207 — mixedHome #2858

- Seed: `mh-fuzz-f58cfe37`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 208 — mixedHome #2861

- Seed: `mh-fuzz-d032a8fc`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e01adf14`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 209 — mixedHome #2882

- Seed: `mh-fuzz-cabfbeec`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 210 — mixedHome #2885

- Seed: `mh-fuzz-a5654403`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 211 — mixedHome #2888

- Seed: `mh-fuzz-800cce75`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 212 — mixedHome #2909

- Seed: `mh-fuzz-7a993367`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3300607d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 213 — mixedHome #2912

- Seed: `mh-fuzz-553fe22e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 214 — mixedHome #2915

- Seed: `mh-fuzz-2fe60bc2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 215 — mixedHome #4383

- Seed: `mh-fuzz-76038123`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `c8c33eb6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 216 — mixedHome #4410

- Seed: `mh-fuzz-25dde916`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d8262349`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 217 — mixedHome #4475

- Seed: `mh-fuzz-51f3e34f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `cbde4aa4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 218 — mixedHome #4481

- Seed: `mh-fuzz-7408ba2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `614542df`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, db-triceps-extension, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 219 — mixedHome #4502

- Seed: `mh-fuzz-1cd89aa`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `85b88790`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 220 — mixedHome #4529

- Seed: `mh-fuzz-b1a7efb5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `ea176c52`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 221 — mixedHome #4532

- Seed: `mh-fuzz-8c4d4768`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `99ba1014`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, hip-flexor-stretch
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, standing-calf-raise, hip-flexor-stretch
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, face-pull, side-plank-star, hip-flexor-stretch

### Fallback 222 — mixedHome #4626

- Seed: `mh-fuzz-a4acde8f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 223 — mixedHome #4653

- Seed: `mh-fuzz-54861b48`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 224 — mixedHome #4680

- Seed: `mh-fuzz-4602119`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 225 — mixedHome #4799

- Seed: `mh-fuzz-902926e9`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3752909d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 226 — mixedHome #4802

- Seed: `mh-fuzz-6ad04903`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 227 — mixedHome #4805

- Seed: `mh-fuzz-4576d590`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e01adf14`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 228 — mixedHome #4826

- Seed: `mh-fuzz-4003cc68`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 229 — mixedHome #4829

- Seed: `mh-fuzz-1aa9e3d7`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 230 — mixedHome #4832

- Seed: `mh-fuzz-f55093c1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 231 — mixedHome #4853

- Seed: `mh-fuzz-efdd8dcb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `4b919b15`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 232 — mixedHome #4856

- Seed: `mh-fuzz-ca8305aa`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 233 — mixedHome #4859

- Seed: `mh-fuzz-a52a9916`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 234 — mixedHome #5031

- Seed: `mh-fuzz-f26f0d47`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `9f56ef71`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 235 — mixedHome #5032

- Seed: `mh-fuzz-90a7e87e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `53c46642`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-hip-thrust, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, pallof-press, thread-the-needle

### Fallback 236 — mixedHome #5034

- Seed: `mh-fuzz-cd16a12d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e2484360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 237 — mixedHome #5037

- Seed: `mh-fuzz-a7bc7ef2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e316bd5c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 238 — mixedHome #5058

- Seed: `mh-fuzz-a249769a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 239 — mixedHome #5085

- Seed: `mh-fuzz-5223f85d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 240 — mixedHome #6052

- Seed: `mh-fuzz-f5b0a3a5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `b0bc6af1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-rdl, db-biceps-curl, standing-calf-raise, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, band-rear-delt-fly, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-pull-apart, single-leg-rdl, farmers-carry, cossack-squat, thread-the-needle

### Fallback 241 — mixedHome #6570

- Seed: `mh-fuzz-19f08bcb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 242 — mixedHome #6597

- Seed: `mh-fuzz-c9caae2c`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 243 — mixedHome #6624

- Seed: `mh-fuzz-79a44435`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 244 — mixedHome #6664

- Seed: `mh-fuzz-324f7376`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `2d1000a6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, single-leg-rdl, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, pike-pushup, single-arm-dumbbell-row, face-pull, farmers-carry, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-rdl, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, pushup, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, dead-bug, goblet-squat, single-leg-rdl, farmers-carry, standing-calf-raise, thread-the-needle

### Fallback 245 — mixedHome #6743

- Seed: `mh-fuzz-56dcbb5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3752909d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 246 — mixedHome #6746

- Seed: `mh-fuzz-e014dbff`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `6a333704`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 247 — mixedHome #6770

- Seed: `mh-fuzz-b54711c4`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `28f3d689`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 248 — mixedHome #6773

- Seed: `mh-fuzz-8fee9e78`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `3e9c1ed0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 249 — mixedHome #6776

- Seed: `mh-fuzz-6a94143d`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f02a4196`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 250 — mixedHome #6797

- Seed: `mh-fuzz-65211f0f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `4b919b15`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 251 — mixedHome #6800

- Seed: `mh-fuzz-3fc7d886`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `5bb36634`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 252 — mixedHome #6803

- Seed: `mh-fuzz-1a6e4e3a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `06d72f8c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 253 — mixedHome #6975

- Seed: `mh-fuzz-67b470f4`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `c8c33eb6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 254 — mixedHome #7002

- Seed: `mh-fuzz-178dfb66`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d8262349`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 255 — mixedHome #7004

- Seed: `mh-fuzz-53fcb3b1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `b1cf01e0`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-step-up-loaded, pike-pushup, single-arm-dumbbell-row, face-pull, standing-calf-raise, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, face-pull, db-biceps-curl, thread-the-needle

### Fallback 256 — mixedHome #7029

- Seed: `mh-fuzz-c76705f1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d8262349`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, incline-pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 257 — mixedHome #7067

- Seed: `mh-fuzz-43a3917f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e90ab5ad`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 258 — mixedHome #7073

- Seed: `mh-fuzz-f8f055f2`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `007b2928`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 259 — mixedHome #7094

- Seed: `mh-fuzz-f37d5bfa`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `4e0b5161`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 260 — mixedHome #7097

- Seed: `mh-fuzz-ce24dbbe`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `938158a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 261 — mixedHome #7100

- Seed: `mh-fuzz-a8ca2a67`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f81becec`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 262 — mixedHome #7121

- Seed: `mh-fuzz-a357dd65`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `b40d479b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 263 — mixedHome #7127

- Seed: `mh-fuzz-58a400fc`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `8be73c67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 264 — mixedHome #7218

- Seed: `mh-fuzz-965c0c1f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 265 — mixedHome #7245

- Seed: `mh-fuzz-463629d8`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 266 — mixedHome #7272

- Seed: `mh-fuzz-f610b389`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 267 — mixedHome #8919

- Seed: `mh-fuzz-dcf8f3a0`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `9f56ef71`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 268 — mixedHome #8922

- Seed: `mh-fuzz-b79e2bf5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e2484360`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, pallof-press, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 269 — mixedHome #8946

- Seed: `mh-fuzz-8cd289d1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 270 — mixedHome #8973

- Seed: `mh-fuzz-3cabe605`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7f81e6dc`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 271 — mixedHome #9011

- Seed: `mh-fuzz-b8e75213`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e90ab5ad`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 272 — mixedHome #9017

- Seed: `mh-fuzz-6e34ab2e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `007b2928`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 273 — mixedHome #9038

- Seed: `mh-fuzz-68c1a85e`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `4e0b5161`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 274 — mixedHome #9041

- Seed: `mh-fuzz-43686eda`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `938158a4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 275 — mixedHome #9044

- Seed: `mh-fuzz-1e0e84cb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `f81becec`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 276 — mixedHome #9065

- Seed: `mh-fuzz-189b8ed1`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `b40d479b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 277 — mixedHome #9071

- Seed: `mh-fuzz-cde8bd98`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `8be73c67`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, glute-bridges, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 278 — mixedHome #9162

- Seed: `mh-fuzz-ba0b9fb`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 279 — mixedHome #9180

- Seed: `mh-fuzz-2b876b4a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `487310fb`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, band-pull-aparts, single-leg-hip-thrust, dumbbell-reverse-lunge, pike-pushup, face-pull, db-triceps-extension, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, band-woodchop, band-rdl, thread-the-needle

### Fallback 280 — mixedHome #9189

- Seed: `mh-fuzz-bb7a337c`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `1a4eb132`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, band-pull-aparts, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, band-pull-aparts, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 281 — mixedHome #9216

- Seed: `mh-fuzz-6b5436e5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `d22dd352`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, pushup, single-arm-dumbbell-row, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 2: wall-slides, dead-bug, db-rdl, dumbbell-reverse-lunge, pike-pushup, standing-calf-raise, band-woodchop, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, band-woodchop, thread-the-needle
  - Day 4: wall-angel-hold, dead-bug, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, thread-the-needle

### Fallback 282 — mixedHome #9335

- Seed: `mh-fuzz-f71d19e5`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7245d834`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 283 — mixedHome #9338

- Seed: `mh-fuzz-d1c48dcf`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `c9955335`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 284 — mixedHome #9341

- Seed: `mh-fuzz-ac6a6574`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `4a0eb7af`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, thread-the-needle
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, db-triceps-extension, pallof-press, thread-the-needle
  - Day 3: cat-cow, wall-angel-hold, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, thread-the-needle
  - Day 4: wall-slides, wall-angel-hold, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, thread-the-needle

### Fallback 285 — mixedHome #9362

- Seed: `mh-fuzz-a6f76254`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `7c5c99e8`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: cat-cow, dead-bug, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: cat-cow, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, face-pull, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 286 — mixedHome #9389

- Seed: `mh-fuzz-56d1cc9f`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `e14b8bd4`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-step-up-loaded, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-reverse-lunge, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 287 — mixedHome #9392

- Seed: `mh-fuzz-31783619`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `9816b247`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90

### Fallback 288 — mixedHome #9395

- Seed: `mh-fuzz-c1e786a`
- Strategy: mode-template-fallback:mixedHome:canonical-mixed-home-lane
- Semantic signature: `303bcdb5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: cat-cow, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-hip-thrust, dumbbell-bulgarian-split-squat, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, db-triceps-extension, pallof-press, breathing-90-90
  - Day 3: cat-cow, dead-bug, dumbbell-step-up-loaded, dumbbell-chest-fly, band-lat-pulldown, single-leg-hip-thrust, single-arm-dumbbell-row, dumbbell-bench-press, pallof-press, breathing-90-90
  - Day 4: wall-slides, dead-bug, dumbbell-floor-press, single-arm-dumbbell-row, dumbbell-shoulder-press, db-biceps-curl, db-triceps-extension, thread-the-needle
  - Day 5: cat-cow, hip-hinge-drill, goblet-squat, single-leg-hip-thrust, dumbbell-reverse-lunge, standing-calf-raise, pallof-press, breathing-90-90
