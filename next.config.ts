import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 15.5 paints a circular "N" via nextjs-portal at bottom-left by default.
  // Position can also persist in the browser; disable so it cannot cover Sign out.
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
