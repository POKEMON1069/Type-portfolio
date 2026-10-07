import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Arena preview is served from an e2b.app host rather than localhost.
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
