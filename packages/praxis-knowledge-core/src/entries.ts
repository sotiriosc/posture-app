import {
  KNOWLEDGE_ENTRY_CONTRACT,
  KNOWLEDGE_FACT_CONTRACT,
  KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
  KNOWLEDGE_PROVENANCE_CONTRACT,
  REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
  type ExerciseKnowledgeEntry,
  type ExerciseKnowledgeFact,
  type ExerciseKnowledgeFactKind,
  type ExerciseKnowledgeProvenance,
  type ExerciseRealizationKnowledgeOverride,
} from "./contracts";

const OWNER_DECISION_REF =
  "docs/training-engine-v2/PACKAGE_R_HOME_FIRST_MIXED_RELEASE_OWNER_DECISION.md";
const HUMAN_REVIEW_REF = "human-review:package-r:2026-08-16";

const ownerProvenance = (exerciseId: string): ExerciseKnowledgeProvenance => ({
  contract: KNOWLEDGE_PROVENANCE_CONTRACT,
  sourceType: "owner_decision",
  sourceRef: OWNER_DECISION_REF,
  evidenceBasis: [`Owner selected and bounded the ${exerciseId} production identity.`],
});

const humanReviewProvenance = (exerciseId: string): ExerciseKnowledgeProvenance => ({
  contract: KNOWLEDGE_PROVENANCE_CONTRACT,
  sourceType: "human_exercise_science_review",
  sourceRef: HUMAN_REVIEW_REF,
  evidenceBasis: [
    `Setup, execution, pattern, and observation language for ${exerciseId} was independently reviewed as non-diagnostic coaching content.`,
  ],
});

const externalProvenance = (
  sourceRef: string,
  evidenceBasis: string,
): ExerciseKnowledgeProvenance => ({
  contract: KNOWLEDGE_PROVENANCE_CONTRACT,
  sourceType: "external_reference",
  sourceRef,
  evidenceBasis: [evidenceBasis],
});

const resistanceProgressionEvidence = externalProvenance(
  "https://pubmed.ncbi.nlm.nih.gov/11828249/",
  "Resistance exercise selection and progression remain specific to goals, capacity, and training status; this source does not prescribe row-specific technique.",
);
const bandEvidence = externalProvenance(
  "https://pubmed.ncbi.nlm.nih.gov/30815258/",
  "Elastic resistance can provide effective resistance training; band setup and force are not converted to kilograms by this entry.",
);
const machineEvidence = externalProvenance(
  "https://pubmed.ncbi.nlm.nih.gov/37582807/",
  "Machine and free-weight outcomes are task-specific; this entry makes no universal safety or superiority claim.",
);
const birdDogEvidence = externalProvenance(
  "https://pubmed.ncbi.nlm.nih.gov/29290418/",
  "Bird-dog is a trunk-demanding sensorimotor task; the study does not establish treatment effects.",
);

type PresentationCategory = "focus" | "cues" | "setup" | "during" | "pattern" | "watchFor";

interface FactSpec {
  readonly suffix: string;
  readonly kind: ExerciseKnowledgeFactKind;
  readonly statement: string;
  readonly compact?: string;
  readonly categories?: readonly PresentationCategory[];
  readonly realizationIds?: readonly string[];
}

interface OverrideSpec {
  readonly id: string;
  readonly realizationId: string;
  readonly addSetup?: readonly string[];
  readonly addDuring?: readonly string[];
  readonly addWatchFor?: readonly string[];
  readonly focus?: string;
  readonly equipment?: readonly string[];
}

interface EntrySpec {
  readonly exerciseId: string;
  readonly canonicalName: string;
  readonly facts: readonly FactSpec[];
  readonly overrides?: readonly OverrideSpec[];
  readonly mechanics: readonly string[];
  readonly roles: readonly string[];
  readonly actions: readonly string[];
  readonly stress: readonly string[];
  readonly painTopics?: readonly string[];
  readonly extraProvenance?: readonly ExerciseKnowledgeProvenance[];
  readonly unresolvedClaims?: readonly string[];
}

