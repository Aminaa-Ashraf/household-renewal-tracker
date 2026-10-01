import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  // Keep the Next.js N badge off the brand mark in the footer.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
