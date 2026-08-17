import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://barang-bekas-29.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/setup-admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
