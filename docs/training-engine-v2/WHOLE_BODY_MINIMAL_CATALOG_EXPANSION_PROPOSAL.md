# Whole-Body Minimal Catalog Expansion Proposal

Proposal fingerprint: `696fae395bd6383729493d65ac0d4e656799b8797ecf75fdaa327ba33564c5d1`. Exactly eight P0 concepts are owner-curated proposals; none is production data. P1 concepts remain review input only.

P0 (8): standing-calf-raise, side-lying-hip-adduction, loop-band-lateral-walk, side-lying-dumbbell-external-rotation, supine-hamstring-walkout, wall-ankle-dorsiflexion-rock, bodyweight-hip-hinge-rehearsal, supported-single-leg-balance-rehearsal.

P1 (9): machine-shoulder-press, assisted-pull-up, machine-leg-extension, incline-dumbbell-bench-press, suspension-row, half-kneeling-hip-flexor-mobility, side-lying-thoracic-rotation, cable-hip-adduction, cable-hip-abduction.

P2/deferred: barbell-back-squat, barbell-deadlift, barbell-bench-press, unassisted-pull-up, seated-calf-raise, slider-leg-curl, landmine-press, hanging-knee-raise.

Reject/defer as duplicate or low marginal value: preacher-curl (near-duplicate arm slot), rope-triceps-pressdown (attachment-only duplicate), seated-lateral-raise (support variant before support receiver), wide-grip-lat-pulldown (grip variant only), machine-chest-fly (current cable fly already owns direct chest isolation).

Legacy concepts are `REUSE_AS_DATA` only for stable definitional facts, `KEEP_AS_TEST_ORACLE` for observed behavior, `REIMPLEMENT_FROM_PRINCIPLE` for domain contracts, `NEEDS_REVIEW` for exercise-science judgments, and `DO_NOT_PORT` for global phase labels, automatic ladders, prose-derived mechanics, and near-duplicate variations.

## P0: standing-calf-raise

- Identity: **Standing Calf Raise**. Boundary: Equipment-neutral standing bilateral plantar-flexion identity; external load and wall support are prescription/equipment realizations.
- Family/roles/sections: calf_accessory; movement=accessory; training=hypertrophy_accessory; sections=accessory.
- Muscles/regions: primary=calves; secondary=none; incidental=trunk; regions=ankle.
- Equipment/setup: required=stable_loaded_standing_space; optional=dumbbells, wall; prerequisites=standing tolerance; standing, bilateral, none or light-touch wall support; path=bodyweight_or_external_load.
- Mechanics/stress: low skill; moderate balance and ankle range; scapular=not relevant; trunk=incidental upright stabilization only; stress=ankle loading; grip only when load creates it; bilateral unless prescribed otherwise.
- Loading/progression: limited to moderate loadability; local calf fatigue; low systemic fatigue; axes=load, reps, sets, range, tempo; runway=Broad enough for bootstrap direct calf work within available loading.; transitions=Machine/seated calf concepts remain observational and unapproved..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; contextual phase annotation unknown; Mechanically definitional owner review required; no superiority claim.
- Pool/environment: Creates the missing direct-calf primary pool. Equipment-neutral identity permits bodyweight or reviewed external-load realizations.
- Pain/response: Wall support can change balance demand without a new identity; no safety inference. Adjust load, range, support, and unilateral realization after response review.
- Stable-adaptive review: STABLE_SUPPORTING_WORK; possible BOUNDED_ROTATION_ELIGIBLE. Stable ID resolves future education with no engine dependency.
- NEW_SLOT_WHEN: Direct calf development is a real program need.
- DO_NOT_ADD_WHEN: Compound/locomotor exposure is sufficient or time pressure removes direct work.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: No current row has calves as a primary target.
- Owner decision: Approve equipment-neutral identity and wall support as a prescription variant?

## P0: side-lying-hip-adduction

