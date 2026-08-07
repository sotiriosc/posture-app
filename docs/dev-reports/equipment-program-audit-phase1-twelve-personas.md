# Phase 1 — Twelve Three-Day Golden Personas

Comparison snapshots after first-class equipment identity. Phase 0 baselines were not overwritten.

## GOLDEN gym / Beginner / 3d / phase 1 / General fitness / no pain

- Case id: `golden__gym__beginner_no_pain`
- Primary mode (audit label): gym
- Resolved primary mode: gym
- Intent profile equipment: gym
- Legacy hasLoad intent (comparison only): gym
- Capability mode (physical bucket): hasLoad
- Capabilities: dumbbells=true, bands=false, bench=true, pullup=false, cables=true, machines=true, highAnchor=false, gymAccess=true
- Experience: Beginner
- Goals: General fitness
- Pain: none
- Equipment input: gym
- Normalized selected equipment: gym
- Available after normalize: barbell, bench, cables, dumbbells, gym, kettlebell, machines
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: no
- Main truth mix: true=9, surrogate=0, support_only=0
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [coaching] 25 exercise placements lack demo URL and/or core coaching fields · [progression] 8 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=8, main=3, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `prone-ytw` Prone Y-T-W Raises | slot=n/a | role=pull+scapular | truth=support_only | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `machine-chest-press` Machine Chest Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=machines | supports=machine | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `machine-seated-row` Machine Seated Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=machines | supports=machine | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | role=mainPullVertical | truth=true | equip=machines | supports=machine | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `prone-y-raise` Prone Y Raise | slot=accessoryback | role=accessoryback | truth=support_only | equip=bench+dumbbells | supports=bench | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `dumbbell-chest-fly` Dumbbell Chest Fly | slot=accessorychest | role=accessorychest | truth=true | equip=dumbbells+bench | supports=bench | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=9, main=3, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `scapular-pushups` Scapular Push-Ups | slot=n/a | role=push+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `machine-shoulder-press` Machine Shoulder Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=machines | supports=machine | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=mainShoulderPullPrimary | role=mainShoulderPullPrimary | truth=true | equip=machines | supports=machine | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=cables | supports=cable_stack | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `cable-biceps-curl` Cable Biceps Curl | slot=accessorypull | role=accessorypull | truth=true | equip=cables | supports=cable_stack | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `farmers-carry` Farmer's Carry | slot=accessorycore | role=accessorycore | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=8, main=3, accessory=2
- warmup:
  - `ankle-mobility` Ankle Mobility Rocks | slot=n/a | role=mobility+ankles | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `glute-bridges` Glute Bridges | slot=n/a | role=hinge+glute | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=machines | supports=machine | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `plank` Plank | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `db-calf-raise` Dumbbell Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `hamstring-stretch` Hamstring Stretch | slot=n/a | role=mobility+hinge | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN dumbbells / Beginner / 3d / phase 1 / General fitness / no pain

- Case id: `golden__dumbbells__beginner_no_pain`
- Primary mode (audit label): dumbbells
- Resolved primary mode: dumbbells
- Intent profile equipment: dumbbells
- Legacy hasLoad intent (comparison only): gym
- Capability mode (physical bucket): hasLoad
- Capabilities: dumbbells=true, bands=false, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Beginner
- Goals: General fitness
- Pain: none
- Equipment input: dumbbells
- Normalized selected equipment: dumbbells
- Available after normalize: dumbbells
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=7, surrogate=0, support_only=2
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=dumbbells still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [slot_truth] untruthful/support pull mains: seated-lat-sweep-pulse@mainPullVertical:support_only · [coaching] 25 exercise placements lack demo URL and/or core coaching fields · [progression] 11 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=8, main=3, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `prone-ytw` Prone Y-T-W Raises | slot=n/a | role=pull+scapular | truth=support_only | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `dumbbell-floor-press` Dumbbell Floor Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-rows` Dumbbell Rows | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=dumbbells | supports=none | source=uniqueness_swap | demoGap=true | coachingGaps=none | complexity=3
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse | slot=mainPullVertical | role=mainPullVertical | truth=support_only | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `prone-swimmer` Prone Swimmer | slot=accessoryback | role=accessoryback | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-pullover` Dumbbell Pullover | slot=accessoryback | role=accessoryback | truth=surrogate | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=9, main=3, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `scapular-pushups` Scapular Push-Ups | slot=n/a | role=push+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `prone-swimmer` Prone Swimmer | slot=mainShoulderStructuralPrimary | role=mainShoulderStructuralPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `hammer-curl` Hammer Curl | slot=accessorypull | role=accessorypull | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `farmers-carry` Farmer's Carry | slot=accessorycore | role=accessorycore | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=8, main=3, accessory=2
- warmup:
  - `ankle-mobility` Ankle Mobility Rocks | slot=n/a | role=mobility+ankles | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `glute-bridges` Glute Bridges | slot=n/a | role=hinge+glute | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `goblet-squat` Goblet Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `plank` Plank | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `db-calf-raise` Dumbbell Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `hamstring-stretch` Hamstring Stretch | slot=n/a | role=mobility+hinge | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN bands / Beginner / 3d / phase 1 / General fitness / no pain

