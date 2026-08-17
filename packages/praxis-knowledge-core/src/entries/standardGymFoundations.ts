import type { ExerciseKnowledgeEntry } from "../contracts";
import {
  defineCuratedEntry,
  fact,
  type CuratedEntrySpec,
} from "./shared";

const provenanceContext = Object.freeze({
  humanReviewRef: "human-review:pre-g2l:2026-08-16",
  ownerEvidenceBasis:
    "The owner selected this Package S identity and bounded its exact standard-commercial-gym realization scope.",
  compactEvidenceBasis:
    "The compact fallback was generated from accepted Package S canonical Knowledge before production admission.",
});

const entry = (
  spec: Omit<CuratedEntrySpec, "provenanceContext">,
): ExerciseKnowledgeEntry => defineCuratedEntry({ ...spec, provenanceContext });

export const PULL_UP_KNOWLEDGE = entry({
  exerciseId: "pull-up", canonicalName: "Pull-Up",
  legacySummary: "Vertical body pull with exact unassisted or machine-assisted apparatus.",
  focus: fact("Pull the body through the prescribed vertical range while keeping the exact apparatus and assistance realization explicit.", { compact: "Pull through the prescribed vertical range" }),
  cues: [fact("Keep the hands secure on the reviewed handles or bar.", { compact: "Keep a secure grip" }), fact("Move without swinging the legs to manufacture height."), fact("Return under control to the prescribed start range.")],
  setup: [fact("Confirm either an exact pull-up bar or exact assisted-pull-up machine before starting.", { kind: "equipment_boundary", source: "equipment" }), fact("Set the prescribed grip and start range without inferring a chin-up or mixed-grip variation."), fact("For machine assistance, set the exact assistance value when known and leave it unknown rather than estimating when not known.")],
  during: [fact("Pull vertically while the trunk and legs remain organized for the selected realization."), fact("Use one Pull-Up source identity whether unassisted or machine assisted."), fact("Treat machine assistance as support magnitude, not as external load.", { kind: "equipment_boundary" })],
  pattern: "A Pull-Up is one vertical-pull identity with exact bodyweight-unassisted and machine-assisted realizations.",
  watchFor: [fact("Watch for beginning without the required exact apparatus."), fact("Watch for shortening the return range as fatigue rises."), fact("Watch for silently treating band assistance or chin-up grip as an admitted realization.")],
  compactCoachingRefs: ["focus", "cue.1"],
  overrides: [
    { id: "unassisted", realizationId: "bodyweight-unassisted", facts: [
      { suffix: "setup", category: "setup", statement: "For the unassisted realization, verify the exact pull-up bar and establish a controlled bodyweight hang before the first pull." },
      { suffix: "during", category: "during", statement: "Move the bodyweight through the prescribed range without inventing an external-load value." },
    ] },
    { id: "machine-assisted", realizationId: "machine-assisted", facts: [
      { suffix: "setup", category: "setup", statement: "For machine assistance, adjust the exact assisted-pull-up machine and enter its support according to the reviewed machine setup." },
      { suffix: "during", category: "during", statement: "Keep contact with the machine support while the assistance setting remains realization truth." },
      { suffix: "watch", category: "watchFor", statement: "Watch for reading a lower assistance setting as automatic progression without Longitudinal authority." },
    ] },
  ],
  mechanics: ["support.hanging-or-machine-assisted", "resistance.bodyweight", "assistance.machine-setting"], roles: ["vertical_pull"], actions: ["elbow_flexion", "shoulder_extension"], stress: ["grip_intensive", "upper_limb_support_loading"], painTopics: ["shoulder-response-context", "elbow-response-context", "grip-response-context"], unresolvedClaims: ["Band assistance, weighted Pull-Up, chin-up, and mixed-grip realizations remain deferred."],
});

