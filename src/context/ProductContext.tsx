"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { subscribeToProducts, Product } from "@/service/productService";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

/**
 * ProductProvider: Gudang Cache Produk Global
 * Hanya melakukan fetch 1x ke Firebase saat aplikasi dibuka,
 * dan menyimpan datanya di memori browser agar 0 Re-fetch saat bolak-balik halaman.
 */
export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Membuka listener real-time 10 produk pertama
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      10 // Limit 10 produk untuk layar pertama
    );

    // Cleanup listener saat aplikasi ditutup
    return () => unsubscribe();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
}

/**
 * Custom Hook: useProductContext
 * Dipakai oleh komponen/halaman apapun untuk mengambil cache produk secara instan (0 ms & 0 Reads)
 */
export function useProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext harus digunakan di dalam <ProductProvider>");
  }
  return context;
}
