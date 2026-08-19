# Product Goal and Context Current Implementation Ownership

| Field | Classifications | Current behavior | Future disposition |
| --- | --- | --- | --- |
| goals | legacy_Product_authority, current_UI_only, current_engine_input, current_signature_input, current_shadow_mapping_input, duplicated_consumer_gyms | select label persists, regenerates legacy Program, signs change identity, and enters shadow mapping | migrate explicitly to canonical primaryGoal ID |
| painAreas | legacy_Product_authority, current_engine_input, current_signature_input, current_shadow_mapping_input, context_only, duplicated_consumer_gyms | checkbox regions persist, influence legacy generation, sign identity, and map as context | retain as optional programmingContexts without outcome ownership |
| experience | legacy_Product_authority, current_engine_input, current_signature_input, current_shadow_mapping_input, duplicated_consumer_gyms | coarse label persists and enters legacy generation/signature/shadow | retain as coarseExperience; calibration owns exact realization |
| equipment | legacy_Product_authority, current_engine_input, current_signature_input, current_shadow_mapping_input, duplicated_consumer_gyms | top-level labels persist; legacy gym expands capability; shadow records presence only | separate environment from exact capabilities |
| daysPerWeek | legacy_Product_authority, current_engine_input, current_signature_input, current_shadow_mapping_input, duplicated_consumer_gyms | 3/4/5 persists, shapes generation/signature, and maps opportunity count | retain as opportunity count without weekday or duration inference |
| trainingIntent | legacy_Product_authority, current_UI_only, current_engine_input, current_shadow_mapping_input, duplicated_consumer_gyms | consumer renders it; gyms schema accepts it but does not render it; engine defaults absent to build; signature omits it | versioned trainingMode semantic input before activation |
| questionnaire_storage | legacy_Product_authority | localStorage plus server training snapshot patch | old profiles remain readable; no migration on read |
| questionnaire_signature_v1 | legacy_Product_authority, migration_required | JSON identity over goals, painAreas, experience, equipment, daysPerWeek | freeze V1 and add explicit V2 |
| gym_equipment_lock | current_UI_only, locked_by_gym_owner | buyer-demo presentation normalizes and overwrites equipment with configured gym profile | surface-specific presentation over a future shared schema |
| band_subtype | unresolved, future_structured_input | owner-reported but absent from branch | conditional capability only when legality requires |
| goalFocus | future_structured_input | not captured | required for broad goals |
| secondaryGoal | future_structured_input | not captured | optional, collapsed, at most one |
| sessionMinutes | future_structured_input | not captured | required for exact fit claims |
| equipmentCapabilities | future_structured_input | not captured | minimal conditional legality facts |
| page_title_and_helper | display_only, duplicated_consumer_gyms | consumer and ordinary gyms share current copy; buyer demo diverges | future consumer training-profile copy |
| assessment_photos | context_only | separate Step 1 local assessment input | no upload requirement for pain/context migration |

## Audit answers

| Question | Answer |
| --- | --- |
| legacyProgramRegenerationFields | goals, painAreas, experience, equipment, daysPerWeek, trainingIntent |
| currentSignatureFields | goals, painAreas, experience, equipment, daysPerWeek |
| currentShadowMappingFields | goals, painAreas, experience, equipment, daysPerWeek, trainingIntent |
| trainingIntentParticipatesInChangeIdentity | false |
| consumerAndGymsSchemasIdentical | true |
| schemaParityQualification | duplicated structural types are currently equivalent, but presentation and option ownership differ |
| gymModeLockLayer | presentation_and_normalization_layer_not_schema |
| futureCanonicalContractLocation | a new inert Product-owned contract module, separate from QuestionnaireForm and engine generation, before activation |
| fCanAddInactiveOptionWithoutRouteChange | true |
| fCanAvoidLegacyGenerateProgram | true |
| existingConfirmationCanRemainExact | true |
| currentStoredValuesRemainReadable | true |
| newSchemaVersionRequiredBeforeActivation | true |
| legacyGymOverstatesCapability | true |
| reportedBandSubtypePresentInBranch | false |
| kneesPresentInBranchQuestionnaire | false |
| deploymentDrift | knees_pain_choice, resistance_band_detail, owner_declared_mobile_crop_inventory |
| eTopClassificationCanBeEarnedWithRecordedDrift | true |

Fingerprint: `3f78bbb5d7d582d2d3b7a5c09db1035e31fbe88e7c32d988eb2e6ea48d54b06b`.
