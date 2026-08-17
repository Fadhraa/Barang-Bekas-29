import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://barangbekas29.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/setup-admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
