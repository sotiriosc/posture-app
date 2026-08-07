# Phase 0 — Equipment Program Baseline Audit

Read-only baseline of current generator output across equipment modes. No production generation behavior was changed.

## Matrix coverage

- Total cases: 160
- Golden manual-review personas: 12
- Elapsed: 21.4s

Covered dimensions:

- Primary modes: gym, dumbbells, bands, bodyweight, mixedHome
- Experience: Beginner, Intermediate, Advanced
- Days/week: 3, 4, 5
- Phases: activation (1), skill (2), growth (3)
- Pain: none (core matrix), shoulder/upper-back, low-back/hip
- Goals: General fitness (core), Improve posture, Reduce pain, Athletic performance

## Mode rollup

| Mode | Cases | Intent→gym | Structural flags | Legality flags | Slot-truth flags | Mean coaching/demo gaps/case |
|---|---:|---:|---:|---:|---:|---:|
| gym | 32 | 32 | 0 | 0 | 0 | 33.1 |
| dumbbells | 32 | 32 | 32 | 12 | 32 | 33.1 |
| bands | 32 | 0 | 14 | 32 | 0 | 33.2 |
| bodyweight | 32 | 0 | 14 | 12 | 25 | 32.3 |
| mixedHome | 32 | 32 | 32 | 32 | 0 | 33.2 |

## Problem categories (cases with ≥1 flag)

### structural — 92 cases

- golden__dumbbells__beginner_no_pain: dumbbells selection collapses to intentEquipmentMode=gym via hasLoad capability
- golden__dumbbells__beginner_no_pain: non-gym 3-day plan uses gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs
- core__dumbbells__beginner__3d__p2__general_fitness__no_pain: dumbbells selection collapses to intentEquipmentMode=gym via hasLoad capability
- core__dumbbells__beginner__3d__p2__general_fitness__no_pain: non-gym 3-day plan uses gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs
- core__dumbbells__beginner__3d__p3__general_fitness__no_pain: dumbbells selection collapses to intentEquipmentMode=gym via hasLoad capability
- core__dumbbells__beginner__3d__p3__general_fitness__no_pain: non-gym 3-day plan uses gym-shaped day titles: Back + Chest, Shoulders + Arms, Legs + Abs
- core__dumbbells__beginner__4d__p1__general_fitness__no_pain: dumbbells selection collapses to intentEquipmentMode=gym via hasLoad capability
- core__dumbbells__beginner__4d__p2__general_fitness__no_pain: dumbbells selection collapses to intentEquipmentMode=gym via hasLoad capability

### equipment_legality — 88 cases

- core__dumbbells__beginner__3d__p2__general_fitness__no_pain: required supports observed without confirmed capability: door_anchor_or_doorway
- core__dumbbells__beginner__3d__p3__general_fitness__no_pain: required supports observed without confirmed capability: door_anchor_or_doorway
- core__dumbbells__beginner__4d__p2__general_fitness__no_pain: required supports observed without confirmed capability: door_anchor_or_doorway
- core__dumbbells__beginner__5d__p2__general_fitness__no_pain: required supports observed without confirmed capability: door_anchor_or_doorway
- core__dumbbells__intermediate__3d__p2__general_fitness__no_pain: required supports observed without confirmed capability: door_anchor_or_doorway
- core__dumbbells__intermediate__3d__p3__general_fitness__no_pain: required supports observed without confirmed capability: door_anchor_or_doorway
- core__dumbbells__intermediate__4d__p2__general_fitness__no_pain: required supports observed without confirmed capability: door_anchor_or_doorway
- core__dumbbells__intermediate__5d__p2__general_fitness__no_pain: required supports observed without confirmed capability: door_anchor_or_doorway

### slot_truth — 57 cases