function defineEntry(spec: EntrySpec): ExerciseKnowledgeEntry {
  const baseProvenance = Object.freeze([
    ownerProvenance(spec.exerciseId),
    humanReviewProvenance(spec.exerciseId),
    ...(spec.extraProvenance ?? [resistanceProgressionEvidence]),
  ]);
  const id = (suffix: string) => `${spec.exerciseId}.${suffix}`;
  const facts: readonly ExerciseKnowledgeFact[] = Object.freeze(spec.facts.map((fact) => ({
    contract: KNOWLEDGE_FACT_CONTRACT,
    id: id(fact.suffix),
    exerciseId: spec.exerciseId,
    kind: fact.kind,
    canonicalStatement: fact.statement,
    ...(fact.compact ? { compactInstruction: fact.compact } : {}),
    applicability: {
      realizationIds: Object.freeze([...(fact.realizationIds ?? [])]),
      contexts: Object.freeze(["workout", "library", "curation"] as const),
    },
    reviewStatus: "accepted" as const,
    provenance: baseProvenance,
  })));
  const refs = (category: PresentationCategory) => Object.freeze(
    spec.facts.filter((fact) => fact.categories?.includes(category)).map((fact) => id(fact.suffix)),
  );
  const focusRefs = refs("focus");
  const realizationOverrides: readonly ExerciseRealizationKnowledgeOverride[] = Object.freeze(
    (spec.overrides ?? []).map((override) => ({
      contract: REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
      id: id(`realization.${override.id}`),
      exerciseId: spec.exerciseId,
      realizationId: override.realizationId,
      ...(override.addSetup ? { addSetupRefs: override.addSetup.map(id) } : {}),
      ...(override.addDuring ? { addDuringRefs: override.addDuring.map(id) } : {}),
      ...(override.addWatchFor ? { addWatchForRefs: override.addWatchFor.map(id) } : {}),
      ...(override.focus ? { focusRef: id(override.focus) } : {}),
      ...(override.equipment ? { equipmentBoundaryRefs: override.equipment.map(id) } : {}),
      reviewStatus: "accepted" as const,
      provenance: baseProvenance,
    })),
  );

  if (focusRefs.length !== 1) {
    throw new Error(`KNOWLEDGE_FOCUS_REFERENCE_COUNT_INVALID:${spec.exerciseId}`);
  }

  return Object.freeze({
    contract: KNOWLEDGE_ENTRY_CONTRACT,
    exerciseId: spec.exerciseId,
    canonicalName: spec.canonicalName,
    facts,
    presentation: Object.freeze({
      contract: KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
      exerciseId: spec.exerciseId,
      focus: focusRefs[0]!,
      cues: refs("cues"),
      setup: refs("setup"),
      during: refs("during"),
      pattern: refs("pattern"),
      watchFor: refs("watchFor"),
    }),
    realizationOverrides,
    relatedMechanicsIds: Object.freeze([...spec.mechanics]),
    relatedMovementRoleIds: Object.freeze([...spec.roles]),
    relatedActionFunctionIds: Object.freeze([...spec.actions]),
    relatedStressTags: Object.freeze([...spec.stress]),
    relatedPainTopicIds: Object.freeze([...(spec.painTopics ?? [])]),
    reviewStatus: "accepted",
    provenance: baseProvenance,
    unresolvedClaims: Object.freeze([...(spec.unresolvedClaims ?? [])]),
  });
}

