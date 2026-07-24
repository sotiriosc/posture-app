"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import { markSignupWalkthroughPending } from "@/components/onboarding/onboardingConfig";
import { syncLocalOwner } from "@/lib/accountIsolation";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/results";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, emailOptIn }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        user?: { id?: string };
      } | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Signup failed.");
        return;
      }
      // Phase 6f, Commit 1 (SR-6f) — a brand-new account must never inherit
      // whatever a prior account left on this device.
      await syncLocalOwner(payload?.user?.id ?? null);
      markSignupWalkthroughPending();
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
          <h1 className="mt-2 text-3xl font-semibold text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-300">
            Start free. Upgrade anytime for full corrective performance access.
          </p>
        </OnImage>
        <form onSubmit={submit} className="ui-card p-6">
          <label className="block text-xs font-semibold text-slate-700">
            Name (optional)
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="ui-input mt-2"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-slate-700">
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="ui-input mt-2"
              minLength={8}
              required
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-slate-700">
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="ui-input mt-2"
              minLength={8}
              required
            />
          </label>
          <label className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={emailOptIn}
              onChange={(event) => setEmailOptIn(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-slate-900"
            />
            <span>
              Email me movement system updates and corrective guidance tips. You can unsubscribe anytime.
            </span>
          </label>
          {error ? (
            <p className="ui-feedback-error mt-3">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <Link
              href="/auth/login"
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              I already have an account
            </Link>
          </div>
        </form>
      </div>
    </BackgroundShell>
  );
}
