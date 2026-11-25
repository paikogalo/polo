import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  async rewrites() { return [{ source: "/becas", destination: "/becas/index.html" }]; },
};
export default nextConfig;
