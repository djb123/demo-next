import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.thecatapi.com",
      },
    ],
  },
};

export default nextConfig;
