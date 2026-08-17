import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/cartContext";
import { ProductProvider } from "@/context/ProductContext";
import { ToastProvider } from "@/context/ToastContext";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarangBekas29 | Toko Online Barang Bekas Pilihan Sampang",
  description:
    "Platform belanja barang bekas pilihan yang berkualitas, jujur, dan terpercaya di Kabupaten Sampang.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://barangbekas29.com"
  ),
  openGraph: {
    title: "BarangBekas29 | Toko Online Barang Bekas Pilihan Sampang",
    description:
      "Platform belanja barang bekas pilihan yang berkualitas, jujur, dan terpercaya di Kabupaten Sampang.",
    url: "/",
    siteName: "BarangBekas29",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BarangBekas29 Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BarangBekas29 | Toko Online Barang Bekas Pilihan Sampang",
    description:
      "Platform belanja barang bekas pilihan yang berkualitas, jujur, dan terpercaya di Kabupaten Sampang.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <ProductProvider>
              <CartProvider>
                {children}
                <Analytics />
                <SpeedInsights />
              </CartProvider>
            </ProductProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
