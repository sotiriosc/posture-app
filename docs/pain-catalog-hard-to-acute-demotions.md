# Catalog hard → acute demotion review

Branch: `fix/pain-aware-generation-hardening`  
Base: `4e6f5aa` (Knees questionnaire UI)  
Scope: authored `painContraindications` tokens demoted from unmodified hard areas to `acute_*` caution tags, plus inference-default changes.

**Policy:** Do not approve broad demotions solely because a movement family became empty under hard exclusion. Each demotion below is justified by free-text load/range management language (or inference-default redesign). Where a family would still empty, prefer widen/omit/downgrade architecture over mass demotion.

## Inference defaults (not per-exercise demotions)

| Pattern family | Previous default tokens | New default tokens | Justification |
| --- | --- | --- | --- |
| horizontal_pull | shoulders, elbows, neck | acute shoulders, elbows, neck | Family-wide hard `shoulders` emptied pull mains under questionnaire Shoulders |
| vertical_pull | shoulders, elbows, neck | acute shoulders, elbows, neck | Same |
| horizontal_push | shoulders, wrists, elbows | acute shoulders, wrists, elbows | Same for push family |
| vertical_push | shoulders, wrists, elbows | acute shoulders, wrists, elbows | Same |
| knee_dominant | knees, hips, ankles | acute knees, hips, ankles | Hard `knees` emptied squat family; keep authored hard `knees` (e.g. machine-leg-press) |
| hinge | low back, hamstrings, hips | acute low back, hips | Hard `low back` emptied hinge family |
| core_stability | low back, shoulders, neck | acute low back, shoulders, neck | Soft caution for core under lower-back questionnaire |

Hard bans for a family must be authored explicitly on the exercise.

## Authored demotions (machine-readable)