- Case id: `golden__bands__beginner_no_pain`
- Primary mode (audit label): bands
- Resolved primary mode: bands
- Intent profile equipment: bands
- Legacy hasLoad intent (comparison only): bands
- Capability mode (physical bucket): bandOnly
- Capabilities: dumbbells=false, bands=true, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Beginner
- Goals: General fitness
- Pain: none
- Equipment input: bands
- Normalized selected equipment: bands
- Available after normalize: bands
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=9, surrogate=0, support_only=0
- Unconfirmed supports: band_anchor, high_band_anchor
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=bands still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [equipment_legality] required supports observed without confirmed capability: band_anchor, high_band_anchor · [coaching] 25 exercise placements lack demo URL and/or core coaching fields · [progression] 12 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=8, main=3, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `band-pull-aparts` Band Pull-Aparts | slot=n/a | role=pull+scapular | truth=support_only | equip=bands | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `split-stance-row` Split Stance Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `band-lat-pulldown` Band Lat Pulldown | slot=mainPullVertical | role=mainPullVertical | truth=true | equip=bands | supports=band_anchor+high_band_anchor | source=initial_pick | demoGap=true | coachingGaps=none | complexity=1
- accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly | slot=accessoryback | role=accessoryback | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `band-chest-fly` Band Chest Fly | slot=accessorychest | role=accessorychest | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=9, main=3, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `scapular-pushups` Scapular Push-Ups | slot=n/a | role=push+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `band-overhead-press` Band Overhead Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `band-lateral-raise` Band Lateral Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=1
  - `band-rear-delt-fly` Band Rear Delt Fly | slot=mainShoulderPullPrimary | role=mainShoulderPullPrimary | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `band-biceps-curl` Band Biceps Curl | slot=accessorypull | role=accessorypull | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `band-suitcase-march` Band Suitcase March | slot=accessorycore | role=accessorycore | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=8, main=3, accessory=2
- warmup:
  - `ankle-mobility` Ankle Mobility Rocks | slot=n/a | role=mobility+ankles | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `glute-bridges` Glute Bridges | slot=n/a | role=hinge+glute | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `band-front-squat` Band Front Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `band-rdl` Band Romanian Deadlift | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `band-woodchop` Band Woodchop | slot=accessorycore | role=accessorycore | truth=true | equip=bands | supports=band_anchor | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `standing-calf-raise` Standing Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `hamstring-stretch` Hamstring Stretch | slot=n/a | role=mobility+hinge | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN bodyweight / Beginner / 3d / phase 1 / General fitness / no pain