export const HACK_SQUAT_KNOWLEDGE = entry({
  exerciseId: "hack-squat", canonicalName: "Hack Squat",
  legacySummary: "Machine-guided squat and knee-dominant strength pattern.",
  focus: fact("Squat through the selected machine-guided range while maintaining the reviewed support contacts.", { compact: "Squat through the guided range" }),
  cues: [fact("Keep the feet secure on the platform.", { compact: "Keep feet secure on the platform" }), fact("Keep the pelvis and trunk connected to the prescribed supports."), fact("Drive through the selected range without striking the machine stops.")],
  setup: [fact("Use only an exact hack-squat machine; leg press and Smith equipment are different capabilities.", { kind: "equipment_boundary", source: "equipment" }), fact("Adjust the platform stance, shoulder or back support, and start position for the exact machine."), fact("Confirm the machine mechanism and load representation before entering the start position.")],
  during: [fact("Flex the hips and knees together through the selected squat path."), fact("Maintain the machine support relationship throughout the repetition."), fact("Return to the reviewed finish without forceful stop contact.")],
  pattern: "Hack Squat is a machine-guided bilateral squat and knee-dominant identity, distinct from Leg Press and barbell squatting.",
  watchFor: [fact("Watch for a foot position that does not remain secure through the selected range."), fact("Watch for the pelvis losing the reviewed support position."), fact("Watch for assuming one universal foot placement across machines.")],
  compactCoachingRefs: ["focus", "cue.1"], overrides: [
    { id: "selectorized", realizationId: "selectorized-hack-squat", facts: [{ suffix: "setup", category: "setup", statement: "For a selectorized realization, record the exact machine setting without converting it to another machine's load." }] },
    { id: "plate-loaded", realizationId: "plate-loaded-hack-squat", facts: [{ suffix: "setup", category: "setup", statement: "For a plate-loaded realization, record the exact plate loading and machine geometry without selectorized-stack equivalence." }] },
  ],
  mechanics: ["support.machine-guided-squat", "path.bilateral-squat", "fit.machine-geometry"], roles: ["squat", "knee_dominant"], actions: ["knee_extension", "hip_extension"], stress: ["deep_knee_flexion", "loaded_knee_flexion", "heavy_axial_loading"], painTopics: ["knee-response-context", "hip-response-context", "lumbar-response-context"],
});

export const SEATED_LEG_CURL_KNOWLEDGE = entry({
  exerciseId: "seated-leg-curl", canonicalName: "Seated Leg Curl",
  legacySummary: "Seated machine-supported knee-flexion accessory.",
  focus: fact("Bend the knees through the selected machine range while staying connected to the seat supports.", { compact: "Curl from stable seated support" }),
  cues: [fact("Keep the thighs connected to the reviewed pad position.", { compact: "Keep thighs supported" }), fact("Keep the pelvis and back steady against the seat."), fact("Control the return instead of letting the stack or plates fall.")],
  setup: [fact("Use only an exact seated-leg-curl machine; lying leg curl is a distinct identity.", { kind: "equipment_boundary", source: "equipment" }), fact("Adjust the seat, knee axis, thigh restraint, and lower-leg pad for the exact machine."), fact("Set the start range and exact load representation before beginning.")],
  during: [fact("Flex the knees while the seated hip and support relationship remains unchanged."), fact("Pause only when Prescription explicitly owns the timing."), fact("Return under control to the selected start range.")],
  pattern: "A Seated Leg Curl is a machine-supported knee-flexion accessory with a materially seated hip relationship.",
  watchFor: [fact("Watch for the thighs lifting away from the restraint."), fact("Watch for the pelvis sliding to manufacture range."), fact("Watch for uncontrolled machine contact on the return.")],
  compactCoachingRefs: ["focus", "cue.1"], overrides: [
    { id: "selectorized", realizationId: "selectorized-seated-leg-curl", facts: [{ suffix: "setup", category: "setup", statement: "Record selectorized assistance and load only in the exact machine setting system." }] },
    { id: "plate-loaded", realizationId: "plate-loaded-seated-leg-curl", facts: [{ suffix: "setup", category: "setup", statement: "Record plate loading without equating it to selectorized settings." }] },
  ],
  mechanics: ["support.seated-machine", "action.knee-flexion", "fit.machine-geometry"], roles: ["accessory"], actions: ["knee_flexion"], stress: ["loaded_knee_flexion"], painTopics: ["knee-response-context", "hip-response-context"],
});

