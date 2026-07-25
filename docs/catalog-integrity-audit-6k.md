# Catalog Integrity Audit — Phase 6k Commit 1

Audited: **225** exercises (includes deprecated).

| Verdict | Count |
|---|---|
| PASS | 220 |
| FAIL | 0 |
| NEEDS_REVIEW | 5 |

Checks: **1.a** timing · **1.b** coach notes · **1.c** difficulty · **1.d** pattern · **1.e** contraindications · **1.f** cues · **1.g** demo reference.

Commit 5 applies Sotirios's coaching rulings on every `NEEDS_REVIEW` item below. Structural `FAIL`s must be cleared before/with Commit 1's fix pass.

## FAIL — none

## NEEDS_REVIEW — Sotirios coaching rulings

Reply with a ruling per id (e.g. `wall-slides: timed, 30-45 sec` or `wall-slides: reps, 8-10`).

### `cat-cow` — Cat-Cow Flow

- Category: warmup · loadType: bodyweight · dose: `6-8 reps` · pattern: `—` · difficulty: —
- **1.a**: Postural corrective / mobility flow — confirm whether prescription should be rep-based or timed → _Sotirios ruling: choose loadType + durationOrReps; align warmupLibrary/program makeItem._

### `wall-slides` — Wall Slides

- Category: warmup · loadType: bodyweight · dose: `8-10 reps` · pattern: `—` · difficulty: —
- **1.a**: Postural corrective / mobility flow — confirm whether prescription should be rep-based or timed → _Sotirios ruling: choose loadType + durationOrReps; align warmupLibrary/program makeItem._

### `hip-flexor-stretch` — Hip Flexor Stretch

- Category: cooldown · loadType: timed · dose: `30 sec per side` · pattern: `—` · difficulty: —
- **1.a**: Known dual-source timing risk (catalog timed / "30 sec per side" vs warmup/program durationSec) → _Confirm single source of truth for session prescription (reps vs timed hold)._

### `thread-the-needle` — Thread-the-Needle

- Category: cooldown · loadType: bodyweight · dose: `5-6 per side` · pattern: `—` · difficulty: —
- **1.a**: Postural corrective / mobility flow — confirm whether prescription should be rep-based or timed → _Sotirios ruling: choose loadType + durationOrReps; align warmupLibrary/program makeItem._

### `reverse-snow-angel` — Reverse Snow Angels

- Category: main · loadType: bodyweight · dose: `8-12 reps` · pattern: `horizontal_pull` · difficulty: 2
- **1.a**: Postural corrective / mobility flow — confirm whether prescription should be rep-based or timed → _Sotirios ruling: choose loadType + durationOrReps; align warmupLibrary/program makeItem._

## Full roster

