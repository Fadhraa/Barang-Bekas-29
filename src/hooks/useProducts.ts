"use client";

import { useProductContext } from "@/context/ProductContext";

/**
 * Custom Hook: useProducts
 * Mengambil data produk dari Global Product Cache (ProductContext).
 * Bebas re-fetch saat berpindah antar halaman (0 ms & 0 Reads ke Firebase).
 */
export function useProducts() {
  return useProductContext();
}
