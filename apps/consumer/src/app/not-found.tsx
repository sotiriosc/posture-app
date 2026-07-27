import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page not found — Praxis",
  description: "This page does not exist or may have moved.",
};

/**
 * App Router 404 — same opaque reading shell as Help/FAQ and the macro
 * calculator so the message stays clear over the app background.
 */
export default function NotFoundPage() {
  return (
    <div className="app-bg min-h-screen text-white">
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-12">
        <header className="rounded-2xl border border-slate-500/35 bg-slate-950/88 px-4 py-6 text-center shadow-[0_18px_50px_rgba(2,8,23,0.45)] backdrop-blur-md sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/90">
            404
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Page not found
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-100 sm:text-sm">
            This address doesn&apos;t match a page in Praxis. It may have been
            moved, or the link could be incomplete.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-300/45 bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-6 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(37,99,235,0.32)] transition hover:-translate-y-px hover:brightness-105 sm:w-auto"
            >
              Go to home
            </Link>
            <Link
              href="/faq"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-400/35 bg-slate-900/45 px-6 text-sm font-semibold text-slate-200 transition hover:-translate-y-px hover:bg-slate-800/55 sm:w-auto"
            >
              Help &amp; FAQ
            </Link>
            <Link
              href="/results"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-transparent px-6 text-sm font-semibold text-slate-300 transition hover:border-slate-300/35 hover:bg-slate-900/35 hover:text-white sm:w-auto"
            >
              Open dashboard
            </Link>
          </div>
        </header>
      </main>
      <Footer />
    </div>
  );
}
