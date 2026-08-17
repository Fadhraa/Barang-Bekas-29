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
  runTransaction,
  Unsubscribe,
} from "firebase/firestore";
import { updateStats } from "./statsService";

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
  shippingFee?: number;
  grossAmount: number;
  status: "Menunggu Pembayaran" | "Sudah Dibayar" | "Kadaluarsa" | "Batal" | "Pending";
  packingStatus?: "Belum Dikemas" | "Sedang Dikemas" | "Sudah Dikemas" | "Dalam Pengiriman" | "Selesai";
  resiNumber?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  expiredAt?: number; // Timestamp Unix ms batas waktu 15 menit pembayaran
  paymentMethod?: string;
  uniqueCode?: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Simpan Dokumen Pesanan Baru ke Firestore
 */
export async function createOrder(orderData: Order) {
  const docRef = doc(collection(db, "orders"), orderData.orderId);
  await Promise.all([
    setDoc(docRef, {
      ...orderData,
      packingStatus: orderData.packingStatus || "Belum Dikemas",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    updateStats({ orderOnPacking: 1 }),
  ]);
  return orderData.orderId;
}

/**
 * Update Status Pesanan & Packing di Firestore (Aman dari unhandled error)
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  additionalData?: Record<string, any>
) {
  const docRef = doc(db, "orders", orderId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    console.warn(`[OrderService] Dokumen pesanan ${orderId} tidak ditemukan di Firestore.`);
    return;
  }

  const orderData = snap.data() as Order;
  const oldStatus = orderData.status;

  // 🛍️ Jika status dikonfirmasi "Sudah Dibayar" dari status belum lunas
  if (oldStatus !== "Sudah Dibayar" && status === "Sudah Dibayar") {
    let soldOutCount = 0;

    await runTransaction(db, async (transaction) => {
      // 1. Kurangi stok setiap produk di Firestore
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.id) {
            const productRef = doc(db, "products", item.id);
            const productSnap = await transaction.get(productRef);
            if (productSnap.exists()) {
              const currentStock = Number(productSnap.data()?.stock) || 0;
              const newStock = Math.max(0, currentStock - (item.quantity || 1));
              const newStatus = newStock <= 0 ? "Terjual" : "Tersedia";

              if (currentStock > 0 && newStock <= 0) {
                soldOutCount++;
              }

              transaction.update(productRef, {
                stock: newStock,
                status: newStatus,
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      }

      // 2. Update status pesanan ke "Sudah Dibayar" & packingStatus ke "Sedang Dikemas"
      transaction.update(docRef, {
        status: "Sudah Dibayar",
        packingStatus: orderData.packingStatus === "Belum Dikemas" ? "Sedang Dikemas" : (orderData.packingStatus || "Sedang Dikemas"),
        ...additionalData,
        updatedAt: serverTimestamp(),
      });
    });

    // 3. Update statistik dashboard (total omzet & produk tersedia)
    // NOTE: orderOnPacking TIDAK ditambah lagi di sini agar tidak double-count
    await updateStats({
      totalRevenue: Number(orderData.grossAmount) || 0,
      ...(soldOutCount > 0 ? { productAvailable: -soldOutCount } : {}),
    });
  } else {
    // Update status biasa (misal: Batal / Kadaluarsa)
    await updateDoc(docRef, {
      status,
      ...additionalData,
      updatedAt: serverTimestamp(),
    });
  }
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
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    console.warn(`[OrderService] Dokumen pesanan ${orderId} tidak ditemukan di Firestore.`);
    return;
  }
  const prevStatus = snap.data().packingStatus || "Belum Dikemas";
  const wasOnPacking = prevStatus === "Belum Dikemas" || prevStatus === "Sedang Dikemas" || prevStatus === "Sudah Dikemas";
  const isNowFinishedOrShipped = packingStatus === "Dalam Pengiriman" || packingStatus === "Selesai";
  if (wasOnPacking && isNowFinishedOrShipped) {
    await updateStats({ orderOnPacking: -1 });
  }
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