export const DUMBBELL_FLOOR_PRESS_KNOWLEDGE = defineEntry({
  exerciseId: "dumbbell-floor-press",
  canonicalName: "Dumbbell Floor Press",
  facts: [
    { suffix: "focus.floor-bounded-press", kind: "execution_instruction", statement: "Press the dumbbells upward while the upper arms finish each lowering phase on the floor.", compact: "Press up from a floor-bounded bottom position", categories: ["focus"] },
    { suffix: "cue.wrist-over-elbow", kind: "execution_instruction", statement: "Keep each wrist stacked over its elbow through the press.", compact: "Stack wrists over elbows", categories: ["cues"] },
    { suffix: "cue.steady-base", kind: "execution_instruction", statement: "Keep the feet, pelvis, and upper back steady as the dumbbells move.", compact: "Keep a steady floor base", categories: ["cues"] },
    { suffix: "cue.controlled-touch", kind: "execution_instruction", statement: "Lower with control until the upper arms make a quiet floor contact.", compact: "Touch the floor quietly", categories: ["cues"] },
    { suffix: "setup.supine-floor", kind: "setup_instruction", statement: "Lie supine with the upper back and pelvis supported by clear floor space.", categories: ["setup"] },
    { suffix: "setup.feet-supported", kind: "setup_instruction", statement: "Place both feet securely and begin with the dumbbells controlled beside the torso.", categories: ["setup"] },
    { suffix: "equipment.no-bench", kind: "equipment_boundary", statement: "This realization requires floor space and one or two dumbbells; a bench is not required.", categories: ["setup"] },
    { suffix: "during.vertical-forearms", kind: "execution_instruction", statement: "Maintain a forearm position that remains close to vertical while pressing and lowering.", categories: ["during"] },
    { suffix: "during.bounded-range", kind: "execution_instruction", statement: "Use the floor contact as the bottom boundary instead of forcing additional shoulder range.", categories: ["during"] },
    { suffix: "during.finish-controlled", kind: "safety_boundary", statement: "Finish the set only after the dumbbells are controlled back to a stable start position.", categories: ["during"] },
    { suffix: "pattern.horizontal-press", kind: "movement_pattern", statement: "A floor-supported horizontal press uses floor contact to bound the lowering range.", compact: "Floor-supported horizontal press with a bounded lowering range.", categories: ["pattern"] },
    { suffix: "watch.elbows-drifting", kind: "watch_for", statement: "Watch for elbows drifting far from the forearm line.", categories: ["watchFor"] },
    { suffix: "watch.bouncing", kind: "watch_for", statement: "Watch for bouncing the upper arms off the floor to start the press.", categories: ["watchFor"] },
    { suffix: "watch.unstable-finish", kind: "watch_for", statement: "Watch for a rushed finish that leaves a dumbbell uncontrolled.", categories: ["watchFor"] },
    { suffix: "realization.single.setup", kind: "setup_instruction", statement: "For a one-dumbbell realization, center the unloaded arm and trunk before the first repetition.", realizationIds: ["one-dumbbell-unilateral"] },
    { suffix: "realization.single.during", kind: "execution_instruction", statement: "For a one-dumbbell realization, resist trunk rotation without changing the horizontal-press task.", realizationIds: ["one-dumbbell-unilateral"] },
    { suffix: "realization.single.watch", kind: "watch_for", statement: "Watch for the torso rolling toward or away from the loaded side.", realizationIds: ["one-dumbbell-unilateral"] },
  ],
  overrides: [{ id: "one-dumbbell", realizationId: "one-dumbbell-unilateral", addSetup: ["realization.single.setup"], addDuring: ["realization.single.during"], addWatchFor: ["realization.single.watch"] }],
  mechanics: ["support.supine-floor", "resistance.free-implement", "laterality.bilateral-or-unilateral"],
  roles: ["horizontal_push"], actions: ["shoulder_horizontal_adduction", "elbow_extension"], stress: ["horizontal_pressing"], painTopics: ["shoulder-response-context", "elbow-response-context"],
});

export const DUMBBELL_TRICEPS_EXTENSION_KNOWLEDGE = defineEntry({
  exerciseId: "dumbbell-triceps-extension",
  canonicalName: "Dumbbell Triceps Extension",
  facts: [
    { suffix: "focus.elbow-extension", kind: "execution_instruction", statement: "Extend the elbows while keeping the upper-arm path consistent.", compact: "Extend at the elbows with a steady upper-arm path", categories: ["focus"] },
    { suffix: "cue.secure-grip", kind: "execution_instruction", statement: "Maintain a secure two-hand grip on the single dumbbell.", compact: "Keep a secure two-hand grip", categories: ["cues"] },
    { suffix: "cue.ribs-stacked", kind: "execution_instruction", statement: "Keep the ribcage organized over the pelvis as the dumbbell moves.", compact: "Keep ribs over pelvis", categories: ["cues"] },
    { suffix: "cue.smooth-turnaround", kind: "execution_instruction", statement: "Reverse the lowering phase smoothly without dropping into the bottom position.", compact: "Reverse the bottom smoothly", categories: ["cues"] },
    { suffix: "setup.standing-overhead", kind: "setup_instruction", statement: "Stand in clear stable space and establish a controlled two-hand overhead hold with one dumbbell.", categories: ["setup"] },
    { suffix: "setup.elbow-path", kind: "setup_instruction", statement: "Choose an elbow and shoulder position that can remain consistent through the intended range.", categories: ["setup"] },
    { suffix: "equipment.single-dumbbell", kind: "equipment_boundary", statement: "The admitted realization uses one dumbbell held by both hands; lying and separate-dumbbell paths are not implied.", categories: ["setup"] },
    { suffix: "during.elbows-drive", kind: "execution_instruction", statement: "Drive the movement by straightening the elbows rather than changing the torso position.", categories: ["during"] },
    { suffix: "during.range-owned", kind: "execution_instruction", statement: "Use only the range in which the grip, upper-arm path, and trunk position remain controlled.", categories: ["during"] },
    { suffix: "during.safe-finish", kind: "safety_boundary", statement: "Return the dumbbell to a controlled position before ending the set.", categories: ["during"] },
    { suffix: "pattern.direct-extension", kind: "movement_pattern", statement: "A standing overhead dumbbell triceps extension is a direct elbow-extension accessory with an explicit shoulder and implement path.", compact: "Direct elbow-extension accessory using one overhead dumbbell.", categories: ["pattern"] },
    { suffix: "watch.torso-extension", kind: "watch_for", statement: "Watch for the torso leaning or extending to move the dumbbell.", categories: ["watchFor"] },
    { suffix: "watch.elbow-path-change", kind: "watch_for", statement: "Watch for an abrupt change in elbow position between lowering and pressing.", categories: ["watchFor"] },
    { suffix: "watch.grip-shift", kind: "watch_for", statement: "Watch for the hands shifting on the dumbbell during the set.", categories: ["watchFor"] },
  ],
  mechanics: ["support.standing", "resistance.free-implement", "path.overhead-elbow-extension"],
  roles: ["accessory"], actions: ["elbow_extension"], stress: ["overhead_pressing"], painTopics: ["shoulder-response-context", "elbow-response-context"], unresolvedClaims: ["Lying and separate-dumbbell realizations require later review before admission."],
});