export const MACHINE_CHEST_FLY_KNOWLEDGE = entry({
  exerciseId: "machine-chest-fly", canonicalName: "Machine Chest Fly",
  legacySummary: "Machine-guided shoulder horizontal-adduction accessory.",
  focus: fact("Bring the machine arms through the selected fly path while maintaining the reviewed support position.", { compact: "Fly through the guided range" }),
  cues: [fact("Keep the back connected to the seat support.", { compact: "Stay connected to the support" }), fact("Maintain a consistent elbow shape through the path."), fact("Return without chasing a deeper shoulder stretch.")],
  setup: [fact("Use only an exact chest-fly machine; cable fly and reverse pec deck remain distinct.", { kind: "equipment_boundary", source: "equipment" }), fact("Adjust the seat, arm pads or handles, and start position for the exact machine."), fact("Set the machine load before taking the supported start position.")],
  during: [fact("Move the arms toward one another through shoulder horizontal adduction."), fact("Keep the movement a fly rather than turning it into an elbow-driven press."), fact("Return under control to the selected start range.")],
  pattern: "Machine Chest Fly is a supported machine-guided shoulder-horizontal-adduction accessory, not a press.",
  watchFor: [fact("Watch for the back leaving the support."), fact("Watch for pressing with large elbow extension."), fact("Watch for forcing the handles beyond the controlled shoulder range.")],
  compactCoachingRefs: ["focus", "cue.1"], mechanics: ["support.seated-machine", "resistance.machine-guided", "shoulder.horizontal-adduction"], roles: ["accessory"], actions: ["shoulder_horizontal_adduction"], stress: [], painTopics: ["shoulder-response-context"],
});

export const MACHINE_HIP_ADDUCTION_KNOWLEDGE = entry({
  exerciseId: "machine-hip-adduction", canonicalName: "Machine Hip Adduction",
  legacySummary: "Seated machine-guided hip-adduction accessory.",
  focus: fact("Bring the legs toward the midline through the selected machine range while maintaining seated support.", { compact: "Adduct through the selected machine range" }),
  cues: [fact("Keep the pelvis connected to the seat.", { compact: "Keep the pelvis supported" }), fact("Keep both legs in contact with the reviewed pads."), fact("Control the opening return.")],
  setup: [fact("Use only an exact hip-adduction machine; floor and cable identities are distinct.", { kind: "equipment_boundary", source: "equipment" }), fact("Adjust the seat, start range, and leg pads for the exact machine."), fact("Set the machine load before moving into the start position.")],
  during: [fact("Move both legs inward through the selected range."), fact("Maintain seated trunk and pelvis support throughout the repetition."), fact("Return outward under control without forcing range.")],
  pattern: "Machine Hip Adduction is a seated machine-guided hip-adduction accessory, not corrective treatment.",
  watchFor: [fact("Watch for the pelvis shifting on the seat."), fact("Watch for the legs losing pad contact."), fact("Watch for forcing a wider start range than the selected machine setup.")],
  compactCoachingRefs: ["focus", "cue.1"], mechanics: ["support.seated-machine", "action.hip-adduction", "fit.machine-geometry"], roles: ["accessory"], actions: ["hip_adduction"], stress: [], painTopics: ["hip-response-context", "groin-response-context"],
});