- Identity: **Side-Lying Hip Adduction**. Boundary: Floor-supported direct hip-adduction exercise; Copenhagen-style support loading is a separate identity.
- Family/roles/sections: hip_accessory; movement=none; training=activation, hypertrophy_accessory; sections=activation, accessory.
- Muscles/regions: primary=hip_adductors; secondary=none; incidental=trunk; regions=hip, pelvis.
- Equipment/setup: required=bodyweight, floor_space; optional=loop_band; prerequisites=side-lying floor tolerance; side-lying, substantial floor support; path=bodyweight or optional band.
- Mechanics/stress: low skill; moderate local control; scapular=not relevant; trunk=low contextual lateral-position control; stress=hip adduction; side scope prescription-dependent.
- Loading/progression: limited to moderate; local fatigue; low systemic fatigue; axes=reps, sets, tempo, range, load; runway=Usable bootstrap runway; external loading detail needs review.; transitions=Cable/machine adduction is an equipment transition, never automatic..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Mechanically definitional owner review required.
- Pool/environment: Creates missing direct-adductor primary work. Bodyweight and home compatible.
- Pain/response: Floor support lowers balance demand; region alone does not imply suitability. Range, lever, band, and side can vary under prescription/response authority.
- Stable-adaptive review: STABLE_SUPPORTING_WORK. Stable ID compatible.
- NEW_SLOT_WHEN: Direct adductor development or reviewed preparation is needed.
- DO_NOT_ADD_WHEN: Indirect exposure is sufficient or no direct need exists.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Adductors are secondary only on current rows.
- Owner decision: Approve exact top-leg setup boundary and optional-band realization?

## P0: loop-band-lateral-walk

- Identity: **Loop-Band Lateral Walk**. Boundary: Standing stepping hip-abduction capacity exercise; side-lying abduction is a distinct support/task identity.
- Family/roles/sections: hip_accessory; movement=none; training=activation, hypertrophy_accessory; sections=activation, accessory.
- Muscles/regions: primary=hip_abductors; secondary=glutes; incidental=trunk, quads; regions=hip, pelvis, knee.
- Equipment/setup: required=loop_band, stable_loaded_standing_space; optional=wall; prerequisites=standing and lateral-step tolerance; standing bilateral-to-alternating, optional light wall support; path=loop_band.
- Mechanics/stress: moderate coordination and frontal-plane control; scapular=not relevant; trunk=contextual upright control; stress=hip/knee exposure; alternating side scope.
- Loading/progression: limited loadability; local hip fatigue; low systemic fatigue; axes=steps, sets, band_resistance, range, tempo; runway=Bounded; enough for preparation/direct accessory, not a main anchor.; transitions=Cable abduction may be an equipment/loadability transition after review..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Mechanically definitional owner review required.
- Pool/environment: Creates direct abductor and standing hip-preparation coverage. Uses an existing loop-band capability.
- Pain/response: Optional support changes balance, not identity; exact response remains required. Band position, step range, support, and volume are prescription variables.
- Stable-adaptive review: TEMPORARY_CONTEXTUAL_TOOL or STABLE_SUPPORTING_WORK. Stable ID compatible.
- NEW_SLOT_WHEN: A direct abductor or loaded lateral-control need is explicit.
- DO_NOT_ADD_WHEN: It would be generic activation filler.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Abductors are secondary only and no current exercise directly owns hip abduction.
- Owner decision: Approve action profile and band-position prescription boundary?

## P0: side-lying-dumbbell-external-rotation

