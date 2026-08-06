# Program Quality V2 — Fuzz-Integrity Blind Samples

Uncurated deterministic sample for independent review. Includes every fallback case.

Blind total: 50
Fallback total: 3

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

### Blind 2 — gym #3

- Seed: `gym-fuzz-78dd9e19`
- Structural key: `gym||Beginner||2||3||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `cc32267f`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-rows, machine-lat-pulldown, dumbbell-rear-delt-fly, machine-pec-deck-press, doorway-pec-stretch
  - Day 2: wall-slides, wall-angel-hold, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry, chin-tucks
  - Day 3: ankle-mobility, glute-bridges, machine-leg-press, db-rdl, dumbbell-bulgarian-split-squat, plank, db-calf-raise, hamstring-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["gym"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 3 — gym #4

- Seed: `gym-fuzz-17157760`
- Structural key: `gym||Intermediate||2||3||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `54c0dcf5`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-bench-press, dumbbell-chest-fly, dumbbell-rows, machine-lat-pulldown, dumbbell-rear-delt-fly, cable-straight-arm-pulldown, doorway-pec-stretch
  - Day 2: wall-slides, wall-angel-hold, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, cable-upright-row, overhead-cable-triceps-extension, cable-biceps-curl, suitcase-carry, chin-tucks
  - Day 3: ankle-mobility, wall-angel-hold, machine-leg-press, db-rdl, dumbbell-reverse-lunge, machine-seated-hamstring-curl, hollow-body-hold, db-calf-raise, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["gym"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 4 — gym #7

- Seed: `gym-fuzz-f1bb3c33`
- Structural key: `gym||Intermediate||3||3||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `9c57ed1c`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, prone-ytw, barbell-bench-press-paused, dumbbell-chest-fly, cable-seated-row, cable-lat-pulldown, dumbbell-rear-delt-fly, cable-straight-arm-pulldown, doorway-pec-stretch
  - Day 2: wall-slides, scapular-pushups, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, cable-upright-row, overhead-cable-triceps-extension, cable-biceps-curl, farmers-carry, thread-the-needle
  - Day 3: ankle-mobility, dead-bug, machine-leg-press, db-rdl, dumbbell-reverse-lunge, machine-seated-hamstring-curl, cable-woodchop-standing, db-calf-raise, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["gym"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 5 — gym #8

- Seed: `gym-fuzz-8ff3c8ca`
- Structural key: `gym||Advanced||3||3||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `8ec5b9fd`
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Ordered exercise IDs:
  - Day 1: wall-slides, prone-ytw, barbell-bench-press-paused, dumbbell-chest-fly, cable-seated-row, cable-lat-pulldown, barbell-landmine-pulldown, dumbbell-rear-delt-fly, cable-straight-arm-pulldown, doorway-pec-stretch
  - Day 2: wall-slides, scapular-pushups, dumbbell-shoulder-press, cable-lateral-raise, cable-rear-delt-fly, cable-upright-row, overhead-cable-triceps-extension, cable-biceps-curl, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 3: ankle-mobility, dead-bug, machine-leg-press, db-rdl, dumbbell-bulgarian-split-squat, machine-seated-hamstring-curl, cable-woodchop-standing, db-calf-raise, machine-ab-crunch, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["gym"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 6 — gym #11

- Seed: `gym-fuzz-6a99ded5`
- Structural key: `gym||Advanced||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `6115bf36`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, scapular-pushups, dumbbell-floor-press, dumbbell-shoulder-press, dumbbell-bench-press, machine-shoulder-press, db-triceps-extension, machine-chest-press, cable-rear-delt-fly, thread-the-needle
  - Day 2: ankle-mobility, dead-bug, machine-leg-press, db-rdl, split-squat, bodyweight-squat, plank, hollow-body-hold, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: wall-slides, prone-ytw, dumbbell-rows, machine-lat-pulldown, machine-seated-row, single-arm-dumbbell-row, cable-biceps-curl, machine-rear-delt-row, cable-face-pull, thread-the-needle
  - Day 4: ankle-mobility, dead-bug, db-rdl, cossack-squat, bodyweight-good-morning, back-extension, hollow-body-hold, standing-calf-raise, single-leg-hip-thrust, suitcase-carry, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["gym"],"daysPerWeek":4},"phaseIndex":1}`

### Blind 7 — gym #12

- Seed: `gym-fuzz-8d1252c`
- Structural key: `gym||Beginner||2||4||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `fd20b79a`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, wall-angel-hold, dumbbell-floor-press, dumbbell-shoulder-press, db-triceps-extension, cable-rear-delt-fly, doorway-pec-stretch
  - Day 2: ankle-mobility, glute-bridges, dumbbell-step-up-loaded, db-rdl, side-plank-star, single-leg-calf-raise, hip-flexor-stretch
  - Day 3: wall-slides, wall-angel-hold, dumbbell-rows, machine-lat-pulldown, cable-biceps-curl, machine-rear-delt-row, doorway-pec-stretch
  - Day 4: ankle-mobility, glute-bridges, db-rdl, machine-leg-press, standing-calf-raise, farmers-carry, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["gym"],"daysPerWeek":4},"phaseIndex":2}`

### Blind 8 — gym #15

- Seed: `gym-fuzz-e3777867`
- Structural key: `gym||Beginner||3||4||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `16b273b7`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, scapular-pushups, dumbbell-incline-press, dumbbell-shoulder-press, bodyweight-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: ankle-mobility, glute-bridges, machine-leg-press, db-rdl, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: wall-slides, prone-ytw, dumbbell-rows, cable-lat-pulldown, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: ankle-mobility, glute-bridges, barbell-hip-thrust, dumbbell-step-up-loaded, suitcase-carry, standing-calf-raise, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["gym"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 9 — gym #16

- Seed: `gym-fuzz-81af956e`
- Structural key: `gym||Intermediate||3||4||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `635680b8`
- Day titles: Upper Push + Scapular Control | Lower (Squat Emphasis) + Core | Upper Pull + Thoracic Posture | Lower (Hinge Emphasis) + Carry/Anti-rotation
- Ordered exercise IDs:
  - Day 1: wall-slides, scapular-pushups, dumbbell-floor-press, dumbbell-arnold-press, dumbbell-incline-press, bodyweight-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: ankle-mobility, dead-bug, machine-leg-press, db-rdl, dumbbell-step-up-loaded, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: wall-slides, prone-ytw, dumbbell-chest-supported-row, machine-lat-pulldown, dumbbell-rows, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: ankle-mobility, dead-bug, dumbbell-sumo-rdl, barbell-back-squat, machine-glute-drive, suitcase-carry, standing-calf-raise, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["gym"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 10 — gym #19

- Seed: `gym-fuzz-5c55dd81`
- Structural key: `gym||Intermediate||1||5||General fitness||||gym|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `cb8b0178`
- Day titles: Upper Push | Lower Squat | Upper Pull | Lower Hinge + Posterior Chain | Arms + Posture + Conditioning
- Ordered exercise IDs:
  - Day 1: wall-slides, scapular-pushups, dumbbell-floor-press, dumbbell-shoulder-press, dumbbell-bench-press, db-triceps-extension, cable-rear-delt-fly, thread-the-needle
  - Day 2: ankle-mobility, dead-bug, machine-leg-press, db-rdl, split-squat, hollow-body-hold, standing-calf-raise, breathing-90-90
  - Day 3: wall-slides, prone-ytw, dumbbell-rows, machine-lat-pulldown, machine-seated-row, cable-biceps-curl, machine-rear-delt-row, thread-the-needle
  - Day 4: ankle-mobility, dead-bug, db-rdl, cossack-squat, back-extension, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 5: wall-slides, scapular-pushups, machine-seated-row, dumbbell-shoulder-press, dumbbell-rows, db-triceps-extension, cable-biceps-curl, thread-the-needle
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["gym"],"daysPerWeek":5},"phaseIndex":1}`

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

### Blind 12 — dumbbells #3

- Seed: `db-fuzz-78dd9e19`
- Structural key: `dumbbells||Beginner||2||3||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `8e4a8920`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, hip-flexor-stretch
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, hip-flexor-stretch
  - Day 3: ankle-mobility, glute-bridges, split-squat, pushup, dumbbell-rows, side-plank-star, single-leg-rdl, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 13 — dumbbells #4

- Seed: `db-fuzz-17157760`
- Structural key: `dumbbells||Intermediate||2||3||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `77f09cdf`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, db-biceps-curl, standing-calf-raise, hip-flexor-stretch
  - Day 2: wall-slides, wall-angel-hold, single-leg-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, single-arm-dumbbell-row, db-triceps-extension, hip-flexor-stretch
  - Day 3: ankle-mobility, wall-angel-hold, split-squat, pushup, dumbbell-pullover, db-rdl, farmers-carry, single-leg-rdl, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 14 — dumbbells #7

- Seed: `db-fuzz-f1bb3c33`
- Structural key: `dumbbells||Intermediate||3||3||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `031aca9a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, single-arm-dumbbell-row, db-triceps-extension, breathing-90-90
  - Day 3: ankle-mobility, dead-bug, split-squat, pushup, dumbbell-pullover, single-leg-rdl, suitcase-carry, dumbbell-sumo-rdl, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 15 — dumbbells #8

- Seed: `db-fuzz-8ff3c8ca`
- Structural key: `dumbbells||Advanced||3||3||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `362b412f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, single-arm-dumbbell-row, db-triceps-extension, breathing-90-90
  - Day 3: ankle-mobility, dead-bug, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, suitcase-carry, dumbbell-sumo-rdl, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 16 — dumbbells #11

- Seed: `db-fuzz-6a99ded5`
- Structural key: `dumbbells||Advanced||1||4||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `767f725f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, db-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, db-rdl, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-angel-hold, prone-ytw, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, hollow-body-hold, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":1}`

### Blind 17 — dumbbells #12

- Seed: `db-fuzz-8d1252c`
- Structural key: `dumbbells||Beginner||2||4||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `15ffeb2a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, hip-flexor-stretch
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-leg-rdl, standing-calf-raise, hip-flexor-stretch
  - Day 3: ankle-mobility, wall-angel-hold, split-squat, pushup, dumbbell-rows, db-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":2}`

### Blind 18 — dumbbells #15

- Seed: `db-fuzz-e3777867`
- Structural key: `dumbbells||Beginner||3||4||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `ee12cfa6`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-rows, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 19 — dumbbells #16

- Seed: `db-fuzz-81af956e`
- Structural key: `dumbbells||Intermediate||3||4||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `fc16763e`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, single-leg-rdl, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, heels-elevated-squat, db-biceps-curl, suitcase-carry, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 20 — dumbbells #19

- Seed: `db-fuzz-5c55dd81`
- Structural key: `dumbbells||Intermediate||1||5||General fitness||||dumbbells|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `4e942c94`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, prone-ytw, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, dumbbell-rows, reverse-snow-angel, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, pushup, dumbbell-pullover, db-rdl, db-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, heels-elevated-squat, db-rdl, farmers-carry, standing-calf-raise, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells"],"daysPerWeek":5},"phaseIndex":1}`

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

### Blind 22 — bands #3

- Seed: `band-fuzz-78dd9e19`
- Structural key: `bands||Beginner||2||3||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `4b94918c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, heels-elevated-squat, pushup, band-pull-apart, standing-calf-raise, towel-biceps-curl-hold, hip-flexor-stretch
  - Day 2: wall-slides, glute-bridges, single-leg-hip-thrust, split-squat, pike-pushup, side-plank-star, bodyweight-triceps-extension, hip-flexor-stretch
  - Day 3: ankle-mobility, glute-bridges, split-squat, close-grip-pushup, band-pull-apart, side-plank-star, supine-elbow-drive-row, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["bands"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 23 — bands #4

- Seed: `band-fuzz-17157760`
- Structural key: `bands||Intermediate||2||3||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `c6fb073a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, wall-angel-hold, heels-elevated-squat, pushup, band-pull-apart, single-leg-hip-thrust, standing-calf-raise, towel-biceps-curl-hold, hip-flexor-stretch
  - Day 2: wall-slides, wall-angel-hold, single-leg-glute-bridge-hold, split-squat, pike-pushup, band-pull-apart, side-plank-star, supine-elbow-drive-row, hip-flexor-stretch
  - Day 3: ankle-mobility, wall-angel-hold, split-squat, close-grip-pushup, band-pull-apart, single-leg-hip-thrust, side-plank-star, supine-elbow-drive-row, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["bands"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 24 — bands #7

- Seed: `band-fuzz-f1bb3c33`
- Structural key: `bands||Intermediate||3||3||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `60f7bd40`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, dead-bug, heels-elevated-squat, pushup, band-pull-apart, single-leg-hip-thrust, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, split-squat, pike-pushup, band-pull-apart, suitcase-hold-march, supine-elbow-drive-row, breathing-90-90
  - Day 3: ankle-mobility, dead-bug, split-squat, close-grip-pushup, band-pull-apart, single-leg-hip-thrust, suitcase-hold-march, supine-elbow-drive-row, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["bands"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 25 — bands #8

- Seed: `band-fuzz-8ff3c8ca`
- Structural key: `bands||Advanced||3||3||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `dd2ec01c`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, dead-bug, heels-elevated-squat, pushup, band-pull-apart, single-leg-hip-thrust, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, dead-bug, single-leg-glute-bridge-hold, split-squat, pike-pushup, band-pull-apart, suitcase-hold-march, supine-elbow-drive-row, breathing-90-90
  - Day 3: ankle-mobility, dead-bug, split-squat, close-grip-pushup, band-pull-apart, single-leg-hip-thrust, suitcase-hold-march, supine-elbow-drive-row, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["bands"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 26 — bands #11

- Seed: `band-fuzz-6a99ded5`
- Structural key: `bands||Advanced||1||4||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `e29d61d9`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, pushup, band-pull-apart, single-leg-hip-thrust, standing-calf-raise, hollow-body-hold, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, single-leg-glute-bridge-hold, split-squat, pike-pushup, band-pull-apart, standing-calf-raise, hollow-body-hold, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, close-grip-pushup, band-pull-apart, single-leg-hip-thrust, bodyweight-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-angel-hold, band-pull-aparts, band-pull-apart, heels-elevated-squat, towel-biceps-curl-hold, hollow-body-hold, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["bands"],"daysPerWeek":4},"phaseIndex":1}`

### Blind 27 — bands #12

- Seed: `band-fuzz-8d1252c`
- Structural key: `bands||Beginner||2||4||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `b37617cf`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, wall-angel-hold, heels-elevated-squat, pushup, band-pull-apart, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 2: wall-slides, wall-angel-hold, single-leg-hip-thrust, split-squat, pike-pushup, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 3: ankle-mobility, wall-angel-hold, split-squat, close-grip-pushup, band-pull-apart, bodyweight-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, band-pull-apart, heels-elevated-squat, towel-biceps-curl-hold, hip-flexor-stretch
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["bands"],"daysPerWeek":4},"phaseIndex":2}`

### Blind 28 — bands #15

- Seed: `band-fuzz-e3777867`
- Structural key: `bands||Beginner||3||4||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `0238211f`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, pushup, band-pull-apart, bodyweight-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, single-leg-hip-thrust, split-squat, pike-pushup, standing-calf-raise, suitcase-hold-march, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, close-grip-pushup, band-pull-apart, bodyweight-triceps-extension, suitcase-hold-march, breathing-90-90
  - Day 4: cat-cow, band-pull-aparts, band-pull-apart, heels-elevated-squat, towel-biceps-curl-hold, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["bands"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 29 — bands #16

- Seed: `band-fuzz-81af956e`
- Structural key: `bands||Intermediate||3||4||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `652c1eee`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, pushup, band-pull-apart, single-leg-hip-thrust, bodyweight-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, single-leg-glute-bridge-hold, split-squat, pike-pushup, band-pull-apart, standing-calf-raise, suitcase-hold-march, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, close-grip-pushup, band-pull-apart, single-leg-hip-thrust, bodyweight-triceps-extension, suitcase-hold-march, breathing-90-90
  - Day 4: cat-cow, band-pull-aparts, band-pull-apart, heels-elevated-squat, towel-biceps-curl-hold, suitcase-hold-march, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["bands"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 30 — bands #19

- Seed: `band-fuzz-5c55dd81`
- Structural key: `bands||Intermediate||1||5||General fitness||||bands|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `66dafc4b`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, pushup, band-pull-apart, single-leg-hip-thrust, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, single-leg-glute-bridge-hold, split-squat, pike-pushup, band-pull-apart, reverse-snow-angel, hollow-body-hold, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, split-squat, close-grip-pushup, band-pull-apart, single-leg-hip-thrust, bodyweight-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, pushup, band-pull-apart, bodyweight-triceps-extension, towel-biceps-curl-hold, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, heels-elevated-squat, single-leg-hip-thrust, standing-calf-raise, hollow-body-hold, breathing-90-90
- Capability limitations: none
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["bands"],"daysPerWeek":5},"phaseIndex":1}`

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

### Blind 32 — bodyweight #3

- Seed: `bw-fuzz-78dd9e19`
- Structural key: `bodyweight||Beginner||2||3||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `513f7d97`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, bodyweight-squat, pushup, plank, towel-biceps-curl-hold, standing-calf-raise, hip-flexor-stretch
  - Day 2: wall-slides, wall-angel-hold, bodyweight-good-morning, split-squat, pike-pushup, bodyweight-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 3: ankle-mobility, glute-bridges, cossack-squat, close-grip-pushup, prone-elbow-row, side-plank-star, supine-elbow-drive-row, hip-flexor-stretch
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["none"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 33 — bodyweight #4

- Seed: `bw-fuzz-17157760`
- Structural key: `bodyweight||Intermediate||2||3||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `c439e19d`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, wall-angel-hold, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, towel-biceps-curl-hold, standing-calf-raise, hip-flexor-stretch
  - Day 2: wall-slides, wall-angel-hold, bodyweight-good-morning, split-squat, pike-pushup, side-plank, supine-elbow-drive-row, side-plank-star, hip-flexor-stretch
  - Day 3: ankle-mobility, wall-angel-hold, cossack-squat, close-grip-pushup, prone-elbow-row, single-leg-hip-thrust, side-plank-star, supine-elbow-drive-row, hip-flexor-stretch
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["none"],"daysPerWeek":3},"phaseIndex":2}`

### Blind 34 — bodyweight #7

- Seed: `bw-fuzz-f1bb3c33`
- Structural key: `bodyweight||Intermediate||3||3||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `e8f17d3a`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, dead-bug, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, prone-ytw, bodyweight-good-morning, split-squat, pike-pushup, side-plank, supine-elbow-drive-row, suitcase-hold-march, breathing-90-90
  - Day 3: ankle-mobility, dead-bug, cossack-squat, close-grip-pushup, prone-elbow-row, single-leg-hip-thrust, suitcase-hold-march, supine-elbow-drive-row, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["none"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 35 — bodyweight #8

- Seed: `bw-fuzz-8ff3c8ca`
- Structural key: `bodyweight||Advanced||3||3||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `f114047d`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, dead-bug, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, split-squat, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, prone-ytw, bodyweight-good-morning, cossack-squat, pike-pushup, side-plank, supine-elbow-drive-row, suitcase-hold-march, breathing-90-90
  - Day 3: ankle-mobility, dead-bug, shrimp-squat, close-grip-pushup, prone-elbow-row, single-leg-hip-thrust, hollow-body-hold, suitcase-hold-march, reverse-snow-angel, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["none"],"daysPerWeek":3},"phaseIndex":3}`

### Blind 36 — bodyweight #11

- Seed: `bw-fuzz-6a99ded5`
- Structural key: `bodyweight||Advanced||1||4||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `56f27a8b`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, split-squat, standing-calf-raise, hollow-body-hold, breathing-90-90
  - Day 2: wall-slides, prone-ytw, bodyweight-good-morning, cossack-squat, pike-pushup, side-plank, standing-calf-raise, hollow-body-hold, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, shrimp-squat, close-grip-pushup, prone-elbow-row, single-leg-hip-thrust, hollow-body-hold, bodyweight-triceps-extension, side-plank-star, breathing-90-90
  - Day 4: wall-angel-hold, prone-ytw, back-widow, heels-elevated-squat, towel-biceps-curl-hold, hollow-body-hold, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["none"],"daysPerWeek":4},"phaseIndex":1}`

### Blind 37 — bodyweight #12

- Seed: `bw-fuzz-8d1252c`
- Structural key: `bodyweight||Beginner||2||4||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `c85c4bd6`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, wall-angel-hold, bodyweight-squat, pushup, plank, standing-calf-raise, side-plank-star, hip-flexor-stretch
  - Day 2: wall-slides, hip-hinge-drill, bodyweight-good-morning, split-squat, pike-pushup, single-leg-rdl, standing-calf-raise, hip-flexor-stretch
  - Day 3: ankle-mobility, wall-angel-hold, cossack-squat, close-grip-pushup, prone-elbow-row, bodyweight-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, back-widow, heels-elevated-squat, towel-biceps-curl-hold, hip-flexor-stretch
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["none"],"daysPerWeek":4},"phaseIndex":2}`

### Blind 38 — bodyweight #15

- Seed: `bw-fuzz-e3777867`
- Structural key: `bodyweight||Beginner||3||4||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `c1ee7ac6`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, bodyweight-squat, pushup, plank, bodyweight-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, bodyweight-good-morning, split-squat, pike-pushup, single-leg-rdl, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, cossack-squat, close-grip-pushup, prone-elbow-row, bodyweight-triceps-extension, suitcase-hold-march, breathing-90-90
  - Day 4: cat-cow, prone-ytw, back-widow, heels-elevated-squat, towel-biceps-curl-hold, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["none"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 39 — bodyweight #16

- Seed: `bw-fuzz-81af956e`
- Structural key: `bodyweight||Intermediate||3||4||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `ae03bbb4`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, bodyweight-triceps-extension, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, bodyweight-good-morning, split-squat, pike-pushup, side-plank, standing-calf-raise, suitcase-hold-march, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, cossack-squat, close-grip-pushup, prone-elbow-row, single-leg-hip-thrust, bodyweight-triceps-extension, suitcase-hold-march, breathing-90-90
  - Day 4: cat-cow, prone-ytw, back-widow, heels-elevated-squat, towel-biceps-curl-hold, suitcase-hold-march, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["none"],"daysPerWeek":4},"phaseIndex":3}`

### Blind 40 — bodyweight #19

- Seed: `bw-fuzz-5c55dd81`
- Structural key: `bodyweight||Intermediate||1||5||General fitness||||none|bandSetup:none||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `39e0ba2b`
- Day titles: Full Body A — Squat, Push and Trunk | Full Body B — Hinge, Single-Leg and Shoulder | Full Body C — Single-Leg, Push Variation and Back Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, bodyweight-squat, pushup, plank, single-leg-glute-bridge-hold, standing-calf-raise, towel-biceps-curl-hold, breathing-90-90
  - Day 2: wall-slides, prone-ytw, bodyweight-good-morning, split-squat, pike-pushup, side-plank, reverse-snow-angel, hollow-body-hold, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, cossack-squat, close-grip-pushup, prone-elbow-row, single-leg-hip-thrust, bodyweight-triceps-extension, hollow-body-hold, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, pushup, back-widow, bodyweight-triceps-extension, towel-biceps-curl-hold, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, heels-elevated-squat, bodyweight-good-morning, standing-calf-raise, hollow-body-hold, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["none"],"daysPerWeek":5},"phaseIndex":1}`

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

### Blind 42 — mixedHome #3

- Seed: `mh-fuzz-78dd9e19`
- Structural key: `mixedHome||Beginner||2||3||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `7b863fd9`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, hip-flexor-stretch
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, hip-flexor-stretch
  - Day 3: ankle-mobility, glute-bridges, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, side-plank-star, single-leg-rdl, hip-flexor-stretch
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":3,"bandSetup":"long_with_anchor"},"phaseIndex":2}`

### Blind 43 — mixedHome #4

- Seed: `mh-fuzz-17157760`
- Structural key: `mixedHome||Intermediate||2||3||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `5c14f1eb`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, db-biceps-curl, standing-calf-raise, hip-flexor-stretch
  - Day 2: wall-slides, wall-angel-hold, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, farmers-carry, hip-flexor-stretch
  - Day 3: ankle-mobility, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-rdl, side-plank-star, single-leg-rdl, hip-flexor-stretch
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells","bands"],"daysPerWeek":3,"bandSetup":"long_with_anchor"},"phaseIndex":2}`

### Blind 44 — mixedHome #7

- Seed: `mh-fuzz-f1bb3c33`
- Structural key: `mixedHome||Intermediate||3||3||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `c9c29f1d`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-rdl, suitcase-carry, dumbbell-sumo-rdl, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells","bands"],"daysPerWeek":3,"bandSetup":"long_with_anchor"},"phaseIndex":3}`

### Blind 45 — mixedHome #8

- Seed: `mh-fuzz-8ff3c8ca`
- Structural key: `mixedHome||Advanced||3||3||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `5aa390da`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, dead-bug, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, dumbbell-sumo-rdl, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, dead-bug, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-rdl, single-arm-dumbbell-row, suitcase-carry, dumbbell-sumo-rdl, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":3,"bandSetup":"long_with_anchor"},"phaseIndex":3}`

### Blind 46 — mixedHome #11

- Seed: `mh-fuzz-6a99ded5`
- Structural key: `mixedHome||Advanced||1||4||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `b8b3576a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, farmers-carry, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, db-rdl, farmers-carry, standing-calf-raise, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-rdl, single-arm-dumbbell-row, db-triceps-extension, band-woodchop, breathing-90-90
  - Day 4: wall-angel-hold, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, band-woodchop, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Advanced","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":1}`

### Blind 47 — mixedHome #12

- Seed: `mh-fuzz-8d1252c`
- Structural key: `mixedHome||Beginner||2||4||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `e6b148f1`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, wall-angel-hold, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, farmers-carry, hip-flexor-stretch
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-leg-rdl, standing-calf-raise, hip-flexor-stretch
  - Day 3: ankle-mobility, wall-angel-hold, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, side-plank-star, hip-flexor-stretch
  - Day 4: cat-cow, wall-angel-hold, single-arm-dumbbell-row, goblet-squat, single-arm-band-biceps-curl, hip-flexor-stretch
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":2}`

### Blind 48 — mixedHome #15

- Seed: `mh-fuzz-e3777867`
- Structural key: `mixedHome||Beginner||3||4||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `0fe8fa99`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, hip-hinge-drill, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Beginner","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":3}`

### Blind 49 — mixedHome #16

- Seed: `mh-fuzz-81af956e`
- Structural key: `mixedHome||Intermediate||3||4||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `5698b374`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-rdl, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, band-pull-aparts, single-arm-dumbbell-row, goblet-squat, db-biceps-curl, suitcase-carry, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells","bands"],"daysPerWeek":4,"bandSetup":"long_with_anchor"},"phaseIndex":3}`

### Blind 50 — mixedHome #19

- Seed: `mh-fuzz-5c55dd81`
- Structural key: `mixedHome||Intermediate||1||5||General fitness||||bands,dumbbells|long_with_anchor||blocks:none`
- Recovery: false
- Fallback: false
- Quality verdict: pass
- Semantic signature: `3061ea2a`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Upper Pattern Practice | Lower & Core Practice
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, standing-calf-raise, db-biceps-curl, breathing-90-90
  - Day 2: wall-slides, band-pull-aparts, db-rdl, dumbbell-reverse-lunge, dumbbell-shoulder-press, single-arm-dumbbell-row, face-pull, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, dumbbell-floor-press, band-lat-pulldown, db-rdl, db-triceps-extension, band-woodchop, breathing-90-90
  - Day 4: wall-slides, scapular-pushups, dumbbell-floor-press, single-arm-dumbbell-row, db-triceps-extension, db-biceps-curl, thread-the-needle
  - Day 5: ankle-mobility, glute-bridges, goblet-squat, db-rdl, farmers-carry, standing-calf-raise, breathing-90-90
- Capability limitations: QUALITY_CAPABILITY_LIMITATION_NOTE
- Input: `{"questionnaire":{"goals":"General fitness","painAreas":[],"experience":"Intermediate","equipment":["dumbbells","bands"],"daysPerWeek":5,"bandSetup":"long_with_anchor"},"phaseIndex":1}`

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

### Fallback 2 — dumbbells #0

- Seed: `db-fuzz-9e37e786`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `e325f8b5`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent
- Ordered exercise IDs:
  - Day 1: ankle-mobility, glute-bridges, goblet-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-biceps-curl, standing-calf-raise, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-reverse-lunge, dumbbell-shoulder-press, db-triceps-extension, farmers-carry, breathing-90-90
  - Day 3: ankle-mobility, glute-bridges, split-squat, pushup, dumbbell-rows, hollow-body-hold, single-leg-hip-thrust, breathing-90-90

### Fallback 3 — dumbbells #17

- Seed: `db-fuzz-1fe69194`
- Strategy: mode-template-fallback:dumbbells:canonical-dumbbell-abc
- Semantic signature: `90b52636`
- Day titles: Full Body A — Squat, Press and Row | Full Body B — Hinge, Overhead and Unilateral | Full Body C — Single-Leg, Press Variation and Lat Intent | Practice & Restore
- Ordered exercise IDs:
  - Day 1: ankle-mobility, scapular-pushups, heels-elevated-squat, dumbbell-floor-press, single-arm-dumbbell-row, db-rdl, dumbbell-reverse-lunge, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 2: wall-slides, prone-ytw, dumbbell-sumo-rdl, split-squat, dumbbell-shoulder-press, dumbbell-rows, single-leg-rdl, standing-calf-raise, suitcase-carry, breathing-90-90
  - Day 3: ankle-mobility, scapular-pushups, dumbbell-reverse-lunge, pushup, dumbbell-pullover, db-rdl, single-arm-dumbbell-row, db-triceps-extension, suitcase-carry, breathing-90-90
  - Day 4: cat-cow, prone-ytw, single-arm-dumbbell-row, bodyweight-squat, db-biceps-curl, suitcase-carry, breathing-90-90