export const MACHINE_HIP_ABDUCTION_KNOWLEDGE = entry({
  exerciseId: "machine-hip-abduction", canonicalName: "Machine Hip Abduction",
  legacySummary: "Seated machine-guided hip-abduction accessory.",
  focus: fact("Move the legs away from the midline through the selected machine range while maintaining seated support.", { compact: "Abduct through the selected machine range" }),
  cues: [fact("Keep the pelvis connected to the seat.", { compact: "Keep the pelvis supported" }), fact("Keep both legs in contact with the reviewed pads."), fact("Control the inward return.")],
  setup: [fact("Use only an exact hip-abduction machine; floor and loop-band identities are distinct.", { kind: "equipment_boundary", source: "equipment" }), fact("Adjust the seat, start range, and leg pads for the exact machine."), fact("Set the machine load before moving into the start position.")],
  during: [fact("Move both legs outward through the selected range."), fact("Maintain seated trunk and pelvis support throughout the repetition."), fact("Return inward under control without letting the machine close abruptly.")],
  pattern: "Machine Hip Abduction is a seated machine-guided hip-abduction accessory, not corrective treatment.",
  watchFor: [fact("Watch for the pelvis shifting on the seat."), fact("Watch for the legs losing pad contact."), fact("Watch for using trunk movement to manufacture range.")],
  compactCoachingRefs: ["focus", "cue.1"], mechanics: ["support.seated-machine", "action.hip-abduction", "fit.machine-geometry"], roles: ["accessory"], actions: ["hip_abduction"], stress: [], painTopics: ["hip-response-context"], unresolvedClaims: ["This entry makes no glute-med correction or treatment claim."],
});

export const SEATED_CALF_RAISE_KNOWLEDGE = entry({
  exerciseId: "seated-calf-raise", canonicalName: "Seated Calf Raise",
  legacySummary: "Seated machine-supported ankle plantar-flexion accessory.",
  focus: fact("Raise and lower the heels through the selected ankle range while the knees remain supported by the exact machine.", { compact: "Raise the heels from stable seated support" }),
  cues: [fact("Keep the forefeet secure on the platform.", { compact: "Keep forefeet secure" }), fact("Maintain the reviewed knee-pad contact."), fact("Control both the rise and return.")],
  setup: [fact("Use an exact seated-calf machine or reviewed plate-loaded seated realization.", { kind: "equipment_boundary", source: "equipment" }), fact("Adjust the seat, knee pad, and forefoot platform for stable contact."), fact("Set the exact load representation before releasing the machine stop.")],
  during: [fact("Move through ankle plantar flexion while preserving the seated knee position."), fact("Use only the selected range rather than forcing a universal stretch."), fact("Re-engage the machine stop under control before leaving the seat.")],
  pattern: "Seated Calf Raise is a seated plantar-flexion accessory distinct from Standing Calf Raise.",
  watchFor: [fact("Watch for the forefeet shifting on the platform."), fact("Watch for the knee pad losing secure contact."), fact("Watch for bouncing through the bottom range.")],
  compactCoachingRefs: ["focus", "cue.1"], overrides: [
    { id: "selectorized", realizationId: "selectorized-seated-calf", facts: [{ suffix: "setup", category: "setup", statement: "Use the exact selectorized setting system without converting it to plate load." }] },
    { id: "plate-loaded", realizationId: "plate-loaded-seated-calf", facts: [{ suffix: "setup", category: "setup", statement: "Record the exact plate-loaded realization without treating it as a selectorized stack." }] },
  ],
  mechanics: ["support.seated-machine", "action.ankle-plantar-flexion", "fit.machine-geometry"], roles: ["accessory"], actions: ["ankle_plantar_flexion"], stress: [], painTopics: ["ankle-response-context", "knee-contact-response-context"], unresolvedClaims: ["No soleus-isolation certainty is claimed."],
});