| id | name | verdict | issues |
|---|---|---|---|
| `cat-cow` | Cat-Cow Flow | NEEDS_REVIEW | 1.a:review |
| `wall-slides` | Wall Slides | NEEDS_REVIEW | 1.a:review |
| `foam-roll-upper-back` | Foam Roll Upper Back | PASS | — |
| `glute-bridges` | Glute Bridges | PASS | — |
| `band-pull-aparts` | Band Pull-Aparts | PASS | — |
| `scapular-pushups` | Scapular Push-Ups | PASS | — |
| `dead-bug` | Dead Bug | PASS | — |
| `standing-brace-march` | Standing Brace March | PASS | — |
| `wall-supported-carry-march` | Wall Supported Carry March | PASS | — |
| `band-offset-march-hold` | Band Offset March Hold | PASS | — |
| `dumbbell-rows` | Dumbbell Rows | PASS | — |
| `single-arm-dumbbell-row` | Single-Arm Dumbbell Row | PASS | — |
| `dumbbell-row-iso-hold` | Dumbbell Row Iso Hold | PASS | — |
| `prone-ytw` | Prone Y-T-W Raises | PASS | — |
| `split-stance-row` | Split Stance Row | PASS | — |
| `dumbbell-bench-press` | Dumbbell Bench Press | PASS | — |
| `dumbbell-floor-press` | Dumbbell Floor Press | PASS | — |
| `dumbbell-chest-fly` | Dumbbell Chest Fly | PASS | — |
| `dumbbell-lateral-raise` | Dumbbell Lateral Raise | PASS | — |
| `dumbbell-shoulder-press` | Dumbbell Shoulder Press | PASS | — |
| `incline-pushup` | Incline Push-Up | PASS | — |
| `hip-flexor-stretch` | Hip Flexor Stretch | NEEDS_REVIEW | 1.a:review |
| `thread-the-needle` | Thread-the-Needle | NEEDS_REVIEW | 1.a:review |
| `chin-tucks` | Chin Tucks | PASS | — |
| `doorway-pec-stretch` | Doorway Pec Stretch | PASS | — |
| `thoracic-rotation` | Thoracic Rotation | PASS | — |
| `wall-angel-hold` | Wall Angel Hold | PASS | — |
| `pallof-press` | Pallof Press | PASS | — |
| `bird-dog` | Bird Dog | PASS | — |
| `face-pull` | Face Pull | PASS | — |
| `band-face-pull-high-anchor` | Band Face Pull (High Anchor) | PASS | — |
| `hamstring-stretch` | Hamstring Stretch | PASS | — |
| `banded-rows-seated` | Seated Band Row | PASS | — |
| `side-lying-open-book` | Side-Lying Open Book | PASS | — |
| `ankle-mobility` | Ankle Mobility Rocks | PASS | — |
| `banded-lat-stretch` | Banded Lat Stretch | PASS | — |
| `breathing-90-90` | 90/90 Breathing | PASS | — |
| `bodyweight-squat` | Bodyweight Squat | PASS | — |
| `goblet-squat` | Goblet Squat | PASS | — |
| `split-squat` | Split Squat | PASS | — |
| `dumbbell-reverse-lunge` | Dumbbell Reverse Lunge | PASS | — |
| `dumbbell-bulgarian-split-squat` | Dumbbell Bulgarian Split Squat | PASS | — |
| `hip-hinge-drill` | Hip Hinge Drill | PASS | — |
| `bodyweight-good-morning` | Bodyweight Good Morning | PASS | — |
| `db-rdl` | Dumbbell Romanian Deadlift | PASS | — |
| `back-extension` | Back Extension | PASS | — |
| `back-extension-hold` | Back Extension Hold | PASS | — |
| `single-leg-rdl` | Single-Leg RDL (Bodyweight) | PASS | — |
| `pushup` | Push-Up | PASS | — |
| `close-grip-pushup` | Close-Grip Push-Up | PASS | — |
| `tempo-pushup` | Tempo Push-Up | PASS | — |
| `pike-pushup` | Pike Push-Up | PASS | — |
| `feet-elevated-pushup` | Feet-Elevated Push-Up | PASS | — |
| `archer-pushup` | Archer Push-Up | PASS | — |
| `pseudo-planche-pushup` | Pseudo Planche Push-Up | PASS | — |
| `cossack-squat` | Cossack Squat | PASS | — |
| `shrimp-squat` | Shrimp Squat | PASS | — |
| `single-leg-hip-thrust` | Single-Leg Hip Thrust | PASS | — |
| `hollow-body-hold` | Hollow Body Hold | PASS | — |
| `side-plank-star` | Side Plank Star | PASS | — |
| `prone-swimmer` | Prone Swimmer | PASS | — |
| `back-widow` | Back Widow Pulls | PASS | — |
| `heels-elevated-squat` | Heels-Elevated Tempo Squat | PASS | — |
| `single-leg-glute-bridge-hold` | Single-Leg Glute Bridge Hold | PASS | — |
| `reverse-snow-angel` | Reverse Snow Angels | NEEDS_REVIEW | 1.a:review |
| `plank` | Plank | PASS | — |
| `band-chest-press` | Band Chest Press | PASS | — |
| `band-chest-fly` | Band Chest Fly | PASS | — |
| `split-stance-band-chest-press` | Split Stance Band Chest Press | PASS | — |
| `tall-kneeling-band-chest-press` | Tall Kneeling Band Chest Press | PASS | — |
| `band-chest-press-iso-hold` | Band Chest Press Iso Hold | PASS | — |
| `band-overhead-press` | Band Overhead Press | PASS | — |
| `band-lateral-raise` | Band Lateral Raise | PASS | — |
| `band-lat-pulldown` | Band Lat Pulldown | PASS | — |
| `band-lat-pulldown-kneeling` | Band Lat Pulldown (Kneeling) | PASS | — |
| `tall-kneeling-band-lat-pulldown` | Tall Kneeling Band Lat Pulldown | PASS | — |
| `standing-band-lat-pulldown` | Standing Band Lat Pulldown | PASS | — |
| `band-lat-pulldown-neutral-grip` | Band Lat Pulldown (Neutral Grip) | PASS | — |
| `band-lat-pulldown-wide-grip` | Band Lat Pulldown (Wide Grip) | PASS | — |
| `band-lat-pulldown-iso-hold` | Band Lat Pulldown Iso Hold | PASS | — |
| `band-straight-arm-pulldown` | Band Straight-Arm Pulldown | PASS | — |
| `band-rdl` | Band Romanian Deadlift | PASS | — |
| `band-front-squat` | Band Front Squat | PASS | — |
| `band-woodchop` | Band Woodchop | PASS | — |
| `band-row` | Band Row | PASS | — |
| `single-arm-band-row` | Single-Arm Band Row | PASS | — |
| `band-row-iso-hold` | Band Row Iso Hold | PASS | — |
| `db-biceps-curl` | Dumbbell Biceps Curl | PASS | — |
| `hammer-curl` | Hammer Curl | PASS | — |
| `cable-biceps-curl` | Cable Biceps Curl | PASS | — |
| `band-biceps-curl` | Band Biceps Curl | PASS | — |
| `single-arm-band-biceps-curl` | Single-Arm Band Biceps Curl | PASS | — |
| `towel-biceps-curl-hold` | Towel Biceps Curl Hold | PASS | — |
| `self-resisted-biceps-curl` | Self-Resisted Biceps Curl | PASS | — |
| `db-triceps-extension` | Dumbbell Triceps Extension | PASS | — |
| `dumbbell-triceps-kickback` | Dumbbell Triceps Kickback | PASS | — |
| `band-triceps-pressdown` | Band Triceps Pressdown | PASS | — |
| `band-overhead-triceps-extension` | Band Overhead Triceps Extension | PASS | — |
| `overhead-cable-triceps-extension` | Overhead Cable Triceps Extension | PASS | — |
| `bodyweight-triceps-extension` | Bodyweight Triceps Extension | PASS | — |
| `self-resisted-triceps-extension` | Self-Resisted Triceps Extension | PASS | — |
| `standing-calf-raise` | Standing Calf Raise | PASS | — |
| `single-leg-calf-raise` | Single-Leg Calf Raise | PASS | — |
| `band-calf-raise` | Band Calf Raise | PASS | — |
| `db-calf-raise` | Dumbbell Calf Raise | PASS | — |
| `farmers-carry` | Farmer's Carry | PASS | — |
| `suitcase-carry` | Suitcase Carry | PASS | — |
| `band-suitcase-march` | Band Suitcase March | PASS | — |
| `suitcase-hold-march` | Suitcase Hold March | PASS | — |
| `side-plank` | Side Plank | PASS | — |
| `suspension-row-upright` | Suspension Row (Upright) | PASS | — |
| `suspension-row-incline` | Suspension Row (Incline) | PASS | — |
| `suspension-row-parallel` | Suspension Row (Parallel) | PASS | — |
| `suspension-row-feet-elevated` | Suspension Row (Feet Elevated) | PASS | — |
| `suspension-archer-row` | Suspension Archer Row | PASS | — |
| `suspension-one-arm-row-assisted` | Suspension One-Arm Row (Assisted) | PASS | — |
| `suspension-rear-delt-row` | Suspension Rear Delt Row | PASS | — |
| `suspension-face-pull` | Suspension Face Pull | PASS | — |
| `scap-pullup` | Scap Pull-Up | PASS | — |
| `band-assisted-pullup` | Band-Assisted Pull-Up | PASS | — |
| `neutral-grip-pullup` | Neutral-Grip Pull-Up | PASS | — |
| `pullup` | Pull-Up | PASS | — |
| `chinup-strict` | Chin-Up (Strict) | PASS | — |
| `chest-to-bar-pullup` | Chest-to-Bar Pull-Up | PASS | — |
| `weighted-pullup` | Weighted Pull-Up | PASS | — |
| `pullup-isometric-top-hold` | Pull-Up Isometric Top Hold | PASS | — |
| `prone-lat-sweep` | Prone Lat Sweep | PASS | — |
| `kneeling-prayer-lat-pulldown` | Kneeling Prayer Lat Pulldown | PASS | — |
| `supine-lat-pulldown-isometric` | Supine Lat Pulldown Isometric | PASS | — |
| `wall-pushup` | Wall Push-Up | PASS | — |
| `countertop-pushup` | Countertop Push-Up | PASS | — |
| `suspension-pushup-upright` | Suspension Push-Up (Upright) | PASS | — |
| `suspension-pushup-incline` | Suspension Push-Up (Incline) | PASS | — |
| `suspension-pushup-parallel` | Suspension Push-Up (Parallel) | PASS | — |
| `suspension-pushup-feet-elevated` | Suspension Push-Up (Feet Elevated) | PASS | — |
| `suspension-archer-pushup` | Suspension Archer Push-Up | PASS | — |
| `suspension-chest-fly` | Suspension Chest Fly | PASS | — |
| `suspension-pike-press-upright` | Suspension Pike Press (Upright) | PASS | — |
| `suspension-pike-press-incline` | Suspension Pike Press (Incline) | PASS | — |
| `suspension-pike-press-deep` | Suspension Pike Press (Deep) | PASS | — |
| `wall-handstand-hold` | Wall Handstand Hold | PASS | — |
| `wall-handstand-negative` | Wall Handstand Negative | PASS | — |
| `wall-assisted-handstand-pushup` | Wall-Assisted Handstand Push-Up | PASS | — |
| `assisted-box-squat` | Assisted Box Squat | PASS | — |
| `assisted-split-squat` | Assisted Split Squat | PASS | — |
| `assisted-reverse-lunge` | Assisted Reverse Lunge | PASS | — |
| `assisted-step-up` | Assisted Step-Up | PASS | — |
| `assisted-cossack-squat` | Assisted Cossack Squat | PASS | — |
| `assisted-shrimp-squat` | Assisted Shrimp Squat | PASS | — |
| `assisted-skater-squat` | Assisted Skater Squat | PASS | — |
| `assisted-pistol-squat` | Assisted Pistol Squat | PASS | — |
| `assisted-hip-hinge` | Assisted Hip Hinge | PASS | — |
| `assisted-good-morning` | Assisted Good Morning | PASS | — |
| `assisted-single-leg-rdl` | Assisted Single-Leg RDL | PASS | — |
| `assisted-hip-thrust` | Assisted Hip Thrust | PASS | — |
| `assisted-single-leg-hip-thrust` | Assisted Single-Leg Hip Thrust | PASS | — |
| `assisted-hamstring-curl` | Assisted Hamstring Curl | PASS | — |
| `assisted-back-extension-hold` | Assisted Back Extension Hold | PASS | — |
| `assisted-nordic-eccentric` | Assisted Nordic Eccentric | PASS | — |
| `hanging-knee-raise` | Hanging Knee Raise | PASS | — |
| `hanging-leg-raise` | Hanging Leg Raise | PASS | — |
| `hanging-tuck-hold` | Hanging Tuck Hold | PASS | — |
| `hanging-hollow-hold` | Hanging Hollow Hold | PASS | — |
| `hanging-oblique-knee-raise` | Hanging Oblique Knee Raise | PASS | — |
| `hanging-windshield-wiper-regression` | Hanging Windshield Wiper (easier version) | PASS | — |
| `suspension-body-saw` | Suspension Body Saw | PASS | — |
| `suspension-fallout` | Suspension Fallout | PASS | — |
| `suspension-stir-the-pot` | Suspension Stir the Pot | PASS | — |
| `suspension-anti-rotation-hold` | Suspension Anti-Rotation Hold | PASS | — |
| `machine-seated-row` | Machine Seated Row | PASS | — |
| `cable-seated-row` | Cable Seated Row | PASS | — |
| `dumbbell-chest-supported-row` | Dumbbell Chest-Supported Row | PASS | — |
| `barbell-bent-over-row` | Barbell Bent-Over Row | PASS | — |
| `pendlay-row` | Pendlay Row | PASS | — |
| `machine-assisted-pullup` | Machine Assisted Pull-Up | PASS | — |
| `machine-lat-pulldown` | Machine Lat Pulldown | PASS | — |
| `cable-lat-pulldown` | Cable Lat Pulldown | PASS | — |
| `cable-straight-arm-pulldown` | Cable Straight-Arm Pulldown | PASS | — |
| `cable-face-pull` | Cable Face Pull | PASS | — |
| `machine-rear-delt-row` | Machine Rear Delt Row | PASS | — |
| `machine-reverse-pec-deck` | Machine Reverse Pec Deck | PASS | — |
| `dumbbell-rear-delt-fly` | Dumbbell Rear Delt Fly | PASS | — |
| `cable-rear-delt-fly` | Cable Rear Delt Fly | PASS | — |
| `prone-y-raise` | Prone Y Raise | PASS | — |
| `cable-external-rotation-pressout` | Cable External Rotation Press-Out | PASS | — |
| `dumbbell-pullover` | Dumbbell Pullover | PASS | — |
| `barbell-landmine-pulldown` | Barbell Landmine Pulldown | PASS | — |
| `machine-chest-press` | Machine Chest Press | PASS | — |
| `machine-pec-deck-press` | Machine Pec Deck Fly | PASS | — |
| `dumbbell-incline-press` | Dumbbell Incline Press | PASS | — |
| `barbell-floor-press` | Barbell Floor Press | PASS | — |
| `barbell-bench-press-paused` | Barbell Bench Press (Paused) | PASS | — |
| `machine-shoulder-press` | Machine Shoulder Press | PASS | — |
| `dumbbell-arnold-press` | Dumbbell Arnold Press | PASS | — |
| `barbell-push-press` | Barbell Push Press | PASS | — |
| `barbell-strict-press` | Barbell Strict Press | PASS | — |
| `cable-lateral-raise` | Cable Lateral Raise | PASS | — |
| `cable-upright-row` | Cable Upright Row | PASS | — |
| `prone-t-raise` | Prone T Raise | PASS | — |
| `machine-leg-press` | Machine Leg Press | PASS | — |
| `dumbbell-step-up-loaded` | Dumbbell Step-Up (Loaded) | PASS | — |
| `machine-hack-squat` | Machine Hack Squat | PASS | — |
| `barbell-back-squat` | Barbell Back Squat | PASS | — |
| `machine-seated-hamstring-curl` | Machine Seated Hamstring Curl | PASS | — |
| `dumbbell-sumo-rdl` | Dumbbell Sumo RDL | PASS | — |
| `barbell-romanian-deadlift` | Barbell Romanian Deadlift | PASS | — |
| `barbell-hip-thrust` | Barbell Hip Thrust | PASS | — |
| `machine-glute-drive` | Machine Glute Drive | PASS | — |
| `cable-pallof-press` | Cable Pallof Press | PASS | — |
| `cable-woodchop-standing` | Cable Woodchop (Standing) | PASS | — |
| `machine-ab-crunch` | Machine Ab Crunch | PASS | — |
| `band-external-rotation` | Band External Rotation | PASS | — |
| `cable-external-rotation` | Cable External Rotation | PASS | — |
| `band-pull-apart` | Band Pull-Apart | PASS | — |
| `band-rear-delt-fly` | Band Rear Delt Fly | PASS | — |
| `dumbbell-side-lying-external-rotation` | Dumbbell Side-Lying External Rotation | PASS | — |
| `machine-shoulder-external-rotation` | Machine Shoulder External Rotation | PASS | — |
| `dumbbell-suitcase-hold-march` | Dumbbell Suitcase Hold March | PASS | — |
| `barbell-rollout` | Barbell Rollout | PASS | — |
| `supine-elbow-drive-row` | Supine Elbow Drive Row | PASS | — |
| `prone-elbow-row` | Prone Elbow Row | PASS | — |
| `seated-lat-sweep-pulse` | Seated Lat Sweep Pulse | PASS | — |
| `marching-brace-hold` | Marching Brace Hold | PASS | — |
| `wall-braced-single-leg-march` | Wall Braced Single-Leg March | PASS | — |
| `contralateral-reach-march` | Contralateral Reach March | PASS | — |
