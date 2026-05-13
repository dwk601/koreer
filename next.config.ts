import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  // We don't use next/image remote loaders yet; revisit when adding company
  // logos or OG images from the API.
  images: {
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
