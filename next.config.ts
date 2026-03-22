import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Allow LAN host in dev for HMR
  allowedDevOrigins: ["192.168.1.39"],

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
