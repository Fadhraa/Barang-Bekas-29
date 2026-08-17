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
  title: "Barang Bekas 29",
  description: "Toko Online Barang Bekas Pilihan",
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