export const BENT_OVER_DUMBBELL_REVERSE_FLY_KNOWLEDGE = defineEntry({
  exerciseId: "bent-over-dumbbell-reverse-fly",
  canonicalName: "Bent-Over Dumbbell Reverse Fly",
  facts: [
    { suffix: "focus.rear-delt-arc", kind: "execution_instruction", statement: "Move the arms outward in a controlled arc without turning the task into a row.", compact: "Sweep the arms outward without rowing", categories: ["focus"] },
    { suffix: "cue.soft-elbows", kind: "execution_instruction", statement: "Keep a small, consistent elbow bend through the arc.", compact: "Keep a soft fixed elbow", categories: ["cues"] },
    { suffix: "cue.steady-hinge", kind: "execution_instruction", statement: "Hold the bent-over trunk position steady while the arms move.", compact: "Hold the hinge steady", categories: ["cues"] },
    { suffix: "cue.light-enough", kind: "execution_instruction", statement: "Use a load that permits the arms to move without momentum.", compact: "Use a momentum-free load", categories: ["cues"] },
    { suffix: "setup.hinge", kind: "setup_instruction", statement: "Begin in a stable bilateral hip hinge with a dumbbell in each hand.", categories: ["setup"] },
    { suffix: "setup.arms-below", kind: "setup_instruction", statement: "Let the arms start below the shoulders with palms facing inward or slightly back as reviewed.", categories: ["setup"] },
    { suffix: "equipment.pair-space", kind: "equipment_boundary", statement: "The admitted realization requires a dumbbell pair and stable loaded standing space; no bench or anchor is inferred.", categories: ["setup"] },
    { suffix: "during.horizontal-abduction", kind: "execution_instruction", statement: "Raise the arms through shoulder horizontal abduction while preserving the elbow angle.", categories: ["during"] },
    { suffix: "during.controlled-lower", kind: "execution_instruction", statement: "Lower the dumbbells under control to the start position.", categories: ["during"] },
    { suffix: "during.range", kind: "execution_instruction", statement: "Stop the outward arc before trunk motion or a rowing pull replaces the intended path.", categories: ["during"] },
    { suffix: "pattern.rear-delt-accessory", kind: "movement_pattern", statement: "This bent-over free-implement task is a rear-delt horizontal-abduction accessory, not a horizontal pull.", compact: "Bent-over rear-delt horizontal-abduction accessory, not a row.", categories: ["pattern"] },
    { suffix: "watch.rowing", kind: "watch_for", statement: "Watch for bending the elbows further and pulling the dumbbells toward the torso like a row.", categories: ["watchFor"] },
    { suffix: "watch.trunk-swing", kind: "watch_for", statement: "Watch for trunk rise or swing creating the arm movement.", categories: ["watchFor"] },
    { suffix: "watch.shoulder-shrug", kind: "watch_for", statement: "Watch for an early shoulder shrug replacing the outward arm arc.", categories: ["watchFor"] },
  ],
  mechanics: ["support.unsupported-bilateral-hinge", "resistance.free-implement", "shoulder.horizontal-abduction"],
  roles: ["accessory"], actions: ["shoulder_horizontal_abduction"], stress: ["loaded_hinge"], painTopics: ["shoulder-response-context", "lumbar-response-context"], unresolvedClaims: ["A chest-supported realization remains absent pending support and identity review."],
});

