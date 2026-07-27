/**
 * Joint-centration coaching for warmup, activation, and high-frequency mains.
 *
 * Structure (session UI):
 * - Set up — position before moving
 * - During — what stays centered while moving
 * - Pattern — what the drill trains
 * - Watch for — how centration is commonly lost
 *
 * Source: accepted motor-control / biomechanics (canister / zone of
 * apposition, neutral pelvis for force transfer, scapular position on the
 * ribcage, joint stacking for the target pattern). Not generic “engage your
 * core” filler. Prefer leaving a drill blank for Sotirios review over
 * inventing a cue that only sounds right.
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
 * Review order for Sotirios: prep first (already shipped), then high-frequency
 * beginner mains/accessories (persona-review / phase-1 preferred pools).
 */
export const CENTRATION_REVIEW_ORDER: string[] = [
  // Prep (warmup + activation)
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
  // Mains / key accessories — beginner frequency order
  "dumbbell-shoulder-press",
  "dumbbell-lateral-raise",
  "dumbbell-reverse-lunge",
  "db-rdl",
  "suitcase-carry",
  "plank",
  "dumbbell-floor-press",
  "goblet-squat",
  "dumbbell-rows",
  "machine-seated-row",
  "machine-lat-pulldown",
  "machine-leg-press",
  "dumbbell-bench-press",
  "machine-chest-press",
  "machine-shoulder-press",
  "single-arm-dumbbell-row",
  "cable-lateral-raise",
  "cable-rear-delt-fly",
  "machine-reverse-pec-deck",
  "split-squat",
  "dumbbell-bulgarian-split-squat",
  "supine-lat-pulldown-isometric",
  "seated-lat-sweep-pulse",
  "cable-seated-row",
  "cable-lat-pulldown",
  "prone-swimmer",
  "reverse-snow-angel",
  "single-leg-glute-bridge-hold",
  "barbell-hip-thrust",
  "farmers-carry",
  "hollow-body-hold",
  "face-pull",
  "cable-face-pull",
  "dumbbell-chest-fly",
  "dumbbell-pullover",
  "overhead-cable-triceps-extension",
  "cable-biceps-curl",
  "hammer-curl",
  "db-calf-raise",
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

  // ── Vertical push (ribs stacked; scapulae upwardly rotate on the ribs) ───
  "dumbbell-shoulder-press": {
    setup: [
      "Seat or stand tall: ribs stacked over pelvis — soft brace, not a hard arch",
      "Dumbbells at ear height; wrists stacked over elbows; scapulae set on the ribcage",
      "Neck long; chin neutral — don’t crank the head forward to ‘help’ the press",
    ],
    during: [
      "Press up as the shoulder blades glide and upwardly rotate on the ribs",
      "Keep ribs from flaring; finish with shoulders away from the ears",
      "Lower with control to the start — elbows don’t dump behind the body",
    ],
    pattern: "Overhead press with stacked canister and scapulae gliding on the ribcage.",
    watchFor: [
      "Lumbar arch / rib flare to finish the lockout",
      "Shrugging traps or leaning back to clear the weight",
    ],
  },

  "machine-shoulder-press": {
    setup: [
      "Seat height so handles start near ear / cheekbone height",
      "Back on the pad: ribs stacked over pelvis — pad contact without forcing a big arch",
      "Scapulae set on the ribcage before the first press",
    ],
    during: [
      "Press through a smooth arc; don’t shrug to finish",
      "Keep the head quiet against the pad; ribs stay down",
      "Stop short of pain or pinching — match both sides for range",
    ],
    pattern: "Guided overhead press with stack and quiet scapular finish.",
    watchFor: [
      "Driving the low back hard into the pad to get more height",
      "Neck jutting forward as the load gets heavy",
    ],
  },

  // ── Lateral / rear delts (scapula quiet; no shrug) ────────────────────────
  "dumbbell-lateral-raise": {
    setup: [
      "Stand tall: ribs over pelvis; soft knees; dumbbells at sides with soft elbows",
      "Shoulder blades set wide on the ribcage — not pinched, not shrugged",
      "Think ‘raise the arms,’ not ‘lift the traps’",
    ],
    during: [
      "Lead with the elbows to about shoulder height; wrists stay below elbows",
      "Keep the neck long; scapulae stay quiet on the ribs",
      "Lower with the same tempo — no swing from the low back",
    ],
    pattern: "Deltoid raise with a quiet scapula and stacked trunk.",
    watchFor: [
      "Shrugging traps to the ears",
      "Swinging / leaning back to create momentum",
    ],
  },

  "cable-lateral-raise": {
    setup: [
      "Stand sideways to the cable; ribs stacked over pelvis",
      "Start with the working arm slightly across the body; soft elbow; scapula set",
      "Cable path should feel like it lifts the arm — not the shoulder girdle",
    ],
    during: [
      "Raise to about shoulder height without hiking the shoulder",
      "Ribs stay down; don’t lean away from the stack to finish",
      "Control the eccentric all the way back across",
    ],
    pattern: "Constant-tension lateral raise with quiet scapula.",
    watchFor: [
      "Upper-trap hitch at the top",
      "Trunk lean substituting for arm raise",
    ],
  },

  "cable-rear-delt-fly": {
    setup: [
      "Hinge or sit as prescribed; ribs stacked relative to pelvis — long spine",
      "Arms reach forward with soft elbows; scapulae start wide on the ribcage",
      "Neck long; eyes soft — don’t crane the head up",
    ],
    during: [
      "Sweep the arms open by moving the shoulder blades on the ribs",
      "Stop when the mid-back / rear shoulder owns the finish — not the low back",
      "Return with control; don’t collapse the chest forward",
    ],
    pattern: "Horizontal abduction with scapulae gliding on a quiet trunk.",
    watchFor: [
      "Lumbar arch or head crank to ‘finish’ the squeeze",
      "Turning it into a shrug or upright row",
    ],
  },

  "machine-reverse-pec-deck": {
    setup: [
      "Chest on the pad; seat so arms start roughly at shoulder height",
      "Ribs quiet on the pad — no forced lumbar arch",
      "Scapulae start wide; elbows soft and slightly bent",
    ],
    during: [
      "Open the arms by retracting/gliding scapulae on the ribs",
      "Keep the neck long against or near the pad; don’t yank with traps",
      "Return slowly — don’t let the stack slam you forward",
    ],
    pattern: "Rear-shoulder / mid-back work with scapulae on a supported trunk.",
    watchFor: [
      "Shrugging and neck tension at the finish",
      "Using momentum or bouncing out of the stretch",
    ],
  },

  // ── Horizontal push (scapulae on the ribcage / pad) ───────────────────────
  "dumbbell-floor-press": {
    setup: [
      "Lie with ribs soft toward the floor; pelvis neutral — low back not jammed into arch",
      "Dumbbells above mid-chest; wrists stacked over elbows; scapulae set on the floor",
      "Feet planted; neck long",
    ],
    during: [
      "Lower until triceps kiss the floor; elbows ~45° from the body",
      "Press up without flaring ribs or shrugging",
      "Keep scapulae connected to the floor — don’t let shoulders roll forward at the top",
    ],
    pattern: "Horizontal press with natural ROM stop and stacked trunk.",
    watchFor: [
      "Rib flare / bridging the low back off the floor",
      "Shoulders rolling forward to lock out",
    ],
  },

  "dumbbell-bench-press": {
    setup: [
      "Feet planted; ribs soft over pelvis — five-point contact without forced lumbar arch",
      "Scapulae set on the bench (slight retract/depress); dumbbells over mid-chest",
      "Wrists stacked over elbows before the first lower",
    ],
    during: [
      "Lower with control; elbows track ~30–45° from the body",
      "Press through mid-palm; keep scapulae on the bench through the lockout",
      "Don’t bounce the bells off the chest or flare ribs to finish",
    ],
    pattern: "Bench press with scapulae set and canister stacked.",
    watchFor: [
      "Excessive arch / rib flare under load",
      "Shoulders rolling forward as the bells meet at the top",
    ],
  },

  "machine-chest-press": {
    setup: [
      "Seat so handles align with mid-chest; feet planted",
      "Scapulae set on the pad — not shrugged, not pinched hard",
      "Ribs quiet; head on the pad without jutting the chin",
    ],
    during: [
      "Press evenly through mid-palm; elbows track without flaring wide",
      "Keep shoulder blades on the pad through the finish",
      "Return with control — don’t let the stack yank the shoulders forward",
    ],
    pattern: "Guided horizontal press with scapulae set on the pad.",
    watchFor: [
      "Shoulders rolling forward at lockout",
      "Hard lockout bounce or neck tension",
    ],
  },

  "dumbbell-chest-fly": {
    setup: [
      "Bench or floor: ribs soft, scapulae set, soft elbows locked in a slight bend",
      "Start with bells over mid-chest — not over the face",
      "Pelvis neutral; feet planted",
    ],
    during: [
      "Open the arms in a wide arc; keep the same elbow bend the whole way",
      "Stop when stretch is honest in the chest — not when shoulders dump forward",
      "Squeeze back to the top without rib flare or shrugging",
    ],
    pattern: "Horizontal adduction with stable scapulae and quiet ribs.",
    watchFor: [
      "Elbows straightening and turning it into a press",
      "Going too deep and losing scapular contact / shoulder packing",
    ],
  },

  "dumbbell-pullover": {
    setup: [
      "Upper back on bench (or as prescribed); ribs soft — don’t hang in a big arch",
      "Dumbbell over chest; slight elbow bend; scapulae set on the support",
      "Neck long; pelvis and glutes organized so the low back isn’t yanking",
    ],
    during: [
      "Reach the bell overhead only as far as ribs stay quiet",
      "Keep elbows soft and consistent; lats/chest own the arc — not the low back",
      "Return over the chest with control",
    ],
    pattern: "Long-lever reach with canister control and scapulae on support.",
    watchFor: [
      "Rib flare and lumbar extension to get more overhead range",
      "Bending/straightening elbows inconsistently (turning it into a triceps move)",
    ],
  },

  // ── Horizontal / vertical pull ────────────────────────────────────────────
  "dumbbell-rows": {
    setup: [
      "Hinge to a long spine: ribs stacked over pelvis — not rounded, not arched hard",
      "Soft knees; dumbbells hang under shoulders; neck long",
      "Scapulae start wide; think ‘row the elbow,’ not ‘yank the trap’",
    ],
    during: [
      "Pull elbows toward the hip pocket; mid-back owns the finish",
      "Keep the torso quiet — no rotating or heaving each rep",
      "Lower until the shoulder blades glide forward on the ribs again",
    ],
    pattern: "Hinged horizontal pull with neutral spine and scapular glide.",
    watchFor: [
      "Rotating the torso to get the bell higher",
      "Rounding the low back or shrugging the finish",
    ],
  },

  "single-arm-dumbbell-row": {
    setup: [
      "Support hand and knee (or bench) set so the spine is long and level",
      "Working-side foot planted; ribs stacked — hips square to the floor",
      "Scapula starts wide; neck long looking slightly ahead of the hand",
    ],
    during: [
      "Row the elbow toward the hip; don’t twist open toward the ceiling",
      "Keep the working shoulder away from the ear at the top",
      "Lower with control until the scapula protracts on the ribs",
    ],
    pattern: "Unilateral row with square hips and quiet trunk.",
    watchFor: [
      "Opening the chest / rotating to ‘finish’ the squeeze",
      "Hiking the shoulder or yanking with the arm only",
    ],
  },

  "machine-seated-row": {
    setup: [
      "Seat and chest pad so you can sit tall: ribs over pelvis",
      "Feet planted; grasp handles with arms long; scapulae start wide on the ribs",
      "Don’t start already pinched — leave room to pull",
    ],
    during: [
      "Pull elbows back; scapulae glide into a soft retract on the ribcage",
      "Keep ribs from flaring; chest stays on/near the pad without lunging",
      "Return to long arms with control — stretch is in the mid-back, not the low back",
    ],
    pattern: "Seated horizontal pull with stack and scapular return.",
    watchFor: [
      "Lunging the torso back to move the stack",
      "Hard shrug or neck crank at the finish",
    ],
  },

  "cable-seated-row": {
    setup: [
      "Sit tall on the pad: ribs stacked over pelvis; slight soft knee bend",
      "Arms long toward the cable; scapulae start wide",
      "Brace softly — don’t round or over-arch to reach the handle",
    ],
    during: [
      "Pull the handle to the lower ribs / upper abs; elbows track close",
      "Scapulae retract on the ribs; trunk stays quiet",
      "Reach forward again without collapsing the chest or rounding the low back",
    ],
    pattern: "Cable row with canister stack and scapular glide.",
    watchFor: [
      "Rocking the torso for momentum",
      "Finishing with traps / neck instead of mid-back",
    ],
  },

  "machine-lat-pulldown": {
    setup: [
      "Thigh pad snug; sit tall with ribs over pelvis before you grab the bar",
      "Grip slightly outside shoulders; arms long; scapulae start high/wide — ready to depress",
      "Look straight ahead; neck long",
    ],
    during: [
      "Initiate by setting the scapulae down/back on the ribs, then bend the elbows",
      "Bar to upper chest; don’t lean way back to clear the weight",
      "Return to long arms and let the scapulae upwardly rotate again with control",
    ],
    pattern: "Vertical pull with scapular depression/upward rotation on a stacked trunk.",
    watchFor: [
      "Pulling with arms only while shrugs stay high",
      "Excessive lean-back / lumbar arch to finish",
    ],
  },

  "cable-lat-pulldown": {
    setup: [
      "Same tall sit: ribs stacked, thigh pad secure",
      "Cable / attachment path in front of the face — not behind the neck",
      "Scapulae ready to glide down the ribcage on the first inch of the pull",
    ],
    during: [
      "Depress and downwardly rotate scapulae, then pull elbows toward the ribs",
      "Keep the chest tall without flaring the lower ribs",
      "Control the return — don’t let the stack yank the shoulders up",
    ],
    pattern: "Cable vertical pull with scapular path on a quiet canister.",
    watchFor: [
      "Behind-the-neck path or hard neck crank",
      "Momentum and torso rock",
    ],
  },

  "supine-lat-pulldown-isometric": {
    setup: [
      "Lie on the floor or bench: exhale ribs toward pelvis; low back gently organized",
      "Arms reach overhead or to the band/cable as prescribed; soft elbows",
      "Scapulae wide and connected to the floor/support — not shrugged to the ears",
    ],
    during: [
      "Create tension as if pulling the attachment toward the hip pockets — without moving much",
      "Keep ribs quiet; breathe into the side body while holding",
      "Shoulders stay away from the ears for the whole hold",
    ],
    pattern: "Isometric lat / scapular set with anti-extension stack.",
    watchFor: [
      "Rib flare and lumbar arch under tension",
      "Holding the breath and hardening the neck",
    ],
  },

  "seated-lat-sweep-pulse": {
    setup: [
      "Sit tall: ribs over pelvis; soft brace",
      "Arms start long/overhead or as prescribed; scapulae set on the ribs",
      "Neck long — eyes soft forward",
    ],
    during: [
      "Small controlled sweeps/pulses from the lats and scapulae — not from the low back",
      "Keep the range honest; ribs stay down",
      "Match both sides; stop if the neck takes over",
    ],
    pattern: "Small-range lat / scapular control with stacked sit.",
    watchFor: [
      "Turning pulses into shrugs or torso rocks",
      "Losing the rib–pelvis stack as fatigue hits",
    ],
  },

  "face-pull": {
    setup: [
      "Stand or kneel tall: ribs over pelvis; cable at roughly face / upper-chest height",
      "Soft knees; arms reach long; scapulae start wide",
      "Think external rotation + retract — not upright-row shrug",
    ],
    during: [
      "Pull toward the face/forehead line; elbows high and outside",
      "Externally rotate so thumbs/knuckles finish near the ears if ROM allows",
      "Keep ribs down; return with control",
    ],
    pattern: "Rear shoulder + external rotation with scapulae on a quiet trunk.",
    watchFor: [
      "Shrugging traps and yanking the low back into extension",
      "Turning it into a pure upright row with no rotation",
    ],
  },

  "cable-face-pull": {
    setup: [
      "Same stack: ribs over pelvis; cable height at face level",
      "Rope ends in hands; soft elbows; scapulae ready to glide back on the ribs",
      "Neck long before the first pull",
    ],
    during: [
      "Pull apart and back toward the face; finish with external rotation",
      "Scapulae retract without pinching so hard the neck hardens",
      "Don’t lean the whole body back to move the stack",
    ],
    pattern: "Cable face pull with scapular retract + ER on a stacked trunk.",
    watchFor: [
      "Momentum / lean-back",
      "Upper-trap dominance and breath-holding",
    ],
  },

  "prone-swimmer": {
    setup: [
      "Lie prone: forehead supported; low ribs and pelvis heavy on the floor",
      "Arms reach long overhead or at sides as the starting shape requires",
      "Neck long — don’t crank the head up to see the floor ahead",
    ],
    during: [
      "Sweep the arms in the swimmer path with small, honest scapular motion",
      "Keep the low back and ribs on the floor — motion stays in the shoulders/T-spine",
      "Breathe; don’t hold for a bigger range",
    ],
    pattern: "Prone scapular / T-spine sequencing without lumbar lift.",
    watchFor: [
      "Chest and low back lifting to finish the sweep",
      "Neck extension as the primary ‘effort’ signal",
    ],
  },

  "reverse-snow-angel": {
    setup: [
      "Prone or standing as prescribed; ribs and pelvis organized (floor contact if prone)",
      "Arms start long; scapulae wide on the ribcage",
      "Soft elbows; neck long",
    ],
    during: [
      "Sweep the arms in the angel path with scapulae gliding on the ribs",
      "Keep range inside what the mid-back owns — stop before lumbar or neck takes over",
      "Smooth tempo both directions",
    ],
    pattern: "Scapular sweep with trunk quiet (anti-compensation).",
    watchFor: [
      "Lumbar arch or head crank for more ROM",
      "Shrugging through the top of the sweep",
    ],
  },

  // ── Knee-dominant ─────────────────────────────────────────────────────────
  "goblet-squat": {
    setup: [
      "Feet roughly shoulder-width; toes slightly out as hips allow",
      "Bell at the chest; elbows soft under the weight; ribs stacked over pelvis",
      "Tall spine — brace softly before you sit",
    ],
    during: [
      "Sit between the hips; knees track over mid-foot",
      "Keep the chest tall without flaring the lower ribs",
      "Drive the floor away; finish tall with ribs still stacked (not arched)",
    ],
    pattern: "Squat pattern with canister stack and knee tracking.",
    watchFor: [
      "Chest collapsing or ribs flaring at the bottom",
      "Knees caving in or heels lifting",
    ],
  },

  "machine-leg-press": {
    setup: [
      "Seat so hips and low back stay in contact with the pad through the set",
      "Feet on the platform where knees can track over mid-foot without the low back peeling",
      "Soft brace: ribs quiet — don’t start already arched hard",
    ],
    during: [
      "Lower only as far as the pelvis stays on the pad (no butt wink / peel)",
      "Press through mid-foot; knees track without collapsing inward",
      "Don’t lock out aggressively by slamming the knees",
    ],
    pattern: "Knee-dominant press with pelvis staying organized on the pad.",
    watchFor: [
      "Low back peeling off the pad at the bottom",
      "Knees caving or feet rolling to the edges",
    ],
  },

  "split-squat": {
    setup: [
      "Long split stance; front foot flat; back toes down; hips square forward",
      "Tall torso: ribs over pelvis; soft brace",
      "Front knee stacked roughly over mid-foot before you drop",
    ],
    during: [
      "Drop the back knee toward the floor; front shin stays mostly vertical",
      "Keep the pelvis square — don’t open or tip toward the back leg",
      "Drive through the front mid-foot to stand tall without leaning hard forward",
    ],
    pattern: "Split-stance knee bend with square hips and stacked trunk.",
    watchFor: [
      "Front knee caving in",
      "Torso collapsing forward or back hip hiking",
    ],
  },

  "dumbbell-reverse-lunge": {
    setup: [
      "Stand tall: ribs over pelvis; dumbbells at sides (or as held); soft brace",
      "Eyes forward; weight organized over mid-foot before the step",
      "Think ‘step back and stack,’ not ‘drop and twist’",
    ],
    during: [
      "Step back to a soft back knee; front knee tracks over mid-foot",
      "Pelvis stays square and level; torso tall",
      "Push through the front foot to return — don’t yank with the low back",
    ],
    pattern: "Reverse lunge with frontal-plane pelvis control and stack.",
    watchFor: [
      "Front knee cave or ankle collapse",
      "Torso rotation / side lean under the bells",
    ],
  },

  "dumbbell-bulgarian-split-squat": {
    setup: [
      "Back foot on the bench; front foot far enough that the front shin can stay mostly vertical",
      "Hips square; ribs stacked over pelvis; tall torso",
      "Light brace before the first drop — don’t start twisted toward the back leg",
    ],
    during: [
      "Drop the back knee; front knee tracks over mid-foot",
      "Keep the pelvis level — no hiking the back-side hip",
      "Drive the front foot into the floor to stand; torso stays quiet",
    ],
    pattern: "Rear-foot-elevated split squat with square pelvis and stack.",
    watchFor: [
      "Front knee dive inward",
      "Excessive forward lean or low-back arch to stand up",
    ],
  },

  // ── Hinge / posterior chain ───────────────────────────────────────────────
  "db-rdl": {
    setup: [
      "Feet hip-width; soft knees unlocked; dumbbells in front of thighs",
      "Tall stack: ribs over pelvis; lats gently ‘pocket’ the bells toward the legs",
      "Neck long — gaze soft a few feet ahead on the floor as you hinge",
    ],
    during: [
      "Push the hips back; shins stay fairly quiet; bells stay close to the legs",
      "Spine stays long — hinge until hamstrings own the stretch, not the low back round",
      "Drive the floor away and stand tall by extending the hips; finish stacked (not arched)",
    ],
    pattern: "Hip hinge with neutral spine and bells close to the body.",
    watchFor: [
      "Rounding the low back or squatting the knees forward",
      "Finishing by hyperextending / rib flaring at the top",
    ],
  },

  "barbell-hip-thrust": {
    setup: [
      "Upper back on the bench; bar over the hips; feet planted so shins can finish near vertical",
      "Start with ribs soft toward the pelvis — don’t begin already arched hard",
      "Chin slightly tucked; eyes soft forward/up as the setup allows",
    ],
    during: [
      "Drive through the mid-foot / heels; extend the hips until torso and thighs line up",
      "Finish by squeezing glutes — not by cranking the low back into more extension",
      "Lower with control; keep ribs from flaring on every lockout",
    ],
    pattern: "Hip extension with posterior chain owning the finish (not lumbar).",
    watchFor: [
      "Overextending the lumbar spine at the top",
      "Feet too far/close so the low back takes over",
    ],
  },

  "single-leg-glute-bridge-hold": {
    setup: [
      "Lie on the back; one foot planted, other leg long or bent as prescribed",
      "Exhale ribs toward pelvis; low back gently organized on the floor",
      "Arms quiet by the sides; neck long",
    ],
    during: [
      "Bridge up until hips are level — glute owns the hold",
      "Keep the pelvis square; don’t let the working-side hip drop or twist",
      "Breathe; ribs stay quiet — no progressive arch to hold height",
    ],
    pattern: "Single-leg hip extension hold with level pelvis and stack.",
    watchFor: [
      "Lumbar arch substituting for glute",
      "Pelvis twisting or hip hiking",
    ],
  },

  // ── Carries / core ────────────────────────────────────────────────────────
  "suitcase-carry": {
    setup: [
      "Stand tall before you walk: ribs stacked over pelvis; soft brace",
      "Bell in one hand; free side long and quiet — don’t lean into the weight",
      "Shoulders level; neck long; eyes forward",
    ],
    during: [
      "Walk with short, controlled steps; pelvis stays level",
      "Resist the side-bend — ribs stay stacked, not collapsed toward the bell",
      "Breathe; don’t hike the loaded shoulder",
    ],
    pattern: "Anti-lateral-flexion carry with stacked canister.",
    watchFor: [
      "Leaning toward or away from the load",
      "Shrugging the loaded side and holding the breath",
    ],
  },

  "farmers-carry": {
    setup: [
      "Stand tall with bells at sides: ribs over pelvis; soft brace",
      "Shoulders packed down away from the ears; neck long",
      "Feet under hips before the first step",
    ],
    during: [
      "Walk smooth and quiet; torso doesn’t rock side to side",
      "Keep ribs stacked — don’t let the load pull you into a forward lean",
      "Hands stay by the sides; traps don’t shrug up to ‘hold’ the bells",
    ],
    pattern: "Loaded gait with packed shoulders and stacked trunk.",
    watchFor: [
      "Forward lean / lumbar arch under fatigue",
      "Shrugging and breath-holding",
    ],
  },

  "plank": {
    setup: [
      "Forearms or hands under shoulders; legs long; body in one line",
      "Exhale ribs toward pelvis; glutes lightly on; neck long",
      "Shoulder blades wide on the ribcage — not pinched hard, not winged",
    ],
    during: [
      "Hold the line: no sag at the hips, no pike at the butt",
      "Breathe into the side ribs while the stack stays; don’t dump into the low back",
      "Push the floor away gently so the scapulae stay organized",
    ],
    pattern: "Anti-extension hold with ribs stacked and scapulae on the ribs.",
    watchFor: [
      "Hip sag or rib flare as time accumulates",
      "Breath-holding and neck/shoulder hiking",
    ],
  },

  "hollow-body-hold": {
    setup: [
      "Lie on the back; exhale low ribs toward the pelvis; low back gently heavy",
      "Arms and legs long as prescribed; neck long (head can stay down or slight lift)",
      "Start with a range you can hold without the low back peeling",
    ],
    during: [
      "Hold the hollow shape: ribs and pelvis related; limbs only as long as the stack allows",
      "Breathe; don’t arch to get heels or arms lower",
      "If the low back peels, shorten the levers (bend knees / arms)",
    ],
    pattern: "Anti-extension hollow with zone-of-apposition stack.",
    watchFor: [
      "Lumbar peel / rib flare to hold a bigger shape",
      "Neck strain from cranking the head up",
    ],
  },

  // ── Arms / calves (joint stacking; quiet trunk) ───────────────────────────
  "overhead-cable-triceps-extension": {
    setup: [
      "Stand or kneel tall: ribs stacked over pelvis before the arms go overhead",
      "Elbows point forward/up as the cable path requires; upper arms quiet beside the head",
      "Scapulae set — don’t start shrugged into the ears",
    ],
    during: [
      "Extend the elbows without flaring the ribs or leaning back",
      "Keep upper arms still; motion is at the elbow",
      "Control the return; stop short of shoulder pinching",
    ],
    pattern: "Elbow extension overhead with stacked canister (no lumbar borrow).",
    watchFor: [
      "Rib flare / lean-back to finish lockout",
      "Elbows flaring wide and losing the path",
    ],
  },

  "cable-biceps-curl": {
    setup: [
      "Stand tall: ribs over pelvis; elbows near the sides",
      "Soft knees; shoulders down; neck long",
      "Cable path should let the elbows stay quiet in space",
    ],
    during: [
      "Curl without swinging the torso or shrugging",
      "Elbows stay roughly under the shoulders — don’t travel forward a lot",
      "Lower with control; ribs stay stacked",
    ],
    pattern: "Elbow flexion with quiet scapulae and stacked trunk.",
    watchFor: [
      "Hip thrust / lean-back momentum",
      "Shoulders rolling forward as the load gets heavy",
    ],
  },

  "hammer-curl": {
    setup: [
      "Stand tall: ribs over pelvis; neutral-grip bells at sides",
      "Elbows soft at the sides; scapulae set; neck long",
      "Wrists neutral — don’t cock them to start",
    ],
    during: [
      "Curl with thumbs up; elbows stay close without drifting forward",
      "Don’t swing from the low back; finish without shrugging",
      "Lower slowly; stack stays",
    ],
    pattern: "Neutral-grip elbow flexion with quiet trunk.",
    watchFor: [
      "Swinging / heaving each rep",
      "Shoulder shrug at the top",
    ],
  },

  "db-calf-raise": {
    setup: [
      "Stand tall on flat floor or edge: ribs over pelvis; soft brace",
      "Feet hip-width; weight through the mid-foot before you rise",
      "Knees soft-straight (not locked hard); neck long",
    ],
    during: [
      "Rise through the big-toe / mid-foot line; ankles track without rolling out/in",
      "Pause briefly at the top without leaning forward",
      "Lower with control through the full honest range",
    ],
    pattern: "Ankle plantarflexion with stacked posture and clean foot pressure.",
    watchFor: [
      "Rolling to the outer foot or collapsing the arch",
      "Bouncing and leaning the torso for height",
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

/** All exercise IDs with structured centration cues (prep + high-freq mains). */
export const CENTRATION_CUES_COVERED_IDS = Object.keys(CENTRATION_BY_ID);
