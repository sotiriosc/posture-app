# Exercise Tempo Knowledge Curation

Tempo means repetition timing or intent inside one dynamic repetition. It does not mean hold duration, breathing cadence, carry pace, march cadence, step cadence, or session duration.

## Tempo V2

`TempoPrescription` supports:

- `repetition_phase_tempo`: eccentric, lengthened transition, concentric, shortened transition;
- `intent_only`: controlled, natural, explosive intent, or maximal intent;
- `not_prescribed`;
- `not_applicable`;
- `unknown`;
- `legacy_compatibility`.

Zero-second pauses are not represented as exact zero. No prescribed pause is represented as `not_prescribed`.

## Row Status

Rows with repetition-tempo capability: 36 dynamic repetition rows. Rows without repetition tempo:

- `ninety-ninety-breathing`;
- `forearm-plank`;
- `forearm-side-plank`;
- `farmer-carry`;
- `suitcase-carry`;
- `wall-supported-suitcase-march`;
- `loop-band-lateral-walk`;
- `supine-hamstring-walkout`;
- `single-leg-balance-rehearsal`.

Legacy adapter result for ambiguous pause: `LEGACY_TEMPO_PHASE_AMBIGUOUS`.

Fingerprint: `2d257d154ad792c9b33dbbd4ad6b92c9aed4bb21fec19b81da0e0b4bfcbe217c`.
