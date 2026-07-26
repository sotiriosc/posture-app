/**
 * Phase 6L Commit 1 — landing-page value promise (SR-6L).
 * Honest differentiation; no price math, no medical claims.
 */
export default function ValuePromiseSection() {
  return (
    <section
      className="w-full max-w-3xl text-center"
      data-testid="landing-value-promise"
      style={{
        animation: "slideUpIn 320ms cubic-bezier(0.2, 0.75, 0.2, 1) both",
        animationDelay: "40ms",
      }}
    >
      <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
        Built around your body. Not someone else&apos;s routine.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg">
        Most training plans are a coach&apos;s favorite workout handed to everyone.
        Praxis is different. It looks at how you actually move, finds what&apos;s
        holding you back, and builds a plan around that — yours, specifically.
      </p>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
        And it shows up every single day. Same attention, no off days, no
        guesswork. It meets you where you are and moves at the pace your body
        earns.
      </p>
    </section>
  );
}
