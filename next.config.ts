import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is personalised (reads the session cookie), so we use classic
  // request-time rendering instead of Cache Components.
  cacheComponents: false,
  experimental: {
    serverActions: {
      // Attachments are capped at 4 MB in validation; leave headroom for form fields.
      bodySizeLimit: "5mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
