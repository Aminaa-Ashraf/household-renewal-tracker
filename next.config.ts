import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  // Hide the on-screen N badge so it does not sit on page chrome in local screenshots.
  devIndicators: false,
};

export default nextConfig;
