/**
 * Phase 6L Commit 1 — onboarding proof copy.
 * Photo path references real focus areas; profile path never fakes findings.
 */

type PlanOwnershipCopyProps = {
  variant: "photo" | "profile";
  /** Human-readable focus labels from the assessment/program (photo path only). */
  focusAreas?: string[];
};

const formatFocusList = (areas: string[]) => {
  const cleaned = areas.map((area) => area.trim()).filter(Boolean);
  if (cleaned.length === 0) return "what we found in your movement";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
};

export default function PlanOwnershipCopy({
  variant,
  focusAreas = [],
}: PlanOwnershipCopyProps) {
  if (variant === "photo") {
    const focusPhrase = formatFocusList(focusAreas);
    return (
      <section
        className="ui-card order-2 border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-emerald-50 sm:px-5"
        data-testid="plan-ownership-copy-photo"
        aria-live="polite"
      >
        <h2 className="text-base font-semibold text-white">This plan is yours.</h2>
        <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
          Everything you&apos;re about to see was built from what we found in your
          movement — {focusPhrase}. Not a template. Not someone else&apos;s program.
          Yours.
        </p>
      </section>
    );
  }

  return (
    <section
      className="ui-card order-2 border border-slate-500/25 bg-slate-950/42 px-4 py-3 text-slate-100 sm:px-5"
      data-testid="plan-ownership-copy-profile"
      aria-live="polite"
    >
      <h2 className="text-base font-semibold text-white">
        This plan is built for you.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-200">
        Your answers shaped this plan around your goals, your equipment, and
        your experience. Take posture photos anytime to make it even more
        specific to how you move.
      </p>
    </section>
  );
}
