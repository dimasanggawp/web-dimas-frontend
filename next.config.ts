import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:80/api/:path*",
      },
      {
        source: "/storage/:path*",
        destination: "http://127.0.0.1:80/storage/:path*",
      },
    ];
  },
};

export default nextConfig;
