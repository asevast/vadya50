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
  transpilePackages: [
    "@tiptap/react",
    "@tiptap/starter-kit",
    "prosemirror-commands",
    "prosemirror-history",
    "prosemirror-inputrules",
    "prosemirror-keymap",
    "prosemirror-model",
    "prosemirror-schema-list",
    "prosemirror-state",
    "prosemirror-transform",
    "prosemirror-view",
    "wavesurfer.js",
    "lucide-react",
  ],
};

export default nextConfig;
