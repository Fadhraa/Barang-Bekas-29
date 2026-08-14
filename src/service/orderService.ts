import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id?: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  notes?: string;
  items: OrderItem[];
  courier: {
    name: string;
    price: number;
    etd: string;
  };
  subtotal: number;
  feeWebsite: number;
  shippingFee: number;
  grossAmount: number;
  status: "Menunggu Pembayaran" | "Sudah Dibayar" | "Kadaluarsa" | "Batal" | "Pending";
  packingStatus?: "Belum Dikemas" | "Sedang Dikemas" | "Sudah Dikemas" | "Dalam Pengiriman" | "Selesai";
  resiNumber?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Simpan Dokumen Pesanan Baru ke Firestore
 */
export async function createOrder(orderData: Order) {
  const docRef = doc(collection(db, "orders"), orderData.orderId);
  await setDoc(docRef, {
    ...orderData,
    packingStatus: orderData.packingStatus || "Belum Dikemas",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return orderData.orderId;
}

/**
 * Update Status Pesanan & Packing di Firestore
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  additionalData?: Record<string, any>
) {
  const docRef = doc(db, "orders", orderId);
  await updateDoc(docRef, {
    status,
    ...additionalData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update Status Pengemasan Barang oleh Admin / Sistem
 */
export async function updatePackingStatus(
  orderId: string,
  packingStatus: Order["packingStatus"],
  resiNumber?: string
) {
  const docRef = doc(db, "orders", orderId);
  await updateDoc(docRef, {
    packingStatus,
    ...(resiNumber ? { resiNumber } : {}),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Ambil Detail Pesanan berdasarkan orderId
 */
export async function getOrder(orderId: string) {
  const docRef = doc(db, "orders", orderId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Order;
  }
  return null;
}

/**
 * Real-time listener untuk semua pesanan (diurutkan dari yang terbaru)
 */
export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as Order[];
      onData(list);
    },
    (err) => {
      console.error("Order Service Error:", err);
      if (onError) onError(err);
    }
  );
}
