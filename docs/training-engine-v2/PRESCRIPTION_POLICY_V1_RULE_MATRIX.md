# Prescription Policy V1 Rule Matrix

All rules are context-scoped selections from the frozen numeric lattice; the lattice is unchanged.

| Family | Binding V1 rule |
| --- | --- |
| `preparation` | default: 1 set; dynamic 4-8 reps, hold 10-20 seconds, breathing 3-5 cycles, or 6-10 steps/side; quality_limited; scopedOverride: 2 sets only for an explicit dependency, unfamiliar task, new equipment, reviewed range/control dependency, shared dependency, or successful bounded prior evidence; forbidden: 3 sets or developmental weekly credit |
| `activation` | default: 1 set; dynamic 6-12 reps, hold 10-20 seconds, or 8-12 steps/side; quality_limited; scopedOverride: 2 sets only for required low-fatigue control work that preserves main work and has no adverse fatigue response; forbidden: failure-oriented activation or implicit hypertrophy credit |
| `mainStrength` | standard: 3 sets; 3-6 reps; 1-3 RIR; 180-300 seconds rest; regression: 2 sets; 3-6 reps; 2-4 RIR; 120-240 seconds rest; forbidden: 5-set default |
| `secondaryStrength` | default: 2 sets; 5-10 reps; 2-3 RIR; 90-180 seconds rest; scopedOverride: 3 sets only when required, weekly-prioritized, capacity-supported, non-conflicting, and non-redundant |
| `mainHypertrophy` | standard: 3 sets; 6-20 reps; 1-3 RIR; 90-180 seconds rest; regression: 2 sets; 6-15 reps; 2-4 RIR; 90-180 seconds rest; forbidden: five high-effort sets as default |
| `hypertrophyAccessory` | default: 1-2 sets; 8-20 reps; 1-3 RIR; 60-120 seconds rest; oneSet: preferred/optional, condensed, overlapping, first exposure, or insufficient response history; twoSets: required unique value with coherent remaining capacity |
| `directAccessory` | required: 2 sets; 8-20 reps; 1-3 RIR; 60-120 seconds rest; preferredOptional: 1 set; 8-20 reps; 2-4 RIR; 45-90 seconds rest; exactActionTruthRequired: true |
| `timedHold` | preparationActivation: 1 set; 10-20 seconds; quality_limited; developmental: 2 sets; 20-40 seconds; quality_limited or moderate; 60-120 seconds rest; thirdSet: future_response_led_override_only |
| `breathCycles` | default: 1 round; 3-5 cycles; qualitative cadence or no cadence; no developmental credit; twoRounds: explicit required preparation/recovery responsibility or reviewed successful response with spare capacity |
| `carry` | capacityMain: 3 trips; 15-30 metres or 20-40 seconds; moderate/quality_limited; 90-180 seconds rest; accessory: 2 trips; 10-20 metres or 15-25 seconds; 60-120 seconds rest; realization: exactly_one_legal_mode |
| `stationaryMarch` | preparationActivation: 1-2 sets; 12-20 alternating steps or 15-25 seconds; quality_limited; capacityAccessory: 2 sets; 20-40 alternating steps or 20-40 seconds; moderate/quality_limited; distanceClaim: false |
| `countedStep` | preparationActivation: 1 set; 6-10 steps/side; quality_limited; developmentalAccessory: 2 sets; 8-15 steps/side; quality_limited/moderate; 60-120 seconds rest |
| `recoveryCooldown` | explicitOnly: true; dose: 1 round; 3-5 breath cycles or 20-40 seconds; easy/quality_limited; no developmental credit |
| `effort` | preparationActivation: quality_limited; mainStrength: 1-3 RIR standard; 2-4 RIR regression; secondaryStrength: 2-3 RIR; mainHypertrophy: 1-3 RIR standard; 2-4 RIR regression; accessory: 1-3 RIR required; 2-4 RIR preferred/optional; special: quality_limited or moderate; failureDefault: false |
| `tempo` | exactPhaseTempoDefault: not_prescribed; preparationActivation: controlled intent where legal; strengthHypertrophy: natural or controlled intent according to execution requirement; power: explosive/maximal concentric intent only from explicit legal power facts |
| `duration` | universalTarget: false; unknownOwners: repetition tempo,breathing cadence,locomotor pace,step cadence,rest placement,Sequencing setup/transition; unknownIsNotFitOrFailure: true |
| `blockStructure` | knownProductiveMain: 0-1 preparatory acclimation blocks plus one developmental block; unfamiliarMain: 1-2 preparatory acclimation blocks plus one developmental block; otherAssignments: one block unless the selected rule explicitly requires another; backoffDefault: false |
