import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const privateOrUtilityRoutes = [
  "/api",
  "/admin",
  "/buscar",
  "/chat",
  "/checkout",
  "/clube-vip",
  "/configuracoes",
  "/inicio",
  "/login",
  "/manutencao",
  "/notificacoes",
  "/perfil",
  "/pins",
  "/register",
  "/reset-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privateOrUtilityRoutes,
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
