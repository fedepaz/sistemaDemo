import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode is enabled by default in Next.js 16
  transpilePackages: ["@vivero/shared"],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  allowedDevOrigins: ["proplanta-sistema.ar"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
};

export default nextConfig;