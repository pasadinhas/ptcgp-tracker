import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/ptcgp-tracker",
  assetPrefix: "/ptcgp-tracker/",
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