- Case id: `golden__bodyweight__beginner_no_pain`
- Primary mode (audit label): bodyweight
- Resolved primary mode: bodyweight
- Intent profile equipment: bodyweight
- Legacy hasLoad intent (comparison only): none
- Capability mode (physical bucket): noneOnly
- Capabilities: dumbbells=false, bands=false, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Beginner
- Goals: General fitness
- Pain: none
- Equipment input: none
- Normalized selected equipment: none
- Available after normalize: none
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=6, surrogate=0, support_only=3
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=bodyweight still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [slot_truth] untruthful/support pull mains: seated-lat-sweep-pulse@mainPullVertical:support_only · [coaching] 25 exercise placements lack demo URL and/or core coaching fields · [progression] 11 loaded/main-or-accessory placements have no progressionOf/regressionOf links · [ui_comprehension] bodyweight plan presents pull slots without truthful pull stimulus: seated-lat-sweep-pulse

### Back + Chest
- Counts: total=8, main=3, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `prone-ytw` Prone Y-T-W Raises | slot=n/a | role=pull+scapular | truth=support_only | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `pushup` Push-Up | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `supine-elbow-drive-row` Supine Elbow Drive Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=1
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse | slot=mainPullVertical | role=mainPullVertical | truth=support_only | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `prone-swimmer` Prone Swimmer | slot=accessoryback | role=accessoryback | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `back-widow` Back Widow Pulls | slot=accessoryback | role=accessoryback | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=9, main=3, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `scapular-pushups` Scapular Push-Ups | slot=n/a | role=push+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `pike-pushup` Pike Push-Up | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `prone-t-raise` Prone T Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `prone-swimmer` Prone Swimmer | slot=mainShoulderStructuralPrimary | role=mainShoulderStructuralPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `towel-biceps-curl-hold` Towel Biceps Curl Hold | slot=accessorypull | role=accessorypull | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `suitcase-hold-march` Suitcase Hold March | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=8, main=3, accessory=2
- warmup:
  - `ankle-mobility` Ankle Mobility Rocks | slot=n/a | role=mobility+ankles | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `glute-bridges` Glute Bridges | slot=n/a | role=hinge+glute | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `single-leg-hip-thrust` Single-Leg Hip Thrust | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `plank` Plank | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `standing-calf-raise` Standing Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `hamstring-stretch` Hamstring Stretch | slot=n/a | role=mobility+hinge | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN gym / Beginner / 3d / phase 1 / Reduce pain / Shoulders, Upper back

- Case id: `golden__gym__beginner_shoulder_upper_back`
- Primary mode (audit label): gym
- Resolved primary mode: gym
- Intent profile equipment: gym
- Legacy hasLoad intent (comparison only): gym
- Capability mode (physical bucket): hasLoad
- Capabilities: dumbbells=true, bands=false, bench=true, pullup=false, cables=true, machines=true, highAnchor=false, gymAccess=true
- Experience: Beginner
- Goals: Reduce pain
- Pain: Shoulders, Upper back
- Equipment input: gym
- Normalized selected equipment: gym
- Available after normalize: barbell, bench, cables, dumbbells, gym, kettlebell, machines
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: no
- Main truth mix: true=9, surrogate=0, support_only=0
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [coaching] 25 exercise placements lack demo URL and/or core coaching fields · [progression] 8 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=8, main=3, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `machine-chest-press` Machine Chest Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=machines | supports=machine | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `machine-seated-row` Machine Seated Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=machines | supports=machine | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | role=mainPullVertical | truth=true | equip=machines | supports=machine | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `cable-face-pull` Cable Face Pull | slot=accessoryback | role=accessoryback | truth=support_only | equip=cables | supports=cable_stack | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `dumbbell-chest-fly` Dumbbell Chest Fly | slot=accessorychest | role=accessorychest | truth=true | equip=dumbbells+bench | supports=bench | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=9, main=3, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `machine-shoulder-press` Machine Shoulder Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=machines | supports=machine | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=mainShoulderPullPrimary | role=mainShoulderPullPrimary | truth=true | equip=machines | supports=machine | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `dumbbell-triceps-kickback` Dumbbell Triceps Kickback | slot=accessorypush | role=accessorypush | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `cable-biceps-curl` Cable Biceps Curl | slot=accessorypull | role=accessorypull | truth=true | equip=cables | supports=cable_stack | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `farmers-carry` Farmer's Carry | slot=accessorycore | role=accessorycore | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=8, main=3, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=machines | supports=machine | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `plank` Plank | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `db-calf-raise` Dumbbell Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN dumbbells / Beginner / 3d / phase 1 / Reduce pain / Lower back, Hips

