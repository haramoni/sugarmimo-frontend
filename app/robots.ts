import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sugarmimo.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog/"],
      disallow: ["/api/", "/admin/", "/perfil/", "/chat/", "/configuracoes/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
