import type { NextConfig } from "next";

if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) {
  process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