- Identity: **Side-Lying Dumbbell External Rotation**. Boundary: Floor-supported direct shoulder external rotation with a small dumbbell; face pulls remain a multi-joint scapular preparation identity.
- Family/roles/sections: cuff_control; movement=none; training=activation, hypertrophy_accessory; sections=activation, accessory.
- Muscles/regions: primary=rotator_cuff; secondary=rear_delts; incidental=none; regions=shoulder.
- Equipment/setup: required=dumbbells, floor_space; optional=towel support; prerequisites=side-lying and shoulder-range tolerance, appropriately light dumbbell; side-lying with substantial floor support; path=free_implement.
- Mechanics/stress: low systemic demand; precise shoulder control; scapular=direct external-rotation contribution; low loaded scapular demand; trunk=minimal; stress=shoulder rotation exposure; prescription side.
- Loading/progression: limited; local cuff fatigue; negligible systemic fatigue; axes=reps, sets, tempo, range, load; runway=Bounded preparation/accessory runway.; transitions=No universal progression to face pull or press..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Identity and mechanics review pending; external reference pending.
- Pool/environment: Creates missing direct cuff-control pool without abusing horizontal pull. Dumbbell gym/home coverage; bodyweight and band-only modes remain explicitly absent.
- Pain/response: Supported setup offers a low-balance option, not a safety claim. Range, load, side, and volume respond to exact realization history.
- Stable-adaptive review: TEMPORARY_CONTEXTUAL_TOOL or STABLE_SUPPORTING_WORK. Stable ID compatible.
- NEW_SLOT_WHEN: Direct cuff control is explicitly needed.
- DO_NOT_ADD_WHEN: Pressing/pulling already meets the session purpose and no cuff slot is needed.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Cuff is secondary only; face pull cannot prove direct external-rotation intent.
- Owner decision: Approve the small-dumbbell identity boundary and optional action vocabulary.

## P0: supine-hamstring-walkout

- Identity: **Supine Hamstring Walkout**. Boundary: Bodyweight bridge-position heel walkout emphasizing knee-flexion leverage; not a loaded hip hinge or machine leg curl.
- Family/roles/sections: glute_hamstring; movement=none; training=activation, hypertrophy_accessory; sections=activation, accessory.
- Muscles/regions: primary=hamstrings; secondary=glutes; incidental=trunk; regions=knee, hip, pelvis.
- Equipment/setup: required=bodyweight, floor_space; optional=none; prerequisites=supine bridge tolerance; supine floor support, bilateral or alternating prescription; path=bodyweight.
- Mechanics/stress: moderate posterior-chain endurance and pelvic control; scapular=not relevant; trunk=contextual anti-extension/position control only; stress=knee-flexion/hip-extension exposure; side scope prescription-dependent.
- Loading/progression: limited; local hamstring fatigue; low systemic fatigue; axes=reps, steps, range, tempo, duration; runway=Bounded but materially extends home knee-flexion coverage.; transitions=Machine leg curl is an equipment/loadability transition, not same-exercise progression..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Mechanics and stress review pending.
- Pool/environment: Creates home-compatible hamstring knee-flexion candidate. Bodyweight/home environments.
- Pain/response: Floor support reduces standing balance and grip needs; exact stress review pending. Walkout distance, bridge height, bilateral/alternating mode, and volume vary by response.
- Stable-adaptive review: STABLE_SUPPORTING_WORK. Stable ID compatible.
- NEW_SLOT_WHEN: Knee-flexion hamstring work is required without a leg-curl machine.
- DO_NOT_ADD_WHEN: A legal tolerated leg curl already serves the direct need or hinge contribution is sufficient.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Current home rows cannot express direct hamstring knee-flexion truth.
- Owner decision: Approve exact identity boundary versus sliders/curls and action profile?

## P0: wall-ankle-dorsiflexion-rock

