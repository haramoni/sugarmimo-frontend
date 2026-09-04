import type { MetadataRoute } from "next";

import { blogPosts } from "./blog/blog-data";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const latestBlogDate = new Date(blogPosts[0]?.date ?? "2026-08-13");
  const homepageLastModified = new Date("2026-08-29T12:00:00Z");

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
      lastModified: latestBlogDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${site.url}/planos`,
      lastModified: new Date("2026-09-03T12:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/atendimento`,
      lastModified: homepageLastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/contato`,
      lastModified: homepageLastModified,
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
    ...blogPosts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [`${site.url}${post.image}`],
    })),
  ];
}
