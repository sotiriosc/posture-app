/**
 * Joint-centration coaching for warmup / activation drills.
 *
 * Structure (session UI):
 * - Set up — position before moving
 * - During — what stays centered while moving
 * - Pattern — what the drill trains
 * - Watch for — how centration is commonly lost
 *
 * Source: accepted motor-control / biomechanics (canister / zone of
 * apposition, neutral pelvis for force transfer, scapular position on the
 * ribcage). Not generic “engage your core” filler.
 *
 * Graceful fallback: if an exercise has no entry here, session screens keep
 * using `Exercise.cues` / `ProgramRoutineItem.cues` unchanged.
 */

export type CentrationCues = {
  /** Joint positioning before the first rep (2–4 lines). */
  setup: string[];
  /** What to keep centered while executing (2–4 lines). */
  during: string[];
  /** One line naming what the drill trains. */
  pattern: string;
  /** Specific ways people lose centration on this drill (1–3 lines). */
  watchFor: string[];
};

const clampLines = (lines: string[], max: number) =>
  lines.map((line) => line.trim()).filter(Boolean).slice(0, max);

/** Normalize / validate a cue block for rendering. */
export const normalizeCentrationCues = (
  value: CentrationCues | null | undefined
): CentrationCues | null => {
  if (!value) return null;
  const setup = clampLines(value.setup ?? [], 4);
  const during = clampLines(value.during ?? [], 4);
  const watchFor = clampLines(value.watchFor ?? [], 3);
  const pattern = (value.pattern ?? "").trim();
  if (!setup.length && !during.length && !pattern && !watchFor.length) {
    return null;
  }
  return {
    setup,
    during,
    pattern,
    watchFor,
  };
};

/**
 * Flatten to short mid-set tips for the Focus card (setup → during → pattern).
 * Watch-for stays in the labeled panel only.
 */
export const flattenCentrationFocusTips = (
  cues: CentrationCues | null | undefined
): string[] => {
  const normalized = normalizeCentrationCues(cues);
  if (!normalized) return [];
  return [
    ...normalized.setup,
    ...normalized.during,
    ...(normalized.pattern ? [normalized.pattern] : []),
  ];
};

/**
 * Review order: most-used in beginner program selection first
 * (warmup/activation preference lists in program.ts).
 */
export const CENTRATION_REVIEW_ORDER: string[] = [
  "cat-cow",
  "thoracic-rotation",
  "wall-slides",
  "ankle-mobility",
  "dead-bug",
  "bird-dog",
  "band-pull-aparts",
  "hip-hinge-drill",
  "glute-bridges",
  "scapular-pushups",
  "wall-angel-hold",
  "prone-ytw",
  "standing-brace-march",
  "wall-supported-carry-march",
  "band-offset-march-hold",
  "foam-roll-upper-back",
  "dumbbell-side-lying-external-rotation",
  "machine-shoulder-external-rotation",
];

