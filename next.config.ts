import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/photo/:path*",
        destination: "/api/photo/:path*",
      },
    ];
  },

  // Configure image domains for Supabase
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
