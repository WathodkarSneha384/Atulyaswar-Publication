import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoids dev-only RSC / client-manifest bugs that surface as
  // "__webpack_modules__[moduleId] is not a function" and missing chunk errors.
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