- Identity: **Wall Ankle Dorsiflexion Rock**. Boundary: Wall-supported ankle-range preparation, not loaded calf training.
- Family/roles/sections: mobility_preparation; movement=mobility; training=preparation; sections=warmup.
- Muscles/regions: primary=none; secondary=calves; incidental=none; regions=ankle, knee.
- Equipment/setup: required=wall, floor_space; optional=none; prerequisites=supported standing tolerance; split stance, partial wall support; path=bodyweight.
- Mechanics/stress: low load; ankle range and joint control; scapular=not relevant; trunk=minimal; stress=ankle dorsiflexion and knee translation; prescription side.
- Loading/progression: none; negligible fatigue; axes=range, reps, tempo; runway=Preparation-only bounded runway.; transitions=No automatic transition to squat or calf exercise..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Mechanically definitional review pending.
- Pool/environment: Creates first truthful mobility-role candidate for ankle/squat preparation. Wall-capable environments.
- Pain/response: Range is prescriptive; no diagnosis or danger inference. Range, distance, side, and reps vary by response.
- Stable-adaptive review: TEMPORARY_CONTEXTUAL_TOOL. Stable ID compatible.
- NEW_SLOT_WHEN: Ankle range is a real dependency for today's loaded task.
- DO_NOT_ADD_WHEN: No ankle-range dependency exists.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: The catalog has no mobility role candidate.
- Owner decision: Approve body-region and exact range-preparation identity?

## P0: bodyweight-hip-hinge-rehearsal

- Identity: **Bodyweight Hip Hinge Rehearsal**. Boundary: Unloaded standing hinge-pattern rehearsal; not glute isolation and not a loaded strength exercise.
- Family/roles/sections: mobility_preparation; movement=hinge; training=preparation, activation; sections=warmup, activation.
- Muscles/regions: primary=glutes, hamstrings; secondary=trunk; incidental=none; regions=hip, pelvis, lumbar_spine.
- Equipment/setup: required=bodyweight, stable_loaded_standing_space; optional=wall; prerequisites=standing tolerance; standing bilateral, optional wall target; path=bodyweight.
- Mechanics/stress: low load; moderate pattern coordination; scapular=not relevant; trunk=position/bracing rehearsal without direct trunk slot; stress=hinge pattern; no accepted loaded-hinge stress until dose creates it.
- Loading/progression: none to limited; low fatigue; axes=range, reps, tempo, support_reduction; runway=Preparation runway only.; transitions=Loaded RDL/pull-through are separate identities and require selection..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Mechanically definitional owner review required.
- Pool/environment: Creates truthful hinge preparation instead of using bridge as hinge practice. Standing-space environments.
- Pain/response: Wall target can bound range; no lumbar intolerance inferred. Range, wall distance, tempo, and repetition count vary.
- Stable-adaptive review: TEMPORARY_CONTEXTUAL_TOOL. Stable ID compatible.
- NEW_SLOT_WHEN: Today's loaded hinge has a real rehearsal dependency.
- DO_NOT_ADD_WHEN: The person is prepared through loaded warm-up sets or no hinge is programmed.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: No current preparation-role row truthfully rehearses a hinge.
- Owner decision: Approve wall-target variant within identity?

## P0: supported-single-leg-balance-rehearsal

- Identity: **Supported Single-Leg Balance Rehearsal**. Boundary: Low-load supported single-leg preparation; not split squat or step-up strength work.
- Family/roles/sections: single_leg_preparation; movement=single_leg; training=activation, preparation; sections=warmup, activation.
- Muscles/regions: primary=glutes; secondary=hip_abductors, trunk; incidental=calves; regions=hip, knee, ankle.
- Equipment/setup: required=wall, stable_loaded_standing_space; optional=none; prerequisites=supported standing tolerance; single-leg with prescription-modifiable wall support; path=bodyweight.
- Mechanics/stress: low load; scalable balance and joint control; scapular=not relevant; trunk=contextual upright control; stress=single-leg stance; prescription side.
- Loading/progression: none to limited; low fatigue; axes=duration, reps, support_reduction, range; runway=Preparation-only bounded runway.; transitions=Split squat/step-up are separate loaded identities..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Mechanically definitional review pending.
- Pool/environment: Creates missing single-leg preparation pool. Wall and standing-space environments.
- Pain/response: Support is explicit and modifiable; side-specific response remains visible. Support, duration, side, and range vary by response.
- Stable-adaptive review: TEMPORARY_CONTEXTUAL_TOOL. Stable ID compatible.
- NEW_SLOT_WHEN: A loaded unilateral task has a real preparation dependency.
- DO_NOT_ADD_WHEN: No single-leg task or assessed dependency exists.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Current single-leg rows are loaded accessory/strength identities, not preparation-role warm-ups.
- Owner decision: Approve balance rehearsal as a selection role without a new movement vocabulary?

