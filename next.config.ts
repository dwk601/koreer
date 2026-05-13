import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  // Produces a minimal server bundle that's easy to drop into a Docker image
  // for Coolify (see Dockerfile).
  output: "standalone",
  // We don't use next/image remote loaders yet; revisit when adding company
  // logos or OG images from the API.
  images: {
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
