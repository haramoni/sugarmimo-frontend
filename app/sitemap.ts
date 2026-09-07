import type { MetadataRoute } from "next";

import { blogPosts } from "./blog/blog-data";
import { absoluteUrl, site } from "@/lib/site";
import { publicGuides } from "@/lib/public-guides";

export default function sitemap(): MetadataRoute.Sitemap {
  // Content dates are fixed to actual edits, never refreshed on every build.
  const homepageLastModified = new Date("2026-09-07T12:00:00Z");

  return [
    {
      url: site.url,
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${site.url}/brand/hero-trio-image.webp`],
    },
    {
      url: `${site.url}/blog`,
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${site.url}/atendimento`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/contato`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/terms`,
      lastModified: new Date("2026-08-18T12:00:00Z"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${site.url}/privacy`,
      lastModified: new Date("2026-08-15T12:00:00Z"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    { url: absoluteUrl("/sobre"), lastModified: homepageLastModified },
    ...publicGuides.map((guide) => ({
      url: absoluteUrl(`/${guide.slug}`),
      lastModified: new Date(`${guide.updated}T12:00:00Z`),
    })),
    ...blogPosts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [`${site.url}${post.image}`],
    })),
  ];
}
