import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@praxis/engine"],
  webpack: (config) => {
    // Resolve @praxis/engine to its TS source during build;
    // npm-workspaces symlink handles runtime resolution once npm install runs.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@praxis/engine": path.resolve(__dirname, "../../packages/engine/src/index.ts"),
    };
    return config;
  },
};

export default nextConfig;
