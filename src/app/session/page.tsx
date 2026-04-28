import { Suspense } from "react";
import SessionClient from "./SessionClient";

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen page-shell">
          <div className="ui-shell flex max-w-4xl flex-col gap-6 py-8 sm:py-12">
            <p className="text-sm text-slate-200">Loading session...</p>
          </div>
        </div>
      }
    >
      <SessionClient />
    </Suspense>
  );
}
