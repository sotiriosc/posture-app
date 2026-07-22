import { notFound } from "next/navigation";
import DevSeedClient from "./DevSeedClient";

// Dev-only persona seeding tool. Never shipped: 404 in any non-development
// build (production, preview). The gate is evaluated at request time.
export const dynamic = "force-dynamic";

export default async function DevSeedPage({
  searchParams,
}: {
  searchParams: Promise<{ seed?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { seed } = await searchParams;
  return <DevSeedClient seed={seed ?? null} />;
}