- Case id: `golden__dumbbells__beginner_low_back_hip`
- Primary mode (audit label): dumbbells
- Resolved primary mode: dumbbells
- Intent profile equipment: dumbbells
- Legacy hasLoad intent (comparison only): gym
- Capability mode (physical bucket): hasLoad
- Capabilities: dumbbells=true, bands=false, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Beginner
- Goals: Reduce pain
- Pain: Lower back, Hips
- Equipment input: dumbbells
- Normalized selected equipment: dumbbells
- Available after normalize: dumbbells
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=7, surrogate=0, support_only=2
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=dumbbells still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [slot_truth] untruthful/support pull mains: seated-lat-sweep-pulse@mainPullVertical:support_only · [complexity] experience-mismatched complexity: single-arm-dumbbell-row · [coaching] 25 exercise placements lack demo URL and/or core coaching fields · [progression] 12 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=8, main=3, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `dead-bug` Dead Bug | slot=n/a | role=core+anti-extension | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `dumbbell-floor-press` Dumbbell Floor Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `single-arm-dumbbell-row` Single-Arm Dumbbell Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=4
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse | slot=mainPullVertical | role=mainPullVertical | truth=support_only | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `prone-swimmer` Prone Swimmer | slot=accessoryback | role=accessoryback | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `back-widow` Back Widow Pulls | slot=accessoryback | role=accessoryback | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=9, main=3, accessory=3
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `dead-bug` Dead Bug | slot=n/a | role=core+anti-extension | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `reverse-snow-angel` Reverse Snow Angels | slot=mainShoulderStructuralPrimary | role=mainShoulderStructuralPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `hammer-curl` Hammer Curl | slot=accessorypull | role=accessorypull | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `farmers-carry` Farmer's Carry | slot=accessorycore | role=accessorycore | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=8, main=3, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `glute-bridges` Glute Bridges | slot=n/a | role=hinge+glute | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `goblet-squat` Goblet Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `plank` Plank | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `db-calf-raise` Dumbbell Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `breathing-90-90` 90/90 Breathing | slot=n/a | role=breath+core | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN bands / Beginner / 3d / phase 1 / Reduce pain / Shoulders, Upper back

- Case id: `golden__bands__beginner_shoulder_upper_back`
- Primary mode (audit label): bands
- Resolved primary mode: bands
- Intent profile equipment: bands
- Legacy hasLoad intent (comparison only): bands
- Capability mode (physical bucket): bandOnly
- Capabilities: dumbbells=false, bands=true, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Beginner
- Goals: Reduce pain
- Pain: Shoulders, Upper back
- Equipment input: bands
- Normalized selected equipment: bands
- Available after normalize: bands
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=9, surrogate=0, support_only=0
- Unconfirmed supports: band_anchor, high_band_anchor
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=bands still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [equipment_legality] required supports observed without confirmed capability: band_anchor, high_band_anchor · [coaching] 25 exercise placements lack demo URL and/or core coaching fields · [progression] 11 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=8, main=3, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `band-chest-press` Band Chest Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=1
  - `split-stance-row` Split Stance Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `band-lat-pulldown-neutral-grip` Band Lat Pulldown (Neutral Grip) | slot=mainPullVertical | role=mainPullVertical | truth=true | equip=bands | supports=band_anchor+high_band_anchor | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `face-pull` Face Pull | slot=accessoryback | role=accessoryback | truth=support_only | equip=bands | supports=band_anchor | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `band-chest-fly` Band Chest Fly | slot=accessorychest | role=accessorychest | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=9, main=3, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `band-overhead-press` Band Overhead Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `band-lateral-raise` Band Lateral Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=1
  - `band-rear-delt-fly` Band Rear Delt Fly | slot=mainShoulderPullPrimary | role=mainShoulderPullPrimary | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `single-arm-band-biceps-curl` Single-Arm Band Biceps Curl | slot=accessorypull | role=accessorypull | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `band-suitcase-march` Band Suitcase March | slot=accessorycore | role=accessorycore | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=8, main=3, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `band-front-squat` Band Front Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `single-leg-hip-thrust` Single-Leg Hip Thrust | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `pallof-press` Pallof Press | slot=accessorycore | role=accessorycore | truth=true | equip=bands | supports=band_anchor | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `band-calf-raise` Band Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN bodyweight / Beginner / 3d / phase 1 / Reduce pain / Lower back, Hips

