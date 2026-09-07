import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Utility pages must be crawlable so Google can read their noindex.
      // Existing authentication still protects private data.
      disallow: ["/api/", "/api$"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
