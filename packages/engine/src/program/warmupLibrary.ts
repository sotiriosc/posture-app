import type { Equipment } from "@/lib/equipment";

export type WarmupItem = {
  id: string;
  name: string;
  tags: string[];
  equipment: Equipment[];
  durationSec?: number;
  reps?: string;
  cue?: string;
  painAreasToAvoid?: string[];
  /**
   * Phase 3W — joints this item addresses.
   * Used by the MOBILIZE block selector (pattern→joint map coverage).
   */
  mobilizes?: string[];
  /**
   * Phase 3W — patterns this item primes/rehearses.
   * Used by the ACTIVATE toolbox selector and tagged-lane matching.
   * Also used by the PRIME fallback when no ladder rung is available.
   */
  primes?: string[];
};

export type WarmupBlock = {
  id: string;
  title: string;
  items: WarmupItem[];
  tags: string[];
};

const warmupItems: WarmupItem[] = [
  // ─── RAMP (general) ────────────────────────────────────────────────────────
  {
    id: "brisk-march-breath",
    name: "Nasal Breathing Cardio Ramp",
    tags: ["general", "warmup", "breathing", "circulation"],
    equipment: ["none"],
    reps: "3-5 min",
    durationSec: 240,
    cue: "Nasal-breathing light cardio: treadmill walk, stationary bike, or stair master at easy pace.",
    mobilizes: [],
    primes: [],
  },
  {
    id: "supine-90-90-breath",
    name: "Supine 90/90 Breathing",
    tags: ["general", "warmup", "breathing", "tva", "core"],
    equipment: ["none"],
    durationSec: 60,
    cue: "Exhale fully, keep ribs down, then inhale into the back of the ribcage.",
    mobilizes: ["trunk/spine"],
    primes: ["core_stability"],
  },
  // ─── MOBILIZE (joint-targeted) ─────────────────────────────────────────────
  {
    id: "ninety-ninety-switches",
    name: "90/90 Hip Switches",
    tags: ["mobility", "hips", "rotation", "hip_opener"],
    equipment: ["none"],
    reps: "8 per side",
    durationSec: 75,
    cue: "Keep torso tall and rotate through hips, not low back.",
    mobilizes: ["hips"],
    primes: ["hinge", "knee_dominant"],
  },
  {
    id: "hip-shifts",
    name: "Quadruped Hip Shifts",
    tags: ["mobility", "hips", "hip_opener", "rotation"],
    equipment: ["none"],
    reps: "8 per side",
    durationSec: 75,
    cue: "Shift slowly to each side while keeping neutral spine and steady breath.",
    mobilizes: ["hips", "lower back"],
    primes: ["hinge"],
  },
  {
    id: "wall-slides",
    name: "Wall Slides",
    tags: ["mobility", "shoulders", "scapular", "scap_prep", "t_spine"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 75,
    cue: "Keep ribs down and forearms light on the wall while reaching up.",
    mobilizes: ["shoulders", "scapulae", "thoracic spine"],
    primes: ["horizontal_push", "vertical_push", "horizontal_pull", "vertical_pull"],
  },
  {
    id: "scap-cars",
    name: "Scapular CARs",
    tags: ["mobility", "shoulders", "scapular", "scap_prep"],
    equipment: ["none"],
    reps: "5 each direction",
    durationSec: 60,
    cue: "Move shoulder blades through full circles without shrugging the neck.",
    mobilizes: ["shoulders", "scapulae"],
    primes: ["horizontal_pull", "vertical_pull"],
  },
  {
    id: "thoracic-open-book",
    name: "Open-Book Thoracic Rotation",
    tags: ["mobility", "t_spine", "thoracic", "rotation"],
    equipment: ["none"],
    reps: "6-8 per side",
    durationSec: 75,
    cue: "Rotate from upper back while hips stay stacked.",
    mobilizes: ["thoracic spine"],
    primes: ["horizontal_push", "vertical_push"],
  },
  {
    id: "thread-the-needle",
    name: "Thread the Needle",
    tags: ["mobility", "t_spine", "thoracic", "scapular"],
    equipment: ["none"],
    reps: "6 per side",
    durationSec: 75,
    cue: "Reach long under the body, then rotate open with control.",
    mobilizes: ["thoracic spine", "scapulae"],
    primes: ["horizontal_pull", "vertical_pull"],
  },
  {
    id: "ankle-mobility-rocks",
    name: "Ankle Dorsiflexion Rocks",
    tags: ["mobility", "ankles", "dorsiflexion"],
    equipment: ["none"],
    reps: "10 per side",
    durationSec: 60,
    cue: "Drive knee forward over toes while heel stays planted.",
    mobilizes: ["ankles", "knees"],
    primes: ["knee_dominant"],
  },
  {
    id: "soleus-wall-drives",
    name: "Soleus Wall Drives",
    tags: ["mobility", "ankles", "calves", "dorsiflexion"],
    equipment: ["none"],
    reps: "10-12 per side",
    durationSec: 60,
    cue: "Keep knee bent and press through the ball of the foot.",
    mobilizes: ["ankles"],
    primes: ["knee_dominant"],
  },
  // ─── Phase 3W new: knee-mobilizer entries (Sotirios-authored; rename pending) ──
  {
    id: "half-kneeling-knee-over-toe-rocks",
    name: "Half-Kneeling Knee-Over-Toe Rocks",
    tags: ["mobility", "knees", "hips", "ankles", "knee_health"],
    equipment: ["none"],
    reps: "8-10 per side",
    durationSec: 60,
    cue: "From half-kneeling, drive front knee forward over the small toe while heel stays planted; rock forward and back with control.",
    mobilizes: ["knees", "hips", "ankles"],
    primes: ["knee_dominant"],
  },
  {
    id: "wall-supported-deep-knee-bend-hold",
    name: "Wall-Supported Deep Knee Bend Hold",
    tags: ["mobility", "knees", "hips", "ankles", "knee_health"],
    equipment: ["none"],
    reps: "20-30 sec",
    durationSec: 45,
    cue: "Use wall for light support; sink into full knee flexion with heels down and chest tall.",
    mobilizes: ["knees", "hips", "ankles"],
    primes: ["knee_dominant"],
  },
  // ─── ACTIVATE (toolbox) ────────────────────────────────────────────────────
  {
    id: "glute-bridge-activation",
    name: "Glute Bridge Activation",
    tags: ["activation", "glutes", "hips", "hinge", "hip_health"],
    equipment: ["none"],
    reps: "10-12",
    durationSec: 75,
    cue: "Posteriorly tilt pelvis first, then drive hips up with glutes.",
    mobilizes: ["hips"],
    primes: ["hinge", "knee_dominant"],
  },
  {
    id: "band-lateral-walk",
    name: "Band Lateral Walk",
    tags: ["activation", "glutes", "hips", "abduction", "hip_health"],
    equipment: ["bands"],
    reps: "8-10 steps each way",
    durationSec: 75,
    cue: "Stay low, knees soft, and keep continuous band tension.",
    mobilizes: ["hips"],
    primes: ["hinge", "knee_dominant"],
  },
  {
    id: "dead-bug-brace",
    name: "Dead Bug Brace",
    tags: ["activation", "core", "tva", "brace", "anti_extension", "core_health"],
    equipment: ["none"],
    reps: "6-8 per side",
    durationSec: 75,
    cue: "Exhale and lock ribcage down before each limb reach.",
    mobilizes: ["trunk/spine"],
    primes: ["core_stability"],
  },
  {
    id: "bird-dog-brace",
    name: "Bird Dog Brace",
    tags: ["activation", "core", "brace", "anti_rotation", "core_health"],
    equipment: ["none"],
    reps: "6 per side",
    durationSec: 75,
    cue: "Keep pelvis level and move with a 2-second pause at full reach.",
    mobilizes: ["trunk/spine", "hips"],
    primes: ["core_stability"],
  },
  {
    id: "serratus-wall-slide",
    name: "Serratus Wall Slide",
    tags: ["activation", "shoulders", "serratus", "upward_rotation", "scapular", "scap_health"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 75,
    cue: "Reach up and around ribs to feel shoulder blades wrap the ribcage.",
    mobilizes: ["shoulders", "scapulae"],
    primes: ["horizontal_pull", "vertical_pull", "horizontal_push", "vertical_push"],
  },
  {
    id: "scap-pushup-plus",
    name: "Scap Push-Up Plus",
    tags: ["activation", "serratus", "scapular", "upward_rotation", "scap_health"],
    equipment: ["none"],
    reps: "8-12",
    durationSec: 75,
    cue: "Keep elbows straight and protract shoulder blades at the top.",
    painAreasToAvoid: ["wrists"],
    mobilizes: ["scapulae"],
    primes: ["horizontal_push", "vertical_push"],
  },
  // ─── ACTIVATE — patterning (hinge/squat) ───────────────────────────────────
  {
    id: "hip-hinge-dowel",
    name: "Hip Hinge Pattern Drill",
    tags: ["patterning", "hinge", "hips", "posterior_chain", "hip_health"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 60,
    cue: "Keep three points of contact as hips travel back.",
    mobilizes: ["hips", "hamstrings"],
    primes: ["hinge"],
  },
  {
    id: "bodyweight-good-morning-pattern",
    name: "Bodyweight Good Morning Pattern",
    tags: ["patterning", "hinge", "posterior_chain", "hip_health"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 60,
    cue: "Unlock knees and hinge with long spine, then stand tall.",
    mobilizes: ["hamstrings", "lower back"],
    primes: ["hinge"],
  },
  {
    id: "back-extension-hold-pattern",
    name: "Back Extension Hold Pattern",
    tags: ["patterning", "hinge", "posterior_chain", "stability", "hip_health"],
    equipment: ["none"],
    reps: "20-30 sec",
    durationSec: 60,
    cue: "Hold neutral spine and glutes on while keeping ribs stacked over pelvis.",
    mobilizes: ["lower back", "hips"],
    primes: ["hinge"],
  },
  {
    id: "bodyweight-squat-to-box",
    name: "Bodyweight Squat to Box",
    tags: ["patterning", "squat", "knee_dominant", "legs", "knee_health"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 60,
    cue: "Sit between hips with full-foot pressure and controlled ascent.",
    mobilizes: ["hips", "ankles"],
    primes: ["knee_dominant"],
  },
  {
    id: "goblet-squat-pattern",
    name: "Light Goblet Squat Patterning",
    tags: ["patterning", "squat", "knee_dominant", "legs", "knee_health"],
    equipment: ["dumbbells"],
    reps: "6-8",
    durationSec: 60,
    cue: "Use a very light load and own depth before speed or load increases.",
    mobilizes: ["hips", "ankles"],
    primes: ["knee_dominant"],
  },
  {
    id: "supported-squat-pattern",
    name: "Supported Squat Pattern",
    tags: ["patterning", "squat", "knee_dominant", "legs", "stability", "knee_health"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 60,
    cue: "Use support as needed, keep full-foot pressure, and control knee tracking.",
    mobilizes: ["knees", "hips", "ankles"],
    primes: ["knee_dominant"],
  },
  // ─── ACTIVATE — anti-rotation (core_health) ────────────────────────────────
  {
    id: "pallof-iso-hold",
    name: "Pallof Iso Hold",
    tags: ["activation", "core", "anti_rotation", "stability", "core_health"],
    equipment: ["bands"],
    reps: "20-30 sec per side",
    durationSec: 60,
    cue: "Brace and resist trunk rotation without leaning.",
    mobilizes: ["trunk/spine"],
    primes: ["core_stability"],
  },
  {
    id: "dead-bug-cross-connect",
    name: "Dead Bug Cross-Connect",
    tags: ["activation", "core", "anti_rotation", "stability", "core_health"],
    equipment: ["none"],
    reps: "6-8 per side",
    durationSec: 60,
    cue: "Press opposite hand and knee together to resist rotation as limbs move.",
    mobilizes: ["trunk/spine"],
    primes: ["core_stability"],
  },
  {
    id: "side-plank-reach",
    name: "Side Plank Reach",
    tags: ["activation", "core", "anti_rotation", "stability", "core_health"],
    equipment: ["none"],
    reps: "20-25 sec per side",
    durationSec: 60,
    cue: "Stack ribs over pelvis and reach forward without collapsing.",
    painAreasToAvoid: ["shoulders"],
    mobilizes: ["trunk/spine"],
    primes: ["core_stability"],
  },
  // ─── ACTIVATE — row/push rehearsal (scap_health) ───────────────────────────
  {
    id: "band-row-primer",
    name: "Band Row Primer",
    tags: ["activation", "pull", "scapular", "row_rehearsal", "scap_health"],
    equipment: ["bands"],
    reps: "10-12",
    durationSec: 60,
    cue: "Initiate with shoulder blade then finish with elbow drive.",
    mobilizes: ["scapulae"],
    primes: ["horizontal_pull", "vertical_pull"],
  },
  {
    id: "incline-pushup-pattern",
    name: "Incline Push-Up Pattern",
    tags: ["activation", "push", "push_rehearsal", "scapular", "scap_health"],
    equipment: ["none"],
    reps: "6-10",
    durationSec: 60,
    cue: "Keep body rigid and lower with controlled scap movement.",
    painAreasToAvoid: ["wrists", "shoulders"],
    mobilizes: ["scapulae"],
    primes: ["horizontal_push"],
  },
  // ─── ACTIVATE — rotator cuff (scap_health sub) ─────────────────────────────
  {
    id: "band-external-rotation",
    name: "Band External Rotation",
    tags: ["activation", "shoulders", "rotator_cuff", "external_rotation", "scap_health"],
    equipment: ["bands"],
    reps: "10-12 per side",
    durationSec: 60,
    cue: "Keep elbow pinned and rotate slowly through pain-free range.",
    mobilizes: ["shoulders"],
    primes: ["horizontal_pull", "vertical_pull"],
  },
  {
    id: "side-lying-external-rotation",
    name: "Side-Lying External Rotation",
    tags: ["activation", "shoulders", "rotator_cuff", "external_rotation", "scap_health"],
    equipment: ["dumbbells"],
    reps: "10-12 per side",
    durationSec: 60,
    cue: "Use very light load and keep shoulder blade set.",
    mobilizes: ["shoulders"],
    primes: ["horizontal_pull", "vertical_pull"],
  },
  {
    id: "wall-external-rotation-isometric",
    name: "Wall External Rotation Isometric",
    tags: ["activation", "shoulders", "rotator_cuff", "external_rotation", "scap_health"],
    equipment: ["none"],
    reps: "20 sec per side",
    durationSec: 50,
    cue: "Press gently into wall to wake cuff without joint irritation.",
    mobilizes: ["shoulders"],
    primes: ["horizontal_pull", "vertical_pull"],
  },
  // ─── COOLDOWN ──────────────────────────────────────────────────────────────
  {
    id: "hip-flexor-stretch-cooldown",
    name: "Half-Kneeling Hip Flexor Stretch",
    tags: ["cooldown", "hips", "mobility"],
    equipment: ["none"],
    reps: "30 sec per side",
    durationSec: 60,
    cue: "Tuck pelvis and squeeze glute on the back leg.",
    mobilizes: ["hips"],
    primes: [],
  },
  {
    id: "pec-doorway-stretch",
    name: "Doorway Pec Stretch",
    tags: ["cooldown", "shoulders", "chest", "mobility"],
    equipment: ["none"],
    reps: "30 sec per side",
    durationSec: 60,
    cue: "Keep ribs stacked and avoid leaning through low back.",
    mobilizes: ["shoulders", "thoracic spine"],
    primes: [],
  },
  {
    id: "calf-wall-stretch",
    name: "Calf Wall Stretch",
    tags: ["cooldown", "ankles", "calves", "mobility"],
    equipment: ["none"],
    reps: "30 sec per side",
    durationSec: 60,
    cue: "Drive heel down and keep toes pointing straight ahead.",
    mobilizes: ["ankles"],
    primes: [],
  },
  {
    id: "child-pose-breath",
    name: "Child's Pose Breathing",
    tags: ["cooldown", "t_spine", "breathing", "recovery"],
    equipment: ["none"],
    reps: "45-60 sec",
    durationSec: 60,
    cue: "Inhale into back ribs and exhale slowly to downshift.",
    mobilizes: ["trunk/spine", "thoracic spine"],
    primes: [],
  },
];

const warmupItemById = warmupItems.reduce<Record<string, WarmupItem>>((map, item) => {
  map[item.id] = item;
  return map;
}, {});

const buildBlock = (params: {
  id: string;
  title: string;
  itemIds: string[];
  tags: string[];
}): WarmupBlock => {
  const items = params.itemIds
    .map((id) => warmupItemById[id])
    .filter((item): item is WarmupItem => Boolean(item));
  return {
    id: params.id,
    title: params.title,
    items,
    tags: params.tags,
  };
};

const warmupBlocks = [
  buildBlock({
    id: "global-general",
    title: "General Warmup",
    itemIds: ["brisk-march-breath", "supine-90-90-breath"],
    tags: ["general", "warmup"],
  }),
  buildBlock({
    id: "hip-opener-rotation",
    title: "Hip Opener + Rotation",
    itemIds: ["ninety-ninety-switches", "hip-shifts"],
    tags: ["mobility", "hips", "rotation", "hip_opener"],
  }),
  buildBlock({
    id: "shoulder-scap-prep",
    title: "Shoulder + Scap Prep",
    itemIds: ["wall-slides", "scap-cars"],
    tags: ["mobility", "shoulders", "scapular", "scap_prep"],
  }),
  buildBlock({
    id: "core-brace-patterning",
    title: "Core Brace Patterning",
    itemIds: ["dead-bug-brace", "bird-dog-brace"],
    tags: ["activation", "core", "tva", "brace"],
  }),
  buildBlock({
    id: "t-spine-mobility",
    title: "T-Spine Mobility",
    itemIds: ["thoracic-open-book", "thread-the-needle"],
    tags: ["mobility", "t_spine", "thoracic", "rotation"],
  }),
  buildBlock({
    id: "ankle-dorsiflexion-prep",
    title: "Ankle Dorsiflexion Prep",
    itemIds: ["ankle-mobility-rocks", "soleus-wall-drives"],
    tags: ["mobility", "ankles", "dorsiflexion", "calves"],
  }),
  buildBlock({
    id: "glute-activation",
    title: "Glute Activation",
    itemIds: ["glute-bridge-activation", "band-lateral-walk"],
    tags: ["activation", "glutes", "hips"],
  }),
  buildBlock({
    id: "serratus-upward-rotation-prep",
    title: "Serratus + Upward Rotation",
    itemIds: ["serratus-wall-slide", "scap-pushup-plus"],
    tags: ["activation", "serratus", "shoulders", "upward_rotation"],
  }),
  buildBlock({
    id: "hinge-patterning",
    title: "Hinge Patterning",
    itemIds: ["hip-hinge-dowel", "back-extension-hold-pattern"],
    tags: ["patterning", "hinge", "posterior_chain"],
  }),
  buildBlock({
    id: "squat-patterning",
    title: "Squat Patterning",
    itemIds: ["bodyweight-squat-to-box", "supported-squat-pattern"],
    tags: ["patterning", "squat", "knee_dominant"],
  }),
  buildBlock({
    id: "anti-rotation",
    title: "Anti-Rotation Primer",
    itemIds: ["pallof-iso-hold", "dead-bug-cross-connect", "side-plank-reach"],
    tags: ["activation", "core", "anti_rotation", "stability"],
  }),
  buildBlock({
    id: "row-push-rehearsal",
    title: "Row + Push Rehearsal",
    itemIds: ["band-row-primer", "incline-pushup-pattern"],
    tags: ["activation", "pull", "push", "rehearsal"],
  }),
  buildBlock({
    id: "rotator-cuff-prep",
    title: "Rotator Cuff Prep",
    itemIds: [
      "band-external-rotation",
      "side-lying-external-rotation",
      "wall-external-rotation-isometric",
    ],
    tags: ["activation", "shoulders", "rotator_cuff", "external_rotation"],
  }),
  // ─── Phase 3W: knee-mobilizer block ────────────────────────────────────────
  buildBlock({
    id: "knee-mobilizer",
    title: "Knee Mobility Prep",
    itemIds: ["half-kneeling-knee-over-toe-rocks", "wall-supported-deep-knee-bend-hold"],
    tags: ["mobility", "knees", "hips", "ankles", "knee_health"],
  }),
  // ─── Phase 3W: toolbox blocks (ACTIVATE lane routing) ───────────────────────
  buildBlock({
    id: "toolbox-scap-health",
    title: "Scap Health Toolbox",
    itemIds: [
      "serratus-wall-slide",
      "scap-pushup-plus",
      "band-row-primer",
      "band-external-rotation",
      "side-lying-external-rotation",
      "wall-external-rotation-isometric",
    ],
    tags: ["activation", "scap_health", "shoulders", "scapular"],
  }),
  buildBlock({
    id: "toolbox-hip-health",
    title: "Hip Health Toolbox",
    itemIds: [
      "glute-bridge-activation",
      "band-lateral-walk",
      "hip-hinge-dowel",
      "bodyweight-good-morning-pattern",
      "back-extension-hold-pattern",
    ],
    tags: ["activation", "hip_health", "hips", "hinge"],
  }),
  buildBlock({
    id: "toolbox-knee-health",
    title: "Knee Health Toolbox",
    itemIds: [
      "half-kneeling-knee-over-toe-rocks",
      "wall-supported-deep-knee-bend-hold",
      "bodyweight-squat-to-box",
      "goblet-squat-pattern",
      "supported-squat-pattern",
      "ankle-mobility-rocks",
    ],
    tags: ["activation", "knee_health", "knees", "ankles"],
  }),
  buildBlock({
    id: "toolbox-core-health",
    title: "Core Health Toolbox",
    itemIds: [
      "dead-bug-brace",
      "bird-dog-brace",
      "dead-bug-cross-connect",
      "pallof-iso-hold",
      "side-plank-reach",
    ],
    tags: ["activation", "core_health", "core", "trunk/spine"],
  }),
  buildBlock({
    id: "cooldown-lower",
    title: "Lower Cooldown",
    itemIds: ["hip-flexor-stretch-cooldown", "calf-wall-stretch", "supine-90-90-breath"],
    tags: ["cooldown", "lower", "recovery"],
  }),
  buildBlock({
    id: "cooldown-upper",
    title: "Upper Cooldown",
    itemIds: ["pec-doorway-stretch", "thread-the-needle", "supine-90-90-breath"],
    tags: ["cooldown", "upper", "recovery"],
  }),
  buildBlock({
    id: "cooldown-core",
    title: "Core Reset Cooldown",
    itemIds: ["child-pose-breath", "supine-90-90-breath", "thoracic-open-book"],
    tags: ["cooldown", "core", "recovery"],
  }),
];

const warmupBlockById = warmupBlocks.reduce<Record<string, WarmupBlock>>((map, block) => {
  map[block.id] = block;
  return map;
}, {});

export const cloneWarmupItem = (item: WarmupItem): WarmupItem => ({
  ...item,
  tags: [...item.tags],
  equipment: [...item.equipment],
  painAreasToAvoid: item.painAreasToAvoid ? [...item.painAreasToAvoid] : undefined,
});

export const cloneWarmupBlock = (block: WarmupBlock): WarmupBlock => ({
  id: block.id,
  title: block.title,
  tags: [...block.tags],
  items: block.items.map(cloneWarmupItem),
});

export const WARMUP_BLOCK_IDS = warmupBlocks.map((block) => block.id);

export const getWarmupItemById = (itemId: string) => {
  const item = warmupItemById[itemId];
  return item ? cloneWarmupItem(item) : null;
};

export const getWarmupBlockById = (blockId: string) => {
  const block = warmupBlockById[blockId];
  return block ? cloneWarmupBlock(block) : null;
};

export const listWarmupBlocks = () => warmupBlocks.map(cloneWarmupBlock);