export const MACHINE_HIP_THRUST_KNOWLEDGE = entry({
  exerciseId: "machine-hip-thrust", canonicalName: "Machine Hip Thrust",
  legacySummary: "Machine-supported loaded hip-extension strength exercise.",
  focus: fact("Extend the hips through the selected machine path while maintaining the reviewed torso, pelvis, and foot contacts.", { compact: "Extend the hips through the guided path" }),
  cues: [fact("Keep both feet secure on the prescribed support.", { compact: "Keep feet secure" }), fact("Maintain the reviewed pad contact over the pelvis."), fact("Finish through hip extension without forcing extra trunk motion.")],
  setup: [fact("Use only an exact hip-thrust or glute-drive machine; floor Glute Bridge is distinct.", { kind: "equipment_boundary", source: "equipment" }), fact("Adjust the torso support, pelvis pad, foot position, and start range for the exact machine."), fact("Set the exact machine load representation before entering the start position.")],
  during: [fact("Drive through the feet and extend the hips through the selected range."), fact("Keep the pad and support contacts stable as the machine moves."), fact("Return under control to the reviewed start position.")],
  pattern: "Machine Hip Thrust is a machine-supported loaded hip-extension identity distinct from floor Glute Bridge.",
  watchFor: [fact("Watch for the pelvis pad shifting from its reviewed contact."), fact("Watch for the feet losing stable support."), fact("Watch for trunk extension replacing the selected hip-extension range.")],
  compactCoachingRefs: ["focus", "cue.1"], overrides: [
    { id: "selectorized", realizationId: "selectorized-hip-thrust", facts: [{ suffix: "setup", category: "setup", statement: "Record the exact selectorized setting without claiming plate equivalence." }] },
    { id: "plate-loaded", realizationId: "plate-loaded-hip-thrust", facts: [{ suffix: "setup", category: "setup", statement: "Record the exact plate-loaded realization and machine geometry without stack equivalence." }] },
  ],
  mechanics: ["support.machine-hip-extension", "resistance.machine-guided", "action.hip-extension"], roles: ["accessory"], actions: ["hip_extension"], stress: ["loaded_spinal_extension"], painTopics: ["hip-response-context", "lumbar-response-context"],
});

export const CABLE_LATERAL_RAISE_KNOWLEDGE = entry({
  exerciseId: "cable-lateral-raise", canonicalName: "Cable Lateral Raise",
  legacySummary: "Cable shoulder-abduction accessory with explicit anchor and laterality.",
  focus: fact("Raise the arm through the selected lateral path while the exact cable line remains controlled.", { compact: "Raise through the controlled cable path" }),
  cues: [fact("Keep a stable stance against the cable pull.", { compact: "Keep a stable stance" }), fact("Maintain a consistent elbow shape."), fact("Control the return toward the anchor.")],
  setup: [fact("Use an exact cable stack and reviewed low anchor or line of pull.", { kind: "equipment_boundary", source: "equipment" }), fact("Attach the prescribed handle and clear the cable path before taking tension."), fact("Set unilateral or bilateral behavior explicitly rather than assuming side credit.")],
  during: [fact("Move the arm away from the torso through shoulder abduction."), fact("Keep the torso from leaning to manufacture height."), fact("Complete each prescribed side explicitly.")],
  pattern: "Cable Lateral Raise is a cable-anchored shoulder-abduction accessory distinct from Dumbbell Lateral Raise.",
  watchFor: [fact("Watch for the cable crossing an unsafe or obstructed path."), fact("Watch for shrugging or torso lean replacing the selected arm path."), fact("Watch for losing control as the handle returns toward the stack.")],
  compactCoachingRefs: ["focus", "cue.1"], overrides: [
    { id: "unilateral", realizationId: "unilateral-cable-lateral", facts: [{ suffix: "during", category: "during", statement: "For unilateral work, preserve the prescribed side and complete the opposite side only when assigned." }] },
    { id: "bilateral", realizationId: "bilateral-cable-lateral", facts: [{ suffix: "setup", category: "setup", statement: "For bilateral work, verify two legal cable lines and clear paths before beginning." }] },
  ],
  mechanics: ["support.standing", "resistance.cable-anchored", "laterality.prescription-owned"], roles: ["accessory"], actions: ["shoulder_abduction"], stress: ["shoulder_abduction_external_rotation"], painTopics: ["shoulder-response-context"],
});

