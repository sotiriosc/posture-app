"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/results";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Login failed.");
        return;
      }
      router.replace(next);
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
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Log in</h1>
          <p className="mt-2 text-sm text-slate-200">
            Sign in to access your program and subscription.
          </p>
        </OnImage>
        <form onSubmit={submit} className="ui-card p-6">
          <label className="block text-xs font-semibold text-slate-700">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              required
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-slate-700">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              required
            />
          </label>
          {error ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </Button>
            <Link
              href={`/auth/signup?next=${encodeURIComponent(next)}`}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Create account
            </Link>
            <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
              Back home
            </Link>
          </div>
        </form>
      </div>
    </BackgroundShell>
  );
}