const CENTRATION_BY_ID: Record<string, CentrationCues> = {
  // ── Spine mobility ────────────────────────────────────────────────────────
  "cat-cow": {
    setup: [
      "Hands under shoulders, knees under hips — wrists and knees stacked",
      "Find a long neck; eyes soft toward the floor between your hands",
      "Start mid-position: ribs soft, pelvis neither tucked hard nor arched",
    ],
    during: [
      "Cow: let the chest open without dumping into the low back — move from mid-back",
      "Cat: round from the upper spine and gently draw the lower ribs in",
      "Pelvis and ribcage move as one sequence, not one joint yanking the rest",
    ],
    pattern: "Trains coordinated spine motion with ribs and pelvis staying related.",
    watchFor: [
      "Hanging into end-range low-back arch on cow",
      "Shrugging shoulders up to the ears instead of moving the thoracic spine",
    ],
  },

  "thoracic-rotation": {
    setup: [
      "Side-lying or seated: stack hips and knees so the pelvis stays quiet",
      "Bottom arm supports; top hand rests lightly on the ribcage or open",
      "Exhale once to settle ribs down before you rotate",
    ],
    during: [
      "Rotate from the upper spine and ribcage — hips stay stacked and still",
      "Keep the neck long; look with the chest, not by cranking the head",
      "Stop when the pelvis wants to roll — that is the end of true T-spine range",
    ],
    pattern: "Trains thoracic rotation without borrowing motion from the lumbar spine.",
    watchFor: [
      "Pelvis rolling open with the shoulders",
      "Forcing range with the neck or low back",
    ],
  },

  // ── Scapular / T-spine on the wall ────────────────────────────────────────
  "wall-slides": {
    setup: [
      "Stand with back to wall: head, upper back, and sacrum lightly touch",
      "Stack ribs over hips — don’t let the low back arch to reach the wall",
      "Arms in a goal-post: elbows and wrists as close to the wall as honest form allows",
    ],
    during: [
      "Slide arms up/down while ribs stay down and pelvis stays quiet",
      "Let shoulder blades glide on the ribcage — wide and connected, not pinched hard",
      "If wrists leave the wall, shorten the range before ribs flare",
    ],
    pattern: "Trains overhead scapular glide with a stacked ribcage-pelvis canister.",
    watchFor: [
      "Ribs flaring to fake more wall contact",
      "Shrugging the shoulders into the ears at the top",
    ],
  },

  "wall-angel-hold": {
    setup: [
      "Same wall stack as wall slides: head, mid-back, sacrum lightly contacting",
      "Ribs soft and down; slight posterior pelvic tilt if you tend to arch",
      "Arms in goal-post with backs of hands toward the wall without forcing",
    ],
    during: [
      "Hold the stack — breathe into the sides of the ribs without losing contact points",
      "Keep chin slightly tucked and shoulders away from ears",
      "Shoulder blades sit on the ribcage; don’t pinch them into a hard squeeze",
    ],
    pattern: "Trains isometric scapular position with ribcage-over-pelvis stacking.",
    watchFor: [
      "Low-back arching off the wall to get arms flatter",
      "Holding breath and bracing so hard the neck hardens",
    ],
  },

  "scapular-pushups": {
    setup: [
      "High plank or knee plank: wrists under shoulders, body in one long line",
      "Stack ribs over hips — no sagging belly, no piked hips",
      "Arms stay straight; movement will come from the shoulder blades only",
    ],
    during: [
      "Push the floor away to spread the shoulder blades (protraction)",
      "Let them slide back together without collapsing the chest to the floor",
      "Keep the pelvis and ribs still — only the scapulae move on the ribcage",
    ],
    pattern: "Trains serratus-driven scapular motion on a stable trunk.",
    watchFor: [
      "Bending the elbows into a regular push-up",
      "Hips sagging or piking when the scapulae move",
    ],
  },

  "band-pull-aparts": {
    setup: [
      "Stand tall: ribs stacked over hips, soft knees, neck long",
      "Hold the band at chest height with light tension — palms down or neutral",
      "Shoulder blades start wide on the ribcage, not already pinched",
    ],
    during: [
      "Pull the band apart by sliding the shoulder blades back and slightly down",
      "Keep ribs down — don’t flare the chest to finish the rep",
      "Return with control; don’t let the band snap the shoulders forward",
    ],
    pattern: "Trains mid-back / rear-shoulder control with a quiet, stacked trunk.",
    watchFor: [
      "Shrugging and using the upper traps",
      "Arching the low back as the band reaches full stretch",
    ],
  },

  "prone-ytw": {
    setup: [
      "Lie face-down: forehead lightly supported, neck long (not cranked up)",
      "Pelvis heavy into the floor; gently draw lower ribs toward the floor",
      "Arms ready for Y, T, then W — thumbs up, soft elbows",
    ],
    during: [
      "Lift arms by sliding the shoulder blades on the ribcage — small, honest range",
      "Keep the low ribs and pelvis glued down; don’t lift with lumbar extension",
      "Move slow; pause briefly at the top without pinching the neck",
    ],
    pattern: "Trains scapular upward/retraction patterns without lumbar compensation.",
    watchFor: [
      "Lifting the chest and low back off the floor",
      "Cranking the neck up to ‘help’ the arms",
    ],
  },

  // ── Core canister / anti-extension ────────────────────────────────────────
  "dead-bug": {
    setup: [
      "On your back: knees above hips, shins roughly parallel to the floor",
      "Exhale and settle ribs down toward the pelvis (canister / zone of apposition)",
      "Low back stays gently heavy — not jammed flat, not arched into a gap",
    ],
    during: [
      "Reach opposite arm and leg only as far as ribs and pelvis stay quiet",
      "If the low back lifts or ribs flare, shorten the reach",
      "Breathe out on the reach; keep tension even side to side",
    ],
    pattern: "Trains anti-extension: limbs move while the ribcage-pelvis stack holds.",
    watchFor: [
      "Ribs flaring as the arms go overhead",
      "Low back peeling off the floor to chase range",
    ],
  },

  "bird-dog": {
    setup: [
      "Hands under shoulders, knees under hips — square, stable base",
      "Find neutral pelvis: neither tucked hard nor sagging into an arch",
      "Soft brace — ribs stacked, neck long, eyes down",
    ],
    during: [
      "Reach opposite arm and leg long while hips stay level like a tray of water",
      "Keep the moving-side hip from hiking or twisting",
      "Stop the reach before the low back dips or the ribs flare",
    ],
    pattern: "Trains cross-body stability with a level pelvis and quiet lumbar spine.",
    watchFor: [
      "Hips twisting open toward the lifted leg",
      "Arching through the low back to lift the limbs higher",
    ],
  },

  "standing-brace-march": {
    setup: [
      "Stand tall: feet under hips, soft knees, weight mid-foot",
      "Exhale and stack ribs over pelvis — tall without flaring the chest",
      "Light brace before the first march; shoulders quiet",
    ],
    during: [
      "March slowly — hips stay level; pelvis doesn’t tip side to side",
      "Keep ribs stacked as each knee lifts; don’t lean away from the stance leg",
      "Breathe in a steady rhythm; brace resets before each step if needed",
    ],
    pattern: "Trains upright canister control under single-leg loading.",
    watchFor: [
      "Hip hiking or dropping on the stance side",
      "Ribs flaring and low-back arching as the knee lifts",
    ],
  },

  "wall-supported-carry-march": {
    setup: [
      "Light forearm or hand contact on the wall to organize tension — not a lean",
      "Feet under hips; stack ribs over pelvis before marching",
      "Shoulders down; neck long",
    ],
    during: [
      "March without rotating the trunk toward or away from the wall",
      "Keep the standing hip firm; pelvis stays level",
      "Wall contact stays light — trunk does the work, not the arm",
    ],
    pattern: "Trains anti-rotation / upright stack with light external feedback.",
    watchFor: [
      "Twisting the shoulders while the feet march",
      "Dumping into the low back or collapsing the stance hip",
    ],
  },

  "band-offset-march-hold": {
    setup: [
      "Band tension offsets to one side — feet planted, tall stack before you move",
      "Ribs over pelvis; resist the pull by organizing the trunk, not by leaning",
      "Shoulders level; neck long",
    ],
    during: [
      "Hold the stack against band drift while you march or hold the knee up",
      "Don’t let the torso twist toward or away from the anchor",
      "Keep pelvis level; reset the brace if ribs start to flare",
    ],
    pattern: "Trains anti-rotation under offset load while staying stacked upright.",
    watchFor: [
      "Torso twisting toward the band anchor",
      "Losing the brace between steps",
    ],
  },

  // ── Hinge / pelvis ────────────────────────────────────────────────────────
  "glute-bridges": {
    setup: [
      "On your back: feet flat, knees bent, heels under knees",
      "Exhale and set a gentle posterior pelvic tilt — low ribs settle toward pelvis",
      "Arms rest; neck long; don’t push the chin up",
    ],
    during: [
      "Drive through heels and squeeze glutes to lift — ribs stay stacked over hips at the top",
      "Stop before the low back takes over (no over-arching at the top)",
      "Lower with control; keep the pelvis organized on the way down",
    ],
    pattern: "Trains hip extension with a stacked ribcage and quiet lumbar spine.",
    watchFor: [
      "Overextending the low back at the top to go higher",
      "Feet sliding out so the hamstrings yank instead of the glutes",
    ],
  },

  "hip-hinge-drill": {
    setup: [
      "Soft knees, feet under hips; stand tall with ribs stacked over pelvis",
      "Light brace; think ‘long spine’ from head to tail",
      "Hands can rest on hips or a dowel along the back as feedback",
    ],
    during: [
      "Push the hips back while the shins stay quiet — hinge, don’t squat",
      "Keep the spine long: ribs and pelvis travel together, no rounding or arching",
      "Feel tension in the hamstrings/glutes; stop before the low back rounds",
    ],
    pattern: "Trains hip-dominant hinge with maintained spinal stacking.",
    watchFor: [
      "Rounding the upper or lower back to reach farther",
      "Bending the knees so much it becomes a squat",
    ],
  },

  // ── Ankle (joint-specific + global stack) ─────────────────────────────────
  "ankle-mobility": {
    setup: [
      "Half-kneeling or standing rock: pelvis tall and square over the front foot",
      "Front heel stays planted; knee tracks over the 2nd–3rd toe",
      "Ribs stacked — don’t lean the chest forward to fake ankle range",
    ],
    during: [
      "Drive the knee forward while the heel stays down and the arch doesn’t collapse",
      "Keep the pelvis level; don’t twist open to get more range",
      "Move to a honest end range and return — no bouncing into the joint",
    ],
    pattern: "Trains talocrural dorsiflexion with a quiet pelvis and upright trunk.",
    watchFor: [
      "Heel lifting or arch collapsing to cheat range",
      "Leaning the torso or twisting the hips to push farther",
    ],
  },

  // ── Soft tissue (centration context while rolling) ────────────────────────
  "foam-roll-upper-back": {
    setup: [
      "Roller under mid/upper back (not low back); hips on the floor or feet planted",
      "Support the head lightly; keep the neck long",
      "Start with ribs soft — don’t flare into a big arch over the roller",
    ],
    during: [
      "Roll slowly through the thoracic area; pause on tight spots and breathe",
      "Keep pelvis and ribs related — small extension is fine, dumping into lumbar is not",
      "Arms can hug or open; don’t shrug the shoulders into the neck",
    ],
    pattern: "Preps thoracic tissue while protecting lumbar position on the roller.",
    watchFor: [
      "Rolling onto the low back",
      "Holding the breath and cranking into end-range extension",
    ],
  },

  // ── Rotator cuff (scapula quiet on the ribcage) ───────────────────────────
  "dumbbell-side-lying-external-rotation": {
    setup: [
      "Side-lying: head supported, ribs stacked, pelvis stacked — long side body",
      "Elbow bent ~90° at the side; small towel under elbow if it helps the joint sit",
      "Shoulder blade set quietly on the ribcage — not shrugged, not pinched hard",
    ],
    during: [
      "Rotate the forearm up/back through a smooth arc without rolling the torso back",
      "Keep the elbow stacked; don’t let it drift forward or hitch the shoulder",
      "Stop at honest end range — no momentum at the top",
    ],
    pattern: "Trains external rotation with a stable scapula on a quiet trunk.",
    watchFor: [
      "Rolling the whole body back to lift the weight higher",
      "Shrugging or losing the elbow position",
    ],
  },

  "machine-shoulder-external-rotation": {
    setup: [
      "Align the machine’s pivot with your elbow / shoulder axis before loading",
      "Sit or stand tall: ribs over pelvis, shoulder blade set on the ribcage",
      "Shoulder stays down and away from the ear before the first rep",
    ],
    during: [
      "Rotate through a controlled arc; scapula stays quiet on the ribs",
      "Don’t lean away from the stack to finish the rep",
      "Match both sides for range — stop short of pain or pinching",
    ],
    pattern: "Trains cuff external rotation with machine axis matched to the joint.",
    watchFor: [
      "Starting too heavy and using trunk lean",
      "Forcing end range when the shoulder hitch or neck tension shows up",
    ],
  },
};

export const getCentrationCues = (
  exerciseId: string | null | undefined
): CentrationCues | null => {
  if (!exerciseId) return null;
  return normalizeCentrationCues(CENTRATION_BY_ID[exerciseId] ?? null);
};

export const hasCentrationCues = (exerciseId: string | null | undefined) =>
  getCentrationCues(exerciseId) !== null;

/** IDs in the catalog warmup/activation set that still need Sotirios review. */
export const CENTRATION_CUES_COVERED_IDS = Object.keys(CENTRATION_BY_ID);