export const SIDE_LYING_HIP_ABDUCTION_KNOWLEDGE = defineEntry({
  exerciseId: "side-lying-hip-abduction",
  canonicalName: "Side-Lying Hip Abduction",
  facts: [
    { suffix: "focus.lateral-lift", kind: "execution_instruction", statement: "Lift the top leg from the hip while the pelvis remains stacked.", compact: "Lift from the hip with the pelvis stacked", categories: ["focus"] },
    { suffix: "cue.long-leg", kind: "execution_instruction", statement: "Reach the top leg long as it lifts and lowers.", compact: "Keep the top leg long", categories: ["cues"] },
    { suffix: "cue.toes-forward", kind: "execution_instruction", statement: "Keep the top leg oriented consistently instead of turning the toes upward to gain range.", compact: "Keep the leg orientation steady", categories: ["cues"] },
    { suffix: "cue.quiet-waist", kind: "execution_instruction", statement: "Keep the side of the waist quiet against the floor support.", compact: "Keep the waist quiet", categories: ["cues"] },
    { suffix: "setup.side-lying", kind: "setup_instruction", statement: "Lie on one side with the head and torso supported and the working leg on top.", categories: ["setup"] },
    { suffix: "setup.lower-leg", kind: "setup_instruction", statement: "Bend or position the lower leg to create a stable base while keeping the pelvis stacked.", categories: ["setup"] },
    { suffix: "equipment.floor-bodyweight", kind: "equipment_boundary", statement: "The admitted realization requires floor space and uses bodyweight; a band is not part of this realization.", categories: ["setup"] },
    { suffix: "during.abduct", kind: "execution_instruction", statement: "Move the top leg away from the midline without rolling the pelvis backward.", categories: ["during"] },
    { suffix: "during.control-return", kind: "execution_instruction", statement: "Lower the leg with control until the next repetition can begin from the same side-lying position.", categories: ["during"] },
    { suffix: "during.side-owned", kind: "execution_instruction", statement: "Complete the prescribed side explicitly rather than assuming bilateral credit from one set.", categories: ["during"] },
    { suffix: "pattern.floor-abduction", kind: "movement_pattern", statement: "A side-lying bodyweight hip-abduction task trains the top leg against gravity from substantial floor support.", compact: "Floor-supported bodyweight hip abduction for the top leg.", categories: ["pattern"] },
    { suffix: "watch.pelvis-roll", kind: "watch_for", statement: "Watch for the pelvis rolling backward as the leg lifts.", categories: ["watchFor"] },
    { suffix: "watch.trunk-sidebend", kind: "watch_for", statement: "Watch for side-bending the trunk to create extra leg height.", categories: ["watchFor"] },
    { suffix: "watch.toe-turn", kind: "watch_for", statement: "Watch for a large toe-up rotation replacing the intended lateral leg path.", categories: ["watchFor"] },
  ],
  mechanics: ["support.side-lying-floor", "resistance.bodyweight-gravity", "laterality.prescription-side"],
  roles: ["accessory"], actions: ["hip_abduction"], stress: [], painTopics: ["hip-response-context"], unresolvedClaims: ["A banded realization remains absent pending equipment-path review."],
});

