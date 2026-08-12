import { db } from "@/lib/firebase";
import { 
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Unsubscribe
 } from "firebase/firestore";

 export interface Product{
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

//  get produk (Mendukung limit jumlah item untuk optimasi performa)
 export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (error: Error) => void,
  limitCount?: number
): Unsubscribe {
  const q = limitCount
    ? query(collection(db, "products"), orderBy("createdAt", "desc"), limit(limitCount))
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
// uppdate produk
export async function updateProduct(id: string, productData: Partial<Product>) {
  const docRef = doc(db, "products", id);
  return await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
}
// delete produk
export async function deleteProduct(id: string) {
  const docRef = doc(db, "products", id);
  return await deleteDoc(docRef);
}