import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure image domains for Supabase
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  
  //eslint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
