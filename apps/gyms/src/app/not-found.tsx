import Link from "next/link";

/**
 * Gyms App Router 404 — clear professional message in the B2B light theme.
 */
export default function NotFoundPage() {
  return (
    <div className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-12">
        <header className="rounded-2xl border border-[#D7E3EA] bg-white px-4 py-6 text-center shadow-[0_10px_30px_rgba(31,42,51,0.06)] sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
            404
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1F2A33] sm:text-4xl">
            Page not found
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#5F6B75] sm:text-sm">
            This address doesn&apos;t match a page in Praxis for Gyms. It may
            have been moved, or the link could be incomplete.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#5B8FA8]/35 bg-[#5B8FA8] px-5 text-sm font-semibold text-white transition hover:bg-[#4A7A92]"
            >
              Go to home
            </Link>
            <Link
              href="/faq"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#D7E3EA] bg-[#F6F9FB] px-5 text-sm font-semibold text-[#1F2A33] transition hover:bg-white"
            >
              Help &amp; FAQ
            </Link>
          </div>
        </header>
      </main>
    </div>
  );
}
