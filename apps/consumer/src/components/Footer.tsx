import Link from "next/link";

export const SUPPORT_EMAIL = "support@praxis.app";

export default function Footer() {
  return (
    // Phase 6e, Commit 5.a — the landing page's hero photo runs the full
    // height of the page (.hero-bg), and its darkening overlay is centered
    // high up and fades out well before it reaches the footer, so pale gray
    // text was landing directly on bright/skin-tone photo with no
    // guaranteed contrast. A solid dark panel behind the footer content
    // guarantees legibility regardless of what's behind it, on any hero
    // image.
    <footer className="relative border-t border-white/10 bg-slate-950/85 px-6 py-8 text-xs text-slate-300 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold uppercase tracking-[0.2em] text-slate-400">
          Praxis
        </p>
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            className="inline-flex min-h-11 items-center px-2 transition hover:text-white"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="inline-flex min-h-11 items-center px-2 transition hover:text-white"
            href="/terms"
          >
            Terms
          </Link>
          <Link
            className="inline-flex min-h-11 items-center px-2 transition hover:text-white"
            href="/refunds"
          >
            Refunds
          </Link>
          <a
            className="inline-flex min-h-11 items-center px-2 transition hover:text-white"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            Support
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-4 max-w-4xl text-[11px] leading-relaxed text-slate-400">
        Praxis is not a medical device and does not diagnose, treat, or prevent
        injury. Consult a qualified professional for medical decisions.
      </p>
    </footer>
  );
}
