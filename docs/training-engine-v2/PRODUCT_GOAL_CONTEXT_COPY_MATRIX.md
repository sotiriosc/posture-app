# Product Goal and Context Copy Matrix

| Field | Label | Helper | Validation | Unsupported | F relevance | Later relevance |
| --- | --- | --- | --- | --- | --- | --- |
| page_intro | Build your Praxis training profile | Choose what you're working toward, what Praxis should train around, and the equipment you can use. You can update this later. |  |  | may_preserve_current | target |
| primary_goal | What do you want to work toward? | Choose one primary outcome. | Choose a primary goal. | This goal needs another choice before Praxis can build a plan. | get_stronger_preview | target |
| fitness_focus | What matters most right now? | Choose the focus that best matches your goal. | Choose a fitness focus. | Conditioning needs a separately supported policy. | none | required_for_broad_goal |
| performance_focus | What kind of performance are you training for? | Choose the performance quality you want to develop. | Choose a performance focus. | This focus is not yet available for plan generation. | none | required_for_athletic |
| pain_context | Anything Praxis should train around? | Pain or limitations change how the plan is realized. They do not replace your goal. |  |  | unchanged | target |
| reduce_pain_migration | Your previous focus was "Reduce pain." | What would you like to work toward while Praxis trains around your pain or limitations? | Choose a primary goal to continue. |  | none | required |
| training_mode | How should Praxis approach your training right now? | Choose the approach that fits your current training state. | Choose a training approach. | This mode needs additional policy before activation. | unchanged | target |
| secondary_goal | Add a secondary goal | Optional. Your primary goal remains in charge. | Choose a goal different from your primary goal. | This combination is not yet supported. | none | optional |
| days_per_week | How many days can you train most weeks? | Choose 3, 4, or 5 days. | Choose how many days you can train. |  | unchanged | target |
| session_minutes | How long can most sessions be? | Choose a typical session length or Not sure. |  |  | none | owner_review_required |
| experience | Training experience | This helps Praxis choose a starting approach. It does not assume your exact loads or familiarity with every exercise. | Choose your current experience level. |  | unchanged | target |
| equipment_environment | Equipment | Choose the equipment environment you can use. | Choose an equipment environment. |  | unchanged | target |
| band_detail | Which resistance bands can you use? | Choose only what you know is available. | Choose a band type or Not sure. |  | none | conditional |
| submit | Build my Praxis plan |  | Review the highlighted fields. | This selection cannot generate a plan yet. | preview_must_fail_closed | target |

Fingerprint: `6aec3b7d1eb60ef41dc7b34e26aaeb4bb44a6377803afa7119e798626c87bba4`.