export const OVERHEAD_CABLE_TRICEPS_EXTENSION_KNOWLEDGE = entry({
  exerciseId: "overhead-cable-triceps-extension", canonicalName: "Overhead Cable Triceps Extension",
  legacySummary: "Overhead cable elbow-extension accessory with exact high anchor.",
  focus: fact("Extend the elbows through the selected overhead cable path while maintaining the reviewed support position.", { compact: "Extend the elbows through the overhead path" }),
  cues: [fact("Keep the stance stable against the cable pull.", { compact: "Keep a stable stance" }), fact("Maintain the selected upper-arm position without forcing a universal elbow width."), fact("Control the return under cable tension.")],
  setup: [fact("Use an exact cable stack with legal high anchor and reviewed attachment.", { kind: "equipment_boundary", source: "equipment" }), fact("Face away from or align with the stack according to the prescribed standing realization."), fact("Take tension only after the stance, cable path, and overhead clearance are secure.")],
  during: [fact("Straighten the elbows while the shoulders remain in the selected overhead position."), fact("Keep the trunk from moving to finish the repetition."), fact("Return under control without letting the attachment pull the arms abruptly.")],
  pattern: "Overhead Cable Triceps Extension is an overhead cable elbow-extension accessory distinct from pressdown and dumbbell extension paths.",
  watchFor: [fact("Watch for an obstructed cable path or inadequate overhead clearance."), fact("Watch for trunk motion replacing elbow extension."), fact("Watch for forcing a universal shoulder or elbow position.")],
  compactCoachingRefs: ["focus", "cue.1"], mechanics: ["support.standing", "resistance.high-cable", "shoulder.overhead-position"], roles: ["accessory"], actions: ["elbow_extension"], stress: ["overhead_pressing"], painTopics: ["shoulder-response-context", "elbow-response-context"],
});

export const STRAIGHT_ARM_CABLE_PULLDOWN_KNOWLEDGE = entry({
  exerciseId: "straight-arm-cable-pulldown", canonicalName: "Straight-Arm Cable Pulldown",
  legacySummary: "High-cable shoulder-extension accessory, not a vertical-pull replacement.",
  focus: fact("Move the arms down through shoulder extension while keeping the selected high-cable path and trunk position controlled.", { compact: "Pull straight arms down from the shoulders" }),
  cues: [fact("Keep a stable stance under the high cable.", { compact: "Keep a stable stance" }), fact("Maintain a consistent elbow shape."), fact("Control the return overhead without losing the trunk position.")],
  setup: [fact("Use an exact cable stack with a legal high anchor and reviewed attachment.", { kind: "equipment_boundary", source: "equipment" }), fact("Step into a stable standing position with a clear cable path."), fact("Select a range that preserves the intended shoulder-extension path.")],
  during: [fact("Move the upper arms down while avoiding a rowing or elbow-flexion action."), fact("Keep the trunk from swinging to move the cable."), fact("Return under control to the selected overhead start range.")],
  pattern: "Straight-Arm Cable Pulldown is a shoulder-extension accessory and never satisfies required vertical-pull strength ownership.",
  watchFor: [fact("Watch for bending the elbows until the task becomes a pulldown or row."), fact("Watch for trunk flexion or extension manufacturing range."), fact("Watch for losing control near the high anchor return.")],
  compactCoachingRefs: ["focus", "cue.1"], mechanics: ["support.standing", "resistance.high-cable", "action.shoulder-extension"], roles: ["accessory"], actions: ["shoulder_extension"], stress: [], painTopics: ["shoulder-response-context", "lumbar-response-context"], unresolvedClaims: ["This identity makes no universal lat-isolation claim."],
});

export const PACKAGE_S_KNOWLEDGE_ENTRIES: readonly ExerciseKnowledgeEntry[] = Object.freeze([
  PULL_UP_KNOWLEDGE,
  HACK_SQUAT_KNOWLEDGE,
  SEATED_LEG_CURL_KNOWLEDGE,
  MACHINE_CHEST_FLY_KNOWLEDGE,
  MACHINE_HIP_ADDUCTION_KNOWLEDGE,
  MACHINE_HIP_ABDUCTION_KNOWLEDGE,
  SEATED_CALF_RAISE_KNOWLEDGE,
  MACHINE_HIP_THRUST_KNOWLEDGE,
  CABLE_LATERAL_RAISE_KNOWLEDGE,
  OVERHEAD_CABLE_TRICEPS_EXTENSION_KNOWLEDGE,
  STRAIGHT_ARM_CABLE_PULLDOWN_KNOWLEDGE,
]);

export const PACKAGE_S_SELECTED_EXERCISE_IDS = Object.freeze(
  PACKAGE_S_KNOWLEDGE_ENTRIES.map((value) => value.exerciseId),
);