export const BIRD_DOG_KNOWLEDGE = defineEntry({
  exerciseId: "bird-dog",
  canonicalName: "Bird Dog",
  facts: [
    { suffix: "focus.contralateral-reach", kind: "execution_instruction", statement: "Reach one arm and the opposite leg while the trunk remains organized over the floor contacts.", compact: "Reach opposite limbs without shifting the trunk", categories: ["focus"] },
    { suffix: "cue.push-floor", kind: "execution_instruction", statement: "Press the supporting hand and knee into the floor.", compact: "Press the support points down", categories: ["cues"] },
    { suffix: "cue.reach-long", kind: "execution_instruction", statement: "Reach long through the moving hand and heel instead of chasing height.", compact: "Reach long, not high", categories: ["cues"] },
    { suffix: "cue.quiet-pelvis", kind: "execution_instruction", statement: "Keep the pelvis facing the floor as the limbs move.", compact: "Keep the pelvis quiet", categories: ["cues"] },
    { suffix: "setup.quadruped", kind: "setup_instruction", statement: "Begin on hands and knees with clear floor space and stable support contacts.", categories: ["setup"] },
    { suffix: "setup.stack", kind: "setup_instruction", statement: "Place hands under shoulders and knees under hips before selecting the first side.", categories: ["setup"] },
    { suffix: "equipment.floor", kind: "equipment_boundary", statement: "This task requires bodyweight floor space; no external load or unstable surface is implied.", categories: ["setup"] },
    { suffix: "during.opposite-limbs", kind: "execution_instruction", statement: "Move the selected arm and opposite leg together only as far as trunk position remains controlled.", categories: ["during"] },
    { suffix: "during.return", kind: "execution_instruction", statement: "Return both moving limbs to quadruped control before the next repetition or side.", categories: ["during"] },
    { suffix: "during.side-explicit", kind: "execution_instruction", statement: "Follow the prescribed side or alternating sequence explicitly.", categories: ["during"] },
    { suffix: "pattern.contralateral-trunk", kind: "movement_pattern", statement: "Bird Dog is a quadruped contralateral trunk-control task, not a plank or a default back-pain exercise.", compact: "Quadruped contralateral trunk-control task.", categories: ["pattern"] },
    { suffix: "watch.trunk-rotation", kind: "watch_for", statement: "Watch for the trunk or pelvis rotating as a limb leaves the floor.", categories: ["watchFor"] },
    { suffix: "watch.lumbar-extension", kind: "watch_for", statement: "Watch for reaching the leg upward by changing the trunk position.", categories: ["watchFor"] },
    { suffix: "watch.rushed-switch", kind: "watch_for", statement: "Watch for switching sides before stable quadruped contact is restored.", categories: ["watchFor"] },
    { suffix: "realization.alternating.during", kind: "execution_instruction", statement: "In the alternating realization, re-establish all four support contacts before changing sides.", realizationIds: ["alternating-repetitions"] },
    { suffix: "realization.alternating.watch", kind: "watch_for", statement: "Watch for speed increasing as control decreases during alternating repetitions.", realizationIds: ["alternating-repetitions"] },
  ],
  overrides: [{ id: "alternating", realizationId: "alternating-repetitions", addDuring: ["realization.alternating.during"], addWatchFor: ["realization.alternating.watch"] }],
  mechanics: ["support.quadruped-floor", "trunk.anti-extension", "trunk.anti-rotation"],
  roles: ["anti_extension_core", "anti_rotation_core"], actions: [], stress: ["upper_limb_support_loading", "long_lever_core"], painTopics: ["wrist-response-context", "knee-contact-response-context", "lumbar-response-context"], extraProvenance: [birdDogEvidence],
});

