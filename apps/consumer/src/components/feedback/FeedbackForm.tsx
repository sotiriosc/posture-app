"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  readFeedbackFormConfig,
  type FeedbackFormConfig,
} from "@/components/feedback/feedbackFormConfig";

type SubmitState = "idle" | "submitting" | "done" | "error";

const SUPPORT_EMAIL = "support@praxis.app";

async function submitToGoogleForm(
  config: FeedbackFormConfig,
  values: {
    working: string;
    frustrating: string;
    better: string;
    email: string;
    rating: string;
  }
) {
  const body = new FormData();
  body.append(config.entries.working, values.working);
  body.append(config.entries.frustrating, values.frustrating);
  body.append(config.entries.better, values.better);
  body.append(config.entries.email, values.email);
  body.append(config.entries.rating, values.rating);

  // Google Forms rejects CORS reads; no-cors still delivers the POST.
  await fetch(config.actionUrl, {
    method: "POST",
    mode: "no-cors",
    body,
  });
}

export default function FeedbackForm() {
  const config = readFeedbackFormConfig();
  const [working, setWorking] = useState("");
  const [frustrating, setFrustrating] = useState("");
  const [better, setBetter] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!working && !frustrating && !better && !rating) {
      setState("error");
      return;
    }

    setState("submitting");
    try {
      if (config) {
        await submitToGoogleForm(config, {
          working,
          frustrating,
          better,
          email,
          rating,
        });
      } else if (process.env.NODE_ENV !== "production") {
        // Local/CI without Google Form env — still exercise the thank-you path.
        await new Promise((resolve) => setTimeout(resolve, 200));
      } else {
        // Production misconfig: fall back to mailto so feedback isn't lost.
        const subject = encodeURIComponent("Praxis feedback");
        const body = encodeURIComponent(
          [
            rating ? `Rating: ${rating}/5` : null,
            working ? `Working well:\n${working}` : null,
            frustrating ? `Not working:\n${frustrating}` : null,
            better ? `Would make it better:\n${better}` : null,
            email ? `Reply-to: ${email}` : null,
          ]
            .filter(Boolean)
            .join("\n\n")
        );
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
        setState("done");
        return;
      }
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div
        className="ui-card rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-6"
        data-testid="feedback-thank-you"
      >
        <h2 className="text-xl font-semibold text-white">Thank you</h2>
        <p className="mt-3 text-sm leading-relaxed text-emerald-50/90">
          Thanks — I read every one of these myself. It&apos;s how Praxis gets
          better.
        </p>
        <div className="mt-5">
          <Link href="/results">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="ui-card space-y-5 rounded-lg p-5 sm:p-6"
      data-testid="feedback-form"
    >
      <div>
        <label
          htmlFor="feedback-working"
          className="text-sm font-semibold text-slate-100"
        >
          What&apos;s working well?{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="feedback-working"
          data-testid="feedback-working"
          value={working}
          onChange={(event) => setWorking(event.target.value)}
          rows={3}
          className="ui-input mt-2 w-full resize-y text-sm"
          placeholder="Anything that feels clear, useful, or motivating"
        />
      </div>

      <div>
        <label
          htmlFor="feedback-frustrating"
          className="text-sm font-semibold text-slate-100"
        >
          What&apos;s not working or frustrating?{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="feedback-frustrating"
          data-testid="feedback-frustrating"
          value={frustrating}
          onChange={(event) => setFrustrating(event.target.value)}
          rows={3}
          className="ui-input mt-2 w-full resize-y text-sm"
          placeholder="Friction, confusion, bugs, missing pieces"
        />
      </div>

      <div>
        <label
          htmlFor="feedback-better"
          className="text-sm font-semibold text-slate-100"
        >
          One thing that would make Praxis better for you?{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="feedback-better"
          data-testid="feedback-better"
          value={better}
          onChange={(event) => setBetter(event.target.value)}
          rows={3}
          className="ui-input mt-2 w-full resize-y text-sm"
          placeholder="The single change that would matter most"
        />
      </div>

      <div>
        <label
          htmlFor="feedback-email"
          className="text-sm font-semibold text-slate-100"
        >
          Email{" "}
          <span className="font-normal text-slate-400">
            (optional — leave it if you want a reply)
          </span>
        </label>
        <input
          id="feedback-email"
          data-testid="feedback-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="ui-input mt-2 w-full text-sm"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-100">
          Overall rating{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </legend>
        <div
          className="mt-2 flex flex-wrap gap-2"
          data-testid="feedback-rating"
          role="radiogroup"
          aria-label="Overall rating from 1 to 5"
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = rating === String(value);
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                data-testid={`feedback-rating-${value}`}
                onClick={() => setRating(String(value))}
                className={`min-h-11 min-w-11 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  selected
                    ? "border-sky-300/55 bg-sky-500/20 text-white"
                    : "border-slate-500/35 bg-slate-950/45 text-slate-200 hover:border-sky-300/35"
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>
      </fieldset>

      {state === "error" ? (
        <p className="text-sm text-amber-200" data-testid="feedback-error">
          Add at least one note or a rating, then try again.
        </p>
      ) : null}

      <Button
        type="submit"
        data-testid="feedback-submit"
        disabled={state === "submitting"}
      >
        {state === "submitting" ? "Sending…" : "Send feedback"}
      </Button>
    </form>
  );
}
