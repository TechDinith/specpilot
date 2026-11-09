import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/analyze"],
        disallow: ["/api/", "/auth/", "/projects", "/p/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}