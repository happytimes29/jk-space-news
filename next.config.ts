import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.jk-space.com" }],
        destination: "https://jk-space.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "jk-space-news.vercel.app" }],
        destination: "https://jk-space.com/:path*",
        permanent: true,
      },
      { source: "/news", destination: "/notes", permanent: true },
      { source: "/trending", destination: "/notes", permanent: true },
      { source: "/profile", destination: "/about", permanent: true },
      { source: "/interview", destination: "/about", permanent: true },
      { source: "/interview/:path*", destination: "/about", permanent: true },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