- Case id: `golden__bodyweight__beginner_low_back_hip`
- Primary mode (audit label): bodyweight
- Resolved primary mode: bodyweight
- Intent profile equipment: bodyweight
- Legacy hasLoad intent (comparison only): none
- Capability mode (physical bucket): noneOnly
- Capabilities: dumbbells=false, bands=false, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Beginner
- Goals: Reduce pain
- Pain: Lower back, Hips
- Equipment input: none
- Normalized selected equipment: none
- Available after normalize: none
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=6, surrogate=0, support_only=3
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=bodyweight still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [slot_truth] untruthful/support pull mains: seated-lat-sweep-pulse@mainPullVertical:support_only · [coaching] 25 exercise placements lack demo URL and/or core coaching fields · [progression] 11 loaded/main-or-accessory placements have no progressionOf/regressionOf links · [ui_comprehension] bodyweight plan presents pull slots without truthful pull stimulus: seated-lat-sweep-pulse

### Back + Chest
- Counts: total=8, main=3, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `dead-bug` Dead Bug | slot=n/a | role=core+anti-extension | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `pushup` Push-Up | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `supine-elbow-drive-row` Supine Elbow Drive Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=1
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse | slot=mainPullVertical | role=mainPullVertical | truth=support_only | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `prone-swimmer` Prone Swimmer | slot=accessoryback | role=accessoryback | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `back-widow` Back Widow Pulls | slot=accessoryback | role=accessoryback | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=9, main=3, accessory=3
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `dead-bug` Dead Bug | slot=n/a | role=core+anti-extension | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `pike-pushup` Pike Push-Up | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `prone-t-raise` Prone T Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `reverse-snow-angel` Reverse Snow Angels | slot=mainShoulderStructuralPrimary | role=mainShoulderStructuralPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `bodyweight-triceps-extension` Bodyweight Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `self-resisted-biceps-curl` Self-Resisted Biceps Curl | slot=accessorypull | role=accessorypull | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `suitcase-hold-march` Suitcase Hold March | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=8, main=3, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `glute-bridges` Glute Bridges | slot=n/a | role=hinge+glute | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `single-leg-glute-bridge-hold` Single-Leg Glute Bridge Hold | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `plank` Plank | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `standing-calf-raise` Standing Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `breathing-90-90` 90/90 Breathing | slot=n/a | role=breath+core | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN gym / Intermediate / 3d / phase 1 / Improve posture / no pain

