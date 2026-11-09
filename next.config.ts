import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  async rewrites() {
    return [
      { source: "/kawsay", destination: "/kawsay/index.html" },
      { source: "/kawsay/", destination: "/kawsay/index.html" },
    ];
  },
};
export default nextConfig;
