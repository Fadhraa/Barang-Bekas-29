"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchProductsPage,
  Product,
  subscribeToProducts,
} from "@/service/productService";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Initial load: Pemuatan awal (8 Produk pertama)
  useEffect(() => {
    let isMounted = true;
    async function loadInitialProducts() {
      try {
        const res = await fetchProductsPage(null, 8);
        if (isMounted) {
          setProducts(res.products);
          setLastDoc(res.lastDoc);
          setHasMore(res.hasMore);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    loadInitialProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fungsi memuat 8 produk berikutnya (Load More)
  const loadMore = async () => {
    if (loadingMore || !hasMore || !lastDoc) return;

    setLoadingMore(true);
    try {
      const res = await fetchProductsPage(lastDoc, 8);
      setProducts((prev) => [...prev, ...res.products]);
      setLastDoc(res.lastDoc);
      setHasMore(res.hasMore);
    } catch (err: any) {
      console.error("Gagal loadMore produk:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        loadingMore,
        hasMore,
        error,
        loadMore,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error(
      "useProductContext harus digunakan di dalam <ProductProvider>"
    );
  }
  return context;
}
