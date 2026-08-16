import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,

  compiler: {
    styledComponents: true,
  },

  async redirects() {
    return [
      {
        source: "/polls/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
