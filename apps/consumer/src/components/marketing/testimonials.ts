/**
 * Phase 6L Commit 3 — real user reviews only (SR-6L-reviews).
 * Source of truth: docs/testimonials.json (edit there; empty = hide section).
 */

export type Testimonial = {
  name: string;
  role?: string;
  quote: string;
  featured?: boolean;
};

const isTestimonial = (value: unknown): value is Testimonial => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.quote === "string" &&
    candidate.quote.trim().length > 0
  );
};

export const normalizeTestimonials = (raw: unknown): Testimonial[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isTestimonial).map((item) => ({
    name: item.name.trim(),
    role: typeof item.role === "string" ? item.role.trim() : undefined,
    quote: item.quote.trim(),
    featured: item.featured === true,
  }));
};
