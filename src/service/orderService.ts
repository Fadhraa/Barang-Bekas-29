import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return orderData.orderId;
}

/**
 * Update Status Pesanan di Firestore (e.g. dari Webhook Midtrans / Callback)
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