## P1: machine-shoulder-press

- Identity: **Machine Shoulder Press**. Boundary: Selectorized guided vertical press; machine geometry remains setup-specific.
- Family/roles/sections: upper_push; movement=vertical_push; training=primary_strength, secondary_strength; sections=main, accessory.
- Muscles/regions: primary=front_delts, triceps; secondary=side_delts; incidental=none; regions=shoulder, elbow.
- Equipment/setup: required=selectorized_machine:shoulder_press; optional=none; prerequisites=machine fit, overhead range tolerance; seated with substantial machine support; path=machine_guided.
- Mechanics/stress: low stability; moderate range/joint control; scapular=loaded upward-rotation behavior requires machine-specific review; trunk=low with seat/back support; stress=overhead_pressing; dose-created axial loading review.
- Loading/progression: high loadability; local shoulder/triceps; moderate systemic; axes=load, reps, sets, range; runway=Broad if machine increments/fit are suitable.; transitions=Dumbbell press is a resistance/support transition, not universal progression..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Machine identity/mechanics owner review pending.
- Pool/environment: Adds support/path diversity to a one-candidate vertical press pool. Uses existing shoulder_press machine capability.
- Pain/response: Support can reduce trunk demand but does not prove shoulder suitability. Load, range, seat setup, and volume vary.
- Stable-adaptive review: ANCHOR_CAPABLE or STABLE_SUPPORTING_WORK. Stable ID compatible.
- NEW_SLOT_WHEN: Supported guided vertical pressing materially changes fit.
- DO_NOT_ADD_WHEN: Dumbbell press is legal, tolerated, and support/path does not matter.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Only one true loaded vertical press exists.
- Owner decision: Approve generic machine boundary despite geometry variability?

## P1: assisted-pull-up

- Identity: **Assisted Pull-Up**. Boundary: Vertical body pull with explicit assistance; unassisted pull-up and pulldown remain distinct load paths.
- Family/roles/sections: upper_pull; movement=vertical_pull; training=primary_strength, secondary_strength; sections=main, accessory.
- Muscles/regions: primary=lats; secondary=biceps, mid_back; incidental=trunk, grip; regions=shoulder, elbow, wrist.
- Equipment/setup: required=pull_up_bar, assistance_capability_pending; optional=none; prerequisites=hanging tolerance, grip capacity, assistance truth; suspended with assistance; path=bodyweight_assisted.
- Mechanics/stress: moderate-high skill, grip, and shoulder range; scapular=loaded vertical scapular control; trunk=contextual suspended control; stress=grip and upper-limb loading; assistance/dose dependent.
- Loading/progression: moderate-high; local pull/grip; moderate systemic; axes=assistance_reduction, reps, sets, range, tempo; runway=Broad when assistance can be quantified.; transitions=Pulldown/pull-up transitions remain contextual..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Equipment and mechanics contract pending.
- Pool/environment: Adds vertical-pull path and progression diversity. Requires explicit pull-up and assistance capabilities; labels cannot manufacture either.
- Pain/response: No shoulder/grip safety inference. Assistance, range, grip, and volume vary after response review.
- Stable-adaptive review: ANCHOR_CAPABLE. Stable ID compatible.
- NEW_SLOT_WHEN: Suspended vertical-pull progression is a real goal/capability fit.
- DO_NOT_ADD_WHEN: Pulldown already meets the need or hanging/grip setup is unsuitable.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Current vertical pulls are pulldown paths only.
- Owner decision: Define assistance capability and identity boundary first.

## P1: machine-leg-extension

