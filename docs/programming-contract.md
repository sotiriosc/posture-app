# Praxis Programming Contract

This document defines the product contract for the current generator. It is meant
to keep tests aligned with intended programming behavior instead of old uniform
slot-count assumptions.

## Source Of Truth

The engine-generated `Program` is the source of truth for rendered plan structure.
The contract below covers day titles, main-work composition, accessory volume,
equipment legality, pain-aware substitutions, and deterministic output. It does
not require one exact exercise ID when a family-equivalent exercise satisfies the
same training intent.

## Split Titles

### 3-Day Split

- Day 1: `Back + Chest`
- Day 2: `Shoulders + Arms`
- Day 3: `Legs + Abs`

### 4-Day Split

- Day 1: `Upper Push + Scapular Control`
- Day 2: `Lower (Squat Emphasis) + Core`
- Day 3: `Upper Pull + Thoracic Posture`
- Day 4: `Lower (Hinge Emphasis) + Carry/Anti-rotation`

### 5-Day Split

- Day 1: `Upper Push`
- Day 2: `Lower Squat`
- Day 3: `Upper Pull`
- Day 4: `Lower Hinge + Posterior Chain`
- Day 5: `Arms + Posture + Conditioning`

## Main-Count Contract

The 3-day split is intentionally fuller than the legacy uniform-count model.
Do not reduce 3-day main volume only to satisfy older tests.

| Split | Experience | Day Contract |
| --- | --- | --- |
| 3-day | Beginner | 3 mains on each day |
| 3-day | Intermediate | 4 mains on each day |
| 3-day | Advanced | 5 mains on `Back + Chest`; 4 mains on `Shoulders + Arms` and `Legs + Abs` |
| 4-day | Beginner | 2 mains on each day |
| 4-day | Intermediate | 3 mains on each day |
| 4-day | Advanced | 4 mains on each day |
| 5-day | Beginner | 2 mains on each day |
| 5-day | Intermediate | 3 mains on each day |
| 5-day | Advanced | 4 mains on upper and arms/posture days; 3 mains on lower days |

## Accessory-Count Contract

3-day accessory volume is part of the intended product shape.

| Split | Experience | Day Contract |
| --- | --- | --- |
| 3-day | Beginner | `Back + Chest`: 2; `Shoulders + Arms`: 3; `Legs + Abs`: 2 |
| 3-day | Intermediate | `Back + Chest`: 2; `Shoulders + Arms`: 3; `Legs + Abs`: 2 |
| 3-day | Advanced | `Back + Chest`: 2; `Shoulders + Arms`: 4; `Legs + Abs`: 3 |
| 4-day | Beginner | 2 accessories per day |
| 4-day | Intermediate | 2 accessories per day |
| 4-day | Advanced | normally 3 accessories per day |
| 5-day | Beginner | 2 accessories per day |
| 5-day | Intermediate | 2 accessories per day |
| 5-day | Advanced | 2-3 accessories per day by day intent and repair policy |

The 5-day advanced lower days commonly carry 3 accessories because they include
core, posture, carry, or posterior-chain support. Upper and arms/posture days may
use 2 accessories when the main work already carries enough session density.

## Day Intent

### 3-Day `Back + Chest`

- Must preserve push/pull balance.
- Beginner: 2 push-biased mains and 1 pull-biased main.
- Intermediate: 2 push-biased mains and 2 pull-biased mains.
- Advanced: 2 push-biased mains and 3 pull-biased mains.
- Chest press and row/pull families are fixed requirements; exact exercise IDs
  are flexible when equipment-legal equivalents are selected.

### 3-Day `Shoulders + Arms`

- Main work is shoulder/posture work, not direct arm isolation.
- Must include vertical press or a pain-appropriate shoulder press equivalent
  when legal.
- Must include lateral/rear-delt/scapular-support intent.
- Arm work belongs in accessories.

### 3-Day `Legs + Abs`

- Must include squat and hinge coverage.
- Secondary lower-body slots can use single-leg squat, step-up, split-squat, or
  hinge-family equivalents.
- Core work belongs primarily in activation/accessory support, not by replacing
  required lower-body mains.

### 4-Day Upper/Lower

- Upper push days prioritize press work and scapular control.
- Upper pull days prioritize row/pull work and thoracic posture.
- Lower squat days must include squat intent and a hinge support slot.
- Lower hinge days must include hinge intent and a squat support slot.

### 5-Day Split

- Upper push and upper pull days preserve their named upper-body intent.
- Lower squat and lower hinge days preserve squat/hinge emphasis without losing
  the complementary lower-body pattern.
- `Arms + Posture + Conditioning` may use posture-heavy pull and vertical-push
  main work; it must not become a lower-body or generic filler day.

## Pain-Aware Expectations

- Pain changes exercise selection and prescription, not the overall split
  contract.
- Pain-aware substitutions must remain equipment-legal and avoid known
  contraindications.
- Do not delete 3-day volume solely because a pain flag exists.
- If a no-equipment upper-pain case cannot safely satisfy an exact vertical
  shoulder slot, preserve the day intent with safer push/pull/scapular families
  rather than underfilling the day.

## Fixed Vs Flexible

Fixed:

- Split day titles and order.
- Main-count contracts above.
- 3-day accessory-count contracts above.
- Required movement lanes by day intent.
- Unique exercise IDs within a day.
- Equipment legality.
- Pain-aware contraindication filtering.
- Deterministic same-state output.

Flexible:

- Exact exercise IDs when a same-family, equipment-legal choice satisfies the
  intended lane.
- Exercise order inside a day where the policy does not encode a fixed slot.
- Accessory family choice when multiple posture, core, carry, arm, or corrective
  options satisfy the same support intent.
- 5-day advanced accessory count within the documented 2-3 range.

Tests should prefer identity anchors and family buckets for flexible areas, and
exact assertions only where the product contract requires fixed behavior.
