import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @praxis/engine and @/lib/* both resolve via tsconfig.json paths to
  // packages/engine/src — identical to how src/lib/* was resolved before the move.
  // No transpilePackages or optimizePackageImports needed: Next.js/Turbopack follows
  // tsconfig paths at build time and applies the same server/client bundling rules.
};

export default nextConfig;
