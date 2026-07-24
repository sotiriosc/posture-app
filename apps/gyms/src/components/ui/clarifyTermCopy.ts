/**
 * Phase 6g Commit 3 — ratified coach-voice explanations for ClarifyTerm.
 * Keep in sync with apps/gyms/src/components/ui/clarifyTermCopy.ts.
 */

export const CLARIFY = {
  RPE: "Rate of Perceived Exertion — a 1-10 scale for how hard a set felt. 6 means you had 4 more reps in you. 9 means one more rep max.",
  Phase:
    "Praxis moves you through three phases: Control & Technique, Hypertrophy & Capacity, then Strength Focus. You advance when your body earns it, not by calendar.",
  Baseline:
    "Your starting posture measurements. Everything the app measures later gets compared against this. Retake anytime your body changes.",
  Retest:
    "A fresh set of posture photos so we can see what's changed. When a measurement clears its threshold consistently, the focus retires and your program adjusts.",
  "Focus area":
    "A pattern in your posture the app is working on with you. Each focus adds specific corrective work to your program until the pattern clears.",
  Compensation:
    "When one muscle picks up work another muscle should be doing. Common cause of pain that seems random. Praxis's correctives target the root, not the symptom.",
  Asymmetry:
    "A left-right difference in how your body holds or moves. Praxis watches this so one side doesn't quietly take over the work.",
  Scapular:
    "Your shoulder blades. Praxis pays attention to how they move because most upper-body form issues start there.",
  Thoracic:
    "Your mid-back — the section between your neck and lower back. Praxis works on this because a lot of posture issues live here.",
} as const;
