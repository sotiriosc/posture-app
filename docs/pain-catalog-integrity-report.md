# Pain catalog integrity report

Generated: 2026-08-04T16:59:29.369Z
Commit: `4e6f5aa`
Command: `npm run audit:pain-catalog`
(or `node --import tsx packages/engine/src/__debug__/painCatalogIntegrity.ts`)

## Summary

- Exercises scanned: 224
- Distinct structured pain tokens: 15
- Canonical areas: neck, upper_back, lower_back, shoulders, hips, knees, wrists, elbows, ankles
- Finding counts:
- **structured_overrides_legacy_text**: 69
- **legacy_text_only**: 18
- **unmapped_structured_token**: 13

## Structured token frequency

| Token | Count | Canonical map |
| --- | ---: | --- |
| `shoulders` | 96 | shoulders |
| `elbows` | 95 | elbows |
| `neck` | 66 | neck |
| `hips` | 51 | hips |
| `wrists` | 46 | wrists |
| `low_back` | 40 | lower_back |
| `acute_low_back` | 30 | lower_back |
| `acute_shoulders` | 28 | shoulders |
| `knees` | 21 | knees |
| `ankles` | 19 | ankles |
| `acute_neck` | 13 | neck |
| `hamstrings` | 11 | (unmapped) |
| `acute_knees` | 7 | knees |
| `hamstring_strain` | 2 | (unmapped) |
| `acute_hips` | 1 | hips |

## Unmapped structured tokens

These are not body-area questionnaire tokens (e.g. hamstring strain). They do not
drive questionnaire hard exclusion unless later mapped.

- `hamstrings` (11 exercises): assisted-hip-hinge, assisted-good-morning, assisted-single-leg-rdl, assisted-hip-thrust, assisted-single-leg-hip-thrust, assisted-hamstring-curl, assisted-back-extension-hold, assisted-nordic-eccentric, …
- `hamstring_strain` (2 exercises): bodyweight-good-morning, db-rdl

## Structured overrides legacy free-text (sample)

When structured metadata is usable and does **not** list an area, free-text must
not hard-exclude. The following pairs would have disagreed under the old
substring matcher (informational — expected under new precedence):

- `glute-bridges`: area=lower_back; free-text would exclude but structured does not
- `dead-bug`: area=lower_back; free-text would exclude but structured does not
- `dumbbell-rows`: area=lower_back; free-text would exclude but structured does not
- `single-arm-dumbbell-row`: area=lower_back; free-text would exclude but structured does not
- `dumbbell-row-iso-hold`: area=lower_back; free-text would exclude but structured does not
- `split-stance-row`: area=shoulders; free-text would exclude but structured does not
- `dumbbell-chest-fly`: area=shoulders; free-text would exclude but structured does not
- `dumbbell-shoulder-press`: area=shoulders; free-text would exclude but structured does not
- `pallof-press`: area=lower_back; free-text would exclude but structured does not
- `face-pull`: area=shoulders; free-text would exclude but structured does not
- `band-face-pull-high-anchor`: area=shoulders; free-text would exclude but structured does not
- `banded-rows-seated`: area=lower_back; free-text would exclude but structured does not
- `bodyweight-squat`: area=knees; free-text would exclude but structured does not
- `goblet-squat`: area=knees; free-text would exclude but structured does not
- `split-squat`: area=knees; free-text would exclude but structured does not
- `bodyweight-good-morning`: area=lower_back; free-text would exclude but structured does not
- `db-rdl`: area=lower_back; free-text would exclude but structured does not
- `back-extension`: area=lower_back; free-text would exclude but structured does not
- `back-extension-hold`: area=lower_back; free-text would exclude but structured does not
- `pike-pushup`: area=shoulders; free-text would exclude but structured does not
- `cossack-squat`: area=knees; free-text would exclude but structured does not
- `shrimp-squat`: area=knees; free-text would exclude but structured does not
- `single-leg-hip-thrust`: area=lower_back; free-text would exclude but structured does not
- `hollow-body-hold`: area=lower_back; free-text would exclude but structured does not
- `prone-swimmer`: area=shoulders; free-text would exclude but structured does not
- `back-widow`: area=neck; free-text would exclude but structured does not
- `heels-elevated-squat`: area=knees; free-text would exclude but structured does not
- `single-leg-glute-bridge-hold`: area=lower_back; free-text would exclude but structured does not
- `reverse-snow-angel`: area=shoulders; free-text would exclude but structured does not
- `plank`: area=shoulders; free-text would exclude but structured does not
- `split-stance-band-chest-press`: area=shoulders; free-text would exclude but structured does not
- `tall-kneeling-band-chest-press`: area=knees; free-text would exclude but structured does not
- `band-chest-press-iso-hold`: area=shoulders; free-text would exclude but structured does not
- `band-overhead-press`: area=shoulders; free-text would exclude but structured does not
- `band-lateral-raise`: area=shoulders; free-text would exclude but structured does not
- `band-lat-pulldown-kneeling`: area=shoulders; free-text would exclude but structured does not
- `tall-kneeling-band-lat-pulldown`: area=shoulders; free-text would exclude but structured does not
- `standing-band-lat-pulldown`: area=shoulders; free-text would exclude but structured does not
- `band-lat-pulldown-wide-grip`: area=shoulders; free-text would exclude but structured does not
- `band-lat-pulldown-iso-hold`: area=shoulders; free-text would exclude but structured does not

## Legacy-text-only exercises (no structured tokens)

These still rely on the temporary free-text fallback for hard exclusion:

- `cat-cow`: Acute wrist pain (use fists or forearms)
- `wall-slides`: Shoulder impingement (reduce range)
- `foam-roll-upper-back`: Osteoporosis (avoid direct pressure)
- `scapular-pushups`: Wrist pain (use fists)
- `prone-ytw`: Shoulder pain (reduce range)
- `hip-flexor-stretch`: Knee pain (use padding)
- `thread-the-needle`: Shoulder pain (reduce range)
- `chin-tucks`: Cervical pain (light range)
- `doorway-pec-stretch`: Shoulder impingement
- `thoracic-rotation`: Acute back pain (small range)
- `wall-angel-hold`: Shoulder pain (shorter hold)
- `bird-dog`: Wrist pain (use forearms)
- `hamstring-stretch`: Sciatic pain (gentle range)
- `side-lying-open-book`: Shoulder pain (short range)
- `ankle-mobility`: Acute ankle pain
- `banded-lat-stretch`: Shoulder pain (gentle range)
- `breathing-90-90`: None
- `hip-hinge-drill`: Low-back pain (shorten range)

## Recommendation

- Do not mass-edit the catalog from this report alone.
- Prefer adding/fixing `painContraindications` on `legacy_text_only` entries
  in a follow-up when coaching intent is clear.
- Keep strain/tissue tokens (`hamstrings`, etc.) as non-area metadata unless
  product adds a corresponding input path.