- Identity: **Machine Leg Extension**. Boundary: Selectorized open-chain knee extension; not squat-pattern exposure.
- Family/roles/sections: quad_accessory; movement=none; training=hypertrophy_accessory; sections=accessory.
- Muscles/regions: primary=quads; secondary=none; incidental=none; regions=knee.
- Equipment/setup: required=selectorized_machine:knee_extension_pending; optional=none; prerequisites=machine fit, knee-extension tolerance; seated substantial machine support; path=machine_guided.
- Mechanics/stress: low skill/stability; direct knee extension; scapular=not relevant; trunk=minimal; stress=loaded knee extension; bilateral or unilateral machine realization.
- Loading/progression: high local loadability; low systemic fatigue; axes=load, reps, sets, range, tempo; runway=Broad direct-quad accessory runway.; transitions=Leg press/squat transitions are stimulus shifts, not progression..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Equipment identity and stress review pending.
- Pool/environment: Adds direct quad isolation without contaminating squat coverage. Requires a new reviewed machine capability ID.
- Pain/response: Supported setup changes systemic/trunk cost; no knee safety claim. Load, range, side, and volume vary.
- Stable-adaptive review: STABLE_SUPPORTING_WORK. Stable ID compatible.
- NEW_SLOT_WHEN: Direct quad volume is required beyond compound exposure.
- DO_NOT_ADD_WHEN: Compound knee-dominant work sufficiently serves the goal/time budget.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Current quads are compound primary targets only.
- Owner decision: Approve new machine ID and generic machine boundary?

## P1: incline-dumbbell-bench-press

- Identity: **Incline Dumbbell Bench Press**. Boundary: Adjustable-bench inclined press with angle as bounded setup; not a generic chest-region synonym.
- Family/roles/sections: upper_push; movement=horizontal_push; training=primary_strength, secondary_strength; sections=main, accessory.
- Muscles/regions: primary=chest; secondary=front_delts, triceps; incidental=none; regions=shoulder, elbow.
- Equipment/setup: required=dumbbells, adjustable_bench; optional=none; prerequisites=incline setup and pressing tolerance; supine/inclined substantial bench support; path=free_implement.
- Mechanics/stress: moderate stability and pressing range; scapular=loaded pressing mechanics require review; trunk=low with bench support; stress=horizontal/angled pressing; angle-dependent overhead exposure review.
- Loading/progression: high; local chest/delts/triceps; moderate systemic; axes=load, reps, sets, tempo, bench_angle_bounded; runway=Broad.; transitions=Flat press is a contextual emphasis/setup shift..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Marginal-value and regional-emphasis owner review pending.
- Pool/environment: Potential regional/emphasis diversity, not required baseline coverage. Adjustable-bench environments only.
- Pain/response: Angle may change response but cannot be presumed preferable. Load, range, angle, tempo, and volume vary.
- Stable-adaptive review: ANCHOR_CAPABLE or BOUNDED_ROTATION_ELIGIBLE. Stable ID compatible.
- NEW_SLOT_WHEN: Reviewed regional emphasis or response makes incline materially distinct.
- DO_NOT_ADD_WHEN: It merely duplicates flat pressing.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Current schema cannot express reviewed chest-region emphasis; flat presses cover general chest.
- Owner decision: Does chest-region emphasis have a real Composer receiver before adding identity?

## P1: suspension-row

