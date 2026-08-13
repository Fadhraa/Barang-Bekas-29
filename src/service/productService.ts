import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Unsubscribe,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
  condition: string;
  description: string;
  images: string[];
  status: "Tersedia" | "Terjual";
  createdAt: any;
  updateAt: any;
}

/**
 * Fetch Halaman Produk Berdasarkan Pagination & Limit (Sangat Hemat Kuota Firebase)
 */
export async function fetchProductsPage(
  lastDocSnapshot?: QueryDocumentSnapshot<DocumentData> | null,
  pageSize = 8
) {
  let q = query(
    collection(db, "products"),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  if (lastDocSnapshot) {
    q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
      startAfter(lastDocSnapshot),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as Product[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
  const hasMore = snapshot.docs.length === pageSize;

  return { products, lastDoc, hasMore };
}

// Real-time listener (digunakan jika membutuhkan sync instan)
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (error: Error) => void,
  limitCount?: number
): Unsubscribe {
  const q = limitCount
    ? query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      )
    : query(collection(db, "products"), orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as Product[];
      onData(list);
    },
    (error) => {
      console.error("Product Service Error:", error);
      if (onError) onError(error);
    }
  );
}

// Add produk
export async function createProduct(productData: Omit<Product, "id">) {
  return await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Update produk
export async function updateProduct(
  id: string,
  productData: Partial<Product>
) {
  const docRef = doc(db, "products", id);
  return await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
}

// Delete produk
export async function deleteProduct(id: string) {
  const docRef = doc(db, "products", id);
  return await deleteDoc(docRef);
}