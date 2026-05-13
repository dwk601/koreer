import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The debug page is temporary; crawlers shouldn't index it.
        disallow: ["/api/", "/*/debug"],
      },
    ],
    sitemap: `${base.replace(/\/+$/, "")}/sitemap.xml`,
    host: base.replace(/\/+$/, ""),
  };
}
