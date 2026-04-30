import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@vivero/shared"],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  allowedDevOrigins: ["cabecitanegra.dpdns.org"],
};

export default nextConfig;
