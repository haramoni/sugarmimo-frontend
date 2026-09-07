import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

export const publicRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export function publicMetadata(
  title: string,
  description: string,
  path: string,
  image = "/brand/hero-trio-image.webp",
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: publicRobots,
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: site.name,
      locale: site.locale,
      type: "website",
      images: [{ url: absoluteUrl(image), alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(image)] },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
