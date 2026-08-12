"use client"
import { useState, useEffect } from "react";
import { subscribeToProducts, Product } from "@/service/productService";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Fungsi cleanup otomatis
    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}
