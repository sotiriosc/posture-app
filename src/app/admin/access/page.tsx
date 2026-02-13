"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

export default function AdminAccessPage() {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Access denied.");
        return;
      }
      router.replace("/settings");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundShell>
      <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-6 py-16">
        <OnImage>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            Admin Access
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Restricted</h1>
          <p className="mt-2 text-sm text-slate-200">
            Enter admin key to unlock settings and telemetry controls.
          </p>
        </OnImage>

        <form onSubmit={handleSubmit} className="ui-card p-6">
          <label className="text-xs font-semibold text-slate-700">
            Access key
            <input
              type="password"
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-slate-900"
              placeholder="Enter admin key"
              required
            />
          </label>
          {error ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex gap-3">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Checking..." : "Unlock"}
            </Button>
          </div>
        </form>
      </div>
    </BackgroundShell>
  );
}
