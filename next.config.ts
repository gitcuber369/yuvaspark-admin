import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://54.144.64.93:3000/api/:path*', // Proxy to backend
      },  
    ];
  },
  
};

export default nextConfig;