export const BAND_BICEPS_CURL_KNOWLEDGE = defineEntry({
  exerciseId: "band-biceps-curl",
  canonicalName: "Band Biceps Curl",
  facts: [
    { suffix: "focus.elbow-flexion", kind: "execution_instruction", statement: "Curl by bending the elbows while the upper arms remain steady.", compact: "Bend the elbows with steady upper arms", categories: ["focus"] },
    { suffix: "cue.stand-on-band", kind: "execution_instruction", statement: "Keep both feet securely over the reviewed band path.", compact: "Keep the band secure underfoot", categories: ["cues"] },
    { suffix: "cue.wrists-neutral", kind: "execution_instruction", statement: "Keep the wrists aligned with the forearms as band tension changes.", compact: "Keep wrists aligned", categories: ["cues"] },
    { suffix: "cue.control-return", kind: "execution_instruction", statement: "Control the return until the band remains lightly tensioned and secure.", compact: "Control the band return", categories: ["cues"] },
    { suffix: "setup.tube-under-feet", kind: "setup_instruction", statement: "Stand on the center of a tube band with handles, using a balanced under-foot path.", categories: ["setup"] },
    { suffix: "setup.handle-grip", kind: "setup_instruction", statement: "Take one handle in each hand and verify that the band and handles are intact before starting.", categories: ["setup"] },
    { suffix: "equipment.self-anchor", kind: "equipment_boundary", statement: "The admitted realization requires a tube band with handles and an explicit under-foot self-anchor; no environmental anchor is inferred.", categories: ["setup"] },
    { suffix: "during.flex", kind: "execution_instruction", statement: "Bend the elbows against the rising band tension without stepping off the band.", categories: ["during"] },
    { suffix: "during.lower", kind: "execution_instruction", statement: "Lower the handles with control while preserving the under-foot anchor.", categories: ["during"] },
    { suffix: "during.no-kg", kind: "equipment_boundary", statement: "Treat band configuration as its own resistance fact and do not convert it to a kilogram load.", categories: ["during"] },
    { suffix: "pattern.anchorless-curl", kind: "movement_pattern", statement: "This is a self-anchored elastic elbow-flexion accessory, not a horizontal-pull task.", compact: "Self-anchored band elbow-flexion accessory.", categories: ["pattern"] },
    { suffix: "watch.foot-slip", kind: "watch_for", statement: "Watch for either foot losing secure contact with the band.", categories: ["watchFor"] },
    { suffix: "watch.torso-swing", kind: "watch_for", statement: "Watch for trunk swing replacing elbow flexion.", categories: ["watchFor"] },
    { suffix: "watch.upper-arm-drift", kind: "watch_for", statement: "Watch for the upper arms drifting forward to finish the curl.", categories: ["watchFor"] },
  ],
  mechanics: ["support.standing-bilateral", "resistance.band-unanchored", "anchor.self-under-foot"],
  roles: ["accessory"], actions: ["elbow_flexion"], stress: [], painTopics: ["elbow-response-context", "wrist-response-context"], extraProvenance: [bandEvidence], unresolvedClaims: ["Loop-band and therapy-band realizations remain absent pending grip and retention review."],
});

export const MACHINE_SHOULDER_PRESS_KNOWLEDGE = defineEntry({
  exerciseId: "machine-shoulder-press",
  canonicalName: "Machine Shoulder Press",
  facts: [
    { suffix: "focus.guided-press", kind: "execution_instruction", statement: "Press through the machine path while maintaining the selected seat and handle alignment.", compact: "Press through the guided path from a stable setup", categories: ["focus"] },
    { suffix: "cue.back-supported", kind: "execution_instruction", statement: "Keep the back in contact with the machine support.", compact: "Stay connected to the back support", categories: ["cues"] },
    { suffix: "cue.wrists-stacked", kind: "execution_instruction", statement: "Keep wrists aligned with the handles and forearms.", compact: "Align wrists with the handles", categories: ["cues"] },
    { suffix: "cue.smooth-path", kind: "execution_instruction", statement: "Move the machine arms smoothly without bouncing the stops.", compact: "Use a smooth machine path", categories: ["cues"] },
    { suffix: "setup.adjust-seat", kind: "setup_instruction", statement: "Adjust the seat so the handles begin at a usable shoulder-level position for the specific machine.", categories: ["setup"] },
    { suffix: "setup.select-load", kind: "setup_instruction", statement: "Set the machine load and any start-position adjustment before taking the handles.", categories: ["setup"] },
    { suffix: "equipment.exact-machine", kind: "equipment_boundary", statement: "An exact shoulder-press machine capability is required; a commercial-gym label alone does not establish availability.", categories: ["setup"] },
    { suffix: "during.press", kind: "execution_instruction", statement: "Press upward through the machine trajectory without losing the selected support position.", categories: ["during"] },
    { suffix: "during.return", kind: "execution_instruction", statement: "Return the handles under control to the reviewed start range.", categories: ["during"] },
    { suffix: "during.finish", kind: "safety_boundary", statement: "Re-rack or settle the machine arms according to the machine's explicit start and finish mechanism.", categories: ["during"] },
    { suffix: "pattern.supported-vertical-push", kind: "movement_pattern", statement: "A machine shoulder press is a supported guided vertical push whose geometry remains machine-specific.", compact: "Supported machine-guided vertical push.", categories: ["pattern"] },
    { suffix: "watch.seat-mismatch", kind: "watch_for", statement: "Watch for a seat height that places the handles outside the intended start position.", categories: ["watchFor"] },
    { suffix: "watch.back-lift", kind: "watch_for", statement: "Watch for the torso lifting away from the back support during the press.", categories: ["watchFor"] },
    { suffix: "watch.machine-stops", kind: "watch_for", statement: "Watch for forceful contact with the machine stops at either end of the repetition.", categories: ["watchFor"] },
  ],
  mechanics: ["support.seated-machine", "resistance.machine-guided", "fit.machine-geometry"],
  roles: ["vertical_push"], actions: ["shoulder_abduction", "elbow_extension", "scapular_upward_rotation"], stress: ["overhead_pressing"], painTopics: ["shoulder-response-context", "elbow-response-context"], extraProvenance: [machineEvidence], unresolvedClaims: ["Plate-loaded realization remains absent until exact capability and load contracts are reviewed."],
});