```json
[
  {
    "exerciseId": "dumbbell-shoulder-press",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Free-text is grip/ROM management, not absolute ban",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (use neutral grip)"],
    "eligibilityTest": "evaluateHardPainExclusion soft under Shoulders; hard with treatAcuteAsHard"
  },
  {
    "exerciseId": "face-pull",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Light-band irritation cue — load management",
    "freeTextAgrees": true,
    "freeText": ["Shoulder irritation (light band)"]
  },
  {
    "exerciseId": "band-face-pull-high-anchor",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Lighter-band irritation cue",
    "freeTextAgrees": true,
    "freeText": ["Shoulder irritation (use lighter band)"]
  },
  {
    "exerciseId": "dumbbell-reverse-lunge",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Free-text targets knee/hip ROM; low-back was over-hard",
    "freeTextAgrees": true,
    "freeText": ["Acute knee pain (shorten range)", "Hip pain (reduce stride length)"],
    "note": "Hard knees/hips/ankles retained"
  },
  {
    "exerciseId": "dumbbell-bulgarian-split-squat",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Free-text knee/hip depth management",
    "freeTextAgrees": true,
    "freeText": ["Acute knee pain (reduce depth)", "Hip pain (adjust stance length)"],
    "note": "Hard knees/hips/ankles retained"
  },
  {
    "exerciseId": "pike-pushup",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Reduce-range shoulder cue",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (reduce range)"]
  },
  {
    "exerciseId": "pike-pushup",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Paired with shoulder ROM caution for overhead-ish pike",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (reduce range)"]
  },
  {
    "exerciseId": "prone-swimmer",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Therapeutic scap work; free-text is shorten range",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (shorten range)"]
  },
  {
    "exerciseId": "back-widow",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Free-text reduce neck range — soft caution",
    "freeTextAgrees": true,
    "freeText": ["Neck pain (reduce range)"]
  },
  {
    "exerciseId": "reverse-snow-angel",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Short-range shoulder/neck caution",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (short range)"]
  },
  {
    "exerciseId": "band-overhead-press",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Light-band shoulder cue",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (light band)"],
    "note": "Unmodified neck retained (hard)"
  },
  {
    "exerciseId": "band-lateral-raise",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Reduce range/tension — soft acute caution",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (reduce range and tension)"]
  },
  {
    "exerciseId": "suspension-face-pull",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Acute shoulder/elbow free-text; neck demoted to acute",
    "freeTextAgrees": true,
    "freeText": ["Acute shoulder pain (reduce range)", "Elbow irritation (reduce load)"]
  },
  {
    "exerciseId": "prone-lat-sweep",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Acute shoulder + neck volume cues",
    "freeTextAgrees": true,
    "freeText": ["Acute shoulder pain (shorten range)", "Neck pain (reduce volume)"]
  },
  {
    "exerciseId": "prone-lat-sweep",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Neck volume management",
    "freeTextAgrees": true,
    "freeText": ["Neck pain (reduce volume)"]
  },
  {
    "exerciseId": "cable-face-pull",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Lower-anchor / lighten-load cues",
    "freeTextAgrees": true,
    "freeText": ["Acute shoulder pain (lighten load)", "Neck tension (lower cable anchor)"]
  },
  {
    "exerciseId": "prone-y-raise",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Shorten-range therapeutic raise",
    "freeTextAgrees": true,
    "freeText": ["Acute shoulder pain (shorten range)", "Neck pain (lower load)"]
  },
  {
    "exerciseId": "prone-y-raise",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Lower-load neck cue",
    "freeTextAgrees": true,
    "freeText": ["Neck pain (lower load)"]
  },
  {
    "exerciseId": "machine-shoulder-press",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Reduce ROM / lower load — not absolute ban",
    "freeTextAgrees": true,
    "freeText": ["Acute shoulder pain (reduce ROM)", "Neck pain (lower load)"]
  },
  {
    "exerciseId": "machine-shoulder-press",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Lower-load neck cue",
    "freeTextAgrees": true,
    "freeText": ["Neck pain (lower load)"]
  },
  {
    "exerciseId": "dumbbell-arnold-press",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Shorten-range acute shoulder cue",
    "freeTextAgrees": true,
    "freeText": ["Acute shoulder pain (shorten range)", "Wrist pain (neutral press variant)"]
  },
  {
    "exerciseId": "dumbbell-arnold-press",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Paired overhead caution",
    "freeTextAgrees": true,
    "freeText": ["Acute shoulder pain (shorten range)"]
  },
  {
    "exerciseId": "prone-t-raise",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Reduce-range therapeutic raise",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (reduce range)"]
  },
  {
    "exerciseId": "prone-t-raise",
    "previousToken": "neck",
    "newToken": "acute neck",
    "justification": "Paired neck caution for prone raise family",
    "freeTextAgrees": true,
    "freeText": ["Shoulder pain (reduce range)"]
  },
  {
    "exerciseId": "machine-leg-press",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Free-text is knee/hip ROM; hard knees retained for Knees questionnaire fix",
    "freeTextAgrees": true,
    "freeText": ["Acute knee pain (reduce depth)", "Hip pain (use narrower ROM)"],
    "note": "Hard knees + hips retained — not a knee demotion"
  },
  {
    "exerciseId": "dumbbell-step-up-loaded",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Knee/hip load cues dominate free-text",
    "freeTextAgrees": true,
    "freeText": ["Acute knee pain (lower step height)", "Hip pain (reduce load)"],
    "note": "Hard knees/hips retained"
  },
  {
    "exerciseId": "machine-seated-hamstring-curl",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Hamstring/knee free-text; low-back was over-hard",
    "freeTextAgrees": true,
    "freeText": ["Acute hamstring strain (lighten load)", "Knee pain (shorten range)"],
    "note": "Hard knees retained"
  },
  {
    "exerciseId": "dumbbell-sumo-rdl",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Free-text already says acute low-back → regress",
    "freeTextAgrees": true,
    "freeText": ["Acute low-back pain (regress)", "Hamstring pain (short ROM)"]
  },
  {
    "exerciseId": "barbell-romanian-deadlift",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Free-text acute low-back regress",
    "freeTextAgrees": true,
    "freeText": ["Acute low-back pain (regress)", "Hamstring strain (lighten load)"]
  },
  {
    "exerciseId": "barbell-hip-thrust",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Free-text reduce load for acute low-back",
    "freeTextAgrees": true,
    "freeText": ["Acute low-back pain (reduce load)", "Hip pain (shorten range)"]
  },
  {
    "exerciseId": "machine-glute-drive",
    "previousToken": "low back",
    "newToken": "acute low back",
    "justification": "Free-text acute low-back regress",
    "freeTextAgrees": true,
    "freeText": ["Acute low-back pain (regress)", "Hip pain (reduce ROM/load)"]
  },
  {
    "exerciseId": "band-rear-delt-fly",
    "previousToken": "shoulders",
    "newToken": "acute shoulders",
    "justification": "Reduce band tension — soft caution",
    "freeTextAgrees": true,
    "freeText": ["Acute shoulder pain (reduce band tension)"],
    "note": "Unmodified neck retained (hard)"
  }
]
```

## Empty-family determination

| Symptom under hard exclusion | Root cause chosen | Resolution |
| --- | --- | --- |
| Pull/push mains emptied by inferred `shoulders` | Metadata too broad (inference) | Inference → `acute shoulders` |
| Squat family emptied by inferred `knees` | Metadata too broad (inference) | Inference → `acute knees`; keep authored hard knees |
| Hinge family emptied by inferred `low back` | Metadata too broad (inference) | Inference → `acute low back` |
| Slot still unblockable after demotions | Fallback architecture too narrow | `ensureEligibleItem` widen → omit with `unresolved_slot:no_pain_safe_candidate:<area>` |

## Eligibility proof

Covered by `packages/engine/tests/unit/painSafetyMonotonicity.test.ts` (“catalog demotions” + hard-exclusion suites) and `painHardExclusion.test.ts` / `painKneePolicy.test.ts`.
