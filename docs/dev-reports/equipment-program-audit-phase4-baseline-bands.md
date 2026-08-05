# Phase 4 — Step A Baseline: Current Meaning of “Bands”

Generated for Phase 4 before behavior changes. Does not overwrite Phase 0–3 reports.

## Questionnaire semantics

| Item | Current state |
|---|---|
| Option value | `bands` |
| User-facing label | **Resistance bands** |
| Help / illustration distinguishing long vs mini-loop | **None** |
| Anchor / door setup follow-up | **None** |
| Stored field | `QuestionnaireData.equipment: string[]` only |

**Conclusion:** The product does **not** clearly promise long resistance bands, mini loops, or an anchor. The stored selection is an **unspecified band category**.

## Migration policy (locked for Phase 4)

Because wording does not establish band type:

1. Legacy stored `equipment` containing `bands` with no `bandSetup` resolves to **`legacy_unknown`**.
2. Legacy **never** implies a secure anchor (`hasDoorAnchor` / high / mid / low remain false).
3. Unknown anchors remain false.
4. Existing stored programs remain viewable unchanged.
5. New generation must not schedule exercises requiring unconfirmed band type or anchor.
6. UI requests setup confirmation when bands are selected and `bandSetup` is missing.

**Rejected alternatives:** silently treating legacy `bands` as long-band-no-anchor (would redefine stored meaning).

## Current generation failure modes (from Phase 0/1)

- Gym-shaped day titles for `primaryEquipmentMode="bands"`
- Pulldowns / face pulls / Pallof / woodchops scheduled without confirmed high/mid/door anchor
- `hasLoopBand` / `hasLongBand` / all anchor capability fields hardcoded false while exercises still schedule
- No first-class band A/B/C templates; selection uses legacy `bandOnly` gym-shaped heuristics

## Setup lanes to implement

| Lane | Setup | Anchor |
|---|---|---|
| A | Long (or both) + secure repositionable door/fixed anchor | high + mid + low |
| B | Long (or both), no anchor | none |
| C | Mini loop only | none; Loop Band + Bodyweight structure |
| Legacy unknown | bands token only | none; type unconfirmed |