- Identity: **Suspension Row**. Boundary: Body-angle horizontal body pull using a rated suspension anchor; not an improvised table row.
- Family/roles/sections: upper_pull; movement=horizontal_pull; training=primary_strength, secondary_strength, hypertrophy_accessory; sections=main, accessory.
- Muscles/regions: primary=mid_back, lats; secondary=biceps, rear_delts; incidental=trunk, grip; regions=shoulder, elbow, wrist.
- Equipment/setup: required=suspension_trainer_and_rated_anchor_pending; optional=none; prerequisites=rated anchor, grip and plank/body-angle control; feet supported, suspended hand support; path=bodyweight.
- Mechanics/stress: body-angle-scaled stability, grip, and coordination; scapular=loaded retraction/protraction control; trunk=contextual anti-extension contribution; stress=grip and upper-limb support; body-angle dependent.
- Loading/progression: moderate; pull/grip local; low-moderate systemic; axes=body_angle, reps, sets, tempo, range; runway=Useful home runway with rated equipment.; transitions=Band/cable/free rows are equipment/path shifts..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Equipment/safety boundary and mechanics review pending.
- Pool/environment: Addresses home horizontal pulling where a rated anchor exists. Requires new explicit suspension capability; no environment-label inference.
- Pain/response: Body angle scales demand; no universal lumbar/shoulder claim. Angle, range, grip, and volume vary.
- Stable-adaptive review: ANCHOR_CAPABLE or STABLE_SUPPORTING_WORK. Stable ID compatible.
- NEW_SLOT_WHEN: Home horizontal pull lacks cable/band/dumbbell support but rated suspension exists.
- DO_NOT_ADD_WHEN: No rated anchor exists or current rows already provide the needed pull.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: Anchor-free/bodyweight profiles currently have no horizontal pull.
- Owner decision: Approve suspension capability before catalog addition?

## P1: half-kneeling-hip-flexor-mobility

- Identity: **Half-Kneeling Hip Flexor Mobility**. Boundary: Half-kneeling hip-range preparation; not direct hip-flexor strengthening.
- Family/roles/sections: mobility_preparation; movement=mobility; training=preparation, recovery; sections=warmup, cooldown.
- Muscles/regions: primary=none; secondary=glutes; incidental=trunk; regions=hip, pelvis.
- Equipment/setup: required=floor_space; optional=wall; prerequisites=kneeling tolerance; half-kneeling, optional wall support; path=bodyweight.
- Mechanics/stress: low load; hip range and pelvic control; scapular=not relevant; trunk=breathing/position contribution only; stress=hip extension range; prescription side.
- Loading/progression: none; negligible fatigue; axes=range, duration, reps, tempo; runway=Preparation/recovery only.; transitions=No automatic transition to loaded lower-body work..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Need and identity review pending.
- Pool/environment: Adds hip-range preparation/cooldown option. Floor-space environments.
- Pain/response: Kneeling and range tolerance must be explicit. Range, support, duration, and side vary.
- Stable-adaptive review: TEMPORARY_CONTEXTUAL_TOOL. Stable ID compatible.
- NEW_SLOT_WHEN: A reviewed hip-range dependency relates to today's loaded work.
- DO_NOT_ADD_WHEN: It would be generic mobility filler.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: No current mobility-role hip preparation exists.
- Owner decision: Is hip-range preparation a frequent enough receiver for P1?

## P1: side-lying-thoracic-rotation

- Identity: **Side-Lying Thoracic Rotation**. Boundary: Supported thoracic rotation mobility drill; not loaded trunk rotation.
- Family/roles/sections: mobility_preparation; movement=mobility; training=preparation, recovery; sections=warmup, cooldown.
- Muscles/regions: primary=none; secondary=trunk; incidental=none; regions=thoracic_spine, ribcage, shoulder.
- Equipment/setup: required=floor_space; optional=none; prerequisites=side-lying and shoulder-range tolerance; side-lying with substantial floor support; path=bodyweight.
- Mechanics/stress: low load; controlled thoracic/shoulder range; scapular=low-load reach only; trunk=controlled rotation contribution without loaded-rotation role; stress=unloaded rotation; prescription side.
- Loading/progression: none; negligible fatigue; axes=range, reps, tempo, duration; runway=Preparation/recovery only.; transitions=Cable chop is separate loaded rotation identity..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; Need/identity review pending.
- Pool/environment: Adds thoracic movement preparation when relevant. Bodyweight/floor environments.
- Pain/response: Range remains bounded by response; no diagnostic inference. Range, side, breath timing, and reps vary.
- Stable-adaptive review: TEMPORARY_CONTEXTUAL_TOOL. Stable ID compatible.
- NEW_SLOT_WHEN: Thoracic range is a reviewed dependency for the session.
- DO_NOT_ADD_WHEN: It is unrelated generic cooldown content.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: No current mobility-role thoracic candidate exists.
- Owner decision: Approve thoracic-range receiver and boundary from shoulder mobility?