- Case id: `golden__gym__intermediate_posture`
- Primary mode (audit label): gym
- Resolved primary mode: gym
- Intent profile equipment: gym
- Legacy hasLoad intent (comparison only): gym
- Capability mode (physical bucket): hasLoad
- Capabilities: dumbbells=true, bands=false, bench=true, pullup=false, cables=true, machines=true, highAnchor=false, gymAccess=true
- Experience: Intermediate
- Goals: Improve posture
- Pain: none
- Equipment input: gym
- Normalized selected equipment: gym
- Available after normalize: barbell, bench, cables, dumbbells, gym, kettlebell, machines
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: no
- Main truth mix: true=12, surrogate=0, support_only=0
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [coaching] 28 exercise placements lack demo URL and/or core coaching fields · [progression] 12 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=9, main=4, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `dumbbell-bench-press` Dumbbell Bench Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=dumbbells+bench | supports=bench | source=initial_pick | demoGap=true | coachingGaps=none | complexity=4
  - `machine-pec-deck-press` Machine Pec Deck Fly | slot=mainPushFly | role=mainPushFly | truth=true | equip=machines | supports=machine | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `dumbbell-rows` Dumbbell Rows | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `machine-lat-pulldown` Machine Lat Pulldown | slot=mainPullVertical | role=mainPullVertical | truth=true | equip=machines | supports=machine | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=accessoryback | role=accessoryback | truth=true | equip=machines | supports=machine | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `cable-face-pull` Cable Face Pull | slot=accessoryback | role=accessoryback | truth=support_only | equip=cables | supports=cable_stack | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=10, main=4, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `machine-reverse-pec-deck` Machine Reverse Pec Deck | slot=mainShoulderPullPrimary | role=mainShoulderPullPrimary | truth=true | equip=machines | supports=machine | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `cable-lateral-raise` Cable Lateral Raise | slot=mainSecondaryLoadedShoulder | role=mainSecondaryLoadedShoulder | truth=true | equip=cables | supports=cable_stack | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `overhead-cable-triceps-extension` Overhead Cable Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=cables | supports=cable_stack | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `cable-biceps-curl` Cable Biceps Curl | slot=accessorypull | role=accessorypull | truth=true | equip=cables | supports=cable_stack | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `farmers-carry` Farmer's Carry | slot=accessorycore | role=accessorycore | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=9, main=4, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `machine-leg-press` Machine Leg Press | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=machines | supports=machine | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-reverse-lunge` Dumbbell Reverse Lunge | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `machine-seated-hamstring-curl` Machine Seated Hamstring Curl | slot=mainHamstringIsolation | role=mainHamstringIsolation | truth=true | equip=machines | supports=machine | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `hollow-body-hold` Hollow Body Hold | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=4
  - `db-calf-raise` Dumbbell Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN dumbbells / Intermediate / 3d / phase 1 / Athletic performance / no pain

- Case id: `golden__dumbbells__intermediate_athletic`
- Primary mode (audit label): dumbbells
- Resolved primary mode: dumbbells
- Intent profile equipment: dumbbells
- Legacy hasLoad intent (comparison only): gym
- Capability mode (physical bucket): hasLoad
- Capabilities: dumbbells=true, bands=false, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Intermediate
- Goals: Athletic performance
- Pain: none
- Equipment input: dumbbells
- Normalized selected equipment: dumbbells
- Available after normalize: dumbbells
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=9, surrogate=1, support_only=2
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=dumbbells still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [slot_truth] untruthful/support pull mains: dumbbell-pullover@mainPullVertical:surrogate · [coaching] 28 exercise placements lack demo URL and/or core coaching fields · [progression] 14 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=9, main=4, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `prone-ytw` Prone Y-T-W Raises | slot=n/a | role=pull+scapular | truth=support_only | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `dumbbell-floor-press` Dumbbell Floor Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `feet-elevated-pushup` Feet-Elevated Push-Up | slot=mainPushSecondary | role=mainPushSecondary | truth=true | equip=none | supports=none | source=uniqueness_swap | demoGap=true | coachingGaps=none | complexity=4
  - `dumbbell-rows` Dumbbell Rows | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-pullover` Dumbbell Pullover | slot=mainPullVertical | role=mainPullVertical | truth=surrogate | equip=dumbbells | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `prone-swimmer` Prone Swimmer | slot=accessoryback | role=accessoryback | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-row-iso-hold` Dumbbell Row Iso Hold | slot=accessoryback | role=accessoryback | truth=true | equip=dumbbells | supports=none | source=uniqueness_swap | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=10, main=4, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `scapular-pushups` Scapular Push-Ups | slot=n/a | role=push+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `dumbbell-shoulder-press` Dumbbell Shoulder Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `dumbbell-lateral-raise` Dumbbell Lateral Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `prone-swimmer` Prone Swimmer | slot=mainShoulderStructuralPrimary | role=mainShoulderStructuralPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `prone-t-raise` Prone T Raise | slot=mainSecondaryLoadedShoulder | role=mainSecondaryLoadedShoulder | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
- accessory:
  - `db-triceps-extension` Dumbbell Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `db-biceps-curl` Dumbbell Biceps Curl | slot=accessorypull | role=accessorypull | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `farmers-carry` Farmer's Carry | slot=accessorycore | role=accessorycore | truth=true | equip=dumbbells | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=9, main=4, accessory=2
