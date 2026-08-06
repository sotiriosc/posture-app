"use client";

import BodyMapPrototype from "@/components/body-map/BodyMapPrototype";

/**
 * Phase 8 safe demo route — body-map prototype only.
 * Not linked from production navigation; does not persist discomfort.
 */
export default function BodyMapDevPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <BodyMapPrototype />
    </main>
  );
}
