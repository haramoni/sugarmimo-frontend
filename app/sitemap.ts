import type { MetadataRoute } from "next";

import { blogPosts } from "./blog/blog-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sugarmimo.com";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(blogPosts[0]?.date ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date("2026-08-15T12:00:00Z"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