- warmup:
  - `ankle-mobility` Ankle Mobility Rocks | slot=n/a | role=mobility+ankles | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `dead-bug` Dead Bug | slot=n/a | role=core+anti-extension | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=1
- main:
  - `goblet-squat` Goblet Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `db-rdl` Dumbbell Romanian Deadlift | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=dumbbells | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `single-leg-hip-thrust` Single-Leg Hip Thrust | slot=mainSecondaryHinge | role=mainSecondaryHinge | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `plank` Plank | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `standing-calf-raise` Standing Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `breathing-90-90` 90/90 Breathing | slot=n/a | role=breath+core | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN bands / Intermediate / 3d / phase 1 / Improve posture / no pain

- Case id: `golden__bands__intermediate_posture`
- Primary mode (audit label): bands
- Resolved primary mode: bands
- Intent profile equipment: bands
- Legacy hasLoad intent (comparison only): bands
- Capability mode (physical bucket): bandOnly
- Capabilities: dumbbells=false, bands=true, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Intermediate
- Goals: Improve posture
- Pain: none
- Equipment input: bands
- Normalized selected equipment: bands
- Available after normalize: bands
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=11, surrogate=0, support_only=1
- Unconfirmed supports: band_anchor, high_band_anchor
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=bands still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [equipment_legality] required supports observed without confirmed capability: band_anchor, high_band_anchor · [coaching] 28 exercise placements lack demo URL and/or core coaching fields · [progression] 15 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### Back + Chest
- Counts: total=9, main=4, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `split-stance-band-chest-press` Split Stance Band Chest Press | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `band-chest-fly` Band Chest Fly | slot=mainPushFly | role=mainPushFly | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `split-stance-row` Split Stance Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `band-lat-pulldown-neutral-grip` Band Lat Pulldown (Neutral Grip) | slot=mainPullVertical | role=mainPullVertical | truth=true | equip=bands | supports=band_anchor+high_band_anchor | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `band-rear-delt-fly` Band Rear Delt Fly | slot=accessoryback | role=accessoryback | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `band-face-pull-high-anchor` Band Face Pull (High Anchor) | slot=accessoryback | role=accessoryback | truth=support_only | equip=bands | supports=band_anchor+high_band_anchor | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=10, main=4, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `band-overhead-press` Band Overhead Press | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `prone-t-raise` Prone T Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `band-rear-delt-fly` Band Rear Delt Fly | slot=mainShoulderPullPrimary | role=mainShoulderPullPrimary | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
  - `band-lateral-raise` Band Lateral Raise | slot=mainSecondaryLoadedShoulder | role=mainSecondaryLoadedShoulder | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=1
- accessory:
  - `band-triceps-pressdown` Band Triceps Pressdown | slot=accessorypush | role=accessorypush | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `band-biceps-curl` Band Biceps Curl | slot=accessorypull | role=accessorypull | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `band-suitcase-march` Band Suitcase March | slot=accessorycore | role=accessorycore | truth=true | equip=bands | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=9, main=4, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `band-front-squat` Band Front Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `band-rdl` Band Romanian Deadlift | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=bands | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `single-leg-hip-thrust` Single-Leg Hip Thrust | slot=mainSecondaryHinge | role=mainSecondaryHinge | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `pallof-press` Pallof Press | slot=accessorycore | role=accessorycore | truth=true | equip=bands | supports=band_anchor | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `band-calf-raise` Band Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=bands | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

## GOLDEN bodyweight / Intermediate / 3d / phase 1 / Improve posture / no pain

