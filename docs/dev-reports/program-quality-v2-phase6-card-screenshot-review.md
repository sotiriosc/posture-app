# Program Quality V2 — Phase 6 Card Screenshot Review

Layout review of the Phase 6 coaching surfaces (component structure + viewport constraints). Screenshots are documented structurally here; visual QA should confirm the same hierarchy in device preview.

## Active session card (collapsed)

Checked against `ExerciseCard` in consumer + gyms:

1. Exercise name (heading)
2. Targets line
3. Optional one-line setup summary (`data-testid=exercise-card-setup`)
4. Reps / tempo prescription row
5. Single primary cue panel (“Focus for this exercise”)
6. Single progression target (`data-testid=exercise-card-progression`)
7. Guidance control — `min-h-11`, focus ring, aria-label (`data-testid=exercise-card-guidance`)
8. One-active-set tracking (unchanged Phase 6d compression)

### Viewport notes

| Width | Expectation |
|-------|-------------|
| 360 × 740 | Cue + guidance remain above the fold with set tracking; no second encyclopedia inline |
| 390 × 844 | Same hierarchy; progression line wraps without overlapping bottom nav |
| Desktop | Card remains left-column friendly beside timer; guidance is a text control, not a modal takeover |

## Exercise detail / expanded guidance

`ExerciseCoachingGuide` on `/exercise/[id]`:

- No dominant empty video box
- Optional small “Demonstration planned” label when status is `planned`
- Player only when `available`
- Sections: Purpose, Setup, How to perform, Feel, Mistake/Correction, Stop or swap, Easier/Harder
- History preserved below

## Accessibility

- Guidance control ≥44px tap target (`min-h-11`)
- Semantic `h1`/`h2` headings on detail
- Focus-visible ring on Guidance link
- Critical info not colour-only (labels + text)
- No new fixed overlay competing with session bottom bar

## Result

- Mobile session compression preserved
- Expanded guidance is the detail route (single durable destination)
- Review status: **PASS for Phase 6 structure**