- golden__dumbbells__beginner_no_pain: untruthful/support pull mains: seated-lat-sweep-pulse@mainPullVertical:support_only
- core__dumbbells__beginner__3d__p2__general_fitness__no_pain: untruthful/support pull mains: supine-lat-pulldown-isometric@mainPullVertical:surrogate
- core__dumbbells__beginner__3d__p3__general_fitness__no_pain: untruthful/support pull mains: supine-lat-pulldown-isometric@mainPullVertical:surrogate
- core__dumbbells__beginner__4d__p1__general_fitness__no_pain: untruthful/support pull mains: dumbbell-pullover@mainVerticalPullSurrogate:surrogate
- core__dumbbells__beginner__4d__p2__general_fitness__no_pain: untruthful/support pull mains: dumbbell-pullover@mainVerticalPullSurrogate:surrogate
- core__dumbbells__beginner__4d__p3__general_fitness__no_pain: untruthful/support pull mains: dumbbell-pullover@mainVerticalPullSurrogate:surrogate
- core__dumbbells__beginner__5d__p1__general_fitness__no_pain: untruthful/support pull mains: dumbbell-pullover@mainVerticalPullSurrogate:surrogate
- core__dumbbells__beginner__5d__p2__general_fitness__no_pain: untruthful/support pull mains: dumbbell-pullover@mainVerticalPullSurrogate:surrogate

### complexity — 26 cases

- core__gym__beginner__3d__p2__general_fitness__no_pain: experience-mismatched complexity: dumbbell-bench-press, hollow-body-hold
- core__gym__beginner__3d__p3__general_fitness__no_pain: experience-mismatched complexity: dumbbell-bench-press, machine-hack-squat, dumbbell-bulgarian-split-squat
- core__gym__beginner__4d__p1__general_fitness__no_pain: experience-mismatched complexity: dumbbell-bench-press, hollow-body-hold
- core__gym__beginner__4d__p2__general_fitness__no_pain: experience-mismatched complexity: side-plank-star, side-plank-star
- core__gym__beginner__4d__p3__general_fitness__no_pain: experience-mismatched complexity: dumbbell-incline-press, dumbbell-arnold-press, machine-glute-drive
- core__gym__beginner__5d__p1__general_fitness__no_pain: experience-mismatched complexity: dumbbell-bench-press, hollow-body-hold
- core__gym__beginner__5d__p2__general_fitness__no_pain: experience-mismatched complexity: dumbbell-bench-press, side-plank-star, side-plank-star
- core__gym__beginner__5d__p3__general_fitness__no_pain: experience-mismatched complexity: dumbbell-bench-press, dumbbell-arnold-press, machine-glute-drive, dumbbell-arnold-press

### coaching — 160 cases

- golden__gym__beginner_no_pain: 25 exercise placements lack demo URL and/or core coaching fields
- core__gym__beginner__3d__p2__general_fitness__no_pain: 25 exercise placements lack demo URL and/or core coaching fields
- core__gym__beginner__3d__p3__general_fitness__no_pain: 25 exercise placements lack demo URL and/or core coaching fields
- core__gym__beginner__4d__p1__general_fitness__no_pain: 28 exercise placements lack demo URL and/or core coaching fields
- core__gym__beginner__4d__p2__general_fitness__no_pain: 28 exercise placements lack demo URL and/or core coaching fields
- core__gym__beginner__4d__p3__general_fitness__no_pain: 28 exercise placements lack demo URL and/or core coaching fields
- core__gym__beginner__5d__p1__general_fitness__no_pain: 35 exercise placements lack demo URL and/or core coaching fields
- core__gym__beginner__5d__p2__general_fitness__no_pain: 35 exercise placements lack demo URL and/or core coaching fields

### progression — 160 cases