export const MACHINE_LEG_EXTENSION_KNOWLEDGE = defineEntry({
  exerciseId: "machine-leg-extension",
  canonicalName: "Machine Leg Extension",
  facts: [
    { suffix: "focus.knee-extension", kind: "execution_instruction", statement: "Extend the knees through the selected machine range while the thighs remain supported.", compact: "Extend the knees from a stable machine setup", categories: ["focus"] },
    { suffix: "cue.seat-contact", kind: "execution_instruction", statement: "Keep the pelvis and back connected to the seat support.", compact: "Stay connected to the seat", categories: ["cues"] },
    { suffix: "cue.pad-position", kind: "execution_instruction", statement: "Maintain the reviewed lower-leg contact with the machine pad.", compact: "Keep lower legs connected to the pad", categories: ["cues"] },
    { suffix: "cue.control-return", kind: "execution_instruction", statement: "Control the return without letting the weight stack or plates drop.", compact: "Control the return", categories: ["cues"] },
    { suffix: "setup.adjust-axis", kind: "setup_instruction", statement: "Adjust the seat and machine axis according to the specific machine's fit controls.", categories: ["setup"] },
    { suffix: "setup.pad-load", kind: "setup_instruction", statement: "Set the lower-leg pad, start range, and load before beginning the set.", categories: ["setup"] },
    { suffix: "equipment.exact-machine", kind: "equipment_boundary", statement: "An exact leg-extension machine capability is required; a commercial-gym label alone does not establish availability.", categories: ["setup"] },
    { suffix: "during.extend", kind: "execution_instruction", statement: "Straighten the knees through the selected range without moving the thighs off the seat.", categories: ["during"] },
    { suffix: "during.return", kind: "execution_instruction", statement: "Return under control to the selected start position.", categories: ["during"] },
    { suffix: "during.finish", kind: "safety_boundary", statement: "Settle the machine at its explicit finish point before leaving the seat.", categories: ["during"] },
    { suffix: "pattern.direct-knee-extension", kind: "movement_pattern", statement: "A machine leg extension is a supported direct knee-extension accessory, not a squat or bilateral knee-dominant strength pattern.", compact: "Supported direct knee-extension accessory, not a squat.", categories: ["pattern"] },
    { suffix: "watch.hip-lift", kind: "watch_for", statement: "Watch for the pelvis lifting or sliding to move the load.", categories: ["watchFor"] },
    { suffix: "watch.pad-shift", kind: "watch_for", statement: "Watch for the lower-leg pad shifting away from its reviewed contact position.", categories: ["watchFor"] },
    { suffix: "watch.stack-impact", kind: "watch_for", statement: "Watch for uncontrolled contact at the end of the machine's return path.", categories: ["watchFor"] },
  ],
  mechanics: ["support.seated-machine", "resistance.machine-guided", "fit.machine-geometry"],
  roles: ["accessory"], actions: ["knee_extension"], stress: [], painTopics: ["knee-response-context"], extraProvenance: [machineEvidence], unresolvedClaims: ["Plate-loaded realization remains absent until exact capability and load contracts are reviewed."],
});

export const PACKAGE_R_KNOWLEDGE_ENTRIES: readonly ExerciseKnowledgeEntry[] = Object.freeze([
  DUMBBELL_FLOOR_PRESS_KNOWLEDGE,
  DUMBBELL_TRICEPS_EXTENSION_KNOWLEDGE,
  BENT_OVER_DUMBBELL_REVERSE_FLY_KNOWLEDGE,
  SIDE_LYING_HIP_ABDUCTION_KNOWLEDGE,
  BIRD_DOG_KNOWLEDGE,
  BAND_BICEPS_CURL_KNOWLEDGE,
  MACHINE_SHOULDER_PRESS_KNOWLEDGE,
  MACHINE_LEG_EXTENSION_KNOWLEDGE,
]);

export const PACKAGE_R_SELECTED_EXERCISE_IDS = Object.freeze(
  PACKAGE_R_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId),
);
