import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Offline mode
        </p>
        <h1 className="text-3xl font-semibold">
          You&apos;re offline, but your plan still works.
        </h1>
        <p className="text-sm text-slate-300">
          We saved your latest questionnaire on this device. Reconnect to access
          updates, videos, and new routines.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/results"
            className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-slate-900"
          >
            Go to results
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
