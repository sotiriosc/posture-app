import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @praxis/engine and @/lib/* both resolve via tsconfig.json paths to
  // packages/engine/src — identical to how src/lib/* was resolved before the move.
  // No transpilePackages or optimizePackageImports needed: Next.js/Turbopack follows
  // tsconfig paths at build time and applies the same server/client bundling rules.

  // Phase 9 — Edge middleware cannot see arbitrary runtime env vars unless they
  // are provided at config evaluation time. Keep the allowlist server-side only
  // (not NEXT_PUBLIC_).
  env: {
    ADMIN_USER_IDS: process.env.ADMIN_USER_IDS ?? "",
  },
};

export default nextConfig;
