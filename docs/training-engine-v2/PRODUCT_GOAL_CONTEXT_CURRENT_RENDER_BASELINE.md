# Product Goal and Context Current Render Baseline

Current branch commit: `3f46f40da6405725b7694252ac7e127c0cd1df09`. All state is synthetic. PNG artifacts remain ignored under app-local `test-results`; semantic review does not depend on pixel-perfect equality or background crop.

| App | Route | Viewport | State | Conditional | Overflow | Fixed overlap | Artifact SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| consumer | /questionnaire | 1440x900 | questionnaire_default | none | false | false | 0cb4bebe95ffb6d09d38df6bb6f7b0fefc33228215719a15464d76b63890ba72 |
| consumer | /questionnaire | 1440x900 | goal_improve_posture | selected_goal | false | false | 0cb4bebe95ffb6d09d38df6bb6f7b0fefc33228215719a15464d76b63890ba72 |
| consumer | /questionnaire | 1440x900 | goal_reduce_pain | selected_goal | false | false | 4caa44893895c6ad00994c7a08330af5f875a49028b342032efc96976c45e82b |
| consumer | /questionnaire | 1440x900 | goal_athletic_performance | selected_goal | false | false | 86294e6d62fd64c8e18bd15c26cf1e894097fd8ebc55bda5fee6b9e82ab6186a |
| consumer | /questionnaire | 1440x900 | goal_general_fitness | selected_goal | false | false | 10d61ff4a9a8efea67f3f0ec1fcfa132cb8d43318ca5fdcb9c23109a43bd3927 |
| consumer | /questionnaire | 1440x900 | training_mode_build | selected_mode | false | false | 10d61ff4a9a8efea67f3f0ec1fcfa132cb8d43318ca5fdcb9c23109a43bd3927 |
| consumer | /questionnaire | 1440x900 | training_mode_maintain | selected_mode | false | false | d0b4af9c77fb73a915238fb0b1d93e7aad1d05af257a4bf7a2c7dcf683d9d247 |
| consumer | /questionnaire | 1440x900 | training_mode_recover | selected_mode | false | false | 4dbe3f9cc4abf9f9bda8641762754d21f2db8e1232cb11c92d5f4df43fba9950 |
| consumer | /questionnaire | 1440x900 | equipment_none | equipment_selected_no_detail | false | false | 8102e97fa2d796a94f5b299317be03f895bbbe334c62d09487e3611967a9aad6 |
| consumer | /questionnaire | 1440x900 | equipment_bands | bands_selected_no_detail_present | false | false | bed926ee17f78a91c2f281bf413f2155cf77011ea6824bc4d277708cde6a5419 |
| consumer | /questionnaire | 1440x900 | equipment_dumbbells | equipment_selected_no_detail | false | false | 489bb8704c3a45feb8aa130fc905f48685fa762d3c37342b0a9d08e84e4f9a8f |
| consumer | /questionnaire | 1440x900 | equipment_gym | equipment_selected_no_detail | false | false | 505da7063b4e56ff4f69eb5fe0e895e812dcb785fb61a87f8610b332c2a30858 |
| consumer | /questionnaire | 1024x768 | questionnaire_responsive | none | false | false | fe719e37b37d9968444749815dc429de52d3f7796a7702bc93a6fb2a0c726ae5 |
| consumer | /questionnaire | 390x844 | questionnaire_responsive | one_column | false | false | cb639faf40810fd1946a420878eace05c220d1a636b6e010a66ed6e416fd734e |
| consumer | /questionnaire | 360x800 | questionnaire_responsive | one_column | false | false | de180bff2a3b764908be5bcf8e264a9451fec6d4c5164c7f9fb22ad08d18a9b3 |
| consumer | /questionnaire | 320x800 | questionnaire_responsive | one_column | false | false | c230ea4ac1916af8c8052ea3ff7d3001e43d0743efdcd167e21056cf80606a87 |
| consumer | /questionnaire | 390x844 | dirty_state_confirmation | confirmation_dialog | false | false | 65cf39838d7e9cf612c724b0b689fd8b7cf51d62cafc9003807c839d9debf9dc |
| consumer | /questionnaire | 390x844 | active_session_warning | confirmation_dialog_with_active_session_warning | false | false | 8f2f420b271473e069d456148b7d250294c37754feee2cb5c6736bd058eceea5 |
| gyms | /questionnaire | 1440x900 | questionnaire_default | training_mode_absent | false | false | d4831cacd8d9f44734992c0278e7e70a380339c81d47a1ef2495c18000f1b6b6 |
| gyms | /questionnaire | 390x844 | questionnaire_default | training_mode_absent_one_column | false | false | 2f7e39aa9ccc6c5c9d1545a1b26da1617826019d05c710a3a3729dab36fb6e85 |
| gyms | /questionnaire?demo=buyer | 1440x900 | buyer_demo_locked_equipment | equipment_locked_by_gym_owner | false | false | 8c4bee623669204abed9daca4f3c3046b18845dee8fc54708812c4a60a1d6045 |
| gyms | /questionnaire?demo=buyer | 390x844 | buyer_demo_locked_equipment | equipment_locked_by_gym_owner_one_column | false | false | abeb5e428a1cecaf5aa7749718658e10b87f7269a4bc07de7a58b7736728c817 |

Consumer result: `18_CURRENT_HEAD_STATES_RENDERED`. Gyms result: `4_CURRENT_HEAD_STATES_RENDERED`.

Current accessibility observations remain findings, not WCAG conformance claims:

- grouped_choices_are_not_fieldsets_with_legends
- primary_goal_select_has_no_associated_label
- selection_state_is_not_explicitly_exposed_with_aria_pressed
- gyms_buyer_demo_unselected_experience_labels_have_low_visible_contrast_in_capture

Fingerprint: `0d4cd4838ccdb14310fe2fab9413a238ac2d995b1d15dbb3141f57e13ae48326`.
