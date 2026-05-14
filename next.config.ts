import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image domains for external images (add as needed)
  images: {
    remotePatterns: [],
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Redirect configuration
  async redirects() {
    return [];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Webpack configuration
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