- golden__gym__beginner_no_pain: 8 loaded/main-or-accessory placements have no progressionOf/regressionOf links
- core__gym__beginner__3d__p2__general_fitness__no_pain: 9 loaded/main-or-accessory placements have no progressionOf/regressionOf links
- core__gym__beginner__3d__p3__general_fitness__no_pain: 8 loaded/main-or-accessory placements have no progressionOf/regressionOf links
- core__gym__beginner__4d__p1__general_fitness__no_pain: 7 loaded/main-or-accessory placements have no progressionOf/regressionOf links
- core__gym__beginner__4d__p2__general_fitness__no_pain: 10 loaded/main-or-accessory placements have no progressionOf/regressionOf links
- core__gym__beginner__4d__p3__general_fitness__no_pain: 13 loaded/main-or-accessory placements have no progressionOf/regressionOf links
- core__gym__beginner__5d__p1__general_fitness__no_pain: 9 loaded/main-or-accessory placements have no progressionOf/regressionOf links
- core__gym__beginner__5d__p2__general_fitness__no_pain: 12 loaded/main-or-accessory placements have no progressionOf/regressionOf links

### ui_comprehension — 14 cases

- golden__bodyweight__beginner_no_pain: bodyweight plan presents pull slots without truthful pull stimulus: seated-lat-sweep-pulse
- core__bodyweight__beginner__3d__p2__general_fitness__no_pain: bodyweight plan presents pull slots without truthful pull stimulus: supine-lat-pulldown-isometric
- core__bodyweight__beginner__3d__p3__general_fitness__no_pain: bodyweight plan presents pull slots without truthful pull stimulus: supine-lat-pulldown-isometric
- core__bodyweight__intermediate__3d__p1__general_fitness__no_pain: bodyweight plan presents pull slots without truthful pull stimulus: seated-lat-sweep-pulse
- core__bodyweight__intermediate__3d__p2__general_fitness__no_pain: bodyweight plan presents pull slots without truthful pull stimulus: supine-lat-pulldown-isometric
- core__bodyweight__intermediate__3d__p3__general_fitness__no_pain: bodyweight plan presents pull slots without truthful pull stimulus: supine-lat-pulldown-isometric
- core__bodyweight__advanced__3d__p1__general_fitness__no_pain: bodyweight plan presents pull slots without truthful pull stimulus: seated-lat-sweep-pulse
- core__bodyweight__advanced__3d__p2__general_fitness__no_pain: bodyweight plan presents pull slots without truthful pull stimulus: supine-lat-pulldown-isometric

## Structural findings (honest)

- `deriveIntentEquipmentMode(hasLoad)` currently returns `gym`, so dumbbells and mixedHome share gym program identity.
- Capability model is still `noneOnly | bandOnly | hasLoad`; dumbbells are not a first-class primary mode in generation.
- Three-day templates remain body-part / gym-shaped for loaded home equipment in many cases (see golden persona day titles).
- Band plans may assume anchors; questionnaire does not currently confirm high/mid/low/door anchor capability.

## Artifact paths

- JSON: `docs/dev-reports/equipment-program-audit-phase0.json`
- Markdown summary: `docs/dev-reports/equipment-program-audit-phase0.md`
- Twelve personas: `docs/dev-reports/equipment-program-audit-phase0-twelve-personas.md`

## Twelve golden persona IDs

- `golden__gym__beginner_no_pain` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=2
- `golden__dumbbells__beginner_no_pain` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=5
- `golden__bands__beginner_no_pain` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=4
- `golden__bodyweight__beginner_no_pain` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=5
- `golden__gym__beginner_shoulder_upper_back` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=2
- `golden__dumbbells__beginner_low_back_hip` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=6
- `golden__bands__beginner_shoulder_upper_back` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=4
- `golden__bodyweight__beginner_low_back_hip` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=5
- `golden__gym__intermediate_posture` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=2
- `golden__dumbbells__intermediate_athletic` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=5
- `golden__bands__intermediate_posture` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=4
- `golden__bodyweight__intermediate_posture` — Back + Chest / Shoulders + Arms / Legs + Abs — flags=5