## P1: cable-hip-adduction

- Identity: **Cable Hip Adduction**. Boundary: Standing cable-resisted hip adduction; not the floor-supported P0 identity.
- Family/roles/sections: hip_accessory; movement=none; training=hypertrophy_accessory; sections=accessory.
- Muscles/regions: primary=hip_adductors; secondary=none; incidental=trunk, hip_abductors; regions=hip, pelvis.
- Equipment/setup: required=cable_stack, cable_anchor_low, stable_loaded_standing_space; optional=wall; prerequisites=ankle cuff, standing tolerance; standing unilateral with optional wall support; path=cable_anchored.
- Mechanics/stress: moderate balance and frontal-plane control; scapular=not relevant; trunk=contextual upright control; stress=hip adduction; prescription side.
- Loading/progression: moderate-high local; low systemic; axes=load, reps, sets, range, tempo, support_reduction; runway=Broad direct-accessory runway.; transitions=Floor adduction is support/equipment shift..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; P1 identity/equipment review pending.
- Pool/environment: Adds loadability/path diversity after direct-adductor bootstrap. Low cable and cuff required.
- Pain/response: Support can reduce balance cost; no suitability inference. Load, range, support, side, and volume vary.
- Stable-adaptive review: STABLE_SUPPORTING_WORK or BOUNDED_ROTATION_ELIGIBLE. Stable ID compatible.
- NEW_SLOT_WHEN: Higher-load direct adduction is needed and legal.
- DO_NOT_ADD_WHEN: Floor-supported P0 work is sufficient.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: No current direct adductor row; P0 adds only limited floor loadability.
- Owner decision: Model ankle-cuff prerequisite/equipment explicitly?

## P1: cable-hip-abduction

- Identity: **Cable Hip Abduction**. Boundary: Standing cable-resisted hip abduction; distinct from loop-band lateral stepping.
- Family/roles/sections: hip_accessory; movement=none; training=hypertrophy_accessory; sections=accessory.
- Muscles/regions: primary=hip_abductors; secondary=glutes; incidental=trunk, hip_adductors; regions=hip, pelvis.
- Equipment/setup: required=cable_stack, cable_anchor_low, stable_loaded_standing_space; optional=wall; prerequisites=ankle cuff, standing tolerance; standing unilateral with optional wall support; path=cable_anchored.
- Mechanics/stress: moderate balance and hip control; scapular=not relevant; trunk=contextual upright control; stress=hip abduction; prescription side.
- Loading/progression: moderate-high local; low systemic; axes=load, reps, sets, range, tempo, support_reduction; runway=Broad direct-accessory runway.; transitions=Loop-band walk is a task/equipment shift..
- Phase/evidence: EXTERNAL_REFERENCE_PENDING; P1 identity/equipment review pending.
- Pool/environment: Adds direct-abductor path/loadability diversity. Low cable and cuff required.
- Pain/response: Support changes balance; no safety inference. Load, range, support, side, and volume vary.
- Stable-adaptive review: STABLE_SUPPORTING_WORK or BOUNDED_ROTATION_ELIGIBLE. Stable ID compatible.
- NEW_SLOT_WHEN: Higher-load isolated abduction has marginal value.
- DO_NOT_ADD_WHEN: Loop-band or compound exposure is sufficient.
- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: No current direct abductor row; P0 has limited loadability and a stepping task.
- Owner decision: Model ankle-cuff prerequisite/equipment explicitly?

## Implementation Gates

- Separate owner authorization is required before any P0 proposal becomes a production row.
- Exercise-science review complete P0 mechanics, stress, phase, equipment, and provenance contracts before admission.

Any proposal-to-production admission remains a separately authorized task. It must not begin Session Composer, Week Composer, automatic rotation/replacement/progression, or Knowledge UI work.