- Case id: `golden__bodyweight__intermediate_posture`
- Primary mode (audit label): bodyweight
- Resolved primary mode: bodyweight
- Intent profile equipment: bodyweight
- Legacy hasLoad intent (comparison only): none
- Capability mode (physical bucket): noneOnly
- Capabilities: dumbbells=false, bands=false, bench=false, pullup=false, cables=false, machines=false, highAnchor=false, gymAccess=false
- Experience: Intermediate
- Goals: Improve posture
- Pain: none
- Equipment input: none
- Normalized selected equipment: none
- Available after normalize: none
- Phase: Phase 1: Control & Technique
- Day titles: Back + Chest | Shoulders + Arms | Legs + Abs
- Template identity mismatch: yes (legacy gym-shaped titles)
- Main truth mix: true=8, surrogate=0, support_only=4
- Unconfirmed supports: none
- Weekly coverage gaps: none
- Problem flags: [structural] primaryMode=bodyweight still uses legacy gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs (Phase 2–5 template work) · [slot_truth] untruthful/support pull mains: seated-lat-sweep-pulse@mainPullVertical:support_only · [coaching] 28 exercise placements lack demo URL and/or core coaching fields · [progression] 13 loaded/main-or-accessory placements have no progressionOf/regressionOf links · [ui_comprehension] bodyweight plan presents pull slots without truthful pull stimulus: seated-lat-sweep-pulse

### Back + Chest
- Counts: total=9, main=4, accessory=2
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `pushup` Push-Up | slot=mainPushCompound | role=mainPushCompound | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
  - `countertop-pushup` Countertop Push-Up | slot=mainPushSecondary | role=mainPushSecondary | truth=true | equip=none | supports=none | source=uniqueness_swap | demoGap=true | coachingGaps=none | complexity=2
  - `supine-elbow-drive-row` Supine Elbow Drive Row | slot=mainPullHorizontal | role=mainPullHorizontal | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=1
  - `seated-lat-sweep-pulse` Seated Lat Sweep Pulse | slot=mainPullVertical | role=mainPullVertical | truth=support_only | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `prone-swimmer` Prone Swimmer | slot=accessoryback | role=accessoryback | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `back-widow` Back Widow Pulls | slot=accessoryback | role=accessoryback | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Shoulders + Arms
- Counts: total=10, main=4, accessory=3
- warmup:
  - `wall-slides` Wall Slides | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `pike-pushup` Pike Push-Up | slot=mainVerticalPushPrimary | role=mainVerticalPushPrimary | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `prone-t-raise` Prone T Raise | slot=mainLateralDeltPrimary | role=mainLateralDeltPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `prone-swimmer` Prone Swimmer | slot=mainShoulderStructuralPrimary | role=mainShoulderStructuralPrimary | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=3
  - `reverse-snow-angel` Reverse Snow Angels | slot=mainShoulderStructuralAlternate | role=mainShoulderStructuralAlternate | truth=support_only | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- accessory:
  - `self-resisted-triceps-extension` Self-Resisted Triceps Extension | slot=accessorypush | role=accessorypush | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `towel-biceps-curl-hold` Towel Biceps Curl Hold | slot=accessorypull | role=accessorypull | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=1
  - `suitcase-hold-march` Suitcase Hold March | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=day_intelligence_repair | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a

### Legs + Abs
- Counts: total=9, main=4, accessory=2
- warmup:
  - `cat-cow` Cat-Cow Flow | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- activation:
  - `wall-angel-hold` Wall Angel Hold | slot=n/a | role=mobility+scapular | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
- main:
  - `heels-elevated-squat` Heels-Elevated Tempo Squat | slot=mainSquatPrimary | role=mainSquatPrimary | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `single-leg-hip-thrust` Single-Leg Hip Thrust | slot=mainHingePrimary | role=mainHingePrimary | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=3
  - `split-squat` Split Squat | slot=mainUnilateralLowerLoaded | role=mainUnilateralLowerLoaded | truth=true | equip=none | supports=none | source=legality_repair | demoGap=true | coachingGaps=none | complexity=2
  - `cossack-squat` Cossack Squat | slot=mainSecondarySquat | role=mainSecondarySquat | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=3
- accessory:
  - `plank` Plank | slot=accessorycore | role=accessorycore | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
  - `standing-calf-raise` Standing Calf Raise | slot=accessorylower | role=accessorylower | truth=true | equip=none | supports=none | source=initial_pick | demoGap=true | coachingGaps=none | complexity=2
- cooldown:
  - `thread-the-needle` Thread-the-Needle | slot=n/a | role=mobility+spine | truth=unknown | equip=none | supports=none | source=n/a | demoGap=true | coachingGaps=none | complexity=n/a
