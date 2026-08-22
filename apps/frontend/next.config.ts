// next.config.ts

import { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  // reactStrictMode is enabled by default in Next.js 16
  transpilePackages: ["@vivero/shared"],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  allowedDevOrigins: ['sistemademo.cabecitanegra.dpdns.org'],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  async rewrites() {
    // TODO(research): These rewrites point /api/* at localhost:3001, but the
    // API client (src/lib/api/client-fetch.ts) never calls /api/* — it hits
    // NEXT_PUBLIC_API_URL directly. Works in the current local+tunnel setup;
    // needs investigation before it can be cleaned up.
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
};

export default withSerwist(nextConfig);
