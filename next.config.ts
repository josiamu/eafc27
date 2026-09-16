import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// GitHub Pages serves the site from /eafc27, so every route and asset needs that prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/eafc27";

// The dev server only serves its scripts to localhost. Allow this machine's LAN addresses too,
// so a phone on the same network can open http://<LAN IP>:3000/eafc27/ and get a working page.
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  allowedDevOrigins: lanAddresses,
  // The site has two root layouts (the bare redirect and [locale]), so the 404 page needs its own document.
  experimental: { globalNotFound: true },
};

export default nextConfig;
