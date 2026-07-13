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
};

export type WarmupBlock = {
  id: string;
  title: string;
  items: WarmupItem[];
  tags: string[];
};

const warmupItems: WarmupItem[] = [
  {
    id: "brisk-march-breath",
    name: "Nasal Breathing Cardio Ramp",
    tags: ["general", "warmup", "breathing", "circulation"],
    equipment: ["none"],
    reps: "3-5 min",
    durationSec: 240,
    cue: "Nasal-breathing light cardio: treadmill walk, stationary bike, or stair master at easy pace.",
  },
  {
    id: "supine-90-90-breath",
    name: "Supine 90/90 Breathing",
    tags: ["general", "warmup", "breathing", "tva", "core"],
    equipment: ["none"],
    durationSec: 60,
    cue: "Exhale fully, keep ribs down, then inhale into the back of the ribcage.",
  },
  {
    id: "ninety-ninety-switches",
    name: "90/90 Hip Switches",
    tags: ["mobility", "hips", "rotation", "hip_opener"],
    equipment: ["none"],
    reps: "8 per side",
    durationSec: 75,
    cue: "Keep torso tall and rotate through hips, not low back.",
  },
  {
    id: "hip-shifts",
    name: "Quadruped Hip Shifts",
    tags: ["mobility", "hips", "hip_opener", "rotation"],
    equipment: ["none"],
    reps: "8 per side",
    durationSec: 75,
    cue: "Shift slowly to each side while keeping neutral spine and steady breath.",
  },
  {
    id: "wall-slides",
    name: "Wall Slides",
    tags: ["mobility", "shoulders", "scapular", "scap_prep", "t_spine"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 75,
    cue: "Keep ribs down and forearms light on the wall while reaching up.",
  },
  {
    id: "scap-cars",
    name: "Scapular CARs",
    tags: ["mobility", "shoulders", "scapular", "scap_prep"],
    equipment: ["none"],
    reps: "5 each direction",
    durationSec: 60,
    cue: "Move shoulder blades through full circles without shrugging the neck.",
  },
  {
    id: "thoracic-open-book",
    name: "Open-Book Thoracic Rotation",
    tags: ["mobility", "t_spine", "thoracic", "rotation"],
    equipment: ["none"],
    reps: "6-8 per side",
    durationSec: 75,
    cue: "Rotate from upper back while hips stay stacked.",
  },
  {
    id: "thread-the-needle",
    name: "Thread the Needle",
    tags: ["mobility", "t_spine", "thoracic", "scapular"],
    equipment: ["none"],
    reps: "6 per side",
    durationSec: 75,
    cue: "Reach long under the body, then rotate open with control.",
  },
  {
    id: "ankle-mobility-rocks",
    name: "Ankle Dorsiflexion Rocks",
    tags: ["mobility", "ankles", "dorsiflexion"],
    equipment: ["none"],
    reps: "10 per side",
    durationSec: 60,
    cue: "Drive knee forward over toes while heel stays planted.",
  },
  {
    id: "soleus-wall-drives",
    name: "Soleus Wall Drives",
    tags: ["mobility", "ankles", "calves", "dorsiflexion"],
    equipment: ["none"],
    reps: "10-12 per side",
    durationSec: 60,
    cue: "Keep knee bent and press through the ball of the foot.",
  },
  {
    id: "glute-bridge-activation",
    name: "Glute Bridge Activation",
    tags: ["activation", "glutes", "hips", "hinge"],
    equipment: ["none"],
    reps: "10-12",
    durationSec: 75,
    cue: "Posteriorly tilt pelvis first, then drive hips up with glutes.",
  },
  {
    id: "band-lateral-walk",
    name: "Band Lateral Walk",
    tags: ["activation", "glutes", "hips", "abduction"],
    equipment: ["bands"],
    reps: "8-10 steps each way",
    durationSec: 75,
    cue: "Stay low, knees soft, and keep continuous band tension.",
  },
  {
    id: "dead-bug-brace",
    name: "Dead Bug Brace",
    tags: ["activation", "core", "tva", "brace", "anti_extension"],
    equipment: ["none"],
    reps: "6-8 per side",
    durationSec: 75,
    cue: "Exhale and lock ribcage down before each limb reach.",
  },
  {
    id: "bird-dog-brace",
    name: "Bird Dog Brace",
    tags: ["activation", "core", "brace", "anti_rotation"],
    equipment: ["none"],
    reps: "6 per side",
    durationSec: 75,
    cue: "Keep pelvis level and move with a 2-second pause at full reach.",
  },
  {
    id: "serratus-wall-slide",
    name: "Serratus Wall Slide",
    tags: ["activation", "shoulders", "serratus", "upward_rotation", "scapular"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 75,
    cue: "Reach up and around ribs to feel shoulder blades wrap the ribcage.",
  },
  {
    id: "scap-pushup-plus",
    name: "Scap Push-Up Plus",
    tags: ["activation", "serratus", "scapular", "upward_rotation"],
    equipment: ["none"],
    reps: "8-12",
    durationSec: 75,
    cue: "Keep elbows straight and protract shoulder blades at the top.",
    painAreasToAvoid: ["wrists"],
  },
  {
    id: "hip-hinge-dowel",
    name: "Hip Hinge Pattern Drill",
    tags: ["patterning", "hinge", "hips", "posterior_chain"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 60,
    cue: "Keep three points of contact as hips travel back.",
  },
  {
    id: "bodyweight-good-morning-pattern",
    name: "Bodyweight Good Morning Pattern",
    tags: ["patterning", "hinge", "posterior_chain"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 60,
    cue: "Unlock knees and hinge with long spine, then stand tall.",
  },
  {
    id: "back-extension-hold-pattern",
    name: "Back Extension Hold Pattern",
    tags: ["patterning", "hinge", "posterior_chain", "stability"],
    equipment: ["none"],
    reps: "20-30 sec",
    durationSec: 60,
    cue: "Hold neutral spine and glutes on while keeping ribs stacked over pelvis.",
  },
  {
    id: "bodyweight-squat-to-box",
    name: "Bodyweight Squat to Box",
    tags: ["patterning", "squat", "knee_dominant", "legs"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 60,
    cue: "Sit between hips with full-foot pressure and controlled ascent.",
  },
  {
    id: "goblet-squat-pattern",
    name: "Light Goblet Squat Patterning",
    tags: ["patterning", "squat", "knee_dominant", "legs"],
    equipment: ["dumbbells"],
    reps: "6-8",
    durationSec: 60,
    cue: "Use a very light load and own depth before speed or load increases.",
  },
  {
    id: "supported-squat-pattern",
    name: "Supported Squat Pattern",
    tags: ["patterning", "squat", "knee_dominant", "legs", "stability"],
    equipment: ["none"],
    reps: "8-10",
    durationSec: 60,
    cue: "Use support as needed, keep full-foot pressure, and control knee tracking.",
  },
  {
    id: "pallof-iso-hold",
    name: "Pallof Iso Hold",
    tags: ["activation", "core", "anti_rotation", "stability"],
    equipment: ["bands"],
    reps: "20-30 sec per side",
    durationSec: 60,
    cue: "Brace and resist trunk rotation without leaning.",
  },
  {
    id: "dead-bug-cross-connect",
    name: "Dead Bug Cross-Connect",
    tags: ["activation", "core", "anti_rotation", "stability"],
    equipment: ["none"],
    reps: "6-8 per side",
    durationSec: 60,
    cue: "Press opposite hand and knee together to resist rotation as limbs move.",
  },
  {
    id: "side-plank-reach",
    name: "Side Plank Reach",
    tags: ["activation", "core", "anti_rotation", "stability"],
    equipment: ["none"],
    reps: "20-25 sec per side",
    durationSec: 60,
    cue: "Stack ribs over pelvis and reach forward without collapsing.",
    painAreasToAvoid: ["shoulders"],
  },
  {
    id: "band-row-primer",
    name: "Band Row Primer",
    tags: ["activation", "pull", "scapular", "row_rehearsal"],
    equipment: ["bands"],
    reps: "10-12",
    durationSec: 60,
    cue: "Initiate with shoulder blade then finish with elbow drive.",
  },
  {
    id: "incline-pushup-pattern",
    name: "Incline Push-Up Pattern",
    tags: ["activation", "push", "push_rehearsal", "scapular"],
    equipment: ["none"],
    reps: "6-10",
    durationSec: 60,
    cue: "Keep body rigid and lower with controlled scap movement.",
    painAreasToAvoid: ["wrists", "shoulders"],
  },
  {
    id: "band-external-rotation",
    name: "Band External Rotation",
    tags: ["activation", "shoulders", "rotator_cuff", "external_rotation"],
    equipment: ["bands"],
    reps: "10-12 per side",
    durationSec: 60,
    cue: "Keep elbow pinned and rotate slowly through pain-free range.",
  },
  {
    id: "side-lying-external-rotation",
    name: "Side-Lying External Rotation",
    tags: ["activation", "shoulders", "rotator_cuff", "external_rotation"],
    equipment: ["dumbbells"],
    reps: "10-12 per side",
    durationSec: 60,
    cue: "Use very light load and keep shoulder blade set.",
  },
  {
    id: "wall-external-rotation-isometric",
    name: "Wall External Rotation Isometric",
    tags: ["activation", "shoulders", "rotator_cuff", "external_rotation"],
    equipment: ["none"],
    reps: "20 sec per side",
    durationSec: 50,
    cue: "Press gently into wall to wake cuff without joint irritation.",
  },
  {
    id: "hip-flexor-stretch-cooldown",
    name: "Half-Kneeling Hip Flexor Stretch",
    tags: ["cooldown", "hips", "mobility"],
    equipment: ["none"],
    reps: "30 sec per side",
    durationSec: 60,
    cue: "Tuck pelvis and squeeze glute on the back leg.",
  },
  {
    id: "pec-doorway-stretch",
    name: "Doorway Pec Stretch",
    tags: ["cooldown", "shoulders", "chest", "mobility"],
    equipment: ["none"],
    reps: "30 sec per side",
    durationSec: 60,
    cue: "Keep ribs stacked and avoid leaning through low back.",
  },
  {
    id: "calf-wall-stretch",
    name: "Calf Wall Stretch",
    tags: ["cooldown", "ankles", "calves", "mobility"],
    equipment: ["none"],
    reps: "30 sec per side",
    durationSec: 60,
    cue: "Drive heel down and keep toes pointing straight ahead.",
  },
  {
    id: "child-pose-breath",
    name: "Child's Pose Breathing",
    tags: ["cooldown", "t_spine", "breathing", "recovery"],
    equipment: ["none"],
    reps: "45-60 sec",
    durationSec: 60,
    cue: "Inhale into back ribs and exhale slowly to downshift.",
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
