import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.dreamlaunch.studio/api/:path*", // Proxy to backend
      },
    ];
  },
};

export default nextConfig;
