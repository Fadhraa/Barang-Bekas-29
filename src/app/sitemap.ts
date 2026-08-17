import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://barang-bekas-29.vercel.app";

  const routes = [
    "",
    "/keranjang",
    "/checkout",
    "/pesanan",
    "/faq",
    "/kebijakan-refund",
    "/syarat-ketentuan",
    "/kontak",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
