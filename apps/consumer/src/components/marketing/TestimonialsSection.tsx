"use client";

import { useEffect, useState } from "react";
import type { Testimonial } from "@/components/marketing/testimonials";

const ROTATE_MS = 5000;

type TestimonialsSectionProps = {
  reviews: Testimonial[];
};

/**
 * Phase 6L Commit 3 — cycling testimonials on the landing page.
 * < 3 reviews: static. 0 reviews: render nothing (no empty header).
 */
export default function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const useCarousel = reviews.length >= 3;
  const visible = useCarousel ? [reviews[index]!] : reviews;

  useEffect(() => {
    if (!useCarousel || paused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [useCarousel, paused, reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <section
      className="w-full max-w-3xl"
      data-testid="landing-testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={() => setPaused(true)}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        From people using Praxis
      </p>

      <div className="mt-4 space-y-3">
        {visible.map((review, reviewIndex) => (
          <article
            key={`${review.name}-${useCarousel ? index : reviewIndex}`}
            data-testid={
              useCarousel ? "landing-testimonial-active" : "landing-testimonial"
            }
            className="rounded-lg border border-slate-400/18 bg-slate-950/42 px-5 py-5"
            style={
              useCarousel
                ? { animation: "slideUpIn 280ms ease-out both" }
                : undefined
            }
          >
            <TestimonialBody review={review} />
          </article>
        ))}
      </div>

      {useCarousel ? (
        <div
          className="mt-3 flex items-center justify-center gap-1.5"
          aria-label="Review position"
        >
          {reviews.map((review, reviewIndex) => (
            <button
              key={`dot-${review.name}-${reviewIndex}`}
              type="button"
              aria-label={`Show review ${reviewIndex + 1}`}
              onClick={() => setIndex(reviewIndex)}
              className={`h-1.5 rounded-full transition-all ${
                reviewIndex === index
                  ? "w-5 bg-slate-200"
                  : "w-1.5 bg-slate-500/55"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function TestimonialBody({ review }: { review: Testimonial }) {
  return (
    <>
      <p className="text-base leading-relaxed text-slate-100">
        &ldquo;{review.quote}&rdquo;
      </p>
      <p className="mt-3 text-sm font-semibold text-white">{review.name}</p>
      {review.role ? (
        <p className="mt-0.5 text-xs text-slate-400">{review.role}</p>
      ) : null}
    </>
  );
}
