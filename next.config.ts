import type { NextConfig } from "next";

// GitHub Pages serves the site from /eafc27, so every route and asset needs that prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/eafc27";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
