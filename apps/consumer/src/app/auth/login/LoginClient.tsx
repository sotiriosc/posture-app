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
      <div className="ui-shell flex max-w-xl flex-col gap-6 py-12 sm:py-16">
        <OnImage>
          <p className="ui-kicker">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Log in</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to access your Praxis plan and subscription.
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
              className="ui-input mt-2"
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
              className="ui-input mt-2"
              required
            />
          </label>
          {error ? (
            <p className="ui-feedback-error mt-3">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </Button>
            <Link
              href={`/auth/signup?next=${encodeURIComponent(next)}`}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Create account
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Back home
            </Link>
          </div>
        </form>
      </div>
    </BackgroundShell>
  );
}
